//! Gradient computation for quantum policy optimization.
//!
//! This module implements gradient computation methods for variational quantum
//! circuits, including the parameter-shift rule and REINFORCE algorithm with
//! baseline subtraction.
//!
//! # Parameter-Shift Rule
//!
//! For quantum circuits with parameterized rotation gates, the gradient can be
//! computed exactly using the parameter-shift rule:
//!
//! ```text
//! df/dθ = (f(θ + π/2) - f(θ - π/2)) / 2
//! ```
//!
//! # REINFORCE Algorithm
//!
//! The policy gradient is computed as:
//!
//! ```text
//! ∇J(θ) = E[∇log π(a|s) * (R - b)]
//! ```
//!
//! where `b` is a baseline (typically value function or average return).

use crate::error::{GradientError, GradientResult};
use crate::policy::QuantumPolicy;
use ndarray::Array1;
use serde::{Deserialize, Serialize};
use std::f64::consts::PI;

/// Configuration for gradient computation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradientConfig {
    /// Shift value for parameter-shift rule (typically π/2).
    pub shift: f64,
    /// Learning rate for parameter updates.
    pub learning_rate: f64,
    /// Gradient clipping threshold (max gradient norm).
    pub clip_threshold: f64,
    /// Discount factor (gamma) for future rewards.
    pub gamma: f64,
    /// Whether to use baseline subtraction.
    pub use_baseline: bool,
    /// Baseline decay rate (for exponential moving average).
    pub baseline_decay: f64,
}

impl Default for GradientConfig {
    fn default() -> Self {
        Self {
            shift: PI / 2.0,
            learning_rate: 0.01,
            clip_threshold: 1.0,
            gamma: 0.99,
            use_baseline: true,
            baseline_decay: 0.99,
        }
    }
}

/// Experience tuple for replay and gradient computation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Experience {
    /// State observation.
    pub state: Vec<f64>,
    /// Action taken.
    pub action: usize,
    /// Reward received.
    pub reward: f64,
    /// Next state observation.
    pub next_state: Vec<f64>,
    /// Whether episode terminated.
    pub done: bool,
    /// Log probability of the action.
    pub log_prob: f64,
}

/// Trajectory: sequence of experiences in an episode.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Trajectory {
    /// List of experiences in the trajectory.
    pub experiences: Vec<Experience>,
    /// Total reward for the trajectory.
    pub total_reward: f64,
}

impl Trajectory {
    /// Creates a new empty trajectory.
    pub fn new() -> Self {
        Self::default()
    }

    /// Adds an experience to the trajectory.
    pub fn push(&mut self, exp: Experience) {
        self.total_reward += exp.reward;
        self.experiences.push(exp);
    }

    /// Returns the number of steps in the trajectory.
    pub fn len(&self) -> usize {
        self.experiences.len()
    }

    /// Checks if the trajectory is empty.
    pub fn is_empty(&self) -> bool {
        self.experiences.is_empty()
    }

    /// Computes discounted returns for each step.
    pub fn compute_returns(&self, gamma: f64) -> Vec<f64> {
        let n = self.experiences.len();
        let mut returns = vec![0.0; n];

        let mut running_return = 0.0;
        for i in (0..n).rev() {
            running_return = self.experiences[i].reward + gamma * running_return;
            returns[i] = running_return;
        }

        returns
    }
}

/// Policy gradient optimizer using REINFORCE algorithm.
#[derive(Debug, Clone)]
pub struct PolicyGradient {
    /// Configuration for gradient computation.
    config: GradientConfig,
    /// Running baseline for variance reduction.
    baseline: f64,
    /// Number of updates performed.
    update_count: usize,
}

impl PolicyGradient {
    /// Creates a new policy gradient optimizer.
    pub fn new(config: GradientConfig) -> GradientResult<Self> {
        if config.shift == 0.0 {
            return Err(GradientError::InvalidShift(config.shift));
        }
        if config.learning_rate <= 0.0 {
            return Err(GradientError::InvalidLearningRate(config.learning_rate));
        }
        if config.clip_threshold <= 0.0 {
            return Err(GradientError::InvalidClipThreshold(config.clip_threshold));
        }

        Ok(Self {
            config,
            baseline: 0.0,
            update_count: 0,
        })
    }

