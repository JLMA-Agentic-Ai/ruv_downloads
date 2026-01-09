/**
 * V3 Claude-Flow Swarm Test Instance
 *
 * Creates isolated swarm instances for testing
 * Supports 15-agent V3 swarm topology testing
 */
import { vi } from 'vitest';
import { createMock, InteractionRecorder } from './create-mock.js';
/**
 * Create a test swarm instance with mocked agents
 */
export function createSwarmTestInstance(config) {
    const topology = config?.topology ?? 'hierarchical-mesh';
    const agentTypes = config?.agentTypes ?? [
        'queen-coordinator',
        'security-architect',
        'security-auditor',
        'memory-specialist',
        'swarm-specialist',
    ];
    return new SwarmTestInstance(topology, agentTypes);
}
/**
 * Swarm test instance class
 */
export class SwarmTestInstance {
    topology;
    agentTypes;
    agents = new Map();
    messages = [];
    taskResults = [];
    interactionRecorder;
    isInitialized = false;
    constructor(topology, agentTypes) {
        this.topology = topology;
        this.agentTypes = agentTypes;
        this.interactionRecorder = new InteractionRecorder();
        this.initializeAgents();
    }
    initializeAgents() {
        for (const type of this.agentTypes) {
            const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            const agent = this.createMockAgent(id, type);
            this.agents.set(id, agent);
            this.interactionRecorder.track(id, agent);
        }
    }
    createMockAgent(id, type) {
        const mock = createMock();
        // Set default properties
        Object.defineProperty(mock, 'id', { value: id, writable: false });
        Object.defineProperty(mock, 'type', { value: type, writable: false });
        Object.defineProperty(mock, 'status', { value: 'idle', writable: true });
        Object.defineProperty(mock, 'capabilities', {
            value: this.getCapabilitiesForType(type),
            writable: false
        });
        // Configure default behavior
        mock.execute.mockImplementation(async (task) => {
            const result = {
                taskId: task.id,
                agentId: id,
                success: true,
                duration: Math.random() * 100 + 10,
            };
            this.taskResults.push(result);
            return result;
        });
        mock.communicate.mockImplementation(async (message) => {
            this.messages.push(message);
        });
        return mock;
    }
    getCapabilitiesForType(type) {
        const capabilities = {
            'queen-coordinator': ['orchestration', 'task-distribution', 'agent-management'],
            'security-architect': ['security-design', 'threat-modeling', 'security-review'],
            'security-auditor': ['cve-detection', 'vulnerability-scanning', 'security-testing'],
            'memory-specialist': ['memory-optimization', 'agentdb-integration', 'caching'],
            'swarm-specialist': ['coordination', 'consensus', 'communication'],
            'integration-architect': ['api-design', 'system-integration', 'compatibility'],
            'performance-engineer': ['optimization', 'benchmarking', 'profiling'],
            'core-architect': ['ddd-design', 'architecture', 'domain-modeling'],
            'test-architect': ['tdd', 'test-design', 'quality-assurance'],
            'project-coordinator': ['project-management', 'scheduling', 'reporting'],
            'coder': ['coding', 'implementation', 'debugging'],
            'reviewer': ['code-review', 'quality-check', 'suggestions'],
            'tester': ['testing', 'test-execution', 'coverage'],
            'planner': ['planning', 'estimation', 'roadmap'],
            'researcher': ['research', 'analysis', 'documentation'],
        };
        return capabilities[type];
    }
    /**
     * Initialize the swarm
     */
    async initialize() {
        this.isInitialized = true;
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 1));
    }
    /**
     * Get an agent by type
     */
    getAgent(type) {
        for (const [_, agent] of this.agents) {
            if (agent.type === type) {
                return agent;
            }
        }
        return undefined;
    }
    /**
     * Get all agents
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    /**
     * Get agent by ID
     */
    getAgentById(id) {
        return this.agents.get(id);
    }
    /**
     * Get all messages
     */
    getMessages() {
        return [...this.messages];
    }
    /**
     * Get task results
     */
    getTaskResults() {
        return [...this.taskResults];
    }
    /**
     * Get interaction order for behavior verification
     */
    getInteractionOrder() {
        return this.interactionRecorder.getInteractionOrder();
    }
    /**
     * Get all interactions
     */
    getInteractions() {
        return this.interactionRecorder.getInteractions();
    }
    /**
     * Coordinate a task across agents
     */
    async coordinate(task) {
        if (!this.isInitialized) {
            throw new Error('Swarm not initialized');
        }
        const startTime = Date.now();
        const results = [];
        // Simulate coordination based on topology
        const queen = this.getAgent('queen-coordinator');
        if (queen && this.topology.includes('hierarchical')) {
            await queen.communicate({
                from: 'coordinator',
                to: 'broadcast',
                type: 'task',
                payload: task,
                timestamp: new Date(),
            });
        }
        // Execute task on appropriate agent
        for (const agent of this.agents.values()) {
            const result = await agent.execute(task);
            results.push(result);
        }
        const completedTasks = results.filter(r => r.success).length;
        const failedTasks = results.filter(r => !r.success).length;
        return {
            success: failedTasks === 0,
            completedTasks,
            failedTasks,
            totalDuration: Date.now() - startTime,
            agentMetrics: new Map(),
        };
    }
    /**
     * Shutdown the swarm
     */
    async shutdown() {
        for (const agent of this.agents.values()) {
            Object.defineProperty(agent, 'status', { value: 'terminated', writable: true });
        }
        this.isInitialized = false;
    }
    /**
     * Reset the swarm state
     */
    reset() {
        this.messages = [];
        this.taskResults = [];
        this.interactionRecorder.clear();
        for (const agent of this.agents.values()) {
            vi.clearAllMocks();
        }
    }
}
//# sourceMappingURL=swarm-instance.js.map