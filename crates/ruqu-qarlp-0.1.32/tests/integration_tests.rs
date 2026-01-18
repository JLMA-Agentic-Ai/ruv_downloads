//! Integration tests for ruqu-qarlp crate.
//!
//! These tests verify end-to-end functionality of the quantum RL system,
//! including policy networks, gradient computation, environment interaction,
//! and training loops.

use rand::SeedableRng;
use ruqu_qarlp::prelude::*;

// ============================================================================
// Policy Network Tests
// ============================================================================

#[test]
fn test_policy_creation_with_defaults() {
    let config = PolicyConfig::default();
    let policy = QuantumPolicy::new(config).unwrap();

    assert_eq!(policy.num_parameters(), 16); // 2 layers * 4 qubits * 2 params
}

#[test]
fn test_policy_creation_custom_config() {
    let config = PolicyConfig {
        num_qubits: 6,
        num_layers: 3,
        num_actions: 4,
        temperature: 0.5,
        use_entanglement: true,
        seed: Some(42),
    };
    let policy = QuantumPolicy::new(config).unwrap();

    assert_eq!(policy.num_parameters(), 36); // 3 layers * 6 qubits * 2 params
}

#[test]
fn test_policy_forward_produces_valid_probabilities() {
    let config = PolicyConfig {
        num_qubits: 4,
        num_layers: 2,
        num_actions: 4,
        seed: Some(42),
        ..Default::default()
    };
    let policy = QuantumPolicy::new(config).unwrap();

    let state = vec![0.1, 0.2, 0.3, 0.4];
    let probs = policy.forward(&state).unwrap();

    // Check probabilities are valid
    assert_eq!(probs.len(), 4);
    assert!(probs.iter().all(|&p| p >= 0.0 && p <= 1.0));
    assert!((probs.sum() - 1.0).abs() < 1e-6);
}

#[test]
fn test_policy_sampling_is_stochastic() {
    let config = PolicyConfig {
        seed: Some(42),
        ..Default::default()
    };
    let policy = QuantumPolicy::new(config).unwrap();
    let state = vec![0.5, -0.3, 0.1, 0.8];

    // Sample many actions
    let mut rng = rand::rngs::StdRng::seed_from_u64(123);
    let mut action_counts = [0usize; 2];

    for _ in 0..1000 {
        let action = policy.sample_action(&state, &mut rng).unwrap();
        action_counts[action] += 1;
    }

    // Both actions should be sampled
    assert!(action_counts[0] > 0);
    assert!(action_counts[1] > 0);
}

#[test]
fn test_policy_temperature_affects_entropy() {
    let state = vec![0.5, -0.3, 0.1, 0.8];

    // Low temperature (more deterministic)
    let low_temp = PolicyConfig {
        temperature: 0.1,
        seed: Some(42),
        ..Default::default()
    };
    let policy_low = QuantumPolicy::new(low_temp).unwrap();
    let entropy_low = policy_low.entropy(&state).unwrap();

    // High temperature (more random)
    let high_temp = PolicyConfig {
        temperature: 5.0,
        seed: Some(42),
        ..Default::default()
    };
    let policy_high = QuantumPolicy::new(high_temp).unwrap();
    let entropy_high = policy_high.entropy(&state).unwrap();

    // Higher temperature should give higher entropy
    assert!(entropy_high > entropy_low);
}

#[test]
fn test_policy_log_prob_consistency() {
    let config = PolicyConfig {
        seed: Some(42),
        ..Default::default()
    };
    let policy = QuantumPolicy::new(config).unwrap();
    let state = vec![0.5, -0.3, 0.1, 0.8];

    // Get probabilities and log probabilities
    let probs = policy.forward(&state).unwrap();
    let log_prob_0 = policy.log_prob(&state, 0).unwrap();
    let log_prob_1 = policy.log_prob(&state, 1).unwrap();

    // Check consistency
    assert!((probs[0].ln() - log_prob_0).abs() < 1e-6);
    assert!((probs[1].ln() - log_prob_1).abs() < 1e-6);
}

