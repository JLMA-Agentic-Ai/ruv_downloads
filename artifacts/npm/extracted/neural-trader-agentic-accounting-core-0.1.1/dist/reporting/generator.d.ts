/**
 * Report Generator
 * Generates financial and tax reports
 * Performance target: <5 seconds for annual reports
 */
import { Transaction, TaxTransaction } from '@neural-trader/agentic-accounting-types';
import Decimal from 'decimal.js';
export interface ReportOptions {
    startDate: Date;
    endDate: Date;
    format?: 'json' | 'pdf' | 'csv';
    includeDetails?: boolean;
    groupBy?: 'asset' | 'type' | 'month';
}
export interface PnLReport {
    period: {
        start: Date;
        end: Date;
    };
    summary: {
        totalRevenue: Decimal;
        totalCost: Decimal;
        netProfit: Decimal;
        realizedGains: Decimal;
        realizedLosses: Decimal;
        unrealizedGains: Decimal;
        unrealizedLosses: Decimal;
    };
    byAsset: Map<string, AssetPnL>;
    transactions: Transaction[];
    generatedAt: Date;
}
export interface AssetPnL {
    asset: string;
    revenue: Decimal;
    cost: Decimal;
    netProfit: Decimal;
    transactions: number;
}
export declare class ReportGenerator {
    /**
     * Generate Profit & Loss report
     */
    generatePnL(transactions: Transaction[], options: ReportOptions): Promise<PnLReport>;
    /**
     * Calculate summary metrics
     */
    private calculateSummary;
    /**
     * Group transactions by asset
     */
    private groupByAsset;
    /**
     * Generate tax summary report
     */
    generateTaxSummary(taxTransactions: TaxTransaction[], year: number): Promise<any>;
    /**
     * Generate audit report
     */
    generateAuditReport(transactions: Transaction[], options: ReportOptions): Promise<any>;
    /**
     * Group transactions by type
     */
    private groupByType;
    /**
     * Create timeline of transactions
     */
    private createTimeline;
    /**
     * Export report to CSV format
     */
    exportToCSV(report: PnLReport): Promise<string>;
}
//# sourceMappingURL=generator.d.ts.map