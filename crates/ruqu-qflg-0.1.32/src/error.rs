//! Error types for ruqu-qflg
//!
//! This module defines the error types used throughout the quantum federated
//! learning crate, including errors for gradient aggregation, Byzantine detection,
//! privacy mechanisms, and protocol operations.

use thiserror::Error;

/// Main error type for ruqu-qflg operations
#[derive(Error, Debug)]
pub enum QflgError {
    /// Error during gradient aggregation
    #[error("Aggregation error: {0}")]
    Aggregation(#[from] AggregationError),

    /// Error during Byzantine detection
    #[error("Byzantine detection error: {0}")]
    Byzantine(#[from] ByzantineError),

    /// Error during privacy operations
    #[error("Privacy error: {0}")]
    Privacy(#[from] PrivacyError),

    /// Error during protocol operations
    #[error("Protocol error: {0}")]
    Protocol(#[from] ProtocolError),

    /// Error during quantum operations
    #[error("Quantum error: {0}")]
    Quantum(#[from] QuantumError),

    /// Serialization/deserialization error
    #[error("Serialization error: {0}")]
    Serialization(String),

    /// Invalid configuration
    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),
}

/// Errors during gradient aggregation
#[derive(Error, Debug, Clone)]
pub enum AggregationError {
    /// Dimension mismatch between gradients
    #[error("Dimension mismatch: expected {expected}, got {actual}")]
    DimensionMismatch { expected: usize, actual: usize },

    /// Empty gradient set
    #[error("No gradients provided for aggregation")]
    EmptyGradients,

    /// Invalid weight
    #[error("Invalid weight: {0} (must be non-negative)")]
    InvalidWeight(f64),

    /// Weights do not sum to 1.0
    #[error("Weights do not sum to 1.0: sum = {0}")]
    WeightNormalization(f64),

    /// Insufficient gradients for robust aggregation
    #[error("Insufficient gradients: need at least {required}, got {actual}")]
    InsufficientGradients { required: usize, actual: usize },

    /// Numeric overflow during aggregation
    #[error("Numeric overflow during aggregation")]
    NumericOverflow,
}

/// Errors during Byzantine detection
#[derive(Error, Debug, Clone)]
pub enum ByzantineError {
    /// Too many Byzantine clients detected
    #[error("Too many Byzantine clients: {detected} > {threshold}")]
    TooManyByzantine { detected: usize, threshold: usize },

    /// Invalid Byzantine tolerance parameter
    #[error("Invalid Byzantine tolerance: {0} (must be in (0, 0.5))")]
    InvalidTolerance(f64),

    /// Insufficient clients for Byzantine-tolerant aggregation
    #[error("Insufficient clients for Byzantine tolerance: need {required}, have {actual}")]
    InsufficientClients { required: usize, actual: usize },

    /// Detection algorithm failure
    #[error("Detection algorithm failed: {0}")]
    DetectionFailed(String),

    /// Score computation error
    #[error("Score computation error: {0}")]
    ScoreError(String),
}

/// Errors during privacy operations
#[derive(Error, Debug, Clone)]
pub enum PrivacyError {
    /// Privacy budget exceeded
    #[error("Privacy budget exceeded: epsilon {current} > {max}")]
    BudgetExceeded { current: f64, max: f64 },

    /// Invalid epsilon value
    #[error("Invalid epsilon: {0} (must be positive)")]
    InvalidEpsilon(f64),

    /// Invalid delta value
    #[error("Invalid delta: {0} (must be in (0, 1))")]
    InvalidDelta(f64),

    /// Invalid sensitivity
    #[error("Invalid sensitivity: {0} (must be positive)")]
    InvalidSensitivity(f64),

    /// Noise generation failed
    #[error("Noise generation failed: {0}")]
    NoiseGenerationFailed(String),

    /// Clipping threshold invalid
    #[error("Invalid clipping threshold: {0} (must be positive)")]
    InvalidClippingThreshold(f64),
}

/// Errors during protocol operations
#[derive(Error, Debug, Clone)]
pub enum ProtocolError {
    /// Client not registered
    #[error("Client not registered: {0}")]
    ClientNotRegistered(String),

    /// Duplicate client registration
    #[error("Client already registered: {0}")]
    DuplicateClient(String),

    /// Round not started
    #[error("No active round")]
    NoActiveRound,

    /// Round already in progress
    #[error("Round {0} already in progress")]
    RoundInProgress(u64),

    /// Invalid round state transition
    #[error("Invalid state transition from {from} to {to}")]
    InvalidStateTransition { from: String, to: String },

    /// Timeout during round
    #[error("Round {round} timed out after {duration_ms}ms")]
    RoundTimeout { round: u64, duration_ms: u64 },

    /// Signature verification failed
    #[error("Signature verification failed for client {0}")]
    SignatureVerificationFailed(String),

    /// Key exchange failed
    #[error("Key exchange failed: {0}")]
    KeyExchangeFailed(String),

    /// Model synchronization failed
    #[error("Model synchronization failed: {0}")]
    SyncFailed(String),
}

/// Errors during quantum operations
#[derive(Error, Debug, Clone)]
pub enum QuantumError {
    /// Invalid quantum state
    #[error("Invalid quantum state: {0}")]
    InvalidState(String),

    /// Entanglement verification failed
    #[error("Entanglement verification failed: fidelity {fidelity} < threshold {threshold}")]
    EntanglementFailed { fidelity: f64, threshold: f64 },

    /// Quantum random number generation failed
    #[error("QRNG failed: {0}")]
    QrngFailed(String),

    /// Post-quantum signature error
    #[error("Post-quantum signature error: {0}")]
    PqSignatureError(String),

    /// Coherence loss
    #[error("Coherence lost: {0}")]
    CoherenceLost(String),
}

/// Result type alias for ruqu-qflg operations
pub type Result<T> = std::result::Result<T, QflgError>;

impl From<serde_json::Error> for QflgError {
    fn from(err: serde_json::Error) -> Self {
        QflgError::Serialization(err.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_display() {
        let err = QflgError::Aggregation(AggregationError::DimensionMismatch {
            expected: 100,
            actual: 50,
        });
        assert!(err.to_string().contains("Dimension mismatch"));

        let err = QflgError::Byzantine(ByzantineError::TooManyByzantine {
            detected: 5,
            threshold: 3,
        });
        assert!(err.to_string().contains("Too many Byzantine"));

        let err = QflgError::Privacy(PrivacyError::BudgetExceeded {
            current: 2.0,
            max: 1.0,
        });
        assert!(err.to_string().contains("Privacy budget exceeded"));
    }

    #[test]
    fn test_error_from_serde() {
        let json_err = serde_json::from_str::<i32>("invalid").unwrap_err();
        let qflg_err: QflgError = json_err.into();
        assert!(matches!(qflg_err, QflgError::Serialization(_)));
    }

    #[test]
    fn test_aggregation_errors() {
        let err = AggregationError::EmptyGradients;
        assert_eq!(err.to_string(), "No gradients provided for aggregation");

        let err = AggregationError::InvalidWeight(-0.5);
        assert!(err.to_string().contains("-0.5"));
    }

    #[test]
    fn test_byzantine_errors() {
        let err = ByzantineError::InvalidTolerance(0.6);
        assert!(err.to_string().contains("0.6"));

        let err = ByzantineError::InsufficientClients {
            required: 10,
            actual: 5,
        };
        assert!(err.to_string().contains("need 10"));
    }

    #[test]
    fn test_privacy_errors() {
        let err = PrivacyError::InvalidEpsilon(-1.0);
        assert!(err.to_string().contains("positive"));

        let err = PrivacyError::InvalidDelta(1.5);
        assert!(err.to_string().contains("(0, 1)"));
    }

    #[test]
    fn test_protocol_errors() {
        let err = ProtocolError::ClientNotRegistered("client_123".to_string());
        assert!(err.to_string().contains("client_123"));

        let err = ProtocolError::RoundTimeout {
            round: 5,
            duration_ms: 30000,
        };
        assert!(err.to_string().contains("Round 5"));
    }

    #[test]
    fn test_quantum_errors() {
        let err = QuantumError::EntanglementFailed {
            fidelity: 0.85,
            threshold: 0.95,
        };
        assert!(err.to_string().contains("fidelity 0.85"));
    }
}
