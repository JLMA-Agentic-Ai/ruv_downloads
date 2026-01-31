import { z } from 'zod';

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

export { CypherBatchSchema, CypherStatementSchema, EntityRelationshipOptionsSchema, GraphDataSchema, GraphEdgeSchema, GraphGenerationResultSchema, GraphNodeSchema, KnowledgeGraphOptionsSchema, SocialNetworkOptionsSchema, TemporalEventOptionsSchema, validateCypherBatch, validateEntityRelationshipOptions, validateGraphData, validateGraphGenerationResult, validateKnowledgeGraphOptions, validateSocialNetworkOptions, validateTemporalEventOptions };
