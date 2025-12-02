import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
declare const ModelProviderSchema: z.ZodEnum<{
    gemini: "gemini";
    openrouter: "openrouter";
}>;
type ModelProvider = z.infer<typeof ModelProviderSchema>;
declare const CacheStrategySchema: z.ZodEnum<{
    memory: "memory";
    none: "none";
    disk: "disk";
}>;
type CacheStrategy = z.infer<typeof CacheStrategySchema>;
declare const DataTypeSchema: z.ZodEnum<{
    timeseries: "timeseries";
    events: "events";
    structured: "structured";
    text: "text";
    json: "json";
    csv: "csv";
}>;
type DataType = z.infer<typeof DataTypeSchema>;
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
declare const SynthConfigSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        gemini: "gemini";
        openrouter: "openrouter";
    }>;
    apiKey: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    cacheStrategy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        memory: "memory";
        none: "none";
        disk: "disk";
    }>>>;
    cacheTTL: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    maxRetries: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    timeout: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    streaming: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    automation: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    vectorDB: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    enableFallback: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    fallbackChain: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        gemini: "gemini";
        openrouter: "openrouter";
    }>>>;
}, z.core.$strip>;
interface GeneratorOptions {
    count?: number;
    schema?: DataSchema;
    format?: 'json' | 'csv' | 'array';
    seed?: string | number;
    constraints?: DataConstraints;
}
declare const GeneratorOptionsSchema: z.ZodObject<{
    count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        array: "array";
        json: "json";
        csv: "csv";
    }>>>;
    seed: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    constraints: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
interface TimeSeriesOptions extends GeneratorOptions {
    startDate?: Date | string;
    endDate?: Date | string;
    interval?: string;
    metrics?: string[];
    trend?: 'up' | 'down' | 'stable' | 'random';
    seasonality?: boolean;
    noise?: number;
}
declare const TimeSeriesOptionsSchema: z.ZodObject<{
    count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        array: "array";
        json: "json";
        csv: "csv";
    }>>>;
    seed: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    constraints: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    startDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodDate, z.ZodString]>>;
    endDate: z.ZodOptional<z.ZodUnion<readonly [z.ZodDate, z.ZodString]>>;
    interval: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodString>>;
    trend: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        up: "up";
        down: "down";
        stable: "stable";
        random: "random";
    }>>>;
    seasonality: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    noise: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
interface EventOptions extends GeneratorOptions {
    eventTypes?: string[];
    distribution?: 'uniform' | 'poisson' | 'normal';
    timeRange?: {
        start: Date | string;
        end: Date | string;
    };
    userCount?: number;
}
declare const EventOptionsSchema: z.ZodObject<{
    count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        array: "array";
        json: "json";
        csv: "csv";
    }>>>;
    seed: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    constraints: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    eventTypes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    distribution: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        uniform: "uniform";
        poisson: "poisson";
        normal: "normal";
    }>>>;
    timeRange: z.ZodOptional<z.ZodObject<{
        start: z.ZodUnion<readonly [z.ZodDate, z.ZodString]>;
        end: z.ZodUnion<readonly [z.ZodDate, z.ZodString]>;
    }, z.core.$strip>>;
    userCount: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
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
declare class SynthError extends Error {
    code: string;
    details?: unknown | undefined;
    constructor(message: string, code: string, details?: unknown | undefined);
}
declare class ValidationError extends SynthError {
    constructor(message: string, details?: unknown);
}
declare class APIError extends SynthError {
    constructor(message: string, details?: unknown);
}
declare class CacheError extends SynthError {
    constructor(message: string, details?: unknown);
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

interface CacheEntry<T = unknown> {
    key: string;
    value: T;
    timestamp: number;
    ttl: number;
    hits: number;
}
interface CacheOptions {
    strategy: CacheStrategy;
    ttl: number;
    maxSize?: number;
    onEvict?: (key: string, value: unknown) => void;
}
declare abstract class CacheStore {
    abstract get<T>(key: string): Promise<T | null>;
    abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;
    abstract has(key: string): Promise<boolean>;
    abstract delete(key: string): Promise<boolean>;
    abstract clear(): Promise<void>;
    abstract size(): Promise<number>;
}
/**
 * In-memory cache implementation with LRU eviction
 */
declare class MemoryCache extends CacheStore {
    private cache;
    private maxSize;
    private defaultTTL;
    private onEvict?;
    constructor(options: Omit<CacheOptions, 'strategy'>);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    size(): Promise<number>;
    private evictLRU;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        totalHits: number;
        expiredCount: number;
        hitRate: number;
    };
}
/**
 * No-op cache for disabled caching
 */
declare class NoCache extends CacheStore {
    get<T>(): Promise<T | null>;
    set<T>(): Promise<void>;
    has(): Promise<boolean>;
    delete(): Promise<boolean>;
    clear(): Promise<void>;
    size(): Promise<number>;
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

/**
 * agentic-synth - AI-powered synthetic data generation
 *
 * @packageDocumentation
 */

/**
 * Main AgenticSynth class for data generation
 */
declare class AgenticSynth {
    private config;
    private timeSeriesGen;
    private eventGen;
    private structuredGen;
    constructor(config?: Partial<SynthConfig>);
    /**
     * Generate time-series data
     */
    generateTimeSeries<T = unknown>(options?: Partial<TimeSeriesOptions>): Promise<GenerationResult<T>>;
    /**
     * Generate event data
     */
    generateEvents<T = unknown>(options?: Partial<EventOptions>): Promise<GenerationResult<T>>;
    /**
     * Generate structured data
     */
    generateStructured<T = unknown>(options?: Partial<GeneratorOptions>): Promise<GenerationResult<T>>;
    /**
     * Generate data by type
     */
    generate<T = unknown>(type: DataType, options?: Partial<GeneratorOptions>): Promise<GenerationResult<T>>;
    /**
     * Generate with streaming
     */
    generateStream<T = unknown>(type: DataType, options?: Partial<GeneratorOptions>): AsyncGenerator<T, void, unknown>;
    /**
     * Generate multiple batches in parallel
     */
    generateBatch<T = unknown>(type: DataType, batchOptions: Partial<GeneratorOptions>[], concurrency?: number): Promise<GenerationResult<T>[]>;
    /**
     * Get generator for data type
     */
    private getGenerator;
    /**
     * Configure instance
     */
    configure(config: Partial<SynthConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): SynthConfig;
}
/**
 * Create a new AgenticSynth instance
 */
declare function createSynth(config?: Partial<SynthConfig>): AgenticSynth;

export { APIError, AgenticSynth, BaseGenerator, type CacheEntry, CacheError, CacheManager, type CacheOptions, CacheStore, type CacheStrategy, CacheStrategySchema, type DataConstraints, type DataSchema, type DataType, DataTypeSchema, EventGenerator, type EventOptions, EventOptionsSchema, type GenerationResult, type GeneratorOptions, GeneratorOptionsSchema, type JsonArray, type JsonObject, type JsonPrimitive, type JsonValue, MemoryCache, type ModelProvider, ModelProviderSchema, type ModelRoute, ModelRouter, NoCache, type RouterConfig, type SchemaField, type StreamCallback, type StreamChunk, StructuredGenerator, type SynthConfig, SynthConfigSchema, SynthError, TimeSeriesGenerator, type TimeSeriesOptions, TimeSeriesOptionsSchema, ValidationError, createSynth, AgenticSynth as default };
