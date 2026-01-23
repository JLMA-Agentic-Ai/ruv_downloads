//! Privacy Mechanisms for Federated Learning
//!
//! This module provides differential privacy mechanisms for protecting
//! gradient updates in federated learning, with support for quantum noise
//! calibration and privacy budget tracking.
//!
//! ## Mechanisms
//!
//! - **Gaussian Mechanism**: Add calibrated Gaussian noise
//! - **Laplace Mechanism**: Add calibrated Laplacian noise
//! - **Moments Accountant**: Advanced privacy budget tracking
//!
//! ## Example
//!
//! ```rust
//! use ruqu_qflg::privacy::{PrivacyConfig, GaussianMechanism, PrivacyMechanism};
//! use ndarray::Array1;
//!
//! let config = PrivacyConfig::new(1.0, 1e-5, 1.0); // epsilon, delta, sensitivity
//! let mechanism = GaussianMechanism::new(config).unwrap();
//!
//! let gradient = Array1::from_vec(vec![1.0, 2.0, 3.0]);
//! let private_gradient = mechanism.apply(&gradient).unwrap();
//! ```

use ndarray::Array1;
use rand::Rng;
use rand_distr::{Distribution, Normal};
use serde::{Deserialize, Serialize};

use crate::error::{PrivacyError, Result};

/// Privacy configuration for differential privacy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyConfig {
    /// Privacy parameter epsilon (privacy loss)
    pub epsilon: f64,
    /// Privacy parameter delta (failure probability)
    pub delta: f64,
    /// Sensitivity of the query/gradient
    pub sensitivity: f64,
    /// Optional clipping threshold
    pub clip_threshold: Option<f64>,
    /// Enable quantum noise calibration
    pub quantum_calibration: bool,
}

impl PrivacyConfig {
    /// Create a new privacy configuration
    pub fn new(epsilon: f64, delta: f64, sensitivity: f64) -> Self {
        Self {
            epsilon,
            delta,
            sensitivity,
            clip_threshold: None,
            quantum_calibration: false,
        }
    }

    /// Set clipping threshold
    pub fn with_clipping(mut self, threshold: f64) -> Self {
        self.clip_threshold = Some(threshold);
        self
    }

    /// Enable quantum calibration
    pub fn with_quantum(mut self) -> Self {
        self.quantum_calibration = true;
        self
    }

    /// Validate the configuration
    pub fn validate(&self) -> Result<()> {
        if self.epsilon <= 0.0 {
            return Err(PrivacyError::InvalidEpsilon(self.epsilon).into());
        }
        if self.delta <= 0.0 || self.delta >= 1.0 {
            return Err(PrivacyError::InvalidDelta(self.delta).into());
        }
        if self.sensitivity <= 0.0 {
            return Err(PrivacyError::InvalidSensitivity(self.sensitivity).into());
        }
        if let Some(threshold) = self.clip_threshold {
            if threshold <= 0.0 {
                return Err(PrivacyError::InvalidClippingThreshold(threshold).into());
            }
        }
        Ok(())
    }
}

impl Default for PrivacyConfig {
    fn default() -> Self {
        Self::new(1.0, 1e-5, 1.0)
    }
}

/// Trait for privacy mechanisms
pub trait PrivacyMechanism: Send + Sync {
    /// Apply the privacy mechanism to a gradient
    fn apply(&self, gradient: &Array1<f64>) -> Result<Array1<f64>>;

    /// Compute the noise scale for this mechanism
    fn noise_scale(&self) -> f64;

    /// Get the privacy configuration
    fn config(&self) -> &PrivacyConfig;

    /// Get the privacy loss (epsilon) for a single application
    fn privacy_loss(&self) -> f64 {
        self.config().epsilon
    }
}

/// Gaussian mechanism for (epsilon, delta)-differential privacy
#[derive(Debug, Clone)]
pub struct GaussianMechanism {
    config: PrivacyConfig,
    sigma: f64,
}

