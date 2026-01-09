/**
 * @claude-flow/testing - Memory Fixtures
 *
 * Comprehensive mock memory entries and backend configurations for testing.
 * Supports AgentDB, HNSW indexing, vector search, and ReasoningBank patterns.
 *
 * Based on ADR-006 (Unified Memory Service) and ADR-009 (Hybrid Memory Backend).
 */
import { type Mock } from 'vitest';
/**
 * Memory entry types
 */
export type MemoryType = 'short-term' | 'long-term' | 'semantic' | 'episodic' | 'procedural';
/**
 * Memory backend types
 */
export type MemoryBackendType = 'sqlite' | 'agentdb' | 'hybrid' | 'redis' | 'memory';
/**
 * Memory entry interface
 */
export interface MemoryEntry {
    key: string;
    value: unknown;
    metadata: MemoryMetadata;
    embedding?: number[];
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    accessCount?: number;
}
/**
 * Memory metadata interface
 */
export interface MemoryMetadata {
    type: MemoryType;
    tags: string[];
    source?: string;
    confidence?: number;
    ttl?: number;
    agentId?: string;
    sessionId?: string;
}
/**
 * Vector query interface
 */
export interface VectorQuery {
    embedding: number[];
    topK: number;
    threshold?: number;
    filters?: Record<string, unknown>;
    includeMetadata?: boolean;
    rerank?: boolean;
}
/**
 * Search result interface
 */
export interface SearchResult {
    key: string;
    value: unknown;
    score: number;
    metadata: MemoryMetadata;
    distance?: number;
}
/**
 * HNSW index configuration
 */
export interface HNSWConfig {
    M: number;
    efConstruction: number;
    efSearch: number;
    dimensions: number;
    metric: 'cosine' | 'euclidean' | 'dot';
}
/**
 * Quantization configuration
 */
export interface QuantizationConfig {
    enabled: boolean;
    bits: 4 | 8 | 16;
    type: 'scalar' | 'product';
    compressionRatio?: number;
}
/**
 * Memory backend configuration
 */
export interface MemoryBackendConfig {
    type: MemoryBackendType;
    path?: string;
    maxSize?: number;
    ttlMs?: number;
    vectorDimensions?: number;
    hnswConfig?: HNSWConfig;
    quantization?: QuantizationConfig;
    caching?: {
        enabled: boolean;
        maxSize: number;
        ttl: number;
        strategy: 'lru' | 'lfu' | 'arc';
    };
}
/**
 * Learned pattern interface (for ReasoningBank)
 */
export interface LearnedPattern {
    id: string;
    sessionId: string;
    task: string;
    input: string;
    output: string;
    reward: number;
    success: boolean;
    critique?: string;
    tokensUsed?: number;
    latencyMs?: number;
    createdAt: Date;
    embedding?: number[];
}
/**
 * Generate deterministic mock embedding vector
 */
export declare function generateMockEmbedding(dimensions: number, seed: string): number[];
/**
 * Pre-defined memory entries for testing
 */
export declare const memoryEntries: Record<string, MemoryEntry>;
/**
 * Pre-defined search results for testing
 */
export declare const searchResults: Record<string, SearchResult[]>;
/**
 * Pre-defined learned patterns for ReasoningBank testing
 */
export declare const learnedPatterns: Record<string, LearnedPattern>;
/**
 * Pre-defined HNSW configurations
 */
export declare const hnswConfigs: Record<string, HNSWConfig>;
/**
 * Pre-defined quantization configurations
 */
export declare const quantizationConfigs: Record<string, QuantizationConfig>;
/**
 * Pre-defined memory backend configurations
 */
export declare const memoryBackendConfigs: Record<string, MemoryBackendConfig>;
/**
 * Performance targets from V3 specifications
 */
