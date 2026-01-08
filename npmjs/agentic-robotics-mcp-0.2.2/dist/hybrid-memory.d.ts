/**
 * Hybrid AgentDB Memory Implementation
 *
 * Strategy: Direct SQLite for storage (fast), CLI for vector search (until API ready)
 * Expected: 50-100x faster than pure CLI approach
 */
import type { Episode, Memory } from './memory.js';
export declare class HybridAgentDBMemory {
    private db;
    private dbPath;
    private initialized;
    private performanceMetrics;
    constructor(dbPath: string);
    initialize(): Promise<void>;
    /**
     * Store episode using direct SQL (100x faster than CLI)
     */
    storeEpisode(episode: Episode): Promise<void>;
    /**
     * Bulk store episodes (even faster with transactions)
     */
    bulkStoreEpisodes(episodes: Episode[]): Promise<void>;
    /**
     * Retrieve memories using CLI vector search (until API ready)
     * Falls back to SQL if CLI fails
     */
    retrieveMemories(query: string, k?: number, options?: {
        minReward?: number;
        onlySuccesses?: boolean;
        onlyFailures?: boolean;
        synthesizeContext?: boolean;
    }): Promise<Memory[]>;
    /**
     * Query with context (SQL + CLI hybrid)
     */
    queryWithContext(query: string, options?: {
        k?: number;
        minConfidence?: number;
        domain?: string;
    }): Promise<{
        memories: Memory[];
        context?: string;
    }>;
    /**
     * Consolidate skills (direct SQL analysis)
     */
    consolidateSkills(options?: {
        minAttempts?: number;
        minReward?: number;
        timeWindowDays?: number;
    }): Promise<void>;
    /**
     * Search skills (direct SQL)
     */
    searchSkills(query: string, options?: {
        k?: number;
        minSuccessRate?: number;
        sortBy?: 'success_rate' | 'avg_reward' | 'attempts';
    }): Promise<any[]>;
    /**
     * Optimize database
     */
    optimize(): Promise<void>;
    /**
     * Get performance metrics
     */
    getMetrics(): {
        storeCount: number;
        retrieveCount: number;
        avgStoreTime: number;
        avgRetrieveTime: number;
    };
    /**
     * Get database statistics
     */
    getStats(): Promise<any>;
    close(): Promise<void>;
    private updateStoreMetrics;
    private updateRetrieveMetrics;
}
//# sourceMappingURL=hybrid-memory.d.ts.map