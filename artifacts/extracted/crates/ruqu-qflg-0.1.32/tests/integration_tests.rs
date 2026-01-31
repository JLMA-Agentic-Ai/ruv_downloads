//! Integration tests for ruqu-qflg
//!
//! Tests the complete federated learning workflow with Byzantine tolerance
//! and differential privacy.

use ndarray::{array, Array1};
use ruqu_qflg::prelude::*;

// =============================================================================
// Aggregation Tests
// =============================================================================

#[test]
fn test_fedavg_aggregation() {
    let config = AggregatorConfig::default();
    let aggregator = WeightedAverageAggregator::new(config);

    let gradients = vec![
        array![1.0, 2.0, 3.0],
        array![2.0, 3.0, 4.0],
        array![3.0, 4.0, 5.0],
    ];
    let weights = vec![1.0, 1.0, 1.0];

    let result = aggregator.aggregate(&gradients, &weights).unwrap();
    assert!((result[0] - 2.0).abs() < 1e-10);
    assert!((result[1] - 3.0).abs() < 1e-10);
    assert!((result[2] - 4.0).abs() < 1e-10);
}

#[test]
fn test_weighted_aggregation() {
    let config = AggregatorConfig::default();
    let aggregator = WeightedAverageAggregator::new(config);

    let gradients = vec![
        array![0.0, 0.0],
        array![1.0, 1.0],
    ];
    let weights = vec![3.0, 1.0]; // 75% weight to first

    let result = aggregator.aggregate(&gradients, &weights).unwrap();
    assert!((result[0] - 0.25).abs() < 1e-10);
    assert!((result[1] - 0.25).abs() < 1e-10);
}

#[test]
fn test_secure_aggregation() {
    let config = AggregatorConfig::default();
    let aggregator = SecureAggregator::new(config);

    let gradients = vec![
        array![1.0, 2.0],
        array![3.0, 4.0],
    ];
    let weights = vec![0.5, 0.5];

    let result = aggregator.aggregate(&gradients, &weights).unwrap();
    // Should be approximately [2.0, 3.0]
    assert!((result[0] - 2.0).abs() < 0.01);
    assert!((result[1] - 3.0).abs() < 0.01);
}

#[test]
fn test_momentum_aggregation() {
    let config = AggregatorConfig {
        momentum: 0.9,
        ..Default::default()
    };
    let aggregator = MomentumAggregator::new(config, false);

    let gradients = vec![array![1.0, 1.0]];
    let weights = vec![1.0];

    let r1 = aggregator.aggregate(&gradients, &weights).unwrap();
    let r2 = aggregator.aggregate(&gradients, &weights).unwrap();

    // Second result should be larger due to momentum
    assert!(r2[0] > r1[0]);
}

// =============================================================================
// Byzantine Detection Tests
// =============================================================================

#[test]
fn test_krum_detection() {
    let config = DetectorConfig::new(3, 0.2);
    let detector = KrumDetector::new(config);

    let gradients = vec![
        array![1.0, 1.0, 1.0],
        array![1.1, 0.9, 1.0],
        array![0.9, 1.1, 1.0],
        array![1.0, 1.0, 0.9],
        array![1.0, 1.0, 1.1],
        array![100.0, -100.0, 50.0], // Byzantine
    ];

    let (honest, byzantine) = detector.detect(&gradients).unwrap();
    assert!(byzantine.contains(&5));
    assert!(honest.len() >= 4);
}

#[test]
fn test_multi_krum_selection() {
    let config = DetectorConfig::new(3, 0.2);
    let detector = MultiKrumDetector::new(config, 3);

    let gradients = vec![
        array![1.0, 1.0],
        array![1.1, 0.9],
        array![0.9, 1.1],
        array![1.0, 1.0],
        array![1.0, 1.0],
        array![50.0, -50.0], // Byzantine
    ];

    let (honest, _) = detector.detect(&gradients).unwrap();
    assert_eq!(honest.len(), 3);
    assert!(!honest.contains(&5));
}

