//! Environment interface for reinforcement learning.
//!
//! This module provides a generic environment trait and implementations of
//! simple test environments (GridWorld, CartPole-like) for testing the
//! quantum RL policy.
//!
//! # Environment Trait
//!
//! The `Environment` trait defines the standard RL interface:
//! - `reset()` - Reset environment to initial state
//! - `step(action)` - Take action and receive (next_state, reward, done)
//! - `state()` - Get current state
//! - `action_space()` - Get number of possible actions
//!
//! # Example
//!
//! ```
//! use ruqu_qarlp::environment::{Environment, GridWorld, GridWorldConfig, StepResult};
//!
//! let config = GridWorldConfig::default();
//! let mut env = GridWorld::new(config).unwrap();
//!
//! let initial_state = env.reset().unwrap();
//! let result = env.step(0).unwrap(); // Move up
//! println!("Reward: {}, Done: {}", result.reward, result.done);
//! ```

use crate::error::{EnvironmentError, EnvResult};
use rand::{Rng, SeedableRng};
use serde::{Deserialize, Serialize};
use std::f64::consts::PI;

/// Step result containing next state, reward, done flag, and optional info.
#[derive(Debug, Clone)]
pub struct StepResult {
    /// Next state observation.
    pub state: Vec<f64>,
    /// Reward received.
    pub reward: f64,
    /// Whether episode is done.
    pub done: bool,
    /// Additional info (optional).
    pub info: Option<String>,
}

/// Generic environment trait for reinforcement learning.
pub trait Environment: Clone + Send + Sync {
    /// Resets the environment to initial state.
    ///
    /// # Returns
    ///
    /// Initial state observation.
    fn reset(&mut self) -> EnvResult<Vec<f64>>;

    /// Takes an action in the environment.
    ///
    /// # Arguments
    ///
    /// * `action` - The action to take.
    ///
    /// # Returns
    ///
    /// Step result containing (next_state, reward, done, info).
    fn step(&mut self, action: usize) -> EnvResult<StepResult>;

    /// Gets the current state.
    fn state(&self) -> EnvResult<Vec<f64>>;

    /// Gets the number of possible actions.
    fn action_space(&self) -> usize;

    /// Gets the state dimension.
    fn state_dim(&self) -> usize;

    /// Gets the maximum steps per episode.
    fn max_steps(&self) -> usize;

    /// Checks if the environment is done.
    fn is_done(&self) -> bool;

    /// Gets the name of the environment.
    fn name(&self) -> &str;

    /// Renders the environment state (for debugging).
    fn render(&self) -> String;
}

// ============================================================================
// GridWorld Environment
// ============================================================================

/// Configuration for GridWorld environment.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GridWorldConfig {
    /// Grid width.
    pub width: usize,
    /// Grid height.
    pub height: usize,
    /// Goal position (x, y).
    pub goal: (usize, usize),
    /// Starting position (x, y). If None, random start.
    pub start: Option<(usize, usize)>,
    /// Maximum steps per episode.
    pub max_steps: usize,
    /// Reward for reaching goal.
    pub goal_reward: f64,
    /// Step penalty (negative reward per step).
    pub step_penalty: f64,
    /// Random seed for reproducibility.
    pub seed: Option<u64>,
}

impl Default for GridWorldConfig {
    fn default() -> Self {
        Self {
            width: 4,
            height: 4,
            goal: (3, 3),
            start: Some((0, 0)),
            max_steps: 50,
            goal_reward: 10.0,
            step_penalty: -0.1,
            seed: None,
        }
    }
}

/// Simple GridWorld environment.
///
/// A 2D grid where the agent must navigate to a goal position.
/// Actions: 0=Up, 1=Down, 2=Left, 3=Right
#[derive(Debug, Clone)]
pub struct GridWorld {
    config: GridWorldConfig,
    position: (usize, usize),
    steps: usize,
    done: bool,
    initialized: bool,
}

