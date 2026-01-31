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
export {
  EntityRelationshipGenerator,
  KnowledgeGraphGenerator,
  SocialNetworkGenerator,
  TemporalEventsGenerator,
  createEntityRelationshipGenerator,
  createKnowledgeGraphGenerator,
  createSocialNetworkGenerator,
  createTemporalEventsGenerator
};
