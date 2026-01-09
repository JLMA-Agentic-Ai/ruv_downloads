/**
 * @claude-flow/testing - Swarm Fixtures
 *
 * Comprehensive mock swarm configurations, topologies, and coordination fixtures.
 * Supports hierarchical-mesh, adaptive, and all consensus protocols.
 *
 * Based on ADR-003 (Single Coordination Engine) and V3 swarm specifications.
 */
import { type Mock } from 'vitest';
/**
 * Swarm topology types
 */
export type SwarmTopology = 'hierarchical' | 'mesh' | 'ring' | 'star' | 'adaptive' | 'hierarchical-mesh';
/**
 * Consensus protocol types
 */
export type ConsensusProtocol = 'raft' | 'pbft' | 'gossip' | 'crdt' | 'byzantine';
/**
 * Coordination status types
 */
export type CoordinationStatus = 'initializing' | 'active' | 'coordinating' | 'consensus' | 'error' | 'shutdown';
/**
 * Swarm configuration interface
 */
export interface SwarmConfig {
    topology: SwarmTopology;
    maxAgents: number;
    name?: string;
    description?: string;
    coordination: CoordinationConfig;
    communication: CommunicationConfig;
    autoScale?: AutoScaleConfig;
    healthCheck?: HealthCheckConfig;
}
/**
 * Coordination configuration
 */
export interface CoordinationConfig {
    consensusProtocol: ConsensusProtocol;
    heartbeatInterval: number;
    electionTimeout: number;
    consensusRequired?: boolean;
    timeoutMs?: number;
    retryPolicy?: {
        maxRetries: number;
        backoffMs: number;
    };
}
/**
 * Communication configuration
 */
export interface CommunicationConfig {
    protocol: 'quic' | 'tcp' | 'websocket' | 'ipc';
    maxMessageSize: number;
    retryAttempts: number;
    compressionEnabled?: boolean;
    encryptionEnabled?: boolean;
}
/**
 * Auto-scale configuration
 */
export interface AutoScaleConfig {
    enabled: boolean;
    minAgents: number;
    maxAgents: number;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
    cooldownMs?: number;
}
/**
 * Health check configuration
 */
export interface HealthCheckConfig {
    enabled: boolean;
    interval: number;
    timeout: number;
    unhealthyThreshold: number;
    healthyThreshold: number;
}
/**
 * Swarm state interface
 */
export interface SwarmState {
    id: string;
    topology: SwarmTopology;
    status: CoordinationStatus;
    agentCount: number;
    activeAgentCount: number;
    leaderId?: string;
    createdAt: Date;
    lastHeartbeat?: Date;
}
/**
 * Swarm message interface
 */
export interface SwarmMessage<T = unknown> {
    id: string;
    from: string;
    to: string | 'broadcast';
    type: 'task' | 'result' | 'status' | 'coordination' | 'heartbeat' | 'election';
    payload: T;
    timestamp: Date;
    correlationId?: string;
    replyTo?: string;
    ttl?: number;
    priority?: number;
}
/**
 * Swarm task interface
 */
export interface SwarmTask {
    id: string;
    name: string;
    type: string;
    payload: unknown;
    priority: number;
    assignedTo?: string;
    status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled';
    dependencies?: string[];
    deadline?: Date;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}
/**
 * Swarm task result interface
 */
export interface SwarmTaskResult {
    taskId: string;
    agentId: string;
    success: boolean;
    output?: unknown;
    error?: Error;
    duration: number;
    metrics?: TaskMetrics;
}
/**
 * Task metrics interface
 */
export interface TaskMetrics {
    cpuTime: number;
    memoryUsage: number;
    ioOperations: number;
    networkCalls: number;
}
/**
 * Coordination result interface
 */
export interface CoordinationResult {
    success: boolean;
    completedTasks: number;
    failedTasks: number;
    totalDuration: number;
    agentMetrics: Map<string, AgentCoordinationMetrics>;
    consensusRounds?: number;
}
/**
 * Agent coordination metrics
 */
export interface AgentCoordinationMetrics {
    tasksCompleted: number;
    tasksFailed: number;
    averageTaskDuration: number;
    messagesProcessed: number;
    totalDuration: number;
}
/**
 * Consensus request interface
 */
export interface ConsensusRequest<T = unknown> {
    topic: string;
    options: T[];
    requiredVotes: number | 'majority' | 'all';
    timeout: number;
    voters?: string[];
}
/**
 * Consensus response interface
 */
