//! Quantum Policy Network implementation.
//!
//! This module implements a variational quantum circuit (VQC) as a policy network
//! for reinforcement learning. The policy encodes states into quantum amplitudes
//! and uses parameterized rotation gates to learn action distributions.
//!
//! # Architecture
//!
//! The quantum policy network consists of:
//! 1. **State Encoding Layer**: Encodes classical state into quantum amplitudes
//! 2. **Variational Layers**: Parameterized rotation gates (RY, RZ) with entanglement
//! 3. **Measurement Layer**: Measures qubits to produce action probabilities
//!
//! # Example
//!
//! ```
//! use ruqu_qarlp::policy::{QuantumPolicy, PolicyConfig};
//!
//! let config = PolicyConfig {
//!     num_qubits: 4,
//!     num_layers: 2,
//!     num_actions: 2,
//!     ..Default::default()
//! };
//! let mut policy = QuantumPolicy::new(config).unwrap();
//! let state = vec![0.5, -0.3, 0.1, 0.8];
//! let action_probs = policy.forward(&state).unwrap();
//! ```

use crate::error::{PolicyError, PolicyResult};
use ndarray::{Array1, Array2};
use rand::{Rng, SeedableRng};
use serde::{Deserialize, Serialize};
use std::f64::consts::PI;

/// Configuration for the quantum policy network.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyConfig {
    /// Number of qubits in the circuit.
    pub num_qubits: usize,
    /// Number of variational layers.
    pub num_layers: usize,
    /// Number of possible actions.
    pub num_actions: usize,
    /// Temperature for softmax (exploration vs exploitation).
    pub temperature: f64,
    /// Whether to use entanglement between qubits.
    pub use_entanglement: bool,
    /// Random seed for initialization.
    pub seed: Option<u64>,
}

impl Default for PolicyConfig {
    fn default() -> Self {
        Self {
            num_qubits: 4,
            num_layers: 2,
            num_actions: 2,
            temperature: 1.0,
            use_entanglement: true,
            seed: None,
        }
    }
}

/// Quantum Policy Network using variational quantum circuits.
///
/// This implements a policy network where:
/// - States are encoded as rotation angles on qubits
/// - Variational parameters control RY and RZ rotations
/// - CNOT gates provide entanglement
/// - Measurement probabilities determine action selection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuantumPolicy {
    /// Configuration for the policy.
    config: PolicyConfig,
    /// Variational parameters: shape [num_layers, num_qubits, 2] for RY and RZ.
    parameters: Array2<f64>,
    /// State dimension (must match num_qubits).
    state_dim: usize,
    /// Number of total parameters.
    num_parameters: usize,
}

impl QuantumPolicy {
    /// Creates a new quantum policy with the given configuration.
    ///
    /// # Arguments
    ///
    /// * `config` - Configuration for the policy network.
    ///
    /// # Returns
    ///
    /// A new `QuantumPolicy` instance or an error if configuration is invalid.
    ///
    /// # Errors
    ///
    /// Returns `PolicyError::InvalidQubitCount` if num_qubits < 1.
    /// Returns `PolicyError::InvalidLayerCount` if num_layers < 1.
    /// Returns `PolicyError::InvalidActionCount` if num_actions < 2.
    pub fn new(config: PolicyConfig) -> PolicyResult<Self> {
        if config.num_qubits < 1 {
            return Err(PolicyError::InvalidQubitCount {
                min: 1,
                actual: config.num_qubits,
            });
        }
        if config.num_layers < 1 {
            return Err(PolicyError::InvalidLayerCount {
                min: 1,
                actual: config.num_layers,
            });
        }
        if config.num_actions < 2 {
            return Err(PolicyError::InvalidActionCount {
                min: 2,
                actual: config.num_actions,
            });
        }

        // Parameters: 2 rotations (RY, RZ) per qubit per layer
        let num_parameters = config.num_layers * config.num_qubits * 2;
        let parameters = Self::initialize_parameters(&config, num_parameters);

        Ok(Self {
            state_dim: config.num_qubits,
            num_parameters,
            config,
            parameters,
        })
    }

    /// Initializes parameters with small random values.
    fn initialize_parameters(config: &PolicyConfig, num_params: usize) -> Array2<f64> {
        let mut rng = match config.seed {
            Some(seed) => rand::rngs::StdRng::seed_from_u64(seed),
            None => rand::rngs::StdRng::from_entropy(),
        };

        let rows = config.num_layers * config.num_qubits;
        let mut data = Vec::with_capacity(num_params);

        for _ in 0..num_params {
            // Initialize with small random values in [-pi/4, pi/4]
            data.push(rng.gen_range(-PI / 4.0..PI / 4.0));
        }

        Array2::from_shape_vec((rows, 2), data).unwrap()
    }

