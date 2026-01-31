/**
 * IRS Form 8949 Generator
 * Sales and Other Dispositions of Capital Assets
 */
import { TaxTransaction } from '@neural-trader/agentic-accounting-types';
import Decimal from 'decimal.js';
export interface Form8949 {
    taxYear: number;
    taxpayerInfo: {
        name: string;
        ssn: string;
    };
    category: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    transactions: Form8949Transaction[];
    totals: {
        proceeds: Decimal;
        costBasis: Decimal;
        adjustments: Decimal;
        gainLoss: Decimal;
    };
    generatedAt: Date;
}
export interface Form8949Transaction {
    description: string;
    dateAcquired: Date;
    dateSold: Date;
    proceeds: Decimal;
    costBasis: Decimal;
    adjustmentCode?: string;
    adjustmentAmount?: Decimal;
    gainLoss: Decimal;
    metadata?: any;
}
/**
 * Form 8949 Categories:
 * A - Short-term with basis reported to IRS
 * B - Short-term with basis NOT reported to IRS
 * C - Short-term from transactions where you cannot check boxes A or B
 * D - Long-term with basis reported to IRS
 * E - Long-term with basis NOT reported to IRS
 * F - Long-term from transactions where you cannot check boxes D or E
 */
export declare class Form8949Generator {
    /**
     * Generate IRS Form 8949
     */
    generate(taxTransactions: TaxTransaction[], taxYear: number, taxpayerInfo: {
        name: string;
        ssn: string;
    }, category: Form8949['category']): Promise<Form8949>;
    /**
     * Filter transactions by Form 8949 category
     */
    private filterByCategory;
    /**
     * Convert TaxTransaction to Form 8949 transaction
     */
    private convertToForm8949Transaction;
    /**
     * Format Form 8949 for PDF generation
     */
    formatForPDF(form: Form8949): Promise<any>;
    private getCategoryDescription;
    private formatSSN;
    private formatCurrency;
    /**
     * Split large forms into multiple pages
     */
    splitIntoPages(form: Form8949, transactionsPerPage?: number): Promise<Form8949[]>;
}
//# sourceMappingURL=form-8949.d.ts.map