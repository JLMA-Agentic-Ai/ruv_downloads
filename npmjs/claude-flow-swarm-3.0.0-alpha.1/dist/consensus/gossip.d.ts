/**
 * V3 Gossip Protocol Consensus
 * Eventually consistent consensus for large-scale distributed systems
 */
import { EventEmitter } from 'events';
import { ConsensusProposal, ConsensusVote, ConsensusResult, ConsensusConfig } from '../types.js';
export interface GossipMessage {
    id: string;
    type: 'proposal' | 'vote' | 'state' | 'ack';
    senderId: string;
    version: number;
    payload: unknown;
    timestamp: Date;
    ttl: number;
    hops: number;
    path: string[];
}
export interface GossipNode {
    id: string;
    state: Map<string, unknown>;
    version: number;
    neighbors: Set<string>;
    seenMessages: Set<string>;
    lastSync: Date;
}
export interface GossipConfig extends Partial<ConsensusConfig> {
    fanout?: number;
    gossipIntervalMs?: number;
    maxHops?: number;
    convergenceThreshold?: number;
}
export declare class GossipConsensus extends EventEmitter {
    private config;
    private node;
    private nodes;
    private proposals;
    private messageQueue;
    private gossipInterval?;
    private proposalCounter;
    constructor(nodeId: string, config?: GossipConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    addNode(nodeId: string): void;
    removeNode(nodeId: string): void;
    addNeighbor(nodeId: string): void;
    removeNeighbor(nodeId: string): void;
    propose(value: unknown): Promise<ConsensusProposal>;
    vote(proposalId: string, vote: ConsensusVote): Promise<void>;
    awaitConsensus(proposalId: string): Promise<ConsensusResult>;
    private startGossipLoop;
    private gossipRound;
    private selectRandomNeighbors;
    private sendToNeighbor;
    private processReceivedMessage;
    private handleProposalMessage;
    private handleVoteMessage;
    private handleStateMessage;
    private queueMessage;
    private checkConvergence;
    private createResult;
    getConvergence(proposalId: string): number;
    getVersion(): number;
    getNeighborCount(): number;
    getSeenMessageCount(): number;
    getQueueDepth(): number;
    antiEntropy(): Promise<void>;
}
export declare function createGossipConsensus(nodeId: string, config?: GossipConfig): GossipConsensus;
//# sourceMappingURL=gossip.d.ts.map