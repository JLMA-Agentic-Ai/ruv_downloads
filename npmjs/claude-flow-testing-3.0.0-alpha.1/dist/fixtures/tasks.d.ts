/**
 * V3 Claude-Flow Task Fixtures
 *
 * Test data for task-related testing
 * Following London School principle of explicit test data
 */
/**
 * Task definition interface
 */
export interface TaskDefinition {
    name: string;
    type: string;
    payload: unknown;
    priority?: number;
    metadata?: Record<string, unknown>;
}
/**
 * Task instance interface
 */
export interface TaskInstance {
    id: string;
    name: string;
    type: string;
    status: TaskStatus;
    payload: unknown;
    priority: number;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
}
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
/**
 * Task result interface
 */
export interface TaskResult {
    taskId: string;
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
}
/**
 * Pre-defined task definitions for testing
 */
export declare const taskDefinitions: Record<string, TaskDefinition>;
/**
 * Pre-defined task instances for testing
 */
export declare const taskInstances: Record<string, TaskInstance>;
/**
 * Pre-defined task results for testing
 */
export declare const taskResults: Record<string, TaskResult>;
/**
 * Factory function to create task definition with overrides
 */
export declare function createTaskDefinition(base: keyof typeof taskDefinitions, overrides?: Partial<TaskDefinition>): TaskDefinition;
/**
 * Factory function to create task instance with overrides
 */
export declare function createTaskInstance(base: keyof typeof taskInstances, overrides?: Partial<TaskInstance>): TaskInstance;
/**
 * Factory function to create task result with overrides
 */
export declare function createTaskResult(base: keyof typeof taskResults, overrides?: Partial<TaskResult>): TaskResult;
/**
 * Invalid task definitions for error testing
 */
export declare const invalidTaskDefinitions: {
    emptyName: {
        name: string;
        type: string;
        payload: {};
    };
    emptyType: {
        name: string;
        type: string;
        payload: {};
    };
    nullPayload: {
        name: string;
        type: string;
        payload: null;
    };
    invalidPriority: {
        name: string;
        type: string;
        payload: {};
        priority: number;
    };
};
/**
 * Task batch for swarm testing
 */
export declare function createTaskBatch(count: number, type?: string): TaskDefinition[];
//# sourceMappingURL=tasks.d.ts.map