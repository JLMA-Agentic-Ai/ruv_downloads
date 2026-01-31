/**
 * @neural-trader/core - AgentDB Backward Compatibility Layer Types
 *
 * TypeScript definitions matching original AgentDB API exactly
 *
 * @version 1.0.0
 * @module agentdb-compat
 */

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * AgentDB configuration options
 * Exact match to original AgentDB API
 */
export interface AgentDBConfig {
  /** Vector dimension (must match all vectors) */
  dimension: number;

  /** Distance metric for similarity search */
  metric?: 'cosine' | 'euclidean' | 'dot';

  /** Optional persistence path for saving/loading */
  persistPath?: string;

  /** Cache size hint for optimization */
  cacheSize?: number;

  // Optional RuVector enhancements (backward compatible)
  /** Enable GNN pattern enhancement (opt-in) */
  enableGNN?: boolean;

  /** Enable SONA self-learning (opt-in) */
  enableSONA?: boolean;

  /** Enable 4-tier compression (opt-in) */
  enableCompression?: boolean;
}

// ============================================================================
// DATA TYPES
// ============================================================================

/**
 * Vector entry with metadata
 * Exact match to original AgentDB API
 */
export interface VectorEntry {
  /** Unique identifier */
  id: string;

  /** Embedding vector (must match dimension) */
  vector: number[];

  /** Optional metadata */
  metadata?: Record<string, any>;
}

/**
 * Search options for vector queries
 * Exact match to original AgentDB API
 */
export interface SearchOptions {
  /** Number of results to return (default: 10) */
  k?: number;

  /** Minimum similarity threshold [0-1] (default: no threshold) */
  threshold?: number;

  /** Metadata filter (not implemented in stub) */
  filter?: Record<string, any>;
}

/**
 * Search result with similarity score
 * Exact match to original AgentDB API
 */
export interface SearchResult {
  /** Vector ID */
  id: string;

  /** Similarity score [0-1] where 1 = identical */
  score: number;

  /** Optional metadata */
  metadata?: Record<string, any>;
}

/**
 * Database statistics
 * Exact match to original AgentDB API
 */
export interface DbStats {
  /** Total number of vectors */
  count: number;

  /** Vector dimension */
  dimension: number;

  /** Whether index is built */
  indexBuilt?: boolean;

  /** Estimated memory usage in bytes */
  memoryUsage?: number;
}

// ============================================================================
// MAIN CLASS DEFINITION
// ============================================================================

/**
 * AgentDBCompat - Drop-in replacement for AgentDB using RuVector
 *
 * Maintains exact API compatibility while providing:
 * - 8.2x faster search (RuVector HNSW)
 * - Optional GNN pattern enhancement
 * - Optional SONA self-learning
 * - Optional 4-tier compression
 *
 * @example
 * ```typescript
 * // Drop-in replacement - no code changes needed
 * import AgentDB from '@neural-trader/core/agentdb-compat';
 *
 * const db = new AgentDB({ dimension: 384 });
 * await db.store('vec1', embedding, { type: 'pattern' });
 * const results = await db.search(query, { k: 10 });
 * ```
 */
export declare class AgentDBCompat {
  /**
   * Create new AgentDB instance
   *
   * @param config Configuration options
   */
  constructor(config: AgentDBConfig);

  // ========================================================================
  // CORE METHODS
  // ========================================================================

  /**
   * Store a vector with optional metadata
   *
   * @param id Unique identifier
   * @param vector Embedding vector (must match dimension)
   * @param metadata Optional metadata
   * @throws Error if vector dimension doesn't match config
   */
  store(
    id: string,
    vector: number[],
    metadata?: Record<string, any>
  ): Promise<void>;

  /**
   * Retrieve a vector by ID
   *
   * @param id Vector ID
   * @returns Vector entry or null if not found
   */
  retrieve(id: string): Promise<VectorEntry | null>;

  /**
   * Search for similar vectors
   *
   * Returns results ranked by similarity score (1 = identical, 0 = different)
   *
   * @param query Query vector (must match dimension)
   * @param options Search options (k, threshold, filter)
   * @returns Ranked search results
   * @throws Error if query dimension doesn't match config
   */
  search(
    query: number[],
    options?: SearchOptions
  ): Promise<SearchResult[]>;

  /**
   * Delete a vector by ID
   *
   * @param id Vector ID to delete
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Store multiple vectors in a batch
   *
   * @param entries Array of vector entries
   * @throws Error if any vector dimension doesn't match config
   */
  bulkStore(entries: VectorEntry[]): Promise<void>;

  // ========================================================================
  // INDEX MANAGEMENT
  // ========================================================================

  /**
   * Build HNSW index for faster search
   *
   * Call after bulk loading vectors for optimal performance
   */
  buildIndex(): Promise<void>;

  /**
   * Optimize index structure
   *
   * Improves search performance and reduces memory usage
   */
  optimize(): Promise<void>;

  // ========================================================================
  // PERSISTENCE
  // ========================================================================

  /**
   * Save database to disk
   *
   * @param path Optional path (overrides config.persistPath)
   */
  save(path?: string): Promise<void>;

  /**
   * Load database from disk
   *
   * @param path Path to load from
   */
  load(path: string): Promise<void>;

  /**
   * Clear all vectors from database
   */
  clear(): Promise<void>;

  // ========================================================================
  // STATISTICS
  // ========================================================================

  /**
   * Get database statistics
   *
   * @returns Current database stats
   */
  stats(): DbStats;
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Default export for drop-in replacement
 */
export default AgentDBCompat;

/**
 * Named export as AgentDB for flexibility
 */
export { AgentDBCompat as AgentDB };
