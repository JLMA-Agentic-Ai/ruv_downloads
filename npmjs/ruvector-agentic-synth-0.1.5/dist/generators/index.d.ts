import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

/**
 * Core types and interfaces for agentic-synth
 */

type JsonPrimitive = string | number | boolean | null;
type JsonArray = JsonValue[];
type JsonObject = {
    [key: string]: JsonValue;
};
type JsonValue = JsonPrimitive | JsonArray | JsonObject;
interface SchemaField {
    type: string;
    required?: boolean;
    properties?: Record<string, SchemaField>;
    items?: SchemaField;
    enum?: unknown[];
    minimum?: number;
    maximum?: number;
    pattern?: string;
}
type DataSchema = Record<string, SchemaField>;
type DataConstraints = Record<string, unknown>;
declare const ModelProviderSchema: z.ZodEnum<["gemini", "openrouter"]>;
type ModelProvider = z.infer<typeof ModelProviderSchema>;
declare const CacheStrategySchema: z.ZodEnum<["none", "memory", "disk"]>;
type CacheStrategy = z.infer<typeof CacheStrategySchema>;
interface SynthConfig {
    provider: ModelProvider;
    apiKey?: string;
    model?: string;
    cacheStrategy?: CacheStrategy;
    cacheTTL?: number;
    maxRetries?: number;
    timeout?: number;
    streaming?: boolean;
    automation?: boolean;
    vectorDB?: boolean;
    enableFallback?: boolean;
    fallbackChain?: ModelProvider[];
}
interface GeneratorOptions {
    count?: number;
    schema?: DataSchema;
    format?: 'json' | 'csv' | 'array';
    seed?: string | number;
    constraints?: DataConstraints;
}
interface TimeSeriesOptions extends GeneratorOptions {
    startDate?: Date | string;
    endDate?: Date | string;
    interval?: string;
    metrics?: string[];
    trend?: 'up' | 'down' | 'stable' | 'random';
    seasonality?: boolean;
    noise?: number;
}
interface EventOptions extends GeneratorOptions {
    eventTypes?: string[];
    distribution?: 'uniform' | 'poisson' | 'normal';
    timeRange?: {
        start: Date | string;
        end: Date | string;
    };
    userCount?: number;
}
interface GenerationResult<T = JsonValue> {
    data: T[];
    metadata: {
        count: number;
        generatedAt: Date;
        provider: ModelProvider;
        model: string;
        cached: boolean;
        duration: number;
    };
}
interface ModelRoute {
    provider: ModelProvider;
    model: string;
    priority: number;
    capabilities: string[];
}
interface StreamChunk<T = JsonValue> {
    type: 'data' | 'metadata' | 'error' | 'complete';
    data?: T;
    metadata?: Record<string, unknown>;
    error?: Error;
}
type StreamCallback<T = JsonValue> = (chunk: StreamChunk<T>) => void | Promise<void>;

/**
 * Context caching system for performance optimization
 */

interface CacheOptions {
    strategy: CacheStrategy;
    ttl: number;
    maxSize?: number;
    onEvict?: (key: string, value: unknown) => void;
}
/**
 * Cache manager factory
 */
declare class CacheManager {
    private store;
    constructor(options: CacheOptions);
    /**
     * Get value from cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set value in cache
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    /**
     * Check if key exists in cache
     */
    has(key: string): Promise<boolean>;
    /**
     * Delete key from cache
     */
    delete(key: string): Promise<boolean>;
    /**
     * Clear all cache entries
     */
    clear(): Promise<void>;
    /**
     * Get cache size
     */
    size(): Promise<number>;
    /**
     * Generate cache key from parameters
     */
    static generateKey(prefix: string, params: Record<string, unknown>): string;
}

/**
 * Model routing logic for Gemini and OpenRouter
 */

interface RouterConfig {
    defaultProvider: ModelProvider;
    providerKeys: {
        gemini?: string;
        openrouter?: string;
    };
    fallbackChain?: ModelProvider[];
    customRoutes?: ModelRoute[];
}
/**
 * Model router for intelligent provider selection
 */
