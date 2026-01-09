/**
 * SONA (Self-Optimizing Neural Architecture) Adapter
 *
 * Provides integration with agentic-flow's SONA learning system,
 * enabling real-time adaptation, pattern recognition, and
 * continuous learning capabilities.
 *
 * Performance Targets:
 * - Real-time mode: ~0.05ms adaptation
 * - Balanced mode: General purpose learning
 * - Research mode: Deep exploration with higher accuracy
 *
 * @module v3/integration/sona-adapter
 * @version 3.0.0-alpha.1
 */
import { EventEmitter } from 'events';
import type { SONAConfiguration, SONALearningMode, SONATrajectory, SONAPattern, SONALearningStats } from './types.js';
/**
 * Interface for agentic-flow SONA reference (for delegation)
 * This allows the adapter to delegate to agentic-flow when available
 */
interface AgenticFlowSONAReference {
    setMode(mode: string): Promise<void>;
    storePattern(params: {
        pattern: string;
        solution: string;
        category: string;
        confidence: number;
        metadata?: Record<string, unknown>;
    }): Promise<string>;
    findPatterns(query: string, options?: {
        category?: string;
        topK?: number;
        threshold?: number;
    }): Promise<Array<{
        id: string;
        pattern: string;
        solution: string;
        category: string;
        confidence: number;
        usageCount: number;
        createdAt: number;
        lastUsedAt: number;
        metadata: Record<string, unknown>;
    }>>;
    getStats(): Promise<unknown>;
    beginTrajectory?(params: unknown): Promise<string>;
    recordStep?(params: unknown): Promise<void>;
    endTrajectory?(params: unknown): Promise<unknown>;
}
/**
 * SONAAdapter - SONA Learning System Integration
 *
 * This adapter provides a clean interface to agentic-flow's SONA
 * learning capabilities, including:
 * - Learning mode selection and auto-switching
 * - Trajectory tracking for experience replay
 * - Pattern storage and retrieval
 * - Memory distillation and consolidation
 */
export declare class SONAAdapter extends EventEmitter {
    private config;
    private initialized;
    private activeTrajectories;
    private patterns;
    private stats;
    private consolidationTimer;
    private learningCycleCount;
    /**
     * Reference to agentic-flow SONA for delegation (ADR-001)
     * When set, methods delegate to agentic-flow instead of local implementation
     */
    private agenticFlowSona;
    /**
     * Indicates if delegation to agentic-flow is active
     */
    private delegationEnabled;
    constructor(config?: Partial<SONAConfiguration>);
    /**
     * Set reference to agentic-flow SONA for delegation
     *
     * This implements ADR-001: Adopt agentic-flow as Core Foundation
     * When a reference is provided, pattern storage and retrieval
     * delegate to agentic-flow's optimized implementations.
     *
     * @param sonaRef - The agentic-flow SONA interface reference
     */
    setAgenticFlowReference(sonaRef: AgenticFlowSONAReference): void;
    /**
     * Check if delegation to agentic-flow is enabled
     */
    isDelegationEnabled(): boolean;
    /**
     * Initialize the SONA adapter
     */
    initialize(): Promise<void>;
    /**
     * Reconfigure the adapter
     */
    reconfigure(config: Partial<SONAConfiguration>): Promise<void>;
    /**
     * Get current learning mode
     */
    getMode(): SONALearningMode;
    /**
     * Set learning mode
     */
    setMode(mode: SONALearningMode): Promise<void>;
    /**
     * Begin a new trajectory for task tracking
     */
    beginTrajectory(params: {
        taskId: string;
        description?: string;
        category?: string;
        metadata?: Record<string, unknown>;
    }): Promise<string>;
    /**
     * Record a step in an active trajectory
     */
    recordTrajectoryStep(params: {
        trajectoryId: string;
        stepId?: string;
        action: string;
        observation: string;
        reward: number;
        embedding?: number[];
    }): Promise<void>;
    /**
     * End a trajectory with final verdict
     */
    endTrajectory(params: {
        trajectoryId: string;
        success: boolean;
        verdict?: 'positive' | 'negative' | 'neutral';
        reward?: number;
    }): Promise<SONATrajectory>;
    /**
     * Store a learned pattern
     *
     * ADR-001: When agentic-flow is available, delegates to its optimized
     * pattern storage which uses AgentDB with HNSW indexing for
     * 150x-12,500x faster similarity search.
     */
    storePattern(params: {
        pattern: string;
        solution: string;
        category: string;
        confidence: number;
        metadata?: Record<string, unknown>;
    }): Promise<string>;
    /**
     * Find similar patterns to a query
     *
     * ADR-001: When agentic-flow is available, delegates to its optimized
     * HNSW-indexed search for 150x-12,500x faster retrieval.
     */
    findSimilarPatterns(params: {
        query: string;
        category?: string;
        topK?: number;
        threshold?: number;
    }): Promise<SONAPattern[]>;
    /**
     * Get a pattern by ID
     */
    getPattern(patternId: string): Promise<SONAPattern | null>;
    /**
     * Delete a pattern
     */
    deletePattern(patternId: string): Promise<boolean>;
    /**
     * Force a learning cycle
     */
    forceLearningCycle(): Promise<void>;
    /**
     * Get learning statistics
     */
    getStats(): Promise<SONALearningStats>;
    /**
     * Export patterns for persistence
     */
    exportPatterns(): Promise<SONAPattern[]>;
    /**
     * Import patterns from storage
     */
    importPatterns(patterns: SONAPattern[]): Promise<number>;
    /**
     * Shutdown the adapter
     */
    shutdown(): Promise<void>;
    private mergeConfig;
    private initializeStats;
    private applyModeConfig;
    private startConsolidationTimer;
    private stopConsolidationTimer;
    private consolidatePatterns;
    private prunePatterns;
    private learnFromTrajectory;
    private calculateSimilarity;
    private calculatePatternScore;
    private updateAverageConfidence;
    private estimateMemoryUsage;
    private generateId;
    private ensureInitialized;
}
/**
 * Create and initialize a SONA adapter
 */
export declare function createSONAAdapter(config?: Partial<SONAConfiguration>): Promise<SONAAdapter>;
export {};
//# sourceMappingURL=sona-adapter.d.ts.map