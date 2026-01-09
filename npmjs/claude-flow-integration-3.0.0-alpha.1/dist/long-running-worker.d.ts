/**
 * LongRunningWorker - Checkpoint-Based Long-Running Task Support
 *
 * Extends WorkerBase with checkpoint persistence and resumption
 * capabilities for tasks that may span extended periods.
 *
 * Features:
 * - Automatic checkpoint creation during execution
 * - Resume from checkpoint on failure or restart
 * - Progress tracking and reporting
 * - Timeout management with graceful handling
 * - Resource cleanup on completion or failure
 *
 * Compatible with agentic-flow's long-running agent patterns.
 *
 * @module v3/integration/long-running-worker
 * @version 3.0.0-alpha.1
 */
import { WorkerBase, WorkerConfig, AgentOutput, WorkerArtifact } from './worker-base.js';
import type { Task } from './agentic-flow-agent.js';
/**
 * Checkpoint data structure
 */
export interface Checkpoint {
    /** Unique checkpoint identifier */
    id: string;
    /** Associated task identifier */
    taskId: string;
    /** Worker identifier */
    workerId: string;
    /** Checkpoint sequence number */
    sequence: number;
    /** Checkpoint creation timestamp */
    timestamp: number;
    /** Checkpoint state data */
    state: CheckpointState;
    /** Execution progress (0.0-1.0) */
    progress: number;
    /** Checkpoint metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Checkpoint state containing all data needed to resume
 */
export interface CheckpointState {
    /** Current execution phase */
    phase: string;
    /** Current step within phase */
    step: number;
    /** Total steps in current phase */
    totalSteps: number;
    /** Partial results accumulated so far */
    partialResults: unknown[];
    /** Context data for resumption */
    context: Record<string, unknown>;
    /** Artifacts generated so far */
    artifacts: WorkerArtifact[];
    /** Custom state data */
    custom?: Record<string, unknown>;
}
/**
 * Long-running worker configuration
 */
export interface LongRunningWorkerConfig extends WorkerConfig {
    /** Checkpoint interval in milliseconds */
    checkpointInterval?: number;
    /** Maximum checkpoints to retain */
    maxCheckpoints?: number;
    /** Enable automatic checkpoint cleanup */
    autoCleanup?: boolean;
    /** Checkpoint storage adapter */
    storage?: CheckpointStorage;
    /** Progress reporting interval in milliseconds */
    progressInterval?: number;
    /** Task timeout in milliseconds (0 = no timeout) */
    taskTimeout?: number;
    /** Enable automatic retry on failure */
    autoRetry?: boolean;
    /** Maximum retry attempts */
    maxRetries?: number;
    /** Retry backoff multiplier */
    retryBackoff?: number;
}
/**
 * Checkpoint storage interface
 */
export interface CheckpointStorage {
    /** Save a checkpoint */
    save(checkpoint: Checkpoint): Promise<void>;
    /** Load a checkpoint by ID */
    load(checkpointId: string): Promise<Checkpoint | null>;
    /** Load the latest checkpoint for a task */
    loadLatest(taskId: string, workerId: string): Promise<Checkpoint | null>;
    /** List all checkpoints for a task */
    list(taskId: string, workerId: string): Promise<Checkpoint[]>;
    /** Delete a checkpoint */
    delete(checkpointId: string): Promise<void>;
    /** Delete all checkpoints for a task */
    deleteAll(taskId: string, workerId: string): Promise<void>;
}
/**
 * Execution phase for long-running tasks
 */
export interface ExecutionPhase {
    /** Phase name */
    name: string;
    /** Phase description */
    description?: string;
    /** Estimated steps in this phase */
    estimatedSteps: number;
    /** Phase weight for progress calculation */
    weight?: number;
}
/**
 * Progress update event data
 */
export interface ProgressUpdate {
    /** Task identifier */
    taskId: string;
    /** Worker identifier */
    workerId: string;
    /** Current phase */
    phase: string;
    /** Current step */
    step: number;
    /** Total steps in phase */
    totalSteps: number;
    /** Overall progress (0.0-1.0) */
    progress: number;
    /** Estimated time remaining in milliseconds */
    estimatedTimeRemaining?: number;
    /** Timestamp */
    timestamp: number;
}
/**
 * LongRunningWorker - Handles extended task execution with checkpoints
 *
 * Usage:
 * ```typescript
 * const worker = new LongRunningWorker({
 *   id: 'long-runner-1',
 *   type: 'long-running',
 *   capabilities: ['data-processing', 'batch-analysis'],
 *   checkpointInterval: 30000, // 30 seconds
 *   maxCheckpoints: 10,
 * });
 *
 * await worker.initialize();
 *
 * // Execute task (checkpoints automatically)
 * const result = await worker.execute(task);
 *
 * // Or resume from checkpoint
 * const result = await worker.resumeFromCheckpoint(checkpointId);
 * ```
 */
export declare class LongRunningWorker extends WorkerBase {
    /** Active checkpoints for current task */
    checkpoints: Checkpoint[];
    /** Checkpoint storage adapter */
    protected storage: CheckpointStorage;
    /** Checkpoint interval in milliseconds */
    protected checkpointInterval: number;
    /** Maximum checkpoints to retain */
    protected maxCheckpoints: number;
    /** Auto cleanup enabled */
    protected autoCleanup: boolean;
    /** Progress reporting interval */
    protected progressInterval: number;
    /** Task timeout */
    protected taskTimeout: number;
    /** Auto retry on failure */
    protected autoRetry: boolean;
    /** Maximum retry attempts */
    protected maxRetries: number;
    /** Retry backoff multiplier */
    protected retryBackoff: number;
    /** Current task being executed */
    private currentLongTask;
    /** Current execution state */
    private currentState;
    /** Checkpoint timer */
    private checkpointTimer;
    /** Progress timer */
    private progressTimer;
    /** Execution start time */
    private executionStartTime;
    /** Checkpoint sequence counter */
    private checkpointSequence;
    /** Abort controller for task cancellation */
    private abortController;
    /**
     * Create a new LongRunningWorker instance
     *
     * @param config - Long-running worker configuration
     */
    constructor(config: LongRunningWorkerConfig);
    /**
     * Execute a long-running task with checkpoint support
     *
     * @param task - Task to execute
     * @returns Agent output with results
     */
    execute(task: Task): Promise<AgentOutput>;
    /**
     * Save a checkpoint of the current execution state
     *
     * @returns Created checkpoint
     */
    saveCheckpoint(): Promise<Checkpoint>;
    /**
     * Resume execution from a checkpoint
     *
     * @param checkpointId - Checkpoint ID to resume from
     * @returns Agent output with results
     */
    resumeFromCheckpoint(checkpointId: string): Promise<AgentOutput>;
    /**
     * Get all checkpoints for the current or specified task
     *
     * @param taskId - Optional task ID (uses current task if not specified)
     * @returns List of checkpoints
     */
    getCheckpoints(taskId?: string): Promise<Checkpoint[]>;
    /**
     * Cancel the current long-running task
     */
    cancelTask(): Promise<void>;
    /**
     * Update the current execution state
     *
     * @param phase - Current phase name
     * @param step - Current step number
     * @param totalSteps - Total steps in phase
     * @param partialResult - Optional partial result to accumulate
     */
    protected updateState(phase: string, step: number, totalSteps: number, partialResult?: unknown): void;
    /**
     * Update context data
     *
     * @param key - Context key
     * @param value - Context value
     */
    protected updateContext(key: string, value: unknown): void;
    /**
     * Add an artifact
     *
     * @param artifact - Artifact to add
     */
    protected addArtifact(artifact: WorkerArtifact): void;
    /**
     * Check if task should be aborted
     */
    protected isAborted(): boolean;
    /**
     * Execute task with timeout handling
     */
    private executeWithTimeout;
    /**
     * Core execution logic
     *
     * Override this in subclasses for custom long-running task implementations.
     *
     * @param task - Task to execute
     * @returns Execution output
     */
    protected executeCore(task: Task): Promise<AgentOutput>;
    /**
     * Execute from a restored state
     *
     * @param state - State to resume from
     * @returns Execution output
     */
    protected executeFromState(state: CheckpointState): Promise<AgentOutput>;
    /**
     * Start the checkpoint timer
     */
    private startCheckpointTimer;
    /**
     * Start the progress timer
     */
    private startProgressTimer;
    /**
     * Stop all timers
     */
    private stopTimers;
    /**
     * Calculate overall progress
     */
    private calculateProgress;
    /**
     * Trim old checkpoints to stay within limit
     */
    private trimCheckpoints;
    /**
     * Cleanup all checkpoints for the current task
     */
    private cleanupCheckpoints;
    /**
     * Utility delay function
     */
    private delay;
    /**
     * Shutdown with checkpoint cleanup
     */
    protected onShutdown(): Promise<void>;
}
/**
 * Create a long-running worker with the given configuration
 *
 * @param config - Worker configuration
 * @returns Configured LongRunningWorker
 */
export declare function createLongRunningWorker(config?: Partial<LongRunningWorkerConfig>): LongRunningWorker;
/**
 * Create a custom checkpoint storage
 *
 * @param options - Storage options
 * @returns Checkpoint storage implementation
 */
export declare function createCheckpointStorage(options?: {
    type?: 'memory' | 'file' | 'custom';
    path?: string;
    custom?: CheckpointStorage;
}): CheckpointStorage;
//# sourceMappingURL=long-running-worker.d.ts.map