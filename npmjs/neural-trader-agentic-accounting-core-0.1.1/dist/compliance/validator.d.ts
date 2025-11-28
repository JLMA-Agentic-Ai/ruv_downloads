/**
 * Compliance Validator
 * Real-time transaction compliance validation
 * Performance target: <500ms per validation
 */
import { Transaction } from '@neural-trader/agentic-accounting-types';
import { RuleViolation } from './rules';
export interface ValidationContext {
    jurisdiction?: string;
    recentTransactions?: Transaction[];
    userProfile?: any;
    limits?: {
        daily?: number;
        weekly?: number;
        monthly?: number;
    };
    [key: string]: any;
}
export interface ComplianceValidationResult {
    isCompliant: boolean;
    violations: RuleViolation[];
    warnings: RuleViolation[];
    info: RuleViolation[];
    timestamp: Date;
    duration: number;
}
export declare class ComplianceValidator {
    private ruleEngine;
    private validationCache;
    constructor();
    /**
     * Validate transaction for compliance
     */
    validate(transaction: Transaction, context?: ValidationContext): Promise<ComplianceValidationResult>;
    /**
     * Prepare validation context with additional data
     */
    private prepareContext;
    /**
     * Pre-validate transaction before execution
     */
    preValidate(transaction: Transaction, context?: ValidationContext): Promise<boolean>;
    /**
     * Post-validate transaction after execution
     */
    postValidate(transaction: Transaction, context?: ValidationContext): Promise<ComplianceValidationResult>;
    /**
     * Batch validate multiple transactions
     */
    validateBatch(transactions: Transaction[], context?: ValidationContext): Promise<Map<string, ComplianceValidationResult>>;
    /**
     * Generate compliance report
     */
    generateReport(transactions: Transaction[], context?: ValidationContext): Promise<{
        totalTransactions: number;
        compliant: number;
        violations: number;
        warnings: number;
        details: ComplianceValidationResult[];
    }>;
    /**
     * Clear validation cache
     */
    clearCache(): void;
    private getCacheKey;
    private isCacheValid;
}
//# sourceMappingURL=validator.d.ts.map