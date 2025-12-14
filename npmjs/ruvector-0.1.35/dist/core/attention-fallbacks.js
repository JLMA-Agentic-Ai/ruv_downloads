"use strict";
/**
 * Attention Fallbacks - Safe wrapper around @ruvector/attention with automatic array conversion
 *
 * This wrapper handles the array type conversion automatically, allowing users
 * to pass either regular arrays or Float32Arrays.
 *
 * @ruvector/attention requires Float32Array inputs.
 * This wrapper handles the conversion automatically.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoEAttention = exports.LocalGlobalAttention = exports.LinearAttention = exports.HyperbolicAttention = exports.FlashAttention = exports.MultiHeadAttention = void 0;
exports.projectToPoincareBall = projectToPoincareBall;
exports.poincareDistance = poincareDistance;
exports.mobiusAddition = mobiusAddition;
exports.expMap = expMap;
exports.logMap = logMap;
exports.isAttentionAvailable = isAttentionAvailable;
exports.getAttentionVersion = getAttentionVersion;
// Lazy load to avoid import errors if not installed
let attentionModule = null;
let loadError = null;
function getAttentionModule() {
    if (attentionModule)
        return attentionModule;
    if (loadError)
        throw loadError;
    try {
        attentionModule = require('@ruvector/attention');
        return attentionModule;
    }
    catch (e) {
        loadError = new Error(`@ruvector/attention is not installed or failed to load: ${e.message}\n` +
            `Install with: npm install @ruvector/attention`);
        throw loadError;
    }
}
/**
 * Convert any array-like input to Float32Array
 */
function toFloat32Array(input) {
    if (input instanceof Float32Array) {
        return input;
    }
    return new Float32Array(input);
}
/**
 * Convert nested arrays to Float32Arrays
 */
function toFloat32Arrays(inputs) {
    return inputs.map(arr => toFloat32Array(arr));
}
/**
 * Convert Float32Array result back to regular array if needed
 */
function fromFloat32Array(input) {
    return Array.from(input);
}
/**
 * Multi-head attention mechanism
 *
 * This wrapper automatically converts array inputs to Float32Array.
 */
class MultiHeadAttention {
    /**
     * Create a new multi-head attention instance
     *
     * @param dim - Embedding dimension (must be divisible by numHeads)
     * @param numHeads - Number of attention heads
     */
    constructor(dim, numHeads) {
        const attention = getAttentionModule();
        this.inner = new attention.MultiHeadAttention(dim, numHeads);
        this.dim = dim;
        this.numHeads = numHeads;
    }
    /**
     * Compute multi-head attention
     *
     * @param query - Query vector
     * @param keys - Array of key vectors
     * @param values - Array of value vectors
     * @returns Attention output
     *
     * @example
     * ```typescript
     * const mha = new MultiHeadAttention(64, 4);
     *
     * // Works with regular arrays
     * const result1 = mha.compute([...64 values], [[...64], [...64]], [[...64], [...64]]);
     *
     * // Also works with Float32Array
     * const q = new Float32Array(64);
     * const k = [new Float32Array(64)];
     * const v = [new Float32Array(64)];
     * const result2 = mha.compute(q, k, v);
     * ```
     */
    compute(query, keys, values) {
        const raw = this.inner.compute(toFloat32Array(query), toFloat32Arrays(keys), toFloat32Arrays(values));
        return {
            values: fromFloat32Array(raw),
            raw
        };
    }
    /**
     * Compute and return raw Float32Array (faster, no conversion)
     */
    computeRaw(query, keys, values) {
        return this.inner.compute(query, keys, values);
    }
    get headDim() {
        return this.dim / this.numHeads;
    }
}
exports.MultiHeadAttention = MultiHeadAttention;
/**
 * Flash attention with tiled computation
 */
class FlashAttention {
    /**
     * Create a new flash attention instance
     *
     * @param dim - Embedding dimension
     * @param blockSize - Block size for tiled computation (default: 512)
     */
    constructor(dim, blockSize = 512) {
        const attention = getAttentionModule();
        this.inner = new attention.FlashAttention(dim, blockSize);
        this.dim = dim;
        this.blockSize = blockSize;
    }
    /**
     * Compute flash attention
     */
    compute(query, keys, values) {
        const raw = this.inner.compute(toFloat32Array(query), toFloat32Arrays(keys), toFloat32Arrays(values));
        return {
            values: fromFloat32Array(raw),
            raw
        };
    }
    computeRaw(query, keys, values) {
        return this.inner.compute(query, keys, values);
    }
}
exports.FlashAttention = FlashAttention;
/**
 * Hyperbolic attention in Poincare ball model
 */
class HyperbolicAttention {
    /**
     * Create a new hyperbolic attention instance
     *
     * @param dim - Embedding dimension
     * @param curvature - Hyperbolic curvature (typically 1.0)
     */
    constructor(dim, curvature = 1.0) {
        const attention = getAttentionModule();
        this.inner = new attention.HyperbolicAttention(dim, curvature);
        this.dim = dim;
        this.curvature = curvature;
    }
    /**
     * Compute hyperbolic attention
     */
    compute(query, keys, values) {
        const raw = this.inner.compute(toFloat32Array(query), toFloat32Arrays(keys), toFloat32Arrays(values));
        return {
            values: fromFloat32Array(raw),
            raw
        };
    }
    computeRaw(query, keys, values) {
        return this.inner.compute(query, keys, values);
    }
}
exports.HyperbolicAttention = HyperbolicAttention;
/**
 * Linear attention (Performer-style) with O(n) complexity
 */