impl GridWorld {
    /// Creates a new GridWorld environment.
    pub fn new(config: GridWorldConfig) -> EnvResult<Self> {
        if config.width < 2 || config.height < 2 {
            return Err(EnvironmentError::InvalidConfiguration(
                "Grid must be at least 2x2".to_string(),
            ));
        }
        if config.goal.0 >= config.width || config.goal.1 >= config.height {
            return Err(EnvironmentError::InvalidConfiguration(format!(
                "Goal {:?} out of bounds for {}x{} grid",
                config.goal, config.width, config.height
            )));
        }

        Ok(Self {
            config,
            position: (0, 0),
            steps: 0,
            done: false,
            initialized: false,
        })
    }

    /// Encodes the grid state as a normalized vector.
    fn encode_state(&self) -> Vec<f64> {
        vec![
            self.position.0 as f64 / (self.config.width - 1) as f64,
            self.position.1 as f64 / (self.config.height - 1) as f64,
            self.config.goal.0 as f64 / (self.config.width - 1) as f64,
            self.config.goal.1 as f64 / (self.config.height - 1) as f64,
        ]
    }
}

impl Environment for GridWorld {
    fn reset(&mut self) -> EnvResult<Vec<f64>> {
        self.position = self.config.start.unwrap_or((0, 0));
        self.steps = 0;
        self.done = false;
        self.initialized = true;
        Ok(self.encode_state())
    }

    fn step(&mut self, action: usize) -> EnvResult<StepResult> {
        if !self.initialized {
            return Err(EnvironmentError::NotInitialized);
        }
        if self.done {
            return Err(EnvironmentError::AlreadyTerminated);
        }
        if action >= 4 {
            return Err(EnvironmentError::InvalidAction {
                action,
                max_action: 4,
            });
        }

        // Apply action
        let (x, y) = self.position;
        self.position = match action {
            0 => (x, y.saturating_add(1).min(self.config.height - 1)), // Up
            1 => (x, y.saturating_sub(1)),                             // Down
            2 => (x.saturating_sub(1), y),                             // Left
            3 => (x.saturating_add(1).min(self.config.width - 1), y),  // Right
            _ => unreachable!(),
        };

        self.steps += 1;

        // Check termination
        let at_goal = self.position == self.config.goal;
        let max_steps_reached = self.steps >= self.config.max_steps;
        self.done = at_goal || max_steps_reached;

        // Calculate reward
        let reward = if at_goal {
            self.config.goal_reward
        } else {
            self.config.step_penalty
        };

        Ok(StepResult {
            state: self.encode_state(),
            reward,
            done: self.done,
            info: if at_goal {
                Some("Goal reached!".to_string())
            } else {
                None
            },
        })
    }

    fn state(&self) -> EnvResult<Vec<f64>> {
        if !self.initialized {
            return Err(EnvironmentError::NotInitialized);
        }
        Ok(self.encode_state())
    }

    fn action_space(&self) -> usize {
        4 // Up, Down, Left, Right
    }

    fn state_dim(&self) -> usize {
        4 // x, y, goal_x, goal_y
    }

    fn max_steps(&self) -> usize {
        self.config.max_steps
    }

    fn is_done(&self) -> bool {
        self.done
    }

    fn name(&self) -> &str {
        "GridWorld"
    }

    fn render(&self) -> String {
        let mut grid = String::new();
        for y in (0..self.config.height).rev() {
            for x in 0..self.config.width {
                if (x, y) == self.position {
                    grid.push('A'); // Agent
                } else if (x, y) == self.config.goal {
                    grid.push('G'); // Goal
                } else {
                    grid.push('.');
                }
            }
            grid.push('\n');
        }
        grid
    }
}

// ============================================================================
// CartPole-like Environment
// ============================================================================

/// Configuration for CartPole environment.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CartPoleConfig {
    /// Gravity constant.
    pub gravity: f64,
    /// Mass of cart.
    pub cart_mass: f64,
    /// Mass of pole.
    pub pole_mass: f64,
    /// Length of pole (half).
    pub pole_length: f64,
    /// Force magnitude for actions.
    pub force_mag: f64,
    /// Time step for physics simulation.
    pub dt: f64,
    /// Maximum cart position (boundary).
    pub x_threshold: f64,
    /// Maximum pole angle (boundary).
    pub theta_threshold: f64,
    /// Maximum steps per episode.
    pub max_steps: usize,
    /// Random seed.
    pub seed: Option<u64>,
}

