/**
 * Pattern Learner - Self-learning market microstructure pattern recognition
 * Uses AgentDB for persistent pattern storage and retrieval
 */
import { MicrostructureMetrics } from './order-book-analyzer';
export interface PatternFeatures {
    spreadTrend: number;
    spreadVolatility: number;
    depthImbalance: number;
    depthTrend: number;
    flowPersistence: number;
    flowReversal: number;
    toxicityLevel: number;
    informedTradingProbability: number;
    priceEfficiency: number;
    microPriceDivergence: number;
    timestamp: number;
}
export interface Pattern {
    id: string;
    features: PatternFeatures;
    label: string;
    confidence: number;
    outcome?: {
        priceMove: number;
        spreadChange: number;
        liquidityChange: number;
        timeHorizon: number;
    };
    metadata: {
        discovered: number;
        lastSeen: number;
        occurrences: number;
    };
}
export interface LearningConfig {
    agentDbPath: string;
    minConfidence: number;
    maxPatterns: number;
    learningRate: number;
    useNeuralPredictor: boolean;
}
export declare class PatternLearner {
    private agentDb;
    private predictor?;
    private patterns;
    private config;
    constructor(config?: Partial<LearningConfig>);
    /**
     * Initialize pattern learner
     */
    initialize(): Promise<void>;
    /**
     * Extract features from metrics history
     */
    extractFeatures(metricsHistory: MicrostructureMetrics[]): PatternFeatures;
    /**
     * Learn pattern from features and outcomes
     */
    learnPattern(features: PatternFeatures, outcome: Pattern['outcome'], label?: string): Promise<Pattern>;
    /**
     * Recognize pattern from current features
     */
    recognizePattern(features: PatternFeatures): Promise<Pattern | null>;
    /**
     * Predict outcome using neural predictor
     */
    predictOutcome(features: PatternFeatures): Promise<Pattern['outcome'] | null>;
    /**
     * Get all learned patterns
     */
    getPatterns(): Pattern[];
    /**
     * Get pattern statistics
     */
    getStatistics(): {
        totalPatterns: number;
        highConfidencePatterns: number;
        avgConfidence: number;
        mostCommonLabels: Array<{
            label: string;
            count: number;
        }>;
    };
    /**
     * Store pattern in AgentDB
     */
    private storePattern;
    /**
     * Load patterns from AgentDB
     */
    private loadPatterns;
    /**
     * Train neural predictor
     */
    private trainPredictor;
    /**
     * Prune least useful patterns
     */
    private prunePatterns;
    /**
     * Convert features to vector for AgentDB
     */
    private featuresToVector;
    /**
     * Convert vector back to features
     */
    private vectorToFeatures;
    /**
     * Generate unique pattern ID
     */
    private generatePatternId;
    /**
     * Auto-label pattern based on features
     */
    private autoLabel;
    /**
     * Calculate trend of a series
     */
    private calculateTrend;
    /**
     * Calculate volatility
     */
    private calculateVolatility;
    /**
     * Calculate mean
     */
    private calculateMean;
    /**
     * Calculate persistence
     */
    private calculatePersistence;
    /**
     * Detect reversal
     */
    private detectReversal;
    /**
     * Calculate price efficiency
     */
    private calculateEfficiency;
    /**
     * Close and cleanup
     */
    close(): Promise<void>;
}
//# sourceMappingURL=pattern-learner.d.ts.map