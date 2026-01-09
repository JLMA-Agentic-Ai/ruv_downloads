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
import type { FeatureFlags } from './types.js';
/**
 * Feature flag metadata
 */
interface FeatureFlagInfo {
    /** Flag name */
    name: keyof FeatureFlags;
    /** Human-readable description */
    description: string;
    /** Default value */
    defaultValue: boolean;
    /** Whether the flag is experimental */
    experimental: boolean;
    /** Performance impact if enabled */
    performanceImpact: 'none' | 'low' | 'medium' | 'high';
    /** Dependencies on other flags */
    dependencies: (keyof FeatureFlags)[];
    /** Minimum SDK version required */
    minSDKVersion?: string;
}
/**
 * Feature flag source (where the value came from)
 */
type FlagSource = 'default' | 'config' | 'environment' | 'runtime';
/**
 * FeatureFlagManager - Runtime feature flag management
 */
export declare class FeatureFlagManager extends EventEmitter {
    private flags;
    private sources;
    private overrides;
    private initialized;
    constructor(initialFlags?: Partial<FeatureFlags>);
    /**
     * Initialize the feature flag manager
     */
    initialize(): Promise<void>;
    /**
     * Get all feature flags
     */
    getAllFlags(): FeatureFlags;
    /**
     * Check if a feature is enabled
     */
    isEnabled(flag: keyof FeatureFlags): boolean;
    /**
     * Enable a feature
     */
    enable(flag: keyof FeatureFlags, runtime?: boolean): void;
    /**
     * Disable a feature
     */
    disable(flag: keyof FeatureFlags, runtime?: boolean): void;
    /**
     * Toggle a feature
     */
    toggle(flag: keyof FeatureFlags): boolean;
    /**
     * Reset a feature to its default value
     */
    reset(flag: keyof FeatureFlags): void;
    /**
     * Reset all features to default values
     */
    resetAll(): void;
    /**
     * Get feature flag information
     */
    getFlagInfo(flag: keyof FeatureFlags): FeatureFlagInfo & {
        currentValue: boolean;
        source: FlagSource;
    };
    /**
     * Get all flag information
     */
    getAllFlagInfo(): Array<FeatureFlagInfo & {
        currentValue: boolean;
        source: FlagSource;
    }>;
    /**
     * Get enabled experimental features
     */
    getEnabledExperimentalFeatures(): (keyof FeatureFlags)[];
    /**
     * Get performance impact of enabled features
     */
    getPerformanceImpact(): {
        none: (keyof FeatureFlags)[];
        low: (keyof FeatureFlags)[];
        medium: (keyof FeatureFlags)[];
        high: (keyof FeatureFlags)[];
        overall: 'none' | 'low' | 'medium' | 'high';
    };
    /**
     * Create feature flags from profile
     */
    static fromProfile(profile: 'minimal' | 'standard' | 'full' | 'experimental'): FeatureFlags;
    private initializeFlags;
    private loadFromEnvironment;
    private validateDependencies;
    private getDependentFlags;
}
/**
 * Create and initialize a feature flag manager
 */
export declare function createFeatureFlagManager(initialFlags?: Partial<FeatureFlags>): Promise<FeatureFlagManager>;
/**
 * Get the default feature flag manager
 */
export declare function getDefaultFeatureFlagManager(): Promise<FeatureFlagManager>;
export {};
//# sourceMappingURL=feature-flags.d.ts.map