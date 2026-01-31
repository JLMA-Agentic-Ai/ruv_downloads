let wasm;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export(addHeapObject(e));
    }
}

let heap = new Array(128).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

let WASM_VECTOR_LEN = 0;

const TransportResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_transportresult_free(ptr >>> 0, 1));

const WasmFisherInformationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmfisherinformation_free(ptr >>> 0, 1));

const WasmGromovWassersteinFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmgromovwasserstein_free(ptr >>> 0, 1));

const WasmNaturalGradientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmnaturalgradient_free(ptr >>> 0, 1));

const WasmProductManifoldFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmproductmanifold_free(ptr >>> 0, 1));

const WasmSinkhornFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsinkhorn_free(ptr >>> 0, 1));

const WasmSlicedWassersteinFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmslicedwasserstein_free(ptr >>> 0, 1));

const WasmSphericalSpaceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmsphericalspace_free(ptr >>> 0, 1));

/**
 * Result of Sinkhorn transport computation
 */
export class TransportResult {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TransportResult.prototype);
        obj.__wbg_ptr = ptr;
        TransportResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TransportResultFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transportresult_free(ptr, 0);
    }
    /**
     * Get number of iterations
     * @returns {number}
     */
    get iterations() {
        const ret = wasm.transportresult_iterations(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get total transport cost
     * @returns {number}
     */
    get cost() {
        const ret = wasm.transportresult_cost(this.__wbg_ptr);
        return ret;
    }
    /**
     * Get transport plan as flat array
     * @returns {Float64Array}
     */
    get plan() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transportresult_plan(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Whether algorithm converged
     * @returns {boolean}
     */
    get converged() {
        const ret = wasm.transportresult_converged(this.__wbg_ptr);
        return ret !== 0;
    }
}
if (Symbol.dispose) TransportResult.prototype[Symbol.dispose] = TransportResult.prototype.free;

/**
 * Fisher Information for WASM
 */
export class WasmFisherInformation {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmFisherInformation.prototype);
        obj.__wbg_ptr = ptr;
        WasmFisherInformationFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmFisherInformationFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmfisherinformation_free(ptr, 0);
    }
    /**
     * Compute diagonal FIM from gradient samples
     * @param {Float64Array} gradients
     * @param {number} _num_samples
     * @param {number} dim
     * @returns {Float64Array}
     */
    diagonalFim(gradients, _num_samples, dim) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(gradients, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmfisherinformation_diagonalFim(retptr, this.__wbg_ptr, ptr0, len0, _num_samples, dim);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Set damping factor
     * @param {number} damping
     * @returns {WasmFisherInformation}
     */
    withDamping(damping) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmfisherinformation_withDamping(ptr, damping);
        return WasmFisherInformation.__wrap(ret);
    }
    /**
     * Compute natural gradient
     * @param {Float64Array} fim_diag
     * @param {Float64Array} gradient
     * @param {number} damping
     * @returns {Float64Array}
     */
    naturalGradient(fim_diag, gradient, damping) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(fim_diag, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(gradient, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmfisherinformation_naturalGradient(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, damping);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v3 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Create a new Fisher Information calculator
     */
    constructor() {
        const ret = wasm.wasmfisherinformation_new();
        this.__wbg_ptr = ret >>> 0;
        WasmFisherInformationFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) WasmFisherInformation.prototype[Symbol.dispose] = WasmFisherInformation.prototype.free;

/**
 * Gromov-Wasserstein distance for WASM
 */
export class WasmGromovWasserstein {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmGromovWassersteinFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmgromovwasserstein_free(ptr, 0);
    }
    /**
     * Create a new Gromov-Wasserstein calculator
     * @param {number} regularization
     */
    constructor(regularization) {
        const ret = wasm.wasmgromovwasserstein_new(regularization);
        this.__wbg_ptr = ret >>> 0;
        WasmGromovWassersteinFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Compute GW distance between point clouds
     * @param {Float64Array} source
     * @param {Float64Array} target
     * @param {number} dim
     * @returns {number}
     */
    distance(source, target, dim) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(source, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(target, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmgromovwasserstein_distance(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, dim);
            var r0 = getDataViewMemory0().getFloat64(retptr + 8 * 0, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            return r0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
if (Symbol.dispose) WasmGromovWasserstein.prototype[Symbol.dispose] = WasmGromovWasserstein.prototype.free;

/**
 * Natural Gradient optimizer for WASM
 */
export class WasmNaturalGradient {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmNaturalGradient.prototype);
        obj.__wbg_ptr = ptr;
        WasmNaturalGradientFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmNaturalGradientFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmnaturalgradient_free(ptr, 0);
    }
    /**
     * Set damping factor
     * @param {number} damping
     * @returns {WasmNaturalGradient}
     */
    withDamping(damping) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmnaturalgradient_withDamping(ptr, damping);
        return WasmNaturalGradient.__wrap(ret);
    }
    /**
     * Use diagonal approximation
     * @param {boolean} use_diagonal
     * @returns {WasmNaturalGradient}
     */
    withDiagonal(use_diagonal) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmnaturalgradient_withDiagonal(ptr, use_diagonal);
        return WasmNaturalGradient.__wrap(ret);
    }
    /**
     * Create a new Natural Gradient optimizer
     * @param {number} learning_rate
     */
    constructor(learning_rate) {
        const ret = wasm.wasmnaturalgradient_new(learning_rate);
        this.__wbg_ptr = ret >>> 0;
        WasmNaturalGradientFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Compute update step
     * @param {Float64Array} gradient
     * @param {Float64Array | null | undefined} gradient_samples
     * @param {number} dim
     * @returns {Float64Array}
     */
    step(gradient, gradient_samples, dim) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(gradient, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(gradient_samples) ? 0 : passArrayF64ToWasm0(gradient_samples, wasm.__wbindgen_export3);
            var len1 = WASM_VECTOR_LEN;
            wasm.wasmnaturalgradient_step(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, dim);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Reset optimizer state
     */
    reset() {
        wasm.wasmnaturalgradient_reset(this.__wbg_ptr);
    }
}
if (Symbol.dispose) WasmNaturalGradient.prototype[Symbol.dispose] = WasmNaturalGradient.prototype.free;

/**
 * Product manifold for WASM: E^e × H^h × S^s
 */
export class WasmProductManifold {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmProductManifoldFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmproductmanifold_free(ptr, 0);
    }
    /**
     * Fréchet mean
     * @param {Float64Array} points
     * @param {number} _num_points
     * @returns {Float64Array}
     */
    frechetMean(points, _num_points) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(points, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmproductmanifold_frechetMean(retptr, this.__wbg_ptr, ptr0, len0, _num_points);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Pairwise distances
     * @param {Float64Array} points
     * @returns {Float64Array}
     */
    pairwiseDistances(points) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(points, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmproductmanifold_pairwiseDistances(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Get total dimension
     * @returns {number}
     */
    get dim() {
        const ret = wasm.wasmproductmanifold_dim(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * K-nearest neighbors
     * @param {Float64Array} query
     * @param {Float64Array} points
     * @param {number} k
     * @returns {Uint32Array}
     */
    knn(query, points, k) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(query, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(points, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmproductmanifold_knn(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, k);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayU32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Create a new product manifold
     *
     * @param euclidean_dim - Dimension of Euclidean component
     * @param hyperbolic_dim - Dimension of hyperbolic component
     * @param spherical_dim - Dimension of spherical component
     * @param {number} euclidean_dim
     * @param {number} hyperbolic_dim
     * @param {number} spherical_dim
     */
    constructor(euclidean_dim, hyperbolic_dim, spherical_dim) {
        const ret = wasm.wasmproductmanifold_new(euclidean_dim, hyperbolic_dim, spherical_dim);
        this.__wbg_ptr = ret >>> 0;
        WasmProductManifoldFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Exponential map
     * @param {Float64Array} x
     * @param {Float64Array} v
     * @returns {Float64Array}
     */
    expMap(x, v) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(v, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmproductmanifold_expMap(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Logarithmic map
     * @param {Float64Array} x
     * @param {Float64Array} y
     * @returns {Float64Array}
     */
    logMap(x, y) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(y, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmproductmanifold_logMap(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Project point onto manifold
     * @param {Float64Array} point
     * @returns {Float64Array}
     */
    project(point) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(point, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmproductmanifold_project(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Compute distance in product manifold
     * @param {Float64Array} x
     * @param {Float64Array} y
     * @returns {number}
     */
    distance(x, y) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(y, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmproductmanifold_distance(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getFloat64(retptr + 8 * 0, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            return r0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Geodesic interpolation
     * @param {Float64Array} x
     * @param {Float64Array} y
     * @param {number} t
     * @returns {Float64Array}
     */
    geodesic(x, y, t) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(y, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmproductmanifold_geodesic(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, t);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
if (Symbol.dispose) WasmProductManifold.prototype[Symbol.dispose] = WasmProductManifold.prototype.free;

/**
 * Sinkhorn optimal transport solver for WASM
 */
export class WasmSinkhorn {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSinkhornFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsinkhorn_free(ptr, 0);
    }
    /**
     * Solve optimal transport and return transport plan
     * @param {Float64Array} cost_matrix
     * @param {Float64Array} source_weights
     * @param {Float64Array} target_weights
     * @param {number} n
     * @param {number} m
     * @returns {TransportResult}
     */
    solveTransport(cost_matrix, source_weights, target_weights, n, m) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(cost_matrix, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(source_weights, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArrayF64ToWasm0(target_weights, wasm.__wbindgen_export3);
            const len2 = WASM_VECTOR_LEN;
            wasm.wasmsinkhorn_solveTransport(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, n, m);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return TransportResult.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Create a new Sinkhorn solver
     *
     * @param regularization - Entropy regularization (0.01-0.1 typical)
     * @param max_iterations - Maximum iterations (100-1000 typical)
     * @param {number} regularization
     * @param {number} max_iterations
     */
    constructor(regularization, max_iterations) {
        const ret = wasm.wasmsinkhorn_new(regularization, max_iterations);
        this.__wbg_ptr = ret >>> 0;
        WasmSinkhornFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Compute transport cost between point clouds
     * @param {Float64Array} source
     * @param {Float64Array} target
     * @param {number} dim
     * @returns {number}
     */
    distance(source, target, dim) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(source, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(target, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmsinkhorn_distance(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, dim);
            var r0 = getDataViewMemory0().getFloat64(retptr + 8 * 0, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            return r0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
if (Symbol.dispose) WasmSinkhorn.prototype[Symbol.dispose] = WasmSinkhorn.prototype.free;

/**
 * Sliced Wasserstein distance calculator for WASM
 */
export class WasmSlicedWasserstein {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSlicedWasserstein.prototype);
        obj.__wbg_ptr = ptr;
        WasmSlicedWassersteinFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSlicedWassersteinFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmslicedwasserstein_free(ptr, 0);
    }
    /**
     * Set Wasserstein power (1 for W1, 2 for W2)
     * @param {number} p
     * @returns {WasmSlicedWasserstein}
     */
    withPower(p) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmslicedwasserstein_withPower(ptr, p);
        return WasmSlicedWasserstein.__wrap(ret);
    }
    /**
     * Compute weighted distance
     * @param {Float64Array} source
     * @param {Float64Array} source_weights
     * @param {Float64Array} target
     * @param {Float64Array} target_weights
     * @param {number} dim
     * @returns {number}
     */
    weightedDistance(source, source_weights, target, target_weights, dim) {
        const ptr0 = passArrayF64ToWasm0(source, wasm.__wbindgen_export3);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(source_weights, wasm.__wbindgen_export3);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayF64ToWasm0(target, wasm.__wbindgen_export3);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passArrayF64ToWasm0(target_weights, wasm.__wbindgen_export3);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.wasmslicedwasserstein_weightedDistance(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, dim);
        return ret;
    }
    /**
     * Create a new Sliced Wasserstein calculator
     *
     * @param num_projections - Number of random 1D projections (100-1000 typical)
     * @param {number} num_projections
     */
    constructor(num_projections) {
        const ret = wasm.wasmslicedwasserstein_new(num_projections);
        this.__wbg_ptr = ret >>> 0;
        WasmSlicedWassersteinFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Compute distance between two point clouds
     *
     * @param source - Source points as flat array [x1, y1, z1, x2, y2, z2, ...]
     * @param target - Target points as flat array
     * @param dim - Dimension of each point
     * @param {Float64Array} source
     * @param {Float64Array} target
     * @param {number} dim
     * @returns {number}
     */
    distance(source, target, dim) {
        const ptr0 = passArrayF64ToWasm0(source, wasm.__wbindgen_export3);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayF64ToWasm0(target, wasm.__wbindgen_export3);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmslicedwasserstein_distance(this.__wbg_ptr, ptr0, len0, ptr1, len1, dim);
        return ret;
    }
    /**
     * Set random seed for reproducibility
     * @param {bigint} seed
     * @returns {WasmSlicedWasserstein}
     */
    withSeed(seed) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.wasmslicedwasserstein_withSeed(ptr, seed);
        return WasmSlicedWasserstein.__wrap(ret);
    }
}
if (Symbol.dispose) WasmSlicedWasserstein.prototype[Symbol.dispose] = WasmSlicedWasserstein.prototype.free;

/**
 * Spherical space operations for WASM
 */
export class WasmSphericalSpace {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSphericalSpaceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmsphericalspace_free(ptr, 0);
    }
    /**
     * Get ambient dimension
     * @returns {number}
     */
    get ambientDim() {
        const ret = wasm.wasmsphericalspace_ambientDim(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Fréchet mean of points
     * @param {Float64Array} points
     * @param {number} dim
     * @returns {Float64Array}
     */
    frechetMean(points, dim) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(points, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmsphericalspace_frechetMean(retptr, this.__wbg_ptr, ptr0, len0, dim);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Create a new spherical space S^{n-1} embedded in R^n
     * @param {number} ambient_dim
     */
    constructor(ambient_dim) {
        const ret = wasm.wasmsphericalspace_new(ambient_dim);
        this.__wbg_ptr = ret >>> 0;
        WasmSphericalSpaceFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Exponential map: move from x in direction v
     * @param {Float64Array} x
     * @param {Float64Array} v
     * @returns {Float64Array}
     */
    expMap(x, v) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(v, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmsphericalspace_expMap(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Logarithmic map: tangent vector at x pointing toward y
     * @param {Float64Array} x
     * @param {Float64Array} y
     * @returns {Float64Array}
     */
    logMap(x, y) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(y, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmsphericalspace_logMap(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Project point onto sphere
     * @param {Float64Array} point
     * @returns {Float64Array}
     */
    project(point) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(point, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasmsphericalspace_project(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Geodesic distance on sphere
     * @param {Float64Array} x
     * @param {Float64Array} y
     * @returns {number}
     */
    distance(x, y) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(y, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmsphericalspace_distance(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getFloat64(retptr + 8 * 0, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            return r0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Geodesic interpolation at fraction t
     * @param {Float64Array} x
     * @param {Float64Array} y
     * @param {number} t
     * @returns {Float64Array}
     */
    geodesic(x, y, t) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayF64ToWasm0(x, wasm.__wbindgen_export3);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayF64ToWasm0(y, wasm.__wbindgen_export3);
            const len1 = WASM_VECTOR_LEN;
            wasm.wasmsphericalspace_geodesic(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, t);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayF64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export2(r0, r1 * 8, 8);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
if (Symbol.dispose) WasmSphericalSpace.prototype[Symbol.dispose] = WasmSphericalSpace.prototype.free;

export function start() {
    wasm.start();
}

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_Error_52673b7de5a0ca89 = function(arg0, arg1) {
        const ret = Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg___wbindgen_is_function_8d400b8b1af978cd = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_object_ce774f3490692386 = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_string_704ef9c8fc131030 = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_undefined_f6b95eab589e0269 = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_call_3020136f7a2d6e44 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_abb4ff46ce38be40 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_574e78ad8b13b65f = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_export2(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_getRandomValues_b8f5dbd5f3995a9e = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_length_22ac23eaec9d8053 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_msCrypto_a61aeb35a24c1329 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_no_args_cb138f77cf6151ee = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_with_length_aa5eaf41d35235e5 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_905d3e251edff8a2 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_process_dc0fbacc7c1c06f7 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_prototypesetcall_dfe9b766cdc1f1fd = function(arg0, arg1, arg2) {
        Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), getObject(arg2));
    };
    imports.wbg.__wbg_randomFillSync_ac0988aba3254290 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_require_60cc747a6bc5215a = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export3, wasm.__wbindgen_export4);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_769e6b65d6557335 = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1 = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_08f5a74c69739274 = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_a8924b26aa92d024 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_845f2f5bce7d061a = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_c01dfd4722a88165 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_cb9088102bce6b30 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
        const ret = getArrayU8FromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('ruvector_math_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
