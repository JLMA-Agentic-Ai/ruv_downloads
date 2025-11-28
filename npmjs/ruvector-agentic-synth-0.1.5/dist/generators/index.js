// src/generators/base.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

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
var ValidationError = class extends SynthError {
  constructor(message, details) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
};
var APIError = class extends SynthError {
  constructor(message, details) {
    super(message, "API_ERROR", details);
    this.name = "APIError";
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

// src/routing/index.ts
var ModelRouter = class {
  config;
  routes;
  constructor(config) {
    this.config = config;
    this.routes = /* @__PURE__ */ new Map();
    this.initializeRoutes();
  }
  initializeRoutes() {
    const geminiRoutes = [
      {
        provider: "gemini",
        model: "gemini-2.0-flash-exp",
        priority: 10,
        capabilities: ["text", "json", "streaming", "fast"]
      },
      {
        provider: "gemini",
        model: "gemini-1.5-pro",
        priority: 8,
        capabilities: ["text", "json", "complex", "reasoning"]
      },
      {
        provider: "gemini",
        model: "gemini-1.5-flash",
        priority: 9,
        capabilities: ["text", "json", "fast", "efficient"]
      }
    ];
    const openrouterRoutes = [
      {
        provider: "openrouter",
        model: "anthropic/claude-3.5-sonnet",
        priority: 10,
        capabilities: ["text", "json", "reasoning", "complex"]
      },
      {
        provider: "openrouter",
        model: "openai/gpt-4-turbo",
        priority: 9,
        capabilities: ["text", "json", "reasoning"]
      },
      {
        provider: "openrouter",
        model: "meta-llama/llama-3.1-70b-instruct",
        priority: 7,
        capabilities: ["text", "json", "fast"]
      }
    ];
    [...geminiRoutes, ...openrouterRoutes, ...this.config.customRoutes || []].forEach(
      (route) => {
        const key = `${route.provider}:${route.model}`;
        this.routes.set(key, route);
      }
    );
  }
  /**
   * Select best model for given requirements
   */
  selectModel(requirements) {
    const { capabilities = [], provider, preferredModel } = requirements;
    if (provider && preferredModel) {
      const key = `${provider}:${preferredModel}`;
      const route = this.routes.get(key);
      if (route) {
        return route;
      }
    }
    let candidates = Array.from(this.routes.values());
    if (provider) {
      candidates = candidates.filter((r) => r.provider === provider);
    } else {
      candidates = candidates.filter((r) => r.provider === this.config.defaultProvider);
    }
    if (capabilities.length > 0) {
      candidates = candidates.filter(
        (route) => capabilities.every((cap) => route.capabilities.includes(cap))
      );
    }
    candidates.sort((a, b) => b.priority - a.priority);
    if (candidates.length === 0) {
      throw new SynthError(
        "No suitable model found for requirements",
        "NO_MODEL_FOUND",
        { requirements }
      );
    }
    const selectedRoute = candidates[0];
    if (!selectedRoute) {
      throw new SynthError(
        "Unexpected error: no route selected despite candidates",
        "ROUTE_SELECTION_ERROR",
        { candidates }
      );
    }
    return selectedRoute;
  }
  /**
   * Get fallback chain for resilience
   */
  getFallbackChain(primary) {
    const chain = [primary];
    if (this.config.fallbackChain) {
      const essentialCapabilities = primary.capabilities.filter(
        (cap) => !["streaming", "fast", "efficient", "complex", "reasoning"].includes(cap)
      );
      for (const provider of this.config.fallbackChain) {
        try {
          const fallback = this.selectModel({
            provider,
            capabilities: essentialCapabilities.length > 0 ? essentialCapabilities : void 0
          });
          if (fallback.model !== primary.model) {
            chain.push(fallback);
          }
        } catch (error) {
          console.warn(`No suitable fallback model found for provider ${provider}`);
        }
      }
    }
    return chain;
  }
  /**
   * Get all available routes
   */
  getRoutes() {
    return Array.from(this.routes.values());
  }
  /**
   * Add custom route
   */
  addRoute(route) {
    const key = `${route.provider}:${route.model}`;
    this.routes.set(key, route);
  }
  /**
   * Get model configuration
   */
  getModelConfig(route) {
    return {
      provider: route.provider,
      model: route.model,
      apiKey: this.config.providerKeys[route.provider]
    };
  }
};

// src/generators/base.ts
var BaseGenerator = class {
  config;
  cache;
  router;
  gemini;
  constructor(config) {
    this.config = config;
    this.cache = new CacheManager({
      strategy: config.cacheStrategy || "memory",
      ttl: config.cacheTTL || 3600,
      maxSize: 1e3
    });
    let fallbackChain = void 0;
    if (config.enableFallback !== false) {
      if (config.fallbackChain && config.fallbackChain.length > 0) {
        fallbackChain = config.fallbackChain;
      } else {
        fallbackChain = config.provider === "gemini" ? ["openrouter"] : ["gemini"];
      }
    }
    this.router = new ModelRouter({
      defaultProvider: config.provider,
      providerKeys: {
        gemini: config.apiKey || process.env.GEMINI_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY
      },
      fallbackChain
    });
    const geminiKey = config.apiKey || process.env.GEMINI_API_KEY;
    if (config.provider === "gemini" && geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }
  }
  /**
   * Generate synthetic data
   */
  async generate(options) {
    const startTime = Date.now();
    this.validateOptions(options);
    const cacheKey = CacheManager.generateKey("generate", {
      type: this.constructor.name,
      options
    });
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          cached: true
        }
      };
    }
    const route = this.router.selectModel({
      provider: this.config.provider,
      preferredModel: this.config.model,
      capabilities: ["text", "json"]
    });
    let lastError = null;
    const fallbackChain = this.router.getFallbackChain(route);
    for (const fallbackRoute of fallbackChain) {
      try {
        const result = await this.generateWithModel(fallbackRoute, options, startTime);
        await this.cache.set(cacheKey, result, this.config.cacheTTL);
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`Failed with ${fallbackRoute.model}, trying fallback...`);
      }
    }
    throw new APIError(
      `All model attempts failed: ${lastError?.message}`,
      { lastError, fallbackChain }
    );
  }
  /**
   * Generate with streaming support
   */
  async *generateStream(options, callback) {
    if (!this.config.streaming) {
      throw new ValidationError("Streaming not enabled in configuration");
    }
    const prompt = this.generatePrompt(options);
    const route = this.router.selectModel({
      provider: this.config.provider,
      capabilities: ["streaming"]
    });
    if (route.provider === "gemini" && this.gemini) {
      const model = this.gemini.getGenerativeModel({ model: route.model });
      const result = await model.generateContentStream(prompt);
      let buffer = "";
      for await (const chunk of result.stream) {
        const text = chunk.text();
        buffer += text;
        const items = this.tryParseStreamBuffer(buffer, options);
        for (const item of items) {
          if (callback) {
            await callback({ type: "data", data: item });
          }
          yield item;
        }
      }
    } else {
      throw new APIError("Streaming not supported for this provider/model", {
        route
      });
    }
    if (callback) {
      await callback({ type: "complete" });
    }
  }
  /**
   * Batch generation with parallel processing
   */
  async generateBatch(batchOptions, concurrency = 3) {
    const results = [];
    for (let i = 0; i < batchOptions.length; i += concurrency) {
      const batch = batchOptions.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((options) => this.generate(options))
      );
      results.push(...batchResults);
    }
    return results;
  }
  /**
   * Generate with specific model
   */
  async generateWithModel(route, options, startTime) {
    const prompt = this.generatePrompt(options);
    let response;
    if (route.provider === "gemini" && this.gemini) {
      response = await this.callGemini(route.model, prompt);
    } else if (route.provider === "openrouter") {
      response = await this.callOpenRouter(route.model, prompt);
    } else {
      throw new APIError(`Unsupported provider: ${route.provider}`, { route });
    }
    const data = this.parseResult(response, options);
    return {
      data,
      metadata: {
        count: data.length,
        generatedAt: /* @__PURE__ */ new Date(),
        provider: route.provider,
        model: route.model,
        cached: false,
        duration: Date.now() - startTime
      }
    };
  }
  /**
   * Call Gemini API
   */
  async callGemini(model, prompt) {
    if (!this.gemini) {
      throw new APIError("Gemini client not initialized", {
        provider: "gemini"
      });
    }
    try {
      const genModel = this.gemini.getGenerativeModel({ model });
      const result = await genModel.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new APIError(`Gemini API error: ${errorMessage}`, {
        model,
        error
      });
    }
  }
  /**
   * Call OpenRouter API
   */
  async callOpenRouter(model, prompt) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new APIError("OpenRouter API key not configured", {
        provider: "openrouter"
      });
    }
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }]
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new APIError(`OpenRouter API error: ${errorMessage}`, {
        model,
        error
      });
    }
  }
  /**
   * Validate generation options
   */
  validateOptions(options) {
    if (options.count !== void 0 && options.count < 1) {
      throw new ValidationError("Count must be at least 1", { options });
    }
    if (options.format && !["json", "csv", "array"].includes(options.format)) {
      throw new ValidationError("Invalid format", { options });
    }
  }
  /**
   * Try to parse items from streaming buffer
   */
  tryParseStreamBuffer(buffer, options) {
    return [];
  }
  /**
   * Format output based on options
   */
  formatOutput(data, format = "json") {
    switch (format) {
      case "csv":
        return this.convertToCSV(data);
      case "array":
        return data;
      case "json":
      default:
        return JSON.stringify(data, null, 2);
    }
  }
  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    if (data.length === 0) return "";
    const firstItem = data[0];
    if (typeof firstItem !== "object" || firstItem === null) return "";
    const headers = Object.keys(firstItem);
    const rows = data.map((item) => {
      if (typeof item !== "object" || item === null) return "";
      const record = item;
      return headers.map((header) => JSON.stringify(record[header] ?? "")).join(",");
    });
    return [headers.join(","), ...rows].join("\n");
  }
};

