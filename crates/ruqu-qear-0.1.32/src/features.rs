//! Feature extraction from quantum reservoir dynamics.
//!
//! This module provides methods to extract meaningful features from
//! the reservoir state evolution, including simulated quantum state
//! tomography and expectation value computation.

use crate::error::{QearError, QearResult};
use crate::reservoir::QuantumReservoir;
use ndarray::{Array1, Array2, Axis};

#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};

/// Feature extractor configuration.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct FeatureConfig {
    /// Include raw reservoir states.
    pub include_raw_states: bool,
    /// Include squared states (probabilities).
    pub include_probabilities: bool,
    /// Include pairwise correlations.
    pub include_correlations: bool,
    /// Include temporal differences.
    pub include_temporal_diff: bool,
    /// Include spectral features via FFT.
    pub include_spectral: bool,
    /// Include statistical moments.
    pub include_moments: bool,
    /// Order of statistical moments to compute.
    pub moment_order: usize,
    /// Window size for local statistics.
    pub window_size: usize,
    /// Polynomial degree for nonlinear features.
    pub polynomial_degree: usize,
}

impl Default for FeatureConfig {
    fn default() -> Self {
        Self {
            include_raw_states: true,
            include_probabilities: true,
            include_correlations: false,
            include_temporal_diff: true,
            include_spectral: false,
            include_moments: true,
            moment_order: 4,
            window_size: 10,
            polynomial_degree: 2,
        }
    }
}

impl FeatureConfig {
    /// Create a minimal feature configuration.
    pub fn minimal() -> Self {
        Self {
            include_raw_states: true,
            include_probabilities: false,
            include_correlations: false,
            include_temporal_diff: false,
            include_spectral: false,
            include_moments: false,
            moment_order: 2,
            window_size: 5,
            polynomial_degree: 1,
        }
    }

    /// Create a comprehensive feature configuration.
    pub fn comprehensive() -> Self {
        Self {
            include_raw_states: true,
            include_probabilities: true,
            include_correlations: true,
            include_temporal_diff: true,
            include_spectral: true,
            include_moments: true,
            moment_order: 4,
            window_size: 20,
            polynomial_degree: 3,
        }
    }
}

/// Feature extractor for quantum reservoir states.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct FeatureExtractor {
    /// Configuration.
    config: FeatureConfig,
}

impl FeatureExtractor {
    /// Create a new feature extractor.
    pub fn new(config: FeatureConfig) -> Self {
        Self { config }
    }

    /// Create a feature extractor with default configuration.
    pub fn default_extractor() -> Self {
        Self::new(FeatureConfig::default())
    }

    /// Extract features from reservoir states.
    pub fn extract(&self, states: &Array2<f64>) -> QearResult<Array2<f64>> {
        let n_samples = states.nrows();
        let mut feature_sets: Vec<Array2<f64>> = Vec::new();

        // Raw states
        if self.config.include_raw_states {
            feature_sets.push(states.clone());
        }

        // Probability amplitudes (squared states)
        if self.config.include_probabilities {
            let probs = states.mapv(|x| x * x);
            feature_sets.push(probs);
        }

        // Pairwise correlations
        if self.config.include_correlations {
            let correlations = self.compute_pairwise_correlations(states)?;
            feature_sets.push(correlations);
        }

        // Temporal differences
        if self.config.include_temporal_diff && n_samples > 1 {
            let diffs = self.compute_temporal_differences(states)?;
            feature_sets.push(diffs);
        }

        // Statistical moments
        if self.config.include_moments {
            let moments = self.compute_moments(states)?;
            feature_sets.push(moments);
        }

        // Spectral features
        if self.config.include_spectral && n_samples >= self.config.window_size {
            let spectral = self.compute_spectral_features(states)?;
            feature_sets.push(spectral);
        }

        // Concatenate all features
        if feature_sets.is_empty() {
            return Err(QearError::feature_extraction(
                "No features selected in configuration",
            ));
        }

        let total_features: usize = feature_sets.iter().map(|f| f.ncols()).sum();
        let mut result = Array2::zeros((n_samples, total_features));
        let mut col_offset = 0;

        for features in feature_sets {
            let n_cols = features.ncols();
            for i in 0..n_samples {
                for j in 0..n_cols {
                    result[[i, col_offset + j]] = features[[i, j]];
                }
            }
            col_offset += n_cols;
        }

        Ok(result)
    }

