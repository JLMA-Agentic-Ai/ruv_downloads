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

export { EntityRelationshipGenerator, KnowledgeGraphGenerator, SocialNetworkGenerator, TemporalEventsGenerator, createEntityRelationshipGenerator, createKnowledgeGraphGenerator, createSocialNetworkGenerator, createTemporalEventsGenerator };
