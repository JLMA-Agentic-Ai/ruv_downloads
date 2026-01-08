import { RuvectorLayer, TensorCompress } from '@ruvector/gnn';

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/ruvector/dist/types.js
var require_types = __commonJS({
  "../../node_modules/ruvector/dist/types.js"(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
  }
});

// ../../node_modules/ruvector/dist/core/gnn-wrapper.js
var require_gnn_wrapper = __commonJS({
  "../../node_modules/ruvector/dist/core/gnn-wrapper.js"(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.TensorCompress = exports$1.RuvectorLayer = void 0;
    exports$1.toFloat32Array = toFloat32Array;
    exports$1.toFloat32ArrayBatch = toFloat32ArrayBatch;
    exports$1.differentiableSearch = differentiableSearch;
    exports$1.hierarchicalForward = hierarchicalForward;
    exports$1.getCompressionLevel = getCompressionLevel;
    exports$1.isGnnAvailable = isGnnAvailable;
    var gnnModule = null;
    var loadError = null;
    function getGnnModule() {
      if (gnnModule)
        return gnnModule;
      if (loadError)
        throw loadError;
      try {
        gnnModule = __require("@ruvector/gnn");
        return gnnModule;
      } catch (e) {
        loadError = new Error(`@ruvector/gnn is not installed or failed to load: ${e.message}
Install with: npm install @ruvector/gnn`);
        throw loadError;
      }
    }
    function toFloat32Array(input) {
      if (input instanceof Float32Array)
        return input;
      if (input instanceof Float64Array)
        return new Float32Array(input);
      if (Array.isArray(input))
        return new Float32Array(input);
      return new Float32Array(Array.from(input));
    }
    function toFloat32ArrayBatch(input) {
      const result = new Array(input.length);
      for (let i = 0; i < input.length; i++) {
        result[i] = toFloat32Array(input[i]);
      }
      return result;
    }
    function differentiableSearch(query, candidates, k, temperature = 1) {
      const gnn = getGnnModule();
      const queryFloat32 = toFloat32Array(query);
      const candidatesFloat32 = toFloat32ArrayBatch(candidates);
      return gnn.differentiableSearch(queryFloat32, candidatesFloat32, k, temperature);
    }
    var RuvectorLayer2 = class _RuvectorLayer {
      /**
       * Create a new Ruvector GNN layer
       *
       * @param inputDim - Dimension of input node embeddings
       * @param hiddenDim - Dimension of hidden representations
       * @param heads - Number of attention heads
       * @param dropout - Dropout rate (0.0 to 1.0)
       */
      constructor(inputDim, hiddenDim, heads, dropout = 0.1) {
        const gnn = getGnnModule();
        this.inner = new gnn.RuvectorLayer(inputDim, hiddenDim, heads, dropout);
      }
      /**
       * Forward pass through the GNN layer
       *
       * @param nodeEmbedding - Current node's embedding
       * @param neighborEmbeddings - Embeddings of neighbor nodes
       * @param edgeWeights - Weights of edges to neighbors
       * @returns Updated node embedding as Float32Array
       */
      forward(nodeEmbedding, neighborEmbeddings, edgeWeights) {
        return this.inner.forward(toFloat32Array(nodeEmbedding), toFloat32ArrayBatch(neighborEmbeddings), toFloat32Array(edgeWeights));
      }
      /**
       * Serialize the layer to JSON
       */
      toJson() {
        return this.inner.toJson();
      }
      /**
       * Deserialize the layer from JSON
       */
      static fromJson(json) {
        const gnn = getGnnModule();
        const layer = new _RuvectorLayer(1, 1, 1, 0);
        layer.inner = gnn.RuvectorLayer.fromJson(json);
        return layer;
      }
    };
    exports$1.RuvectorLayer = RuvectorLayer2;
    var TensorCompress2 = class {
      constructor() {
        const gnn = getGnnModule();
        this.inner = new gnn.TensorCompress();
      }
      /**
       * Compress an embedding based on access frequency
       *
       * @param embedding - Input embedding vector
       * @param accessFreq - Access frequency (0.0 to 1.0)
       * @returns Compressed tensor as JSON string
       */
      compress(embedding, accessFreq) {
        return this.inner.compress(toFloat32Array(embedding), accessFreq);
      }
      /**
       * Decompress a compressed tensor
       *
       * @param compressedJson - Compressed tensor JSON
       * @returns Decompressed embedding
       */
      decompress(compressedJson) {
        return this.inner.decompress(compressedJson);
      }
    };
    exports$1.TensorCompress = TensorCompress2;
    function hierarchicalForward(query, layerEmbeddings, gnnLayersJson) {
      const gnn = getGnnModule();
      return gnn.hierarchicalForward(toFloat32Array(query), layerEmbeddings.map((layer) => toFloat32ArrayBatch(layer)), gnnLayersJson);
    }
    function getCompressionLevel(accessFreq) {
      const gnn = getGnnModule();
      return gnn.getCompressionLevel(accessFreq);
    }
    function isGnnAvailable() {
      try {
        getGnnModule();
        return true;
      } catch {
        return false;
      }
    }
    exports$1.default = {
      differentiableSearch,
      RuvectorLayer: RuvectorLayer2,
      TensorCompress: TensorCompress2,
      hierarchicalForward,
      getCompressionLevel,
      isGnnAvailable,
      // Export conversion helpers for performance optimization
      toFloat32Array,
      toFloat32ArrayBatch
    };
  }
});

