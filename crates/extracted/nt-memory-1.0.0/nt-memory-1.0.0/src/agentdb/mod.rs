//! L2 Vector Database - AgentDB Integration
//!
//! Performance targets:
//! - Vector search: <1ms (p95)
//! - HNSW index: 150x faster than linear scan
//! - Batch insert: <10ms for 1000 vectors

pub mod embeddings;
pub mod storage;
pub mod vector_store;

pub use embeddings::{Embedding, EmbeddingProvider};
pub use storage::{PersistentStore, StorageBackend};
pub use vector_store::{SearchResult, VectorStore};