// src/generators/timeseries.ts
var TimeSeriesGenerator = class extends BaseGenerator {
  generatePrompt(options) {
    const {
      count = 100,
      startDate = /* @__PURE__ */ new Date(),
      endDate,
      interval = "1h",
      metrics = ["value"],
      trend = "stable",
      seasonality = false,
      noise = 0.1,
      schema,
      constraints
    } = options;
    const end = endDate || new Date(Date.now() + 24 * 60 * 60 * 1e3);
    let prompt = `Generate ${count} time-series data points with the following specifications:

Time Range:
- Start: ${startDate}
- End: ${end}
- Interval: ${interval}

Metrics: ${metrics.join(", ")}

Characteristics:
- Trend: ${trend}
- Seasonality: ${seasonality ? "Include daily/weekly patterns" : "No seasonality"}
- Noise level: ${noise * 100}%

`;
    if (schema) {
      prompt += `
Schema:
${JSON.stringify(schema, null, 2)}
`;
    }
    if (constraints) {
      prompt += `
Constraints:
${JSON.stringify(constraints, null, 2)}
`;
    }
    prompt += `
Generate realistic time-series data with timestamps and metric values.
Return the data as a JSON array where each object has:
- timestamp: ISO 8601 formatted date string
- ${metrics.map((m) => `${m}: numeric value`).join("\n- ")}

Ensure:
1. Timestamps are evenly spaced according to the interval
2. Values follow the specified trend pattern
3. Noise is applied realistically
4. Seasonality patterns are natural if enabled
5. All values are within reasonable ranges

Return ONLY the JSON array, no additional text.`;
    return prompt;
  }
  parseResult(response, options) {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }
      const data = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(data)) {
        throw new Error("Response is not an array");
      }
      return data.map((item, index) => {
        if (typeof item !== "object" || item === null) {
          throw new ValidationError(`Invalid data item at index ${index}`, { item });
        }
        const record = item;
        if (!record.timestamp) {
          throw new ValidationError(`Missing timestamp at index ${index}`, { item });
        }
        const metrics = options.metrics || ["value"];
        for (const metric of metrics) {
          if (typeof record[metric] !== "number") {
            throw new ValidationError(
              `Missing or invalid metric '${metric}' at index ${index}`,
              { item }
            );
          }
        }
        return {
          timestamp: new Date(record.timestamp).toISOString(),
          ...record
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new ValidationError(`Failed to parse time-series data: ${errorMessage}`, {
        response: response.substring(0, 200),
        error
      });
    }
  }
  /**
   * Generate synthetic time-series with local computation (faster for simple patterns)
   */
  async generateLocal(options) {
    const {
      count = 100,
      startDate = /* @__PURE__ */ new Date(),
      interval = "1h",
      metrics = ["value"],
      trend = "stable",
      seasonality = false,
      noise = 0.1
    } = options;
    const start = new Date(startDate).getTime();
    const intervalMs = this.parseInterval(interval);
    const data = [];
    let baseValue = 100;
    const trendRate = trend === "up" ? 0.01 : trend === "down" ? -0.01 : 0;
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(start + i * intervalMs);
      const point = { timestamp: timestamp.toISOString() };
      for (const metric of metrics) {
        let value = baseValue;
        value += baseValue * trendRate * i;
        if (seasonality) {
          const hourOfDay = timestamp.getHours();
          const dayOfWeek = timestamp.getDay();
          value += Math.sin(hourOfDay / 24 * Math.PI * 2) * baseValue * 0.1;
          value += Math.sin(dayOfWeek / 7 * Math.PI * 2) * baseValue * 0.05;
        }
        value += (Math.random() - 0.5) * 2 * baseValue * noise;
        point[metric] = Math.round(value * 100) / 100;
      }
      data.push(point);
    }
    return data;
  }
  parseInterval(interval) {
    const match = interval.match(/^(\d+)(s|m|h|d)$/);
    if (!match) {
      throw new ValidationError("Invalid interval format", { interval });
    }
    const [, amount, unit] = match;
    if (!amount || !unit) {
      throw new ValidationError("Invalid interval format: missing amount or unit", { interval, match });
    }
    const multipliers = {
      s: 1e3,
      m: 60 * 1e3,
      h: 60 * 60 * 1e3,
      d: 24 * 60 * 60 * 1e3
    };
    const multiplier = multipliers[unit];
    if (multiplier === void 0) {
      throw new ValidationError("Invalid interval unit", { interval, unit });
    }
    return parseInt(amount, 10) * multiplier;
  }
};

