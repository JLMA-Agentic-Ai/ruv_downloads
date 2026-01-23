"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CypherBatchSchema: () => CypherBatchSchema,
  CypherGenerator: () => CypherGenerator,
  CypherStatementSchema: () => CypherStatementSchema,
  EmbeddingEnrichment: () => EmbeddingEnrichment,
  EntityRelationshipGenerator: () => EntityRelationshipGenerator,
  EntityRelationshipOptionsSchema: () => EntityRelationshipOptionsSchema,
  GraphDataGenerator: () => GraphDataGenerator,
  GraphDataSchema: () => GraphDataSchema,
  GraphEdgeSchema: () => GraphEdgeSchema,
  GraphGenerationError: () => GraphGenerationError,
  GraphGenerationResultSchema: () => GraphGenerationResultSchema,
  GraphNodeSchema: () => GraphNodeSchema,
  KnowledgeGraphGenerator: () => KnowledgeGraphGenerator,
  KnowledgeGraphOptionsSchema: () => KnowledgeGraphOptionsSchema,
  OpenRouterClient: () => OpenRouterClient,
  OpenRouterConfigSchema: () => OpenRouterConfigSchema,
  OpenRouterError: () => OpenRouterError,
  SocialNetworkGenerator: () => SocialNetworkGenerator,
  SocialNetworkOptionsSchema: () => SocialNetworkOptionsSchema,
  TemporalEventOptionsSchema: () => TemporalEventOptionsSchema,
  TemporalEventsGenerator: () => TemporalEventsGenerator,
  ValidationError: () => ValidationError,
  createCypherGenerator: () => createCypherGenerator,
  createEmbeddingEnrichment: () => createEmbeddingEnrichment,
  createEntityRelationshipGenerator: () => createEntityRelationshipGenerator,
  createGraphDataGenerator: () => createGraphDataGenerator,
  createKnowledgeGraphGenerator: () => createKnowledgeGraphGenerator,
  createOpenRouterClient: () => createOpenRouterClient,
  createSocialNetworkGenerator: () => createSocialNetworkGenerator,
  createTemporalEventsGenerator: () => createTemporalEventsGenerator,
  default: () => index_default,
  validateCypherBatch: () => validateCypherBatch,
  validateEntityRelationshipOptions: () => validateEntityRelationshipOptions,
  validateGraphData: () => validateGraphData,
  validateGraphGenerationResult: () => validateGraphGenerationResult,
  validateKnowledgeGraphOptions: () => validateKnowledgeGraphOptions,
  validateSocialNetworkOptions: () => validateSocialNetworkOptions,
  validateTemporalEventOptions: () => validateTemporalEventOptions
});
module.exports = __toCommonJS(index_exports);
var import_config = require("dotenv/config");

// src/openrouter-client.ts
var import_p_retry = __toESM(require("p-retry"), 1);
var import_p_throttle = __toESM(require("p-throttle"), 1);

// src/types.ts
var import_zod = require("zod");
var OpenRouterConfigSchema = import_zod.z.object({
  apiKey: import_zod.z.string(),
  model: import_zod.z.string().optional().default("moonshot/kimi-k2-instruct"),
  baseURL: import_zod.z.string().optional().default("https://openrouter.ai/api/v1"),
  timeout: import_zod.z.number().optional().default(6e4),
  maxRetries: import_zod.z.number().optional().default(3),
  rateLimit: import_zod.z.object({
    requests: import_zod.z.number(),
    interval: import_zod.z.number()
  }).optional()
});
var GraphGenerationError = class extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "GraphGenerationError";
  }
};
var OpenRouterError = class extends GraphGenerationError {
  constructor(message, details) {
    super(message, "OPENROUTER_ERROR", details);
    this.name = "OpenRouterError";
  }
};
var ValidationError = class extends GraphGenerationError {
  constructor(message, details) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
};

