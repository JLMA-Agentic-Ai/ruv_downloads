//! Comprehensive integration tests for ruqu-qear.
//!
//! This test suite validates the complete QEAR pipeline from reservoir
//! initialization through training and prediction.

use ndarray::{Array1, Array2, Axis};
use ruqu_qear::prelude::*;

// =============================================================================
// Reservoir Tests
// =============================================================================

#[test]
fn test_reservoir_basic_creation() {
    let config = ReservoirConfig::new(4);
    let reservoir = QuantumReservoir::new(config).unwrap();

    assert_eq!(reservoir.size(), 16); // 2^4
    assert!(!reservoir.washout_complete());
}

#[test]
fn test_reservoir_with_all_parameters() {
    let config = ReservoirConfig::new(5)
        .with_spectral_radius(0.95)
        .with_input_scaling(0.5)
        .with_leaking_rate(0.2)
        .with_sparsity(0.8)
        .with_washout_steps(50)
        .with_noise_level(0.001)
        .with_seed(12345);

    let reservoir = QuantumReservoir::new(config).unwrap();
    assert_eq!(reservoir.size(), 32);
}

#[test]
fn test_reservoir_state_evolution() {
    let config = ReservoirConfig::new(4).with_seed(42);
    let mut reservoir = QuantumReservoir::new(config).unwrap();

    let initial_state = reservoir.state().clone();

    let input = Array1::from_vec(vec![1.0, 0.5, -0.3]);
    reservoir.update(&input).unwrap();

    let new_state = reservoir.state();

    // State should have changed
    let diff: f64 = initial_state
        .iter()
        .zip(new_state.iter())
        .map(|(a, b)| (a - b).abs())
        .sum();
    assert!(diff > 0.0);
}

#[test]
fn test_reservoir_probability_conservation() {
    let config = ReservoirConfig::new(5).with_seed(42);
    let mut reservoir = QuantumReservoir::new(config).unwrap();

    // Run some updates
    for i in 0..10 {
        let input = Array1::from_vec(vec![i as f64 / 10.0, 0.5, 0.3]);
        reservoir.update(&input).unwrap();
    }

    let probs = reservoir.probability_amplitudes();
    let sum: f64 = probs.sum();

    // Quantum state normalization: sum of |amplitude|^2 = 1
    assert!((sum - 1.0).abs() < 1e-5);
}

#[test]
fn test_reservoir_complex_state() {
    let config = ReservoirConfig::new(4).with_seed(42);
    let reservoir = QuantumReservoir::new(config).unwrap();

    let (real, imag) = reservoir.complex_state();
    assert_eq!(real.len(), 16);
    assert_eq!(imag.len(), 16);
}

#[test]
fn test_reservoir_batch_processing() {
    let config = ReservoirConfig::new(4).with_seed(42);
    let mut reservoir = QuantumReservoir::new(config).unwrap();

    let inputs = Array2::from_shape_fn((100, 3), |(i, j)| ((i + j) as f64 / 103.0).sin());
    let states = reservoir.run(&inputs).unwrap();

    assert_eq!(states.nrows(), 100);
    assert_eq!(states.ncols(), 16);
}

#[test]
fn test_reservoir_washout() {
    let config = ReservoirConfig::new(4)
        .with_washout_steps(10)
        .with_seed(42);
    let mut reservoir = QuantumReservoir::new(config).unwrap();

    let inputs = Array2::from_shape_fn((50, 3), |(i, j)| ((i + j) as f64 / 53.0).sin());
    let states = reservoir.run_with_washout(&inputs).unwrap();

    // Should have 50 - 10 = 40 states after washout
    assert_eq!(states.nrows(), 40);
}

#[test]
fn test_reservoir_reset() {
    let config = ReservoirConfig::new(4).with_seed(42);
    let mut reservoir = QuantumReservoir::new(config).unwrap();

    let input = Array1::from_vec(vec![1.0, 2.0, 3.0]);
    reservoir.update(&input).unwrap();
    assert!(reservoir.steps() > 0);

    reservoir.reset();
    assert_eq!(reservoir.steps(), 0);
}

// =============================================================================
// Attention Fusion Tests
// =============================================================================

#[test]
fn test_attention_fusion_creation() {
    let config = AttentionConfig::new(64, 4);
    let fusion = AttentionFusion::new(config).unwrap();

    assert!(fusion.output_dim().is_none()); // Not initialized yet
}

