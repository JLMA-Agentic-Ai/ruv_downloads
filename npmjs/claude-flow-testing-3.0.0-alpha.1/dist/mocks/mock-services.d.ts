/**
 * @claude-flow/testing - Mock Services
 *
 * Comprehensive mock implementations of V3 core services.
 * Provides realistic behavior for testing with full state tracking.
 */
import { type Mock } from 'vitest';
import type { V3AgentType } from '../fixtures/agent-fixtures.js';
/**
 * Mock AgentDB - Vector database mock with HNSW simulation
 */
export declare class MockAgentDB {
    private vectors;
    private indexConfig;
    insert: Mock<(id: string, embedding: number[], metadata?: Record<string, unknown>) => Promise<void>>;
    search: Mock<(embedding: number[], k: number, threshold?: number) => Promise<{
        id: string;
        score: number;
        metadata: Record<string, unknown>;
    }[]>>;
    delete: Mock<(id: string) => Promise<void>>;
    update: Mock<(id: string, embedding: number[], metadata?: Record<string, unknown>) => Promise<void>>;
    getVector: Mock<(id: string) => Promise<{
        embedding: number[];
        metadata: Record<string, unknown>;
    } | null>>;
    getStats: Mock<() => {
        vectorCount: number;
        indexSize: number;
        dimensions: number;
        M: number;
        efConstruction: number;
    }>;
    rebuildIndex: Mock<() => Promise<void>>;
    clear: Mock<() => void>;
    private cosineSimilarity;
    /**
     * Configure the mock index
     */
    configure(config: Partial<typeof this.indexConfig>): void;
    /**
     * Get all stored vectors (for testing)
     */
    getAllVectors(): Map<string, {
        embedding: number[];
        metadata: Record<string, unknown>;
    }>;
}
/**
 * Mock Unified Swarm Coordinator
 */
export declare class MockSwarmCoordinator {
    private agents;
    private state;
    private messageQueue;
    private taskQueue;
    initialize: Mock<(config: SwarmInitConfig) => Promise<SwarmState>>;
    shutdown: Mock<(graceful?: boolean) => Promise<void>>;
    addAgent: Mock<(config: AgentConfig) => Promise<MockSwarmAgent>>;
    removeAgent: Mock<(agentId: string) => Promise<void>>;
    coordinate: Mock<(task: SwarmTask) => Promise<{
        success: boolean;
        error: string;
        taskId: string;
        duration: number;
        results?: undefined;
    } | {
        success: boolean;
        taskId: string;
        duration: number;
        results: TaskResult[];
        error?: undefined;
    }>>;
    broadcast: Mock<(message: Omit<SwarmMessage, "id" | "timestamp">) => Promise<void>>;
    sendMessage: Mock<(message: SwarmMessage) => Promise<void>>;
    requestConsensus: Mock<(request: ConsensusRequest<unknown>) => Promise<ConsensusResponse<unknown>>>;
    getState: Mock<() => {
        id: string;
        topology: string;
        status: string;
        agentCount: number;
        activeAgentCount: number;
        leaderId?: string;
        createdAt: Date;
    }>;
    getAgent: Mock<(id: string) => MockSwarmAgent | undefined>;
    getAgents: Mock<() => MockSwarmAgent[]>;
    getMessageQueue: Mock<() => SwarmMessage[]>;
    getTaskQueue: Mock<() => SwarmTask[]>;
    private electNewLeader;
    reset(): void;
}
/**
 * Mock Swarm Agent
 */
export declare class MockSwarmAgent {
    readonly id: string;
    readonly config: AgentConfig;
    status: 'idle' | 'busy' | 'terminated';
    priority: number;
    private messages;
    private taskResults;
    execute: Mock<(...args: any[]) => any>;
    receive: Mock<(...args: any[]) => any>;
    send: Mock<(...args: any[]) => any>;
    terminate: Mock<(...args: any[]) => any>;
    constructor(id: string, config: AgentConfig);
    canHandle(taskType: string): boolean;
    getMessages(): SwarmMessage[];
    getTaskResults(): TaskResult[];
}
/**
 * Mock Memory Service with caching
 */
