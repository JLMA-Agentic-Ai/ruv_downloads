/**
 * IRS Schedule D Generator
 * Capital Gains and Losses form
 */
import { TaxTransaction } from '@neural-trader/agentic-accounting-types';
import Decimal from 'decimal.js';
export interface ScheduleD {
    taxYear: number;
    taxpayerInfo: {
        name: string;
        ssn: string;
    };
    shortTerm: {
        transactions: TaxTransaction[];
        totalProceeds: Decimal;
        totalCostBasis: Decimal;
        totalGainLoss: Decimal;
    };
    longTerm: {
        transactions: TaxTransaction[];
        totalProceeds: Decimal;
        totalCostBasis: Decimal;
        totalGainLoss: Decimal;
    };
    summary: {
        netShortTermGainLoss: Decimal;
        netLongTermGainLoss: Decimal;
        totalCapitalGainLoss: Decimal;
    };
    generatedAt: Date;
}
export declare class ScheduleDGenerator {
    /**
     * Generate IRS Schedule D form
     */
    generate(taxTransactions: TaxTransaction[], taxYear: number, taxpayerInfo: {
        name: string;
        ssn: string;
    }): Promise<ScheduleD>;
    /**
     * Format Schedule D for PDF generation
     */
    formatForPDF(scheduleD: ScheduleD): Promise<any>;
    private formatTransactionRows;
    private formatSSN;
    /**
     * Validate Schedule D data
     */
    validate(scheduleD: ScheduleD): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
}
//# sourceMappingURL=schedule-d.d.ts.map