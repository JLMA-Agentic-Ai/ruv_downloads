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
import { ConformalConfig } from '@neural-trader/predictor';
export interface DemandPattern {
    productId: string;
    timestamp: number;
    demand: number;
    features: {
        dayOfWeek: number;
        weekOfYear: number;
        monthOfYear: number;
        isHoliday: boolean;
        promotions: number;
        priceIndex: number;
    };
}
export interface DemandForecast {
    productId: string;
    horizon: number;
    pointForecast: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
    seasonalComponent: number;
    trendComponent: number;
    uncertainty: number;
}
export interface ForecastConfig extends ConformalConfig {
    horizons: number[];
    seasonalityPeriods: number[];
    learningRate: number;
    memoryNamespace: string;
}
export declare class DemandForecaster {
    private predictor;
    private memory;
    private config;
    private seasonalPatterns;
    private trendModels;
    constructor(config: ForecastConfig);
    /**
     * Train forecaster on historical demand patterns
     */
    train(patterns: DemandPattern[]): Promise<void>;
    /**
     * Generate demand forecast with uncertainty bounds
     */
    forecast(productId: string, currentFeatures: DemandPattern['features'], horizon?: number): Promise<DemandForecast>;
    /**
     * Multi-horizon forecasting
     */
    forecastMultiHorizon(productId: string, currentFeatures: DemandPattern['features']): Promise<DemandForecast[]>;
    /**
     * Update forecaster with new observations (online learning)
     */
    update(observation: DemandPattern): Promise<void>;
    /**
     * Extract seasonal patterns from historical data
     */
    private extractSeasonality;
    /**
     * Fit simple linear trend model
     */
    private fitTrendModel;
    /**
     * Update trend model with new observation
     */
    private updateTrendModel;
    /**
     * Get seasonal component for forecast
     */
    private getSeasonalComponent;
    /**
     * Get trend component for forecast
     */
    private getTrendComponent;
    /**
     * Prepare features for prediction
     */
    private prepareFeatures;
    /**
     * Prepare training data from patterns
     */
    private prepareTrainingData;
    /**
     * Store patterns in AgentDB for retrieval
     */
    private storePatterns;
    /**
     * Store single pattern in AgentDB
     */
    private storePattern;
    /**
     * Retrieve similar historical patterns
     */
    private retrieveSimilarPatterns;
    /**
     * Update seasonality with new observation
     */
    private updateSeasonality;
    /**
     * Calculate forecast uncertainty
     */
    private calculateUncertainty;
    /**
     * Group patterns by product
     */
    private groupByProduct;
    /**
     * Get calibration metrics
     */
    getCalibration(): {
        coverage: number;
        intervalWidth: number;
    };
}
//# sourceMappingURL=demand-forecaster.d.ts.map