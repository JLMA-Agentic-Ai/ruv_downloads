//! # ruqu-vq-nas - Variational Quantum Neural Architecture Search
//!
//! This crate provides tools for automated quantum circuit architecture discovery
//! using neural architecture search techniques. It enables finding optimal
//! variational quantum circuit designs for quantum machine learning tasks.
//!
//! ## Features
//!
//! - **Search Space Definition**: Define quantum gate primitives, layer templates,
//!   and connectivity constraints for circuit architectures.
//!
//! - **Architecture Encoding**: Encode architectures as discrete choices, continuous
//!   relaxations, or embedding vectors for different search strategies.
//!
//! - **Search Algorithms**:
//!   - Random search (baseline)
//!   - Evolutionary search with mutation and crossover
//!   - Regularized evolution (aging-based)
//!   - Bayesian optimization interface
//!   - Differentiable architecture search
//!
//! - **Evaluation Metrics**:
//!   - Circuit expressibility (KL divergence from Haar random)
//!   - Entanglement capability (Meyer-Wallach measure proxy)
//!   - Training convergence proxy
//!   - Hardware cost estimation
//!
//! - **Circuit Builder**: Build variational quantum circuits from architecture
//!   specifications with parameter initialization and gradient computation helpers.
//!
//! ## Quick Start
//!
//! ```rust
//! use ruqu_vq_nas::{
//!     search_space::{SearchSpace, GateType},
//!     search::{SearchAlgorithm, SearchConfig},
//! };
//! use rand::SeedableRng;
//! use rand_chacha::ChaCha8Rng;
//!
//! // Create a search space
//! let space = SearchSpace::hardware_efficient(4, 5).unwrap();
//!
//! // Configure search
//! let config = SearchConfig::quick();
//!
//! // Run random search
//! let mut rng = ChaCha8Rng::seed_from_u64(42);
//! let mut search = SearchAlgorithm::random(space, config);
//! let result = search.search(&mut rng).unwrap();
//!
//! println!("Best fitness: {}", result.best_evaluation.fitness);
//! println!("Evaluations: {}", result.num_evaluations);
//! ```
//!
//! ## Search Space Example
//!
//! ```rust
//! use ruqu_vq_nas::search_space::{
//!     SearchSpaceBuilder, GateType, ConnectivityGraph, LayerTemplate
//! };
//!
//! // Build a custom search space
//! let space = SearchSpaceBuilder::new(4)
//!     .depth_range(2, 8)
//!     .gate_set(vec![GateType::RY, GateType::RZ, GateType::CNOT])
//!     .connectivity(ConnectivityGraph::linear(4))
//!     .build()
//!     .unwrap();
//! ```
//!
//! ## Circuit Building Example
//!
//! ```rust
//! use ruqu_vq_nas::circuit::{
//!     CircuitBuilder, HardwareEfficientAnsatz, InitializationStrategy
//! };
//! use ruqu_vq_nas::search_space::GateType;
//! use rand::SeedableRng;
//! use rand_chacha::ChaCha8Rng;
//!
//! // Build a hardware-efficient ansatz
//! let ansatz = HardwareEfficientAnsatz::new(4, 3);
//! let circuit = ansatz.build();
//!
//! println!("Qubits: {}", circuit.num_qubits);
//! println!("Parameters: {}", circuit.num_parameters);
//! println!("Two-qubit gates: {}", circuit.two_qubit_gate_count());
//!
//! // Or use the builder pattern
//! let mut rng = ChaCha8Rng::seed_from_u64(42);
//! let circuit = CircuitBuilder::new(4)
//!     .rotation_layer(&[ruqu_vq_nas::search_space::GateType::RY, ruqu_vq_nas::search_space::GateType::RZ])
//!     .entangling_layer_linear(ruqu_vq_nas::search_space::GateType::CNOT)
//!     .rotation_layer(&[ruqu_vq_nas::search_space::GateType::RY, ruqu_vq_nas::search_space::GateType::RZ])
//!     .build_with_strategy(InitializationStrategy::Small { scale: 0.1 }, &mut rng);
//! ```
//!
//! ## Evaluation Example
//!
//! ```rust
//! use ruqu_vq_nas::circuit::HardwareEfficientAnsatz;
//! use ruqu_vq_nas::evaluation::{CircuitEvaluator, EvaluationConfig};
//! use rand::SeedableRng;
//! use rand_chacha::ChaCha8Rng;
//!
//! let mut rng = ChaCha8Rng::seed_from_u64(42);
//! let circuit = HardwareEfficientAnsatz::new(4, 2).build();
//!
//! let evaluator = CircuitEvaluator::with_config(EvaluationConfig::fast());
//! let result = evaluator.evaluate(&circuit, &mut rng).unwrap();
//!
//! println!("Expressibility: {:.4}", result.expressibility);
//! println!("Entanglement: {:.4}", result.entanglement_capability);
//! println!("Fitness: {:.4}", result.fitness);
//! ```
//!
//! ## Tier 3 Capability (Score 74)
//!
//! This crate implements Tier 3 quantum capabilities for automated circuit
//! architecture discovery. The two-week validation tests are:
//!
//! 1. Search space definition works correctly
//! 2. Architecture search runs and produces valid circuits
//!
//! ## Crate Features
//!
//! - `default` - Includes parallel processing via rayon
//! - `parallel` - Enable parallel evaluation and search
//! - `ruqu-integration` - Integration with the ruQu quantum simulation crate
//! - `full` - All features enabled

