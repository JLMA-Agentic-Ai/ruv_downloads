//! # ruqu-qflg - Quantum Federated Learning with Byzantine Tolerance
//!
//! A privacy-preserving distributed quantum machine learning framework that combines:
//!
//! - **Federated Learning**: Distributed training without sharing raw data
//! - **Byzantine Tolerance**: Robust aggregation against malicious participants
//! - **Differential Privacy**: Formal privacy guarantees for gradient updates
//! - **Quantum Enhancement**: Quantum-inspired features for security and randomness
//!
//! ## Architecture
//!
//! ```text
//! ┌─────────────────────────────────────────────────────────────────┐
//! │                    Federated Coordinator                         │
//! │  (Round management, model synchronization, aggregation)         │
//! └───────────────────────────┬─────────────────────────────────────┘
//!                             │
//!     ┌───────────────────────┼───────────────────────┐
//!     ▼                       ▼                       ▼
//! ┌─────────┐           ┌───────────┐           ┌───────────┐
//! │Byzantine│           │  Privacy  │           │  Quantum  │
//! │Detection│           │ Mechanism │           │Enhancement│
//! └─────────┘           └───────────┘           └───────────┘
//! Krum/Median           Gaussian/DP              QRNG/PQ-Sig
//! Bulyan/Trim           Budget Track             Bell Pairs
//! ```
//!
//! ## Quick Start
//!
//! ```rust
//! use ruqu_qflg::prelude::*;
//! use ndarray::Array1;
//!
//! // Create coordinator
//! let config = CoordinatorConfig::default();
//! let coordinator = FederatedCoordinator::new(config);
//!
//! // Register clients
//! let client = ClientInfo::new("client_1".to_string(), vec![0u8; 32]);
//! coordinator.register_client(client).unwrap();
//!
//! // Byzantine detection on gradients (need 2f+3 clients for Krum)
//! let detector_config = DetectorConfig::new(3, 0.2);
//! let detector = KrumDetector::new(detector_config);
//!
//! let gradients = vec![
//!     Array1::from_vec(vec![1.0, 1.0]),
//!     Array1::from_vec(vec![1.1, 0.9]),
//!     Array1::from_vec(vec![0.9, 1.1]),
//!     Array1::from_vec(vec![1.0, 1.0]),
//!     Array1::from_vec(vec![1.0, 1.0]),
//!     Array1::from_vec(vec![100.0, -100.0]), // Byzantine!
//! ];
//!
//! let (honest, byzantine) = detector.detect(&gradients).unwrap();
//! assert!(byzantine.len() >= 1);
//! ```
//!
//! ## Tier 2 Capability (Score 83)
//!
//! This crate enables privacy-preserving distributed quantum machine learning as
//! a Tier 2 capability in the RuVector ecosystem. Key features:
//!
//! - **Two-Week Test**: Gradient aggregation compiles, Byzantine detection works
//! - **Integration**: Works with ruQu and other quantum components
//! - **Performance**: Designed for high-throughput federated scenarios
//!
//! ## Feature Flags
//!
//! - `simd` - SIMD acceleration for gradient operations
//! - `wasm` - WASM-compatible mode
//! - `parallel` - Multi-threaded aggregation
//! - `tracing` - Observability and metrics
//! - `full` - All features enabled (default)
//!
//! ## Modules
//!
//! - [`aggregation`] - Gradient aggregation algorithms (FedAvg, Secure, Momentum)
//! - [`byzantine`] - Byzantine detection (Krum, Multi-Krum, Trimmed Mean, Median)
//! - [`privacy`] - Differential privacy (Gaussian, Laplace, Budget tracking)
//! - [`protocol`] - Federated protocol (Registration, Rounds, Sync)
//! - [`quantum`] - Quantum features (QRNG, PQ signatures, Bell pairs)
//! - [`error`] - Error types

#![warn(missing_docs)]
#![warn(clippy::all)]
#![warn(clippy::pedantic)]
#![allow(clippy::module_name_repetitions)]
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::missing_panics_doc)]
#![allow(clippy::cast_possible_truncation)]
#![allow(clippy::cast_sign_loss)]
#![allow(clippy::cast_precision_loss)]

// Core modules
pub mod aggregation;
pub mod byzantine;
pub mod error;
pub mod privacy;
pub mod protocol;
pub mod quantum;

// Re-exports for convenient access
pub use error::{
    AggregationError, ByzantineError, PrivacyError, ProtocolError, QflgError, QuantumError, Result,
};

pub use aggregation::{
    AggregationStats, AggregatorConfig, GradientAggregator, MomentumAggregator, SecureAggregator,
    WeightedAverageAggregator, gradient_norm, gradient_similarity, pairwise_distances,
};

pub use byzantine::{
    BulyanDetector, ByzantineDetector, ByzantineStats, DetectionResult, DetectorConfig,
    KrumDetector, MedianDetector, MultiKrumDetector, TrimmedMeanDetector,
};

pub use privacy::{
    AdaptiveClipper, GaussianMechanism, GradientClipper, LaplaceMechanism, MomentsAccountant,
    PrivacyBudget, PrivacyConfig, PrivacyLoss, PrivacyMechanism, PrivacyStats,
};

