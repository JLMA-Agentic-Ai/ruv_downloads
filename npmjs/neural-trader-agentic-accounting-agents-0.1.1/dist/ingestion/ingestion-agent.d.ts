/**
 * Ingestion Agent
 * Autonomous agent for transaction data acquisition
 * Performance target: 10,000+ transactions per minute
 */
import { BaseAgent, AgentTask, AgentResult } from '../base/agent';
import { TransactionSourceType } from '@neural-trader/agentic-accounting-types';
export interface IngestionAgentConfig {
    agentId?: string;
    sources: string[];
    batchSize?: number;
    autoNormalize?: boolean;
    validateOnIngestion?: boolean;
    credentials?: {
        coinbase?: {
            apiKey: string;
            apiSecret: string;
        };
        binance?: {
            apiKey: string;
            apiSecret: string;
        };
        etherscan?: {
            apiKey: string;
        };
    };
}
export interface IngestionTaskData {
    source: TransactionSourceType;
    data?: any[];
    accountId?: string;
    address?: string;
    options?: any;
}
export declare class IngestionAgent extends BaseAgent {
    private ingestionService;
    private integrations;
    private ingestionConfig;
    constructor(config: IngestionAgentConfig);
    private initializeIntegrations;
    /**
     * Execute ingestion task
     */
    execute(task: AgentTask): Promise<AgentResult>;
    /**
     * Fetch transactions from source
     */
    private fetchFromSource;
    /**
     * Validate source connection
     */
    validateSource(source: string): Promise<boolean>;
    /**
     * Get available sources
     */
    getAvailableSources(): string[];
    /**
     * Auto-detect and ingest from all configured sources
     */
    autoIngest(): Promise<Map<string, any>>;
}
//# sourceMappingURL=ingestion-agent.d.ts.map