// src/openrouter-client.ts
var OpenRouterClient = class {
  config;
  throttledFetch;
  constructor(config = {}) {
    const apiKey = config.apiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key is required. Set OPENROUTER_API_KEY environment variable or pass apiKey in config.");
    }
    this.config = OpenRouterConfigSchema.parse({ ...config, apiKey });
    if (this.config.rateLimit) {
      this.throttledFetch = (0, import_p_throttle.default)({
        limit: this.config.rateLimit.requests,
        interval: this.config.rateLimit.interval
      })(fetch.bind(globalThis));
    } else {
      this.throttledFetch = fetch.bind(globalThis);
    }
  }
  /**
   * Create a chat completion
   */
  async createCompletion(messages, options = {}) {
    const request = {
      model: this.config.model || "moonshot/kimi-k2-instruct",
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4096,
      top_p: options.top_p ?? 1,
      stream: false,
      ...options
    };
    return (0, import_p_retry.default)(
      async () => {
        const response = await this.throttledFetch(
          `${this.config.baseURL}/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${this.config.apiKey}`,
              "HTTP-Referer": "https://github.com/ruvnet/ruvector",
              "X-Title": "RuVector Graph Data Generator"
            },
            body: JSON.stringify(request),
            signal: AbortSignal.timeout(this.config.timeout || 6e4)
          }
        );
        if (!response.ok) {
          const error = await response.text();
          throw new OpenRouterError(
            `OpenRouter API error: ${response.status} ${response.statusText}`,
            { status: response.status, error }
          );
        }
        const data = await response.json();
        return data;
      },
      {
        retries: this.config.maxRetries || 3,
        onFailedAttempt: (error) => {
          console.warn(`Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`);
        }
      }
    );
  }
  /**
   * Create a streaming chat completion
   */
  async *createStreamingCompletion(messages, options = {}) {
    const request = {
      model: this.config.model || "moonshot/kimi-k2-instruct",
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4096,
      top_p: options.top_p ?? 1,
      stream: true,
      ...options
    };
    const response = await this.throttledFetch(
      `${this.config.baseURL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
          "HTTP-Referer": "https://github.com/ruvnet/ruvector",
          "X-Title": "RuVector Graph Data Generator"
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout || 6e4)
      }
    );
    if (!response.ok) {
      const error = await response.text();
      throw new OpenRouterError(
        `OpenRouter API error: ${response.status} ${response.statusText}`,
        { status: response.status, error }
      );
    }
    if (!response.body) {
      throw new OpenRouterError("No response body received");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.warn("Failed to parse SSE data:", data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  /**
   * Generate structured data using prompt engineering
   */
  async generateStructured(systemPrompt, userPrompt, options) {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    const response = await this.createCompletion(messages, {
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new OpenRouterError("No content in response");
    }
    try {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(content);
    } catch (e) {
      throw new OpenRouterError("Failed to parse JSON from response", { content, error: e });
    }
  }
  /**
   * Generate embeddings (if the model supports it)
   */
  async generateEmbedding(_text) {
    throw new Error("Embedding generation not yet implemented for Kimi K2");
  }
  /**
   * Update configuration
   */
  configure(config) {
    this.config = OpenRouterConfigSchema.parse({ ...this.config, ...config });
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
};
function createOpenRouterClient(config) {
  return new OpenRouterClient(config);
}

// src/generators/knowledge-graph.ts
var DEFAULT_ENTITY_TYPES = [
  "Person",
  "Organization",
  "Location",
  "Event",
  "Concept",
  "Technology",
  "Product"
];
var DEFAULT_RELATIONSHIP_TYPES = [
  "WORKS_FOR",
  "LOCATED_IN",
  "CREATED_BY",
  "PART_OF",
  "RELATED_TO",
  "INFLUENCES",
  "DEPENDS_ON"
];
var KnowledgeGraphGenerator = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Generate a knowledge graph
   */
  async generate(options) {
    const startTime = Date.now();
    const entities = await this.generateEntities(options);
    const relationships = await this.generateRelationships(entities, options);
    const nodes = entities.map((entity, idx) => ({
      id: entity.id || `entity_${idx}`,
      labels: [entity.type || "Entity"],
      properties: {
        name: entity.name,
        ...entity.properties
      }
    }));
    const edges = relationships.map((rel, idx) => ({
      id: `rel_${idx}`,
      type: rel.type,
      source: rel.source,
      target: rel.target,
      properties: rel.properties || {}
    }));
    const data = {
      nodes,
      edges,
      metadata: {
        domain: options.domain,
        generated_at: /* @__PURE__ */ new Date(),
        total_nodes: nodes.length,
        total_edges: edges.length
      }
    };
    return {
      data,
      metadata: {
        generated_at: /* @__PURE__ */ new Date(),
        model: this.client.getConfig().model || "moonshot/kimi-k2-instruct",
        duration: Date.now() - startTime
      }
    };
  }
  /**
   * Generate entities for the knowledge graph
   */
  async generateEntities(options) {
    const entityTypes = options.entityTypes || DEFAULT_ENTITY_TYPES;
    const systemPrompt = `You are an expert knowledge graph architect. Generate realistic entities for a knowledge graph about ${options.domain}.`;
    const userPrompt = `Generate ${options.entities} diverse entities for a knowledge graph about ${options.domain}.

Entity types to include: ${entityTypes.join(", ")}

For each entity, provide:
- id: unique identifier (use snake_case)
- name: entity name
- type: one of the specified entity types
- properties: relevant properties (at least 2-3 properties per entity)

Return a JSON array of entities. Make them realistic and relevant to ${options.domain}.

Example format:
\`\`\`json
[
  {
    "id": "john_doe",
    "name": "John Doe",
    "type": "Person",
    "properties": {
      "role": "Software Engineer",
      "expertise": "AI/ML",
      "years_experience": 5
    }
  }
]
\`\`\``;
    const entities = await this.client.generateStructured(systemPrompt, userPrompt, {
      temperature: 0.8,
      maxTokens: Math.min(8e3, options.entities * 100)
    });
    return entities;
  }
  /**
   * Generate relationships between entities
   */
  async generateRelationships(entities, options) {
    const relationshipTypes = options.relationshipTypes || DEFAULT_RELATIONSHIP_TYPES;
    const systemPrompt = `You are an expert at creating meaningful relationships in knowledge graphs. Create realistic relationships that make sense for ${options.domain}.`;
    const entityList = entities.slice(0, 50).map((e) => `- ${e.id}: ${e.name} (${e.type})`).join("\n");
    const userPrompt = `Given these entities from a ${options.domain} knowledge graph:

${entityList}

Generate ${options.relationships} meaningful relationships between them.

Relationship types to use: ${relationshipTypes.join(", ")}

For each relationship, provide:
- source: source entity id
- target: target entity id
- type: relationship type (use one of the specified types)
- properties: optional properties describing the relationship

Return a JSON array of relationships. Make them logical and realistic.

Example format:
\`\`\`json
[
  {
    "source": "john_doe",
    "target": "acme_corp",
    "type": "WORKS_FOR",
    "properties": {
      "since": "2020",
      "position": "Senior Engineer"
    }
  }
]
\`\`\``;
    const relationships = await this.client.generateStructured(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: Math.min(8e3, options.relationships * 80)
    });
    return relationships;
  }
  /**
   * Generate knowledge triples (subject-predicate-object)
   */
  async generateTriples(domain, count) {
    const systemPrompt = `You are an expert at extracting knowledge triples from domains. Generate meaningful subject-predicate-object triples about ${domain}.`;
    const userPrompt = `Generate ${count} knowledge triples about ${domain}.

Each triple should have:
- subject: the entity or concept
- predicate: the relationship or property
- object: the related entity, value, or concept
- confidence: confidence score (0-1)

Return a JSON array of triples.

Example format:
\`\`\`json
[
  {
    "subject": "Einstein",
    "predicate": "developed",
    "object": "Theory of Relativity",
    "confidence": 1.0
  }
]
\`\`\``;
    return this.client.generateStructured(
      systemPrompt,
      userPrompt,
      { temperature: 0.7, maxTokens: count * 100 }
    );
  }
};
function createKnowledgeGraphGenerator(client) {
  return new KnowledgeGraphGenerator(client);
}

