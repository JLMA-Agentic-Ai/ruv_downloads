/**
 * V3 Byzantine Fault Tolerant Consensus
 * PBFT-style consensus for handling malicious or faulty nodes
 */
import { EventEmitter } from 'events';
import { ConsensusProposal, ConsensusVote, ConsensusResult, ConsensusConfig } from '../types.js';
export type ByzantinePhase = 'pre-prepare' | 'prepare' | 'commit' | 'reply';
export interface ByzantineMessage {
    type: ByzantinePhase;
    viewNumber: number;
    sequenceNumber: number;
    digest: string;
    senderId: string;
    timestamp: Date;
    payload?: unknown;
    signature?: string;
}
export interface ByzantineNode {
    id: string;
    isPrimary: boolean;
    viewNumber: number;
    sequenceNumber: number;
    preparedMessages: Map<string, ByzantineMessage[]>;
    committedMessages: Map<string, ByzantineMessage[]>;
}
export interface ByzantineConfig extends Partial<ConsensusConfig> {
    maxFaultyNodes?: number;
    viewChangeTimeoutMs?: number;
}
export declare class ByzantineConsensus extends EventEmitter {
    private config;
    private node;
    private nodes;
    private proposals;
    private messageLog;
    private proposalCounter;
    private viewChangeTimeout?;
    constructor(nodeId: string, config?: ByzantineConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    addNode(nodeId: string, isPrimary?: boolean): void;
    removeNode(nodeId: string): void;
    electPrimary(): string;
    propose(value: unknown): Promise<ConsensusProposal>;
    vote(proposalId: string, vote: ConsensusVote): Promise<void>;
    awaitConsensus(proposalId: string): Promise<ConsensusResult>;
    handlePrePrepare(message: ByzantineMessage): Promise<void>;
    handlePrepare(message: ByzantineMessage): Promise<void>;
    handleCommit(message: ByzantineMessage): Promise<void>;
    initiateViewChange(): Promise<void>;
    private broadcastMessage;
    private computeDigest;
    private createResult;
    isPrimary(): boolean;
    getViewNumber(): number;
    getSequenceNumber(): number;
    getPreparedCount(): number;
    getCommittedCount(): number;
    getMaxFaultyNodes(): number;
    canTolerate(faultyCount: number): boolean;
}
export declare function createByzantineConsensus(nodeId: string, config?: ByzantineConfig): ByzantineConsensus;
//# sourceMappingURL=byzantine.d.ts.map