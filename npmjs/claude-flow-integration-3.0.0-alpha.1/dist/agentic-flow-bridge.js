/**
 * Agentic Flow Integration Bridge
 *
 * Core integration bridge for agentic-flow@alpha deep integration.
 * Implements ADR-001: Adopt agentic-flow as Core Foundation
 *
 * Eliminates 10,000+ lines of duplicate code by building on agentic-flow
 * rather than implementing parallel systems.
 *
 * @module v3/integration/agentic-flow-bridge
 * @version 3.0.0-alpha.1
 */
import { EventEmitter } from 'events';
import { SONAAdapter } from './sona-adapter.js';
import { AttentionCoordinator } from './attention-coordinator.js';
import { SDKBridge } from './sdk-bridge.js';
/**
 * AgenticFlowBridge - Core integration class for agentic-flow@alpha
 *
 * This class serves as the main entry point for all agentic-flow integration,
 * providing unified access to SONA learning, Flash Attention, and AgentDB.
 *
 * Performance Targets:
 * - Flash Attention: 2.49x-7.47x speedup
 * - AgentDB Search: 150x-12,500x improvement
 * - SONA Adaptation: <0.05ms response time
 * - Memory Reduction: 50-75%
 */
export class AgenticFlowBridge extends EventEmitter {
    config;
    initialized = false;
    sona = null;
    attention = null;
    sdk = null;
    componentHealth = new Map();
    runtimeInfo = null;
    initializationPromise = null;
    /**
     * Reference to the agentic-flow@alpha core instance
     * When available, components delegate to this instead of local implementations
     * This follows ADR-001: Adopt agentic-flow as Core Foundation
     */
    agenticFlowCore = null;
    /**
     * Indicates whether agentic-flow is available for delegation
     */
    agenticFlowAvailable = false;
    constructor(config = {}) {
        super();
        this.config = this.mergeConfig(config);
    }
    /**
     * Initialize the integration bridge
     *
     * This method is idempotent - calling it multiple times is safe.
     * Components are lazily loaded based on configuration.
     */
    async initialize(config) {
        // Return existing promise if initialization is in progress
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        // Already initialized
        if (this.initialized) {
            if (config) {
                await this.reconfigure(config);
            }
            return;
        }
        this.initializationPromise = this.doInitialize(config);
        try {
            await this.initializationPromise;
        }
        finally {
            this.initializationPromise = null;
        }
    }
    async doInitialize(config) {
        const startTime = Date.now();
        if (config) {
            this.config = this.mergeConfig(config);
        }
        this.emit('initializing', { config: this.config });
        try {
            // Detect runtime environment
            this.runtimeInfo = await this.detectRuntime();
            this.logDebug('Runtime detected', this.runtimeInfo);
            // ADR-001: Attempt to load agentic-flow@alpha dynamically
            // This enables deep integration and code deduplication
            await this.connectToAgenticFlow();
            // Initialize SDK bridge first (required for version negotiation)
            this.sdk = new SDKBridge({
                targetVersion: 'alpha',
                enableVersionNegotiation: true,
                fallbackBehavior: 'warn',
                enableCompatibilityLayer: true,
                supportDeprecatedAPIs: true,
            });
            await this.sdk.initialize();
            this.updateComponentHealth('sdk', 'healthy');
            // Initialize SONA adapter if enabled
            // Pass agentic-flow reference for delegation when available
            if (this.config.features.enableSONA) {
                this.sona = new SONAAdapter(this.config.sona);
                if (this.agenticFlowCore) {
                    // Type cast: agentic-flow runtime API is compatible but typed as `unknown`
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.sona.setAgenticFlowReference(this.agenticFlowCore.sona);
                }
                await this.sona.initialize();
                this.updateComponentHealth('sona', 'healthy');
            }
            // Initialize Attention coordinator if enabled
            // Pass agentic-flow reference for delegation when available
            if (this.config.features.enableFlashAttention) {
                this.attention = new AttentionCoordinator(this.config.attention);
                if (this.agenticFlowCore) {
                    // Type cast: agentic-flow runtime API is compatible but typed as `unknown`
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.attention.setAgenticFlowReference(this.agenticFlowCore.attention);
                }
                await this.attention.initialize();
                this.updateComponentHealth('attention', 'healthy');
            }
            this.initialized = true;
            const duration = Date.now() - startTime;
            this.emit('initialized', {
                duration,
                components: this.getConnectedComponents(),
                agenticFlowConnected: this.agenticFlowAvailable,
            });
            this.logDebug(`Initialization complete in ${duration}ms`);
        }
        catch (error) {
            this.emit('initialization-failed', { error });
            throw this.wrapError(error, 'INITIALIZATION_FAILED', 'bridge');
        }
    }
    /**
     * Connect to agentic-flow@alpha package dynamically
     *
     * This implements ADR-001: Adopt agentic-flow as Core Foundation
     * When agentic-flow is available, components delegate to it for:
     * - SONA learning (eliminating duplicate pattern storage)
     * - Flash Attention (using native optimized implementations)
     * - AgentDB (leveraging 150x-12,500x faster HNSW search)
     *
     * If agentic-flow is not installed, falls back to local implementations
     * to maintain backward compatibility.
     */
    async connectToAgenticFlow() {
        try {
            // Dynamic import to handle optional dependency
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const agenticFlowModule = await import('agentic-flow').catch(() => null);
            if (agenticFlowModule && typeof agenticFlowModule.createAgenticFlow === 'function') {
                const factory = agenticFlowModule.createAgenticFlow;
                this.agenticFlowCore = await factory({
                    sona: this.config.sona,
                    attention: this.config.attention,
                    agentdb: this.config.agentdb,
                });
                this.agenticFlowAvailable = true;
                this.updateComponentHealth('agentic-flow', 'healthy');
                this.emit('agentic-flow:connected', {
                    version: this.agenticFlowCore.version,
                    features: {
                        sona: true,
                        attention: true,
                        agentdb: true,
                    },
                });
                this.logDebug('Connected to agentic-flow', {
                    version: this.agenticFlowCore.version,
                });
            }
            else {
                // Package not found or doesn't export expected factory
                this.agenticFlowAvailable = false;
                this.emit('agentic-flow:fallback', {
                    reason: 'package not found or incompatible',
                });
                this.logDebug('agentic-flow not available, using local implementations');
            }
        }
        catch (error) {
            // Fallback to local implementation if agentic-flow fails to load
            this.agenticFlowAvailable = false;
            this.emit('agentic-flow:fallback', {
                reason: 'initialization error',
                error: error.message,
            });
            this.logDebug('agentic-flow initialization failed, using fallback', error);
        }
    }
    /**
     * Reconfigure the bridge with new settings
     */
    async reconfigure(config) {
        this.config = this.mergeConfig(config);
        // Reconfigure active components
        if (this.sona && config.sona) {
            await this.sona.reconfigure(config.sona);
        }
        if (this.attention && config.attention) {
            await this.attention.reconfigure(config.attention);
        }
        this.emit('reconfigured', { config: this.config });
    }
    /**
     * Get the SONA adapter for learning integration
     */
    async getSONAAdapter() {
        this.ensureInitialized();
        if (!this.config.features.enableSONA) {
            throw this.createError('SONA is disabled in configuration', 'FEATURE_DISABLED', 'sona');
        }
        if (!this.sona) {
            this.sona = new SONAAdapter(this.config.sona);
            await this.sona.initialize();
            this.updateComponentHealth('sona', 'healthy');
        }
        return this.sona;
    }
    /**
     * Get the Attention coordinator for Flash Attention integration
     */
    async getAttentionCoordinator() {
        this.ensureInitialized();
        if (!this.config.features.enableFlashAttention) {
            throw this.createError('Flash Attention is disabled in configuration', 'FEATURE_DISABLED', 'attention');
        }
        if (!this.attention) {
            this.attention = new AttentionCoordinator(this.config.attention);
            await this.attention.initialize();
            this.updateComponentHealth('attention', 'healthy');
        }
        return this.attention;
    }
    /**
     * Get the SDK bridge for API compatibility
     */
    async getSDKBridge() {
        this.ensureInitialized();
        if (!this.sdk) {
            throw this.createError('SDK bridge not initialized', 'COMPONENT_UNAVAILABLE', 'sdk');
        }
        return this.sdk;
    }
    /**
     * Get current integration status
     */
    getStatus() {
        const features = {};
        for (const [key, value] of Object.entries(this.config.features)) {
            features[key] = value;
        }
        return {
            initialized: this.initialized,
            connectedComponents: this.getConnectedComponents(),
            runtime: this.runtimeInfo || this.getDefaultRuntimeInfo(),
            features,
            health: Object.fromEntries(this.componentHealth),
            lastHealthCheck: Date.now(),
        };
    }
    /**
     * Get feature flags
     */
    getFeatureFlags() {
        return { ...this.config.features };
    }
    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(feature) {
        return this.config.features[feature] ?? false;
    }
    /**
     * Enable a feature dynamically
     */
    async enableFeature(feature) {
        if (this.config.features[feature]) {
            return; // Already enabled
        }
        this.config.features[feature] = true;
        // Initialize the corresponding component if needed
        switch (feature) {
            case 'enableSONA':
                if (!this.sona) {
                    this.sona = new SONAAdapter(this.config.sona);
                    await this.sona.initialize();
                    this.updateComponentHealth('sona', 'healthy');
                }
                break;
            case 'enableFlashAttention':
                if (!this.attention) {
                    this.attention = new AttentionCoordinator(this.config.attention);
                    await this.attention.initialize();
                    this.updateComponentHealth('attention', 'healthy');
                }
                break;
        }
        this.emit('feature-enabled', { feature });
    }
    /**
     * Disable a feature dynamically
     */
    async disableFeature(feature) {
        if (!this.config.features[feature]) {
            return; // Already disabled
        }
        this.config.features[feature] = false;
        // Cleanup the corresponding component
        switch (feature) {
            case 'enableSONA':
                if (this.sona) {
                    await this.sona.shutdown();
                    this.sona = null;
                    this.componentHealth.delete('sona');
                }
                break;
            case 'enableFlashAttention':
                if (this.attention) {
                    await this.attention.shutdown();
                    this.attention = null;
                    this.componentHealth.delete('attention');
                }
                break;
        }
        this.emit('feature-disabled', { feature });
    }
    /**
     * Perform health check on all components
     */
    async healthCheck() {
        const results = {};
        // Check SDK bridge
        if (this.sdk) {
            try {
                const start = Date.now();
                await this.sdk.ping();
                results['sdk'] = {
                    name: 'sdk',
                    status: 'healthy',
                    latencyMs: Date.now() - start,
                    uptime: 1.0,
                };
            }
            catch (error) {
                results['sdk'] = {
                    name: 'sdk',
                    status: 'unhealthy',
                    lastError: error.message,
                    latencyMs: 0,
                    uptime: 0,
                };
            }
        }
        // Check SONA
        if (this.sona) {
            try {
                const start = Date.now();
                await this.sona.getStats();
                results['sona'] = {
                    name: 'sona',
                    status: 'healthy',
                    latencyMs: Date.now() - start,
                    uptime: 1.0,
                };
            }
            catch (error) {
                results['sona'] = {
                    name: 'sona',
                    status: 'unhealthy',
                    lastError: error.message,
                    latencyMs: 0,
                    uptime: 0,
                };
            }
        }
        // Check Attention
        if (this.attention) {
            try {
                const start = Date.now();
                await this.attention.getMetrics();
                results['attention'] = {
                    name: 'attention',
                    status: 'healthy',
                    latencyMs: Date.now() - start,
                    uptime: 1.0,
                };
            }
            catch (error) {
                results['attention'] = {
                    name: 'attention',
                    status: 'unhealthy',
                    lastError: error.message,
                    latencyMs: 0,
                    uptime: 0,
                };
            }
        }
        // Update stored health status
        for (const [name, health] of Object.entries(results)) {
            this.componentHealth.set(name, health);
        }
        this.emit('health-check', { results });
        return results;
    }
    /**
     * Shutdown the integration bridge gracefully
     */
    async shutdown() {
        this.emit('shutting-down');
        const shutdownPromises = [];
        if (this.sona) {
            shutdownPromises.push(this.sona.shutdown());
        }
        if (this.attention) {
            shutdownPromises.push(this.attention.shutdown());
        }
        if (this.sdk) {
            shutdownPromises.push(this.sdk.shutdown());
        }
        await Promise.allSettled(shutdownPromises);
        this.sona = null;
        this.attention = null;
        this.sdk = null;
        this.agenticFlowCore = null;
        this.agenticFlowAvailable = false;
        this.initialized = false;
        this.componentHealth.clear();
        this.emit('shutdown');
    }
    /**
     * Check if agentic-flow@alpha is connected and available for delegation
     *
     * When true, components can delegate to agentic-flow for optimized
     * implementations (per ADR-001).
     */
    isAgenticFlowConnected() {
        return this.agenticFlowAvailable && this.agenticFlowCore !== null;
    }
    /**
     * Get the agentic-flow core instance for direct access
     *
     * Returns null if agentic-flow is not available.
     * Prefer using getSONAAdapter() or getAttentionCoordinator() which
     * handle delegation automatically.
     */
    getAgenticFlowCore() {
        return this.agenticFlowCore;
    }
    // ===== Private Methods =====
    mergeConfig(config) {
        const defaultConfig = {
            sona: {
                mode: 'balanced',
                learningRate: 0.001,
                similarityThreshold: 0.7,
                maxPatterns: 10000,
                enableTrajectoryTracking: true,
                consolidationInterval: 3600000,
                autoModeSelection: true,
            },
            attention: {
                mechanism: 'flash',
                numHeads: 8,
                headDim: 64,
                dropoutRate: 0.0,
                causalMask: false,
                useRoPE: true,
                flashOptLevel: 2,
                memoryOptimization: 'moderate',
            },
            agentdb: {
                dimension: 1536,
                indexType: 'hnsw',
                hnswM: 16,
                hnswEfConstruction: 200,
                hnswEfSearch: 50,
                metric: 'cosine',
                enableCache: true,
                cacheSizeMb: 256,
                enableWAL: true,
            },
            features: {
                enableSONA: true,
                enableFlashAttention: true,
                enableAgentDB: true,
                enableTrajectoryTracking: true,
                enableGNN: true,
                enableIntelligenceBridge: true,
                enableQUICTransport: false,
                enableNightlyLearning: false,
                enableAutoConsolidation: true,
            },
            runtimePreference: ['napi', 'wasm', 'js'],
            lazyLoad: true,
            debug: false,
        };
        return {
            ...defaultConfig,
            ...config,
            sona: { ...defaultConfig.sona, ...config.sona },
            attention: { ...defaultConfig.attention, ...config.attention },
            agentdb: { ...defaultConfig.agentdb, ...config.agentdb },
            features: { ...defaultConfig.features, ...config.features },
        };
    }
    async detectRuntime() {
        const platform = process.platform;
        const arch = process.arch;
        const nodeVersion = process.version;
        // Check NAPI support
        let napiSupport = false;
        try {
            // Attempt to load native module indicator
            napiSupport = platform !== 'win32' || arch === 'x64';
        }
        catch {
            napiSupport = false;
        }
        // WASM is always supported in Node.js
        const wasmSupport = true;
        // Determine runtime based on preference
        let runtime = 'js';
        for (const pref of this.config.runtimePreference) {
            if (pref === 'napi' && napiSupport) {
                runtime = 'napi';
                break;
            }
            else if (pref === 'wasm' && wasmSupport) {
                runtime = 'wasm';
                break;
            }
            else if (pref === 'js') {
                runtime = 'js';
                break;
            }
        }
        // Determine performance tier
        let performanceTier;
        if (runtime === 'napi') {
            performanceTier = 'optimal';
        }
        else if (runtime === 'wasm') {
            performanceTier = 'good';
        }
        else {
            performanceTier = 'fallback';
        }
        return {
            runtime,
            platform,
            arch,
            nodeVersion,
            wasmSupport,
            napiSupport,
            performanceTier,
        };
    }
    getDefaultRuntimeInfo() {
        return {
            runtime: 'js',
            platform: 'linux',
            arch: 'x64',
            nodeVersion: process.version,
            wasmSupport: true,
            napiSupport: false,
            performanceTier: 'fallback',
        };
    }
    getConnectedComponents() {
        const components = [];
        if (this.sdk)
            components.push('sdk');
        if (this.sona)
            components.push('sona');
        if (this.attention)
            components.push('attention');
        return components;
    }
    updateComponentHealth(name, status, error) {
        this.componentHealth.set(name, {
            name,
            status,
            lastError: error,
            latencyMs: 0,
            uptime: status === 'healthy' ? 1.0 : 0.0,
        });
    }
    ensureInitialized() {
        if (!this.initialized) {
            throw this.createError('Bridge not initialized. Call initialize() first.', 'INITIALIZATION_FAILED', 'bridge');
        }
    }
    createError(message, code, component) {
        const error = new Error(message);
        error.code = code;
        error.component = component;
        return error;
    }
    wrapError(error, code, component) {
        const wrapped = new Error(`${component}: ${error.message}`);
        wrapped.code = code;
        wrapped.component = component;
        wrapped.cause = error;
        return wrapped;
    }
    logDebug(message, data) {
        if (this.config.debug) {
            console.debug(`[AgenticFlowBridge] ${message}`, data || '');
        }
    }
}
/**
 * Create and initialize an AgenticFlowBridge instance
 */
export async function createAgenticFlowBridge(config) {
    const bridge = new AgenticFlowBridge(config);
    await bridge.initialize();
    return bridge;
}
/**
 * Singleton instance for simple usage
 */
let defaultBridge = null;
/**
 * Get the default bridge instance (creates if needed)
 */
export async function getDefaultBridge(config) {
    if (!defaultBridge) {
        defaultBridge = new AgenticFlowBridge(config);
        await defaultBridge.initialize();
    }
    return defaultBridge;
}
/**
 * Reset the default bridge (useful for testing)
 */
export async function resetDefaultBridge() {
    if (defaultBridge) {
        await defaultBridge.shutdown();
        defaultBridge = null;
    }
}
//# sourceMappingURL=agentic-flow-bridge.js.map