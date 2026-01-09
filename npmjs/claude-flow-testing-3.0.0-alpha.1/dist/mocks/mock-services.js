/**
 * @claude-flow/testing - Mock Services
 *
 * Comprehensive mock implementations of V3 core services.
 * Provides realistic behavior for testing with full state tracking.
 */
import { vi } from 'vitest';
/**
 * Mock AgentDB - Vector database mock with HNSW simulation
 */
export class MockAgentDB {
    vectors = new Map();
    indexConfig = {
        M: 16,
        efConstruction: 200,
        efSearch: 50,
        dimensions: 384,
    };
    // Mock methods for verification
    insert = vi.fn(async (id, embedding, metadata) => {
        if (embedding.length !== this.indexConfig.dimensions) {
            throw new Error(`Invalid embedding dimensions: expected ${this.indexConfig.dimensions}, got ${embedding.length}`);
        }
        this.vectors.set(id, { embedding, metadata: metadata ?? {} });
    });
    search = vi.fn(async (embedding, k, threshold) => {
        const results = [];
        for (const [id, data] of this.vectors) {
            const score = this.cosineSimilarity(embedding, data.embedding);
            if (threshold === undefined || score >= threshold) {
                results.push({ id, score, metadata: data.metadata });
            }
        }
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, k);
    });
    delete = vi.fn(async (id) => {
        this.vectors.delete(id);
    });
    update = vi.fn(async (id, embedding, metadata) => {
        const existing = this.vectors.get(id);
        if (!existing) {
            throw new Error(`Vector not found: ${id}`);
        }
        this.vectors.set(id, { embedding, metadata: metadata ?? existing.metadata });
    });
    getVector = vi.fn(async (id) => {
        return this.vectors.get(id) ?? null;
    });
    getStats = vi.fn(() => ({
        vectorCount: this.vectors.size,
        indexSize: this.vectors.size * this.indexConfig.dimensions * 4, // 4 bytes per float
        dimensions: this.indexConfig.dimensions,
        M: this.indexConfig.M,
        efConstruction: this.indexConfig.efConstruction,
    }));
    rebuildIndex = vi.fn(async () => {
        // Simulate index rebuild
        await new Promise(resolve => setTimeout(resolve, 10));
    });
    clear = vi.fn(() => {
        this.vectors.clear();
    });
    cosineSimilarity(a, b) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    /**
     * Configure the mock index
     */
    configure(config) {
        Object.assign(this.indexConfig, config);
    }
    /**
     * Get all stored vectors (for testing)
     */
    getAllVectors() {
        return new Map(this.vectors);
    }
}
/**
 * Mock Unified Swarm Coordinator
 */
