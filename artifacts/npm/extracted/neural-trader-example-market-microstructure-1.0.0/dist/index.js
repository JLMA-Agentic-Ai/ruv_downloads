"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketMicrostructure = exports.SwarmFeatureEngineer = exports.PatternLearner = exports.OrderBookAnalyzer = void 0;
exports.createMarketMicrostructure = createMarketMicrostructure;
var order_book_analyzer_1 = require("./order-book-analyzer");
Object.defineProperty(exports, "OrderBookAnalyzer", { enumerable: true, get: function () { return order_book_analyzer_1.OrderBookAnalyzer; } });
var pattern_learner_1 = require("./pattern-learner");
Object.defineProperty(exports, "PatternLearner", { enumerable: true, get: function () { return pattern_learner_1.PatternLearner; } });
var swarm_features_1 = require("./swarm-features");
Object.defineProperty(exports, "SwarmFeatureEngineer", { enumerable: true, get: function () { return swarm_features_1.SwarmFeatureEngineer; } });
const order_book_analyzer_2 = require("./order-book-analyzer");
const pattern_learner_2 = require("./pattern-learner");
const swarm_features_2 = require("./swarm-features");
/**
 * Main MarketMicrostructure class - orchestrates all components
 */
class MarketMicrostructure {
    config;
    analyzer;
    learner;
    swarm;
    initialized = false;
    constructor(config = {}) {
        this.config = config;
        this.analyzer = new order_book_analyzer_2.OrderBookAnalyzer();
        this.learner = new pattern_learner_2.PatternLearner({
            agentDbPath: config.agentDbPath || './market-patterns.db'
        });
        if (config.useSwarm !== false) {
            this.swarm = new swarm_features_2.SwarmFeatureEngineer(config.swarmConfig || {});
        }
    }
    /**
     * Initialize all components
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        await this.learner.initialize();
        if (this.swarm) {
            await this.swarm.initialize();
        }
        this.initialized = true;
    }
    /**
     * Analyze order book and learn patterns
     */
    async analyze(orderBook, recentTrades) {
        if (!this.initialized) {
            throw new Error('MarketMicrostructure not initialized. Call initialize() first.');
        }
        // Analyze order book
        const metrics = this.analyzer.analyzeOrderBook(orderBook, recentTrades);
        // Extract features from metrics history
        const metricsHistory = this.analyzer.getMetricsHistory();
        let pattern = null;
        if (metricsHistory.length >= 2) {
            const features = this.learner.extractFeatures(metricsHistory);
            // Try to recognize existing pattern
            pattern = await this.learner.recognizePattern(features);
            // If no pattern recognized, predict outcome
            if (!pattern) {
                const prediction = await this.learner.predictOutcome(features);
                pattern = { features, prediction };
            }
        }
        // Check for anomalies using swarm
        let anomaly;
        if (this.swarm) {
            anomaly = await this.swarm.detectAnomalies(metrics);
        }
        return {
            metrics,
            pattern,
            anomaly
        };
    }
    /**
     * Learn from observed outcome
     */
    async learn(outcome, label) {
        const metricsHistory = this.analyzer.getMetricsHistory();
        if (metricsHistory.length < 2) {
            return;
        }
        const features = this.learner.extractFeatures(metricsHistory);
        await this.learner.learnPattern(features, outcome, label);
    }
    /**
     * Explore feature space using swarm
     */
    async exploreFeatures() {
        if (!this.swarm) {
            throw new Error('Swarm not enabled. Set useSwarm: true in constructor.');
        }
        const metricsHistory = this.analyzer.getMetricsHistory();
        if (metricsHistory.length < 10) {
            throw new Error('Need at least 10 metrics points for feature exploration');
        }
        return await this.swarm.exploreFeatures(metricsHistory);
    }
    /**
     * Optimize features for a specific metric
     */
    async optimizeFeatures(targetMetric) {
        if (!this.swarm) {
            throw new Error('Swarm not enabled. Set useSwarm: true in constructor.');
        }
        const metricsHistory = this.analyzer.getMetricsHistory();
        if (metricsHistory.length < 2) {
            throw new Error('Need at least 2 metrics points for optimization');
        }
        const baseFeatures = this.learner.extractFeatures(metricsHistory);
        return await this.swarm.optimizeFeatures(baseFeatures, targetMetric);
    }
    /**
     * Get comprehensive statistics
     */
    getStatistics() {
        const stats = {
            analyzer: {
                metricsCount: this.analyzer.getMetricsHistory().length,
                orderFlowCount: this.analyzer.getOrderFlowHistory().length
            },
            learner: this.learner.getStatistics()
        };
        if (this.swarm) {
            stats.swarm = this.swarm.getAgentStats();
        }
        return stats;
    }
    /**
     * Get learned patterns
     */
    getPatterns() {
        return this.learner.getPatterns();
    }
    /**
     * Get discovered feature sets
     */
    getFeatureSets() {
        if (!this.swarm) {
            return [];
        }
        return this.swarm.getFeatureSets();
    }
    /**
     * Reset analyzer state
     */
    reset() {
        this.analyzer.reset();
    }
    /**
     * Cleanup and close all components
     */
    async close() {
        await this.learner.close();
        if (this.swarm) {
            await this.swarm.cleanup();
        }
        this.initialized = false;
    }
}
exports.MarketMicrostructure = MarketMicrostructure;
/**
 * Convenience function to create and initialize MarketMicrostructure instance
 */
async function createMarketMicrostructure(config) {
    const mm = new MarketMicrostructure(config);
    await mm.initialize();
    return mm;
}
// Default export
exports.default = MarketMicrostructure;
//# sourceMappingURL=index.js.map