declare class ModelRouter {
    private config;
    private routes;
    constructor(config: RouterConfig);
    private initializeRoutes;
    /**
     * Select best model for given requirements
     */
    selectModel(requirements: {
        capabilities?: string[];
        provider?: ModelProvider;
        preferredModel?: string;
    }): ModelRoute;
    /**
     * Get fallback chain for resilience
     */
    getFallbackChain(primary: ModelRoute): ModelRoute[];
    /**
     * Get all available routes
     */
    getRoutes(): ModelRoute[];
    /**
     * Add custom route
     */
    addRoute(route: ModelRoute): void;
    /**
     * Get model configuration
     */
    getModelConfig(route: ModelRoute): {
        provider: ModelProvider;
        model: string;
        apiKey?: string;
    };
}

/**
 * Base generator class with API integration
 */

declare abstract class BaseGenerator<TOptions extends GeneratorOptions = GeneratorOptions> {
    protected config: SynthConfig;
    protected cache: CacheManager;
    protected router: ModelRouter;
    protected gemini?: GoogleGenerativeAI;
    constructor(config: SynthConfig);
    /**
     * Abstract method for generation logic
     */
    protected abstract generatePrompt(options: TOptions): string;
    /**
     * Abstract method for result parsing
     */
    protected abstract parseResult(response: string, options: TOptions): unknown[];
    /**
     * Generate synthetic data
     */
    generate<T = unknown>(options: TOptions): Promise<GenerationResult<T>>;
    /**
     * Generate with streaming support
     */
    generateStream<T = unknown>(options: TOptions, callback?: StreamCallback<T>): AsyncGenerator<T, void, unknown>;
    /**
     * Batch generation with parallel processing
     */
    generateBatch<T = unknown>(batchOptions: TOptions[], concurrency?: number): Promise<GenerationResult<T>[]>;
    /**
     * Generate with specific model
     */
    private generateWithModel;
    /**
     * Call Gemini API
     */
    private callGemini;
    /**
     * Call OpenRouter API
     */
    private callOpenRouter;
    /**
     * Validate generation options
     */
    protected validateOptions(options: TOptions): void;
    /**
     * Try to parse items from streaming buffer
     */
    protected tryParseStreamBuffer(buffer: string, options: TOptions): unknown[];
    /**
     * Format output based on options
     */
    protected formatOutput(data: unknown[], format?: string): string | unknown[];
    /**
     * Convert data to CSV format
     */
    private convertToCSV;
}

/**
 * Time-series data generator
 */

declare class TimeSeriesGenerator extends BaseGenerator<TimeSeriesOptions> {
    protected generatePrompt(options: TimeSeriesOptions): string;
    protected parseResult(response: string, options: TimeSeriesOptions): unknown[];
    /**
     * Generate synthetic time-series with local computation (faster for simple patterns)
     */
    generateLocal(options: TimeSeriesOptions): Promise<Array<Record<string, unknown>>>;
    private parseInterval;
}

/**
 * Event data generator
 */

declare class EventGenerator extends BaseGenerator<EventOptions> {
    protected generatePrompt(options: EventOptions): string;
    protected parseResult(response: string, options: EventOptions): unknown[];
    /**
     * Generate synthetic events with local computation
     */
    generateLocal(options: EventOptions): Promise<Array<Record<string, unknown>>>;
    private generateTimestamps;
    private generateMetadata;
}

/**
 * Structured data generator
 */

declare class StructuredGenerator extends BaseGenerator<GeneratorOptions> {
    protected generatePrompt(options: GeneratorOptions): string;
    protected parseResult(response: string, options: GeneratorOptions): unknown[];
    private validateAgainstSchema;
    /**
     * Generate structured data with specific domain
     */
    generateDomain(domain: string, options: GeneratorOptions): Promise<unknown[]>;
    /**
     * Generate data from JSON schema
     */
    generateFromJSONSchema(jsonSchema: Record<string, unknown>, options: GeneratorOptions): Promise<unknown[]>;
    private convertJSONSchema;
}

export { BaseGenerator, EventGenerator, type EventOptions, type GeneratorOptions, StructuredGenerator, TimeSeriesGenerator, type TimeSeriesOptions };
