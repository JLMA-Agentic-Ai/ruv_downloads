/**
 * Patient Arrival Forecaster
 *
 * Self-learning prediction of patient arrivals with uncertainty quantification.
 * Uses @neural-trader/predictor with seasonal pattern detection.
 */
import type { ForecastResult, PrivacyConfig } from './types.js';
export interface ArrivalForecasterConfig {
    agentdbPath: string;
    enableNapiRS: boolean;
    privacy: PrivacyConfig;
    lookbackDays: number;
    forecastHorizon: number;
    confidenceLevel: number;
}
export declare class ArrivalForecaster {
    private predictor;
    private memory;
    private config;
    private patterns;
    constructor(config: ArrivalForecasterConfig);
    /**
     * Train forecaster on historical arrival data
     */
    train(historicalData: Array<{
        timestamp: Date;
        arrivals: number;
    }>): Promise<void>;
    /**
     * Forecast patient arrivals with uncertainty
     */
    forecast(timestamp: Date): Promise<ForecastResult>;
    /**
     * Forecast multiple time periods ahead
     */
    forecastHorizon(startTime: Date): Promise<ForecastResult[]>;
    /**
     * Update forecaster with actual arrivals (online learning)
     */
    updateWithActuals(timestamp: Date, actualArrivals: number): Promise<void>;
    /**
     * Extract temporal features from timestamp
     */
    private extractFeatures;
    /**
     * Learn seasonal patterns from historical data
     */
    private learnSeasonalPatterns;
    /**
     * Get seasonal adjustment factor
     */
    private getSeasonalFactor;
    /**
     * Get trend component
     */
    private getTrendComponent;
    /**
     * Get historical variance for confidence intervals
     */
    private getHistoricalVariance;
    /**
     * Get z-score for confidence level
     */
    private getZScore;
    /**
     * Store forecast for learning
     */
    private storeForecast;
    /**
     * Update seasonal pattern based on new data
     */
    private updateSeasonalPattern;
    /**
     * Incremental retrain with recent data
     */
    private incrementalRetrain;
    /**
     * Get forecast accuracy metrics
     */
    getAccuracyMetrics(): Promise<{
        mae: number;
        rmse: number;
        mape: number;
        samples: number;
    }>;
}
//# sourceMappingURL=arrival-forecaster.d.ts.map