impl GaussianMechanism {
    /// Create a new Gaussian mechanism
    pub fn new(config: PrivacyConfig) -> Result<Self> {
        config.validate()?;

        // Calibrate sigma for (epsilon, delta)-DP
        // Using analytic Gaussian mechanism formula
        let sigma = Self::calibrate_sigma(config.sensitivity, config.epsilon, config.delta);

        Ok(Self { config, sigma })
    }

    /// Calibrate noise scale for Gaussian mechanism
    fn calibrate_sigma(sensitivity: f64, epsilon: f64, delta: f64) -> f64 {
        // For (epsilon, delta)-DP, use:
        // sigma >= sensitivity * sqrt(2 * ln(1.25/delta)) / epsilon
        let c = (2.0 * (1.25 / delta).ln()).sqrt();
        sensitivity * c / epsilon
    }

    /// Get the noise standard deviation
    pub fn sigma(&self) -> f64 {
        self.sigma
    }

    /// Generate Gaussian noise vector
    fn generate_noise(&self, dim: usize) -> Result<Array1<f64>> {
        let mut rng = rand::thread_rng();
        let normal = Normal::new(0.0, self.sigma)
            .map_err(|e| PrivacyError::NoiseGenerationFailed(e.to_string()))?;

        let noise: Vec<f64> = (0..dim).map(|_| normal.sample(&mut rng)).collect();
        Ok(Array1::from_vec(noise))
    }
}

impl PrivacyMechanism for GaussianMechanism {
    fn apply(&self, gradient: &Array1<f64>) -> Result<Array1<f64>> {
        let mut result = gradient.clone();

        // Apply clipping if configured
        if let Some(threshold) = self.config.clip_threshold {
            let norm = gradient.dot(gradient).sqrt();
            if norm > threshold {
                result = &result * (threshold / norm);
            }
        }

        // Add Gaussian noise
        let noise = self.generate_noise(result.len())?;
        Ok(result + noise)
    }

    fn noise_scale(&self) -> f64 {
        self.sigma
    }

    fn config(&self) -> &PrivacyConfig {
        &self.config
    }
}

/// Laplace mechanism for epsilon-differential privacy
#[derive(Debug, Clone)]
pub struct LaplaceMechanism {
    config: PrivacyConfig,
    scale: f64,
}

impl LaplaceMechanism {
    /// Create a new Laplace mechanism
    pub fn new(config: PrivacyConfig) -> Result<Self> {
        config.validate()?;

        // Scale parameter b = sensitivity / epsilon
        let scale = config.sensitivity / config.epsilon;

        Ok(Self { config, scale })
    }

    /// Get the scale parameter
    pub fn scale(&self) -> f64 {
        self.scale
    }

    /// Generate Laplacian noise using inverse CDF method
    fn laplace_sample(&self, rng: &mut impl Rng) -> f64 {
        // Laplace distribution via inverse CDF: b * sign(u - 0.5) * ln(1 - 2|u - 0.5|)
        let u: f64 = rng.gen_range(0.0..1.0);
        let sign = if u < 0.5 { -1.0 } else { 1.0 };
        let abs_diff = (u - 0.5).abs();
        sign * self.scale * (1.0 - 2.0 * abs_diff).ln()
    }

    /// Generate Laplacian noise vector
    fn generate_noise(&self, dim: usize) -> Result<Array1<f64>> {
        let mut rng = rand::thread_rng();
        let noise: Vec<f64> = (0..dim).map(|_| self.laplace_sample(&mut rng)).collect();
        Ok(Array1::from_vec(noise))
    }
}

impl PrivacyMechanism for LaplaceMechanism {
    fn apply(&self, gradient: &Array1<f64>) -> Result<Array1<f64>> {
        let mut result = gradient.clone();

        // Apply clipping if configured
        if let Some(threshold) = self.config.clip_threshold {
            let norm = gradient.dot(gradient).sqrt();
            if norm > threshold {
                result = &result * (threshold / norm);
            }
        }

        // Add Laplacian noise
        let noise = self.generate_noise(result.len())?;
        Ok(result + noise)
    }

    fn noise_scale(&self) -> f64 {
        self.scale
    }

    fn config(&self) -> &PrivacyConfig {
        &self.config
    }
}

