/**
 * Attention Coordinator
 *
 * Implements attention-based coordination mechanisms from agentic-flow@alpha:
 * - multi-head: Standard multi-head attention
 * - flash: 2.49x-7.47x speedup, 75% memory reduction
 * - linear: For long sequences
 * - hyperbolic: Hierarchical data
 * - moe: Mixture of Experts routing
 * - graph-rope: Graph-aware positional embeddings
 *
 * Performance Targets:
 * - Flash Attention: 2.49x-7.47x speedup
 * - Memory Reduction: 50-75%
 * - MoE Routing: <5ms
 *
 * @module v3/swarm/attention-coordinator
 */
import { EventEmitter } from 'events';
/**
 * Attention mechanism types
 */
export type AttentionType = 'multi-head' | 'flash' | 'linear' | 'hyperbolic' | 'moe' | 'graph-rope';
/**
 * Agent output for coordination
 */
export interface AgentOutput {
    agentId: string;
    content: string | Record<string, unknown>;
    embedding?: Float32Array | number[];
    confidence?: number;
    tokens?: number;
    metadata?: Record<string, unknown>;
}
/**
 * Task for routing
 */
export interface Task {
    id: string;
    type: string;
    content: string;
    embedding?: Float32Array | number[];
    priority?: number;
    metadata?: Record<string, unknown>;
}
/**
 * Specialized agent for MoE routing
 */
export interface SpecializedAgent {
    id: string;
    name: string;
    expertise: string[];
    embedding: Float32Array | number[];
    capacity: number;
    currentLoad: number;
}
/**
 * Swarm topology for GraphRoPE
 */
export interface SwarmTopology {
    type: 'mesh' | 'hierarchical' | 'star' | 'ring';
    nodes: string[];
    edges: Array<{
        from: string;
        to: string;
        weight?: number;
    }>;
}
/**
 * Graph context for topology-aware coordination
 */
export interface GraphContext {
    adjacencyMatrix?: number[][];
    nodeFeatures?: number[][];
    edgeWeights?: number[];
}
/**
 * Coordination result
 */
export interface CoordinationResult {
    success: boolean;
    mechanism: AttentionType;
    consensusOutput: string | Record<string, unknown>;
    attentionWeights?: number[];
    confidence: number;
    latency: number;
    memoryUsed?: number;
    participatingAgents: string[];
    metadata?: Record<string, unknown>;
}
/**
 * Expert routing result
 */
export interface ExpertRoutingResult {
    success: boolean;
    selectedExperts: Array<{
        agentId: string;
        name: string;
        score: number;
        assignedTokens?: number;
    }>;
    routingLatency: number;
    loadBalanced: boolean;
}
/**
 * Attention coordinator configuration
 */
export interface AttentionCoordinatorConfig {
    defaultMechanism: AttentionType;
    flashAttention: {
        blockSize: number;
        causal: boolean;
    };
    moe: {
        topK: number;
        capacityFactor: number;
        loadBalancingLoss: boolean;
    };
    hyperbolic: {
        curvature: number;
        dimension: number;
    };
    graphRope: {
        maxDistance: number;
        distanceScale: number;
    };
}
/**
 * AttentionCoordinator
 *
 * Coordinates multiple agents using various attention mechanisms for
 * consensus building and task routing.
 */
export declare class AttentionCoordinator extends EventEmitter {
    private config;
    private performanceStats;
    constructor(config?: Partial<AttentionCoordinatorConfig>);
    /**
     * Coordinate agents using specified attention mechanism
     *
     * @param agentOutputs - Outputs from multiple agents
     * @param mechanism - Attention mechanism to use
     * @returns Coordination result with consensus
     */
    coordinateAgents(agentOutputs: AgentOutput[], mechanism?: AttentionType): Promise<CoordinationResult>;
    /**
     * Route task to specialized experts using MoE
     *
     * @param task - Task to route
     * @param agents - Available specialized agents
     * @param topK - Number of experts to select
     * @returns Routing result with selected experts
     */
    routeToExperts(task: Task, agents: SpecializedAgent[], topK?: number): Promise<ExpertRoutingResult>;
    /**
     * Topology-aware coordination using GraphRoPE
     *
     * @param agentOutputs - Agent outputs
     * @param topology - Swarm topology
     * @param graphContext - Optional graph context
     * @returns Coordination result
     */
    topologyAwareCoordination(agentOutputs: AgentOutput[], topology: SwarmTopology, graphContext?: GraphContext): Promise<CoordinationResult>;
    /**
     * Hierarchical coordination for queen-worker swarms
     *
     * @param queenOutputs - Outputs from queen agents
     * @param workerOutputs - Outputs from worker agents
     * @param curvature - Hyperbolic curvature (default: -1)
     * @returns Coordination result
     */
    hierarchicalCoordination(queenOutputs: AgentOutput[], workerOutputs: AgentOutput[], curvature?: number): Promise<CoordinationResult>;
    /**
     * Flash Attention - 2.49x-7.47x speedup
     */
    private flashAttentionCoordination;
    /**
     * Standard Multi-Head Attention
     */
    private multiHeadAttentionCoordination;
    /**
     * Linear Attention for long sequences
     */
    private linearAttentionCoordination;
    /**
     * Hyperbolic Attention for hierarchical data
     */
    private hyperbolicAttentionCoordination;
    /**
     * Mixture of Experts coordination
     */
    private moeCoordination;
    /**
     * Graph-aware RoPE coordination
     */
    private graphRopeCoordination;
    private graphRopeCoordinationWithPositions;
    private computeAttentionScore;
    private getOrCreateEmbedding;
    private computeWeightedConsensus;
    private computeConfidence;
    private calculateExpertScores;
    private selectTopKExperts;
    private buildGraphPositionEncodings;
    private computeRotaryEncoding;
    private updateStats;
    getPerformanceStats(): typeof this.performanceStats;
    getConfig(): AttentionCoordinatorConfig;
}
export declare function createAttentionCoordinator(config?: Partial<AttentionCoordinatorConfig>): AttentionCoordinator;
export default AttentionCoordinator;
//# sourceMappingURL=attention-coordinator.d.ts.map