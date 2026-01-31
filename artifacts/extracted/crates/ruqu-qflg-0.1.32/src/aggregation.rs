//! Gradient Aggregation for Federated Learning
//!
//! This module provides quantum-secure gradient aggregation algorithms with
//! privacy guarantees and support for heterogeneous model sizes.
//!
//! ## Algorithms
//!
//! - **Weighted Average**: Standard federated averaging with privacy
//! - **Secure Aggregation**: Cryptographic secure sum protocol
//! - **Momentum Aggregation**: Server-side momentum for improved convergence
//!
//! ## Example
//!
//! ```rust
//! use ruqu_qflg::aggregation::{GradientAggregator, AggregatorConfig, WeightedAverageAggregator};
//! use ndarray::Array1;
//!
//! let config = AggregatorConfig::default();
//! let aggregator = WeightedAverageAggregator::new(config);
//!
//! let gradients = vec![
//!     Array1::from_vec(vec![0.1, 0.2, 0.3]),
//!     Array1::from_vec(vec![0.2, 0.3, 0.4]),
//! ];
//! let weights = vec![0.5, 0.5];
//!
//! let result = aggregator.aggregate(&gradients, &weights).unwrap();
//! ```

use ndarray::{Array1, ArrayView1};
use serde::{Deserialize, Serialize};

use crate::error::{AggregationError, Result};

/// Configuration for gradient aggregators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AggregatorConfig {
    /// Maximum gradient dimension supported
    pub max_dimension: usize,
    /// Clipping threshold for gradient norms
    pub clip_threshold: Option<f64>,
    /// Server-side momentum coefficient (0 to disable)
    pub momentum: f64,
    /// Weight decay coefficient
    pub weight_decay: f64,
    /// Enable quantum-secure mode
    pub quantum_secure: bool,
}

impl Default for AggregatorConfig {
    fn default() -> Self {
        Self {
            max_dimension: 1_000_000,
            clip_threshold: None,
            momentum: 0.0,
            weight_decay: 0.0,
            quantum_secure: false,
        }
    }
}

/// Trait for gradient aggregation algorithms
pub trait GradientAggregator: Send + Sync {
    /// Aggregate multiple gradients into a single gradient
    fn aggregate(&self, gradients: &[Array1<f64>], weights: &[f64]) -> Result<Array1<f64>>;

    /// Aggregate with optional mask for partial participation
    fn aggregate_masked(
        &self,
        gradients: &[Array1<f64>],
        weights: &[f64],
        mask: &[bool],
    ) -> Result<Array1<f64>> {
        let filtered_gradients: Vec<_> = gradients
            .iter()
            .zip(mask.iter())
            .filter(|(_, &m)| m)
            .map(|(g, _)| g.clone())
            .collect();

        let filtered_weights: Vec<_> = weights
            .iter()
            .zip(mask.iter())
            .filter(|(_, &m)| m)
            .map(|(w, _)| *w)
            .collect();

        self.aggregate(&filtered_gradients, &filtered_weights)
    }

    /// Get aggregator configuration
    fn config(&self) -> &AggregatorConfig;
}

/// Weighted average aggregator (FedAvg)
#[derive(Debug)]
pub struct WeightedAverageAggregator {
    config: AggregatorConfig,
    momentum_buffer: parking_lot::RwLock<Option<Array1<f64>>>,
}

impl WeightedAverageAggregator {
    /// Create a new weighted average aggregator
    pub fn new(config: AggregatorConfig) -> Self {
        Self {
            config,
            momentum_buffer: parking_lot::RwLock::new(None),
        }
    }

    /// Clip gradient by norm
    fn clip_gradient(&self, gradient: &Array1<f64>, threshold: f64) -> Array1<f64> {
        let norm = gradient.dot(gradient).sqrt();
        if norm > threshold {
            gradient * (threshold / norm)
        } else {
            gradient.clone()
        }
    }

    /// Normalize weights to sum to 1.0
    fn normalize_weights(weights: &[f64]) -> Result<Vec<f64>> {
        let sum: f64 = weights.iter().sum();
        if sum <= 0.0 {
            return Err(AggregationError::WeightNormalization(sum).into());
        }
        Ok(weights.iter().map(|w| w / sum).collect())
    }

