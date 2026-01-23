//! Quantum Echo-State Reservoir implementation.
//!
//! This module implements a simulated quantum reservoir with echo state network
//! dynamics. The reservoir uses complex amplitudes to simulate quantum states
//! and evolves through unitary-like dynamics.

use crate::error::{QearError, QearResult};
use ndarray::{Array1, Array2};
use rand::{Rng, SeedableRng};
use rand_distr::{Distribution, Normal, Uniform};

#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};

/// Configuration for the quantum reservoir.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct ReservoirConfig {
    /// Number of simulated qubits (determines reservoir size as 2^n_qubits).
    pub n_qubits: usize,
    /// Spectral radius of the reservoir weight matrix.
    pub spectral_radius: f64,
    /// Input scaling factor.
    pub input_scaling: f64,
    /// Leaking rate (1.0 = no leaking, 0.0 = instant update).
    pub leaking_rate: f64,
    /// Sparsity of the reservoir connections (0.0 = full, 1.0 = no connections).
    pub sparsity: f64,
    /// Number of washout steps to discard initial transients.
    pub washout_steps: usize,
    /// Random seed for reproducibility.
    pub seed: Option<u64>,
    /// Noise level for quantum simulation.
    pub noise_level: f64,
}

impl Default for ReservoirConfig {
    fn default() -> Self {
        Self {
            n_qubits: 6,          // 64 reservoir neurons
            spectral_radius: 0.9, // Echo state property
            input_scaling: 1.0,
            leaking_rate: 0.3,
            sparsity: 0.9,
            washout_steps: 100,
            seed: None,
            noise_level: 0.01,
        }
    }
}

impl ReservoirConfig {
    /// Create a new reservoir configuration.
    pub fn new(n_qubits: usize) -> Self {
        Self {
            n_qubits,
            ..Default::default()
        }
    }

    /// Set the spectral radius.
    pub fn with_spectral_radius(mut self, spectral_radius: f64) -> Self {
        self.spectral_radius = spectral_radius;
        self
    }

    /// Set the input scaling.
    pub fn with_input_scaling(mut self, input_scaling: f64) -> Self {
        self.input_scaling = input_scaling;
        self
    }

    /// Set the leaking rate.
    pub fn with_leaking_rate(mut self, leaking_rate: f64) -> Self {
        self.leaking_rate = leaking_rate;
        self
    }

    /// Set the sparsity.
    pub fn with_sparsity(mut self, sparsity: f64) -> Self {
        self.sparsity = sparsity;
        self
    }

    /// Set the washout steps.
    pub fn with_washout_steps(mut self, washout_steps: usize) -> Self {
        self.washout_steps = washout_steps;
        self
    }

    /// Set the random seed.
    pub fn with_seed(mut self, seed: u64) -> Self {
        self.seed = Some(seed);
        self
    }

    /// Set the noise level.
    pub fn with_noise_level(mut self, noise_level: f64) -> Self {
        self.noise_level = noise_level;
        self
    }

    /// Validate the configuration.
    pub fn validate(&self) -> QearResult<()> {
        if self.n_qubits == 0 {
            return Err(QearError::invalid_parameter(
                "n_qubits",
                "must be greater than 0",
            ));
        }
        if self.n_qubits > 12 {
            return Err(QearError::invalid_parameter(
                "n_qubits",
                "must be <= 12 for practical simulation",
            ));
        }
        if self.spectral_radius <= 0.0 || self.spectral_radius > 1.0 {
            return Err(QearError::invalid_parameter(
                "spectral_radius",
                "must be in (0, 1]",
            ));
        }
        if self.leaking_rate <= 0.0 || self.leaking_rate > 1.0 {
            return Err(QearError::invalid_parameter(
                "leaking_rate",
                "must be in (0, 1]",
            ));
        }
        if self.sparsity < 0.0 || self.sparsity >= 1.0 {
            return Err(QearError::invalid_parameter(
                "sparsity",
                "must be in [0, 1)",
            ));
        }
        if self.noise_level < 0.0 {
            return Err(QearError::invalid_parameter(
                "noise_level",
                "must be non-negative",
            ));
        }
        Ok(())
    }

    /// Get the reservoir size (2^n_qubits).
    pub fn reservoir_size(&self) -> usize {
        1 << self.n_qubits
    }
}

