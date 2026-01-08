/**
 * Core dynamic pricing engine with multiple strategies
 */
import { MarketContext, PricingStrategy, PriceRecommendation, CustomerSegment } from './types';
import { ElasticityLearner } from './elasticity-learner';
import { RLOptimizer } from './rl-optimizer';
import { CompetitiveAnalyzer } from './competitive-analyzer';
export declare class DynamicPricer {
    private strategies;
    private elasticityLearner;
    private rlOptimizer;
    private competitiveAnalyzer;
    private basePrice;
    private priceHistory;
    constructor(basePrice: number, elasticityLearner: ElasticityLearner, rlOptimizer: RLOptimizer, competitiveAnalyzer: CompetitiveAnalyzer);
    private initializeStrategies;
    /**
     * Get price recommendation using specified strategy
     */
    recommendPrice(context: MarketContext, strategyName?: string, segment?: CustomerSegment): Promise<PriceRecommendation>;
    /**
     * Ensemble recommendation combining multiple strategies
     */
    private ensembleRecommendation;
    /**
     * Calculate strategy weights based on historical performance
     */
    private calculateStrategyWeights;
    /**
     * Determine competitive position
     */
    private getCompetitivePosition;
    /**
     * Record actual outcome for learning
     */
    recordOutcome(price: number, demand: number, context: MarketContext): void;
    /**
     * Calculate reward for RL
     */
    private calculateReward;
    /**
     * Get strategy by name
     */
    getStrategy(name: string): PricingStrategy | undefined;
    /**
     * Add custom strategy
     */
    addStrategy(strategy: PricingStrategy): void;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): {
        avgRevenue: number;
        avgPrice: number;
        avgDemand: number;
        totalRevenue: number;
    };
}
//# sourceMappingURL=pricer.d.ts.map