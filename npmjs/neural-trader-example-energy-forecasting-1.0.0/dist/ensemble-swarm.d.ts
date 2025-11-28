/**
 * Swarm-based ensemble learning for energy forecasting
 * Explores multiple model architectures and hyperparameters in parallel
 */
import { ModelType, TimeSeriesPoint, EnsembleConfig, SwarmExplorationResult, ModelPerformance } from './types';
/**
 * Ensemble swarm coordinator
 * Manages parallel model training and adaptive model selection
 */
export declare class EnsembleSwarm {
    private models;
    private modelPerformance;
    private horizonWeights;
    private config;
    constructor(config: EnsembleConfig);
    /**
     * Explore hyperparameter space using swarm intelligence
     */
    exploreHyperparameters(modelType: ModelType, data: TimeSeriesPoint[], validationData: TimeSeriesPoint[]): Promise<SwarmExplorationResult>;
    /**
     * Train ensemble with multiple model types
     */
    trainEnsemble(trainingData: TimeSeriesPoint[], validationData: TimeSeriesPoint[]): Promise<void>;
    /**
     * Predict using adaptive ensemble
     */
    predict(horizon: number): Promise<{
        predictions: number[];
        selectedModel: string;
    }>;
    /**
     * Update ensemble with new observations (adaptive learning)
     */
    updateWithObservation(predictions: Map<string, number>, actual: number, horizon: number): Promise<void>;
    /**
     * Get ensemble statistics
     */
    getEnsembleStats(): {
        modelCount: number;
        performances: Array<{
            model: string;
            performance: ModelPerformance;
        }>;
        horizonWeights: Map<number, Map<ModelType, number>>;
    };
    /**
     * Get hyperparameter space for model type
     */
    private getHyperparameterSpace;
    /**
     * Generate candidate hyperparameter configurations
     */
    private generateCandidates;
    /**
     * Evaluate model performance on validation data
     */
    private evaluateModel;
    /**
     * Initialize horizon-based weights
     */
    private initializeHorizonWeights;
    /**
     * Get weights for a specific horizon (interpolate if needed)
     */
    private getHorizonWeights;
    /**
     * Normalize weights for a horizon to sum to 1
     */
    private normalizeHorizonWeights;
    /**
     * Generate model key
     */
    private getModelKey;
    /**
     * Extract model type from model key
     */
    private extractModelType;
}
//# sourceMappingURL=ensemble-swarm.d.ts.map