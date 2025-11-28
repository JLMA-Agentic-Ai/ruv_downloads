/**
 * Query Cache Plugin
 * Provides instant responses for repeated queries with TTL management
 */
import crypto from 'crypto';
export class CachePlugin {
    name = 'cache-plugin';
    version = '1.0.0';
    description = 'Query caching for instant repeated responses';
    cache = new Map();
    ttl = 3600000; // 1 hour default
    maxSize = 100;
    stats = {
        hits: 0,
        misses: 0,
        evictions: 0
    };
    constructor(ttlSeconds = 3600) {
        this.ttl = ttlSeconds * 1000;
    }
    /**
     * Generate cache key from context
     */
    getCacheKey(context) {
        const data = {
            goal: context.goal,
            state: context.currentState
        };
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }
    /**
     * Check if cache entry is still valid
     */
    isValid(entry) {
        return Date.now() - entry.timestamp < this.ttl;
    }
    /**
     * Evict oldest entries if cache is full
     */
    evictOldest() {
        if (this.cache.size >= this.maxSize) {
            const oldest = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
            if (oldest) {
                this.cache.delete(oldest[0]);
                this.stats.evictions++;
            }
        }
    }
    /**
     * Plugin hooks
     */
    hooks = {
        beforeSearch: async (context) => {
            const key = this.getCacheKey(context);
            const cached = this.cache.get(key);
            if (cached && this.isValid(cached)) {
                // Cache hit
                cached.hits++;
                this.stats.hits++;
                console.log(`💾 [Cache] HIT - Plan served from cache (${cached.hits} hits)`);
                // Return cached result directly
                context.cachedResult = cached.result;
                context.skipSearch = true;
                // Update access time
                cached.timestamp = Date.now();
            }
            else {
                // Cache miss
                this.stats.misses++;
                if (cached) {
                    // Expired entry, remove it
                    this.cache.delete(key);
                }
                console.log(`💾 [Cache] MISS - Plan will be generated`);
            }
        },
        afterSearch: async (plan, context) => {
            // Only cache successful results
            if (plan && !context.skipSearch) {
                const key = this.getCacheKey(context);
                this.evictOldest();
                const entry = {
                    query: JSON.stringify(context.goal),
                    result: plan,
                    timestamp: Date.now(),
                    hits: 0,
                    hash: key
                };
                this.cache.set(key, entry);
                console.log(`💾 [Cache] STORED - Plan cached for future use`);
            }
        }
    };
    /**
     * Get cache statistics
     */
    getStats() {
        const size = this.cache.size;
        const hitRate = this.stats.hits + this.stats.misses > 0
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(1)
            : 0;
        return {
            size,
            maxSize: this.maxSize,
            hits: this.stats.hits,
            misses: this.stats.misses,
            evictions: this.stats.evictions,
            hitRate: `${hitRate}%`,
            ttl: `${this.ttl / 1000}s`
        };
    }
    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
        console.log('💾 [Cache] Cache cleared');
    }
    /**
     * Initialize plugin
     */
    async initialize() {
        console.log(`💾 [Cache] Initialized with TTL: ${this.ttl / 1000}s, Max size: ${this.maxSize}`);
    }
    /**
     * Cleanup plugin
     */
    async cleanup() {
        this.clear();
    }
}
export default new CachePlugin();
//# sourceMappingURL=cache-plugin.js.map