/**
 * Query Result Cache
 * LRU cache for frequently accessed database queries
 */
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    hits: number;
}
export interface CacheOptions {
    maxSize?: number;
    ttl?: number;
}
export declare class QueryCache {
    private cache;
    private maxSize;
    private ttl;
    private hits;
    private misses;
    constructor(options?: CacheOptions);
    /**
     * Get cached result
     */
    get<T>(key: string): T | null;
    /**
     * Set cache entry
     */
    set<T>(key: string, data: T): void;
    /**
     * Invalidate cache entry
     */
    invalidate(key: string): boolean;
    /**
     * Invalidate entries matching pattern
     */
    invalidatePattern(pattern: string): number;
    /**
     * Clear all cache
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        hits: number;
        misses: number;
        hitRate: number;
        ttl: number;
    };
    /**
     * Evict least recently used entry
     */
    private evictLRU;
}
export declare const getQueryCache: (options?: CacheOptions) => QueryCache;
export declare const clearQueryCache: () => void;
//# sourceMappingURL=query-cache.d.ts.map