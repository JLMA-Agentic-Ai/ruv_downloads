//! Integration tests for ruqu-vq-nas crate.
//!
//! These tests verify the complete workflow of variational quantum neural
//! architecture search, including search space definition, architecture
//! encoding, search algorithms, and evaluation.

use rand::SeedableRng;
use rand_chacha::ChaCha8Rng;
use ruqu_vq_nas::circuit::{
    CircuitBuilder, GradientComputer, HardwareEfficientAnsatz, InitializationStrategy,
    QuantumCircuit, StronglyEntanglingLayers,
};
use ruqu_vq_nas::encoding::{ArchitectureEmbedding, ArchitectureEncoder, ContinuousEncoding, DiscreteEncoding};
use ruqu_vq_nas::error::{EncodingError, SearchError, SearchSpaceError};
use ruqu_vq_nas::evaluation::{
    BatchEvaluator, CircuitEvaluator, EntanglementCalculator, EvaluationConfig,
    ExpressibilityCalculator, FitnessWeights, HardwareCost,
};
use ruqu_vq_nas::search::{
    BayesianOptimization, DifferentiableSearch, EvolutionaryConfig, EvolutionarySearch,
    RandomSearch, RegularizedEvolution, RegularizedEvolutionConfig, SearchAlgorithm, SearchConfig,
};
use ruqu_vq_nas::search_space::{
    ConnectivityGraph, EntanglementPattern, GateOperation, GateType, LayerTemplate, SearchSpace,
    SearchSpaceBuilder,
};

// =============================================================================
// Search Space Tests (Tier 3 Validation: Search space definition works)
// =============================================================================

#[test]
fn test_search_space_hardware_efficient() {
    let space = SearchSpace::hardware_efficient(4, 5).unwrap();

    assert_eq!(space.num_qubits, 4);
    assert_eq!(space.max_depth, 5);
    assert!(space.gate_set.contains(&GateType::RX));
    assert!(space.gate_set.contains(&GateType::RY));
    assert!(space.gate_set.contains(&GateType::RZ));
    assert!(space.gate_set.contains(&GateType::CNOT));
}

#[test]
fn test_search_space_qaoa_style() {
    let space = SearchSpace::qaoa_style(4, 3).unwrap();

    assert!(space.gate_set.contains(&GateType::RX));
    assert!(space.gate_set.contains(&GateType::RZ));
    assert!(space.gate_set.contains(&GateType::CZ));
}

#[test]
fn test_search_space_builder() {
    let space = SearchSpaceBuilder::new(6)
        .depth_range(2, 10)
        .gate_set(vec![GateType::RY, GateType::CZ])
        .connectivity(ConnectivityGraph::grid(2, 3))
        .allow_identity(false)
        .max_parameters(100)
        .build()
        .unwrap();

    assert_eq!(space.num_qubits, 6);
    assert_eq!(space.min_depth, 2);
    assert_eq!(space.max_depth, 10);
    assert_eq!(space.gate_set.len(), 2);
    assert!(!space.allow_identity);
    assert_eq!(space.max_parameters, Some(100));
}

#[test]
fn test_search_space_validation() {
    // Invalid qubit count
    assert!(SearchSpace::new(0, 1, 5, GateType::hardware_efficient_set()).is_err());
    assert!(SearchSpace::new(100, 1, 5, GateType::hardware_efficient_set()).is_err());

    // Invalid depth range
    assert!(SearchSpace::new(4, 5, 3, GateType::hardware_efficient_set()).is_err());
    assert!(SearchSpace::new(4, 1, 0, GateType::hardware_efficient_set()).is_err());

    // Empty gate set
    assert!(SearchSpace::new(4, 1, 5, vec![]).is_err());
}