export class MockSwarmCoordinator {
    agents = new Map();
    state = {
        id: `swarm-${Date.now()}`,
        topology: 'hierarchical-mesh',
        status: 'idle',
        agentCount: 0,
        activeAgentCount: 0,
        leaderId: undefined,
        createdAt: new Date(),
    };
    messageQueue = [];
    taskQueue = [];
    initialize = vi.fn(async (config) => {
        this.state = {
            ...this.state,
            topology: config.topology ?? 'hierarchical-mesh',
            status: 'active',
        };
        return this.state;
    });
    shutdown = vi.fn(async (graceful = true) => {
        if (graceful) {
            // Complete pending tasks
            await Promise.all(Array.from(this.agents.values()).map(agent => agent.terminate()));
        }
        this.state.status = 'shutdown';
        this.agents.clear();
    });
    addAgent = vi.fn(async (config) => {
        const id = `agent-${config.type}-${Date.now()}`;
        const agent = new MockSwarmAgent(id, config);
        this.agents.set(id, agent);
        this.state.agentCount++;
        this.state.activeAgentCount++;
        if (config.type === 'queen-coordinator' && !this.state.leaderId) {
            this.state.leaderId = id;
        }
        return agent;
    });
    removeAgent = vi.fn(async (agentId) => {
        const agent = this.agents.get(agentId);
        if (agent) {
            await agent.terminate();
            this.agents.delete(agentId);
            this.state.agentCount--;
            this.state.activeAgentCount--;
            if (this.state.leaderId === agentId) {
                this.electNewLeader();
            }
        }
    });
    coordinate = vi.fn(async (task) => {
        this.taskQueue.push(task);
        // Find suitable agents
        const suitableAgents = Array.from(this.agents.values())
            .filter(agent => agent.canHandle(task.type))
            .sort((a, b) => b.priority - a.priority);
        if (suitableAgents.length === 0) {
            return {
                success: false,
                error: 'No suitable agents available',
                taskId: task.id,
                duration: 0,
            };
        }
        const startTime = Date.now();
        const results = [];
        for (const agent of suitableAgents.slice(0, task.maxAgents ?? 1)) {
            const result = await agent.execute(task);
            results.push(result);
        }
        return {
            success: results.every(r => r.success),
            taskId: task.id,
            duration: Date.now() - startTime,
            results,
        };
    });
    broadcast = vi.fn(async (message) => {
        const fullMessage = {
            ...message,
            id: `msg-${Date.now()}`,
            timestamp: new Date(),
            to: 'broadcast',
        };
        this.messageQueue.push(fullMessage);
        for (const agent of this.agents.values()) {
            await agent.receive(fullMessage);
        }
    });
    sendMessage = vi.fn(async (message) => {
        this.messageQueue.push(message);
        if (message.to === 'broadcast') {
            for (const agent of this.agents.values()) {
                await agent.receive(message);
            }
        }
        else {
            const agent = this.agents.get(message.to);
            if (agent) {
                await agent.receive(message);
            }
        }
    });
    requestConsensus = vi.fn(async (request) => {
        const voters = request.voters ?? Array.from(this.agents.keys());
        const votes = new Map();
        for (const voterId of voters) {
            const agent = this.agents.get(voterId);
            if (agent) {
                // Simulate voting - random selection
                const vote = request.options[Math.floor(Math.random() * request.options.length)];
                votes.set(voterId, vote);
            }
        }
        const voteCounts = new Map();
        for (const vote of votes.values()) {
            const key = JSON.stringify(vote);
            voteCounts.set(key, (voteCounts.get(key) ?? 0) + 1);
        }
        const majority = Math.floor(voters.length / 2) + 1;
        let decision = null;
        let consensus = false;
        for (const [key, count] of voteCounts) {
            if (count >= majority) {
                decision = JSON.parse(key);
                consensus = true;
                break;
            }
        }
        return {
            topic: request.topic,
            decision,
            votes,
            consensus,
            votingDuration: 100,
            participatingAgents: Array.from(votes.keys()),
        };
    });
    getState = vi.fn(() => ({ ...this.state }));
    getAgent = vi.fn((id) => this.agents.get(id));
    getAgents = vi.fn(() => Array.from(this.agents.values()));
    getMessageQueue = vi.fn(() => [...this.messageQueue]);
    getTaskQueue = vi.fn(() => [...this.taskQueue]);
    electNewLeader() {
        const candidates = Array.from(this.agents.values())
            .filter(a => a.config.type === 'queen-coordinator')
            .sort((a, b) => b.priority - a.priority);
        this.state.leaderId = candidates[0]?.id;
    }
    reset() {
        this.agents.clear();
        this.messageQueue = [];
        this.taskQueue = [];
        this.state = {
            id: `swarm-${Date.now()}`,
            topology: 'hierarchical-mesh',
            status: 'idle',
            agentCount: 0,
            activeAgentCount: 0,
            leaderId: undefined,
            createdAt: new Date(),
        };
        vi.clearAllMocks();
    }
}
/**
 * Mock Swarm Agent
 */
export class MockSwarmAgent {
    id;
    config;
    status = 'idle';
    priority;
    messages = [];
    taskResults = [];
    execute = vi.fn();
    receive = vi.fn();
    send = vi.fn();
    terminate = vi.fn();
    constructor(id, config) {
        this.id = id;
        this.config = config;
        this.priority = config.priority ?? 50;
        this.execute.mockImplementation(async (task) => {
            this.status = 'busy';
            await new Promise(resolve => setTimeout(resolve, 10));
            this.status = 'idle';
            const result = {
                taskId: task.id,
                agentId: this.id,
                success: true,
                duration: Math.random() * 100 + 10,
            };
            this.taskResults.push(result);
            return result;
        });
        this.receive.mockImplementation(async (message) => {
            this.messages.push(message);
        });
        this.send.mockImplementation(async () => { });
        this.terminate.mockImplementation(async () => {
            this.status = 'terminated';
        });
    }
    canHandle(taskType) {
        const capabilities = agentCapabilities[this.config.type] ?? [];
        return capabilities.some(cap => cap.includes(taskType) || taskType.includes(cap));
    }
    getMessages() {
        return [...this.messages];
    }
    getTaskResults() {
        return [...this.taskResults];
    }
}
/**
 * Mock Memory Service with caching
 */
