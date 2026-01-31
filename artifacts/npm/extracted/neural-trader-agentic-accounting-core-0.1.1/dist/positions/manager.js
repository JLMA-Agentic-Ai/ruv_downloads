"use strict";
/**
 * Position Manager
 * Tracks open positions and manages lot inventory
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionManager = void 0;
const logger_1 = require("../utils/logger");
const lots_1 = require("./lots");
const decimal_js_1 = __importDefault(require("decimal.js"));
class PositionManager {
    positions = new Map();
    lotManager;
    constructor() {
        this.lotManager = new lots_1.LotManager();
    }
    /**
     * Update positions based on new transaction
     */
    async updatePosition(transaction) {
        const key = this.getPositionKey(transaction.asset, transaction.metadata?.wallet);
        let position = this.positions.get(key);
        if (!position) {
            position = this.createPosition(transaction.asset, transaction.metadata?.wallet);
            this.positions.set(key, position);
        }
        // Update position based on transaction type
        switch (transaction.type) {
            case 'BUY':
            case 'INCOME':
            case 'DIVIDEND':
                await this.handleAcquisition(position, transaction);
                break;
            case 'SELL':
            case 'CONVERT':
                await this.handleDisposal(position, transaction);
                break;
            case 'TRANSFER':
                await this.handleTransfer(position, transaction);
                break;
        }
        // Recalculate position metrics
        this.recalculatePosition(position);
        return position;
    }
    async handleAcquisition(position, transaction) {
        // Create new lot for acquisition
        const lot = {
            id: `${transaction.id}-lot`,
            transactionId: transaction.id,
            asset: transaction.asset,
            quantity: new decimal_js_1.default(transaction.quantity),
            purchasePrice: new decimal_js_1.default(transaction.price),
            purchaseDate: transaction.timestamp,
            costBasis: new decimal_js_1.default(transaction.price).mul(transaction.quantity),
            acquisitionDate: transaction.timestamp,
            remainingQuantity: new decimal_js_1.default(transaction.quantity),
            isOpen: true
        };
        await this.lotManager.addLot(lot);
        position.lots.push(lot);
        position.quantity = position.quantity.add(transaction.quantity);
        position.totalCost = position.totalCost.add(lot.costBasis);
    }
    async handleDisposal(position, transaction) {
        // Remove quantity from position using accounting method
        // This would integrate with the tax calculation engine
        const lotsToClose = await this.lotManager.selectLotsForDisposal(position.asset, new decimal_js_1.default(transaction.quantity), 'FIFO' // Would be configurable
        );
        for (const lot of lotsToClose) {
            const quantityToClose = decimal_js_1.default.min(lot.remainingQuantity, transaction.quantity);
            lot.remainingQuantity = lot.remainingQuantity.sub(quantityToClose);
            if (lot.remainingQuantity.isZero()) {
                lot.isOpen = false;
            }
        }
        position.quantity = position.quantity.sub(transaction.quantity);
    }
    async handleTransfer(position, transaction) {
        // Transfers don't change cost basis, just move assets
        logger_1.logger.debug(`Processing transfer for ${transaction.asset}`, { transaction });
    }
    recalculatePosition(position) {
        // Recalculate total quantity and average cost basis
        let totalQuantity = new decimal_js_1.default(0);
        let totalCost = new decimal_js_1.default(0);
        for (const lot of position.lots) {
            if (lot.isOpen) {
                totalQuantity = totalQuantity.add(lot.remainingQuantity);
                const proportionalCost = lot.costBasis
                    .mul(lot.remainingQuantity)
                    .div(lot.quantity);
                totalCost = totalCost.add(proportionalCost);
            }
        }
        position.quantity = totalQuantity;
        position.totalCost = totalCost;
        position.averageCostBasis = totalQuantity.isZero()
            ? new decimal_js_1.default(0)
            : totalCost.div(totalQuantity);
        position.lastUpdated = new Date();
    }
    createPosition(asset, wallet) {
        return {
            id: `pos-${asset}-${Date.now()}`,
            asset,
            quantity: new decimal_js_1.default(0),
            averageCost: new decimal_js_1.default(0),
            currentValue: new decimal_js_1.default(0),
            unrealizedGainLoss: new decimal_js_1.default(0),
            totalCost: new decimal_js_1.default(0),
            averageCostBasis: new decimal_js_1.default(0),
            lots: [],
            lastUpdated: new Date()
        };
    }
    getPositionKey(asset, wallet) {
        return wallet ? `${asset}:${wallet}` : asset;
    }
    /**
     * Get all open positions
     */
    getPositions() {
        return Array.from(this.positions.values());
    }
    /**
     * Get position for specific asset
     */
    getPosition(asset, wallet) {
        return this.positions.get(this.getPositionKey(asset, wallet));
    }
    /**
     * Calculate unrealized gains/losses
     */
    async calculateUnrealizedPnL(asset, currentPrice, wallet) {
        const position = this.getPosition(asset, wallet);
        if (!position) {
            return new decimal_js_1.default(0);
        }
        const currentValue = position.quantity.mul(currentPrice);
        return currentValue.sub(position.totalCost);
    }
}
exports.PositionManager = PositionManager;
//# sourceMappingURL=manager.js.map