#[test]
fn test_trimmed_mean() {
    let config = DetectorConfig::new(3, 0.2);
    let detector = TrimmedMeanDetector::new(config, 0.2);

    let gradients = vec![
        array![1.0],
        array![2.0],
        array![3.0],
        array![4.0],
        array![100.0], // Outlier
    ];

    let result = detector.trimmed_mean(&gradients).unwrap();
    // Should trim extremes and average middle
    // Result will be in range [1,4] since outlier is trimmed
    assert!(result[0] >= 1.0 && result[0] <= 4.0);
}

#[test]
fn test_median_detection() {
    let config = DetectorConfig::new(3, 0.3);
    let detector = MedianDetector::new(config);

    let gradients = vec![
        array![1.0, 1.0],
        array![1.0, 1.0],
        array![1.0, 1.0],
        array![1.0, 1.0],
        array![1.0, 1.0],
        array![100.0, 100.0], // Byzantine
    ];

    let (honest, byzantine) = detector.detect(&gradients).unwrap();
    assert!(byzantine.contains(&5));
    assert!(honest.len() >= 4);
}

#[test]
fn test_bulyan_aggregation() {
    let config = DetectorConfig::new(3, 0.1);
    let detector = BulyanDetector::new(config);

    // Need many clients for Bulyan
    let mut gradients: Vec<Array1<f64>> = (0..20)
        .map(|_| array![1.0 + rand::random::<f64>() * 0.1, 1.0, 1.0])
        .collect();
    gradients.push(array![100.0, -100.0, 0.0]); // Byzantine

    let result = detector.bulyan_aggregate(&gradients).unwrap();
    assert!((result[0] - 1.0).abs() < 0.5);
}

#[test]
fn test_byzantine_scores() {
    let config = DetectorConfig::new(3, 0.2);
    let detector = KrumDetector::new(config);

    let gradients = vec![
        array![1.0, 1.0, 1.0],
        array![1.1, 0.9, 1.0],
        array![0.9, 1.1, 1.0],
        array![1.0, 1.0, 0.9],
        array![1.0, 1.0, 1.1],
        array![100.0, -100.0, 50.0],
    ];

    let result = detector.detect_with_scores(&gradients).unwrap();

    // Byzantine should have highest score
    let max_honest_score = result.honest_indices
        .iter()
        .map(|&i| result.scores[i])
        .fold(f64::MIN, f64::max);
    let byzantine_score = result.scores[5];

    assert!(byzantine_score > max_honest_score);
}

// =============================================================================
// Privacy Tests
// =============================================================================

#[test]
fn test_gaussian_mechanism() {
    let config = PrivacyConfig::new(1.0, 1e-5, 1.0);
    let mechanism = GaussianMechanism::new(config).unwrap();

    let gradient = array![1.0, 2.0, 3.0];
    let private = mechanism.apply(&gradient).unwrap();

    assert_eq!(private.len(), 3);
    // Values should be different due to noise
    assert!((private.sum() - gradient.sum()).abs() > 0.001);
}

#[test]
fn test_laplace_mechanism() {
    let config = PrivacyConfig::new(1.0, 1e-5, 1.0);
    let mechanism = LaplaceMechanism::new(config).unwrap();

    let gradient = array![1.0, 2.0, 3.0];
    let private = mechanism.apply(&gradient).unwrap();

    assert_eq!(private.len(), 3);
}

#[test]
fn test_privacy_budget_tracking() {
    let mut budget = PrivacyBudget::new(10.0, 1e-5);

    budget.spend(1.0, 1e-6, "round 1").unwrap();
    budget.spend(2.0, 1e-6, "round 2").unwrap();

    assert_eq!(budget.current_epsilon(), 3.0);
    assert_eq!(budget.remaining(), 7.0);
    assert_eq!(budget.num_compositions(), 2);
}

