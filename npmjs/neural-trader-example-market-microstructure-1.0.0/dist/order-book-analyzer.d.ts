/**
 * Order Book Analyzer - Real-time order flow and market microstructure analysis
 * Implements advanced metrics for price discovery, liquidity, and market impact
 */
export interface OrderBookLevel {
    price: number;
    size: number;
    orders: number;
}
export interface OrderBook {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    timestamp: number;
    symbol: string;
}
export interface MicrostructureMetrics {
    bidAskSpread: number;
    spreadBps: number;
    effectiveSpread: number;
    bidDepth: number;
    askDepth: number;
    imbalance: number;
    vpin: number;
    orderFlowToxicity: number;
    adverseSelection: number;
    buyPressure: number;
    sellPressure: number;
    netFlow: number;
    midPrice: number;
    microPrice: number;
    priceImpact: number;
    liquidityScore: number;
    resilienceTime: number;
    timestamp: number;
}
export interface OrderFlow {
    type: 'buy' | 'sell';
    price: number;
    size: number;
    aggressor: 'buyer' | 'seller';
    timestamp: number;
}
export declare class OrderBookAnalyzer {
    private orderFlowHistory;
    private metricsHistory;
    private solver;
    private maxHistoryLength;
    constructor(maxHistoryLength?: number);
    /**
     * Analyze order book and compute comprehensive microstructure metrics
     */
    analyzeOrderBook(orderBook: OrderBook, recentTrades?: OrderFlow[]): MicrostructureMetrics;
    /**
     * Calculate bid-ask spread
     */
    private calculateBidAskSpread;
    /**
     * Calculate spread in basis points
     */
    private calculateSpreadBps;
    /**
     * Calculate effective spread based on actual trades
     */
    private calculateEffectiveSpread;
    /**
     * Calculate depth at multiple levels
     */
    private calculateDepth;
    /**
     * Calculate order book imbalance
     */
    private calculateImbalance;
    /**
     * Calculate VPIN (Volume-Synchronized Probability of Informed Trading)
     */
    private calculateVPIN;
    /**
     * Calculate order flow toxicity
     */
    private calculateOrderFlowToxicity;
    /**
     * Calculate adverse selection cost
     */
    private calculateAdverseSelection;
    /**
     * Calculate buy pressure
     */
    private calculateBuyPressure;
    /**
     * Calculate sell pressure
     */
    private calculateSellPressure;
    /**
     * Calculate net order flow
     */
    private calculateNetFlow;
    /**
     * Calculate mid price
     */
    private calculateMidPrice;
    /**
     * Calculate volume-weighted micro price
     */
    private calculateMicroPrice;
    /**
     * Calculate market impact for a given order size
     */
    private calculatePriceImpact;
    /**
     * Calculate comprehensive liquidity score
     */
    private calculateLiquidityScore;
    /**
     * Estimate time for order book to recover after large trade
     */
    private estimateResilienceTime;
    /**
     * Calculate volatility of a series
     */
    private calculateVolatility;
    /**
     * Get metrics history
     */
    getMetricsHistory(): MicrostructureMetrics[];
    /**
     * Get order flow history
     */
    getOrderFlowHistory(): OrderFlow[];
    /**
     * Reset analyzer state
     */
    reset(): void;
}
//# sourceMappingURL=order-book-analyzer.d.ts.map