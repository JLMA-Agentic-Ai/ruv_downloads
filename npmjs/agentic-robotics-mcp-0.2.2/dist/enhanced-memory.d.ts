/**
 * Enhanced AgentDB Memory Integration
 *
 * Uses ALL AgentDB features:
 * - Reflexion memory with self-critique
 * - Skill library with semantic search
 * - Causal reasoning
 * - Automated learning
 * - Performance optimization
 */
export interface Episode {
    sessionId: string;
    taskName: string;
    confidence: number;
    success: boolean;
    outcome: string;
    strategy?: string;
    metadata?: Record<string, any>;
    reasoning?: string;
    critique?: string;
}
export interface Memory {
    task: string;
    confidence: number;
    success: boolean;
    outcome: string;
    strategy?: string;
    timestamp: number;
    reasoning?: string;
    critique?: string;
    similarity?: number;
}
export interface Skill {
    name: string;
    description: string;
    successRate: number;
    avgReward: number;
    numAttempts: number;
    lastUsed: number;
    bestStrategy?: string;
}
export interface MemoryStats {
    totalEpisodes: number;
    totalSkills: number;
    avgRetrievalTime: number;
    cacheHitRate: number;
    dbSize: number;
}
export declare class EnhancedAgentDBMemory {
    private dbPath;
    private initialized;
    private performanceMetrics;
    constructor(dbPath: string);
    initialize(): Promise<void>;
    /**
     * Store episode with full context and self-critique
     */
    storeEpisode(episode: Episode): Promise<void>;
    /**
     * Retrieve memories with semantic search and causal reasoning
     */
    retrieveMemories(query: string, k?: number, options?: {
        minReward?: number;
        onlySuccesses?: boolean;
        onlyFailures?: boolean;
        synthesizeContext?: boolean;
        enableReasoning?: boolean;
        timeWindow?: number;
    }): Promise<Memory[]>;
    /**
     * Query with full context synthesis and reasoning
     */
    queryWithContext(query: string, options?: {
        k?: number;
        minConfidence?: number;
        domain?: string;
        synthesizeReasoning?: boolean;
    }): Promise<{
        memories: Memory[];
        context?: string;
        reasoning?: string;
    }>;
    /**
     * Consolidate skills with advanced filtering
     */
    consolidateSkills(options?: {
        minAttempts?: number;
        minReward?: number;
        timeWindowDays?: number;
        enablePruning?: boolean;
    }): Promise<number>;
    /**
     * Get skill library with semantic search
     */
    searchSkills(query: string, options?: {
        k?: number;
        minSuccessRate?: number;
        sortBy?: 'success_rate' | 'avg_reward' | 'num_attempts' | 'last_used';
    }): Promise<Skill[]>;
    /**
     * Generate self-critique for an episode
     */
    private generateCritique;
    /**
     * Get comprehensive statistics with performance metrics
     */
    getStats(): Promise<MemoryStats>;
    /**
     * Optimize database performance
     */
    optimize(): Promise<void>;
    /**
     * Clear performance metrics
     */
    clearMetrics(): void;
    close(): Promise<void>;
}
//# sourceMappingURL=enhanced-memory.d.ts.map