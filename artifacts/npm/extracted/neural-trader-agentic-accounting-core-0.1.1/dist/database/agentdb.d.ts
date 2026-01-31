/**
 * AgentDB Client
 * Vector database for semantic search and pattern matching
 */
export interface VectorRecord {
    id: string;
    vector: Float32Array;
    metadata: Record<string, any>;
}
export interface SearchResult {
    id: string;
    score: number;
    metadata: Record<string, any>;
}
export interface AgentDBOptions {
    collection: string;
    dimensions: number;
    distanceMetric?: 'cosine' | 'euclidean' | 'dot';
}
/**
 * AgentDB client for vector operations
 * Note: This is a wrapper interface. Actual implementation depends on
 * the AgentDB library from @ruvnet/agentdb package
 */
export declare class AgentDBClient {
    private config;
    private collections;
    private initialized;
    constructor();
    /**
     * Initialize AgentDB with persistence
     */
    initialize(): Promise<void>;
    /**
     * Create or get a collection
     */
    getCollection(name: string): Promise<any>;
    /**
     * Insert vector into collection
     */
    insert(collection: string, id: string, vector: Float32Array | number[], metadata?: Record<string, any>): Promise<void>;
    /**
     * Batch insert vectors
     */
    batchInsert(collection: string, records: Array<{
        id: string;
        vector: Float32Array | number[];
        metadata?: Record<string, any>;
    }>): Promise<void>;
    /**
     * Search for similar vectors
     */
    search(collection: string, query: Float32Array | number[], topK?: number, filter?: Record<string, any>): Promise<SearchResult[]>;
    /**
     * Delete vector by ID
     */
    delete(collection: string, id: string): Promise<boolean>;
    /**
     * Get vector by ID
     */
    get(collection: string, id: string): Promise<VectorRecord | null>;
    /**
     * Count vectors in collection
     */
    count(collection: string): Promise<number>;
    /**
     * Clear all vectors in collection
     */
    clear(collection: string): Promise<void>;
    /**
     * Persist data to disk
     */
    persist(): Promise<void>;
    /**
     * Close AgentDB connection
     */
    close(): Promise<void>;
    /**
     * Health check
     */
    healthCheck(): Promise<{
        healthy: boolean;
        collections: number;
        totalVectors: number;
    }>;
}
export declare const getAgentDB: () => AgentDBClient;
export declare const closeAgentDB: () => Promise<void>;
//# sourceMappingURL=agentdb.d.ts.map