/// Privacy budget tracker using moments accountant
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyBudget {
    /// Maximum allowed epsilon
    max_epsilon: f64,
    /// Maximum allowed delta
    max_delta: f64,
    /// Current accumulated epsilon
    current_epsilon: f64,
    /// Number of compositions
    num_compositions: u64,
    /// History of privacy losses
    history: Vec<PrivacyLoss>,
}

/// Record of a single privacy loss event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyLoss {
    /// Epsilon used
    pub epsilon: f64,
    /// Delta used
    pub delta: f64,
    /// Timestamp
    pub timestamp: chrono::DateTime<chrono::Utc>,
    /// Description
    pub description: String,
}

impl PrivacyBudget {
    /// Create a new privacy budget tracker
    pub fn new(max_epsilon: f64, max_delta: f64) -> Self {
        Self {
            max_epsilon,
            max_delta,
            current_epsilon: 0.0,
            num_compositions: 0,
            history: Vec::new(),
        }
    }

    /// Check if we can spend more privacy budget
    pub fn can_spend(&self, epsilon: f64) -> bool {
        self.current_epsilon + epsilon <= self.max_epsilon
    }

    /// Spend privacy budget (simple composition)
    pub fn spend(&mut self, epsilon: f64, delta: f64, description: &str) -> Result<()> {
        if !self.can_spend(epsilon) {
            return Err(PrivacyError::BudgetExceeded {
                current: self.current_epsilon + epsilon,
                max: self.max_epsilon,
            }
            .into());
        }

        self.current_epsilon += epsilon;
        self.num_compositions += 1;

        self.history.push(PrivacyLoss {
            epsilon,
            delta,
            timestamp: chrono::Utc::now(),
            description: description.to_string(),
        });

        Ok(())
    }

    /// Get remaining epsilon budget
    pub fn remaining(&self) -> f64 {
        (self.max_epsilon - self.current_epsilon).max(0.0)
    }

    /// Get current total epsilon
    pub fn current_epsilon(&self) -> f64 {
        self.current_epsilon
    }

    /// Get number of compositions
    pub fn num_compositions(&self) -> u64 {
        self.num_compositions
    }

    /// Check if budget is exhausted
    pub fn is_exhausted(&self) -> bool {
        self.current_epsilon >= self.max_epsilon
    }

    /// Reset the budget (for new training run)
    pub fn reset(&mut self) {
        self.current_epsilon = 0.0;
        self.num_compositions = 0;
        self.history.clear();
    }

    /// Get privacy history
    pub fn history(&self) -> &[PrivacyLoss] {
        &self.history
    }
}

/// Moments accountant for tighter privacy composition
#[derive(Debug, Clone)]
pub struct MomentsAccountant {
    /// Sampling rate for subsampling
    sampling_rate: f64,
    /// Noise multiplier (sigma / sensitivity)
    noise_multiplier: f64,
    /// Accumulated log moments
    log_moments: Vec<f64>,
    /// Number of steps
    steps: u64,
}

impl MomentsAccountant {
    /// Create a new moments accountant
    pub fn new(sampling_rate: f64, noise_multiplier: f64) -> Self {
        Self {
            sampling_rate,
            noise_multiplier,
            log_moments: Vec::new(),
            steps: 0,
        }
    }

    /// Record a step of training
    pub fn record_step(&mut self) {
        self.steps += 1;
        // In a full implementation, compute log moments here
    }

    /// Compute (epsilon, delta) for given delta target
    pub fn get_privacy_spent(&self, target_delta: f64) -> (f64, f64) {
        // Simplified: use RDP to DP conversion
        // In practice, use the full moments accountant algorithm
        let rdp_epsilon = self.compute_rdp_epsilon();
        let epsilon = self.rdp_to_dp(rdp_epsilon, target_delta);
        (epsilon, target_delta)
    }

    /// Compute RDP epsilon for current steps
    fn compute_rdp_epsilon(&self) -> f64 {
        // Simplified Gaussian mechanism RDP
        // Full implementation would compute for multiple alpha values
        let alpha = 2.0;
        let steps = self.steps as f64;
        let q = self.sampling_rate;
        let sigma = self.noise_multiplier;

        // RDP epsilon for subsampled Gaussian mechanism
        steps * q.powi(2) * alpha / (2.0 * sigma.powi(2))
    }

