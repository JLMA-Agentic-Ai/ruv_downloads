/**
 * Swarm-based pricing strategy exploration
 */
import { SwarmAgent, SwarmConfig, MarketContext, AgentPerformance, PriceRecommendation } from './types';
import { ElasticityLearner } from './elasticity-learner';
import { RLOptimizer } from './rl-optimizer';
import { CompetitiveAnalyzer } from './competitive-analyzer';
export declare class PricingSwarm {
    private flow;
    private config;
    private agents;
    private pricer;
    private sharedMemory;
    constructor(config: SwarmConfig, basePrice: number, elasticityLearner: ElasticityLearner, rlOptimizer: RLOptimizer, competitiveAnalyzer: CompetitiveAnalyzer);
    /**
     * Initialize swarm agents with different strategies
     */
    private initializeAgents;
    /**
     * Explore pricing strategies in parallel
     */
    explore(context: MarketContext, trials?: number): Promise<{
        bestStrategy: string;
        bestPrice: number;
        avgRevenue: number;
        results: Map<string, AgentPerformance>;
    }>;
    /**
     * Simulate demand response to price
     */
    private simulateDemand;
    /**
     * Agents communicate insights via shared memory
     */
    private communicateInsights;
    /**
     * Explore random strategy with mutation
     */
    private exploreRandomStrategy;
    /**
     * Tournament selection: find best performers
     */
    tournament(context: MarketContext): Promise<SwarmAgent[]>;
    /**
     * Evolve swarm: keep best performers, mutate others
     */
    evolve(context: MarketContext): Promise<void>;
    /**
     * Get consensus recommendation from swarm
     */
    getConsensusPrice(context: MarketContext): Promise<PriceRecommendation>;
    /**
     * Get swarm statistics
     */
    getStatistics(): {
        numAgents: number;
        avgRevenue: number;
        bestStrategy: string;
        diversityScore: number;
    };
}
//# sourceMappingURL=swarm.d.ts.map