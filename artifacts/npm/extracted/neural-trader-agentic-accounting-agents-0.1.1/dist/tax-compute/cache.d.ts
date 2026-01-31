/**
 * Result Caching System
 *
 * Caches tax calculation results with TTL
 * Invalidates cache on new transactions
 */
import { TaxCalculationResult, TaxMethod } from './calculator-wrapper';
export interface CacheEntry<T> {
    key: string;
    value: T;
    timestamp: number;
    ttl: number;
    metadata?: Record<string, unknown>;
}
export interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
}
export declare class TaxCalculationCache {
    private cache;
    private hits;
    private misses;
    private readonly defaultTtl;
    private readonly maxSize;
    constructor(defaultTtl?: number, // 24 hours
    maxSize?: number);
    /**
     * Generate cache key from calculation parameters
     */
    generateKey(method: TaxMethod, saleId: string, lotIds: string[]): string;
    /**
     * Get cached result
     */
    get(key: string): TaxCalculationResult | null;
    /**
     * Store result in cache
     */
    set(key: string, value: TaxCalculationResult, ttl?: number, metadata?: Record<string, unknown>): void;
    /**
     * Invalidate cache entries matching pattern
     */
    invalidate(pattern?: string): number;
    /**
     * Invalidate all entries for a specific asset
     */
    invalidateAsset(asset: string): number;
    /**
     * Invalidate expired entries
     */
    cleanup(): number;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Reset statistics
     */
    resetStats(): void;
    /**
     * Clear all cache
     */
    clear(): void;
    /**
     * Get cache size
     */
    size(): number;
}
//# sourceMappingURL=cache.d.ts.map