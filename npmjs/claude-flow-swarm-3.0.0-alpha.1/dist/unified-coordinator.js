/**
 * V3 Unified Swarm Coordinator
 * Consolidates SwarmCoordinator, HiveMind, Maestro, and AgentManager into a single system
 * Supports the 15-agent hierarchical mesh structure with domain-based task routing
 *
 * Performance Targets:
 * - Agent coordination: <100ms for 15 agents
 * - Consensus: <100ms
 * - Message throughput: 1000+ msgs/sec
 *
 * Agent Hierarchy:
 * - Queen (Agent 1): Top-level coordinator
 * - Security Domain (Agents 2-4): security-architect, security-auditor, test-architect
 * - Core Domain (Agents 5-9): core-architect, type-modernization, memory-specialist, swarm-specialist, mcp-optimizer
 * - Integration Domain (Agents 10-12): integration-architect, cli-modernizer, neural-integrator
 * - Support Domain (Agents 13-15): test-architect, performance-engineer, deployment-engineer
 */
import { EventEmitter } from 'events';
import { SWARM_CONSTANTS, } from './types.js';
import { createTopologyManager } from './topology-manager.js';
import { createMessageBus } from './message-bus.js';
import { createAgentPool } from './agent-pool.js';
import { createConsensusEngine } from './consensus/index.js';
// =============================================================================
// 15-Agent Domain Configuration
// =============================================================================
const DOMAIN_CONFIGS = [
    {
        name: 'queen',
        agentNumbers: [1],
        priority: 0,
        capabilities: ['coordination', 'planning', 'oversight', 'consensus'],
        description: 'Top-level swarm coordination and orchestration',
    },
    {
        name: 'security',
        agentNumbers: [2, 3, 4],
        priority: 1,
        capabilities: ['security-architecture', 'cve-remediation', 'security-testing', 'threat-modeling'],
        description: 'Security architecture, CVE fixes, and security testing',
    },
    {
        name: 'core',
        agentNumbers: [5, 6, 7, 8, 9],
        priority: 2,
        capabilities: ['ddd-design', 'type-modernization', 'memory-unification', 'swarm-coordination', 'mcp-optimization'],
        description: 'Core architecture, DDD, memory unification, and MCP optimization',
    },
    {
        name: 'integration',
        agentNumbers: [10, 11, 12],
        priority: 3,
        capabilities: ['agentic-flow-integration', 'cli-modernization', 'neural-integration', 'hooks-system'],
        description: 'agentic-flow integration, CLI modernization, and neural features',
    },
    {
        name: 'support',
        agentNumbers: [13, 14, 15],
        priority: 4,
        capabilities: ['tdd-testing', 'performance-benchmarking', 'deployment', 'release-management'],
        description: 'Testing, performance optimization, and deployment',
    },
];
export class UnifiedSwarmCoordinator extends EventEmitter {
    config;
    state;
    topologyManager;
    messageBus;
    consensusEngine;
    agentPools = new Map();
    // Domain-based tracking for 15-agent hierarchy
    domainConfigs = new Map();
    domainPools = new Map();
    agentDomainMap = new Map();
    taskAssignments = new Map();
    domainTaskQueues = new Map();
    // Performance tracking
    startTime;
    taskCounter = 0;
    agentCounter = 0;
    coordinationLatencies = [];
    lastMetricsUpdate = new Date();
    // Background intervals
    heartbeatInterval;
    healthCheckInterval;
    metricsInterval;
    constructor(config = {}) {
        super();
        this.config = this.createDefaultConfig(config);
        this.state = this.createInitialState();
        // Initialize components
        this.topologyManager = createTopologyManager(this.config.topology);
        this.messageBus = createMessageBus(this.config.messageBus);
        this.consensusEngine = createConsensusEngine(this.state.id.id, this.config.consensus.algorithm, this.config.consensus);
        // Initialize domain configurations
        this.initializeDomainConfigs();
        this.setupEventForwarding();
    }
    // =============================================================================
    // Domain Configuration Initialization
    // =============================================================================
    initializeDomainConfigs() {
        for (const config of DOMAIN_CONFIGS) {
            this.domainConfigs.set(config.name, config);
            this.domainTaskQueues.set(config.name, []);
        }
    }
    async initialize() {
        if (this.state.status !== 'initializing' && this.state.status !== 'stopped') {
            throw new Error(`Cannot initialize from status: ${this.state.status}`);
        }
        const startTime = performance.now();
        try {
            // Initialize all components in parallel
            await Promise.all([
                this.topologyManager.initialize(this.config.topology),
                this.messageBus.initialize(this.config.messageBus),
                this.consensusEngine.initialize(this.config.consensus),
            ]);
            // Initialize default agent pools
            await this.initializeAgentPools();
            // Start background processes
            this.startBackgroundProcesses();
            this.state.status = 'running';
            this.startTime = new Date();
            this.state.startedAt = this.startTime;
            const duration = performance.now() - startTime;
            this.recordCoordinationLatency(duration);
            this.emitEvent('swarm.initialized', {
                swarmId: this.state.id.id,
                initDurationMs: duration,
            });
            this.emitEvent('swarm.started', {
                swarmId: this.state.id.id,
                topology: this.config.topology.type,
                consensus: this.config.consensus.algorithm,
            });
        }
        catch (error) {
            this.state.status = 'failed';
            throw error;
        }
    }
    async shutdown() {
        if (this.state.status === 'stopped') {
            return;
        }
        this.state.status = 'shutting_down';
        // Stop background processes
        this.stopBackgroundProcesses();
        // Shutdown all components including domain pools
        await Promise.all([
            this.messageBus.shutdown(),
            this.consensusEngine.shutdown(),
            ...Array.from(this.agentPools.values()).map(pool => pool.shutdown()),
            ...Array.from(this.domainPools.values()).map(pool => pool.shutdown()),
        ]);
        // Clear all tracking data
        this.state.agents.clear();
        this.state.tasks.clear();
        this.agentDomainMap.clear();
        this.taskAssignments.clear();
        for (const queue of this.domainTaskQueues.values()) {
            queue.length = 0;
        }
        this.state.status = 'stopped';
        this.emitEvent('swarm.stopped', {
            swarmId: this.state.id.id,
            totalTasks: this.state.metrics.totalTasks,
            completedTasks: this.state.metrics.completedTasks,
        });
    }
    async pause() {
        if (this.state.status !== 'running') {
            return;
        }
        this.state.status = 'paused';
        this.stopBackgroundProcesses();
        this.emitEvent('swarm.paused', { swarmId: this.state.id.id });
    }
    async resume() {
        if (this.state.status !== 'paused') {
            return;
        }
        this.startBackgroundProcesses();
        this.state.status = 'running';
        this.emitEvent('swarm.resumed', { swarmId: this.state.id.id });
    }
    // ===== AGENT MANAGEMENT =====
    async registerAgent(agentData) {
        const startTime = performance.now();
        if (this.state.agents.size >= this.config.maxAgents) {
            throw new Error(`Maximum agents (${this.config.maxAgents}) reached`);
        }
        this.agentCounter++;
        const agentId = {
            id: `agent_${this.state.id.id}_${this.agentCounter}`,
            swarmId: this.state.id.id,
            type: agentData.type,
            instance: this.agentCounter,
        };
        const agent = {
            ...agentData,
            id: agentId,
            lastHeartbeat: new Date(),
            connections: [],
        };
        // Add to state
        this.state.agents.set(agentId.id, agent);
        // Add to topology
        const role = this.determineTopologyRole(agent.type);
        await this.topologyManager.addNode(agentId.id, role);
        // Subscribe to message bus
        this.messageBus.subscribe(agentId.id, (message) => {
            this.handleAgentMessage(agentId.id, message);
        });
        // Add to consensus engine
        this.consensusEngine.addNode(agentId.id);
        const duration = performance.now() - startTime;
        this.recordCoordinationLatency(duration);
        this.emitEvent('agent.joined', {
            agentId: agentId.id,
            type: agent.type,
            registrationDurationMs: duration,
        });
        return agentId.id;
    }
    async unregisterAgent(agentId) {
        const agent = this.state.agents.get(agentId);
        if (!agent) {
            return;
        }
        // Cancel any assigned tasks
        if (agent.currentTask) {
            await this.cancelTask(agent.currentTask.id);
        }
        // Remove from components
        await this.topologyManager.removeNode(agentId);
        this.messageBus.unsubscribe(agentId);
        this.consensusEngine.removeNode(agentId);
        // Remove from state
        this.state.agents.delete(agentId);
        this.emitEvent('agent.left', { agentId });
    }
    getAgent(agentId) {
        return this.state.agents.get(agentId);
    }
    getAllAgents() {
        return Array.from(this.state.agents.values());
    }
    getAgentsByType(type) {
        return this.getAllAgents().filter(a => a.type === type);
    }
    getAvailableAgents() {
        return this.getAllAgents().filter(a => a.status === 'idle');
    }
    // ===== TASK MANAGEMENT =====
    async submitTask(taskData) {
        const startTime = performance.now();
        if (this.state.tasks.size >= this.config.maxTasks) {
            throw new Error(`Maximum tasks (${this.config.maxTasks}) reached`);
        }
        this.taskCounter++;
        const taskId = {
            id: `task_${this.state.id.id}_${this.taskCounter}`,
            swarmId: this.state.id.id,
            sequence: this.taskCounter,
            priority: taskData.priority,
        };
        const task = {
            ...taskData,
            id: taskId,
            status: 'created',
            createdAt: new Date(),
        };
        this.state.tasks.set(taskId.id, task);
        this.state.metrics.totalTasks++;
        // Assign to available agent
        const assignedAgent = await this.assignTask(task);
        const duration = performance.now() - startTime;
        this.recordCoordinationLatency(duration);
        this.emitEvent('task.created', {
            taskId: taskId.id,
            type: task.type,
            priority: task.priority,
            assignedTo: assignedAgent?.id.id,
            assignmentDurationMs: duration,
        });
        return taskId.id;
    }
    async cancelTask(taskId) {
        const task = this.state.tasks.get(taskId);
        if (!task) {
            return;
        }
        // Notify assigned agent
        if (task.assignedTo) {
            await this.messageBus.send({
                type: 'task_fail',
                from: this.state.id.id,
                to: task.assignedTo.id,
                payload: { taskId, reason: 'cancelled' },
                priority: 'high',
                requiresAck: true,
                ttlMs: SWARM_CONSTANTS.DEFAULT_MESSAGE_TTL_MS,
            });
            // Release agent
            const agent = this.state.agents.get(task.assignedTo.id);
            if (agent) {
                agent.status = 'idle';
                agent.currentTask = undefined;
            }
        }
        task.status = 'cancelled';
        this.emitEvent('task.failed', {
            taskId,
            reason: 'cancelled',
        });
    }
    getTask(taskId) {
        return this.state.tasks.get(taskId);
    }
    getAllTasks() {
        return Array.from(this.state.tasks.values());
    }
    getTasksByStatus(status) {
        return this.getAllTasks().filter(t => t.status === status);
    }
    // ===== COORDINATION =====
    async proposeConsensus(value) {
        const startTime = performance.now();
        const proposal = await this.consensusEngine.propose(value, this.state.id.id);
        const result = await this.consensusEngine.awaitConsensus(proposal.id);
        const duration = performance.now() - startTime;
        this.recordCoordinationLatency(duration);
        if (result.approved) {
            this.emitEvent('consensus.achieved', {
                proposalId: proposal.id,
                approvalRate: result.approvalRate,
                durationMs: duration,
            });
        }
        else {
            this.emitEvent('consensus.failed', {
                proposalId: proposal.id,
                approvalRate: result.approvalRate,
                reason: 'threshold_not_met',
            });
        }
        return result;
    }
    async broadcastMessage(payload, priority = 'normal') {
        await this.messageBus.broadcast({
            type: 'broadcast',
            from: this.state.id.id,
            payload,
            priority,
            requiresAck: false,
            ttlMs: SWARM_CONSTANTS.DEFAULT_MESSAGE_TTL_MS,
        });
    }
    // ===== MONITORING =====
    getState() {
        return {
            ...this.state,
            agents: new Map(this.state.agents),
            tasks: new Map(this.state.tasks),
            topology: this.topologyManager.getState(),
        };
    }
    getMetrics() {
        return { ...this.state.metrics };
    }
    getPerformanceReport() {
        const recentLatencies = this.coordinationLatencies.slice(-100);
        const sortedLatencies = [...recentLatencies].sort((a, b) => a - b);
        return {
            timestamp: new Date(),
            window: 60000, // 1 minute
            coordinationLatencyP50: sortedLatencies[Math.floor(sortedLatencies.length * 0.5)] || 0,
            coordinationLatencyP99: sortedLatencies[Math.floor(sortedLatencies.length * 0.99)] || 0,
            messagesPerSecond: this.messageBus.getStats().messagesPerSecond,
            taskThroughput: this.calculateTaskThroughput(),
            agentUtilization: this.calculateAgentUtilization(),
            consensusSuccessRate: this.state.metrics.consensusSuccessRate,
        };
    }
    // ===== PRIVATE METHODS =====
    createDefaultConfig(config) {
        return {
            topology: {
                type: config.topology?.type ?? 'mesh',
                maxAgents: config.topology?.maxAgents ?? SWARM_CONSTANTS.DEFAULT_MAX_AGENTS,
                replicationFactor: config.topology?.replicationFactor ?? 2,
                partitionStrategy: config.topology?.partitionStrategy ?? 'hash',
                failoverEnabled: config.topology?.failoverEnabled ?? true,
                autoRebalance: config.topology?.autoRebalance ?? true,
            },
            consensus: {
                algorithm: config.consensus?.algorithm ?? 'raft',
                threshold: config.consensus?.threshold ?? SWARM_CONSTANTS.DEFAULT_CONSENSUS_THRESHOLD,
                timeoutMs: config.consensus?.timeoutMs ?? SWARM_CONSTANTS.DEFAULT_CONSENSUS_TIMEOUT_MS,
                maxRounds: config.consensus?.maxRounds ?? 10,
                requireQuorum: config.consensus?.requireQuorum ?? true,
            },
            messageBus: {
                maxQueueSize: config.messageBus?.maxQueueSize ?? SWARM_CONSTANTS.MAX_QUEUE_SIZE,
                processingIntervalMs: config.messageBus?.processingIntervalMs ?? 10,
                ackTimeoutMs: config.messageBus?.ackTimeoutMs ?? 5000,
                retryAttempts: config.messageBus?.retryAttempts ?? SWARM_CONSTANTS.MAX_RETRIES,
                enablePersistence: config.messageBus?.enablePersistence ?? false,
                compressionEnabled: config.messageBus?.compressionEnabled ?? false,
            },
            maxAgents: config.maxAgents ?? SWARM_CONSTANTS.DEFAULT_MAX_AGENTS,
            maxTasks: config.maxTasks ?? SWARM_CONSTANTS.DEFAULT_MAX_TASKS,
            heartbeatIntervalMs: config.heartbeatIntervalMs ?? SWARM_CONSTANTS.DEFAULT_HEARTBEAT_INTERVAL_MS,
            healthCheckIntervalMs: config.healthCheckIntervalMs ?? SWARM_CONSTANTS.DEFAULT_HEALTH_CHECK_INTERVAL_MS,
            taskTimeoutMs: config.taskTimeoutMs ?? SWARM_CONSTANTS.DEFAULT_TASK_TIMEOUT_MS,
            autoScaling: config.autoScaling ?? true,
            autoRecovery: config.autoRecovery ?? true,
        };
    }
    createInitialState() {
        const swarmId = {
            id: `swarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            namespace: 'default',
            version: '3.0.0',
            createdAt: new Date(),
        };
        return {
            id: swarmId,
            status: 'initializing',
            topology: {
                type: 'mesh',
                nodes: [],
                edges: [],
                partitions: [],
            },
            agents: new Map(),
            tasks: new Map(),
            metrics: {
                uptime: 0,
                activeAgents: 0,
                totalTasks: 0,
                completedTasks: 0,
                failedTasks: 0,
                avgTaskDurationMs: 0,
                messagesPerSecond: 0,
                consensusSuccessRate: 1.0,
                coordinationLatencyMs: 0,
                memoryUsageBytes: 0,
            },
        };
    }
    async initializeAgentPools() {
        // Initialize type-based pools (legacy support)
        const defaultPoolTypes = ['worker', 'coordinator', 'researcher', 'coder'];
        for (const type of defaultPoolTypes) {
            const pool = createAgentPool({
                name: `${type}-pool`,
                type,
                minSize: 0,
                maxSize: Math.floor(this.config.maxAgents / defaultPoolTypes.length),
                scaleUpThreshold: 0.8,
                scaleDownThreshold: 0.2,
                cooldownMs: 30000,
                healthCheckIntervalMs: this.config.healthCheckIntervalMs,
            });
            await pool.initialize();
            this.agentPools.set(type, pool);
        }
        // Initialize domain-based pools for 15-agent hierarchy
        await this.initializeDomainPools();
    }
    async initializeDomainPools() {
        for (const [domain, config] of this.domainConfigs) {
            const agentType = this.domainToAgentType(domain);
            const pool = createAgentPool({
                name: `${domain}-domain-pool`,
                type: agentType,
                minSize: 0,
                maxSize: config.agentNumbers.length,
                scaleUpThreshold: 0.8,
                scaleDownThreshold: 0.2,
                cooldownMs: 30000,
                healthCheckIntervalMs: this.config.healthCheckIntervalMs,
            });
            await pool.initialize();
            this.domainPools.set(domain, pool);
        }
    }
    domainToAgentType(domain) {
        switch (domain) {
            case 'queen':
                return 'queen';
            case 'security':
                return 'specialist';
            case 'core':
                return 'architect';
            case 'integration':
                return 'coder';
            case 'support':
                return 'tester';
            default:
                return 'worker';
        }
    }
    setupEventForwarding() {
        // Forward topology events
        this.topologyManager.on('node.added', (data) => {
            this.emitEvent('topology.updated', { action: 'node_added', ...data });
        });
        this.topologyManager.on('node.removed', (data) => {
            this.emitEvent('topology.updated', { action: 'node_removed', ...data });
        });
        this.topologyManager.on('topology.rebalanced', (data) => {
            this.emitEvent('topology.rebalanced', data);
        });
        // Forward consensus events
        this.consensusEngine.on('consensus.achieved', (data) => {
            this.state.metrics.consensusSuccessRate =
                (this.state.metrics.consensusSuccessRate * 0.9) + (data.approved ? 0.1 : 0);
        });
        // Forward message bus events
        this.messageBus.on('message.delivered', (data) => {
            this.emitEvent('message.received', data);
        });
    }
    startBackgroundProcesses() {
        // Heartbeat monitoring
        this.heartbeatInterval = setInterval(() => {
            this.checkHeartbeats();
        }, this.config.heartbeatIntervalMs);
        // Health checks
        this.healthCheckInterval = setInterval(() => {
            this.performHealthChecks();
        }, this.config.healthCheckIntervalMs);
        // Metrics collection
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
        }, 1000);
    }
    stopBackgroundProcesses() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = undefined;
        }
    }
    async assignTask(task) {
        // Find best available agent
        const availableAgents = this.getAvailableAgents();
        if (availableAgents.length === 0) {
            task.status = 'queued';
            return undefined;
        }
        // Score agents based on capabilities and workload
        const scoredAgents = availableAgents.map(agent => ({
            agent,
            score: this.scoreAgentForTask(agent, task),
        })).sort((a, b) => b.score - a.score);
        const bestAgent = scoredAgents[0]?.agent;
        if (!bestAgent) {
            task.status = 'queued';
            return undefined;
        }
        // Assign task
        task.assignedTo = bestAgent.id;
        task.status = 'assigned';
        bestAgent.status = 'busy';
        bestAgent.currentTask = task.id;
        // Notify agent via message bus
        await this.messageBus.send({
            type: 'task_assign',
            from: this.state.id.id,
            to: bestAgent.id.id,
            payload: { task },
            priority: this.mapTaskPriorityToMessagePriority(task.priority),
            requiresAck: true,
            ttlMs: this.config.taskTimeoutMs,
        });
        this.emitEvent('task.assigned', {
            taskId: task.id.id,
            agentId: bestAgent.id.id,
        });
        return bestAgent;
    }
    scoreAgentForTask(agent, task) {
        let score = 100;
        // Type matching
        const typeScores = {
            research: ['researcher'],
            analysis: ['analyst', 'researcher'],
            coding: ['coder'],
            testing: ['tester'],
            review: ['reviewer'],
            documentation: ['documenter'],
            coordination: ['coordinator', 'queen'],
            consensus: ['coordinator', 'queen'],
            custom: ['worker'],
        };
        const preferredTypes = typeScores[task.type] || ['worker'];
        if (preferredTypes.includes(agent.type)) {
            score += 50;
        }
        // Workload adjustment
        score -= agent.workload * 20;
        // Health adjustment
        score *= agent.health;
        // Metrics-based adjustment
        score += agent.metrics.successRate * 10;
        score -= (agent.metrics.averageExecutionTime / 60000) * 5;
        return score;
    }
    mapTaskPriorityToMessagePriority(priority) {
        const mapping = {
            critical: 'urgent',
            high: 'high',
            normal: 'normal',
            low: 'low',
            background: 'low',
        };
        return mapping[priority];
    }
    determineTopologyRole(agentType) {
        switch (agentType) {
            case 'queen':
                return 'queen';
            case 'coordinator':
                return 'coordinator';
            default:
                return this.config.topology.type === 'mesh' ? 'peer' : 'worker';
        }
    }
    handleAgentMessage(agentId, message) {
        const agent = this.state.agents.get(agentId);
        if (!agent)
            return;
        // Update heartbeat
        agent.lastHeartbeat = new Date();
        agent.metrics.messagesProcessed++;
        switch (message.type) {
            case 'task_complete':
                this.handleTaskComplete(agentId, message.payload);
                break;
            case 'task_fail':
                this.handleTaskFail(agentId, message.payload);
                break;
            case 'heartbeat':
                this.handleHeartbeat(agentId, message.payload);
                break;
            case 'status_update':
                this.handleStatusUpdate(agentId, message.payload);
                break;
        }
    }
    handleTaskComplete(agentId, data) {
        const task = this.state.tasks.get(data.taskId);
        const agent = this.state.agents.get(agentId);
        if (task && agent) {
            task.status = 'completed';
            task.output = data.result;
            task.completedAt = new Date();
            agent.status = 'idle';
            agent.currentTask = undefined;
            agent.metrics.tasksCompleted++;
            this.state.metrics.completedTasks++;
            // Update average task duration
            if (task.startedAt) {
                const duration = task.completedAt.getTime() - task.startedAt.getTime();
                this.state.metrics.avgTaskDurationMs =
                    (this.state.metrics.avgTaskDurationMs * 0.9) + (duration * 0.1);
            }
            this.emitEvent('task.completed', {
                taskId: data.taskId,
                agentId,
                result: data.result,
            });
        }
    }
    handleTaskFail(agentId, data) {
        const task = this.state.tasks.get(data.taskId);
        const agent = this.state.agents.get(agentId);
        if (task && agent) {
            // Check retry
            if (task.retries < task.maxRetries) {
                task.retries++;
                task.status = 'queued';
                task.assignedTo = undefined;
                agent.currentTask = undefined;
                agent.status = 'idle';
                // Re-assign
                this.assignTask(task);
            }
            else {
                task.status = 'failed';
                agent.status = 'idle';
                agent.currentTask = undefined;
                agent.metrics.tasksFailed++;
                this.state.metrics.failedTasks++;
                this.emitEvent('task.failed', {
                    taskId: data.taskId,
                    agentId,
                    error: data.error,
                });
            }
        }
    }
    handleHeartbeat(agentId, data) {
        const agent = this.state.agents.get(agentId);
        if (agent) {
            agent.lastHeartbeat = new Date();
            if (data.metrics) {
                agent.metrics = { ...agent.metrics, ...data.metrics };
            }
            this.emitEvent('agent.heartbeat', { agentId });
        }
    }
    handleStatusUpdate(agentId, data) {
        const agent = this.state.agents.get(agentId);
        if (agent) {
            if (data.status)
                agent.status = data.status;
            if (data.health !== undefined)
                agent.health = data.health;
            if (data.workload !== undefined)
                agent.workload = data.workload;
            this.emitEvent('agent.status_changed', { agentId, status: agent.status });
        }
    }
    checkHeartbeats() {
        const now = Date.now();
        const timeout = this.config.heartbeatIntervalMs * 3;
        for (const [agentId, agent] of this.state.agents) {
            const timeSinceHeartbeat = now - agent.lastHeartbeat.getTime();
            if (timeSinceHeartbeat > timeout && agent.status !== 'terminated') {
                agent.status = 'error';
                agent.health = Math.max(0, agent.health - 0.2);
                // Auto-recovery
                if (this.config.autoRecovery && agent.health <= 0.2) {
                    this.recoverAgent(agentId);
                }
            }
        }
    }
    async recoverAgent(agentId) {
        const agent = this.state.agents.get(agentId);
        if (!agent)
            return;
        // Reassign any tasks
        if (agent.currentTask) {
            const task = this.state.tasks.get(agent.currentTask.id);
            if (task) {
                task.status = 'queued';
                task.assignedTo = undefined;
                await this.assignTask(task);
            }
        }
        // Reset agent
        agent.status = 'idle';
        agent.currentTask = undefined;
        agent.health = 1.0;
        agent.lastHeartbeat = new Date();
    }
    performHealthChecks() {
        const activeAgents = this.getAllAgents().filter(a => a.status === 'idle' || a.status === 'busy');
        this.state.metrics.activeAgents = activeAgents.length;
        // Update topology state
        this.state.topology = this.topologyManager.getState();
    }
    updateMetrics() {
        const now = new Date();
        const uptime = this.startTime
            ? (now.getTime() - this.startTime.getTime()) / 1000
            : 0;
        this.state.metrics.uptime = uptime;
        this.state.metrics.messagesPerSecond = this.messageBus.getStats().messagesPerSecond;
        // Calculate coordination latency
        if (this.coordinationLatencies.length > 0) {
            const recent = this.coordinationLatencies.slice(-50);
            this.state.metrics.coordinationLatencyMs =
                recent.reduce((a, b) => a + b, 0) / recent.length;
        }
        // Memory usage (approximation)
        this.state.metrics.memoryUsageBytes =
            (this.state.agents.size * 2000) +
                (this.state.tasks.size * 1000) +
                (this.messageBus.getQueueDepth() * 500);
        this.lastMetricsUpdate = now;
    }
    recordCoordinationLatency(latencyMs) {
        this.coordinationLatencies.push(latencyMs);
        if (this.coordinationLatencies.length > 1000) {
            this.coordinationLatencies.shift();
        }
    }
    calculateTaskThroughput() {
        if (!this.startTime)
            return 0;
        const uptimeSeconds = (Date.now() - this.startTime.getTime()) / 1000;
        return uptimeSeconds > 0
            ? this.state.metrics.completedTasks / uptimeSeconds
            : 0;
    }
    calculateAgentUtilization() {
        const agents = this.getAllAgents();
        if (agents.length === 0)
            return 0;
        const busyAgents = agents.filter(a => a.status === 'busy').length;
        return busyAgents / agents.length;
    }
    emitEvent(type, data) {
        const event = {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            type,
            source: this.state.id.id,
            timestamp: new Date(),
            data,
        };
        this.emit(type, event);
        this.emit('event', event);
    }
    // ===== UTILITY METHODS =====
    getTopology() {
        return this.config.topology.type;
    }
    setTopology(type) {
        this.config.topology.type = type;
    }
    getConsensusAlgorithm() {
        return this.config.consensus.algorithm;
    }
    isHealthy() {
        return (this.state.status === 'running' &&
            this.state.metrics.activeAgents > 0 &&
            this.state.metrics.coordinationLatencyMs < SWARM_CONSTANTS.COORDINATION_LATENCY_TARGET_MS * 2);
    }
    getAgentPool(type) {
        return this.agentPools.get(type);
    }
    // =============================================================================
    // DOMAIN-BASED TASK ROUTING (15-Agent Hierarchy Support)
    // =============================================================================
    /**
     * Assign a task to a specific domain
     * Routes the task to the most suitable agent within that domain
     */
    async assignTaskToDomain(taskId, domain) {
        const startTime = performance.now();
        const task = this.state.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }
        const pool = this.domainPools.get(domain);
        if (!pool) {
            throw new Error(`Domain pool ${domain} not found`);
        }
        // Try to acquire an agent from the domain pool
        const agent = await pool.acquire();
        if (!agent) {
            // Add to domain queue if no agents available
            const queue = this.domainTaskQueues.get(domain) || [];
            queue.push(taskId);
            this.domainTaskQueues.set(domain, queue);
            task.status = 'queued';
            this.emitEvent('task.queued', {
                taskId,
                domain,
                queuePosition: queue.length,
                reason: 'no_available_agents'
            });
            return undefined;
        }
        // Update task
        task.status = 'assigned';
        task.assignedTo = agent.id;
        task.startedAt = new Date();
        // Track assignment
        const assignment = {
            taskId,
            domain,
            agentId: agent.id.id,
            priority: task.priority,
            assignedAt: new Date(),
        };
        this.taskAssignments.set(taskId, assignment);
        // Notify agent via message bus
        await this.messageBus.send({
            type: 'task_assign',
            from: this.state.id.id,
            to: agent.id.id,
            payload: { taskId, task, domain },
            priority: this.mapTaskPriorityToMessagePriority(task.priority),
            requiresAck: true,
            ttlMs: this.config.taskTimeoutMs,
        });
        const duration = performance.now() - startTime;
        this.recordCoordinationLatency(duration);
        this.emitEvent('task.assigned', {
            taskId,
            agentId: agent.id.id,
            domain,
            assignmentDurationMs: duration,
        });
        return agent.id.id;
    }
    /**
     * Get all agents belonging to a specific domain
     */
    getAgentsByDomain(domain) {
        const agents = [];
        for (const [agentId, agentDomain] of this.agentDomainMap) {
            if (agentDomain === domain) {
                const agent = this.state.agents.get(agentId);
                if (agent) {
                    agents.push(agent);
                }
            }
        }
        return agents;
    }
    /**
     * Execute multiple tasks in parallel across different domains
     * This is the key method for achieving >85% agent utilization
     */
    async executeParallel(tasks) {
        const startTime = performance.now();
        const executionPromises = [];
        // Submit all tasks first
        const taskIds = [];
        for (const { task, domain } of tasks) {
            const taskId = await this.submitTask(task);
            taskIds.push({ taskId, domain });
        }
        // Execute all tasks in parallel across domains
        for (const { taskId, domain } of taskIds) {
            const promise = this.executeTaskInDomain(taskId, domain);
            executionPromises.push(promise);
        }
        // Wait for all tasks to complete (with individual error handling)
        const settledResults = await Promise.allSettled(executionPromises);
        const results = [];
        for (let i = 0; i < settledResults.length; i++) {
            const result = settledResults[i];
            const { taskId, domain } = taskIds[i];
            if (result.status === 'fulfilled') {
                results.push(result.value);
            }
            else {
                results.push({
                    taskId,
                    domain,
                    success: false,
                    error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
                    durationMs: performance.now() - startTime,
                });
            }
        }
        this.emitEvent('parallel.execution.completed', {
            totalTasks: tasks.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            totalDurationMs: performance.now() - startTime,
        });
        return results;
    }
    async executeTaskInDomain(taskId, domain) {
        const startTime = performance.now();
        try {
            // Assign to domain
            const agentId = await this.assignTaskToDomain(taskId, domain);
            if (!agentId) {
                // Task was queued, wait for it to be assigned and complete
                return await this.waitForQueuedTask(taskId, domain, startTime);
            }
            // Wait for completion
            const result = await this.waitForTaskCompletion(taskId, this.config.taskTimeoutMs);
            return {
                taskId,
                domain,
                success: result.status === 'completed',
                result: result.output,
                durationMs: performance.now() - startTime,
            };
        }
        catch (error) {
            return {
                taskId,
                domain,
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
                durationMs: performance.now() - startTime,
            };
        }
    }
    async waitForQueuedTask(taskId, domain, startTime) {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const task = this.state.tasks.get(taskId);
                if (!task) {
                    clearInterval(checkInterval);
                    resolve({
                        taskId,
                        domain,
                        success: false,
                        error: new Error(`Task ${taskId} not found`),
                        durationMs: performance.now() - startTime,
                    });
                    return;
                }
                if (task.status === 'completed') {
                    clearInterval(checkInterval);
                    resolve({
                        taskId,
                        domain,
                        success: true,
                        result: task.output,
                        durationMs: performance.now() - startTime,
                    });
                }
                else if (task.status === 'failed' || task.status === 'cancelled' || task.status === 'timeout') {
                    clearInterval(checkInterval);
                    resolve({
                        taskId,
                        domain,
                        success: false,
                        error: new Error(`Task ${task.status}`),
                        durationMs: performance.now() - startTime,
                    });
                }
            }, 100);
            // Timeout after configured duration
            setTimeout(() => {
                clearInterval(checkInterval);
                const task = this.state.tasks.get(taskId);
                if (task && task.status !== 'completed') {
                    task.status = 'timeout';
                }
                resolve({
                    taskId,
                    domain,
                    success: false,
                    error: new Error('Task timed out'),
                    durationMs: performance.now() - startTime,
                });
            }, this.config.taskTimeoutMs);
        });
    }
    async waitForTaskCompletion(taskId, timeoutMs) {
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                const task = this.state.tasks.get(taskId);
                if (!task) {
                    clearInterval(checkInterval);
                    reject(new Error(`Task ${taskId} not found`));
                    return;
                }
                if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
                    clearInterval(checkInterval);
                    resolve(task);
                }
            }, 100);
            setTimeout(() => {
                clearInterval(checkInterval);
                const task = this.state.tasks.get(taskId);
                if (task) {
                    task.status = 'timeout';
                    task.completedAt = new Date();
                    resolve(task);
                }
                else {
                    reject(new Error(`Task ${taskId} timed out`));
                }
            }, timeoutMs);
        });
    }
    /**
     * Get the current status of all domains
     */
    getStatus() {
        const domains = [];
        for (const [domain, config] of this.domainConfigs) {
            const pool = this.domainPools.get(domain);
            const stats = pool?.getPoolStats();
            const queue = this.domainTaskQueues.get(domain) || [];
            const completedTasks = Array.from(this.taskAssignments.values())
                .filter(a => a.domain === domain)
                .map(a => this.state.tasks.get(a.taskId))
                .filter(t => t?.status === 'completed')
                .length;
            domains.push({
                name: domain,
                agentCount: stats?.total ?? 0,
                availableAgents: stats?.available ?? 0,
                busyAgents: stats?.busy ?? 0,
                tasksQueued: queue.length,
                tasksCompleted: completedTasks,
            });
        }
        return {
            swarmId: this.state.id,
            status: this.state.status,
            topology: this.config.topology.type,
            domains,
            metrics: this.getMetrics(),
        };
    }
    /**
     * Register an agent and automatically assign it to the appropriate domain
     * based on its agent number (1-15)
     */
    async registerAgentWithDomain(agentData, agentNumber) {
        // First register the agent normally
        const agentId = await this.registerAgent(agentData);
        // Determine domain based on agent number
        const domain = this.getAgentDomain(agentNumber);
        // Add to domain tracking
        this.agentDomainMap.set(agentId, domain);
        // Add to domain pool
        const pool = this.domainPools.get(domain);
        const agent = this.state.agents.get(agentId);
        if (pool && agent) {
            await pool.add(agent);
        }
        this.emitEvent('agent.domain_assigned', {
            agentId,
            agentNumber,
            domain,
        });
        return { agentId, domain };
    }
    /**
     * Get the domain for a given agent number (1-15)
     */
    getAgentDomain(agentNumber) {
        for (const [domain, config] of this.domainConfigs) {
            if (config.agentNumbers.includes(agentNumber)) {
                return domain;
            }
        }
        return 'core'; // Default to core domain
    }
    /**
     * Spawn the full 15-agent hierarchy
     * Returns a map of agent numbers to their IDs and domains
     */
    async spawnFullHierarchy() {
        const results = new Map();
        for (const [domain, config] of this.domainConfigs) {
            for (const agentNumber of config.agentNumbers) {
                const agentType = this.domainToAgentType(domain);
                const agentData = {
                    name: `${domain}-agent-${agentNumber}`,
                    type: agentType,
                    status: 'idle',
                    capabilities: this.createDomainCapabilities(domain),
                    metrics: this.createDefaultAgentMetrics(),
                    workload: 0,
                    health: 1.0,
                    lastHeartbeat: new Date(),
                    topologyRole: domain === 'queen' ? 'queen' : 'worker',
                    connections: [],
                };
                const result = await this.registerAgentWithDomain(agentData, agentNumber);
                results.set(agentNumber, result);
            }
        }
        this.emitEvent('hierarchy.spawned', {
            totalAgents: results.size,
            domains: Array.from(this.domainConfigs.keys()),
        });
        return results;
    }
    createDomainCapabilities(domain) {
        const domainConfig = this.domainConfigs.get(domain);
        const capabilities = domainConfig?.capabilities || [];
        return {
            codeGeneration: domain === 'core' || domain === 'integration',
            codeReview: domain === 'security' || domain === 'core',
            testing: domain === 'support' || domain === 'security',
            documentation: true,
            research: true,
            analysis: true,
            coordination: domain === 'queen',
            languages: ['typescript', 'javascript', 'python'],
            frameworks: ['node', 'react', 'vitest'],
            domains: capabilities,
            tools: ['git', 'npm', 'editor', 'claude'],
            maxConcurrentTasks: domain === 'queen' ? 1 : 3,
            maxMemoryUsage: 512 * 1024 * 1024,
            maxExecutionTime: SWARM_CONSTANTS.DEFAULT_TASK_TIMEOUT_MS,
            reliability: 0.95,
            speed: 1.0,
            quality: 0.9,
        };
    }
    createDefaultAgentMetrics() {
        return {
            tasksCompleted: 0,
            tasksFailed: 0,
            averageExecutionTime: 0,
            successRate: 1.0,
            cpuUsage: 0,
            memoryUsage: 0,
            messagesProcessed: 0,
            lastActivity: new Date(),
            responseTime: 0,
            health: 1.0,
        };
    }
    /**
     * Get the domain pool for a specific domain
     */
    getDomainPool(domain) {
        return this.domainPools.get(domain);
    }
    /**
     * Get all domain configurations
     */
    getDomainConfigs() {
        return new Map(this.domainConfigs);
    }
    /**
     * Release an agent back to its domain pool after task completion
     */
    async releaseAgentToDomain(agentId) {
        const domain = this.agentDomainMap.get(agentId);
        if (!domain)
            return;
        const pool = this.domainPools.get(domain);
        if (pool) {
            await pool.release(agentId);
        }
        // Check if there are queued tasks for this domain
        const queue = this.domainTaskQueues.get(domain) || [];
        if (queue.length > 0) {
            const nextTaskId = queue.shift();
            this.domainTaskQueues.set(domain, queue);
            await this.assignTaskToDomain(nextTaskId, domain);
        }
    }
    // =============================================================================
    // MCP-Compatible API Methods (agentic-flow@alpha compatibility)
    // =============================================================================
    /**
     * Spawn a new agent (MCP-compatible alias for registerAgent)
     * Compatible with agentic-flow@alpha's agent spawn API
     *
     * @param options - Agent spawn options
     * @returns Spawned agent ID and details
     */
    async spawnAgent(options) {
        const startTime = performance.now();
        // Create agent data from options
        const agentData = {
            name: options.name || `${options.type}-agent-${this.agentCounter + 1}`,
            type: options.type,
            status: 'idle',
            capabilities: this.createCapabilitiesFromList(options.capabilities || []),
            metrics: this.createDefaultAgentMetrics(),
            workload: 0,
            health: 1.0,
            lastHeartbeat: new Date(),
            topologyRole: options.type === 'queen' ? 'queen' : 'worker',
            connections: [],
        };
        // Determine domain and agent number
        let domain;
        let agentId;
        if (options.agentNumber) {
            // Use provided agent number to determine domain
            const result = await this.registerAgentWithDomain(agentData, options.agentNumber);
            agentId = result.agentId;
            domain = result.domain;
        }
        else if (options.domain) {
            // Use provided domain, assign next available number in that domain
            const config = this.domainConfigs.get(options.domain);
            const existingAgents = Array.from(this.agentDomainMap.entries())
                .filter(([, d]) => d === options.domain)
                .length;
            const nextNumber = config?.agentNumbers[existingAgents] || config?.agentNumbers[0] || 1;
            const result = await this.registerAgentWithDomain(agentData, nextNumber);
            agentId = result.agentId;
            domain = result.domain;
        }
        else {
            // Auto-assign to most appropriate domain based on type
            domain = this.agentTypeToDomain(options.type);
            agentId = await this.registerAgent(agentData);
            this.agentDomainMap.set(agentId, domain);
        }
        const duration = performance.now() - startTime;
        this.emitEvent('agent.joined', {
            agentId,
            type: options.type,
            domain,
            durationMs: duration,
        });
        return {
            agentId,
            domain,
            status: 'idle',
            spawned: true,
        };
    }
    /**
     * Terminate an agent (MCP-compatible alias for unregisterAgent)
     * Compatible with agentic-flow@alpha's agent terminate API
     *
     * @param agentId - Agent ID to terminate
     * @param options - Termination options
     * @returns Termination result
     */
    async terminateAgent(agentId, options) {
        const agent = this.state.agents.get(agentId);
        if (!agent) {
            return {
                terminated: false,
                agentId,
                reason: 'Agent not found',
            };
        }
        // If agent has active tasks and not forcing, wait or reassign
        let tasksReassigned = 0;
        if (agent.currentTask && !options?.force) {
            const gracePeriodMs = options?.gracePeriodMs || 5000;
            // Wait for grace period or force terminate
            const task = agent.currentTask;
            await new Promise(resolve => setTimeout(resolve, gracePeriodMs));
            // Check if task still running
            const currentAgent = this.state.agents.get(agentId);
            if (currentAgent?.currentTask?.id === task.id) {
                // Reassign the task
                await this.cancelTask(task.id);
                tasksReassigned = 1;
            }
        }
        // Remove from domain tracking
        this.agentDomainMap.delete(agentId);
        // Unregister the agent
        await this.unregisterAgent(agentId);
        this.emitEvent('agent.left', {
            agentId,
            reason: options?.reason || 'manual termination',
            tasksReassigned,
        });
        return {
            terminated: true,
            agentId,
            reason: options?.reason || 'manual termination',
            tasksReassigned,
        };
    }
    /**
     * Get agent status by ID (MCP-compatible)
     */
    async getAgentStatus(agentId) {
        const agent = this.state.agents.get(agentId);
        if (!agent) {
            return { found: false, agentId };
        }
        const domain = this.agentDomainMap.get(agentId);
        return {
            found: true,
            agentId,
            status: agent.status,
            domain,
            workload: agent.workload,
            health: agent.health,
            currentTask: agent.currentTask?.id,
            metrics: agent.metrics,
        };
    }
    /**
     * List all agents with optional filters (MCP-compatible)
     */
    listAgents(filters) {
        let agents = this.getAllAgents();
        if (filters?.status) {
            agents = agents.filter(a => a.status === filters.status);
        }
        if (filters?.type) {
            agents = agents.filter(a => a.type === filters.type);
        }
        if (filters?.available) {
            agents = agents.filter(a => a.status === 'idle');
        }
        if (filters?.domain) {
            agents = agents.filter(a => {
                const domain = this.agentDomainMap.get(a.id.id);
                return domain === filters.domain;
            });
        }
        return agents.map(a => ({
            agentId: a.id.id,
            name: a.name,
            type: a.type,
            status: a.status,
            domain: this.agentDomainMap.get(a.id.id),
            workload: a.workload,
            health: a.health,
        }));
    }
    // =============================================================================
    // Helper Methods for MCP API
    // =============================================================================
    createCapabilitiesFromList(capabilities) {
        return {
            codeGeneration: capabilities.includes('code-generation'),
            codeReview: capabilities.includes('code-review'),
            testing: capabilities.includes('testing'),
            documentation: capabilities.includes('documentation'),
            research: capabilities.includes('research'),
            analysis: capabilities.includes('analysis'),
            coordination: capabilities.includes('coordination'),
            languages: ['typescript', 'javascript', 'python'],
            frameworks: ['node', 'react', 'vitest'],
            domains: capabilities,
            tools: ['git', 'npm', 'editor', 'claude'],
            maxConcurrentTasks: 3,
            maxMemoryUsage: 512 * 1024 * 1024,
            maxExecutionTime: SWARM_CONSTANTS.DEFAULT_TASK_TIMEOUT_MS,
            reliability: 0.95,
            speed: 1.0,
            quality: 0.9,
        };
    }
    agentTypeToDomain(type) {
        const typeMapping = {
            queen: 'queen',
            coordinator: 'queen',
            security: 'security',
            architect: 'core',
            coder: 'core',
            developer: 'core',
            tester: 'support',
            reviewer: 'security',
            researcher: 'integration',
            analyst: 'core',
            optimizer: 'support',
            documenter: 'support',
            monitor: 'support',
            specialist: 'core',
            worker: 'core',
        };
        return typeMapping[type] || 'core';
    }
}
export function createUnifiedSwarmCoordinator(config) {
    return new UnifiedSwarmCoordinator(config);
}
//# sourceMappingURL=unified-coordinator.js.map