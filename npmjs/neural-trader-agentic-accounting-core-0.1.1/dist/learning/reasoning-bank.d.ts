/**
 * ReasoningBank Integration
 * Persistent learning and decision memory for agents
 */
export interface Trajectory {
    id: string;
    agentId: string;
    action: string;
    context: any;
    result: any;
    timestamp: Date;
    metadata?: any;
}
export interface Verdict {
    trajectoryId: string;
    isSuccessful: boolean;
    score: number;
    feedback: string;
    timestamp: Date;
}
export interface Pattern {
    id: string;
    agentId: string;
    pattern: any;
    successRate: number;
    usageCount: number;
    lastUsed: Date;
}
export declare class ReasoningBankService {
    private vectorDB;
    private initialized;
    private trajectories;
    private patterns;
    constructor();
    /**
     * Initialize ReasoningBank
     */
    initialize(): Promise<void>;
    /**
     * Store agent trajectory
     */
    storeTrajectory(trajectory: Trajectory): Promise<void>;
    /**
     * Store verdict for trajectory
     */
    storeVerdict(verdict: Verdict): Promise<void>;
    /**
     * Retrieve similar trajectories
     */
    findSimilarTrajectories(context: any, agentId?: string, topK?: number): Promise<Trajectory[]>;
    /**
     * Store learned pattern
     */
    storePattern(pattern: Pattern): Promise<void>;
    /**
     * Retrieve successful patterns for agent
     */
    getSuccessfulPatterns(agentId: string, minSuccessRate?: number): Promise<Pattern[]>;
    /**
     * Learn from feedback
     */
    learnFromFeedback(trajectoryId: string, feedback: {
        isSuccessful: boolean;
        score: number;
        message: string;
    }): Promise<void>;
    /**
     * Generate vector representation of trajectory
     */
    private generateTrajectoryVector;
    /**
     * Generate vector for context
     */
    private generateContextVector;
    /**
     * Generate vector for pattern
     */
    private generatePatternVector;
    /**
     * Simple string hashing for vectorization
     */
    private hashString;
    /**
     * Update pattern success rates based on verdict
     */
    private updatePatternSuccess;
    /**
     * Get agent learning metrics
     */
    getAgentMetrics(agentId: string): Promise<any>;
    /**
     * Create placeholder VectorDB for development
     * TODO: Replace with actual AgentDB implementation
     */
    private createPlaceholderDB;
}
//# sourceMappingURL=reasoning-bank.d.ts.map