/**
 * AgentDB Reflexion Memory Integration
 *
 * Enables robot learning from past experiences with secure command execution
 * SECURITY: Uses spawn() with argument arrays to prevent command injection
 */
export interface Episode {
    sessionId: string;
    taskName: string;
    confidence: number;
    success: boolean;
    outcome: string;
    strategy?: string;
    metadata?: Record<string, any>;
}
export interface Memory {
    task: string;
    confidence: number;
    success: boolean;
    outcome: string;
    strategy?: string;
    timestamp: number;
}
export declare class AgentDBMemory {
    private dbPath;
    private initialized;
    constructor(dbPath: string);
    initialize(): Promise<void>;
    storeEpisode(episode: Episode): Promise<void>;
    retrieveMemories(query: string, k?: number, options?: {
        minReward?: number;
        onlySuccesses?: boolean;
        onlyFailures?: boolean;
        synthesizeContext?: boolean;
    }): Promise<Memory[]>;
    queryWithContext(query: string, options?: {
        k?: number;
        minConfidence?: number;
        domain?: string;
    }): Promise<{
        memories: Memory[];
        context?: string;
    }>;
    consolidateSkills(options?: {
        minAttempts?: number;
        minReward?: number;
        timeWindowDays?: number;
    }): Promise<void>;
    getStats(): Promise<any>;
    close(): Promise<void>;
}
//# sourceMappingURL=memory.d.ts.map