/**
 * Forensic Analysis Agent
 * Autonomous agent for fraud detection and analysis
 * Performance target: <100µs vector queries
 */
import { BaseAgent, AgentTask, AgentResult } from '../base/agent';
import { Transaction } from '@neural-trader/agentic-accounting-types';
export interface ForensicAgentConfig {
    agentId?: string;
    sensitivityThreshold?: number;
    autoInvestigate?: boolean;
    generateProofs?: boolean;
}
export interface ForensicTaskData {
    action: 'detect_fraud' | 'generate_proof' | 'investigate' | 'analyze_batch';
    transaction?: Transaction;
    transactions?: Transaction[];
}
export declare class ForensicAgent extends BaseAgent {
    private fraudDetection;
    private merkleTree;
    private forensicConfig;
    constructor(config?: ForensicAgentConfig);
    /**
     * Execute forensic analysis task
     */
    execute(task: AgentTask): Promise<AgentResult>;
    /**
     * Detect fraud in transaction
     */
    private detectFraud;
    /**
     * Generate Merkle proof for transaction
     */
    private generateMerkleProof;
    /**
     * Investigate suspicious transaction
     */
    private investigate;
    /**
     * Analyze batch of transactions for fraud
     */
    private analyzeBatch;
    /**
     * Flag transaction for investigation
     */
    private flagForInvestigation;
    /**
     * Calculate risk level from fraud score
     */
    private calculateRiskLevel;
    /**
     * Generate recommendations based on fraud score
     */
    private generateRecommendations;
    /**
     * Verify Merkle proof
     */
    verifyProof(transaction: Transaction, proof: any, expectedRootHash: string): Promise<boolean>;
    /**
     * Add fraud pattern to database
     */
    addFraudPattern(pattern: any): Promise<void>;
}
//# sourceMappingURL=forensic-agent.d.ts.map