class LinearAttention {
    /**
     * Create a new linear attention instance
     *
     * @param dim - Embedding dimension
     * @param numFeatures - Number of random features
     */
    constructor(dim, numFeatures) {
        const attention = getAttentionModule();
        this.inner = new attention.LinearAttention(dim, numFeatures);
        this.dim = dim;
        this.numFeatures = numFeatures;
    }
    /**
     * Compute linear attention
     */
    compute(query, keys, values) {
        const raw = this.inner.compute(toFloat32Array(query), toFloat32Arrays(keys), toFloat32Arrays(values));
        return {
            values: fromFloat32Array(raw),
            raw
        };
    }
    computeRaw(query, keys, values) {
        return this.inner.compute(query, keys, values);
    }
}
exports.LinearAttention = LinearAttention;
/**
 * Local-global attention (Longformer-style)
 */
class LocalGlobalAttention {
    /**
     * Create a new local-global attention instance
     *
     * @param dim - Embedding dimension
     * @param localWindow - Size of local attention window
     * @param globalTokens - Number of global attention tokens
     */
    constructor(dim, localWindow, globalTokens) {
        const attention = getAttentionModule();
        this.inner = new attention.LocalGlobalAttention(dim, localWindow, globalTokens);
        this.dim = dim;
        this.localWindow = localWindow;
        this.globalTokens = globalTokens;
    }
    /**
     * Compute local-global attention
     */
    compute(query, keys, values) {
        const raw = this.inner.compute(toFloat32Array(query), toFloat32Arrays(keys), toFloat32Arrays(values));
        return {
            values: fromFloat32Array(raw),
            raw
        };
    }
    computeRaw(query, keys, values) {
        return this.inner.compute(query, keys, values);
    }
}
exports.LocalGlobalAttention = LocalGlobalAttention;
/**
 * Mixture of Experts attention
 */
class MoEAttention {
    /**
     * Create a new MoE attention instance
     *
     * @param config - MoE configuration
     */
    constructor(config) {
        const attention = getAttentionModule();
        this.inner = new attention.MoEAttention({
            dim: config.dim,
            num_experts: config.numExperts,
            top_k: config.topK,
            expert_capacity: config.expertCapacity ?? 1.25,
        });
        this.config = config;
    }
    /**
     * Create with simple parameters
     */
    static simple(dim, numExperts, topK) {
        return new MoEAttention({ dim, numExperts, topK });
    }
    /**
     * Compute MoE attention
     */
    compute(query, keys, values) {
        const raw = this.inner.compute(toFloat32Array(query), toFloat32Arrays(keys), toFloat32Arrays(values));
        return {
            values: fromFloat32Array(raw),
            raw
        };
    }
    computeRaw(query, keys, values) {
        return this.inner.compute(query, keys, values);
    }
}
exports.MoEAttention = MoEAttention;
// Hyperbolic math utilities
/**
 * Project a vector into the Poincare ball
 */
function projectToPoincareBall(vector, curvature = 1.0) {
    const attention = getAttentionModule();
    const result = attention.projectToPoincareBall(toFloat32Array(vector), curvature);
    return fromFloat32Array(result);
}
/**
 * Compute hyperbolic (Poincare) distance between two points
 */
function poincareDistance(a, b, curvature = 1.0) {
    const attention = getAttentionModule();
    return attention.poincareDistance(toFloat32Array(a), toFloat32Array(b), curvature);
}
/**
 * Mobius addition in hyperbolic space
 */
function mobiusAddition(a, b, curvature = 1.0) {
    const attention = getAttentionModule();
    const result = attention.mobiusAddition(toFloat32Array(a), toFloat32Array(b), curvature);
    return fromFloat32Array(result);
}
/**
 * Exponential map from tangent space to hyperbolic space
 */
function expMap(base, tangent, curvature = 1.0) {
    const attention = getAttentionModule();
    const result = attention.expMap(toFloat32Array(base), toFloat32Array(tangent), curvature);
    return fromFloat32Array(result);
}
/**
 * Logarithmic map from hyperbolic space to tangent space
 */
function logMap(base, point, curvature = 1.0) {
    const attention = getAttentionModule();
    const result = attention.logMap(toFloat32Array(base), toFloat32Array(point), curvature);
    return fromFloat32Array(result);
}
/**
 * Check if attention module is available
 */
function isAttentionAvailable() {
    try {
        getAttentionModule();
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Get attention module version
 */
function getAttentionVersion() {
    try {
        const attention = getAttentionModule();
        return attention.version?.() ?? null;
    }
    catch {
        return null;
    }
}
exports.default = {
    MultiHeadAttention,
    FlashAttention,
    HyperbolicAttention,
    LinearAttention,
    LocalGlobalAttention,
    MoEAttention,
    projectToPoincareBall,
    poincareDistance,
    mobiusAddition,
    expMap,
    logMap,
    isAttentionAvailable,
    getAttentionVersion,
};
