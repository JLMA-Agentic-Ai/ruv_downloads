// src/types.ts
import { z } from "zod";
var ModelProviderSchema = z.enum(["gemini", "openrouter"]);
var CacheStrategySchema = z.enum(["none", "memory", "disk"]);
var DataTypeSchema = z.enum([
  "timeseries",
  "events",
  "structured",
  "text",
  "json",
  "csv"
]);
var SynthConfigSchema = z.object({
  provider: ModelProviderSchema,
  apiKey: z.string().optional(),
  model: z.string().optional(),
  cacheStrategy: CacheStrategySchema.optional().default("memory"),
  cacheTTL: z.number().optional().default(3600),
  maxRetries: z.number().optional().default(3),
  timeout: z.number().optional().default(3e4),
  streaming: z.boolean().optional().default(false),
  automation: z.boolean().optional().default(false),
  vectorDB: z.boolean().optional().default(false),
  enableFallback: z.boolean().optional().default(true),
  fallbackChain: z.array(ModelProviderSchema).optional()
});
var GeneratorOptionsSchema = z.object({
  count: z.number().optional().default(1),
  schema: z.record(z.string(), z.unknown()).optional(),
  format: z.enum(["json", "csv", "array"]).optional().default("json"),
  seed: z.union([z.string(), z.number()]).optional(),
  constraints: z.record(z.string(), z.unknown()).optional()
});
var TimeSeriesOptionsSchema = GeneratorOptionsSchema.extend({
  startDate: z.union([z.date(), z.string()]).optional(),
  endDate: z.union([z.date(), z.string()]).optional(),
  interval: z.string().optional().default("1h"),
  metrics: z.array(z.string()).optional(),
  trend: z.enum(["up", "down", "stable", "random"]).optional().default("stable"),
  seasonality: z.boolean().optional().default(false),
  noise: z.number().min(0).max(1).optional().default(0.1)
});
var EventOptionsSchema = GeneratorOptionsSchema.extend({
  eventTypes: z.array(z.string()).optional(),
  distribution: z.enum(["uniform", "poisson", "normal"]).optional().default("uniform"),
  timeRange: z.object({
    start: z.union([z.date(), z.string()]),
    end: z.union([z.date(), z.string()])
  }).optional(),
  userCount: z.number().optional()
});
var SynthError = class extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "SynthError";
  }
};
var CacheError = class extends SynthError {
  constructor(message, details) {
    super(message, "CACHE_ERROR", details);
    this.name = "CacheError";
  }
};

// src/cache/index.ts
var CacheStore = class {
};
var MemoryCache = class extends CacheStore {
  cache;
  maxSize;
  defaultTTL;
  onEvict;
  constructor(options) {
    super();
    this.cache = /* @__PURE__ */ new Map();
    this.maxSize = options.maxSize || 1e3;
    this.defaultTTL = options.ttl;
    this.onEvict = options.onEvict;
  }
  async get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() - entry.timestamp > entry.ttl * 1e3) {
      await this.delete(key);
      return null;
    }
    entry.hits++;
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }
  async set(key, value, ttl) {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      await this.evictLRU();
    }
    const entry = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0
    };
    this.cache.set(key, entry);
  }
  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }
  async delete(key) {
    const entry = this.cache.get(key);
    const deleted = this.cache.delete(key);
    if (deleted && entry && this.onEvict) {
      this.onEvict(key, entry.value);
    }
    return deleted;
  }
  async clear() {
    if (this.onEvict) {
      for (const [key, entry] of this.cache.entries()) {
        this.onEvict(key, entry.value);
      }
    }
    this.cache.clear();
  }
  async size() {
    return this.cache.size;
  }
  async evictLRU() {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      await this.delete(firstKey);
    }
  }
  /**
   * Get cache statistics
   */
  getStats() {
    let totalHits = 0;
    let expiredCount = 0;
    const now = Date.now();
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
      if (now - entry.timestamp > entry.ttl * 1e3) {
        expiredCount++;
      }
    }
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      expiredCount,
      hitRate: totalHits / (this.cache.size || 1)
    };
  }
};
var NoCache = class extends CacheStore {
  async get() {
    return null;
  }
  async set() {
  }
  async has() {
    return false;
  }
  async delete() {
    return false;
  }
  async clear() {
  }
  async size() {
    return 0;
  }
};
var CacheManager = class {
  store;
  constructor(options) {
    switch (options.strategy) {
      case "memory":
        this.store = new MemoryCache(options);
        break;
      case "none":
        this.store = new NoCache();
        break;
      case "disk":
        throw new CacheError("Disk cache not yet implemented", { strategy: "disk" });
      default:
        throw new CacheError(`Unknown cache strategy: ${options.strategy}`, {
          strategy: options.strategy
        });
    }
  }
  /**
   * Get value from cache
   */
  async get(key) {
    try {
      return await this.store.get(key);
    } catch (error) {
      throw new CacheError("Failed to get cache value", { key, error });
    }
  }
  /**
   * Set value in cache
   */
  async set(key, value, ttl) {
    try {
      await this.store.set(key, value, ttl);
    } catch (error) {
      throw new CacheError("Failed to set cache value", { key, error });
    }
  }
  /**
   * Check if key exists in cache
   */
  async has(key) {
    try {
      return await this.store.has(key);
    } catch (error) {
      throw new CacheError("Failed to check cache key", { key, error });
    }
  }
  /**
   * Delete key from cache
   */
  async delete(key) {
    try {
      return await this.store.delete(key);
    } catch (error) {
      throw new CacheError("Failed to delete cache key", { key, error });
    }
  }
  /**
   * Clear all cache entries
   */
  async clear() {
    try {
      await this.store.clear();
    } catch (error) {
      throw new CacheError("Failed to clear cache", { error });
    }
  }
  /**
   * Get cache size
   */
  async size() {
    try {
      return await this.store.size();
    } catch (error) {
      throw new CacheError("Failed to get cache size", { error });
    }
  }
  /**
   * Generate cache key from parameters
   */
  static generateKey(prefix, params) {
    const sorted = Object.keys(params).sort().map((key) => `${key}:${JSON.stringify(params[key])}`).join("|");
    return `${prefix}:${sorted}`;
  }
};
export {
  CacheError,
  CacheManager,
  CacheStore,
  MemoryCache,
  NoCache
};
