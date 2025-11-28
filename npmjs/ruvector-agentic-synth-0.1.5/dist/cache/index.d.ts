import { z } from 'zod';

/**
 * Core types and interfaces for agentic-synth
 */

declare const CacheStrategySchema: z.ZodEnum<["none", "memory", "disk"]>;
type CacheStrategy = z.infer<typeof CacheStrategySchema>;
declare class SynthError extends Error {
    code: string;
    details?: unknown | undefined;
    constructor(message: string, code: string, details?: unknown | undefined);
}
declare class CacheError extends SynthError {
    constructor(message: string, details?: unknown);
}

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

export { type CacheEntry, CacheError, CacheManager, type CacheOptions, CacheStore, type CacheStrategy, MemoryCache, NoCache };