#[test]
fn test_attention_forward_pass() {
    let config = AttentionConfig::new(32, 4).with_seed(42);
    let mut fusion = AttentionFusion::new(config).unwrap();

    let reservoir_states = Array2::from_shape_fn((20, 16), |(i, j)| ((i + j) as f64 / 36.0).sin());
    let inputs = Array2::from_shape_fn((20, 8), |(i, j)| ((i * j) as f64 / 160.0).cos());

    let output = fusion.forward(&reservoir_states, &inputs).unwrap();

    assert_eq!(output.nrows(), 20);
    assert_eq!(output.ncols(), 32); // attention_dim
}

#[test]
fn test_attention_self_attention() {
    let config = AttentionConfig::new(16, 2).with_seed(42);
    let mut fusion = AttentionFusion::new(config).unwrap();

    let states = Array2::from_shape_fn((10, 16), |(i, j)| ((i + j) as f64 / 26.0).sin());
    let output = fusion.self_attention(&states).unwrap();

    assert_eq!(output.nrows(), 10);
    assert_eq!(output.ncols(), 16);
}

#[test]
fn test_attention_cross_attention() {
    let config = AttentionConfig::new(32, 4).with_seed(42);
    let mut fusion = AttentionFusion::new(config).unwrap();

    let reservoir = Array2::from_shape_fn((10, 16), |(i, j)| ((i + j) as f64 / 26.0).sin());
    // Context must have same sequence length as reservoir for current forward pass
    let context = Array2::from_shape_fn((10, 20), |(i, j)| ((i * j) as f64 / 200.0).cos());

    let output = fusion.cross_attention(&reservoir, &context).unwrap();

    assert_eq!(output.nrows(), 10);
}

#[test]
fn test_attention_causal_mask() {
    let config = AttentionConfig::new(32, 4)
        .with_causal(true)
        .with_seed(42);
    let mut fusion = AttentionFusion::new(config).unwrap();

    let states = Array2::from_shape_fn((5, 16), |(i, j)| ((i + j) as f64 / 21.0).sin());
    let output = fusion.self_attention(&states).unwrap();

    assert_eq!(output.nrows(), 5);
}

#[test]
fn test_temporal_attention() {
    let config = AttentionConfig::new(32, 4).with_seed(42);
    let mut temporal = TemporalAttention::new(config, 100).unwrap();

    let reservoir_states = Array2::from_shape_fn((20, 16), |(i, j)| ((i + j) as f64 / 36.0).sin());
    let inputs = Array2::from_shape_fn((20, 8), |(i, j)| ((i * j) as f64 / 160.0).cos());

    let output = temporal.forward(&reservoir_states, &inputs).unwrap();
    assert_eq!(output.nrows(), 20);
}

// =============================================================================
// Feature Extraction Tests
// =============================================================================

#[test]
fn test_feature_extractor_minimal() {
    let config = FeatureConfig::minimal();
    let extractor = FeatureExtractor::new(config);

    let states = Array2::from_shape_fn((10, 16), |(i, j)| ((i + j) as f64 / 26.0).sin());
    let features = extractor.extract(&states).unwrap();

    assert_eq!(features.nrows(), 10);
    assert_eq!(features.ncols(), 16); // Just raw states
}

#[test]
fn test_feature_extractor_comprehensive() {
    let config = FeatureConfig::comprehensive();
    let extractor = FeatureExtractor::new(config);

    let states = Array2::from_shape_fn((50, 16), |(i, j)| ((i + j) as f64 / 66.0).sin());
    let features = extractor.extract(&states).unwrap();

    assert_eq!(features.nrows(), 50);
    assert!(features.ncols() > 16); // More than raw states
}

#[test]
fn test_feature_extractor_single() {
    let extractor = FeatureExtractor::default_extractor();
    let state = Array1::from_vec(vec![0.1, 0.2, 0.3, 0.4]);

    let features = extractor.extract_single(&state).unwrap();
    assert!(features.len() > 0);
}

#[test]
fn test_quantum_tomography() {
    let reservoir_config = ReservoirConfig::new(4).with_seed(42);
    let reservoir = QuantumReservoir::new(reservoir_config).unwrap();

    let tomography = QuantumTomography::new(4);
    let measurements = tomography.measure(&reservoir).unwrap();

    // Should have measurements for Z, X, Y bases
    assert!(measurements.len() > 0);
}