impl Default for CartPoleConfig {
    fn default() -> Self {
        Self {
            gravity: 9.8,
            cart_mass: 1.0,
            pole_mass: 0.1,
            pole_length: 0.5,
            force_mag: 10.0,
            dt: 0.02,
            x_threshold: 2.4,
            theta_threshold: 12.0 * PI / 180.0, // 12 degrees in radians
            max_steps: 200,
            seed: None,
        }
    }
}

/// CartPole environment (simplified inverted pendulum).
///
/// The agent must balance a pole on a cart by moving left or right.
/// Actions: 0=Push Left, 1=Push Right
/// State: [cart_position, cart_velocity, pole_angle, pole_angular_velocity]
#[derive(Debug, Clone)]
pub struct CartPole {
    config: CartPoleConfig,
    /// State: [x, x_dot, theta, theta_dot]
    state: [f64; 4],
    steps: usize,
    done: bool,
    initialized: bool,
}

impl CartPole {
    /// Creates a new CartPole environment.
    pub fn new(config: CartPoleConfig) -> EnvResult<Self> {
        if config.cart_mass <= 0.0 || config.pole_mass <= 0.0 {
            return Err(EnvironmentError::InvalidConfiguration(
                "Mass must be positive".to_string(),
            ));
        }
        if config.pole_length <= 0.0 {
            return Err(EnvironmentError::InvalidConfiguration(
                "Pole length must be positive".to_string(),
            ));
        }

        Ok(Self {
            config,
            state: [0.0; 4],
            steps: 0,
            done: false,
            initialized: false,
        })
    }

    /// Encodes state as normalized vector.
    fn encode_state(&self) -> Vec<f64> {
        vec![
            self.state[0] / self.config.x_threshold,           // x normalized
            self.state[1] / 3.0,                               // x_dot normalized (rough estimate)
            self.state[2] / self.config.theta_threshold,       // theta normalized
            self.state[3] / 3.0,                               // theta_dot normalized
        ]
    }

    /// Physics step using Euler integration.
    fn physics_step(&mut self, action: usize) {
        let [x, x_dot, theta, theta_dot] = self.state;

        let force = if action == 1 {
            self.config.force_mag
        } else {
            -self.config.force_mag
        };

        let total_mass = self.config.cart_mass + self.config.pole_mass;
        let pole_mass_length = self.config.pole_mass * self.config.pole_length;

        let cos_theta = theta.cos();
        let sin_theta = theta.sin();

        // Physics equations (simplified)
        let temp = (force + pole_mass_length * theta_dot * theta_dot * sin_theta) / total_mass;
        let theta_acc = (self.config.gravity * sin_theta - cos_theta * temp)
            / (self.config.pole_length
                * (4.0 / 3.0 - self.config.pole_mass * cos_theta * cos_theta / total_mass));
        let x_acc = temp - pole_mass_length * theta_acc * cos_theta / total_mass;

        // Euler integration
        self.state[0] = x + self.config.dt * x_dot;
        self.state[1] = x_dot + self.config.dt * x_acc;
        self.state[2] = theta + self.config.dt * theta_dot;
        self.state[3] = theta_dot + self.config.dt * theta_acc;
    }

    /// Checks if state is within bounds.
    fn is_within_bounds(&self) -> bool {
        self.state[0].abs() <= self.config.x_threshold
            && self.state[2].abs() <= self.config.theta_threshold
    }
}

impl Environment for CartPole {
    fn reset(&mut self) -> EnvResult<Vec<f64>> {
        // Random initial state with small perturbation
        let mut rng = match self.config.seed {
            Some(seed) => rand::rngs::StdRng::seed_from_u64(seed),
            None => rand::rngs::StdRng::from_entropy(),
        };

        self.state = [
            rng.gen_range(-0.05..0.05),
            rng.gen_range(-0.05..0.05),
            rng.gen_range(-0.05..0.05),
            rng.gen_range(-0.05..0.05),
        ];
        self.steps = 0;
        self.done = false;
        self.initialized = true;

        Ok(self.encode_state())
    }

