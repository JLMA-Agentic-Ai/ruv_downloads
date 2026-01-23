//! Training loop for quantum RL policy.
//!
//! This module provides the main training loop for quantum reinforcement learning,
//! including episode collection, policy updates, logging, metrics, and checkpointing.
//!
//! # Training Loop
//!
//! 1. Collect episodes using current policy
//! 2. Compute policy gradients
//! 3. Update policy parameters
//! 4. Log metrics and optionally save checkpoint
//! 5. Repeat until convergence
//!
//! # Example
//!
//! ```
//! use ruqu_qarlp::training::{Trainer, TrainerConfig};
//! use ruqu_qarlp::policy::{QuantumPolicy, PolicyConfig};
//! use ruqu_qarlp::environment::{GridWorld, GridWorldConfig};
//!
//! let policy_config = PolicyConfig::default();
//! let policy = QuantumPolicy::new(policy_config).unwrap();
//!
//! let env_config = GridWorldConfig::default();
//! let env = GridWorld::new(env_config).unwrap();
//!
//! let trainer_config = TrainerConfig::default();
//! let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();
//!
//! let result = trainer.train(100).unwrap();
//! println!("Final reward: {}", result.final_average_reward);
//! ```

use crate::buffer::TrajectoryBuffer;
use crate::environment::Environment;
use crate::error::{QarlpError, Result, TrainingError, TrainingResult};
use crate::gradient::{Experience, GradientConfig, PolicyGradient, Trajectory};
use crate::policy::QuantumPolicy;
use rand::{Rng, SeedableRng};
use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};
use tracing::{debug, info};

/// Configuration for the trainer.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainerConfig {
    /// Number of episodes per training iteration.
    pub episodes_per_update: usize,
    /// Maximum steps per episode.
    pub max_steps_per_episode: usize,
    /// Gradient configuration.
    pub gradient_config: GradientConfig,
    /// Early stopping threshold (stop if reward exceeds this).
    pub early_stop_reward: Option<f64>,
    /// Checkpoint interval (save every N iterations).
    pub checkpoint_interval: Option<usize>,
    /// Checkpoint directory.
    pub checkpoint_dir: Option<String>,
    /// Whether to log detailed metrics.
    pub verbose: bool,
    /// Temperature annealing start.
    pub initial_temperature: f64,
    /// Temperature annealing end.
    pub final_temperature: f64,
    /// Temperature annealing rate.
    pub temperature_decay: f64,
    /// Random seed.
    pub seed: Option<u64>,
}

impl Default for TrainerConfig {
    fn default() -> Self {
        Self {
            episodes_per_update: 10,
            max_steps_per_episode: 200,
            gradient_config: GradientConfig::default(),
            early_stop_reward: None,
            checkpoint_interval: None,
            checkpoint_dir: None,
            verbose: true,
            initial_temperature: 1.0,
            final_temperature: 0.1,
            temperature_decay: 0.99,
            seed: None,
        }
    }
}

/// Metrics from a single training iteration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IterationMetrics {
    /// Iteration number.
    pub iteration: usize,
    /// Average episode reward.
    pub average_reward: f64,
    /// Best episode reward in this iteration.
    pub best_reward: f64,
    /// Worst episode reward in this iteration.
    pub worst_reward: f64,
    /// Average episode length.
    pub average_length: f64,
    /// Gradient norm.
    pub gradient_norm: f64,
    /// Current temperature.
    pub temperature: f64,
    /// Duration of this iteration.
    pub duration: Duration,
}

/// Training session outcome with metrics and history.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingOutcome {
    /// Final average reward.
    pub final_average_reward: f64,
    /// Best average reward achieved.
    pub best_average_reward: f64,
    /// Iteration at which best reward was achieved.
    pub best_iteration: usize,
    /// Total number of iterations.
    pub total_iterations: usize,
    /// Total number of episodes.
    pub total_episodes: usize,
    /// Total training time.
    pub total_time: Duration,
    /// History of iteration metrics.
    pub history: Vec<IterationMetrics>,
    /// Whether training converged (early stopped).
    pub converged: bool,
}

