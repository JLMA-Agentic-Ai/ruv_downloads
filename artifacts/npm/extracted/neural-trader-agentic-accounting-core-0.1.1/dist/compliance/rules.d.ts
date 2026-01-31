/**
 * Compliance Rule Engine
 * Configurable rules for transaction validation
 */
import { Transaction } from '@neural-trader/agentic-accounting-types';
export interface ComplianceRule {
    id: string;
    name: string;
    description: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    enabled: boolean;
    validate: (transaction: Transaction, context?: any) => Promise<RuleViolation | null>;
}
export interface RuleViolation {
    ruleId: string;
    severity: string;
    message: string;
    transaction: Transaction;
    timestamp: Date;
    metadata?: any;
}
export declare class ComplianceRuleEngine {
    private rules;
    constructor();
    /**
     * Initialize default compliance rules
     */
    private initializeDefaultRules;
    /**
     * Add custom compliance rule
     */
    addRule(rule: ComplianceRule): void;
    /**
     * Remove compliance rule
     */
    removeRule(ruleId: string): void;
    /**
     * Enable/disable rule
     */
    setRuleEnabled(ruleId: string, enabled: boolean): void;
    /**
     * Validate transaction against all enabled rules
     * Performance target: <500ms
     */
    validateTransaction(transaction: Transaction, context?: any): Promise<RuleViolation[]>;
    /**
     * Batch validate multiple transactions
     */
    validateBatch(transactions: Transaction[], context?: any): Promise<Map<string, RuleViolation[]>>;
    /**
     * Get all rules
     */
    getRules(): ComplianceRule[];
    /**
     * Get rule by ID
     */
    getRule(ruleId: string): ComplianceRule | undefined;
}
//# sourceMappingURL=rules.d.ts.map