/**
 * @ruvector/spiking-neural - High-performance Spiking Neural Network SDK
 *
 * Pure JavaScript implementation with:
 * - Leaky Integrate-and-Fire (LIF) neurons
 * - STDP (Spike-Timing-Dependent Plasticity) learning
 * - Lateral inhibition
 * - Multiple encoding schemes (rate, temporal)
 * - SIMD-style optimized vector operations
 */

'use strict';

// ============================================================================
// SIMD-Style Optimized Vector Operations
// ============================================================================

/**
 * SIMD-style vector operations (loop-unrolled for performance)
 */
const SIMDOps = {
  /**
   * Compute dot product of two vectors
   * @param {Float32Array} a First vector
   * @param {Float32Array} b Second vector
   * @returns {number} Dot product
   */
  dotProduct(a, b) {
    const n = a.length;
    let sum0 = 0, sum1 = 0, sum2 = 0, sum3 = 0;
    const n4 = n - (n % 4);

    // Process 4 elements at a time (loop unrolling)
    for (let i = 0; i < n4; i += 4) {
      sum0 += a[i] * b[i];
      sum1 += a[i + 1] * b[i + 1];
      sum2 += a[i + 2] * b[i + 2];
      sum3 += a[i + 3] * b[i + 3];
    }

    // Handle remainder
    let sum = sum0 + sum1 + sum2 + sum3;
    for (let i = n4; i < n; i++) {
      sum += a[i] * b[i];
    }

    return sum;
  },

  /**
   * Compute Euclidean distance between two vectors
   * @param {Float32Array} a First vector
   * @param {Float32Array} b Second vector
   * @returns {number} Euclidean distance
   */
  distance(a, b) {
    const n = a.length;
    let sum0 = 0, sum1 = 0, sum2 = 0, sum3 = 0;
    const n4 = n - (n % 4);

    for (let i = 0; i < n4; i += 4) {
      const d0 = a[i] - b[i];
      const d1 = a[i + 1] - b[i + 1];
      const d2 = a[i + 2] - b[i + 2];
      const d3 = a[i + 3] - b[i + 3];
      sum0 += d0 * d0;
      sum1 += d1 * d1;
      sum2 += d2 * d2;
      sum3 += d3 * d3;
    }

    let sum = sum0 + sum1 + sum2 + sum3;
    for (let i = n4; i < n; i++) {
      const d = a[i] - b[i];
      sum += d * d;
    }

    return Math.sqrt(sum);
  },

  /**
   * Compute cosine similarity between two vectors
   * @param {Float32Array} a First vector
   * @param {Float32Array} b Second vector
   * @returns {number} Cosine similarity (-1 to 1)
   */
  cosineSimilarity(a, b) {
    const n = a.length;
    let dot = 0, normA = 0, normB = 0;

    for (let i = 0; i < n; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dot / denom : 0;
  },

  /**
   * Add two vectors: result = a + b
   * @param {Float32Array} a First vector
   * @param {Float32Array} b Second vector
   * @param {Float32Array} result Output vector
   */
  add(a, b, result) {
    const n = a.length;
    for (let i = 0; i < n; i++) {
      result[i] = a[i] + b[i];
    }
  },

  /**
   * Scale vector: result = a * scalar
   * @param {Float32Array} a Input vector
   * @param {number} scalar Scale factor
   * @param {Float32Array} result Output vector
   */
  scale(a, scalar, result) {
    const n = a.length;
    for (let i = 0; i < n; i++) {
      result[i] = a[i] * scalar;
    }
  }
};

// ============================================================================
// LIF (Leaky Integrate-and-Fire) Neuron Layer
// ============================================================================

/**
 * LIF Neuron Layer - implements membrane dynamics and spike generation
 */
class LIFLayer {
  /**
   * Create a LIF neuron layer
   * @param {number} size Number of neurons
   * @param {Object} params Neuron parameters
   */
  constructor(size, params = {}) {
    this.size = size;
    this.n_neurons = size; // Alias for compatibility

    // Parameters with biologically plausible defaults
    this.dt = params.dt ?? 1.0;           // Time step (ms)
    this.tau = params.tau ?? 20.0;        // Membrane time constant (ms)
    this.v_rest = params.v_rest ?? -70.0; // Resting potential (mV)
    this.v_reset = params.v_reset ?? -75.0; // Reset potential (mV)
    this.v_thresh = params.v_thresh ?? -50.0; // Spike threshold (mV)
    this.resistance = params.resistance ?? 10.0; // Membrane resistance (MOhm)

    // State arrays
    this.voltages = new Float32Array(size).fill(this.v_rest);
    this.currents = new Float32Array(size);
    this.spikes = new Float32Array(size);

    // Precompute decay factor
    this.decay = this.dt / this.tau;
  }

  /**
   * Set input currents
   * @param {Float32Array} currents Input currents
   */
  setCurrents(currents) {
    for (let i = 0; i < this.size; i++) {
      this.currents[i] = currents[i] ?? 0;
    }
  }

  /**
   * Update membrane potentials and detect spikes
   * @returns {number} Number of spikes
   */
  update() {
    let spikeCount = 0;

    for (let i = 0; i < this.size; i++) {
      // LIF dynamics: dV/dt = (-(V - V_rest) + R * I) / tau
      const dv = (-(this.voltages[i] - this.v_rest) + this.resistance * this.currents[i]) * this.decay;
      this.voltages[i] += dv;

      // Spike detection
      if (this.voltages[i] >= this.v_thresh) {
        this.spikes[i] = 1;
        this.voltages[i] = this.v_reset;
        spikeCount++;
      } else {
        this.spikes[i] = 0;
      }
    }

    return spikeCount;
  }

  /**
   * Get current spikes
   * @returns {Float32Array} Spike indicators
   */
  getSpikes() {
    return this.spikes;
  }

  /**
   * Get membrane potentials
   * @returns {Float32Array} Voltage values
   */
  getVoltages() {
    return this.voltages;
  }

  /**
   * Reset layer state
   */
  reset() {
    this.voltages.fill(this.v_rest);
    this.currents.fill(0);
    this.spikes.fill(0);
  }
}

// ============================================================================
// Synaptic Layer with STDP Learning
// ============================================================================

/**
 * Synaptic Layer - implements connections and STDP learning
 */
class SynapticLayer {
  /**
   * Create a synaptic layer
   * @param {number} preSize Pre-synaptic neurons
   * @param {number} postSize Post-synaptic neurons
   * @param {Object} params Synapse parameters
   */
  constructor(preSize, postSize, params = {}) {
    this.preSize = preSize;
    this.postSize = postSize;

    // STDP parameters
    this.a_plus = params.a_plus ?? 0.01;   // LTP amplitude
    this.a_minus = params.a_minus ?? 0.01; // LTD amplitude
    this.tau_plus = params.tau_plus ?? 20.0;  // LTP time constant
    this.tau_minus = params.tau_minus ?? 20.0; // LTD time constant
    this.w_min = params.w_min ?? 0.0;      // Minimum weight
    this.w_max = params.w_max ?? 1.0;      // Maximum weight
    this.dt = params.dt ?? 1.0;

    // Initialize weights (random with mean and std)
    const initWeight = params.init_weight ?? 0.5;
    const initStd = params.init_std ?? 0.1;

    this.weights = new Float32Array(preSize * postSize);
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] = Math.max(this.w_min, Math.min(this.w_max,
        initWeight + (Math.random() - 0.5) * 2 * initStd
      ));
    }

    // Spike traces for STDP
    this.preTrace = new Float32Array(preSize);
    this.postTrace = new Float32Array(postSize);

    // Precompute decay factors
    this.decayPre = Math.exp(-this.dt / this.tau_plus);
    this.decayPost = Math.exp(-this.dt / this.tau_minus);
  }

  /**
   * Forward pass: compute post-synaptic currents from pre-synaptic spikes
   * @param {Float32Array} preSpikes Pre-synaptic spikes
   * @param {Float32Array} postCurrents Output currents
   */
  forward(preSpikes, postCurrents) {
    postCurrents.fill(0);

    for (let j = 0; j < this.postSize; j++) {
      let sum = 0;
      const offset = j * this.preSize;

      for (let i = 0; i < this.preSize; i++) {
        sum += preSpikes[i] * this.weights[offset + i];
      }

      postCurrents[j] = sum;
    }
  }

  /**
   * Apply STDP learning rule
   * @param {Float32Array} preSpikes Pre-synaptic spikes
   * @param {Float32Array} postSpikes Post-synaptic spikes
   */
  learn(preSpikes, postSpikes) {
    // Update traces
    for (let i = 0; i < this.preSize; i++) {
      this.preTrace[i] = this.preTrace[i] * this.decayPre + preSpikes[i];
    }
    for (let j = 0; j < this.postSize; j++) {
      this.postTrace[j] = this.postTrace[j] * this.decayPost + postSpikes[j];
    }

    // STDP weight update
    for (let j = 0; j < this.postSize; j++) {
      const offset = j * this.preSize;

      for (let i = 0; i < this.preSize; i++) {
        // LTP: pre spike → use post trace
        const ltp = preSpikes[i] * this.postTrace[j] * this.a_plus;
        // LTD: post spike → use pre trace
        const ltd = postSpikes[j] * this.preTrace[i] * this.a_minus;

        this.weights[offset + i] += ltp - ltd;

        // Clamp weights
        if (this.weights[offset + i] < this.w_min) {
          this.weights[offset + i] = this.w_min;
        } else if (this.weights[offset + i] > this.w_max) {
          this.weights[offset + i] = this.w_max;
        }
      }
    }
  }

  /**
   * Get weight statistics
   * @returns {Object} Weight statistics
   */
  getWeightStats() {
    let sum = 0, min = Infinity, max = -Infinity;

    for (let i = 0; i < this.weights.length; i++) {
      sum += this.weights[i];
      if (this.weights[i] < min) min = this.weights[i];
      if (this.weights[i] > max) max = this.weights[i];
    }

    const mean = sum / this.weights.length;

    let variance = 0;
    for (let i = 0; i < this.weights.length; i++) {
      variance += (this.weights[i] - mean) ** 2;
    }
    variance /= this.weights.length;

    return { mean, std: Math.sqrt(variance), min, max };
  }

  /**
   * Reset layer state
   */
  reset() {
    this.preTrace.fill(0);
    this.postTrace.fill(0);
  }
}

