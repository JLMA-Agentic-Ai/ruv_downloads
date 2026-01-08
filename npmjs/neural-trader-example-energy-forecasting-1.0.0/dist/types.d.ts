/**
 * Core types for energy forecasting system
 */
import type { PredictionInterval } from '@neural-trader/predictor';
/**
 * Time series data point
 */
export interface TimeSeriesPoint {
    timestamp: number;
    value: number;
    metadata?: Record<string, any>;
}
/**
 * Forecasting result with conformal prediction intervals
 */
export interface ForecastResult {
    timestamp: number;
    pointForecast: number;
    interval: PredictionInterval;
    modelUsed: string;
    confidence: number;
    seasonalComponent?: number;
    trendComponent?: number;
    metadata?: Record<string, any>;
}
/**
 * Multi-step ahead forecast
 */
export interface MultiStepForecast {
    forecasts: ForecastResult[];
    horizon: number;
    generatedAt: number;
    modelPerformance: ModelPerformance;
}
/**
 * Model performance metrics
 */
export interface ModelPerformance {
    modelName: string;
    mape: number;
    rmse: number;
    mae: number;
    coverage: number;
    intervalWidth: number;
    lastUpdated: number;
}
/**
 * Ensemble model configuration
 */
export interface EnsembleConfig {
    models: ModelType[];
    horizonWeights?: Map<number, Map<ModelType, number>>;
    adaptiveLearningRate?: number;
    retrainFrequency?: number;
    minCalibrationSamples?: number;
}
/**
 * Supported model types
 */
export declare enum ModelType {
    ARIMA = "arima",
    LSTM = "lstm",
    TRANSFORMER = "transformer",
    PROPHET = "prophet",
    ENSEMBLE = "ensemble"
}
/**
 * Forecaster configuration
 */
export interface ForecasterConfig {
    alpha?: number;
    calibrationSize?: number;
    horizon?: number;
    seasonalPeriod?: number;
    enableAdaptive?: boolean;
    ensembleConfig?: EnsembleConfig;
    weatherIntegration?: WeatherConfig;
}
/**
 * Weather integration configuration
 */
export interface WeatherConfig {
    enabled: boolean;
    openRouterApiKey?: string;
    features?: string[];
    location?: {
        latitude: number;
        longitude: number;
    };
}
/**
 * Seasonal pattern information
 */
export interface SeasonalPattern {
    period: number;
    strength: number;
    components: number[];
}
/**
 * Energy forecasting domain types
 */
export declare enum EnergyDomain {
    SOLAR = "solar_generation",
    WIND = "wind_power",
    DEMAND = "electricity_demand",
    TEMPERATURE = "temperature"
}
/**
 * Domain-specific metadata
 */
export interface DomainMetadata {
    domain: EnergyDomain;
    unit: string;
    capacity?: number;
    location?: string;
    additionalFeatures?: Record<string, number>;
}
/**
 * Model training result
 */
export interface TrainingResult {
    modelType: ModelType;
    trainDuration: number;
    samples: number;
    performance: ModelPerformance;
    hyperparameters?: Record<string, any>;
}
/**
 * Swarm exploration result
 */
export interface SwarmExplorationResult {
    bestModel: ModelType;
    bestHyperparameters: Record<string, any>;
    allResults: TrainingResult[];
    explorationTime: number;
    convergenceMetric: number;
}
//# sourceMappingURL=types.d.ts.map