    /// Computes policy gradient using REINFORCE algorithm.
    ///
    /// # Arguments
    ///
    /// * `policy` - The quantum policy network.
    /// * `trajectory` - Trajectory of experiences.
    ///
    /// # Returns
    ///
    /// Gradient vector for all parameters.
    pub fn compute_gradient(
        &mut self,
        policy: &QuantumPolicy,
        trajectory: &Trajectory,
    ) -> GradientResult<Array1<f64>> {
        if trajectory.is_empty() {
            return Err(GradientError::EmptyTrajectory);
        }

        let num_params = policy.num_parameters();
        let mut gradients = Array1::zeros(num_params);

        // Compute returns
        let returns = trajectory.compute_returns(self.config.gamma);

        // Update baseline
        let mean_return: f64 = returns.iter().sum::<f64>() / returns.len() as f64;
        if self.config.use_baseline {
            self.baseline =
                self.config.baseline_decay * self.baseline + (1.0 - self.config.baseline_decay) * mean_return;
        }

        // Compute gradient using parameter-shift rule
        let params = policy.get_parameters_flat();

        for param_idx in 0..num_params {
            let mut param_gradient = 0.0;

            // For each experience, compute gradient contribution
            for (exp, &ret) in trajectory.experiences.iter().zip(returns.iter()) {
                let advantage = ret - self.baseline;

                // Parameter-shift rule: compute gradient of log_prob
                let grad_log_prob =
                    self.parameter_shift_gradient(policy, &params, param_idx, &exp.state, exp.action)?;

                param_gradient += grad_log_prob * advantage;
            }

            // Average over trajectory
            gradients[param_idx] = param_gradient / trajectory.len() as f64;
        }

        // Gradient clipping
        let grad_norm = gradients.iter().map(|g| g * g).sum::<f64>().sqrt();
        if grad_norm > self.config.clip_threshold {
            let scale = self.config.clip_threshold / grad_norm;
            gradients *= scale;
        }

        self.update_count += 1;

        Ok(gradients)
    }

    /// Computes gradient of log probability using parameter-shift rule.
    fn parameter_shift_gradient(
        &self,
        policy: &QuantumPolicy,
        params: &[f64],
        param_idx: usize,
        state: &[f64],
        action: usize,
    ) -> GradientResult<f64> {
        let mut params_plus = params.to_vec();
        let mut params_minus = params.to_vec();

        params_plus[param_idx] += self.config.shift;
        params_minus[param_idx] -= self.config.shift;

        // Create temporary policies with shifted parameters
        let mut policy_plus = policy.clone();
        let mut policy_minus = policy.clone();

        policy_plus.set_parameters(&params_plus).map_err(|e| {
            GradientError::ComputationFailed(format!("Failed to set plus params: {}", e))
        })?;
        policy_minus.set_parameters(&params_minus).map_err(|e| {
            GradientError::ComputationFailed(format!("Failed to set minus params: {}", e))
        })?;

        let log_prob_plus = policy_plus.log_prob(state, action).map_err(|e| {
            GradientError::ComputationFailed(format!("Failed to compute log prob plus: {}", e))
        })?;
        let log_prob_minus = policy_minus.log_prob(state, action).map_err(|e| {
            GradientError::ComputationFailed(format!("Failed to compute log prob minus: {}", e))
        })?;

        // Parameter-shift rule
        let gradient = (log_prob_plus - log_prob_minus) / (2.0 * self.config.shift.sin());

        Ok(gradient)
    }

    /// Updates policy parameters using computed gradients.
    ///
    /// # Arguments
    ///
    /// * `policy` - The quantum policy to update.
    /// * `gradients` - Computed gradients.
    pub fn update_parameters(
        &self,
        policy: &mut QuantumPolicy,
        gradients: &Array1<f64>,
    ) -> GradientResult<()> {
        let mut params = policy.get_parameters_flat();

        for (i, grad) in gradients.iter().enumerate() {
            params[i] += self.config.learning_rate * grad;
        }

        policy.set_parameters(&params).map_err(|e| {
            GradientError::ComputationFailed(format!("Failed to update parameters: {}", e))
        })?;

        Ok(())
    }

