/**
 * SwarmAdapter - Bridge between V3 Swarm and agentic-flow@alpha Patterns
 *
 * Provides bidirectional conversion and delegation patterns between:
 * - Claude Flow v3 UnifiedSwarmCoordinator
 * - agentic-flow's AttentionCoordinator, SwarmTopology, and Expert routing
 *
 * This implements ADR-001: Adopt agentic-flow as Core Foundation
 * by aligning V3 swarm patterns with agentic-flow's coordination mechanisms.
 *
 * Key Alignments:
 * - Topology: mesh, hierarchical, ring, star (maps V3's centralized -> star)
 * - AgentOutput: { agentId, agentType, embedding, value, confidence }
 * - SpecializedAgent: { id, type, specialization, capabilities, load }
 * - Expert routing via MoE attention for task assignment
 * - GraphRoPE for topology-aware coordination
 *
 * @module v3/integration/swarm-adapter
 * @version 3.0.0-alpha.1
 */
import { EventEmitter } from 'events';
/**
 * agentic-flow SwarmTopology types
 * V3's 'centralized' maps to 'star', 'hybrid' is represented as 'mesh' with hierarchical overlay
 */
export type AgenticFlowTopology = 'mesh' | 'hierarchical' | 'ring' | 'star';
/**
 * agentic-flow Attention mechanism types
 */
export type AgenticFlowAttentionMechanism = 'flash' | 'linear' | 'hyperbolic' | 'moe' | 'multi-head';
/**
 * agentic-flow AgentOutput interface
 * This is the expected output format from agents in agentic-flow swarms
 */
export interface AgenticFlowAgentOutput {
    /** Agent identifier */
    agentId: string;
    /** Agent type/role */
    agentType: string;
    /** Embedding vector for the agent's output (semantic representation) */
    embedding: number[] | Float32Array;
    /** The actual value/result produced by the agent */
    value: unknown;
    /** Confidence score for this output (0.0 - 1.0) */
    confidence: number;
    /** Optional metadata */
    metadata?: Record<string, unknown>;
}
/**
 * agentic-flow SpecializedAgent interface
 * Represents an expert agent with specific capabilities
 */
export interface AgenticFlowSpecializedAgent {
    /** Agent identifier */
    id: string;
    /** Agent type */
    type: string;
    /** Specialization area */
    specialization: string;
    /** List of capabilities */
    capabilities: string[];
    /** Current load (0.0 - 1.0) */
    load: number;
    /** Embedding for expert matching */
    embedding?: number[];
    /** Performance score */
    performanceScore?: number;
}
/**
 * agentic-flow Expert routing result
 */
export interface AgenticFlowExpertRoute {
    /** Selected expert IDs */
    selectedExperts: AgenticFlowSpecializedAgent[];
    /** Routing scores for each expert */
    scores: Map<string, number>;
    /** Routing mechanism used */
    mechanism: 'moe' | 'similarity' | 'load-balanced';
    /** Routing latency in ms */
    latencyMs: number;
}
/**
 * agentic-flow Attention coordination result
 */
export interface AgenticFlowAttentionResult {
    /** Consensus output */
    consensus: unknown;
    /** Attention weights for each agent */
    attentionWeights: Map<string, number>;
    /** Top contributing agents */
    topAgents: Array<{
        id: string;
        name: string;
        weight: number;
    }>;
    /** Coordination mechanism used */
    mechanism: AgenticFlowAttentionMechanism;
    /** Execution time in ms */
    executionTimeMs: number;
}
/**
 * GraphRoPE coordination context
 * Topology-aware positional encoding for better coordination
 */
export interface GraphRoPEContext {
    /** Node positions in the topology graph */
    nodePositions: Map<string, number[]>;
    /** Edge weights between nodes */
    edgeWeights: Map<string, Map<string, number>>;
    /** Rotary position encoding dimension */
    ropeDimension: number;
    /** Whether to use relative positions */
    useRelativePositions: boolean;
}
/**
 * V3 Topology types (from @claude-flow/swarm)
 */
export type V3TopologyType = 'mesh' | 'hierarchical' | 'centralized' | 'hybrid';
/**
 * V3 Agent Domain types (from @claude-flow/swarm)
 */
