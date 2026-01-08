/**
 * Agentic Flow Orchestration Integration - SECURE VERSION
 *
 * Integrates agentic-flow's 66 agents and 213 MCP tools for
 * multi-robot coordination and complex task execution
 *
 * SECURITY: All command execution uses secure spawn() with argument arrays
 */
export interface AgentTask {
    id: string;
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    params: Record<string, any>;
    timeout?: number;
    retries?: number;
}
export interface AgentResult {
    taskId: string;
    success: boolean;
    result: any;
    executionTime: number;
    agentsUsed: string[];
    toolsUsed: string[];
    reasoning?: string;
}
export interface SwarmConfig {
    numAgents?: number;
    strategy?: 'parallel' | 'sequential' | 'adaptive' | 'swarm';
    mcpTools?: string[];
    reasoningEnabled?: boolean;
    learningEnabled?: boolean;
}
export interface OrchestrationMetrics {
    totalTasks: number;
    successfulTasks: number;
    failedTasks: number;
    avgExecutionTime: number;
    agentUtilization: Record<string, number>;
    toolUsage: Record<string, number>;
}
export declare class FlowOrchestrator {
    private config;
    private metrics;
    private initialized;
    constructor(config?: SwarmConfig);
    initialize(): Promise<void>;
    executeTask(task: AgentTask): Promise<AgentResult>;
    executeSwarm(tasks: AgentTask[]): Promise<AgentResult[]>;
    coordinateRobots(robots: string[], mission: {
        type: string;
        objectives: string[];
        constraints?: Record<string, any>;
    }): Promise<{
        success: boolean;
        assignments: Record<string, string[]>;
        executionPlan: any;
        estimatedTime: number;
    }>;
    reasonAboutTask(context: string, options?: {
        useMemory?: boolean;
        synthesizeStrategy?: boolean;
        explainReasoning?: boolean;
    }): Promise<{
        decision: string;
        reasoning: string;
        confidence: number;
        alternatives: string[];
    }>;
    getAvailableTools(): Promise<string[]>;
    getMetrics(): OrchestrationMetrics;
    private updateMetrics;
    resetMetrics(): void;
    close(): Promise<void>;
}
//# sourceMappingURL=flow-orchestrator.d.ts.map