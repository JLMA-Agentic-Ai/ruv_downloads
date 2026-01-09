/**
 * SDK Bridge for agentic-flow API Compatibility
 *
 * Provides API compatibility layer between claude-flow v3 and
 * agentic-flow@alpha, handling version negotiation, feature
 * detection, and fallback behavior.
 *
 * Key Responsibilities:
 * - Version negotiation and compatibility checking
 * - API translation for v2 -> v3 migration
 * - Feature detection and graceful degradation
 * - Deprecated API support with warnings
 *
 * @module v3/integration/sdk-bridge
 * @version 3.0.0-alpha.1
 */
import { EventEmitter } from 'events';
import type { SDKBridgeConfig, SDKVersion, SDKCompatibility } from './types.js';
/**
 * SDKBridge - API Compatibility Layer
 *
 * This bridge handles version compatibility, feature detection,
 * and API translation between claude-flow and agentic-flow.
 */
export declare class SDKBridge extends EventEmitter {
    private config;
    private initialized;
    private currentVersion;
    private availableFeatures;
    private deprecationWarnings;
    constructor(config?: Partial<SDKBridgeConfig>);
    /**
     * Initialize the SDK bridge
     */
    initialize(): Promise<void>;
    /**
     * Ping to check if SDK is available
     */
    ping(): Promise<boolean>;
    /**
     * Get current SDK version
     */
    getVersion(): SDKVersion | null;
    /**
     * Check if a feature is available
     */
    isFeatureAvailable(feature: string): boolean;
    /**
     * Get all available features
     */
    getAvailableFeatures(): string[];
    /**
     * Get compatibility information
     */
    checkCompatibility(): Promise<SDKCompatibility>;
    /**
     * Translate deprecated API call to new API
     */
    translateDeprecatedAPI(oldAPI: string, args: unknown[]): {
        newAPI: string;
        args: unknown[];
    } | null;
    /**
     * Wrap an API call with compatibility handling
     */
    wrapAPICall<T>(apiName: string, apiCall: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>;
    /**
     * Get feature requirements for a capability
     */
    getFeatureRequirements(capability: string): {
        required: string[];
        optional: string[];
        satisfied: boolean;
    };
    /**
     * Negotiate version with remote SDK
     */
    negotiateVersion(preferredVersion?: string): Promise<SDKVersion>;
    /**
     * Get migration guide for deprecated APIs
     */
    getMigrationGuide(): Record<string, {
        old: string;
        new: string;
        example: string;
    }>;
    /**
     * Shutdown the bridge
     */
    shutdown(): Promise<void>;
    private mergeConfig;
    private detectVersion;
    private detectFeatures;
    private parseVersion;
    private compareVersions;
    private isVersionError;
    private generateMigrationExample;
    private ensureInitialized;
}
/**
 * Create and initialize an SDK bridge
 */
export declare function createSDKBridge(config?: Partial<SDKBridgeConfig>): Promise<SDKBridge>;
//# sourceMappingURL=sdk-bridge.d.ts.map