#![warn(missing_docs)]
#![warn(rustdoc::missing_doc_code_examples)]
#![deny(unsafe_code)]

pub mod circuit;
pub mod encoding;
pub mod error;
pub mod evaluation;
pub mod search;
pub mod search_space;

// Re-export commonly used types at crate root
pub use circuit::{
    CircuitBuilder, GradientComputer, HardwareEfficientAnsatz, InitializationStrategy,
    QuantumCircuit, StronglyEntanglingLayers,
};
pub use encoding::{
    ArchitectureEmbedding, ArchitectureEncoder, ContinuousEncoding, DiscreteEncoding,
};
pub use error::{
    CircuitError, EncodingError, EvaluationError, Result, SearchError, SearchSpaceError,
    VqNasError,
};
pub use evaluation::{
    BatchEvaluator, CircuitEvaluator, EntanglementCalculator, EvaluationConfig, EvaluationResult,
    ExpressibilityCalculator, FitnessWeights, HardwareCost,
};
pub use search::{
    BayesianOptimization, DifferentiableSearch, EvolutionaryConfig, EvolutionarySearch,
    RandomSearch, RegularizedEvolution, RegularizedEvolutionConfig, SearchAlgorithm, SearchConfig,
    SearchResult,
};
pub use search_space::{
    ConnectivityGraph, EntanglementPattern, GateOperation, GateType, LayerTemplate, SearchSpace,
    SearchSpaceBuilder,
};

/// Crate version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Prelude module for convenient imports.
pub mod prelude {
    pub use crate::circuit::{
        CircuitBuilder, HardwareEfficientAnsatz, InitializationStrategy, QuantumCircuit,
    };
    pub use crate::encoding::{DiscreteEncoding, ArchitectureEncoder};
    pub use crate::error::{Result, VqNasError};
    pub use crate::evaluation::{CircuitEvaluator, EvaluationConfig, EvaluationResult};
    pub use crate::search::{SearchAlgorithm, SearchConfig, SearchResult};
    pub use crate::search_space::{GateType, SearchSpace, SearchSpaceBuilder};
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::SeedableRng;
    use rand_chacha::ChaCha8Rng;

    #[test]
    fn test_version() {
        assert!(!VERSION.is_empty());
    }

    #[test]
    fn test_prelude_imports() {
        use crate::prelude::*;

        let space = SearchSpace::hardware_efficient(4, 3).unwrap();
        let config = SearchConfig::quick();
        let mut rng = ChaCha8Rng::seed_from_u64(42);

        let mut alg = SearchAlgorithm::random(space, config);
        let result = alg.search(&mut rng).unwrap();

        assert!(result.num_evaluations > 0);
    }

