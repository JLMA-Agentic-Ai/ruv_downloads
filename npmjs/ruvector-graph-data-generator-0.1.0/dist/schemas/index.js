// src/schemas/index.ts
import { z } from "zod";
var GraphNodeSchema = z.object({
  id: z.string(),
  labels: z.array(z.string()),
  properties: z.record(z.string(), z.unknown()),
  embedding: z.array(z.number()).optional()
});
var GraphEdgeSchema = z.object({
  id: z.string(),
  type: z.string(),
  source: z.string(),
  target: z.string(),
  properties: z.record(z.string(), z.unknown()),
  embedding: z.array(z.number()).optional()
});
var GraphDataSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
  metadata: z.object({
    domain: z.string().optional(),
    generated_at: z.date().optional(),
    model: z.string().optional(),
    total_nodes: z.number().optional(),
    total_edges: z.number().optional()
  }).optional()
});
var KnowledgeGraphOptionsSchema = z.object({
  domain: z.string(),
  entities: z.number().positive(),
  relationships: z.number().positive(),
  entityTypes: z.array(z.string()).optional(),
  relationshipTypes: z.array(z.string()).optional(),
  includeEmbeddings: z.boolean().optional(),
  embeddingDimension: z.number().positive().optional()
});
var SocialNetworkOptionsSchema = z.object({
  users: z.number().positive(),
  avgConnections: z.number().positive(),
  networkType: z.enum(["random", "small-world", "scale-free", "clustered"]).optional(),
  communities: z.number().positive().optional(),
  includeMetadata: z.boolean().optional(),
  includeEmbeddings: z.boolean().optional()
});
var TemporalEventOptionsSchema = z.object({
  startDate: z.union([z.date(), z.string()]),
  endDate: z.union([z.date(), z.string()]),
  eventTypes: z.array(z.string()),
  eventsPerDay: z.number().positive().optional(),
  entities: z.number().positive().optional(),
  includeEmbeddings: z.boolean().optional()
});
var EntityRelationshipOptionsSchema = z.object({
  domain: z.string(),
  entityCount: z.number().positive(),
  relationshipDensity: z.number().min(0).max(1),
  entitySchema: z.record(z.string(), z.unknown()).optional(),
  relationshipTypes: z.array(z.string()).optional(),
  includeEmbeddings: z.boolean().optional()
});
var CypherStatementSchema = z.object({
  query: z.string(),
  parameters: z.record(z.string(), z.unknown()).optional()
});
var CypherBatchSchema = z.object({
  statements: z.array(CypherStatementSchema),
  metadata: z.object({
    total_nodes: z.number().optional(),
    total_relationships: z.number().optional(),
    labels: z.array(z.string()).optional(),
    relationship_types: z.array(z.string()).optional()
  }).optional()
});
var GraphGenerationResultSchema = z.object({
  data: GraphDataSchema,
  metadata: z.object({
    generated_at: z.date(),
    model: z.string(),
    duration: z.number(),
    token_usage: z.object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number()
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
export {
  CypherBatchSchema,
  CypherStatementSchema,
  EntityRelationshipOptionsSchema,
  GraphDataSchema,
  GraphEdgeSchema,
  GraphGenerationResultSchema,
  GraphNodeSchema,
  KnowledgeGraphOptionsSchema,
  SocialNetworkOptionsSchema,
  TemporalEventOptionsSchema,
  validateCypherBatch,
  validateEntityRelationshipOptions,
  validateGraphData,
  validateGraphGenerationResult,
  validateKnowledgeGraphOptions,
  validateSocialNetworkOptions,
  validateTemporalEventOptions
};
