/**
 * ProviderAdapter - Multi-Provider Support for AI Models
 *
 * Provides a unified interface for working with multiple AI providers
 * (Anthropic, OpenAI, local models, etc.) with automatic selection,
 * failover, and load balancing.
 *
 * Features:
 * - Provider registration and management
 * - Requirement-based provider selection
 * - Automatic failover on provider errors
 * - Rate limiting and quota management
 * - Cost tracking and optimization
 * - Provider health monitoring
 *
 * Compatible with agentic-flow's provider manager patterns.
 *
 * @module v3/integration/provider-adapter
 * @version 3.0.0-alpha.1
 */
import { EventEmitter } from 'events';
import type { Task } from './agentic-flow-agent.js';
/**
 * Provider interface for AI model providers
 */
export interface Provider {
    /** Unique provider identifier */
    id: string;
    /** Provider name */
    name: string;
    /** Provider type */
    type: ProviderType;
    /** Available models */
    models: ModelInfo[];
    /** Provider capabilities */
    capabilities: ProviderCapability[];
    /** Provider status */
    status: ProviderStatus;
    /** Rate limits */
    rateLimits: RateLimits;
    /** Cost per token (input/output) */
    costPerToken: CostInfo;
    /** Provider-specific configuration */
    config?: Record<string, unknown>;
}
/**
 * Provider types
 */
export type ProviderType = 'anthropic' | 'openai' | 'google' | 'azure' | 'aws' | 'ollama' | 'huggingface' | 'custom';
/**
 * Provider capabilities
 */
export type ProviderCapability = 'text-completion' | 'chat' | 'embeddings' | 'vision' | 'code-generation' | 'function-calling' | 'streaming' | 'fine-tuning' | 'batch-processing' | 'long-context';
/**
 * Provider status
 */
export type ProviderStatus = 'available' | 'degraded' | 'unavailable' | 'rate-limited' | 'maintenance';
/**
 * Model information
 */
export interface ModelInfo {
    /** Model identifier */
    id: string;
    /** Model display name */
    name: string;
    /** Maximum context length */
    maxContextLength: number;
    /** Maximum output tokens */
    maxOutputTokens: number;
    /** Supported capabilities */
    capabilities: ProviderCapability[];
    /** Model-specific configuration */
    config?: Record<string, unknown>;
}
/**
 * Rate limit configuration
 */
export interface RateLimits {
    /** Requests per minute */
    requestsPerMinute: number;
    /** Tokens per minute */
    tokensPerMinute: number;
    /** Current request count */
    currentRequests: number;
    /** Current token count */
    currentTokens: number;
    /** Reset timestamp */
    resetAt: number;
}
/**
 * Cost information
 */
export interface CostInfo {
    /** Cost per 1K input tokens in USD */
    inputPer1K: number;
    /** Cost per 1K output tokens in USD */
    outputPer1K: number;
    /** Currency */
    currency: string;
}
/**
 * Provider requirements for selection
 */
export interface ProviderRequirements {
    /** Required capabilities */
    capabilities?: ProviderCapability[];
    /** Minimum context length */
    minContextLength?: number;
    /** Maximum cost per 1K tokens */
    maxCostPer1K?: number;
    /** Preferred provider types */
    preferredTypes?: ProviderType[];
    /** Excluded provider IDs */
    excludeProviders?: string[];
    /** Required model ID */
    modelId?: string;
    /** Require streaming support */
    streaming?: boolean;
    /** Require vision support */
    vision?: boolean;
    /** Custom filters */
    customFilters?: ((provider: Provider) => boolean)[];
}
/**
 * Provider selection result
 */
export interface ProviderSelectionResult {
    /** Selected provider */
    provider: Provider;
    /** Selected model */
    model: ModelInfo;
    /** Selection score */
    score: number;
    /** Selection reasoning */
    reasons: string[];
    /** Alternative providers */
    alternatives: Array<{
        provider: Provider;
        model: ModelInfo;
        score: number;
    }>;
}
/**
 * Execution options
 */