// ../../node_modules/ruvector/dist/core/attention-fallbacks.js
var require_attention_fallbacks = __commonJS({
  "../../node_modules/ruvector/dist/core/attention-fallbacks.js"(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MoEAttention = exports$1.LocalGlobalAttention = exports$1.LinearAttention = exports$1.HyperbolicAttention = exports$1.FlashAttention = exports$1.MultiHeadAttention = void 0;
    exports$1.projectToPoincareBall = projectToPoincareBall;
    exports$1.poincareDistance = poincareDistance;
    exports$1.mobiusAddition = mobiusAddition;
    exports$1.expMap = expMap;
    exports$1.logMap = logMap;
    exports$1.isAttentionAvailable = isAttentionAvailable;
    exports$1.getAttentionVersion = getAttentionVersion;
    var attentionModule = null;
    var loadError = null;
    function getAttentionModule() {
      if (attentionModule)
        return attentionModule;
      if (loadError)
        throw loadError;
      try {
        attentionModule = __require("@ruvector/attention");
        return attentionModule;
      } catch (e) {
        loadError = new Error(`@ruvector/attention is not installed or failed to load: ${e.message}
Install with: npm install @ruvector/attention`);
        throw loadError;
      }
    }
    function toFloat32Array(input) {
      if (input instanceof Float32Array) {
        return input;
      }
      return new Float32Array(input);
    }
    function toFloat32Arrays(inputs) {
      return inputs.map((arr) => toFloat32Array(arr));
    }
    function fromFloat32Array(input) {
      return Array.from(input);
    }
    var MultiHeadAttention = class {
      /**
       * Create a new multi-head attention instance
       *
       * @param dim - Embedding dimension (must be divisible by numHeads)
       * @param numHeads - Number of attention heads
       */
      constructor(dim, numHeads) {
        const attention = getAttentionModule();
        this.inner = new attention.MultiHeadAttention(dim, numHeads);
        this.dim = dim;
        this.numHeads = numHeads;
      }
      /**
       * Compute multi-head attention
       *
       * @param query - Query vector
       * @param keys - Array of key vectors
       * @param values - Array of value vectors
       * @returns Attention output
       *
       * @example
       * ```typescript
       * const mha = new MultiHeadAttention(64, 4);
       *
       * // Works with regular arrays
       * const result1 = mha.compute([...64 values], [[...64], [...64]], [[...64], [...64]]);
       *
       * // Also works with Float32Array
       * const q = new Float32Array(64);
       * const k = [new Float32Array(64)];
       * const v = [new Float32Array(64)];
       * const result2 = mha.compute(q, k, v);
       * ```
       */
      compute(query, keys, values) {
        const raw = this.inner.compute(toFloat32Array(query), toFloat32Arrays(keys), toFloat32Arrays(values));
        return {
          values: fromFloat32Array(raw),
          raw
        };
      }
      /**
       * Compute and return raw Float32Array (faster, no conversion)
       */
      computeRaw(query, keys, values) {
        return this.inner.compute(query, keys, values);
      }
      get headDim() {
        return this.dim / this.numHeads;
      }
    };
    exports$1.MultiHeadAttention = MultiHeadAttention;
    var FlashAttention = class {
      /**
       * Create a new flash attention instance
       *
       * @param dim - Embedding dimension
       * @param blockSize - Block size for tiled computation (default: 512)
       */
      constructor(dim, blockSize = 512) {
        const attention = getAttentionModule();
        this.inner = new attention.FlashAttention(dim, blockSize);
        this.dim = dim;
        this.blockSize = blockSize;
      }
      /**
       * Compute flash attention
       */
      compute(query, keys, values) {
        const raw = this.inner.compute(toFloat32Array(query), toFloat32Arrays(keys), toFloat32Arrays(values));
        return {
          values: fromFloat32Array(raw),
          raw
        };
      }
      computeRaw(query, keys, values) {
        return this.inner.compute(query, keys, values);
      }
    };
    exports$1.FlashAttention = FlashAttention;
    var HyperbolicAttention = class {
      /**
       * Create a new hyperbolic attention instance
       *
       * @param dim - Embedding dimension
       * @param curvature - Hyperbolic curvature (typically 1.0)
       */
      constructor(dim, curvature = 1) {
        const attention = getAttentionModule();
        this.inner = new attention.HyperbolicAttention(dim, curvature);
        this.dim = dim;
        this.curvature = curvature;
      }
      /**
       * Compute hyperbolic attention
       */
      compute(query, keys, values) {
        const raw = this.inner.compute(toFloat32Array(query), toFloat32Arrays(keys), toFloat32Arrays(values));
        return {
          values: fromFloat32Array(raw),
          raw
        };
      }
      computeRaw(query, keys, values) {
        return this.inner.compute(query, keys, values);
      }
    };
    exports$1.HyperbolicAttention = HyperbolicAttention;
    var LinearAttention = class {
      /**
       * Create a new linear attention instance
       *
       * @param dim - Embedding dimension
       * @param numFeatures - Number of random features
       */
      constructor(dim, numFeatures) {
        const attention = getAttentionModule();
        this.inner = new attention.LinearAttention(dim, numFeatures);
        this.dim = dim;
        this.numFeatures = numFeatures;
      }
      /**
       * Compute linear attention
       */
      compute(query, keys, values) {
        const raw = this.inner.compute(toFloat32Array(query), toFloat32Arrays(keys), toFloat32Arrays(values));
        return {
          values: fromFloat32Array(raw),
          raw
        };
      }
      computeRaw(query, keys, values) {
        return this.inner.compute(query, keys, values);
      }
    };
    exports$1.LinearAttention = LinearAttention;
    var LocalGlobalAttention = class {
      /**
       * Create a new local-global attention instance
       *
       * @param dim - Embedding dimension
       * @param localWindow - Size of local attention window
       * @param globalTokens - Number of global attention tokens
       */
      constructor(dim, localWindow, globalTokens) {
        const attention = getAttentionModule();
        this.inner = new attention.LocalGlobalAttention(dim, localWindow, globalTokens);
        this.dim = dim;
        this.localWindow = localWindow;
        this.globalTokens = globalTokens;
      }
      /**
       * Compute local-global attention
       */
      compute(query, keys, values) {
        const raw = this.inner.compute(toFloat32Array(query), toFloat32Arrays(keys), toFloat32Arrays(values));
        return {
          values: fromFloat32Array(raw),
          raw
        };
      }
      computeRaw(query, keys, values) {
        return this.inner.compute(query, keys, values);
      }
    };
    exports$1.LocalGlobalAttention = LocalGlobalAttention;
    var MoEAttention = class _MoEAttention {
      /**
       * Create a new MoE attention instance
       *
       * @param config - MoE configuration
       */
      constructor(config) {
        const attention = getAttentionModule();
        this.inner = new attention.MoEAttention({
          dim: config.dim,
          num_experts: config.numExperts,
          top_k: config.topK,
          expert_capacity: config.expertCapacity ?? 1.25
        });
        this.config = config;
      }
      /**
       * Create with simple parameters
       */
      static simple(dim, numExperts, topK) {
        return new _MoEAttention({ dim, numExperts, topK });
      }
      /**
       * Compute MoE attention
       */
      compute(query, keys, values) {
        const raw = this.inner.compute(toFloat32Array(query), toFloat32Arrays(keys), toFloat32Arrays(values));
        return {
          values: fromFloat32Array(raw),
          raw
        };
      }
      computeRaw(query, keys, values) {
        return this.inner.compute(query, keys, values);
      }
    };
    exports$1.MoEAttention = MoEAttention;
    function projectToPoincareBall(vector, curvature = 1) {
      const attention = getAttentionModule();
      const result = attention.projectToPoincareBall(toFloat32Array(vector), curvature);
      return fromFloat32Array(result);
    }
    function poincareDistance(a, b, curvature = 1) {
      const attention = getAttentionModule();
      return attention.poincareDistance(toFloat32Array(a), toFloat32Array(b), curvature);
    }
    function mobiusAddition(a, b, curvature = 1) {
      const attention = getAttentionModule();
      const result = attention.mobiusAddition(toFloat32Array(a), toFloat32Array(b), curvature);
      return fromFloat32Array(result);
    }
    function expMap(base, tangent, curvature = 1) {
      const attention = getAttentionModule();
      const result = attention.expMap(toFloat32Array(base), toFloat32Array(tangent), curvature);
      return fromFloat32Array(result);
    }
    function logMap(base, point, curvature = 1) {
      const attention = getAttentionModule();
      const result = attention.logMap(toFloat32Array(base), toFloat32Array(point), curvature);
      return fromFloat32Array(result);
    }
    function isAttentionAvailable() {
      try {
        getAttentionModule();
        return true;
      } catch {
        return false;
      }
    }
    function getAttentionVersion() {
      try {
        const attention = getAttentionModule();
        return attention.version?.() ?? null;
      } catch {
        return null;
      }
    }
    exports$1.default = {
      MultiHeadAttention,
      FlashAttention,
      HyperbolicAttention,
      LinearAttention,
      LocalGlobalAttention,
      MoEAttention,
      projectToPoincareBall,
      poincareDistance,
      mobiusAddition,
      expMap,
      logMap,
      isAttentionAvailable,
      getAttentionVersion
    };
  }
});

