//! Error types for the QARLP (Quantum-Assisted Reinforcement Learning Policy) crate.
//!
//! This module provides comprehensive error handling for quantum RL operations,
//! including policy network errors, environment interface errors, gradient
//! computation errors, and training errors.

use thiserror::Error;

/// Main error type for the QARLP crate.
#[derive(Error, Debug)]
pub enum QarlpError {
    /// Error related to quantum policy network operations.
    #[error("Policy error: {0}")]
    Policy(#[from] PolicyError),

    /// Error related to environment interface.
    #[error("Environment error: {0}")]
    Environment(#[from] EnvironmentError),

    /// Error related to gradient computation.
    #[error("Gradient error: {0}")]
    Gradient(#[from] GradientError),

    /// Error related to replay buffer operations.
    #[error("Buffer error: {0}")]
    Buffer(#[from] BufferError),

    /// Error related to training loop.
    #[error("Training error: {0}")]
    Training(#[from] TrainingError),

    /// Serialization/deserialization error.
    #[error("Serialization error: {0}")]
    Serialization(String),

    /// I/O error.
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
}

/// Errors related to quantum policy network operations.
#[derive(Error, Debug, Clone, PartialEq)]
pub enum PolicyError {
    /// Invalid number of qubits specified.
    #[error("Invalid qubit count: expected at least {min}, got {actual}")]
    InvalidQubitCount { min: usize, actual: usize },

    /// Invalid number of layers in the variational circuit.
    #[error("Invalid layer count: expected at least {min}, got {actual}")]
    InvalidLayerCount { min: usize, actual: usize },

    /// Invalid number of actions.
    #[error("Invalid action count: expected at least {min}, got {actual}")]
    InvalidActionCount { min: usize, actual: usize },

    /// State dimension mismatch.
    #[error("State dimension mismatch: expected {expected}, got {actual}")]
    StateDimensionMismatch { expected: usize, actual: usize },

    /// Parameter count mismatch.
    #[error("Parameter count mismatch: expected {expected}, got {actual}")]
    ParameterCountMismatch { expected: usize, actual: usize },

    /// Invalid probability distribution (doesn't sum to 1).
    #[error("Invalid probability distribution: sum is {sum}, expected 1.0")]
    InvalidProbabilityDistribution { sum: f64 },

    /// Numerical instability in computation.
    #[error("Numerical instability: {0}")]
    NumericalInstability(String),

    /// Invalid circuit parameter.
    #[error("Invalid circuit parameter: {0}")]
    InvalidParameter(String),
}

/// Errors related to environment interface.
#[derive(Error, Debug, Clone, PartialEq)]
pub enum EnvironmentError {
    /// Invalid action for the environment.
    #[error("Invalid action: {action} not in range [0, {max_action})")]
    InvalidAction { action: usize, max_action: usize },

    /// Environment not initialized.
    #[error("Environment not initialized")]
    NotInitialized,

    /// Environment already terminated.
    #[error("Environment already terminated, call reset()")]
    AlreadyTerminated,

    /// State encoding error.
    #[error("State encoding error: {0}")]
    StateEncodingError(String),

    /// Invalid environment configuration.
    #[error("Invalid configuration: {0}")]
    InvalidConfiguration(String),

    /// Environment bounds exceeded.
    #[error("Environment bounds exceeded: {0}")]
    BoundsExceeded(String),
}

/// Errors related to gradient computation.
#[derive(Error, Debug, Clone, PartialEq)]
pub enum GradientError {
    /// Invalid shift value for parameter-shift rule.
    #[error("Invalid shift value: {0}, must be non-zero")]
    InvalidShift(f64),

    /// Gradient computation failed.
    #[error("Gradient computation failed: {0}")]
    ComputationFailed(String),

    /// Invalid learning rate.
    #[error("Invalid learning rate: {0}, must be positive")]
    InvalidLearningRate(f64),

    /// Gradient clipping threshold invalid.
    #[error("Invalid gradient clip threshold: {0}, must be positive")]
    InvalidClipThreshold(f64),

    /// Baseline computation error.
    #[error("Baseline computation error: {0}")]
    BaselineError(String),

    /// Empty trajectory for gradient computation.
    #[error("Empty trajectory: cannot compute gradients")]
    EmptyTrajectory,
}

/// Errors related to replay buffer operations.
#[derive(Error, Debug, Clone, PartialEq)]
pub enum BufferError {
    /// Buffer is empty when sampling is requested.
    #[error("Buffer is empty")]
    Empty,

    /// Requested batch size exceeds buffer size.
    #[error("Requested batch size {requested} exceeds buffer size {available}")]
    InsufficientSamples { requested: usize, available: usize },

    /// Invalid priority value.
    #[error("Invalid priority: {0}, must be non-negative")]
    InvalidPriority(f64),

    /// Invalid buffer capacity.
    #[error("Invalid buffer capacity: {0}, must be positive")]
    InvalidCapacity(usize),

    /// Index out of bounds.
    #[error("Index {index} out of bounds for buffer of size {size}")]
    IndexOutOfBounds { index: usize, size: usize },

    /// Invalid alpha parameter for prioritized replay.
    #[error("Invalid alpha: {0}, must be in [0, 1]")]
    InvalidAlpha(f64),
}

/// Errors related to training loop.
#[derive(Error, Debug, Clone, PartialEq)]
pub enum TrainingError {
    /// Invalid number of episodes.
    #[error("Invalid episode count: {0}, must be positive")]
    InvalidEpisodeCount(usize),

    /// Invalid maximum steps per episode.
    #[error("Invalid max steps: {0}, must be positive")]
    InvalidMaxSteps(usize),

    /// Training diverged (loss became NaN or Inf).
    #[error("Training diverged: {0}")]
    Diverged(String),

    /// Checkpoint save/load error.
    #[error("Checkpoint error: {0}")]
    CheckpointError(String),

    /// Invalid discount factor (gamma).
    #[error("Invalid discount factor: {0}, must be in (0, 1]")]
    InvalidDiscountFactor(f64),

    /// Training interrupted.
    #[error("Training interrupted: {0}")]
    Interrupted(String),

    /// Metric computation error.
    #[error("Metric error: {0}")]
    MetricError(String),
}

/// Result type alias for QARLP operations.
pub type Result<T> = std::result::Result<T, QarlpError>;

/// Result type alias for policy operations.
pub type PolicyResult<T> = std::result::Result<T, PolicyError>;

/// Result type alias for environment operations.
pub type EnvResult<T> = std::result::Result<T, EnvironmentError>;

/// Result type alias for gradient operations.
pub type GradientResult<T> = std::result::Result<T, GradientError>;

/// Result type alias for buffer operations.
pub type BufferResult<T> = std::result::Result<T, BufferError>;

/// Result type alias for training operations.
pub type TrainingResult<T> = std::result::Result<T, TrainingError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_policy_error_display() {
        let err = PolicyError::InvalidQubitCount { min: 2, actual: 1 };
        assert_eq!(
            err.to_string(),
            "Invalid qubit count: expected at least 2, got 1"
        );
    }

    #[test]
    fn test_environment_error_display() {
        let err = EnvironmentError::InvalidAction {
            action: 5,
            max_action: 4,
        };
        assert_eq!(err.to_string(), "Invalid action: 5 not in range [0, 4)");
    }

    #[test]
    fn test_gradient_error_display() {
        let err = GradientError::InvalidLearningRate(-0.1);
        assert_eq!(
            err.to_string(),
            "Invalid learning rate: -0.1, must be positive"
        );
    }

    #[test]
    fn test_buffer_error_display() {
        let err = BufferError::InsufficientSamples {
            requested: 100,
            available: 50,
        };
        assert_eq!(
            err.to_string(),
            "Requested batch size 100 exceeds buffer size 50"
        );
    }

    #[test]
    fn test_training_error_display() {
        let err = TrainingError::InvalidDiscountFactor(1.5);
        assert_eq!(
            err.to_string(),
            "Invalid discount factor: 1.5, must be in (0, 1]"
        );
    }

    #[test]
    fn test_qarlp_error_from_policy() {
        let policy_err = PolicyError::InvalidQubitCount { min: 2, actual: 1 };
        let qarlp_err: QarlpError = policy_err.into();
        assert!(matches!(qarlp_err, QarlpError::Policy(_)));
    }

    #[test]
    fn test_qarlp_error_from_environment() {
        let env_err = EnvironmentError::NotInitialized;
        let qarlp_err: QarlpError = env_err.into();
        assert!(matches!(qarlp_err, QarlpError::Environment(_)));
    }

    #[test]
    fn test_error_equality() {
        let err1 = PolicyError::InvalidQubitCount { min: 2, actual: 1 };
        let err2 = PolicyError::InvalidQubitCount { min: 2, actual: 1 };
        let err3 = PolicyError::InvalidQubitCount { min: 3, actual: 1 };
        assert_eq!(err1, err2);
        assert_ne!(err1, err3);
    }
}
