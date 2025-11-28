"use strict";
/**
 * Core energy forecasting system
 * Combines ensemble models with conformal prediction for uncertainty quantification
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyForecaster = void 0;
const conformal_predictor_1 = require("./conformal-predictor");
const ensemble_swarm_1 = require("./ensemble-swarm");
const types_1 = require("./types");
/**
 * Main energy forecasting system
 */
class EnergyForecaster {
    ensemble;
    conformalPredictors = new Map();
    config;
    trainingData = [];
    domain;
    seasonalPattern = null;
    constructor(domain, config = {}) {
        this.domain = domain;
        this.config = {
            alpha: config.alpha ?? 0.1,
            calibrationSize: config.calibrationSize ?? 2000,
            horizon: config.horizon ?? 24,
            seasonalPeriod: config.seasonalPeriod ?? 24,
            enableAdaptive: config.enableAdaptive ?? true,
            ensembleConfig: config.ensembleConfig ?? {
                models: [types_1.ModelType.ARIMA, types_1.ModelType.LSTM, types_1.ModelType.TRANSFORMER, types_1.ModelType.PROPHET]
            },
            weatherIntegration: config.weatherIntegration ?? { enabled: false }
        };
        this.ensemble = new ensemble_swarm_1.EnsembleSwarm(this.config.ensembleConfig);
    }
    /**
     * Initialize and train the forecasting system
     */
    async train(data) {
        if (data.length < 100) {
            throw new Error('Need at least 100 data points for training');
        }
        this.trainingData = data;
        // Detect seasonal patterns
        this.seasonalPattern = this.detectSeasonalPattern(data);
        // Split data for training and validation
        const splitIndex = Math.floor(data.length * 0.8);
        const trainingData = data.slice(0, splitIndex);
        const validationData = data.slice(splitIndex);
        console.info(`Training ensemble with ${trainingData.length} samples...`);
        // Train ensemble swarm
        await this.ensemble.trainEnsemble(trainingData, validationData);
        console.info('Initializing conformal predictors...');
        // Initialize conformal predictors for each model type
        const initPromises = this.config.ensembleConfig.models.map(async (modelType) => {
            const predictor = new conformal_predictor_1.EnergyConformalPredictor(modelType, {
                alpha: this.config.alpha,
                calibrationSize: this.config.calibrationSize
            }, this.config.enableAdaptive);
            await predictor.initialize();
            // Get predictions for calibration
            const { predictions } = await this.ensemble.predict(validationData.length);
            // Calibrate conformal predictor
            await predictor.calibrate(validationData, predictions);
            this.conformalPredictors.set(modelType, predictor);
            console.info(`${modelType} conformal predictor calibrated`);
        });
        await Promise.all(initPromises);
        console.info('Training complete!');
    }
    /**
     * Generate multi-step ahead forecast with uncertainty quantification
     */
    async forecast(horizon) {
        const forecastHorizon = horizon ?? this.config.horizon;
        if (this.conformalPredictors.size === 0) {
            throw new Error('Forecaster not trained. Call train() first.');
        }
        // Get ensemble predictions
        const { predictions, selectedModel } = await this.ensemble.predict(forecastHorizon);
        // Extract model type from selected model
        const modelType = this.extractModelType(selectedModel);
        // Get conformal predictor for selected model
        const conformalPredictor = this.conformalPredictors.get(modelType);
        if (!conformalPredictor) {
            throw new Error(`No conformal predictor for ${modelType}`);
        }
        // Generate forecasts with prediction intervals
        const currentTime = Date.now();
        const forecasts = [];
        for (let i = 0; i < forecastHorizon; i++) {
            const timestamp = currentTime + (i + 1) * 3600000; // Assuming hourly data
            const pointPrediction = predictions[i];
            // Add seasonal component if available
            let adjustedPrediction = pointPrediction;
            let seasonalComponent = 0;
            if (this.seasonalPattern) {
                const seasonalIndex = i % this.seasonalPattern.period;
                seasonalComponent = this.seasonalPattern.components[seasonalIndex];
                adjustedPrediction += seasonalComponent;
            }
            // Get conformal prediction interval
            const forecast = await conformalPredictor.forecast(adjustedPrediction, timestamp);
            forecast.seasonalComponent = seasonalComponent;
            forecast.metadata = {
                ...forecast.metadata,
                selectedModel,
                horizon: i + 1,
                domain: this.domain
            };
            forecasts.push(forecast);
        }
        // Get model performance
        const stats = conformalPredictor.getStats();
        const modelPerformance = {
            modelName: selectedModel,
            mape: stats.recentPerformance?.mape || 0,
            rmse: stats.recentPerformance?.rmse || 0,
            mae: stats.recentPerformance?.mae || 0,
            coverage: stats.empiricalCoverage || 0.9,
            intervalWidth: forecasts.reduce((sum, f) => sum + f.interval.width(), 0) / forecasts.length,
            lastUpdated: Date.now()
        };
        return {
            forecasts,
            horizon: forecastHorizon,
            generatedAt: currentTime,
            modelPerformance
        };
    }
    /**
     * Update forecaster with new observation (online learning)
     */
    async update(actual) {
        // Generate single-step prediction for the timestamp
        const { forecasts } = await this.forecast(1);
        const prediction = forecasts[0].pointForecast;
        // Update all conformal predictors
        const updatePromises = Array.from(this.conformalPredictors.values()).map((predictor) => predictor.update(prediction, actual.value, actual.timestamp));
        await Promise.all(updatePromises);
        // Update ensemble with observation
        const modelPredictions = new Map();
        const ensembleStats = this.ensemble.getEnsembleStats();
        for (const { model } of ensembleStats.performances) {
            modelPredictions.set(model, prediction);
        }
        await this.ensemble.updateWithObservation(modelPredictions, actual.value, 1);
        // Add to training data
        this.trainingData.push(actual);
        // Maintain maximum training data size
        if (this.trainingData.length > 10000) {
            this.trainingData.shift();
        }
    }
    /**
     * Get forecaster statistics
     */
    getStats() {
        const ensembleStats = this.ensemble.getEnsembleStats();
        const conformalStats = Array.from(this.conformalPredictors.entries()).map(([modelType, predictor]) => ({
            modelType,
            stats: predictor.getStats()
        }));
        return {
            domain: this.domain,
            trainingPoints: this.trainingData.length,
            ensembleStats,
            conformalStats,
            seasonalPattern: this.seasonalPattern
        };
    }
    /**
     * Detect seasonal patterns in data
     */
    detectSeasonalPattern(data) {
        if (data.length < this.config.seasonalPeriod * 2) {
            return null;
        }
        const period = this.config.seasonalPeriod;
        const components = Array(period).fill(0);
        const counts = Array(period).fill(0);
        // Compute trend
        const values = data.map(d => d.value);
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        // Detrend
        const detrended = values.map((y, x) => y - (intercept + slope * x));
        // Compute seasonal components
        for (let i = 0; i < detrended.length; i++) {
            const seasonalIndex = i % period;
            components[seasonalIndex] += detrended[i];
            counts[seasonalIndex]++;
        }
        for (let i = 0; i < period; i++) {
            if (counts[i] > 0) {
                components[i] /= counts[i];
            }
        }
        // Compute seasonal strength
        const seasonalVariance = components.reduce((sum, c) => sum + c * c, 0) / components.length;
        const totalVariance = detrended.reduce((sum, d) => sum + d * d, 0) / detrended.length;
        const strength = Math.min(1, seasonalVariance / (totalVariance + 1e-10));
        return {
            period,
            strength,
            components
        };
    }
    /**
     * Extract model type from model key
     */
    extractModelType(modelKey) {
        const type = modelKey.split(':')[0];
        return type;
    }
    /**
     * Reset forecaster state
     */
    async reset() {
        this.trainingData = [];
        this.conformalPredictors.clear();
        this.seasonalPattern = null;
        this.ensemble = new ensemble_swarm_1.EnsembleSwarm(this.config.ensembleConfig);
    }
}
exports.EnergyForecaster = EnergyForecaster;
//# sourceMappingURL=forecaster.js.map