    /// Compute pairwise correlations between reservoir neurons.
    fn compute_pairwise_correlations(&self, states: &Array2<f64>) -> QearResult<Array2<f64>> {
        let n_samples = states.nrows();
        let n_neurons = states.ncols();

        // Limit correlations to avoid explosion (take every kth neuron)
        let max_correlations = 100;
        let step = ((n_neurons * (n_neurons - 1) / 2) as f64 / max_correlations as f64)
            .sqrt()
            .ceil() as usize;
        let step = step.max(1);

        let selected_neurons: Vec<usize> = (0..n_neurons).step_by(step).collect();
        let n_pairs = selected_neurons.len() * (selected_neurons.len() - 1) / 2;

        let mut correlations = Array2::zeros((n_samples, n_pairs.max(1)));

        let mut pair_idx = 0;
        for (i, &ni) in selected_neurons.iter().enumerate() {
            for &nj in selected_neurons.iter().skip(i + 1) {
                for t in 0..n_samples {
                    correlations[[t, pair_idx]] = states[[t, ni]] * states[[t, nj]];
                }
                pair_idx += 1;
                if pair_idx >= n_pairs {
                    break;
                }
            }
            if pair_idx >= n_pairs {
                break;
            }
        }

        Ok(correlations)
    }

    /// Compute temporal differences (first derivative approximation).
    fn compute_temporal_differences(&self, states: &Array2<f64>) -> QearResult<Array2<f64>> {
        let n_samples = states.nrows();
        let n_neurons = states.ncols();

        let mut diffs = Array2::zeros((n_samples, n_neurons));

        // First sample has zero difference
        for j in 0..n_neurons {
            diffs[[0, j]] = 0.0;
        }

        // Compute differences for remaining samples
        for i in 1..n_samples {
            for j in 0..n_neurons {
                diffs[[i, j]] = states[[i, j]] - states[[i - 1, j]];
            }
        }

        Ok(diffs)
    }

    /// Compute statistical moments of reservoir states.
    fn compute_moments(&self, states: &Array2<f64>) -> QearResult<Array2<f64>> {
        let n_samples = states.nrows();
        let order = self.config.moment_order;

        // Compute moments per sample (over neurons)
        let mut moments = Array2::zeros((n_samples, order));

        for i in 0..n_samples {
            let row = states.row(i);
            let mean = row.mean().unwrap_or(0.0);

            // First moment: mean
            moments[[i, 0]] = mean;

            if order >= 2 {
                // Second moment: variance
                let variance: f64 = row.iter().map(|x| (x - mean).powi(2)).sum::<f64>()
                    / row.len() as f64;
                moments[[i, 1]] = variance;

                if order >= 3 && variance > 1e-10 {
                    // Third moment: skewness
                    let std_dev = variance.sqrt();
                    let skewness: f64 = row.iter().map(|x| ((x - mean) / std_dev).powi(3)).sum::<f64>()
                        / row.len() as f64;
                    moments[[i, 2]] = skewness;
                }

                if order >= 4 && variance > 1e-10 {
                    // Fourth moment: kurtosis
                    let std_dev = variance.sqrt();
                    let kurtosis: f64 = row.iter().map(|x| ((x - mean) / std_dev).powi(4)).sum::<f64>()
                        / row.len() as f64
                        - 3.0; // Excess kurtosis
                    moments[[i, 3]] = kurtosis;
                }
            }
        }

        Ok(moments)
    }

    /// Compute spectral features using simple DFT.
    fn compute_spectral_features(&self, states: &Array2<f64>) -> QearResult<Array2<f64>> {
        let n_samples = states.nrows();
        let n_neurons = states.ncols();
        let window = self.config.window_size;

        // Compute power spectrum for each neuron, then aggregate
        let n_freq = window / 2 + 1;
        let mut spectral = Array2::zeros((n_samples, n_freq));

        for i in 0..n_samples {
            if i + 1 >= window {
                // Compute DFT magnitudes for window ending at sample i
                let start = i + 1 - window;

                for k in 0..n_freq {
                    let mut real_sum = 0.0;
                    let mut imag_sum = 0.0;

                    for t in 0..window {
                        // Average over neurons
                        let mut sample_avg = 0.0;
                        for j in 0..n_neurons {
                            sample_avg += states[[start + t, j]];
                        }
                        sample_avg /= n_neurons as f64;

                        let angle = -2.0 * std::f64::consts::PI * k as f64 * t as f64 / window as f64;
                        real_sum += sample_avg * angle.cos();
                        imag_sum += sample_avg * angle.sin();
                    }

                    spectral[[i, k]] = (real_sum * real_sum + imag_sum * imag_sum).sqrt() / window as f64;
                }
            }
        }

        Ok(spectral)
    }

    /// Extract features from a single state vector.
    pub fn extract_single(&self, state: &Array1<f64>) -> QearResult<Array1<f64>> {
        let states = state.clone().insert_axis(Axis(0));
        let features = self.extract(&states)?;
        Ok(features.row(0).to_owned())
    }

    /// Get the configuration.
    pub fn config(&self) -> &FeatureConfig {
        &self.config
    }
}

