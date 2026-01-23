//! Error types for the ruqu-qear crate.
//!
//! This module defines all error types used throughout the Quantum Echo-Attention
//! Reservoir (QEAR) implementation.

use thiserror::Error;

/// Main error type for QEAR operations.
#[derive(Error, Debug)]
pub enum QearError {
    /// Error during reservoir initialization.
    #[error("Reservoir initialization error: {0}")]
    ReservoirInit(String),

    /// Error during reservoir state evolution.
    #[error("Reservoir evolution error: {0}")]
    ReservoirEvolution(String),

    /// Error in quantum state operations.
    #[error("Quantum state error: {0}")]
    QuantumState(String),

    /// Error during attention computation.
    #[error("Attention computation error: {0}")]
    AttentionComputation(String),

    /// Error during feature extraction.
    #[error("Feature extraction error: {0}")]
    FeatureExtraction(String),

    /// Error in time series processing.
    #[error("Time series error: {0}")]
    TimeSeries(String),

    /// Error during training.
    #[error("Training error: {0}")]
    Training(String),

    /// Dimension mismatch error.
    #[error("Dimension mismatch: expected {expected}, got {got}")]
    DimensionMismatch {
        /// Expected dimension.
        expected: usize,
        /// Actual dimension received.
        got: usize,
    },

    /// Invalid parameter error.
    #[error("Invalid parameter '{name}': {reason}")]
    InvalidParameter {
        /// Parameter name.
        name: String,
        /// Reason for invalidity.
        reason: String,
    },

    /// Numerical instability error.
    #[error("Numerical instability: {0}")]
    NumericalInstability(String),

    /// Insufficient data error.
    #[error("Insufficient data: need at least {needed}, got {got}")]
    InsufficientData {
        /// Minimum amount of data needed.
        needed: usize,
        /// Actual amount of data received.
        got: usize,
    },

    /// Not trained error.
    #[error("Model not trained: {0}")]
    NotTrained(String),

    /// Serialization error.
    #[error("Serialization error: {0}")]
    Serialization(String),
}

/// Result type alias for QEAR operations.
pub type QearResult<T> = Result<T, QearError>;

impl QearError {
    /// Create a new reservoir initialization error.
    pub fn reservoir_init(msg: impl Into<String>) -> Self {
        QearError::ReservoirInit(msg.into())
    }

    /// Create a new reservoir evolution error.
    pub fn reservoir_evolution(msg: impl Into<String>) -> Self {
        QearError::ReservoirEvolution(msg.into())
    }

    /// Create a new quantum state error.
    pub fn quantum_state(msg: impl Into<String>) -> Self {
        QearError::QuantumState(msg.into())
    }

    /// Create a new attention computation error.
    pub fn attention_computation(msg: impl Into<String>) -> Self {
        QearError::AttentionComputation(msg.into())
    }

    /// Create a new feature extraction error.
    pub fn feature_extraction(msg: impl Into<String>) -> Self {
        QearError::FeatureExtraction(msg.into())
    }

    /// Create a new time series error.
    pub fn time_series(msg: impl Into<String>) -> Self {
        QearError::TimeSeries(msg.into())
    }

    /// Create a new training error.
    pub fn training(msg: impl Into<String>) -> Self {
        QearError::Training(msg.into())
    }

    /// Create a new dimension mismatch error.
    pub fn dimension_mismatch(expected: usize, got: usize) -> Self {
        QearError::DimensionMismatch { expected, got }
    }

    /// Create a new invalid parameter error.
    pub fn invalid_parameter(name: impl Into<String>, reason: impl Into<String>) -> Self {
        QearError::InvalidParameter {
            name: name.into(),
            reason: reason.into(),
        }
    }

    /// Create a new numerical instability error.
    pub fn numerical_instability(msg: impl Into<String>) -> Self {
        QearError::NumericalInstability(msg.into())
    }

    /// Create a new insufficient data error.
    pub fn insufficient_data(needed: usize, got: usize) -> Self {
        QearError::InsufficientData { needed, got }
    }

    /// Create a new not trained error.
    pub fn not_trained(msg: impl Into<String>) -> Self {
        QearError::NotTrained(msg.into())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_display() {
        let err = QearError::reservoir_init("test error");
        assert!(err.to_string().contains("test error"));
    }

    #[test]
    fn test_dimension_mismatch() {
        let err = QearError::dimension_mismatch(10, 5);
        assert!(err.to_string().contains("expected 10"));
        assert!(err.to_string().contains("got 5"));
    }

    #[test]
    fn test_invalid_parameter() {
        let err = QearError::invalid_parameter("spectral_radius", "must be positive");
        assert!(err.to_string().contains("spectral_radius"));
        assert!(err.to_string().contains("must be positive"));
    }
}
