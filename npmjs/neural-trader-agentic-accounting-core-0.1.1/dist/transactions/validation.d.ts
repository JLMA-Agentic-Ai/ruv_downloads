/**
 * Transaction Validation Service
 * Validates transaction data integrity and completeness
 * Performance target: <100ms per transaction
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class ValidationService {
    /**
     * Validate transaction data
     */
    validate(transaction: any): Promise<ValidationResult>;
    private validateBusinessRules;
    private validateConsistency;
    /**
     * Batch validation for performance
     */
    validateBatch(transactions: any[]): Promise<Map<string, ValidationResult>>;
}
//# sourceMappingURL=validation.d.ts.map