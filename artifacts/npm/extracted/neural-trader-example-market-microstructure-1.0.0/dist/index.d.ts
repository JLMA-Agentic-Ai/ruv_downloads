/**
 * @neural-trader/example-market-microstructure
 *
 * Self-learning market microstructure analysis with swarm-based feature engineering
 *
 * Key capabilities:
 * - Real-time order flow analysis
 * - Market impact modeling
 * - Price discovery patterns
 * - Liquidity provision optimization
 * - Self-learning bid-ask spread prediction
 * - Swarm-based feature engineering with claude-flow
 * - AgentDB pattern persistence
 */
export { OrderBookAnalyzer, OrderBook, OrderBookLevel, OrderFlow, MicrostructureMetrics } from './order-book-analyzer';
export { PatternLearner, Pattern, PatternFeatures, LearningConfig } from './pattern-learner';
export { SwarmFeatureEngineer, SwarmAgent, FeatureSet, SwarmConfig } from './swarm-features';
import { OrderBook, OrderFlow } from './order-book-analyzer';
/**
 * Main MarketMicrostructure class - orchestrates all components
 */
export declare class MarketMicrostructure {
    private config;
    private analyzer;
    private learner;
    private swarm?;
    private initialized;
    constructor(config?: {
        agentDbPath?: string;
        useSwarm?: boolean;
        swarmConfig?: {
            numAgents?: number;
            generations?: number;
            useOpenRouter?: boolean;
            openRouterKey?: string;
        };
    });
    /**
     * Initialize all components
     */
    initialize(): Promise<void>;
    /**
     * Analyze order book and learn patterns
     */
    analyze(orderBook: OrderBook, recentTrades?: OrderFlow[]): Promise<{
        metrics: any;
        pattern: any;
        anomaly?: any;
    }>;
    /**
     * Learn from observed outcome
     */
    learn(outcome: {
        priceMove: number;
        spreadChange: number;
        liquidityChange: number;
        timeHorizon: number;
    }, label?: string): Promise<void>;
    /**
     * Explore feature space using swarm
     */
    exploreFeatures(): Promise<any[]>;
    /**
     * Optimize features for a specific metric
     */
    optimizeFeatures(targetMetric: 'accuracy' | 'profitability' | 'sharpe'): Promise<any>;
    /**
     * Get comprehensive statistics
     */
    getStatistics(): {
        analyzer: {
            metricsCount: number;
            orderFlowCount: number;
        };
        learner: any;
        swarm?: any;
    };
    /**
     * Get learned patterns
     */
    getPatterns(): any[];
    /**
     * Get discovered feature sets
     */
    getFeatureSets(): any[];
    /**
     * Reset analyzer state
     */
    reset(): void;
    /**
     * Cleanup and close all components
     */
    close(): Promise<void>;
}
/**
 * Convenience function to create and initialize MarketMicrostructure instance
 */
export declare function createMarketMicrostructure(config?: ConstructorParameters<typeof MarketMicrostructure>[0]): Promise<MarketMicrostructure>;
export default MarketMicrostructure;
//# sourceMappingURL=index.d.ts.map