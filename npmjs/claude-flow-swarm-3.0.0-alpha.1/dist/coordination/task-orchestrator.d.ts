/**
 * V3 Task Orchestrator
 * Manages task decomposition, dependency resolution, and parallel execution
 *
 * Based on ADR-003 (Single Coordination Engine) and ADR-001 (agentic-flow integration)
 */
import { TaskId, TaskType, TaskStatus, TaskPriority, TaskDefinition, TaskResult, AgentId, AgentDomain, PhaseId } from '../shared/types';
import { IEventBus } from '../shared/events';
import { IAgentRegistry } from './agent-registry';
export interface ITaskOrchestrator {
    createTask(spec: TaskSpec): TaskDefinition;
    createBatchTasks(specs: TaskSpec[]): TaskDefinition[];
    queueTask(taskId: TaskId): void;
    assignTask(taskId: TaskId, agentId: AgentId): void;
    startTask(taskId: TaskId): void;
    completeTask(taskId: TaskId, result: TaskResult): void;
    failTask(taskId: TaskId, error: Error): void;
    cancelTask(taskId: TaskId): void;
    addDependency(taskId: TaskId, dependsOn: TaskId): void;
    removeDependency(taskId: TaskId, dependsOn: TaskId): void;
    getDependencies(taskId: TaskId): TaskId[];
    getDependents(taskId: TaskId): TaskId[];
    isBlocked(taskId: TaskId): boolean;
    getBlockingTasks(taskId: TaskId): TaskId[];
    getTask(taskId: TaskId): TaskDefinition | undefined;
    getAllTasks(): TaskDefinition[];
    getTasksByStatus(status: TaskStatus): TaskDefinition[];
    getTasksByAgent(agentId: AgentId): TaskDefinition[];
    getTasksByDomain(domain: AgentDomain): TaskDefinition[];
    getTasksByPhase(phase: PhaseId): TaskDefinition[];
    getNextTask(agentId?: AgentId): TaskDefinition | undefined;
    getPriorityQueue(): TaskDefinition[];
    getTaskMetrics(): TaskOrchestratorMetrics;
}
export interface TaskSpec {
    type: TaskType;
    title: string;
    description: string;
    priority?: TaskPriority;
    dependencies?: TaskId[];
    domain: AgentDomain;
    phase: PhaseId;
    estimatedDuration?: number;
    tags?: string[];
}
export interface TaskOrchestratorMetrics {
    totalTasks: number;
    tasksByStatus: Record<TaskStatus, number>;
    tasksByPriority: Record<TaskPriority, number>;
    tasksByDomain: Record<AgentDomain, number>;
    averageQueueTime: number;
    averageExecutionTime: number;
    throughput: number;
}
export declare class TaskOrchestrator implements ITaskOrchestrator {
    private tasks;
    private dependencyGraph;
    private dependentGraph;
    private taskCounter;
    private eventBus;
    private agentRegistry;
    constructor(eventBus: IEventBus, agentRegistry: IAgentRegistry);
    createTask(spec: TaskSpec): TaskDefinition;
    createBatchTasks(specs: TaskSpec[]): TaskDefinition[];
    queueTask(taskId: TaskId): void;
    assignTask(taskId: TaskId, agentId: AgentId): void;
    startTask(taskId: TaskId): void;
    completeTask(taskId: TaskId, result: TaskResult): void;
    failTask(taskId: TaskId, error: Error): void;
    cancelTask(taskId: TaskId): void;
    addDependency(taskId: TaskId, dependsOn: TaskId): void;
    removeDependency(taskId: TaskId, dependsOn: TaskId): void;
    getDependencies(taskId: TaskId): TaskId[];
    getDependents(taskId: TaskId): TaskId[];
    isBlocked(taskId: TaskId): boolean;
    getBlockingTasks(taskId: TaskId): TaskId[];
    getTask(taskId: TaskId): TaskDefinition | undefined;
    getAllTasks(): TaskDefinition[];
    getTasksByStatus(status: TaskStatus): TaskDefinition[];
    getTasksByAgent(agentId: AgentId): TaskDefinition[];
    getTasksByDomain(domain: AgentDomain): TaskDefinition[];
    getTasksByPhase(phase: PhaseId): TaskDefinition[];
    getNextTask(agentId?: AgentId): TaskDefinition | undefined;
    getPriorityQueue(): TaskDefinition[];
    getTaskMetrics(): TaskOrchestratorMetrics;
    private getTaskOrThrow;
    private updateTaskStatus;
    private updateBlockedStatus;
    private unblockDependentTasks;
    private wouldCreateCycle;
    private handleAgentTaskCompleted;
    private createDefaultMetrics;
    private getQueuePosition;
}
export declare function createTaskOrchestrator(eventBus: IEventBus, agentRegistry: IAgentRegistry): ITaskOrchestrator;
//# sourceMappingURL=task-orchestrator.d.ts.map