    /// Forward pass: computes action probabilities from state.
    ///
    /// # Arguments
    ///
    /// * `state` - The environment state as a vector.
    ///
    /// # Returns
    ///
    /// Action probability distribution.
    ///
    /// # Errors
    ///
    /// Returns `PolicyError::StateDimensionMismatch` if state dimension doesn't match.
    pub fn forward(&self, state: &[f64]) -> PolicyResult<Array1<f64>> {
        if state.len() != self.state_dim {
            return Err(PolicyError::StateDimensionMismatch {
                expected: self.state_dim,
                actual: state.len(),
            });
        }

        // Simulate quantum circuit
        let amplitudes = self.simulate_circuit(state)?;

        // Convert amplitudes to action probabilities using softmax
        let action_probs = self.amplitudes_to_action_probs(&amplitudes)?;

        Ok(action_probs)
    }

    /// Simulates the variational quantum circuit.
    ///
    /// This is a classical simulation of the quantum circuit:
    /// 1. Initialize state vector |0...0>
    /// 2. Apply state encoding (RX rotations based on state)
    /// 3. Apply variational layers (RY, RZ rotations + entanglement)
    /// 4. Return probability amplitudes
    fn simulate_circuit(&self, state: &[f64]) -> PolicyResult<Array1<f64>> {
        let n = self.config.num_qubits;
        let dim = 1 << n; // 2^n dimensional state vector

        // Initialize |0...0> state
        let mut amplitudes = Array1::zeros(dim);
        amplitudes[0] = 1.0;

        // Apply state encoding: RX gates with angles proportional to state
        for (qubit, &s) in state.iter().enumerate() {
            let angle = s * PI; // Scale state to rotation angle
            amplitudes = self.apply_rx(amplitudes, qubit, angle);
        }

        // Apply variational layers
        for layer in 0..self.config.num_layers {
            // Apply RY and RZ rotations
            for qubit in 0..n {
                let param_idx = layer * n + qubit;
                let ry_angle = self.parameters[[param_idx, 0]];
                let rz_angle = self.parameters[[param_idx, 1]];

                amplitudes = self.apply_ry(amplitudes, qubit, ry_angle);
                amplitudes = self.apply_rz(amplitudes, qubit, rz_angle);
            }

            // Apply entanglement (CNOT ladder)
            if self.config.use_entanglement && n > 1 {
                for qubit in 0..(n - 1) {
                    amplitudes = self.apply_cnot(amplitudes, qubit, qubit + 1);
                }
            }
        }

        Ok(amplitudes)
    }

    /// Applies RX gate to a specific qubit.
    fn apply_rx(&self, mut amplitudes: Array1<f64>, qubit: usize, angle: f64) -> Array1<f64> {
        let n = self.config.num_qubits;
        let dim = 1 << n;
        let cos_half = (angle / 2.0).cos();
        let sin_half = (angle / 2.0).sin();

        let mut new_amplitudes = Array1::zeros(dim);

        for i in 0..dim {
            let bit = (i >> qubit) & 1;
            let partner = i ^ (1 << qubit);

            if bit == 0 {
                new_amplitudes[i] += cos_half * amplitudes[i];
                new_amplitudes[i] += sin_half * amplitudes[partner]; // Note: simplified, ignoring -i factor
            } else {
                new_amplitudes[i] += sin_half * amplitudes[partner];
                new_amplitudes[i] += cos_half * amplitudes[i];
            }
        }

        new_amplitudes
    }

    /// Applies RY gate to a specific qubit.
    fn apply_ry(&self, mut amplitudes: Array1<f64>, qubit: usize, angle: f64) -> Array1<f64> {
        let n = self.config.num_qubits;
        let dim = 1 << n;
        let cos_half = (angle / 2.0).cos();
        let sin_half = (angle / 2.0).sin();

        let mut new_amplitudes = Array1::zeros(dim);

        for i in 0..dim {
            let bit = (i >> qubit) & 1;
            let partner = i ^ (1 << qubit);

            if bit == 0 {
                new_amplitudes[i] += cos_half * amplitudes[i];
                new_amplitudes[partner] += sin_half * amplitudes[i];
            } else {
                new_amplitudes[i] += cos_half * amplitudes[i];
                new_amplitudes[partner] -= sin_half * amplitudes[i];
            }
        }

        new_amplitudes
    }

