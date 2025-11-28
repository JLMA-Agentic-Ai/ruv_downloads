"use strict";
/**
 * Compliance Validator
 * Real-time transaction compliance validation
 * Performance target: <500ms per validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceValidator = void 0;
const rules_1 = require("./rules");
const logger_1 = require("../utils/logger");
class ComplianceValidator {
    ruleEngine;
    validationCache = new Map();
    constructor() {
        this.ruleEngine = new rules_1.ComplianceRuleEngine();
    }
    /**
     * Validate transaction for compliance
     */
    async validate(transaction, context) {
        const startTime = Date.now();
        logger_1.logger.info(`Validating transaction ${transaction.id} for compliance`);
        try {
            // Check cache first
            const cacheKey = this.getCacheKey(transaction, context);
            const cached = this.validationCache.get(cacheKey);
            if (cached && this.isCacheValid(cached)) {
                logger_1.logger.debug('Using cached validation result');
                return cached;
            }
            // Prepare validation context
            const validationContext = await this.prepareContext(transaction, context);
            // Run all compliance rules
            const violations = await this.ruleEngine.validateTransaction(transaction, validationContext);
            // Categorize violations by severity
            const result = {
                isCompliant: !violations.some(v => v.severity === 'error' || v.severity === 'critical'),
                violations: violations.filter(v => v.severity === 'error' || v.severity === 'critical'),
                warnings: violations.filter(v => v.severity === 'warning'),
                info: violations.filter(v => v.severity === 'info'),
                timestamp: new Date(),
                duration: Date.now() - startTime
            };
            // Cache result
            this.validationCache.set(cacheKey, result);
            logger_1.logger.info(`Validation completed in ${result.duration}ms`, {
                isCompliant: result.isCompliant,
                violations: result.violations.length,
                warnings: result.warnings.length
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Validation failed', { error, transaction });
            throw new Error(`Compliance validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Prepare validation context with additional data
     */
    async prepareContext(transaction, context) {
        const enrichedContext = {
            ...context,
            transaction,
            timestamp: Date.now()
        };
        // Add recent transactions for wash sale detection
        if (transaction.type === 'SELL' && !context?.recentTransactions) {
            // In production, fetch from database
            enrichedContext.recentTransactions = [];
        }
        return enrichedContext;
    }
    /**
     * Pre-validate transaction before execution
     */
    async preValidate(transaction, context) {
        const result = await this.validate(transaction, context);
        return result.isCompliant;
    }
    /**
     * Post-validate transaction after execution
     */
    async postValidate(transaction, context) {
        return await this.validate(transaction, context);
    }
    /**
     * Batch validate multiple transactions
     */
    async validateBatch(transactions, context) {
        const results = new Map();
        await Promise.all(transactions.map(async (tx) => {
            const result = await this.validate(tx, context);
            results.set(tx.id, result);
        }));
        return results;
    }
    /**
     * Generate compliance report
     */
    async generateReport(transactions, context) {
        const results = await this.validateBatch(transactions, context);
        const details = Array.from(results.values());
        return {
            totalTransactions: transactions.length,
            compliant: details.filter(r => r.isCompliant).length,
            violations: details.reduce((sum, r) => sum + r.violations.length, 0),
            warnings: details.reduce((sum, r) => sum + r.warnings.length, 0),
            details
        };
    }
    /**
     * Clear validation cache
     */
    clearCache() {
        this.validationCache.clear();
        logger_1.logger.info('Validation cache cleared');
    }
    getCacheKey(transaction, context) {
        return `${transaction.id}-${JSON.stringify(context || {})}`;
    }
    isCacheValid(result) {
        // Cache valid for 5 minutes
        const fiveMinutes = 5 * 60 * 1000;
        return Date.now() - result.timestamp.getTime() < fiveMinutes;
    }
}
exports.ComplianceValidator = ComplianceValidator;
//# sourceMappingURL=validator.js.map