#[test]
fn test_expectation_values() {
    let reservoir_config = ReservoirConfig::new(3).with_seed(42);
    let reservoir = QuantumReservoir::new(reservoir_config).unwrap();

    let computer = ExpectationComputer::new(3);
    let expectations = computer.compute(&reservoir).unwrap();

    // Should have 8 expectation values (2^3)
    assert_eq!(expectations.len(), 8);

    // Sum should be 1 (probability distribution)
    let sum: f64 = expectations.sum();
    assert!((sum - 1.0).abs() < 1e-6);
}

// =============================================================================
// Time Series Tests
// =============================================================================

#[test]
fn test_sliding_window_creation() {
    let window = SlidingWindow::new(20, 5, 3);

    assert_eq!(window.window_size(), 20);
    assert_eq!(window.step_size(), 5);
    assert_eq!(window.forecast_horizon(), 3);
}

#[test]
fn test_sliding_window_processing() {
    let window = SlidingWindow::new(10, 2, 3);
    let data = Array2::from_shape_fn((50, 2), |(i, j)| (i + j) as f64);

    let (windows, targets) = window.create_windows(&data).unwrap();

    // (50 - 10 - 3) / 2 + 1 = 19 windows
    assert_eq!(windows.len(), 19);
    assert_eq!(targets.len(), 19);
    assert_eq!(windows[0].nrows(), 10);
    assert_eq!(targets[0].nrows(), 3);
}

#[test]
fn test_input_encoder_direct() {
    let encoder = InputEncoder::new(EncodingMethod::Direct, 10);
    let input = Array1::from_vec(vec![1.0, 2.0, 3.0]);

    let encoded = encoder.encode(&input).unwrap();
    assert_eq!(encoded.len(), 3);
}

#[test]
fn test_input_encoder_phase() {
    let encoder = InputEncoder::new(EncodingMethod::Phase, 10);
    let input = Array1::from_vec(vec![0.5, -0.5]);

    let encoded = encoder.encode(&input).unwrap();
    assert_eq!(encoded.len(), 4); // 2 * input_dim
}

#[test]
fn test_input_encoder_amplitude() {
    let encoder = InputEncoder::new(EncodingMethod::Amplitude, 10);
    let input = Array1::from_vec(vec![3.0, 4.0]);

    let encoded = encoder.encode(&input).unwrap();
    let norm: f64 = encoded.iter().map(|x| x * x).sum::<f64>().sqrt();
    assert!((norm - 1.0).abs() < 1e-10);
}

#[test]
fn test_time_series_processor() {
    let ts_config = TimeSeriesConfig::new(3, 20);
    let reservoir_config = ReservoirConfig::new(4).with_seed(42);

    let mut processor = TimeSeriesProcessor::new(ts_config, reservoir_config).unwrap();

    let window = Array2::from_shape_fn((20, 3), |(i, j)| ((i + j) as f64 / 23.0).sin());
    let features = processor.process_window(&window).unwrap();

    assert_eq!(features.nrows(), 20);
    assert!(features.ncols() > 0);
}

#[test]
fn test_prediction_head() {
    let mut head = PredictionHead::new(2, 5);
    head.initialize(20);

    assert!(head.is_initialized());

    let features = Array1::from_vec((0..20).map(|i| i as f64 / 20.0).collect());
    let predictions = head.forward(&features).unwrap();

    assert_eq!(predictions.nrows(), 5); // horizon
    assert_eq!(predictions.ncols(), 2); // output_dim
}

// =============================================================================
// Training Tests
// =============================================================================

#[test]
fn test_ridge_regression_basic() {
    let config = RidgeConfig::new(0.1);
    let mut model = RidgeRegression::new(config).unwrap();

    let features = Array2::from_shape_fn((50, 5), |(i, j)| ((i * j) as f64 / 250.0).sin());
    let targets = Array2::from_shape_fn((50, 1), |(i, _)| features[[i, 0]] * 2.0);

    model.fit(&features, &targets).unwrap();
    assert!(model.is_trained());

    let predictions = model.predict(&features).unwrap();
    assert_eq!(predictions.nrows(), 50);
    assert_eq!(predictions.ncols(), 1);
}

#[test]
fn test_ridge_regression_score() {
    let config = RidgeConfig::new(0.01);
    let mut model = RidgeRegression::new(config).unwrap();

    let features = Array2::from_shape_fn((100, 3), |(i, j)| ((i + j) as f64 / 103.0));
    let targets = Array2::from_shape_fn((100, 1), |(i, _)| {
        features[[i, 0]] + 2.0 * features[[i, 1]] + 3.0 * features[[i, 2]]
    });

    model.fit(&features, &targets).unwrap();
    let score = model.score(&features, &targets).unwrap();

    assert!(score > 0.99); // Should be very high for linear relationship
}