#[test]
fn test_policy_parameter_update() {
    let config = PolicyConfig {
        num_qubits: 2,
        num_layers: 1,
        num_actions: 2,
        seed: Some(42),
        ..Default::default()
    };
    let mut policy = QuantumPolicy::new(config).unwrap();

    let original_params = policy.get_parameters_flat();
    let new_params: Vec<f64> = original_params.iter().map(|&p| p + 0.1).collect();

    policy.set_parameters(&new_params).unwrap();

    let retrieved = policy.get_parameters_flat();
    assert_eq!(retrieved, new_params);
}

// ============================================================================
// Environment Tests
// ============================================================================

#[test]
fn test_gridworld_navigation() {
    let config = GridWorldConfig {
        width: 3,
        height: 3,
        goal: (2, 2),
        start: Some((0, 0)),
        max_steps: 100,
        ..Default::default()
    };
    let mut env = GridWorld::new(config).unwrap();

    env.reset().unwrap();

    // Move right twice, up twice
    env.step(3).unwrap(); // Right
    env.step(3).unwrap(); // Right
    env.step(0).unwrap(); // Up
    let result = env.step(0).unwrap(); // Up - should reach goal

    assert!(result.done);
    assert_eq!(result.reward, 10.0);
}

#[test]
fn test_gridworld_boundary_constraints() {
    let config = GridWorldConfig {
        width: 2,
        height: 2,
        goal: (1, 1),
        start: Some((0, 0)),
        ..Default::default()
    };
    let mut env = GridWorld::new(config).unwrap();

    env.reset().unwrap();

    // Try to move left from (0,0) - should stay in place
    env.step(2).unwrap(); // Left
    env.step(1).unwrap(); // Down

    let state = env.state().unwrap();
    // Should still be at (0, 0) normalized
    assert_eq!(state[0], 0.0);
    assert_eq!(state[1], 0.0);
}

#[test]
fn test_cartpole_physics() {
    let config = CartPoleConfig {
        max_steps: 100,
        seed: Some(42),
        ..Default::default()
    };
    let mut env = CartPole::new(config).unwrap();

    let initial_state = env.reset().unwrap();

    // Take a few steps
    let mut prev_state = initial_state;
    for _ in 0..5 {
        if env.is_done() {
            break;
        }
        let result = env.step(1).unwrap(); // Push right

        // State should change
        assert!(result.state != prev_state || result.done);
        prev_state = result.state;
    }
}

#[test]
fn test_binary_choice_reward_structure() {
    let mut env = BinaryChoice::new(100).unwrap();
    env.reset().unwrap();

    let state = env.state().unwrap();
    let correct_action = if state[0] < 0.0 { 0 } else { 1 };
    let wrong_action = 1 - correct_action;

    // Correct action should give +1
    let result_correct = env.step(correct_action).unwrap();
    assert_eq!(result_correct.reward, 1.0);

    // Next step with wrong action should give -1
    let state2 = result_correct.state;
    let correct_action2 = if state2[0] < 0.0 { 0 } else { 1 };
    let wrong_action2 = 1 - correct_action2;

    let result_wrong = env.step(wrong_action2).unwrap();
    assert_eq!(result_wrong.reward, -1.0);
}

#[test]
fn test_environment_trait_polymorphism() {
    fn run_episode<E: Environment>(env: &mut E) -> f64 {
        let _ = env.reset().unwrap();
        let mut total_reward = 0.0;

        for _ in 0..env.max_steps() {
            if env.is_done() {
                break;
            }
            let result = env.step(0).unwrap();
            total_reward += result.reward;
            if result.done {
                break;
            }
        }
        total_reward
    }

    let mut gridworld = GridWorld::new(GridWorldConfig::default()).unwrap();
    let mut binary = BinaryChoice::new(10).unwrap();

    let _reward1 = run_episode(&mut gridworld);
    let _reward2 = run_episode(&mut binary);

    // Both should run without errors
}

// ============================================================================
// Gradient Computation Tests
// ============================================================================