// ============================================================================
// Spiking Neural Network
// ============================================================================

/**
 * Complete Spiking Neural Network with multiple layers
 */
class SpikingNeuralNetwork {
  /**
   * Create an SNN from layer specifications
   * @param {Array} layers Array of {neuron_layer, synaptic_layer}
   * @param {Object} params Network parameters
   */
  constructor(layers, params = {}) {
    this.layers = layers;
    this.dt = params.dt ?? 1.0;
    this.lateral_inhibition = params.lateral_inhibition ?? false;
    this.inhibition_strength = params.inhibition_strength ?? 10.0;

    // Statistics
    this.totalSpikes = 0;
    this.stepCount = 0;
    this.time = 0; // Current simulation time
  }

  /**
   * Run one time step
   * @param {Float32Array} inputSpikes Input spike pattern
   * @returns {number} Total spikes in network
   */
  step(inputSpikes) {
    let totalSpikes = 0;
    let currentSpikes = inputSpikes;
    const currents = new Float32Array(1024); // Temp buffer

    for (let l = 0; l < this.layers.length; l++) {
      const { neuron_layer, synaptic_layer } = this.layers[l];

      if (synaptic_layer && l > 0) {
        // Compute synaptic currents
        const postCurrents = new Float32Array(neuron_layer.size);
        synaptic_layer.forward(currentSpikes, postCurrents);
        neuron_layer.setCurrents(postCurrents);
      } else if (l === 0) {
        // First layer receives input directly
        neuron_layer.setCurrents(currentSpikes);
      }

      // Update neurons
      const spikes = neuron_layer.update();
      totalSpikes += spikes;

      // Apply lateral inhibition if enabled (output layer)
      if (this.lateral_inhibition && l === this.layers.length - 1) {
        this._applyLateralInhibition(neuron_layer);
      }

      // STDP learning
      if (synaptic_layer && l > 0) {
        synaptic_layer.learn(currentSpikes, neuron_layer.getSpikes());
      }

      currentSpikes = neuron_layer.getSpikes();
    }

    this.totalSpikes += totalSpikes;
    this.stepCount++;
    this.time += this.dt;

    return totalSpikes;
  }

