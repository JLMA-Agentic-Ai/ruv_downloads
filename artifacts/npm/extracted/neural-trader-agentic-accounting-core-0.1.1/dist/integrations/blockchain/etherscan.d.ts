/**
 * Etherscan Blockchain Integration
 * Fetches transaction history from Ethereum blockchain
 */
export interface EtherscanConfig {
    apiKey: string;
    network?: 'mainnet' | 'goerli' | 'sepolia';
}
export declare class EtherscanIntegration {
    private config;
    private baseUrl;
    constructor(config: EtherscanConfig);
    private getBaseUrl;
    /**
     * Fetch normal transactions for an address
     */
    fetchTransactions(address: string, options?: {
        startBlock?: number;
        endBlock?: number;
        sort?: 'asc' | 'desc';
    }): Promise<any[]>;
    /**
     * Fetch ERC-20 token transfers for an address
     */
    fetchTokenTransfers(address: string, contractAddress?: string): Promise<any[]>;
    /**
     * Fetch internal transactions (contract calls)
     */
    fetchInternalTransactions(address: string): Promise<any[]>;
    /**
     * Get ETH balance for an address
     */
    getBalance(address: string): Promise<string>;
    /**
     * Get ERC-20 token balance
     */
    getTokenBalance(address: string, contractAddress: string): Promise<string>;
    /**
     * Test API connection
     */
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=etherscan.d.ts.map