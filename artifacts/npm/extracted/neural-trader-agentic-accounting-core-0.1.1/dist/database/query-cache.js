"use strict";
/**
 * Query Result Cache
 * LRU cache for frequently accessed database queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearQueryCache = exports.getQueryCache = exports.QueryCache = void 0;
class QueryCache {
    cache;
    maxSize;
    ttl;
    hits = 0;
    misses = 0;
    constructor(options = {}) {
        this.cache = new Map();
        this.maxSize = options.maxSize || 1000;
        this.ttl = options.ttl || 60000; // Default 60 seconds
    }
    /**
     * Get cached result
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.misses++;
            return null;
        }
        // Check if expired
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }
        // Update hit count
        entry.hits++;
        this.hits++;
        return entry.data;
    }
    /**
     * Set cache entry
     */
    set(key, data) {
        // Evict least recently used if at capacity
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            hits: 0,
        });
    }
    /**
     * Invalidate cache entry
     */
    invalidate(key) {
        return this.cache.delete(key);
    }
    /**
     * Invalidate entries matching pattern
     */
    invalidatePattern(pattern) {
        let count = 0;
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                count++;
            }
        }
        return count;
    }
    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const hitRate = this.hits + this.misses > 0
            ? this.hits / (this.hits + this.misses)
            : 0;
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate,
            ttl: this.ttl,
        };
    }
    /**
     * Evict least recently used entry
     */
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }
}
exports.QueryCache = QueryCache;
// Singleton instance
let queryCache = null;
const getQueryCache = (options) => {
    if (!queryCache) {
        queryCache = new QueryCache(options);
    }
    return queryCache;
};
exports.getQueryCache = getQueryCache;
const clearQueryCache = () => {
    if (queryCache) {
        queryCache.clear();
    }
};
exports.clearQueryCache = clearQueryCache;
//# sourceMappingURL=query-cache.js.map