    fn step(&mut self, action: usize) -> EnvResult<StepResult> {
        if !self.initialized {
            return Err(EnvironmentError::NotInitialized);
        }
        if self.done {
            return Err(EnvironmentError::AlreadyTerminated);
        }
        if action >= 2 {
            return Err(EnvironmentError::InvalidAction {
                action,
                max_action: 2,
            });
        }

        self.physics_step(action);
        self.steps += 1;

        // Check termination
        let within_bounds = self.is_within_bounds();
        let max_steps_reached = self.steps >= self.config.max_steps;
        self.done = !within_bounds || max_steps_reached;

        // Reward: +1 for each step the pole stays balanced
        let reward = if within_bounds { 1.0 } else { 0.0 };

        Ok(StepResult {
            state: self.encode_state(),
            reward,
            done: self.done,
            info: if !within_bounds {
                Some("Pole fell or cart out of bounds".to_string())
            } else if max_steps_reached {
                Some("Max steps reached - success!".to_string())
            } else {
                None
            },
        })
    }

    fn state(&self) -> EnvResult<Vec<f64>> {
        if !self.initialized {
            return Err(EnvironmentError::NotInitialized);
        }
        Ok(self.encode_state())
    }

    fn action_space(&self) -> usize {
        2 // Push Left, Push Right
    }

    fn state_dim(&self) -> usize {
        4 // x, x_dot, theta, theta_dot
    }

    fn max_steps(&self) -> usize {
        self.config.max_steps
    }

    fn is_done(&self) -> bool {
        self.done
    }

    fn name(&self) -> &str {
        "CartPole"
    }

    fn render(&self) -> String {
        format!(
            "CartPole: x={:.3}, x_dot={:.3}, theta={:.3}, theta_dot={:.3}",
            self.state[0], self.state[1], self.state[2], self.state[3]
        )
    }
}

// ============================================================================
// Simple Binary Environment (for testing)
// ============================================================================

/// Simple binary choice environment for basic testing.
///
/// The agent observes a signal and must choose the matching action.
/// This is a simple environment to verify that learning works at all.
#[derive(Debug, Clone)]
pub struct BinaryChoice {
    current_signal: f64,
    correct_action: usize,
    steps: usize,
    max_steps: usize,
    done: bool,
    initialized: bool,
}

impl BinaryChoice {
    /// Creates a new BinaryChoice environment.
    pub fn new(max_steps: usize) -> EnvResult<Self> {
        if max_steps == 0 {
            return Err(EnvironmentError::InvalidConfiguration(
                "Max steps must be positive".to_string(),
            ));
        }
        Ok(Self {
            current_signal: 0.0,
            correct_action: 0,
            steps: 0,
            max_steps,
            done: false,
            initialized: false,
        })
    }

    fn generate_signal(&mut self) {
        let mut rng = rand::thread_rng();
        self.correct_action = rng.gen_range(0..2);
        // Signal encodes which action is correct
        // Action 0 -> signal in [-1, 0], Action 1 -> signal in [0, 1]
        self.current_signal = if self.correct_action == 0 {
            rng.gen_range(-1.0..0.0)
        } else {
            rng.gen_range(0.0..1.0)
        };
    }
}

impl Environment for BinaryChoice {
    fn reset(&mut self) -> EnvResult<Vec<f64>> {
        self.steps = 0;
        self.done = false;
        self.initialized = true;
        self.generate_signal();
        Ok(vec![
            self.current_signal,
            0.0,
            0.0,
            0.0, // Pad to 4 dimensions
        ])
    }

    fn step(&mut self, action: usize) -> EnvResult<StepResult> {
        if !self.initialized {
            return Err(EnvironmentError::NotInitialized);
        }
        if self.done {
            return Err(EnvironmentError::AlreadyTerminated);
        }
        if action >= 2 {
            return Err(EnvironmentError::InvalidAction {
                action,
                max_action: 2,
            });
        }

        self.steps += 1;

        // Reward: +1 for correct, -1 for incorrect
        let reward = if action == self.correct_action {
            1.0
        } else {
            -1.0
        };

        self.done = self.steps >= self.max_steps;

        // Generate new signal for next step
        if !self.done {
            self.generate_signal();
        }

        Ok(StepResult {
            state: vec![self.current_signal, 0.0, 0.0, 0.0],
            reward,
            done: self.done,
            info: None,
        })
    }

    fn state(&self) -> EnvResult<Vec<f64>> {
        if !self.initialized {
            return Err(EnvironmentError::NotInitialized);
        }
        Ok(vec![self.current_signal, 0.0, 0.0, 0.0])
    }