#[test]
fn test_gradient_computation_shape() {
    let policy_config = PolicyConfig {
        num_qubits: 4,
        num_layers: 2,
        num_actions: 2,
        seed: Some(42),
        ..Default::default()
    };
    let policy = QuantumPolicy::new(policy_config).unwrap();

    let mut trajectory = Trajectory::new();
    for _ in 0..10 {
        trajectory.push(Experience {
            state: vec![0.1, 0.2, 0.3, 0.4],
            action: 0,
            reward: 1.0,
            next_state: vec![0.2, 0.3, 0.4, 0.5],
            done: false,
            log_prob: -0.5,
        });
    }

    let config = GradientConfig::default();
    let mut pg = PolicyGradient::new(config).unwrap();

    let gradients = pg.compute_gradient(&policy, &trajectory).unwrap();

    assert_eq!(gradients.len(), policy.num_parameters());
    assert!(gradients.iter().all(|g| g.is_finite()));
}

#[test]
fn test_gradient_clipping() {
    let policy_config = PolicyConfig {
        num_qubits: 4,
        num_layers: 1,
        num_actions: 2,
        seed: Some(42),
        ..Default::default()
    };
    let policy = QuantumPolicy::new(policy_config).unwrap();

    let mut trajectory = Trajectory::new();
    for _ in 0..5 {
        trajectory.push(Experience {
            state: vec![0.1, 0.2, 0.3, 0.4],
            action: 0,
            reward: 100.0, // Large reward to produce large gradients
            next_state: vec![0.2, 0.3, 0.4, 0.5],
            done: false,
            log_prob: -0.5,
        });
    }

    let config = GradientConfig {
        clip_threshold: 0.5,
        ..Default::default()
    };
    let mut pg = PolicyGradient::new(config).unwrap();

    let gradients = pg.compute_gradient(&policy, &trajectory).unwrap();
    let norm = gradients.iter().map(|g| g * g).sum::<f64>().sqrt();

    // Norm should be clipped
    assert!(norm <= 0.5 + 1e-6);
}

#[test]
fn test_returns_computation() {
    let mut trajectory = Trajectory::new();
    trajectory.push(Experience {
        state: vec![0.0; 4],
        action: 0,
        reward: 1.0,
        next_state: vec![0.0; 4],
        done: false,
        log_prob: -0.5,
    });
    trajectory.push(Experience {
        state: vec![0.0; 4],
        action: 0,
        reward: 2.0,
        next_state: vec![0.0; 4],
        done: false,
        log_prob: -0.5,
    });
    trajectory.push(Experience {
        state: vec![0.0; 4],
        action: 0,
        reward: 3.0,
        next_state: vec![0.0; 4],
        done: true,
        log_prob: -0.5,
    });

    let gamma = 0.9;
    let returns = trajectory.compute_returns(gamma);

    // R_2 = 3.0
    // R_1 = 2.0 + 0.9 * 3.0 = 4.7
    // R_0 = 1.0 + 0.9 * 4.7 = 5.23
    assert!((returns[2] - 3.0).abs() < 1e-6);
    assert!((returns[1] - 4.7).abs() < 1e-6);
    assert!((returns[0] - 5.23).abs() < 1e-6);
}

#[test]
fn test_gae_computation() {
    let rewards = vec![1.0, 1.0, 1.0];
    let values = vec![0.5, 0.5, 0.5, 0.0];
    let gamma = 0.99;
    let lambda = 0.95;

    let advantages = compute_gae(&rewards, &values, gamma, lambda);

    assert_eq!(advantages.len(), 3);
    assert!(advantages.iter().all(|a| a.is_finite()));
}

#[test]
fn test_advantage_normalization() {
    let mut advantages = vec![1.0, 2.0, 3.0, 4.0, 5.0];
    normalize_advantages(&mut advantages);

    // Mean should be ~0
    let mean: f64 = advantages.iter().sum::<f64>() / advantages.len() as f64;
    assert!(mean.abs() < 1e-6);

    // Variance should be ~1
    let var: f64 = advantages.iter().map(|a| a.powi(2)).sum::<f64>() / advantages.len() as f64;
    assert!((var - 1.0).abs() < 1e-6);
}

// ============================================================================
// Buffer Tests
// ============================================================================

