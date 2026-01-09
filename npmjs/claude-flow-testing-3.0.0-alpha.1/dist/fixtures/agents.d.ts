/**
 * V3 Claude-Flow Agent Fixtures
 *
 * Test data for agent-related testing
 * Following London School principle of explicit test data
 */
import type { V3AgentType } from '../helpers/swarm-instance.js';
/**
 * Agent configuration fixtures
 */
export interface AgentConfig {
    type: V3AgentType;
    name: string;
    capabilities: string[];
    priority?: number;
    metadata?: Record<string, unknown>;
}
/**
 * Agent instance fixtures
 */
export interface AgentInstance {
    id: string;
    type: V3AgentType;
    name: string;
    status: 'idle' | 'busy' | 'terminated';
    capabilities: string[];
    createdAt: Date;
    lastActiveAt?: Date;
}
/**
 * Pre-defined agent configurations for testing
 */
export declare const agentConfigs: Record<string, AgentConfig>;
/**
 * Pre-defined agent instances for testing
 */
export declare const agentInstances: Record<string, AgentInstance>;
/**
 * Factory function to create agent config with overrides
 */
export declare function createAgentConfig(base: keyof typeof agentConfigs, overrides?: Partial<AgentConfig>): AgentConfig;
/**
 * Factory function to create agent instance with overrides
 */
export declare function createAgentInstance(base: keyof typeof agentInstances, overrides?: Partial<AgentInstance>): AgentInstance;
/**
 * Create a full 15-agent swarm configuration
 */
export declare function create15AgentSwarmConfig(): AgentConfig[];
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
};
//# sourceMappingURL=agents.d.ts.map