import { z } from 'zod';

/**
 * Core types and interfaces for graph-data-generator
 */

interface GraphNode {
    id: string;
    labels: string[];
    properties: Record<string, unknown>;
    embedding?: number[];
}
interface GraphEdge {
    id: string;
    type: string;
    source: string;
    target: string;
    properties: Record<string, unknown>;
    embedding?: number[];
}
interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
    metadata?: {
        domain?: string;
        generated_at?: Date;
        model?: string;
        total_nodes?: number;
        total_edges?: number;
    };
}
interface KnowledgeTriple {
    subject: string;
    predicate: string;
    object: string;
    confidence?: number;
    source?: string;
}
interface KnowledgeGraphOptions {
    domain: string;
    entities: number;
    relationships: number;
    entityTypes?: string[];
    relationshipTypes?: string[];
    includeEmbeddings?: boolean;
    embeddingDimension?: number;
}
interface SocialNetworkOptions {
    users: number;
    avgConnections: number;
    networkType?: 'random' | 'small-world' | 'scale-free' | 'clustered';
    communities?: number;
    includeMetadata?: boolean;
    includeEmbeddings?: boolean;
}
interface SocialNode {
    id: string;
    username: string;
    profile: {
        name?: string;
        bio?: string;
        joined?: Date;
        followers?: number;
        following?: number;
    };
    metadata?: Record<string, unknown>;
}
interface TemporalEventOptions {
    startDate: Date | string;
    endDate: Date | string;
    eventTypes: string[];
    eventsPerDay?: number;
    entities?: number;
    includeEmbeddings?: boolean;
}
interface TemporalEvent {
    id: string;
    type: string;
    timestamp: Date;
    entities: string[];
    properties: Record<string, unknown>;
    relationships?: Array<{
        type: string;
        target: string;
    }>;
}
interface EntityRelationshipOptions {
    domain: string;
    entityCount: number;
    relationshipDensity: number;
    entitySchema?: Record<string, unknown>;
    relationshipTypes?: string[];
    includeEmbeddings?: boolean;
}
interface OpenRouterConfig {
    apiKey: string;
    model?: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
    rateLimit?: {
        requests: number;
        interval: number;
    };
}
declare const OpenRouterConfigSchema: z.ZodObject<{
    apiKey: z.ZodString;
    model: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    baseURL: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    timeout: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    maxRetries: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    rateLimit: z.ZodOptional<z.ZodObject<{
        requests: z.ZodNumber;
        interval: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
interface OpenRouterRequest {
    model: string;
    messages: OpenRouterMessage[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stream?: boolean;
}
interface OpenRouterResponse {
    id: string;
    model: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
interface CypherStatement {
    query: string;
    parameters?: Record<string, unknown>;
}
interface CypherBatch {
    statements: CypherStatement[];
    metadata?: {
        total_nodes?: number;
        total_relationships?: number;
        labels?: string[];
        relationship_types?: string[];
    };
}
interface EmbeddingConfig {
    provider: 'openrouter' | 'local';
    model?: string;
    dimensions?: number;
    batchSize?: number;
}
interface EmbeddingResult {
    embedding: number[];
    model: string;
    dimensions: number;
}
interface GraphGenerationResult<T = GraphData> {
    data: T;
    metadata: {
        generated_at: Date;
        model: string;
        duration: number;
        token_usage?: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
    cypher?: CypherBatch;
}
declare class GraphGenerationError extends Error {
    code: string;
    details?: unknown | undefined;
    constructor(message: string, code: string, details?: unknown | undefined);
}
declare class OpenRouterError extends GraphGenerationError {
    constructor(message: string, details?: unknown);
}
declare class ValidationError extends GraphGenerationError {
    constructor(message: string, details?: unknown);
}

/**
 * OpenRouter API client with Kimi K2 support
 */

declare class OpenRouterClient {
    private config;
    private throttledFetch;
    constructor(config?: Partial<OpenRouterConfig>);
    /**
     * Create a chat completion
     */
    createCompletion(messages: OpenRouterMessage[], options?: Partial<Omit<OpenRouterRequest, 'messages' | 'model'>>): Promise<OpenRouterResponse>;
    /**
     * Create a streaming chat completion
     */
    createStreamingCompletion(messages: OpenRouterMessage[], options?: Partial<Omit<OpenRouterRequest, 'messages' | 'model'>>): AsyncGenerator<string, void, unknown>;
    /**
     * Generate structured data using prompt engineering
     */
    generateStructured<T = unknown>(systemPrompt: string, userPrompt: string, options?: {
        temperature?: number;
        maxTokens?: number;
    }): Promise<T>;
    /**
     * Generate embeddings (if the model supports it)
     */
    generateEmbedding(_text: string): Promise<number[]>;
    /**
     * Update configuration
     */
    configure(config: Partial<OpenRouterConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): OpenRouterConfig;
}
/**
 * Create a new OpenRouter client
 */
declare function createOpenRouterClient(config?: Partial<OpenRouterConfig>): OpenRouterClient;

/**
 * Cypher statement generator for Neo4j
 */

declare class CypherGenerator {
    /**
     * Generate Cypher statements from graph data
     */
    generate(data: GraphData): CypherBatch;
    /**
     * Generate CREATE statement for a node
     */
    private generateNodeStatement;
    /**
     * Generate CREATE statement for an edge
     */
    private generateEdgeStatement;
    /**
     * Generate MERGE statements (upsert)
     */
    generateMergeStatements(data: GraphData): CypherBatch;
    /**
     * Generate MERGE statement for a node
     */
    private generateNodeMergeStatement;
    /**
     * Generate MERGE statement for an edge
     */
    private generateEdgeMergeStatement;
    /**
     * Generate index creation statements
     */
    generateIndexStatements(data: GraphData): CypherStatement[];
    /**
     * Generate constraint creation statements
     */
    generateConstraintStatements(data: GraphData): CypherStatement[];
    /**
     * Generate complete setup script
     */
    generateSetupScript(data: GraphData, options?: {
        useConstraints?: boolean;
        useIndexes?: boolean;
        useMerge?: boolean;
    }): string;
    /**
     * Format a statement for output
     */
    private formatStatement;
    /**
     * Escape label names for Cypher
     */
    private escapeLabel;
    /**
     * Generate batch insert with transactions
     */
    generateBatchInsert(data: GraphData, batchSize?: number): CypherStatement[];
}
/**
 * Create a Cypher generator
 */
declare function createCypherGenerator(): CypherGenerator;

/**
 * Vector embedding enrichment for graph nodes and edges
 */

declare class EmbeddingEnrichment {
    private client;
    private config;
    constructor(client: OpenRouterClient, config?: Partial<EmbeddingConfig>);
    /**
     * Enrich graph data with vector embeddings
     */
    enrichGraphData(data: GraphData): Promise<GraphData>;
    /**
     * Enrich nodes with embeddings
     */
    private enrichNodes;
    /**
     * Enrich edges with embeddings
     */
    private enrichEdges;
    /**
     * Generate embedding for a node
     */
    private generateNodeEmbedding;
    /**
     * Generate embedding for an edge
     */
    private generateEdgeEmbedding;
    /**
     * Convert node to text for embedding
     */
    private nodeToText;
    /**
     * Convert edge to text for embedding
     */
    private edgeToText;
    /**
     * Generate embedding using OpenRouter or local model
     */
    private generateEmbedding;
    /**
     * Generate semantic embedding using chat model
     */
    private generateSemanticEmbedding;
    /**
     * Generate local embedding (placeholder)
     */
    private generateLocalEmbedding;
    /**
     * Generate random embedding (fallback)
     */
    private generateRandomEmbedding;
    /**
     * Calculate similarity between embeddings
     */
    calculateSimilarity(embedding1: number[], embedding2: number[], metric?: 'cosine' | 'euclidean' | 'dot'): number;
    /**
     * Calculate cosine similarity
     */
    private cosineSimilarity;
    /**
     * Calculate Euclidean distance
     */
    private euclideanDistance;
    /**
     * Calculate dot product
     */
    private dotProduct;
    /**
     * Find similar nodes using embeddings
     */
    findSimilarNodes(node: GraphNode, allNodes: GraphNode[], topK?: number, metric?: 'cosine' | 'euclidean' | 'dot'): Array<{
        node: GraphNode;
        similarity: number;
    }>;
}
/**
 * Create an embedding enrichment instance
 */
declare function createEmbeddingEnrichment(client: OpenRouterClient, config?: Partial<EmbeddingConfig>): EmbeddingEnrichment;

/**
 * Knowledge graph generator using OpenRouter/Kimi K2
 */

declare class KnowledgeGraphGenerator {
    private client;
    constructor(client: OpenRouterClient);
    /**
     * Generate a knowledge graph
     */
    generate(options: KnowledgeGraphOptions): Promise<GraphGenerationResult<GraphData>>;
    /**
     * Generate entities for the knowledge graph
     */
    private generateEntities;
    /**
     * Generate relationships between entities
     */
    private generateRelationships;
    /**
     * Generate knowledge triples (subject-predicate-object)
     */
    generateTriples(domain: string, count: number): Promise<KnowledgeTriple[]>;
}
/**
 * Create a knowledge graph generator
 */
declare function createKnowledgeGraphGenerator(client: OpenRouterClient): KnowledgeGraphGenerator;

/**
 * Social network generator using OpenRouter/Kimi K2
 */

declare class SocialNetworkGenerator {
    private client;
    constructor(client: OpenRouterClient);
    /**
     * Generate a social network graph
     */
    generate(options: SocialNetworkOptions): Promise<GraphGenerationResult<GraphData>>;
    /**
     * Generate realistic social network users
     */
    private generateUsers;
    /**
     * Generate connections between users
     */
    private generateConnections;
    /**
     * Get guidance for network type
     */
    private getNetworkTypeGuidance;
    /**
     * Analyze network properties
     */
    analyzeNetwork(data: GraphData): Promise<{
        avgDegree: number;
        maxDegree: number;
        communities?: number;
        clustering?: number;
    }>;
}
/**
 * Create a social network generator
 */
declare function createSocialNetworkGenerator(client: OpenRouterClient): SocialNetworkGenerator;

/**
 * Temporal events generator for time-series graph data
 */

declare class TemporalEventsGenerator {
    private client;
    constructor(client: OpenRouterClient);
    /**
     * Generate temporal event graph data
     */
    generate(options: TemporalEventOptions): Promise<GraphGenerationResult<GraphData>>;
    /**
     * Generate temporal events
     */
    private generateEvents;
    /**
     * Generate entities from events
     */
    private generateEntities;
    /**
     * Analyze temporal patterns
     */
    analyzeTemporalPatterns(events: TemporalEvent[]): Promise<{
        eventsPerHour: Record<string, number>;
        eventTypeDistribution: Record<string, number>;
        avgTimeBetweenEvents: number;
    }>;
}
/**
 * Create a temporal events generator
 */
declare function createTemporalEventsGenerator(client: OpenRouterClient): TemporalEventsGenerator;

/**
 * Entity relationship generator for domain-specific graphs
 */

declare class EntityRelationshipGenerator {
    private client;
    constructor(client: OpenRouterClient);
    /**
     * Generate entity-relationship graph
     */
    generate(options: EntityRelationshipOptions): Promise<GraphGenerationResult<GraphData>>;
    /**
     * Generate domain-specific entities
     */
    private generateEntities;
    /**
     * Generate relationships between entities
     */
    private generateRelationships;
    /**
     * Generate schema-aware entities and relationships
     */
    generateWithSchema(schema: {
        entities: Record<string, {
            properties: Record<string, string>;
            relationships?: string[];
        }>;
        relationships: Record<string, {
            from: string;
            to: string;
            properties?: Record<string, string>;
        }>;
    }, count: number): Promise<GraphData>;
    /**
     * Analyze entity-relationship patterns
     */
    analyzeERPatterns(data: GraphData): Promise<{
        entityTypeDistribution: Record<string, number>;
        relationshipTypeDistribution: Record<string, number>;
        avgRelationshipsPerEntity: number;
        densityScore: number;
    }>;
}
/**
 * Create an entity relationship generator
 */
declare function createEntityRelationshipGenerator(client: OpenRouterClient): EntityRelationshipGenerator;

/**
 * Zod schemas for graph data validation
 */

declare const GraphNodeSchema: z.ZodObject<{
    id: z.ZodString;
    labels: z.ZodArray<z.ZodString>;
    properties: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    embedding: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
}, z.core.$strip>;
declare const GraphEdgeSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    source: z.ZodString;
    target: z.ZodString;
    properties: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    embedding: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
}, z.core.$strip>;
declare const GraphDataSchema: z.ZodObject<{
    nodes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        labels: z.ZodArray<z.ZodString>;
        properties: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        embedding: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>;
    edges: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        source: z.ZodString;
        target: z.ZodString;
        properties: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        embedding: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    }, z.core.$strip>>;
    metadata: z.ZodOptional<z.ZodObject<{
        domain: z.ZodOptional<z.ZodString>;
        generated_at: z.ZodOptional<z.ZodDate>;
        model: z.ZodOptional<z.ZodString>;
        total_nodes: z.ZodOptional<z.ZodNumber>;
        total_edges: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const KnowledgeGraphOptionsSchema: z.ZodObject<{
    domain: z.ZodString;
    entities: z.ZodNumber;
    relationships: z.ZodNumber;
    entityTypes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    relationshipTypes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    includeEmbeddings: z.ZodOptional<z.ZodBoolean>;
    embeddingDimension: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
declare const SocialNetworkOptionsSchema: z.ZodObject<{
    users: z.ZodNumber;
    avgConnections: z.ZodNumber;
    networkType: z.ZodOptional<z.ZodEnum<{
        random: "random";
        "small-world": "small-world";
        "scale-free": "scale-free";
        clustered: "clustered";
    }>>;
    communities: z.ZodOptional<z.ZodNumber>;
    includeMetadata: z.ZodOptional<z.ZodBoolean>;
    includeEmbeddings: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
declare const TemporalEventOptionsSchema: z.ZodObject<{
    startDate: z.ZodUnion<readonly [z.ZodDate, z.ZodString]>;
    endDate: z.ZodUnion<readonly [z.ZodDate, z.ZodString]>;
    eventTypes: z.ZodArray<z.ZodString>;
    eventsPerDay: z.ZodOptional<z.ZodNumber>;
    entities: z.ZodOptional<z.ZodNumber>;
    includeEmbeddings: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
declare const EntityRelationshipOptionsSchema: z.ZodObject<{
    domain: z.ZodString;
    entityCount: z.ZodNumber;
    relationshipDensity: z.ZodNumber;
    entitySchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    relationshipTypes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    includeEmbeddings: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
declare const CypherStatementSchema: z.ZodObject<{
    query: z.ZodString;
    parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
declare const CypherBatchSchema: z.ZodObject<{
    statements: z.ZodArray<z.ZodObject<{
        query: z.ZodString;
        parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>>;
    metadata: z.ZodOptional<z.ZodObject<{
        total_nodes: z.ZodOptional<z.ZodNumber>;
        total_relationships: z.ZodOptional<z.ZodNumber>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString>>;
        relationship_types: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const GraphGenerationResultSchema: z.ZodObject<{
    data: z.ZodObject<{
        nodes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            labels: z.ZodArray<z.ZodString>;
            properties: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            embedding: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        }, z.core.$strip>>;
        edges: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            source: z.ZodString;
            target: z.ZodString;
            properties: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            embedding: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        }, z.core.$strip>>;
        metadata: z.ZodOptional<z.ZodObject<{
            domain: z.ZodOptional<z.ZodString>;
            generated_at: z.ZodOptional<z.ZodDate>;
            model: z.ZodOptional<z.ZodString>;
            total_nodes: z.ZodOptional<z.ZodNumber>;
            total_edges: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    metadata: z.ZodObject<{
        generated_at: z.ZodDate;
        model: z.ZodString;
        duration: z.ZodNumber;
        token_usage: z.ZodOptional<z.ZodObject<{
            prompt_tokens: z.ZodNumber;
            completion_tokens: z.ZodNumber;
            total_tokens: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    cypher: z.ZodOptional<z.ZodObject<{
        statements: z.ZodArray<z.ZodObject<{
            query: z.ZodString;
            parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        metadata: z.ZodOptional<z.ZodObject<{
            total_nodes: z.ZodOptional<z.ZodNumber>;
            total_relationships: z.ZodOptional<z.ZodNumber>;
            labels: z.ZodOptional<z.ZodArray<z.ZodString>>;
            relationship_types: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare function validateGraphData(data: unknown): {
    nodes: {
        id: string;
        labels: string[];
        properties: Record<string, unknown>;
        embedding?: number[] | undefined;
    }[];
    edges: {
        id: string;
        type: string;
        source: string;
        target: string;
        properties: Record<string, unknown>;
        embedding?: number[] | undefined;
    }[];
    metadata?: {
        domain?: string | undefined;
        generated_at?: Date | undefined;
        model?: string | undefined;
        total_nodes?: number | undefined;
        total_edges?: number | undefined;
    } | undefined;
};
declare function validateKnowledgeGraphOptions(options: unknown): {
    domain: string;
    entities: number;
    relationships: number;
    entityTypes?: string[] | undefined;
    relationshipTypes?: string[] | undefined;
    includeEmbeddings?: boolean | undefined;
    embeddingDimension?: number | undefined;
};
declare function validateSocialNetworkOptions(options: unknown): {
    users: number;
    avgConnections: number;
    networkType?: "random" | "small-world" | "scale-free" | "clustered" | undefined;
    communities?: number | undefined;
    includeMetadata?: boolean | undefined;
    includeEmbeddings?: boolean | undefined;
};
declare function validateTemporalEventOptions(options: unknown): {
    startDate: string | Date;
    endDate: string | Date;
    eventTypes: string[];
    eventsPerDay?: number | undefined;
    entities?: number | undefined;
    includeEmbeddings?: boolean | undefined;
};
declare function validateEntityRelationshipOptions(options: unknown): {
    domain: string;
    entityCount: number;
    relationshipDensity: number;
    entitySchema?: Record<string, unknown> | undefined;
    relationshipTypes?: string[] | undefined;
    includeEmbeddings?: boolean | undefined;
};
declare function validateCypherBatch(batch: unknown): {
    statements: {
        query: string;
        parameters?: Record<string, unknown> | undefined;
    }[];
    metadata?: {
        total_nodes?: number | undefined;
        total_relationships?: number | undefined;
        labels?: string[] | undefined;
        relationship_types?: string[] | undefined;
    } | undefined;
};
declare function validateGraphGenerationResult(result: unknown): {
    data: {
        nodes: {
            id: string;
            labels: string[];
            properties: Record<string, unknown>;
            embedding?: number[] | undefined;
        }[];
        edges: {
            id: string;
            type: string;
            source: string;
            target: string;
            properties: Record<string, unknown>;
            embedding?: number[] | undefined;
        }[];
        metadata?: {
            domain?: string | undefined;
            generated_at?: Date | undefined;
            model?: string | undefined;
            total_nodes?: number | undefined;
            total_edges?: number | undefined;
        } | undefined;
    };
    metadata: {
        generated_at: Date;
        model: string;
        duration: number;
        token_usage?: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        } | undefined;
    };
    cypher?: {
        statements: {
            query: string;
            parameters?: Record<string, unknown> | undefined;
        }[];
        metadata?: {
            total_nodes?: number | undefined;
            total_relationships?: number | undefined;
            labels?: string[] | undefined;
            relationship_types?: string[] | undefined;
        } | undefined;
    } | undefined;
};

/**
 * @ruvector/graph-data-generator - AI-powered synthetic graph data generation
 *
 * @packageDocumentation
 */

/**
 * Main GraphDataGenerator class
 */
declare class GraphDataGenerator {
    private client;
    private knowledgeGraphGen;
    private socialNetworkGen;
    private temporalEventsGen;
    private entityRelationshipGen;
    private cypherGen;
    private embeddingEnrichment?;
    constructor(config?: Partial<OpenRouterConfig>);
    /**
     * Generate a knowledge graph
     */
    generateKnowledgeGraph(options: KnowledgeGraphOptions): Promise<GraphGenerationResult<GraphData>>;
    /**
     * Generate a social network
     */
    generateSocialNetwork(options: SocialNetworkOptions): Promise<GraphGenerationResult<GraphData>>;
    /**
     * Generate temporal events
     */
    generateTemporalEvents(options: TemporalEventOptions): Promise<GraphGenerationResult<GraphData>>;
    /**
     * Generate entity relationships
     */
    generateEntityRelationships(options: EntityRelationshipOptions): Promise<GraphGenerationResult<GraphData>>;
    /**
     * Enrich graph data with embeddings
     */
    enrichWithEmbeddings(data: GraphData, config?: Partial<EmbeddingConfig>): Promise<GraphData>;
    /**
     * Generate Cypher statements from graph data
     */
    generateCypher(data: GraphData, options?: {
        useConstraints?: boolean;
        useIndexes?: boolean;
        useMerge?: boolean;
    }): string;
    /**
     * Get OpenRouter client
     */
    getClient(): OpenRouterClient;
    /**
     * Get Cypher generator
     */
    getCypherGenerator(): CypherGenerator;
    /**
     * Get embedding enrichment
     */
    getEmbeddingEnrichment(): EmbeddingEnrichment | undefined;
}
/**
 * Create a new GraphDataGenerator instance
 */
declare function createGraphDataGenerator(config?: Partial<OpenRouterConfig>): GraphDataGenerator;

export { type CypherBatch, CypherBatchSchema, CypherGenerator, type CypherStatement, CypherStatementSchema, type EmbeddingConfig, EmbeddingEnrichment, type EmbeddingResult, EntityRelationshipGenerator, type EntityRelationshipOptions, EntityRelationshipOptionsSchema, type GraphData, GraphDataGenerator, GraphDataSchema, type GraphEdge, GraphEdgeSchema, GraphGenerationError, type GraphGenerationResult, GraphGenerationResultSchema, type GraphNode, GraphNodeSchema, KnowledgeGraphGenerator, type KnowledgeGraphOptions, KnowledgeGraphOptionsSchema, type KnowledgeTriple, OpenRouterClient, type OpenRouterConfig, OpenRouterConfigSchema, OpenRouterError, type OpenRouterMessage, type OpenRouterRequest, type OpenRouterResponse, SocialNetworkGenerator, type SocialNetworkOptions, SocialNetworkOptionsSchema, type SocialNode, type TemporalEvent, type TemporalEventOptions, TemporalEventOptionsSchema, TemporalEventsGenerator, ValidationError, createCypherGenerator, createEmbeddingEnrichment, createEntityRelationshipGenerator, createGraphDataGenerator, createKnowledgeGraphGenerator, createOpenRouterClient, createSocialNetworkGenerator, createTemporalEventsGenerator, GraphDataGenerator as default, validateCypherBatch, validateEntityRelationshipOptions, validateGraphData, validateGraphGenerationResult, validateKnowledgeGraphOptions, validateSocialNetworkOptions, validateTemporalEventOptions };
