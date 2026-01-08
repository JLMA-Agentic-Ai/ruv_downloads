/**
 * Input Validation
 *
 * Validates transaction data and tax lots before calculation
 * Ensures data integrity and prevents calculation errors
 */
import { Transaction, TaxLot } from './calculator-wrapper';
export declare class ValidationError extends Error {
    field?: string;
    code?: string;
    constructor(message: string, field?: string, code?: string);
}
export declare class TaxInputValidator {
    /**
     * Validate a transaction
     */
    validateTransaction(tx: Transaction): void;
    /**
     * Validate a tax lot
     */
    validateTaxLot(lot: TaxLot): void;
    /**
     * Validate sale transaction and lots are compatible
     */
    validateSaleAndLots(sale: Transaction, lots: TaxLot[]): void;
    /**
     * Validate decimal string
     */
    private validateDecimal;
    /**
     * Validate ISO 8601 date string
     */
    private validateDate;
}
//# sourceMappingURL=validation.d.ts.map