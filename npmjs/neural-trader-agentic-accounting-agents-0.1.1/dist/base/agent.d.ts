/**
 * Base Agent Class
 *
 * Foundation for all specialized accounting agents with:
 * - ReasoningBank integration for learning
 * - Memory coordination via hooks
 * - Performance tracking
 * - Error handling patterns
 */
import { EventEmitter } from 'events';
export interface AgentConfig {
    agentId: string;
    agentType: string;
    enableLearning?: boolean;
    enableMetrics?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
export interface AgentTask {
    taskId: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    data: unknown;
    metadata?: Record<string, unknown>;
}
export interface AgentResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: Error;
    metrics?: {
        startTime: number;
        endTime: number;
        duration: number;
        memoryUsed?: number;
    };
    metadata?: Record<string, unknown>;
}
export interface DecisionLog {
    scenario: string;
    decision: string;
    rationale: string;
    outcome: 'SUCCESS' | 'FAILURE' | 'PENDING';
    timestamp: number;
    metadata?: Record<string, unknown>;
}
export declare abstract class BaseAgent extends EventEmitter {
    protected config: AgentConfig;
    protected isRunning: boolean;
    protected decisions: DecisionLog[];
    protected logger: Console;
    constructor(config: AgentConfig);
    /**
     * Learn from experience - placeholder for ReasoningBank integration
     */
    protected learn(data: Record<string, any>): Promise<void>;
    /**
     * Abstract method - must be implemented by each agent
     */
    abstract execute(task: AgentTask): Promise<AgentResult>;
    /**
     * Start the agent
     */
    start(): Promise<void>;
    /**
     * Stop the agent
     */
    stop(): Promise<void>;
    /**
     * Log a decision for ReasoningBank learning
     */
    protected logDecision(scenario: string, decision: string, rationale: string, outcome?: 'SUCCESS' | 'FAILURE' | 'PENDING', metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Execute task with metrics tracking
     */
    protected executeWithMetrics<T>(taskFn: () => Promise<T>): Promise<AgentResult<T>>;
    /**
     * Get agent status
     */
    getStatus(): {
        agentId: string;
        agentType: string;
        isRunning: boolean;
        decisionCount: number;
    };
    /**
     * Get recent decisions for analysis
     */
    getRecentDecisions(limit?: number): DecisionLog[];
    /**
     * Clear decision history (for testing or memory management)
     */
    clearDecisions(): void;
}
//# sourceMappingURL=agent.d.ts.map