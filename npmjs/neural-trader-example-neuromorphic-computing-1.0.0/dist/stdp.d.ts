/**
 * Spike-Timing-Dependent Plasticity (STDP)
 *
 * Biologically-inspired learning rule where synaptic strength changes
 * based on relative timing of pre- and post-synaptic spikes:
 * - Pre before Post: Long-Term Potentiation (LTP) - strengthen synapse
 * - Post before Pre: Long-Term Depression (LTD) - weaken synapse
 *
 * This implements Hebbian learning: "neurons that fire together, wire together"
 */
import { SpikingNeuralNetwork, SpikeEvent, SynapticConnection } from './snn';
export interface STDPParams {
    /** Learning rate for potentiation */
    A_plus: number;
    /** Learning rate for depression */
    A_minus: number;
    /** Time constant for potentiation (ms) */
    tau_plus: number;
    /** Time constant for depression (ms) */
    tau_minus: number;
    /** Minimum weight value */
    w_min: number;
    /** Maximum weight value */
    w_max: number;
}
export interface SpikeTrace {
    /** Neuron ID */
    neuronId: number;
    /** Recent spike times */
    spikeTimes: number[];
    /** Pre-synaptic trace value */
    trace_pre: number;
    /** Post-synaptic trace value */
    trace_post: number;
}
/**
 * STDP learning rule implementation
 */
export declare class STDPLearner {
    private params;
    private spike_traces;
    private weight_updates;
    constructor(params?: Partial<STDPParams>);
    /**
     * Update spike traces with exponential decay
     * @param current_time Current simulation time (ms)
     * @param dt Time step (ms)
     */
    private updateTraces;
    /**
     * Process a spike event and update weights according to STDP
     * @param spike The spike event
     * @param connections All synaptic connections
     * @param current_time Current simulation time
     */
    processSpike(spike: SpikeEvent, connections: SynapticConnection[], current_time: number): void;
    /**
     * Accumulate weight update for a connection
     */
    private accumulateWeightUpdate;
    /**
     * Apply accumulated weight updates to network
     * @param network The spiking neural network
     * @returns Number of connections updated
     */
    applyWeightUpdates(network: SpikingNeuralNetwork): number;
    /**
     * Train network on spike pattern
     * @param network The spiking neural network
     * @param input_pattern Input spike pattern (neuron indices)
     * @param duration Simulation duration (ms)
     * @param dt Time step (ms)
     * @returns Training statistics
     */
    train(network: SpikingNeuralNetwork, input_pattern: number[], duration: number, dt?: number): {
        spikes: SpikeEvent[];
        weights_updated: number;
        avg_weight_change: number;
    };
    /**
     * Train network on multiple patterns (epochs)
     * @param network The spiking neural network
     * @param patterns Array of input patterns
     * @param epochs Number of training epochs
     * @param duration Duration per pattern (ms)
     * @returns Training history
     */
    trainMultipleEpochs(network: SpikingNeuralNetwork, patterns: number[][], epochs: number, duration?: number): Array<{
        epoch: number;
        pattern: number;
        spikes: number;
        weights_updated: number;
        avg_weight_change: number;
    }>;
    /**
     * Get current STDP parameters
     */
    getParams(): STDPParams;
    /**
     * Reset learning state
     */
    reset(): void;
    /**
     * Get spike traces for analysis
     */
    getTraces(): Map<number, SpikeTrace>;
}
/**
 * Helper function to create STDP learner with preset configurations
 */
export declare function createSTDPLearner(preset?: 'default' | 'strong' | 'weak'): STDPLearner;
//# sourceMappingURL=stdp.d.ts.map