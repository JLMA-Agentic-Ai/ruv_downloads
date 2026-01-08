"use strict";
/**
 * Self-Learning Demand Forecaster with Conformal Prediction
 *
 * Features:
 * - Demand sensing with uncertainty quantification
 * - Conformal prediction intervals
 * - Seasonal pattern recognition via AgentDB
 * - Lead time uncertainty modeling
 * - Multi-horizon forecasting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandForecaster = void 0;
const predictor_1 = require("@neural-trader/predictor");
const agentdb_1 = require("agentdb");
class DemandForecaster {
    predictor;
    memory;
    config;
    seasonalPatterns;
    trendModels;
    constructor(config) {
        this.config = config;
        this.predictor = new predictor_1.ConformalPredictor(config);
        this.memory = new agentdb_1.AgentDB({
            namespace: config.memoryNamespace,
            dimensions: 64,
            quantization: '4bit',
        });
        this.seasonalPatterns = new Map();
        this.trendModels = new Map();
    }
    /**
     * Train forecaster on historical demand patterns
     */
    async train(patterns) {
        // Group by product
        const productGroups = this.groupByProduct(patterns);
        for (const [productId, productPatterns] of productGroups.entries()) {
            // Extract seasonal patterns
            await this.extractSeasonality(productId, productPatterns);
            // Fit trend model
            this.fitTrendModel(productId, productPatterns);
            // Prepare training data for conformal predictor
            const { features, targets } = this.prepareTrainingData(productPatterns);
            // Train conformal predictor
            this.predictor.fit(features, targets);
            // Store patterns in AgentDB for retrieval
            await this.storePatterns(productId, productPatterns);
        }
    }
    /**
     * Generate demand forecast with uncertainty bounds
     */
    async forecast(productId, currentFeatures, horizon = 1) {
        // Retrieve similar historical patterns
        const similarPatterns = await this.retrieveSimilarPatterns(productId, currentFeatures);
        // Get seasonal component
        const seasonalComponent = this.getSeasonalComponent(productId, currentFeatures);
        // Get trend component
        const trendComponent = this.getTrendComponent(productId, horizon);
        // Prepare features for prediction
        const features = this.prepareFeatures(currentFeatures, seasonalComponent, trendComponent);
        // Get conformal prediction with intervals
        const prediction = this.predictor.predict([features], this.config.alpha);
        // Calculate uncertainty
        const uncertainty = this.calculateUncertainty(prediction.intervals[0], similarPatterns, horizon);
        return {
            productId,
            horizon,
            pointForecast: prediction.predictions[0],
            lowerBound: prediction.intervals[0][0],
            upperBound: prediction.intervals[0][1],
            confidence: 1 - this.config.alpha,
            seasonalComponent,
            trendComponent,
            uncertainty,
        };
    }
    /**
     * Multi-horizon forecasting
     */
    async forecastMultiHorizon(productId, currentFeatures) {
        const forecasts = [];
        for (const horizon of this.config.horizons) {
            const forecast = await this.forecast(productId, currentFeatures, horizon);
            forecasts.push(forecast);
        }
        return forecasts;
    }
    /**
     * Update forecaster with new observations (online learning)
     */
    async update(observation) {
        // Update conformal predictor scores
        const features = this.prepareFeatures(observation.features, this.getSeasonalComponent(observation.productId, observation.features), this.getTrendComponent(observation.productId, 1));
        this.predictor.update([features], [observation.demand]);
        // Update seasonal patterns
        await this.updateSeasonality(observation);
        // Update trend model
        this.updateTrendModel(observation);
        // Store in AgentDB
        await this.storePattern(observation);
    }
    /**
     * Extract seasonal patterns from historical data
     */
    async extractSeasonality(productId, patterns) {
        const seasonal = new Array(52).fill(0); // Weekly seasonality
        const counts = new Array(52).fill(0);
        for (const pattern of patterns) {
            const week = pattern.features.weekOfYear;
            seasonal[week] = (seasonal[week] ?? 0) + pattern.demand;
            counts[week] = (counts[week] ?? 0) + 1;
        }
        // Average by week
        for (let i = 0; i < 52; i++) {
            if (counts[i] > 0) {
                seasonal[i] = (seasonal[i] ?? 0) / counts[i];
            }
        }
        // Normalize
        const mean = seasonal.reduce((a, b) => a + b, 0) / seasonal.length;
        for (let i = 0; i < seasonal.length; i++) {
            seasonal[i] = (seasonal[i] ?? 0) / mean;
        }
        this.seasonalPatterns.set(productId, seasonal);
        // Store in AgentDB
        await this.memory.store({
            key: `seasonal:${productId}`,
            value: seasonal,
            metadata: { type: 'seasonality', productId },
        });
    }
    /**
     * Fit simple linear trend model
     */
    fitTrendModel(productId, patterns) {
        const n = patterns.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        patterns.forEach((p, i) => {
            sumX += i;
            sumY += p.demand;
            sumXY += i * p.demand;
            sumX2 += i * i;
        });
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        this.trendModels.set(productId, { slope, intercept });
    }
    /**
     * Update trend model with new observation
     */
    updateTrendModel(observation) {
        const current = this.trendModels.get(observation.productId);
        if (!current)
            return;
        // Simple exponential smoothing of trend
        const alpha = this.config.learningRate;
        const error = observation.demand - (current.intercept + current.slope);
        current.intercept += alpha * error;
        current.slope += alpha * error * 0.1; // Slower trend adaptation
        this.trendModels.set(observation.productId, current);
    }
    /**
     * Get seasonal component for forecast
     */
    getSeasonalComponent(productId, features) {
        const seasonal = this.seasonalPatterns.get(productId);
        if (!seasonal)
            return 1.0;
        return seasonal[features.weekOfYear] ?? 1.0;
    }
    /**
     * Get trend component for forecast
     */
    getTrendComponent(productId, horizon) {
        const trend = this.trendModels.get(productId);
        if (!trend)
            return 0;
        return trend.slope * horizon;
    }
    /**
     * Prepare features for prediction
     */
    prepareFeatures(features, seasonal, trend) {
        return [
            features.dayOfWeek / 7,
            features.weekOfYear / 52,
            features.monthOfYear / 12,
            features.isHoliday ? 1 : 0,
            features.promotions,
            features.priceIndex,
            seasonal,
            trend,
        ];
    }
    /**
     * Prepare training data from patterns
     */
    prepareTrainingData(patterns) {
        const features = [];
        const targets = [];
        for (const pattern of patterns) {
            const seasonal = this.getSeasonalComponent(pattern.productId, pattern.features);
            const trend = this.getTrendComponent(pattern.productId, 1);
            features.push(this.prepareFeatures(pattern.features, seasonal, trend));
            targets.push(pattern.demand);
        }
        return { features, targets };
    }
    /**
     * Store patterns in AgentDB for retrieval
     */
    async storePatterns(productId, patterns) {
        for (const pattern of patterns) {
            await this.storePattern(pattern);
        }
    }
    /**
     * Store single pattern in AgentDB
     */
    async storePattern(pattern) {
        const embedding = this.prepareFeatures(pattern.features, this.getSeasonalComponent(pattern.productId, pattern.features), this.getTrendComponent(pattern.productId, 1));
        await this.memory.store({
            key: `pattern:${pattern.productId}:${pattern.timestamp}`,
            value: embedding,
            metadata: {
                productId: pattern.productId,
                demand: pattern.demand,
                timestamp: pattern.timestamp,
            },
        });
    }
    /**
     * Retrieve similar historical patterns
     */
    async retrieveSimilarPatterns(productId, features) {
        const queryEmbedding = this.prepareFeatures(features, this.getSeasonalComponent(productId, features), 0);
        const results = await this.memory.search({
            query: queryEmbedding,
            k: 10,
            filter: { productId },
        });
        return results.map((r) => ({
            productId: r.metadata.productId,
            timestamp: r.metadata.timestamp,
            demand: r.metadata.demand,
            features,
        }));
    }
    /**
     * Update seasonality with new observation
     */
    async updateSeasonality(observation) {
        const seasonal = this.seasonalPatterns.get(observation.productId);
        if (!seasonal)
            return;
        const week = observation.features.weekOfYear;
        const alpha = this.config.learningRate;
        // Exponential smoothing
        seasonal[week] = (1 - alpha) * (seasonal[week] ?? 1) + alpha * observation.demand;
        this.seasonalPatterns.set(observation.productId, seasonal);
    }
    /**
     * Calculate forecast uncertainty
     */
    calculateUncertainty(interval, similarPatterns, horizon) {
        // Base uncertainty from prediction interval width
        const intervalWidth = interval[1] - interval[0];
        // Adjust for horizon (uncertainty increases with horizon)
        const horizonFactor = 1 + 0.1 * horizon;
        // Adjust for pattern similarity (less similar = more uncertain)
        const similarityFactor = similarPatterns.length > 0 ? 1 : 1.5;
        return intervalWidth * horizonFactor * similarityFactor;
    }
    /**
     * Group patterns by product
     */
    groupByProduct(patterns) {
        const groups = new Map();
        for (const pattern of patterns) {
            const existing = groups.get(pattern.productId) ?? [];
            existing.push(pattern);
            groups.set(pattern.productId, existing);
        }
        return groups;
    }
    /**
     * Get calibration metrics
     */
    getCalibration() {
        return this.predictor.getCalibration();
    }
}
exports.DemandForecaster = DemandForecaster;
//# sourceMappingURL=demand-forecaster.js.map