#[test]
fn test_connectivity_graphs() {
    let linear = ConnectivityGraph::linear(5);
    assert!(linear.is_connected(0, 1));
    assert!(linear.is_connected(3, 4));
    assert!(!linear.is_connected(0, 4));

    let circular = ConnectivityGraph::circular(5);
    assert!(circular.is_connected(4, 0));

    let full = ConnectivityGraph::fully_connected(4);
    assert!(full.is_connected(0, 3));
    assert!(full.is_connected(1, 2));

    let grid = ConnectivityGraph::grid(2, 3);
    // Qubit layout: 0-1-2
    //               3-4-5
    assert!(grid.is_connected(0, 1));
    assert!(grid.is_connected(0, 3));
    assert!(!grid.is_connected(0, 5));
}

#[test]
fn test_gate_types() {
    // Single qubit gates
    assert!(!GateType::RX.is_two_qubit());
    assert!(GateType::RX.is_parameterized());
    assert_eq!(GateType::RX.num_parameters(), 1);

    assert!(!GateType::H.is_two_qubit());
    assert!(!GateType::H.is_parameterized());
    assert_eq!(GateType::H.num_parameters(), 0);

    // Two qubit gates
    assert!(GateType::CNOT.is_two_qubit());
    assert!(!GateType::CNOT.is_parameterized());

    assert!(GateType::CRZ.is_two_qubit());
    assert!(GateType::CRZ.is_parameterized());
}

#[test]
fn test_entanglement_patterns() {
    let linear = EntanglementPattern::Linear.generate_pairs(4);
    assert_eq!(linear, vec![(0, 1), (1, 2), (2, 3)]);

    let circular = EntanglementPattern::Circular.generate_pairs(4);
    assert!(circular.contains(&(3, 0)));

    let full = EntanglementPattern::Full.generate_pairs(4);
    assert_eq!(full.len(), 6); // C(4,2) = 6

    let pairwise = EntanglementPattern::Pairwise.generate_pairs(4);
    assert_eq!(pairwise, vec![(0, 1), (2, 3)]);
}

#[test]
fn test_layer_templates() {
    let hw = LayerTemplate::standard_hardware_efficient();
    let qaoa = LayerTemplate::standard_qaoa();
    let strong = LayerTemplate::standard_strongly_entangling();

    // Test that templates provide correct parameter counts
    let hw_params = hw.params_per_qubit(4);
    assert!(hw_params > 0);

    let qaoa_params = qaoa.params_per_qubit(4);
    assert!(qaoa_params > 0);
}

// =============================================================================
// Architecture Encoding Tests
// =============================================================================

#[test]
fn test_discrete_encoding_random() {
    let space = SearchSpace::hardware_efficient(4, 5).unwrap();
    let mut rng = ChaCha8Rng::seed_from_u64(42);

    let encoding = DiscreteEncoding::random(&space, &mut rng);

    assert!(encoding.depth >= space.min_depth);
    assert!(encoding.depth <= space.max_depth);
    assert!(encoding.validate(&space).is_ok());
}

#[test]
fn test_discrete_encoding_flat_vector() {
    let space = SearchSpace::hardware_efficient(3, 4).unwrap();
    let mut rng = ChaCha8Rng::seed_from_u64(42);

    let original = DiscreteEncoding::random(&space, &mut rng);
    let flat = original.to_flat_vector(&space);
    let reconstructed = DiscreteEncoding::from_flat_vector(&flat, &space).unwrap();

    assert_eq!(original.depth, reconstructed.depth);
}

#[test]
fn test_discrete_encoding_mutation() {
    let space = SearchSpace::hardware_efficient(4, 5).unwrap();
    let mut rng = ChaCha8Rng::seed_from_u64(42);

    let mut encoding = DiscreteEncoding::random(&space, &mut rng);
    encoding.mutate(&space, 0.5, &mut rng);

    assert!(encoding.validate(&space).is_ok());
}

#[test]
fn test_discrete_encoding_crossover() {
    let space = SearchSpace::hardware_efficient(4, 5).unwrap();
    let mut rng = ChaCha8Rng::seed_from_u64(42);

    let parent1 = DiscreteEncoding::random(&space, &mut rng);
    let parent2 = DiscreteEncoding::random(&space, &mut rng);
    let child = parent1.crossover(&parent2, &mut rng);

    assert!(child.validate(&space).is_ok());
}