#[test]
fn test_ridge_regression_multioutput() {
    let config = RidgeConfig::new(0.1);
    let mut model = RidgeRegression::new(config).unwrap();

    let features = Array2::from_shape_fn((50, 10), |(i, j)| ((i + j) as f64 / 60.0).sin());
    let targets = Array2::from_shape_fn((50, 3), |(i, j)| {
        features[[i, j * 3]] + features[[i, j * 3 + 1]]
    });

    model.fit(&features, &targets).unwrap();
    let predictions = model.predict(&features).unwrap();

    assert_eq!(predictions.nrows(), 50);
    assert_eq!(predictions.ncols(), 3);
}

#[test]
fn test_ridge_cg_solver() {
    let config = RidgeConfig::new(0.1).with_solver(RidgeSolver::ConjugateGradient);
    let mut model = RidgeRegression::new(config).unwrap();

    let features = Array2::from_shape_fn((30, 5), |(i, j)| ((i + j) as f64 / 35.0));
    let targets = Array2::from_shape_fn((30, 1), |(i, _)| features[[i, 0]] + features[[i, 2]]);

    model.fit(&features, &targets).unwrap();
    assert!(model.is_trained());
}

#[test]
fn test_online_learner() {
    let mut learner = OnlineLearner::default_learner();

    let features = Array1::from_vec(vec![1.0, 2.0, 3.0]);
    let target = Array1::from_vec(vec![6.0]);

    let loss = learner.update(&features, &target).unwrap();
    assert!(loss >= 0.0);
    assert!(learner.is_initialized());
}

#[test]
fn test_online_learner_convergence() {
    let mut learner = OnlineLearner::new(0.01, 0.9, 0.0);

    let features = Array2::from_shape_fn((100, 3), |(i, j)| ((i + j) as f64 / 103.0));
    let targets = Array2::from_shape_fn((100, 1), |(i, _)| {
        features[[i, 0]] + features[[i, 1]] + features[[i, 2]]
    });

    // Train for multiple epochs and check final loss is reasonable
    let mut final_loss = 0.0;
    for _ in 0..100 {
        final_loss = learner.update_batch(&features, &targets).unwrap();
    }
    // After sufficient training, loss should be relatively small
    assert!(final_loss < 1.0, "Final loss {} should be < 1.0", final_loss);
}

#[test]
fn test_hyperparameter_optimizer() {
    let mut optimizer = HyperparameterOptimizer::new(vec![0.01, 0.1, 1.0, 10.0], 3);

    let features = Array2::from_shape_fn((30, 5), |(i, j)| ((i * j) as f64 / 150.0));
    let targets = Array2::from_shape_fn((30, 1), |(i, _)| features[[i, 0]] * 2.0);

    let best_alpha = optimizer.optimize(&features, &targets).unwrap();

    assert!(best_alpha > 0.0);
    assert!(optimizer.best_score().is_some());
}

// =============================================================================
// End-to-End Integration Tests
// =============================================================================

#[test]
fn test_full_pipeline_without_attention() {
    // Create reservoir
    let reservoir_config = ReservoirConfig::new(5)
        .with_spectral_radius(0.9)
        .with_seed(42);
    let mut reservoir = QuantumReservoir::new(reservoir_config).unwrap();

    // Generate synthetic data
    let n_samples = 200;
    let data: Vec<f64> = (0..n_samples).map(|i| (i as f64 * 0.1).sin()).collect();
    let inputs = Array2::from_shape_vec((n_samples, 1), data).unwrap();

    // Run through reservoir with washout
    let states = reservoir.run_with_washout(&inputs).unwrap();

    // Extract features
    let extractor = FeatureExtractor::default_extractor();
    let features = extractor.extract(&states).unwrap();

    // Prepare targets (predict next value)
    let washout = reservoir.config().washout_steps;
    let targets: Vec<f64> = (washout..(n_samples - 1)).map(|i| (i as f64 * 0.1).sin()).collect();
    let targets = Array2::from_shape_vec((targets.len(), 1), targets).unwrap();

    // Ensure dimensions match
    let n_train = targets.nrows().min(features.nrows() - 1);
    let train_features = features.slice(ndarray::s![..n_train, ..]).to_owned();
    let train_targets = targets.slice(ndarray::s![..n_train, ..]).to_owned();

    // Train model
    let mut model = RidgeRegression::default_model().unwrap();
    model.fit(&train_features, &train_targets).unwrap();

    // Check performance
    let score = model.score(&train_features, &train_targets).unwrap();
    assert!(score > 0.0); // Should have some predictive power
}

