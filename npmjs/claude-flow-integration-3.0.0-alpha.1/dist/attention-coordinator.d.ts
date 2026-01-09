/**
 * Attention Coordinator for Flash Attention Integration
 *
 * Provides integration with agentic-flow's attention mechanisms,
 * including Flash Attention for 2.49x-7.47x speedup with
 * 50-75% memory reduction.
 *
 * Supported Mechanisms:
 * - Flash Attention (fastest, recommended)
 * - Multi-Head Attention (standard)
 * - Linear Attention (long sequences)
 * - Hyperbolic Attention (hierarchical data)
 * - MoE Attention (Mixture of Experts)
 * - Local/Global Attention
 * - Sparse Attention
 *
 * @module v3/integration/attention-coordinator
 * @version 3.0.0-alpha.1
 */
import { EventEmitter } from 'events';
import type { AttentionConfiguration, AttentionMechanism, AttentionResult, AttentionMetrics } from './types.js';
/**
 * Interface for agentic-flow Attention reference (for delegation)
 * This allows the coordinator to delegate to agentic-flow when available
 */
interface AgenticFlowAttentionReference {
    compute(params: {
        query: number[] | Float32Array;
        key: number[] | Float32Array;
        value: number[] | Float32Array;
        mask?: boolean[];
        mechanism?: string;
    }): Promise<{
        output: number[];
        latencyMs: number;
        memoryBytes: number;
        mechanism: string;
    }>;
    setMechanism(mechanism: string): Promise<void>;
    getMetrics(): Promise<{
        avgLatencyMs: number;
        throughputTps: number;
        memoryEfficiency: number;
        speedupFactor: number;
    }>;
}
/**
 * AttentionCoordinator - Flash Attention Integration
 *
 * This coordinator manages attention mechanism selection and execution,
 * providing optimized attention computation with automatic fallback
 * and performance monitoring.
 */
export declare class AttentionCoordinator extends EventEmitter {
    private config;
    private initialized;
    private metrics;
    private operationCount;
    private totalLatencyMs;
    private cacheHits;
    private cache;
    private maxCacheSize;
    /**
     * Reference to agentic-flow Attention for delegation (ADR-001)
     * When set, performAttention delegates to native Flash Attention
     */
    private agenticFlowAttention;
    /**
     * Indicates if delegation to agentic-flow is active
     */
    private delegationEnabled;
    constructor(config?: Partial<AttentionConfiguration>);
    /**
     * Set reference to agentic-flow Attention for delegation
     *
     * This implements ADR-001: Adopt agentic-flow as Core Foundation
     * When a reference is provided, attention computation for sequences
     * longer than 512 tokens delegates to agentic-flow's optimized
     * Flash Attention implementation for 2.49x-7.47x speedup.
     *
     * @param attentionRef - The agentic-flow Attention interface reference
     */
    setAgenticFlowReference(attentionRef: AgenticFlowAttentionReference): void;
    /**
     * Check if delegation to agentic-flow is enabled
     */
    isDelegationEnabled(): boolean;
    /**
     * Initialize the attention coordinator
     */
    initialize(): Promise<void>;
    /**
     * Reconfigure the coordinator
     */
    reconfigure(config: Partial<AttentionConfiguration>): Promise<void>;
    /**
     * Get current mechanism
     */
    getMechanism(): AttentionMechanism;
    /**
     * Set attention mechanism
     */
    setMechanism(mechanism: AttentionMechanism): Promise<void>;
    /**
     * Compute attention using current mechanism
     */
    compute(params: {
        query: number[] | Float32Array;
        key: number[] | Float32Array;
        value: number[] | Float32Array;
        mask?: boolean[];
        useCache?: boolean;
    }): Promise<AttentionResult>;
    /**
     * Coordinate agent outputs using attention-based consensus
     *
     * This method uses attention mechanisms to weight and combine
     * multiple agent outputs into a consensus result.
     */
    coordinateAgents<T>(params: {
        outputs: T[];
        embeddings: number[][];
        mechanism?: AttentionMechanism;
        topK?: number;
    }): Promise<{
        consensus: T;
        weights: number[];
        confidence: number;
    }>;
    /**
     * Route to experts using MoE attention
     */
    routeToExperts<T>(params: {
        task: {
            embedding: number[];
        };
        experts: Array<{
            id: string;
            embedding: number[];
        }>;
        topK?: number;
    }): Promise<Array<{
        expertId: string;
        score: number;
    }>>;
    /**
     * Get attention metrics
     */
    getMetrics(): Promise<AttentionMetrics>;
    /**
     * Get mechanism profile
     */
    getMechanismProfile(mechanism?: AttentionMechanism): {
        speedupRange: [number, number];
        memoryReduction: number;
        latencyMs: [number, number];
        bestFor: string[];
    };
    /**
     * Suggest optimal mechanism for use case
     */
    suggestMechanism(useCase: string): AttentionMechanism;
    /**
     * Clear the attention cache
     */
    clearCache(): void;
    /**
     * Shutdown the coordinator
     */
    shutdown(): Promise<void>;
    private mergeConfig;
    private initializeMetrics;
    private validateConfig;
    private prewarmCache;
    /**
     * Perform attention computation
     *
     * ADR-001: For sequences longer than 512 tokens, delegates to
     * agentic-flow's native Flash Attention for 2.49x-7.47x speedup
     * and 50-75% memory reduction.
     */
    private performAttention;
    private computeCacheKey;
    private simpleHash;
    private updateCache;
    private updateMetrics;
    private estimateMemoryUsage;
    private dotProduct;
    private cosineSimilarity;
    private ensureInitialized;
}
/**
 * Create and initialize an AttentionCoordinator
 */
export declare function createAttentionCoordinator(config?: Partial<AttentionConfiguration>): Promise<AttentionCoordinator>;
export {};
//# sourceMappingURL=attention-coordinator.d.ts.map