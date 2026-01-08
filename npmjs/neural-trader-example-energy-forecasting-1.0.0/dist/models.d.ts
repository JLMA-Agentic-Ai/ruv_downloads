/**
 * Time series forecasting model implementations
 * Simple pure-TypeScript implementations for demonstration
 */
import { TimeSeriesPoint, ModelType, ModelPerformance } from './types';
/**
 * Base forecasting model interface
 */
export interface ForecastingModel {
    modelType: ModelType;
    train(data: TimeSeriesPoint[]): Promise<void>;
    predict(steps: number): Promise<number[]>;
    getPerformance(): ModelPerformance;
    clone(): ForecastingModel;
}
/**
 * Simple ARIMA-like model (exponential smoothing)
 */
export declare class ARIMAModel implements ForecastingModel {
    modelType: ModelType;
    private alpha;
    private beta;
    private level;
    private trend;
    private trained;
    constructor(alpha?: number, beta?: number);
    train(data: TimeSeriesPoint[]): Promise<void>;
    predict(steps: number): Promise<number[]>;
    getPerformance(): ModelPerformance;
    clone(): ForecastingModel;
}
/**
 * LSTM-inspired model (simple recurrent pattern)
 */
export declare class LSTMModel implements ForecastingModel {
    modelType: ModelType;
    private lookback;
    private weights;
    private recentValues;
    private trained;
    constructor(lookback?: number);
    train(data: TimeSeriesPoint[]): Promise<void>;
    predict(steps: number): Promise<number[]>;
    getPerformance(): ModelPerformance;
    clone(): ForecastingModel;
}
/**
 * Transformer-inspired model (self-attention)
 */
export declare class TransformerModel implements ForecastingModel {
    modelType: ModelType;
    private sequenceLength;
    private attentionWeights;
    private recentValues;
    private trained;
    constructor(sequenceLength?: number);
    train(data: TimeSeriesPoint[]): Promise<void>;
    predict(steps: number): Promise<number[]>;
    getPerformance(): ModelPerformance;
    clone(): ForecastingModel;
}
/**
 * Prophet-inspired model (trend + seasonality)
 */
export declare class ProphetModel implements ForecastingModel {
    modelType: ModelType;
    private seasonalPeriod;
    private trend;
    private seasonal;
    private trained;
    constructor(seasonalPeriod?: number);
    train(data: TimeSeriesPoint[]): Promise<void>;
    predict(steps: number): Promise<number[]>;
    getPerformance(): ModelPerformance;
    clone(): ForecastingModel;
}
/**
 * Model factory
 */
export declare function createModel(modelType: ModelType, hyperparameters?: Record<string, any>): ForecastingModel;
//# sourceMappingURL=models.d.ts.map