#[test]
fn test_replay_buffer_circular_behavior() {
    let config = BufferConfig {
        capacity: 5,
        ..Default::default()
    };
    let mut buffer = ReplayBuffer::new(config).unwrap();

    // Add 10 experiences (should wrap around)
    for i in 0..10 {
        buffer.push(
            Experience {
                state: vec![i as f64; 4],
                action: 0,
                reward: i as f64,
                next_state: vec![(i + 1) as f64; 4],
                done: false,
                log_prob: -0.5,
            },
            None,
        );
    }

    assert_eq!(buffer.len(), 5);
    assert_eq!(buffer.total_added(), 10);
}

#[test]
fn test_prioritized_replay_sampling() {
    let config = BufferConfig {
        capacity: 100,
        alpha: 0.6,
        beta: 0.4,
        ..Default::default()
    };
    let mut buffer = ReplayBuffer::new(config).unwrap();

    // Add experiences with varying priorities
    for i in 0..50 {
        buffer.push(
            Experience {
                state: vec![i as f64; 4],
                action: 0,
                reward: 1.0,
                next_state: vec![(i + 1) as f64; 4],
                done: false,
                log_prob: -0.5,
            },
            Some((i + 1) as f64), // Higher priority for later experiences
        );
    }

    let batch = buffer.sample(20).unwrap();

    assert_eq!(batch.experiences.len(), 20);
    assert_eq!(batch.weights.len(), 20);

    // Weights should be normalized (max = 1)
    let max_weight = batch.weights.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
    assert!((max_weight - 1.0).abs() < 1e-6);
}

#[test]
fn test_trajectory_buffer_operations() {
    let mut buffer = TrajectoryBuffer::new(10).unwrap();

    for _ in 0..5 {
        let mut traj = Trajectory::new();
        for j in 0..3 {
            traj.push(Experience {
                state: vec![0.0; 4],
                action: 0,
                reward: (j + 1) as f64,
                next_state: vec![0.0; 4],
                done: j == 2,
                log_prob: -0.5,
            });
        }
        buffer.push(traj);
    }

    assert_eq!(buffer.len(), 5);
    assert_eq!(buffer.total_experiences(), 15);
    assert_eq!(buffer.average_length(), 3.0);

    // Drain and verify
    let trajectories = buffer.drain();
    assert_eq!(trajectories.len(), 5);
    assert!(buffer.is_empty());
}

// ============================================================================
// Training Tests
// ============================================================================

#[test]
fn test_training_produces_learning_signal() {
    let policy_config = PolicyConfig {
        num_qubits: 4,
        num_layers: 1,
        num_actions: 4,
        seed: Some(42),
        ..Default::default()
    };
    let policy = QuantumPolicy::new(policy_config).unwrap();
    let initial_params = policy.get_parameters_flat();

    let env = GridWorld::new(GridWorldConfig::default()).unwrap();

    let trainer_config = TrainerConfig {
        episodes_per_update: 5,
        max_steps_per_episode: 30,
        verbose: false,
        seed: Some(42),
        ..Default::default()
    };
    let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

    trainer.train(5).unwrap();

    let final_params = trainer.policy().get_parameters_flat();

    // Parameters should have changed
    let changed = initial_params
        .iter()
        .zip(final_params.iter())
        .any(|(a, b)| (a - b).abs() > 1e-10);

    assert!(changed, "Parameters should change during training");
}

#[test]
fn test_training_metrics_recorded() {
    let policy = QuantumPolicy::new(PolicyConfig::default()).unwrap();
    let env = GridWorld::new(GridWorldConfig::default()).unwrap();

    let trainer_config = TrainerConfig {
        episodes_per_update: 3,
        max_steps_per_episode: 20,
        verbose: false,
        ..Default::default()
    };
    let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

    let result = trainer.train(3).unwrap();

    assert_eq!(result.history.len(), 3);
    assert_eq!(result.total_iterations, 3);
    assert_eq!(result.total_episodes, 9); // 3 iterations * 3 episodes

    for metrics in &result.history {
        assert!(metrics.average_reward.is_finite());
        assert!(metrics.gradient_norm.is_finite());
        assert!(metrics.average_length > 0.0);
    }
}