// ../../node_modules/ruvector/dist/core/agentdb-fast.js
var require_agentdb_fast = __commonJS({
  "../../node_modules/ruvector/dist/core/agentdb-fast.js"(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.FastAgentDB = void 0;
    exports$1.createFastAgentDB = createFastAgentDB;
    exports$1.getDefaultAgentDB = getDefaultAgentDB;
    var coreModule = null;
    function getCoreModule() {
      if (coreModule)
        return coreModule;
      try {
        coreModule = __require("@ruvector/core");
        return coreModule;
      } catch {
        try {
          coreModule = require_dist();
          return coreModule;
        } catch (e) {
          throw new Error(`Neither @ruvector/core nor ruvector is available: ${e.message}`);
        }
      }
    }
    var FastAgentDB = class {
      /**
       * Create a new FastAgentDB instance
       *
       * @param dimensions - Vector dimensions for state embeddings
       * @param maxEpisodes - Maximum episodes to store (LRU eviction)
       */
      constructor(dimensions = 128, maxEpisodes = 1e5) {
        this.episodes = /* @__PURE__ */ new Map();
        this.trajectories = /* @__PURE__ */ new Map();
        this.vectorDb = null;
        this.episodeOrder = [];
        this.dimensions = dimensions;
        this.maxEpisodes = maxEpisodes;
      }
      /**
       * Initialize the vector database
       */
      async initVectorDb() {
        if (this.vectorDb)
          return;
        try {
          const core = getCoreModule();
          this.vectorDb = new core.VectorDB({
            dimensions: this.dimensions,
            distanceMetric: "Cosine"
          });
        } catch (e) {
          console.warn(`VectorDB not available, using fallback similarity: ${e.message}`);
        }
      }
      /**
       * Store an episode
       *
       * @param episode - Episode to store
       * @returns Episode ID
       */
      async storeEpisode(episode) {
        await this.initVectorDb();
        const id = episode.id ?? this.generateId();
        const fullEpisode = {
          ...episode,
          id,
          timestamp: episode.timestamp ?? Date.now()
        };
        if (this.episodes.size >= this.maxEpisodes) {
          const oldestId = this.episodeOrder.shift();
          if (oldestId) {
            this.episodes.delete(oldestId);
          }
        }
        this.episodes.set(id, fullEpisode);
        this.episodeOrder.push(id);
        if (this.vectorDb && fullEpisode.state.length === this.dimensions) {
          try {
            await this.vectorDb.insert({
              id,
              vector: new Float32Array(fullEpisode.state)
            });
          } catch {
          }
        }
        return id;
      }
      /**
       * Store multiple episodes in batch
       */
      async storeEpisodes(episodes) {
        const ids = [];
        for (const episode of episodes) {
          const id = await this.storeEpisode(episode);
          ids.push(id);
        }
        return ids;
      }
      /**
       * Retrieve an episode by ID
       */
      async getEpisode(id) {
        const episode = this.episodes.get(id);
        if (episode) {
          const idx = this.episodeOrder.indexOf(id);
          if (idx > -1) {
            this.episodeOrder.splice(idx, 1);
            this.episodeOrder.push(id);
          }
        }
        return episode ?? null;
      }
      /**
       * Search for similar episodes by state
       *
       * @param queryState - State vector to search for
       * @param k - Number of results to return
       * @returns Similar episodes sorted by similarity
       */
      async searchByState(queryState, k = 10) {
        await this.initVectorDb();
        const query = Array.isArray(queryState) ? queryState : Array.from(queryState);
        if (this.vectorDb && query.length === this.dimensions) {
          try {
            const results = await this.vectorDb.search({
              vector: new Float32Array(query),
              k
            });
            return results.map((r) => {
              const episode = this.episodes.get(r.id);
              if (!episode)
                return null;
              return {
                episode,
                similarity: 1 - r.score
                // Convert distance to similarity
              };
            }).filter((r) => r !== null);
          } catch {
          }
        }
        return this.fallbackSearch(query, k);
      }
      /**
       * Fallback similarity search using brute-force cosine similarity
       */
      fallbackSearch(query, k) {
        const results = [];
        for (const episode of this.episodes.values()) {
          if (episode.state.length !== query.length)
            continue;
          const similarity = this.cosineSimilarity(query, episode.state);
          results.push({ episode, similarity });
        }
        return results.sort((a, b) => b.similarity - a.similarity).slice(0, k);
      }
      /**
       * Compute cosine similarity between two vectors
       */
      cosineSimilarity(a, b) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
          dotProduct += a[i] * b[i];
          normA += a[i] * a[i];
          normB += b[i] * b[i];
        }
        const denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom === 0 ? 0 : dotProduct / denom;
      }
      /**
       * Store a trajectory (sequence of episodes)
       */
      async storeTrajectory(episodes, metadata) {
        const trajectoryId = this.generateId();
        const storedEpisodes = [];
        let totalReward = 0;
        for (const episode of episodes) {
          const id = await this.storeEpisode(episode);
          const stored = await this.getEpisode(id);
          if (stored) {
            storedEpisodes.push(stored);
            totalReward += stored.reward;
          }
        }
        const trajectory = {
          id: trajectoryId,
          episodes: storedEpisodes,
          totalReward,
          metadata
        };
        this.trajectories.set(trajectoryId, trajectory);
        return trajectoryId;
      }
      /**
       * Get a trajectory by ID
       */
      async getTrajectory(id) {
        return this.trajectories.get(id) ?? null;
      }
      /**
       * Get top trajectories by total reward
       */
      async getTopTrajectories(k = 10) {
        return Array.from(this.trajectories.values()).sort((a, b) => b.totalReward - a.totalReward).slice(0, k);
      }
      /**
       * Sample random episodes (for experience replay)
       */
      async sampleEpisodes(n) {
        const allEpisodes = Array.from(this.episodes.values());
        const sampled = [];
        for (let i = 0; i < Math.min(n, allEpisodes.length); i++) {
          const idx = Math.floor(Math.random() * allEpisodes.length);
          sampled.push(allEpisodes[idx]);
        }
        return sampled;
      }
      /**
       * Get database statistics
       */
      getStats() {
        return {
          episodeCount: this.episodes.size,
          trajectoryCount: this.trajectories.size,
          dimensions: this.dimensions,
          maxEpisodes: this.maxEpisodes,
          vectorDbAvailable: this.vectorDb !== null
        };
      }
      /**
       * Clear all data
       */
      clear() {
        this.episodes.clear();
        this.trajectories.clear();
        this.episodeOrder = [];
      }
      /**
       * Generate a unique ID
       */
      generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    };
    exports$1.FastAgentDB = FastAgentDB;
    function createFastAgentDB(dimensions = 128, maxEpisodes = 1e5) {
      return new FastAgentDB(dimensions, maxEpisodes);
    }
    var defaultInstance = null;
    function getDefaultAgentDB() {
      if (!defaultInstance) {
        defaultInstance = new FastAgentDB();
      }
      return defaultInstance;
    }
    exports$1.default = {
      FastAgentDB,
      createFastAgentDB,
      getDefaultAgentDB
    };
  }
});

// ../../node_modules/ruvector/dist/core/sona-wrapper.js
var require_sona_wrapper = __commonJS({
  "../../node_modules/ruvector/dist/core/sona-wrapper.js"(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.Sona = exports$1.SonaEngine = void 0;
    exports$1.isSonaAvailable = isSonaAvailable;
    function toArray(input) {
      if (Array.isArray(input))
        return input;
      return Array.from(input);
    }
    var sonaModule = null;
    var sonaLoadError = null;
    function getSonaModule() {
      if (sonaModule)
        return sonaModule;
      if (sonaLoadError)
        throw sonaLoadError;
      try {
        sonaModule = __require("@ruvector/sona");
        return sonaModule;
      } catch (e) {
        sonaLoadError = new Error(`@ruvector/sona is not installed. Install it with:
  npm install @ruvector/sona

Original error: ${e.message}`);
        throw sonaLoadError;
      }
    }
    function isSonaAvailable() {
      try {
        getSonaModule();
        return true;
      } catch {
        return false;
      }
    }
    var SonaEngine = class _SonaEngine {
      /**
       * Create a new SONA engine
       * @param hiddenDim Hidden dimension size (e.g., 256, 512, 768)
       */
      constructor(hiddenDim) {
        const mod = getSonaModule();
        this._native = new mod.SonaEngine(hiddenDim);
      }
      /**
       * Create engine with custom configuration
       * @param config SONA configuration options
       */
      static withConfig(config) {
        const mod = getSonaModule();
        const engine = new _SonaEngine(config.hiddenDim);
        engine._native = mod.SonaEngine.withConfig(config);
        return engine;
      }
      // -------------------------------------------------------------------------
      // Trajectory Recording
      // -------------------------------------------------------------------------
      /**
       * Begin recording a new trajectory
       * @param queryEmbedding Initial query embedding
       * @returns Trajectory ID for subsequent operations
       */
      beginTrajectory(queryEmbedding) {
        return this._native.beginTrajectory(toArray(queryEmbedding));
      }
      /**
       * Add a step to an active trajectory
       * @param trajectoryId Trajectory ID from beginTrajectory
       * @param activations Layer activations
       * @param attentionWeights Attention weights
       * @param reward Reward signal for this step (0.0 - 1.0)
       */
      addStep(trajectoryId, activations, attentionWeights, reward) {
        this._native.addTrajectoryStep(trajectoryId, toArray(activations), toArray(attentionWeights), reward);
      }
      /**
       * Alias for addStep for API compatibility
       */
      addTrajectoryStep(trajectoryId, activations, attentionWeights, reward) {
        this.addStep(trajectoryId, activations, attentionWeights, reward);
      }
      /**
       * Set the model route for a trajectory
       * @param trajectoryId Trajectory ID
       * @param route Model route identifier (e.g., "gpt-4", "claude-3")
       */
      setRoute(trajectoryId, route) {
        this._native.setTrajectoryRoute(trajectoryId, route);
      }
      /**
       * Add context to a trajectory
       * @param trajectoryId Trajectory ID
       * @param contextId Context identifier
       */
      addContext(trajectoryId, contextId) {
        this._native.addTrajectoryContext(trajectoryId, contextId);
      }
      /**
       * Complete a trajectory and submit for learning
       * @param trajectoryId Trajectory ID
       * @param quality Final quality score (0.0 - 1.0)
       */
      endTrajectory(trajectoryId, quality) {
        this._native.endTrajectory(trajectoryId, quality);
      }
      // -------------------------------------------------------------------------
      // LoRA Transformations
      // -------------------------------------------------------------------------
      /**
       * Apply micro-LoRA transformation (ultra-fast, ~0.1ms)
       * @param input Input vector
       * @returns Transformed output vector
       */
      applyMicroLora(input) {
        return this._native.applyMicroLora(toArray(input));
      }
      /**
       * Apply base-LoRA transformation to a specific layer
       * @param layerIdx Layer index
       * @param input Input vector
       * @returns Transformed output vector
       */
      applyBaseLora(layerIdx, input) {
        return this._native.applyBaseLora(layerIdx, toArray(input));
      }
      // -------------------------------------------------------------------------
      // Learning Control
      // -------------------------------------------------------------------------
      /**
       * Run background learning cycle if due
       * Call this periodically (e.g., every few seconds)
       * @returns Status message if learning occurred, null otherwise
       */
      tick() {
        return this._native.tick();
      }
      /**
       * Force immediate background learning cycle
       * @returns Status message with learning results
       */
      forceLearn() {
        return this._native.forceLearn();
      }
      /**
       * Flush pending instant loop updates
       */
      flush() {
        this._native.flush();
      }
      // -------------------------------------------------------------------------
      // Pattern Retrieval
      // -------------------------------------------------------------------------
      /**
       * Find similar learned patterns to a query
       * @param queryEmbedding Query embedding
       * @param k Number of patterns to return
       * @returns Array of similar patterns
       */
      findPatterns(queryEmbedding, k) {
        return this._native.findPatterns(toArray(queryEmbedding), k);
      }
      // -------------------------------------------------------------------------
      // Engine Control
      // -------------------------------------------------------------------------
      /**
       * Get engine statistics
       * @returns Statistics object
       */
      getStats() {
        const statsJson = this._native.getStats();
        return JSON.parse(statsJson);
      }
      /**
       * Enable or disable the engine
       * @param enabled Whether to enable
       */
      setEnabled(enabled) {
        this._native.setEnabled(enabled);
      }
      /**
       * Check if engine is enabled
       */
      isEnabled() {
        return this._native.isEnabled();
      }
    };
    exports$1.SonaEngine = SonaEngine;
    exports$1.Sona = {
      Engine: SonaEngine,
      isAvailable: isSonaAvailable
    };
    exports$1.default = exports$1.Sona;
  }
});