pub use protocol::{
    ClientConfig, ClientInfo, CoordinatorConfig, FederatedClient, FederatedCoordinator,
    GradientSubmission, ProtocolStats, RoundInfo, RoundState,
};

pub use quantum::{
    BellPair, CoherenceMonitor, PostQuantumSignature, QKDSimulator, QuantumRng, QuantumState,
};

/// Crate version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Crate name
pub const NAME: &str = env!("CARGO_PKG_NAME");

/// Default Byzantine tolerance fraction
pub const DEFAULT_BYZANTINE_FRACTION: f64 = 0.3;

/// Default privacy epsilon
pub const DEFAULT_PRIVACY_EPSILON: f64 = 1.0;

/// Default privacy delta
pub const DEFAULT_PRIVACY_DELTA: f64 = 1e-5;

/// Prelude module for convenient imports
pub mod prelude {
    //! Commonly used types for quantum federated learning.
    //!
    //! ```rust
    //! use ruqu_qflg::prelude::*;
    //! ```

    // Error types
    pub use crate::error::{QflgError, Result};

    // Aggregation
    pub use crate::aggregation::{
        AggregatorConfig, GradientAggregator, WeightedAverageAggregator,
        SecureAggregator, MomentumAggregator, AggregationStats,
    };

    // Byzantine detection
    pub use crate::byzantine::{
        DetectorConfig, ByzantineDetector, KrumDetector, MultiKrumDetector,
        TrimmedMeanDetector, MedianDetector, BulyanDetector,
        DetectionResult, ByzantineStats,
    };

    // Privacy
    pub use crate::privacy::{
        PrivacyConfig, PrivacyMechanism, GaussianMechanism, LaplaceMechanism,
        PrivacyBudget, GradientClipper, AdaptiveClipper, MomentsAccountant,
    };

    // Protocol
    pub use crate::protocol::{
        CoordinatorConfig, FederatedCoordinator, ClientConfig, FederatedClient,
        ClientInfo, RoundInfo, RoundState, GradientSubmission, ProtocolStats,
    };

    // Quantum
    pub use crate::quantum::{
        QuantumRng, QuantumState, BellPair, PostQuantumSignature,
        QKDSimulator, CoherenceMonitor,
    };

    // Constants
    pub use crate::{
        DEFAULT_BYZANTINE_FRACTION, DEFAULT_PRIVACY_EPSILON, DEFAULT_PRIVACY_DELTA,
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version_constant() {
        assert!(!VERSION.is_empty());
        assert!(!NAME.is_empty());
        assert_eq!(NAME, "ruqu-qflg");
    }

    #[test]
    fn test_constants() {
        assert!((DEFAULT_BYZANTINE_FRACTION - 0.3).abs() < 1e-10);
        assert!((DEFAULT_PRIVACY_EPSILON - 1.0).abs() < 1e-10);
        assert!((DEFAULT_PRIVACY_DELTA - 1e-5).abs() < 1e-15);
    }

    #[test]
    fn test_prelude_imports() {
        use crate::prelude::*;

        // Verify all prelude types are accessible
        let _config = AggregatorConfig::default();
        let _detector_config = DetectorConfig::default();
        let _privacy_config = PrivacyConfig::default();
        let _coord_config = CoordinatorConfig::default();
        let _qrng = QuantumRng::new();
    }

    #[test]
    fn test_integration_workflow() {
        use ndarray::Array1;

        // 1. Create detector
        let detector_config = DetectorConfig::new(3, 0.3);
        let detector = KrumDetector::new(detector_config);

        // 2. Create aggregator
        let agg_config = AggregatorConfig::default();
        let aggregator = WeightedAverageAggregator::new(agg_config);

        // 3. Create privacy mechanism
        let privacy_config = PrivacyConfig::new(1.0, 1e-5, 1.0);
        let mechanism = GaussianMechanism::new(privacy_config).unwrap();

        // 4. Simulate gradients
        let gradients = vec![
            Array1::from_vec(vec![1.0, 1.0, 1.0]),
            Array1::from_vec(vec![1.1, 0.9, 1.0]),
            Array1::from_vec(vec![0.9, 1.1, 1.0]),
            Array1::from_vec(vec![1.0, 1.0, 1.1]),
            Array1::from_vec(vec![100.0, -100.0, 50.0]), // Byzantine
        ];

        // 5. Detect Byzantine
        let (honest_indices, byzantine_indices) = detector.detect(&gradients).unwrap();
        assert!(!byzantine_indices.is_empty());

        // 6. Filter to honest gradients
        let honest_gradients: Vec<_> = honest_indices
            .iter()
            .map(|&i| gradients[i].clone())
            .collect();
        let weights: Vec<f64> = honest_gradients.iter().map(|_| 1.0).collect();

        // 7. Aggregate
        let aggregate = aggregator.aggregate(&honest_gradients, &weights).unwrap();

        // 8. Apply privacy
        let private_aggregate = mechanism.apply(&aggregate).unwrap();

        // Verify result
        assert_eq!(private_aggregate.len(), 3);
    }
}