#[test]
fn test_continuous_encoding() {
    let space = SearchSpace::hardware_efficient(3, 4).unwrap();
    let mut rng = ChaCha8Rng::seed_from_u64(42);

    let continuous = ContinuousEncoding::uniform(&space);

    // Depth weights should sum to 1
    let sum: f64 = continuous.depth_weights.iter().sum();
    assert!((sum - 1.0).abs() < 1e-10);

    // Sample discrete encoding
    let discrete = continuous.sample(&space, &mut rng);
    assert!(discrete.validate(&space).is_ok());
}

#[test]
fn test_continuous_encoding_update() {
    let space = SearchSpace::hardware_efficient(3, 3).unwrap();
    let mut rng = ChaCha8Rng::seed_from_u64(42);

    let mut continuous = ContinuousEncoding::uniform(&space);
    let discrete = DiscreteEncoding::random(&space, &mut rng);

    continuous.update(&discrete, 1.0, 0.1);

    // Weights should still be valid probabilities
    let sum: f64 = continuous.depth_weights.iter().sum();
    assert!((sum - 1.0).abs() < 1e-6);
}

#[test]
fn test_architecture_embedding() {
    let space = SearchSpace::hardware_efficient(4, 5).unwrap();
    let mut rng = ChaCha8Rng::seed_from_u64(42);

    let encoding = DiscreteEncoding::random(&space, &mut rng);
    let embedding = ArchitectureEmbedding::from_discrete(&encoding, &space, 32).unwrap();

    assert_eq!(embedding.dimension, 32);
    assert_eq!(embedding.vector.len(), 32);
}

#[test]
fn test_embedding_similarity() {
    let space = SearchSpace::hardware_efficient(3, 3).unwrap();
    let mut rng = ChaCha8Rng::seed_from_u64(42);

    let enc1 = DiscreteEncoding::random(&space, &mut rng);
    let enc2 = DiscreteEncoding::random(&space, &mut rng);

    let emb1 = ArchitectureEmbedding::from_discrete(&enc1, &space, 16).unwrap();
    let emb2 = ArchitectureEmbedding::from_discrete(&enc2, &space, 16).unwrap();

    let sim = emb1.cosine_similarity(&emb2);
    assert!(sim >= -1.0 && sim <= 1.0);

    // Self-similarity should be 1
    let self_sim = emb1.cosine_similarity(&emb1);
    assert!((self_sim - 1.0).abs() < 1e-6);
}

#[test]
fn test_architecture_encoder() {
    let space = SearchSpace::hardware_efficient(4, 4).unwrap();
    let encoder = ArchitectureEncoder::new(space.clone(), 32);

    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let encoding = DiscreteEncoding::random(&space, &mut rng);

    let operations = encoder.decode_to_operations(&encoding);
    assert_eq!(operations.len(), encoding.depth);

    let param_count = encoder.count_parameters(&encoding);
    let gate_count = encoder.count_gates(&encoding);
    let two_qubit_count = encoder.count_two_qubit_gates(&encoding);

    assert!(gate_count >= two_qubit_count);
    assert!(param_count >= 0);
}

// =============================================================================
// Circuit Building Tests
// =============================================================================

#[test]
fn test_circuit_builder_basic() {
    let circuit = CircuitBuilder::new(4)
        .ry(0)
        .ry(1)
        .ry(2)
        .ry(3)
        .cnot(0, 1)
        .cnot(2, 3)
        .build();

    assert_eq!(circuit.num_qubits, 4);
    assert_eq!(circuit.num_parameters, 4);
    assert_eq!(circuit.gate_count(), 6);
    assert_eq!(circuit.two_qubit_gate_count(), 2);
}

