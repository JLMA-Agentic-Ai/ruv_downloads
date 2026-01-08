/**
 * Binance Exchange Integration
 * Fetches transaction history from Binance API
 */
export interface BinanceConfig {
    apiKey: string;
    apiSecret: string;
    baseUrl?: string;
}
export declare class BinanceIntegration {
    private config;
    constructor(config: BinanceConfig);
    /**
     * Fetch trade history from Binance
     */
    fetchTrades(symbol: string, options?: {
        startTime?: number;
        endTime?: number;
        limit?: number;
    }): Promise<any[]>;
    /**
     * Fetch deposit/withdrawal history
     */
    fetchDepositHistory(options?: {
        coin?: string;
        startTime?: number;
        endTime?: number;
    }): Promise<any[]>;
    /**
     * Fetch account balances
     */
    fetchBalances(): Promise<Map<string, number>>;
    /**
     * Generate API signature
     */
    private generateSignature;
    /**
     * Test API connection
     */
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=binance.d.ts.map