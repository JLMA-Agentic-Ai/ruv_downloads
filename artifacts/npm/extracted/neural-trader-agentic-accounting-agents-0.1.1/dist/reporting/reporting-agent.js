"use strict";
/**
 * Reporting Agent
 * Autonomous agent for financial report generation
 * Performance target: <5 seconds for annual reports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingAgent = void 0;
const agent_1 = require("../base/agent");
const agentic_accounting_core_1 = require("@neural-trader/agentic-accounting-core");
const agentic_accounting_core_2 = require("@neural-trader/agentic-accounting-core");
const agentic_accounting_core_3 = require("@neural-trader/agentic-accounting-core");
class ReportingAgent extends agent_1.BaseAgent {
    reportGenerator;
    scheduleDGenerator;
    form8949Generator;
    reportingConfig;
    constructor(config = {}) {
        super({
            agentId: config.agentId || 'reporting-agent',
            agentType: 'ReportingAgent',
            enableLearning: true,
            enableMetrics: true
        });
        this.reportGenerator = new agentic_accounting_core_1.ReportGenerator();
        this.scheduleDGenerator = new agentic_accounting_core_2.ScheduleDGenerator();
        this.form8949Generator = new agentic_accounting_core_3.Form8949Generator();
        this.reportingConfig = {
            defaultFormat: config.defaultFormat || 'json',
            includeDetails: config.includeDetails ?? true
        };
    }
    /**
     * Execute reporting task
     */
    async execute(task) {
        const taskData = task.data;
        this.logger.info(`Executing reporting task: ${taskData.action}`);
        return this.executeWithMetrics(async () => {
            switch (taskData.action) {
                case 'generate_pnl':
                    return await this.generatePnLReport(taskData.transactions, taskData.options);
                case 'generate_tax_forms':
                    return await this.generateTaxForms(taskData.taxResults, taskData.year, taskData.taxpayerInfo);
                case 'generate_audit':
                    return await this.generateAuditReport(taskData.transactions, taskData.options);
                case 'generate_custom':
                    return await this.generateCustomReport(taskData);
                default:
                    throw new Error(`Unknown action: ${taskData.action}`);
            }
        });
    }
    /**
     * Generate P&L report
     */
    async generatePnLReport(transactions, options) {
        const startTime = Date.now();
        this.logger.info('Generating P&L report');
        const report = await this.reportGenerator.generatePnL(transactions, options);
        // Export to requested format
        let exportedReport = report;
        if (options.format === 'csv') {
            exportedReport = await this.reportGenerator.exportToCSV(report);
        }
        const duration = Date.now() - startTime;
        // Log learning data
        await this.learn({
            action: 'generate_pnl',
            transactions: transactions.length,
            format: options.format,
            duration,
            performance: transactions.length / (duration / 1000) // transactions per second
        });
        this.logger.info(`P&L report generated in ${duration}ms`);
        return exportedReport;
    }
    /**
     * Generate tax forms (Schedule D and Form 8949)
     */
    async generateTaxForms(taxResults, year, taxpayerInfo) {
        this.logger.info(`Generating tax forms for year ${year}`);
        // Extract all transactions from tax results
        const allTransactions = taxResults.flatMap(r => r.transactions);
        // Generate Schedule D
        const scheduleD = await this.scheduleDGenerator.generate(allTransactions, year, taxpayerInfo);
        // Generate Form 8949 for each category
        const form8949A = await this.form8949Generator.generate(allTransactions, year, taxpayerInfo, 'A');
        const form8949D = await this.form8949Generator.generate(allTransactions, year, taxpayerInfo, 'D');
        // Validate forms
        const scheduleDValidation = await this.scheduleDGenerator.validate(scheduleD);
        if (!scheduleDValidation.isValid) {
            this.logger.warn('Schedule D validation failed', { errors: scheduleDValidation.errors });
        }
        const result = {
            scheduleD,
            form8949: {
                shortTerm: form8949A,
                longTerm: form8949D
            },
            validation: {
                scheduleD: scheduleDValidation
            },
            generatedAt: new Date()
        };
        // Log learning data
        await this.learn({
            action: 'generate_tax_forms',
            year,
            transactions: taxResults.length,
            isValid: scheduleDValidation.isValid
        });
        return result;
    }
    /**
     * Generate audit report
     */
    async generateAuditReport(transactions, options) {
        this.logger.info('Generating audit report');
        const report = await this.reportGenerator.generateAuditReport(transactions, options);
        // Add agent metadata
        return {
            ...report,
            agent: {
                id: this.config.agentId,
                generatedAt: new Date()
            }
        };
    }
    /**
     * Generate custom report based on user specifications
     */
    async generateCustomReport(task) {
        this.logger.info('Generating custom report');
        // Placeholder for custom report logic
        return {
            type: 'custom',
            data: task,
            generatedAt: new Date()
        };
    }
    /**
     * Format report for PDF export
     */
    async formatForPDF(report, reportType) {
        this.logger.info(`Formatting ${reportType} for PDF export`);
        switch (reportType) {
            case 'schedule-d':
                return await this.scheduleDGenerator.formatForPDF(report);
            case 'form-8949':
                return await this.form8949Generator.formatForPDF(report);
            default:
                return report;
        }
    }
    /**
     * Batch generate multiple reports
     */
    async generateBatch(reportRequests) {
        const results = new Map();
        await Promise.all(reportRequests.map(async (request) => {
            try {
                const report = await this.execute(request);
                results.set(request.id || request.action, report);
            }
            catch (error) {
                this.logger.error('Batch report failed', { error, request });
                results.set(request.id || request.action, { error });
            }
        }));
        return results;
    }
}
exports.ReportingAgent = ReportingAgent;
//# sourceMappingURL=reporting-agent.js.map