#[test]
fn test_circuit_builder_layers() {
    let circuit = CircuitBuilder::new(4)
        .rotation_layer(&[GateType::RY, GateType::RZ])
        .entangling_layer_linear(GateType::CNOT)
        .rotation_layer(&[GateType::RY])
        .build();

    // 4 qubits * (2 + 1) rotations = 12 parameters
    assert_eq!(circuit.num_parameters, 12);
    // 3 CNOT gates (linear entanglement with 4 qubits)
    assert_eq!(circuit.two_qubit_gate_count(), 3);
}

#[test]
fn test_circuit_from_encoding() {
    let space = SearchSpace::hardware_efficient(4, 3).unwrap();
    let mut rng = ChaCha8Rng::seed_from_u64(42);

    let encoding = DiscreteEncoding::random(&space, &mut rng);
    let circuit = QuantumCircuit::from_encoding(&encoding, &space).unwrap();

    assert_eq!(circuit.num_qubits, 4);
    assert!(circuit.validate().is_ok());
}

#[test]
fn test_hardware_efficient_ansatz() {
    let ansatz = HardwareEfficientAnsatz::new(4, 3)
        .with_single_gates(vec![GateType::RY, GateType::RZ])
        .with_entangling_gate(GateType::CZ);

    let circuit = ansatz.build();

    assert_eq!(circuit.num_qubits, 4);
    assert!(circuit.num_parameters > 0);
    assert!(circuit.two_qubit_gate_count() > 0);
}

#[test]
fn test_strongly_entangling_layers() {
    let layers = StronglyEntanglingLayers::new(4, 2);
    let circuit = layers.build();

    assert_eq!(circuit.num_qubits, 4);
    // 3 rotations * 4 qubits * 2 layers = 24 parameters
    assert_eq!(circuit.num_parameters, 24);
}

#[test]
fn test_parameter_initialization() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);

    // Zeros
    let zeros = InitializationStrategy::Zeros.generate(10, &mut rng);
    assert!(zeros.iter().all(|&x| x == 0.0));

    // Uniform [0, 2*pi]
    let uniform = InitializationStrategy::Uniform.generate(10, &mut rng);
    assert!(uniform.iter().all(|&x| x >= 0.0 && x <= 2.0 * std::f64::consts::PI));

    // Small values
    let small = InitializationStrategy::Small { scale: 0.01 }.generate(10, &mut rng);
    assert!(small.iter().all(|&x| x.abs() < 1.0));
}

#[test]
fn test_gradient_computation() {
    let circuit = CircuitBuilder::new(2).ry(0).ry(1).cnot(0, 1).build();
    let computer = GradientComputer::new();

    let loss = |params: &ndarray::Array1<f64>| -> f64 { params.iter().map(|x| x.powi(2)).sum() };

    let grads = computer.compute_gradients(&circuit, loss).unwrap();
    assert_eq!(grads.len(), 2);
}

// =============================================================================
// Evaluation Tests
// =============================================================================

#[test]
fn test_hardware_cost() {
    let circuit = CircuitBuilder::new(4)
        .rotation_layer(&[GateType::RY, GateType::RZ])
        .entangling_layer_full(GateType::CNOT)
        .build();

    let cost = HardwareCost::from_circuit(&circuit);

    assert!(cost.gate_count > 0);
    assert!(cost.two_qubit_gates > 0);
    assert!(cost.depth > 0);
    assert!(cost.estimated_time > 0.0);

    let normalized = cost.normalized_cost();
    assert!(normalized >= 0.0 && normalized <= 1.0);
}

#[test]
fn test_circuit_evaluator() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let circuit = HardwareEfficientAnsatz::new(4, 2).build();

    let evaluator = CircuitEvaluator::with_config(EvaluationConfig::fast());
    let result = evaluator.evaluate(&circuit, &mut rng).unwrap();

    assert!(result.expressibility >= 0.0);
    assert!(result.entanglement_capability >= 0.0 && result.entanglement_capability <= 1.0);
    assert!(result.convergence_proxy >= 0.0 && result.convergence_proxy <= 1.0);
    assert!(result.fitness.is_finite());
}