// src/generators/events.ts
var EventGenerator = class extends BaseGenerator {
  generatePrompt(options) {
    const {
      count = 100,
      eventTypes = ["click", "view", "purchase"],
      distribution = "uniform",
      timeRange,
      userCount = 50,
      schema,
      constraints
    } = options;
    const start = timeRange?.start || new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const end = timeRange?.end || /* @__PURE__ */ new Date();
    let prompt = `Generate ${count} event log entries with the following specifications:

Event Configuration:
- Event types: ${eventTypes.join(", ")}
- Distribution: ${distribution}
- Time range: ${start} to ${end}
- Unique users: ${userCount}

`;
    if (schema) {
      prompt += `
Schema:
${JSON.stringify(schema, null, 2)}
`;
    }
    if (constraints) {
      prompt += `
Constraints:
${JSON.stringify(constraints, null, 2)}
`;
    }
    prompt += `
Generate realistic event data where each event has:
- eventId: unique identifier
- eventType: one of the specified types
- timestamp: ISO 8601 formatted date within the time range
- userId: user identifier (1 to ${userCount})
- metadata: relevant event-specific data

Distribution patterns:
- uniform: events evenly distributed over time
- poisson: random but clustered events (realistic web traffic)
- normal: events concentrated around mean time

Ensure:
1. Events are chronologically ordered
2. Event types follow realistic usage patterns
3. User behavior is consistent and realistic
4. Metadata is relevant to event type
5. Timestamps fall within the specified range

Return ONLY a JSON array of events, no additional text.`;
    return prompt;
  }
  parseResult(response, options) {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }
      const data = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(data)) {
        throw new Error("Response is not an array");
      }
      return data.map((event, index) => {
        if (typeof event !== "object" || event === null) {
          throw new ValidationError(`Invalid event at index ${index}`, { event });
        }
        const record = event;
        if (!record.eventId) {
          record.eventId = `evt_${Date.now()}_${index}`;
        }
        if (!record.eventType) {
          throw new ValidationError(`Missing eventType at index ${index}`, { event });
        }
        if (!record.timestamp) {
          throw new ValidationError(`Missing timestamp at index ${index}`, { event });
        }
        if (!record.userId) {
          throw new ValidationError(`Missing userId at index ${index}`, { event });
        }
        return {
          eventId: record.eventId,
          eventType: record.eventType,
          timestamp: new Date(record.timestamp).toISOString(),
          userId: record.userId,
          metadata: record.metadata || {}
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new ValidationError(`Failed to parse event data: ${errorMessage}`, {
        response: response.substring(0, 200),
        error
      });
    }
  }
  /**
   * Generate synthetic events with local computation
   */
  async generateLocal(options) {
    const {
      count = 100,
      eventTypes = ["click", "view", "purchase"],
      distribution = "uniform",
      timeRange,
      userCount = 50
    } = options;
    const start = timeRange?.start ? new Date(timeRange.start).getTime() : Date.now() - 24 * 60 * 60 * 1e3;
    const end = timeRange?.end ? new Date(timeRange.end).getTime() : Date.now();
    const events = [];
    const timestamps = this.generateTimestamps(count, start, end, distribution);
    for (let i = 0; i < count; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const userId = `user_${Math.floor(Math.random() * userCount) + 1}`;
      const timestamp = timestamps[i];
      if (eventType === void 0 || timestamp === void 0) {
        throw new ValidationError(
          `Failed to generate event at index ${i}`,
          { eventType, timestamp }
        );
      }
      events.push({
        eventId: `evt_${Date.now()}_${i}`,
        eventType,
        timestamp: new Date(timestamp).toISOString(),
        userId,
        metadata: this.generateMetadata(eventType)
      });
    }
    events.sort((a, b) => {
      const aTime = typeof a.timestamp === "string" ? new Date(a.timestamp).getTime() : 0;
      const bTime = typeof b.timestamp === "string" ? new Date(b.timestamp).getTime() : 0;
      return aTime - bTime;
    });
    return events;
  }
  generateTimestamps(count, start, end, distribution) {
    const timestamps = [];
    const range = end - start;
    switch (distribution) {
      case "uniform":
        for (let i = 0; i < count; i++) {
          timestamps.push(start + Math.random() * range);
        }
        break;
      case "poisson":
        let time = start;
        const lambda = count / range;
        for (let i = 0; i < count && time < end; i++) {
          const interval = -Math.log(1 - Math.random()) / lambda;
          time += interval;
          timestamps.push(Math.min(time, end));
        }
        break;
      case "normal":
        const mean = start + range / 2;
        const stdDev = range / 6;
        for (let i = 0; i < count; i++) {
          const u1 = Math.random();
          const u2 = Math.random();
          const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          const timestamp = mean + z2 * stdDev;
          timestamps.push(Math.max(start, Math.min(end, timestamp)));
        }
        break;
    }
    return timestamps.sort((a, b) => a - b);
  }
  generateMetadata(eventType) {
    const metadata = {};
    switch (eventType.toLowerCase()) {
      case "click":
        metadata.element = ["button", "link", "image"][Math.floor(Math.random() * 3)];
        metadata.position = { x: Math.floor(Math.random() * 1920), y: Math.floor(Math.random() * 1080) };
        break;
      case "view":
        metadata.page = `/page${Math.floor(Math.random() * 10)}`;
        metadata.duration = Math.floor(Math.random() * 300);
        break;
      case "purchase":
        metadata.amount = Math.floor(Math.random() * 1e3) / 10;
        metadata.currency = "USD";
        metadata.items = Math.floor(Math.random() * 5) + 1;
        break;
      default:
        metadata.type = eventType;
        break;
    }
    return metadata;
  }
};

