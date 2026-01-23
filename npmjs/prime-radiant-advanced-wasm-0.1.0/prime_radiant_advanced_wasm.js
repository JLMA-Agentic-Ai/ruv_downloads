/* @ts-self-types="./prime_radiant_advanced_wasm.d.ts" */

/**
 * Category theory engine
 */
export class CategoryEngine {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CategoryEngineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_categoryengine_free(ptr, 0);
    }
    /**
     * Apply morphism to an object
     * @param {any} morphism_js
     * @param {any} data_js
     * @returns {any}
     */
    applyMorphism(morphism_js, data_js) {
        const ret = wasm.categoryengine_applyMorphism(this.__wbg_ptr, morphism_js, data_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Compose two morphisms
     * @param {any} f_js
     * @param {any} g_js
     * @returns {any}
     */
    composeMorphisms(f_js, g_js) {
        const ret = wasm.categoryengine_composeMorphisms(this.__wbg_ptr, f_js, g_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Functorial retrieval: find similar objects
     * @param {any} category_js
     * @param {any} query_js
     * @param {number} k
     * @returns {any}
     */
    functorialRetrieve(category_js, query_js, k) {
        const ret = wasm.categoryengine_functorialRetrieve(this.__wbg_ptr, category_js, query_js, k);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create a new category engine
     */
    constructor() {
        const ret = wasm.categoryengine_new();
        this.__wbg_ptr = ret >>> 0;
        CategoryEngineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Verify categorical laws
     * @param {any} category_js
     * @returns {boolean}
     */
    verifyCategoryLaws(category_js) {
        const ret = wasm.categoryengine_verifyCategoryLaws(this.__wbg_ptr, category_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * Check if functor preserves composition
     * @param {any} functor_js
     * @param {any} source_cat_js
     * @returns {boolean}
     */
    verifyFunctoriality(functor_js, source_cat_js) {
        const ret = wasm.categoryengine_verifyFunctoriality(this.__wbg_ptr, functor_js, source_cat_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
}
if (Symbol.dispose) CategoryEngine.prototype[Symbol.dispose] = CategoryEngine.prototype.free;

/**
 * Causal inference engine
 */
export class CausalEngine {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CausalEngineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_causalengine_free(ptr, 0);
    }
    /**
     * Check d-separation between two variables
     * @param {any} model_js
     * @param {string} x
     * @param {string} y
     * @param {any} conditioning_js
     * @returns {any}
     */
    checkDSeparation(model_js, x, y, conditioning_js) {
        const ptr0 = passStringToWasm0(x, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(y, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.causalengine_checkDSeparation(this.__wbg_ptr, model_js, ptr0, len0, ptr1, len1, conditioning_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Compute causal effect via do-operator
     * @param {any} model_js
     * @param {string} treatment
     * @param {string} outcome
     * @param {number} treatment_value
     * @returns {any}
     */
    computeCausalEffect(model_js, treatment, outcome, treatment_value) {
        const ptr0 = passStringToWasm0(treatment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(outcome, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.causalengine_computeCausalEffect(this.__wbg_ptr, model_js, ptr0, len0, ptr1, len1, treatment_value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Find all confounders between two variables
     * @param {any} model_js
     * @param {string} treatment
     * @param {string} outcome
     * @returns {any}
     */
    findConfounders(model_js, treatment, outcome) {
        const ptr0 = passStringToWasm0(treatment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(outcome, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.causalengine_findConfounders(this.__wbg_ptr, model_js, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Check if model is a valid DAG
     * @param {any} model_js
     * @returns {boolean}
     */
    isValidDag(model_js) {
        const ret = wasm.causalengine_isValidDag(this.__wbg_ptr, model_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * Create a new causal engine
     */
    constructor() {
        const ret = wasm.categoryengine_new();
        this.__wbg_ptr = ret >>> 0;
        CausalEngineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get topological order of variables
     * @param {any} model_js
     * @returns {any}
     */
    topologicalOrder(model_js) {
        const ret = wasm.causalengine_topologicalOrder(this.__wbg_ptr, model_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}
if (Symbol.dispose) CausalEngine.prototype[Symbol.dispose] = CausalEngine.prototype.free;

/**
 * Sheaf cohomology computation engine
 */
export class CohomologyEngine {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CohomologyEngine.prototype);
        obj.__wbg_ptr = ptr;
        CohomologyEngineFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CohomologyEngineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cohomologyengine_free(ptr, 0);
    }
    /**
     * Compute cohomology groups of a sheaf graph
     * @param {any} graph_js
     * @returns {any}
     */
    computeCohomology(graph_js) {
        const ret = wasm.cohomologyengine_computeCohomology(this.__wbg_ptr, graph_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Compute global sections (H^0)
     * @param {any} graph_js
     * @returns {any}
     */
    computeGlobalSections(graph_js) {
        const ret = wasm.cohomologyengine_computeGlobalSections(this.__wbg_ptr, graph_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Compute consistency energy
     * @param {any} graph_js
     * @returns {number}
     */
    consistencyEnergy(graph_js) {
        const ret = wasm.cohomologyengine_consistencyEnergy(this.__wbg_ptr, graph_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * Detect all obstructions to global consistency
     * @param {any} graph_js
     * @returns {any}
     */
    detectObstructions(graph_js) {
        const ret = wasm.cohomologyengine_detectObstructions(this.__wbg_ptr, graph_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create a new cohomology engine
     */
    constructor() {
        const ret = wasm.categoryengine_new();
        this.__wbg_ptr = ret >>> 0;
        CohomologyEngineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Create with custom tolerance
     * @param {number} tolerance
     * @returns {CohomologyEngine}
     */
    static withTolerance(tolerance) {
        const ret = wasm.cohomologyengine_withTolerance(tolerance);
        return CohomologyEngine.__wrap(ret);
    }
}
if (Symbol.dispose) CohomologyEngine.prototype[Symbol.dispose] = CohomologyEngine.prototype.free;

/**
 * HoTT type checking and path operations engine
 */
export class HoTTEngine {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(HoTTEngine.prototype);
        obj.__wbg_ptr = ptr;
        HoTTEngineFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HoTTEngineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_hottengine_free(ptr, 0);
    }
    /**
     * Check type equivalence (univalence-related)
     * @param {any} type1_js
     * @param {any} type2_js
     * @returns {boolean}
     */
    checkTypeEquivalence(type1_js, type2_js) {
        const ret = wasm.hottengine_checkTypeEquivalence(this.__wbg_ptr, type1_js, type2_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * Compose two paths
     * @param {any} path1_js
     * @param {any} path2_js
     * @returns {any}
     */
    composePaths(path1_js, path2_js) {
        const ret = wasm.hottengine_composePaths(this.__wbg_ptr, path1_js, path2_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create reflexivity path
     * @param {any} type_js
     * @param {any} point_js
     * @returns {any}
     */
    createReflPath(type_js, point_js) {
        const ret = wasm.hottengine_createReflPath(this.__wbg_ptr, type_js, point_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Infer type of a term
     * @param {any} term_js
     * @returns {any}
     */
    inferType(term_js) {
        const ret = wasm.hottengine_inferType(this.__wbg_ptr, term_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Invert a path
     * @param {any} path_js
     * @returns {any}
     */
    invertPath(path_js) {
        const ret = wasm.hottengine_invertPath(this.__wbg_ptr, path_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create a new HoTT engine
     */
    constructor() {
        const ret = wasm.hottengine_new();
        this.__wbg_ptr = ret >>> 0;
        HoTTEngineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Type check a term
     * @param {any} term_js
     * @param {any} expected_type_js
     * @returns {any}
     */
    typeCheck(term_js, expected_type_js) {
        const ret = wasm.hottengine_typeCheck(this.__wbg_ptr, term_js, expected_type_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create with strict mode
     * @param {boolean} strict
     * @returns {HoTTEngine}
     */
    static withStrictMode(strict) {
        const ret = wasm.hottengine_withStrictMode(strict);
        return HoTTEngine.__wrap(ret);
    }
}
if (Symbol.dispose) HoTTEngine.prototype[Symbol.dispose] = HoTTEngine.prototype.free;

/**
 * Quantum computing and topological analysis engine
 */
export class QuantumEngine {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        QuantumEngineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_quantumengine_free(ptr, 0);
    }
    /**
     * Simulate quantum circuit evolution
     * @param {any} state_js
     * @param {any} gate_js
     * @param {number} target_qubit
     * @returns {any}
     */
    applyGate(state_js, gate_js, target_qubit) {
        const ret = wasm.quantumengine_applyGate(this.__wbg_ptr, state_js, gate_js, target_qubit);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Compute entanglement entropy
     * @param {any} state_js
     * @param {number} subsystem_size
     * @returns {number}
     */
    computeEntanglementEntropy(state_js, subsystem_size) {
        const ret = wasm.quantumengine_computeEntanglementEntropy(this.__wbg_ptr, state_js, subsystem_size);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * Compute quantum state fidelity
     * @param {any} state1_js
     * @param {any} state2_js
     * @returns {any}
     */
    computeFidelity(state1_js, state2_js) {
        const ret = wasm.quantumengine_computeFidelity(this.__wbg_ptr, state1_js, state2_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Compute topological invariants of a simplicial complex
     * @param {any} simplices_js
     * @returns {any}
     */
    computeTopologicalInvariants(simplices_js) {
        const ret = wasm.quantumengine_computeTopologicalInvariants(this.__wbg_ptr, simplices_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create a GHZ state
     * @param {number} num_qubits
     * @returns {any}
     */
    createGHZState(num_qubits) {
        const ret = wasm.quantumengine_createGHZState(this.__wbg_ptr, num_qubits);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create a W state
     * @param {number} num_qubits
     * @returns {any}
     */
    createWState(num_qubits) {
        const ret = wasm.quantumengine_createWState(this.__wbg_ptr, num_qubits);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create a new quantum engine
     */
    constructor() {
        const ret = wasm.categoryengine_new();
        this.__wbg_ptr = ret >>> 0;
        QuantumEngineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) QuantumEngine.prototype[Symbol.dispose] = QuantumEngine.prototype.free;

/**
 * Spectral analysis engine
 */
export class SpectralEngine {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SpectralEngine.prototype);
        obj.__wbg_ptr = ptr;
        SpectralEngineFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SpectralEngineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_spectralengine_free(ptr, 0);
    }
    /**
     * Compute the algebraic connectivity (Fiedler value)
     * @param {any} graph_js
     * @returns {number}
     */
    algebraicConnectivity(graph_js) {
        const ret = wasm.spectralengine_algebraicConnectivity(this.__wbg_ptr, graph_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * Compute Cheeger bounds for a graph
     * @param {any} graph_js
     * @returns {any}
     */
    computeCheegerBounds(graph_js) {
        const ret = wasm.spectralengine_computeCheegerBounds(this.__wbg_ptr, graph_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Compute eigenvalues of the graph Laplacian
     * @param {any} graph_js
     * @returns {any}
     */
    computeEigenvalues(graph_js) {
        const ret = wasm.spectralengine_computeEigenvalues(this.__wbg_ptr, graph_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Compute Fiedler vector
     * @param {any} graph_js
     * @returns {any}
     */
    computeFiedlerVector(graph_js) {
        const ret = wasm.spectralengine_computeFiedlerVector(this.__wbg_ptr, graph_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Compute spectral gap
     * @param {any} graph_js
     * @returns {any}
     */
    computeSpectralGap(graph_js) {
        const ret = wasm.spectralengine_computeSpectralGap(this.__wbg_ptr, graph_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create a new spectral engine
     */
    constructor() {
        const ret = wasm.spectralengine_new();
        this.__wbg_ptr = ret >>> 0;
        SpectralEngineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Predict minimum cut
     * @param {any} graph_js
     * @returns {any}
     */
    predictMinCut(graph_js) {
        const ret = wasm.spectralengine_predictMinCut(this.__wbg_ptr, graph_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create with configuration
     * @param {number} num_eigenvalues
     * @param {number} tolerance
     * @param {number} max_iterations
     * @returns {SpectralEngine}
     */
    static withConfig(num_eigenvalues, tolerance, max_iterations) {
        const ret = wasm.spectralengine_withConfig(num_eigenvalues, tolerance, max_iterations);
        return SpectralEngine.__wrap(ret);
    }
}
if (Symbol.dispose) SpectralEngine.prototype[Symbol.dispose] = SpectralEngine.prototype.free;

/**
 * JavaScript-friendly error type
 */
export class WasmError {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmErrorFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmerror_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get code() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmerror_code(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get message() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmerror_message(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmError.prototype[Symbol.dispose] = WasmError.prototype.free;

/**
 * Get library version
 * @returns {string}
 */
export function getVersion() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.getVersion();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * Initialize the WASM module
 */
export function initModule() {
    const ret = wasm.initModule();
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

export function start() {
    wasm.start();
}

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_8c4e43fe74559d73: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_Number_04624de7d0e8332d: function(arg0) {
            const ret = Number(arg0);
            return ret;
        },
        __wbg_String_8f0eb39a4a4c2f66: function(arg0, arg1) {
            const ret = String(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_bigint_get_as_i64_8fcf4ce7f1ca72a2: function(arg0, arg1) {
            const v = arg1;
            const ret = typeof(v) === 'bigint' ? v : undefined;
            getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_boolean_get_bbbb1c18aa2f5e25: function(arg0) {
            const v = arg0;
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_debug_string_0bc8482c6e3508ae: function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_in_47fa6863be6f2f25: function(arg0, arg1) {
            const ret = arg0 in arg1;
            return ret;
        },
        __wbg___wbindgen_is_bigint_31b12575b56f32fc: function(arg0) {
            const ret = typeof(arg0) === 'bigint';
            return ret;
        },
        __wbg___wbindgen_is_function_0095a73b8b156f76: function(arg0) {
            const ret = typeof(arg0) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_object_5ae8e5880f2c1fbd: function(arg0) {
            const val = arg0;
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_9e4d92534c42d778: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_jsval_eq_11888390b0186270: function(arg0, arg1) {
            const ret = arg0 === arg1;
            return ret;
        },
        __wbg___wbindgen_jsval_loose_eq_9dd77d8cd6671811: function(arg0, arg1) {
            const ret = arg0 == arg1;
            return ret;
        },
        __wbg___wbindgen_number_get_8ff4255516ccad3e: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_72fb696202c56729: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_be289d5034ed271b: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_call_389efe28435a9388: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.call(arg1);
            return ret;
        }, arguments); },
        __wbg_done_57b39ecd9addfe81: function(arg0) {
            const ret = arg0.done;
            return ret;
        },
        __wbg_entries_58c7934c745daac7: function(arg0) {
            const ret = Object.entries(arg0);
            return ret;
        },
        __wbg_error_7534b8e9a36f1ab4: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_get_9b94d73e6221f75c: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_get_b3ed3ad4be2bc8ac: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_get_with_ref_key_1dc361bd10053bfe: function(arg0, arg1) {
            const ret = arg0[arg1];
            return ret;
        },
        __wbg_instanceof_ArrayBuffer_c367199e2fa2aa04: function(arg0) {
            let result;
            try {
                result = arg0 instanceof ArrayBuffer;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Uint8Array_9b9075935c74707c: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Uint8Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_isArray_d314bb98fcf08331: function(arg0) {
            const ret = Array.isArray(arg0);
            return ret;
        },
        __wbg_isSafeInteger_bfbc7332a9768d2a: function(arg0) {
            const ret = Number.isSafeInteger(arg0);
            return ret;
        },
        __wbg_iterator_6ff6560ca1568e55: function() {
            const ret = Symbol.iterator;
            return ret;
        },
        __wbg_length_32ed9a279acd054c: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_35a7bace40f36eac: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_new_361308b2356cecd0: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_new_3eb36ae241fe6f44: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_new_8a6f238a6ece86ea: function() {
            const ret = new Error();
            return ret;
        },
        __wbg_new_dd2b680c8bf6ae29: function(arg0) {
            const ret = new Uint8Array(arg0);
            return ret;
        },
        __wbg_next_3482f54c49e8af19: function() { return handleError(function (arg0) {
            const ret = arg0.next();
            return ret;
        }, arguments); },
        __wbg_next_418f80d8f5303233: function(arg0) {
            const ret = arg0.next;
            return ret;
        },
        __wbg_prototypesetcall_bdcdcc5842e4d77d: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
        },
        __wbg_set_3f1d0b984ed272ed: function(arg0, arg1, arg2) {
            arg0[arg1] = arg2;
        },
        __wbg_set_f43e577aea94465b: function(arg0, arg1, arg2) {
            arg0[arg1 >>> 0] = arg2;
        },
        __wbg_stack_0ed75d68575b0f3c: function(arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_value_0546255b415e96c1: function(arg0) {
            const ret = arg0.value;
            return ret;
        },
        __wbindgen_cast_0000000000000001: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0) {
            // Cast intrinsic for `I64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000003: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_cast_0000000000000004: function(arg0) {
            // Cast intrinsic for `U64 -> Externref`.
            const ret = BigInt.asUintN(64, arg0);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./prime_radiant_advanced_wasm_bg.js": import0,
    };
}

const CategoryEngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_categoryengine_free(ptr >>> 0, 1));
const CausalEngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_causalengine_free(ptr >>> 0, 1));
const CohomologyEngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cohomologyengine_free(ptr >>> 0, 1));
const HoTTEngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_hottengine_free(ptr >>> 0, 1));
const QuantumEngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_quantumengine_free(ptr >>> 0, 1));
const SpectralEngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_spectralengine_free(ptr >>> 0, 1));
const WasmErrorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmerror_free(ptr >>> 0, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
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

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
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

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
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
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
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

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
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


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('prime_radiant_advanced_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
