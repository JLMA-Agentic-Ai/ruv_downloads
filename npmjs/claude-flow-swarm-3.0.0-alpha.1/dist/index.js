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
// =============================================================================
// Types
// =============================================================================
export * from './types.js';
// =============================================================================
// Unified Coordinator
// =============================================================================
export { UnifiedSwarmCoordinator, createUnifiedSwarmCoordinator, } from './unified-coordinator.js';
// =============================================================================
// Queen Coordinator (Hive-Mind Central Orchestrator)
// =============================================================================
export { QueenCoordinator, createQueenCoordinator, } from './queen-coordinator.js';
// =============================================================================
// Topology Manager
// =============================================================================
export { TopologyManager, createTopologyManager, } from './topology-manager.js';
// =============================================================================
// Message Bus
// =============================================================================
export { MessageBus, createMessageBus, } from './message-bus.js';
// =============================================================================
// Agent Pool
// =============================================================================
export { AgentPool, createAgentPool, } from './agent-pool.js';
// =============================================================================
// Consensus Engines
// =============================================================================
export { ConsensusEngine, createConsensusEngine, selectOptimalAlgorithm, RaftConsensus, ByzantineConsensus, GossipConsensus, } from './consensus/index.js';
// =============================================================================
// Coordination Components
// =============================================================================
export { AgentRegistry, createAgentRegistry, } from './coordination/agent-registry.js';
export { TaskOrchestrator, createTaskOrchestrator, } from './coordination/task-orchestrator.js';
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
export { SwarmHub, createSwarmHub, } from './coordination/swarm-hub.js';
// =============================================================================
// Worker Dispatch (agentic-flow@alpha compatible)
// =============================================================================
export { WorkerDispatchService, getWorkerDispatchService, } from './workers/worker-dispatch.js';
// =============================================================================
// Attention Coordinator (Flash/MoE/GraphRoPE)
// =============================================================================
export { AttentionCoordinator, createAttentionCoordinator, } from './attention-coordinator.js';
// =============================================================================
// Federation Hub (Ephemeral Agent Coordination)
// =============================================================================
export { FederationHub, createFederationHub, getDefaultFederationHub, resetDefaultFederationHub, } from './federation-hub.js';
// =============================================================================
// Default Export
// =============================================================================
import { UnifiedSwarmCoordinator } from './unified-coordinator.js';
export default UnifiedSwarmCoordinator;
// =============================================================================
// Constants
// =============================================================================
/** Module version */
export const VERSION = '3.0.0-alpha.1';
/** Performance targets for swarm operations */
export const PERFORMANCE_TARGETS = {
    /** Maximum latency for coordinating 15 agents */
    COORDINATION_LATENCY_MS: 100,
    /** Maximum latency for consensus operations */
    CONSENSUS_LATENCY_MS: 100,
    /** Minimum message throughput */
    MESSAGE_THROUGHPUT: 1000,
};
/** Supported topology types */
export const TOPOLOGY_TYPES = ['mesh', 'hierarchical', 'centralized', 'hybrid'];
/** Supported consensus algorithms */
export const CONSENSUS_ALGORITHMS = ['raft', 'byzantine', 'gossip', 'paxos'];
/** Default swarm configuration */
export const DEFAULT_CONFIG = {
    topology: {
        type: 'hierarchical',
        maxAgents: 15,
    },
    consensus: {
        algorithm: 'raft',
        threshold: 0.66,
        timeoutMs: 5000,
    },
    messageBus: {
        maxQueueSize: 10000,
        batchSize: 100,
    },
    agentPool: {
        minAgents: 1,
        maxAgents: 15,
        idleTimeoutMs: 300000,
    },
};
//# sourceMappingURL=index.js.map