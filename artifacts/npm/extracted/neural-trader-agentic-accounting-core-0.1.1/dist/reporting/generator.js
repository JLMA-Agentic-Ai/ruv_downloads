"use strict";
/**
 * Report Generator
 * Generates financial and tax reports
 * Performance target: <5 seconds for annual reports
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerator = void 0;
const logger_1 = require("../utils/logger");
const decimal_js_1 = __importDefault(require("decimal.js"));
class ReportGenerator {
    /**
     * Generate Profit & Loss report
     */
    async generatePnL(transactions, options) {
        logger_1.logger.info('Generating P&L report', {
            transactions: transactions.length,
            start: options.startDate,
            end: options.endDate
        });
        const startTime = Date.now();
        // Filter transactions by date range
        const filteredTxs = transactions.filter(tx => tx.timestamp >= options.startDate && tx.timestamp <= options.endDate);
        // Calculate summary metrics
        const summary = this.calculateSummary(filteredTxs);
        // Group by asset
        const byAsset = this.groupByAsset(filteredTxs);
        const report = {
            period: {
                start: options.startDate,
                end: options.endDate
            },
            summary,
            byAsset,
            transactions: options.includeDetails ? filteredTxs : [],
            generatedAt: new Date()
        };
        const duration = Date.now() - startTime;
        logger_1.logger.info(`P&L report generated in ${duration}ms`);
        return report;
    }
    /**
     * Calculate summary metrics
     */
    calculateSummary(transactions) {
        let totalRevenue = new decimal_js_1.default(0);
        let totalCost = new decimal_js_1.default(0);
        let realizedGains = new decimal_js_1.default(0);
        let realizedLosses = new decimal_js_1.default(0);
        for (const tx of transactions) {
            const value = new decimal_js_1.default(tx.quantity).mul(tx.price);
            if (tx.type === 'SELL') {
                totalRevenue = totalRevenue.add(value);
                // In production, would calculate actual gain/loss with cost basis
            }
            else if (tx.type === 'BUY') {
                totalCost = totalCost.add(value);
            }
            else if (tx.type === 'INCOME' || tx.type === 'DIVIDEND') {
                totalRevenue = totalRevenue.add(value);
                realizedGains = realizedGains.add(value);
            }
            // Add fees to cost
            if (tx.fees) {
                totalCost = totalCost.add(tx.fees);
            }
        }
        const netProfit = totalRevenue.sub(totalCost);
        return {
            totalRevenue,
            totalCost,
            netProfit,
            realizedGains,
            realizedLosses,
            unrealizedGains: new decimal_js_1.default(0), // Would be calculated from open positions
            unrealizedLosses: new decimal_js_1.default(0)
        };
    }
    /**
     * Group transactions by asset
     */
    groupByAsset(transactions) {
        const byAsset = new Map();
        for (const tx of transactions) {
            let assetPnL = byAsset.get(tx.asset);
            if (!assetPnL) {
                assetPnL = {
                    asset: tx.asset,
                    revenue: new decimal_js_1.default(0),
                    cost: new decimal_js_1.default(0),
                    netProfit: new decimal_js_1.default(0),
                    transactions: 0
                };
                byAsset.set(tx.asset, assetPnL);
            }
            const value = new decimal_js_1.default(tx.quantity).mul(tx.price);
            if (tx.type === 'SELL' || tx.type === 'INCOME' || tx.type === 'DIVIDEND') {
                assetPnL.revenue = assetPnL.revenue.add(value);
            }
            else if (tx.type === 'BUY') {
                assetPnL.cost = assetPnL.cost.add(value);
            }
            assetPnL.transactions++;
        }
        // Calculate net profit for each asset
        for (const assetPnL of byAsset.values()) {
            assetPnL.netProfit = assetPnL.revenue.sub(assetPnL.cost);
        }
        return byAsset;
    }
    /**
     * Generate tax summary report
     */
    async generateTaxSummary(taxTransactions, year) {
        logger_1.logger.info(`Generating tax summary for ${year}`);
        // Group by short-term vs long-term
        const shortTerm = taxTransactions.filter(r => !r.isLongTerm);
        const longTerm = taxTransactions.filter(r => r.isLongTerm);
        const summary = {
            year,
            shortTerm: {
                count: shortTerm.length,
                totalGain: shortTerm.reduce((sum, r) => sum.add(r.gainLoss), new decimal_js_1.default(0)),
                totalProceeds: shortTerm.reduce((sum, r) => sum.add(r.proceeds), new decimal_js_1.default(0)),
                totalCostBasis: shortTerm.reduce((sum, r) => sum.add(r.costBasis), new decimal_js_1.default(0))
            },
            longTerm: {
                count: longTerm.length,
                totalGain: longTerm.reduce((sum, r) => sum.add(r.gainLoss), new decimal_js_1.default(0)),
                totalProceeds: longTerm.reduce((sum, r) => sum.add(r.proceeds), new decimal_js_1.default(0)),
                totalCostBasis: longTerm.reduce((sum, r) => sum.add(r.costBasis), new decimal_js_1.default(0))
            },
            generatedAt: new Date()
        };
        return summary;
    }
    /**
     * Generate audit report
     */
    async generateAuditReport(transactions, options) {
        logger_1.logger.info('Generating audit report');
        const filteredTxs = transactions.filter(tx => tx.timestamp >= options.startDate && tx.timestamp <= options.endDate);
        return {
            period: {
                start: options.startDate,
                end: options.endDate
            },
            totalTransactions: filteredTxs.length,
            transactionsByType: this.groupByType(filteredTxs),
            transactionsByAsset: this.groupByAsset(filteredTxs),
            timeline: this.createTimeline(filteredTxs),
            generatedAt: new Date(),
            auditTrail: {
                generatedBy: 'ReportGenerator',
                format: options.format || 'json'
            }
        };
    }
    /**
     * Group transactions by type
     */
    groupByType(transactions) {
        const byType = new Map();
        for (const tx of transactions) {
            byType.set(tx.type, (byType.get(tx.type) || 0) + 1);
        }
        return byType;
    }
    /**
     * Create timeline of transactions
     */
    createTimeline(transactions) {
        const timeline = [];
        // Group by month
        const byMonth = new Map();
        for (const tx of transactions) {
            const monthKey = `${tx.timestamp.getFullYear()}-${String(tx.timestamp.getMonth() + 1).padStart(2, '0')}`;
            if (!byMonth.has(monthKey)) {
                byMonth.set(monthKey, []);
            }
            byMonth.get(monthKey).push(tx);
        }
        // Create timeline entries
        for (const [month, txs] of byMonth.entries()) {
            timeline.push({
                month,
                transactions: txs.length,
                volume: txs.reduce((sum, tx) => sum + (tx.quantity * tx.price), 0)
            });
        }
        return timeline.sort((a, b) => a.month.localeCompare(b.month));
    }
    /**
     * Export report to CSV format
     */
    async exportToCSV(report) {
        const lines = [];
        // Header
        lines.push('Asset,Revenue,Cost,Net Profit,Transactions');
        // Data rows
        for (const [asset, pnl] of report.byAsset.entries()) {
            lines.push(`${asset},${pnl.revenue.toString()},${pnl.cost.toString()},${pnl.netProfit.toString()},${pnl.transactions}`);
        }
        return lines.join('\n');
    }
}
exports.ReportGenerator = ReportGenerator;
//# sourceMappingURL=generator.js.map