// src/generators/social-network.ts
var SocialNetworkGenerator = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Generate a social network graph
   */
  async generate(options) {
    const startTime = Date.now();
    const users = await this.generateUsers(options);
    const connections = await this.generateConnections(users, options);
    const nodes = users.map((user) => ({
      id: user.id,
      labels: ["User"],
      properties: {
        username: user.username,
        ...user.profile,
        ...user.metadata || {}
      }
    }));
    const edges = connections.map((conn, idx) => ({
      id: `connection_${idx}`,
      type: conn.type || "FOLLOWS",
      source: conn.source,
      target: conn.target,
      properties: conn.properties || {}
    }));
    const data = {
      nodes,
      edges,
      metadata: {
        domain: "social-network",
        generated_at: /* @__PURE__ */ new Date(),
        total_nodes: nodes.length,
        total_edges: edges.length
      }
    };
    return {
      data,
      metadata: {
        generated_at: /* @__PURE__ */ new Date(),
        model: this.client.getConfig().model || "moonshot/kimi-k2-instruct",
        duration: Date.now() - startTime
      }
    };
  }
  /**
   * Generate realistic social network users
   */
  async generateUsers(options) {
    const systemPrompt = "You are an expert at creating realistic social network user profiles. Generate diverse, believable users.";
    const userPrompt = `Generate ${options.users} realistic social network user profiles.

Each user should have:
- id: unique user ID (format: user_XXXXX)
- username: unique username
- profile: object with name, bio, joined (ISO date), followers (number), following (number)
${options.includeMetadata ? "- metadata: additional information like interests, location, verified status" : ""}

Make the profiles diverse and realistic. Return a JSON array.

Example format:
\`\`\`json
[
  {
    "id": "user_12345",
    "username": "tech_enthusiast_42",
    "profile": {
      "name": "Alex Johnson",
      "bio": "Software developer passionate about AI and open source",
      "joined": "2020-03-15T00:00:00Z",
      "followers": 1250,
      "following": 430
    }${options.includeMetadata ? `,
    "metadata": {
      "interests": ["technology", "AI", "coding"],
      "location": "San Francisco, CA",
      "verified": false
    }` : ""}
  }
]
\`\`\``;
    return this.client.generateStructured(
      systemPrompt,
      userPrompt,
      {
        temperature: 0.9,
        maxTokens: Math.min(8e3, options.users * 150)
      }
    );
  }
  /**
   * Generate connections between users
   */
  async generateConnections(users, options) {
    const totalConnections = Math.floor(options.users * options.avgConnections / 2);
    const systemPrompt = `You are an expert at modeling social network connections. Create realistic ${options.networkType || "random"} network patterns.`;
    const userList = users.slice(0, 100).map((u) => `- ${u.id}: @${u.username}`).join("\n");
    const userPrompt = `Given these social network users:

${userList}

Generate ${totalConnections} connections creating a ${options.networkType || "random"} network structure.

${this.getNetworkTypeGuidance(options.networkType)}

Each connection should have:
- source: user id who initiates the connection
- target: user id being connected to
- type: connection type (FOLLOWS, FRIEND, BLOCKS, MUTES)
- properties: optional properties like since (ISO date), strength (0-1)

Return a JSON array of connections.

Example format:
\`\`\`json
[
  {
    "source": "user_12345",
    "target": "user_67890",
    "type": "FOLLOWS",
    "properties": {
      "since": "2021-06-15T00:00:00Z",
      "strength": 0.8
    }
  }
]
\`\`\``;
    return this.client.generateStructured(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: Math.min(8e3, totalConnections * 80)
    });
  }
  /**
   * Get guidance for network type
   */
  getNetworkTypeGuidance(networkType) {
    switch (networkType) {
      case "small-world":
        return "Create clusters of highly connected users with occasional bridges between clusters (small-world property).";
      case "scale-free":
        return "Create a power-law distribution where a few users have many connections (influencers) and most have few connections.";
      case "clustered":
        return "Create distinct communities/clusters with high internal connectivity and sparse connections between clusters.";
      default:
        return "Create random connections with varying connection strengths.";
    }
  }
  /**
   * Analyze network properties
   */
  async analyzeNetwork(data) {
    const degrees = /* @__PURE__ */ new Map();
    for (const edge of data.edges) {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
    }
    const degreeValues = Array.from(degrees.values());
    const avgDegree = degreeValues.reduce((a, b) => a + b, 0) / degreeValues.length;
    const maxDegree = Math.max(...degreeValues);
    return {
      avgDegree,
      maxDegree
    };
  }
};
function createSocialNetworkGenerator(client) {
  return new SocialNetworkGenerator(client);
}

// src/generators/temporal-events.ts
var TemporalEventsGenerator = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Generate temporal event graph data
   */
  async generate(options) {
    const startTime = Date.now();
    const events = await this.generateEvents(options);
    const entities = await this.generateEntities(events, options);
    const eventNodes = events.map((event) => ({
      id: event.id,
      labels: ["Event", event.type],
      properties: {
        type: event.type,
        timestamp: event.timestamp.toISOString(),
        ...event.properties
      }
    }));
    const entityNodes = entities.map((entity) => ({
      id: entity.id,
      labels: ["Entity", entity.type],
      properties: entity.properties
    }));
    const edges = [];
    let edgeId = 0;
    for (const event of events) {
      for (const entityId of event.entities) {
        edges.push({
          id: `edge_${edgeId++}`,
          type: "INVOLVES",
          source: event.id,
          target: entityId,
          properties: {
            timestamp: event.timestamp.toISOString()
          }
        });
      }
      if (event.relationships) {
        for (const rel of event.relationships) {
          edges.push({
            id: `edge_${edgeId++}`,
            type: rel.type,
            source: event.id,
            target: rel.target,
            properties: {
              timestamp: event.timestamp.toISOString()
            }
          });
        }
      }
    }
    const sortedEvents = [...events].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      edges.push({
        id: `edge_${edgeId++}`,
        type: "NEXT",
        source: sortedEvents[i].id,
        target: sortedEvents[i + 1].id,
        properties: {
          time_diff_ms: sortedEvents[i + 1].timestamp.getTime() - sortedEvents[i].timestamp.getTime()
        }
      });
    }
    const data = {
      nodes: [...eventNodes, ...entityNodes],
      edges,
      metadata: {
        domain: "temporal-events",
        generated_at: /* @__PURE__ */ new Date(),
        total_nodes: eventNodes.length + entityNodes.length,
        total_edges: edges.length
      }
    };
    return {
      data,
      metadata: {
        generated_at: /* @__PURE__ */ new Date(),
        model: this.client.getConfig().model || "moonshot/kimi-k2-instruct",
        duration: Date.now() - startTime
      }
    };
  }
  /**
   * Generate temporal events
   */
  async generateEvents(options) {
    const startDate = new Date(options.startDate);
    const endDate = new Date(options.endDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24));
    const totalEvents = (options.eventsPerDay || 10) * daysDiff;
    const systemPrompt = "You are an expert at generating realistic temporal event sequences. Create events that follow logical patterns and causality.";
    const userPrompt = `Generate ${totalEvents} temporal events between ${startDate.toISOString()} and ${endDate.toISOString()}.

Event types to include: ${options.eventTypes.join(", ")}

Each event should have:
- id: unique event ID (format: event_XXXXX)
- type: one of the specified event types
- timestamp: ISO 8601 timestamp within the date range
- entities: array of entity IDs involved (format: entity_XXXXX)
- properties: relevant properties for the event
- relationships: (optional) array of relationships to other events/entities

Create realistic temporal patterns (e.g., business hours for work events, clustering of related events).

Return a JSON array sorted by timestamp.

Example format:
\`\`\`json
[
  {
    "id": "event_00001",
    "type": "login",
    "timestamp": "2024-01-15T09:23:15Z",
    "entities": ["entity_user_001"],
    "properties": {
      "ip_address": "192.168.1.100",
      "device": "desktop",
      "success": true
    },
    "relationships": [
      {
        "type": "TRIGGERED_BY",
        "target": "entity_user_001"
      }
    ]
  }
]
\`\`\``;
    const events = await this.client.generateStructured(
      systemPrompt,
      userPrompt,
      {
        temperature: 0.8,
        maxTokens: Math.min(8e3, totalEvents * 150)
      }
    );
    return events.map((event) => ({
      ...event,
      timestamp: new Date(event.timestamp)
    }));
  }
  /**
   * Generate entities from events
   */
  async generateEntities(events, options) {
    const uniqueEntityIds = /* @__PURE__ */ new Set();
    events.forEach((event) => {
      event.entities.forEach((entityId) => uniqueEntityIds.add(entityId));
    });
    const entityIds = Array.from(uniqueEntityIds);
    const entityCount = options.entities || entityIds.length;
    const systemPrompt = "You are an expert at creating entity profiles for event-driven systems.";
    const sampleIds = entityIds.slice(0, 50).join(", ");
    const userPrompt = `Generate ${entityCount} entity profiles for entities involved in temporal events.

Sample entity IDs that must be included: ${sampleIds}

Each entity should have:
- id: the entity ID
- type: entity type (User, System, Device, Service, etc.)
- properties: relevant properties for the entity

Return a JSON array of entities.

Example format:
\`\`\`json
[
  {
    "id": "entity_user_001",
    "type": "User",
    "properties": {
      "name": "Alice Smith",
      "email": "alice@example.com",
      "role": "developer",
      "created_at": "2023-01-15T00:00:00Z"
    }
  }
]
\`\`\``;
    return this.client.generateStructured(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: Math.min(8e3, entityCount * 100)
    });
  }
  /**
   * Analyze temporal patterns
   */
  async analyzeTemporalPatterns(events) {
    const eventsPerHour = {};
    const eventTypeDistribution = {};
    const timeDiffs = [];
    const sortedEvents = [...events].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const hour = event.timestamp.toISOString().substring(0, 13);
      eventsPerHour[hour] = (eventsPerHour[hour] || 0) + 1;
      eventTypeDistribution[event.type] = (eventTypeDistribution[event.type] || 0) + 1;
      if (i > 0) {
        timeDiffs.push(
          event.timestamp.getTime() - sortedEvents[i - 1].timestamp.getTime()
        );
      }
    }
    const avgTimeBetweenEvents = timeDiffs.length > 0 ? timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length : 0;
    return {
      eventsPerHour,
      eventTypeDistribution,
      avgTimeBetweenEvents
    };
  }
};
function createTemporalEventsGenerator(client) {
  return new TemporalEventsGenerator(client);
}

