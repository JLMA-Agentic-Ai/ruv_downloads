/**
 * AgentAdapter - Bridge between Claude Flow and agentic-flow Agents
 *
 * Provides bidirectional conversion and delegation patterns between:
 * - Claude Flow v3 DDD agent architecture
 * - agentic-flow's optimized agent implementations
 *
 * This implements ADR-001: Adopt agentic-flow as Core Foundation
 * by providing clean conversion and delegation patterns.
 *
 * Pattern follows existing adapters:
 * - SONAAdapter: Adapts SONA learning capabilities
 * - AttentionCoordinator: Adapts Flash Attention mechanisms
 * - AgentAdapter: Adapts agent lifecycle and execution
 *
 * @module v3/integration/agent-adapter
 * @version 3.0.0-alpha.1
 */
import { EventEmitter } from 'events';
import { AgenticFlowAgent, } from './agentic-flow-agent.js';
/**
 * AgentAdapter - Bridges Claude Flow and agentic-flow agents
 *
 * This adapter provides:
 * 1. Format conversion between agent representations
 * 2. Delegation management for optimized operations
 * 3. Bidirectional synchronization of agent state
 * 4. Fallback handling when agentic-flow is unavailable
 *
 * Usage:
 * ```typescript
 * const adapter = new AgentAdapter({
 *   enableSync: true,
 *   autoConvert: true,
 *   fallbackOnError: true,
 * });
 *
 * await adapter.initialize();
 *
 * // Convert agentic-flow agent to Claude Flow agent
 * const { agent, success } = adapter.fromAgenticFlow(agenticFlowAgent);
 *
 * // Create Claude Flow agent with agentic-flow delegation
 * const delegatedAgent = await adapter.createWithDelegation({
 *   id: 'agent-1',
 *   name: 'Coder',
 *   type: 'coder',
 *   capabilities: ['code-generation'],
 *   maxConcurrentTasks: 3,
 *   priority: 5,
 * });
 * ```
 */
