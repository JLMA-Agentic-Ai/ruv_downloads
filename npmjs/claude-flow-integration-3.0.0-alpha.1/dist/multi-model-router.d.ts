/**
 * Multi-Model Router
 *
 * Cost-optimized routing across multiple LLM providers from agentic-flow@alpha:
 * - anthropic: Claude models
 * - openai: GPT models
 * - openrouter: 100+ models, 85-99% cost savings
 * - ollama: Local models
 * - litellm: Unified API
 * - onnx: Free local inference (Phi-4)
 * - gemini: Google Gemini
 * - custom: Custom providers
 *
 * Routing Modes:
 * - manual: Explicit provider selection
 * - cost-optimized: Minimize cost
 * - performance-optimized: Minimize latency
 * - quality-optimized: Maximize quality
 * - rule-based: Custom routing rules
 *
 * Features:
 * - Circuit breaker for reliability
 * - Cost tracking with budget alerts
 * - Tool calling translation
 * - Streaming support
 * - Response caching
 *
 * @module v3/integration/multi-model-router
 */
import { EventEmitter } from 'events';
/**
 * Supported providers
 */
export type ProviderType = 'anthropic' | 'openai' | 'openrouter' | 'ollama' | 'litellm' | 'onnx' | 'gemini' | 'custom';
/**
 * Routing mode
 */
export type RoutingMode = 'manual' | 'cost-optimized' | 'performance-optimized' | 'quality-optimized' | 'rule-based';
/**
 * Model capabilities
 */
export interface ModelCapabilities {
    contextWindow: number;
    supportsStreaming: boolean;
    supportsTools: boolean;
    supportsVision: boolean;
    supportsJson: boolean;
    maxOutputTokens: number;
}
/**
 * Provider configuration
 */
export interface ProviderConfig {
    type: ProviderType;
    enabled: boolean;
    apiKey?: string;
    baseUrl?: string;
    models: ModelConfig[];
    defaultModel?: string;
    timeout?: number;
    retries?: number;
}
/**
 * Model configuration
 */
export interface ModelConfig {
    id: string;
    name: string;
    provider: ProviderType;
    costPer1kInputTokens: number;
    costPer1kOutputTokens: number;
    latencyMs: number;
    qualityScore: number;
    capabilities: ModelCapabilities;
    aliases?: string[];
}
/**
 * Routing request
 */
export interface RoutingRequest {
    task: string;
    messages: ChatMessage[];
    requiredCapabilities?: Partial<ModelCapabilities>;
    maxCost?: number;
    maxLatency?: number;
    minQuality?: number;
    preferredProvider?: ProviderType;
    preferredModel?: string;
}
/**
 * Chat message
 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    name?: string;
    toolCalls?: ToolCall[];
    toolCallId?: string;
}
/**
 * Tool call
 */
export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}
/**
 * Routing result
 */
export interface RoutingResult {
    provider: ProviderType;
    model: string;
    reason: string;
    estimatedCost: number;
    estimatedLatency: number;
    qualityScore: number;
    alternatives?: Array<{
        provider: ProviderType;
        model: string;
        estimatedCost: number;
    }>;
}
/**
 * Completion request
 */
export interface CompletionRequest {
    messages: ChatMessage[];
    model?: string;
    provider?: ProviderType;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    tools?: Tool[];
    responseFormat?: 'text' | 'json';
}
/**
 * Tool definition
 */
export interface Tool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}
/**
 * Completion response
 */
export interface CompletionResponse {
    id: string;
    provider: ProviderType;
    model: string;
    content: string;
    finishReason: 'stop' | 'length' | 'tool_calls';
    toolCalls?: ToolCall[];
    usage: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    cost: number;
    latency: number;
}
/**
 * Router configuration
 */
export interface RouterConfig {
    mode: RoutingMode;
    providers: ProviderConfig[];
    budgetLimit?: number;
    budgetPeriod?: 'hourly' | 'daily' | 'monthly';
    cacheTTL?: number;
    circuitBreaker: {
        enabled: boolean;
        failureThreshold: number;
        resetTimeout: number;
    };
    routing: {
        preferLocalModels?: boolean;
        costWeight?: number;
        latencyWeight?: number;
        qualityWeight?: number;
    };
    rules?: RoutingRule[];
}
/**
 * Routing rule for rule-based mode
 */
export interface RoutingRule {
    name: string;
    condition: {
        taskPattern?: RegExp | string;
        minTokens?: number;
        maxTokens?: number;
        requiresTools?: boolean;
        requiresVision?: boolean;
    };
    action: {
        provider: ProviderType;
        model?: string;
        priority?: number;
    };
}
/**
 * Provider health status
 */
export interface ProviderHealth {
    provider: ProviderType;
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastError?: string;
    failureCount: number;
    successRate: number;
    avgLatency: number;
    circuitOpen: boolean;
}
/**
 * Cost tracking
 */
export interface CostTracker {
    periodStart: Date;
    periodEnd: Date;
    totalCost: number;
    byProvider: Record<ProviderType, number>;
    byModel: Record<string, number>;
    requests: number;
    tokensUsed: {
        input: number;
        output: number;
    };
}
/**
 * MultiModelRouter
 *
 * Routes requests to optimal LLM providers based on cost, latency, quality,
 * and capability requirements.
 */
export declare class MultiModelRouter extends EventEmitter {
    private config;
    private models;
    private providerHealth;
    private costTracker;
    private cache;
    constructor(config?: Partial<RouterConfig>);
    /**
     * Route a request to the optimal provider/model
     *
     * @param request - Routing request
     * @returns Routing result with selected provider and model
     */
    route(request: RoutingRequest): Promise<RoutingResult>;
    /**
     * Execute a completion request
     *
     * @param request - Completion request
     * @returns Completion response
     */
    complete(request: CompletionRequest): Promise<CompletionResponse>;
    /**
     * Get provider health status
     */
    getProviderHealth(): Map<ProviderType, ProviderHealth>;
    /**
     * Get cost tracking data
     */
    getCostTracker(): CostTracker;
    /**
     * Get available models
     */
    getModels(): ModelConfig[];
    /**
     * Add a custom model
     */
    addModel(model: ModelConfig): void;
    /**
     * Get cost savings estimate
     */
    getEstimatedSavings(request: RoutingRequest): {
        defaultCost: number;
        optimizedCost: number;
        savings: number;
        savingsPercent: string;
    };
    private initializeModels;
    private initializeProviderHealth;
    private createCostTracker;
    private filterByCapabilities;
    private checkCapabilities;
    private filterByHealth;
    private applyRules;
    private matchesRule;
    private scoreModels;
    private estimateCost;
    private estimateTokens;
    private generateReason;
    private executeCompletion;
    private generateCacheKey;
    private hashString;
    private isCircuitOpen;
    private recordSuccess;
    private recordFailure;
    private trackCost;
}
export declare function createMultiModelRouter(config?: Partial<RouterConfig>): MultiModelRouter;
export default MultiModelRouter;
//# sourceMappingURL=multi-model-router.d.ts.map