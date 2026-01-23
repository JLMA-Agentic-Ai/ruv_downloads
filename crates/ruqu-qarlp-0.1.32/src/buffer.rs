//! Replay buffer for experience storage and sampling.
//!
//! This module provides implementations of replay buffers for reinforcement
//! learning, including uniform sampling and prioritized experience replay (PER).
//!
//! # Prioritized Experience Replay
//!
//! Prioritized experience replay samples experiences with probability proportional
//! to their TD-error magnitude, allowing the agent to learn more from surprising
//! or important experiences.
//!
//! # Example
//!
//! ```
//! use ruqu_qarlp::buffer::{ReplayBuffer, BufferConfig};
//! use ruqu_qarlp::gradient::Experience;
//!
//! let config = BufferConfig::default();
//! let mut buffer = ReplayBuffer::new(config).unwrap();
//!
//! // Add experiences
//! for i in 0..50 {
//!     let exp = Experience {
//!         state: vec![0.1, 0.2, 0.3, 0.4],
//!         action: i % 2,
//!         reward: 1.0,
//!         next_state: vec![0.2, 0.3, 0.4, 0.5],
//!         done: false,
//!         log_prob: -0.5,
//!     };
//!     buffer.push(exp, None);
//! }
//!
//! // Sample batch (must have enough samples)
//! let batch = buffer.sample(32).unwrap();
//! assert_eq!(batch.experiences.len(), 32);
//! ```

use crate::error::{BufferError, BufferResult};
use crate::gradient::Experience;
use rand::Rng;
use serde::{Deserialize, Serialize};

/// Configuration for replay buffer.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BufferConfig {
    /// Maximum buffer capacity.
    pub capacity: usize,
    /// Alpha parameter for prioritized replay (0 = uniform, 1 = fully prioritized).
    pub alpha: f64,
    /// Beta parameter for importance sampling correction.
    pub beta: f64,
    /// Beta annealing rate (increases beta towards 1.0).
    pub beta_annealing: f64,
    /// Small constant to prevent zero priorities.
    pub epsilon: f64,
}

impl Default for BufferConfig {
    fn default() -> Self {
        Self {
            capacity: 10000,
            alpha: 0.6,
            beta: 0.4,
            beta_annealing: 0.001,
            epsilon: 1e-6,
        }
    }
}

/// Entry in the replay buffer with priority information.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BufferEntry {
    /// The experience.
    pub experience: Experience,
    /// Priority for sampling.
    pub priority: f64,
}

/// Replay buffer with prioritized experience replay.
#[derive(Debug, Clone)]
pub struct ReplayBuffer {
    /// Configuration.
    config: BufferConfig,
    /// Buffer storage.
    buffer: Vec<BufferEntry>,
    /// Current position for circular buffer.
    position: usize,
    /// Maximum priority seen.
    max_priority: f64,
    /// Current beta value.
    current_beta: f64,
    /// Total number of experiences added.
    total_added: usize,
}

impl ReplayBuffer {
    /// Creates a new replay buffer.
    pub fn new(config: BufferConfig) -> BufferResult<Self> {
        if config.capacity == 0 {
            return Err(BufferError::InvalidCapacity(0));
        }
        if config.alpha < 0.0 || config.alpha > 1.0 {
            return Err(BufferError::InvalidAlpha(config.alpha));
        }

        Ok(Self {
            current_beta: config.beta,
            config,
            buffer: Vec::new(),
            position: 0,
            max_priority: 1.0,
            total_added: 0,
        })
    }

    /// Adds an experience to the buffer.
    ///
    /// # Arguments
    ///
    /// * `experience` - The experience to add.
    /// * `priority` - Optional priority. If None, uses max priority.
    pub fn push(&mut self, experience: Experience, priority: Option<f64>) {
        let priority = priority.unwrap_or(self.max_priority);
        let priority = priority.max(self.config.epsilon);

        if priority > self.max_priority {
            self.max_priority = priority;
        }

        let entry = BufferEntry {
            experience,
            priority,
        };

        if self.buffer.len() < self.config.capacity {
            self.buffer.push(entry);
        } else {
            self.buffer[self.position] = entry;
        }

        self.position = (self.position + 1) % self.config.capacity;
        self.total_added += 1;
    }