// src/generators/entity-relationships.ts
var EntityRelationshipGenerator = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Generate entity-relationship graph
   */
  async generate(options) {
    const startTime = Date.now();
    const entities = await this.generateEntities(options);
    const relationships = await this.generateRelationships(entities, options);
    const nodes = entities.map((entity) => ({
      id: entity.id,
      labels: entity.labels || ["Entity"],
      properties: entity.properties
    }));
    const edges = relationships.map((rel, idx) => ({
      id: `rel_${idx}`,
      type: rel.type,
      source: rel.source,
      target: rel.target,
      properties: rel.properties || {}
    }));
    const data = {
      nodes,
      edges,
      metadata: {
        domain: options.domain,
        generated_at: /* @__PURE__ */ new Date(),
        total_nodes: nodes.length,
        total_edges: edges.length
      }
    };
    return {
      data,
      metadata: {
        generated_at: /* @__PURE__ */ new Date(),
        model: this.client.getConfig().model || "moonshot/kimi-k2-instruct",
        duration: Date.now() - startTime
      }
    };
  }
  /**
   * Generate domain-specific entities
   */
  async generateEntities(options) {
    const systemPrompt = `You are an expert in ${options.domain} domain modeling. Generate realistic entities following best practices for ${options.domain} data models.`;
    const schemaInfo = options.entitySchema ? `

Entity schema to follow:
${JSON.stringify(options.entitySchema, null, 2)}` : "";
    const userPrompt = `Generate ${options.entityCount} diverse entities for a ${options.domain} domain model.${schemaInfo}

Each entity should have:
- id: unique identifier (use snake_case)
- labels: array of entity type labels (e.g., ["Product", "Digital"])
- properties: object with entity properties (at least 3-5 meaningful properties)

Make entities realistic and relevant to ${options.domain}. Include variety in types and attributes.

Return a JSON array of entities.

Example format:
\`\`\`json
[
  {
    "id": "product_laptop_001",
    "labels": ["Product", "Electronics", "Computer"],
    "properties": {
      "name": "UltraBook Pro 15",
      "category": "Laptops",
      "price": 1299.99,
      "brand": "TechCorp",
      "release_date": "2024-01-15",
      "stock": 45,
      "rating": 4.7
    }
  }
]
\`\`\``;
    return this.client.generateStructured(systemPrompt, userPrompt, {
      temperature: 0.8,
      maxTokens: Math.min(8e3, options.entityCount * 150)
    });
  }
  /**
   * Generate relationships between entities
   */
  async generateRelationships(entities, options) {
    const maxPossibleRelationships = entities.length * (entities.length - 1);
    const targetRelationships = Math.floor(maxPossibleRelationships * options.relationshipDensity);
    const relationshipTypes = options.relationshipTypes || [
      "RELATES_TO",
      "PART_OF",
      "DEPENDS_ON",
      "SIMILAR_TO",
      "CONTAINS"
    ];
    const systemPrompt = `You are an expert in ${options.domain} domain modeling. Create meaningful, realistic relationships between entities.`;
    const entityList = entities.slice(0, 100).map(
      (e) => `- ${e.id} (${e.labels.join(", ")}): ${JSON.stringify(e.properties).substring(0, 100)}`
    ).join("\n");
    const userPrompt = `Given these entities from a ${options.domain} domain:

${entityList}

Generate ${targetRelationships} meaningful relationships between them.

Relationship types to use: ${relationshipTypes.join(", ")}

Each relationship should have:
- source: source entity id
- target: target entity id
- type: relationship type (use UPPER_SNAKE_CASE)
- properties: optional properties describing the relationship

Make relationships logical and realistic for ${options.domain}. Avoid creating too many relationships from/to the same entity.

Return a JSON array of relationships.

Example format:
\`\`\`json
[
  {
    "source": "product_laptop_001",
    "target": "category_electronics",
    "type": "BELONGS_TO",
    "properties": {
      "primary": true,
      "added_date": "2024-01-15"
    }
  }
]
\`\`\``;
    return this.client.generateStructured(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: Math.min(8e3, targetRelationships * 80)
    });
  }
  /**
   * Generate schema-aware entities and relationships
   */
  async generateWithSchema(schema, count) {
    const systemPrompt = "You are an expert at generating synthetic data that conforms to strict schemas.";
    const userPrompt = `Generate ${count} instances of entities and relationships following this exact schema:

${JSON.stringify(schema, null, 2)}

Return a JSON object with:
- nodes: array of entities matching the entity types in the schema
- edges: array of relationships matching the relationship types in the schema

Ensure all properties match their specified types and all relationships connect valid entity types.

Example format:
\`\`\`json
{
  "nodes": [...],
  "edges": [...]
}
\`\`\``;
    return this.client.generateStructured(
      systemPrompt,
      userPrompt,
      {
        temperature: 0.7,
        maxTokens: Math.min(8e3, count * 200)
      }
    );
  }
  /**
   * Analyze entity-relationship patterns
   */
  async analyzeERPatterns(data) {
    const entityTypeDistribution = {};
    const relationshipTypeDistribution = {};
    const entityDegrees = /* @__PURE__ */ new Map();
    for (const node of data.nodes) {
      for (const label of node.labels) {
        entityTypeDistribution[label] = (entityTypeDistribution[label] || 0) + 1;
      }
    }
    for (const edge of data.edges) {
      relationshipTypeDistribution[edge.type] = (relationshipTypeDistribution[edge.type] || 0) + 1;
      entityDegrees.set(edge.source, (entityDegrees.get(edge.source) || 0) + 1);
      entityDegrees.set(edge.target, (entityDegrees.get(edge.target) || 0) + 1);
    }
    const degrees = Array.from(entityDegrees.values());
    const avgRelationshipsPerEntity = degrees.length > 0 ? degrees.reduce((a, b) => a + b, 0) / degrees.length : 0;
    const maxPossibleEdges = data.nodes.length * (data.nodes.length - 1);
    const densityScore = maxPossibleEdges > 0 ? data.edges.length / maxPossibleEdges : 0;
    return {
      entityTypeDistribution,
      relationshipTypeDistribution,
      avgRelationshipsPerEntity,
      densityScore
    };
  }
};
function createEntityRelationshipGenerator(client) {
  return new EntityRelationshipGenerator(client);
}