  /**
   * Run simulation for a duration
   * @param {number} duration Duration in timesteps
   * @param {Function} inputGenerator Function(time) => spikes
   * @returns {Object} Simulation results
   */
  run(duration, inputGenerator) {
    const results = {
      spikeTimes: [],
      totalSpikes: 0
    };

    for (let t = 0; t < duration; t++) {
      const input = inputGenerator(t);
      const spikes = this.step(input);
      results.totalSpikes += spikes;
      results.spikeTimes.push({ time: t, count: spikes });
    }

    return results;
  }

  /**
   * Get output layer spikes/voltages
   * @returns {Float32Array} Output values
   */
  getOutput() {
    const outputLayer = this.layers[this.layers.length - 1].neuron_layer;
    return outputLayer.getSpikes().slice();
  }

  /**
   * Get network statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      totalSpikes: this.totalSpikes,
      stepCount: this.stepCount,
      avgSpikesPerStep: this.stepCount > 0 ? this.totalSpikes / this.stepCount : 0,
      layerSizes: this.layers.map(l => l.neuron_layer.size)
    };
  }

  /**
   * Reset network state
   */
  reset() {
    for (const { neuron_layer, synaptic_layer } of this.layers) {
      neuron_layer.reset();
      if (synaptic_layer) synaptic_layer.reset();
    }
    this.totalSpikes = 0;
    this.stepCount = 0;
    this.time = 0;
  }