// ../../node_modules/ruvector/dist/core/index.js
var require_core = __commonJS({
  "../../node_modules/ruvector/dist/core/index.js"(exports$1) {
    var __createBinding = exports$1 && exports$1.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports$1 && exports$1.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    var __importDefault = exports$1 && exports$1.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.Sona = exports$1.agentdbFast = exports$1.attentionFallbacks = exports$1.gnnWrapper = void 0;
    __exportStar(require_gnn_wrapper(), exports$1);
    __exportStar(require_attention_fallbacks(), exports$1);
    __exportStar(require_agentdb_fast(), exports$1);
    __exportStar(require_sona_wrapper(), exports$1);
    var gnn_wrapper_1 = require_gnn_wrapper();
    Object.defineProperty(exports$1, "gnnWrapper", { enumerable: true, get: function() {
      return __importDefault(gnn_wrapper_1).default;
    } });
    var attention_fallbacks_1 = require_attention_fallbacks();
    Object.defineProperty(exports$1, "attentionFallbacks", { enumerable: true, get: function() {
      return __importDefault(attention_fallbacks_1).default;
    } });
    var agentdb_fast_1 = require_agentdb_fast();
    Object.defineProperty(exports$1, "agentdbFast", { enumerable: true, get: function() {
      return __importDefault(agentdb_fast_1).default;
    } });
    var sona_wrapper_1 = require_sona_wrapper();
    Object.defineProperty(exports$1, "Sona", { enumerable: true, get: function() {
      return __importDefault(sona_wrapper_1).default;
    } });
  }
});

// ../../node_modules/ruvector/dist/services/embedding-service.js
var require_embedding_service = __commonJS({
  "../../node_modules/ruvector/dist/services/embedding-service.js"(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.EmbeddingService = exports$1.LocalNGramProvider = exports$1.MockEmbeddingProvider = void 0;
    exports$1.createEmbeddingService = createEmbeddingService;
    exports$1.getDefaultEmbeddingService = getDefaultEmbeddingService;
    function hashText(text) {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return `h${hash.toString(36)}`;
    }
    var MockEmbeddingProvider = class {
      constructor(dimensions = 384) {
        this.name = "mock";
        this.dimensions = dimensions;
      }
      async embed(texts) {
        return texts.map((text) => {
          const embedding = [];
          let seed = 0;
          for (let i = 0; i < text.length; i++) {
            seed = (seed << 5) - seed + text.charCodeAt(i) | 0;
          }
          for (let i = 0; i < this.dimensions; i++) {
            seed = seed * 1103515245 + 12345 | 0;
            embedding.push(seed % 1e3 / 1e3 - 0.5);
          }
          const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
          return embedding.map((v) => v / (norm || 1));
        });
      }
      getDimensions() {
        return this.dimensions;
      }
    };
    exports$1.MockEmbeddingProvider = MockEmbeddingProvider;
    var LocalNGramProvider = class {
      constructor(dimensions = 256, ngramSize = 3) {
        this.name = "local-ngram";
        this.dimensions = dimensions;
        this.ngramSize = ngramSize;
      }
      async embed(texts) {
        return texts.map((text) => this.embedSingle(text));
      }
      embedSingle(text) {
        const embedding = new Array(this.dimensions).fill(0);
        const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, " ");
        for (let i = 0; i <= normalized.length - this.ngramSize; i++) {
          const ngram = normalized.slice(i, i + this.ngramSize);
          const hash = this.hashNgram(ngram);
          const idx = Math.abs(hash) % this.dimensions;
          embedding[idx] += hash > 0 ? 1 : -1;
        }
        const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
        return embedding.map((v) => v / (norm || 1));
      }
      hashNgram(ngram) {
        let hash = 0;
        for (let i = 0; i < ngram.length; i++) {
          hash = (hash << 5) - hash + ngram.charCodeAt(i) | 0;
        }
        return hash;
      }
      getDimensions() {
        return this.dimensions;
      }
    };
    exports$1.LocalNGramProvider = LocalNGramProvider;
    var EmbeddingService = class {
      constructor(config = {}) {
        this.providers = /* @__PURE__ */ new Map();
        this.cache = /* @__PURE__ */ new Map();
        this.config = {
          defaultProvider: config.defaultProvider ?? "local-ngram",
          maxCacheSize: config.maxCacheSize ?? 1e4,
          cacheTtl: config.cacheTtl ?? 36e5,
          // 1 hour
          batchSize: config.batchSize ?? 32
        };
        this.registerProvider(new LocalNGramProvider());
        this.registerProvider(new MockEmbeddingProvider());
      }
      /**
       * Register an embedding provider
       */
      registerProvider(provider) {
        this.providers.set(provider.name, provider);
      }
      /**
       * Get a registered provider
       */
      getProvider(name) {
        const providerName = name ?? this.config.defaultProvider;
        const provider = this.providers.get(providerName);
        if (!provider) {
          throw new Error(`Provider not found: ${providerName}`);
        }
        return provider;
      }
      /**
       * Generate embeddings for texts with caching
       *
       * @param texts - Texts to embed
       * @param provider - Provider name (uses default if not specified)
       * @returns Array of embeddings
       */
      async embed(texts, provider) {
        const providerInstance = this.getProvider(provider);
        const providerName = providerInstance.name;
        const now = Date.now();
        const results = new Array(texts.length).fill(null);
        const uncachedIndices = [];
        const uncachedTexts = [];
        for (let i = 0; i < texts.length; i++) {
          const cacheKey = `${providerName}:${hashText(texts[i])}`;
          const cached = this.cache.get(cacheKey);
          if (cached && now - cached.timestamp < this.config.cacheTtl) {
            results[i] = cached.embedding;
            cached.hits++;
          } else {
            uncachedIndices.push(i);
            uncachedTexts.push(texts[i]);
          }
        }
        if (uncachedTexts.length > 0) {
          const batches = [];
          for (let i = 0; i < uncachedTexts.length; i += this.config.batchSize) {
            batches.push(uncachedTexts.slice(i, i + this.config.batchSize));
          }
          let batchOffset = 0;
          for (const batch of batches) {
            const embeddings = await providerInstance.embed(batch);
            for (let j = 0; j < embeddings.length; j++) {
              const originalIndex = uncachedIndices[batchOffset + j];
              results[originalIndex] = embeddings[j];
              const cacheKey = `${providerName}:${hashText(texts[originalIndex])}`;
              this.addToCache(cacheKey, embeddings[j], now);
            }
            batchOffset += batch.length;
          }
        }
        return results;
      }
      /**
       * Generate a single embedding
       */
      async embedOne(text, provider) {
        const results = await this.embed([text], provider);
        return results[0];
      }
      /**
       * Add entry to cache with LRU eviction
       */
      addToCache(key, embedding, timestamp) {
        if (this.cache.size >= this.config.maxCacheSize) {
          let oldestKey = "";
          let oldestTime = Infinity;
          let lowestHits = Infinity;
          for (const [k, v] of this.cache.entries()) {
            if (v.hits < lowestHits || v.hits === lowestHits && v.timestamp < oldestTime) {
              oldestKey = k;
              oldestTime = v.timestamp;
              lowestHits = v.hits;
            }
          }
          if (oldestKey) {
            this.cache.delete(oldestKey);
          }
        }
        this.cache.set(key, { embedding, timestamp, hits: 0 });
      }
      /**
       * Compute cosine similarity between two embeddings
       */
      cosineSimilarity(a, b) {
        if (a.length !== b.length) {
          throw new Error("Embeddings must have same dimensions");
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
          dotProduct += a[i] * b[i];
          normA += a[i] * a[i];
          normB += b[i] * b[i];
        }
        const denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom === 0 ? 0 : dotProduct / denom;
      }
      /**
       * Find most similar texts from a corpus
       */
      async findSimilar(query, corpus, k = 5, provider) {
        const [queryEmbed, ...corpusEmbeds] = await this.embed([query, ...corpus], provider);
        const results = corpusEmbeds.map((embed, i) => ({
          text: corpus[i],
          similarity: this.cosineSimilarity(queryEmbed, embed),
          index: i
        }));
        return results.sort((a, b) => b.similarity - a.similarity).slice(0, k);
      }
      /**
       * Get cache statistics
       */
      getCacheStats() {
        let totalHits = 0;
        for (const entry of this.cache.values()) {
          totalHits += entry.hits;
        }
        return {
          size: this.cache.size,
          maxSize: this.config.maxCacheSize,
          hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0
        };
      }
      /**
       * Clear the cache
       */
      clearCache() {
        this.cache.clear();
      }
      /**
       * Get embedding dimensions for a provider
       */
      getDimensions(provider) {
        return this.getProvider(provider).getDimensions();
      }
      /**
       * List available providers
       */
      listProviders() {
        return Array.from(this.providers.keys());
      }
    };
    exports$1.EmbeddingService = EmbeddingService;
    function createEmbeddingService(config) {
      return new EmbeddingService(config);
    }
    var defaultService = null;
    function getDefaultEmbeddingService() {
      if (!defaultService) {
        defaultService = new EmbeddingService();
      }
      return defaultService;
    }
    exports$1.default = {
      EmbeddingService,
      LocalNGramProvider,
      MockEmbeddingProvider,
      createEmbeddingService,
      getDefaultEmbeddingService
    };
  }
});

