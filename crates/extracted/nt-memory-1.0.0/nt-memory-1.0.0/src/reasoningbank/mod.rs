//! ReasoningBank - Trajectory Tracking and Learning
//!
//! Implements:
//! - Trajectory tracking for agent decisions
//! - Verdict judgment (predicted vs actual outcomes)
//! - Memory distillation and compression
//! - Feedback loops for continuous learning

pub mod distillation;
pub mod trajectory;
pub mod verdict;

pub use distillation::{DistilledPattern, MemoryDistiller};
pub use trajectory::{Action, Observation, Trajectory, TrajectoryTracker};
pub use verdict::{Verdict, VerdictJudge, VerdictResult};