/// Trainer for quantum RL policy.
pub struct Trainer<E: Environment> {
    /// Trainer configuration.
    config: TrainerConfig,
    /// Quantum policy network.
    policy: QuantumPolicy,
    /// Environment.
    env: E,
    /// Policy gradient optimizer.
    optimizer: PolicyGradient,
    /// Trajectory buffer.
    buffer: TrajectoryBuffer,
    /// Current temperature.
    current_temperature: f64,
    /// Iteration count.
    iteration: usize,
    /// Best average reward seen.
    best_average_reward: f64,
    /// Iteration at which best reward was achieved.
    best_iteration: usize,
    /// Random number generator.
    rng: rand::rngs::StdRng,
}

impl<E: Environment> Trainer<E> {
    /// Creates a new trainer.
    pub fn new(config: TrainerConfig, policy: QuantumPolicy, env: E) -> TrainingResult<Self> {
        if config.episodes_per_update == 0 {
            return Err(TrainingError::InvalidEpisodeCount(0));
        }
        if config.max_steps_per_episode == 0 {
            return Err(TrainingError::InvalidMaxSteps(0));
        }

        let optimizer = PolicyGradient::new(config.gradient_config.clone()).map_err(|e| {
            TrainingError::Diverged(format!("Failed to create optimizer: {}", e))
        })?;

        let buffer = TrajectoryBuffer::new(config.episodes_per_update * 2).map_err(|e| {
            TrainingError::Diverged(format!("Failed to create buffer: {}", e))
        })?;

        let rng = match config.seed {
            Some(seed) => rand::rngs::StdRng::seed_from_u64(seed),
            None => rand::rngs::StdRng::from_entropy(),
        };

        Ok(Self {
            current_temperature: config.initial_temperature,
            config,
            policy,
            env,
            optimizer,
            buffer,
            iteration: 0,
            best_average_reward: f64::NEG_INFINITY,
            best_iteration: 0,
            rng,
        })
    }

    /// Runs training for the specified number of iterations.
    pub fn train(&mut self, num_iterations: usize) -> Result<TrainingOutcome> {
        if num_iterations == 0 {
            return Err(QarlpError::Training(TrainingError::InvalidEpisodeCount(0)));
        }

        let start_time = Instant::now();
        let mut history = Vec::with_capacity(num_iterations);
        let mut total_episodes = 0;
        let mut converged = false;

        info!(
            "Starting training for {} iterations on {}",
            num_iterations,
            self.env.name()
        );

        for _ in 0..num_iterations {
            let iteration_start = Instant::now();

            // Collect episodes
            let trajectories = self.collect_episodes()?;
            total_episodes += trajectories.len();

            // Compute metrics
            let rewards: Vec<f64> = trajectories.iter().map(|t| t.total_reward).collect();
            let lengths: Vec<f64> = trajectories.iter().map(|t| t.len() as f64).collect();

            let average_reward = rewards.iter().sum::<f64>() / rewards.len() as f64;
            let best_reward = rewards.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
            let worst_reward = rewards.iter().cloned().fold(f64::INFINITY, f64::min);
            let average_length = lengths.iter().sum::<f64>() / lengths.len() as f64;

            // Update best
            if average_reward > self.best_average_reward {
                self.best_average_reward = average_reward;
                self.best_iteration = self.iteration;
            }

            // Compute and apply gradients
            let gradients = self
                .optimizer
                .compute_batch_gradient(&self.policy, &trajectories)
                .map_err(|e| QarlpError::Gradient(e))?;

            let gradient_norm = gradients.iter().map(|g| g * g).sum::<f64>().sqrt();

            // Check for divergence
            if !gradient_norm.is_finite() {
                return Err(QarlpError::Training(TrainingError::Diverged(
                    "Gradient became NaN or Inf".to_string(),
                )));
            }

            self.optimizer
                .update_parameters(&mut self.policy, &gradients)
                .map_err(|e| QarlpError::Gradient(e))?;

            // Update temperature
            self.anneal_temperature();

            let metrics = IterationMetrics {
                iteration: self.iteration,
                average_reward,
                best_reward,
                worst_reward,
                average_length,
                gradient_norm,
                temperature: self.current_temperature,
                duration: iteration_start.elapsed(),
            };

            if self.config.verbose {
                info!(
                    "Iteration {}: avg_reward={:.3}, best={:.3}, avg_len={:.1}, grad_norm={:.4}",
                    self.iteration, average_reward, best_reward, average_length, gradient_norm
                );
            }

            history.push(metrics);

            // Checkpoint
            if let Some(interval) = self.config.checkpoint_interval {
                if self.iteration % interval == 0 {
                    self.save_checkpoint()?;
                }
            }

            // Early stopping
            if let Some(threshold) = self.config.early_stop_reward {
                if average_reward >= threshold {
                    info!(
                        "Early stopping: average reward {:.3} >= threshold {:.3}",
                        average_reward, threshold
                    );
                    converged = true;
                    break;
                }
            }

            self.iteration += 1;
        }

        let total_time = start_time.elapsed();

        let final_average_reward = if history.is_empty() {
            0.0
        } else {
            history.last().unwrap().average_reward
        };

        Ok(TrainingOutcome {
            final_average_reward,
            best_average_reward: self.best_average_reward,
            best_iteration: self.best_iteration,
            total_iterations: self.iteration,
            total_episodes,
            total_time,
            history,
            converged,
        })
    }

