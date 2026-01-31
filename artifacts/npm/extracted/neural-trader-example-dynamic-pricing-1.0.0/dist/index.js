"use strict";
/**
 * @neural-trader/example-dynamic-pricing
 * Self-learning dynamic pricing with RL optimization and swarm strategy exploration
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConformalPredictor = exports.PricingSwarm = exports.CompetitiveAnalyzer = exports.RLOptimizer = exports.ElasticityLearner = exports.DynamicPricer = void 0;
exports.runExample = runExample;
var pricer_1 = require("./pricer");
Object.defineProperty(exports, "DynamicPricer", { enumerable: true, get: function () { return pricer_1.DynamicPricer; } });
var elasticity_learner_1 = require("./elasticity-learner");
Object.defineProperty(exports, "ElasticityLearner", { enumerable: true, get: function () { return elasticity_learner_1.ElasticityLearner; } });
var rl_optimizer_1 = require("./rl-optimizer");
Object.defineProperty(exports, "RLOptimizer", { enumerable: true, get: function () { return rl_optimizer_1.RLOptimizer; } });
var competitive_analyzer_1 = require("./competitive-analyzer");
Object.defineProperty(exports, "CompetitiveAnalyzer", { enumerable: true, get: function () { return competitive_analyzer_1.CompetitiveAnalyzer; } });
var swarm_1 = require("./swarm");
Object.defineProperty(exports, "PricingSwarm", { enumerable: true, get: function () { return swarm_1.PricingSwarm; } });
var conformal_predictor_1 = require("./conformal-predictor");
Object.defineProperty(exports, "ConformalPredictor", { enumerable: true, get: function () { return conformal_predictor_1.ConformalPredictor; } });
__exportStar(require("./types"), exports);
/**
 * Quick start example
 */
const pricer_2 = require("./pricer");
const elasticity_learner_2 = require("./elasticity-learner");
const rl_optimizer_2 = require("./rl-optimizer");
const competitive_analyzer_2 = require("./competitive-analyzer");
const swarm_2 = require("./swarm");
async function runExample() {
    console.log('🎯 Neural Trader Dynamic Pricing Example\n');
    // Initialize components
    const basePrice = 100;
    const elasticityLearner = new elasticity_learner_2.ElasticityLearner('./data/example_elasticity.db');
    const rlOptimizer = new rl_optimizer_2.RLOptimizer({
        algorithm: 'q-learning',
        learningRate: 0.1,
        epsilon: 0.2,
    });
    const competitiveAnalyzer = new competitive_analyzer_2.CompetitiveAnalyzer();
    // Create pricer
    const pricer = new pricer_2.DynamicPricer(basePrice, elasticityLearner, rlOptimizer, competitiveAnalyzer);
    // Create swarm for strategy exploration
    const swarm = new swarm_2.PricingSwarm({
        numAgents: 7,
        strategies: ['cost-plus', 'value-based', 'competition-based', 'dynamic-demand', 'time-based', 'elasticity-optimized', 'rl-optimized'],
        communicationTopology: 'mesh',
        consensusMechanism: 'weighted',
        explorationRate: 0.15,
    }, basePrice, elasticityLearner, rlOptimizer, competitiveAnalyzer);
    // Simulate market context
    const context = {
        timestamp: Date.now(),
        dayOfWeek: 3, // Wednesday
        hour: 14,
        isHoliday: false,
        isPromotion: false,
        seasonality: 0.1,
        competitorPrices: [95, 98, 102, 105],
        inventory: 150,
        demand: 80,
    };
    console.log('📊 Market Context:');
    console.log(`  Day: ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][context.dayOfWeek]}`);
    console.log(`  Hour: ${context.hour}:00`);
    console.log(`  Current Demand: ${context.demand}`);
    console.log(`  Inventory: ${context.inventory}`);
    console.log(`  Competitor Prices: $${context.competitorPrices.join(', $')}\n`);
    // Test individual strategies
    console.log('💡 Individual Strategy Recommendations:\n');
    const strategies = ['cost-plus', 'value-based', 'competition-based', 'dynamic-demand', 'elasticity-optimized', 'rl-optimized'];
    for (const strategy of strategies) {
        const recommendation = await pricer.recommendPrice(context, strategy);
        console.log(`  ${strategy.padEnd(25)} → $${recommendation.price.toFixed(2)} (revenue: $${recommendation.expectedRevenue.toFixed(2)})`);
    }
    // Ensemble recommendation
    console.log('\n🎯 Ensemble Recommendation:');
    const ensembleRec = await pricer.recommendPrice(context);
    console.log(`  Price: $${ensembleRec.price.toFixed(2)}`);
    console.log(`  Expected Revenue: $${ensembleRec.expectedRevenue.toFixed(2)}`);
    console.log(`  Expected Demand: ${ensembleRec.expectedDemand.toFixed(1)} units`);
    console.log(`  Confidence: ${(ensembleRec.confidence * 100).toFixed(0)}%`);
    console.log(`  Competitive Position: ${ensembleRec.competitivePosition}\n`);
    // Swarm exploration
    console.log('🐝 Running Swarm Exploration (100 trials)...\n');
    const swarmResult = await swarm.explore(context, 100);
    console.log(`✨ Best Strategy: ${swarmResult.bestStrategy}`);
    console.log(`   Best Price: $${swarmResult.bestPrice.toFixed(2)}`);
    console.log(`   Avg Revenue: $${swarmResult.avgRevenue.toFixed(2)}\n`);
    console.log('📈 Strategy Performance:\n');
    for (const [strategy, performance] of swarmResult.results) {
        console.log(`  ${strategy.padEnd(25)} → Revenue: $${performance.totalRevenue.toFixed(0)}, Avg Demand: ${performance.avgDemand.toFixed(1)}`);
    }
    // Get competitive analysis
    console.log('\n🔍 Competitive Analysis:');
    const compAnalysis = competitiveAnalyzer.analyze(context.competitorPrices);
    console.log(`  Market Average: $${compAnalysis.avgPrice.toFixed(2)}`);
    console.log(`  Price Range: $${compAnalysis.minPrice.toFixed(2)} - $${compAnalysis.maxPrice.toFixed(2)}`);
    console.log(`  Dispersion: ${(compAnalysis.priceDispersion * 100).toFixed(1)}%`);
    console.log(`  Market Structure: ${compAnalysis.marketPosition}`);
    console.log(`  Recommendation: ${compAnalysis.recommendedPosition}\n`);
    // RL optimizer metrics
    console.log('🤖 RL Optimizer Metrics:');
    const rlMetrics = rlOptimizer.getMetrics();
    console.log(`  States Explored: ${rlMetrics.statesExplored}`);
    console.log(`  Exploration Rate: ${(rlMetrics.epsilon * 100).toFixed(1)}%`);
    console.log(`  Training Steps: ${rlMetrics.step}`);
    console.log(`  Avg Q-Value: ${rlMetrics.avgQValue.toFixed(4)}\n`);
    // Swarm statistics
    console.log('📊 Swarm Statistics:');
    const swarmStats = swarm.getStatistics();
    console.log(`  Active Agents: ${swarmStats.numAgents}`);
    console.log(`  Best Strategy: ${swarmStats.bestStrategy}`);
    console.log(`  Diversity Score: ${(swarmStats.diversityScore * 100).toFixed(0)}%\n`);
    console.log('✅ Example completed! Check the code for integration details.');
}
// Run if executed directly
if (require.main === module) {
    runExample().catch(console.error);
}
//# sourceMappingURL=index.js.map