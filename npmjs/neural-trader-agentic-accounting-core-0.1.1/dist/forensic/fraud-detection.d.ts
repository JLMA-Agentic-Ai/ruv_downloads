/**
 * Fraud Detection System
 * Vector-based fraud pattern detection using AgentDB
 * Performance target: <100µs queries
 */
import { Transaction } from '@neural-trader/agentic-accounting-types';
export interface FraudPattern {
    id: string;
    name: string;
    description: string;
    vector: number[];
    severity: number;
    metadata?: any;
}
export interface FraudScore {
    transactionId: string;
    score: number;
    confidence: number;
    matchedPatterns: FraudPattern[];
    anomalies: string[];
    timestamp: Date;
}
export declare class FraudDetectionService {
    private vectorDB;
    private initialized;
    private patterns;
    constructor();
    /**
     * Initialize fraud pattern database
     */
    initialize(): Promise<void>;
    /**
     * Detect fraudulent patterns in transaction
     * Performance target: <100µs per query
     */
    detectFraud(transaction: Transaction): Promise<FraudScore>;
    /**
     * Generate vector representation of transaction
     */
    private generateTransactionVector;
    /**
     * Calculate fraud score from similar patterns
     */
    private calculateFraudScore;
    /**
     * Detect statistical anomalies
     */
    private detectAnomalies;
    /**
     * Add new fraud pattern to database
     */
    addFraudPattern(pattern: FraudPattern): Promise<void>;
    /**
     * Load known fraud patterns
     */
    private loadFraudPatterns;
    /**
     * Generate vector for fraud pattern
     */
    private generatePatternVector;
    /**
     * Batch fraud detection
     */
    detectFraudBatch(transactions: Transaction[]): Promise<Map<string, FraudScore>>;
    /**
     * Create placeholder VectorDB for development
     * TODO: Replace with actual AgentDB implementation
     */
    private createPlaceholderDB;
}
//# sourceMappingURL=fraud-detection.d.ts.map