    /// Collects episodes using the current policy.
    fn collect_episodes(&mut self) -> Result<Vec<Trajectory>> {
        let mut trajectories = Vec::with_capacity(self.config.episodes_per_update);

        for _ in 0..self.config.episodes_per_update {
            let trajectory = self.collect_episode()?;
            trajectories.push(trajectory);
        }

        Ok(trajectories)
    }

    /// Collects a single episode.
    fn collect_episode(&mut self) -> Result<Trajectory> {
        let mut trajectory = Trajectory::new();
        let mut state = self.env.reset().map_err(|e| QarlpError::Environment(e))?;

        for _ in 0..self.config.max_steps_per_episode {
            // Sample action
            let action = self
                .policy
                .sample_action(&state, &mut self.rng)
                .map_err(|e| QarlpError::Policy(e))?;

            let log_prob = self
                .policy
                .log_prob(&state, action)
                .map_err(|e| QarlpError::Policy(e))?;

            // Take action
            let result = self.env.step(action).map_err(|e| QarlpError::Environment(e))?;

            // Store experience
            trajectory.push(Experience {
                state: state.clone(),
                action,
                reward: result.reward,
                next_state: result.state.clone(),
                done: result.done,
                log_prob,
            });

            state = result.state;

            if result.done {
                break;
            }
        }

        debug!(
            "Collected episode: {} steps, reward {:.3}",
            trajectory.len(),
            trajectory.total_reward
        );

        Ok(trajectory)
    }

    /// Anneals temperature.
    fn anneal_temperature(&mut self) {
        self.current_temperature = (self.current_temperature * self.config.temperature_decay)
            .max(self.config.final_temperature);
        self.policy.set_temperature(self.current_temperature);
    }

    /// Saves a checkpoint.
    fn save_checkpoint(&self) -> Result<()> {
        let dir = self
            .config
            .checkpoint_dir
            .as_deref()
            .unwrap_or("checkpoints");

        let checkpoint = Checkpoint {
            iteration: self.iteration,
            parameters: self.policy.get_parameters_flat(),
            temperature: self.current_temperature,
            best_average_reward: self.best_average_reward,
            best_iteration: self.best_iteration,
        };

        let path = format!("{}/checkpoint_{}.json", dir, self.iteration);

        // Ensure directory exists
        std::fs::create_dir_all(dir).map_err(|e| {
            QarlpError::Training(TrainingError::CheckpointError(format!(
                "Failed to create checkpoint directory: {}",
                e
            )))
        })?;

        let json = serde_json::to_string_pretty(&checkpoint).map_err(|e| {
            QarlpError::Serialization(format!("Failed to serialize checkpoint: {}", e))
        })?;

        std::fs::write(&path, json).map_err(|e| {
            QarlpError::Training(TrainingError::CheckpointError(format!(
                "Failed to write checkpoint: {}",
                e
            )))
        })?;

        info!("Saved checkpoint to {}", path);

        Ok(())
    }

