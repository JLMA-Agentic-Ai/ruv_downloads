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
import type { IntegrationConfig, IntegrationStatus, ComponentHealth, FeatureFlags } from './types.js';
import { SONAAdapter } from './sona-adapter.js';
import { AttentionCoordinator } from './attention-coordinator.js';
import { SDKBridge } from './sdk-bridge.js';
/**
 * Interface for agentic-flow core module (dynamically loaded)
 * This represents the external agentic-flow@alpha package API
 */
interface AgenticFlowSONAInterface {
    setMode(mode: string): Promise<void>;
    storePattern(params: unknown): Promise<string>;
    findPatterns(query: string, options?: unknown): Promise<unknown[]>;
    getStats(): Promise<unknown>;
}
interface AgenticFlowAttentionInterface {
    compute(params: unknown): Promise<unknown>;
    setMechanism(mechanism: string): Promise<void>;
    getMetrics(): Promise<unknown>;
}
interface AgenticFlowAgentDBInterface {
    search(query: number[], options?: unknown): Promise<unknown[]>;
    insert(vector: number[], metadata?: unknown): Promise<string>;
    enableCrossAgentSharing(options?: unknown): Promise<void>;
}
/**
 * Core interface for agentic-flow@alpha package
 * Used for deep integration and code deduplication per ADR-001
 */
export interface AgenticFlowCore {
    sona: AgenticFlowSONAInterface;
    attention: AgenticFlowAttentionInterface;
    agentdb: AgenticFlowAgentDBInterface;
    version: string;
    isConnected: boolean;
}
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
export declare class AgenticFlowBridge extends EventEmitter {
    private config;
    private initialized;
    private sona;
    private attention;
    private sdk;
    private componentHealth;
    private runtimeInfo;
    private initializationPromise;
    /**
     * Reference to the agentic-flow@alpha core instance
     * When available, components delegate to this instead of local implementations
     * This follows ADR-001: Adopt agentic-flow as Core Foundation
     */
    private agenticFlowCore;
    /**
     * Indicates whether agentic-flow is available for delegation
     */
    private agenticFlowAvailable;
    constructor(config?: Partial<IntegrationConfig>);
    /**
     * Initialize the integration bridge
     *
     * This method is idempotent - calling it multiple times is safe.
     * Components are lazily loaded based on configuration.
     */
    initialize(config?: Partial<IntegrationConfig>): Promise<void>;
    private doInitialize;
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
    private connectToAgenticFlow;
    /**
     * Reconfigure the bridge with new settings
     */
    reconfigure(config: Partial<IntegrationConfig>): Promise<void>;
    /**
     * Get the SONA adapter for learning integration
     */
    getSONAAdapter(): Promise<SONAAdapter>;
    /**
     * Get the Attention coordinator for Flash Attention integration
     */
    getAttentionCoordinator(): Promise<AttentionCoordinator>;
    /**
     * Get the SDK bridge for API compatibility
     */
    getSDKBridge(): Promise<SDKBridge>;
    /**
     * Get current integration status
     */
    getStatus(): IntegrationStatus;
    /**
     * Get feature flags
     */
    getFeatureFlags(): FeatureFlags;
    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(feature: keyof FeatureFlags): boolean;
    /**
     * Enable a feature dynamically
     */
    enableFeature(feature: keyof FeatureFlags): Promise<void>;
    /**
     * Disable a feature dynamically
     */
    disableFeature(feature: keyof FeatureFlags): Promise<void>;
    /**
     * Perform health check on all components
     */
    healthCheck(): Promise<Record<string, ComponentHealth>>;
    /**
     * Shutdown the integration bridge gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Check if agentic-flow@alpha is connected and available for delegation
     *
     * When true, components can delegate to agentic-flow for optimized
     * implementations (per ADR-001).
     */
    isAgenticFlowConnected(): boolean;
    /**
     * Get the agentic-flow core instance for direct access
     *
     * Returns null if agentic-flow is not available.
     * Prefer using getSONAAdapter() or getAttentionCoordinator() which
     * handle delegation automatically.
     */
    getAgenticFlowCore(): AgenticFlowCore | null;
    private mergeConfig;
    private detectRuntime;
    private getDefaultRuntimeInfo;
    private getConnectedComponents;
    private updateComponentHealth;
    private ensureInitialized;
    private createError;
    private wrapError;
    private logDebug;
}
/**
 * Create and initialize an AgenticFlowBridge instance
 */
export declare function createAgenticFlowBridge(config?: Partial<IntegrationConfig>): Promise<AgenticFlowBridge>;
/**
 * Get the default bridge instance (creates if needed)
 */
export declare function getDefaultBridge(config?: Partial<IntegrationConfig>): Promise<AgenticFlowBridge>;
/**
 * Reset the default bridge (useful for testing)
 */
export declare function resetDefaultBridge(): Promise<void>;
export {};
//# sourceMappingURL=agentic-flow-bridge.d.ts.map