//! Cross-agent coordination systems
//!
//! Implements:
//! - Pub/sub messaging for agent communication
//! - Distributed locks for critical sections
//! - Consensus protocols (Raft-inspired)
//! - Namespace management for multi-agent systems

pub mod consensus;
pub mod locks;
pub mod namespace;
pub mod pubsub;

pub use consensus::{ConsensusEngine, Proposal, Vote};
pub use locks::{DistributedLock, LockToken};
pub use namespace::Namespace;
pub use pubsub::{Message, PubSubBroker, Subscription};
