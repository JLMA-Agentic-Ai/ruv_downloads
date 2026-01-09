/**
 * V3 Consensus Engine Factory
 * Unified interface for different consensus algorithms
 */
import { EventEmitter } from 'events';
import { ConsensusAlgorithm, ConsensusConfig, ConsensusProposal, ConsensusVote, ConsensusResult, IConsensusEngine } from '../types.js';
import { RaftConsensus, RaftConfig } from './raft.js';
import { ByzantineConsensus, ByzantineConfig } from './byzantine.js';
import { GossipConsensus, GossipConfig } from './gossip.js';
export { RaftConsensus, ByzantineConsensus, GossipConsensus };
export type { RaftConfig, ByzantineConfig, GossipConfig };
export declare class ConsensusEngine extends EventEmitter implements IConsensusEngine {
    private config;
    private nodeId;
    private implementation?;
    private proposals;
    constructor(nodeId: string, config?: Partial<ConsensusConfig>);
    initialize(config?: ConsensusConfig): Promise<void>;
    shutdown(): Promise<void>;
    addNode(nodeId: string, options?: {
        isPrimary?: boolean;
    }): void;
    removeNode(nodeId: string): void;
    propose(value: unknown, proposerId?: string): Promise<ConsensusProposal>;
    vote(proposalId: string, vote: ConsensusVote): Promise<void>;
    getProposal(proposalId: string): ConsensusProposal | undefined;
    awaitConsensus(proposalId: string): Promise<ConsensusResult>;
    getActiveProposals(): ConsensusProposal[];
    isLeader(): boolean;
    getLeaderId(): string | undefined;
    getAlgorithm(): ConsensusAlgorithm;
    getConfig(): ConsensusConfig;
    getStats(): {
        algorithm: ConsensusAlgorithm;
        totalProposals: number;
        pendingProposals: number;
        acceptedProposals: number;
        rejectedProposals: number;
        expiredProposals: number;
    };
}
export declare function createConsensusEngine(nodeId: string, algorithm?: ConsensusAlgorithm, config?: Partial<ConsensusConfig>): ConsensusEngine;
export declare function selectOptimalAlgorithm(requirements: {
    faultTolerance: 'crash' | 'byzantine';
    consistency: 'strong' | 'eventual';
    networkScale: 'small' | 'medium' | 'large';
    latencyPriority: 'low' | 'medium' | 'high';
}): ConsensusAlgorithm;
//# sourceMappingURL=index.d.ts.map