/// Quantum Echo-State Reservoir.
///
/// This implements a reservoir computing system that simulates quantum dynamics
/// using complex amplitudes. The reservoir state evolves according to:
///
/// x(t+1) = (1-a) * x(t) + a * tanh(W_in * u(t) + W * x(t))
///
/// where:
/// - x(t) is the reservoir state at time t
/// - u(t) is the input at time t
/// - W_in is the input weight matrix
/// - W is the reservoir weight matrix
/// - a is the leaking rate
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct QuantumReservoir {
    /// Configuration.
    config: ReservoirConfig,
    /// Reservoir weight matrix (N x N).
    weights: Array2<f64>,
    /// Input weight matrix (N x input_dim).
    input_weights: Option<Array2<f64>>,
    /// Current reservoir state (N,).
    state: Array1<f64>,
    /// Imaginary part of quantum state (for quantum simulation).
    state_imag: Array1<f64>,
    /// Reservoir size.
    size: usize,
    /// Input dimension (set on first input).
    input_dim: Option<usize>,
    /// Steps since initialization.
    steps: usize,
}

impl QuantumReservoir {
    /// Create a new quantum reservoir with the given configuration.
    pub fn new(config: ReservoirConfig) -> QearResult<Self> {
        config.validate()?;

        let size = config.reservoir_size();
        let mut rng = match config.seed {
            Some(seed) => rand::rngs::StdRng::seed_from_u64(seed),
            None => rand::rngs::StdRng::from_entropy(),
        };

        // Initialize reservoir weights with sparsity
        let weights = Self::initialize_weights(&config, size, &mut rng)?;

        // Initialize state to small random values (simulating quantum superposition)
        let normal = Normal::new(0.0, 0.1).map_err(|e| {
            QearError::reservoir_init(format!("Failed to create normal distribution: {}", e))
        })?;

        let state: Array1<f64> = Array1::from_iter((0..size).map(|_| normal.sample(&mut rng)));

        let state_imag: Array1<f64> = Array1::from_iter((0..size).map(|_| normal.sample(&mut rng)));

        // Normalize to unit norm (quantum state normalization)
        let norm = (state.iter().map(|x| x * x).sum::<f64>()
            + state_imag.iter().map(|x| x * x).sum::<f64>())
        .sqrt();

        let state = state / norm;
        let state_imag = state_imag / norm;

        Ok(Self {
            config,
            weights,
            input_weights: None,
            state,
            state_imag,
            size,
            input_dim: None,
            steps: 0,
        })
    }

    /// Initialize the reservoir weight matrix with sparsity and spectral radius scaling.
    fn initialize_weights<R: Rng>(
        config: &ReservoirConfig,
        size: usize,
        rng: &mut R,
    ) -> QearResult<Array2<f64>> {
        let uniform = Uniform::new(-0.5, 0.5);
        let sparse_uniform = Uniform::new(0.0, 1.0);

        let mut weights = Array2::zeros((size, size));

        for i in 0..size {
            for j in 0..size {
                if sparse_uniform.sample(rng) > config.sparsity {
                    weights[[i, j]] = uniform.sample(rng);
                }
            }
        }

        // Compute spectral radius using power iteration
        let current_radius = Self::compute_spectral_radius(&weights, 100)?;

        if current_radius > 1e-10 {
            weights = weights * (config.spectral_radius / current_radius);
        }

        Ok(weights)
    }

    /// Compute spectral radius using power iteration.
    fn compute_spectral_radius(matrix: &Array2<f64>, iterations: usize) -> QearResult<f64> {
        let n = matrix.nrows();
        let mut v: Array1<f64> = Array1::from_elem(n, 1.0 / (n as f64).sqrt());

        for _ in 0..iterations {
            let v_new = matrix.dot(&v);
            let norm = v_new.iter().map(|x| x * x).sum::<f64>().sqrt();
            if norm < 1e-10 {
                return Ok(0.0);
            }
            v = v_new / norm;
        }

        let av = matrix.dot(&v);
        let eigenvalue = v.dot(&av);

        Ok(eigenvalue.abs())
    }

    /// Initialize input weights for a given input dimension.
    fn initialize_input_weights(&mut self, input_dim: usize) -> QearResult<()> {
        let mut rng = match self.config.seed {
            Some(seed) => rand::rngs::StdRng::seed_from_u64(seed.wrapping_add(12345)),
            None => rand::rngs::StdRng::from_entropy(),
        };

        let uniform = Uniform::new(-1.0, 1.0);
        let mut input_weights = Array2::zeros((self.size, input_dim));

        for i in 0..self.size {
            for j in 0..input_dim {
                input_weights[[i, j]] = uniform.sample(&mut rng) * self.config.input_scaling;
            }
        }

        self.input_weights = Some(input_weights);
        self.input_dim = Some(input_dim);

        Ok(())
    }

