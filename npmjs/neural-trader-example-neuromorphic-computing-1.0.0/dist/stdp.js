"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.STDPLearner = void 0;
exports.createSTDPLearner = createSTDPLearner;
/**
 * STDP learning rule implementation
 */
class STDPLearner {
    params;
    spike_traces;
    weight_updates;
    constructor(params = {}) {
        this.params = {
            A_plus: params.A_plus ?? 0.01, // LTP learning rate
            A_minus: params.A_minus ?? 0.012, // LTD learning rate (slightly larger for stability)
            tau_plus: params.tau_plus ?? 20.0, // 20ms potentiation window
            tau_minus: params.tau_minus ?? 20.0, // 20ms depression window
            w_min: params.w_min ?? -1.0, // Minimum weight
            w_max: params.w_max ?? 1.0, // Maximum weight
        };
        this.spike_traces = new Map();
        this.weight_updates = new Map();
    }
    /**
     * Update spike traces with exponential decay
     * @param current_time Current simulation time (ms)
     * @param dt Time step (ms)
     */
    updateTraces(current_time, dt) {
        this.spike_traces.forEach((trace) => {
            // Exponential decay: trace = trace * exp(-dt/tau)
            const decay_plus = Math.exp(-dt / this.params.tau_plus);
            const decay_minus = Math.exp(-dt / this.params.tau_minus);
            trace.trace_pre *= decay_plus;
            trace.trace_post *= decay_minus;
            // Remove old spike times (older than 5x time constant)
            const cutoff_time = current_time - 5 * Math.max(this.params.tau_plus, this.params.tau_minus);
            trace.spikeTimes = trace.spikeTimes.filter((t) => t > cutoff_time);
        });
    }
    /**
     * Process a spike event and update weights according to STDP
     * @param spike The spike event
     * @param connections All synaptic connections
     * @param current_time Current simulation time
     */
    processSpike(spike, connections, current_time) {
        const neuron_id = spike.neuronId;
        const spike_time = spike.time;
        // Initialize trace if not exists
        if (!this.spike_traces.has(neuron_id)) {
            this.spike_traces.set(neuron_id, {
                neuronId: neuron_id,
                spikeTimes: [],
                trace_pre: 0,
                trace_post: 0,
            });
        }
        const trace = this.spike_traces.get(neuron_id);
        trace.spikeTimes.push(spike_time);
        // Update weights for all connections involving this neuron
        connections.forEach((conn) => {
            const conn_key = `${conn.source}-${conn.target}`;
            // Case 1: This neuron is post-synaptic (target)
            if (conn.target === neuron_id) {
                const pre_trace = this.spike_traces.get(conn.source);
                if (pre_trace) {
                    // LTP: Pre-synaptic spike occurred before post-synaptic spike
                    // Weight change: dW = A_plus * trace_pre * exp(-Δt/tau_plus)
                    const weight_change = this.params.A_plus * pre_trace.trace_pre;
                    this.accumulateWeightUpdate(conn_key, weight_change);
                }
                // Update post-synaptic trace
                trace.trace_post += 1.0;
            }
            // Case 2: This neuron is pre-synaptic (source)
            if (conn.source === neuron_id) {
                const post_trace = this.spike_traces.get(conn.target);
                if (post_trace) {
                    // LTD: Post-synaptic spike occurred before pre-synaptic spike
                    // Weight change: dW = -A_minus * trace_post * exp(-Δt/tau_minus)
                    const weight_change = -this.params.A_minus * post_trace.trace_post;
                    this.accumulateWeightUpdate(conn_key, weight_change);
                }
                // Update pre-synaptic trace
                trace.trace_pre += 1.0;
            }
        });
    }
    /**
     * Accumulate weight update for a connection
     */
    accumulateWeightUpdate(conn_key, delta) {
        const current = this.weight_updates.get(conn_key) || 0;
        this.weight_updates.set(conn_key, current + delta);
    }
    /**
     * Apply accumulated weight updates to network
     * @param network The spiking neural network
     * @returns Number of connections updated
     */
    applyWeightUpdates(network) {
        const connections = network.getConnections();
        let updated_count = 0;
        connections.forEach((conn, idx) => {
            const conn_key = `${conn.source}-${conn.target}`;
            const update = this.weight_updates.get(conn_key);
            if (update !== undefined && update !== 0) {
                // Apply update with bounds checking
                let new_weight = conn.weight + update;
                new_weight = Math.max(this.params.w_min, Math.min(this.params.w_max, new_weight));
                conn.weight = new_weight;
                updated_count++;
            }
        });
        // Clear accumulated updates
        this.weight_updates.clear();
        return updated_count;
    }
    /**
     * Train network on spike pattern
     * @param network The spiking neural network
     * @param input_pattern Input spike pattern (neuron indices)
     * @param duration Simulation duration (ms)
     * @param dt Time step (ms)
     * @returns Training statistics
     */
    train(network, input_pattern, duration, dt = 0.1) {
        // Reset network and inject input pattern
        network.reset();
        network.injectPattern(input_pattern);
        // Simulate and collect spikes
        const spikes = network.simulate(duration, dt);
        // Store initial weights for comparison
        const initial_weights = network.getConnections().map((c) => c.weight);
        // Process each spike for STDP
        spikes.forEach((spike) => {
            this.updateTraces(spike.time, dt);
            this.processSpike(spike, network.getConnections(), spike.time);
        });
        // Apply weight updates
        const weights_updated = this.applyWeightUpdates(network);
        // Calculate average weight change
        const final_weights = network.getConnections().map((c) => c.weight);
        const weight_changes = final_weights.map((w, i) => Math.abs(w - initial_weights[i]));
        const avg_weight_change = weight_changes.reduce((sum, change) => sum + change, 0) / weight_changes.length;
        return {
            spikes,
            weights_updated,
            avg_weight_change,
        };
    }
    /**
     * Train network on multiple patterns (epochs)
     * @param network The spiking neural network
     * @param patterns Array of input patterns
     * @param epochs Number of training epochs
     * @param duration Duration per pattern (ms)
     * @returns Training history
     */
    trainMultipleEpochs(network, patterns, epochs, duration = 100) {
        const history = [];
        for (let epoch = 0; epoch < epochs; epoch++) {
            patterns.forEach((pattern, pattern_idx) => {
                const result = this.train(network, pattern, duration);
                history.push({
                    epoch,
                    pattern: pattern_idx,
                    spikes: result.spikes.length,
                    weights_updated: result.weights_updated,
                    avg_weight_change: result.avg_weight_change,
                });
            });
        }
        return history;
    }
    /**
     * Get current STDP parameters
     */
    getParams() {
        return { ...this.params };
    }
    /**
     * Reset learning state
     */
    reset() {
        this.spike_traces.clear();
        this.weight_updates.clear();
    }
    /**
     * Get spike traces for analysis
     */
    getTraces() {
        return new Map(this.spike_traces);
    }
}
exports.STDPLearner = STDPLearner;
/**
 * Helper function to create STDP learner with preset configurations
 */
function createSTDPLearner(preset = 'default') {
    const presets = {
        default: {
            A_plus: 0.01,
            A_minus: 0.012,
            tau_plus: 20.0,
            tau_minus: 20.0,
            w_min: -1.0,
            w_max: 1.0,
        },
        strong: {
            A_plus: 0.05,
            A_minus: 0.06,
            tau_plus: 10.0,
            tau_minus: 10.0,
            w_min: -2.0,
            w_max: 2.0,
        },
        weak: {
            A_plus: 0.001,
            A_minus: 0.0012,
            tau_plus: 40.0,
            tau_minus: 40.0,
            w_min: -0.5,
            w_max: 0.5,
        },
    };
    return new STDPLearner(presets[preset]);
}
//# sourceMappingURL=stdp.js.map