/**
 * Core energy forecasting system
 * Combines ensemble models with conformal prediction for uncertainty quantification
 */
import { TimeSeriesPoint, MultiStepForecast, ForecasterConfig, ModelType, EnergyDomain, SeasonalPattern } from './types';
/**
 * Main energy forecasting system
 */
export declare class EnergyForecaster {
    private ensemble;
    private conformalPredictors;
    private config;
    private trainingData;
    private domain;
    private seasonalPattern;
    constructor(domain: EnergyDomain, config?: ForecasterConfig);
    /**
     * Initialize and train the forecasting system
     */
    train(data: TimeSeriesPoint[]): Promise<void>;
    /**
     * Generate multi-step ahead forecast with uncertainty quantification
     */
    forecast(horizon?: number): Promise<MultiStepForecast>;
    /**
     * Update forecaster with new observation (online learning)
     */
    update(actual: TimeSeriesPoint): Promise<void>;
    /**
     * Get forecaster statistics
     */
    getStats(): {
        domain: EnergyDomain;
        trainingPoints: number;
        ensembleStats: any;
        conformalStats: Array<{
            modelType: ModelType;
            stats: any;
        }>;
        seasonalPattern: SeasonalPattern | null;
    };
    /**
     * Detect seasonal patterns in data
     */
    private detectSeasonalPattern;
    /**
     * Extract model type from model key
     */
    private extractModelType;
    /**
     * Reset forecaster state
     */
    reset(): Promise<void>;
}
//# sourceMappingURL=forecaster.d.ts.map