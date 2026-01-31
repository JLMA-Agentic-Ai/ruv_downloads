"use strict";
/**
 * Compliance Rule Engine
 * Configurable rules for transaction validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceRuleEngine = void 0;
const logger_1 = require("../utils/logger");
class ComplianceRuleEngine {
    rules = new Map();
    constructor() {
        this.initializeDefaultRules();
    }
    /**
     * Initialize default compliance rules
     */
    initializeDefaultRules() {
        // Rule: Transaction amount limits
        this.addRule({
            id: 'transaction-limit',
            name: 'Transaction Amount Limit',
            description: 'Validates transaction does not exceed configured limits',
            severity: 'error',
            enabled: true,
            validate: async (tx, context) => {
                const limit = context?.limit || 1000000;
                const value = tx.quantity * tx.price;
                if (value > limit) {
                    return {
                        ruleId: 'transaction-limit',
                        severity: 'error',
                        message: `Transaction value $${value} exceeds limit of $${limit}`,
                        transaction: tx,
                        timestamp: new Date(),
                        metadata: { value, limit }
                    };
                }
                return null;
            }
        });
        // Rule: Wash sale detection
        this.addRule({
            id: 'wash-sale',
            name: 'Wash Sale Rule',
            description: 'Detects potential wash sale violations (30-day rule)',
            severity: 'warning',
            enabled: true,
            validate: async (tx, context) => {
                // Simplified wash sale detection
                // In production, this would check against all related transactions
                if (tx.type === 'SELL' && context?.recentBuys) {
                    const thirtyDaysAgo = new Date(tx.timestamp.getTime() - 30 * 24 * 60 * 60 * 1000);
                    const hasRecentBuy = context.recentBuys.some((buy) => buy.timestamp >= thirtyDaysAgo && buy.asset === tx.asset);
                    if (hasRecentBuy) {
                        return {
                            ruleId: 'wash-sale',
                            severity: 'warning',
                            message: 'Potential wash sale violation detected',
                            transaction: tx,
                            timestamp: new Date(),
                            metadata: { thirtyDaysAgo }
                        };
                    }
                }
                return null;
            }
        });
        // Rule: Suspicious pattern detection
        this.addRule({
            id: 'suspicious-pattern',
            name: 'Suspicious Activity Pattern',
            description: 'Detects unusual transaction patterns',
            severity: 'warning',
            enabled: true,
            validate: async (tx, context) => {
                // Check for round numbers (potential structuring)
                if (tx.type === 'SELL' && tx.quantity % 1000 === 0) {
                    return {
                        ruleId: 'suspicious-pattern',
                        severity: 'warning',
                        message: 'Round number transaction detected',
                        transaction: tx,
                        timestamp: new Date(),
                        metadata: { pattern: 'round-number' }
                    };
                }
                return null;
            }
        });
        // Rule: Jurisdiction-specific limits
        this.addRule({
            id: 'jurisdiction-limit',
            name: 'Jurisdiction Compliance',
            description: 'Validates transaction against jurisdiction-specific rules',
            severity: 'error',
            enabled: true,
            validate: async (tx, context) => {
                const jurisdiction = context?.jurisdiction || 'US';
                // Example: US reporting threshold
                if (jurisdiction === 'US') {
                    const value = tx.quantity * tx.price;
                    if (value > 10000 && !context?.reportingFiled) {
                        return {
                            ruleId: 'jurisdiction-limit',
                            severity: 'error',
                            message: 'Transaction exceeds reporting threshold without filed report',
                            transaction: tx,
                            timestamp: new Date(),
                            metadata: { jurisdiction, threshold: 10000 }
                        };
                    }
                }
                return null;
            }
        });
    }
    /**
     * Add custom compliance rule
     */
    addRule(rule) {
        this.rules.set(rule.id, rule);
        logger_1.logger.info(`Added compliance rule: ${rule.id}`, { rule: rule.name });
    }
    /**
     * Remove compliance rule
     */
    removeRule(ruleId) {
        this.rules.delete(ruleId);
        logger_1.logger.info(`Removed compliance rule: ${ruleId}`);
    }
    /**
     * Enable/disable rule
     */
    setRuleEnabled(ruleId, enabled) {
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.enabled = enabled;
            logger_1.logger.info(`Rule ${ruleId} ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
    /**
     * Validate transaction against all enabled rules
     * Performance target: <500ms
     */
    async validateTransaction(transaction, context) {
        const violations = [];
        const startTime = Date.now();
        // Run all enabled rules in parallel
        const rulePromises = Array.from(this.rules.values())
            .filter(rule => rule.enabled)
            .map(async (rule) => {
            try {
                const violation = await rule.validate(transaction, context);
                if (violation) {
                    violations.push(violation);
                }
            }
            catch (error) {
                logger_1.logger.error(`Rule ${rule.id} failed`, { error, transaction });
            }
        });
        await Promise.all(rulePromises);
        const duration = Date.now() - startTime;
        logger_1.logger.debug(`Validation completed in ${duration}ms`, {
            violations: violations.length,
            rulesChecked: this.rules.size
        });
        return violations;
    }
    /**
     * Batch validate multiple transactions
     */
    async validateBatch(transactions, context) {
        const results = new Map();
        await Promise.all(transactions.map(async (tx) => {
            const violations = await this.validateTransaction(tx, context);
            results.set(tx.id, violations);
        }));
        return results;
    }
    /**
     * Get all rules
     */
    getRules() {
        return Array.from(this.rules.values());
    }
    /**
     * Get rule by ID
     */
    getRule(ruleId) {
        return this.rules.get(ruleId);
    }
}
exports.ComplianceRuleEngine = ComplianceRuleEngine;
//# sourceMappingURL=rules.js.map