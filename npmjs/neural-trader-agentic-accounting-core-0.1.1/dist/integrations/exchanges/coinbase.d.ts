/**
 * Coinbase Exchange Integration
 * Fetches transaction history from Coinbase API
 */
export interface CoinbaseConfig {
    apiKey: string;
    apiSecret: string;
    baseUrl?: string;
}
export declare class CoinbaseIntegration {
    private config;
    constructor(config: CoinbaseConfig);
    /**
     * Fetch transaction history from Coinbase
     */
    fetchTransactions(accountId: string, options?: {
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<any[]>;
    /**
     * Fetch account balances
     */
    fetchBalances(): Promise<Map<string, number>>;
    /**
     * Generate API signature for authentication
     */
    private generateSignature;
    /**
     * Test API connection
     */
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=coinbase.d.ts.map