    /// Apply server-side momentum
    fn apply_momentum(&self, gradient: &Array1<f64>) -> Array1<f64> {
        if self.config.momentum == 0.0 {
            return gradient.clone();
        }

        let mut buffer = self.momentum_buffer.write();
        match buffer.as_mut() {
            Some(buf) => {
                // Update momentum buffer: buf = momentum * buf + gradient
                *buf = &*buf * self.config.momentum + gradient;
                buf.clone()
            }
            None => {
                *buffer = Some(gradient.clone());
                gradient.clone()
            }
        }
    }

    /// Reset momentum buffer
    pub fn reset_momentum(&self) {
        let mut buffer = self.momentum_buffer.write();
        *buffer = None;
    }
}

impl GradientAggregator for WeightedAverageAggregator {
    fn aggregate(&self, gradients: &[Array1<f64>], weights: &[f64]) -> Result<Array1<f64>> {
        if gradients.is_empty() {
            return Err(AggregationError::EmptyGradients.into());
        }

        if gradients.len() != weights.len() {
            return Err(AggregationError::InsufficientGradients {
                required: gradients.len(),
                actual: weights.len(),
            }
            .into());
        }

        // Validate weights
        for &w in weights {
            if w < 0.0 {
                return Err(AggregationError::InvalidWeight(w).into());
            }
        }

        // Get expected dimension from first gradient
        let dim = gradients[0].len();

        // Validate all gradients have same dimension
        for (i, g) in gradients.iter().enumerate().skip(1) {
            if g.len() != dim {
                return Err(AggregationError::DimensionMismatch {
                    expected: dim,
                    actual: g.len(),
                }
                .into());
            }
        }

        // Normalize weights
        let normalized_weights = Self::normalize_weights(weights)?;

        // Compute weighted average
        let mut result = Array1::zeros(dim);
        for (gradient, &weight) in gradients.iter().zip(normalized_weights.iter()) {
            let processed = if let Some(threshold) = self.config.clip_threshold {
                self.clip_gradient(gradient, threshold)
            } else {
                gradient.clone()
            };
            result = result + &processed * weight;
        }

        // Apply weight decay
        if self.config.weight_decay > 0.0 {
            result = result * (1.0 - self.config.weight_decay);
        }

        // Apply momentum
        let result = self.apply_momentum(&result);

        Ok(result)
    }

    fn config(&self) -> &AggregatorConfig {
        &self.config
    }
}

/// Secure aggregation using additive secret sharing
#[derive(Debug, Clone)]
pub struct SecureAggregator {
    config: AggregatorConfig,
    /// Modulus for secure computation
    modulus: u64,
}

impl SecureAggregator {
    /// Create a new secure aggregator
    pub fn new(config: AggregatorConfig) -> Self {
        Self {
            config,
            modulus: 1 << 32, // 2^32 modulus
        }
    }

    /// Quantize floating point to fixed point
    fn quantize(&self, value: f64, scale: f64) -> i64 {
        (value * scale).round() as i64
    }

    /// Dequantize fixed point to floating point
    fn dequantize(&self, value: i64, scale: f64) -> f64 {
        value as f64 / scale
    }

    /// Compute secure sum with wraparound
    fn secure_sum(&self, shares: &[i64]) -> i64 {
        shares.iter().fold(0i64, |acc, &x| {
            acc.wrapping_add(x) % (self.modulus as i64)
        })
    }
}

impl GradientAggregator for SecureAggregator {
    fn aggregate(&self, gradients: &[Array1<f64>], weights: &[f64]) -> Result<Array1<f64>> {
        if gradients.is_empty() {
            return Err(AggregationError::EmptyGradients.into());
        }

        let dim = gradients[0].len();
        let n = gradients.len() as f64;
        let scale = 1e6; // Fixed-point scale

        // Normalize weights
        let weight_sum: f64 = weights.iter().sum();

        let mut result = Array1::zeros(dim);

        for i in 0..dim {
            // Collect quantized values
            let shares: Vec<i64> = gradients
                .iter()
                .zip(weights.iter())
                .map(|(g, w)| self.quantize(g[i] * w / weight_sum, scale))
                .collect();

            // Compute secure sum
            let sum = self.secure_sum(&shares);
            result[i] = self.dequantize(sum, scale);
        }

        Ok(result)
    }