    /// Samples a batch of experiences.
    ///
    /// # Arguments
    ///
    /// * `batch_size` - Number of experiences to sample.
    ///
    /// # Returns
    ///
    /// Tuple of (indices, experiences, importance weights).
    pub fn sample(&self, batch_size: usize) -> BufferResult<SampleBatch> {
        if self.buffer.is_empty() {
            return Err(BufferError::Empty);
        }
        if batch_size > self.buffer.len() {
            return Err(BufferError::InsufficientSamples {
                requested: batch_size,
                available: self.buffer.len(),
            });
        }

        let mut rng = rand::thread_rng();

        // Compute sampling probabilities
        let priorities: Vec<f64> = self
            .buffer
            .iter()
            .map(|e| e.priority.powf(self.config.alpha))
            .collect();
        let sum_priorities: f64 = priorities.iter().sum();

        // Sample indices based on priorities
        let mut indices = Vec::with_capacity(batch_size);
        let mut experiences = Vec::with_capacity(batch_size);
        let mut weights = Vec::with_capacity(batch_size);

        // Use roulette wheel selection
        for _ in 0..batch_size {
            let target: f64 = rng.gen::<f64>() * sum_priorities;
            let mut cumsum = 0.0;
            let mut selected_idx = 0;

            for (i, &p) in priorities.iter().enumerate() {
                cumsum += p;
                if cumsum >= target {
                    selected_idx = i;
                    break;
                }
            }

            indices.push(selected_idx);
            experiences.push(self.buffer[selected_idx].experience.clone());

            // Importance sampling weight
            let prob = priorities[selected_idx] / sum_priorities;
            let weight = (self.buffer.len() as f64 * prob).powf(-self.current_beta);
            weights.push(weight);
        }

        // Normalize weights
        let max_weight = weights.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
        for w in &mut weights {
            *w /= max_weight;
        }

        Ok(SampleBatch {
            indices,
            experiences,
            weights,
        })
    }

    /// Samples uniformly (ignoring priorities).
    pub fn sample_uniform(&self, batch_size: usize) -> BufferResult<Vec<Experience>> {
        if self.buffer.is_empty() {
            return Err(BufferError::Empty);
        }
        if batch_size > self.buffer.len() {
            return Err(BufferError::InsufficientSamples {
                requested: batch_size,
                available: self.buffer.len(),
            });
        }

        let mut rng = rand::thread_rng();
        let mut experiences = Vec::with_capacity(batch_size);

        for _ in 0..batch_size {
            let idx = rng.gen_range(0..self.buffer.len());
            experiences.push(self.buffer[idx].experience.clone());
        }

        Ok(experiences)
    }

    /// Updates priorities for sampled experiences.
    ///
    /// # Arguments
    ///
    /// * `indices` - Indices of experiences to update.
    /// * `td_errors` - TD errors for each experience.
    pub fn update_priorities(&mut self, indices: &[usize], td_errors: &[f64]) -> BufferResult<()> {
        for (&idx, &td_error) in indices.iter().zip(td_errors.iter()) {
            if idx >= self.buffer.len() {
                return Err(BufferError::IndexOutOfBounds {
                    index: idx,
                    size: self.buffer.len(),
                });
            }

            let priority = td_error.abs() + self.config.epsilon;
            if priority < 0.0 {
                return Err(BufferError::InvalidPriority(priority));
            }

            self.buffer[idx].priority = priority;
            if priority > self.max_priority {
                self.max_priority = priority;
            }
        }

        Ok(())
    }

    /// Anneals beta towards 1.0.
    pub fn anneal_beta(&mut self) {
        self.current_beta = (self.current_beta + self.config.beta_annealing).min(1.0);
    }

