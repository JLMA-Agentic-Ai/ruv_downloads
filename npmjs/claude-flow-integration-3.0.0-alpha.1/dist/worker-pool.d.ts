/**
 * WorkerPool - Worker Pool Management
 *
 * Manages a collection of workers with intelligent routing,
 * load balancing, and lifecycle management.
 *
 * Features:
 * - Dynamic worker spawning and termination
 * - Embedding-based task routing
 * - Load balancing across workers
 * - Health monitoring and auto-recovery
 * - Type-safe worker registry
 *
 * Compatible with agentic-flow's worker pool patterns.
 *
 * @module v3/integration/worker-pool
 * @version 3.0.0-alpha.1
 */
import { EventEmitter } from 'events';
import { WorkerBase, WorkerConfig, WorkerType } from './worker-base.js';
import { SpecializedWorkerConfig } from './specialized-worker.js';
import { LongRunningWorkerConfig } from './long-running-worker.js';
import type { Task, TaskResult } from './agentic-flow-agent.js';
/**
 * Worker pool configuration
 */
export interface WorkerPoolConfig {
    /** Pool identifier */
    id?: string;
    /** Pool name */
    name?: string;
    /** Minimum workers to maintain */
    minWorkers?: number;
    /** Maximum workers allowed */
    maxWorkers?: number;
    /** Default worker configuration */
    defaultWorkerConfig?: Partial<WorkerConfig>;
    /** Enable auto-scaling */
    autoScale?: boolean;
    /** Scale up threshold (0.0-1.0 utilization) */
    scaleUpThreshold?: number;
    /** Scale down threshold (0.0-1.0 utilization) */
    scaleDownThreshold?: number;
    /** Health check interval in milliseconds */
    healthCheckInterval?: number;
    /** Enable automatic health recovery */
    autoRecover?: boolean;
    /** Routing strategy */
    routingStrategy?: RoutingStrategy;
    /** Load balancing strategy */
    loadBalancingStrategy?: LoadBalancingStrategy;
}
/**
 * Task routing strategy
 */
export type RoutingStrategy = 'round-robin' | 'least-loaded' | 'capability-match' | 'embedding-similarity' | 'priority-based' | 'hybrid' | 'custom';
/**
 * Load balancing strategy
 */
export type LoadBalancingStrategy = 'equal' | 'weighted' | 'adaptive' | 'capacity-based';
/**
 * Worker routing result
 */
export interface RoutingResult {
    /** Selected workers */
    workers: WorkerBase[];
    /** Routing scores for each worker */
    scores: Map<string, number>;
    /** Routing strategy used */
    strategy: RoutingStrategy;
    /** Routing metadata */
    metadata: {
        totalCandidates: number;
        filtered: number;
        matchThreshold: number;
    };
}
/**
 * Pool statistics
 */
export interface PoolStats {
    /** Pool identifier */
    poolId: string;
    /** Total workers */
    totalWorkers: number;
    /** Available workers */
    availableWorkers: number;
    /** Busy workers */
    busyWorkers: number;
    /** Unhealthy workers */
    unhealthyWorkers: number;
    /** Average utilization */
    avgUtilization: number;
    /** Average health score */
    avgHealthScore: number;
    /** Tasks processed */
    tasksProcessed: number;
    /** Tasks failed */
    tasksFailed: number;
    /** Average task duration */
    avgTaskDuration: number;
    /** Worker types breakdown */
    workerTypes: Record<WorkerType, number>;
    /** Uptime in milliseconds */
    uptime: number;
}
/**
 * Worker spawn options
 */
export interface SpawnOptions {
    /** Immediately initialize the worker */
    initialize?: boolean;
    /** Replace existing worker with same ID */
    replace?: boolean;
    /** Worker priority in pool */
    poolPriority?: number;
}
/**
 * WorkerPool - Manages a collection of workers
 *
 * Usage:
 * ```typescript
 * const pool = new WorkerPool({
 *   name: 'main-pool',
 *   minWorkers: 2,
 *   maxWorkers: 10,
 *   autoScale: true,
 *   routingStrategy: 'embedding-similarity',
 * });
 *
 * await pool.initialize();
 *
 * // Spawn workers
 * pool.spawn({
 *   id: 'coder-1',
 *   type: 'coder',
 *   capabilities: ['typescript', 'code-generation'],
 * });
 *
 * // Route a task
 * const workers = pool.routeTask(task, 3);
 * for (const worker of workers) {
 *   const result = await worker.executeTask(task);
 * }
 * ```
 */