export type V3AgentDomain = 'queen' | 'security' | 'core' | 'integration' | 'support';
/**
 * V3 Agent State interface (simplified from @claude-flow/swarm)
 */
export interface V3AgentState {
    id: {
        id: string;
        swarmId: string;
        type: string;
        instance: number;
    };
    name: string;
    type: string;
    status: string;
    capabilities: {
        codeGeneration: boolean;
        codeReview: boolean;
        testing: boolean;
        documentation: boolean;
        research: boolean;
        analysis: boolean;
        coordination: boolean;
        languages: string[];
        frameworks: string[];
        domains: string[];
        tools: string[];
        maxConcurrentTasks: number;
        reliability: number;
        speed: number;
        quality: number;
    };
    metrics: {
        tasksCompleted: number;
        tasksFailed: number;
        successRate: number;
        averageExecutionTime: number;
        health: number;
    };
    workload: number;
    health: number;
    lastHeartbeat: Date;
    topologyRole?: 'queen' | 'worker' | 'coordinator' | 'peer';
}
/**
 * V3 Task Definition interface (simplified from @claude-flow/swarm)
 */
export interface V3TaskDefinition {
    id: {
        id: string;
        swarmId: string;
        sequence: number;
        priority: string;
    };
    type: string;
    name: string;
    description: string;
    priority: string;
    status: string;
    assignedTo?: {
        id: string;
    };
    metadata: Record<string, unknown>;
}
/**
 * SwarmAdapter configuration options
 */
export interface SwarmAdapterConfig {
    /** Enable attention-based coordination */
    enableAttentionCoordination: boolean;
    /** Enable MoE expert routing */
    enableMoERouting: boolean;
    /** Enable GraphRoPE topology awareness */
    enableGraphRoPE: boolean;
    /** Default attention mechanism */
    defaultAttentionMechanism: AgenticFlowAttentionMechanism;
    /** Number of experts for MoE routing */
    moeTopK: number;
    /** GraphRoPE dimension */
    ropeDimension: number;
    /** Enable delegation to agentic-flow when available */
    enableDelegation: boolean;
    /** Fallback on delegation failure */
    fallbackOnError: boolean;
    /** Debug mode */
    debug: boolean;
}
/**
 * SwarmAdapter - Bridges V3 Swarm with agentic-flow patterns
 *
 * Key Features:
 * - Topology conversion (V3 <-> agentic-flow)
 * - Agent output format conversion
 * - Specialized agent wrapping
 * - MoE expert routing integration
 * - Attention-based consensus coordination
 * - GraphRoPE topology-aware positioning
 *
 * Usage:
 * ```typescript
 * import { SwarmAdapter, createSwarmAdapter } from '@claude-flow/integration';
 *
 * const adapter = await createSwarmAdapter({
 *   enableAttentionCoordination: true,
 *   enableMoERouting: true,
 * });
 *
 * // Convert V3 agents to agentic-flow format
 * const specializedAgents = adapter.toSpecializedAgents(v3Agents);
 *
 * // Route task to experts using MoE
 * const routes = await adapter.routeToExperts(taskEmbedding, specializedAgents);
 *
 * // Coordinate agent outputs with attention
 * const consensus = await adapter.coordinateWithAttention(agentOutputs);
 * ```
 */
