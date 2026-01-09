/**
 * WorkerBase - Abstract Base Worker Class
 *
 * Provides the foundation for all worker patterns in Claude Flow v3,
 * aligned with agentic-flow@alpha's worker architecture.
 *
 * Key Features:
 * - Specialization embeddings for intelligent task routing
 * - Load balancing and capacity tracking
 * - Capability-based task matching
 * - Memory and coordination integration
 *
 * This implements ADR-001 by building on agentic-flow patterns
 * while providing Claude Flow-specific extensions.
 *
 * @module v3/integration/worker-base
 * @version 3.0.0-alpha.1
 */
import { EventEmitter } from 'events';
import type { Task, TaskResult, AgentStatus, Message } from './agentic-flow-agent.js';
/**
 * Worker configuration interface
 */
export interface WorkerConfig {
    /** Unique worker identifier */
    id: string;
    /** Worker type classification */
    type: WorkerType;
    /** Human-readable name */
    name?: string;
    /** Worker capabilities */
    capabilities: string[];
    /** Specialization embedding vector (for similarity-based routing) */
    specialization?: Float32Array | number[];
    /** Maximum concurrent tasks */
    maxConcurrentTasks?: number;
    /** Task execution timeout in milliseconds */
    timeout?: number;
    /** Worker priority (0-100, higher = more preferred) */
    priority?: number;
    /** Memory configuration */
    memory?: WorkerMemoryConfig;
    /** Coordination configuration */
    coordination?: WorkerCoordinationConfig;
    /** Provider configuration for multi-model support */
    provider?: WorkerProviderConfig;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Worker type classification
 */
export type WorkerType = 'coder' | 'reviewer' | 'tester' | 'researcher' | 'planner' | 'architect' | 'coordinator' | 'security' | 'performance' | 'specialized' | 'long-running' | 'generic';
/**
 * Worker memory configuration
 */
export interface WorkerMemoryConfig {
    /** Enable persistent memory */
    enabled: boolean;
    /** Memory namespace for isolation */
    namespace?: string;
    /** Maximum memory entries */
    maxEntries?: number;
    /** Enable embedding-based retrieval */
    enableEmbeddings?: boolean;
    /** Memory bank ID (for cross-session persistence) */
    memoryBankId?: string;
}
/**
 * Worker coordination configuration
 */
export interface WorkerCoordinationConfig {
    /** Enable coordination with other workers */
    enabled: boolean;
    /** Coordination protocol */
    protocol?: 'direct' | 'broadcast' | 'pub-sub' | 'request-response';
    /** Message queue capacity */
    queueCapacity?: number;
    /** Heartbeat interval in milliseconds */
    heartbeatInterval?: number;
}
/**
 * Worker provider configuration for multi-model support
 */
export interface WorkerProviderConfig {
    /** Provider identifier */
    providerId?: string;
    /** Model identifier */
    modelId?: string;
    /** Provider-specific options */
    options?: Record<string, unknown>;
}
/**
 * Agent output interface (compatible with agentic-flow)
 */
export interface AgentOutput {
    /** Output content */
    content: string | Record<string, unknown>;
    /** Success indicator */
    success: boolean;
    /** Error if failed */
    error?: Error;
    /** Execution duration in milliseconds */
    duration: number;
    /** Tokens used (if applicable) */
    tokensUsed?: number;
    /** Artifacts produced */
    artifacts?: WorkerArtifact[];
    /** Metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Worker artifact - files or data produced by task execution
 */
export interface WorkerArtifact {
    /** Artifact identifier */
    id: string;
    /** Artifact type */
    type: 'file' | 'data' | 'code' | 'log' | 'metric';
    /** Artifact name */
    name: string;
    /** Artifact content or path */
    content: string | Buffer | Record<string, unknown>;
    /** Content size in bytes */
    size?: number;
    /** Creation timestamp */
    createdAt: number;
}
/**
 * Worker metrics for monitoring
 */
export interface WorkerMetrics {
    /** Total tasks executed */
    tasksExecuted: number;
    /** Successful task count */
    tasksSucceeded: number;
    /** Failed task count */
    tasksFailed: number;
    /** Average execution duration */
    avgDuration: number;
    /** Total tokens used */
    totalTokensUsed: number;
    /** Current load (0.0-1.0) */
    currentLoad: number;
    /** Uptime in milliseconds */
    uptime: number;
    /** Last activity timestamp */
    lastActivity: number;
    /** Health score (0.0-1.0) */
    healthScore: number;
}
/**
 * Worker health status
 */
export interface WorkerHealth {
    /** Health status */
    status: 'healthy' | 'degraded' | 'unhealthy';
    /** Health score (0.0-1.0) */
    score: number;
    /** Active issues */
    issues: string[];
    /** Last health check timestamp */
    lastCheck: number;
    /** Resource usage */
    resources: {
        memoryMb: number;
        cpuPercent: number;
    };
}
/**
 * WorkerBase - Abstract base class for all workers
 *
 * This class provides the foundation for:
 * - SpecializedWorker: Domain-specific task processing
 * - LongRunningWorker: Checkpoint-based long-running tasks
 * - Generic workers for various use cases
 *
 * Usage:
 * ```typescript
 * class CoderWorker extends WorkerBase {
 *   async execute(task: Task): Promise<AgentOutput> {
 *     // Implementation
 *   }
 * }
 *
 * const worker = new CoderWorker({
 *   id: 'coder-1',
 *   type: 'coder',
 *   capabilities: ['code-generation', 'refactoring'],
 * });
 *
 * await worker.initialize();
 * const result = await worker.execute(task);
 * ```
 */
export declare abstract class WorkerBase extends EventEmitter {
    /** Unique worker identifier */
    readonly id: string;
    /** Worker type classification */
    readonly type: WorkerType;
    /** Human-readable name */
    readonly name: string;
    /** Worker capabilities */
    capabilities: string[];
    /** Specialization embedding vector */
    specialization?: Float32Array;
    /** Current load factor (0.0-1.0) */
    load: number;
    /** Current status */
    status: AgentStatus;
    /** Worker configuration (publicly readable for pool operations) */
    readonly config: WorkerConfig;
    /** Initialization state */
    protected initialized: boolean;
    /** Current concurrent task count */
    protected currentTaskCount: number;
    /** Creation timestamp */
    protected createdAt: number;
    /** Worker metrics */
    protected metrics: WorkerMetrics;
    /** Message queue for coordination */
    protected messageQueue: Message[];
    /** Memory reference (for persistent memory integration) */
    protected memoryBankId?: string;
    /**
     * Create a new WorkerBase instance
     *
     * @param config - Worker configuration
     */
    constructor(config: WorkerConfig);
    /**
     * Execute a task
     *
     * This is the core method that subclasses must implement.
     * It receives a task and returns the execution result.
     *
     * @param task - Task to execute
     * @returns Agent output with results
     */
    abstract execute(task: Task): Promise<AgentOutput>;
    /**
     * Initialize the worker
     *
     * Sets up resources, connections, and prepares for task execution.
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the worker gracefully
     *
     * Releases resources and completes cleanup.
     */
    shutdown(): Promise<void>;
    /**
     * Execute a task with wrapper logic
     *
     * Handles load tracking, metrics, and error handling.
     *
     * @param task - Task to execute
     * @returns Task result with metrics
     */
    executeTask(task: Task): Promise<TaskResult>;
    /**
     * Get the specialization embedding
     *
     * Returns the worker's specialization vector for similarity-based routing.
     * If no specialization is set, generates a default based on capabilities.
     *
     * @returns Specialization embedding vector
     */
    getEmbedding(): Float32Array;
    /**
     * Calculate similarity with a task embedding
     *
     * Uses cosine similarity to match worker specialization with task requirements.
     *
     * @param taskEmbedding - Task embedding vector
     * @returns Similarity score (0.0-1.0)
     */
    calculateSimilarity(taskEmbedding: Float32Array | number[]): number;
    /**
     * Check if worker has required capabilities for a task
     *
     * @param requiredCapabilities - Required capability list
     * @returns True if worker has all required capabilities
     */
    hasCapabilities(requiredCapabilities: string[]): boolean;
    /**
     * Update the load factor
     *
     * @param delta - Load change (optional, recalculates if not provided)
     */
    updateLoad(delta?: number): void;
    /**
     * Check if worker is available for tasks
     */
    isAvailable(): boolean;
    /**
     * Get worker health status
     */
    getHealth(): WorkerHealth;
    /**
     * Get worker metrics
     */
    getMetrics(): WorkerMetrics;
    /**
     * Send a message to another worker
     *
     * @param to - Target worker ID
     * @param message - Message to send
     */
    sendMessage(to: string, message: Message): Promise<void>;
    /**
     * Receive a message from another worker
     *
     * @param message - Received message
     */
    receiveMessage(message: Message): Promise<void>;
    /**
     * Hook called during initialization
     * Override in subclasses for custom initialization
     */
    protected onInitialize(): Promise<void>;
    /**
     * Hook called during shutdown
     * Override in subclasses for custom cleanup
     */
    protected onShutdown(): Promise<void>;
    /**
     * Process a received message
     * Override in subclasses for custom message handling
     *
     * @param message - Message to process
     */
    protected processMessage(message: Message): Promise<void>;
    /**
     * Initialize memory integration
     */
    private initializeMemory;
    /**
     * Initialize coordination
     */
    private initializeCoordination;
    /**
     * Ensure worker is initialized
     */
    protected ensureInitialized(): void;
    /**
     * Update metrics for successful task
     */
    private updateMetricsSuccess;
    /**
     * Update metrics for failed task
     */
    private updateMetricsFailure;
    /**
     * Generate default embedding from capabilities
     */
    private generateDefaultEmbedding;
    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity;
    /**
     * Simple string hash function
     */
    private hashString;
    /**
     * Estimate memory usage in MB
     */
    private estimateMemoryUsage;
}
/**
 * Create a worker with the given configuration
 *
 * @param config - Worker configuration
 * @param ExecutorClass - Worker class to instantiate
 * @returns Initialized worker instance
 */
export declare function createWorker<T extends WorkerBase>(config: WorkerConfig, ExecutorClass: new (config: WorkerConfig) => T): Promise<T>;
//# sourceMappingURL=worker-base.d.ts.map