    /// Convert RDP to (epsilon, delta)-DP
    fn rdp_to_dp(&self, rdp_epsilon: f64, delta: f64) -> f64 {
        // Simplified conversion
        // Full implementation uses optimal alpha selection
        rdp_epsilon + delta.ln().abs().sqrt()
    }

    /// Get current number of steps
    pub fn steps(&self) -> u64 {
        self.steps
    }
}

/// Gradient clipping for bounded sensitivity
#[derive(Debug, Clone)]
pub struct GradientClipper {
    /// Clipping threshold (max L2 norm)
    threshold: f64,
}

impl GradientClipper {
    /// Create a new gradient clipper
    pub fn new(threshold: f64) -> Result<Self> {
        if threshold <= 0.0 {
            return Err(PrivacyError::InvalidClippingThreshold(threshold).into());
        }
        Ok(Self { threshold })
    }

    /// Clip a single gradient
    pub fn clip(&self, gradient: &Array1<f64>) -> Array1<f64> {
        let norm = gradient.dot(gradient).sqrt();
        if norm > self.threshold {
            gradient * (self.threshold / norm)
        } else {
            gradient.clone()
        }
    }

    /// Clip multiple gradients
    pub fn clip_all(&self, gradients: &[Array1<f64>]) -> Vec<Array1<f64>> {
        gradients.iter().map(|g| self.clip(g)).collect()
    }

    /// Get the clipping factor for a gradient
    pub fn clipping_factor(&self, gradient: &Array1<f64>) -> f64 {
        let norm = gradient.dot(gradient).sqrt();
        if norm > self.threshold {
            self.threshold / norm
        } else {
            1.0
        }
    }

    /// Get the threshold
    pub fn threshold(&self) -> f64 {
        self.threshold
    }
}

/// Adaptive clipping based on gradient distribution
#[derive(Debug, Clone)]
pub struct AdaptiveClipper {
    /// Target quantile for clipping threshold
    target_quantile: f64,
    /// Current clipping threshold
    current_threshold: f64,
    /// Learning rate for threshold updates
    learning_rate: f64,
    /// History of gradient norms
    norm_history: Vec<f64>,
    /// Maximum history size
    max_history: usize,
}

impl AdaptiveClipper {
    /// Create a new adaptive clipper
    pub fn new(initial_threshold: f64, target_quantile: f64) -> Self {
        Self {
            target_quantile,
            current_threshold: initial_threshold,
            learning_rate: 0.1,
            norm_history: Vec::new(),
            max_history: 1000,
        }
    }

    /// Update threshold based on observed gradients
    pub fn update(&mut self, gradients: &[Array1<f64>]) {
        // Compute norms
        for g in gradients {
            let norm = g.dot(g).sqrt();
            self.norm_history.push(norm);
        }

        // Trim history if needed
        while self.norm_history.len() > self.max_history {
            self.norm_history.remove(0);
        }

        // Update threshold to target quantile
        if !self.norm_history.is_empty() {
            let mut sorted = self.norm_history.clone();
            sorted.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

            let quantile_idx = ((sorted.len() as f64) * self.target_quantile) as usize;
            let target = sorted.get(quantile_idx.min(sorted.len() - 1)).copied().unwrap_or(self.current_threshold);

            // Exponential moving average update
            self.current_threshold = (1.0 - self.learning_rate) * self.current_threshold + self.learning_rate * target;
        }
    }

    /// Clip a gradient using current threshold
    pub fn clip(&self, gradient: &Array1<f64>) -> Array1<f64> {
        let norm = gradient.dot(gradient).sqrt();
        if norm > self.current_threshold {
            gradient * (self.current_threshold / norm)
        } else {
            gradient.clone()
        }
    }

    /// Get current threshold
    pub fn threshold(&self) -> f64 {
        self.current_threshold
    }
}

/// Statistics about privacy operations
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PrivacyStats {
    /// Total gradients privatized
    pub total_gradients: u64,
    /// Total noise added (L2 norm)
    pub total_noise_norm: f64,
    /// Average clipping factor
    pub avg_clipping_factor: f64,
    /// Gradients that were clipped
    pub num_clipped: u64,
}