export declare class SwarmAdapter extends EventEmitter {
    private config;
    private initialized;
    /**
     * Reference to agentic-flow core for delegation
     */
    private agenticFlowCore;
    /**
     * Reference to agentic-flow AttentionCoordinator
     */
    private attentionCoordinator;
    /**
     * GraphRoPE context for topology-aware coordination
     */
    private graphRoPEContext;
    /**
     * Cached topology mapping
     */
    private topologyCache;
    constructor(config?: Partial<SwarmAdapterConfig>);
    /**
     * Initialize the SwarmAdapter
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the adapter
     */
    shutdown(): Promise<void>;
    /**
     * Convert V3 topology type to agentic-flow topology
     *
     * Mapping:
     * - mesh -> mesh
     * - hierarchical -> hierarchical
     * - centralized -> star (agentic-flow uses 'star' for central coordinator pattern)
     * - hybrid -> mesh (treated as mesh with additional hierarchical overlay)
     */
    convertTopology(v3Topology: V3TopologyType): AgenticFlowTopology;
    /**
     * Convert agentic-flow topology to V3 topology type
     */
    convertTopologyFromAgenticFlow(topology: AgenticFlowTopology): V3TopologyType;
    /**
     * Convert V3 Agent to agentic-flow AgentOutput format
     *
     * Creates the embedding from agent capabilities and produces
     * the standardized AgentOutput interface expected by agentic-flow.
     */
    toAgentOutput(agent: V3AgentState, value: unknown, confidence?: number): AgenticFlowAgentOutput;
    /**
     * Convert V3 Agent to agentic-flow SpecializedAgent format
     *
     * Creates an expert representation suitable for MoE routing
     */
    toSpecializedAgent(agent: V3AgentState): AgenticFlowSpecializedAgent;
    /**
     * Convert multiple V3 agents to SpecializedAgents
     */
    toSpecializedAgents(agents: V3AgentState[]): AgenticFlowSpecializedAgent[];
    /**
     * Convert agentic-flow SpecializedAgent back to partial V3 format
     * (for updates/sync)
     */
    fromSpecializedAgent(specializedAgent: AgenticFlowSpecializedAgent): Partial<V3AgentState>;
    /**
     * Route a task to the best experts using MoE attention
     *
     * Implements agentic-flow's expert routing pattern for task assignment.
     * Uses cosine similarity with load balancing for optimal routing.
     */
    routeToExperts(taskEmbedding: number[], experts: AgenticFlowSpecializedAgent[], topK?: number): Promise<AgenticFlowExpertRoute>;
    /**
     * Coordinate agent outputs using attention mechanisms
     *
     * Implements agentic-flow's attention-based consensus pattern
     * for multi-agent coordination.
     */
    coordinateWithAttention(agentOutputs: AgenticFlowAgentOutput[], mechanism?: AgenticFlowAttentionMechanism): Promise<AgenticFlowAttentionResult>;
    /**
     * Update GraphRoPE context with current topology
     *
     * Creates positional encodings based on agent positions
     * in the swarm topology graph.
     */
    updateGraphRoPEContext(agents: V3AgentState[], edges: Array<{
        from: string;
        to: string;
        weight: number;
    }>): void;
    /**
     * Get topology-aware embedding for an agent
     *
     * Combines agent's base embedding with positional encoding
     * from the topology graph.
     */
    getTopologyAwareEmbedding(agent: V3AgentState, baseEmbedding?: number[]): number[];
    /**
     * Map V3 domain to agentic-flow specialization
     */
    mapDomainToSpecialization(domain: V3AgentDomain): string;
    /**
     * Map agentic-flow specialization to V3 domain
     */
    mapSpecializationToDomain(specialization: string): V3AgentDomain;
    /**
     * Check if delegation to agentic-flow is available
     */
    isDelegationAvailable(): boolean;
    /**
     * Get adapter configuration
     */
    getConfig(): SwarmAdapterConfig;
    /**
     * Reconfigure the adapter
     */
    reconfigure(config: Partial<SwarmAdapterConfig>): Promise<void>;
    private connectToAgenticFlow;
    private generateAgentEmbedding;
    private determineSpecialization;
    private collectCapabilities;
    private inferDomain;
    private extractTopAgents;
    private cosineSimilarity;
    private simpleHash;
    private generatePositionalEncoding;
    private applyRoPE;
    private ensureInitialized;
    private logDebug;
}
/**
 * Create and initialize a SwarmAdapter
 */
export declare function createSwarmAdapter(config?: Partial<SwarmAdapterConfig>): Promise<SwarmAdapter>;
/**
 * Get the default adapter instance (creates if needed)
 */
export declare function getDefaultSwarmAdapter(config?: Partial<SwarmAdapterConfig>): Promise<SwarmAdapter>;
/**
 * Reset the default adapter (useful for testing)
 */
export declare function resetDefaultSwarmAdapter(): Promise<void>;
export default SwarmAdapter;
//# sourceMappingURL=swarm-adapter.d.ts.map