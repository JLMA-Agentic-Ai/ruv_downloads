/**
 * V3 Agent Registry
 * Manages registration, lifecycle, and capabilities of all 15 agents
 *
 * Based on ADR-002 (DDD) and 15-Agent Swarm Architecture
 */
import { AgentId, AgentDomain, AgentStatus, AgentDefinition, AgentState, TaskType, TaskId, EventHandler } from '../shared/types';
import { IEventBus } from '../shared/events';
export interface IAgentRegistry {
    register(definition: AgentDefinition): void;
    unregister(agentId: AgentId): boolean;
    isRegistered(agentId: AgentId): boolean;
    spawn(agentId: AgentId): Promise<AgentState>;
    terminate(agentId: AgentId): Promise<boolean>;
    getState(agentId: AgentId): AgentState | undefined;
    updateStatus(agentId: AgentId, status: AgentStatus): void;
    assignTask(agentId: AgentId, taskId: TaskId): void;
    completeTask(agentId: AgentId, taskId: TaskId): void;
    getDefinition(agentId: AgentId): AgentDefinition | undefined;
    getAllAgents(): AgentDefinition[];
    getActiveAgents(): AgentState[];
    getAgentsByDomain(domain: AgentDomain): AgentDefinition[];
    getAgentsByCapability(taskType: TaskType): AgentDefinition[];
    heartbeat(agentId: AgentId): void;
    getHealthStatus(): Map<AgentId, HealthStatus>;
    onAgentEvent(handler: EventHandler): () => void;
}
export interface HealthStatus {
    agentId: AgentId;
    healthy: boolean;
    lastHeartbeat: number;
    consecutiveMisses: number;
    status: AgentStatus;
}
export declare class AgentRegistry implements IAgentRegistry {
    private definitions;
    private states;
    private healthChecks;
    private eventBus;
    private healthCheckInterval;
    private healthCheckTimer;
    private maxMissedHeartbeats;
    constructor(eventBus: IEventBus);
    register(definition: AgentDefinition): void;
    unregister(agentId: AgentId): boolean;
    isRegistered(agentId: AgentId): boolean;
    spawn(agentId: AgentId): Promise<AgentState>;
    terminate(agentId: AgentId): Promise<boolean>;
    getState(agentId: AgentId): AgentState | undefined;
    updateStatus(agentId: AgentId, status: AgentStatus): void;
    assignTask(agentId: AgentId, taskId: TaskId): void;
    completeTask(agentId: AgentId, taskId: TaskId): void;
    getDefinition(agentId: AgentId): AgentDefinition | undefined;
    getAllAgents(): AgentDefinition[];
    getActiveAgents(): AgentState[];
    getAgentsByDomain(domain: AgentDomain): AgentDefinition[];
    getAgentsByCapability(taskType: TaskType): AgentDefinition[];
    heartbeat(agentId: AgentId): void;
    getHealthStatus(): Map<AgentId, HealthStatus>;
    startHealthChecks(): void;
    stopHealthChecks(): void;
    private performHealthCheck;
    onAgentEvent(handler: EventHandler): () => void;
    private registerDefaultAgents;
    private createInitialMetrics;
}
export declare function createAgentRegistry(eventBus: IEventBus): IAgentRegistry;
//# sourceMappingURL=agent-registry.d.ts.map