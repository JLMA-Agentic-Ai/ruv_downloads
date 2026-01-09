/**
 * V3 Agent Pool
 * Manages agent lifecycle, pooling, and auto-scaling
 */
import { EventEmitter } from 'events';
import { AgentState, AgentMetrics, AgentPoolConfig, AgentPoolState, IAgentPool } from './types.js';
export declare class AgentPool extends EventEmitter implements IAgentPool {
    private config;
    private pooledAgents;
    private available;
    private busy;
    private pendingScale;
    private lastScaleOperation?;
    private healthCheckInterval?;
    private agentCounter;
    constructor(config?: Partial<AgentPoolConfig>);
    initialize(config?: AgentPoolConfig): Promise<void>;
    shutdown(): Promise<void>;
    acquire(): Promise<AgentState | undefined>;
    release(agentId: string): Promise<void>;
    add(agent: AgentState): Promise<void>;
    remove(agentId: string): Promise<void>;
    scale(delta: number): Promise<void>;
    getState(): AgentPoolState;
    getAvailableCount(): number;
    getBusyCount(): number;
    getTotalCount(): number;
    getUtilization(): number;
    private createPooledAgent;
    private createDefaultCapabilities;
    private createDefaultMetrics;
    private checkScaling;
    private startHealthChecks;
    private performHealthChecks;
    private replaceUnhealthyAgent;
    getAgent(agentId: string): AgentState | undefined;
    getAllAgents(): AgentState[];
    getAvailableAgents(): AgentState[];
    getBusyAgents(): AgentState[];
    updateAgentHeartbeat(agentId: string): void;
    updateAgentMetrics(agentId: string, metrics: Partial<AgentMetrics>): void;
    getPoolStats(): {
        total: number;
        available: number;
        busy: number;
        utilization: number;
        avgHealth: number;
        avgUsageCount: number;
    };
}
export declare function createAgentPool(config?: Partial<AgentPoolConfig>): AgentPool;
//# sourceMappingURL=agent-pool.d.ts.map