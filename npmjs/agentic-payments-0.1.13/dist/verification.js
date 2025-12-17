/**
 * Multi-agent verification system - Pure TypeScript implementation
 * No WASM dependencies - native implementation with @noble/ed25519
 */
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { PaymentError, PaymentErrorCode } from './errors.js';
// Configure noble/ed25519 to use SHA-512
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
/**
 * Verification agent - simulates Byzantine fault tolerant agent
 */
class VerificationAgent {
    identity;
    agentId;
    metrics;
    constructor(identity) {
        this.identity = identity;
        this.agentId = identity.did();
        this.metrics = {
            verifications: 0,
            successes: 0,
            failures: 0,
            totalLatency: 0,
        };
    }
    /**
     * Verify signature using this agent's cryptographic verification
     */
    async verify(signature, message, publicKey) {
        const startTime = Date.now();
        try {
            const isValid = await ed.verifyAsync(signature, message, publicKey);
            const latencyMs = Date.now() - startTime;
            this.metrics.verifications++;
            if (isValid) {
                this.metrics.successes++;
            }
            else {
                this.metrics.failures++;
            }
            this.metrics.totalLatency += latencyMs;
            return {
                agentId: this.agentId,
                vote: isValid,
                timestamp: Date.now(),
                latencyMs,
            };
        }
        catch (error) {
            const latencyMs = Date.now() - startTime;
            this.metrics.verifications++;
            this.metrics.failures++;
            this.metrics.totalLatency += latencyMs;
            return {
                agentId: this.agentId,
                vote: false,
                timestamp: Date.now(),
                latencyMs,
            };
        }
    }
    getId() {
        return this.agentId;
    }
    getIdentity() {
        return this.identity;
    }
    getMetrics() {
        return {
            ...this.metrics,
            avgLatency: this.metrics.verifications > 0 ? this.metrics.totalLatency / this.metrics.verifications : 0,
        };
    }
}
/**
 * Multi-agent verification system with Byzantine fault tolerance
 */
export class VerificationSystem {
    config;
    agents = [];
    metrics = {
        totalVerifications: 0,
        successfulVerifications: 0,
        failedVerifications: 0,
        avgLatencyMs: 0,
        agentCount: 0,
    };
    totalLatency = 0;
    constructor(config) {
        this.config = config;
    }
    /**
     * Add agent to verification pool
     */
    addAgent(identity) {
        if (this.agents.length >= this.config.maxAgents) {
            throw new PaymentError(PaymentErrorCode.SYSTEM_ERROR, `Maximum agents reached: ${this.config.maxAgents}`);
        }
        const agent = new VerificationAgent(identity);
        this.agents.push(agent);
        this.metrics.agentCount = this.agents.length;
    }
    /**
     * Verify message with multi-agent consensus
     */
    async verifyWithConsensus(signature, message, publicKey) {
        if (this.agents.length < this.config.minAgents) {
            throw new PaymentError(PaymentErrorCode.CONSENSUS_ERROR, `Insufficient agents: ${this.agents.length} < ${this.config.minAgents}`);
        }
        const startTime = Date.now();
        try {
            // Run verification with all agents
            let agentVotes;
            if (this.config.parallel) {
                // Parallel verification - all agents verify simultaneously
                agentVotes = await Promise.all(this.agents.map(agent => agent.verify(signature, message, publicKey)));
            }
            else {
                // Sequential verification - agents verify one by one
                agentVotes = [];
                for (const agent of this.agents) {
                    const vote = await agent.verify(signature, message, publicKey);
                    agentVotes.push(vote);
                }
            }
            // Calculate consensus
            const votesFor = agentVotes.filter(v => v.vote === true).length;
            const votesAgainst = agentVotes.filter(v => v.vote === false).length;
            const totalVotes = agentVotes.length;
            const consensusPercentage = votesFor / totalVotes;
            const consensusReached = consensusPercentage >= this.config.consensusThreshold;
            // Calculate latency metrics
            const totalLatencyMs = Date.now() - startTime;
            const avgLatencyMs = agentVotes.reduce((sum, v) => sum + v.latencyMs, 0) / totalVotes;
            // Update system metrics
            this.metrics.totalVerifications++;
            if (consensusReached && votesFor > votesAgainst) {
                this.metrics.successfulVerifications++;
            }
            else {
                this.metrics.failedVerifications++;
            }
            this.totalLatency += totalLatencyMs;
            this.metrics.avgLatencyMs = this.totalLatency / this.metrics.totalVerifications;
            const result = {
                isValid: consensusReached && votesFor > votesAgainst,
                votesFor,
                votesAgainst,
                totalVotes,
                consensusReached,
                consensusPercentage,
                agentVotes,
                totalLatencyMs,
                avgLatencyMs,
            };
            return result;
        }
        catch (error) {
            this.metrics.totalVerifications++;
            this.metrics.failedVerifications++;
            throw new PaymentError(PaymentErrorCode.CONSENSUS_ERROR, `Verification failed: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
    /**
     * Get system performance metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get agent count
     */
    getAgentCount() {
        return this.agents.length;
    }
    /**
     * Get all agent identities
     */
    getAgents() {
        return this.agents.map(a => a.getIdentity());
    }
    /**
     * Get agent metrics
     */
    getAgentMetrics() {
        return this.agents.map(agent => ({
            agentId: agent.getId(),
            metrics: agent.getMetrics(),
        }));
    }
}
/**
 * Builder for VerificationSystem with fluent API
 */
export class VerificationSystemBuilder {
    config = {
        consensusThreshold: 0.67,
        minAgents: 2,
        maxAgents: 10,
        timeoutMs: 5000,
        parallel: true,
    };
    agents = [];
    /**
     * Set consensus threshold (0.0 - 1.0)
     */
    consensusThreshold(threshold) {
        if (threshold < 0 || threshold > 1) {
            throw new Error('Consensus threshold must be between 0 and 1');
        }
        this.config.consensusThreshold = threshold;
        return this;
    }
    /**
     * Set minimum number of agents
     */
    minAgents(min) {
        if (min < 1) {
            throw new Error('Minimum agents must be at least 1');
        }
        this.config.minAgents = min;
        return this;
    }
    /**
     * Set maximum number of agents
     */
    maxAgents(max) {
        if (max < this.config.minAgents) {
            throw new Error('Maximum agents must be >= minimum agents');
        }
        this.config.maxAgents = max;
        return this;
    }
    /**
     * Set verification timeout
     */
    timeout(ms) {
        if (ms < 0) {
            throw new Error('Timeout must be non-negative');
        }
        this.config.timeoutMs = ms;
        return this;
    }
    /**
     * Enable/disable parallel verification
     */
    parallel(enabled) {
        this.config.parallel = enabled;
        return this;
    }
    /**
     * Add agent to verification pool
     */
    addAgent(agent) {
        this.agents.push(agent);
        return this;
    }
    /**
     * Add multiple agents
     */
    addAgents(agents) {
        this.agents.push(...agents);
        return this;
    }
    /**
     * Build verification system
     */
    build() {
        if (this.agents.length < this.config.minAgents) {
            throw new PaymentError(PaymentErrorCode.CONSENSUS_ERROR, `Insufficient agents: ${this.agents.length} < ${this.config.minAgents}`);
        }
        const system = new VerificationSystem(this.config);
        // Add all agents
        this.agents.forEach(agent => system.addAgent(agent));
        return system;
    }
}
//# sourceMappingURL=verification.js.map