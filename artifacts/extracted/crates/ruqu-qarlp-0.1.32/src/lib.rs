//! # ruqu-qarlp: Quantum-Assisted Reinforcement Learning Policy
//!
//! A Rust implementation of quantum-assisted reinforcement learning using
//! variational quantum circuits as policy networks. This crate provides
//! a complete framework for training quantum RL agents.
//!
//! ## Overview
//!
//! This crate implements the QARLP (Quantum-Assisted Reinforcement Learning Policy)
//! algorithm, which uses variational quantum circuits (VQCs) to represent policies
//! in reinforcement learning. The key components are:
//!
//! - **Quantum Policy Network**: A variational quantum circuit that maps states to
//!   action probabilities through parameterized rotation gates.
//!
//! - **Policy Gradient**: REINFORCE algorithm with baseline subtraction, using the
//!   parameter-shift rule for exact gradient computation on quantum circuits.
//!
//! - **Environment Interface**: Generic trait for RL environments, with included
//!   implementations of GridWorld and CartPole for testing.
//!
//! - **Training Loop**: Complete training infrastructure with checkpointing,
//!   logging, and metrics.
//!
//! ## Architecture
//!
//! The quantum policy network consists of:
//!
//! 1. **State Encoding**: Classical state vectors are encoded as rotation angles
//!    on qubits using RX gates.
//!
//! 2. **Variational Layers**: Parameterized RY and RZ rotations with CNOT
//!    entanglement gates form the trainable part of the circuit.
//!
//! 3. **Measurement**: Computational basis measurement probabilities are mapped
//!    to action probabilities via softmax.
//!
//! ## Example
//!
//! ```
//! use ruqu_qarlp::prelude::*;
//!
//! // Create a quantum policy
//! let policy_config = PolicyConfig {
//!     num_qubits: 4,
//!     num_layers: 2,
//!     num_actions: 4,
//!     ..Default::default()
//! };
//! let policy = QuantumPolicy::new(policy_config).unwrap();
//!
//! // Create an environment
//! let env_config = GridWorldConfig::default();
//! let env = GridWorld::new(env_config).unwrap();
//!
//! // Create trainer and train
//! let trainer_config = TrainerConfig {
//!     episodes_per_update: 10,
//!     max_steps_per_episode: 100,
//!     ..Default::default()
//! };
//! let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();
//!
//! // Train for 100 iterations
//! let result = trainer.train(100).unwrap();
//! println!("Final reward: {}", result.final_average_reward);
//! ```
//!
//! ## Tier 3 Capability (Exploratory)
//!
//! This crate represents a Tier 3 (Score 69) exploratory quantum RL implementation.
//! The two-week test criteria are:
//!
//! - Policy gradient update works correctly
//! - Simple environment shows learning signal
//!
//! ## Features
//!
//! - `parallel`: Enable parallel gradient computation using rayon (not yet implemented)
//!
//! ## References
//!
//! - Schuld, M., & Petruccione, F. (2018). Supervised Learning with Quantum Computers
//! - Mitarai, K., et al. (2018). Quantum circuit learning
//! - Jerbi, S., et al. (2021). Parametrized quantum policies for reinforcement learning

#![warn(missing_docs)]
#![warn(clippy::all)]
#![deny(unsafe_code)]

pub mod buffer;
pub mod environment;
pub mod error;
pub mod gradient;
pub mod policy;
pub mod training;

/// Prelude module for convenient imports.
pub mod prelude {
    pub use crate::buffer::{BufferConfig, ReplayBuffer, SampleBatch, TrajectoryBuffer};
    pub use crate::environment::{
        BinaryChoice, CartPole, CartPoleConfig, Environment, GridWorld, GridWorldConfig, StepResult,
    };
    pub use crate::error::{
        BufferError, EnvironmentError, GradientError, PolicyError, QarlpError, Result,
        TrainingError,
    };
    pub use crate::gradient::{
        compute_gae, normalize_advantages, Experience, GradientConfig, PolicyGradient, Trajectory,
    };
    pub use crate::policy::{PolicyConfig, QuantumPolicy};
    pub use crate::training::{
        Checkpoint, EvaluationResult, IterationMetrics, LoggingCallback, NoOpCallback, Trainer,
        TrainerConfig, TrainingCallback, TrainingOutcome,
    };
}

#[cfg(test)]
mod tests {
    use super::prelude::*;

