/**
 * Create Task Command - Application Layer (CQRS)
 *
 * Command for creating new tasks in the swarm.
 *
 * @module v3/swarm/application/commands
 */
import { Task } from '../../domain/entities/task.js';
/**
 * Create Task Command Handler
 */
export class CreateTaskCommandHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        // Validate dependencies exist
        if (input.dependencies && input.dependencies.length > 0) {
            for (const depId of input.dependencies) {
                const exists = await this.repository.exists(depId);
                if (!exists) {
                    throw new Error(`Dependency task '${depId}' not found`);
                }
            }
        }
        // Create task
        const task = Task.create({
            title: input.title,
            description: input.description,
            type: input.type,
            priority: input.priority,
            dependencies: input.dependencies,
            metadata: input.metadata,
            input: input.input,
            timeout: input.timeout,
            maxRetries: input.maxRetries,
        });
        // Auto-queue if requested and no dependencies
        let queuedAutomatically = false;
        if (input.autoQueue && (!input.dependencies || input.dependencies.length === 0)) {
            task.queue();
            queuedAutomatically = true;
        }
        await this.repository.save(task);
        return {
            success: true,
            taskId: task.id,
            task,
            queuedAutomatically,
        };
    }
}
/**
 * Cancel Task Command Handler
 */
export class CancelTaskCommandHandler {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const task = await this.repository.findById(input.taskId);
        if (!task) {
            throw new Error(`Task '${input.taskId}' not found`);
        }
        const previousStatus = task.status;
        task.cancel();
        await this.repository.save(task);
        return {
            success: true,
            taskId: input.taskId,
            previousStatus,
        };
    }
}
//# sourceMappingURL=create-task.command.js.map