export class MockMemoryService {
    store = new Map();
    cache = new Map();
    cacheHits = 0;
    cacheMisses = 0;
    set = vi.fn(async (key, value, metadata) => {
        const expiresAt = metadata?.ttl ? new Date(Date.now() + metadata.ttl) : undefined;
        this.store.set(key, { value, metadata: metadata ?? { type: 'short-term', tags: [] }, expiresAt });
        this.cache.delete(key); // Invalidate cache
    });
    get = vi.fn(async (key) => {
        // Check cache first
        const cached = this.cache.get(key);
        if (cached) {
            this.cacheHits++;
            cached.accessCount++;
            return cached.value;
        }
        this.cacheMisses++;
        const entry = this.store.get(key);
        if (!entry) {
            return null;
        }
        // Check expiration
        if (entry.expiresAt && entry.expiresAt < new Date()) {
            this.store.delete(key);
            return null;
        }
        // Add to cache
        this.cache.set(key, { value: entry.value, accessCount: 1 });
        return entry.value;
    });
    delete = vi.fn(async (key) => {
        this.store.delete(key);
        this.cache.delete(key);
    });
    search = vi.fn(async (query) => {
        // Simulate vector search with filtering
        const results = [];
        for (const [key, entry] of this.store) {
            if (query.filters) {
                const matches = Object.entries(query.filters).every(([k, v]) => entry.metadata[k] === v);
                if (!matches)
                    continue;
            }
            results.push({
                key,
                value: entry.value,
                score: Math.random() * 0.3 + 0.7, // Random score 0.7-1.0
                metadata: entry.metadata,
            });
        }
        return results
            .filter(r => !query.threshold || r.score >= query.threshold)
            .sort((a, b) => b.score - a.score)
            .slice(0, query.topK);
    });
    clear = vi.fn(async () => {
        this.store.clear();
        this.cache.clear();
    });
    getStats = vi.fn(() => ({
        totalEntries: this.store.size,
        cacheSize: this.cache.size,
        cacheHitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
        cacheHits: this.cacheHits,
        cacheMisses: this.cacheMisses,
    }));
    prune = vi.fn(async () => {
        const now = new Date();
        let pruned = 0;
        for (const [key, entry] of this.store) {
            if (entry.expiresAt && entry.expiresAt < now) {
                this.store.delete(key);
                this.cache.delete(key);
                pruned++;
            }
        }
        return pruned;
    });
    reset() {
        this.store.clear();
        this.cache.clear();
        this.cacheHits = 0;
        this.cacheMisses = 0;
        vi.clearAllMocks();
    }
}
/**
 * Mock Event Bus with history tracking
 */
export class MockEventBus {
    subscribers = new Map();
    history = [];
    maxHistorySize = 1000;
    publish = vi.fn(async (event) => {
        this.history.push(event);
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
        const handlers = this.subscribers.get(event.type) ?? new Set();
        const wildcardHandlers = this.subscribers.get('*') ?? new Set();
        const allHandlers = [...handlers, ...wildcardHandlers];
        await Promise.all(allHandlers.map(handler => handler(event)));
    });
    subscribe = vi.fn((eventType, handler) => {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, new Set());
        }
        this.subscribers.get(eventType).add(handler);
        return () => this.unsubscribe(eventType, handler);
    });
    unsubscribe = vi.fn((eventType, handler) => {
        this.subscribers.get(eventType)?.delete(handler);
    });
    getHistory(eventType) {
        if (eventType) {
            return this.history.filter(e => e.type === eventType);
        }
        return [...this.history];
    }
    getSubscriberCount(eventType) {
        return this.subscribers.get(eventType)?.size ?? 0;
    }
    clear() {
        this.history = [];
        vi.clearAllMocks();
    }
    reset() {
        this.subscribers.clear();
        this.history = [];
        vi.clearAllMocks();
    }
}
/**
 * Mock Security Service
 */
