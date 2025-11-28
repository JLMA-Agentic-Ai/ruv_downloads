"use strict";
/**
 * IRS Form 8949 Generator
 * Sales and Other Dispositions of Capital Assets
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Form8949Generator = void 0;
const logger_1 = require("../../utils/logger");
const decimal_js_1 = __importDefault(require("decimal.js"));
/**
 * Form 8949 Categories:
 * A - Short-term with basis reported to IRS
 * B - Short-term with basis NOT reported to IRS
 * C - Short-term from transactions where you cannot check boxes A or B
 * D - Long-term with basis reported to IRS
 * E - Long-term with basis NOT reported to IRS
 * F - Long-term from transactions where you cannot check boxes D or E
 */
class Form8949Generator {
    /**
     * Generate IRS Form 8949
     */
    async generate(taxTransactions, taxYear, taxpayerInfo, category) {
        logger_1.logger.info(`Generating Form 8949 category ${category} for tax year ${taxYear}`);
        // Filter transactions by category
        const filteredResults = this.filterByCategory(taxTransactions, category);
        // Convert to Form 8949 transactions
        const transactions = filteredResults.map(r => this.convertToForm8949Transaction(r));
        // Calculate totals
        const totals = {
            proceeds: transactions.reduce((sum, t) => sum.add(t.proceeds), new decimal_js_1.default(0)),
            costBasis: transactions.reduce((sum, t) => sum.add(t.costBasis), new decimal_js_1.default(0)),
            adjustments: transactions.reduce((sum, t) => sum.add(t.adjustmentAmount || 0), new decimal_js_1.default(0)),
            gainLoss: transactions.reduce((sum, t) => sum.add(t.gainLoss), new decimal_js_1.default(0))
        };
        const form = {
            taxYear,
            taxpayerInfo,
            category,
            transactions,
            totals,
            generatedAt: new Date()
        };
        logger_1.logger.info(`Form 8949 category ${category} generated`, {
            transactions: transactions.length,
            totalGainLoss: totals.gainLoss.toString()
        });
        return form;
    }
    /**
     * Filter transactions by Form 8949 category
     */
    filterByCategory(taxTransactions, category) {
        const isShortTerm = ['A', 'B', 'C'].includes(category);
        // Filter by short-term vs long-term
        return taxTransactions.filter(r => {
            if (isShortTerm && r.isLongTerm)
                return false;
            if (!isShortTerm && !r.isLongTerm)
                return false;
            // In production, would also filter by whether basis was reported to IRS
            // For now, include all matching term type
            return true;
        });
    }
    /**
     * Convert TaxTransaction to Form 8949 transaction
     */
    convertToForm8949Transaction(taxTransaction) {
        const transaction = {
            description: `${taxTransaction.asset} - ${taxTransaction.quantity.toString()} units`,
            dateAcquired: taxTransaction.acquisitionDate,
            dateSold: taxTransaction.disposalDate,
            proceeds: taxTransaction.proceeds,
            costBasis: taxTransaction.costBasis,
            gainLoss: taxTransaction.gainLoss,
            metadata: taxTransaction.metadata
        };
        // Add wash sale adjustment if applicable
        if (taxTransaction.washSaleAdjustment && !taxTransaction.washSaleAdjustment.isZero()) {
            transaction.adjustmentCode = 'W';
            transaction.adjustmentAmount = taxTransaction.washSaleAdjustment;
        }
        return transaction;
    }
    /**
     * Format Form 8949 for PDF generation
     */
    async formatForPDF(form) {
        return {
            title: `Form 8949 - ${form.taxYear}`,
            subtitle: 'Sales and Other Dispositions of Capital Assets',
            taxpayer: {
                name: form.taxpayerInfo.name,
                ssn: this.formatSSN(form.taxpayerInfo.ssn)
            },
            category: {
                box: form.category,
                description: this.getCategoryDescription(form.category)
            },
            columns: [
                'Description of Property',
                'Date Acquired',
                'Date Sold',
                'Proceeds',
                'Cost Basis',
                'Code',
                'Adjustment',
                'Gain/(Loss)'
            ],
            rows: form.transactions.map(t => [
                t.description,
                t.dateAcquired.toLocaleDateString(),
                t.dateSold.toLocaleDateString(),
                this.formatCurrency(t.proceeds),
                this.formatCurrency(t.costBasis),
                t.adjustmentCode || '',
                t.adjustmentAmount ? this.formatCurrency(t.adjustmentAmount) : '',
                this.formatCurrency(t.gainLoss)
            ]),
            totals: {
                proceeds: this.formatCurrency(form.totals.proceeds),
                costBasis: this.formatCurrency(form.totals.costBasis),
                adjustments: this.formatCurrency(form.totals.adjustments),
                gainLoss: this.formatCurrency(form.totals.gainLoss)
            },
            footer: {
                generatedAt: form.generatedAt.toISOString(),
                disclaimer: 'This form is computer-generated. Please review for accuracy.'
            }
        };
    }
    getCategoryDescription(category) {
        const descriptions = {
            A: 'Short-term transactions reported on Form 1099-B with basis reported to the IRS',
            B: 'Short-term transactions reported on Form 1099-B with basis NOT reported to the IRS',
            C: 'Short-term transactions not reported on Form 1099-B',
            D: 'Long-term transactions reported on Form 1099-B with basis reported to the IRS',
            E: 'Long-term transactions reported on Form 1099-B with basis NOT reported to the IRS',
            F: 'Long-term transactions not reported on Form 1099-B'
        };
        return descriptions[category];
    }
    formatSSN(ssn) {
        return ssn.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
    }
    formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }
    /**
     * Split large forms into multiple pages
     */
    async splitIntoPages(form, transactionsPerPage = 14) {
        const pages = [];
        for (let i = 0; i < form.transactions.length; i += transactionsPerPage) {
            const pageTransactions = form.transactions.slice(i, i + transactionsPerPage);
            const pageTotals = {
                proceeds: pageTransactions.reduce((sum, t) => sum.add(t.proceeds), new decimal_js_1.default(0)),
                costBasis: pageTransactions.reduce((sum, t) => sum.add(t.costBasis), new decimal_js_1.default(0)),
                adjustments: pageTransactions.reduce((sum, t) => sum.add(t.adjustmentAmount || 0), new decimal_js_1.default(0)),
                gainLoss: pageTransactions.reduce((sum, t) => sum.add(t.gainLoss), new decimal_js_1.default(0))
            };
            pages.push({
                ...form,
                transactions: pageTransactions,
                totals: pageTotals
            });
        }
        return pages;
    }
}
exports.Form8949Generator = Form8949Generator;
//# sourceMappingURL=form-8949.js.map