// ../../node_modules/ruvector/dist/services/index.js
var require_services = __commonJS({
  "../../node_modules/ruvector/dist/services/index.js"(exports$1) {
    var __createBinding = exports$1 && exports$1.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports$1 && exports$1.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    var __importDefault = exports$1 && exports$1.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.embeddingService = void 0;
    __exportStar(require_embedding_service(), exports$1);
    var embedding_service_1 = require_embedding_service();
    Object.defineProperty(exports$1, "embeddingService", { enumerable: true, get: function() {
      return __importDefault(embedding_service_1).default;
    } });
  }
});

// ../../node_modules/ruvector/package.json
var require_package = __commonJS({
  "../../node_modules/ruvector/package.json"(exports$1, module) {
    module.exports = {
      name: "ruvector",
      version: "0.1.34",
      description: "High-performance vector database for Node.js with automatic native/WASM fallback",
      main: "dist/index.js",
      types: "dist/index.d.ts",
      bin: {
        ruvector: "./bin/cli.js"
      },
      scripts: {
        build: "tsc",
        prepublishOnly: "npm run build",
        test: "node test/integration.js"
      },
      keywords: [
        "vector",
        "database",
        "vector-database",
        "vector-search",
        "similarity-search",
        "semantic-search",
        "embeddings",
        "hnsw",
        "ann",
        "ai",
        "machine-learning",
        "rag",
        "rust",
        "wasm",
        "native",
        "ruv",
        "ruvector",
        "attention",
        "transformer",
        "flash-attention",
        "hyperbolic",
        "sona",
        "lora",
        "ewc",
        "adaptive-learning",
        "continual-learning"
      ],
      author: "ruv.io Team <info@ruv.io> (https://ruv.io)",
      homepage: "https://ruv.io",
      bugs: {
        url: "https://github.com/ruvnet/ruvector/issues"
      },
      license: "MIT",
      repository: {
        type: "git",
        url: "https://github.com/ruvnet/ruvector.git",
        directory: "npm/packages/ruvector"
      },
      dependencies: {
        "@ruvector/core": "^0.1.25",
        "@ruvector/attention": "^0.1.3",
        "@ruvector/gnn": "^0.1.22",
        "@ruvector/sona": "^0.1.4",
        chalk: "^4.1.2",
        commander: "^11.1.0",
        ora: "^5.4.1"
      },
      devDependencies: {
        "@types/node": "^20.10.5",
        typescript: "^5.3.3"
      },
      engines: {
        node: ">=14.0.0"
      }
    };
  }
});

// ../../node_modules/ruvector/dist/index.js
var require_dist = __commonJS({
  "../../node_modules/ruvector/dist/index.js"(exports$1) {
    var __createBinding = exports$1 && exports$1.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports$1 && exports$1.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.VectorDB = exports$1.VectorDb = void 0;
    exports$1.getImplementationType = getImplementationType;
    exports$1.isNative = isNative;
    exports$1.isWasm = isWasm;
    exports$1.getVersion = getVersion;
    __exportStar(require_types(), exports$1);
    __exportStar(require_core(), exports$1);
    __exportStar(require_services(), exports$1);
    var implementation;
    var implementationType = "wasm";
    try {
      implementation = __require("@ruvector/core");
      implementationType = "native";
      if (typeof implementation.VectorDb !== "function") {
        throw new Error("Native module loaded but VectorDb not found");
      }
    } catch (e) {
      throw new Error(`Failed to load ruvector native module.
Error: ${e.message}

Supported platforms:
- Linux x64/ARM64
- macOS Intel/Apple Silicon
- Windows x64

If you're on a supported platform, try:
  npm install --force @ruvector/core`);
    }
    function getImplementationType() {
      return implementationType;
    }
    function isNative() {
      return implementationType === "native";
    }
    function isWasm() {
      return implementationType === "wasm";
    }
    function getVersion() {
      const pkg = require_package();
      return {
        version: pkg.version,
        implementation: implementationType
      };
    }
    exports$1.VectorDb = implementation.VectorDb;
    exports$1.VectorDB = implementation.VectorDb;
    exports$1.default = implementation;
  }
});

