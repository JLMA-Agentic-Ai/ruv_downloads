/**
 * Coordination Domain Service - Domain Layer
 *
 * Contains coordination logic that spans multiple entities.
 * Handles task assignment, load balancing, and swarm orchestration.
 *
 * @module v3/swarm/domain/services
 */
import { IAgentRepository } from '../repositories/agent-repository.interface.js';
import { ITaskRepository } from '../repositories/task-repository.interface.js';
/**
 * Load balancing strategy
 */
export type LoadBalancingStrategy = 'round-robin' | 'least-loaded' | 'capability-match' | 'random';
/**
 * Task assignment result
 */
export interface TaskAssignmentResult {
    success: boolean;
    taskId: string;
    agentId?: string;
    reason?: string;
}
/**
 * Swarm health status
 */
export interface SwarmHealth {
    healthy: boolean;
    totalAgents: number;
    activeAgents: number;
    errorAgents: number;
    pendingTasks: number;
    runningTasks: number;
    queueDepth: number;
    averageUtilization: number;
    issues: string[];
}
/**
 * Coordination Domain Service
 *
 * Provides domain-level coordination operations.
 */
export declare class CoordinationService {
    private readonly agentRepository;
    private readonly taskRepository;
    constructor(agentRepository: IAgentRepository, taskRepository: ITaskRepository);
    /**
     * Assign a task to the best available agent
     */
    assignTask(taskId: string, strategy?: LoadBalancingStrategy): Promise<TaskAssignmentResult>;
    /**
     * Find the best agent for a task based on strategy
     */
    private findBestAgent;
    private roundRobinSelection;
    private leastLoadedSelection;
    private capabilityMatchSelection;
    private extractRequiredCapabilities;
    /**
     * Process completed tasks and release agents
     */
    processTaskCompletion(taskId: string, output?: unknown): Promise<void>;
    /**
     * Queue tasks whose dependencies are now satisfied
     */
    private queueDependentTasks;
    /**
     * Handle task failure with retry logic
     */
    processTaskFailure(taskId: string, error: string): Promise<boolean>;
    /**
     * Get overall swarm health
     */
    getSwarmHealth(): Promise<SwarmHealth>;
    /**
     * Scale agents based on workload
     */
    calculateScalingRecommendation(): Promise<{
        action: 'scale-up' | 'scale-down' | 'none';
        count: number;
        reason: string;
    }>;
}
//# sourceMappingURL=coordination-service.d.ts.map