/**
 * V3 Unified Swarm Coordinator
 * Consolidates SwarmCoordinator, HiveMind, Maestro, and AgentManager into a single system
 * Supports the 15-agent hierarchical mesh structure with domain-based task routing
 *
 * Performance Targets:
 * - Agent coordination: <100ms for 15 agents
 * - Consensus: <100ms
 * - Message throughput: 1000+ msgs/sec
 *
 * Agent Hierarchy:
 * - Queen (Agent 1): Top-level coordinator
 * - Security Domain (Agents 2-4): security-architect, security-auditor, test-architect
 * - Core Domain (Agents 5-9): core-architect, type-modernization, memory-specialist, swarm-specialist, mcp-optimizer
 * - Integration Domain (Agents 10-12): integration-architect, cli-modernizer, neural-integrator
 * - Support Domain (Agents 13-15): test-architect, performance-engineer, deployment-engineer
 */
import { EventEmitter } from 'events';
import { SwarmId, AgentState, AgentType, AgentStatus, AgentMetrics, TaskDefinition, TaskStatus, TaskPriority, CoordinatorConfig, CoordinatorState, CoordinatorMetrics, SwarmStatus, TopologyType, ConsensusResult, Message, PerformanceReport, IUnifiedSwarmCoordinator } from './types.js';
import { AgentPool } from './agent-pool.js';
export type AgentDomain = 'queen' | 'security' | 'core' | 'integration' | 'support';
export interface DomainConfig {
    name: AgentDomain;
    agentNumbers: number[];
    priority: number;
    capabilities: string[];
    description: string;
}
export interface TaskAssignment {
    taskId: string;
    domain: AgentDomain;
    agentId: string;
    priority: TaskPriority;
    assignedAt: Date;
}
export interface ParallelExecutionResult {
    taskId: string;
    domain: AgentDomain;
    success: boolean;
    result?: unknown;
    error?: Error;
    durationMs: number;
}
export interface DomainStatus {
    name: AgentDomain;
    agentCount: number;
    availableAgents: number;
    busyAgents: number;
    tasksQueued: number;
    tasksCompleted: number;
}
export declare class UnifiedSwarmCoordinator extends EventEmitter implements IUnifiedSwarmCoordinator {
    private config;
    private state;
    private topologyManager;
    private messageBus;
    private consensusEngine;
    private agentPools;
    private domainConfigs;
    private domainPools;
    private agentDomainMap;
    private taskAssignments;
    private domainTaskQueues;
    private startTime?;
    private taskCounter;
    private agentCounter;
    private coordinationLatencies;
    private lastMetricsUpdate;
    private heartbeatInterval?;
    private healthCheckInterval?;
    private metricsInterval?;
    constructor(config?: Partial<CoordinatorConfig>);
    private initializeDomainConfigs;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    registerAgent(agentData: Omit<AgentState, 'id'>): Promise<string>;
    unregisterAgent(agentId: string): Promise<void>;
    getAgent(agentId: string): AgentState | undefined;
    getAllAgents(): AgentState[];
    getAgentsByType(type: AgentType): AgentState[];
    getAvailableAgents(): AgentState[];
    submitTask(taskData: Omit<TaskDefinition, 'id' | 'status' | 'createdAt'>): Promise<string>;
    cancelTask(taskId: string): Promise<void>;
    getTask(taskId: string): TaskDefinition | undefined;
    getAllTasks(): TaskDefinition[];
    getTasksByStatus(status: TaskStatus): TaskDefinition[];
    proposeConsensus(value: unknown): Promise<ConsensusResult>;
    broadcastMessage(payload: unknown, priority?: Message['priority']): Promise<void>;
    getState(): CoordinatorState;
    getMetrics(): CoordinatorMetrics;
    getPerformanceReport(): PerformanceReport;
    private createDefaultConfig;
    private createInitialState;
    private initializeAgentPools;
    private initializeDomainPools;
    private domainToAgentType;
    private setupEventForwarding;
    private startBackgroundProcesses;
    private stopBackgroundProcesses;
    private assignTask;
    private scoreAgentForTask;
    private mapTaskPriorityToMessagePriority;
    private determineTopologyRole;
    private handleAgentMessage;
    private handleTaskComplete;
    private handleTaskFail;
    private handleHeartbeat;
    private handleStatusUpdate;
    private checkHeartbeats;
    private recoverAgent;
    private performHealthChecks;
    private updateMetrics;
    private recordCoordinationLatency;
    private calculateTaskThroughput;
    private calculateAgentUtilization;
    private emitEvent;
    getTopology(): TopologyType;
    setTopology(type: TopologyType): void;
    getConsensusAlgorithm(): string;
    isHealthy(): boolean;
    getAgentPool(type: AgentType): AgentPool | undefined;
    /**
     * Assign a task to a specific domain
     * Routes the task to the most suitable agent within that domain
     */
    assignTaskToDomain(taskId: string, domain: AgentDomain): Promise<string | undefined>;
    /**
     * Get all agents belonging to a specific domain
     */
    getAgentsByDomain(domain: AgentDomain): AgentState[];
    /**
     * Execute multiple tasks in parallel across different domains
     * This is the key method for achieving >85% agent utilization
     */
    executeParallel(tasks: Array<{
        task: Omit<TaskDefinition, 'id' | 'status' | 'createdAt'>;
        domain: AgentDomain;
    }>): Promise<ParallelExecutionResult[]>;
    private executeTaskInDomain;
    private waitForQueuedTask;
    private waitForTaskCompletion;
    /**
     * Get the current status of all domains
     */
    getStatus(): {
        swarmId: SwarmId;
        status: SwarmStatus;
        topology: TopologyType;
        domains: DomainStatus[];
        metrics: CoordinatorMetrics;
    };
    /**
     * Register an agent and automatically assign it to the appropriate domain
     * based on its agent number (1-15)
     */
    registerAgentWithDomain(agentData: Omit<AgentState, 'id'>, agentNumber: number): Promise<{
        agentId: string;
        domain: AgentDomain;
    }>;
    /**
     * Get the domain for a given agent number (1-15)
     */
    getAgentDomain(agentNumber: number): AgentDomain;
    /**
     * Spawn the full 15-agent hierarchy
     * Returns a map of agent numbers to their IDs and domains
     */
    spawnFullHierarchy(): Promise<Map<number, {
        agentId: string;
        domain: AgentDomain;
    }>>;
    private createDomainCapabilities;
    private createDefaultAgentMetrics;
    /**
     * Get the domain pool for a specific domain
     */
    getDomainPool(domain: AgentDomain): AgentPool | undefined;
    /**
     * Get all domain configurations
     */
    getDomainConfigs(): Map<AgentDomain, DomainConfig>;
    /**
     * Release an agent back to its domain pool after task completion
     */
    releaseAgentToDomain(agentId: string): Promise<void>;
    /**
     * Spawn a new agent (MCP-compatible alias for registerAgent)
     * Compatible with agentic-flow@alpha's agent spawn API
     *
     * @param options - Agent spawn options
     * @returns Spawned agent ID and details
     */
    spawnAgent(options: {
        type: AgentType;
        name?: string;
        capabilities?: string[];
        domain?: AgentDomain;
        agentNumber?: number;
        metadata?: Record<string, unknown>;
    }): Promise<{
        agentId: string;
        domain: AgentDomain;
        status: AgentStatus;
        spawned: boolean;
    }>;
    /**
     * Terminate an agent (MCP-compatible alias for unregisterAgent)
     * Compatible with agentic-flow@alpha's agent terminate API
     *
     * @param agentId - Agent ID to terminate
     * @param options - Termination options
     * @returns Termination result
     */
    terminateAgent(agentId: string, options?: {
        force?: boolean;
        reason?: string;
        gracePeriodMs?: number;
    }): Promise<{
        terminated: boolean;
        agentId: string;
        reason?: string;
        tasksReassigned?: number;
    }>;
    /**
     * Get agent status by ID (MCP-compatible)
     */
    getAgentStatus(agentId: string): Promise<{
        found: boolean;
        agentId: string;
        status?: AgentStatus;
        domain?: AgentDomain;
        workload?: number;
        health?: number;
        currentTask?: string;
        metrics?: AgentMetrics;
    }>;
    /**
     * List all agents with optional filters (MCP-compatible)
     */
    listAgents(filters?: {
        status?: AgentStatus;
        domain?: AgentDomain;
        type?: AgentType;
        available?: boolean;
    }): Array<{
        agentId: string;
        name: string;
        type: AgentType;
        status: AgentStatus;
        domain?: AgentDomain;
        workload: number;
        health: number;
    }>;
    private createCapabilitiesFromList;
    private agentTypeToDomain;
}
export declare function createUnifiedSwarmCoordinator(config?: Partial<CoordinatorConfig>): UnifiedSwarmCoordinator;
//# sourceMappingURL=unified-coordinator.d.ts.map