// src/cypher-generator.ts
var CypherGenerator = class {
  /**
   * Generate Cypher statements from graph data
   */
  generate(data) {
    const statements = [];
    for (const node of data.nodes) {
      statements.push(this.generateNodeStatement(node));
    }
    for (const edge of data.edges) {
      statements.push(this.generateEdgeStatement(edge));
    }
    const labels = /* @__PURE__ */ new Set();
    const relationshipTypes = /* @__PURE__ */ new Set();
    data.nodes.forEach((node) => node.labels.forEach((label) => labels.add(label)));
    data.edges.forEach((edge) => relationshipTypes.add(edge.type));
    return {
      statements,
      metadata: {
        total_nodes: data.nodes.length,
        total_relationships: data.edges.length,
        labels: Array.from(labels),
        relationship_types: Array.from(relationshipTypes)
      }
    };
  }
  /**
   * Generate CREATE statement for a node
   */
  generateNodeStatement(node) {
    const labels = node.labels.map((l) => `:${this.escapeLabel(l)}`).join("");
    const propsVar = "props";
    return {
      query: `CREATE (n${labels} $${propsVar})`,
      parameters: {
        [propsVar]: {
          id: node.id,
          ...node.properties,
          ...node.embedding ? { embedding: node.embedding } : {}
        }
      }
    };
  }
  /**
   * Generate CREATE statement for an edge
   */
  generateEdgeStatement(edge) {
    const type = this.escapeLabel(edge.type);
    const propsVar = "props";
    return {
      query: `
        MATCH (source { id: $sourceId })
        MATCH (target { id: $targetId })
        CREATE (source)-[r:${type} $${propsVar}]->(target)
      `.trim(),
      parameters: {
        sourceId: edge.source,
        targetId: edge.target,
        [propsVar]: {
          id: edge.id,
          ...edge.properties,
          ...edge.embedding ? { embedding: edge.embedding } : {}
        }
      }
    };
  }
  /**
   * Generate MERGE statements (upsert)
   */
  generateMergeStatements(data) {
    const statements = [];
    for (const node of data.nodes) {
      statements.push(this.generateNodeMergeStatement(node));
    }
    for (const edge of data.edges) {
      statements.push(this.generateEdgeMergeStatement(edge));
    }
    const labels = /* @__PURE__ */ new Set();
    const relationshipTypes = /* @__PURE__ */ new Set();
    data.nodes.forEach((node) => node.labels.forEach((label) => labels.add(label)));
    data.edges.forEach((edge) => relationshipTypes.add(edge.type));
    return {
      statements,
      metadata: {
        total_nodes: data.nodes.length,
        total_relationships: data.edges.length,
        labels: Array.from(labels),
        relationship_types: Array.from(relationshipTypes)
      }
    };
  }
  /**
   * Generate MERGE statement for a node
   */
  generateNodeMergeStatement(node) {
    const primaryLabel = node.labels[0];
    const additionalLabels = node.labels.slice(1).map((l) => `:${this.escapeLabel(l)}`).join("");
    const propsVar = "props";
    return {
      query: `
        MERGE (n:${this.escapeLabel(primaryLabel)} { id: $id })
        SET n${additionalLabels}
        SET n += $${propsVar}
      `.trim(),
      parameters: {
        id: node.id,
        [propsVar]: {
          ...node.properties,
          ...node.embedding ? { embedding: node.embedding } : {}
        }
      }
    };
  }
  /**
   * Generate MERGE statement for an edge
   */
  generateEdgeMergeStatement(edge) {
    const type = this.escapeLabel(edge.type);
    const propsVar = "props";
    return {
      query: `
        MATCH (source { id: $sourceId })
        MATCH (target { id: $targetId })
        MERGE (source)-[r:${type} { id: $id }]->(target)
        SET r += $${propsVar}
      `.trim(),
      parameters: {
        sourceId: edge.source,
        targetId: edge.target,
        id: edge.id,
        [propsVar]: {
          ...edge.properties,
          ...edge.embedding ? { embedding: edge.embedding } : {}
        }
      }
    };
  }
  /**
   * Generate index creation statements
   */
  generateIndexStatements(data) {
    const statements = [];
    const labels = /* @__PURE__ */ new Set();
    data.nodes.forEach((node) => node.labels.forEach((label) => labels.add(label)));
    for (const label of labels) {
      statements.push({
        query: `CREATE INDEX IF NOT EXISTS FOR (n:${this.escapeLabel(label)}) ON (n.id)`
      });
    }
    const hasEmbeddings = data.nodes.some((node) => node.embedding);
    if (hasEmbeddings) {
      for (const label of labels) {
        statements.push({
          query: `
            CREATE VECTOR INDEX IF NOT EXISTS ${this.escapeLabel(label)}_embedding
            FOR (n:${this.escapeLabel(label)})
            ON (n.embedding)
            OPTIONS {
              indexConfig: {
                \`vector.dimensions\`: ${data.nodes.find((n) => n.embedding)?.embedding?.length || 1536},
                \`vector.similarity_function\`: 'cosine'
              }
            }
          `.trim()
        });
      }
    }
    return statements;
  }
  /**
   * Generate constraint creation statements
   */
  generateConstraintStatements(data) {
    const statements = [];
    const labels = /* @__PURE__ */ new Set();
    data.nodes.forEach((node) => node.labels.forEach((label) => labels.add(label)));
    for (const label of labels) {
      statements.push({
        query: `CREATE CONSTRAINT IF NOT EXISTS FOR (n:${this.escapeLabel(label)}) REQUIRE n.id IS UNIQUE`
      });
    }
    return statements;
  }
  /**
   * Generate complete setup script
   */
  generateSetupScript(data, options) {
    const statements = [];
    if (options?.useConstraints !== false) {
      statements.push("// Create constraints");
      this.generateConstraintStatements(data).forEach((stmt) => {
        statements.push(this.formatStatement(stmt) + ";");
      });
      statements.push("");
    }
    if (options?.useIndexes !== false) {
      statements.push("// Create indexes");
      this.generateIndexStatements(data).forEach((stmt) => {
        statements.push(this.formatStatement(stmt) + ";");
      });
      statements.push("");
    }
    statements.push("// Create data");
    const batch = options?.useMerge ? this.generateMergeStatements(data) : this.generate(data);
    batch.statements.forEach((stmt) => {
      statements.push(this.formatStatement(stmt) + ";");
    });
    return statements.join("\n");
  }
  /**
   * Format a statement for output
   */
  formatStatement(stmt) {
    if (!stmt.parameters || Object.keys(stmt.parameters).length === 0) {
      return stmt.query;
    }
    let formatted = stmt.query;
    for (const [key, value] of Object.entries(stmt.parameters)) {
      const jsonValue = JSON.stringify(value);
      formatted = formatted.replace(new RegExp(`\\$${key}\\b`, "g"), jsonValue);
    }
    return formatted;
  }
  /**
   * Escape label names for Cypher
   */
  escapeLabel(label) {
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(label)) {
      return label;
    }
    return `\`${label.replace(/`/g, "``")}\``;
  }
  /**
   * Generate batch insert with transactions
   */
  generateBatchInsert(data, batchSize = 1e3) {
    const statements = [];
    for (let i = 0; i < data.nodes.length; i += batchSize) {
      const batch = data.nodes.slice(i, i + batchSize);
      statements.push({
        query: `
          UNWIND $nodes AS node
          CREATE (n)
          SET n = node.properties
          SET n.id = node.id
          WITH n, node.labels AS labels
          CALL apoc.create.addLabels(n, labels) YIELD node AS labeled
          RETURN count(labeled)
        `.trim(),
        parameters: {
          nodes: batch.map((node) => ({
            id: node.id,
            labels: node.labels,
            properties: node.properties
          }))
        }
      });
    }
    for (let i = 0; i < data.edges.length; i += batchSize) {
      const batch = data.edges.slice(i, i + batchSize);
      statements.push({
        query: `
          UNWIND $edges AS edge
          MATCH (source { id: edge.source })
          MATCH (target { id: edge.target })
          CALL apoc.create.relationship(source, edge.type, edge.properties, target) YIELD rel
          RETURN count(rel)
        `.trim(),
        parameters: {
          edges: batch.map((edge) => ({
            source: edge.source,
            target: edge.target,
            type: edge.type,
            properties: edge.properties
          }))
        }
      });
    }
    return statements;
  }
};
function createCypherGenerator() {
  return new CypherGenerator();
}