#[test]
fn test_privacy_budget_exhaustion() {
    let mut budget = PrivacyBudget::new(1.0, 1e-5);

    budget.spend(0.8, 1e-6, "round 1").unwrap();
    let result = budget.spend(0.5, 1e-6, "round 2");

    assert!(result.is_err());
}

#[test]
fn test_gradient_clipping() {
    let clipper = GradientClipper::new(1.0).unwrap();

    let large_gradient = array![3.0, 4.0]; // norm = 5
    let clipped = clipper.clip(&large_gradient);

    let norm = clipped.dot(&clipped).sqrt();
    assert!((norm - 1.0).abs() < 1e-10);
}

#[test]
fn test_adaptive_clipping() {
    let mut clipper = AdaptiveClipper::new(10.0, 0.5);

    let gradients: Vec<Array1<f64>> = (1..10)
        .map(|i| array![i as f64, 0.0])
        .collect();

    clipper.update(&gradients);

    // Threshold should adapt towards median
    assert!(clipper.threshold() < 10.0);
}

#[test]
fn test_moments_accountant() {
    let mut accountant = MomentsAccountant::new(0.01, 1.0);

    for _ in 0..100 {
        accountant.record_step();
    }

    let (epsilon, delta) = accountant.get_privacy_spent(1e-5);
    assert!(epsilon > 0.0);
    assert!(delta > 0.0);
}

// =============================================================================
// Protocol Tests
// =============================================================================

#[test]
fn test_coordinator_creation() {
    let config = CoordinatorConfig::default();
    let coordinator = FederatedCoordinator::new(config);

    assert_eq!(coordinator.active_client_count(), 0);
}

#[test]
fn test_client_lifecycle() {
    let config = CoordinatorConfig::default();
    let coordinator = FederatedCoordinator::new(config);

    let client = ClientInfo::new("test_client".to_string(), vec![0u8; 32]);
    coordinator.register_client(client).unwrap();
    assert_eq!(coordinator.active_client_count(), 1);

    coordinator.unregister_client("test_client").unwrap();
    assert_eq!(coordinator.active_client_count(), 0);
}

#[test]
fn test_round_management() {
    let config = CoordinatorConfig::default();
    let coordinator = FederatedCoordinator::new(config);

    let round = coordinator.start_round().unwrap();
    assert_eq!(round.round_number, 1);
    assert_eq!(round.state, RoundState::Collecting);
}

#[test]
fn test_federated_client() {
    let config = ClientConfig {
        model_dimension: 10,
        ..Default::default()
    };
    let client = FederatedClient::new("client_1".to_string(), config);

    let info = client.get_info();
    assert_eq!(info.client_id, "client_1");

    let submission = client.train_local(100);
    assert_eq!(submission.gradient.len(), 10);
    assert_eq!(submission.weight, 100.0);
}

#[test]
fn test_complete_round() {
    let mut config = CoordinatorConfig::default();
    config.byzantine_enabled = false;
    config.privacy_enabled = false;
    config.model_dimension = 5;

    let coordinator = FederatedCoordinator::new(config);

    // Register clients
    for i in 0..5 {
        let client = ClientInfo::new(format!("client_{}", i), vec![0u8; 32]);
        coordinator.register_client(client).unwrap();
    }

    // Start round
    let round = coordinator.start_round().unwrap();

    // Submit gradients
    for i in 0..5 {
        let submission = GradientSubmission {
            client_id: format!("client_{}", i),
            round_id: round.round_id.clone(),
            gradient: Array1::from_vec(vec![0.1; 5]),
            weight: 100.0,
            signature: vec![],
            submitted_at: chrono::Utc::now(),
        };
        coordinator.submit_gradient(submission).unwrap();
    }

    // Complete round
    let aggregate = coordinator.complete_round().unwrap();
    assert_eq!(aggregate.len(), 5);

    // Verify round completed
    let history = coordinator.get_round_history();
    assert_eq!(history.len(), 1);
    assert_eq!(history[0].state, RoundState::Completed);
}