#[test]
fn test_full_pipeline_with_attention() {
    // Create reservoir
    let reservoir_config = ReservoirConfig::new(4).with_seed(42);
    let mut reservoir = QuantumReservoir::new(reservoir_config).unwrap();

    // Create attention
    let attention_config = AttentionConfig::new(32, 4).with_seed(42);
    let mut attention = AttentionFusion::new(attention_config).unwrap();

    // Generate input
    let inputs = Array2::from_shape_fn((50, 4), |(i, j)| ((i * j) as f64 / 200.0).sin());

    // Run through reservoir
    let states = reservoir.run(&inputs).unwrap();

    // Apply attention
    let fused = attention.forward(&states, &inputs).unwrap();

    // Extract features
    let extractor = FeatureExtractor::new(FeatureConfig::minimal());
    let features = extractor.extract(&fused).unwrap();

    assert_eq!(features.nrows(), 50);
    assert!(features.ncols() > 0);
}

#[test]
fn test_time_series_forecasting_pipeline() {
    // Configuration
    let ts_config = TimeSeriesConfig::new(1, 30)
        .with_forecast_horizon(5)
        .with_step_size(1);
    let reservoir_config = ReservoirConfig::new(4).with_seed(42);

    // Create processor
    let mut processor = TimeSeriesProcessor::new(ts_config, reservoir_config).unwrap();

    // Generate sine wave data
    let data = Array2::from_shape_fn((200, 1), |(i, _)| (i as f64 * 0.1).sin());

    // Prepare training data
    let (features, targets) = processor.prepare_training_data(&data).unwrap();

    assert!(features.len() > 0);
    assert!(targets.len() > 0);
    assert_eq!(features.len(), targets.len());
}

#[test]
fn test_quantum_features_integration() {
    // Create reservoir
    let config = ReservoirConfig::new(4).with_seed(42);
    let mut reservoir = QuantumReservoir::new(config).unwrap();

    // Update with some inputs
    for i in 0..20 {
        let input = Array1::from_vec(vec![(i as f64 * 0.1).sin(), (i as f64 * 0.1).cos()]);
        reservoir.update(&input).unwrap();
    }

    // Get quantum measurements
    let tomography = QuantumTomography::new(4);
    let measurements = tomography.measure(&reservoir).unwrap();

    // Get expectation values
    let computer = ExpectationComputer::new(4);
    let expectations = computer.compute(&reservoir).unwrap();

    // Both should produce valid results
    assert!(measurements.len() > 0);
    assert_eq!(expectations.len(), 16);
}

#[test]
fn test_reproducibility_with_seed() {
    // Reservoir weights are deterministic with seed, but update has noise.
    // Test that initial weights matrix is reproducible.
    let config = ReservoirConfig::new(4)
        .with_seed(12345)
        .with_noise_level(0.0); // Disable noise for reproducibility

    let reservoir1 = QuantumReservoir::new(config.clone()).unwrap();
    let reservoir2 = QuantumReservoir::new(config).unwrap();

    // Weight matrices should be identical with same seed
    let weights1 = reservoir1.weights();
    let weights2 = reservoir2.weights();

    for (a, b) in weights1.iter().zip(weights2.iter()) {
        assert!(
            (a - b).abs() < 1e-10,
            "Weights should be reproducible with same seed"
        );
    }
}

#[test]
fn test_error_handling() {
    // Invalid reservoir config
    let result = ReservoirConfig::new(0).validate();
    assert!(result.is_err());

    // Invalid attention config
    let result = AttentionConfig::new(0, 4).validate();
    assert!(result.is_err());

    // Dimension mismatch
    let config = ReservoirConfig::new(4).with_seed(42);
    let mut reservoir = QuantumReservoir::new(config).unwrap();

    let input1 = Array1::from_vec(vec![1.0, 2.0, 3.0]);
    reservoir.update(&input1).unwrap();

    let input2 = Array1::from_vec(vec![1.0, 2.0]); // Different dimension
    let result = reservoir.update(&input2);
    assert!(result.is_err());
}
