"use strict";
/**
 * Result Caching System
 *
 * Caches tax calculation results with TTL
 * Invalidates cache on new transactions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxCalculationCache = void 0;
const crypto_1 = __importDefault(require("crypto"));
class TaxCalculationCache {
    cache = new Map();
    hits = 0;
    misses = 0;
    defaultTtl;
    maxSize;
    constructor(defaultTtl = 24 * 60 * 60 * 1000, // 24 hours
    maxSize = 1000) {
        this.defaultTtl = defaultTtl;
        this.maxSize = maxSize;
    }
    /**
     * Generate cache key from calculation parameters
     */
    generateKey(method, saleId, lotIds) {
        const data = JSON.stringify({
            method,
            saleId,
            lotIds: [...lotIds].sort(), // Sort for consistency
        });
        return crypto_1.default
            .createHash('sha256')
            .update(data)
            .digest('hex')
            .substring(0, 16);
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
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }
        this.hits++;
        return entry.value;
    }
    /**
     * Store result in cache
     */
    set(key, value, ttl, metadata) {
        // Enforce max size (LRU eviction)
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }
        const entry = {
            key,
            value,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTtl,
            metadata,
        };
        this.cache.set(key, entry);
    }
    /**
     * Invalidate cache entries matching pattern
     */
    invalidate(pattern) {
        if (!pattern) {
            // Clear all
            const size = this.cache.size;
            this.cache.clear();
            return size;
        }
        let removed = 0;
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (entry.metadata?.saleId === pattern || entry.metadata?.asset === pattern) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.cache.delete(key);
            removed++;
        }
        return removed;
    }
    /**
     * Invalidate all entries for a specific asset
     */
    invalidateAsset(asset) {
        let removed = 0;
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (entry.metadata?.asset === asset) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.cache.delete(key);
            removed++;
        }
        return removed;
    }
    /**
     * Invalidate expired entries
     */
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.cache.delete(key);
        }
        return keysToDelete.length;
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.hits + this.misses;
        return {
            hits: this.hits,
            misses: this.misses,
            size: this.cache.size,
            hitRate: total > 0 ? this.hits / total : 0,
        };
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.hits = 0;
        this.misses = 0;
    }
    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.resetStats();
    }
    /**
     * Get cache size
     */
    size() {
        return this.cache.size;
    }
}
exports.TaxCalculationCache = TaxCalculationCache;
//# sourceMappingURL=cache.js.map