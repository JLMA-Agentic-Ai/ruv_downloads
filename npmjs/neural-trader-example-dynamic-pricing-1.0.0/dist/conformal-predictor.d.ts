/**
 * Conformal prediction for demand uncertainty quantification
 */
import { ConformalPrediction } from './types';
export declare class ConformalPredictor {
    private calibrationScores;
    private alpha;
    constructor(alpha?: number);
    /**
     * Calibrate predictor with historical data
     */
    calibrate(predictions: number[], actuals: number[]): void;
    /**
     * Make conformal prediction with uncertainty bounds
     */
    predict(pointPrediction: number): ConformalPrediction;
    /**
     * Adaptive conformal prediction (updates as new data arrives)
     */
    adaptivePredict(pointPrediction: number, recentPredictions: number[], recentActuals: number[]): ConformalPrediction;
    /**
     * Multi-step ahead conformal prediction
     */
    multiStepPredict(pointPredictions: number[], horizon: number): ConformalPrediction[];
    /**
     * Check if actual value falls within prediction interval
     */
    isValid(prediction: ConformalPrediction, actual: number): boolean;
    /**
     * Calculate empirical coverage
     */
    calculateCoverage(predictions: ConformalPrediction[], actuals: number[]): number;
    /**
     * Get calibration statistics
     */
    getCalibrationStats(): {
        numSamples: number;
        medianScore: number;
        quantile95: number;
        quantile90: number;
    };
}
//# sourceMappingURL=conformal-predictor.d.ts.map