export declare const performanceTargets: {
    searchSpeedupMin: number;
    searchSpeedupMax: number;
    memoryReduction: number;
    insertionTime: number;
    searchTime: number;
    flashAttentionSpeedup: number[];
};
/**
 * Factory function to create memory entry with overrides
 */
export declare function createMemoryEntry(base: keyof typeof memoryEntries, overrides?: Partial<MemoryEntry>): MemoryEntry;
/**
 * Factory function to create vector query
 */
export declare function createVectorQuery(overrides?: Partial<VectorQuery>): VectorQuery;
/**
 * Factory function to create learned pattern
 */
export declare function createLearnedPattern(base: keyof typeof learnedPatterns, overrides?: Partial<LearnedPattern>): LearnedPattern;
/**
 * Factory function to create HNSW config
 */
export declare function createHNSWConfig(base?: keyof typeof hnswConfigs, overrides?: Partial<HNSWConfig>): HNSWConfig;
/**
 * Factory function to create memory backend config
 */
export declare function createMemoryBackendConfig(base?: keyof typeof memoryBackendConfigs, overrides?: Partial<MemoryBackendConfig>): MemoryBackendConfig;
/**
 * Create batch of memory entries for performance testing
 */
export declare function createMemoryBatch(count: number, type?: MemoryType, dimensions?: number): MemoryEntry[];
/**
 * Create embeddings batch for vector index testing
 */
export declare function createEmbeddingsBatch(count: number, dimensions?: number): {
    id: string;
    embedding: number[];
}[];
/**
 * Invalid memory entries for error testing
 */
export declare const invalidMemoryEntries: {
    emptyKey: {
        key: string;
        value: {
            data: string;
        };
        metadata: {
            type: "short-term";
            tags: never[];
        };
        createdAt: Date;
        updatedAt: Date;
    };
    nullValue: {
        key: string;
        value: null;
        metadata: {
            type: "short-term";
            tags: never[];
        };
        createdAt: Date;
        updatedAt: Date;
    };
    invalidEmbeddingDimension: {
        key: string;
        value: {
            data: string;
        };
        metadata: {
            type: "semantic";
            tags: never[];
        };
        embedding: number[];
        createdAt: Date;
        updatedAt: Date;
    };
    expiredEntry: {
        key: string;
        value: {
            data: string;
        };
        metadata: {
            type: "short-term";
            tags: never[];
            ttl: number;
        };
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date;
    };
    invalidTags: {
        key: string;
        value: {
            data: string;
        };
        metadata: {
            type: "short-term";
            tags: string[];
        };
        createdAt: Date;
        updatedAt: Date;
    };
};
/**
 * Mock memory service interface
 */
export interface MockMemoryService {
    store: Mock<(key: string, value: unknown, metadata?: MemoryMetadata) => Promise<void>>;
    retrieve: Mock<(key: string) => Promise<unknown>>;
    search: Mock<(query: VectorQuery) => Promise<SearchResult[]>>;
    delete: Mock<(key: string) => Promise<void>>;
    clear: Mock<() => Promise<void>>;
    getStats: Mock<() => Promise<{
        totalEntries: number;
        sizeBytes: number;
    }>>;
}
/**
 * Create a mock memory service
 */
export declare function createMockMemoryService(): MockMemoryService;
/**
 * Mock AgentDB interface
 */
export interface MockAgentDB {
    insert: Mock<(id: string, embedding: number[], metadata?: unknown) => Promise<void>>;
    search: Mock<(embedding: number[], k: number) => Promise<SearchResult[]>>;
    delete: Mock<(id: string) => Promise<void>>;
    update: Mock<(id: string, embedding: number[], metadata?: unknown) => Promise<void>>;
    getStats: Mock<() => Promise<{
        vectorCount: number;
        indexSize: number;
    }>>;
    rebuildIndex: Mock<() => Promise<void>>;
}
/**
 * Create a mock AgentDB instance
 */
export declare function createMockAgentDB(): MockAgentDB;
//# sourceMappingURL=memory-fixtures.d.ts.map