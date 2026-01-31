/**
 * Swarm Features - Distributed feature engineering with claude-flow swarm coordination
 * Explores and optimizes market microstructure features using swarm intelligence
 */
import { MicrostructureMetrics } from './order-book-analyzer';
import { PatternFeatures } from './pattern-learner';
export interface SwarmAgent {
    id: string;
    type: 'explorer' | 'optimizer' | 'validator' | 'anomaly-detector';
    features: string[];
    performance: number;
    generation: number;
}
export interface FeatureSet {
    name: string;
    features: string[];
    importance: number;
    performance: {
        accuracy: number;
        profitability: number;
        sharpeRatio: number;
    };
    metadata: {
        discovered: number;
        generatedBy: string;
        validatedCount: number;
    };
}
export interface SwarmConfig {
    numAgents: number;
    generations: number;
    mutationRate: number;
    crossoverRate: number;
    eliteSize: number;
    useOpenRouter: boolean;
    openRouterKey?: string;
}
export declare class SwarmFeatureEngineer {
    private agents;
    private featureSets;
    private config;
    private generation;
    constructor(config?: Partial<SwarmConfig>);
    /**
     * Initialize swarm with claude-flow
     */
    initialize(): Promise<void>;
    /**
     * Explore feature space using swarm intelligence
     */
    exploreFeatures(metricsHistory: MicrostructureMetrics[]): Promise<FeatureSet[]>;
    /**
     * Optimize existing features using swarm
     */
    optimizeFeatures(baseFeatures: PatternFeatures, targetMetric: 'accuracy' | 'profitability' | 'sharpe'): Promise<PatternFeatures>;
    /**
     * Detect anomalies in market microstructure using swarm
     */
    detectAnomalies(metrics: MicrostructureMetrics): Promise<{
        isAnomaly: boolean;
        confidence: number;
        anomalyType: string;
        explanation: string;
    }>;
    /**
     * Initialize agent population
     */
    private initializeAgents;
    /**
     * Evaluate agents on metrics history
     */
    private evaluateAgents;
    /**
     * Evaluate single agent
     */
    private evaluateAgent;
    /**
     * Select elite agents
     */
    private selectElites;
    /**
     * Evolve population
     */
    private evolvePopulation;
    /**
     * Select parent for reproduction
     */
    private selectParent;
    /**
     * Crossover two agents
     */
    private crossover;
    /**
     * Mutate agent
     */
    private mutate;
    /**
     * Report progress via claude-flow
     */
    private reportProgress;
    /**
     * Enhance with OpenRouter LLM
     */
    private enhanceWithOpenRouter;
    /**
     * Enhance anomaly explanation with OpenRouter
     */
    private enhanceAnomalyExplanation;
    /**
     * Finalize feature sets
     */
    private finalizeFeatureSets;
    /**
     * Random feature subset
     */
    private randomFeatureSubset;
    /**
     * Create optimization agents
     */
    private createOptimizationAgents;
    /**
     * Evaluate optimization agent
     */
    private evaluateOptimizationAgent;
    /**
     * Apply agent features to pattern
     */
    private applyAgentFeatures;
    /**
     * Evolve optimization agents
     */
    private evolveOptimizationAgents;
    /**
     * Detect anomaly with single agent
     */
    private detectAnomalyWithAgent;
    /**
     * Get discovered feature sets
     */
    getFeatureSets(): FeatureSet[];
    /**
     * Get agent statistics
     */
    getAgentStats(): {
        totalAgents: number;
        byType: Record<string, number>;
        avgPerformance: number;
        bestAgent: SwarmAgent | null;
    };
    /**
     * Cleanup
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=swarm-features.d.ts.map