#[test]
fn test_batch_evaluator() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let circuits: Vec<QuantumCircuit> = (1..=4)
        .map(|layers| HardwareEfficientAnsatz::new(3, layers).build())
        .collect();

    let batch_eval = BatchEvaluator::new(EvaluationConfig::fast());
    let ranked = batch_eval.evaluate_and_rank(&circuits, &mut rng);

    assert_eq!(ranked.len(), 4);

    // Verify ranking is sorted by fitness (descending)
    for i in 1..ranked.len() {
        assert!(ranked[i - 1].1.fitness >= ranked[i].1.fitness);
    }
}

#[test]
fn test_expressibility_calculator() {
    let fidelities: Vec<f64> = (0..100).map(|i| (i as f64) / 100.0).collect();
    let calc = ExpressibilityCalculator::new(100, 25);
    let expr = calc.from_fidelities(&fidelities, 2);

    assert!(expr >= 0.0);
    assert!(expr.is_finite());
}

#[test]
fn test_entanglement_calculator() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let circuit = HardwareEfficientAnsatz::new(3, 2).build();

    let calc = EntanglementCalculator::new(100);
    let ent = calc.from_circuit(&circuit, &mut rng).unwrap();

    assert!(ent >= 0.0 && ent <= 1.0);
}

#[test]
fn test_evaluation_config_presets() {
    let fast = EvaluationConfig::fast();
    let default = EvaluationConfig::default();
    let precise = EvaluationConfig::high_precision();

    assert!(fast.num_samples < default.num_samples);
    assert!(default.num_samples < precise.num_samples);
}

#[test]
fn test_fitness_weights() {
    let expr_focused = FitnessWeights::expressibility_focused();
    let ent_focused = FitnessWeights::entanglement_focused();
    let hw_focused = FitnessWeights::hardware_focused();

    assert!(expr_focused.expressibility > expr_focused.entanglement);
    assert!(ent_focused.entanglement > ent_focused.expressibility);
    assert!(hw_focused.hardware > hw_focused.expressibility);
}

// =============================================================================
// Search Algorithm Tests (Tier 3 Validation: Architecture search runs)
// =============================================================================

#[test]
fn test_random_search() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let space = SearchSpace::hardware_efficient(3, 3).unwrap();
    let config = SearchConfig::quick();

    let search = RandomSearch::new(space, config);
    let result = search.search(&mut rng).unwrap();

    assert!(result.num_evaluations > 0);
    assert!(!result.history.is_empty());
    assert!(result.best_evaluation.fitness.is_finite());
}

#[test]
fn test_evolutionary_search() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let space = SearchSpace::hardware_efficient(3, 3).unwrap();
    let config = SearchConfig::quick();
    let evo_config = EvolutionaryConfig {
        population_size: 10,
        num_parents: 5,
        mutation_rate: 0.1,
        crossover_rate: 0.8,
        elite_count: 2,
        tournament_size: 3,
    };

    let search = EvolutionarySearch::new(space, config, evo_config).unwrap();
    let result = search.search(&mut rng).unwrap();

    assert!(result.num_evaluations > 0);
    assert!(result.best_evaluation.fitness.is_finite());
}

#[test]
fn test_regularized_evolution() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let space = SearchSpace::hardware_efficient(3, 3).unwrap();
    let config = SearchConfig::quick();
    let reg_config = RegularizedEvolutionConfig {
        population_size: 20,
        sample_size: 5,
        mutation_rate: 0.1,
    };

    let search = RegularizedEvolution::new(space, config, reg_config);
    let result = search.search(&mut rng).unwrap();

    assert!(result.num_evaluations > 0);
}

#[test]
fn test_bayesian_optimization() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let space = SearchSpace::hardware_efficient(3, 3).unwrap();
    let config = SearchConfig::quick();

    let mut search = BayesianOptimization::new(space, config, 16);
    let result = search.search(&mut rng).unwrap();

    assert!(result.num_evaluations > 0);
}

