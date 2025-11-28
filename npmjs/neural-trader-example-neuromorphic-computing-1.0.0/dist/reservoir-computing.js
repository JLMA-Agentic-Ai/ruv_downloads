"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidStateMachine = void 0;
exports.createLSM = createLSM;
const snn_1 = require("./snn");
/**
 * Liquid State Machine (Reservoir Computing with SNNs)
 */
class LiquidStateMachine {
    params;
    reservoir;
    readout_weights;
    input_weights;
    reservoir_state;
    constructor(params = {}, neuron_params) {
        this.params = {
            reservoir_size: params.reservoir_size ?? 100,
            input_size: params.input_size ?? 10,
            output_size: params.output_size ?? 5,
            recurrent_prob: params.recurrent_prob ?? 0.1,
            input_prob: params.input_prob ?? 0.5,
            spectral_radius: params.spectral_radius ?? 0.9,
            input_scaling: params.input_scaling ?? 1.0,
        };
        // Initialize reservoir network
        this.reservoir = new snn_1.SpikingNeuralNetwork(this.params.reservoir_size, neuron_params);
        // Initialize connection structures
        this.input_weights = [];
        this.reservoir_state = new Array(this.params.reservoir_size).fill(0);
        // Initialize readout weights
        this.readout_weights = {
            weights: Array.from({ length: this.params.output_size }, () => new Array(this.params.reservoir_size).fill(0)),
            bias: new Array(this.params.output_size).fill(0),
        };
        // Build reservoir topology
        this.initializeReservoir();
    }
    /**
     * Initialize reservoir with random recurrent connections
     */
    initializeReservoir() {
        const n = this.params.reservoir_size;
        // Create sparse random recurrent connections
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j && Math.random() < this.params.recurrent_prob) {
                    const weight = (Math.random() * 2 - 1) * this.params.spectral_radius;
                    this.reservoir.addConnection(i, j, weight, 1.0);
                }
            }
        }
        // Create input to reservoir connections
        this.input_weights = Array.from({ length: this.params.input_size }, () => new Array(this.params.reservoir_size).fill(0));
        for (let i = 0; i < this.params.input_size; i++) {
            for (let j = 0; j < this.params.reservoir_size; j++) {
                if (Math.random() < this.params.input_prob) {
                    this.input_weights[i][j] =
                        (Math.random() * 2 - 1) * this.params.input_scaling;
                }
            }
        }
    }
    /**
     * Process input through reservoir and get reservoir state
     * @param input Input spike pattern (0 or 1 for each input neuron)
     * @param duration Simulation duration (ms)
     * @returns Reservoir state (spike counts per neuron)
     */
    processInput(input, duration = 50) {
        if (input.length !== this.params.input_size) {
            throw new Error(`Input size mismatch: expected ${this.params.input_size}, got ${input.length}`);
        }
        // Reset reservoir
        this.reservoir.reset();
        // Inject weighted input into reservoir neurons
        input.forEach((spike, input_idx) => {
            if (spike > 0) {
                this.input_weights[input_idx].forEach((weight, reservoir_idx) => {
                    if (weight !== 0) {
                        // Inject spike with weight-dependent timing
                        const spike_time = Math.abs(weight) * 2; // Earlier for stronger weights
                        this.reservoir.injectSpike(reservoir_idx, spike_time);
                    }
                });
            }
        });
        // Simulate reservoir dynamics
        const spikes = this.reservoir.simulate(duration);
        // Convert spike trains to state vector (spike counts)
        this.reservoir_state.fill(0);
        spikes.forEach((spike) => {
            this.reservoir_state[spike.neuronId]++;
        });
        return [...this.reservoir_state];
    }
    /**
     * Compute output using linear readout
     * @param reservoir_state Current reservoir state
     * @returns Output activations
     */
    computeOutput(reservoir_state) {
        return this.readout_weights.weights.map((weights, output_idx) => {
            const sum = weights.reduce((acc, w, i) => acc + w * reservoir_state[i], 0);
            return sum + this.readout_weights.bias[output_idx];
        });
    }
    /**
     * Forward pass: input → reservoir → output
     * @param input Input pattern
     * @param duration Reservoir simulation duration (ms)
     * @returns Output activations
     */
    forward(input, duration = 50) {
        const state = this.processInput(input, duration);
        return this.computeOutput(state);
    }
    /**
     * Train readout layer using least-squares regression
     * @param inputs Training inputs [n_samples x input_size]
     * @param targets Target outputs [n_samples x output_size]
     * @param duration Reservoir simulation duration per sample (ms)
     * @returns Training error (MSE)
     */
    trainReadout(inputs, targets, duration = 50) {
        if (inputs.length !== targets.length) {
            throw new Error('Number of inputs must match number of targets');
        }
        const n_samples = inputs.length;
        // Collect reservoir states for all inputs
        const states = inputs.map((input) => this.processInput(input, duration));
        // Solve for optimal readout weights using pseudo-inverse
        // W = (S^T S)^-1 S^T Y where S is states, Y is targets
        this.readout_weights = this.solveLinearRegression(states, targets);
        // Calculate training error
        let total_error = 0;
        inputs.forEach((input, idx) => {
            const output = this.forward(input, duration);
            const target = targets[idx];
            const error = output.reduce((sum, val, i) => sum + Math.pow(val - target[i], 2), 0);
            total_error += error;
        });
        return total_error / n_samples;
    }
    /**
     * Solve linear regression using normal equations (simplified)
     * In production, use a proper linear algebra library
     */
    solveLinearRegression(states, targets) {
        const n_samples = states.length;
        const state_dim = states[0].length;
        const output_dim = targets[0].length;
        // Simple gradient descent for each output dimension
        const weights = Array.from({ length: output_dim }, () => new Array(state_dim).fill(0).map(() => (Math.random() - 0.5) * 0.1));
        const bias = new Array(output_dim).fill(0);
        const learning_rate = 0.01;
        const iterations = 1000;
        for (let iter = 0; iter < iterations; iter++) {
            // Calculate gradients
            const weight_grads = weights.map((w) => new Array(state_dim).fill(0));
            const bias_grads = new Array(output_dim).fill(0);
            for (let i = 0; i < n_samples; i++) {
                const state = states[i];
                const target = targets[i];
                // Forward pass
                const predictions = weights.map((w, out_idx) => {
                    const sum = w.reduce((acc, weight, j) => acc + weight * state[j], 0);
                    return sum + bias[out_idx];
                });
                // Calculate error and gradients
                predictions.forEach((pred, out_idx) => {
                    const error = pred - target[out_idx];
                    bias_grads[out_idx] += error;
                    state.forEach((s_val, state_idx) => {
                        weight_grads[out_idx][state_idx] += error * s_val;
                    });
                });
            }
            // Update weights
            for (let out_idx = 0; out_idx < output_dim; out_idx++) {
                bias[out_idx] -= (learning_rate * bias_grads[out_idx]) / n_samples;
                for (let state_idx = 0; state_idx < state_dim; state_idx++) {
                    weights[out_idx][state_idx] -=
                        (learning_rate * weight_grads[out_idx][state_idx]) / n_samples;
                }
            }
        }
        return { weights, bias };
    }
    /**
     * Predict on new input
     * @param input Input pattern
     * @param duration Reservoir simulation duration (ms)
     * @returns Predicted output
     */
    predict(input, duration = 50) {
        return this.forward(input, duration);
    }
    /**
     * Evaluate on test set
     * @param inputs Test inputs
     * @param targets Test targets
     * @param duration Reservoir simulation duration per sample (ms)
     * @returns Test error (MSE) and accuracy
     */
    evaluate(inputs, targets, duration = 50) {
        let total_error = 0;
        let correct = 0;
        inputs.forEach((input, idx) => {
            const output = this.predict(input, duration);
            const target = targets[idx];
            // MSE
            const error = output.reduce((sum, val, i) => sum + Math.pow(val - target[i], 2), 0);
            total_error += error;
            // Accuracy (argmax classification)
            const pred_class = output.indexOf(Math.max(...output));
            const true_class = target.indexOf(Math.max(...target));
            if (pred_class === true_class) {
                correct++;
            }
        });
        return {
            mse: total_error / inputs.length,
            accuracy: correct / inputs.length,
        };
    }
    /**
     * Get reservoir parameters
     */
    getParams() {
        return { ...this.params };
    }
    /**
     * Get current reservoir state
     */
    getReservoirState() {
        return [...this.reservoir_state];
    }
    /**
     * Get readout weights
     */
    getReadoutWeights() {
        return {
            weights: this.readout_weights.weights.map((w) => [...w]),
            bias: [...this.readout_weights.bias],
        };
    }
    /**
     * Reset reservoir to initial state
     */
    reset() {
        this.reservoir.reset();
        this.reservoir_state.fill(0);
    }
}
exports.LiquidStateMachine = LiquidStateMachine;
/**
 * Helper function to create LSM with preset configurations
 */
function createLSM(preset = 'medium', input_size = 10, output_size = 5) {
    const presets = {
        small: {
            reservoir_size: 50,
            recurrent_prob: 0.1,
            spectral_radius: 0.9,
        },
        medium: {
            reservoir_size: 100,
            recurrent_prob: 0.15,
            spectral_radius: 0.95,
        },
        large: {
            reservoir_size: 200,
            recurrent_prob: 0.2,
            spectral_radius: 1.0,
        },
    };
    return new LiquidStateMachine({
        ...presets[preset],
        input_size,
        output_size,
    });
}
//# sourceMappingURL=reservoir-computing.js.map