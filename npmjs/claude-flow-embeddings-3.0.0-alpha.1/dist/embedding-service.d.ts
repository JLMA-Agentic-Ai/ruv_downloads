/**
 * V3 Embedding Service Implementation
 *
 * Production embedding service aligned with agentic-flow@alpha:
 * - OpenAI provider (text-embedding-3-small/large)
 * - Transformers.js provider (local ONNX models)
 * - Mock provider (development/testing)
 *
 * Performance Targets:
 * - Single embedding: <100ms (API), <50ms (local)
 * - Batch embedding: <500ms for 10 items
 * - Cache hit: <1ms
 */
import { EventEmitter } from 'events';
import type { EmbeddingProvider, EmbeddingConfig, OpenAIEmbeddingConfig, TransformersEmbeddingConfig, MockEmbeddingConfig, EmbeddingResult, BatchEmbeddingResult, IEmbeddingService, EmbeddingEvent, EmbeddingEventListener, SimilarityMetric, SimilarityResult } from './types.js';
declare class LRUCache<K, V> {
    private readonly maxSize;
    private cache;
    private hits;
    private misses;
    constructor(maxSize: number);
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    clear(): void;
    get size(): number;
    get hitRate(): number;
    getStats(): {
        size: number;
        maxSize: number;
        hits: number;
        misses: number;
        hitRate: number;
    };
}
declare abstract class BaseEmbeddingService extends EventEmitter implements IEmbeddingService {
    protected readonly config: EmbeddingConfig;
    abstract readonly provider: EmbeddingProvider;
    protected cache: LRUCache<string, Float32Array>;
    protected embeddingListeners: Set<EmbeddingEventListener>;
    constructor(config: EmbeddingConfig);
    abstract embed(text: string): Promise<EmbeddingResult>;
    abstract embedBatch(texts: string[]): Promise<BatchEmbeddingResult>;
    protected emitEvent(event: EmbeddingEvent): void;
    addEventListener(listener: EmbeddingEventListener): void;
    removeEventListener(listener: EmbeddingEventListener): void;
    clearCache(): void;
    getCacheStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
    };
    shutdown(): Promise<void>;
}
export declare class OpenAIEmbeddingService extends BaseEmbeddingService {
    readonly provider: EmbeddingProvider;
    private readonly apiKey;
    private readonly model;
    private readonly baseURL;
    private readonly timeout;
    private readonly maxRetries;
    constructor(config: OpenAIEmbeddingConfig);
    embed(text: string): Promise<EmbeddingResult>;
    embedBatch(texts: string[]): Promise<BatchEmbeddingResult>;
    private callOpenAI;
}
export declare class TransformersEmbeddingService extends BaseEmbeddingService {
    readonly provider: EmbeddingProvider;
    private pipeline;
    private readonly modelName;
    private initialized;
    constructor(config: TransformersEmbeddingConfig);
    private initialize;
    embed(text: string): Promise<EmbeddingResult>;
    embedBatch(texts: string[]): Promise<BatchEmbeddingResult>;
}
export declare class MockEmbeddingService extends BaseEmbeddingService {
    readonly provider: EmbeddingProvider;
    private readonly dimensions;
    private readonly simulatedLatency;
    constructor(config: MockEmbeddingConfig);
    embed(text: string): Promise<EmbeddingResult>;
    embedBatch(texts: string[]): Promise<BatchEmbeddingResult>;
    /**
     * Generate deterministic hash-based embedding
     */
    private hashEmbedding;
}
/**
 * Create embedding service based on configuration
 */
export declare function createEmbeddingService(config: EmbeddingConfig): IEmbeddingService;
/**
 * Convenience function for quick embeddings
 */
export declare function getEmbedding(text: string, config?: Partial<EmbeddingConfig>): Promise<Float32Array | number[]>;
/**
 * Compute cosine similarity between two embeddings
 */
export declare function cosineSimilarity(a: Float32Array | number[], b: Float32Array | number[]): number;
/**
 * Compute Euclidean distance between two embeddings
 */
export declare function euclideanDistance(a: Float32Array | number[], b: Float32Array | number[]): number;
/**
 * Compute dot product between two embeddings
 */
export declare function dotProduct(a: Float32Array | number[], b: Float32Array | number[]): number;
/**
 * Compute similarity using specified metric
 */
export declare function computeSimilarity(a: Float32Array | number[], b: Float32Array | number[], metric?: SimilarityMetric): SimilarityResult;
export {};
//# sourceMappingURL=embedding-service.d.ts.map