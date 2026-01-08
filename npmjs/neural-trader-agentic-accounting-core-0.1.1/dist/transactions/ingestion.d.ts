/**
 * Transaction Ingestion System
 * Handles multi-source data acquisition (CSV, APIs, blockchain)
 */
import { Transaction, TransactionSourceType, IngestionResult } from '@neural-trader/agentic-accounting-types';
export interface IngestionConfig {
    source: TransactionSourceType;
    batchSize?: number;
    validateOnIngestion?: boolean;
    autoNormalize?: boolean;
}
export declare class TransactionIngestionService {
    private validator;
    private normalizer;
    constructor();
    /**
     * Ingest transactions from multiple sources
     * Performance target: 10,000+ transactions per minute
     */
    ingestBatch(transactions: any[], config: IngestionConfig): Promise<IngestionResult>;
    private processBatch;
    /**
     * Ingest from CSV file
     */
    ingestFromCSV(filePath: string): Promise<IngestionResult>;
    /**
     * Identify taxable events from raw transactions
     */
    identifyTaxableEvents(transactions: Transaction[]): Promise<Transaction[]>;
}
//# sourceMappingURL=ingestion.d.ts.map