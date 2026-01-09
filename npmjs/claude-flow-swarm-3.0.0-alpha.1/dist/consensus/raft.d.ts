/**
 * V3 Raft Consensus Implementation
 * Leader election and log replication for distributed coordination
 */
import { EventEmitter } from 'events';
import { ConsensusProposal, ConsensusVote, ConsensusResult, ConsensusConfig } from '../types.js';
export type RaftState = 'follower' | 'candidate' | 'leader';
export interface RaftNode {
    id: string;
    state: RaftState;
    currentTerm: number;
    votedFor?: string;
    log: RaftLogEntry[];
    commitIndex: number;
    lastApplied: number;
}
export interface RaftLogEntry {
    term: number;
    index: number;
    command: unknown;
    timestamp: Date;
}
export interface RaftConfig extends Partial<ConsensusConfig> {
    electionTimeoutMinMs?: number;
    electionTimeoutMaxMs?: number;
    heartbeatIntervalMs?: number;
}
export declare class RaftConsensus extends EventEmitter {
    private config;
    private node;
    private peers;
    private proposals;
    private electionTimeout?;
    private heartbeatInterval?;
    private proposalCounter;
    constructor(nodeId: string, config?: RaftConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    addPeer(peerId: string): void;
    removePeer(peerId: string): void;
    propose(value: unknown): Promise<ConsensusProposal>;
    vote(proposalId: string, vote: ConsensusVote): Promise<void>;
    awaitConsensus(proposalId: string): Promise<ConsensusResult>;
    getState(): RaftState;
    getTerm(): number;
    isLeader(): boolean;
    getLeaderId(): string | undefined;
    private resetElectionTimeout;
    private randomElectionTimeout;
    private startElection;
    private requestVote;
    private becomeLeader;
    private sendHeartbeats;
    private appendEntries;
    private replicateToFollowers;
    private checkConsensus;
    private createResult;
    handleVoteRequest(candidateId: string, term: number, lastLogIndex: number, lastLogTerm: number): boolean;
    handleAppendEntries(leaderId: string, term: number, entries: RaftLogEntry[], leaderCommit: number): boolean;
}
export declare function createRaftConsensus(nodeId: string, config?: RaftConfig): RaftConsensus;
//# sourceMappingURL=raft.d.ts.map