// src/embedding-enrichment.ts
var EmbeddingEnrichment = class {
  constructor(client, config = {}) {
    this.client = client;
    this.config = {
      provider: "openrouter",
      dimensions: 1536,
      batchSize: 100,
      ...config
    };
  }
  config;
  /**
   * Enrich graph data with vector embeddings
   */
  async enrichGraphData(data) {
    const enrichedNodes = await this.enrichNodes(data.nodes);
    const enrichedEdges = await this.enrichEdges(data.edges);
    return {
      ...data,
      nodes: enrichedNodes,
      edges: enrichedEdges
    };
  }
  /**
   * Enrich nodes with embeddings
   */
  async enrichNodes(nodes) {
    const enriched = [];
    for (let i = 0; i < nodes.length; i += this.config.batchSize) {
      const batch = nodes.slice(i, i + this.config.batchSize);
      const batchResults = await Promise.all(
        batch.map((node) => this.generateNodeEmbedding(node))
      );
      enriched.push(...batchResults);
    }
    return enriched;
  }
  /**
   * Enrich edges with embeddings
   */
  async enrichEdges(edges) {
    const enriched = [];
    for (let i = 0; i < edges.length; i += this.config.batchSize) {
      const batch = edges.slice(i, i + this.config.batchSize);
      const batchResults = await Promise.all(
        batch.map((edge) => this.generateEdgeEmbedding(edge))
      );
      enriched.push(...batchResults);
    }
    return enriched;
  }
  /**
   * Generate embedding for a node
   */
  async generateNodeEmbedding(node) {
    const text = this.nodeToText(node);
    const embedding = await this.generateEmbedding(text);
    return {
      ...node,
      embedding: embedding.embedding
    };
  }
  /**
   * Generate embedding for an edge
   */
  async generateEdgeEmbedding(edge) {
    const text = this.edgeToText(edge);
    const embedding = await this.generateEmbedding(text);
    return {
      ...edge,
      embedding: embedding.embedding
    };
  }
  /**
   * Convert node to text for embedding
   */
  nodeToText(node) {
    const parts = [];
    parts.push(`Type: ${node.labels.join(", ")}`);
    for (const [key, value] of Object.entries(node.properties)) {
      if (typeof value === "string" || typeof value === "number") {
        parts.push(`${key}: ${value}`);
      }
    }
    return parts.join(". ");
  }
  /**
   * Convert edge to text for embedding
   */
  edgeToText(edge) {
    const parts = [];
    parts.push(`Relationship: ${edge.type}`);
    for (const [key, value] of Object.entries(edge.properties)) {
      if (typeof value === "string" || typeof value === "number") {
        parts.push(`${key}: ${value}`);
      }
    }
    return parts.join(". ");
  }
  /**
   * Generate embedding using OpenRouter or local model
   */
  async generateEmbedding(text) {
    if (this.config.provider === "local") {
      return this.generateLocalEmbedding(text);
    }
    const embedding = await this.generateSemanticEmbedding(text);
    return {
      embedding,
      model: this.config.model || "moonshot/kimi-k2-instruct",
      dimensions: embedding.length
    };
  }
  /**
   * Generate semantic embedding using chat model
   */
  async generateSemanticEmbedding(text) {
    const systemPrompt = `You are a semantic encoder. Convert the input text into a semantic representation by analyzing its key concepts, entities, and relationships. Output ONLY a JSON array of ${this.config.dimensions} floating point numbers between -1 and 1 representing the semantic vector.`;
    const userPrompt = `Encode this text into a ${this.config.dimensions}-dimensional semantic vector:

${text}`;
    try {
      const response = await this.client.createCompletion(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        {
          temperature: 0.3,
          max_tokens: this.config.dimensions * 10
        }
      );
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in embedding response");
      }
      const match = content.match(/\[([\s\S]*?)\]/);
      if (match) {
        const embedding = JSON.parse(`[${match[1]}]`);
        if (embedding.length !== this.config.dimensions) {
          return this.generateRandomEmbedding();
        }
        return embedding;
      }
      return this.generateRandomEmbedding();
    } catch (error) {
      console.warn("Failed to generate semantic embedding, using random:", error);
      return this.generateRandomEmbedding();
    }
  }
  /**
   * Generate local embedding (placeholder)
   */
  async generateLocalEmbedding(_text) {
    return {
      embedding: this.generateRandomEmbedding(),
      model: "local",
      dimensions: this.config.dimensions
    };
  }
  /**
   * Generate random embedding (fallback)
   */
  generateRandomEmbedding() {
    const embedding = [];
    for (let i = 0; i < this.config.dimensions; i++) {
      embedding.push(Math.random() * 2 - 1);
    }
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map((val) => val / magnitude);
  }
  /**
   * Calculate similarity between embeddings
   */
  calculateSimilarity(embedding1, embedding2, metric = "cosine") {
    if (embedding1.length !== embedding2.length) {
      throw new Error("Embeddings must have the same dimensions");
    }
    switch (metric) {
      case "cosine":
        return this.cosineSimilarity(embedding1, embedding2);
      case "euclidean":
        return this.euclideanDistance(embedding1, embedding2);
      case "dot":
        return this.dotProduct(embedding1, embedding2);
      default:
        return this.cosineSimilarity(embedding1, embedding2);
    }
  }
  /**
   * Calculate cosine similarity
   */
  cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  /**
   * Calculate Euclidean distance
   */
  euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }
  /**
   * Calculate dot product
   */
  dotProduct(a, b) {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }
  /**
   * Find similar nodes using embeddings
   */
  findSimilarNodes(node, allNodes, topK = 10, metric = "cosine") {
    if (!node.embedding) {
      throw new Error("Node does not have an embedding");
    }
    const similarities = allNodes.filter((n) => n.id !== node.id && n.embedding).map((n) => ({
      node: n,
      similarity: this.calculateSimilarity(node.embedding, n.embedding, metric)
    })).sort((a, b) => b.similarity - a.similarity).slice(0, topK);
    return similarities;
  }
};
function createEmbeddingEnrichment(client, config) {
  return new EmbeddingEnrichment(client, config);
}

