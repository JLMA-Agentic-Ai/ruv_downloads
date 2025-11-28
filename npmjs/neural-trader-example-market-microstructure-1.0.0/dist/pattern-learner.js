"use strict";
/**
 * Pattern Learner - Self-learning market microstructure pattern recognition
 * Uses AgentDB for persistent pattern storage and retrieval
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternLearner = void 0;
const agentdb_1 = require("agentdb");
const predictor_1 = require("@neural-trader/predictor");
class PatternLearner {
    agentDb;
    predictor;
    patterns = new Map();
    config;
    constructor(config = {}) {
        this.config = {
            agentDbPath: config.agentDbPath || './market-patterns.db',
            minConfidence: config.minConfidence || 0.7,
            maxPatterns: config.maxPatterns || 1000,
            learningRate: config.learningRate || 0.01,
            useNeuralPredictor: config.useNeuralPredictor !== false
        };
        this.agentDb = new agentdb_1.AgentDB({
            path: this.config.agentDbPath,
            dimensions: 10, // Feature dimensions
            indexType: 'hnsw',
            distanceMetric: 'cosine'
        });
        if (this.config.useNeuralPredictor) {
            this.predictor = new predictor_1.NeuralPredictor({
                inputSize: 10,
                hiddenLayers: [64, 32, 16],
                outputSize: 3, // [price_move, spread_change, liquidity_change]
                learningRate: this.config.learningRate
            });
        }
    }
    /**
     * Initialize pattern learner
     */
    async initialize() {
        await this.agentDb.initialize();
        await this.loadPatterns();
    }
    /**
     * Extract features from metrics history
     */
    extractFeatures(metricsHistory) {
        if (metricsHistory.length < 2) {
            throw new Error('Need at least 2 metrics points to extract features');
        }
        const recent = metricsHistory.slice(-10);
        return {
            // Spread patterns
            spreadTrend: this.calculateTrend(recent.map(m => m.bidAskSpread)),
            spreadVolatility: this.calculateVolatility(recent.map(m => m.bidAskSpread)),
            // Depth patterns
            depthImbalance: this.calculateMean(recent.map(m => m.imbalance)),
            depthTrend: this.calculateTrend(recent.map(m => m.bidDepth + m.askDepth)),
            // Flow patterns
            flowPersistence: this.calculatePersistence(recent.map(m => m.netFlow)),
            flowReversal: this.detectReversal(recent.map(m => m.netFlow)),
            // Toxicity patterns
            toxicityLevel: this.calculateMean(recent.map(m => m.orderFlowToxicity)),
            informedTradingProbability: this.calculateMean(recent.map(m => m.vpin)),
            // Price discovery
            priceEfficiency: this.calculateEfficiency(recent),
            microPriceDivergence: this.calculateMean(recent.map(m => Math.abs(m.microPrice - m.midPrice) / m.midPrice)),
            timestamp: recent[recent.length - 1].timestamp
        };
    }
    /**
     * Learn pattern from features and outcomes
     */
    async learnPattern(features, outcome, label) {
        const patternId = this.generatePatternId(features);
        // Check if pattern exists
        let pattern = this.patterns.get(patternId);
        if (pattern) {
            // Update existing pattern
            pattern.metadata.lastSeen = Date.now();
            pattern.metadata.occurrences++;
            // Update outcome with exponential moving average
            if (outcome && pattern.outcome) {
                const alpha = this.config.learningRate;
                pattern.outcome.priceMove = alpha * outcome.priceMove + (1 - alpha) * pattern.outcome.priceMove;
                pattern.outcome.spreadChange = alpha * outcome.spreadChange + (1 - alpha) * pattern.outcome.spreadChange;
                pattern.outcome.liquidityChange = alpha * outcome.liquidityChange + (1 - alpha) * pattern.outcome.liquidityChange;
            }
            else if (outcome) {
                pattern.outcome = outcome;
            }
            // Increase confidence with more occurrences
            pattern.confidence = Math.min(0.99, pattern.confidence + 0.01);
        }
        else {
            // Create new pattern
            pattern = {
                id: patternId,
                features,
                label: label || this.autoLabel(features),
                confidence: 0.5,
                outcome,
                metadata: {
                    discovered: Date.now(),
                    lastSeen: Date.now(),
                    occurrences: 1
                }
            };
            this.patterns.set(patternId, pattern);
        }
        // Store in AgentDB
        await this.storePattern(pattern);
        // Train neural predictor if enabled
        if (this.predictor && outcome) {
            await this.trainPredictor(features, outcome);
        }
        // Prune old patterns if needed
        if (this.patterns.size > this.config.maxPatterns) {
            await this.prunePatterns();
        }
        return pattern;
    }
    /**
     * Recognize pattern from current features
     */
    async recognizePattern(features) {
        const featureVector = this.featuresToVector(features);
        // Search similar patterns in AgentDB
        const results = await this.agentDb.search(featureVector, {
            limit: 5,
            threshold: 0.8
        });
        if (results.length === 0) {
            return null;
        }
        // Get most similar pattern
        const bestMatch = results[0];
        const pattern = this.patterns.get(bestMatch.id);
        if (pattern && pattern.confidence >= this.config.minConfidence) {
            return pattern;
        }
        return null;
    }
    /**
     * Predict outcome using neural predictor
     */
    async predictOutcome(features) {
        if (!this.predictor) {
            return null;
        }
        const featureVector = this.featuresToVector(features);
        const prediction = await this.predictor.predict(featureVector);
        return {
            priceMove: prediction[0],
            spreadChange: prediction[1],
            liquidityChange: prediction[2],
            timeHorizon: 5000 // 5 seconds default
        };
    }
    /**
     * Get all learned patterns
     */
    getPatterns() {
        return Array.from(this.patterns.values())
            .sort((a, b) => b.confidence - a.confidence);
    }
    /**
     * Get pattern statistics
     */
    getStatistics() {
        const patterns = Array.from(this.patterns.values());
        const highConfidence = patterns.filter(p => p.confidence >= this.config.minConfidence).length;
        const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length || 0;
        const labelCounts = new Map();
        patterns.forEach(p => {
            labelCounts.set(p.label, (labelCounts.get(p.label) || 0) + 1);
        });
        const mostCommon = Array.from(labelCounts.entries())
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            totalPatterns: patterns.length,
            highConfidencePatterns: highConfidence,
            avgConfidence,
            mostCommonLabels: mostCommon
        };
    }
    /**
     * Store pattern in AgentDB
     */
    async storePattern(pattern) {
        const vector = this.featuresToVector(pattern.features);
        await this.agentDb.insert({
            id: pattern.id,
            vector,
            metadata: {
                label: pattern.label,
                confidence: pattern.confidence,
                outcome: pattern.outcome,
                ...pattern.metadata
            }
        });
    }
    /**
     * Load patterns from AgentDB
     */
    async loadPatterns() {
        const allPatterns = await this.agentDb.getAll();
        allPatterns.forEach((stored) => {
            const pattern = {
                id: stored.id,
                features: this.vectorToFeatures(stored.vector),
                label: stored.metadata.label,
                confidence: stored.metadata.confidence,
                outcome: stored.metadata.outcome,
                metadata: {
                    discovered: stored.metadata.discovered,
                    lastSeen: stored.metadata.lastSeen,
                    occurrences: stored.metadata.occurrences
                }
            };
            this.patterns.set(pattern.id, pattern);
        });
    }
    /**
     * Train neural predictor
     */
    async trainPredictor(features, outcome) {
        if (!this.predictor || !outcome)
            return;
        const input = this.featuresToVector(features);
        const target = [outcome.priceMove, outcome.spreadChange, outcome.liquidityChange];
        await this.predictor.train([input], [target]);
    }
    /**
     * Prune least useful patterns
     */
    async prunePatterns() {
        const patterns = Array.from(this.patterns.values())
            .sort((a, b) => {
            // Score based on confidence and recency
            const scoreA = a.confidence * (1 - (Date.now() - a.metadata.lastSeen) / 86400000); // 24h decay
            const scoreB = b.confidence * (1 - (Date.now() - b.metadata.lastSeen) / 86400000);
            return scoreA - scoreB;
        });
        const toRemove = patterns.slice(0, Math.floor(this.config.maxPatterns * 0.1));
        for (const pattern of toRemove) {
            this.patterns.delete(pattern.id);
            await this.agentDb.delete(pattern.id);
        }
    }
    /**
     * Convert features to vector for AgentDB
     */
    featuresToVector(features) {
        return [
            features.spreadTrend,
            features.spreadVolatility,
            features.depthImbalance,
            features.depthTrend,
            features.flowPersistence,
            features.flowReversal,
            features.toxicityLevel,
            features.informedTradingProbability,
            features.priceEfficiency,
            features.microPriceDivergence
        ];
    }
    /**
     * Convert vector back to features
     */
    vectorToFeatures(vector) {
        return {
            spreadTrend: vector[0],
            spreadVolatility: vector[1],
            depthImbalance: vector[2],
            depthTrend: vector[3],
            flowPersistence: vector[4],
            flowReversal: vector[5],
            toxicityLevel: vector[6],
            informedTradingProbability: vector[7],
            priceEfficiency: vector[8],
            microPriceDivergence: vector[9],
            timestamp: Date.now()
        };
    }
    /**
     * Generate unique pattern ID
     */
    generatePatternId(features) {
        const vector = this.featuresToVector(features);
        const rounded = vector.map(v => Math.round(v * 100) / 100);
        return `pattern_${rounded.join('_')}`;
    }
    /**
     * Auto-label pattern based on features
     */
    autoLabel(features) {
        const labels = [];
        if (features.spreadTrend > 0.1)
            labels.push('widening_spread');
        if (features.spreadTrend < -0.1)
            labels.push('tightening_spread');
        if (features.depthImbalance > 0.3)
            labels.push('buy_pressure');
        if (features.depthImbalance < -0.3)
            labels.push('sell_pressure');
        if (features.flowPersistence > 0.7)
            labels.push('persistent_flow');
        if (features.flowReversal > 0.7)
            labels.push('flow_reversal');
        if (features.toxicityLevel > 0.6)
            labels.push('toxic_flow');
        if (features.informedTradingProbability > 0.6)
            labels.push('informed_trading');
        return labels.length > 0 ? labels.join('_') : 'neutral';
    }
    /**
     * Calculate trend of a series
     */
    calculateTrend(series) {
        if (series.length < 2)
            return 0;
        const changes = [];
        for (let i = 1; i < series.length; i++) {
            changes.push(series[i] - series[i - 1]);
        }
        return changes.reduce((a, b) => a + b, 0) / changes.length;
    }
    /**
     * Calculate volatility
     */
    calculateVolatility(series) {
        if (series.length < 2)
            return 0;
        const mean = series.reduce((a, b) => a + b, 0) / series.length;
        const variance = series.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / series.length;
        return Math.sqrt(variance);
    }
    /**
     * Calculate mean
     */
    calculateMean(series) {
        if (series.length === 0)
            return 0;
        return series.reduce((a, b) => a + b, 0) / series.length;
    }
    /**
     * Calculate persistence
     */
    calculatePersistence(series) {
        if (series.length < 2)
            return 0;
        let persistenceCount = 0;
        for (let i = 1; i < series.length; i++) {
            if (Math.sign(series[i]) === Math.sign(series[i - 1])) {
                persistenceCount++;
            }
        }
        return persistenceCount / (series.length - 1);
    }
    /**
     * Detect reversal
     */
    detectReversal(series) {
        if (series.length < 3)
            return 0;
        let reversalCount = 0;
        for (let i = 2; i < series.length; i++) {
            const prev = series[i - 2];
            const curr = series[i - 1];
            const next = series[i];
            if ((prev > curr && curr < next) || (prev < curr && curr > next)) {
                reversalCount++;
            }
        }
        return reversalCount / (series.length - 2);
    }
    /**
     * Calculate price efficiency
     */
    calculateEfficiency(metrics) {
        if (metrics.length < 2)
            return 1;
        // Efficiency = actual price path / ideal (straight line) path
        const priceChanges = [];
        for (let i = 1; i < metrics.length; i++) {
            priceChanges.push(Math.abs(metrics[i].midPrice - metrics[i - 1].midPrice));
        }
        const actualPath = priceChanges.reduce((a, b) => a + b, 0);
        const idealPath = Math.abs(metrics[metrics.length - 1].midPrice - metrics[0].midPrice);
        if (actualPath === 0)
            return 1;
        return Math.min(1, idealPath / actualPath);
    }
    /**
     * Close and cleanup
     */
    async close() {
        await this.agentDb.close();
    }
}
exports.PatternLearner = PatternLearner;
//# sourceMappingURL=pattern-learner.js.map