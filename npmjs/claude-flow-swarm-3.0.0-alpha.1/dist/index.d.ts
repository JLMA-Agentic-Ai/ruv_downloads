/**
 * @claude-flow/swarm
 * V3 Unified Swarm Coordination Module (ADR-003)
 *
 * ADR-003 IMPLEMENTATION:
 * This module provides ONE CANONICAL coordination engine: UnifiedSwarmCoordinator
 * SwarmHub is maintained ONLY as a compatibility layer for existing code.
 *
 * Provides 15-agent hierarchical mesh coordination with consensus algorithms.
 *
 * Features:
 * - Unified SwarmCoordinator consolidating 4 legacy systems
 * - Multiple topology support: mesh, hierarchical, centralized, hybrid
 * - Consensus algorithms: raft, byzantine, gossip
 * - Agent pool management with workload balancing
 * - Message bus for inter-agent communication
 *
 * Performance Targets:
 * - Agent coordination: <100ms for 15 agents
 * - Consensus: <100ms
 * - Message throughput: 1000+ msgs/sec
 *
 * Recommended Usage:
 * ```typescript
 * import { createUnifiedSwarmCoordinator } from '@claude-flow/swarm';
 *
 * const coordinator = createUnifiedSwarmCoordinator({
 *   topology: { type: 'hierarchical', maxAgents: 15 },
 *   consensus: { algorithm: 'raft', threshold: 0.66 },
 * });
 *
 * await coordinator.initialize();
 * ```
 *
 * @module @claude-flow/swarm
 * @version 3.0.0-alpha.1
 */
export * from './types.js';
export type { SwarmId, AgentId, TaskId, AgentState, AgentType, AgentStatus, AgentCapabilities, AgentMetrics, TaskDefinition, TaskType, TaskStatus, TaskPriority, TopologyType, TopologyConfig, TopologyState, TopologyNode, ConsensusAlgorithm, ConsensusConfig, ConsensusProposal, ConsensusVote, ConsensusResult, Message, MessageType, MessageBusConfig, MessageBusStats, CoordinatorConfig, CoordinatorState, CoordinatorMetrics, SwarmStatus, SwarmEvent, SwarmEventType, PerformanceReport, AgentPoolConfig, AgentPoolState, } from './types.js';
export { UnifiedSwarmCoordinator, createUnifiedSwarmCoordinator, } from './unified-coordinator.js';
export type { AgentDomain, DomainConfig, TaskAssignment, ParallelExecutionResult, DomainStatus, } from './unified-coordinator.js';
export { QueenCoordinator, createQueenCoordinator, } from './queen-coordinator.js';
export type { QueenCoordinatorConfig, TaskAnalysis, SubTask, MatchedPattern, ResourceRequirements, DelegationPlan, AgentAssignment, ParallelAssignment, ExecutionStrategy, AgentScore, HealthReport, DomainHealthStatus, AgentHealthEntry, Bottleneck, HealthAlert, HealthMetrics, Decision, DecisionType, ConsensusType, TaskResult, TaskMetrics, ISwarmCoordinator, INeuralLearningSystem, IMemoryService, PatternMatchResult, MemoryRetrievalResult, SearchResultEntry, MemoryStoreEntry, } from './queen-coordinator.js';
export { TopologyManager, createTopologyManager, } from './topology-manager.js';
export { MessageBus, createMessageBus, } from './message-bus.js';
export { AgentPool, createAgentPool, } from './agent-pool.js';
export { ConsensusEngine, createConsensusEngine, selectOptimalAlgorithm, RaftConsensus, ByzantineConsensus, GossipConsensus, } from './consensus/index.js';
export type { RaftConfig, ByzantineConfig, GossipConfig, } from './consensus/index.js';
export { AgentRegistry, createAgentRegistry, type IAgentRegistry, } from './coordination/agent-registry.js';
export { TaskOrchestrator, createTaskOrchestrator, type ITaskOrchestrator, type TaskSpec, } from './coordination/task-orchestrator.js';
/**
 * @deprecated SwarmHub is a compatibility layer. Use UnifiedSwarmCoordinator directly.
 *
 * Migration:
 * ```typescript
 * // OLD:
 * import { createSwarmHub } from '@claude-flow/swarm';
 * const hub = createSwarmHub();
 *
 * // NEW:
 * import { createUnifiedSwarmCoordinator } from '@claude-flow/swarm';
 * const coordinator = createUnifiedSwarmCoordinator();
 * ```
 */
export { SwarmHub, createSwarmHub, type ISwarmHub, } from './coordination/swarm-hub.js';
export { WorkerDispatchService, getWorkerDispatchService, type WorkerTrigger, type WorkerStatus, type WorkerInstance, type WorkerResult, type DispatchOptions, type TriggerDetectionResult, type WorkerConfig, type WorkerMetrics, type WorkerArtifact, } from './workers/worker-dispatch.js';
export { AttentionCoordinator, createAttentionCoordinator, type AttentionType, type AttentionCoordinatorConfig, type CoordinationResult, type ExpertRoutingResult, type AgentOutput, type Task as AttentionTask, type SpecializedAgent, type SwarmTopology, type GraphContext, } from './attention-coordinator.js';
export { FederationHub, createFederationHub, getDefaultFederationHub, resetDefaultFederationHub, type FederationId, type SwarmId as FederationSwarmId, type EphemeralAgentId, type FederationConfig, type SwarmRegistration, type EphemeralAgent, type SpawnEphemeralOptions, type SpawnResult, type FederationMessage, type ConsensusProposal as FederationConsensusProposal, type FederationStats, type FederationEvent, type FederationEventType, } from './federation-hub.js';
import { UnifiedSwarmCoordinator } from './unified-coordinator.js';
export default UnifiedSwarmCoordinator;
/** Module version */
export declare const VERSION = "3.0.0-alpha.1";
/** Performance targets for swarm operations */
export declare const PERFORMANCE_TARGETS: {
    /** Maximum latency for coordinating 15 agents */
    readonly COORDINATION_LATENCY_MS: 100;
    /** Maximum latency for consensus operations */
    readonly CONSENSUS_LATENCY_MS: 100;
    /** Minimum message throughput */
    readonly MESSAGE_THROUGHPUT: 1000;
};
/** Supported topology types */
export declare const TOPOLOGY_TYPES: readonly ["mesh", "hierarchical", "centralized", "hybrid"];
/** Supported consensus algorithms */
export declare const CONSENSUS_ALGORITHMS: readonly ["raft", "byzantine", "gossip", "paxos"];
/** Default swarm configuration */
export declare const DEFAULT_CONFIG: {
    readonly topology: {
        readonly type: "hierarchical";
        readonly maxAgents: 15;
    };
    readonly consensus: {
        readonly algorithm: "raft";
        readonly threshold: 0.66;
        readonly timeoutMs: 5000;
    };
    readonly messageBus: {
        readonly maxQueueSize: 10000;
        readonly batchSize: 100;
    };
    readonly agentPool: {
        readonly minAgents: 1;
        readonly maxAgents: 15;
        readonly idleTimeoutMs: 300000;
    };
};
//# sourceMappingURL=index.d.ts.map