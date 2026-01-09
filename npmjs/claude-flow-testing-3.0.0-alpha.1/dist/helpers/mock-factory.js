/**
 * @claude-flow/testing - Mock Factory
 *
 * Factory functions for creating comprehensive mocks of V3 services and components.
 * Implements London School TDD patterns with behavior verification.
 */
import { vi } from 'vitest';
import { createMock } from './create-mock.js';
/**
 * Create mock event bus with behavior tracking
 */
export function createMockEventBus() {
    const publishedEvents = [];
    const subscribers = new Map();
    const mock = createMock();
    mock.publish.mockImplementation(async (event) => {
        publishedEvents.push(event);
        const handlers = subscribers.get(event.type);
        if (handlers) {
            for (const handler of handlers) {
                await handler(event);
            }
        }
    });
    mock.subscribe.mockImplementation((eventType, handler) => {
        if (!subscribers.has(eventType)) {
            subscribers.set(eventType, new Set());
        }
        subscribers.get(eventType).add(handler);
        return () => subscribers.get(eventType)?.delete(handler);
    });
    mock.unsubscribe.mockImplementation((eventType, handler) => {
        subscribers.get(eventType)?.delete(handler);
    });
    mock.getSubscriberCount.mockImplementation((eventType) => {
        return subscribers.get(eventType)?.size ?? 0;
    });
    return Object.assign(mock, { publishedEvents });
}
/**
 * Create mock task manager with realistic behavior
 */
export function createMockTaskManager() {
    const tasks = new Map();
    let taskCounter = 0;
    const mock = createMock();
    mock.create.mockImplementation(async (definition) => {
        const task = {
            id: `task-${++taskCounter}`,
            name: definition.name,
            type: definition.type,
            status: 'pending',
            payload: definition.payload,
            priority: definition.priority ?? 50,
            createdAt: new Date(),
        };
        tasks.set(task.id, task);
        return task;
    });
    mock.execute.mockImplementation(async (taskId) => {
        const task = tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }
        task.status = 'running';
        task.startedAt = new Date();
        // Simulate execution
        await new Promise(resolve => setTimeout(resolve, 10));
        task.status = 'completed';
        task.completedAt = new Date();
        return {
            taskId,
            success: true,
            duration: task.completedAt.getTime() - task.startedAt.getTime(),
        };
    });
    mock.cancel.mockImplementation(async (taskId) => {
        const task = tasks.get(taskId);
        if (task) {
            task.status = 'cancelled';
        }
    });
    mock.getStatus.mockImplementation(async (taskId) => {
        const task = tasks.get(taskId);
        return task?.status ?? 'pending';
    });
    mock.getTask.mockImplementation(async (taskId) => {
        return tasks.get(taskId) ?? null;
    });
    mock.listTasks.mockImplementation(async (filters) => {
        let result = Array.from(tasks.values());
        if (filters?.status) {
            result = result.filter(t => t.status === filters.status);
        }
        if (filters?.type) {
            result = result.filter(t => t.type === filters.type);
        }
        if (filters?.limit) {
            result = result.slice(filters.offset ?? 0, (filters.offset ?? 0) + filters.limit);
        }
        return result;
    });
    return Object.assign(mock, { tasks });
}
/**
 * Create mock agent lifecycle
 */
export function createMockAgentLifecycle() {
    const agents = new Map();
    let agentCounter = 0;
    const mock = createMock();
    mock.spawn.mockImplementation(async (config) => {
        const agent = {
            id: `agent-${config.type}-${++agentCounter}`,
            type: config.type,
            name: config.name,
            status: 'idle',
            capabilities: config.capabilities ?? [],
            createdAt: new Date(),
        };
        agents.set(agent.id, agent);
        return {
            agent,
            sessionId: `session-${Date.now()}`,
            startupTime: Math.random() * 100 + 50,
            success: true,
        };
    });
    mock.terminate.mockImplementation(async (agentId) => {
        const agent = agents.get(agentId);
        if (agent) {
            agent.status = 'terminated';
        }
    });
    mock.getAgent.mockImplementation(async (agentId) => {
        return agents.get(agentId) ?? null;
    });
    mock.listAgents.mockImplementation(async (filters) => {
        let result = Array.from(agents.values());
        if (filters?.type) {
            result = result.filter(a => a.type === filters.type);
        }
        if (filters?.status) {
            result = result.filter(a => a.status === filters.status);
        }
        if (filters?.capability) {
            result = result.filter(a => a.capabilities.includes(filters.capability));
        }
        return result;
    });
    mock.getMetrics.mockImplementation(async () => ({
        tasksCompleted: Math.floor(Math.random() * 100),
        tasksFailed: Math.floor(Math.random() * 10),
        avgTaskDuration: Math.random() * 1000,
        totalDuration: Math.random() * 10000,
        errorRate: Math.random() * 0.1,
        memoryUsageMb: Math.random() * 256,
    }));
    mock.healthCheck.mockImplementation(async (agentId) => {
        const agent = agents.get(agentId);
        return {
            healthy: agent?.status !== 'error' && agent?.status !== 'terminated',
            lastActivity: new Date(),
            metrics: {
                tasksCompleted: 50,
                tasksFailed: 1,
                avgTaskDuration: 200,
                totalDuration: 10000,
                errorRate: 0.02,
                memoryUsageMb: 128,
            },
        };
    });
    return Object.assign(mock, { agents });
}
/**
 * Create mock memory service
 */
