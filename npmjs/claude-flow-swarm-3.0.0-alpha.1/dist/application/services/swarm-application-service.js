/**
 * Swarm Application Service - Application Layer
 *
 * Orchestrates swarm operations and provides simplified interface.
 *
 * @module v3/swarm/application/services
 */
import { CoordinationService } from '../../domain/services/coordination-service.js';
import { SpawnAgentCommandHandler, TerminateAgentCommandHandler } from '../commands/spawn-agent.command.js';
import { CreateTaskCommandHandler, CancelTaskCommandHandler } from '../commands/create-task.command.js';
/**
 * Swarm Application Service
 */
export class SwarmApplicationService {
    agentRepository;
    taskRepository;
    config;
    coordinationService;
    spawnHandler;
    terminateHandler;
    createTaskHandler;
    cancelTaskHandler;
    constructor(agentRepository, taskRepository, config = {}) {
        this.agentRepository = agentRepository;
        this.taskRepository = taskRepository;
        this.config = config;
        this.coordinationService = new CoordinationService(agentRepository, taskRepository);
        this.spawnHandler = new SpawnAgentCommandHandler(agentRepository);
        this.terminateHandler = new TerminateAgentCommandHandler(agentRepository);
        this.createTaskHandler = new CreateTaskCommandHandler(taskRepository);
        this.cancelTaskHandler = new CancelTaskCommandHandler(taskRepository);
    }
    // ============================================================================
    // Agent Operations
    // ============================================================================
    /**
     * Spawn a new agent
     */
    async spawnAgent(input) {
        const result = await this.spawnHandler.execute(input);
        return result.agent;
    }
    /**
     * Terminate an agent
     */
    async terminateAgent(agentId, force = false) {
        await this.terminateHandler.execute({ agentId, force });
    }
    /**
     * Get agent by ID
     */
    async getAgent(agentId) {
        return this.agentRepository.findById(agentId);
    }
    /**
     * List all agents
     */
    async listAgents(options) {
        return this.agentRepository.findAll(options);
    }
    /**
     * Get agent statistics
     */
    async getAgentStatistics() {
        return this.agentRepository.getStatistics();
    }
    // ============================================================================
    // Task Operations
    // ============================================================================
    /**
     * Create a new task
     */
    async createTask(input) {
        const result = await this.createTaskHandler.execute(input);
        return result.task;
    }
    /**
     * Cancel a task
     */
    async cancelTask(taskId) {
        await this.cancelTaskHandler.execute({ taskId });
    }
    /**
     * Get task by ID
     */
    async getTask(taskId) {
        return this.taskRepository.findById(taskId);
    }
    /**
     * List tasks
     */
    async listTasks(options) {
        return this.taskRepository.findAll(options);
    }
    /**
     * Get task statistics
     */
    async getTaskStatistics() {
        return this.taskRepository.getStatistics();
    }
    // ============================================================================
    // Orchestration
    // ============================================================================
    /**
     * Assign pending tasks to available agents
     */
    async processPendingTasks() {
        const queuedTasks = await this.taskRepository.findQueued();
        let assigned = 0;
        for (const task of queuedTasks) {
            const result = await this.coordinationService.assignTask(task.id, this.config.loadBalancingStrategy ?? 'capability-match');
            if (result.success)
                assigned++;
        }
        return assigned;
    }
    /**
     * Complete a task
     */
    async completeTask(taskId, output) {
        await this.coordinationService.processTaskCompletion(taskId, output);
    }
    /**
     * Fail a task
     */
    async failTask(taskId, error) {
        return this.coordinationService.processTaskFailure(taskId, error);
    }
    /**
     * Get swarm health
     */
    async getHealth() {
        return this.coordinationService.getSwarmHealth();
    }
    /**
     * Get scaling recommendation
     */
    async getScalingRecommendation() {
        return this.coordinationService.calculateScalingRecommendation();
    }
    // ============================================================================
    // Lifecycle
    // ============================================================================
    async initialize() {
        await this.agentRepository.initialize();
        await this.taskRepository.initialize();
    }
    async shutdown() {
        await this.agentRepository.shutdown();
        await this.taskRepository.shutdown();
    }
}
//# sourceMappingURL=swarm-application-service.js.map