    /// Computes gradient using multiple trajectories (batch update).
    pub fn compute_batch_gradient(
        &mut self,
        policy: &QuantumPolicy,
        trajectories: &[Trajectory],
    ) -> GradientResult<Array1<f64>> {
        if trajectories.is_empty() {
            return Err(GradientError::EmptyTrajectory);
        }

        let num_params = policy.num_parameters();
        let mut total_gradients = Array1::zeros(num_params);
        let mut total_weight = 0.0;

        for trajectory in trajectories {
            if !trajectory.is_empty() {
                let gradients = self.compute_gradient(policy, trajectory)?;
                let weight = trajectory.len() as f64;
                total_gradients += &(gradients * weight);
                total_weight += weight;
            }
        }

        if total_weight > 0.0 {
            total_gradients /= total_weight;
        }

        Ok(total_gradients)
    }

    /// Returns the current baseline value.
    pub fn baseline(&self) -> f64 {
        self.baseline
    }

    /// Returns the number of updates performed.
    pub fn update_count(&self) -> usize {
        self.update_count
    }

    /// Resets the baseline.
    pub fn reset_baseline(&mut self) {
        self.baseline = 0.0;
    }

    /// Returns the configuration.
    pub fn config(&self) -> &GradientConfig {
        &self.config
    }

    /// Sets the learning rate.
    pub fn set_learning_rate(&mut self, lr: f64) -> GradientResult<()> {
        if lr <= 0.0 {
            return Err(GradientError::InvalidLearningRate(lr));
        }
        self.config.learning_rate = lr;
        Ok(())
    }
}

/// Computes advantage estimates using GAE (Generalized Advantage Estimation).
///
/// # Arguments
///
/// * `rewards` - Sequence of rewards.
/// * `values` - Value estimates for each state.
/// * `gamma` - Discount factor.
/// * `lambda` - GAE lambda parameter.
///
/// # Returns
///
/// Vector of advantage estimates.
pub fn compute_gae(rewards: &[f64], values: &[f64], gamma: f64, lambda: f64) -> Vec<f64> {
    let n = rewards.len();
    if n == 0 || values.len() < n {
        return vec![];
    }

    let mut advantages = vec![0.0; n];
    let mut running_advantage = 0.0;

    for i in (0..n).rev() {
        let next_value = if i + 1 < values.len() { values[i + 1] } else { 0.0 };
        let delta = rewards[i] + gamma * next_value - values[i];
        running_advantage = delta + gamma * lambda * running_advantage;
        advantages[i] = running_advantage;
    }

    advantages
}