/// Simulated quantum state tomography.
///
/// Extracts information about the quantum state by measuring in different bases.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct QuantumTomography {
    /// Number of measurement bases.
    num_bases: usize,
}

impl QuantumTomography {
    /// Create a new quantum tomography instance.
    pub fn new(num_bases: usize) -> Self {
        Self { num_bases }
    }

    /// Perform simulated tomography on reservoir.
    pub fn measure(&self, reservoir: &QuantumReservoir) -> QearResult<Array1<f64>> {
        let (real, imag) = reservoir.complex_state();
        let n = real.len();

        // For each basis, compute expectation values
        let mut measurements = Vec::with_capacity(self.num_bases * 3);

        // Pauli-Z measurements (computational basis)
        let z_expectations = self.pauli_z_expectation(real, imag);
        measurements.extend(z_expectations.iter().take(self.num_bases.min(n)));

        // Pauli-X measurements (Hadamard basis)
        let x_expectations = self.pauli_x_expectation(real, imag);
        measurements.extend(x_expectations.iter().take(self.num_bases.min(n)));

        // Pauli-Y measurements
        let y_expectations = self.pauli_y_expectation(real, imag);
        measurements.extend(y_expectations.iter().take(self.num_bases.min(n)));

        Ok(Array1::from_vec(measurements))
    }

    /// Compute Pauli-Z expectation values.
    fn pauli_z_expectation(&self, real: &Array1<f64>, imag: &Array1<f64>) -> Vec<f64> {
        let n = real.len();
        let n_qubits = (n as f64).log2().ceil() as usize;

        let mut expectations = Vec::with_capacity(n_qubits);

        for q in 0..n_qubits {
            let mut expectation = 0.0;
            for i in 0..n {
                let prob = real[i] * real[i] + imag[i] * imag[i];
                // +1 if qubit q is 0, -1 if qubit q is 1
                let sign = if (i >> q) & 1 == 0 { 1.0 } else { -1.0 };
                expectation += sign * prob;
            }
            expectations.push(expectation);
        }

        expectations
    }

    /// Compute Pauli-X expectation values (approximate).
    fn pauli_x_expectation(&self, real: &Array1<f64>, imag: &Array1<f64>) -> Vec<f64> {
        let n = real.len();
        let n_qubits = (n as f64).log2().ceil() as usize;

        let mut expectations = Vec::with_capacity(n_qubits);

        for q in 0..n_qubits {
            let mut expectation = 0.0;
            for i in 0..n {
                // X flips qubit q
                let j = i ^ (1 << q);
                if j < n {
                    // <i|X|j> contribution
                    expectation += real[i] * real[j] + imag[i] * imag[j];
                }
            }
            expectations.push(expectation);
        }

        expectations
    }

    /// Compute Pauli-Y expectation values (approximate).
    fn pauli_y_expectation(&self, real: &Array1<f64>, imag: &Array1<f64>) -> Vec<f64> {
        let n = real.len();
        let n_qubits = (n as f64).log2().ceil() as usize;

        let mut expectations = Vec::with_capacity(n_qubits);

        for q in 0..n_qubits {
            let mut expectation = 0.0;
            for i in 0..n {
                let j = i ^ (1 << q);
                if j < n {
                    // Y = i * |0><1| - i * |1><0|
                    let sign = if (i >> q) & 1 == 0 { 1.0 } else { -1.0 };
                    expectation += sign * (real[i] * imag[j] - imag[i] * real[j]);
                }
            }
            expectations.push(expectation);
        }

        expectations
    }

    /// Get the number of measurement bases.
    pub fn num_bases(&self) -> usize {
        self.num_bases
    }
}

/// Compute expectation values of observables.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct ExpectationComputer {
    /// Observables as matrices (diagonal elements for efficiency).
    observables: Vec<Array1<f64>>,
}

impl ExpectationComputer {
    /// Create a new expectation computer with default observables.
    pub fn new(n_qubits: usize) -> Self {
        let size = 1 << n_qubits;
        let mut observables = Vec::new();

        // Number operator for each computational basis state
        for i in 0..size {
            let mut observable = Array1::zeros(size);
            observable[i] = 1.0;
            observables.push(observable);
        }

        Self { observables }
    }

    /// Create with custom observables.
    pub fn with_observables(observables: Vec<Array1<f64>>) -> Self {
        Self { observables }
    }

    /// Add an observable.
    pub fn add_observable(&mut self, observable: Array1<f64>) {
        self.observables.push(observable);
    }