export declare class MockMemoryService {
    private store;
    private cache;
    private cacheHits;
    private cacheMisses;
    set: Mock<(key: string, value: unknown, metadata?: MemoryMetadata) => Promise<void>>;
    get: Mock<(key: string) => Promise<unknown>>;
    delete: Mock<(key: string) => Promise<void>>;
    search: Mock<(query: VectorSearchQuery) => Promise<SearchResult[]>>;
    clear: Mock<() => Promise<void>>;
    getStats: Mock<() => {
        totalEntries: number;
        cacheSize: number;
        cacheHitRate: number;
        cacheHits: number;
        cacheMisses: number;
    }>;
    prune: Mock<() => Promise<number>>;
    reset(): void;
}
/**
 * Mock Event Bus with history tracking
 */
export declare class MockEventBus {
    private subscribers;
    private history;
    private maxHistorySize;
    publish: Mock<(event: DomainEvent) => Promise<void>>;
    subscribe: Mock<(eventType: string, handler: EventHandler) => () => void>;
    unsubscribe: Mock<(eventType: string, handler: EventHandler) => void>;
    getHistory(eventType?: string): DomainEvent[];
    getSubscriberCount(eventType: string): number;
    clear(): void;
    reset(): void;
}
/**
 * Mock Security Service
 */
export declare class MockSecurityService {
    private blockedPaths;
    private allowedCommands;
    private tokens;
    validatePath: Mock<(path: string) => boolean>;
    validateInput: Mock<(input: string, options?: InputValidationOptions) => {
        valid: boolean;
        sanitized: string;
        errors: string[] | undefined;
    }>;
    hashPassword: Mock<(password: string) => Promise<string>>;
    verifyPassword: Mock<(password: string, hash: string) => Promise<boolean>>;
    generateToken: Mock<(payload: Record<string, unknown>, expiresIn?: number) => Promise<string>>;
    verifyToken: Mock<(token: string) => Promise<Record<string, unknown>>>;
    executeSecurely: Mock<(command: string, options?: ExecuteOptions) => Promise<{
        stdout: string;
        stderr: string;
        exitCode: number;
        duration: number;
    }>>;
    private sanitize;
    reset(): void;
}
interface SwarmState {
    id: string;
    topology: string;
    status: string;
    agentCount: number;
    activeAgentCount: number;
    leaderId?: string;
    createdAt: Date;
}
interface SwarmInitConfig {
    topology?: string;
    maxAgents?: number;
}
interface AgentConfig {
    type: V3AgentType;
    name?: string;
    capabilities?: string[];
    priority?: number;
}
interface SwarmTask {
    id: string;
    type: string;
    payload: unknown;
    priority?: number;
    maxAgents?: number;
}
interface SwarmMessage {
    id: string;
    from: string;
    to: string;
    type: string;
    payload: unknown;
    timestamp: Date;
}
interface TaskResult {
    taskId: string;
    agentId: string;
    success: boolean;
    output?: unknown;
    error?: Error;
    duration: number;
}
interface ConsensusRequest<T> {
    topic: string;
    options: T[];
    voters?: string[];
    timeout?: number;
}
interface ConsensusResponse<T> {
    topic: string;
    decision: T | null;
    votes: Map<string, T>;
    consensus: boolean;
    votingDuration: number;
    participatingAgents: string[];
}
interface MemoryMetadata {
    type: 'short-term' | 'long-term' | 'semantic' | 'episodic';
    tags: string[];
    ttl?: number;
    [key: string]: unknown;
}
interface VectorSearchQuery {
    embedding?: number[];
    topK: number;
    threshold?: number;
    filters?: Record<string, unknown>;
}
interface SearchResult {
    key: string;
    value: unknown;
    score: number;
    metadata: MemoryMetadata;
}
interface DomainEvent {
    id: string;
    type: string;
    payload: unknown;
    timestamp: Date;
    correlationId?: string;
}
type EventHandler = (event: DomainEvent) => Promise<void>;
interface InputValidationOptions {
    maxLength?: number;
    allowedChars?: RegExp;
    sanitize?: boolean;
}
interface ExecuteOptions {
    timeout?: number;
    cwd?: string;
    shell?: boolean;
}
/**
 * Create all mock services as a bundle
 */
export declare function createMockServices(): MockServiceBundle;
/**
 * Mock service bundle interface
 */
export interface MockServiceBundle {
    agentDB: MockAgentDB;
    swarmCoordinator: MockSwarmCoordinator;
    memoryService: MockMemoryService;
    eventBus: MockEventBus;
    securityService: MockSecurityService;
}
/**
 * Reset all mock services
 */
export declare function resetMockServices(services: MockServiceBundle): void;
export {};
//# sourceMappingURL=mock-services.d.ts.map