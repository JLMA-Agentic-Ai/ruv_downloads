/**
 * Pattern storage and discovery utilities
 * Enables cross-project pattern sharing and reuse
 */
export interface StoredPattern {
    id: string;
    tenant_id?: string;
    project: string;
    expert_id?: string;
    pattern_name: string;
    pattern_type: string;
    pattern_data: Record<string, any>;
    success_rate?: number;
    usage_count?: number;
    domain?: string;
    tags?: string[];
    embedding?: number[];
    metadata?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
    last_used_at?: string;
}
export interface PatternMatch {
    pattern: StoredPattern;
    similarity: number;
    relevanceScore: number;
}
/**
 * Store a learned pattern for cross-project reuse
 */
export declare function storePattern(patternName: string, patternType: string, patternData: Record<string, any>, options?: {
    expertId?: string;
    successRate?: number;
    domain?: string;
    tags?: string[];
    embedding?: number[];
    metadata?: Record<string, any>;
}): Promise<StoredPattern>;
/**
 * Find patterns by type and domain
 */
export declare function findPatterns(options?: {
    patternType?: string;
    domain?: string;
    expertId?: string;
    tags?: string[];
    minSuccessRate?: number;
    limit?: number;
}): Promise<StoredPattern[]>;
/**
 * Get a specific pattern by ID
 */
export declare function getPattern(patternId: string): Promise<StoredPattern | null>;
/**
 * Find similar patterns using vector search
 * Falls back to metadata-based search if embeddings not available
 */
export declare function findSimilarPatterns(_queryEmbedding: number[], options?: {
    patternType?: string;
    minSimilarity?: number;
    limit?: number;
    excludeProjects?: string[];
}): Promise<PatternMatch[]>;
/**
 * Mark a pattern as used (increments usage_count)
 */
export declare function markPatternUsed(patternId: string): Promise<void>;
/**
 * Update pattern success rate based on new outcomes
 */
export declare function updatePatternSuccessRate(patternId: string, newSuccessRate: number): Promise<void>;
/**
 * Get pattern usage statistics
 */
export declare function getPatternStats(options?: {
    patternType?: string;
    domain?: string;
}): Promise<{
    totalPatterns: number;
    avgSuccessRate: number;
    totalUsage: number;
    topPatterns: StoredPattern[];
    patternsByDomain: Record<string, number>;
}>;
/**
 * Delete a pattern
 */
export declare function deletePattern(patternId: string): Promise<void>;
/**
 * Get cross-project patterns (excluding current project)
 */
export declare function getCrossProjectPatterns(options?: {
    patternType?: string;
    minSuccessRate?: number;
    limit?: number;
}): Promise<StoredPattern[]>;
//# sourceMappingURL=patterns.d.ts.map