/**
 * Lot Manager
 * Manages individual lots for cost basis tracking
 */
import { Lot } from '@neural-trader/agentic-accounting-types';
import Decimal from 'decimal.js';
export type AccountingMethod = 'FIFO' | 'LIFO' | 'HIFO' | 'SPECIFIC_ID' | 'AVERAGE_COST';
export declare class LotManager {
    private lots;
    /**
     * Add new lot to inventory
     */
    addLot(lot: Lot): Promise<void>;
    /**
     * Select lots for disposal based on accounting method
     * Performance target: <1ms for 1M+ lots
     */
    selectLotsForDisposal(asset: string, quantity: Decimal, method: AccountingMethod): Promise<Lot[]>;
    private sortLotsByMethod;
    /**
     * Get all open lots for an asset
     */
    getOpenLots(asset: string): Lot[];
    /**
     * Get total quantity across all open lots
     */
    getTotalQuantity(asset: string): Decimal;
    /**
     * Get average cost basis across all open lots
     */
    getAverageCostBasis(asset: string): Decimal;
    /**
     * Close a specific lot
     */
    closeLot(lotId: string): Promise<void>;
    /**
     * Get lot by ID
     */
    getLot(lotId: string): Lot | undefined;
}
//# sourceMappingURL=lots.d.ts.map