    /// Returns the current buffer size.
    pub fn len(&self) -> usize {
        self.buffer.len()
    }

    /// Checks if the buffer is empty.
    pub fn is_empty(&self) -> bool {
        self.buffer.is_empty()
    }

    /// Returns the buffer capacity.
    pub fn capacity(&self) -> usize {
        self.config.capacity
    }

    /// Returns the current beta value.
    pub fn beta(&self) -> f64 {
        self.current_beta
    }

    /// Returns the total number of experiences added.
    pub fn total_added(&self) -> usize {
        self.total_added
    }

    /// Clears the buffer.
    pub fn clear(&mut self) {
        self.buffer.clear();
        self.position = 0;
        self.max_priority = 1.0;
    }

    /// Returns the average priority in the buffer.
    pub fn average_priority(&self) -> f64 {
        if self.buffer.is_empty() {
            return 0.0;
        }
        self.buffer.iter().map(|e| e.priority).sum::<f64>() / self.buffer.len() as f64
    }

    /// Returns all experiences (for full-batch training).
    pub fn get_all(&self) -> Vec<Experience> {
        self.buffer.iter().map(|e| e.experience.clone()).collect()
    }
}

/// Result of sampling from the buffer.
#[derive(Debug, Clone)]
pub struct SampleBatch {
    /// Indices of sampled experiences.
    pub indices: Vec<usize>,
    /// Sampled experiences.
    pub experiences: Vec<Experience>,
    /// Importance sampling weights.
    pub weights: Vec<f64>,
}

/// Simple trajectory buffer for on-policy algorithms.
#[derive(Debug, Clone, Default)]
pub struct TrajectoryBuffer {
    /// List of trajectories.
    trajectories: Vec<crate::gradient::Trajectory>,
    /// Maximum number of trajectories to store.
    max_trajectories: usize,
}

impl TrajectoryBuffer {
    /// Creates a new trajectory buffer.
    pub fn new(max_trajectories: usize) -> BufferResult<Self> {
        if max_trajectories == 0 {
            return Err(BufferError::InvalidCapacity(0));
        }
        Ok(Self {
            trajectories: Vec::new(),
            max_trajectories,
        })
    }

    /// Adds a trajectory to the buffer.
    pub fn push(&mut self, trajectory: crate::gradient::Trajectory) {
        if self.trajectories.len() >= self.max_trajectories {
            self.trajectories.remove(0);
        }
        self.trajectories.push(trajectory);
    }

    /// Returns all trajectories and clears the buffer.
    pub fn drain(&mut self) -> Vec<crate::gradient::Trajectory> {
        std::mem::take(&mut self.trajectories)
    }

    /// Returns the number of trajectories.
    pub fn len(&self) -> usize {
        self.trajectories.len()
    }

    /// Checks if the buffer is empty.
    pub fn is_empty(&self) -> bool {
        self.trajectories.is_empty()
    }

    /// Returns total number of experiences across all trajectories.
    pub fn total_experiences(&self) -> usize {
        self.trajectories.iter().map(|t| t.len()).sum()
    }

    /// Returns average trajectory length.
    pub fn average_length(&self) -> f64 {
        if self.trajectories.is_empty() {
            return 0.0;
        }
        self.total_experiences() as f64 / self.trajectories.len() as f64
    }

    /// Returns average total reward across trajectories.
    pub fn average_reward(&self) -> f64 {
        if self.trajectories.is_empty() {
            return 0.0;
        }
        self.trajectories.iter().map(|t| t.total_reward).sum::<f64>() / self.trajectories.len() as f64
    }