    /// Applies RZ gate to a specific qubit.
    fn apply_rz(&self, mut amplitudes: Array1<f64>, qubit: usize, angle: f64) -> Array1<f64> {
        let n = self.config.num_qubits;
        let dim = 1 << n;
        let cos_half = (angle / 2.0).cos();
        let sin_half = (angle / 2.0).sin();

        // RZ only affects phases, but in real-valued simulation we approximate
        // by scaling amplitudes (this is a simplification for classical simulation)
        let mut new_amplitudes = amplitudes.clone();

        for i in 0..dim {
            let bit = (i >> qubit) & 1;
            if bit == 1 {
                // Apply phase shift (approximated in real domain)
                new_amplitudes[i] *= cos_half;
            }
        }

        new_amplitudes
    }

    /// Applies CNOT gate between control and target qubits.
    fn apply_cnot(
        &self,
        mut amplitudes: Array1<f64>,
        control: usize,
        target: usize,
    ) -> Array1<f64> {
        let n = self.config.num_qubits;
        let dim = 1 << n;

        let mut new_amplitudes = Array1::zeros(dim);

        for i in 0..dim {
            let control_bit = (i >> control) & 1;
            if control_bit == 1 {
                // Flip target bit
                let j = i ^ (1 << target);
                new_amplitudes[j] = amplitudes[i];
            } else {
                new_amplitudes[i] = amplitudes[i];
            }
        }

        new_amplitudes
    }

    /// Converts quantum amplitudes to action probabilities.
    fn amplitudes_to_action_probs(&self, amplitudes: &Array1<f64>) -> PolicyResult<Array1<f64>> {
        let n_actions = self.config.num_actions;
        let dim = amplitudes.len();

        // Compute measurement probabilities
        let probs: Vec<f64> = amplitudes.iter().map(|a| a * a).collect();

        // Group probabilities into actions
        // Strategy: divide state space among actions
        let states_per_action = dim / n_actions;
        let mut action_probs = Array1::zeros(n_actions);

        for (i, &prob) in probs.iter().enumerate() {
            let action = (i / states_per_action.max(1)).min(n_actions - 1);
            action_probs[action] += prob;
        }

        // Apply temperature scaling and softmax
        let max_logit = action_probs.iter().cloned().fold(f64::NEG_INFINITY, f64::max);

        let exp_logits: Vec<f64> = action_probs
            .iter()
            .map(|&p| ((p - max_logit) / self.config.temperature).exp())
            .collect();

        let sum: f64 = exp_logits.iter().sum();

        if sum <= 0.0 || !sum.is_finite() {
            return Err(PolicyError::NumericalInstability(
                "Softmax sum is zero or infinite".to_string(),
            ));
        }

        let normalized: Vec<f64> = exp_logits.iter().map(|&e| e / sum).collect();

        Ok(Array1::from_vec(normalized))
    }

    /// Samples an action from the policy given a state.
    ///
    /// # Arguments
    ///
    /// * `state` - The environment state.
    /// * `rng` - Random number generator.
    ///
    /// # Returns
    ///
    /// The sampled action index.
    pub fn sample_action<R: Rng>(&self, state: &[f64], rng: &mut R) -> PolicyResult<usize> {
        let probs = self.forward(state)?;
        let r: f64 = rng.gen();

        let mut cumsum = 0.0;
        for (action, &prob) in probs.iter().enumerate() {
            cumsum += prob;
            if r <= cumsum {
                return Ok(action);
            }
        }

        // Fallback to last action (shouldn't happen with proper normalization)
        Ok(self.config.num_actions - 1)
    }

    /// Returns the number of trainable parameters.
    pub fn num_parameters(&self) -> usize {
        self.num_parameters
    }

    /// Returns a reference to the parameters.
    pub fn parameters(&self) -> &Array2<f64> {
        &self.parameters
    }

    /// Returns a mutable reference to the parameters.
    pub fn parameters_mut(&mut self) -> &mut Array2<f64> {
        &mut self.parameters
    }

    /// Sets the parameters.
    ///
    /// # Arguments
    ///
    /// * `params` - Flattened parameter vector.
    ///
    /// # Errors
    ///
    /// Returns `PolicyError::ParameterCountMismatch` if length doesn't match.
    pub fn set_parameters(&mut self, params: &[f64]) -> PolicyResult<()> {
        if params.len() != self.num_parameters {
            return Err(PolicyError::ParameterCountMismatch {
                expected: self.num_parameters,
                actual: params.len(),
            });
        }

        let rows = self.config.num_layers * self.config.num_qubits;
        self.parameters = Array2::from_shape_vec((rows, 2), params.to_vec()).map_err(|e| {
            PolicyError::InvalidParameter(format!("Failed to reshape parameters: {}", e))
        })?;

        Ok(())
    }

