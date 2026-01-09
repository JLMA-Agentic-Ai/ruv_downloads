/**
 * Swarm Application Service - Application Layer
 *
 * Orchestrates swarm operations and provides simplified interface.
 *
 * @module v3/swarm/application/services
 */
import { Agent, AgentRole, AgentStatus } from '../../domain/entities/agent.js';
import { Task, TaskStatus, TaskPriority } from '../../domain/entities/task.js';
import { IAgentRepository, AgentStatistics } from '../../domain/repositories/agent-repository.interface.js';
import { ITaskRepository, TaskStatistics } from '../../domain/repositories/task-repository.interface.js';
import { LoadBalancingStrategy, SwarmHealth } from '../../domain/services/coordination-service.js';
import { SpawnAgentInput } from '../commands/spawn-agent.command.js';
import { CreateTaskInput } from '../commands/create-task.command.js';
/**
 * Swarm configuration
 */
export interface SwarmConfig {
    loadBalancingStrategy?: LoadBalancingStrategy;
    autoScaling?: boolean;
    minAgents?: number;
    maxAgents?: number;
}
/**
 * Swarm Application Service
 */
export declare class SwarmApplicationService {
    private readonly agentRepository;
    private readonly taskRepository;
    private readonly config;
    private readonly coordinationService;
    private readonly spawnHandler;
    private readonly terminateHandler;
    private readonly createTaskHandler;
    private readonly cancelTaskHandler;
    constructor(agentRepository: IAgentRepository, taskRepository: ITaskRepository, config?: SwarmConfig);
    /**
     * Spawn a new agent
     */
    spawnAgent(input: SpawnAgentInput): Promise<Agent>;
    /**
     * Terminate an agent
     */
    terminateAgent(agentId: string, force?: boolean): Promise<void>;
    /**
     * Get agent by ID
     */
    getAgent(agentId: string): Promise<Agent | null>;
    /**
     * List all agents
     */
    listAgents(options?: {
        status?: AgentStatus;
        role?: AgentRole;
        domain?: string;
    }): Promise<Agent[]>;
    /**
     * Get agent statistics
     */
    getAgentStatistics(): Promise<AgentStatistics>;
    /**
     * Create a new task
     */
    createTask(input: CreateTaskInput): Promise<Task>;
    /**
     * Cancel a task
     */
    cancelTask(taskId: string): Promise<void>;
    /**
     * Get task by ID
     */
    getTask(taskId: string): Promise<Task | null>;
    /**
     * List tasks
     */
    listTasks(options?: {
        status?: TaskStatus;
        priority?: TaskPriority;
        assignedAgentId?: string;
    }): Promise<Task[]>;
    /**
     * Get task statistics
     */
    getTaskStatistics(): Promise<TaskStatistics>;
    /**
     * Assign pending tasks to available agents
     */
    processPendingTasks(): Promise<number>;
    /**
     * Complete a task
     */
    completeTask(taskId: string, output?: unknown): Promise<void>;
    /**
     * Fail a task
     */
    failTask(taskId: string, error: string): Promise<boolean>;
    /**
     * Get swarm health
     */
    getHealth(): Promise<SwarmHealth>;
    /**
     * Get scaling recommendation
     */
    getScalingRecommendation(): Promise<{
        action: "scale-up" | "scale-down" | "none";
        count: number;
        reason: string;
    }>;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=swarm-application-service.d.ts.map