export class AgentAdapter extends EventEmitter {
    config;
    initialized = false;
    agentMap = new Map();
    delegationMap = new Map();
    /**
     * Reference to agentic-flow core for accessing Agent factory
     */
    agenticFlowCore = null;
    constructor(config = {}) {
        super();
        this.config = {
            enableSync: config.enableSync ?? true,
            autoConvert: config.autoConvert ?? true,
            fallbackOnError: config.fallbackOnError ?? true,
            debug: config.debug ?? false,
        };
    }
    /**
     * Initialize the adapter
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        this.emit('initializing');
        try {
            // Attempt to load agentic-flow for delegation
            await this.connectToAgenticFlow();
            this.initialized = true;
            this.emit('initialized', {
                agenticFlowAvailable: this.agenticFlowCore !== null,
            });
        }
        catch (error) {
            this.emit('initialization-failed', { error });
            throw error;
        }
    }
    /**
     * Shutdown the adapter
     */
    async shutdown() {
        // Shutdown all managed agents
        const shutdownPromises = [];
        const agents = this.getAllAgents();
        for (const agent of agents) {
            shutdownPromises.push(agent.shutdown());
        }
        await Promise.allSettled(shutdownPromises);
        this.agentMap.clear();
        this.delegationMap.clear();
        this.initialized = false;
        this.emit('shutdown');
    }
    /**
     * Convert agentic-flow agent to Claude Flow AgenticFlowAgent
     *
     * This method creates a Claude Flow agent wrapper around an existing
     * agentic-flow agent instance, enabling delegation and integration.
     *
     * @param agenticFlowAgent - agentic-flow agent instance
     * @returns Conversion result with wrapped agent
     */
    fromAgenticFlow(agenticFlowAgent) {
        const warnings = [];
        const unmappedFields = [];
        try {
            // Map agentic-flow config to Claude Flow config
            const config = {
                id: agenticFlowAgent.id,
                name: agenticFlowAgent.name,
                type: this.mapAgentType(agenticFlowAgent.type, warnings),
                capabilities: this.extractCapabilities(agenticFlowAgent.config, warnings),
                maxConcurrentTasks: this.extractMaxTasks(agenticFlowAgent.config),
                priority: this.extractPriority(agenticFlowAgent.config),
                enableDelegation: true,
                agenticFlowConfig: agenticFlowAgent.config,
            };
            // Create Claude Flow agent
            const agent = new AgenticFlowAgent(config);
            // Set delegation reference
            agent.setAgenticFlowReference({
                id: agenticFlowAgent.id,
                type: agenticFlowAgent.type,
                status: agenticFlowAgent.status,
                initialize: agenticFlowAgent.initialize?.bind(agenticFlowAgent),
                shutdown: agenticFlowAgent.shutdown?.bind(agenticFlowAgent),
                execute: agenticFlowAgent.execute?.bind(agenticFlowAgent),
                sendMessage: agenticFlowAgent.sendMessage?.bind(agenticFlowAgent),
                getHealth: agenticFlowAgent.getHealth?.bind(agenticFlowAgent),
                getMetrics: agenticFlowAgent.getMetrics?.bind(agenticFlowAgent),
            });
            // Store mapping
            this.agentMap.set(agent.id, agent);
            this.delegationMap.set(agent.id, agenticFlowAgent);
            // Sync status if enabled
            if (this.config.enableSync) {
                this.syncStatus(agent, agenticFlowAgent);
            }
            this.emit('agent-converted', {
                agentId: agent.id,
                direction: 'from-agentic-flow',
                warnings,
            });
            return {
                agent,
                success: true,
                warnings,
                unmappedFields,
            };
        }
        catch (error) {
            warnings.push(`Conversion error: ${error.message}`);
            // Create fallback agent if enabled
            if (this.config.fallbackOnError) {
                const fallbackAgent = new AgenticFlowAgent({
                    id: agenticFlowAgent.id,
                    name: agenticFlowAgent.name,
                    type: 'custom',
                    capabilities: [],
                    maxConcurrentTasks: 1,
                    priority: 0,
                    enableDelegation: false,
                });
                return {
                    agent: fallbackAgent,
                    success: false,
                    warnings,
                    unmappedFields,
                };
            }
            throw error;
        }
    }
    /**
     * Convert Claude Flow AgenticFlowAgent to agentic-flow format
     *
     * This exports the agent configuration in a format compatible with
     * agentic-flow's Agent constructor/factory.
     *
     * @param agent - Claude Flow agent instance
     * @returns agentic-flow compatible configuration
     */
    toAgenticFlow(agent) {
        return {
            id: agent.id,
            name: agent.name,
            type: agent.type,
            status: agent.status,
            config: {
                capabilities: agent.config.capabilities,
                maxConcurrentTasks: agent.config.maxConcurrentTasks,
                priority: agent.config.priority,
                timeout: agent.config.timeout,
                retryPolicy: agent.config.retryPolicy,
                resources: agent.config.resources,
                metadata: agent.config.metadata,
            },
            sessionId: agent.sessionId,
            terminalId: agent.terminalId,
            memoryBankId: agent.memoryBankId,
        };
    }
    /**
     * Create a Claude Flow agent with agentic-flow delegation
     *
     * This is the primary method for creating agents in v3 with
     * automatic delegation to agentic-flow when available.
     *
     * ADR-001: Eliminates duplicate code by delegating to agentic-flow
     * for core agent operations when the package is available.
     *
     * @param config - Agent configuration
     * @returns Initialized agent with delegation enabled
     */
    async createWithDelegation(config) {
        this.ensureInitialized();
        const agent = new AgenticFlowAgent({
            ...config,
            enableDelegation: true,
        });
        // If agentic-flow is available, create delegation reference
        if (this.agenticFlowCore && this.agenticFlowCore.createAgent) {
            try {
                const agenticFlowAgent = await this.agenticFlowCore.createAgent({
                    id: config.id,
                    name: config.name,
                    type: config.type,
                    config: {
                        capabilities: config.capabilities,
                        maxConcurrentTasks: config.maxConcurrentTasks,
                        priority: config.priority,
                    },
                });
                // Set delegation reference
                agent.setAgenticFlowReference({
                    id: agenticFlowAgent.id,
                    type: agenticFlowAgent.type,
                    status: agenticFlowAgent.status,
                    initialize: agenticFlowAgent.initialize?.bind(agenticFlowAgent),
                    shutdown: agenticFlowAgent.shutdown?.bind(agenticFlowAgent),
                    execute: agenticFlowAgent.execute?.bind(agenticFlowAgent),
                    sendMessage: agenticFlowAgent.sendMessage?.bind(agenticFlowAgent),
                    getHealth: agenticFlowAgent.getHealth?.bind(agenticFlowAgent),
                    getMetrics: agenticFlowAgent.getMetrics?.bind(agenticFlowAgent),
                });
                this.delegationMap.set(agent.id, agenticFlowAgent);
                this.emit('agent-created-with-delegation', {
                    agentId: agent.id,
                    delegated: true,
                });
            }
            catch (error) {
                this.emit('delegation-setup-failed', {
                    agentId: agent.id,
                    error: error.message,
                });
                // Continue with local-only agent if fallback enabled
                if (!this.config.fallbackOnError) {
                    throw error;
                }
            }
        }
        // Initialize the agent
        await agent.initialize();
        // Store in map
        this.agentMap.set(agent.id, agent);
        return agent;
    }
    /**
     * Get a managed agent by ID
     */
    getAgent(agentId) {
        return this.agentMap.get(agentId);
    }
    /**
     * Get all managed agents
     */
    getAllAgents() {
        const agents = [];
        this.agentMap.forEach((agent) => {
            agents.push(agent);
        });
        return agents;
    }
    /**
     * Check if an agent is delegated to agentic-flow
     */
    isDelegated(agentId) {
        return this.delegationMap.has(agentId);
    }
    /**
     * Get delegation reference for an agent
     */
    getDelegationReference(agentId) {
        return this.delegationMap.get(agentId);
    }
    /**
     * Remove an agent from management
     */
    async removeAgent(agentId) {
        const agent = this.agentMap.get(agentId);
        if (!agent) {
            return false;
        }
        // Shutdown agent
        await agent.shutdown();
        // Remove from maps
        this.agentMap.delete(agentId);
        this.delegationMap.delete(agentId);
        this.emit('agent-removed', { agentId });
        return true;
    }
    // ===== Private Methods =====
    /**
     * Connect to agentic-flow package dynamically
     */
    async connectToAgenticFlow() {
        try {
            // Dynamic import to handle optional dependency
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const agenticFlowModule = await import('agentic-flow').catch(() => null);
            if (agenticFlowModule && typeof agenticFlowModule.createAgenticFlow === 'function') {
                this.agenticFlowCore = await agenticFlowModule.createAgenticFlow({});
                this.emit('agentic-flow-connected', {
                    version: this.agenticFlowCore.version,
                });
                this.logDebug('Connected to agentic-flow', {
                    version: this.agenticFlowCore.version,
                });
            }
            else {
                this.agenticFlowCore = null;
                this.emit('agentic-flow-unavailable', {
                    reason: 'package not found or incompatible',
                });
                this.logDebug('agentic-flow not available, using local implementations');
            }
        }
        catch (error) {
            this.agenticFlowCore = null;
            this.emit('agentic-flow-connection-failed', {
                error: error.message,
            });
            this.logDebug('agentic-flow connection failed', error);
        }
    }
    /**
     * Map agentic-flow agent type to Claude Flow AgentType
     */
    mapAgentType(type, warnings) {
        // Known valid agent types that pass through directly
        const validTypes = [
            'coder',
            'reviewer',
            'tester',
            'researcher',
            'planner',
            'architect',
            'coordinator',
            'security',
            'performance',
            'custom',
        ];
        const lowercaseType = type.toLowerCase();
        // If it's already a valid type, pass through
        if (validTypes.includes(lowercaseType)) {
            return lowercaseType;
        }
        // Map alternative names to valid types
        const typeMap = {
            'code-generator': 'coder',
            'code-reviewer': 'reviewer',
            'research': 'researcher',
            'planning': 'planner',
            'architecture': 'architect',
            'coordination': 'coordinator',
        };
        const mapped = typeMap[lowercaseType];
        if (mapped) {
            return mapped;
        }
        // Unknown type - generate warning and use as-is
        warnings.push(`Unknown agent type '${type}', using as-is`);
        return type;
    }
    /**
     * Extract capabilities from agentic-flow config
     */
    extractCapabilities(config, warnings) {
        if (Array.isArray(config.capabilities)) {
            return config.capabilities;
        }
        if (Array.isArray(config.skills)) {
            warnings.push("Using 'skills' as capabilities");
            return config.skills;
        }
        return [];
    }
    /**
     * Extract max concurrent tasks from config
     */
    extractMaxTasks(config) {
        if (typeof config.maxConcurrentTasks === 'number') {
            return config.maxConcurrentTasks;
        }
        if (typeof config.maxTasks === 'number') {
            return config.maxTasks;
        }
        return 3; // Default
    }
    /**
     * Extract priority from config
     */
    extractPriority(config) {
        if (typeof config.priority === 'number') {
            return config.priority;
        }
        return 5; // Default
    }
    /**
     * Sync status between Claude Flow and agentic-flow agents
     */
    syncStatus(agent, agenticFlowAgent) {
        // Map agentic-flow status to Claude Flow status
        const statusMap = {
            'initializing': 'spawning',
            'ready': 'idle',
            'active': 'active',
            'working': 'busy',
            'idle': 'idle',
            'busy': 'busy',
            'error': 'error',
            'stopped': 'terminated',
            'terminated': 'terminated',
        };
        const mappedStatus = statusMap[agenticFlowAgent.status.toLowerCase()];
        if (mappedStatus && mappedStatus !== agent.status) {
            agent.status = mappedStatus;
            this.emit('status-synced', {
                agentId: agent.id,
                from: agenticFlowAgent.status,
                to: mappedStatus,
            });
        }
    }
    /**
     * Ensure adapter is initialized
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('AgentAdapter not initialized. Call initialize() first.');
        }
    }
    /**
     * Debug logging
     */
    logDebug(message, data) {
        if (this.config.debug) {
            console.debug(`[AgentAdapter] ${message}`, data || '');
        }
    }
}
/**
 * Create and initialize an AgentAdapter
 */
export async function createAgentAdapter(config) {
    const adapter = new AgentAdapter(config);
    await adapter.initialize();
    return adapter;
}
/**
 * Singleton instance for simple usage
 */
let defaultAdapter = null;
/**
 * Get the default adapter instance (creates if needed)
 */
export async function getDefaultAgentAdapter(config) {
    if (!defaultAdapter) {
        defaultAdapter = new AgentAdapter(config);
        await defaultAdapter.initialize();
    }
    return defaultAdapter;
}
/**
 * Reset the default adapter (useful for testing)
 */
export async function resetDefaultAgentAdapter() {
    if (defaultAdapter) {
        await defaultAdapter.shutdown();
        defaultAdapter = null;
    }
}
//# sourceMappingURL=agent-adapter.js.map