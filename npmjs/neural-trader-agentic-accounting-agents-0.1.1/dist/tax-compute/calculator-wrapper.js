"use strict";
/**
 * Calculator Wrapper
 *
 * Wraps Rust tax calculation algorithms with TypeScript-friendly interfaces
 * Handles method selection and result normalization
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatorWrapper = void 0;
const rustCore = __importStar(require("@neural-trader/agentic-accounting-rust-core"));
class CalculatorWrapper {
    /**
     * Calculate using FIFO method (First In, First Out)
     */
    async calculateFifo(sale, lots) {
        const startTime = Date.now();
        // Sort lots by acquisition date (oldest first)
        const sortedLots = [...lots].sort((a, b) => new Date(a.acquisitionDate).getTime() - new Date(b.acquisitionDate).getTime());
        const result = await this.processDisposals(sale, sortedLots, 'FIFO');
        result.calculationTime = Date.now() - startTime;
        return result;
    }
    /**
     * Calculate using LIFO method (Last In, First Out)
     */
    async calculateLifo(sale, lots) {
        const startTime = Date.now();
        // Sort lots by acquisition date (newest first)
        const sortedLots = [...lots].sort((a, b) => new Date(b.acquisitionDate).getTime() - new Date(a.acquisitionDate).getTime());
        const result = await this.processDisposals(sale, sortedLots, 'LIFO');
        result.calculationTime = Date.now() - startTime;
        return result;
    }
    /**
     * Calculate using HIFO method (Highest In, First Out)
     */
    async calculateHifo(sale, lots) {
        const startTime = Date.now();
        // Sort lots by cost basis (highest first)
        const sortedLots = [...lots].sort((a, b) => {
            const aPrice = parseFloat(rustCore.divideDecimals(a.costBasis, a.quantity));
            const bPrice = parseFloat(rustCore.divideDecimals(b.costBasis, b.quantity));
            return bPrice - aPrice;
        });
        const result = await this.processDisposals(sale, sortedLots, 'HIFO');
        result.calculationTime = Date.now() - startTime;
        return result;
    }
    /**
     * Calculate using Specific ID method
     */
    async calculateSpecificId(sale, lots, selectedLotIds) {
        const startTime = Date.now();
        // Filter and order lots by selection
        const sortedLots = selectedLotIds
            .map(id => lots.find(lot => lot.id === id))
            .filter((lot) => lot !== undefined);
        if (sortedLots.length === 0) {
            throw new Error('No valid lots selected for Specific ID method');
        }
        const result = await this.processDisposals(sale, sortedLots, 'SPECIFIC_ID');
        result.calculationTime = Date.now() - startTime;
        return result;
    }
    /**
     * Calculate using Average Cost method
     */
    async calculateAverageCost(sale, lots) {
        const startTime = Date.now();
        // Calculate weighted average cost basis
        let totalQuantity = '0';
        let totalCost = '0';
        for (const lot of lots) {
            totalQuantity = rustCore.addDecimals(totalQuantity, lot.remainingQuantity);
            totalCost = rustCore.addDecimals(totalCost, lot.costBasis);
        }
        const avgCostPerUnit = rustCore.divideDecimals(totalCost, totalQuantity);
        // Create virtual lot with average cost
        const avgLot = {
            id: 'avg-cost-lot',
            transactionId: 'average',
            asset: sale.asset,
            quantity: totalQuantity,
            remainingQuantity: totalQuantity,
            costBasis: totalCost,
            acquisitionDate: lots[0]?.acquisitionDate || sale.timestamp,
        };
        const result = await this.processDisposals(sale, [avgLot], 'AVERAGE_COST');
        result.calculationTime = Date.now() - startTime;
        return result;
    }
    /**
     * Process disposals from sale transaction and lots
     */
    async processDisposals(sale, lots, method) {
        const disposals = [];
        let remainingSaleQty = sale.quantity;
        const unusedLots = [];
        for (const lot of lots) {
            if (parseFloat(remainingSaleQty) <= 0) {
                unusedLots.push(lot);
                continue;
            }
            // Determine quantity to dispose
            const disposeQty = parseFloat(lot.remainingQuantity) <= parseFloat(remainingSaleQty)
                ? lot.remainingQuantity
                : remainingSaleQty;
            // Calculate proceeds and cost basis for this disposal
            const proceeds = rustCore.multiplyDecimals(disposeQty, sale.price);
            const costBasisPerUnit = rustCore.divideDecimals(lot.costBasis, lot.quantity);
            const costBasis = rustCore.multiplyDecimals(disposeQty, costBasisPerUnit);
            // Calculate gain/loss
            const gainLoss = rustCore.calculateGainLoss(sale.price, disposeQty, costBasisPerUnit, disposeQty);
            // Determine if long-term (> 365 days)
            const daysBetween = rustCore.daysBetween(lot.acquisitionDate, sale.timestamp);
            const isLongTerm = daysBetween > 365;
            disposals.push({
                id: `disposal-${sale.id}-${lot.id}`,
                saleTransactionId: sale.id,
                lotId: lot.id,
                asset: sale.asset,
                quantity: disposeQty,
                proceeds,
                costBasis,
                gainLoss,
                acquisitionDate: lot.acquisitionDate,
                disposalDate: sale.timestamp,
                isLongTerm,
            });
            // Update remaining quantities
            remainingSaleQty = rustCore.subtractDecimals(remainingSaleQty, disposeQty);
            // Update lot
            const newRemaining = rustCore.subtractDecimals(lot.remainingQuantity, disposeQty);
            if (parseFloat(newRemaining) > 0) {
                unusedLots.push({
                    ...lot,
                    remainingQuantity: newRemaining,
                });
            }
        }
        // Calculate totals
        let totalGain = '0';
        let totalLoss = '0';
        let shortTermGain = '0';
        let longTermGain = '0';
        for (const disposal of disposals) {
            const gl = parseFloat(disposal.gainLoss);
            if (gl > 0) {
                totalGain = rustCore.addDecimals(totalGain, disposal.gainLoss);
                if (disposal.isLongTerm) {
                    longTermGain = rustCore.addDecimals(longTermGain, disposal.gainLoss);
                }
                else {
                    shortTermGain = rustCore.addDecimals(shortTermGain, disposal.gainLoss);
                }
            }
            else {
                totalLoss = rustCore.addDecimals(totalLoss, disposal.gainLoss);
            }
        }
        const netGainLoss = rustCore.addDecimals(totalGain, totalLoss);
        return {
            method,
            disposals,
            totalGain,
            totalLoss,
            netGainLoss,
            shortTermGain,
            longTermGain,
            unusedLots,
            calculationTime: 0, // Set by caller
        };
    }
}
exports.CalculatorWrapper = CalculatorWrapper;
//# sourceMappingURL=calculator-wrapper.js.map