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
import { AgenticFlowAgent, AgentConfig } from './agentic-flow-agent.js';
/**
 * Interface for agentic-flow Agent (external package)
 * This represents the expected API from agentic-flow's Agent class
 */
interface AgenticFlowAgent_External {
    id: string;
    type: string;
    name: string;
    status: string;
    config: Record<string, unknown>;
    initialize?(): Promise<void>;
    shutdown?(): Promise<void>;
    execute?(task: unknown): Promise<unknown>;
    sendMessage?(to: string, message: unknown): Promise<void>;
    receiveMessage?(message: unknown): Promise<void>;
    getHealth?(): Promise<unknown>;
    getMetrics?(): Promise<{
        tasksCompleted: number;
        tasksFailed: number;
        avgLatency: number;
        uptime: number;
    }>;
    getStatus?(): string;
}
/**
 * Adapter configuration
 */
export interface AgentAdapterConfig {
    /** Enable bidirectional sync with agentic-flow */
    enableSync: boolean;
    /** Auto-convert agent formats */
    autoConvert: boolean;
    /** Fallback to local on delegation failure */
    fallbackOnError: boolean;
    /** Debug mode */
    debug: boolean;
}
/**
 * Agent conversion result
 */
export interface AgentConversionResult {
    /** Converted agent */
    agent: AgenticFlowAgent;
    /** Conversion success */
    success: boolean;
    /** Conversion warnings */
    warnings: string[];
    /** Fields that couldn't be mapped */
    unmappedFields: string[];
}
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
export declare class AgentAdapter extends EventEmitter {
    private config;
    private initialized;
    private agentMap;
    private delegationMap;
    /**
     * Reference to agentic-flow core for accessing Agent factory
     */
    private agenticFlowCore;
    constructor(config?: Partial<AgentAdapterConfig>);
    /**
     * Initialize the adapter
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the adapter
     */
    shutdown(): Promise<void>;
    /**
     * Convert agentic-flow agent to Claude Flow AgenticFlowAgent
     *
     * This method creates a Claude Flow agent wrapper around an existing
     * agentic-flow agent instance, enabling delegation and integration.
     *
     * @param agenticFlowAgent - agentic-flow agent instance
     * @returns Conversion result with wrapped agent
     */
    fromAgenticFlow(agenticFlowAgent: AgenticFlowAgent_External): AgentConversionResult;
    /**
     * Convert Claude Flow AgenticFlowAgent to agentic-flow format
     *
     * This exports the agent configuration in a format compatible with
     * agentic-flow's Agent constructor/factory.
     *
     * @param agent - Claude Flow agent instance
     * @returns agentic-flow compatible configuration
     */
    toAgenticFlow(agent: AgenticFlowAgent): Record<string, unknown>;
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
    createWithDelegation(config: AgentConfig): Promise<AgenticFlowAgent>;
    /**
     * Get a managed agent by ID
     */
    getAgent(agentId: string): AgenticFlowAgent | undefined;
    /**
     * Get all managed agents
     */
    getAllAgents(): AgenticFlowAgent[];
    /**
     * Check if an agent is delegated to agentic-flow
     */
    isDelegated(agentId: string): boolean;
    /**
     * Get delegation reference for an agent
     */
    getDelegationReference(agentId: string): AgenticFlowAgent_External | undefined;
    /**
     * Remove an agent from management
     */
    removeAgent(agentId: string): Promise<boolean>;
    /**
     * Connect to agentic-flow package dynamically
     */
    private connectToAgenticFlow;
    /**
     * Map agentic-flow agent type to Claude Flow AgentType
     */
    private mapAgentType;
    /**
     * Extract capabilities from agentic-flow config
     */
    private extractCapabilities;
    /**
     * Extract max concurrent tasks from config
     */
    private extractMaxTasks;
    /**
     * Extract priority from config
     */
    private extractPriority;
    /**
     * Sync status between Claude Flow and agentic-flow agents
     */
    private syncStatus;
    /**
     * Ensure adapter is initialized
     */
    private ensureInitialized;
    /**
     * Debug logging
     */
    private logDebug;
}
/**
 * Create and initialize an AgentAdapter
 */
export declare function createAgentAdapter(config?: Partial<AgentAdapterConfig>): Promise<AgentAdapter>;
/**
 * Get the default adapter instance (creates if needed)
 */
export declare function getDefaultAgentAdapter(config?: Partial<AgentAdapterConfig>): Promise<AgentAdapter>;
/**
 * Reset the default adapter (useful for testing)
 */
export declare function resetDefaultAgentAdapter(): Promise<void>;
export {};
//# sourceMappingURL=agent-adapter.d.ts.map