#[test]
fn test_differentiable_search() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let space = SearchSpace::hardware_efficient(3, 3).unwrap();
    let config = SearchConfig::quick();

    let search = DifferentiableSearch::new(space, config)
        .with_learning_rate(0.1)
        .with_samples_per_update(3);

    let result = search.search(&mut rng).unwrap();

    assert!(result.num_evaluations > 0);
}

#[test]
fn test_search_algorithm_unified() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let space = SearchSpace::hardware_efficient(3, 3).unwrap();
    let config = SearchConfig::quick();

    // Test all search algorithms through unified interface
    let mut random = SearchAlgorithm::random(space.clone(), config.clone());
    let random_result = random.search(&mut rng).unwrap();
    assert!(random_result.num_evaluations > 0);

    let mut evo = SearchAlgorithm::evolutionary(
        space.clone(),
        config.clone(),
        EvolutionaryConfig::default(),
    )
    .unwrap();
    let evo_result = evo.search(&mut rng).unwrap();
    assert!(evo_result.num_evaluations > 0);

    let mut diff = SearchAlgorithm::differentiable(space.clone(), config.clone());
    let diff_result = diff.search(&mut rng).unwrap();
    assert!(diff_result.num_evaluations > 0);
}

#[test]
fn test_early_stopping() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let space = SearchSpace::hardware_efficient(3, 3).unwrap();
    let config = SearchConfig {
        max_evaluations: 1000,
        patience: 5,
        min_improvement: 100.0, // Impossible improvement
        ..SearchConfig::quick()
    };

    let search = RandomSearch::new(space, config);
    let result = search.search(&mut rng).unwrap();

    // Should stop early due to no improvement
    assert!(result.num_evaluations < 1000);
    assert!(result.converged);
}

#[test]
fn test_search_stores_all_evaluations() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let space = SearchSpace::hardware_efficient(3, 3).unwrap();
    let config = SearchConfig {
        max_evaluations: 20,
        store_all: true,
        ..SearchConfig::quick()
    };

    let search = RandomSearch::new(space, config);
    let result = search.search(&mut rng).unwrap();

    assert!(result.all_evaluations.is_some());
    let all = result.all_evaluations.unwrap();
    assert!(!all.is_empty());
}

// =============================================================================
// End-to-End Workflow Tests
// =============================================================================

#[test]
fn test_complete_nas_workflow() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);

    // 1. Define search space
    let space = SearchSpaceBuilder::new(4)
        .depth_range(1, 4)
        .gate_set(vec![GateType::RY, GateType::RZ, GateType::CNOT])
        .connectivity(ConnectivityGraph::linear(4))
        .build()
        .unwrap();

    // 2. Configure search
    let config = SearchConfig::quick();

    // 3. Run search
    let mut search = SearchAlgorithm::random(space.clone(), config);
    let result = search.search(&mut rng).unwrap();

    // 4. Build circuit from best architecture
    let circuit = QuantumCircuit::from_encoding(&result.best_encoding, &space).unwrap();

    // 5. Verify results
    assert_eq!(circuit.num_qubits, 4);
    assert!(circuit.validate().is_ok());
    assert!(result.best_evaluation.fitness.is_finite());
}

#[test]
fn test_architecture_comparison_workflow() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let space = SearchSpace::hardware_efficient(4, 4).unwrap();

    // Generate multiple architectures
    let encodings: Vec<DiscreteEncoding> =
        (0..10).map(|_| DiscreteEncoding::random(&space, &mut rng)).collect();

    // Build circuits
    let circuits: Vec<QuantumCircuit> = encodings
        .iter()
        .map(|e| QuantumCircuit::from_encoding(e, &space).unwrap())
        .collect();

    // Evaluate and rank
    let evaluator = BatchEvaluator::new(EvaluationConfig::fast());
    let ranked = evaluator.evaluate_and_rank(&circuits, &mut rng);

    // Best architecture should have highest fitness
    assert!(ranked[0].1.fitness >= ranked.last().unwrap().1.fitness);
}