// src/pure/types.ts
var PredictionIntervalImpl = class {
  constructor(point, lower, upper, alpha, quantile, timestamp = Date.now()) {
    this.point = point;
    this.lower = lower;
    this.upper = upper;
    this.alpha = alpha;
    this.quantile = quantile;
    this.timestamp = timestamp;
  }
  width() {
    return this.upper - this.lower;
  }
  contains(value) {
    return value >= this.lower && value <= this.upper;
  }
  relativeWidth() {
    if (Math.abs(this.point) < Number.EPSILON) {
      return Infinity;
    }
    return this.width() / Math.abs(this.point) * 100;
  }
  coverage() {
    return 1 - this.alpha;
  }
};
var defaultPredictorConfig = {
  alpha: 0.1,
  calibrationSize: 2e3,
  maxIntervalWidthPct: 5,
  recalibrationFreq: 100
};
var defaultAdaptiveConfig = {
  targetCoverage: 0.9,
  gamma: 0.02,
  coverageWindow: 200,
  alphaMin: 0.01,
  alphaMax: 0.3
};

// src/pure/scores.ts
var AbsoluteScore = class {
  score(prediction, actual) {
    return Math.abs(actual - prediction);
  }
  interval(prediction, quantile) {
    return [prediction - quantile, prediction + quantile];
  }
};
var NormalizedScore = class {
  constructor(stdDev = 1) {
    this.stdDev = stdDev;
  }
  score(prediction, actual) {
    return Math.abs(actual - prediction) / Math.max(this.stdDev, 1e-6);
  }
  interval(prediction, quantile) {
    const width = quantile * this.stdDev;
    return [prediction - width, prediction + width];
  }
  /** Update standard deviation estimate */
  updateStdDev(stdDev) {
    this.stdDev = Math.max(stdDev, 1e-6);
  }
};
var QuantileScore = class {
  constructor(alphaLow = 0.05, alphaHigh = 0.95) {
    if (alphaLow < 0 || alphaLow >= alphaHigh || alphaHigh > 1) {
      throw new Error("Invalid quantile values");
    }
  }
  score(prediction, actual) {
    const half = prediction * 0.05;
    return Math.max(prediction - half - actual, actual - (prediction + half));
  }
  interval(prediction, quantile) {
    return [prediction - quantile, prediction + quantile];
  }
  /**
   * Compute score for quantile predictions
   */
  scoreQuantiles(qLow, qHigh, actual) {
    return Math.max(qLow - actual, actual - qHigh);
  }
};

// src/pure/conformal.ts
var SplitConformalPredictor = class {
  constructor(config = {}, scoreFunction) {
    this.calibrationScores = [];
    this.quantile = 0;
    this.nCalibration = 0;
    this.predictionCount = 0;
    const fullConfig = { ...defaultPredictorConfig, ...config };
    this.alpha = fullConfig.alpha;
    this.calibrationSize = fullConfig.calibrationSize;
    this.recalibrationFreq = fullConfig.recalibrationFreq;
    this.scoreFunction = scoreFunction || new AbsoluteScore();
  }
  /**
   * Calibrate the predictor with historical data
   * O(n log n) due to sorting
   *
   * @param predictions - Model's point predictions
   * @param actuals - Actual observed values
   */
  async calibrate(predictions, actuals) {
    if (predictions.length !== actuals.length) {
      throw new Error("Predictions and actuals must have same length");
    }
    if (predictions.length === 0) {
      throw new Error("At least one calibration sample required");
    }
    const scores = [];
    for (let i = 0; i < predictions.length; i++) {
      const score = this.scoreFunction.score(predictions[i], actuals[i]);
      scores.push(score);
    }
    scores.sort((a, b) => a - b);
    this.calibrationScores = scores;
    this.nCalibration = scores.length;
    this.updateQuantile();
  }
  /**
   * Make a prediction with a confidence interval
   * O(1) time after calibration
   *
   * @param pointPrediction - Model's point prediction
   * @returns PredictionInterval with bounds
   */
  predict(pointPrediction) {
    if (this.nCalibration === 0) {
      throw new Error("Predictor not calibrated");
    }
    const [lower, upper] = this.scoreFunction.interval(pointPrediction, this.quantile);
    const interval = new PredictionIntervalImpl(
      pointPrediction,
      lower,
      upper,
      this.alpha,
      this.quantile
    );
    this.predictionCount++;
    return interval;
  }
  /**
   * Update predictor with new observation
   * O(log n) via binary search insertion
   *
   * @param prediction - Model's point prediction
   * @param actual - Actual observed value
   */
  async update(prediction, actual) {
    const score = this.scoreFunction.score(prediction, actual);
    const insertPos = this.binarySearchInsertPosition(score);
    this.calibrationScores.splice(insertPos, 0, score);
    if (this.calibrationScores.length > this.calibrationSize) {
      this.calibrationScores.shift();
    }
    this.nCalibration = this.calibrationScores.length;
    this.updateQuantile();
  }
  /**
   * Trigger full recalibration if needed
   */
  async recalibrate(predictions, actuals) {
    if (this.predictionCount % this.recalibrationFreq === 0) {
      await this.calibrate(predictions, actuals);
      this.predictionCount = 0;
    }
  }
  /**
   * Get empirical coverage from calibration set
   */
  getEmpiricalCoverage(predictions, actuals) {
    if (predictions.length === 0) return 0;
    let covered = 0;
    for (let i = 0; i < predictions.length; i++) {
      const interval = this.predict(predictions[i]);
      if (interval.contains(actuals[i])) {
        covered++;
      }
    }
    return covered / predictions.length;
  }
  /**
   * Get calibration statistics
   */
  getStats() {
    return {
      nCalibration: this.nCalibration,
      alpha: this.alpha,
      quantile: this.quantile,
      predictionCount: this.predictionCount,
      minScore: this.calibrationScores[0] ?? 0,
      maxScore: this.calibrationScores[this.nCalibration - 1] ?? 0
    };
  }
  /**
   * Update the quantile threshold based on sorted scores
   * Follows: q = ceil((n+1)(1-alpha))/n
   * @private
   */
  updateQuantile() {
    if (this.nCalibration === 0) {
      this.quantile = 0;
      return;
    }
    const index = Math.ceil((this.nCalibration + 1) * (1 - this.alpha)) - 1;
    const clampedIndex = Math.max(0, Math.min(index, this.nCalibration - 1));
    this.quantile = this.calibrationScores[clampedIndex];
  }
  /**
   * Find binary search insertion position
   * @private
   */
  binarySearchInsertPosition(score) {
    let left = 0;
    let right = this.calibrationScores.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.calibrationScores[mid] < score) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return left;
  }
};
var AdaptiveConformalPredictor = class {
  constructor(config = {}, scoreFunction) {
    this.coverageHistory = [];
    const fullConfig = { ...defaultAdaptiveConfig, ...config };
    this.targetCoverage = fullConfig.targetCoverage;
    this.gamma = fullConfig.gamma;
    this.coverageWindow = fullConfig.coverageWindow;
    this.alphaMin = fullConfig.alphaMin;
    this.alphaMax = fullConfig.alphaMax;
    this.scoreFunction = scoreFunction || new AbsoluteScore();
    this.alphaCurrent = 1 - this.targetCoverage;
    this.basePredictorConfig = {
      alpha: this.alphaCurrent
    };
    this.basePredictor = new SplitConformalPredictor(
      this.basePredictorConfig,
      this.scoreFunction
    );
  }
  /**
   * Initialize with calibration data
   *
   * @param predictions - Initial predictions for calibration
   * @param actuals - Actual values for calibration
   */
  async calibrate(predictions, actuals) {
    await this.basePredictor.calibrate(predictions, actuals);
  }
  /**
   * Make prediction and adapt alpha based on coverage
   * O(log n) with binary search
   *
   * @param pointPrediction - Model's point prediction
   * @param actual - Optional actual value for adaptation
   * @returns PredictionInterval
   */
  async predictAndAdapt(pointPrediction, actual) {
    const interval = this.basePredictor.predict(pointPrediction);
    if (actual !== void 0) {
      const covered = interval.contains(actual) ? 1 : 0;
      this.coverageHistory.push(covered);
      if (this.coverageHistory.length > this.coverageWindow) {
        this.coverageHistory.shift();
      }
      const empirical = this.empiricalCoverage();
      const error = this.targetCoverage - empirical;
      this.alphaCurrent -= this.gamma * error;
      this.alphaCurrent = Math.max(this.alphaMin, Math.min(this.alphaMax, this.alphaCurrent));
      const updatedConfig = { ...this.basePredictorConfig, alpha: this.alphaCurrent };
      this.basePredictor = new SplitConformalPredictor(updatedConfig, this.scoreFunction);
      await this.basePredictor.update(pointPrediction, actual);
    }
    return interval;
  }
  /**
   * Standard prediction without adaptation
   *
   * @param pointPrediction - Model's point prediction
   * @returns PredictionInterval
   */
  predict(pointPrediction) {
    return this.basePredictor.predict(pointPrediction);
  }
  /**
   * Update predictor with new observation
   *
   * @param prediction - Model's point prediction
   * @param actual - Actual observed value
   */
  async update(prediction, actual) {
    await this.basePredictor.update(prediction, actual);
  }
  /**
   * Compute empirical coverage from history
   * Simple average of coverage indicator in the window
   */
  empiricalCoverage() {
    if (this.coverageHistory.length === 0) {
      return this.targetCoverage;
    }
    const sum = this.coverageHistory.reduce((a, b) => a + b, 0);
    return sum / this.coverageHistory.length;
  }
  /**
   * Get current alpha value
   */
  getCurrentAlpha() {
    return this.alphaCurrent;
  }
  /**
   * Get statistics including coverage metrics
   */
  getStats() {
    const empirical = this.empiricalCoverage();
    return {
      ...this.basePredictor.getStats(),
      alphaCurrent: this.alphaCurrent,
      empiricalCoverage: empirical,
      targetCoverage: this.targetCoverage,
      coverageDifference: this.targetCoverage - empirical,
      coverageHistorySize: this.coverageHistory.length
    };
  }
};
var CQRPredictor = class {
  constructor(config = {}, alphaLow = 0.05, alphaHigh = 0.95, scoreFunction) {
    this.calibrationScores = [];
    this.quantile = 0;
    this.nCalibration = 0;
    if (alphaLow < 0 || alphaLow >= alphaHigh || alphaHigh > 1) {
      throw new Error("Invalid quantile values");
    }
    const fullConfig = { ...defaultPredictorConfig, ...config };
    this.alpha = fullConfig.alpha;
    this.calibrationSize = fullConfig.calibrationSize;
    this.scoreFunction = scoreFunction || new AbsoluteScore();
    this.alphaLow = alphaLow;
    this.alphaHigh = alphaHigh;
  }
  /**
   * Calibrate with quantile predictions
   *
   * @param qLow - Lower quantile predictions
   * @param qHigh - Upper quantile predictions
   * @param actuals - Actual observed values
   */
  async calibrate(qLow, qHigh, actuals) {
    if (qLow.length !== qHigh.length || qLow.length !== actuals.length) {
      throw new Error("All arrays must have same length");
    }
    if (qLow.length === 0) {
      throw new Error("At least one calibration sample required");
    }
    const scores = [];
    for (let i = 0; i < qLow.length; i++) {
      const score = Math.max(qLow[i] - actuals[i], actuals[i] - qHigh[i]);
      scores.push(score);
    }
    scores.sort((a, b) => a - b);
    this.calibrationScores = scores;
    this.nCalibration = scores.length;
    this.updateQuantile();
  }
  /**
   * Make CQR prediction with adjusted quantile bounds
   *
   * @param qLow - Lower quantile prediction from model
   * @param qHigh - Upper quantile prediction from model
   * @returns PredictionInterval with adjusted bounds
   */
  predict(qLow, qHigh) {
    if (this.nCalibration === 0) {
      throw new Error("Predictor not calibrated");
    }
    const lower = qLow - this.quantile;
    const upper = qHigh + this.quantile;
    const point = (qLow + qHigh) / 2;
    return new PredictionIntervalImpl(point, lower, upper, this.alpha, this.quantile);
  }
  /**
   * Update with new observation
   *
   * @param qLow - Lower quantile prediction
   * @param qHigh - Upper quantile prediction
   * @param actual - Actual observed value
   */
  async update(qLow, qHigh, actual) {
    const score = Math.max(qLow - actual, actual - qHigh);
    const insertPos = this.binarySearchInsertPosition(score);
    this.calibrationScores.splice(insertPos, 0, score);
    if (this.calibrationScores.length > this.calibrationSize) {
      this.calibrationScores.shift();
    }
    this.nCalibration = this.calibrationScores.length;
    this.updateQuantile();
  }
  /**
   * Get statistics
   */
  getStats() {
    return {
      nCalibration: this.nCalibration,
      alpha: this.alpha,
      alphaLow: this.alphaLow,
      alphaHigh: this.alphaHigh,
      quantile: this.quantile,
      minScore: this.calibrationScores[0] ?? 0,
      maxScore: this.calibrationScores[this.nCalibration - 1] ?? 0
    };
  }
  /**
   * Update quantile threshold
   * @private
   */
  updateQuantile() {
    if (this.nCalibration === 0) {
      this.quantile = 0;
      return;
    }
    const index = Math.ceil((this.nCalibration + 1) * (1 - this.alpha)) - 1;
    const clampedIndex = Math.max(0, Math.min(index, this.nCalibration - 1));
    this.quantile = this.calibrationScores[clampedIndex];
  }
  /**
   * Binary search insertion position
   * @private
   */
  binarySearchInsertPosition(score) {
    let left = 0;
    let right = this.calibrationScores.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.calibrationScores[mid] < score) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return left;
  }
};