    /// Update the reservoir state with a new input.
    pub fn update(&mut self, input: &Array1<f64>) -> QearResult<Array1<f64>> {
        let input_dim = input.len();

        // Initialize input weights on first input
        if self.input_weights.is_none() {
            self.initialize_input_weights(input_dim)?;
        }

        // Check input dimension
        if let Some(expected) = self.input_dim {
            if input_dim != expected {
                return Err(QearError::dimension_mismatch(expected, input_dim));
            }
        }

        let input_weights = self.input_weights.as_ref().unwrap();

        // Compute pre-activation: W_in * u + W * x
        let input_contribution = input_weights.dot(input);
        let recurrent_contribution = self.weights.dot(&self.state);

        let pre_activation = &input_contribution + &recurrent_contribution;

        // Apply nonlinearity (tanh) and leaking rate
        let new_state: Array1<f64> = pre_activation.mapv(|x| x.tanh());

        // Leaky integration
        let alpha = self.config.leaking_rate;
        self.state = &self.state * (1.0 - alpha) + &new_state * alpha;

        // Update imaginary part with quantum-like dynamics
        let imag_contribution = self.weights.dot(&self.state_imag);
        let phase_rotation: Array1<f64> = (0..self.size)
            .map(|i| {
                let phase = self.state[i].atan2(self.state_imag[i]);
                (phase * 0.1).sin()
            })
            .collect();

        self.state_imag = &self.state_imag * (1.0 - alpha) + &imag_contribution.mapv(|x| x.tanh()) * alpha;
        self.state_imag = &self.state_imag + &phase_rotation * self.config.noise_level;

        // Add quantum noise
        if self.config.noise_level > 0.0 {
            let mut rng = rand::thread_rng();
            let normal = Normal::new(0.0, self.config.noise_level).unwrap();
            for i in 0..self.size {
                self.state[i] += normal.sample(&mut rng);
                self.state_imag[i] += normal.sample(&mut rng);
            }
        }

        // Normalize quantum state
        let norm = (self.state.iter().map(|x| x * x).sum::<f64>()
            + self.state_imag.iter().map(|x| x * x).sum::<f64>())
        .sqrt();

        if norm > 1e-10 {
            self.state = &self.state / norm;
            self.state_imag = &self.state_imag / norm;
        }

        self.steps += 1;

        Ok(self.state.clone())
    }

    /// Run the reservoir through a sequence of inputs.
    pub fn run(&mut self, inputs: &Array2<f64>) -> QearResult<Array2<f64>> {
        let n_samples = inputs.nrows();
        let mut states = Vec::with_capacity(n_samples);

        for i in 0..n_samples {
            let input = inputs.row(i).to_owned();
            let state = self.update(&input)?;
            states.push(state);
        }

        // Stack states into matrix
        let state_dim = self.size;
        let mut result = Array2::zeros((n_samples, state_dim));

        for (i, state) in states.iter().enumerate() {
            result.row_mut(i).assign(state);
        }

        Ok(result)
    }

    /// Run the reservoir through inputs with washout (discard initial states).
    pub fn run_with_washout(&mut self, inputs: &Array2<f64>) -> QearResult<Array2<f64>> {
        let n_samples = inputs.nrows();
        let washout = self.config.washout_steps.min(n_samples);

        if n_samples <= washout {
            return Err(QearError::insufficient_data(washout + 1, n_samples));
        }

        // Run through all inputs
        let all_states = self.run(inputs)?;

        // Return states after washout
        Ok(all_states.slice(ndarray::s![washout.., ..]).to_owned())
    }

    /// Get the current reservoir state.
    pub fn state(&self) -> &Array1<f64> {
        &self.state
    }

    /// Get the complex state (real and imaginary parts).
    pub fn complex_state(&self) -> (&Array1<f64>, &Array1<f64>) {
        (&self.state, &self.state_imag)
    }

    /// Get the probability amplitudes (|psi|^2 for each basis state).
    pub fn probability_amplitudes(&self) -> Array1<f64> {
        let real_sq: Array1<f64> = self.state.mapv(|x| x * x);
        let imag_sq: Array1<f64> = self.state_imag.mapv(|x| x * x);
        &real_sq + &imag_sq
    }