    #[test]
    fn test_end_to_end_gridworld() {
        // Create policy
        let policy_config = PolicyConfig {
            num_qubits: 4,
            num_layers: 1,
            num_actions: 4,
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(policy_config).unwrap();

        // Create environment
        let env_config = GridWorldConfig {
            width: 3,
            height: 3,
            goal: (2, 2),
            start: Some((0, 0)),
            max_steps: 20,
            ..Default::default()
        };
        let env = GridWorld::new(env_config).unwrap();

        // Create trainer
        let trainer_config = TrainerConfig {
            episodes_per_update: 5,
            max_steps_per_episode: 20,
            verbose: false,
            seed: Some(42),
            ..Default::default()
        };
        let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

        // Train
        let result = trainer.train(5).unwrap();

        // Verify training completed
        assert_eq!(result.total_iterations, 5);
        assert!(result.final_average_reward.is_finite());
    }

    #[test]
    fn test_end_to_end_cartpole() {
        // Create policy
        let policy_config = PolicyConfig {
            num_qubits: 4,
            num_layers: 2,
            num_actions: 2,
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(policy_config).unwrap();

        // Create environment
        let env_config = CartPoleConfig {
            max_steps: 50,
            seed: Some(42),
            ..Default::default()
        };
        let env = CartPole::new(env_config).unwrap();

        // Create trainer
        let trainer_config = TrainerConfig {
            episodes_per_update: 5,
            max_steps_per_episode: 50,
            verbose: false,
            seed: Some(42),
            gradient_config: GradientConfig {
                learning_rate: 0.01,
                ..Default::default()
            },
            ..Default::default()
        };
        let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

        // Train
        let result = trainer.train(3).unwrap();

        // Verify training completed
        assert_eq!(result.total_iterations, 3);
        assert!(result.total_episodes > 0);
    }

    #[test]
    fn test_end_to_end_binary_choice() {
        // Create policy
        let policy_config = PolicyConfig {
            num_qubits: 4,
            num_layers: 1,
            num_actions: 2,
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(policy_config).unwrap();

        // Create simple environment
        let env = BinaryChoice::new(10).unwrap();

        // Create trainer
        let trainer_config = TrainerConfig {
            episodes_per_update: 10,
            max_steps_per_episode: 10,
            verbose: false,
            seed: Some(42),
            ..Default::default()
        };
        let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

        // Train
        let result = trainer.train(5).unwrap();

        // Verify training completed without errors
        assert_eq!(result.total_iterations, 5);
    }

    #[test]
    fn test_policy_forward_pass() {
        let config = PolicyConfig {
            num_qubits: 4,
            num_layers: 2,
            num_actions: 2,
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(config).unwrap();

        let state = vec![0.5, -0.3, 0.1, 0.8];
        let probs = policy.forward(&state).unwrap();

        // Probabilities should sum to 1
        let sum: f64 = probs.iter().sum();
        assert!((sum - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_gradient_computation() {
        let policy_config = PolicyConfig {
            num_qubits: 4,
            num_layers: 1,
            num_actions: 2,
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(policy_config).unwrap();

        // Create trajectory
        let mut trajectory = Trajectory::new();
        for _ in 0..5 {
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

        // Gradients should be finite
        assert!(gradients.iter().all(|g| g.is_finite()));
        assert_eq!(gradients.len(), policy.num_parameters());
    }

    #[test]
    fn test_replay_buffer() {
        let config = BufferConfig {
            capacity: 100,
            ..Default::default()
        };
        let mut buffer = ReplayBuffer::new(config).unwrap();

        // Add experiences
        for i in 0..50 {
            buffer.push(
                Experience {
                    state: vec![i as f64; 4],
                    action: i % 2,
                    reward: 1.0,
                    next_state: vec![(i + 1) as f64; 4],
                    done: false,
                    log_prob: -0.5,
                },
                None,
            );
        }

        // Sample
        let batch = buffer.sample(10).unwrap();
        assert_eq!(batch.experiences.len(), 10);
    }

    #[test]
    fn test_environment_interface() {
        let config = GridWorldConfig::default();
        let mut env = GridWorld::new(config).unwrap();

        // Reset
        let state = env.reset().unwrap();
        assert_eq!(state.len(), env.state_dim());

        // Step
        let result = env.step(0).unwrap();
        assert_eq!(result.state.len(), env.state_dim());
    }

    #[test]
    fn test_learning_signal() {
        // Test that policy parameters change during training
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
            max_steps_per_episode: 20,
            verbose: false,
            seed: Some(42),
            ..Default::default()
        };
        let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();

        trainer.train(3).unwrap();

        let final_params = trainer.policy().get_parameters_flat();

        // Parameters should have changed
        let param_changed = initial_params
            .iter()
            .zip(final_params.iter())
            .any(|(a, b)| (a - b).abs() > 1e-10);

        assert!(param_changed, "Policy parameters should change during training");
    }
}
