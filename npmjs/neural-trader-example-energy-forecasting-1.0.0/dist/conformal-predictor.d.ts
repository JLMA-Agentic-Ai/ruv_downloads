/**
 * Conformal prediction wrapper for energy forecasting
 * Provides uncertainty quantification with guaranteed coverage
 */
import { type PredictorConfig } from '@neural-trader/predictor';
import { TimeSeriesPoint, ForecastResult, ModelType } from './types';
/**
 * Energy forecasting conformal predictor
 * Wraps @neural-trader/predictor for time series forecasting
 */
export declare class EnergyConformalPredictor {
    private predictor;
    private implementationType;
    private isAdaptive;
    private modelType;
    private calibrationHistory;
    constructor(modelType: ModelType, config?: Partial<PredictorConfig>, adaptive?: boolean);
    /**
     * Initialize the predictor (auto-detects best implementation)
     */
    initialize(): Promise<void>;
    /**
     * Calibrate predictor with historical data
     */
    calibrate(historicalData: TimeSeriesPoint[], modelPredictions: number[]): Promise<void>;
    /**
     * Make a forecast with conformal prediction interval
     */
    forecast(pointPrediction: number, timestamp: number, actualValue?: number): Promise<ForecastResult>;
    /**
     * Update predictor with new observation
     */
    update(prediction: number, actual: number, timestamp: number): Promise<void>;
    /**
     * Get predictor statistics
     */
    getStats(): any;
    /**
     * Compute empirical coverage on validation set
     */
    computeCoverage(predictions: number[], actuals: number[]): number;
    /**
     * Reset predictor state
     */
    reset(): Promise<void>;
    /**
     * Get implementation type
     */
    getImplementationType(): string;
    /**
     * Check if predictor is ready
     */
    isReady(): boolean;
}
//# sourceMappingURL=conformal-predictor.d.ts.map