    /// Compute expectation values for all observables.
    pub fn compute(&self, reservoir: &QuantumReservoir) -> QearResult<Array1<f64>> {
        let probs = reservoir.probability_amplitudes();
        let mut expectations = Vec::with_capacity(self.observables.len());

        for observable in &self.observables {
            if observable.len() != probs.len() {
                return Err(QearError::dimension_mismatch(observable.len(), probs.len()));
            }
            let expectation: f64 = observable.iter().zip(probs.iter()).map(|(o, p)| o * p).sum();
            expectations.push(expectation);
        }

        Ok(Array1::from_vec(expectations))
    }

    /// Compute expectation value for a single observable.
    pub fn compute_single(
        &self,
        reservoir: &QuantumReservoir,
        observable_idx: usize,
    ) -> QearResult<f64> {
        if observable_idx >= self.observables.len() {
            return Err(QearError::invalid_parameter(
                "observable_idx",
                format!("Index {} out of bounds", observable_idx),
            ));
        }

        let probs = reservoir.probability_amplitudes();
        let observable = &self.observables[observable_idx];
        let expectation: f64 = observable.iter().zip(probs.iter()).map(|(o, p)| o * p).sum();

        Ok(expectation)
    }

    /// Get the number of observables.
    pub fn num_observables(&self) -> usize {
        self.observables.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::reservoir::ReservoirConfig;

    #[test]
    fn test_feature_config_default() {
        let config = FeatureConfig::default();
        assert!(config.include_raw_states);
        assert!(config.include_probabilities);
    }

    #[test]
    fn test_feature_extractor_creation() {
        let extractor = FeatureExtractor::default_extractor();
        assert!(extractor.config().include_raw_states);
    }

    #[test]
    fn test_feature_extraction() {
        let config = FeatureConfig::minimal();
        let extractor = FeatureExtractor::new(config);

        let states = Array2::from_shape_fn((10, 16), |(i, j)| {
            ((i + j) as f64 / 26.0).sin()
        });

        let features = extractor.extract(&states).unwrap();
        assert_eq!(features.nrows(), 10);
        assert!(features.ncols() >= 16); // At least raw states
    }

    #[test]
    fn test_feature_extraction_comprehensive() {
        let config = FeatureConfig::comprehensive();
        let extractor = FeatureExtractor::new(config);

        let states = Array2::from_shape_fn((50, 16), |(i, j)| {
            ((i + j) as f64 / 66.0).sin()
        });

        let features = extractor.extract(&states).unwrap();
        assert_eq!(features.nrows(), 50);
        assert!(features.ncols() > 16); // More than just raw states
    }

    #[test]
    fn test_temporal_differences() {
        let extractor = FeatureExtractor::default_extractor();

        let states = Array2::from_shape_vec(
            (3, 2),
            vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0],
        )
        .unwrap();

        let diffs = extractor.compute_temporal_differences(&states).unwrap();

        assert_eq!(diffs[[0, 0]], 0.0);
        assert_eq!(diffs[[0, 1]], 0.0);
        assert!((diffs[[1, 0]] - 2.0).abs() < 1e-10);
        assert!((diffs[[1, 1]] - 2.0).abs() < 1e-10);
    }

    #[test]
    fn test_moments_computation() {
        let extractor = FeatureExtractor::default_extractor();

        let states = Array2::from_shape_fn((5, 10), |(i, _j)| i as f64);
        let moments = extractor.compute_moments(&states).unwrap();

        assert_eq!(moments.nrows(), 5);
        assert_eq!(moments.ncols(), 4); // Default moment_order is 4
    }

    #[test]
    fn test_quantum_tomography() {
        let config = ReservoirConfig::new(4).with_seed(42);
        let reservoir = QuantumReservoir::new(config).unwrap();

        let tomography = QuantumTomography::new(4);
        let measurements = tomography.measure(&reservoir).unwrap();

        assert!(measurements.len() > 0);
    }

    #[test]
    fn test_expectation_computer() {
        let config = ReservoirConfig::new(4).with_seed(42);
        let reservoir = QuantumReservoir::new(config).unwrap();

        let computer = ExpectationComputer::new(4);
        let expectations = computer.compute(&reservoir).unwrap();

        // Should have 16 expectation values (2^4 basis states)
        assert_eq!(expectations.len(), 16);

        // Expectations should sum to 1 (probabilities)
        let sum: f64 = expectations.sum();
        assert!((sum - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_single_state_extraction() {
        let extractor = FeatureExtractor::default_extractor();
        let state = Array1::from_vec(vec![0.1, 0.2, 0.3, 0.4]);

        let features = extractor.extract_single(&state).unwrap();
        assert!(features.len() > 0);
    }

    #[test]
    fn test_pairwise_correlations() {
        let extractor = FeatureExtractor::default_extractor();
        let states = Array2::from_shape_fn((10, 8), |(i, j)| {
            ((i + j) as f64 / 18.0).sin()
        });

        let correlations = extractor.compute_pairwise_correlations(&states).unwrap();
        assert_eq!(correlations.nrows(), 10);
    }
}
