/**
 * @claude-flow/integration - V3 Integration Module
 *
 * Main entry point for the agentic-flow@alpha integration module.
 * Provides deep integration with SONA learning, Flash Attention,
 * and AgentDB for maximum performance and capability.
 *
 * This module implements ADR-001: Adopt agentic-flow as Core Foundation
 *
 * Key Features:
 * - SONA Learning: Real-time adaptation with <0.05ms response
 * - Flash Attention: 2.49x-7.47x speedup with 50-75% memory reduction
 * - AgentDB: 150x-12,500x faster search via HNSW indexing
 * - Intelligence Bridge: 19 hook tools + 9 learning tools
 * - Trajectory Tracking: Experience replay for continuous learning
 *
 * Usage:
 * ```typescript
 * import { createAgenticFlowBridge } from '@claude-flow/integration';
 *
 * const bridge = await createAgenticFlowBridge({
 *   features: {
 *     enableSONA: true,
 *     enableFlashAttention: true,
 *     enableAgentDB: true,
 *   }
 * });
 *
 * // Get SONA adapter for learning
 * const sona = await bridge.getSONAAdapter();
 * await sona.setMode('real-time');
 *
 * // Get Attention coordinator
 * const attention = await bridge.getAttentionCoordinator();
 * const result = await attention.compute({ query, key, value });
 * ```
 *
 * @module @claude-flow/integration
 * @version 3.0.0-alpha.1
 */
export { AgenticFlowBridge, createAgenticFlowBridge, getDefaultBridge, resetDefaultBridge, } from './agentic-flow-bridge.js';
export { SONAAdapter, createSONAAdapter, } from './sona-adapter.js';
export { AttentionCoordinator, createAttentionCoordinator, } from './attention-coordinator.js';
export { SDKBridge, createSDKBridge, } from './sdk-bridge.js';
export { FeatureFlagManager, createFeatureFlagManager, getDefaultFeatureFlagManager, } from './feature-flags.js';
export { AgenticFlowAgent, createAgenticFlowAgent, } from './agentic-flow-agent.js';
export { AgentAdapter, createAgentAdapter, getDefaultAgentAdapter, resetDefaultAgentAdapter, } from './agent-adapter.js';
export type { SONAConfiguration, SONALearningMode, SONATrajectory, SONATrajectoryStep, SONAPattern, SONALearningStats, AttentionConfiguration, AttentionMechanism, AttentionResult, AttentionMetrics, AgentDBConfiguration, AgentDBVector, AgentDBSearchResult, AgentDBStats, IntegrationConfig, IntegrationStatus, RuntimeInfo, ComponentHealth, IntegrationEvent, IntegrationEventType, FeatureFlags, SDKVersion, SDKCompatibility, SDKBridgeConfig, } from './types.js';
export type { IAgent, IAgentConfig, IAgentSession, AgentStatus, AgentType, Task, TaskResult, Message, AgentHealth, AgentConfig, } from './agentic-flow-agent.js';
export type { AgentAdapterConfig, AgentConversionResult, } from './agent-adapter.js';
export { SwarmAdapter, createSwarmAdapter, getDefaultSwarmAdapter, resetDefaultSwarmAdapter, } from './swarm-adapter.js';
export type { AgenticFlowTopology, AgenticFlowAttentionMechanism, AgenticFlowAgentOutput, AgenticFlowSpecializedAgent, AgenticFlowExpertRoute, AgenticFlowAttentionResult, GraphRoPEContext, V3TopologyType, V3AgentDomain, V3AgentState, V3TaskDefinition, SwarmAdapterConfig, } from './swarm-adapter.js';
export { WorkerBase, createWorker, } from './worker-base.js';
export type { WorkerConfig, WorkerType, WorkerMemoryConfig, WorkerCoordinationConfig, WorkerProviderConfig, AgentOutput, WorkerArtifact, WorkerMetrics, WorkerHealth, } from './worker-base.js';
export { SpecializedWorker, createSpecializedWorker, createFrontendWorker, createBackendWorker, createTestingWorker, } from './specialized-worker.js';
export type { SpecializedWorkerConfig, DomainSpecialization, DomainHandlers, TaskMatchResult, } from './specialized-worker.js';
export { LongRunningWorker, createLongRunningWorker, createCheckpointStorage, } from './long-running-worker.js';
export type { LongRunningWorkerConfig, Checkpoint, CheckpointState, CheckpointStorage, ExecutionPhase, ProgressUpdate, } from './long-running-worker.js';
export { WorkerPool, createWorkerPool, createAndInitializeWorkerPool, } from './worker-pool.js';
export type { WorkerPoolConfig, RoutingStrategy, LoadBalancingStrategy, RoutingResult, PoolStats, SpawnOptions, } from './worker-pool.js';
export { ProviderAdapter, createProviderAdapter, createDefaultProviders, } from './provider-adapter.js';
export type { Provider, ProviderType, ProviderCapability, ProviderStatus, ModelInfo, RateLimits, CostInfo, ProviderRequirements, ProviderSelectionResult, ExecutionOptions, ExecutionResult, ProviderMetrics, ProviderAdapterConfig, } from './provider-adapter.js';
export { DEFAULT_SONA_CONFIG, DEFAULT_ATTENTION_CONFIG, DEFAULT_AGENTDB_CONFIG, DEFAULT_FEATURE_FLAGS, DEFAULT_INTEGRATION_CONFIG, } from './types.js';
export { IntegrationError, } from './types.js';
export { MultiModelRouter, createMultiModelRouter, } from './multi-model-router.js';
export type { ProviderType as RouterProviderType, ModelConfig, ProviderConfig, RoutingRule, RoutingMode, RouterConfig as MultiModelRouterConfig, RoutingRequest as RouteRequest, RoutingResult as RouteResult, CostTracker as RouterStats, } from './multi-model-router.js';
/**
 * Quick initialization with sensible defaults
 */
export declare function quickStart(options?: {
    mode?: 'minimal' | 'standard' | 'full';
    debug?: boolean;
}): Promise<{
    bridge: import('./agentic-flow-bridge.js').AgenticFlowBridge;
    sona: import('./sona-adapter.js').SONAAdapter | null;
    attention: import('./attention-coordinator.js').AttentionCoordinator | null;
}>;
/**
 * Performance benchmark utility
 */
export declare function benchmark(): Promise<{
    sona: {
        latencyMs: number;
        patternsPerSecond: number;
    } | null;
    attention: {
        latencyMs: number;
        tokensPerSecond: number;
    } | null;
    overall: {
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
    };
}>;
/**
 * Module version
 */
export declare const VERSION = "3.0.0-alpha.1";
/**
 * Module metadata
 */
export declare const METADATA: {
    name: string;
    version: string;
    description: string;
    implements: string[];
    features: string[];
    performance: {
        flashAttentionSpeedup: string;
        agentDBSearchSpeedup: string;
        sonaAdaptationLatency: string;
        memoryReduction: string;
    };
    workerPatterns: {
        baseWorker: string;
        specializedWorker: string;
        longRunningWorker: string;
        workerPool: string;
        providerAdapter: string;
    };
};
//# sourceMappingURL=index.d.ts.map