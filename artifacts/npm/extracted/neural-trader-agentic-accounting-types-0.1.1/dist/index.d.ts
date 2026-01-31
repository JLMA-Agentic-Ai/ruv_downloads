/**
 * Agentic Accounting Types
 *
 * Shared type definitions for the accounting system
 */
import Decimal from 'decimal.js';
/**
 * Transaction source type (string identifier)
 */
export type TransactionSourceType = 'coinbase' | 'binance' | 'kraken' | 'etherscan' | 'csv' | 'api' | string;
/**
 * Transaction represents a financial transaction (buy, sell, trade, etc.)
 */
export interface Transaction {
    id: string;
    timestamp: Date;
    type: 'BUY' | 'SELL' | 'TRADE' | 'CONVERT' | 'INCOME' | 'DIVIDEND' | 'FEE' | 'TRANSFER';
    asset: string;
    quantity: number;
    price: number;
    fees?: number;
    exchange?: string;
    walletAddress?: string;
    metadata?: Record<string, any>;
    source?: TransactionSourceType;
}
/**
 * Position represents holdings of a specific asset
 */
export interface Position {
    id: string;
    asset: string;
    quantity: Decimal;
    averageCost: Decimal;
    currentValue: Decimal;
    unrealizedGainLoss: Decimal;
    lots: Lot[];
    lastUpdated: Date;
    totalCost: Decimal;
    averageCostBasis: Decimal;
}
/**
 * Lot represents a specific purchase lot for tax accounting
 */
export interface Lot {
    id: string;
    asset: string;
    quantity: Decimal;
    purchasePrice: Decimal;
    purchaseDate: Date;
    acquisitionDate: Date;
    transactionId: string;
    disposed?: boolean;
    disposedDate?: Date;
    disposedPrice?: Decimal;
    isOpen: boolean;
    remainingQuantity: Decimal;
    costBasis: Decimal;
}
/**
 * Tax calculation result
 */
export interface TaxResult {
    totalGain: Decimal;
    totalLoss: Decimal;
    shortTermGain: Decimal;
    shortTermLoss: Decimal;
    longTermGain: Decimal;
    longTermLoss: Decimal;
    transactions: TaxTransaction[];
    year: number;
}
/**
 * Tax transaction with gain/loss calculation
 */
export interface TaxTransaction {
    id: string;
    asset: string;
    buyDate: Date;
    sellDate: Date;
    acquisitionDate: Date;
    disposalDate: Date;
    quantity: Decimal;
    costBasis: Decimal;
    proceeds: Decimal;
    gainLoss: Decimal;
    holdingPeriod: number;
    type: 'short-term' | 'long-term';
    isLongTerm: boolean;
    washSaleAdjustment?: Decimal;
    method?: string;
    metadata?: Record<string, any>;
}
/**
 * Transaction source (exchange, wallet, etc.)
 */
export interface TransactionSource {
    type: 'exchange' | 'wallet' | 'csv' | 'api';
    name: string;
    credentials?: Record<string, any>;
}
/**
 * Result of transaction ingestion
 */
export interface IngestionResult {
    source: TransactionSourceType;
    total: number;
    successful: number;
    failed: number;
    errors: Array<{
        transaction: any;
        errors: string[];
    }>;
    duration: number;
    transactions: Transaction[];
}
/**
 * Compliance rule
 */
export interface ComplianceRule {
    id: string;
    name: string;
    description: string;
    category: 'tax' | 'regulatory' | 'reporting';
    jurisdiction: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
}
/**
 * Compliance violation
 */
export interface ComplianceViolation {
    ruleId: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    transactionId?: string;
    details?: Record<string, any>;
    timestamp: Date;
}
/**
 * Agent configuration
 */
export interface AgentConfig {
    agentId: string;
    agentType: string;
    enableLearning?: boolean;
    enableMetrics?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
/**
 * Placeholder for future type definitions
 */
export interface AccountingTypes {
}
//# sourceMappingURL=index.d.ts.map