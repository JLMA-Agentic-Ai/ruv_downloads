/**
 * TypeScript types for agent-learning-core Supabase tables
 */
export interface ExpertSignature {
    id: string;
    tenant_id?: string;
    project: string;
    expert_id: string;
    version: string;
    prompt: string;
    signature?: Record<string, any>;
    metadata?: Record<string, any>;
    performance_metrics?: Record<string, any>;
    active?: boolean;
    created_at?: string;
    updated_at?: string;
}
export interface SignatureVersion {
    id: string;
    tenant_id?: string;
    project: string;
    expert_id: string;
    from_version?: string;
    to_version?: string;
    changelog?: string;
    diff?: Record<string, any>;
    improvement_metrics?: Record<string, any>;
    rollback_reason?: string;
    created_at?: string;
}
export interface ReflexionEntry {
    id: string;
    tenant_id?: string;
    project: string;
    expert_id?: string;
    reflexion_type: string;
    embedding?: number[];
    context: Record<string, any>;
    outcome: Record<string, any>;
    success: boolean;
    confidence?: number;
    impact_score?: number;
    reuse_count?: number;
    last_reused_at?: string;
    created_at?: string;
}
export interface ModelRunLog {
    id: string;
    tenant_id?: string;
    project: string;
    expert_id: string;
    version?: string;
    run_id?: string;
    input_hash?: string;
    confidence?: number;
    latency_ms?: number;
    tokens_in?: number;
    tokens_out?: number;
    cost_usd?: number;
    outcome?: string;
    reflexion_used?: boolean;
    reflexion_ids?: string[];
    consensus_participation?: boolean;
    error_message?: string;
    metadata?: Record<string, any>;
    timestamp?: string;
}
export interface ConsensusLineage {
    id: string;
    tenant_id?: string;
    project: string;
    section_tag?: string;
    task_id?: string;
    run_id?: string;
    contributing_experts: Array<{
        expert_id: string;
        version: string;
        vote: any;
        confidence: number;
    }>;
    winning_version?: string;
    confidence?: number;
    final_decision: Record<string, any>;
    disagreement_score?: number;
    reasoning_chains?: Record<string, any>;
    metadata?: Record<string, any>;
    created_at?: string;
}
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
export interface StoredIrisReport {
    id: string;
    tenant_id?: string;
    project: string;
    report_type: 'project_evaluation' | 'cross_project' | 'auto_retrain' | 'rotation' | 'pattern_transfer';
    health_score: number;
    overall_health: 'healthy' | 'degraded' | 'critical';
    drift_alerts_count: number;
    recommended_actions_count: number;
    report_data: Record<string, any>;
    metadata?: Record<string, any>;
    created_at?: string;
}
//# sourceMappingURL=types.d.ts.map