#[test]
fn test_continuous_nas_workflow() {
    let mut rng = ChaCha8Rng::seed_from_u64(42);
    let space = SearchSpace::hardware_efficient(3, 3).unwrap();

    // Initialize continuous encoding
    let mut continuous = ContinuousEncoding::random(&space, &mut rng);
    let evaluator = CircuitEvaluator::with_config(EvaluationConfig::fast());

    // Simulated training loop
    for _ in 0..10 {
        let encoding = continuous.sample(&space, &mut rng);
        let circuit = QuantumCircuit::from_encoding(&encoding, &space).unwrap();
        let eval = evaluator.evaluate(&circuit, &mut rng).unwrap();

        // Update based on fitness
        continuous.update(&encoding, eval.fitness, 0.1);
    }

    // Get final architecture
    let final_encoding = continuous.to_discrete(&space);
    assert!(final_encoding.validate(&space).is_ok());
}

// =============================================================================
// Error Handling Tests
// =============================================================================

#[test]
fn test_invalid_search_space_errors() {
    // Test SearchSpaceError variants
    let result = SearchSpace::new(0, 1, 5, GateType::hardware_efficient_set());
    assert!(matches!(
        result.unwrap_err(),
        ruqu_vq_nas::error::VqNasError::SearchSpace(SearchSpaceError::InvalidQubitCount(_, _))
    ));

    let result = SearchSpace::new(4, 1, 5, vec![]);
    assert!(matches!(
        result.unwrap_err(),
        ruqu_vq_nas::error::VqNasError::SearchSpace(SearchSpaceError::EmptyGateSet)
    ));
}

#[test]
fn test_invalid_encoding_errors() {
    let space = SearchSpace::hardware_efficient(4, 5).unwrap();

    // Invalid depth
    let invalid = DiscreteEncoding::new(100, vec![0], vec![], vec![]);
    assert!(invalid.validate(&space).is_err());
}

#[test]
fn test_evolutionary_config_validation() {
    let invalid_population = EvolutionaryConfig {
        population_size: 2,
        ..Default::default()
    };
    assert!(invalid_population.validate().is_err());

    let invalid_mutation = EvolutionaryConfig {
        mutation_rate: 1.5,
        ..Default::default()
    };
    assert!(invalid_mutation.validate().is_err());
}

// =============================================================================
// Performance and Scalability Tests
// =============================================================================

#[test]
fn test_larger_search_space() {
    let space = SearchSpace::hardware_efficient(8, 10).unwrap();
    let mut rng = ChaCha8Rng::seed_from_u64(42);

    let encoding = DiscreteEncoding::random(&space, &mut rng);
    assert!(encoding.validate(&space).is_ok());

    let circuit = QuantumCircuit::from_encoding(&encoding, &space).unwrap();
    assert_eq!(circuit.num_qubits, 8);
}

#[test]
fn test_deep_circuit() {
    let circuit = CircuitBuilder::new(4)
        .rotation_layer(&[GateType::RY, GateType::RZ])
        .entangling_layer_linear(GateType::CNOT)
        .rotation_layer(&[GateType::RY, GateType::RZ])
        .entangling_layer_linear(GateType::CNOT)
        .rotation_layer(&[GateType::RY, GateType::RZ])
        .entangling_layer_linear(GateType::CNOT)
        .rotation_layer(&[GateType::RY, GateType::RZ])
        .entangling_layer_linear(GateType::CNOT)
        .rotation_layer(&[GateType::RY, GateType::RZ])
        .build();

    let depth = circuit.compute_depth();
    assert!(depth > 5);
    assert!(circuit.validate().is_ok());
}

#[test]
fn test_many_parameters() {
    let circuit = HardwareEfficientAnsatz::new(6, 5).build();

    // Should have many parameters
    assert!(circuit.num_parameters > 50);
    assert!(circuit.validate().is_ok());
}
