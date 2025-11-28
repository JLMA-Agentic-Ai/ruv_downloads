/**
 * @foxruv/agent-learning-core Supabase Integration
 *
 * Centralized intelligence backend for all foxruv projects:
 * - Expert signatures and optimization tracking
 * - Reflexion bank with vector similarity search
 * - Telemetry and performance monitoring
 * - Multi-expert consensus lineage
 */
export { initSupabase, initSupabaseFromEnv, getSupabase, getProjectId, getTenantId, isSupabaseInitialized, type SupabaseConfig, type SupabaseClient, } from './client';
export type { ExpertSignature, SignatureVersion, ReflexionEntry, ModelRunLog, ConsensusLineage, StoredPattern, StoredIrisReport, } from './types';
export { storeExpertSignature, loadActiveExpertSignature, loadExpertSignatureVersion, getSignatureHistory, recordSignatureUpgrade, getSignatureVersionHistory, } from './signatures';
export { logTelemetry, getExpertStats, getRecentLogs, detectDrift, getProjectExpertStats, getExpertPerformanceTrends, type TelemetryData, } from './telemetry';
export { saveReflexion, findSimilarReflexions, getSuccessfulReflexions, markReflexionReused, getReflexionStats, } from './reflexions';
export { recordConsensusLineage, getConsensusHistory, getConsensusForTask, calculateConsensus, getExpertParticipationStats, type ExpertContribution, } from './consensus';
export { storePattern, findPatterns, getPattern, findSimilarPatterns, markPatternUsed, updatePatternSuccessRate, getPatternStats, deletePattern, getCrossProjectPatterns, type PatternMatch, } from './patterns';
export { storeIrisReport, getLatestIrisReport, getIrisReportHistory, getIrisReportSummary, getCriticalReports, compareProjectHealth, deleteOldIrisReports, getAllProjectsSummary, getOverviewMetrics, transformReportToProject, type IrisReportSummary, } from './iris-reports';
export { getHealthTrends, getSuccessRateTrends, getLatencyTrends, getReflexionImpactStats, getTokenConsumptionTrends, getErrorDistribution, } from './analytics';
export { getRecentEvents, getAnomalies, resolveAnomaly, getAnomalyStats, type SystemEvent, type Anomaly, } from './events';
//# sourceMappingURL=index.d.ts.map