/**
 * @claude-flow/testing - Agent Fixtures
 *
 * Comprehensive mock agents and agent configurations for testing V3 modules.
 * Supports all 15 V3 specialized swarm agents plus core development agents.
 *
 * Based on ADR-002 (Domain-Driven Design) and V3 agent specifications.
 */
import { type Mock } from 'vitest';
/**
 * Agent types for V3 15-agent swarm
 */
export type V3AgentType = 'queen-coordinator' | 'security-architect' | 'security-auditor' | 'memory-specialist' | 'swarm-specialist' | 'integration-architect' | 'performance-engineer' | 'core-architect' | 'test-architect' | 'project-coordinator' | 'coder' | 'reviewer' | 'tester' | 'planner' | 'researcher';
/**
 * Agent status type
 */
export type AgentStatus = 'idle' | 'busy' | 'terminated' | 'error' | 'starting';
/**
 * Agent configuration interface
 */
export interface AgentConfig {
    type: V3AgentType;
    name: string;
    capabilities: string[];
    priority?: number;
    metadata?: Record<string, unknown>;
    systemPrompt?: string;
    tools?: string[];
    maxConcurrentTasks?: number;
    timeout?: number;
}
/**
 * Agent instance interface
 */
export interface AgentInstance {
    id: string;
    type: V3AgentType;
    name: string;
    status: AgentStatus;
    capabilities: string[];
    createdAt: Date;
    lastActiveAt?: Date;
    currentTaskId?: string;
    metrics?: AgentMetrics;
}
/**
 * Agent metrics interface
 */
export interface AgentMetrics {
    tasksCompleted: number;
    tasksFailed: number;
    avgTaskDuration: number;
    totalDuration: number;
    errorRate: number;
    memoryUsageMb: number;
}
/**
 * Agent permissions interface
 */
export interface AgentPermissions {
    canSpawnAgents: boolean;
    canTerminateAgents: boolean;
    canAccessFiles: boolean;
    canExecuteCommands: boolean;
    canAccessNetwork: boolean;
    canAccessMemory: boolean;
    maxMemoryMb?: number;
    maxCpuPercent?: number;
    allowedPaths?: string[];
    blockedPaths?: string[];
}
/**
 * Agent spawn result interface
 */
export interface AgentSpawnResult {
    agent: AgentInstance;
    sessionId: string;
    startupTime: number;
    success: boolean;
    error?: Error;
}
/**
 * Agent termination result interface
 */
export interface AgentTerminationResult {
    agentId: string;
    success: boolean;
    duration: number;
    tasksTerminated: number;
    error?: Error;
}
/**
 * Agent health check result interface
 */
export interface AgentHealthCheckResult {
    agentId: string;
    status: AgentStatus;
    healthy: boolean;
    lastActivity: Date;
    metrics: AgentMetrics;
    issues?: string[];
}
/**
 * Capability definitions for each agent type
 */
export declare const agentCapabilities: Record<V3AgentType, string[]>;
/**
 * Pre-defined agent configurations for testing
 */
export declare const agentConfigs: Record<string, AgentConfig>;
/**
 * Pre-defined agent instances for testing
 */
export declare const agentInstances: Record<string, AgentInstance>;
/**
 * Default agent permissions for testing
 */
export declare const agentPermissions: Record<string, AgentPermissions>;
/**
 * Factory function to create agent config with overrides
 */
export declare function createAgentConfig(base: keyof typeof agentConfigs | V3AgentType, overrides?: Partial<AgentConfig>): AgentConfig;
/**
 * Factory function to create agent instance with overrides
 */
export declare function createAgentInstance(base: keyof typeof agentInstances | V3AgentType, overrides?: Partial<AgentInstance>): AgentInstance;
/**
 * Factory function to create spawn result
 */
export declare function createAgentSpawnResult(agent: Partial<AgentInstance>, overrides?: Partial<AgentSpawnResult>): AgentSpawnResult;
/**
 * Factory function to create termination result
 */
export declare function createAgentTerminationResult(agentId: string, overrides?: Partial<AgentTerminationResult>): AgentTerminationResult;
/**
 * Factory function to create health check result
 */
export declare function createAgentHealthCheckResult(agentId: string, overrides?: Partial<AgentHealthCheckResult>): AgentHealthCheckResult;
/**
 * Create a full 15-agent V3 swarm configuration
 */
export declare function createV3SwarmAgentConfigs(): AgentConfig[];
/**
 * Create instances for all 15 V3 agents
 */
export declare function createV3SwarmAgentInstances(): AgentInstance[];
/**
 * Create agents grouped by domain
 */
export declare function createAgentsByDomain(): Record<string, AgentConfig[]>;
/**
 * Invalid agent configurations for error testing
 */
export declare const invalidAgentConfigs: {
    emptyName: {
        type: V3AgentType;
        name: string;
        capabilities: string[];
    };
    noCapabilities: {
        type: V3AgentType;
        name: string;
        capabilities: never[];
    };
    invalidType: {
        type: V3AgentType;
        name: string;
        capabilities: string[];
    };
    negativePriority: {
        type: V3AgentType;
        name: string;
        capabilities: string[];
        priority: number;
    };
    zeroTimeout: {
        type: V3AgentType;
        name: string;
        capabilities: string[];
        timeout: number;
    };
    excessiveConcurrency: {
        type: V3AgentType;
        name: string;
        capabilities: string[];
        maxConcurrentTasks: number;
    };
};
/**
 * Mock agent interface for behavior testing
 */
export interface MockAgent {
    id: string;
    type: V3AgentType;
    status: AgentStatus;
    capabilities: string[];
    execute: Mock<(task: unknown) => Promise<unknown>>;
    communicate: Mock<(message: unknown) => Promise<void>>;
    terminate: Mock<() => Promise<void>>;
    getMetrics: Mock<() => AgentMetrics>;
}
/**
 * Create a mock agent for testing
 */
export declare function createMockAgent(type?: V3AgentType, overrides?: Partial<AgentInstance>): MockAgent;
/**
 * Create multiple mock agents
 */
export declare function createMockAgents(types: V3AgentType[]): MockAgent[];
/**
 * Create a mock V3 15-agent swarm
 */
export declare function createMockV3Swarm(): MockAgent[];
//# sourceMappingURL=agent-fixtures.d.ts.map