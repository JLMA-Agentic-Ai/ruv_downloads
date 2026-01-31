/**
 * Position Manager
 * Tracks open positions and manages lot inventory
 */
import { Transaction, Position } from '@neural-trader/agentic-accounting-types';
import Decimal from 'decimal.js';
export declare class PositionManager {
    private positions;
    private lotManager;
    constructor();
    /**
     * Update positions based on new transaction
     */
    updatePosition(transaction: Transaction): Promise<Position>;
    private handleAcquisition;
    private handleDisposal;
    private handleTransfer;
    private recalculatePosition;
    private createPosition;
    private getPositionKey;
    /**
     * Get all open positions
     */
    getPositions(): Position[];
    /**
     * Get position for specific asset
     */
    getPosition(asset: string, wallet?: string): Position | undefined;
    /**
     * Calculate unrealized gains/losses
     */
    calculateUnrealizedPnL(asset: string, currentPrice: number, wallet?: string): Promise<Decimal>;
}
//# sourceMappingURL=manager.d.ts.map