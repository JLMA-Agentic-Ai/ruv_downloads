/**
 * V3 Swarm Hub - COMPATIBILITY LAYER (ADR-003)
 *
 * DEPRECATION NOTICE:
 * This is a THIN FACADE over UnifiedSwarmCoordinator for backward compatibility.
 * All operations are delegated to the canonical UnifiedSwarmCoordinator.
 *
 * For new code, use UnifiedSwarmCoordinator directly:
 * ```typescript
 * import { createUnifiedSwarmCoordinator } from '@claude-flow/swarm';
 * const coordinator = createUnifiedSwarmCoordinator(config);
 * await coordinator.initialize();
 * ```
 *
 * ADR-003 Decision:
 * - ONE canonical coordination engine: UnifiedSwarmCoordinator
 * - SwarmHub maintained ONLY for compatibility with existing code
 * - All core logic delegated to UnifiedSwarmCoordinator
 *
 * Based on ADR-001 (agentic-flow integration), ADR-003 (Single Coordination Engine),
 * and the 15-Agent Swarm Architecture
 */
import { AgentId, AgentDomain, AgentState, TaskId, TaskDefinition, TaskResult, PhaseId, PhaseDefinition, MilestoneDefinition, SwarmConfig, SwarmState, SwarmMetrics, SwarmMessage, MessageType, MessageHandler, EventHandler } from '../shared/types';
import { IEventBus } from '../shared/events';
import { IAgentRegistry } from './agent-registry';
import { ITaskOrchestrator, TaskSpec } from './task-orchestrator';
import { UnifiedSwarmCoordinator } from '../unified-coordinator';
export interface ISwarmHub {
    initialize(config?: Partial<SwarmConfig>): Promise<void>;
    shutdown(): Promise<void>;
    isInitialized(): boolean;
    spawnAgent(agentId: AgentId): Promise<AgentState>;
    spawnAllAgents(): Promise<Map<AgentId, AgentState>>;
    spawnAgentsByDomain(domain: AgentDomain): Promise<AgentState[]>;
    terminateAgent(agentId: AgentId): Promise<boolean>;
    submitTask(spec: TaskSpec): TaskDefinition;
    submitBatchTasks(specs: TaskSpec[]): TaskDefinition[];
    assignNextTask(agentId: AgentId): TaskDefinition | undefined;
    completeTask(taskId: TaskId, result: TaskResult): void;
    getCurrentPhase(): PhaseId;
    advancePhase(): PhaseId;
    getPhaseDefinition(phaseId: PhaseId): PhaseDefinition;
    getMilestones(): MilestoneDefinition[];
    completeMilestone(milestoneId: string): void;
    sendMessage<T>(message: Omit<SwarmMessage<T>, 'id' | 'timestamp'>): void;
    broadcast<T>(from: AgentId, type: MessageType, payload: T): void;
    onMessage<T>(handler: MessageHandler<T>): () => void;
    getState(): SwarmState;
    getMetrics(): SwarmMetrics;
    getAgentRegistry(): IAgentRegistry;
    getTaskOrchestrator(): ITaskOrchestrator;
    onSwarmEvent(handler: EventHandler): () => void;
}
/**
 * @deprecated Use UnifiedSwarmCoordinator directly instead.
 * This class is maintained for backward compatibility only.
 *
 * Migration guide:
 * ```typescript
 * // OLD:
 * const hub = createSwarmHub();
 * await hub.initialize();
 *
 * // NEW:
 * const coordinator = createUnifiedSwarmCoordinator();
 * await coordinator.initialize();
 * ```
 */
export declare class SwarmHub implements ISwarmHub {
    private coordinator;
    private eventBus;
    private agentRegistry;
    private taskOrchestrator;
    private currentPhase;
    private phases;
    private milestones;
    private messageHandlers;
    private messageCounter;
    private startTime;
    constructor(eventBus?: IEventBus);
    /**
     * @deprecated Delegates to UnifiedSwarmCoordinator.initialize()
     */
    initialize(config?: Partial<SwarmConfig>): Promise<void>;
    /**
     * @deprecated Delegates to UnifiedSwarmCoordinator.shutdown()
     */
    shutdown(): Promise<void>;
    /**
     * @deprecated Check UnifiedSwarmCoordinator state instead
     */
    isInitialized(): boolean;
    spawnAgent(agentId: AgentId): Promise<AgentState>;
    spawnAllAgents(): Promise<Map<AgentId, AgentState>>;
    spawnAgentsByDomain(domain: AgentDomain): Promise<AgentState[]>;
    terminateAgent(agentId: AgentId): Promise<boolean>;
    submitTask(spec: TaskSpec): TaskDefinition;
    submitBatchTasks(specs: TaskSpec[]): TaskDefinition[];
    assignNextTask(agentId: AgentId): TaskDefinition | undefined;
    completeTask(taskId: TaskId, result: TaskResult): void;
    getCurrentPhase(): PhaseId;
    advancePhase(): PhaseId;
    getPhaseDefinition(phaseId: PhaseId): PhaseDefinition;
    getMilestones(): MilestoneDefinition[];
    completeMilestone(milestoneId: string): void;
    sendMessage<T>(message: Omit<SwarmMessage<T>, 'id' | 'timestamp'>): void;
    broadcast<T>(from: AgentId, type: MessageType, payload: T): void;
    onMessage<T>(handler: MessageHandler<T>): () => void;
    getState(): SwarmState;
    getMetrics(): SwarmMetrics;
    getAgentRegistry(): IAgentRegistry;
    getTaskOrchestrator(): ITaskOrchestrator;
    onSwarmEvent(handler: EventHandler): () => void;
    /**
     * Get the underlying UnifiedSwarmCoordinator for direct access.
     * This is the canonical coordination engine as per ADR-003.
     *
     * Use this to access advanced features not exposed by the SwarmHub facade.
     */
    getCoordinator(): UnifiedSwarmCoordinator;
    private ensureInitialized;
    private convertToCoordinatorConfig;
    private createPhaseDefinitions;
    private initializeMilestones;
}
/**
 * @deprecated Use createUnifiedSwarmCoordinator() instead.
 * This factory is maintained for backward compatibility only.
 *
 * Migration:
 * ```typescript
 * // OLD:
 * const hub = createSwarmHub();
 *
 * // NEW:
 * import { createUnifiedSwarmCoordinator } from '@claude-flow/swarm';
 * const coordinator = createUnifiedSwarmCoordinator();
 * ```
 */
export declare function createSwarmHub(eventBus?: IEventBus): ISwarmHub;
/**
 * @deprecated Use UnifiedSwarmCoordinator singleton pattern instead.
 * This function is maintained for backward compatibility only.
 */
export declare function getSwarmHub(): ISwarmHub;
/**
 * @deprecated Use coordinator.shutdown() directly instead.
 */
export declare function resetSwarmHub(): void;
//# sourceMappingURL=swarm-hub.d.ts.map