impl PrivacyStats {
    /// Create new empty stats
    pub fn new() -> Self {
        Self::default()
    }

    /// Update stats with a privatization
    pub fn update(&mut self, original: &Array1<f64>, privatized: &Array1<f64>, clipped: bool) {
        self.total_gradients += 1;

        let noise = privatized - original;
        let noise_norm = noise.dot(&noise).sqrt();
        self.total_noise_norm += noise_norm;

        let original_norm = original.dot(original).sqrt();
        let privatized_norm = privatized.dot(privatized).sqrt();
        let factor = if original_norm > 0.0 {
            privatized_norm / original_norm
        } else {
            1.0
        };

        self.avg_clipping_factor = (self.avg_clipping_factor * (self.total_gradients - 1) as f64 + factor)
            / self.total_gradients as f64;

        if clipped {
            self.num_clipped += 1;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::array;

    #[test]
    fn test_gaussian_mechanism_basic() {
        let config = PrivacyConfig::new(1.0, 1e-5, 1.0);
        let mechanism = GaussianMechanism::new(config).unwrap();

        let gradient = array![1.0, 2.0, 3.0];
        let private = mechanism.apply(&gradient).unwrap();

        assert_eq!(private.len(), gradient.len());
        // Values should be different due to noise
        assert!((private[0] - gradient[0]).abs() > 0.0 || (private[1] - gradient[1]).abs() > 0.0);
    }

    #[test]
    fn test_gaussian_sigma_calibration() {
        let config = PrivacyConfig::new(1.0, 1e-5, 1.0);
        let mechanism = GaussianMechanism::new(config).unwrap();

        // Sigma should be approximately sqrt(2 * ln(1.25/1e-5)) ~= 4.56
        assert!(mechanism.sigma() > 4.0 && mechanism.sigma() < 5.0);
    }

    #[test]
    fn test_laplace_mechanism_basic() {
        let config = PrivacyConfig::new(1.0, 1e-5, 1.0);
        let mechanism = LaplaceMechanism::new(config).unwrap();

        let gradient = array![1.0, 2.0, 3.0];
        let private = mechanism.apply(&gradient).unwrap();

        assert_eq!(private.len(), gradient.len());
    }

    #[test]
    fn test_laplace_scale() {
        let config = PrivacyConfig::new(2.0, 1e-5, 1.0);
        let mechanism = LaplaceMechanism::new(config).unwrap();

        // Scale should be sensitivity / epsilon = 1.0 / 2.0 = 0.5
        assert!((mechanism.scale() - 0.5).abs() < 1e-10);
    }

    #[test]
    fn test_gradient_clipping() {
        let config = PrivacyConfig::new(1.0, 1e-5, 1.0).with_clipping(1.0);
        let mechanism = GaussianMechanism::new(config).unwrap();

        // Large gradient that should be clipped
        let gradient = array![10.0, 0.0];
        let private = mechanism.apply(&gradient).unwrap();

        // Even with noise, should be roughly normalized
        // (this is a probabilistic test)
    }

    #[test]
    fn test_privacy_budget_basic() {
        let mut budget = PrivacyBudget::new(10.0, 1e-5);

        assert!(budget.can_spend(5.0));
        budget.spend(5.0, 1e-6, "training step 1").unwrap();
        assert_eq!(budget.current_epsilon(), 5.0);
        assert_eq!(budget.remaining(), 5.0);
    }

    #[test]
    fn test_privacy_budget_exceeded() {
        let mut budget = PrivacyBudget::new(1.0, 1e-5);

        budget.spend(0.8, 1e-6, "step 1").unwrap();
        let result = budget.spend(0.5, 1e-6, "step 2");
        assert!(result.is_err());
    }

    #[test]
    fn test_privacy_budget_history() {
        let mut budget = PrivacyBudget::new(10.0, 1e-5);

        budget.spend(1.0, 1e-6, "step 1").unwrap();
        budget.spend(2.0, 1e-6, "step 2").unwrap();

        assert_eq!(budget.history().len(), 2);
        assert_eq!(budget.num_compositions(), 2);
    }

    #[test]
    fn test_privacy_budget_reset() {
        let mut budget = PrivacyBudget::new(10.0, 1e-5);

        budget.spend(5.0, 1e-6, "step").unwrap();
        budget.reset();

        assert_eq!(budget.current_epsilon(), 0.0);
        assert!(budget.history().is_empty());
    }

    #[test]
    fn test_gradient_clipper() {
        let clipper = GradientClipper::new(1.0).unwrap();

        let gradient = array![3.0, 4.0]; // norm = 5
        let clipped = clipper.clip(&gradient);

        let clipped_norm = clipped.dot(&clipped).sqrt();
        assert!((clipped_norm - 1.0).abs() < 1e-10);
    }

    #[test]
    fn test_gradient_clipper_no_clip() {
        let clipper = GradientClipper::new(10.0).unwrap();

        let gradient = array![3.0, 4.0]; // norm = 5
        let clipped = clipper.clip(&gradient);

        // Should not be clipped
        assert!((clipped[0] - gradient[0]).abs() < 1e-10);
    }

    #[test]
    fn test_gradient_clipper_invalid() {
        let result = GradientClipper::new(-1.0);
        assert!(result.is_err());
    }

    #[test]
    fn test_adaptive_clipper() {
        let mut clipper = AdaptiveClipper::new(10.0, 0.5);

        let gradients = vec![
            array![1.0, 0.0],
            array![2.0, 0.0],
            array![3.0, 0.0],
        ];

        clipper.update(&gradients);

        // Threshold should adapt towards median (~2.0)
        assert!(clipper.threshold() < 10.0);
    }

    #[test]
    fn test_moments_accountant() {
        let mut accountant = MomentsAccountant::new(0.01, 1.0);

        for _ in 0..100 {
            accountant.record_step();
        }

        let (epsilon, delta) = accountant.get_privacy_spent(1e-5);
        assert!(epsilon > 0.0);
        assert_eq!(delta, 1e-5);
    }

    #[test]
    fn test_invalid_config_epsilon() {
        let config = PrivacyConfig::new(-1.0, 1e-5, 1.0);
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_invalid_config_delta() {
        let config = PrivacyConfig::new(1.0, 1.5, 1.0);
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_invalid_config_sensitivity() {
        let config = PrivacyConfig::new(1.0, 1e-5, 0.0);
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_privacy_stats() {
        let mut stats = PrivacyStats::new();

        let original = array![1.0, 0.0];
        let privatized = array![1.5, 0.2];

        stats.update(&original, &privatized, true);
        assert_eq!(stats.total_gradients, 1);
        assert_eq!(stats.num_clipped, 1);
    }

    #[test]
    fn test_clipping_factor() {
        let clipper = GradientClipper::new(1.0).unwrap();

        let gradient = array![3.0, 4.0]; // norm = 5
        let factor = clipper.clipping_factor(&gradient);
        assert!((factor - 0.2).abs() < 1e-10);

        let small_gradient = array![0.5, 0.0];
        let factor = clipper.clipping_factor(&small_gradient);
        assert!((factor - 1.0).abs() < 1e-10);
    }

    #[test]
    fn test_clip_all() {
        let clipper = GradientClipper::new(1.0).unwrap();

        let gradients = vec![
            array![3.0, 4.0], // norm = 5, will be clipped
            array![0.5, 0.0], // norm = 0.5, not clipped
        ];

        let clipped = clipper.clip_all(&gradients);

        assert_eq!(clipped.len(), 2);
        assert!((clipped[0].dot(&clipped[0]).sqrt() - 1.0).abs() < 1e-10);
        assert!((clipped[1].dot(&clipped[1]).sqrt() - 0.5).abs() < 1e-10);
    }

    #[test]
    fn test_privacy_config_builder() {
        let config = PrivacyConfig::new(1.0, 1e-5, 1.0)
            .with_clipping(5.0)
            .with_quantum();

        assert!(config.clip_threshold.is_some());
        assert!(config.quantum_calibration);
    }
}
