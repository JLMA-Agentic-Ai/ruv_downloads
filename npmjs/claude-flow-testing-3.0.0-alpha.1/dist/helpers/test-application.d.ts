import { type MockedInterface } from './create-mock.js';
/**
 * Core domain interfaces for testing
 */
export interface IEventBus {
    publish(event: DomainEvent): Promise<void>;
    subscribe(eventType: string, handler: EventHandler): void;
    unsubscribe(eventType: string, handler: EventHandler): void;
}
export interface ITaskManager {
    create(task: TaskDefinition): Promise<Task>;
    execute(taskId: string): Promise<TaskResult>;
    cancel(taskId: string): Promise<void>;
    getStatus(taskId: string): Promise<TaskStatus>;
}
export interface IAgentLifecycle {
    spawn(config: AgentConfig): Promise<Agent>;
    terminate(agentId: string): Promise<void>;
    getAgent(agentId: string): Promise<Agent | null>;
    listAgents(): Promise<Agent[]>;
}
export interface IMemoryService {
    store(key: string, value: unknown, metadata?: MemoryMetadata): Promise<void>;
    retrieve(key: string): Promise<unknown>;
    search(query: VectorQuery): Promise<SearchResult[]>;
    delete(key: string): Promise<void>;
}
export interface ISecurityService {
    validatePath(path: string): boolean;
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hash: string): Promise<boolean>;
    executeSecurely(command: string, options?: ExecuteOptions): Promise<ExecuteResult>;
}
export interface ISwarmCoordinator {
    initialize(config: SwarmConfig): Promise<void>;
    coordinate(agents: Agent[], task: Task): Promise<CoordinationResult>;
    shutdown(): Promise<void>;
}
/**
 * Type definitions for domain objects
 */
export interface DomainEvent {
    type: string;
    payload: unknown;
    timestamp: Date;
    correlationId?: string;
}
export type EventHandler = (event: DomainEvent) => Promise<void>;
export interface TaskDefinition {
    name: string;
    type: string;
    payload: unknown;
    priority?: number;
}
export interface Task {
    id: string;
    name: string;
    type: string;
    status: TaskStatus;
    payload: unknown;
    createdAt: Date;
}
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export interface TaskResult {
    taskId: string;
    success: boolean;
    output?: unknown;
    error?: Error;
    duration: number;
}
export interface AgentConfig {
    type: string;
    name: string;
    capabilities: string[];
}
export interface Agent {
    id: string;
    type: string;
    name: string;
    status: 'idle' | 'busy' | 'terminated';
}
export interface MemoryMetadata {
    ttl?: number;
    tags?: string[];
    embedding?: number[];
}
export interface VectorQuery {
    embedding: number[];
    topK: number;
    threshold?: number;
}
export interface SearchResult {
    key: string;
    value: unknown;
    score: number;
}
export interface ExecuteOptions {
    timeout?: number;
    cwd?: string;
    shell?: boolean;
}
export interface ExecuteResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}
export interface SwarmConfig {
    topology: 'hierarchical' | 'mesh' | 'adaptive';
    maxAgents: number;
}
export interface CoordinationResult {
    success: boolean;
    results: TaskResult[];
    duration: number;
}
/**
 * Test application builder with full dependency injection
 *
 * @example
 * const app = createTestApplication()
 *   .withMockEventBus()
 *   .withMockTaskManager()
 *   .build();
 *
 * await app.services.taskManager.create(task);
 * expect(app.mocks.eventBus.publish).toHaveBeenCalled();
 */
export declare function createTestApplication(): TestApplicationBuilder;
/**
 * Test application structure with mocked services
 */
export interface TestApplication {
    services: {
        eventBus: IEventBus;
        taskManager: ITaskManager;
        agentLifecycle: IAgentLifecycle;
        memoryService: IMemoryService;
        securityService: ISecurityService;
        swarmCoordinator: ISwarmCoordinator;
    };
    mocks: {
        eventBus: MockedInterface<IEventBus>;
        taskManager: MockedInterface<ITaskManager>;
        agentLifecycle: MockedInterface<IAgentLifecycle>;
        memoryService: MockedInterface<IMemoryService>;
        securityService: MockedInterface<ISecurityService>;
        swarmCoordinator: MockedInterface<ISwarmCoordinator>;
    };
}
/**
 * Builder class for constructing test applications
 */
declare class TestApplicationBuilder {
    private eventBus;
    private taskManager;
    private agentLifecycle;
    private memoryService;
    private securityService;
    private swarmCoordinator;
    /**
     * Configure mock event bus with default behavior
     */
    withMockEventBus(configure?: (mock: MockedInterface<IEventBus>) => void): this;
    /**
     * Configure mock task manager with default behavior
     */
    withMockTaskManager(configure?: (mock: MockedInterface<ITaskManager>) => void): this;
    /**
     * Configure mock agent lifecycle with default behavior
     */
    withMockAgentLifecycle(configure?: (mock: MockedInterface<IAgentLifecycle>) => void): this;
    /**
     * Configure mock memory service with default behavior
     */
    withMockMemoryService(configure?: (mock: MockedInterface<IMemoryService>) => void): this;
    /**
     * Configure mock security service with default behavior
     */
    withMockSecurityService(configure?: (mock: MockedInterface<ISecurityService>) => void): this;
    /**
     * Configure mock swarm coordinator with default behavior
     */
    withMockSwarmCoordinator(configure?: (mock: MockedInterface<ISwarmCoordinator>) => void): this;
    /**
     * Build the test application with all configured mocks
     */
    build(): TestApplication;
}
export {};
//# sourceMappingURL=test-application.d.ts.map