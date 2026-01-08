/**
 * Transaction Normalization Service
 * Normalizes data formats across different sources
 */
import { Transaction, TransactionSourceType } from '@neural-trader/agentic-accounting-types';
export declare class NormalizationService {
    /**
     * Normalize transaction from any source to standard format
     */
    normalize(rawTransaction: any, source: TransactionSourceType): Promise<Partial<Transaction>>;
    private normalizeCoinbase;
    private normalizeBinance;
    private normalizeKraken;
    private normalizeEtherscan;
    private normalizeCSV;
    private normalizeGeneric;
    private mapTransactionType;
    /**
     * Convert multi-currency transactions to base currency
     */
    convertCurrency(amount: number, fromCurrency: string, toCurrency: string, timestamp: Date): Promise<number>;
}
//# sourceMappingURL=normalization.d.ts.map