/// Normalizes advantages to have zero mean and unit variance.
pub fn normalize_advantages(advantages: &mut [f64]) {
    if advantages.is_empty() {
        return;
    }

    let mean: f64 = advantages.iter().sum::<f64>() / advantages.len() as f64;
    let variance: f64 =
        advantages.iter().map(|a| (a - mean).powi(2)).sum::<f64>() / advantages.len() as f64;
    let std = variance.sqrt().max(1e-8);

    for a in advantages.iter_mut() {
        *a = (*a - mean) / std;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::policy::PolicyConfig;
    use approx::assert_relative_eq;

    fn create_test_policy() -> QuantumPolicy {
        let config = PolicyConfig {
            num_qubits: 4,
            num_layers: 1,
            num_actions: 2,
            seed: Some(42),
            ..Default::default()
        };
        QuantumPolicy::new(config).unwrap()
    }

    fn create_test_trajectory() -> Trajectory {
        let mut trajectory = Trajectory::new();
        for i in 0..5 {
            trajectory.push(Experience {
                state: vec![0.1, 0.2, 0.3, 0.4],
                action: i % 2,
                reward: 1.0,
                next_state: vec![0.2, 0.3, 0.4, 0.5],
                done: i == 4,
                log_prob: -0.5,
            });
        }
        trajectory
    }

    #[test]
    fn test_gradient_config_default() {
        let config = GradientConfig::default();
        assert_relative_eq!(config.shift, PI / 2.0);
        assert!(config.learning_rate > 0.0);
        assert!(config.clip_threshold > 0.0);
    }

    #[test]
    fn test_policy_gradient_creation() {
        let config = GradientConfig::default();
        let pg = PolicyGradient::new(config).unwrap();
        assert_eq!(pg.update_count(), 0);
    }

    #[test]
    fn test_invalid_shift() {
        let config = GradientConfig {
            shift: 0.0,
            ..Default::default()
        };
        let result = PolicyGradient::new(config);
        assert!(matches!(result, Err(GradientError::InvalidShift(0.0))));
    }

    #[test]
    fn test_invalid_learning_rate() {
        let config = GradientConfig {
            learning_rate: -0.1,
            ..Default::default()
        };
        let result = PolicyGradient::new(config);
        assert!(matches!(
            result,
            Err(GradientError::InvalidLearningRate(_))
        ));
    }

    #[test]
    fn test_invalid_clip_threshold() {
        let config = GradientConfig {
            clip_threshold: 0.0,
            ..Default::default()
        };
        let result = PolicyGradient::new(config);
        assert!(matches!(
            result,
            Err(GradientError::InvalidClipThreshold(_))
        ));
    }

    #[test]
    fn test_trajectory_creation() {
        let trajectory = Trajectory::new();
        assert!(trajectory.is_empty());
        assert_eq!(trajectory.len(), 0);
    }

    #[test]
    fn test_trajectory_push() {
        let mut trajectory = Trajectory::new();
        trajectory.push(Experience {
            state: vec![0.0; 4],
            action: 0,
            reward: 1.0,
            next_state: vec![0.0; 4],
            done: false,
            log_prob: -0.5,
        });

        assert_eq!(trajectory.len(), 1);
        assert_eq!(trajectory.total_reward, 1.0);
    }

    #[test]
    fn test_compute_returns() {
        let mut trajectory = Trajectory::new();
        for i in 0..3 {
            trajectory.push(Experience {
                state: vec![0.0; 4],
                action: 0,
                reward: 1.0,
                next_state: vec![0.0; 4],
                done: i == 2,
                log_prob: -0.5,
            });
        }

        let gamma = 0.9;
        let returns = trajectory.compute_returns(gamma);

        assert_eq!(returns.len(), 3);
        // Returns: R_2 = 1.0, R_1 = 1.0 + 0.9 * 1.0 = 1.9, R_0 = 1.0 + 0.9 * 1.9 = 2.71
        assert_relative_eq!(returns[2], 1.0, epsilon = 1e-6);
        assert_relative_eq!(returns[1], 1.9, epsilon = 1e-6);
        assert_relative_eq!(returns[0], 2.71, epsilon = 1e-6);
    }

    #[test]
    fn test_compute_gradient() {
        let policy = create_test_policy();
        let trajectory = create_test_trajectory();
        let config = GradientConfig::default();
        let mut pg = PolicyGradient::new(config).unwrap();

        let gradients = pg.compute_gradient(&policy, &trajectory).unwrap();

        assert_eq!(gradients.len(), policy.num_parameters());
        // Gradients should be finite
        assert!(gradients.iter().all(|g| g.is_finite()));
    }

    #[test]
    fn test_compute_gradient_empty_trajectory() {
        let policy = create_test_policy();
        let trajectory = Trajectory::new();
        let config = GradientConfig::default();
        let mut pg = PolicyGradient::new(config).unwrap();

        let result = pg.compute_gradient(&policy, &trajectory);
        assert!(matches!(result, Err(GradientError::EmptyTrajectory)));
    }

    #[test]
    fn test_update_parameters() {
        let mut policy = create_test_policy();
        let trajectory = create_test_trajectory();
        let config = GradientConfig {
            learning_rate: 0.1,
            ..Default::default()
        };
        let mut pg = PolicyGradient::new(config).unwrap();

        let old_params = policy.get_parameters_flat();
        let gradients = pg.compute_gradient(&policy, &trajectory).unwrap();
        pg.update_parameters(&mut policy, &gradients).unwrap();
        let new_params = policy.get_parameters_flat();

        // Parameters should have changed
        assert!(old_params
            .iter()
            .zip(new_params.iter())
            .any(|(a, b)| (a - b).abs() > 1e-10));
    }

    #[test]
    fn test_gradient_clipping() {
        let mut policy = create_test_policy();
        let trajectory = create_test_trajectory();
        let config = GradientConfig {
            clip_threshold: 0.1, // Very small threshold
            ..Default::default()
        };
        let mut pg = PolicyGradient::new(config).unwrap();

        let gradients = pg.compute_gradient(&policy, &trajectory).unwrap();
        let grad_norm = gradients.iter().map(|g| g * g).sum::<f64>().sqrt();

        // Gradient norm should be at most clip_threshold
        assert!(grad_norm <= 0.1 + 1e-6);
    }

    #[test]
    fn test_baseline_update() {
        let policy = create_test_policy();
        let trajectory = create_test_trajectory();
        let config = GradientConfig {
            use_baseline: true,
            ..Default::default()
        };
        let mut pg = PolicyGradient::new(config).unwrap();

        assert_eq!(pg.baseline(), 0.0);

        pg.compute_gradient(&policy, &trajectory).unwrap();

        // Baseline should have been updated
        assert_ne!(pg.baseline(), 0.0);
    }

    #[test]
    fn test_batch_gradient() {
        let policy = create_test_policy();
        let trajectories = vec![
            create_test_trajectory(),
            create_test_trajectory(),
            create_test_trajectory(),
        ];
        let config = GradientConfig::default();
        let mut pg = PolicyGradient::new(config).unwrap();

        let gradients = pg.compute_batch_gradient(&policy, &trajectories).unwrap();

        assert_eq!(gradients.len(), policy.num_parameters());
        assert!(gradients.iter().all(|g| g.is_finite()));
    }

    #[test]
    fn test_compute_gae() {
        let rewards = vec![1.0, 1.0, 1.0];
        let values = vec![0.5, 0.5, 0.5, 0.0]; // Including next value
        let gamma = 0.9;
        let lambda = 0.95;

        let advantages = compute_gae(&rewards, &values, gamma, lambda);

        assert_eq!(advantages.len(), 3);
        assert!(advantages.iter().all(|a| a.is_finite()));
    }

    #[test]
    fn test_normalize_advantages() {
        let mut advantages = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        normalize_advantages(&mut advantages);

        // Mean should be close to 0
        let mean: f64 = advantages.iter().sum::<f64>() / advantages.len() as f64;
        assert_relative_eq!(mean, 0.0, epsilon = 1e-6);

        // Variance should be close to 1
        let variance: f64 =
            advantages.iter().map(|a| a.powi(2)).sum::<f64>() / advantages.len() as f64;
        assert_relative_eq!(variance, 1.0, epsilon = 1e-6);
    }

    #[test]
    fn test_normalize_empty() {
        let mut advantages: Vec<f64> = vec![];
        normalize_advantages(&mut advantages);
        assert!(advantages.is_empty());
    }

    #[test]
    fn test_set_learning_rate() {
        let config = GradientConfig::default();
        let mut pg = PolicyGradient::new(config).unwrap();

        pg.set_learning_rate(0.001).unwrap();
        assert_eq!(pg.config().learning_rate, 0.001);
    }

    #[test]
    fn test_set_invalid_learning_rate() {
        let config = GradientConfig::default();
        let mut pg = PolicyGradient::new(config).unwrap();

        let result = pg.set_learning_rate(-0.1);
        assert!(result.is_err());
    }

    #[test]
    fn test_reset_baseline() {
        let policy = create_test_policy();
        let trajectory = create_test_trajectory();
        let config = GradientConfig::default();
        let mut pg = PolicyGradient::new(config).unwrap();

        pg.compute_gradient(&policy, &trajectory).unwrap();
        assert_ne!(pg.baseline(), 0.0);

        pg.reset_baseline();
        assert_eq!(pg.baseline(), 0.0);
    }

    #[test]
    fn test_update_count() {
        let policy = create_test_policy();
        let trajectory = create_test_trajectory();
        let config = GradientConfig::default();
        let mut pg = PolicyGradient::new(config).unwrap();

        assert_eq!(pg.update_count(), 0);

        pg.compute_gradient(&policy, &trajectory).unwrap();
        assert_eq!(pg.update_count(), 1);

        pg.compute_gradient(&policy, &trajectory).unwrap();
        assert_eq!(pg.update_count(), 2);
    }
}
