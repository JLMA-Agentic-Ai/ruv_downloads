"use strict";
/**
 * IRS Schedule D Generator
 * Capital Gains and Losses form
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleDGenerator = void 0;
const logger_1 = require("../../utils/logger");
const decimal_js_1 = __importDefault(require("decimal.js"));
class ScheduleDGenerator {
    /**
     * Generate IRS Schedule D form
     */
    async generate(taxTransactions, taxYear, taxpayerInfo) {
        logger_1.logger.info(`Generating Schedule D for tax year ${taxYear}`);
        // Separate short-term and long-term transactions
        const shortTerm = taxTransactions.filter(r => !r.isLongTerm);
        const longTerm = taxTransactions.filter(r => r.isLongTerm);
        // Calculate short-term totals
        const shortTermData = {
            transactions: shortTerm,
            totalProceeds: shortTerm.reduce((sum, r) => sum.add(r.proceeds), new decimal_js_1.default(0)),
            totalCostBasis: shortTerm.reduce((sum, r) => sum.add(r.costBasis), new decimal_js_1.default(0)),
            totalGainLoss: shortTerm.reduce((sum, r) => sum.add(r.gainLoss), new decimal_js_1.default(0))
        };
        // Calculate long-term totals
        const longTermData = {
            transactions: longTerm,
            totalProceeds: longTerm.reduce((sum, r) => sum.add(r.proceeds), new decimal_js_1.default(0)),
            totalCostBasis: longTerm.reduce((sum, r) => sum.add(r.costBasis), new decimal_js_1.default(0)),
            totalGainLoss: longTerm.reduce((sum, r) => sum.add(r.gainLoss), new decimal_js_1.default(0))
        };
        // Calculate summary
        const summary = {
            netShortTermGainLoss: shortTermData.totalGainLoss,
            netLongTermGainLoss: longTermData.totalGainLoss,
            totalCapitalGainLoss: shortTermData.totalGainLoss.add(longTermData.totalGainLoss)
        };
        const scheduleD = {
            taxYear,
            taxpayerInfo,
            shortTerm: shortTermData,
            longTerm: longTermData,
            summary,
            generatedAt: new Date()
        };
        logger_1.logger.info('Schedule D generated', {
            shortTermTransactions: shortTerm.length,
            longTermTransactions: longTerm.length,
            totalGainLoss: summary.totalCapitalGainLoss.toString()
        });
        return scheduleD;
    }
    /**
     * Format Schedule D for PDF generation
     */
    async formatForPDF(scheduleD) {
        return {
            title: `Schedule D (Form 1040) - ${scheduleD.taxYear}`,
            subtitle: 'Capital Gains and Losses',
            taxpayer: {
                name: scheduleD.taxpayerInfo.name,
                ssn: this.formatSSN(scheduleD.taxpayerInfo.ssn)
            },
            sections: [
                {
                    title: 'Part I: Short-Term Capital Gains and Losses',
                    rows: this.formatTransactionRows(scheduleD.shortTerm.transactions),
                    totals: {
                        proceeds: scheduleD.shortTerm.totalProceeds.toFixed(2),
                        costBasis: scheduleD.shortTerm.totalCostBasis.toFixed(2),
                        gainLoss: scheduleD.shortTerm.totalGainLoss.toFixed(2)
                    }
                },
                {
                    title: 'Part II: Long-Term Capital Gains and Losses',
                    rows: this.formatTransactionRows(scheduleD.longTerm.transactions),
                    totals: {
                        proceeds: scheduleD.longTerm.totalProceeds.toFixed(2),
                        costBasis: scheduleD.longTerm.totalCostBasis.toFixed(2),
                        gainLoss: scheduleD.longTerm.totalGainLoss.toFixed(2)
                    }
                },
                {
                    title: 'Part III: Summary',
                    summary: {
                        netShortTerm: scheduleD.summary.netShortTermGainLoss.toFixed(2),
                        netLongTerm: scheduleD.summary.netLongTermGainLoss.toFixed(2),
                        total: scheduleD.summary.totalCapitalGainLoss.toFixed(2)
                    }
                }
            ],
            footer: {
                generatedAt: scheduleD.generatedAt.toISOString(),
                disclaimer: 'This form is computer-generated. Please review for accuracy.'
            }
        };
    }
    formatTransactionRows(transactions) {
        return transactions.map(tx => ({
            description: `${tx.asset} - ${tx.method || 'FIFO'}`,
            dateAcquired: tx.acquisitionDate.toLocaleDateString(),
            dateSold: tx.disposalDate.toLocaleDateString(),
            proceeds: tx.proceeds.toFixed(2),
            costBasis: tx.costBasis.toFixed(2),
            adjustments: tx.washSaleAdjustment?.toFixed(2) || '0.00',
            gainLoss: tx.gainLoss.toFixed(2)
        }));
    }
    formatSSN(ssn) {
        // Format as XXX-XX-XXXX
        return ssn.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
    }
    /**
     * Validate Schedule D data
     */
    async validate(scheduleD) {
        const errors = [];
        // Validate taxpayer info
        if (!scheduleD.taxpayerInfo.name) {
            errors.push('Taxpayer name is required');
        }
        if (!scheduleD.taxpayerInfo.ssn || scheduleD.taxpayerInfo.ssn.length !== 9) {
            errors.push('Valid SSN is required');
        }
        // Validate calculations
        const calculatedShortTerm = scheduleD.shortTerm.transactions.reduce((sum, r) => sum.add(r.gainLoss), new decimal_js_1.default(0));
        if (!calculatedShortTerm.equals(scheduleD.shortTerm.totalGainLoss)) {
            errors.push('Short-term totals do not match transaction sum');
        }
        const calculatedLongTerm = scheduleD.longTerm.transactions.reduce((sum, r) => sum.add(r.gainLoss), new decimal_js_1.default(0));
        if (!calculatedLongTerm.equals(scheduleD.longTerm.totalGainLoss)) {
            errors.push('Long-term totals do not match transaction sum');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.ScheduleDGenerator = ScheduleDGenerator;
//# sourceMappingURL=schedule-d.js.map