    #[test]
    fn test_full_workflow() {
        // 1. Define search space
        let space = SearchSpaceBuilder::new(3)
            .depth_range(1, 4)
            .gate_set(vec![GateType::RY, GateType::RZ, GateType::CNOT])
            .build()
            .unwrap();

        // 2. Configure search
        let config = SearchConfig::quick();

        // 3. Run search
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let mut search = SearchAlgorithm::random(space.clone(), config);
        let result = search.search(&mut rng).unwrap();

        // 4. Build circuit from best architecture
        let circuit = QuantumCircuit::from_encoding(&result.best_encoding, &space).unwrap();

        // 5. Verify circuit properties
        assert_eq!(circuit.num_qubits, 3);
        assert!(circuit.validate().is_ok());
    }

    #[test]
    fn test_evolutionary_workflow() {
        let space = SearchSpace::hardware_efficient(3, 3).unwrap();
        let config = SearchConfig::quick();
        let evo_config = EvolutionaryConfig {
            population_size: 10,
            num_parents: 5,
            ..Default::default()
        };

        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let mut search =
            SearchAlgorithm::evolutionary(space, config, evo_config).unwrap();
        let result = search.search(&mut rng).unwrap();

        assert!(result.num_evaluations > 0);
        assert!(result.best_evaluation.fitness.is_finite());
    }

    #[test]
    fn test_circuit_builder_workflow() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);

        let circuit = CircuitBuilder::new(4)
            .h(0)
            .h(1)
            .h(2)
            .h(3)
            .rotation_layer(&[GateType::RY, GateType::RZ])
            .entangling_layer_linear(GateType::CNOT)
            .rotation_layer(&[GateType::RY])
            .build_with_random_params(&mut rng);

        assert_eq!(circuit.num_qubits, 4);
        assert!(circuit.num_parameters > 0);
        assert!(circuit.two_qubit_gate_count() > 0);
    }

    #[test]
    fn test_evaluation_workflow() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let circuit = HardwareEfficientAnsatz::new(3, 2).build();

        let evaluator = CircuitEvaluator::with_config(EvaluationConfig::fast());
        let result = evaluator.evaluate(&circuit, &mut rng).unwrap();

        // Check all metrics are in expected ranges
        assert!(result.expressibility >= 0.0);
        assert!(result.entanglement_capability >= 0.0 && result.entanglement_capability <= 1.0);
        assert!(result.convergence_proxy >= 0.0 && result.convergence_proxy <= 1.0);
        assert!(result.hardware_cost.gate_count > 0);
    }

    #[test]
    fn test_encoding_workflow() {
        let space = SearchSpace::hardware_efficient(4, 5).unwrap();
        let mut rng = ChaCha8Rng::seed_from_u64(42);

        // Create random discrete encoding
        let discrete = DiscreteEncoding::random(&space, &mut rng);
        assert!(discrete.validate(&space).is_ok());

        // Convert to embedding
        let encoder = ArchitectureEncoder::new(space.clone(), 32);
        let embedding = encoder.embed(&discrete).unwrap();
        assert_eq!(embedding.dimension, 32);

        // Decode to operations
        let operations = encoder.decode_to_operations(&discrete);
        assert_eq!(operations.len(), discrete.depth);
    }

    #[test]
    fn test_continuous_encoding_workflow() {
        let space = SearchSpace::hardware_efficient(3, 3).unwrap();
        let mut rng = ChaCha8Rng::seed_from_u64(42);

        // Create continuous encoding
        let continuous = ContinuousEncoding::random(&space, &mut rng);

        // Sample discrete encodings
        for _ in 0..5 {
            let discrete = continuous.sample(&space, &mut rng);
            assert!(discrete.validate(&space).is_ok());
        }

        // Get argmax discrete
        let best_discrete = continuous.to_discrete(&space);
        assert!(best_discrete.validate(&space).is_ok());
    }

    #[test]
    fn test_gradient_computation() {
        let circuit = CircuitBuilder::new(2).ry(0).ry(1).cnot(0, 1).build();

        let computer = GradientComputer::new();

        // Quadratic loss function
        let loss = |params: &ndarray::Array1<f64>| -> f64 {
            params.iter().map(|x| x.powi(2)).sum()
        };

        let grads = computer.compute_gradients(&circuit, loss).unwrap();
        assert_eq!(grads.len(), 2);
    }
}