// src/schemas/index.ts
var import_zod2 = require("zod");
var GraphNodeSchema = import_zod2.z.object({
  id: import_zod2.z.string(),
  labels: import_zod2.z.array(import_zod2.z.string()),
  properties: import_zod2.z.record(import_zod2.z.string(), import_zod2.z.unknown()),
  embedding: import_zod2.z.array(import_zod2.z.number()).optional()
});
var GraphEdgeSchema = import_zod2.z.object({
  id: import_zod2.z.string(),
  type: import_zod2.z.string(),
  source: import_zod2.z.string(),
  target: import_zod2.z.string(),
  properties: import_zod2.z.record(import_zod2.z.string(), import_zod2.z.unknown()),
  embedding: import_zod2.z.array(import_zod2.z.number()).optional()
});
var GraphDataSchema = import_zod2.z.object({
  nodes: import_zod2.z.array(GraphNodeSchema),
  edges: import_zod2.z.array(GraphEdgeSchema),
  metadata: import_zod2.z.object({
    domain: import_zod2.z.string().optional(),
    generated_at: import_zod2.z.date().optional(),
    model: import_zod2.z.string().optional(),
    total_nodes: import_zod2.z.number().optional(),
    total_edges: import_zod2.z.number().optional()
  }).optional()
});
var KnowledgeGraphOptionsSchema = import_zod2.z.object({
  domain: import_zod2.z.string(),
  entities: import_zod2.z.number().positive(),
  relationships: import_zod2.z.number().positive(),
  entityTypes: import_zod2.z.array(import_zod2.z.string()).optional(),
  relationshipTypes: import_zod2.z.array(import_zod2.z.string()).optional(),
  includeEmbeddings: import_zod2.z.boolean().optional(),
  embeddingDimension: import_zod2.z.number().positive().optional()
});
var SocialNetworkOptionsSchema = import_zod2.z.object({
  users: import_zod2.z.number().positive(),
  avgConnections: import_zod2.z.number().positive(),
  networkType: import_zod2.z.enum(["random", "small-world", "scale-free", "clustered"]).optional(),
  communities: import_zod2.z.number().positive().optional(),
  includeMetadata: import_zod2.z.boolean().optional(),
  includeEmbeddings: import_zod2.z.boolean().optional()
});
var TemporalEventOptionsSchema = import_zod2.z.object({
  startDate: import_zod2.z.union([import_zod2.z.date(), import_zod2.z.string()]),
  endDate: import_zod2.z.union([import_zod2.z.date(), import_zod2.z.string()]),
  eventTypes: import_zod2.z.array(import_zod2.z.string()),
  eventsPerDay: import_zod2.z.number().positive().optional(),
  entities: import_zod2.z.number().positive().optional(),
  includeEmbeddings: import_zod2.z.boolean().optional()
});
var EntityRelationshipOptionsSchema = import_zod2.z.object({
  domain: import_zod2.z.string(),
  entityCount: import_zod2.z.number().positive(),
  relationshipDensity: import_zod2.z.number().min(0).max(1),
  entitySchema: import_zod2.z.record(import_zod2.z.string(), import_zod2.z.unknown()).optional(),
  relationshipTypes: import_zod2.z.array(import_zod2.z.string()).optional(),
  includeEmbeddings: import_zod2.z.boolean().optional()
});
var CypherStatementSchema = import_zod2.z.object({
  query: import_zod2.z.string(),
  parameters: import_zod2.z.record(import_zod2.z.string(), import_zod2.z.unknown()).optional()
});
var CypherBatchSchema = import_zod2.z.object({
  statements: import_zod2.z.array(CypherStatementSchema),
  metadata: import_zod2.z.object({
    total_nodes: import_zod2.z.number().optional(),
    total_relationships: import_zod2.z.number().optional(),
    labels: import_zod2.z.array(import_zod2.z.string()).optional(),
    relationship_types: import_zod2.z.array(import_zod2.z.string()).optional()
  }).optional()
});
var GraphGenerationResultSchema = import_zod2.z.object({
  data: GraphDataSchema,
  metadata: import_zod2.z.object({
    generated_at: import_zod2.z.date(),
    model: import_zod2.z.string(),
    duration: import_zod2.z.number(),
    token_usage: import_zod2.z.object({
      prompt_tokens: import_zod2.z.number(),
      completion_tokens: import_zod2.z.number(),
      total_tokens: import_zod2.z.number()
    }).optional()
  }),
  cypher: CypherBatchSchema.optional()
});
function validateGraphData(data) {
  return GraphDataSchema.parse(data);
}
function validateKnowledgeGraphOptions(options) {
  return KnowledgeGraphOptionsSchema.parse(options);
}
function validateSocialNetworkOptions(options) {
  return SocialNetworkOptionsSchema.parse(options);
}
function validateTemporalEventOptions(options) {
  return TemporalEventOptionsSchema.parse(options);
}
function validateEntityRelationshipOptions(options) {
  return EntityRelationshipOptionsSchema.parse(options);
}
function validateCypherBatch(batch) {
  return CypherBatchSchema.parse(batch);
}
function validateGraphGenerationResult(result) {
  return GraphGenerationResultSchema.parse(result);
}

