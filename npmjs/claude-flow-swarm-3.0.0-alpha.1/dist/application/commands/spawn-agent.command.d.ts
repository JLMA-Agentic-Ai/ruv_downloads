/**
 * Spawn Agent Command - Application Layer (CQRS)
 *
 * Command for spawning a new agent in the swarm.
 *
 * @module v3/swarm/application/commands
 */
import { Agent, AgentRole } from '../../domain/entities/agent.js';
import { IAgentRepository } from '../../domain/repositories/agent-repository.interface.js';
/**
 * Spawn Agent Command Input
 */
export interface SpawnAgentInput {
    name: string;
    role: AgentRole;
    domain: string;
    capabilities: string[];
    parentId?: string;
    metadata?: Record<string, unknown>;
    maxConcurrentTasks?: number;
    autoStart?: boolean;
}
/**
 * Spawn Agent Command Result
 */
export interface SpawnAgentResult {
    success: boolean;
    agentId: string;
    agent: Agent;
    startedAutomatically: boolean;
}
/**
 * Spawn Agent Command Handler
 */
export declare class SpawnAgentCommandHandler {
    private readonly repository;
    constructor(repository: IAgentRepository);
    execute(input: SpawnAgentInput): Promise<SpawnAgentResult>;
}
/**
 * Terminate Agent Command Input
 */
export interface TerminateAgentInput {
    agentId: string;
    force?: boolean;
}
/**
 * Terminate Agent Command Result
 */
export interface TerminateAgentResult {
    success: boolean;
    agentId: string;
    tasksReassigned: number;
}
/**
 * Terminate Agent Command Handler
 */
export declare class TerminateAgentCommandHandler {
    private readonly repository;
    constructor(repository: IAgentRepository);
    execute(input: TerminateAgentInput): Promise<TerminateAgentResult>;
}
//# sourceMappingURL=spawn-agent.command.d.ts.map