export interface ConsensusResponse<T = unknown> {
    topic: string;
    decision: T | null;
    votes: Map<string, T>;
    consensus: boolean;
    votingDuration: number;
    participatingAgents: string[];
}
/**
 * Pre-defined swarm configurations for testing
 */
export declare const swarmConfigs: Record<string, SwarmConfig>;
/**
 * Pre-defined swarm states for testing
 */
export declare const swarmStates: Record<string, SwarmState>;
/**
 * Pre-defined swarm tasks for testing
 */
export declare const swarmTasks: Record<string, SwarmTask>;
/**
 * Pre-defined swarm messages for testing
 */
export declare const swarmMessages: Record<string, SwarmMessage>;
/**
 * Pre-defined coordination results for testing
 */
export declare const coordinationResults: Record<string, CoordinationResult>;
/**
 * Factory function to create swarm config with overrides
 */
export declare function createSwarmConfig(base?: keyof typeof swarmConfigs, overrides?: Partial<SwarmConfig>): SwarmConfig;
/**
 * Factory function to create swarm state with overrides
 */
export declare function createSwarmState(base?: keyof typeof swarmStates, overrides?: Partial<SwarmState>): SwarmState;
/**
 * Factory function to create swarm task with overrides
 */
export declare function createSwarmTask(base?: keyof typeof swarmTasks, overrides?: Partial<SwarmTask>): SwarmTask;
/**
 * Factory function to create swarm message with overrides
 */
export declare function createSwarmMessage<T = unknown>(type: SwarmMessage['type'], payload: T, overrides?: Partial<SwarmMessage<T>>): SwarmMessage<T>;
/**
 * Factory function to create consensus request
 */
export declare function createConsensusRequest<T>(topic: string, options: T[], overrides?: Partial<ConsensusRequest<T>>): ConsensusRequest<T>;
/**
 * Factory function to create coordination result
 */
export declare function createCoordinationResult(base?: keyof typeof coordinationResults, overrides?: Partial<CoordinationResult>): CoordinationResult;
/**
 * Create a batch of swarm tasks for testing
 */
export declare function createSwarmTaskBatch(count: number, type?: string): SwarmTask[];
/**
 * Invalid swarm configurations for error testing
 */
export declare const invalidSwarmConfigs: {
    zeroAgents: SwarmConfig;
    negativeHeartbeat: SwarmConfig;
    invalidTopology: {
        topology: SwarmTopology;
        maxAgents: number;
        name?: string;
        description?: string;
        coordination: CoordinationConfig;
        communication: CommunicationConfig;
        autoScale?: AutoScaleConfig;
        healthCheck?: HealthCheckConfig;
    };
    invalidProtocol: SwarmConfig;
    zeroMessageSize: SwarmConfig;
};
/**
 * Mock swarm coordinator interface
 */
export interface MockSwarmCoordinator {
    initialize: Mock<(config: SwarmConfig) => Promise<SwarmState>>;
    coordinate: Mock<(agents: string[], task: SwarmTask) => Promise<CoordinationResult>>;
    shutdown: Mock<(graceful?: boolean) => Promise<void>>;
    addAgent: Mock<(agentId: string) => Promise<void>>;
    removeAgent: Mock<(agentId: string) => Promise<void>>;
    getState: Mock<() => SwarmState>;
    broadcast: Mock<(message: SwarmMessage) => Promise<void>>;
    requestConsensus: Mock<(<T>(request: ConsensusRequest<T>) => Promise<ConsensusResponse<T>>)>;
}
/**
 * Create a mock swarm coordinator
 */
export declare function createMockSwarmCoordinator(): MockSwarmCoordinator;
/**
 * Mock message bus interface
 */
export interface MockMessageBus {
    publish: Mock<(message: SwarmMessage) => Promise<void>>;
    subscribe: Mock<(pattern: string, handler: (message: SwarmMessage) => void) => () => void>;
    unsubscribe: Mock<(pattern: string) => void>;
    request: Mock<(message: SwarmMessage, timeout?: number) => Promise<SwarmMessage>>;
    getStats: Mock<() => {
        messagesSent: number;
        messagesReceived: number;
    }>;
}
/**
 * Create a mock message bus
 */
export declare function createMockMessageBus(): MockMessageBus;
//# sourceMappingURL=swarm-fixtures.d.ts.map