// src/index.ts
var GraphDataGenerator = class {
  client;
  knowledgeGraphGen;
  socialNetworkGen;
  temporalEventsGen;
  entityRelationshipGen;
  cypherGen;
  embeddingEnrichment;
  constructor(config = {}) {
    this.client = createOpenRouterClient(config);
    this.knowledgeGraphGen = createKnowledgeGraphGenerator(this.client);
    this.socialNetworkGen = createSocialNetworkGenerator(this.client);
    this.temporalEventsGen = createTemporalEventsGenerator(this.client);
    this.entityRelationshipGen = createEntityRelationshipGenerator(this.client);
    this.cypherGen = createCypherGenerator();
  }
  /**
   * Generate a knowledge graph
   */
  async generateKnowledgeGraph(options) {
    const result = await this.knowledgeGraphGen.generate(options);
    if (options.includeEmbeddings) {
      result.data = await this.enrichWithEmbeddings(result.data, {
        dimensions: options.embeddingDimension
      });
    }
    result.cypher = this.cypherGen.generate(result.data);
    return result;
  }
  /**
   * Generate a social network
   */
  async generateSocialNetwork(options) {
    const result = await this.socialNetworkGen.generate(options);
    if (options.includeEmbeddings) {
      result.data = await this.enrichWithEmbeddings(result.data);
    }
    result.cypher = this.cypherGen.generate(result.data);
    return result;
  }
  /**
   * Generate temporal events
   */
  async generateTemporalEvents(options) {
    const result = await this.temporalEventsGen.generate(options);
    if (options.includeEmbeddings) {
      result.data = await this.enrichWithEmbeddings(result.data);
    }
    result.cypher = this.cypherGen.generate(result.data);
    return result;
  }
  /**
   * Generate entity relationships
   */
  async generateEntityRelationships(options) {
    const result = await this.entityRelationshipGen.generate(options);
    if (options.includeEmbeddings) {
      result.data = await this.enrichWithEmbeddings(result.data);
    }
    result.cypher = this.cypherGen.generate(result.data);
    return result;
  }
  /**
   * Enrich graph data with embeddings
   */
  async enrichWithEmbeddings(data, config) {
    if (!this.embeddingEnrichment) {
      this.embeddingEnrichment = createEmbeddingEnrichment(this.client, config);
    }
    return this.embeddingEnrichment.enrichGraphData(data);
  }
  /**
   * Generate Cypher statements from graph data
   */
  generateCypher(data, options) {
    return this.cypherGen.generateSetupScript(data, options);
  }
  /**
   * Get OpenRouter client
   */
  getClient() {
    return this.client;
  }
  /**
   * Get Cypher generator
   */
  getCypherGenerator() {
    return this.cypherGen;
  }
  /**
   * Get embedding enrichment
   */
  getEmbeddingEnrichment() {
    return this.embeddingEnrichment;
  }
};
function createGraphDataGenerator(config) {
  return new GraphDataGenerator(config);
}
var index_default = GraphDataGenerator;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CypherBatchSchema,
  CypherGenerator,
  CypherStatementSchema,
  EmbeddingEnrichment,
  EntityRelationshipGenerator,
  EntityRelationshipOptionsSchema,
  GraphDataGenerator,
  GraphDataSchema,
  GraphEdgeSchema,
  GraphGenerationError,
  GraphGenerationResultSchema,
  GraphNodeSchema,
  KnowledgeGraphGenerator,
  KnowledgeGraphOptionsSchema,
  OpenRouterClient,
  OpenRouterConfigSchema,
  OpenRouterError,
  SocialNetworkGenerator,
  SocialNetworkOptionsSchema,
  TemporalEventOptionsSchema,
  TemporalEventsGenerator,
  ValidationError,
  createCypherGenerator,
  createEmbeddingEnrichment,
  createEntityRelationshipGenerator,
  createGraphDataGenerator,
  createKnowledgeGraphGenerator,
  createOpenRouterClient,
  createSocialNetworkGenerator,
  createTemporalEventsGenerator,
  validateCypherBatch,
  validateEntityRelationshipOptions,
  validateGraphData,
  validateGraphGenerationResult,
  validateKnowledgeGraphOptions,
  validateSocialNetworkOptions,
  validateTemporalEventOptions
});