// src/factory.ts
async function detectImplementations() {
  const available = /* @__PURE__ */ new Set();
  available.add("pure");
  try {
    if (typeof globalThis !== "undefined") {
    }
  } catch (e) {
  }
  try {
    const nativeModule = __require("@neural-trader/predictor-native");
    if (nativeModule) {
      available.add("native");
    }
  } catch (e) {
  }
  return available;
}
async function selectImplementation(options) {
  if (options.implementation && options.implementation !== "auto") {
    return options.implementation;
  }
  const available = await detectImplementations();
  if (options.preferNative && available.has("native")) {
    return "native";
  }
  if (options.fallbackToWasm && available.has("wasm")) {
    return "wasm";
  }
  if (available.has("native")) {
    return "native";
  }
  if (available.has("wasm")) {
    return "wasm";
  }
  return "pure";
}
async function createPredictor(config = {}, scoreFunction) {
  const implementation = await selectImplementation(config);
  let predictor;
  if (implementation === "native") {
    try {
      const { NativeConformalPredictor } = await lazyLoadNative();
      predictor = new NativeConformalPredictor(
        { alpha: config.alpha },
        scoreFunction
      );
      return { predictor, type: "native" };
    } catch (e) {
      console.warn("Failed to load native implementation, falling back to WASM", e);
    }
  }
  if (implementation === "wasm" || implementation === "native") {
    try {
      const { WasmConformalPredictor } = await lazyLoadWasm();
      predictor = new WasmConformalPredictor(
        { alpha: config.alpha },
        scoreFunction
      );
      return { predictor, type: "wasm" };
    } catch (e) {
      console.warn("Failed to load WASM implementation, falling back to pure JS", e);
    }
  }
  predictor = new SplitConformalPredictor(
    { alpha: config.alpha },
    scoreFunction
  );
  return { predictor, type: "pure" };
}
async function createAdaptivePredictor(config = {}, scoreFunction) {
  const implementation = await selectImplementation(config);
  let predictor;
  if (implementation === "native") {
    try {
      const { NativeAdaptiveConformalPredictor } = await lazyLoadNative();
      predictor = new NativeAdaptiveConformalPredictor(
        {
          targetCoverage: config.targetCoverage,
          gamma: config.gamma
        },
        scoreFunction
      );
      return { predictor, type: "native" };
    } catch (e) {
      console.warn("Failed to load native implementation, falling back to WASM", e);
    }
  }
  if (implementation === "wasm" || implementation === "native") {
    try {
      const { WasmAdaptiveConformalPredictor } = await lazyLoadWasm();
      predictor = new WasmAdaptiveConformalPredictor(
        {
          targetCoverage: config.targetCoverage,
          gamma: config.gamma
        },
        scoreFunction
      );
      return { predictor, type: "wasm" };
    } catch (e) {
      console.warn("Failed to load WASM implementation, falling back to pure JS", e);
    }
  }
  predictor = new AdaptiveConformalPredictor(
    {
      targetCoverage: config.targetCoverage,
      gamma: config.gamma
    },
    scoreFunction
  );
  return { predictor, type: "pure" };
}
async function lazyLoadNative() {
  if (typeof globalThis !== "undefined" && typeof __require !== "undefined") {
    try {
      return await import('@neural-trader/predictor-native');
    } catch (e) {
      throw new Error("Native implementation not available");
    }
  }
  throw new Error("Native implementation not available in this environment");
}
async function lazyLoadWasm() {
  try {
    if (typeof globalThis !== "undefined") {
      const wasmModule = await import('../wasm-pkg/index.js');
      return wasmModule;
    }
    throw new Error("WASM not available in this environment");
  } catch (e) {
    throw new Error("WASM implementation not available");
  }
}
async function detectAvailableImplementations() {
  const available = await detectImplementations();
  return Array.from(available);
}
function getImplementationInfo(type) {
  const info = {
    native: {
      name: "Native (NAPI-rs)",
      description: "High-performance Rust implementation via Node.js native addon",
      performance: "~1x (baseline, fastest)"
    },
    wasm: {
      name: "WebAssembly (Rust compiled to WASM)",
      description: "Good performance with smaller bundle size than native",
      performance: "~1-2x slower than native"
    },
    pure: {
      name: "Pure TypeScript",
      description: "Pure JavaScript implementation with no external dependencies",
      performance: "~5-10x slower than native"
    }
  };
  return info[type];
}

