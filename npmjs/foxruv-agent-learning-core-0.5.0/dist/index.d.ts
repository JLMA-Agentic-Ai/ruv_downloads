/**
 * @foxruv/agent-learning-core
 *
 * Cross-project self-improving agent engine with federated learning
 *
 * Core Infrastructure:
 * - Python DSPy optimizer client
 * - AgentDB persistence with vector search
 * - LLM provider abstractions
 * - Time-aware dataset splitting
 * - Parallel swarm coordination
 *
 * Federated Learning:
 * - Cross-project pattern discovery
 * - Reflexion drift monitoring
 * - Global telemetry & drift detection
 * - Consensus lineage tracking
 * - Prompt registry & versioning
 *
 * @author FoxRuv
 * @license MIT
 * @version 1.0.0
 */
export { PythonOptimizerClient, createOptimizerClient, isOptimizerAvailable } from './clients/python-optimizer-client';
export type { SignatureField, SignatureDefinition, TrainingExample, OptimizationConfig, LMConfig, OptimizationRequest, OptimizationResult } from './clients/python-optimizer-client';
export { SwarmCoordinator, createSwarmCoordinator, trainExpertsParallel } from './clients/swarm-coordinator';
export type { ExpertTrainingTask, SwarmConfig, TrainingResult, SwarmStats } from './clients/swarm-coordinator';
export { AgentDBOptimizerStorage, createOptimizerStorage, storeOptimization, loadOptimization } from './storage/agentdb-optimizer-storage';
export type { StoredOptimization, OptimizationHistory } from './storage/agentdb-optimizer-storage';
export { ReasoningBankManager, createReasoningBank } from './storage/reasoning-bank';
export type { LearningTrajectory, TrajectoryPattern, LearningInsights } from './storage/reasoning-bank';
export { AgentDBManager, createAgentDB } from './storage/agentdb-integration';
export type { ExpertEmbedding, CausalDecision, ReflexionEntry, LearnedSkill, AgentDBConfig } from './storage/agentdb-integration';
export { trainExpertsInParallel, calculateSwarmStats, retryFailedTasks, shardTrainingData, aggregateMetrics, loadBalanceTasks, faultTolerantTrain, TrainingMonitor } from './utils/swarm-utils';
export type { TrainingTask, TrainingResult as SwarmTrainingResult, SwarmConfig as SwarmUtilsConfig, SwarmStats as SwarmUtilsStats } from './utils/swarm-utils';
export { LMProviderManager, getLMProvider, resetLMProvider } from './providers/lm-provider';
export type { ModelProvider, LMProviderConfig, PerformanceMetrics } from './providers/lm-provider';
export { Qwen3Provider } from './providers/qwen3-provider';
export type { Signature } from './providers/qwen3-provider';
export { DatasetBuilder, balanceByOutcome, balanceByCategory, exportToJSONL, exportSplitToJSONL } from './training/dataset-core';
export type { TemporalExample, DatasetSplit, SplitStrategy, TemporalSplitConfig } from './training/dataset-core';
export { ReflexionMonitor, createReflexionMonitor } from './reflexion/reflexion-monitor';
export type { TrackedReflexion, DriftDetection, ReflexionComparison, ReflexionAdvisory, ReflexionMonitorConfig } from './reflexion/reflexion-monitor';
export { GlobalMetricsCollector, createGlobalMetrics } from './telemetry/global-metrics';
export type { TelemetryEvent, ExpertMetrics, DriftAlert, CrossProjectMetrics, GlobalMetricsConfig } from './telemetry/global-metrics';
export { ConsensusLineageTracker, createConsensusLineageTracker } from './consensus/lineage-tracker';
export type { ExpertParticipation, ConsensusDecision, VersionLineage, ConsensusPattern, VersionImpact, RotationRecommendation, LineageTrackerConfig } from './consensus/lineage-tracker';
export { PromptRegistry, createPromptRegistry } from './patterns/prompt-registry';
export type { ExpertSignature, SignatureComparison, BestSignature, PromptEvolution, PromptRegistryConfig } from './patterns/prompt-registry';
export { PatternDiscovery, createPatternDiscovery } from './patterns/pattern-discovery';
export type { LearnedPattern, PatternMatch, TransferRecommendation, PatternEvolution as PatternEvolutionHistory, PatternDiscoveryConfig } from './patterns/pattern-discovery';
export { IrisPrime, createIrisPrime, irisPrime } from './orchestrators/iris-prime';
export type { IrisReport, CrossProjectReport, ProjectConfig, IrisPrimeConfig } from './orchestrators/iris-prime';
export { ScheduledIrisRunner } from './orchestrators/run-iris-scheduled';
export * from './notifications';
export * from './supabase';
export * from './config/validator';
export * from './migration/agentdb-to-supabase';
export * from './types';
//# sourceMappingURL=index.d.ts.map