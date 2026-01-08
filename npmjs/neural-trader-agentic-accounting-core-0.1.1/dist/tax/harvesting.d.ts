/**
 * Tax-Loss Harvesting System
 * Identifies and executes tax optimization strategies
 */
import { Transaction, Position } from '@neural-trader/agentic-accounting-types';
import Decimal from 'decimal.js';
export interface HarvestOpportunity {
    id: string;
    asset: string;
    position: Position;
    currentPrice: number;
    unrealizedLoss: Decimal;
    potentialTaxSavings: Decimal;
    washSaleRisk: boolean;
    recommendation: 'HARVEST' | 'WAIT' | 'REVIEW';
    expirationDate?: Date;
    metadata?: any;
}
export interface WashSaleCheck {
    asset: string;
    hasViolation: boolean;
    recentBuys: Transaction[];
    daysUntilSafe: number;
}
export declare class TaxLossHarvestingService {
    private washSalePeriod;
    /**
     * Scan portfolio for harvesting opportunities
     * Performance target: Identify 95%+ harvestable losses
     */
    scanOpportunities(positions: Position[], currentPrices: Map<string, number>, recentTransactions: Transaction[], taxRate?: number): Promise<HarvestOpportunity[]>;
    /**
     * Check for wash sale violations
     * Target: <1% wash-sale violations
     */
    checkWashSale(asset: string, recentTransactions: Transaction[]): Promise<WashSaleCheck>;
    /**
     * Find correlated replacement assets
     */
    findReplacementAssets(asset: string, correlationThreshold?: number): Promise<string[]>;
    /**
     * Rank opportunities by tax savings
     */
    rankOpportunities(opportunities: HarvestOpportunity[]): HarvestOpportunity[];
    /**
     * Determine recommendation based on opportunity metrics
     */
    private determineRecommendation;
    /**
     * Calculate when wash sale period expires
     */
    private calculateExpirationDate;
    /**
     * Calculate average holding period for position
     */
    private calculateHoldingPeriod;
    /**
     * Generate harvest execution plan
     */
    generateExecutionPlan(opportunities: HarvestOpportunity[]): Promise<any>;
}
//# sourceMappingURL=harvesting.d.ts.map