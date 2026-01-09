/**
 * Feature Flags Configuration System
 *
 * Provides runtime feature flag management for v3 integration,
 * enabling gradual rollout, A/B testing, and environment-specific
 * feature enablement.
 *
 * @module v3/integration/feature-flags
 * @version 3.0.0-alpha.1
 */
import { EventEmitter } from 'events';
/**
 * Feature flag definitions with metadata
 */
const FEATURE_FLAG_DEFINITIONS = {
    enableSONA: {
        name: 'enableSONA',
        description: 'Enable SONA (Self-Optimizing Neural Architecture) learning system',
        defaultValue: true,
        experimental: false,
        performanceImpact: 'low',
        dependencies: [],
    },
    enableFlashAttention: {
        name: 'enableFlashAttention',
        description: 'Enable Flash Attention for 2.49x-7.47x speedup',
        defaultValue: true,
        experimental: false,
        performanceImpact: 'none',
        dependencies: [],
    },
    enableAgentDB: {
        name: 'enableAgentDB',
        description: 'Enable AgentDB vector search with HNSW indexing',
        defaultValue: true,
        experimental: false,
        performanceImpact: 'low',
        dependencies: [],
    },
    enableTrajectoryTracking: {
        name: 'enableTrajectoryTracking',
        description: 'Enable trajectory tracking for experience replay',
        defaultValue: true,
        experimental: false,
        performanceImpact: 'low',
        dependencies: ['enableSONA'],
    },
    enableGNN: {
        name: 'enableGNN',
        description: 'Enable GNN query refinement for +12.4% recall improvement',
        defaultValue: true,
        experimental: false,
        performanceImpact: 'medium',
        dependencies: ['enableAgentDB'],
        minSDKVersion: '2.0.0',
    },
    enableIntelligenceBridge: {
        name: 'enableIntelligenceBridge',
        description: 'Enable intelligence bridge tools for pattern management',
        defaultValue: true,
        experimental: false,
        performanceImpact: 'low',
        dependencies: ['enableSONA'],
    },
    enableQUICTransport: {
        name: 'enableQUICTransport',
        description: 'Enable QUIC transport for faster agent communication',
        defaultValue: false,
        experimental: true,
        performanceImpact: 'low',
        dependencies: [],
        minSDKVersion: '2.0.1',
    },
    enableNightlyLearning: {
        name: 'enableNightlyLearning',
        description: 'Enable automated nightly learning cycles',
        defaultValue: false,
        experimental: true,
        performanceImpact: 'high',
        dependencies: ['enableSONA', 'enableTrajectoryTracking'],
        minSDKVersion: '2.0.1',
    },
    enableAutoConsolidation: {
        name: 'enableAutoConsolidation',
        description: 'Enable automatic pattern consolidation',
        defaultValue: true,
        experimental: false,
        performanceImpact: 'low',
        dependencies: ['enableSONA'],
    },
};
/**
 * FeatureFlagManager - Runtime feature flag management
 */