// src/enhanced-pattern-engine.ts
var import_ruvector = __toESM(require_dist());
var EnhancedPatternEngine = class {
  constructor() {
    this.dimension = 384;
    this.db = new import_ruvector.VectorDB({
      dimension: this.dimension,
      metric: "cosine",
      path: "./data/patterns/enhanced.db",
      autoPersist: true,
      hnsw: {
        m: 16,
        // Connections per node (16 = balanced)
        efConstruction: 200,
        // Build quality (higher = better but slower build)
        efSearch: 100
        // Search quality (higher = better but slower search)
      }
    });
    this.gnn = new RuvectorLayer(this.dimension, 512, 4, 0.1);
    this.compressor = new TensorCompress();
  }
  /**
   * Learn from prediction outcome with GNN enhancement
   *
   * Access frequency determines compression level:
   * - 0.9+ (hot): No compression (recent profitable patterns)
   * - 0.7-0.9 (warm): FP16 (active patterns)
   * - 0.3-0.7 (cool): PQ8 (occasional patterns)
   * - 0.1-0.3 (cold): PQ4 (rare patterns)
   * - <0.1 (archive): Binary quantization (historical patterns)
   *
   * @param pattern - Market pattern with embedding and metadata
   * @param actualOutcome - Actual market outcome
   * @param predictedOutcome - Predicted market outcome
   */
  async learnFromPrediction(pattern, actualOutcome, predictedOutcome) {
    const accuracy = 1 - Math.abs(actualOutcome - predictedOutcome) / Math.abs(actualOutcome);
    const neighbors = this.db.search({
      vector: pattern.embedding,
      k: 5,
      threshold: 0.7
      // Cosine similarity >= 0.7
    });
    let enhancedEmbedding = pattern.embedding;
    if (neighbors.length > 0) {
      const neighborEmbeddings = neighbors.map((n) => n.vector);
      const edgeWeights = neighbors.map((n) => 1 - n.distance);
      enhancedEmbedding = this.gnn.forward(
        pattern.embedding,
        neighborEmbeddings,
        edgeWeights
      );
    }
    const accessFreq = accuracy > 0.8 ? 0.9 : (
      // Hot: profitable patterns
      accuracy > 0.6 ? 0.7 : (
        // Warm: decent patterns
        accuracy > 0.4 ? 0.5 : (
          // Cool: mediocre patterns
          accuracy > 0.2 ? 0.2 : (
            // Cold: poor patterns
            0.05
          )
        )
      )
    );
    const compressed = this.compressor.compress(enhancedEmbedding, accessFreq);
    this.db.insert({
      id: `pattern_${Date.now()}_${pattern.metadata.symbol}`,
      vector: enhancedEmbedding,
      metadata: {
        ...pattern.metadata,
        accuracy,
        compressed,
        // CompressedPattern from @ruvector/compress
        gnnEnhanced: neighbors.length > 0,
        neighborCount: neighbors.length,
        compressionLevel: this.getCompressionLevel(accessFreq)
      }
    });
    const stats = this.db.stats();
    if (stats.size % 1e3 === 0) {
      this.db.buildIndex();
      console.log(`[PatternEngine] Rebuilt HNSW index at ${stats.size} patterns`);
    }
  }
  /**
   * Find similar patterns with HNSW (61µs average latency)
   *
   * @param currentPattern - Current market pattern embedding
   * @param k - Number of similar patterns to return
   * @param regime - Optional market regime filter
   * @returns Array of similar patterns with similarity scores
   */
  async findSimilarPatterns(currentPattern, k = 10, regime) {
    const results = this.db.search({
      vector: currentPattern,
      k,
      threshold: 0.6
    });
    const filtered = regime ? results.filter((r) => r.metadata?.regime === regime) : results;
    return filtered.map((r) => ({
      pattern: {
        embedding: r.vector,
        metadata: r.metadata
      },
      similarity: 1 - r.distance / 2
      // Cosine distance -> similarity
    }));
  }
  /**
   * Batch insertion for backtesting (fast bulk loading)
   *
   * Performance: 10,000 patterns/sec
   *
   * @param patterns - Array of market patterns to load
   */
  async bulkLoadPatterns(patterns) {
    const entries = patterns.map((p, i) => ({
      id: `bulk_${Date.now()}_${i}`,
      vector: p.embedding,
      metadata: p.metadata
    }));
    this.db.insertBatch(entries);
    this.db.buildIndex();
  }
  /**
   * Optimize database (compression + defragmentation)
   */
  async optimize() {
    this.db.optimize();
    this.db.save();
  }
  /**
   * Get compression tier from access frequency
   *
   * @param accessFreq - Access frequency (0-1)
   * @returns Compression level name
   */
  getCompressionLevel(accessFreq) {
    if (accessFreq >= 0.9) return "hot_none";
    if (accessFreq >= 0.7) return "warm_fp16";
    if (accessFreq >= 0.3) return "cool_pq8";
    if (accessFreq >= 0.1) return "cold_pq4";
    return "archive_binary";
  }
  /**
   * Get database statistics
   *
   * @returns Database stats including size, dimension, and index status
   */
  getStats() {
    return this.db.stats();
  }
  /**
   * Save database to disk
   */
  save() {
    this.db.save();
  }
  /**
   * Load database from disk
   */
  load() {
    this.db.load();
  }
  /**
   * Clear all patterns from database
   */
  clear() {
    this.db.clear();
  }
};
var HNSWPresets = {
  /**
   * High-accuracy predictions (slower build, faster search)
   * Use for: Production trading, high-frequency strategies
   */
  highAccuracy: {
    m: 32,
    efConstruction: 400,
    efSearch: 200
  },
  /**
   * Balanced (default)
   * Use for: General purpose, most applications
   */
  balanced: {
    m: 16,
    efConstruction: 200,
    efSearch: 100
  },
  /**
   * Fast insertion (faster build, acceptable search)
   * Use for: Backtesting, rapid prototyping
   */
  fastInsertion: {
    m: 8,
    efConstruction: 100,
    efSearch: 50
  }
};
var CompressionInfo = {
  hot_none: { size: 1536, reduction: "1x", description: "Full float32" },
  warm_fp16: { size: 768, reduction: "2x", description: "FP16 compression" },
  cool_pq8: { size: 96, reduction: "16x", description: "PQ8 + codebook" },
  cold_pq4: { size: 48, reduction: "32x", description: "PQ4 + codebook" },
  archive_binary: { size: 48, reduction: "32x", description: "Binary quantization" }
};

export { AbsoluteScore, AdaptiveConformalPredictor, CQRPredictor, CompressionInfo, EnhancedPatternEngine, HNSWPresets, NormalizedScore, PredictionIntervalImpl, QuantileScore, SplitConformalPredictor, createAdaptivePredictor, createPredictor, defaultAdaptiveConfig, defaultPredictorConfig, detectAvailableImplementations, getImplementationInfo };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map