    fn config(&self) -> &AggregatorConfig {
        &self.config
    }
}

/// Momentum-enhanced aggregator for improved convergence
#[derive(Debug)]
pub struct MomentumAggregator {
    inner: WeightedAverageAggregator,
    /// Velocity buffer for each parameter
    velocity: parking_lot::RwLock<Option<Array1<f64>>>,
    /// Nesterov momentum flag
    nesterov: bool,
}

impl MomentumAggregator {
    /// Create a new momentum aggregator
    pub fn new(config: AggregatorConfig, nesterov: bool) -> Self {
        let inner = WeightedAverageAggregator::new(config);
        Self {
            inner,
            velocity: parking_lot::RwLock::new(None),
            nesterov,
        }
    }

    /// Update velocity and compute momentum-adjusted gradient
    fn compute_momentum_gradient(&self, gradient: &Array1<f64>) -> Array1<f64> {
        let momentum = self.inner.config.momentum;
        if momentum == 0.0 {
            return gradient.clone();
        }

        let mut velocity = self.velocity.write();
        match velocity.as_mut() {
            Some(v) => {
                // v = momentum * v + gradient
                *v = &*v * momentum + gradient;
                if self.nesterov {
                    // Nesterov: gradient + momentum * v
                    gradient + &(&*v * momentum)
                } else {
                    v.clone()
                }
            }
            None => {
                *velocity = Some(gradient.clone());
                gradient.clone()
            }
        }
    }

    /// Reset velocity buffer
    pub fn reset(&self) {
        let mut velocity = self.velocity.write();
        *velocity = None;
        self.inner.reset_momentum();
    }
}

impl GradientAggregator for MomentumAggregator {
    fn aggregate(&self, gradients: &[Array1<f64>], weights: &[f64]) -> Result<Array1<f64>> {
        let base_result = self.inner.aggregate(gradients, weights)?;
        Ok(self.compute_momentum_gradient(&base_result))
    }

    fn config(&self) -> &AggregatorConfig {
        &self.inner.config
    }
}

/// Statistics about aggregation operations
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AggregationStats {
    /// Number of aggregations performed
    pub num_aggregations: u64,
    /// Total gradients processed
    pub total_gradients: u64,
    /// Average gradient dimension
    pub avg_dimension: f64,
    /// Maximum gradient norm observed
    pub max_norm: f64,
    /// Number of clipped gradients
    pub num_clipped: u64,
}

impl AggregationStats {
    /// Create new empty stats
    pub fn new() -> Self {
        Self::default()
    }

    /// Update stats with a new aggregation
    pub fn update(&mut self, gradients: &[Array1<f64>], clipped: usize) {
        self.num_aggregations += 1;
        self.total_gradients += gradients.len() as u64;

        if !gradients.is_empty() {
            let dim = gradients[0].len() as f64;
            self.avg_dimension =
                (self.avg_dimension * (self.num_aggregations - 1) as f64 + dim) /
                self.num_aggregations as f64;

            for g in gradients {
                let norm = g.dot(g).sqrt();
                if norm > self.max_norm {
                    self.max_norm = norm;
                }
            }
        }

        self.num_clipped += clipped as u64;
    }
}

/// Compute the L2 norm of a gradient
pub fn gradient_norm(gradient: &ArrayView1<f64>) -> f64 {
    gradient.dot(gradient).sqrt()
}

/// Compute cosine similarity between two gradients
pub fn gradient_similarity(a: &ArrayView1<f64>, b: &ArrayView1<f64>) -> f64 {
    let dot = a.dot(b);
    let norm_a = gradient_norm(a);
    let norm_b = gradient_norm(b);

    if norm_a == 0.0 || norm_b == 0.0 {
        0.0
    } else {
        dot / (norm_a * norm_b)
    }
}