    /// Reset the reservoir state.
    pub fn reset(&mut self) {
        let mut rng = match self.config.seed {
            Some(seed) => rand::rngs::StdRng::seed_from_u64(seed.wrapping_add(99999)),
            None => rand::rngs::StdRng::from_entropy(),
        };

        let normal = Normal::new(0.0, 0.1).unwrap();
        self.state = Array1::from_iter((0..self.size).map(|_| normal.sample(&mut rng)));
        self.state_imag = Array1::from_iter((0..self.size).map(|_| normal.sample(&mut rng)));

        let norm = (self.state.iter().map(|x| x * x).sum::<f64>()
            + self.state_imag.iter().map(|x| x * x).sum::<f64>())
        .sqrt();

        self.state = &self.state / norm;
        self.state_imag = &self.state_imag / norm;
        self.steps = 0;
    }

    /// Get the reservoir configuration.
    pub fn config(&self) -> &ReservoirConfig {
        &self.config
    }

    /// Get the reservoir size.
    pub fn size(&self) -> usize {
        self.size
    }

    /// Get the number of steps since initialization.
    pub fn steps(&self) -> usize {
        self.steps
    }

    /// Check if washout is complete.
    pub fn washout_complete(&self) -> bool {
        self.steps >= self.config.washout_steps
    }

    /// Get the reservoir weight matrix.
    pub fn weights(&self) -> &Array2<f64> {
        &self.weights
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reservoir_config_default() {
        let config = ReservoirConfig::default();
        assert_eq!(config.n_qubits, 6);
        assert!((config.spectral_radius - 0.9).abs() < 1e-10);
    }

    #[test]
    fn test_reservoir_config_validation() {
        let config = ReservoirConfig::new(0);
        assert!(config.validate().is_err());

        let config = ReservoirConfig::new(6).with_spectral_radius(1.5);
        assert!(config.validate().is_err());

        let config = ReservoirConfig::new(6);
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_reservoir_creation() {
        let config = ReservoirConfig::new(4).with_seed(42);
        let reservoir = QuantumReservoir::new(config).unwrap();
        assert_eq!(reservoir.size(), 16);
    }

    #[test]
    fn test_reservoir_update() {
        let config = ReservoirConfig::new(4).with_seed(42);
        let mut reservoir = QuantumReservoir::new(config).unwrap();

        let input = Array1::from_vec(vec![1.0, 0.5, -0.3]);
        let state = reservoir.update(&input).unwrap();

        assert_eq!(state.len(), 16);
    }

    #[test]
    fn test_reservoir_run() {
        let config = ReservoirConfig::new(4).with_seed(42);
        let mut reservoir = QuantumReservoir::new(config).unwrap();

        let inputs = Array2::from_shape_vec((10, 3), (0..30).map(|x| x as f64 / 30.0).collect()).unwrap();

        let states = reservoir.run(&inputs).unwrap();
        assert_eq!(states.nrows(), 10);
        assert_eq!(states.ncols(), 16);
    }

    #[test]
    fn test_reservoir_probability_amplitudes() {
        let config = ReservoirConfig::new(4).with_seed(42);
        let reservoir = QuantumReservoir::new(config).unwrap();

        let probs = reservoir.probability_amplitudes();
        let sum: f64 = probs.sum();

        // Should sum to 1 (normalized quantum state)
        assert!((sum - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_reservoir_reset() {
        let config = ReservoirConfig::new(4).with_seed(42);
        let mut reservoir = QuantumReservoir::new(config).unwrap();

        let input = Array1::from_vec(vec![1.0, 0.5, -0.3]);
        reservoir.update(&input).unwrap();
        assert!(reservoir.steps() > 0);

        reservoir.reset();
        assert_eq!(reservoir.steps(), 0);
    }

    #[test]
    fn test_reservoir_dimension_mismatch() {
        let config = ReservoirConfig::new(4).with_seed(42);
        let mut reservoir = QuantumReservoir::new(config).unwrap();

        let input1 = Array1::from_vec(vec![1.0, 0.5, -0.3]);
        reservoir.update(&input1).unwrap();

        let input2 = Array1::from_vec(vec![1.0, 0.5]);
        let result = reservoir.update(&input2);
        assert!(result.is_err());
    }
}
