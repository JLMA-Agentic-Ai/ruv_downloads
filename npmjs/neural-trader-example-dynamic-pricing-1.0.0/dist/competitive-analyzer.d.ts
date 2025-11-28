/**
 * Competitive pricing analysis with OpenRouter integration
 */
import { CompetitorAnalysis } from './types';
export declare class CompetitiveAnalyzer {
    private openai;
    private priceHistory;
    constructor(apiKey?: string);
    /**
     * Analyze competitor prices
     */
    analyze(competitorPrices: number[]): CompetitorAnalysis;
    /**
     * Use LLM for strategic pricing advice
     */
    getStrategicAdvice(myPrice: number, competitorPrices: number[], marketContext: string): Promise<string>;
    /**
     * Predict competitor response to price change
     */
    predictCompetitorResponse(myNewPrice: number, currentCompetitorPrices: number[]): {
        willMatch: boolean;
        expectedPrices: number[];
        confidence: number;
    };
    /**
     * Track competitor price changes over time
     */
    trackCompetitor(competitorId: string, price: number): void;
    /**
     * Analyze competitor pricing behavior
     */
    getCompetitorBehavior(competitorId: string): {
        avgPrice: number;
        volatility: number;
        trend: 'increasing' | 'decreasing' | 'stable';
    };
    /**
     * Find pricing opportunities (gaps in market)
     */
    findPricingGaps(competitorPrices: number[]): Array<{
        lower: number;
        upper: number;
        size: number;
    }>;
}
//# sourceMappingURL=competitive-analyzer.d.ts.map