"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/cache/index.ts
var index_exports = {};
__export(index_exports, {
  CacheError: () => CacheError,
  CacheManager: () => CacheManager,
  CacheStore: () => CacheStore,
  MemoryCache: () => MemoryCache,
  NoCache: () => NoCache
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var import_zod = require("zod");
var ModelProviderSchema = import_zod.z.enum(["gemini", "openrouter"]);
var CacheStrategySchema = import_zod.z.enum(["none", "memory", "disk"]);
var DataTypeSchema = import_zod.z.enum([
  "timeseries",
  "events",
  "structured",
  "text",
  "json",
  "csv"
]);
var SynthConfigSchema = import_zod.z.object({
  provider: ModelProviderSchema,
  apiKey: import_zod.z.string().optional(),
  model: import_zod.z.string().optional(),
  cacheStrategy: CacheStrategySchema.optional().default("memory"),
  cacheTTL: import_zod.z.number().optional().default(3600),
  maxRetries: import_zod.z.number().optional().default(3),
  timeout: import_zod.z.number().optional().default(3e4),
  streaming: import_zod.z.boolean().optional().default(false),
  automation: import_zod.z.boolean().optional().default(false),
  vectorDB: import_zod.z.boolean().optional().default(false),
  enableFallback: import_zod.z.boolean().optional().default(true),
  fallbackChain: import_zod.z.array(ModelProviderSchema).optional()
});
var GeneratorOptionsSchema = import_zod.z.object({
  count: import_zod.z.number().optional().default(1),
  schema: import_zod.z.record(import_zod.z.string(), import_zod.z.unknown()).optional(),
  format: import_zod.z.enum(["json", "csv", "array"]).optional().default("json"),
  seed: import_zod.z.union([import_zod.z.string(), import_zod.z.number()]).optional(),
  constraints: import_zod.z.record(import_zod.z.string(), import_zod.z.unknown()).optional()
});
var TimeSeriesOptionsSchema = GeneratorOptionsSchema.extend({
  startDate: import_zod.z.union([import_zod.z.date(), import_zod.z.string()]).optional(),
  endDate: import_zod.z.union([import_zod.z.date(), import_zod.z.string()]).optional(),
  interval: import_zod.z.string().optional().default("1h"),
  metrics: import_zod.z.array(import_zod.z.string()).optional(),
  trend: import_zod.z.enum(["up", "down", "stable", "random"]).optional().default("stable"),
  seasonality: import_zod.z.boolean().optional().default(false),
  noise: import_zod.z.number().min(0).max(1).optional().default(0.1)
});
var EventOptionsSchema = GeneratorOptionsSchema.extend({
  eventTypes: import_zod.z.array(import_zod.z.string()).optional(),
  distribution: import_zod.z.enum(["uniform", "poisson", "normal"]).optional().default("uniform"),
  timeRange: import_zod.z.object({
    start: import_zod.z.union([import_zod.z.date(), import_zod.z.string()]),
    end: import_zod.z.union([import_zod.z.date(), import_zod.z.string()])
  }).optional(),
  userCount: import_zod.z.number().optional()
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CacheError,
  CacheManager,
  CacheStore,
  MemoryCache,
  NoCache
});
