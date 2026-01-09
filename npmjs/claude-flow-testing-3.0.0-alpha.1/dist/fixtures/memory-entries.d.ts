/**
 * V3 Claude-Flow Memory Entry Fixtures
 *
 * Test data for memory and AgentDB testing
 * Following London School principle of explicit test data
 */
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
}
/**
 * Memory metadata interface
 */
export interface MemoryMetadata {
    type: 'short-term' | 'long-term' | 'semantic' | 'episodic';
    tags: string[];
    source?: string;
    confidence?: number;
    ttl?: number;
}
/**
 * Vector search query interface
 */
export interface VectorQuery {
    embedding: number[];
    topK: number;
    threshold?: number;
    filters?: Record<string, unknown>;
}
/**
 * Search result interface
 */
export interface SearchResult {
    key: string;
    value: unknown;
    score: number;
    metadata: MemoryMetadata;
}
/**
 * Pre-defined memory entries for testing
 */
export declare const memoryEntries: Record<string, MemoryEntry>;
/**
 * Pre-defined search results for testing
 */
export declare const searchResults: Record<string, SearchResult[]>;
/**
 * Generate mock embedding vector
 * Creates deterministic embeddings based on seed string
 */
export declare function generateMockEmbedding(dimensions: number, seed: string): number[];
/**
 * Factory function to create memory entry with overrides
 */
export declare function createMemoryEntry(base: keyof typeof memoryEntries, overrides?: Partial<MemoryEntry>): MemoryEntry;
/**
 * Factory function to create vector query
 */
export declare function createVectorQuery(overrides?: Partial<VectorQuery>): VectorQuery;
/**
 * Create batch of memory entries for performance testing
 */
export declare function createMemoryBatch(count: number, type?: MemoryMetadata['type']): MemoryEntry[];
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
};
/**
 * AgentDB specific test data
 */
export declare const agentDBTestData: {
    hnswConfig: {
        M: number;
        efConstruction: number;
        efSearch: number;
        dimensions: number;
    };
    performanceTargets: {
        searchSpeedupMin: number;
        searchSpeedupMax: number;
        memoryReduction: number;
        insertionTime: number;
        searchTime: number;
    };
    quantizationConfigs: {
        scalar4bit: {
            bits: number;
            compressionRatio: number;
        };
        scalar8bit: {
            bits: number;
            compressionRatio: number;
        };
        product: {
            subvectors: number;
            bits: number;
            compressionRatio: number;
        };
    };
};
//# sourceMappingURL=memory-entries.d.ts.map