#[test]
fn test_evaluation_without_training() {
    let policy = QuantumPolicy::new(PolicyConfig::default()).unwrap();
    let env = GridWorld::new(GridWorldConfig::default()).unwrap();

    let trainer_config = TrainerConfig {
        episodes_per_update: 5,
        max_steps_per_episode: 30,
        verbose: false,
        ..Default::default()
    };
    let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

    let eval_result = trainer.evaluate(10).unwrap();

    assert_eq!(eval_result.num_episodes, 10);
    assert!(eval_result.average_reward.is_finite());
    assert!(eval_result.std_reward >= 0.0);
}

#[test]
fn test_early_stopping() {
    let policy = QuantumPolicy::new(PolicyConfig::default()).unwrap();
    let env = GridWorld::new(GridWorldConfig::default()).unwrap();

    let trainer_config = TrainerConfig {
        episodes_per_update: 3,
        max_steps_per_episode: 20,
        early_stop_reward: Some(-100.0), // Very easy threshold
        verbose: false,
        ..Default::default()
    };
    let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

    let result = trainer.train(100).unwrap();

    assert!(result.converged);
    assert!(result.total_iterations < 100);
}

#[test]
fn test_temperature_annealing_during_training() {
    let policy_config = PolicyConfig {
        temperature: 1.0,
        ..Default::default()
    };
    let policy = QuantumPolicy::new(policy_config).unwrap();
    let env = GridWorld::new(GridWorldConfig::default()).unwrap();

    let trainer_config = TrainerConfig {
        episodes_per_update: 2,
        max_steps_per_episode: 10,
        initial_temperature: 1.0,
        final_temperature: 0.1,
        temperature_decay: 0.8,
        verbose: false,
        ..Default::default()
    };
    let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

    trainer.train(10).unwrap();

    // Temperature should have decreased
    let final_temp = trainer.policy().config().temperature;
    assert!(final_temp < 1.0);
    assert!(final_temp >= 0.1);
}

// ============================================================================
// Integration Tests
// ============================================================================

#[test]
fn test_full_training_loop_gridworld() {
    let policy_config = PolicyConfig {
        num_qubits: 4,
        num_layers: 2,
        num_actions: 4,
        seed: Some(42),
        ..Default::default()
    };
    let policy = QuantumPolicy::new(policy_config).unwrap();

    let env_config = GridWorldConfig {
        width: 3,
        height: 3,
        goal: (2, 2),
        start: Some((0, 0)),
        max_steps: 30,
        ..Default::default()
    };
    let env = GridWorld::new(env_config).unwrap();

    let trainer_config = TrainerConfig {
        episodes_per_update: 10,
        max_steps_per_episode: 30,
        verbose: false,
        seed: Some(42),
        gradient_config: GradientConfig {
            learning_rate: 0.02,
            gamma: 0.99,
            ..Default::default()
        },
        ..Default::default()
    };
    let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

    let result = trainer.train(10).unwrap();

    // Verify training completed successfully
    assert_eq!(result.total_iterations, 10);
    assert!(result.final_average_reward.is_finite());
    assert!(result.best_average_reward.is_finite());
}

#[test]
fn test_full_training_loop_cartpole() {
    let policy_config = PolicyConfig {
        num_qubits: 4,
        num_layers: 2,
        num_actions: 2,
        seed: Some(42),
        ..Default::default()
    };
    let policy = QuantumPolicy::new(policy_config).unwrap();

    let env_config = CartPoleConfig {
        max_steps: 100,
        seed: Some(42),
        ..Default::default()
    };
    let env = CartPole::new(env_config).unwrap();

    let trainer_config = TrainerConfig {
        episodes_per_update: 10,
        max_steps_per_episode: 100,
        verbose: false,
        seed: Some(42),
        ..Default::default()
    };
    let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

    let result = trainer.train(5).unwrap();

    assert_eq!(result.total_iterations, 5);
    assert!(result.total_episodes > 0);
}

#[test]
fn test_full_training_loop_binary_choice() {
    let policy_config = PolicyConfig {
        num_qubits: 4,
        num_layers: 2,
        num_actions: 2,
        seed: Some(42),
        ..Default::default()
    };
    let policy = QuantumPolicy::new(policy_config).unwrap();

    let env = BinaryChoice::new(20).unwrap();

    let trainer_config = TrainerConfig {
        episodes_per_update: 20,
        max_steps_per_episode: 20,
        verbose: false,
        seed: Some(42),
        gradient_config: GradientConfig {
            learning_rate: 0.05,
            ..Default::default()
        },
        ..Default::default()
    };
    let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

    let result = trainer.train(10).unwrap();

    // Should complete without errors
    assert_eq!(result.total_iterations, 10);
}