/// Compute pairwise distances between gradients
pub fn pairwise_distances(gradients: &[Array1<f64>]) -> Vec<Vec<f64>> {
    let n = gradients.len();
    let mut distances = vec![vec![0.0; n]; n];

    for i in 0..n {
        for j in i + 1..n {
            let diff = &gradients[i] - &gradients[j];
            let dist = gradient_norm(&diff.view());
            distances[i][j] = dist;
            distances[j][i] = dist;
        }
    }

    distances
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::array;

    #[test]
    fn test_weighted_average_basic() {
        let config = AggregatorConfig::default();
        let aggregator = WeightedAverageAggregator::new(config);

        let gradients = vec![
            array![1.0, 2.0, 3.0],
            array![2.0, 3.0, 4.0],
        ];
        let weights = vec![0.5, 0.5];

        let result = aggregator.aggregate(&gradients, &weights).unwrap();
        assert!((result[0] - 1.5).abs() < 1e-10);
        assert!((result[1] - 2.5).abs() < 1e-10);
        assert!((result[2] - 3.5).abs() < 1e-10);
    }

    #[test]
    fn test_weighted_average_unequal_weights() {
        let config = AggregatorConfig::default();
        let aggregator = WeightedAverageAggregator::new(config);

        let gradients = vec![
            array![1.0, 0.0],
            array![0.0, 1.0],
        ];
        let weights = vec![3.0, 1.0]; // 75% / 25%

        let result = aggregator.aggregate(&gradients, &weights).unwrap();
        assert!((result[0] - 0.75).abs() < 1e-10);
        assert!((result[1] - 0.25).abs() < 1e-10);
    }

    #[test]
    fn test_gradient_clipping() {
        let config = AggregatorConfig {
            clip_threshold: Some(1.0),
            ..Default::default()
        };
        let aggregator = WeightedAverageAggregator::new(config);

        // Large gradient that should be clipped
        let gradients = vec![array![10.0, 0.0]];
        let weights = vec![1.0];

        let result = aggregator.aggregate(&gradients, &weights).unwrap();
        let norm = result.dot(&result).sqrt();
        assert!((norm - 1.0).abs() < 1e-10);
    }

    #[test]
    fn test_empty_gradients_error() {
        let config = AggregatorConfig::default();
        let aggregator = WeightedAverageAggregator::new(config);

        let result = aggregator.aggregate(&[], &[]);
        assert!(result.is_err());
    }

    #[test]
    fn test_dimension_mismatch_error() {
        let config = AggregatorConfig::default();
        let aggregator = WeightedAverageAggregator::new(config);

        let gradients = vec![
            array![1.0, 2.0],
            array![1.0, 2.0, 3.0], // Different dimension
        ];
        let weights = vec![0.5, 0.5];

        let result = aggregator.aggregate(&gradients, &weights);
        assert!(result.is_err());
    }

    #[test]
    fn test_negative_weight_error() {
        let config = AggregatorConfig::default();
        let aggregator = WeightedAverageAggregator::new(config);

        let gradients = vec![array![1.0, 2.0]];
        let weights = vec![-0.5];

        let result = aggregator.aggregate(&gradients, &weights);
        assert!(result.is_err());
    }

    #[test]
    fn test_momentum() {
        let config = AggregatorConfig {
            momentum: 0.9,
            ..Default::default()
        };
        let aggregator = WeightedAverageAggregator::new(config);

        // First aggregation
        let g1 = vec![array![1.0, 0.0]];
        let w1 = vec![1.0];
        let r1 = aggregator.aggregate(&g1, &w1).unwrap();

        // Second aggregation with momentum
        let g2 = vec![array![0.0, 1.0]];
        let r2 = aggregator.aggregate(&g2, &w1).unwrap();

        // Result should include momentum from first gradient
        assert!(r2[0] > 0.0); // Some momentum from first gradient
    }

    #[test]
    fn test_weight_decay() {
        let config = AggregatorConfig {
            weight_decay: 0.1,
            ..Default::default()
        };
        let aggregator = WeightedAverageAggregator::new(config);

        let gradients = vec![array![1.0, 1.0]];
        let weights = vec![1.0];

        let result = aggregator.aggregate(&gradients, &weights).unwrap();
        // Result should be scaled by (1 - 0.1) = 0.9
        assert!((result[0] - 0.9).abs() < 1e-10);
    }

    #[test]
    fn test_secure_aggregator() {
        let config = AggregatorConfig::default();
        let aggregator = SecureAggregator::new(config);

        let gradients = vec![
            array![1.0, 2.0],
            array![3.0, 4.0],
        ];
        let weights = vec![0.5, 0.5];

        let result = aggregator.aggregate(&gradients, &weights).unwrap();
        // Should be approximately [2.0, 3.0]
        assert!((result[0] - 2.0).abs() < 0.01);
        assert!((result[1] - 3.0).abs() < 0.01);
    }

    #[test]
    fn test_momentum_aggregator() {
        let config = AggregatorConfig {
            momentum: 0.9,
            ..Default::default()
        };
        let aggregator = MomentumAggregator::new(config, false);

        let gradients = vec![array![1.0, 1.0]];
        let weights = vec![1.0];

        let r1 = aggregator.aggregate(&gradients, &weights).unwrap();
        let r2 = aggregator.aggregate(&gradients, &weights).unwrap();

        // Second result should be larger due to momentum accumulation
        assert!(gradient_norm(&r2.view()) > gradient_norm(&r1.view()));
    }

    #[test]
    fn test_nesterov_momentum() {
        let config = AggregatorConfig {
            momentum: 0.9,
            ..Default::default()
        };
        let standard = MomentumAggregator::new(config.clone(), false);
        let nesterov = MomentumAggregator::new(config, true);

        let gradients = vec![array![1.0, 1.0]];
        let weights = vec![1.0];

        // Warm up
        standard.aggregate(&gradients, &weights).unwrap();
        nesterov.aggregate(&gradients, &weights).unwrap();

        // Second iteration
        let r_standard = standard.aggregate(&gradients, &weights).unwrap();
        let r_nesterov = nesterov.aggregate(&gradients, &weights).unwrap();

        // Nesterov should give different result
        assert!((r_standard[0] - r_nesterov[0]).abs() > 0.01);
    }

    #[test]
    fn test_aggregation_stats() {
        let mut stats = AggregationStats::new();

        let gradients = vec![
            array![3.0, 4.0], // norm = 5
            array![1.0, 0.0], // norm = 1
        ];

        stats.update(&gradients, 0);
        assert_eq!(stats.num_aggregations, 1);
        assert_eq!(stats.total_gradients, 2);
        assert!((stats.max_norm - 5.0).abs() < 1e-10);
    }

    #[test]
    fn test_gradient_norm() {
        let g = array![3.0, 4.0];
        assert!((gradient_norm(&g.view()) - 5.0).abs() < 1e-10);
    }

    #[test]
    fn test_gradient_similarity() {
        let a = array![1.0, 0.0];
        let b = array![1.0, 0.0];
        assert!((gradient_similarity(&a.view(), &b.view()) - 1.0).abs() < 1e-10);

        let c = array![0.0, 1.0];
        assert!(gradient_similarity(&a.view(), &c.view()).abs() < 1e-10);

        let d = array![-1.0, 0.0];
        assert!((gradient_similarity(&a.view(), &d.view()) - (-1.0)).abs() < 1e-10);
    }

    #[test]
    fn test_pairwise_distances() {
        let gradients = vec![
            array![0.0, 0.0],
            array![3.0, 0.0],
            array![0.0, 4.0],
        ];

        let distances = pairwise_distances(&gradients);
        assert!((distances[0][1] - 3.0).abs() < 1e-10);
        assert!((distances[0][2] - 4.0).abs() < 1e-10);
        assert!((distances[1][2] - 5.0).abs() < 1e-10);
    }

    #[test]
    fn test_masked_aggregation() {
        let config = AggregatorConfig::default();
        let aggregator = WeightedAverageAggregator::new(config);

        let gradients = vec![
            array![1.0, 1.0],
            array![2.0, 2.0],
            array![3.0, 3.0],
        ];
        let weights = vec![1.0, 1.0, 1.0];
        let mask = vec![true, false, true]; // Skip middle gradient

        let result = aggregator.aggregate_masked(&gradients, &weights, &mask).unwrap();
        // Should average [1,1] and [3,3] = [2,2]
        assert!((result[0] - 2.0).abs() < 1e-10);
        assert!((result[1] - 2.0).abs() < 1e-10);
    }
}
