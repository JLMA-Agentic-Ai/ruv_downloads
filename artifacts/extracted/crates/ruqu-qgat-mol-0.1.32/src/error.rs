//! Error types for the ruqu-qgat-mol crate.
//!
//! This module defines all error types used throughout the quantum graph attention
//! molecular simulation library.

use thiserror::Error;

/// Result type alias for ruqu-qgat-mol operations.
pub type Result<T> = std::result::Result<T, QgatMolError>;

/// Main error type for ruqu-qgat-mol operations.
#[derive(Error, Debug, Clone)]
pub enum QgatMolError {
    /// Error related to molecular graph construction or manipulation.
    #[error("Graph error: {0}")]
    Graph(#[from] GraphError),

    /// Error related to orbital encoding.
    #[error("Orbital error: {0}")]
    Orbital(#[from] OrbitalError),

    /// Error related to attention computation.
    #[error("Attention error: {0}")]
    Attention(#[from] AttentionError),

    /// Error related to property prediction.
    #[error("Prediction error: {0}")]
    Prediction(#[from] PredictionError),

    /// Error related to serialization/deserialization.
    #[error("Serialization error: {0}")]
    Serialization(String),

    /// Error related to numerical computation.
    #[error("Numerical error: {0}")]
    Numerical(String),

    /// Error related to dimension mismatch.
    #[error("Dimension mismatch: expected {expected}, got {actual}")]
    DimensionMismatch {
        /// Expected dimension.
        expected: usize,
        /// Actual dimension.
        actual: usize,
    },
}

/// Error type for molecular graph operations.
#[derive(Error, Debug, Clone)]
pub enum GraphError {
    /// Atom not found in the graph.
    #[error("Atom not found: {0}")]
    AtomNotFound(String),

    /// Bond not found in the graph.
    #[error("Bond not found between atoms {0} and {1}")]
    BondNotFound(usize, usize),

    /// Invalid atom type.
    #[error("Invalid atom type: {0}")]
    InvalidAtomType(String),

    /// Invalid bond type.
    #[error("Invalid bond type: {0}")]
    InvalidBondType(String),

    /// Invalid molecular structure.
    #[error("Invalid molecular structure: {0}")]
    InvalidStructure(String),

    /// Empty molecule.
    #[error("Empty molecule: no atoms defined")]
    EmptyMolecule,

    /// Self-loop detected (bond from atom to itself).
    #[error("Self-loop detected at atom index {0}")]
    SelfLoop(usize),

    /// Duplicate bond detected.
    #[error("Duplicate bond between atoms {0} and {1}")]
    DuplicateBond(usize, usize),
}

/// Error type for orbital encoding operations.
#[derive(Error, Debug, Clone)]
pub enum OrbitalError {
    /// Invalid orbital type.
    #[error("Invalid orbital type: {0}")]
    InvalidOrbital(String),

    /// Invalid principal quantum number.
    #[error("Invalid principal quantum number: {0}")]
    InvalidPrincipalQuantumNumber(i32),

    /// Invalid angular momentum quantum number.
    #[error("Invalid angular momentum quantum number: l={0} for n={1}")]
    InvalidAngularMomentum(i32, i32),

    /// Invalid magnetic quantum number.
    #[error("Invalid magnetic quantum number: m={0} for l={1}")]
    InvalidMagneticQuantumNumber(i32, i32),

    /// Unsupported element.
    #[error("Unsupported element: atomic number {0}")]
    UnsupportedElement(u8),

    /// Encoding dimension mismatch.
    #[error("Encoding dimension mismatch: expected {expected}, got {actual}")]
    EncodingDimensionMismatch {
        /// Expected dimension.
        expected: usize,
        /// Actual dimension.
        actual: usize,
    },
}

/// Error type for attention operations.
#[derive(Error, Debug, Clone)]
pub enum AttentionError {
    /// Invalid attention dimension.
    #[error("Invalid attention dimension: {0}")]
    InvalidDimension(usize),

    /// Invalid number of heads.
    #[error("Invalid number of heads: {num_heads} does not divide dimension {dim}")]
    InvalidHeads {
        /// Number of heads.
        num_heads: usize,
        /// Total dimension.
        dim: usize,
    },

    /// Shape mismatch in tensors.
    #[error("Shape mismatch: {0}")]
    ShapeMismatch(String),

    /// Numerical instability detected.
    #[error("Numerical instability: {0}")]
    NumericalInstability(String),

    /// Empty input.
    #[error("Empty input: {0}")]
    EmptyInput(String),

    /// Invalid attention mask.
    #[error("Invalid attention mask: {0}")]
    InvalidMask(String),
}

/// Error type for property prediction operations.
#[derive(Error, Debug, Clone)]
pub enum PredictionError {
    /// Model not trained.
    #[error("Model not trained")]
    ModelNotTrained,

    /// Invalid feature dimension.
    #[error("Invalid feature dimension: expected {expected}, got {actual}")]
    InvalidFeatureDimension {
        /// Expected dimension.
        expected: usize,
        /// Actual dimension.
        actual: usize,
    },

    /// Prediction out of range.
    #[error("Prediction out of valid range: {value} (expected {min} to {max})")]
    OutOfRange {
        /// Predicted value.
        value: f64,
        /// Minimum valid value.
        min: f64,
        /// Maximum valid value.
        max: f64,
    },

    /// Missing required features.
    #[error("Missing required features: {0}")]
    MissingFeatures(String),

    /// Invalid property type.
    #[error("Invalid property type: {0}")]
    InvalidPropertyType(String),
}

impl QgatMolError {
    /// Creates a new serialization error.
    pub fn serialization<S: Into<String>>(msg: S) -> Self {
        QgatMolError::Serialization(msg.into())
    }

    /// Creates a new numerical error.
    pub fn numerical<S: Into<String>>(msg: S) -> Self {
        QgatMolError::Numerical(msg.into())
    }

    /// Creates a dimension mismatch error.
    pub fn dimension_mismatch(expected: usize, actual: usize) -> Self {
        QgatMolError::DimensionMismatch { expected, actual }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_graph_error_display() {
        let err = GraphError::AtomNotFound("H1".to_string());
        assert!(err.to_string().contains("Atom not found"));
    }

    #[test]
    fn test_orbital_error_display() {
        let err = OrbitalError::InvalidOrbital("xyz".to_string());
        assert!(err.to_string().contains("Invalid orbital type"));
    }

    #[test]
    fn test_attention_error_display() {
        let err = AttentionError::InvalidDimension(0);
        assert!(err.to_string().contains("Invalid attention dimension"));
    }

    #[test]
    fn test_prediction_error_display() {
        let err = PredictionError::ModelNotTrained;
        assert!(err.to_string().contains("Model not trained"));
    }

    #[test]
    fn test_error_conversion() {
        let graph_err = GraphError::EmptyMolecule;
        let main_err: QgatMolError = graph_err.into();
        assert!(matches!(main_err, QgatMolError::Graph(_)));
    }

    #[test]
    fn test_dimension_mismatch_error() {
        let err = QgatMolError::dimension_mismatch(64, 32);
        assert!(err.to_string().contains("expected 64, got 32"));
    }
}