#[test]
fn test_batch_gradient_update() {
    let policy_config = PolicyConfig {
        num_qubits: 4,
        num_layers: 1,
        num_actions: 2,
        seed: Some(42),
        ..Default::default()
    };
    let policy = QuantumPolicy::new(policy_config).unwrap();

    // Create multiple trajectories
    let mut trajectories = Vec::new();
    for _ in 0..5 {
        let mut traj = Trajectory::new();
        for _ in 0..10 {
            traj.push(Experience {
                state: vec![0.1, 0.2, 0.3, 0.4],
                action: 0,
                reward: 1.0,
                next_state: vec![0.2, 0.3, 0.4, 0.5],
                done: false,
                log_prob: -0.5,
            });
        }
        trajectories.push(traj);
    }

    let config = GradientConfig::default();
    let mut pg = PolicyGradient::new(config).unwrap();

    let gradients = pg.compute_batch_gradient(&policy, &trajectories).unwrap();

    assert_eq!(gradients.len(), policy.num_parameters());
    assert!(gradients.iter().all(|g| g.is_finite()));
}

#[test]
fn test_serialization_roundtrip() {
    let checkpoint = Checkpoint {
        iteration: 50,
        parameters: vec![0.1, 0.2, 0.3, 0.4],
        temperature: 0.5,
        best_average_reward: 8.5,
        best_iteration: 40,
    };

    let json = serde_json::to_string(&checkpoint).unwrap();
    let deserialized: Checkpoint = serde_json::from_str(&json).unwrap();

    assert_eq!(deserialized.iteration, 50);
    assert_eq!(deserialized.parameters, vec![0.1, 0.2, 0.3, 0.4]);
    assert_eq!(deserialized.temperature, 0.5);
}

#[test]
fn test_error_handling_chain() {
    // Test that errors propagate correctly
    let config = PolicyConfig {
        num_qubits: 0, // Invalid
        ..Default::default()
    };
    let result = QuantumPolicy::new(config);

    assert!(result.is_err());
    let err = result.unwrap_err();
    assert!(matches!(err, PolicyError::InvalidQubitCount { .. }));
}

#[test]
fn test_concurrent_policy_usage() {
    // Test that policy can be cloned and used independently
    let config = PolicyConfig {
        seed: Some(42),
        ..Default::default()
    };
    let policy1 = QuantumPolicy::new(config).unwrap();
    let mut policy2 = policy1.clone();

    let state = vec![0.5, -0.3, 0.1, 0.8];

    // Modify policy2
    let new_params: Vec<f64> = policy2
        .get_parameters_flat()
        .iter()
        .map(|&p| p + 0.5)
        .collect();
    policy2.set_parameters(&new_params).unwrap();

    // policy1 should be unchanged
    let probs1 = policy1.forward(&state).unwrap();
    let probs2 = policy2.forward(&state).unwrap();

    assert!(probs1 != probs2);
}

#[test]
fn test_environment_state_consistency() {
    let config = GridWorldConfig::default();
    let mut env = GridWorld::new(config).unwrap();

    let state1 = env.reset().unwrap();
    let state2 = env.state().unwrap();

    assert_eq!(state1, state2);
}

#[test]
fn test_training_reproducibility() {
    // Two trainers with same seed should produce same results
    fn train_with_seed(seed: u64) -> f64 {
        let policy_config = PolicyConfig {
            seed: Some(seed),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(policy_config).unwrap();
        let env = GridWorld::new(GridWorldConfig::default()).unwrap();

        let trainer_config = TrainerConfig {
            episodes_per_update: 3,
            max_steps_per_episode: 20,
            verbose: false,
            seed: Some(seed),
            ..Default::default()
        };
        let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

        let result = trainer.train(3).unwrap();
        result.final_average_reward
    }

    let result1 = train_with_seed(42);
    let result2 = train_with_seed(42);

    assert_eq!(result1, result2);
}