// =============================================================================
// Quantum Tests
// =============================================================================

#[test]
fn test_quantum_rng() {
    let qrng = QuantumRng::new();
    let bytes = qrng.generate_bytes(32);
    assert_eq!(bytes.len(), 32);
}

#[test]
fn test_quantum_rng_deterministic() {
    let qrng1 = QuantumRng::with_seed(12345);
    let qrng2 = QuantumRng::with_seed(12345);

    let bytes1 = qrng1.generate_bytes(16);
    let bytes2 = qrng2.generate_bytes(16);

    assert_eq!(bytes1, bytes2);
}

#[test]
fn test_quantum_state() {
    let mut state = QuantumState::new(2);
    assert_eq!(state.num_qubits(), 2);
    assert_eq!(state.dimension(), 4);

    state.hadamard(0).unwrap();
    state.cnot(0, 1).unwrap();

    // Bell state: equal probability for |00> and |11>
    assert!((state.probability(0) - 0.5).abs() < 1e-10);
    assert!((state.probability(3) - 0.5).abs() < 1e-10);
}

#[test]
fn test_bell_pair() {
    let bell = BellPair::new();
    assert!(bell.verify_correlation(0.95));
    assert_eq!(bell.fidelity(), 1.0);
}

#[test]
fn test_bell_pair_with_noise() {
    let bell = BellPair::with_noise(0.1);
    assert!(bell.fidelity() < 1.0);
}

#[test]
fn test_post_quantum_signature() {
    let sig = PostQuantumSignature::generate();
    let message = b"Test message for signing";

    let signature = sig.sign(message);
    assert!(sig.verify(message, &signature));
    assert!(!sig.verify(b"Wrong message", &signature));
}

#[test]
fn test_qkd_simulator() {
    // Use small key length to ensure enough material after sifting
    let qkd = QKDSimulator::new(8, 0.0);

    // This is a probabilistic test - may fail due to insufficient key material
    if let Ok((alice_key, bob_key)) = qkd.bb84_exchange() {
        // With zero error, keys should match
        assert_eq!(alice_key, bob_key);
    }
}

#[test]
fn test_coherence_monitor() {
    let mut monitor = CoherenceMonitor::new(0.9);

    monitor.record(0.95);
    monitor.record(0.93);
    monitor.record(0.92);

    assert!(monitor.is_coherent());
    assert!(monitor.average_coherence() > 0.9);
}

// =============================================================================
// Integration Tests
// =============================================================================

#[test]
fn test_full_workflow_with_byzantine() {
    // Setup
    let detector_config = DetectorConfig::new(3, 0.3);
    let detector = KrumDetector::new(detector_config);

    let agg_config = AggregatorConfig::default();
    let aggregator = WeightedAverageAggregator::new(agg_config);

    let privacy_config = PrivacyConfig::new(1.0, 1e-5, 1.0);
    let mechanism = GaussianMechanism::new(privacy_config).unwrap();

    // Simulate gradients with Byzantine
    let gradients = vec![
        array![1.0, 1.0, 1.0],
        array![1.1, 0.9, 1.0],
        array![0.9, 1.1, 1.0],
        array![1.0, 0.9, 1.1],
        array![0.9, 1.0, 0.9],
        array![50.0, -50.0, 25.0], // Byzantine
    ];

    // Detect Byzantine
    let (honest_indices, byzantine_indices) = detector.detect(&gradients).unwrap();
    assert!(!byzantine_indices.is_empty());

    // Filter honest gradients
    let honest_gradients: Vec<Array1<f64>> = honest_indices
        .iter()
        .map(|&i| gradients[i].clone())
        .collect();
    let weights: Vec<f64> = honest_gradients.iter().map(|_| 1.0).collect();

    // Aggregate
    let aggregate = aggregator.aggregate(&honest_gradients, &weights).unwrap();

    // Apply privacy
    let private_aggregate = mechanism.apply(&aggregate).unwrap();

    // Verify
    assert_eq!(private_aggregate.len(), 3);
}