    fn action_space(&self) -> usize {
        2
    }

    fn state_dim(&self) -> usize {
        4
    }

    fn max_steps(&self) -> usize {
        self.max_steps
    }

    fn is_done(&self) -> bool {
        self.done
    }

    fn name(&self) -> &str {
        "BinaryChoice"
    }

    fn render(&self) -> String {
        format!(
            "BinaryChoice: signal={:.3}, correct_action={}",
            self.current_signal, self.correct_action
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // GridWorld tests
    #[test]
    fn test_gridworld_creation() {
        let config = GridWorldConfig::default();
        let env = GridWorld::new(config).unwrap();
        assert_eq!(env.action_space(), 4);
        assert_eq!(env.state_dim(), 4);
    }

    #[test]
    fn test_gridworld_invalid_config() {
        let config = GridWorldConfig {
            width: 1,
            ..Default::default()
        };
        assert!(GridWorld::new(config).is_err());
    }

    #[test]
    fn test_gridworld_goal_out_of_bounds() {
        let config = GridWorldConfig {
            goal: (10, 10),
            ..Default::default()
        };
        assert!(GridWorld::new(config).is_err());
    }

    #[test]
    fn test_gridworld_reset() {
        let config = GridWorldConfig::default();
        let mut env = GridWorld::new(config).unwrap();

        let state = env.reset().unwrap();
        assert_eq!(state.len(), 4);
        assert!(!env.is_done());
    }

    #[test]
    fn test_gridworld_step_before_reset() {
        let config = GridWorldConfig::default();
        let mut env = GridWorld::new(config).unwrap();

        let result = env.step(0);
        assert!(matches!(result, Err(EnvironmentError::NotInitialized)));
    }

    #[test]
    fn test_gridworld_invalid_action() {
        let config = GridWorldConfig::default();
        let mut env = GridWorld::new(config).unwrap();
        env.reset().unwrap();

        let result = env.step(5);
        assert!(matches!(
            result,
            Err(EnvironmentError::InvalidAction {
                action: 5,
                max_action: 4
            })
        ));
    }

    #[test]
    fn test_gridworld_movement() {
        let config = GridWorldConfig {
            width: 4,
            height: 4,
            start: Some((1, 1)),
            goal: (3, 3),
            ..Default::default()
        };
        let mut env = GridWorld::new(config).unwrap();
        env.reset().unwrap();

        // Move right
        let result = env.step(3).unwrap();
        assert!(!result.done);

        // Move up
        let result = env.step(0).unwrap();
        assert!(!result.done);
    }

    #[test]
    fn test_gridworld_reach_goal() {
        let config = GridWorldConfig {
            width: 2,
            height: 2,
            start: Some((0, 0)),
            goal: (1, 1),
            ..Default::default()
        };
        let mut env = GridWorld::new(config).unwrap();
        env.reset().unwrap();

        // Move right
        env.step(3).unwrap();
        // Move up
        let result = env.step(0).unwrap();

        assert!(result.done);
        assert_eq!(result.reward, 10.0);
        assert!(result.info.is_some());
    }

    #[test]
    fn test_gridworld_boundary() {
        let config = GridWorldConfig {
            width: 2,
            height: 2,
            start: Some((0, 0)),
            goal: (1, 1),
            ..Default::default()
        };
        let mut env = GridWorld::new(config).unwrap();
        env.reset().unwrap();

        // Try to move left from leftmost column
        env.step(2).unwrap();
        let state = env.state().unwrap();
        // Should still be at x=0
        assert_eq!(state[0], 0.0);
    }

    #[test]
    fn test_gridworld_render() {
        let config = GridWorldConfig::default();
        let mut env = GridWorld::new(config).unwrap();
        env.reset().unwrap();

        let render = env.render();
        assert!(render.contains('A')); // Agent
        assert!(render.contains('G')); // Goal
    }

    // CartPole tests
    #[test]
    fn test_cartpole_creation() {
        let config = CartPoleConfig::default();
        let env = CartPole::new(config).unwrap();
        assert_eq!(env.action_space(), 2);
        assert_eq!(env.state_dim(), 4);
    }

    #[test]
    fn test_cartpole_invalid_mass() {
        let config = CartPoleConfig {
            cart_mass: -1.0,
            ..Default::default()
        };
        assert!(CartPole::new(config).is_err());
    }

    #[test]
    fn test_cartpole_reset() {
        let config = CartPoleConfig::default();
        let mut env = CartPole::new(config).unwrap();

        let state = env.reset().unwrap();
        assert_eq!(state.len(), 4);
        assert!(!env.is_done());
    }

    #[test]
    fn test_cartpole_step() {
        let config = CartPoleConfig::default();
        let mut env = CartPole::new(config).unwrap();
        env.reset().unwrap();

        let result = env.step(1).unwrap();
        assert_eq!(result.state.len(), 4);
        assert!(result.reward >= 0.0);
    }

    #[test]
    fn test_cartpole_physics() {
        let config = CartPoleConfig {
            seed: Some(42),
            ..Default::default()
        };
        let mut env = CartPole::new(config).unwrap();
        env.reset().unwrap();

        // Take several steps
        for _ in 0..10 {
            if env.is_done() {
                break;
            }
            let result = env.step(1).unwrap();
            assert_eq!(result.state.len(), 4);
        }
    }

    #[test]
    fn test_cartpole_termination() {
        let config = CartPoleConfig {
            max_steps: 5,
            ..Default::default()
        };
        let mut env = CartPole::new(config).unwrap();
        env.reset().unwrap();

        // Take steps until done
        for _ in 0..10 {
            if env.is_done() {
                break;
            }
            env.step(0).unwrap();
        }

        assert!(env.is_done());
    }

    // BinaryChoice tests
    #[test]
    fn test_binarychoice_creation() {
        let env = BinaryChoice::new(100).unwrap();
        assert_eq!(env.action_space(), 2);
        assert_eq!(env.state_dim(), 4);
    }

    #[test]
    fn test_binarychoice_invalid_steps() {
        let result = BinaryChoice::new(0);
        assert!(result.is_err());
    }

    #[test]
    fn test_binarychoice_reset() {
        let mut env = BinaryChoice::new(100).unwrap();
        let state = env.reset().unwrap();
        assert_eq!(state.len(), 4);
    }

    #[test]
    fn test_binarychoice_correct_reward() {
        let mut env = BinaryChoice::new(100).unwrap();
        env.reset().unwrap();

        // The signal determines correct action
        // If signal < 0, correct action is 0
        // If signal >= 0, correct action is 1
        let state = env.state().unwrap();
        let correct_action = if state[0] < 0.0 { 0 } else { 1 };

        let result = env.step(correct_action).unwrap();
        assert_eq!(result.reward, 1.0);
    }

    #[test]
    fn test_binarychoice_incorrect_reward() {
        let mut env = BinaryChoice::new(100).unwrap();
        env.reset().unwrap();

        let state = env.state().unwrap();
        let wrong_action = if state[0] < 0.0 { 1 } else { 0 };

        let result = env.step(wrong_action).unwrap();
        assert_eq!(result.reward, -1.0);
    }

    #[test]
    fn test_environment_trait_consistency() {
        let mut gridworld = GridWorld::new(GridWorldConfig::default()).unwrap();
        let mut cartpole = CartPole::new(CartPoleConfig::default()).unwrap();
        let mut binary = BinaryChoice::new(100).unwrap();

        // All should be uninitialized
        assert!(!gridworld.is_done());
        assert!(!cartpole.is_done());
        assert!(!binary.is_done());

        // Reset all
        gridworld.reset().unwrap();
        cartpole.reset().unwrap();
        binary.reset().unwrap();

        // Names should be set
        assert_eq!(gridworld.name(), "GridWorld");
        assert_eq!(cartpole.name(), "CartPole");
        assert_eq!(binary.name(), "BinaryChoice");
    }

    #[test]
    fn test_step_after_done() {
        let config = GridWorldConfig {
            width: 2,
            height: 2,
            start: Some((0, 0)),
            goal: (1, 0),
            ..Default::default()
        };
        let mut env = GridWorld::new(config).unwrap();
        env.reset().unwrap();

        // Move to goal
        env.step(3).unwrap(); // Move right to (1, 0)

        // Try another step
        let result = env.step(0);
        assert!(matches!(result, Err(EnvironmentError::AlreadyTerminated)));
    }
}