    /// Loads a checkpoint.
    pub fn load_checkpoint(&mut self, path: &str) -> Result<()> {
        let json = std::fs::read_to_string(path).map_err(|e| {
            QarlpError::Training(TrainingError::CheckpointError(format!(
                "Failed to read checkpoint: {}",
                e
            )))
        })?;

        let checkpoint: Checkpoint = serde_json::from_str(&json).map_err(|e| {
            QarlpError::Serialization(format!("Failed to deserialize checkpoint: {}", e))
        })?;

        self.policy
            .set_parameters(&checkpoint.parameters)
            .map_err(|e| QarlpError::Policy(e))?;
        self.current_temperature = checkpoint.temperature;
        self.iteration = checkpoint.iteration;
        self.best_average_reward = checkpoint.best_average_reward;
        self.best_iteration = checkpoint.best_iteration;

        info!("Loaded checkpoint from {}", path);

        Ok(())
    }

    /// Returns the current policy.
    pub fn policy(&self) -> &QuantumPolicy {
        &self.policy
    }

    /// Returns a mutable reference to the policy.
    pub fn policy_mut(&mut self) -> &mut QuantumPolicy {
        &mut self.policy
    }

    /// Returns the current iteration.
    pub fn iteration(&self) -> usize {
        self.iteration
    }

    /// Returns the best average reward.
    pub fn best_average_reward(&self) -> f64 {
        self.best_average_reward
    }

    /// Evaluates the current policy without updating.
    pub fn evaluate(&mut self, num_episodes: usize) -> Result<EvaluationResult> {
        let mut rewards = Vec::with_capacity(num_episodes);
        let mut lengths = Vec::with_capacity(num_episodes);

        for _ in 0..num_episodes {
            let trajectory = self.collect_episode()?;
            rewards.push(trajectory.total_reward);
            lengths.push(trajectory.len() as f64);
        }

        let average_reward = rewards.iter().sum::<f64>() / rewards.len() as f64;
        let std_reward = (rewards
            .iter()
            .map(|r| (r - average_reward).powi(2))
            .sum::<f64>()
            / rewards.len() as f64)
            .sqrt();
        let average_length = lengths.iter().sum::<f64>() / lengths.len() as f64;
        let best_reward = rewards.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
        let worst_reward = rewards.iter().cloned().fold(f64::INFINITY, f64::min);

        Ok(EvaluationResult {
            num_episodes,
            average_reward,
            std_reward,
            best_reward,
            worst_reward,
            average_length,
        })
    }
}

/// Checkpoint data for saving/loading.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Checkpoint {
    /// Iteration number.
    pub iteration: usize,
    /// Policy parameters.
    pub parameters: Vec<f64>,
    /// Current temperature.
    pub temperature: f64,
    /// Best average reward.
    pub best_average_reward: f64,
    /// Iteration at which best reward was achieved.
    pub best_iteration: usize,
}

/// Result of policy evaluation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationResult {
    /// Number of episodes evaluated.
    pub num_episodes: usize,
    /// Average reward.
    pub average_reward: f64,
    /// Standard deviation of rewards.
    pub std_reward: f64,
    /// Best reward.
    pub best_reward: f64,
    /// Worst reward.
    pub worst_reward: f64,
    /// Average episode length.
    pub average_length: f64,
}

/// Simple callback trait for training hooks.
pub trait TrainingCallback: Send + Sync {
    /// Called at the start of training.
    fn on_training_start(&mut self) {}

    /// Called at the end of each iteration.
    fn on_iteration_end(&mut self, _metrics: &IterationMetrics) {}

    /// Called at the end of training.
    fn on_training_end(&mut self, _result: &TrainingOutcome) {}
}

/// Default no-op callback.
pub struct NoOpCallback;

impl TrainingCallback for NoOpCallback {}

/// Logging callback that prints to console.
pub struct LoggingCallback {
    log_interval: usize,
}

