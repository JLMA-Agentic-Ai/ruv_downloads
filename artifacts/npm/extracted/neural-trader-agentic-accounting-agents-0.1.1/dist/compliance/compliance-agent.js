"use strict";
/**
 * Compliance Agent
 * Autonomous agent for regulatory compliance
 * Performance target: <500ms trade validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceAgent = void 0;
const agent_1 = require("../base/agent");
const agentic_accounting_core_1 = require("@neural-trader/agentic-accounting-core");
const agentic_accounting_core_2 = require("@neural-trader/agentic-accounting-core");
class ComplianceAgent extends agent_1.BaseAgent {
    validator;
    ruleEngine;
    complianceConfig;
    constructor(config = {}) {
        super({
            agentId: config.agentId || 'compliance-agent',
            agentType: 'ComplianceAgent',
            enableLearning: true,
            enableMetrics: true
        });
        this.validator = new agentic_accounting_core_1.ComplianceValidator();
        this.ruleEngine = new agentic_accounting_core_2.ComplianceRuleEngine();
        this.complianceConfig = {
            strictMode: config.strictMode ?? true,
            jurisdiction: config.jurisdiction ?? 'US',
            autoAlert: config.autoAlert ?? true,
            alertThreshold: config.alertThreshold ?? 0.7
        };
    }
    /**
     * Execute compliance check
     */
    async execute(task) {
        const taskData = task.data;
        this.logger.info(`Executing compliance task: ${taskData.action}`);
        return this.executeWithMetrics(async () => {
            switch (taskData.action) {
                case 'validate':
                    return await this.validateTransaction(taskData.transaction, taskData.context);
                case 'check_batch':
                    return await this.validateBatch(taskData.transactions, taskData.context);
                case 'generate_report':
                    return await this.generateComplianceReport(taskData.transactions, taskData.context);
                default:
                    throw new Error(`Unknown action: ${taskData.action}`);
            }
        });
    }
    /**
     * Validate single transaction
     */
    async validateTransaction(transaction, context) {
        const startTime = Date.now();
        // Enrich context with jurisdiction and config
        const enrichedContext = {
            ...context,
            jurisdiction: this.complianceConfig.jurisdiction,
            strictMode: this.complianceConfig.strictMode
        };
        // Run validation
        const result = await this.validator.validate(transaction, enrichedContext);
        // Auto-alert if configured
        if (this.complianceConfig.autoAlert && result.violations.length > 0) {
            await this.sendAlert(transaction, result);
        }
        // Log learning data
        await this.learn({
            action: 'validate_transaction',
            transactionId: transaction.id,
            isCompliant: result.isCompliant,
            violations: result.violations.length,
            warnings: result.warnings.length,
            duration: Date.now() - startTime,
            strictMode: this.complianceConfig.strictMode
        });
        return result;
    }
    /**
     * Validate batch of transactions
     */
    async validateBatch(transactions, context) {
        this.logger.info(`Validating batch of ${transactions.length} transactions`);
        const enrichedContext = {
            ...context,
            jurisdiction: this.complianceConfig.jurisdiction
        };
        const results = await this.validator.validateBatch(transactions, enrichedContext);
        // Count violations
        let totalViolations = 0;
        let totalWarnings = 0;
        for (const result of results.values()) {
            totalViolations += result.violations.length;
            totalWarnings += result.warnings.length;
            // Auto-alert for critical violations
            if (this.complianceConfig.autoAlert && result.violations.length > 0) {
                const tx = transactions.find(t => t.id === result.violations[0].transaction.id);
                if (tx) {
                    await this.sendAlert(tx, result);
                }
            }
        }
        this.logger.info('Batch validation completed', {
            total: transactions.length,
            violations: totalViolations,
            warnings: totalWarnings
        });
        return {
            results,
            summary: {
                total: transactions.length,
                violations: totalViolations,
                warnings: totalWarnings
            }
        };
    }
    /**
     * Generate compliance report
     */
    async generateComplianceReport(transactions, context) {
        this.logger.info('Generating compliance report');
        const enrichedContext = {
            ...context,
            jurisdiction: this.complianceConfig.jurisdiction
        };
        const report = await this.validator.generateReport(transactions, enrichedContext);
        // Add metadata
        return {
            ...report,
            metadata: {
                jurisdiction: this.complianceConfig.jurisdiction,
                strictMode: this.complianceConfig.strictMode,
                generatedAt: new Date(),
                agent: this.config.agentId
            }
        };
    }
    /**
     * Send compliance alert
     */
    async sendAlert(transaction, result) {
        this.logger.warn('Compliance violation detected', {
            transactionId: transaction.id,
            violations: result.violations.length,
            severity: result.violations[0]?.severity
        });
        // In production, this would send to monitoring system
        // For now, just log
    }
    /**
     * Check if transaction meets compliance threshold
     */
    async isCompliant(transaction, context) {
        const result = await this.validateTransaction(transaction, context);
        return result.isCompliant;
    }
    /**
     * Get all active compliance rules
     */
    async getRules() {
        return this.ruleEngine.getRules();
    }
    /**
     * Add custom compliance rule
     */
    async addRule(rule) {
        this.ruleEngine.addRule(rule);
        this.logger.info(`Added custom rule: ${rule.id}`);
    }
    /**
     * Enable/disable rule
     */
    async setRuleEnabled(ruleId, enabled) {
        this.ruleEngine.setRuleEnabled(ruleId, enabled);
        this.logger.info(`Rule ${ruleId} ${enabled ? 'enabled' : 'disabled'}`);
    }
}
exports.ComplianceAgent = ComplianceAgent;
//# sourceMappingURL=compliance-agent.js.map