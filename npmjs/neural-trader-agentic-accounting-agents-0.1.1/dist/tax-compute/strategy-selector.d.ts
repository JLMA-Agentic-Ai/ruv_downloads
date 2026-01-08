/**
 * Strategy Selector
 *
 * Intelligently selects optimal tax calculation method based on:
 * - User preference (if specified)
 * - Market conditions (rising/falling)
 * - Transaction history
 * - Tax optimization goals
 * - Jurisdiction requirements
 */
import { TaxMethod, TaxCalculationResult, Transaction, TaxLot } from './calculator-wrapper';
export interface MarketCondition {
    trend: 'rising' | 'falling' | 'sideways';
    volatility: 'low' | 'medium' | 'high';
    confidence: number;
}
export interface TaxProfile {
    jurisdiction: string;
    taxBracket: 'low' | 'medium' | 'high';
    preferredMethod?: TaxMethod;
    optimizationGoal: 'minimize_current_tax' | 'maximize_carryforward' | 'balanced';
    allowedMethods?: TaxMethod[];
}
export interface MethodRecommendation {
    method: TaxMethod;
    score: number;
    rationale: string;
    estimatedSavings?: string;
    alternatives?: Array<{
        method: TaxMethod;
        score: number;
        reason: string;
    }>;
}
export declare class StrategySelector {
    /**
     * Select optimal method based on all factors
     */
    selectOptimalMethod(sale: Transaction, lots: TaxLot[], profile: TaxProfile, marketCondition?: MarketCondition): Promise<MethodRecommendation>;
    /**
     * Score all available methods
     */
    private scoreAllMethods;
    /**
     * Score individual method
     */
    private scoreMethod;
    /**
     * Check if method is allowed in jurisdiction
     */
    private isMethodAllowed;
    /**
     * Infer market conditions from lot history
     */
    private inferMarketCondition;
    /**
     * Calculate average lot price
     */
    private calculateAverageLotPrice;
    /**
     * Compare multiple calculation results
     */
    compareResults(results: Map<TaxMethod, TaxCalculationResult>): Promise<{
        best: TaxMethod;
        savings: string;
        comparison: Array<{
            method: TaxMethod;
            gain: string;
            tax: string;
            rank: number;
        }>;
    }>;
}
//# sourceMappingURL=strategy-selector.d.ts.map