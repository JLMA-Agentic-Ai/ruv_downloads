/**
 * Create Task Command - Application Layer (CQRS)
 *
 * Command for creating new tasks in the swarm.
 *
 * @module v3/swarm/application/commands
 */
import { Task, TaskPriority } from '../../domain/entities/task.js';
import { ITaskRepository } from '../../domain/repositories/task-repository.interface.js';
/**
 * Create Task Command Input
 */
export interface CreateTaskInput {
    title: string;
    description: string;
    type: string;
    priority?: TaskPriority;
    dependencies?: string[];
    metadata?: Record<string, unknown>;
    input?: unknown;
    timeout?: number;
    maxRetries?: number;
    autoQueue?: boolean;
}
/**
 * Create Task Command Result
 */
export interface CreateTaskResult {
    success: boolean;
    taskId: string;
    task: Task;
    queuedAutomatically: boolean;
}
/**
 * Create Task Command Handler
 */
export declare class CreateTaskCommandHandler {
    private readonly repository;
    constructor(repository: ITaskRepository);
    execute(input: CreateTaskInput): Promise<CreateTaskResult>;
}
/**
 * Cancel Task Command Input
 */
export interface CancelTaskInput {
    taskId: string;
}
/**
 * Cancel Task Command Result
 */
export interface CancelTaskResult {
    success: boolean;
    taskId: string;
    previousStatus: string;
}
/**
 * Cancel Task Command Handler
 */
export declare class CancelTaskCommandHandler {
    private readonly repository;
    constructor(repository: ITaskRepository);
    execute(input: CancelTaskInput): Promise<CancelTaskResult>;
}
//# sourceMappingURL=create-task.command.d.ts.map