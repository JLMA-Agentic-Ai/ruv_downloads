/**
 * V3 Consensus Engine Factory
 * Unified interface for different consensus algorithms
 */
import { EventEmitter } from 'events';
import { SWARM_CONSTANTS, } from '../types.js';
import { RaftConsensus, createRaftConsensus } from './raft.js';
import { ByzantineConsensus, createByzantineConsensus } from './byzantine.js';
import { GossipConsensus, createGossipConsensus } from './gossip.js';
export { RaftConsensus, ByzantineConsensus, GossipConsensus };
export class ConsensusEngine extends EventEmitter {
    config;
    nodeId;
    implementation;
    proposals = new Map();
    constructor(nodeId, config = {}) {
        super();
        this.nodeId = nodeId;
        this.config = {
            algorithm: config.algorithm ?? 'raft',
            threshold: config.threshold ?? SWARM_CONSTANTS.DEFAULT_CONSENSUS_THRESHOLD,
            timeoutMs: config.timeoutMs ?? SWARM_CONSTANTS.DEFAULT_CONSENSUS_TIMEOUT_MS,
            maxRounds: config.maxRounds ?? 10,
            requireQuorum: config.requireQuorum ?? true,
        };
    }
    async initialize(config) {
        if (config) {
            this.config = { ...this.config, ...config };
        }
        // Create implementation based on algorithm
        switch (this.config.algorithm) {
            case 'raft':
                this.implementation = createRaftConsensus(this.nodeId, {
                    threshold: this.config.threshold,
                    timeoutMs: this.config.timeoutMs,
                    maxRounds: this.config.maxRounds,
                    requireQuorum: this.config.requireQuorum,
                });
                break;
            case 'byzantine':
                this.implementation = createByzantineConsensus(this.nodeId, {
                    threshold: this.config.threshold,
                    timeoutMs: this.config.timeoutMs,
                    maxRounds: this.config.maxRounds,
                    requireQuorum: this.config.requireQuorum,
                });
                break;
            case 'gossip':
                this.implementation = createGossipConsensus(this.nodeId, {
                    threshold: this.config.threshold,
                    timeoutMs: this.config.timeoutMs,
                    maxRounds: this.config.maxRounds,
                    requireQuorum: this.config.requireQuorum,
                });
                break;
            case 'paxos':
                // Fall back to Raft for Paxos (similar guarantees)
                this.implementation = createRaftConsensus(this.nodeId, {
                    threshold: this.config.threshold,
                    timeoutMs: this.config.timeoutMs,
                    maxRounds: this.config.maxRounds,
                    requireQuorum: this.config.requireQuorum,
                });
                break;
            default:
                throw new Error(`Unknown consensus algorithm: ${this.config.algorithm}`);
        }
        await this.implementation.initialize();
        // Forward events
        this.implementation.on('consensus.achieved', (data) => {
            this.emit('consensus.achieved', data);
        });
        this.implementation.on('leader.elected', (data) => {
            this.emit('leader.elected', data);
        });
        this.emit('initialized', {
            nodeId: this.nodeId,
            algorithm: this.config.algorithm
        });
    }
    async shutdown() {
        if (this.implementation) {
            await this.implementation.shutdown();
        }
        this.emit('shutdown');
    }
    addNode(nodeId, options) {
        if (!this.implementation) {
            throw new Error('Consensus engine not initialized');
        }
        if (this.implementation instanceof RaftConsensus) {
            this.implementation.addPeer(nodeId);
        }
        else if (this.implementation instanceof ByzantineConsensus) {
            this.implementation.addNode(nodeId, options?.isPrimary);
        }
        else if (this.implementation instanceof GossipConsensus) {
            this.implementation.addNode(nodeId);
        }
    }
    removeNode(nodeId) {
        if (!this.implementation) {
            return;
        }
        if (this.implementation instanceof RaftConsensus) {
            this.implementation.removePeer(nodeId);
        }
        else if (this.implementation instanceof ByzantineConsensus) {
            this.implementation.removeNode(nodeId);
        }
        else if (this.implementation instanceof GossipConsensus) {
            this.implementation.removeNode(nodeId);
        }
    }
    async propose(value, proposerId) {
        if (!this.implementation) {
            throw new Error('Consensus engine not initialized');
        }
        const proposal = await this.implementation.propose(value);
        this.proposals.set(proposal.id, proposal);
        return proposal;
    }
    async vote(proposalId, vote) {
        if (!this.implementation) {
            throw new Error('Consensus engine not initialized');
        }
        await this.implementation.vote(proposalId, vote);
    }
    getProposal(proposalId) {
        return this.proposals.get(proposalId);
    }
    async awaitConsensus(proposalId) {
        if (!this.implementation) {
            throw new Error('Consensus engine not initialized');
        }
        return this.implementation.awaitConsensus(proposalId);
    }
    getActiveProposals() {
        return Array.from(this.proposals.values()).filter(p => p.status === 'pending');
    }
    // Algorithm-specific queries
    isLeader() {
        if (this.implementation instanceof RaftConsensus) {
            return this.implementation.isLeader();
        }
        if (this.implementation instanceof ByzantineConsensus) {
            return this.implementation.isPrimary();
        }
        return false; // Gossip has no leader
    }
    getLeaderId() {
        if (this.implementation instanceof RaftConsensus) {
            return this.implementation.getLeaderId();
        }
        return undefined;
    }
    getAlgorithm() {
        return this.config.algorithm;
    }
    getConfig() {
        return { ...this.config };
    }
    // Metrics
    getStats() {
        const proposals = Array.from(this.proposals.values());
        return {
            algorithm: this.config.algorithm,
            totalProposals: proposals.length,
            pendingProposals: proposals.filter(p => p.status === 'pending').length,
            acceptedProposals: proposals.filter(p => p.status === 'accepted').length,
            rejectedProposals: proposals.filter(p => p.status === 'rejected').length,
            expiredProposals: proposals.filter(p => p.status === 'expired').length,
        };
    }
}
// Factory function
export function createConsensusEngine(nodeId, algorithm = 'raft', config) {
    return new ConsensusEngine(nodeId, { ...config, algorithm });
}
// Helper to select optimal algorithm based on requirements
export function selectOptimalAlgorithm(requirements) {
    const { faultTolerance, consistency, networkScale, latencyPriority } = requirements;
    // Byzantine fault tolerance required
    if (faultTolerance === 'byzantine') {
        return 'byzantine';
    }
    // Eventual consistency acceptable and large scale
    if (consistency === 'eventual' && networkScale === 'large') {
        return 'gossip';
    }
    // Low latency priority with medium scale
    if (latencyPriority === 'high' && networkScale !== 'large') {
        return 'raft';
    }
    // Strong consistency with small/medium scale
    if (consistency === 'strong') {
        return 'raft';
    }
    // Default to Raft
    return 'raft';
}
//# sourceMappingURL=index.js.map