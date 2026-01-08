"use strict";
/**
 * Swarm-based pricing strategy exploration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingSwarm = void 0;
const agentic_flow_1 = require("agentic-flow");
const pricer_1 = require("./pricer");
class PricingSwarm {
    constructor(config, basePrice, elasticityLearner, rlOptimizer, competitiveAnalyzer) {
        this.config = config;
        this.flow = new agentic_flow_1.AgenticFlow({
            topology: config.communicationTopology,
            coordination: config.consensusMechanism,
        });
        this.pricer = new pricer_1.DynamicPricer(basePrice, elasticityLearner, rlOptimizer, competitiveAnalyzer);
        this.agents = [];
        this.sharedMemory = new Map();
        this.initializeAgents();
    }
    /**
     * Initialize swarm agents with different strategies
     */
    initializeAgents() {
        const strategies = [
            'cost-plus',
            'value-based',
            'competition-based',
            'dynamic-demand',
            'time-based',
            'elasticity-optimized',
            'rl-optimized',
        ];
        // Create agents up to numAgents
        for (let i = 0; i < this.config.numAgents; i++) {
            const strategyName = this.config.strategies[i % this.config.strategies.length] || strategies[i % strategies.length];
            const strategy = this.pricer.getStrategy(strategyName);
            if (!strategy)
                continue;
            const agent = {
                id: `agent_${i}_${strategyName}`,
                strategy,
                performance: {
                    totalRevenue: 0,
                    avgDemand: 0,
                    priceCompetitiveness: 0,
                    customerSatisfaction: 0,
                    inventoryTurnover: 0,
                },
                memory: [],
            };
            this.agents.push(agent);
            // Register with agentic-flow
            this.flow.addAgent({
                id: agent.id,
                type: 'pricer',
                capabilities: [strategyName],
            });
        }
    }
    /**
     * Explore pricing strategies in parallel
     */
    async explore(context, trials = 100) {
        const results = new Map();
        // Run trials
        for (let trial = 0; trial < trials; trial++) {
            // Each agent proposes a price
            const proposals = await Promise.all(this.agents.map(async (agent) => {
                const recommendation = await this.pricer.recommendPrice(context, agent.strategy.name);
                return { agent, recommendation };
            }));
            // Simulate market response for each proposal
            for (const { agent, recommendation } of proposals) {
                const demand = this.simulateDemand(recommendation.price, context);
                const revenue = recommendation.price * demand;
                // Update agent performance
                agent.performance.totalRevenue += revenue;
                agent.performance.avgDemand = (agent.performance.avgDemand + demand) / 2;
                // Store in memory
                agent.memory.push({
                    trial,
                    price: recommendation.price,
                    demand,
                    revenue,
                    context: { ...context },
                });
                // Keep memory bounded
                if (agent.memory.length > 50) {
                    agent.memory.shift();
                }
                // Record outcome
                this.pricer.recordOutcome(recommendation.price, demand, context);
            }
            // Communication phase: agents share insights
            if (trial % 10 === 0) {
                await this.communicateInsights();
            }
            // Exploration: occasionally try random strategies
            if (Math.random() < this.config.explorationRate) {
                await this.exploreRandomStrategy(context);
            }
        }
        // Aggregate results
        for (const agent of this.agents) {
            results.set(agent.strategy.name, { ...agent.performance });
        }
        // Find best performer
        let bestStrategy = '';
        let maxRevenue = 0;
        let totalRevenue = 0;
        for (const [strategy, perf] of results) {
            totalRevenue += perf.totalRevenue;
            if (perf.totalRevenue > maxRevenue) {
                maxRevenue = perf.totalRevenue;
                bestStrategy = strategy;
            }
        }
        const bestAgent = this.agents.find(a => a.strategy.name === bestStrategy);
        const bestPrice = bestAgent
            ? bestAgent.memory[bestAgent.memory.length - 1]?.price || 0
            : 0;
        return {
            bestStrategy,
            bestPrice,
            avgRevenue: totalRevenue / (trials * this.agents.length),
            results,
        };
    }
    /**
     * Simulate demand response to price
     */
    simulateDemand(price, context) {
        // Simple demand model with noise
        const baseDemand = context.demand;
        const priceElasticity = -1.5;
        // Calculate expected demand based on elasticity
        const priceChange = (price - 100) / 100; // Assume base price = 100
        const demandChange = priceElasticity * priceChange;
        const expectedDemand = baseDemand * (1 + demandChange);
        // Add noise
        const noise = (Math.random() - 0.5) * 20;
        return Math.max(0, expectedDemand + noise);
    }
    /**
     * Agents communicate insights via shared memory
     */
    async communicateInsights() {
        // Each agent shares its best price-demand observation
        for (const agent of this.agents) {
            if (agent.memory.length === 0)
                continue;
            // Find best revenue observation
            const best = agent.memory.reduce((max, obs) => obs.revenue > max.revenue ? obs : max);
            this.sharedMemory.set(`${agent.id}_best`, {
                price: best.price,
                demand: best.demand,
                revenue: best.revenue,
                strategy: agent.strategy.name,
            });
        }
        // Consensus mechanism: aggregate insights
        const insights = Array.from(this.sharedMemory.values());
        if (insights.length > 0) {
            const avgBestPrice = insights.reduce((sum, i) => sum + i.price, 0) / insights.length;
            const avgBestRevenue = insights.reduce((sum, i) => sum + i.revenue, 0) / insights.length;
            this.sharedMemory.set('consensus', {
                avgBestPrice,
                avgBestRevenue,
                timestamp: Date.now(),
            });
        }
    }
    /**
     * Explore random strategy with mutation
     */
    async exploreRandomStrategy(context) {
        // Create temporary experimental agent
        const randomAgent = this.agents[Math.floor(Math.random() * this.agents.length)];
        // Mutate strategy: create variant with random adjustment
        const mutation = 0.9 + Math.random() * 0.2; // 90% to 110%
        const experimentalStrategy = {
            name: `${randomAgent.strategy.name}_mutant`,
            calculate: (ctx, basePrice) => {
                const originalPrice = randomAgent.strategy.calculate(ctx, basePrice);
                return originalPrice * mutation;
            },
        };
        // Test experimental strategy
        const price = experimentalStrategy.calculate(context, 100);
        const demand = this.simulateDemand(price, context);
        const revenue = price * demand;
        // If better than parent, adopt mutation
        const parentAvgRevenue = randomAgent.performance.totalRevenue / Math.max(randomAgent.memory.length, 1);
        if (revenue > parentAvgRevenue * 1.1) {
            // Replace strategy with mutant
            randomAgent.strategy = experimentalStrategy;
            console.log(`Agent ${randomAgent.id} adopted mutant strategy with ${mutation.toFixed(2)}x multiplier`);
        }
    }
    /**
     * Tournament selection: find best performers
     */
    async tournament(context) {
        const tournamentSize = Math.min(4, this.agents.length);
        const winners = [];
        while (winners.length < this.agents.length / 2) {
            // Random selection
            const competitors = [];
            for (let i = 0; i < tournamentSize; i++) {
                const idx = Math.floor(Math.random() * this.agents.length);
                competitors.push(this.agents[idx]);
            }
            // Find best performer
            const winner = competitors.reduce((best, agent) => agent.performance.totalRevenue > best.performance.totalRevenue ? agent : best);
            winners.push(winner);
        }
        return winners;
    }
    /**
     * Evolve swarm: keep best performers, mutate others
     */
    async evolve(context) {
        const winners = await this.tournament(context);
        // Replace poor performers with mutations of winners
        const losers = this.agents.filter(a => !winners.includes(a));
        for (const loser of losers) {
            const parent = winners[Math.floor(Math.random() * winners.length)];
            // Create mutated strategy
            const mutation = 0.85 + Math.random() * 0.3; // 85% to 115%
            loser.strategy = {
                name: `${parent.strategy.name}_evolved`,
                calculate: (ctx, basePrice) => {
                    const parentPrice = parent.strategy.calculate(ctx, basePrice);
                    return parentPrice * mutation;
                },
            };
            // Reset performance
            loser.performance = {
                totalRevenue: 0,
                avgDemand: 0,
                priceCompetitiveness: 0,
                customerSatisfaction: 0,
                inventoryTurnover: 0,
            };
            loser.memory = [];
        }
    }
    /**
     * Get consensus recommendation from swarm
     */
    async getConsensusPrice(context) {
        // Each agent votes with their recommendation
        const votes = await Promise.all(this.agents.map(async (agent) => {
            return await this.pricer.recommendPrice(context, agent.strategy.name);
        }));
        // Weight votes by agent performance
        const totalPerf = this.agents.reduce((sum, a) => sum + a.performance.totalRevenue, 0);
        let weightedPrice = 0;
        let weightedRevenue = 0;
        for (let i = 0; i < votes.length; i++) {
            const weight = totalPerf > 0 ? this.agents[i].performance.totalRevenue / totalPerf : 1.0 / votes.length;
            weightedPrice += votes[i].price * weight;
            weightedRevenue += votes[i].expectedRevenue * weight;
        }
        return {
            price: weightedPrice,
            strategy: 'swarm-consensus',
            expectedRevenue: weightedRevenue,
            expectedDemand: weightedRevenue / weightedPrice,
            confidence: 0.9,
            uncertaintyBounds: [
                Math.min(...votes.map(v => v.price)),
                Math.max(...votes.map(v => v.price)),
            ],
            competitivePosition: 'consensus-based',
        };
    }
    /**
     * Get swarm statistics
     */
    getStatistics() {
        const avgRevenue = this.agents.reduce((sum, a) => sum + a.performance.totalRevenue, 0) / this.agents.length;
        const bestAgent = this.agents.reduce((best, agent) => agent.performance.totalRevenue > best.performance.totalRevenue ? agent : best);
        // Diversity: variety of strategies
        const uniqueStrategies = new Set(this.agents.map(a => a.strategy.name));
        const diversityScore = uniqueStrategies.size / this.agents.length;
        return {
            numAgents: this.agents.length,
            avgRevenue,
            bestStrategy: bestAgent.strategy.name,
            diversityScore,
        };
    }
}
exports.PricingSwarm = PricingSwarm;
//# sourceMappingURL=swarm.js.map