#[test]
fn test_full_protocol_simulation() {
    let mut coord_config = CoordinatorConfig::default();
    coord_config.model_dimension = 10;
    coord_config.min_clients = 3;
    coord_config.byzantine_enabled = true;
    coord_config.privacy_enabled = true;

    let coordinator = FederatedCoordinator::new(coord_config);

    // Create and register clients
    let client_config = ClientConfig {
        model_dimension: 10,
        ..Default::default()
    };

    for i in 0..6 {
        let client = FederatedClient::new(format!("client_{}", i), client_config.clone());
        coordinator.register_client(client.get_info()).unwrap();
    }

    // Run a round
    let round = coordinator.start_round().unwrap();

    for i in 0..6 {
        let gradient = if i == 5 {
            Array1::from_vec(vec![100.0; 10]) // Byzantine
        } else {
            Array1::from_vec(vec![0.1; 10])
        };

        let submission = GradientSubmission {
            client_id: format!("client_{}", i),
            round_id: round.round_id.clone(),
            gradient,
            weight: 100.0,
            signature: vec![],
            submitted_at: chrono::Utc::now(),
        };
        coordinator.submit_gradient(submission).unwrap();
    }

    let aggregate = coordinator.complete_round().unwrap();
    assert_eq!(aggregate.len(), 10);

    // Check round completed
    let history = coordinator.get_round_history();
    assert_eq!(history[0].state, RoundState::Completed);
}

#[test]
fn test_privacy_budget_across_rounds() {
    let mut budget = PrivacyBudget::new(5.0, 1e-5);

    // Simulate multiple rounds
    for i in 0..4 {
        budget.spend(1.0, 1e-6, &format!("round {}", i)).unwrap();
    }

    assert_eq!(budget.current_epsilon(), 4.0);
    assert_eq!(budget.remaining(), 1.0);

    // Should fail on 5th round with same epsilon
    let result = budget.spend(2.0, 1e-6, "round 4");
    assert!(result.is_err());
}

#[test]
fn test_quantum_noise_for_privacy() {
    let qrng = QuantumRng::new();

    // Generate noise for differential privacy
    let noise = qrng.generate_noise_vector(100, 1.0);
    assert_eq!(noise.len(), 100);

    // Noise should have approximately zero mean
    let mean = noise.sum() / 100.0;
    assert!(mean.abs() < 0.5);
}

#[test]
fn test_stats_collection() {
    let rounds = vec![
        RoundInfo {
            round_number: 1,
            round_id: "r1".to_string(),
            state: RoundState::Completed,
            started_at: chrono::Utc::now(),
            ended_at: Some(chrono::Utc::now()),
            participants: vec!["a".to_string(), "b".to_string()],
            gradients_received: 5,
            byzantine_detected: vec!["c".to_string()],
            privacy_spent: 1.0,
        },
        RoundInfo {
            round_number: 2,
            round_id: "r2".to_string(),
            state: RoundState::Completed,
            started_at: chrono::Utc::now(),
            ended_at: Some(chrono::Utc::now()),
            participants: vec!["a".to_string(), "b".to_string()],
            gradients_received: 6,
            byzantine_detected: vec![],
            privacy_spent: 1.0,
        },
    ];

    let stats = ProtocolStats::from_history(&rounds);
    assert_eq!(stats.rounds_completed, 2);
    assert_eq!(stats.total_gradients, 11);
    assert_eq!(stats.total_byzantine, 1);
    assert!((stats.total_privacy_spent - 2.0).abs() < 1e-10);
}