  /**
   * Apply lateral inhibition to a layer
   * @private
   */
  _applyLateralInhibition(layer) {
    const spikes = layer.getSpikes();
    const voltages = layer.getVoltages();

    for (let i = 0; i < spikes.length; i++) {
      if (spikes[i] > 0.5) {
        // Inhibit all other neurons
        for (let j = 0; j < voltages.length; j++) {
          if (j !== i) {
            voltages[j] -= this.inhibition_strength;
          }
        }
      }
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a feedforward SNN
 * @param {number[]} layerSizes Array of layer sizes [input, hidden..., output]
 * @param {Object} params Network parameters
 * @returns {SpikingNeuralNetwork} Configured SNN
 */
function createFeedforwardSNN(layerSizes, params = {}) {
  const layers = [];

  for (let i = 0; i < layerSizes.length; i++) {
    const size = layerSizes[i];

    const neuron_layer = new LIFLayer(size, {
      dt: params.dt ?? 1.0,
      tau: params.tau ?? 20.0,
      v_rest: params.v_rest ?? -70.0,
      v_reset: params.v_reset ?? -75.0,
      v_thresh: params.v_thresh ?? -50.0,
      resistance: params.resistance ?? 10.0
    });

    let synaptic_layer = null;
    if (i > 0) {
      synaptic_layer = new SynapticLayer(layerSizes[i - 1], size, {
        dt: params.dt ?? 1.0,
        a_plus: params.a_plus ?? 0.01,
        a_minus: params.a_minus ?? 0.01,
        w_min: params.w_min ?? 0.0,
        w_max: params.w_max ?? 1.0,
        init_weight: params.init_weight ?? 0.5,
        init_std: params.init_std ?? 0.1
      });
    }

    layers.push({ neuron_layer, synaptic_layer });
  }

  return new SpikingNeuralNetwork(layers, {
    dt: params.dt ?? 1.0,
    lateral_inhibition: params.lateral_inhibition ?? false,
    inhibition_strength: params.inhibition_strength ?? 10.0
  });
}

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Rate encoding: Convert values to Poisson spike trains
 * @param {Float32Array|number[]} values Input values (0-1)
 * @param {number} dt Time step (ms)
 * @param {number} maxRate Maximum firing rate (Hz)
 * @returns {Float32Array} Spike indicators
 */
function rateEncoding(values, dt = 1.0, maxRate = 100) {
  const spikes = new Float32Array(values.length);
  const dtSeconds = dt / 1000;

  for (let i = 0; i < values.length; i++) {
    const rate = values[i] * maxRate;
    const prob = rate * dtSeconds;
    spikes[i] = Math.random() < prob ? 1 : 0;
  }

  return spikes;
}

/**
 * Temporal encoding: Convert values to time-to-first-spike
 * @param {Float32Array|number[]} values Input values (0-1)
 * @param {number} time Current time
 * @param {number} tStart Start time
 * @param {number} tWindow Time window
 * @returns {Float32Array} Spike indicators
 */
function temporalEncoding(values, time, tStart = 0, tWindow = 50) {
  const spikes = new Float32Array(values.length);

  for (let i = 0; i < values.length; i++) {
    // Higher values spike earlier
    const spikeTime = tStart + (1 - values[i]) * tWindow;
    spikes[i] = Math.abs(time - spikeTime) < 0.5 ? 1 : 0;
  }

  return spikes;
}

// ============================================================================
// Optional Native Bindings (graceful fallback)
// ============================================================================

let native = null;
try {
  native = require('../build/Release/snn_simd.node');
} catch {
  // Native not available, pure JS will be used
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Factory functions
  createFeedforwardSNN,

  // Classes
  SpikingNeuralNetwork,
  LIFLayer,
  SynapticLayer,

  // Encoding functions
  rateEncoding,
  temporalEncoding,

  // Utilities
  SIMDOps,

  // Native bindings (if available)
  native
};