export class FeatureFlagManager extends EventEmitter {
    flags;
    sources = new Map();
    overrides = new Map();
    initialized = false;
    constructor(initialFlags) {
        super();
        this.flags = this.initializeFlags(initialFlags);
    }
    /**
     * Initialize the feature flag manager
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        // Load from environment variables
        this.loadFromEnvironment();
        // Validate dependencies
        this.validateDependencies();
        this.initialized = true;
        this.emit('initialized', { flags: this.getAllFlags() });
    }
    /**
     * Get all feature flags
     */
    getAllFlags() {
        const result = { ...this.flags };
        // Apply overrides
        for (const [flag, value] of this.overrides) {
            result[flag] = value;
        }
        return result;
    }
    /**
     * Check if a feature is enabled
     */
    isEnabled(flag) {
        // Check override first
        if (this.overrides.has(flag)) {
            return this.overrides.get(flag);
        }
        return this.flags[flag];
    }
    /**
     * Enable a feature
     */
    enable(flag, runtime = true) {
        const previousValue = this.isEnabled(flag);
        // Check dependencies
        const info = FEATURE_FLAG_DEFINITIONS[flag];
        for (const dep of info.dependencies) {
            if (!this.isEnabled(dep)) {
                throw new Error(`Cannot enable '${flag}': dependency '${dep}' is not enabled`);
            }
        }
        if (runtime) {
            this.overrides.set(flag, true);
            this.sources.set(flag, 'runtime');
        }
        else {
            this.flags[flag] = true;
            this.sources.set(flag, 'config');
        }
        if (!previousValue) {
            this.emit('flag-changed', { flag, previousValue, newValue: true });
        }
    }
    /**
     * Disable a feature
     */
    disable(flag, runtime = true) {
        const previousValue = this.isEnabled(flag);
        // Check for dependent features
        const dependents = this.getDependentFlags(flag);
        for (const dep of dependents) {
            if (this.isEnabled(dep)) {
                console.warn(`Warning: Disabling '${flag}' may affect '${dep}' which depends on it`);
            }
        }
        if (runtime) {
            this.overrides.set(flag, false);
            this.sources.set(flag, 'runtime');
        }
        else {
            this.flags[flag] = false;
            this.sources.set(flag, 'config');
        }
        if (previousValue) {
            this.emit('flag-changed', { flag, previousValue, newValue: false });
        }
    }
    /**
     * Toggle a feature
     */
    toggle(flag) {
        const current = this.isEnabled(flag);
        if (current) {
            this.disable(flag);
        }
        else {
            this.enable(flag);
        }
        return !current;
    }
    /**
     * Reset a feature to its default value
     */
    reset(flag) {
        const info = FEATURE_FLAG_DEFINITIONS[flag];
        const previousValue = this.isEnabled(flag);
        this.overrides.delete(flag);
        this.flags[flag] = info.defaultValue;
        this.sources.set(flag, 'default');
        if (previousValue !== info.defaultValue) {
            this.emit('flag-changed', {
                flag,
                previousValue,
                newValue: info.defaultValue
            });
        }
    }
    /**
     * Reset all features to default values
     */
    resetAll() {
        this.overrides.clear();
        for (const [flag, info] of Object.entries(FEATURE_FLAG_DEFINITIONS)) {
            this.flags[flag] = info.defaultValue;
            this.sources.set(flag, 'default');
        }
        this.emit('flags-reset');
    }
    /**
     * Get feature flag information
     */
    getFlagInfo(flag) {
        return {
            ...FEATURE_FLAG_DEFINITIONS[flag],
            currentValue: this.isEnabled(flag),
            source: this.sources.get(flag) || 'default',
        };
    }
    /**
     * Get all flag information
     */
    getAllFlagInfo() {
        return Object.keys(FEATURE_FLAG_DEFINITIONS).map(flag => this.getFlagInfo(flag));
    }
    /**
     * Get enabled experimental features
     */
    getEnabledExperimentalFeatures() {
        return Object.entries(FEATURE_FLAG_DEFINITIONS)
            .filter(([flag, info]) => info.experimental && this.isEnabled(flag))
            .map(([flag]) => flag);
    }
    /**
     * Get performance impact of enabled features
     */
    getPerformanceImpact() {
        const result = {
            none: [],
            low: [],
            medium: [],
            high: [],
            overall: 'none',
        };
        for (const [flag, info] of Object.entries(FEATURE_FLAG_DEFINITIONS)) {
            if (this.isEnabled(flag)) {
                result[info.performanceImpact].push(flag);
            }
        }
        // Determine overall impact
        if (result.high.length > 0) {
            result.overall = 'high';
        }
        else if (result.medium.length > 0) {
            result.overall = 'medium';
        }
        else if (result.low.length > 0) {
            result.overall = 'low';
        }
        return result;
    }
    /**
     * Create feature flags from profile
     */
    static fromProfile(profile) {
        const profiles = {
            minimal: {
                enableSONA: false,
                enableFlashAttention: true,
                enableAgentDB: true,
                enableTrajectoryTracking: false,
                enableGNN: false,
                enableIntelligenceBridge: false,
                enableQUICTransport: false,
                enableNightlyLearning: false,
                enableAutoConsolidation: false,
            },
            standard: {
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
            full: {
                enableSONA: true,
                enableFlashAttention: true,
                enableAgentDB: true,
                enableTrajectoryTracking: true,
                enableGNN: true,
                enableIntelligenceBridge: true,
                enableQUICTransport: true,
                enableNightlyLearning: true,
                enableAutoConsolidation: true,
            },
            experimental: {
                enableSONA: true,
                enableFlashAttention: true,
                enableAgentDB: true,
                enableTrajectoryTracking: true,
                enableGNN: true,
                enableIntelligenceBridge: true,
                enableQUICTransport: true,
                enableNightlyLearning: true,
                enableAutoConsolidation: true,
            },
        };
        const base = {};
        for (const [flag, info] of Object.entries(FEATURE_FLAG_DEFINITIONS)) {
            base[flag] = info.defaultValue;
        }
        return { ...base, ...profiles[profile] };
    }
    // ===== Private Methods =====
    initializeFlags(initial) {
        const flags = {};
        for (const [flag, info] of Object.entries(FEATURE_FLAG_DEFINITIONS)) {
            const key = flag;
            flags[key] = initial?.[key] ?? info.defaultValue;
            this.sources.set(key, initial?.[key] !== undefined ? 'config' : 'default');
        }
        return flags;
    }
    loadFromEnvironment() {
        for (const flag of Object.keys(FEATURE_FLAG_DEFINITIONS)) {
            const envVar = `CLAUDE_FLOW_${flag.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
            const envValue = process.env[envVar];
            if (envValue !== undefined) {
                const boolValue = envValue.toLowerCase() === 'true' || envValue === '1';
                this.flags[flag] = boolValue;
                this.sources.set(flag, 'environment');
            }
        }
    }
    validateDependencies() {
        for (const [flag, info] of Object.entries(FEATURE_FLAG_DEFINITIONS)) {
            if (this.isEnabled(flag)) {
                for (const dep of info.dependencies) {
                    if (!this.isEnabled(dep)) {
                        console.warn(`Warning: '${flag}' depends on '${dep}' which is disabled. ` +
                            `'${flag}' may not work correctly.`);
                    }
                }
            }
        }
    }
    getDependentFlags(flag) {
        return Object.entries(FEATURE_FLAG_DEFINITIONS)
            .filter(([_, info]) => info.dependencies.includes(flag))
            .map(([name]) => name);
    }
}
/**
 * Create and initialize a feature flag manager
 */
export async function createFeatureFlagManager(initialFlags) {
    const manager = new FeatureFlagManager(initialFlags);
    await manager.initialize();
    return manager;
}
/**
 * Default feature flag manager instance
 */
let defaultManager = null;
/**
 * Get the default feature flag manager
 */
export async function getDefaultFeatureFlagManager() {
    if (!defaultManager) {
        defaultManager = new FeatureFlagManager();
        await defaultManager.initialize();
    }
    return defaultManager;
}
//# sourceMappingURL=feature-flags.js.map