/**
 * V3 Integration Module Types
 *
 * Type definitions for deep integration with agentic-flow@alpha.
 * Implements ADR-001: Adopt agentic-flow as Core Foundation
 *
 * @module v3/integration/types
 * @version 3.0.0-alpha.1
 */
// ===== Error Types =====
export class IntegrationError extends Error {
    code;
    component;
    cause;
    constructor(message, code, component, cause) {
        super(message);
        this.code = code;
        this.component = component;
        this.cause = cause;
        this.name = 'IntegrationError';
    }
}
// ===== Default Configurations =====
export const DEFAULT_SONA_CONFIG = {
    mode: 'balanced',
    learningRate: 0.001,
    similarityThreshold: 0.7,
    maxPatterns: 10000,
    enableTrajectoryTracking: true,
    consolidationInterval: 3600000, // 1 hour
    autoModeSelection: true,
};
export const DEFAULT_ATTENTION_CONFIG = {
    mechanism: 'flash',
    numHeads: 8,
    headDim: 64,
    dropoutRate: 0.0,
    causalMask: false,
    useRoPE: true,
    flashOptLevel: 2,
    memoryOptimization: 'moderate',
};
export const DEFAULT_AGENTDB_CONFIG = {
    dimension: 1536, // OpenAI embedding dimension
    indexType: 'hnsw',
    hnswM: 16,
    hnswEfConstruction: 200,
    hnswEfSearch: 50,
    metric: 'cosine',
    enableCache: true,
    cacheSizeMb: 256,
    enableWAL: true,
};
export const DEFAULT_FEATURE_FLAGS = {
    enableSONA: true,
    enableFlashAttention: true,
    enableAgentDB: true,
    enableTrajectoryTracking: true,
    enableGNN: true,
    enableIntelligenceBridge: true,
    enableQUICTransport: false, // Disabled by default (requires additional setup)
    enableNightlyLearning: false, // Disabled by default (resource intensive)
    enableAutoConsolidation: true,
};
export const DEFAULT_INTEGRATION_CONFIG = {
    sona: DEFAULT_SONA_CONFIG,
    attention: DEFAULT_ATTENTION_CONFIG,
    agentdb: DEFAULT_AGENTDB_CONFIG,
    features: DEFAULT_FEATURE_FLAGS,
    runtimePreference: ['napi', 'wasm', 'js'],
    lazyLoad: true,
    debug: false,
};
//# sourceMappingURL=types.js.map