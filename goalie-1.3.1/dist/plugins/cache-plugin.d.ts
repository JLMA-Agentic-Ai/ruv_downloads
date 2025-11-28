/**
 * Query Cache Plugin
 * Provides instant responses for repeated queries with TTL management
 */
import { GoapPlugin, PluginHooks } from '../core/types.js';
export declare class CachePlugin implements GoapPlugin {
    name: string;
    version: string;
    description: string;
    private cache;
    private ttl;
    private maxSize;
    private stats;
    constructor(ttlSeconds?: number);
    /**
     * Generate cache key from context
     */
    private getCacheKey;
    /**
     * Check if cache entry is still valid
     */
    private isValid;
    /**
     * Evict oldest entries if cache is full
     */
    private evictOldest;
    /**
     * Plugin hooks
     */
    hooks: PluginHooks;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        hits: number;
        misses: number;
        evictions: number;
        hitRate: string;
        ttl: string;
    };
    /**
     * Clear cache
     */
    clear(): void;
    /**
     * Initialize plugin
     */
    initialize(): Promise<void>;
    /**
     * Cleanup plugin
     */
    cleanup(): Promise<void>;
}
declare const _default: CachePlugin;
export default _default;
//# sourceMappingURL=cache-plugin.d.ts.map