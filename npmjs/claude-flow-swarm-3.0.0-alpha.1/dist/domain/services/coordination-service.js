/**
 * Coordination Domain Service - Domain Layer
 *
 * Contains coordination logic that spans multiple entities.
 * Handles task assignment, load balancing, and swarm orchestration.
 *
 * @module v3/swarm/domain/services
 */
/**
 * Coordination Domain Service
 *
 * Provides domain-level coordination operations.
 */
export class CoordinationService {
    agentRepository;
    taskRepository;
    constructor(agentRepository, taskRepository) {
        this.agentRepository = agentRepository;
        this.taskRepository = taskRepository;
    }
    /**
     * Assign a task to the best available agent
     */
    async assignTask(taskId, strategy = 'capability-match') {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            return { success: false, taskId, reason: 'Task not found' };
        }
        // Check dependencies
        const completedTasks = await this.taskRepository.findByStatus('completed');
        const completedIds = new Set(completedTasks.map((t) => t.id));
        if (!task.areDependenciesSatisfied(completedIds)) {
            return { success: false, taskId, reason: 'Dependencies not satisfied' };
        }
        // Find best agent
        const agent = await this.findBestAgent(task, strategy);
        if (!agent) {
            return { success: false, taskId, reason: 'No available agents' };
        }
        // Assign task
        task.assign(agent.id);
        agent.assignTask(taskId);
        await this.taskRepository.save(task);
        await this.agentRepository.save(agent);
        return { success: true, taskId, agentId: agent.id };
    }
    /**
     * Find the best agent for a task based on strategy
     */
    async findBestAgent(task, strategy) {
        const availableAgents = await this.agentRepository.findAvailable();
        if (availableAgents.length === 0)
            return null;
        switch (strategy) {
            case 'round-robin':
                return this.roundRobinSelection(availableAgents);
            case 'least-loaded':
                return this.leastLoadedSelection(availableAgents);
            case 'capability-match':
                return this.capabilityMatchSelection(availableAgents, task);
            case 'random':
                return availableAgents[Math.floor(Math.random() * availableAgents.length)];
            default:
                return availableAgents[0];
        }
    }
    roundRobinSelection(agents) {
        // Sort by last active time and pick least recently used
        return [...agents].sort((a, b) => a.lastActiveAt.getTime() - b.lastActiveAt.getTime())[0];
    }
    leastLoadedSelection(agents) {
        return [...agents].sort((a, b) => a.getUtilization() - b.getUtilization())[0];
    }
    capabilityMatchSelection(agents, task) {
        // Extract required capabilities from task type and metadata
        const requiredCapabilities = this.extractRequiredCapabilities(task);
        // Score agents by capability match
        const scored = agents.map((agent) => {
            let score = 0;
            for (const cap of requiredCapabilities) {
                if (agent.hasCapability(cap))
                    score++;
            }
            // Factor in utilization (prefer less loaded)
            score -= agent.getUtilization() * 0.5;
            return { agent, score };
        });
        scored.sort((a, b) => b.score - a.score);
        // Return best match if any capabilities matched
        if (scored.length > 0 && scored[0].score > 0) {
            return scored[0].agent;
        }
        // Fallback to least loaded
        return this.leastLoadedSelection(agents);
    }
    extractRequiredCapabilities(task) {
        const capabilities = [task.type];
        // Map task types to required capabilities
        const capabilityMap = {
            implementation: ['coding', 'testing'],
            review: ['review', 'analysis'],
            testing: ['testing', 'qa'],
            documentation: ['documentation', 'writing'],
            security: ['security', 'audit'],
            performance: ['performance', 'optimization'],
        };
        if (capabilityMap[task.type]) {
            capabilities.push(...capabilityMap[task.type]);
        }
        return capabilities;
    }
    /**
     * Process completed tasks and release agents
     */
    async processTaskCompletion(taskId, output) {
        const task = await this.taskRepository.findById(taskId);
        if (!task || !task.assignedAgentId)
            return;
        const agent = await this.agentRepository.findById(task.assignedAgentId);
        task.complete(output);
        await this.taskRepository.save(task);
        if (agent) {
            agent.completeTask(taskId);
            await this.agentRepository.save(agent);
        }
        // Check for dependent tasks that can now be queued
        await this.queueDependentTasks(taskId);
    }
    /**
     * Queue tasks whose dependencies are now satisfied
     */
    async queueDependentTasks(completedTaskId) {
        const pendingTasks = await this.taskRepository.findPending();
        const completedTasks = await this.taskRepository.findByStatus('completed');
        const completedIds = new Set(completedTasks.map((t) => t.id));
        for (const task of pendingTasks) {
            if (task.dependencies.includes(completedTaskId) &&
                task.areDependenciesSatisfied(completedIds)) {
                task.queue();
                await this.taskRepository.save(task);
            }
        }
    }
    /**
     * Handle task failure with retry logic
     */
    async processTaskFailure(taskId, error) {
        const task = await this.taskRepository.findById(taskId);
        if (!task)
            return false;
        const agentId = task.assignedAgentId;
        task.fail(error);
        await this.taskRepository.save(task);
        if (agentId) {
            const agent = await this.agentRepository.findById(agentId);
            if (agent) {
                agent.completeTask(taskId);
                await this.agentRepository.save(agent);
            }
        }
        // Return true if task was requeued for retry
        return task.status === 'queued';
    }
    /**
     * Get overall swarm health
     */
    async getSwarmHealth() {
        const agentStats = await this.agentRepository.getStatistics();
        const taskStats = await this.taskRepository.getStatistics();
        const queuedTasks = await this.taskRepository.findQueued();
        const issues = [];
        // Check for issues
        if (agentStats.byStatus.error > 0) {
            issues.push(`${agentStats.byStatus.error} agents in error state`);
        }
        if (queuedTasks.length > agentStats.byStatus.active * 10) {
            issues.push('Task queue backlog detected');
        }
        if (agentStats.averageUtilization > 0.9) {
            issues.push('High agent utilization');
        }
        const timedOutTasks = await this.taskRepository.findTimedOut();
        if (timedOutTasks.length > 0) {
            issues.push(`${timedOutTasks.length} timed out tasks`);
        }
        return {
            healthy: issues.length === 0,
            totalAgents: agentStats.total,
            activeAgents: agentStats.byStatus.active + agentStats.byStatus.busy,
            errorAgents: agentStats.byStatus.error,
            pendingTasks: taskStats.byStatus.pending,
            runningTasks: taskStats.byStatus.running,
            queueDepth: queuedTasks.length,
            averageUtilization: agentStats.averageUtilization,
            issues,
        };
    }
    /**
     * Scale agents based on workload
     */
    async calculateScalingRecommendation() {
        const health = await this.getSwarmHealth();
        const queuedTasks = await this.taskRepository.findQueued();
        // Scale up if queue is deep and agents are highly utilized
        if (queuedTasks.length > 10 && health.averageUtilization > 0.8) {
            const additionalAgents = Math.ceil(queuedTasks.length / 5);
            return {
                action: 'scale-up',
                count: additionalAgents,
                reason: 'High queue depth with high agent utilization',
            };
        }
        // Scale down if queue is empty and many agents are idle
        if (queuedTasks.length === 0 && health.averageUtilization < 0.2) {
            const excessAgents = Math.floor(health.totalAgents * 0.3);
            if (excessAgents > 0) {
                return {
                    action: 'scale-down',
                    count: excessAgents,
                    reason: 'Low utilization with empty queue',
                };
            }
        }
        return {
            action: 'none',
            count: 0,
            reason: 'Current scaling is appropriate',
        };
    }
}
//# sourceMappingURL=coordination-service.js.map