/**
 * Reservoir Computing / Liquid State Machines (LSM)
 *
 * A reservoir is a recurrent network of spiking neurons with fixed random connections.
 * Only the readout layer is trained, making it computationally efficient.
 *
 * Key features:
 * - High-dimensional dynamic reservoir transforms input
 * - Fixed recurrent connections (not trained)
 * - Simple linear readout layer
 * - Excellent for temporal pattern recognition
 * - Memory of past inputs through recurrent dynamics
 */
import { LIFNeuronParams } from './snn';
export interface ReservoirParams {
    /** Number of neurons in reservoir */
    reservoir_size: number;
    /** Number of input neurons */
    input_size: number;
    /** Number of output neurons */
    output_size: number;
    /** Connection probability within reservoir */
    recurrent_prob: number;
    /** Input to reservoir connection probability */
    input_prob: number;
    /** Spectral radius (controls dynamics stability) */
    spectral_radius: number;
    /** Input scaling factor */
    input_scaling: number;
}
export interface ReadoutWeights {
    /** Weights from reservoir to output [output_size x reservoir_size] */
    weights: number[][];
    /** Bias terms [output_size] */
    bias: number[];
}
/**
 * Liquid State Machine (Reservoir Computing with SNNs)
 */
export declare class LiquidStateMachine {
    private params;
    private reservoir;
    private readout_weights;
    private input_weights;
    private reservoir_state;
    constructor(params?: Partial<ReservoirParams>, neuron_params?: Partial<LIFNeuronParams>);
    /**
     * Initialize reservoir with random recurrent connections
     */
    private initializeReservoir;
    /**
     * Process input through reservoir and get reservoir state
     * @param input Input spike pattern (0 or 1 for each input neuron)
     * @param duration Simulation duration (ms)
     * @returns Reservoir state (spike counts per neuron)
     */
    processInput(input: number[], duration?: number): number[];
    /**
     * Compute output using linear readout
     * @param reservoir_state Current reservoir state
     * @returns Output activations
     */
    private computeOutput;
    /**
     * Forward pass: input → reservoir → output
     * @param input Input pattern
     * @param duration Reservoir simulation duration (ms)
     * @returns Output activations
     */
    forward(input: number[], duration?: number): number[];
    /**
     * Train readout layer using least-squares regression
     * @param inputs Training inputs [n_samples x input_size]
     * @param targets Target outputs [n_samples x output_size]
     * @param duration Reservoir simulation duration per sample (ms)
     * @returns Training error (MSE)
     */
    trainReadout(inputs: number[][], targets: number[][], duration?: number): number;
    /**
     * Solve linear regression using normal equations (simplified)
     * In production, use a proper linear algebra library
     */
    private solveLinearRegression;
    /**
     * Predict on new input
     * @param input Input pattern
     * @param duration Reservoir simulation duration (ms)
     * @returns Predicted output
     */
    predict(input: number[], duration?: number): number[];
    /**
     * Evaluate on test set
     * @param inputs Test inputs
     * @param targets Test targets
     * @param duration Reservoir simulation duration per sample (ms)
     * @returns Test error (MSE) and accuracy
     */
    evaluate(inputs: number[][], targets: number[][], duration?: number): {
        mse: number;
        accuracy: number;
    };
    /**
     * Get reservoir parameters
     */
    getParams(): ReservoirParams;
    /**
     * Get current reservoir state
     */
    getReservoirState(): number[];
    /**
     * Get readout weights
     */
    getReadoutWeights(): ReadoutWeights;
    /**
     * Reset reservoir to initial state
     */
    reset(): void;
}
/**
 * Helper function to create LSM with preset configurations
 */
export declare function createLSM(preset?: 'small' | 'medium' | 'large', input_size?: number, output_size?: number): LiquidStateMachine;
//# sourceMappingURL=reservoir-computing.d.ts.map