export function createMockMemoryService() {
    const entries = new Map();
    const mock = createMock();
    mock.store.mockImplementation(async (key, value, metadata) => {
        entries.set(key, { value, metadata });
    });
    mock.retrieve.mockImplementation(async (key) => {
        return entries.get(key)?.value ?? null;
    });
    mock.search.mockImplementation(async () => []);
    mock.delete.mockImplementation(async (key) => {
        entries.delete(key);
    });
    mock.clear.mockImplementation(async () => {
        entries.clear();
    });
    mock.getStats.mockImplementation(async () => ({
        totalEntries: entries.size,
        totalSizeBytes: entries.size * 100,
        vectorCount: 0,
        cacheHitRate: 0.85,
    }));
    mock.createIndex.mockResolvedValue(undefined);
    return Object.assign(mock, { entries });
}
/**
 * Create mock security service
 */
export function createMockSecurityService() {
    const mock = createMock();
    mock.validatePath.mockImplementation((path) => {
        const blocked = ['../', '~/', '/etc/', '/tmp/', '/var/'];
        return !blocked.some(pattern => path.includes(pattern));
    });
    mock.validateInput.mockImplementation((input, options) => {
        const maxLength = options?.maxLength ?? 10000;
        if (input.length > maxLength) {
            return { valid: false, errors: [`Input exceeds maximum length of ${maxLength}`] };
        }
        return { valid: true };
    });
    mock.hashPassword.mockImplementation(async (password) => {
        return `hashed:${Buffer.from(password).toString('base64')}`;
    });
    mock.verifyPassword.mockImplementation(async (password, hash) => {
        return hash === `hashed:${Buffer.from(password).toString('base64')}`;
    });
    mock.generateToken.mockImplementation(async (payload) => {
        return `token:${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
    });
    mock.verifyToken.mockImplementation(async (token) => {
        if (!token.startsWith('token:')) {
            throw new Error('Invalid token');
        }
        return JSON.parse(Buffer.from(token.slice(6), 'base64').toString());
    });
    mock.executeSecurely.mockImplementation(async () => ({
        stdout: '',
        stderr: '',
        exitCode: 0,
        duration: 100,
    }));
    return mock;
}
/**
 * Create mock swarm coordinator
 */
export function createMockSwarmCoordinator() {
    const state = {
        id: 'swarm-test',
        topology: 'hierarchical-mesh',
        status: 'active',
        agentCount: 0,
        activeAgentCount: 0,
        createdAt: new Date(),
    };
    const mock = createMock();
    mock.initialize.mockImplementation(async (config) => {
        state.topology = config.topology;
        state.status = 'active';
        return state;
    });
    mock.coordinate.mockImplementation(async (agents, task) => ({
        success: true,
        completedTasks: 1,
        failedTasks: 0,
        totalDuration: 1000,
        agentMetrics: new Map(),
    }));
    mock.shutdown.mockImplementation(async () => {
        state.status = 'shutdown';
        state.activeAgentCount = 0;
    });
    mock.getState.mockImplementation(() => state);
    mock.addAgent.mockImplementation(async () => {
        state.agentCount++;
        state.activeAgentCount++;
    });
    mock.removeAgent.mockImplementation(async () => {
        state.agentCount--;
        state.activeAgentCount--;
    });
    mock.broadcast.mockResolvedValue(undefined);
    return Object.assign(mock, { state });
}
/**
 * Create mock MCP client
 */
export function createMockMCPClient() {
    let connected = false;
    const mock = createMock();
    mock.connect.mockImplementation(async () => {
        connected = true;
    });
    mock.disconnect.mockImplementation(async () => {
        connected = false;
    });
    mock.callTool.mockImplementation(async () => ({
        content: [{ type: 'text', text: 'Success' }],
    }));
    mock.listTools.mockResolvedValue([]);
    mock.isConnected.mockImplementation(() => connected);
    mock.getSession.mockReturnValue(null);
    return Object.assign(mock, { connected });
}
/**
 * Create mock logger with captured logs
 */
export function createMockLogger() {
    const logs = [];
    const mock = createMock();
    mock.debug.mockImplementation((message, context) => {
        logs.push({ level: 'debug', message, context });
    });
    mock.info.mockImplementation((message, context) => {
        logs.push({ level: 'info', message, context });
    });
    mock.warn.mockImplementation((message, context) => {
        logs.push({ level: 'warn', message, context });
    });
    mock.error.mockImplementation((message, error, context) => {
        logs.push({ level: 'error', message, context, error });
    });
    return Object.assign(mock, { logs });
}
/**
 * Create a complete test application with all mock services
 */
export function createMockApplication() {
    return {
        eventBus: createMockEventBus(),
        taskManager: createMockTaskManager(),
        agentLifecycle: createMockAgentLifecycle(),
        memoryService: createMockMemoryService(),
        securityService: createMockSecurityService(),
        swarmCoordinator: createMockSwarmCoordinator(),
        mcpClient: createMockMCPClient(),
        logger: createMockLogger(),
    };
}
/**
 * Reset all mocks in the application
 */
export function resetMockApplication(app) {
    vi.clearAllMocks();
    app.eventBus.publishedEvents.length = 0;
    app.taskManager.tasks.clear();
    app.agentLifecycle.agents.clear();
    app.memoryService.entries.clear();
    app.logger.logs.length = 0;
}
//# sourceMappingURL=mock-factory.js.map