// src/generators/structured.ts
var StructuredGenerator = class extends BaseGenerator {
  generatePrompt(options) {
    const { count = 10, schema, constraints, format = "json" } = options;
    if (!schema) {
      throw new ValidationError("Schema is required for structured data generation", {
        options
      });
    }
    let prompt = `Generate ${count} realistic data records matching the following schema:

Schema:
${JSON.stringify(schema, null, 2)}

`;
    if (constraints) {
      prompt += `
Constraints:
${JSON.stringify(constraints, null, 2)}
`;
    }
    prompt += `
Requirements:
1. Generate realistic, diverse data that fits the schema
2. Ensure all required fields are present
3. Follow data type constraints strictly
4. Make data internally consistent and realistic
5. Include varied but plausible values

Return ONLY a JSON array of ${count} objects, no additional text.`;
    return prompt;
  }
  parseResult(response, options) {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }
      const data = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(data)) {
        throw new Error("Response is not an array");
      }
      if (options.schema) {
        return data.map((item, index) => {
          this.validateAgainstSchema(item, options.schema, index);
          return item;
        });
      }
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new ValidationError(`Failed to parse structured data: ${errorMessage}`, {
        response: response.substring(0, 200),
        error
      });
    }
  }
  validateAgainstSchema(item, schema, index) {
    if (typeof item !== "object" || item === null) {
      throw new ValidationError(`Item at index ${index} is not an object`, { item, schema });
    }
    const record = item;
    for (const [key, schemaValue] of Object.entries(schema)) {
      if (typeof schemaValue !== "object" || schemaValue === null) continue;
      const fieldSchema = schemaValue;
      if (fieldSchema.required && !(key in record)) {
        throw new ValidationError(`Missing required field '${key}' at index ${index}`, {
          item,
          schema
        });
      }
      if (key in record && fieldSchema.type) {
        const actualType = typeof record[key];
        const expectedType = fieldSchema.type;
        if (expectedType === "array" && !Array.isArray(record[key])) {
          throw new ValidationError(
            `Field '${key}' should be array at index ${index}`,
            { item, schema }
          );
        } else if (expectedType !== "array" && actualType !== expectedType) {
          throw new ValidationError(
            `Field '${key}' has wrong type at index ${index}. Expected ${expectedType}, got ${actualType}`,
            { item, schema }
          );
        }
      }
      if (fieldSchema.properties && typeof record[key] === "object") {
        this.validateAgainstSchema(record[key], fieldSchema.properties, index);
      }
    }
  }
  /**
   * Generate structured data with specific domain
   */
  async generateDomain(domain, options) {
    const domainSchemas = {
      users: {
        id: { type: "string", required: true },
        name: { type: "string", required: true },
        email: { type: "string", required: true },
        age: { type: "number", required: true },
        role: { type: "string", required: false },
        createdAt: { type: "string", required: true }
      },
      products: {
        id: { type: "string", required: true },
        name: { type: "string", required: true },
        price: { type: "number", required: true },
        category: { type: "string", required: true },
        inStock: { type: "boolean", required: true },
        description: { type: "string", required: false }
      },
      transactions: {
        id: { type: "string", required: true },
        userId: { type: "string", required: true },
        amount: { type: "number", required: true },
        currency: { type: "string", required: true },
        status: { type: "string", required: true },
        timestamp: { type: "string", required: true }
      }
    };
    const schema = domainSchemas[domain.toLowerCase()];
    if (!schema) {
      throw new ValidationError(`Unknown domain: ${domain}`, {
        availableDomains: Object.keys(domainSchemas)
      });
    }
    return this.generate({
      ...options,
      schema
    }).then((result) => result.data);
  }
  /**
   * Generate data from JSON schema
   */
  async generateFromJSONSchema(jsonSchema, options) {
    const schema = this.convertJSONSchema(jsonSchema);
    return this.generate({
      ...options,
      schema
    }).then((result) => result.data);
  }
  convertJSONSchema(jsonSchema) {
    const schema = {};
    if (jsonSchema.properties && typeof jsonSchema.properties === "object") {
      const properties = jsonSchema.properties;
      for (const [key, value] of Object.entries(properties)) {
        if (typeof value !== "object" || value === null) continue;
        const prop = value;
        const field = {
          type: typeof prop.type === "string" ? prop.type : "string",
          required: Array.isArray(jsonSchema.required) && jsonSchema.required.includes(key) || false
        };
        if (prop.properties) {
          field.properties = this.convertJSONSchema(prop);
        }
        schema[key] = field;
      }
    }
    return schema;
  }
};
export {
  BaseGenerator,
  EventGenerator,
  StructuredGenerator,
  TimeSeriesGenerator
};
