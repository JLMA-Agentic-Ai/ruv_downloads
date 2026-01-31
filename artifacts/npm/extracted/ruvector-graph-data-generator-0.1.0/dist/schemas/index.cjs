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

// src/schemas/index.ts
var index_exports = {};
__export(index_exports, {
  CypherBatchSchema: () => CypherBatchSchema,
  CypherStatementSchema: () => CypherStatementSchema,
  EntityRelationshipOptionsSchema: () => EntityRelationshipOptionsSchema,
  GraphDataSchema: () => GraphDataSchema,
  GraphEdgeSchema: () => GraphEdgeSchema,
  GraphGenerationResultSchema: () => GraphGenerationResultSchema,
  GraphNodeSchema: () => GraphNodeSchema,
  KnowledgeGraphOptionsSchema: () => KnowledgeGraphOptionsSchema,
  SocialNetworkOptionsSchema: () => SocialNetworkOptionsSchema,
  TemporalEventOptionsSchema: () => TemporalEventOptionsSchema,
  validateCypherBatch: () => validateCypherBatch,
  validateEntityRelationshipOptions: () => validateEntityRelationshipOptions,
  validateGraphData: () => validateGraphData,
  validateGraphGenerationResult: () => validateGraphGenerationResult,
  validateKnowledgeGraphOptions: () => validateKnowledgeGraphOptions,
  validateSocialNetworkOptions: () => validateSocialNetworkOptions,
  validateTemporalEventOptions: () => validateTemporalEventOptions
});
module.exports = __toCommonJS(index_exports);
var import_zod = require("zod");
var GraphNodeSchema = import_zod.z.object({
  id: import_zod.z.string(),
  labels: import_zod.z.array(import_zod.z.string()),
  properties: import_zod.z.record(import_zod.z.string(), import_zod.z.unknown()),
  embedding: import_zod.z.array(import_zod.z.number()).optional()
});
var GraphEdgeSchema = import_zod.z.object({
  id: import_zod.z.string(),
  type: import_zod.z.string(),
  source: import_zod.z.string(),
  target: import_zod.z.string(),
  properties: import_zod.z.record(import_zod.z.string(), import_zod.z.unknown()),
  embedding: import_zod.z.array(import_zod.z.number()).optional()
});
var GraphDataSchema = import_zod.z.object({
  nodes: import_zod.z.array(GraphNodeSchema),
  edges: import_zod.z.array(GraphEdgeSchema),
  metadata: import_zod.z.object({
    domain: import_zod.z.string().optional(),
    generated_at: import_zod.z.date().optional(),
    model: import_zod.z.string().optional(),
    total_nodes: import_zod.z.number().optional(),
    total_edges: import_zod.z.number().optional()
  }).optional()
});
var KnowledgeGraphOptionsSchema = import_zod.z.object({
  domain: import_zod.z.string(),
  entities: import_zod.z.number().positive(),
  relationships: import_zod.z.number().positive(),
  entityTypes: import_zod.z.array(import_zod.z.string()).optional(),
  relationshipTypes: import_zod.z.array(import_zod.z.string()).optional(),
  includeEmbeddings: import_zod.z.boolean().optional(),
  embeddingDimension: import_zod.z.number().positive().optional()
});
var SocialNetworkOptionsSchema = import_zod.z.object({
  users: import_zod.z.number().positive(),
  avgConnections: import_zod.z.number().positive(),
  networkType: import_zod.z.enum(["random", "small-world", "scale-free", "clustered"]).optional(),
  communities: import_zod.z.number().positive().optional(),
  includeMetadata: import_zod.z.boolean().optional(),
  includeEmbeddings: import_zod.z.boolean().optional()
});
var TemporalEventOptionsSchema = import_zod.z.object({
  startDate: import_zod.z.union([import_zod.z.date(), import_zod.z.string()]),
  endDate: import_zod.z.union([import_zod.z.date(), import_zod.z.string()]),
  eventTypes: import_zod.z.array(import_zod.z.string()),
  eventsPerDay: import_zod.z.number().positive().optional(),
  entities: import_zod.z.number().positive().optional(),
  includeEmbeddings: import_zod.z.boolean().optional()
});
var EntityRelationshipOptionsSchema = import_zod.z.object({
  domain: import_zod.z.string(),
  entityCount: import_zod.z.number().positive(),
  relationshipDensity: import_zod.z.number().min(0).max(1),
  entitySchema: import_zod.z.record(import_zod.z.string(), import_zod.z.unknown()).optional(),
  relationshipTypes: import_zod.z.array(import_zod.z.string()).optional(),
  includeEmbeddings: import_zod.z.boolean().optional()
});
var CypherStatementSchema = import_zod.z.object({
  query: import_zod.z.string(),
  parameters: import_zod.z.record(import_zod.z.string(), import_zod.z.unknown()).optional()
});
var CypherBatchSchema = import_zod.z.object({
  statements: import_zod.z.array(CypherStatementSchema),
  metadata: import_zod.z.object({
    total_nodes: import_zod.z.number().optional(),
    total_relationships: import_zod.z.number().optional(),
    labels: import_zod.z.array(import_zod.z.string()).optional(),
    relationship_types: import_zod.z.array(import_zod.z.string()).optional()
  }).optional()
});
var GraphGenerationResultSchema = import_zod.z.object({
  data: GraphDataSchema,
  metadata: import_zod.z.object({
    generated_at: import_zod.z.date(),
    model: import_zod.z.string(),
    duration: import_zod.z.number(),
    token_usage: import_zod.z.object({
      prompt_tokens: import_zod.z.number(),
      completion_tokens: import_zod.z.number(),
      total_tokens: import_zod.z.number()
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
