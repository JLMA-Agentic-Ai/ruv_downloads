//! # ruqu-qear - Quantum Echo-Attention Reservoir
//!
//! A scientifically novel library combining quantum reservoir computing with
//! attention mechanisms for advanced time series processing and prediction.
//!
//! ## Overview
//!
//! QEAR (Quantum Echo-Attention Reservoir) implements a hybrid computational
//! model that leverages:
//!
//! - **Quantum Reservoir Computing**: Uses simulated quantum dynamics with echo
//!   state network principles to create rich, high-dimensional feature spaces.
//!
//! - **Attention Mechanisms**: Employs multi-head attention to fuse reservoir
//!   states with input sequences, enabling the model to focus on relevant
//!   temporal patterns.
//!
//! - **Feature Extraction**: Provides comprehensive feature extraction including
//!   quantum state tomography, expectation values, and classical statistics.
//!
//! ## Key Features
//!
//! - Simulated quantum reservoir with N qubits (2^N neurons)
//! - Echo state network dynamics with controllable spectral radius
//! - Multi-head attention fusion between reservoir and inputs
//! - Temporal attention for sequence-to-sequence modeling
//! - Ridge regression and online learning for readout
//! - Sliding window time series processing
//! - Hyperparameter optimization via cross-validation
//!
//! ## Quick Start
//!
//! ```rust
//! use ruqu_qear::prelude::*;
//!
//! // Create a quantum reservoir
//! let config = ReservoirConfig::new(5)  // 32 neurons (2^5)
//!     .with_spectral_radius(0.95)
//!     .with_seed(42);
//!
//! let mut reservoir = QuantumReservoir::new(config).unwrap();
//!
//! // Process input sequence
//! let inputs = ndarray::Array2::from_shape_fn((100, 3), |(i, j)| {
//!     ((i + j) as f64 / 103.0).sin()
//! });
//!
//! let states = reservoir.run(&inputs).unwrap();
//!
//! // Extract features
//! let extractor = FeatureExtractor::default_extractor();
//! let features = extractor.extract(&states).unwrap();
//! ```
//!
//! ## Time Series Forecasting
//!
//! ```rust,no_run
//! use ruqu_qear::prelude::*;
//!
//! // Configure time series processing
//! let ts_config = TimeSeriesConfig::new(1, 50)  // 1D input, window size 50
//!     .with_forecast_horizon(10);
//!
//! let reservoir_config = ReservoirConfig::new(5);
//!
//! let mut processor = TimeSeriesProcessor::new(ts_config, reservoir_config).unwrap();
//!
//! // Prepare training data
//! let data = ndarray::Array2::from_shape_fn((1000, 1), |(i, _)| {
//!     (i as f64 * 0.1).sin()  // Simple sine wave
//! });
//!
//! let (features, targets) = processor.prepare_training_data(&data).unwrap();
//!
//! // Train readout layer
//! let mut model = RidgeRegression::default_model().unwrap();
//! // Convert features and targets to 2D arrays for training...
//! ```
//!
//! ## Architecture
//!
//! The library is organized into several modules:
//!
//! - [`reservoir`]: Quantum echo state reservoir implementation
//! - [`fusion`]: Attention mechanisms for state fusion
//! - [`features`]: Feature extraction from reservoir dynamics
//! - [`timeseries`]: Time series processing utilities
//! - [`training`]: Training algorithms (ridge regression, online learning)
//! - [`error`]: Error types and result handling
//!
//! ## Scientific Background
//!
//! Reservoir computing is a recurrent neural network paradigm where:
//! 1. A fixed, randomly initialized "reservoir" transforms inputs into a
//!    high-dimensional space
//! 2. Only the output layer (readout) is trained
//!
//! Echo State Networks (ESN) achieve this by ensuring the reservoir has the
//! "echo state property" - that the effect of initial conditions vanishes over
//! time. This is controlled by the spectral radius.
//!
//! QEAR extends this by:
//! 1. Using complex-valued states to simulate quantum amplitudes
//! 2. Applying quantum-inspired dynamics with phase rotation
//! 3. Adding attention mechanisms to learn which reservoir states are relevant
//!
//! ## References
//!
//! - Jaeger, H. (2001). The "echo state" approach to analysing and training
//!   recurrent neural networks.
//! - Fujii, K., & Nakajima, K. (2017). Harnessing disordered-ensemble quantum
//!   dynamics for machine learning.
//! - Vaswani, A. et al. (2017). Attention is all you need.

#![deny(missing_docs)]
#![deny(unsafe_code)]
#![warn(clippy::all)]

