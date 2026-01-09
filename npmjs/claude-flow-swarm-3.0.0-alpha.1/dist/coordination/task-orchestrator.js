/**
 * V3 Task Orchestrator
 * Manages task decomposition, dependency resolution, and parallel execution
 *
 * Based on ADR-003 (Single Coordination Engine) and ADR-001 (agentic-flow integration)
 */
import { taskCreatedEvent, taskQueuedEvent, taskAssignedEvent, taskStartedEvent, taskCompletedEvent, taskFailedEvent, taskBlockedEvent } from '../shared/events';
// =============================================================================
// Task Orchestrator Implementation
// =============================================================================
export class TaskOrchestrator {
    tasks = new Map();
    dependencyGraph = new Map();
    dependentGraph = new Map();
    taskCounter = 0;
    eventBus;
    agentRegistry;
    constructor(eventBus, agentRegistry) {
        this.eventBus = eventBus;
        this.agentRegistry = agentRegistry;
        this.eventBus.subscribe('agent:task-completed', this.handleAgentTaskCompleted.bind(this));
    }
    // ==========================================================================
    // Task Creation
    // ==========================================================================
    createTask(spec) {
        const taskId = `task-${Date.now()}-${++this.taskCounter}`;
        const task = {
            id: taskId,
            type: spec.type,
            title: spec.title,
            description: spec.description,
            assignedAgent: null,
            status: 'pending',
            priority: spec.priority ?? 'medium',
            dependencies: spec.dependencies ?? [],
            blockedBy: [],
            metadata: {
                domain: spec.domain,
                phase: spec.phase,
                estimatedDuration: spec.estimatedDuration ?? 0,
                actualDuration: null,
                retryCount: 0,
                maxRetries: 3,
                artifacts: [],
                tags: spec.tags ?? []
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
            completedAt: null
        };
        this.tasks.set(taskId, task);
        this.dependencyGraph.set(taskId, new Set(task.dependencies));
        this.dependentGraph.set(taskId, new Set());
        for (const depId of task.dependencies) {
            if (this.dependentGraph.has(depId)) {
                this.dependentGraph.get(depId).add(taskId);
            }
        }
        this.updateBlockedStatus(taskId);
        this.eventBus.emitSync(taskCreatedEvent(taskId, { type: spec.type, title: spec.title }));
        return task;
    }
    createBatchTasks(specs) {
        return specs.map(spec => this.createTask(spec));
    }
    // ==========================================================================
    // Task Lifecycle
    // ==========================================================================
    queueTask(taskId) {
        const task = this.getTaskOrThrow(taskId);
        if (this.isBlocked(taskId)) {
            this.updateTaskStatus(taskId, 'blocked');
            return;
        }
        this.updateTaskStatus(taskId, 'queued');
        this.eventBus.emitSync(taskQueuedEvent(taskId, this.getQueuePosition(taskId)));
    }
    assignTask(taskId, agentId) {
        const task = this.getTaskOrThrow(taskId);
        if (task.status !== 'queued') {
            throw new Error(`Task ${taskId} is not queued (status: ${task.status})`);
        }
        if (this.isBlocked(taskId)) {
            throw new Error(`Task ${taskId} is blocked by dependencies`);
        }
        task.assignedAgent = agentId;
        this.updateTaskStatus(taskId, 'assigned');
        this.agentRegistry.assignTask(agentId, taskId);
        this.eventBus.emitSync(taskAssignedEvent(taskId, agentId));
    }
    startTask(taskId) {
        const task = this.getTaskOrThrow(taskId);
        if (task.status !== 'assigned') {
            throw new Error(`Task ${taskId} is not assigned (status: ${task.status})`);
        }
        this.updateTaskStatus(taskId, 'in-progress');
        if (task.assignedAgent) {
            this.eventBus.emitSync(taskStartedEvent(taskId, task.assignedAgent));
        }
    }
    completeTask(taskId, result) {
        const task = this.getTaskOrThrow(taskId);
        if (task.status !== 'in-progress') {
            throw new Error(`Task ${taskId} is not in progress (status: ${task.status})`);
        }
        task.metadata.actualDuration = result.duration;
        task.completedAt = Date.now();
        this.updateTaskStatus(taskId, 'completed');
        if (task.assignedAgent) {
            this.agentRegistry.completeTask(task.assignedAgent, taskId);
        }
        this.eventBus.emitSync(taskCompletedEvent(taskId, result));
        this.unblockDependentTasks(taskId);
    }
    failTask(taskId, error) {
        const task = this.getTaskOrThrow(taskId);
        task.metadata.retryCount++;
        if (task.metadata.retryCount < task.metadata.maxRetries) {
            this.updateTaskStatus(taskId, 'queued');
            task.assignedAgent = null;
        }
        else {
            this.updateTaskStatus(taskId, 'failed');
            if (task.assignedAgent) {
                const agentState = this.agentRegistry.getState(task.assignedAgent);
                if (agentState) {
                    agentState.metrics.tasksFailed++;
                }
            }
        }
        this.eventBus.emitSync(taskFailedEvent(taskId, error));
    }
    cancelTask(taskId) {
        const task = this.getTaskOrThrow(taskId);
        if (task.status === 'completed' || task.status === 'failed') {
            throw new Error(`Cannot cancel ${task.status} task ${taskId}`);
        }
        if (task.assignedAgent) {
            this.agentRegistry.updateStatus(task.assignedAgent, 'idle');
        }
        this.updateTaskStatus(taskId, 'cancelled');
    }
    // ==========================================================================
    // Dependency Management
    // ==========================================================================
    addDependency(taskId, dependsOn) {
        const task = this.getTaskOrThrow(taskId);
        this.getTaskOrThrow(dependsOn);
        if (this.wouldCreateCycle(taskId, dependsOn)) {
            throw new Error(`Adding dependency ${dependsOn} to ${taskId} would create a cycle`);
        }
        task.dependencies.push(dependsOn);
        this.dependencyGraph.get(taskId).add(dependsOn);
        this.dependentGraph.get(dependsOn).add(taskId);
        this.updateBlockedStatus(taskId);
    }
    removeDependency(taskId, dependsOn) {
        const task = this.getTaskOrThrow(taskId);
        const index = task.dependencies.indexOf(dependsOn);
        if (index > -1) {
            task.dependencies.splice(index, 1);
        }
        this.dependencyGraph.get(taskId)?.delete(dependsOn);
        this.dependentGraph.get(dependsOn)?.delete(taskId);
        this.updateBlockedStatus(taskId);
    }
    getDependencies(taskId) {
        return Array.from(this.dependencyGraph.get(taskId) ?? []);
    }
    getDependents(taskId) {
        return Array.from(this.dependentGraph.get(taskId) ?? []);
    }
    isBlocked(taskId) {
        const blockingTasks = this.getBlockingTasks(taskId);
        return blockingTasks.length > 0;
    }
    getBlockingTasks(taskId) {
        const dependencies = this.dependencyGraph.get(taskId);
        if (!dependencies) {
            return [];
        }
        return Array.from(dependencies).filter(depId => {
            const depTask = this.tasks.get(depId);
            return depTask && depTask.status !== 'completed';
        });
    }
    // ==========================================================================
    // Queries
    // ==========================================================================
    getTask(taskId) {
        return this.tasks.get(taskId);
    }
    getAllTasks() {
        return Array.from(this.tasks.values());
    }
    getTasksByStatus(status) {
        return this.getAllTasks().filter(t => t.status === status);
    }
    getTasksByAgent(agentId) {
        return this.getAllTasks().filter(t => t.assignedAgent === agentId);
    }
    getTasksByDomain(domain) {
        return this.getAllTasks().filter(t => t.metadata.domain === domain);
    }
    getTasksByPhase(phase) {
        return this.getAllTasks().filter(t => t.metadata.phase === phase);
    }
    // ==========================================================================
    // Queue Management
    // ==========================================================================
    getNextTask(agentId) {
        const queuedTasks = this.getTasksByStatus('queued')
            .filter(t => !this.isBlocked(t.id))
            .sort((a, b) => {
            const priorityOrder = {
                'critical': 0,
                'high': 1,
                'medium': 2,
                'low': 3
            };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0)
                return priorityDiff;
            return a.createdAt - b.createdAt;
        });
        if (!agentId) {
            return queuedTasks[0];
        }
        const agentDef = this.agentRegistry.getDefinition(agentId);
        if (!agentDef) {
            return queuedTasks[0];
        }
        const supportedTypes = agentDef.capabilities.flatMap(c => c.supportedTaskTypes);
        return queuedTasks.find(t => supportedTypes.includes(t.type));
    }
    getPriorityQueue() {
        return this.getTasksByStatus('queued')
            .filter(t => !this.isBlocked(t.id))
            .sort((a, b) => {
            const priorityOrder = {
                'critical': 0,
                'high': 1,
                'medium': 2,
                'low': 3
            };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }
    // ==========================================================================
    // Metrics
    // ==========================================================================
    getTaskMetrics() {
        const allTasks = this.getAllTasks();
        const tasksByStatus = {
            'pending': 0,
            'queued': 0,
            'assigned': 0,
            'in-progress': 0,
            'blocked': 0,
            'completed': 0,
            'failed': 0,
            'cancelled': 0
        };
        const tasksByPriority = {
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0
        };
        const tasksByDomain = {
            'security': 0,
            'core': 0,
            'integration': 0,
            'quality': 0,
            'performance': 0,
            'deployment': 0
        };
        let totalQueueTime = 0;
        let totalExecutionTime = 0;
        let completedCount = 0;
        for (const task of allTasks) {
            tasksByStatus[task.status]++;
            tasksByPriority[task.priority]++;
            tasksByDomain[task.metadata.domain]++;
            if (task.status === 'completed' && task.metadata.actualDuration) {
                totalExecutionTime += task.metadata.actualDuration;
                completedCount++;
            }
        }
        const now = Date.now();
        const firstTask = allTasks[0];
        const runtimeMs = firstTask ? now - firstTask.createdAt : 1;
        const throughput = completedCount / (runtimeMs / 1000 / 60);
        return {
            totalTasks: allTasks.length,
            tasksByStatus,
            tasksByPriority,
            tasksByDomain,
            averageQueueTime: totalQueueTime / (completedCount || 1),
            averageExecutionTime: totalExecutionTime / (completedCount || 1),
            throughput
        };
    }
    // ==========================================================================
    // Private Helpers
    // ==========================================================================
    getTaskOrThrow(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }
        return task;
    }
    updateTaskStatus(taskId, status) {
        const task = this.getTaskOrThrow(taskId);
        task.status = status;
        task.updatedAt = Date.now();
        if (status === 'blocked') {
            task.blockedBy = this.getBlockingTasks(taskId);
        }
        else {
            task.blockedBy = [];
        }
    }
    updateBlockedStatus(taskId) {
        const task = this.tasks.get(taskId);
        if (!task || task.status === 'completed' || task.status === 'failed') {
            return;
        }
        const isBlocked = this.isBlocked(taskId);
        if (isBlocked && task.status !== 'blocked') {
            this.updateTaskStatus(taskId, 'blocked');
            const blockingTasks = this.getBlockingTasks(taskId);
            this.eventBus.emitSync(taskBlockedEvent(taskId, 'Blocked by dependencies', blockingTasks[0]));
        }
        else if (!isBlocked && task.status === 'blocked') {
            this.updateTaskStatus(taskId, 'queued');
        }
    }
    unblockDependentTasks(taskId) {
        const dependents = this.getDependents(taskId);
        for (const dependentId of dependents) {
            this.updateBlockedStatus(dependentId);
        }
    }
    wouldCreateCycle(taskId, newDependency) {
        const visited = new Set();
        const stack = [newDependency];
        while (stack.length > 0) {
            const current = stack.pop();
            if (current === taskId) {
                return true;
            }
            if (visited.has(current)) {
                continue;
            }
            visited.add(current);
            const deps = this.dependencyGraph.get(current);
            if (deps) {
                stack.push(...deps);
            }
        }
        return false;
    }
    handleAgentTaskCompleted(event) {
        const payload = event.payload;
        if (payload.taskId && this.tasks.has(payload.taskId)) {
            const task = this.tasks.get(payload.taskId);
            if (task.status === 'in-progress') {
                this.completeTask(payload.taskId, {
                    taskId: payload.taskId,
                    success: true,
                    output: payload.result,
                    error: null,
                    duration: Date.now() - task.updatedAt,
                    metrics: this.createDefaultMetrics()
                });
            }
        }
    }
    createDefaultMetrics() {
        return {
            linesOfCode: 0,
            testsWritten: 0,
            testsPassed: 0,
            coveragePercent: 0,
            performanceImpact: 0
        };
    }
    getQueuePosition(taskId) {
        const priorityOrder = {
            critical: 5,
            high: 4,
            normal: 3,
            low: 2,
            background: 1,
        };
        const queuedTasks = Array.from(this.tasks.values())
            .filter(t => t.status === 'queued')
            .sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
        const position = queuedTasks.findIndex(t => t.id === taskId);
        return position >= 0 ? position + 1 : queuedTasks.length + 1;
    }
}
// =============================================================================
// Factory Function
// =============================================================================
export function createTaskOrchestrator(eventBus, agentRegistry) {
    return new TaskOrchestrator(eventBus, agentRegistry);
}
//# sourceMappingURL=task-orchestrator.js.map