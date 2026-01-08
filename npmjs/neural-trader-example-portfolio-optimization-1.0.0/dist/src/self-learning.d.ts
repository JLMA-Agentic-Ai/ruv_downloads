/**
 * Self-Learning Portfolio Optimization using AgentDB Memory Patterns
 * Learns optimal risk parameters and strategy preferences from historical performance
 */
import { OptimizationResult } from './optimizer.js';
export interface RiskProfile {
    riskAversion: number;
    targetReturn: number;
    maxDrawdown: number;
    preferredAlgorithm: string;
    diversificationPreference: number;
}
export interface PerformanceMetrics {
    sharpeRatio: number;
    maxDrawdown: number;
    volatility: number;
    cumulativeReturn: number;
    winRate: number;
    informationRatio: number;
}
export interface LearningState {
    iteration: number;
    bestRiskProfile: RiskProfile;
    performanceHistory: PerformanceMetrics[];
    strategySuccessRates: Record<string, number>;
    adaptiveParameters: Record<string, number>;
}
/**
 * Self-Learning Optimizer with AgentDB Memory
 */
export declare class SelfLearningOptimizer {
    private db;
    private learningPlugin;
    private namespace;
    constructor(dbPath?: string, namespace?: string);
    /**
     * Initialize or restore learning state from memory
     */
    initialize(): Promise<void>;
    /**
     * Load learning state from AgentDB memory
     */
    loadLearningState(): Promise<LearningState | null>;
    /**
     * Save learning state to AgentDB memory
     */
    saveLearningState(state: LearningState): Promise<void>;
    /**
     * Learn from optimization result and update risk profile
     */
    learn(result: OptimizationResult, actualPerformance: PerformanceMetrics, marketConditions: Record<string, number>): Promise<RiskProfile>;
    /**
     * Encode current state into vector for learning
     */
    private encodeState;
    /**
     * Calculate reward signal from performance
     */
    private calculateReward;
    /**
     * Adapt risk profile based on learned action
     */
    private adaptRiskProfile;
    /**
     * Select algorithm with highest success rate
     */
    private selectBestAlgorithm;
    /**
     * Store trajectory in memory for experience replay
     */
    private storeTrajectory;
    /**
     * Retrieve similar past experiences for pattern recognition
     */
    retrieveSimilarExperiences(currentState: number[], limit?: number): Promise<any[]>;
    /**
     * Get recommended risk profile based on current market conditions
     */
    getRecommendedProfile(marketConditions: Record<string, number>): Promise<RiskProfile>;
    /**
     * Distill learned patterns into memory
     */
    distillLearning(): Promise<void>;
    /**
     * Export learning state for analysis
     */
    exportLearningData(): Promise<LearningState | null>;
    /**
     * Reset learning state (for retraining)
     */
    reset(): Promise<void>;
    /**
     * Close database connection
     */
    close(): Promise<void>;
}
/**
 * Adaptive Risk Manager
 * Dynamically adjusts position sizing based on learned patterns
 */
export declare class AdaptiveRiskManager {
    private learningOptimizer;
    constructor(learningOptimizer: SelfLearningOptimizer);
    /**
     * Calculate adaptive position sizes
     */
    calculatePositionSizes(baseWeights: number[], marketConditions: Record<string, number>, confidenceLevel?: number): Promise<number[]>;
    /**
     * Calculate risk multiplier based on conditions
     */
    private calculateRiskMultiplier;
    /**
     * Monitor portfolio and trigger rebalancing if needed
     */
    shouldRebalance(currentWeights: number[], targetWeights: number[], threshold?: number): Promise<boolean>;
}
//# sourceMappingURL=self-learning.d.ts.map