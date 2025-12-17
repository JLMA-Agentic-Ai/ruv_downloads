/**
 * Multi-agent verification system - Pure TypeScript implementation
 * No WASM dependencies - native implementation with @noble/ed25519
 */
import { AgentIdentity } from './identity.js';
export interface AgentVote {
    agentId: string;
    vote: boolean;
    timestamp: number;
    latencyMs: number;
}
export interface VerificationResult {
    isValid: boolean;
    votesFor: number;
    votesAgainst: number;
    totalVotes: number;
    consensusReached: boolean;
    consensusPercentage: number;
    agentVotes: AgentVote[];
    totalLatencyMs: number;
    avgLatencyMs: number;
}
export interface VerificationConfig {
    consensusThreshold: number;
    minAgents: number;
    maxAgents: number;
    timeoutMs: number;
    parallel: boolean;
}
export interface SystemMetrics {
    totalVerifications: number;
    successfulVerifications: number;
    failedVerifications: number;
    avgLatencyMs: number;
    agentCount: number;
}
/**
 * Verification agent - simulates Byzantine fault tolerant agent
 */
declare class VerificationAgent {
    private identity;
    private agentId;
    private metrics;
    constructor(identity: AgentIdentity);
    /**
     * Verify signature using this agent's cryptographic verification
     */
    verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): Promise<AgentVote>;
    getId(): string;
    getIdentity(): AgentIdentity;
    getMetrics(): {
        avgLatency: number;
        verifications: number;
        successes: number;
        failures: number;
        totalLatency: number;
    };
}
/**
 * Multi-agent verification system with Byzantine fault tolerance
 */
export declare class VerificationSystem {
    private config;
    private agents;
    private metrics;
    private totalLatency;
    constructor(config: VerificationConfig);
    /**
     * Add agent to verification pool
     */
    addAgent(identity: AgentIdentity): void;
    /**
     * Verify message with multi-agent consensus
     */
    verifyWithConsensus(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): Promise<VerificationResult>;
    /**
     * Get system performance metrics
     */
    getMetrics(): SystemMetrics;
    /**
     * Get current configuration
     */
    getConfig(): VerificationConfig;
    /**
     * Get agent count
     */
    getAgentCount(): number;
    /**
     * Get all agent identities
     */
    getAgents(): AgentIdentity[];
    /**
     * Get agent metrics
     */
    getAgentMetrics(): Array<{
        agentId: string;
        metrics: ReturnType<VerificationAgent['getMetrics']>;
    }>;
}
/**
 * Builder for VerificationSystem with fluent API
 */
export declare class VerificationSystemBuilder {
    private config;
    private agents;
    /**
     * Set consensus threshold (0.0 - 1.0)
     */
    consensusThreshold(threshold: number): this;
    /**
     * Set minimum number of agents
     */
    minAgents(min: number): this;
    /**
     * Set maximum number of agents
     */
    maxAgents(max: number): this;
    /**
     * Set verification timeout
     */
    timeout(ms: number): this;
    /**
     * Enable/disable parallel verification
     */
    parallel(enabled: boolean): this;
    /**
     * Add agent to verification pool
     */
    addAgent(agent: AgentIdentity): this;
    /**
     * Add multiple agents
     */
    addAgents(agents: AgentIdentity[]): this;
    /**
     * Build verification system
     */
    build(): VerificationSystem;
}
export {};
//# sourceMappingURL=verification.d.ts.map