export interface ExecutionOptions {
    /** Model to use (overrides automatic selection) */
    modelId?: string;
    /** Temperature for generation */
    temperature?: number;
    /** Maximum tokens to generate */
    maxTokens?: number;
    /** Enable streaming */
    stream?: boolean;
    /** Stop sequences */
    stopSequences?: string[];
    /** Timeout in milliseconds */
    timeout?: number;
    /** Retry configuration */
    retry?: {
        maxAttempts: number;
        backoffMs: number;
        backoffMultiplier: number;
    };
    /** Metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Execution result
 */
export interface ExecutionResult {
    /** Success indicator */
    success: boolean;
    /** Output content */
    content: string;
    /** Provider used */
    providerId: string;
    /** Model used */
    modelId: string;
    /** Token usage */
    usage: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    /** Cost in USD */
    cost: number;
    /** Execution latency in milliseconds */
    latencyMs: number;
    /** Error if failed */
    error?: Error;
    /** Metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Provider metrics
 */
export interface ProviderMetrics {
    /** Total requests */
    totalRequests: number;
    /** Successful requests */
    successfulRequests: number;
    /** Failed requests */
    failedRequests: number;
    /** Average latency in milliseconds */
    avgLatencyMs: number;
    /** Total tokens used */
    totalTokens: number;
    /** Total cost in USD */
    totalCost: number;
    /** Last request timestamp */
    lastRequest: number;
    /** Uptime percentage */
    uptimePercent: number;
}
/**
 * Provider adapter configuration
 */
export interface ProviderAdapterConfig {
    /** Default provider ID */
    defaultProviderId?: string;
    /** Default model ID */
    defaultModelId?: string;
    /** Enable automatic failover */
    enableFailover?: boolean;
    /** Maximum failover attempts */
    maxFailoverAttempts?: number;
    /** Enable cost tracking */
    enableCostTracking?: boolean;
    /** Cost limit per hour in USD */
    costLimitPerHour?: number;
    /** Enable provider health checks */
    enableHealthChecks?: boolean;
    /** Health check interval in milliseconds */
    healthCheckInterval?: number;
    /** Enable request caching */
    enableCaching?: boolean;
    /** Cache TTL in milliseconds */
    cacheTTL?: number;
}
/**
 * ProviderAdapter - Multi-provider AI model management
 *
 * Usage:
 * ```typescript
 * const adapter = new ProviderAdapter({
 *   enableFailover: true,
 *   enableCostTracking: true,
 * });
 *
 * // Register providers
 * adapter.registerProvider({
 *   id: 'anthropic',
 *   name: 'Anthropic',
 *   type: 'anthropic',
 *   models: [...],
 *   capabilities: ['chat', 'code-generation'],
 *   status: 'available',
 *   rateLimits: { ... },
 *   costPerToken: { ... },
 * });
 *
 * // Select provider based on requirements
 * const result = adapter.selectProvider({
 *   capabilities: ['code-generation'],
 *   maxCostPer1K: 0.01,
 * });
 *
 * // Execute task
 * const output = await adapter.executeWithProvider(task, result.provider);
 * ```
 */
export declare class ProviderAdapter extends EventEmitter {
    /** Registered providers */
    providers: Map<string, Provider>;
    /** Provider metrics */
    private metrics;
    /** Adapter configuration */
    private config;
    /** Health check timer */
    private healthCheckTimer;
    /** Request cache */
    private cache;
    /** Hourly cost tracking */
    private hourlyCost;
    /**
     * Create a new ProviderAdapter instance
     *
     * @param config - Adapter configuration
     */
    constructor(config?: ProviderAdapterConfig);
    /**
     * Initialize the adapter
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the adapter
     */
    shutdown(): Promise<void>;
    /**
     * Register a provider
     *
     * @param provider - Provider to register
     */
    registerProvider(provider: Provider): void;
    /**
     * Unregister a provider
     *
     * @param providerId - Provider ID to remove
     */
    unregisterProvider(providerId: string): boolean;
    /**
     * Get a provider by ID
     *
     * @param providerId - Provider ID
     * @returns Provider or undefined
     */
    getProvider(providerId: string): Provider | undefined;
    /**
     * Get all registered providers
     */
    getAllProviders(): Provider[];
    /**
     * Get available providers (not unavailable or rate-limited)
     */
    getAvailableProviders(): Provider[];
    /**
     * Select the best provider based on requirements
     *
     * @param requirements - Selection requirements
     * @returns Selection result with provider and model
     */
    selectProvider(requirements?: ProviderRequirements): ProviderSelectionResult;
    /**
     * Execute a task with a specific provider
     *
     * @param task - Task to execute
     * @param provider - Provider to use
     * @param options - Execution options
     * @returns Execution result
     */
    executeWithProvider(task: Task, provider: Provider, options?: ExecutionOptions): Promise<ExecutionResult>;
    /**
     * Get provider metrics
     *
     * @param providerId - Provider ID
     * @returns Provider metrics or undefined
     */
    getProviderMetrics(providerId: string): ProviderMetrics | undefined;
    /**
     * Get all provider metrics
     */
    getAllMetrics(): Map<string, ProviderMetrics>;
    /**
     * Update provider status
     *
     * @param providerId - Provider ID
     * @param status - New status
     */
    updateProviderStatus(providerId: string, status: ProviderStatus): void;
    /**
     * Calculate provider score for selection
     */
    private calculateProviderScore;
    /**
     * Execute a request to the provider
     */
    private executeRequest;
    /**
     * Try failover to alternative providers
     */
    private tryFailover;
    /**
     * Update provider metrics
     */
    private updateMetrics;
    /**
     * Update rate limits after request
     */
    private updateRateLimits;
    /**
     * Check rate limits before request
     */
    private checkRateLimits;
    /**
     * Check cost limits
     */
    private checkCostLimits;
    /**
     * Get cached result
     */
    private getCachedResult;
    /**
     * Cache result
     */
    private cacheResult;
    /**
     * Start health check timer
     */
    private startHealthChecks;
    /**
     * Stop health check timer
     */
    private stopHealthChecks;
    /**
     * Perform health checks on all providers
     */
    private performHealthChecks;
    /**
     * Utility delay function
     */
    private delay;
}
/**
 * Create a provider adapter with the given configuration
 *
 * @param config - Adapter configuration
 * @returns Configured ProviderAdapter
 */
export declare function createProviderAdapter(config?: ProviderAdapterConfig): ProviderAdapter;
/**
 * Create default provider configurations for common providers
 */
export declare function createDefaultProviders(): Provider[];
//# sourceMappingURL=provider-adapter.d.ts.map