export declare class WorkerPool extends EventEmitter {
    /** Pool identifier */
    readonly id: string;
    /** Pool name */
    readonly name: string;
    /** Worker registry */
    workers: Map<string, WorkerBase>;
    /** Pool configuration */
    protected config: WorkerPoolConfig;
    /** Pool initialized state */
    protected initialized: boolean;
    /** Health check timer */
    private healthCheckTimer;
    /** Pool creation time */
    private createdAt;
    /** Round-robin index */
    private roundRobinIndex;
    /** Pool-level metrics */
    private poolMetrics;
    /**
     * Create a new WorkerPool instance
     *
     * @param config - Pool configuration
     */
    constructor(config?: WorkerPoolConfig);
    /**
     * Initialize the pool
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the pool
     */
    shutdown(): Promise<void>;
    /**
     * Spawn a new worker in the pool
     *
     * @param config - Worker configuration
     * @param options - Spawn options
     * @returns Created worker
     */
    spawn(config: WorkerConfig | SpecializedWorkerConfig | LongRunningWorkerConfig, options?: SpawnOptions): WorkerBase;
    /**
     * Terminate a worker
     *
     * @param workerId - Worker ID to terminate
     * @returns True if worker was terminated
     */
    terminate(workerId: string): boolean;
    /**
     * Route a task to the best workers
     *
     * @param task - Task to route
     * @param topK - Number of workers to return (default: 1)
     * @returns Array of best-matched workers
     */
    routeTask(task: Task, topK?: number): WorkerBase[];
    /**
     * Route a task with detailed scoring information
     *
     * @param task - Task to route
     * @param topK - Number of workers to return
     * @returns Detailed routing result
     */
    routeTaskWithDetails(task: Task, topK?: number): RoutingResult;
    /**
     * Balance load across workers
     *
     * Redistributes tasks or adjusts worker priorities based on
     * the configured load balancing strategy.
     */
    balanceLoad(): void;
    /**
     * Get a worker by ID
     *
     * @param workerId - Worker ID
     * @returns Worker or undefined
     */
    getWorker(workerId: string): WorkerBase | undefined;
    /**
     * Get all workers
     */
    getAllWorkers(): WorkerBase[];
    /**
     * Get available workers (not at capacity)
     */
    getAvailableWorkers(): WorkerBase[];
    /**
     * Get workers by type
     *
     * @param type - Worker type to filter
     */
    getWorkersByType(type: WorkerType): WorkerBase[];
    /**
     * Get workers by capability
     *
     * @param capability - Required capability
     */
    getWorkersByCapability(capability: string): WorkerBase[];
    /**
     * Get pool statistics
     */
    getStats(): PoolStats;
    /**
     * Execute a task on the best available worker
     *
     * @param task - Task to execute
     * @returns Task result
     */
    executeTask(task: Task): Promise<TaskResult>;
    /**
     * Score a worker for a specific task
     */
    private scoreWorkerForTask;
    /**
     * Calculate capability match score
     */
    private calculateCapabilityScore;
    /**
     * Calculate embedding similarity score
     */
    private calculateEmbeddingScore;
    /**
     * Extract required capabilities from task
     */
    private extractRequiredCapabilities;
    /**
     * Generate a simple task embedding
     */
    private generateTaskEmbedding;
    /**
     * Scale up the pool
     */
    private scaleUp;
    /**
     * Scale down the pool
     */
    private scaleDown;
    /**
     * Start health check timer
     */
    private startHealthChecks;
    /**
     * Stop health check timer
     */
    private stopHealthChecks;
    /**
     * Perform health checks on all workers
     */
    private performHealthChecks;
    /**
     * Attempt to recover an unhealthy worker
     */
    private recoverWorker;
    /**
     * Forward worker events to pool
     */
    private forwardWorkerEvents;
}
/**
 * Create a worker pool with the given configuration
 *
 * @param config - Pool configuration
 * @returns Configured WorkerPool
 */
export declare function createWorkerPool(config?: WorkerPoolConfig): WorkerPool;
/**
 * Create and initialize a worker pool
 *
 * @param config - Pool configuration
 * @returns Initialized WorkerPool
 */
export declare function createAndInitializeWorkerPool(config?: WorkerPoolConfig): Promise<WorkerPool>;
//# sourceMappingURL=worker-pool.d.ts.map