export class MockSecurityService {
    blockedPaths = ['../', '~/', '/etc/', '/tmp/', '/var/', '/root/'];
    allowedCommands = ['npm', 'npx', 'node', 'git'];
    tokens = new Map();
    validatePath = vi.fn((path) => {
        return !this.blockedPaths.some(blocked => path.includes(blocked));
    });
    validateInput = vi.fn((input, options) => {
        const errors = [];
        if (options?.maxLength && input.length > options.maxLength) {
            errors.push(`Input exceeds maximum length of ${options.maxLength}`);
        }
        if (options?.allowedChars && !options.allowedChars.test(input)) {
            errors.push('Input contains disallowed characters');
        }
        return {
            valid: errors.length === 0,
            sanitized: options?.sanitize ? this.sanitize(input) : input,
            errors: errors.length > 0 ? errors : undefined,
        };
    });
    hashPassword = vi.fn(async (password) => {
        // Simulate argon2 hash format
        return `$argon2id$v=19$m=65536,t=3,p=4$${Buffer.from(password).toString('base64')}`;
    });
    verifyPassword = vi.fn(async (password, hash) => {
        const parts = hash.split('$');
        if (parts.length < 5)
            return false;
        return Buffer.from(parts[4], 'base64').toString() === password;
    });
    generateToken = vi.fn(async (payload, expiresIn = 3600000) => {
        const token = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        this.tokens.set(token, {
            payload,
            expiresAt: new Date(Date.now() + expiresIn),
        });
        return token;
    });
    verifyToken = vi.fn(async (token) => {
        const entry = this.tokens.get(token);
        if (!entry) {
            throw new Error('Invalid token');
        }
        if (entry.expiresAt < new Date()) {
            this.tokens.delete(token);
            throw new Error('Token expired');
        }
        return entry.payload;
    });
    executeSecurely = vi.fn(async (command, options) => {
        const [cmd] = command.split(' ');
        if (!this.allowedCommands.includes(cmd)) {
            throw new Error(`Command not allowed: ${cmd}`);
        }
        return {
            stdout: '',
            stderr: '',
            exitCode: 0,
            duration: Math.random() * 100,
        };
    });
    sanitize(input) {
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    reset() {
        this.tokens.clear();
        vi.clearAllMocks();
    }
}
// Agent capabilities mapping
const agentCapabilities = {
    'queen-coordinator': ['orchestration', 'coordination', 'task-distribution'],
    'security-architect': ['security', 'design', 'threat-modeling'],
    'security-auditor': ['security', 'audit', 'vulnerability'],
    'memory-specialist': ['memory', 'optimization', 'caching'],
    'swarm-specialist': ['coordination', 'consensus', 'communication'],
    'integration-architect': ['integration', 'api', 'compatibility'],
    'performance-engineer': ['performance', 'optimization', 'benchmarking'],
    'core-architect': ['architecture', 'design', 'domain'],
    'test-architect': ['testing', 'tdd', 'quality'],
    'project-coordinator': ['project', 'planning', 'scheduling'],
    'coder': ['coding', 'implementation', 'debugging'],
    'reviewer': ['review', 'quality', 'suggestions'],
    'tester': ['testing', 'execution', 'coverage'],
    'planner': ['planning', 'estimation', 'roadmap'],
    'researcher': ['research', 'analysis', 'documentation'],
};
/**
 * Create all mock services as a bundle
 */
export function createMockServices() {
    return {
        agentDB: new MockAgentDB(),
        swarmCoordinator: new MockSwarmCoordinator(),
        memoryService: new MockMemoryService(),
        eventBus: new MockEventBus(),
        securityService: new MockSecurityService(),
    };
}
/**
 * Reset all mock services
 */
export function resetMockServices(services) {
    services.agentDB.clear();
    services.swarmCoordinator.reset();
    services.memoryService.reset();
    services.eventBus.reset();
    services.securityService.reset();
}
//# sourceMappingURL=mock-services.js.map