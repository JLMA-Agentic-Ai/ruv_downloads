/**
 * Spiking Neural Network (SNN) with Leaky Integrate-and-Fire (LIF) neurons
 *
 * LIF neurons integrate incoming spikes and fire when threshold is reached.
 * Features:
 * - Event-driven computation (only active when spikes occur)
 * - Temporal dynamics with membrane potential decay
 * - Refractory period after firing
 * - Memory-efficient spike encoding
 */
export interface LIFNeuronParams {
    /** Membrane time constant (ms) - controls leak rate */
    tau_m: number;
    /** Resting potential (mV) */
    v_rest: number;
    /** Firing threshold (mV) */
    v_threshold: number;
    /** Reset potential after spike (mV) */
    v_reset: number;
    /** Refractory period (ms) - time after spike when neuron cannot fire */
    t_refrac: number;
}
export interface SynapticConnection {
    /** Source neuron index */
    source: number;
    /** Target neuron index */
    target: number;
    /** Synaptic weight */
    weight: number;
    /** Synaptic delay (ms) */
    delay: number;
}
export interface SpikeEvent {
    /** Neuron index that fired */
    neuronId: number;
    /** Time of spike (ms) */
    time: number;
}
/**
 * Leaky Integrate-and-Fire neuron model
 */
export declare class LIFNeuron {
    private params;
    private membrane_potential;
    private last_spike_time;
    private refractory_end;
    constructor(params?: Partial<LIFNeuronParams>);
    /**
     * Update neuron state for a given timestep
     * @param current_time Current simulation time (ms)
     * @param input_current Input current from synapses (pA)
     * @param dt Time step (ms)
     * @returns True if neuron fired a spike
     */
    update(current_time: number, input_current: number, dt: number): boolean;
    /**
     * Get current membrane potential
     */
    getMembranePotential(): number;
    /**
     * Get time of last spike
     */
    getLastSpikeTime(): number;
    /**
     * Reset neuron to resting state
     */
    reset(): void;
    /**
     * Get neuron parameters
     */
    getParams(): LIFNeuronParams;
}
/**
 * Spiking Neural Network with event-driven computation
 */
export declare class SpikingNeuralNetwork {
    private neurons;
    private connections;
    private spike_queue;
    private current_time;
    constructor(num_neurons: number, neuron_params?: Partial<LIFNeuronParams>);
    /**
     * Add synaptic connection between neurons
     */
    addConnection(source: number, target: number, weight: number, delay?: number): void;
    /**
     * Create fully connected network with random weights
     */
    connectFullyRandom(weight_range?: [number, number]): void;
    /**
     * Inject spike into specific neuron
     */
    injectSpike(neuron_id: number, time?: number): void;
    /**
     * Inject spike pattern (e.g., input encoding)
     */
    injectPattern(pattern: number[], time?: number): void;
    /**
     * Simulate network for given duration
     * @param duration Simulation duration (ms)
     * @param dt Time step (ms)
     * @returns Array of spike events
     */
    simulate(duration: number, dt?: number): SpikeEvent[];
    /**
     * Get network state for persistence
     */
    getState(): {
        neurons: Array<{
            potential: number;
            lastSpike: number;
        }>;
        connections: SynapticConnection[];
        time: number;
    };
    /**
     * Reset network to initial state
     */
    reset(): void;
    /**
     * Get neuron by index
     */
    getNeuron(index: number): LIFNeuron;
    /**
     * Get all connections
     */
    getConnections(): SynapticConnection[];
    /**
     * Get number of neurons
     */
    size(): number;
}
//# sourceMappingURL=snn.d.ts.map