pub mod error;
pub mod features;
pub mod fusion;
pub mod reservoir;
pub mod timeseries;
pub mod training;

/// Prelude module with commonly used types.
pub mod prelude {
    pub use crate::error::{QearError, QearResult};
    pub use crate::features::{
        ExpectationComputer, FeatureConfig, FeatureExtractor, QuantumTomography,
    };
    pub use crate::fusion::{AttentionConfig, AttentionFusion, TemporalAttention};
    pub use crate::reservoir::{QuantumReservoir, ReservoirConfig};
    pub use crate::timeseries::{
        EncodingMethod, InputEncoder, PredictionHead, SlidingWindow, TimeSeriesConfig,
        TimeSeriesProcessor,
    };
    pub use crate::training::{
        HyperparameterOptimizer, OnlineLearner, RidgeConfig, RidgeRegression, RidgeSolver,
    };
}

// Re-export main types at crate root
pub use error::{QearError, QearResult};
pub use features::{ExpectationComputer, FeatureConfig, FeatureExtractor, QuantumTomography};
pub use fusion::{AttentionConfig, AttentionFusion, TemporalAttention};
pub use reservoir::{QuantumReservoir, ReservoirConfig};
pub use timeseries::{
    EncodingMethod, InputEncoder, PredictionHead, SlidingWindow, TimeSeriesConfig,
    TimeSeriesProcessor,
};
pub use training::{
    HyperparameterOptimizer, OnlineLearner, RidgeConfig, RidgeRegression, RidgeSolver,
};

/// Version information for the crate.
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Crate name.
pub const CRATE_NAME: &str = env!("CARGO_PKG_NAME");

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::{Array1, Array2};

    #[test]
    fn test_version() {
        assert!(!VERSION.is_empty());
    }

    #[test]
    fn test_crate_name() {
        assert_eq!(CRATE_NAME, "ruqu-qear");
    }

    #[test]
    fn test_end_to_end_reservoir_features() {
        // Create reservoir
        let config = ReservoirConfig::new(4).with_seed(42);
        let mut reservoir = QuantumReservoir::new(config).unwrap();

        // Generate input
        let inputs = Array2::from_shape_fn((50, 3), |(i, j)| ((i + j) as f64 / 53.0).sin());

        // Run through reservoir
        let states = reservoir.run(&inputs).unwrap();
        assert_eq!(states.nrows(), 50);

        // Extract features
        let extractor = FeatureExtractor::default_extractor();
        let features = extractor.extract(&states).unwrap();
        assert!(features.ncols() > 0);
    }

    #[test]
    fn test_end_to_end_with_attention() {
        // Create reservoir
        let reservoir_config = ReservoirConfig::new(4).with_seed(42);
        let mut reservoir = QuantumReservoir::new(reservoir_config).unwrap();

        // Create attention
        let attention_config = AttentionConfig::new(32, 4).with_seed(42);
        let mut attention = AttentionFusion::new(attention_config).unwrap();

        // Generate input
        let inputs = Array2::from_shape_fn((30, 4), |(i, j)| ((i * j) as f64 / 120.0).cos());

        // Run through reservoir
        let states = reservoir.run(&inputs).unwrap();

        // Apply attention
        let fused = attention.forward(&states, &inputs).unwrap();
        assert_eq!(fused.nrows(), 30);
    }

    #[test]
    fn test_end_to_end_training() {
        // Create simple training data
        let features = Array2::from_shape_fn((100, 16), |(i, j)| ((i + j) as f64 / 116.0).sin());
        let targets = Array2::from_shape_fn((100, 1), |(i, _)| {
            features[[i, 0]] + features[[i, 5]] + features[[i, 10]]
        });

        // Train model
        let config = RidgeConfig::new(0.1);
        let mut model = RidgeRegression::new(config).unwrap();
        model.fit(&features, &targets).unwrap();

        // Evaluate
        let score = model.score(&features, &targets).unwrap();
        assert!(score > 0.5);
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
    fn test_expectation_values() {
        let config = ReservoirConfig::new(3).with_seed(42);
        let reservoir = QuantumReservoir::new(config).unwrap();

        let computer = ExpectationComputer::new(3);
        let expectations = computer.compute(&reservoir).unwrap();

        // Probabilities should sum to 1
        let sum: f64 = expectations.sum();
        assert!((sum - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_prelude_imports() {
        use crate::prelude::*;

        let _config: ReservoirConfig = ReservoirConfig::default();
        let _att_config: AttentionConfig = AttentionConfig::default();
        let _ridge_config: RidgeConfig = RidgeConfig::default();
        let _ts_config: TimeSeriesConfig = TimeSeriesConfig::default();
    }
}
