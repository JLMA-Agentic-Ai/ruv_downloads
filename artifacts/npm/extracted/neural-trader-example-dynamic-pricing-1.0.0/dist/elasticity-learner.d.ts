/**
 * Self-learning price elasticity estimation with AgentDB memory
 */
import { MarketContext, ElasticityEstimate, Purchase } from './types';
export declare class ElasticityLearner {
    private db;
    private observations;
    private segmentElasticities;
    constructor(dbPath?: string);
    /**
     * Observe a price-demand pair with context
     */
    observe(price: number, demand: number, context: MarketContext): Promise<void>;
    /**
     * Update elasticity estimate using recent observations
     */
    private updateElasticity;
    /**
     * Get current elasticity estimate for a context
     */
    getElasticity(context: MarketContext): ElasticityEstimate;
    /**
     * Get segment-specific elasticity
     */
    getSegmentElasticity(segmentId: string): Promise<ElasticityEstimate>;
    /**
     * Learn from purchase behavior
     */
    learnFromPurchase(purchase: Purchase, segmentId: string): Promise<void>;
    /**
     * Predict demand at a given price
     */
    predictDemand(price: number, basePrice: number, baseDemand: number, context: MarketContext): {
        demand: number;
        lower: number;
        upper: number;
    };
    /**
     * Get seasonality patterns
     */
    learnSeasonality(): Promise<Map<number, number>>;
    /**
     * Get promotion effect learning
     */
    learnPromotionEffect(): Promise<number>;
    private mean;
    private std;
    /**
     * Export learned patterns for analysis
     */
    exportPatterns(): Promise<{
        elasticity: ElasticityEstimate;
        seasonality: Map<number, number>;
        promotionEffect: number;
        observationCount: number;
    }>;
}
//# sourceMappingURL=elasticity-learner.d.ts.map