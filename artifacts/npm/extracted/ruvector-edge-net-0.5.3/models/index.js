/**
 * @ruvector/edge-net Models Module
 *
 * Model optimization, quantization, and management for edge deployment
 *
 * @module @ruvector/edge-net/models
 */

// Model optimization exports
export {
    ModelOptimizer,
    QuantizationEngine,
    PruningEngine,
    OnnxOptimizer,
    DistillationEngine,
    BenchmarkEngine,
    TARGET_MODELS,
    QUANTIZATION_CONFIGS,
    PRUNING_STRATEGIES,
    default,
} from './model-optimizer.js';

// Model utilities exports
export {
    loadRegistry,
    saveRegistry,
    getModel,
    getProfile,
    formatSize,
    parseSize,
    hashFile,
    hashBuffer,
    getModelCacheDir,
    isModelCached,
    getCachedModelSize,
    getDirectorySize,
    estimateQuantizedSize,
    getRecommendedQuantization,
    downloadFile,
    pinToIPFS,
    getIPFSUrl,
    getGCSUrl,
    checkGCSExists,
    createAdapterMetadata,
    getAdapterPath,
    createBenchmarkResult,
    DEFAULT_CACHE_DIR,
    REGISTRY_PATH,
    GCS_CONFIG,
    IPFS_CONFIG,
    LORA_DEFAULTS,
} from './model-utils.js';

// Registry utilities
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the full model registry
 * @returns {Object} Registry object
 */
export function getRegistry() {
    try {
        const registryPath = join(__dirname, 'registry.json');
        return JSON.parse(readFileSync(registryPath, 'utf-8'));
    } catch (error) {
        console.error('[Models] Failed to load registry:', error.message);
        return { version: '0.0.0', models: {}, profiles: {} };
    }
}

/**
 * List all available models
 * @param {Object} options - Filter options
 * @param {string} [options.type] - Filter by type (embedding, generation)
 * @param {number} [options.tier] - Filter by tier (1-4)
 * @returns {Array} Array of model entries
 */
export function listModels(options = {}) {
    const registry = getRegistry();
    return Object.entries(registry.models)
        .filter(([_, m]) => !options.type || m.type === options.type)
        .filter(([_, m]) => !options.tier || m.tier === options.tier)
        .map(([id, model]) => ({ id, ...model }));
}

/**
 * Get recommended model profile for a use case
 * @param {string} profileId - Profile identifier
 * @returns {Object|null} Profile configuration
 */
export function getRecommendedProfile(profileId) {
    const registry = getRegistry();
    return registry.profiles[profileId] || null;
}

/**
 * Get all available profiles
 * @returns {Array} Array of profile entries
 */
export function listProfiles() {
    const registry = getRegistry();
    return Object.entries(registry.profiles)
        .map(([id, profile]) => ({ id, ...profile }));
}
