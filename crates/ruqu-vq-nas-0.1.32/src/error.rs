//! Error types for VQ-NAS operations.
//!
//! This module provides comprehensive error handling for quantum neural
//! architecture search operations, including validation, search, and evaluation errors.

use thiserror::Error;

/// Result type alias for VQ-NAS operations.
pub type Result<T> = std::result::Result<T, VqNasError>;

/// Main error type for VQ-NAS operations.
#[derive(Error, Debug)]
pub enum VqNasError {
    /// Search space configuration error.
    #[error("Search space error: {0}")]
    SearchSpace(#[from] SearchSpaceError),

    /// Architecture encoding error.
    #[error("Encoding error: {0}")]
    Encoding(#[from] EncodingError),

    /// Search algorithm error.
    #[error("Search error: {0}")]
    Search(#[from] SearchError),

    /// Circuit evaluation error.
    #[error("Evaluation error: {0}")]
    Evaluation(#[from] EvaluationError),

    /// Circuit building error.
    #[error("Circuit error: {0}")]
    Circuit(#[from] CircuitError),

    /// Serialization/deserialization error.
    #[error("Serialization error: {0}")]
    Serialization(String),

    /// Invalid configuration.
    #[error("Invalid configuration: {0}")]
    InvalidConfiguration(String),

    /// Resource exhaustion.
    #[error("Resource exhaustion: {0}")]
    ResourceExhaustion(String),
}

/// Errors related to search space definition.
#[derive(Error, Debug, Clone, PartialEq)]
pub enum SearchSpaceError {
    /// Invalid number of qubits.
    #[error("Invalid qubit count: {0}. Must be between 1 and {1}")]
    InvalidQubitCount(usize, usize),

    /// Invalid layer depth.
    #[error("Invalid layer depth: {0}. Must be between 1 and {1}")]
    InvalidLayerDepth(usize, usize),

    /// Invalid gate specification.
    #[error("Invalid gate: {0}")]
    InvalidGate(String),

    /// Connectivity constraint violation.
    #[error("Connectivity constraint violated: qubits {0} and {1} are not connected")]
    ConnectivityViolation(usize, usize),

    /// Empty gate set.
    #[error("Gate set cannot be empty")]
    EmptyGateSet,

    /// Invalid template.
    #[error("Invalid template: {0}")]
    InvalidTemplate(String),

    /// Qubit index out of bounds.
    #[error("Qubit index {0} out of bounds for {1} qubits")]
    QubitOutOfBounds(usize, usize),
}

/// Errors related to architecture encoding.
#[derive(Error, Debug, Clone, PartialEq)]
pub enum EncodingError {
    /// Invalid architecture vector dimension.
    #[error("Invalid encoding dimension: expected {expected}, got {got}")]
    InvalidDimension { expected: usize, got: usize },

    /// Invalid discrete choice.
    #[error("Invalid choice {choice} at position {position}: must be < {max_choices}")]
    InvalidChoice {
        position: usize,
        choice: usize,
        max_choices: usize,
    },

    /// Encoding out of range.
    #[error("Encoding value {value} out of range [{min}, {max}]")]
    OutOfRange { value: f64, min: f64, max: f64 },

    /// Failed to decode architecture.
    #[error("Failed to decode architecture: {0}")]
    DecodingFailed(String),

    /// Invalid embedding dimension.
    #[error("Invalid embedding dimension: {0}")]
    InvalidEmbeddingDimension(usize),
}

/// Errors related to search algorithms.
#[derive(Error, Debug, Clone, PartialEq)]
pub enum SearchError {
    /// Search budget exhausted.
    #[error("Search budget exhausted after {0} evaluations")]
    BudgetExhausted(usize),

    /// No valid architectures found.
    #[error("No valid architectures found in search space")]
    NoValidArchitectures,

    /// Convergence failure.
    #[error("Search failed to converge after {iterations} iterations (best score: {best_score})")]
    ConvergenceFailure { iterations: usize, best_score: f64 },

    /// Invalid search configuration.
    #[error("Invalid search configuration: {0}")]
    InvalidConfiguration(String),

    /// Population too small.
    #[error("Population size {0} too small, minimum is {1}")]
    PopulationTooSmall(usize, usize),

    /// Invalid mutation rate.
    #[error("Invalid mutation rate {0}: must be in [0, 1]")]
    InvalidMutationRate(f64),

    /// Early stopping triggered.
    #[error("Early stopping triggered at iteration {iteration} (no improvement for {patience} iterations)")]
    EarlyStopping { iteration: usize, patience: usize },
}

/// Errors related to circuit evaluation.
#[derive(Error, Debug, Clone, PartialEq)]
pub enum EvaluationError {
    /// Invalid metric value.
    #[error("Invalid metric value: {metric} = {value}")]
    InvalidMetricValue { metric: String, value: f64 },

    /// Evaluation timeout.
    #[error("Evaluation timed out after {0} seconds")]
    Timeout(u64),

    /// Insufficient samples.
    #[error("Insufficient samples: got {got}, need {required}")]
    InsufficientSamples { got: usize, required: usize },

    /// Numerical instability.
    #[error("Numerical instability in {operation}: {details}")]
    NumericalInstability { operation: String, details: String },

    /// Invalid state vector.
    #[error("Invalid state vector: dimension {0} for {1} qubits (expected {2})")]
    InvalidStateVector(usize, usize, usize),

    /// Hardware cost estimation failed.
    #[error("Hardware cost estimation failed: {0}")]
    HardwareCostError(String),
}

/// Errors related to circuit building.
#[derive(Error, Debug, Clone, PartialEq)]
pub enum CircuitError {
    /// Invalid parameter value.
    #[error("Invalid parameter value at index {index}: {value}")]
    InvalidParameter { index: usize, value: f64 },

    /// Missing parameter.
    #[error("Missing parameter at index {0}")]
    MissingParameter(usize),

    /// Invalid gate application.
    #[error("Cannot apply {gate} to qubit(s) {qubits:?}")]
    InvalidGateApplication { gate: String, qubits: Vec<usize> },

    /// Circuit too deep.
    #[error("Circuit depth {depth} exceeds maximum {max_depth}")]
    CircuitTooDeep { depth: usize, max_depth: usize },

    /// Too many gates.
    #[error("Gate count {count} exceeds maximum {max_count}")]
    TooManyGates { count: usize, max_count: usize },

    /// Parameter count mismatch.
    #[error("Parameter count mismatch: circuit has {expected} parameters, got {got}")]
    ParameterCountMismatch { expected: usize, got: usize },
}

impl From<serde_json::Error> for VqNasError {
    fn from(err: serde_json::Error) -> Self {
        VqNasError::Serialization(err.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_search_space_error_display() {
        let err = SearchSpaceError::InvalidQubitCount(100, 50);
        assert!(err.to_string().contains("100"));
        assert!(err.to_string().contains("50"));
    }

    #[test]
    fn test_encoding_error_display() {
        let err = EncodingError::InvalidDimension {
            expected: 10,
            got: 5,
        };
        assert!(err.to_string().contains("10"));
        assert!(err.to_string().contains("5"));
    }

    #[test]
    fn test_search_error_display() {
        let err = SearchError::BudgetExhausted(1000);
        assert!(err.to_string().contains("1000"));
    }

    #[test]
    fn test_evaluation_error_display() {
        let err = EvaluationError::InvalidMetricValue {
            metric: "expressibility".to_string(),
            value: -0.5,
        };
        assert!(err.to_string().contains("expressibility"));
    }

    #[test]
    fn test_circuit_error_display() {
        let err = CircuitError::InvalidParameter {
            index: 5,
            value: f64::NAN,
        };
        assert!(err.to_string().contains("5"));
    }

    #[test]
    fn test_error_conversion() {
        let search_err = SearchSpaceError::EmptyGateSet;
        let vqnas_err: VqNasError = search_err.into();
        assert!(matches!(vqnas_err, VqNasError::SearchSpace(_)));
    }

    #[test]
    fn test_result_type() {
        fn example_fn() -> Result<i32> {
            Err(VqNasError::InvalidConfiguration("test".to_string()))
        }
        assert!(example_fn().is_err());
    }
}
