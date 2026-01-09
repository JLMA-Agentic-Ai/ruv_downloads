import { type MockedInterface } from './create-mock.js';
/**
 * Agent types for V3 15-agent swarm
 */
export type V3AgentType = 'queen-coordinator' | 'security-architect' | 'security-auditor' | 'memory-specialist' | 'swarm-specialist' | 'integration-architect' | 'performance-engineer' | 'core-architect' | 'test-architect' | 'project-coordinator' | 'coder' | 'reviewer' | 'tester' | 'planner' | 'researcher';
/**
 * Swarm topology types
 */
export type SwarmTopology = 'hierarchical' | 'mesh' | 'adaptive' | 'hierarchical-mesh';
/**
 * Agent interface for swarm testing
 */
export interface SwarmAgent {
    id: string;
    type: V3AgentType;
    status: 'idle' | 'busy' | 'terminated';
    capabilities: string[];
    execute(task: SwarmTask): Promise<SwarmTaskResult>;
    communicate(message: SwarmMessage): Promise<void>;
}
/**
 * Swarm message interface
 */
export interface SwarmMessage {
    from: string;
    to: string | 'broadcast';
    type: 'task' | 'result' | 'status' | 'coordination';
    payload: unknown;
    timestamp: Date;
}
/**
 * Swarm task interface
 */
export interface SwarmTask {
    id: string;
    type: string;
    payload: unknown;
    priority: number;
    assignedTo?: string;
}
/**
 * Swarm task result
 */
export interface SwarmTaskResult {
    taskId: string;
    agentId: string;
    success: boolean;
    output?: unknown;
    error?: Error;
    duration: number;
}
/**
 * Swarm coordination result
 */
export interface SwarmCoordinationResult {
    success: boolean;
    completedTasks: number;
    failedTasks: number;
    totalDuration: number;
    agentMetrics: Map<string, AgentMetrics>;
}
/**
 * Agent metrics
 */
export interface AgentMetrics {
    tasksCompleted: number;
    tasksFailed: number;
    averageTaskDuration: number;
    totalDuration: number;
}
/**
 * Create a test swarm instance with mocked agents
 */
export declare function createSwarmTestInstance(config?: {
    topology?: SwarmTopology;
    agentTypes?: V3AgentType[];
}): SwarmTestInstance;
/**
 * Swarm test instance class
 */
export declare class SwarmTestInstance {
    readonly topology: SwarmTopology;
    private readonly agentTypes;
    private agents;
    private messages;
    private taskResults;
    private interactionRecorder;
    private isInitialized;
    constructor(topology: SwarmTopology, agentTypes: V3AgentType[]);
    private initializeAgents;
    private createMockAgent;
    private getCapabilitiesForType;
    /**
     * Initialize the swarm
     */
    initialize(): Promise<void>;
    /**
     * Get an agent by type
     */
    getAgent(type: V3AgentType): MockedInterface<SwarmAgent> | undefined;
    /**
     * Get all agents
     */
    getAllAgents(): MockedInterface<SwarmAgent>[];
    /**
     * Get agent by ID
     */
    getAgentById(id: string): MockedInterface<SwarmAgent> | undefined;
    /**
     * Get all messages
     */
    getMessages(): SwarmMessage[];
    /**
     * Get task results
     */
    getTaskResults(): SwarmTaskResult[];
    /**
     * Get interaction order for behavior verification
     */
    getInteractionOrder(): string[];
    /**
     * Get all interactions
     */
    getInteractions(): Array<{
        name: string;
        method: string;
        args: unknown[];
    }>;
    /**
     * Coordinate a task across agents
     */
    coordinate(task: SwarmTask): Promise<SwarmCoordinationResult>;
    /**
     * Shutdown the swarm
     */
    shutdown(): Promise<void>;
    /**
     * Reset the swarm state
     */
    reset(): void;
}
//# sourceMappingURL=swarm-instance.d.ts.map