    /// Gets parameters as a flat vector.
    pub fn get_parameters_flat(&self) -> Vec<f64> {
        self.parameters.iter().cloned().collect()
    }

    /// Returns the policy configuration.
    pub fn config(&self) -> &PolicyConfig {
        &self.config
    }

    /// Sets the temperature for exploration.
    pub fn set_temperature(&mut self, temperature: f64) {
        self.config.temperature = temperature;
    }

    /// Computes the log probability of taking an action given a state.
    ///
    /// # Arguments
    ///
    /// * `state` - The environment state.
    /// * `action` - The action taken.
    ///
    /// # Returns
    ///
    /// The log probability of the action.
    pub fn log_prob(&self, state: &[f64], action: usize) -> PolicyResult<f64> {
        let probs = self.forward(state)?;

        if action >= probs.len() {
            return Err(PolicyError::InvalidParameter(format!(
                "Action {} out of range [0, {})",
                action,
                probs.len()
            )));
        }

        let prob = probs[action];
        if prob <= 0.0 {
            return Err(PolicyError::NumericalInstability(
                "Log of zero probability".to_string(),
            ));
        }

        Ok(prob.ln())
    }

    /// Computes entropy of the action distribution.
    ///
    /// Higher entropy indicates more exploration.
    pub fn entropy(&self, state: &[f64]) -> PolicyResult<f64> {
        let probs = self.forward(state)?;

        let entropy: f64 = probs
            .iter()
            .filter(|&&p| p > 1e-10)
            .map(|&p| -p * p.ln())
            .sum();

        Ok(entropy)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;

    #[test]
    fn test_policy_creation() {
        let config = PolicyConfig::default();
        let policy = QuantumPolicy::new(config).unwrap();

        assert_eq!(policy.config.num_qubits, 4);
        assert_eq!(policy.config.num_layers, 2);
        assert_eq!(policy.config.num_actions, 2);
    }

    #[test]
    fn test_policy_creation_custom() {
        let config = PolicyConfig {
            num_qubits: 6,
            num_layers: 3,
            num_actions: 4,
            temperature: 0.5,
            use_entanglement: false,
            seed: Some(42),
        };
        let policy = QuantumPolicy::new(config).unwrap();

        assert_eq!(policy.num_parameters(), 36); // 3 layers * 6 qubits * 2 params
    }

    #[test]
    fn test_invalid_qubit_count() {
        let config = PolicyConfig {
            num_qubits: 0,
            ..Default::default()
        };
        let result = QuantumPolicy::new(config);
        assert!(matches!(
            result,
            Err(PolicyError::InvalidQubitCount { min: 1, actual: 0 })
        ));
    }

    #[test]
    fn test_invalid_layer_count() {
        let config = PolicyConfig {
            num_layers: 0,
            ..Default::default()
        };
        let result = QuantumPolicy::new(config);
        assert!(matches!(
            result,
            Err(PolicyError::InvalidLayerCount { min: 1, actual: 0 })
        ));
    }

    #[test]
    fn test_invalid_action_count() {
        let config = PolicyConfig {
            num_actions: 1,
            ..Default::default()
        };
        let result = QuantumPolicy::new(config);
        assert!(matches!(
            result,
            Err(PolicyError::InvalidActionCount { min: 2, actual: 1 })
        ));
    }

    #[test]
    fn test_forward_pass() {
        let config = PolicyConfig {
            num_qubits: 4,
            num_layers: 2,
            num_actions: 2,
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(config).unwrap();
        let state = vec![0.5, -0.3, 0.1, 0.8];

        let probs = policy.forward(&state).unwrap();

        assert_eq!(probs.len(), 2);
        assert_relative_eq!(probs.sum(), 1.0, epsilon = 1e-6);
        assert!(probs.iter().all(|&p| p >= 0.0 && p <= 1.0));
    }

    #[test]
    fn test_forward_state_mismatch() {
        let config = PolicyConfig::default();
        let policy = QuantumPolicy::new(config).unwrap();
        let state = vec![0.5, 0.3]; // Wrong size

        let result = policy.forward(&state);
        assert!(matches!(
            result,
            Err(PolicyError::StateDimensionMismatch {
                expected: 4,
                actual: 2
            })
        ));
    }

    #[test]
    fn test_sample_action() {
        let config = PolicyConfig {
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(config).unwrap();
        let state = vec![0.5, -0.3, 0.1, 0.8];

        let mut rng = rand::rngs::StdRng::seed_from_u64(123);
        let action = policy.sample_action(&state, &mut rng).unwrap();

        assert!(action < 2);
    }

    #[test]
    fn test_action_sampling_distribution() {
        let config = PolicyConfig {
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(config).unwrap();
        let state = vec![0.5, -0.3, 0.1, 0.8];

        let mut rng = rand::rngs::StdRng::seed_from_u64(456);
        let mut counts = [0usize; 2];

        for _ in 0..1000 {
            let action = policy.sample_action(&state, &mut rng).unwrap();
            counts[action] += 1;
        }

        // Both actions should be sampled at least sometimes
        assert!(counts[0] > 0);
        assert!(counts[1] > 0);
    }

    #[test]
    fn test_set_parameters() {
        let config = PolicyConfig {
            num_qubits: 2,
            num_layers: 1,
            num_actions: 2,
            ..Default::default()
        };
        let mut policy = QuantumPolicy::new(config).unwrap();

        let new_params = vec![0.1, 0.2, 0.3, 0.4]; // 1 layer * 2 qubits * 2 params
        policy.set_parameters(&new_params).unwrap();

        let retrieved = policy.get_parameters_flat();
        assert_eq!(retrieved, new_params);
    }

    #[test]
    fn test_set_parameters_wrong_count() {
        let config = PolicyConfig::default();
        let mut policy = QuantumPolicy::new(config).unwrap();

        let wrong_params = vec![0.1, 0.2, 0.3];
        let result = policy.set_parameters(&wrong_params);

        assert!(matches!(result, Err(PolicyError::ParameterCountMismatch { .. })));
    }

    #[test]
    fn test_log_prob() {
        let config = PolicyConfig {
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(config).unwrap();
        let state = vec![0.5, -0.3, 0.1, 0.8];

        let log_prob_0 = policy.log_prob(&state, 0).unwrap();
        let log_prob_1 = policy.log_prob(&state, 1).unwrap();

        // Log probs should be negative
        assert!(log_prob_0 <= 0.0);
        assert!(log_prob_1 <= 0.0);

        // exp(log_prob_0) + exp(log_prob_1) should equal 1
        let sum = log_prob_0.exp() + log_prob_1.exp();
        assert_relative_eq!(sum, 1.0, epsilon = 1e-6);
    }

    #[test]
    fn test_entropy() {
        let config = PolicyConfig {
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(config).unwrap();
        let state = vec![0.5, -0.3, 0.1, 0.8];

        let entropy = policy.entropy(&state).unwrap();

        // Entropy should be non-negative and bounded by ln(num_actions)
        assert!(entropy >= 0.0);
        assert!(entropy <= (2.0_f64).ln() + 1e-6);
    }

    #[test]
    fn test_temperature_effect() {
        let config1 = PolicyConfig {
            temperature: 0.1, // Low temperature - more deterministic
            seed: Some(42),
            ..Default::default()
        };
        let config2 = PolicyConfig {
            temperature: 10.0, // High temperature - more random
            seed: Some(42),
            ..Default::default()
        };

        let policy1 = QuantumPolicy::new(config1).unwrap();
        let policy2 = QuantumPolicy::new(config2).unwrap();
        let state = vec![0.5, -0.3, 0.1, 0.8];

        let entropy1 = policy1.entropy(&state).unwrap();
        let entropy2 = policy2.entropy(&state).unwrap();

        // Higher temperature should give higher entropy
        assert!(entropy2 > entropy1);
    }

    #[test]
    fn test_deterministic_with_seed() {
        let config1 = PolicyConfig {
            seed: Some(42),
            ..Default::default()
        };
        let config2 = PolicyConfig {
            seed: Some(42),
            ..Default::default()
        };

        let policy1 = QuantumPolicy::new(config1).unwrap();
        let policy2 = QuantumPolicy::new(config2).unwrap();

        let params1 = policy1.get_parameters_flat();
        let params2 = policy2.get_parameters_flat();

        assert_eq!(params1, params2);
    }

    #[test]
    fn test_multiple_actions() {
        let config = PolicyConfig {
            num_qubits: 4,
            num_layers: 2,
            num_actions: 4,
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(config).unwrap();
        let state = vec![0.5, -0.3, 0.1, 0.8];

        let probs = policy.forward(&state).unwrap();

        assert_eq!(probs.len(), 4);
        assert_relative_eq!(probs.sum(), 1.0, epsilon = 1e-6);
    }

    #[test]
    fn test_no_entanglement() {
        let config = PolicyConfig {
            use_entanglement: false,
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(config).unwrap();
        let state = vec![0.5, -0.3, 0.1, 0.8];

        let probs = policy.forward(&state).unwrap();

        assert_eq!(probs.len(), 2);
        assert_relative_eq!(probs.sum(), 1.0, epsilon = 1e-6);
    }
}