    /// Clears the buffer.
    pub fn clear(&mut self) {
        self.trajectories.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_experience() -> Experience {
        Experience {
            state: vec![0.1, 0.2, 0.3, 0.4],
            action: 0,
            reward: 1.0,
            next_state: vec![0.2, 0.3, 0.4, 0.5],
            done: false,
            log_prob: -0.5,
        }
    }

    #[test]
    fn test_buffer_creation() {
        let config = BufferConfig::default();
        let buffer = ReplayBuffer::new(config).unwrap();
        assert!(buffer.is_empty());
        assert_eq!(buffer.len(), 0);
    }

    #[test]
    fn test_invalid_capacity() {
        let config = BufferConfig {
            capacity: 0,
            ..Default::default()
        };
        let result = ReplayBuffer::new(config);
        assert!(matches!(result, Err(BufferError::InvalidCapacity(0))));
    }

    #[test]
    fn test_invalid_alpha() {
        let config = BufferConfig {
            alpha: 1.5,
            ..Default::default()
        };
        let result = ReplayBuffer::new(config);
        assert!(matches!(result, Err(BufferError::InvalidAlpha(_))));
    }

    #[test]
    fn test_push_and_len() {
        let config = BufferConfig::default();
        let mut buffer = ReplayBuffer::new(config).unwrap();

        buffer.push(create_test_experience(), None);
        assert_eq!(buffer.len(), 1);

        buffer.push(create_test_experience(), None);
        assert_eq!(buffer.len(), 2);
    }

    #[test]
    fn test_circular_buffer() {
        let config = BufferConfig {
            capacity: 3,
            ..Default::default()
        };
        let mut buffer = ReplayBuffer::new(config).unwrap();

        for i in 0..5 {
            let mut exp = create_test_experience();
            exp.reward = i as f64;
            buffer.push(exp, None);
        }

        // Buffer should only contain last 3 experiences
        assert_eq!(buffer.len(), 3);
        assert_eq!(buffer.total_added(), 5);
    }

    #[test]
    fn test_sample_empty() {
        let config = BufferConfig::default();
        let buffer = ReplayBuffer::new(config).unwrap();

        let result = buffer.sample(10);
        assert!(matches!(result, Err(BufferError::Empty)));
    }

    #[test]
    fn test_sample_insufficient() {
        let config = BufferConfig::default();
        let mut buffer = ReplayBuffer::new(config).unwrap();

        buffer.push(create_test_experience(), None);

        let result = buffer.sample(10);
        assert!(matches!(
            result,
            Err(BufferError::InsufficientSamples { .. })
        ));
    }

    #[test]
    fn test_sample_batch() {
        let config = BufferConfig::default();
        let mut buffer = ReplayBuffer::new(config).unwrap();

        for _ in 0..100 {
            buffer.push(create_test_experience(), None);
        }

        let batch = buffer.sample(32).unwrap();
        assert_eq!(batch.experiences.len(), 32);
        assert_eq!(batch.indices.len(), 32);
        assert_eq!(batch.weights.len(), 32);

        // Weights should be normalized (max = 1)
        let max_weight = batch.weights.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
        assert!((max_weight - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_sample_uniform() {
        let config = BufferConfig::default();
        let mut buffer = ReplayBuffer::new(config).unwrap();

        for _ in 0..100 {
            buffer.push(create_test_experience(), None);
        }

        let batch = buffer.sample_uniform(32).unwrap();
        assert_eq!(batch.len(), 32);
    }

    #[test]
    fn test_update_priorities() {
        let config = BufferConfig::default();
        let mut buffer = ReplayBuffer::new(config).unwrap();

        for _ in 0..10 {
            buffer.push(create_test_experience(), None);
        }

        let indices = vec![0, 1, 2];
        let td_errors = vec![0.5, 1.0, 0.3];

        buffer.update_priorities(&indices, &td_errors).unwrap();

        // Priority should be td_error + epsilon
        assert!(buffer.buffer[0].priority > 0.5);
    }

    #[test]
    fn test_update_priorities_out_of_bounds() {
        let config = BufferConfig::default();
        let mut buffer = ReplayBuffer::new(config).unwrap();

        buffer.push(create_test_experience(), None);

        let result = buffer.update_priorities(&[10], &[1.0]);
        assert!(matches!(result, Err(BufferError::IndexOutOfBounds { .. })));
    }

    #[test]
    fn test_anneal_beta() {
        let config = BufferConfig {
            beta: 0.4,
            beta_annealing: 0.1,
            ..Default::default()
        };
        let mut buffer = ReplayBuffer::new(config).unwrap();

        let initial_beta = buffer.beta();
        buffer.anneal_beta();
        assert!(buffer.beta() > initial_beta);
    }

    #[test]
    fn test_beta_max() {
        let config = BufferConfig {
            beta: 0.95,
            beta_annealing: 0.1,
            ..Default::default()
        };
        let mut buffer = ReplayBuffer::new(config).unwrap();

        buffer.anneal_beta();
        assert!(buffer.beta() <= 1.0);
    }

    #[test]
    fn test_clear() {
        let config = BufferConfig::default();
        let mut buffer = ReplayBuffer::new(config).unwrap();

        for _ in 0..10 {
            buffer.push(create_test_experience(), None);
        }

        buffer.clear();
        assert!(buffer.is_empty());
    }

    #[test]
    fn test_average_priority() {
        let config = BufferConfig::default();
        let mut buffer = ReplayBuffer::new(config).unwrap();

        buffer.push(create_test_experience(), Some(1.0));
        buffer.push(create_test_experience(), Some(2.0));
        buffer.push(create_test_experience(), Some(3.0));

        let avg = buffer.average_priority();
        assert!((avg - 2.0).abs() < 1e-6);
    }

    #[test]
    fn test_get_all() {
        let config = BufferConfig::default();
        let mut buffer = ReplayBuffer::new(config).unwrap();

        for _ in 0..5 {
            buffer.push(create_test_experience(), None);
        }

        let all = buffer.get_all();
        assert_eq!(all.len(), 5);
    }

    // Trajectory buffer tests
    #[test]
    fn test_trajectory_buffer_creation() {
        let buffer = TrajectoryBuffer::new(100).unwrap();
        assert!(buffer.is_empty());
    }

    #[test]
    fn test_trajectory_buffer_invalid_capacity() {
        let result = TrajectoryBuffer::new(0);
        assert!(result.is_err());
    }

    #[test]
    fn test_trajectory_buffer_push() {
        use crate::gradient::Trajectory;

        let mut buffer = TrajectoryBuffer::new(100).unwrap();
        let trajectory = Trajectory::new();

        buffer.push(trajectory);
        assert_eq!(buffer.len(), 1);
    }

    #[test]
    fn test_trajectory_buffer_drain() {
        use crate::gradient::Trajectory;

        let mut buffer = TrajectoryBuffer::new(100).unwrap();

        for _ in 0..5 {
            buffer.push(Trajectory::new());
        }

        let trajectories = buffer.drain();
        assert_eq!(trajectories.len(), 5);
        assert!(buffer.is_empty());
    }

    #[test]
    fn test_trajectory_buffer_max_capacity() {
        use crate::gradient::Trajectory;

        let mut buffer = TrajectoryBuffer::new(3).unwrap();

        for _ in 0..5 {
            buffer.push(Trajectory::new());
        }

        assert_eq!(buffer.len(), 3);
    }

    #[test]
    fn test_trajectory_buffer_metrics() {
        use crate::gradient::{Experience, Trajectory};

        let mut buffer = TrajectoryBuffer::new(100).unwrap();

        for i in 0..3 {
            let mut trajectory = Trajectory::new();
            for _ in 0..5 {
                trajectory.push(Experience {
                    state: vec![0.0; 4],
                    action: 0,
                    reward: (i + 1) as f64,
                    next_state: vec![0.0; 4],
                    done: false,
                    log_prob: -0.5,
                });
            }
            buffer.push(trajectory);
        }

        assert_eq!(buffer.total_experiences(), 15);
        assert_eq!(buffer.average_length(), 5.0);
        // Average reward: (5*1 + 5*2 + 5*3) / 3 = 10
        assert!((buffer.average_reward() - 10.0).abs() < 1e-6);
    }
}