impl LoggingCallback {
    /// Creates a new logging callback.
    pub fn new(log_interval: usize) -> Self {
        Self { log_interval }
    }
}

impl TrainingCallback for LoggingCallback {
    fn on_training_start(&mut self) {
        println!("Training started...");
    }

    fn on_iteration_end(&mut self, metrics: &IterationMetrics) {
        if metrics.iteration % self.log_interval == 0 {
            println!(
                "[{}] avg_reward: {:.3}, best: {:.3}, grad_norm: {:.4}",
                metrics.iteration, metrics.average_reward, metrics.best_reward, metrics.gradient_norm
            );
        }
    }

    fn on_training_end(&mut self, result: &TrainingOutcome) {
        println!(
            "Training complete! Final reward: {:.3}, Best: {:.3} (iter {})",
            result.final_average_reward, result.best_average_reward, result.best_iteration
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::environment::{BinaryChoice, GridWorld, GridWorldConfig};
    use crate::policy::PolicyConfig;

    fn create_test_trainer() -> Trainer<GridWorld> {
        let policy_config = PolicyConfig {
            num_qubits: 4,
            num_layers: 1,
            num_actions: 4,
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(policy_config).unwrap();

        let env_config = GridWorldConfig::default();
        let env = GridWorld::new(env_config).unwrap();

        let trainer_config = TrainerConfig {
            episodes_per_update: 5,
            max_steps_per_episode: 50,
            verbose: false,
            seed: Some(42),
            ..Default::default()
        };

        Trainer::new(trainer_config, policy, env).unwrap()
    }

    #[test]
    fn test_trainer_creation() {
        let trainer = create_test_trainer();
        assert_eq!(trainer.iteration(), 0);
        assert!(trainer.best_average_reward().is_infinite());
    }

    #[test]
    fn test_invalid_episode_count() {
        let policy_config = PolicyConfig::default();
        let policy = QuantumPolicy::new(policy_config).unwrap();
        let env = GridWorld::new(GridWorldConfig::default()).unwrap();

        let trainer_config = TrainerConfig {
            episodes_per_update: 0,
            ..Default::default()
        };

        let result = Trainer::new(trainer_config, policy, env);
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_max_steps() {
        let policy_config = PolicyConfig::default();
        let policy = QuantumPolicy::new(policy_config).unwrap();
        let env = GridWorld::new(GridWorldConfig::default()).unwrap();

        let trainer_config = TrainerConfig {
            max_steps_per_episode: 0,
            ..Default::default()
        };

        let result = Trainer::new(trainer_config, policy, env);
        assert!(result.is_err());
    }

    #[test]
    fn test_collect_episode() {
        let mut trainer = create_test_trainer();
        let trajectory = trainer.collect_episode().unwrap();

        assert!(!trajectory.is_empty());
        // Episode should either reach goal or max steps
        assert!(trajectory.len() <= 50);
    }

    #[test]
    fn test_collect_episodes() {
        let mut trainer = create_test_trainer();
        let trajectories = trainer.collect_episodes().unwrap();

        assert_eq!(trajectories.len(), 5);
    }

    #[test]
    fn test_train_single_iteration() {
        let mut trainer = create_test_trainer();
        let result = trainer.train(1).unwrap();

        assert_eq!(result.total_iterations, 1);
        assert_eq!(result.total_episodes, 5);
        assert!(!result.history.is_empty());
    }

    #[test]
    fn test_train_multiple_iterations() {
        let mut trainer = create_test_trainer();
        let result = trainer.train(3).unwrap();

        assert_eq!(result.total_iterations, 3);
        assert_eq!(result.history.len(), 3);
    }

    #[test]
    fn test_early_stopping() {
        let policy_config = PolicyConfig {
            num_qubits: 4,
            num_layers: 1,
            num_actions: 4,
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(policy_config).unwrap();
        let env = GridWorld::new(GridWorldConfig::default()).unwrap();

        let trainer_config = TrainerConfig {
            episodes_per_update: 5,
            max_steps_per_episode: 50,
            early_stop_reward: Some(-100.0), // Very easy threshold
            verbose: false,
            seed: Some(42),
            ..Default::default()
        };

        let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();
        let result = trainer.train(10).unwrap();

        // Should stop early
        assert!(result.converged);
    }

    #[test]
    fn test_evaluate() {
        let mut trainer = create_test_trainer();
        let result = trainer.evaluate(5).unwrap();

        assert_eq!(result.num_episodes, 5);
        assert!(result.average_reward.is_finite());
        assert!(result.std_reward >= 0.0);
    }

    #[test]
    fn test_temperature_annealing() {
        let policy_config = PolicyConfig {
            num_qubits: 4,
            num_layers: 1,
            num_actions: 4,
            seed: Some(42),
            temperature: 1.0,
            ..Default::default()
        };
        let policy = QuantumPolicy::new(policy_config).unwrap();
        let env = GridWorld::new(GridWorldConfig::default()).unwrap();

        let trainer_config = TrainerConfig {
            episodes_per_update: 2,
            max_steps_per_episode: 20,
            initial_temperature: 1.0,
            final_temperature: 0.1,
            temperature_decay: 0.9,
            verbose: false,
            seed: Some(42),
            ..Default::default()
        };

        let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();
        trainer.train(5).unwrap();

        // Temperature should have decreased
        assert!(trainer.current_temperature < 1.0);
        assert!(trainer.current_temperature >= 0.1);
    }

    #[test]
    fn test_iteration_metrics() {
        let mut trainer = create_test_trainer();
        let result = trainer.train(2).unwrap();

        for metrics in &result.history {
            assert!(metrics.average_reward.is_finite());
            assert!(metrics.best_reward >= metrics.worst_reward);
            assert!(metrics.average_length > 0.0);
            assert!(metrics.gradient_norm.is_finite());
        }
    }

    #[test]
    fn test_training_result_fields() {
        let mut trainer = create_test_trainer();
        let result = trainer.train(3).unwrap();

        assert!(result.final_average_reward.is_finite());
        assert!(result.best_average_reward >= result.final_average_reward ||
                result.best_iteration < result.total_iterations - 1);
        assert_eq!(result.total_episodes, 15); // 3 iterations * 5 episodes
    }

    #[test]
    fn test_binary_choice_learning() {
        // Use simple BinaryChoice env where learning signal is clear
        let policy_config = PolicyConfig {
            num_qubits: 4,
            num_layers: 2,
            num_actions: 2,
            seed: Some(42),
            ..Default::default()
        };
        let policy = QuantumPolicy::new(policy_config).unwrap();
        let env = BinaryChoice::new(10).unwrap();

        let trainer_config = TrainerConfig {
            episodes_per_update: 10,
            max_steps_per_episode: 10,
            verbose: false,
            seed: Some(42),
            gradient_config: GradientConfig {
                learning_rate: 0.05,
                ..Default::default()
            },
            ..Default::default()
        };

        let mut trainer = Trainer::new(trainer_config, policy, env).unwrap();
        let result = trainer.train(5).unwrap();

        // Should complete without errors
        assert_eq!(result.total_iterations, 5);
    }

    #[test]
    fn test_logging_callback() {
        let callback = LoggingCallback::new(10);
        // Just verify it can be created
        assert_eq!(callback.log_interval, 10);
    }

    #[test]
    fn test_checkpoint_serialization() {
        let checkpoint = Checkpoint {
            iteration: 100,
            parameters: vec![0.1, 0.2, 0.3],
            temperature: 0.5,
            best_average_reward: 5.0,
            best_iteration: 50,
        };

        let json = serde_json::to_string(&checkpoint).unwrap();
        let deserialized: Checkpoint = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.iteration, 100);
        assert_eq!(deserialized.parameters, vec![0.1, 0.2, 0.3]);
    }

    #[test]
    fn test_evaluation_result_fields() {
        let mut trainer = create_test_trainer();
        let result = trainer.evaluate(10).unwrap();

        assert_eq!(result.num_episodes, 10);
        assert!(result.best_reward >= result.average_reward);
        assert!(result.worst_reward <= result.average_reward);
        assert!(result.std_reward >= 0.0);
    }
}
