"use strict";
/**
 * Order Book Analyzer - Real-time order flow and market microstructure analysis
 * Implements advanced metrics for price discovery, liquidity, and market impact
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderBookAnalyzer = void 0;
const sublinear_time_solver_1 = require("sublinear-time-solver");
class OrderBookAnalyzer {
    orderFlowHistory = [];
    metricsHistory = [];
    solver;
    maxHistoryLength;
    constructor(maxHistoryLength = 1000) {
        this.maxHistoryLength = maxHistoryLength;
        this.solver = new sublinear_time_solver_1.SublinearSolver();
    }
    /**
     * Analyze order book and compute comprehensive microstructure metrics
     */
    analyzeOrderBook(orderBook, recentTrades) {
        if (recentTrades) {
            this.orderFlowHistory.push(...recentTrades);
            if (this.orderFlowHistory.length > this.maxHistoryLength) {
                this.orderFlowHistory = this.orderFlowHistory.slice(-this.maxHistoryLength);
            }
        }
        const metrics = {
            // Spread metrics
            bidAskSpread: this.calculateBidAskSpread(orderBook),
            spreadBps: this.calculateSpreadBps(orderBook),
            effectiveSpread: this.calculateEffectiveSpread(orderBook, recentTrades),
            // Depth metrics
            bidDepth: this.calculateDepth(orderBook.bids),
            askDepth: this.calculateDepth(orderBook.asks),
            imbalance: this.calculateImbalance(orderBook),
            // Toxicity metrics
            vpin: this.calculateVPIN(),
            orderFlowToxicity: this.calculateOrderFlowToxicity(),
            adverseSelection: this.calculateAdverseSelection(orderBook),
            // Flow metrics
            buyPressure: this.calculateBuyPressure(),
            sellPressure: this.calculateSellPressure(),
            netFlow: this.calculateNetFlow(),
            // Price discovery
            midPrice: this.calculateMidPrice(orderBook),
            microPrice: this.calculateMicroPrice(orderBook),
            priceImpact: this.calculatePriceImpact(orderBook),
            // Liquidity
            liquidityScore: this.calculateLiquidityScore(orderBook),
            resilienceTime: this.estimateResilienceTime(orderBook),
            timestamp: orderBook.timestamp
        };
        this.metricsHistory.push(metrics);
        if (this.metricsHistory.length > this.maxHistoryLength) {
            this.metricsHistory = this.metricsHistory.slice(-this.maxHistoryLength);
        }
        return metrics;
    }
    /**
     * Calculate bid-ask spread
     */
    calculateBidAskSpread(orderBook) {
        if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
            return Infinity;
        }
        return orderBook.asks[0].price - orderBook.bids[0].price;
    }
    /**
     * Calculate spread in basis points
     */
    calculateSpreadBps(orderBook) {
        const spread = this.calculateBidAskSpread(orderBook);
        const midPrice = this.calculateMidPrice(orderBook);
        return (spread / midPrice) * 10000; // basis points
    }
    /**
     * Calculate effective spread based on actual trades
     */
    calculateEffectiveSpread(orderBook, trades) {
        if (!trades || trades.length === 0) {
            return this.calculateBidAskSpread(orderBook);
        }
        const midPrice = this.calculateMidPrice(orderBook);
        const effectiveSpreads = trades.map(trade => 2 * Math.abs(trade.price - midPrice));
        return effectiveSpreads.reduce((a, b) => a + b, 0) / effectiveSpreads.length;
    }
    /**
     * Calculate depth at multiple levels
     */
    calculateDepth(levels, numLevels = 5) {
        return levels
            .slice(0, numLevels)
            .reduce((sum, level) => sum + level.size, 0);
    }
    /**
     * Calculate order book imbalance
     */
    calculateImbalance(orderBook) {
        const bidDepth = this.calculateDepth(orderBook.bids);
        const askDepth = this.calculateDepth(orderBook.asks);
        const totalDepth = bidDepth + askDepth;
        if (totalDepth === 0)
            return 0;
        return (bidDepth - askDepth) / totalDepth;
    }
    /**
     * Calculate VPIN (Volume-Synchronized Probability of Informed Trading)
     */
    calculateVPIN() {
        if (this.orderFlowHistory.length < 50) {
            return 0;
        }
        const recentFlow = this.orderFlowHistory.slice(-50);
        const buyVolume = recentFlow
            .filter(f => f.aggressor === 'buyer')
            .reduce((sum, f) => sum + f.size, 0);
        const sellVolume = recentFlow
            .filter(f => f.aggressor === 'seller')
            .reduce((sum, f) => sum + f.size, 0);
        const totalVolume = buyVolume + sellVolume;
        if (totalVolume === 0)
            return 0;
        return Math.abs(buyVolume - sellVolume) / totalVolume;
    }
    /**
     * Calculate order flow toxicity
     */
    calculateOrderFlowToxicity() {
        if (this.orderFlowHistory.length < 20) {
            return 0;
        }
        const recentFlow = this.orderFlowHistory.slice(-20);
        // Calculate price momentum
        const priceChanges = [];
        for (let i = 1; i < recentFlow.length; i++) {
            priceChanges.push(recentFlow[i].price - recentFlow[i - 1].price);
        }
        // Calculate correlation between flow direction and price movement
        let toxicity = 0;
        for (let i = 0; i < priceChanges.length; i++) {
            const flowDirection = recentFlow[i].aggressor === 'buyer' ? 1 : -1;
            const priceDirection = Math.sign(priceChanges[i]);
            toxicity += flowDirection * priceDirection;
        }
        return Math.abs(toxicity / priceChanges.length);
    }
    /**
     * Calculate adverse selection cost
     */
    calculateAdverseSelection(orderBook) {
        if (this.metricsHistory.length < 10) {
            return 0;
        }
        const recentMetrics = this.metricsHistory.slice(-10);
        const spreadChanges = [];
        for (let i = 1; i < recentMetrics.length; i++) {
            spreadChanges.push(recentMetrics[i].bidAskSpread - recentMetrics[i - 1].bidAskSpread);
        }
        const avgSpreadChange = spreadChanges.reduce((a, b) => a + b, 0) / spreadChanges.length;
        return Math.max(0, avgSpreadChange); // Positive indicates widening spreads
    }
    /**
     * Calculate buy pressure
     */
    calculateBuyPressure() {
        if (this.orderFlowHistory.length === 0)
            return 0;
        const recentFlow = this.orderFlowHistory.slice(-20);
        const buyVolume = recentFlow
            .filter(f => f.aggressor === 'buyer')
            .reduce((sum, f) => sum + f.size, 0);
        const totalVolume = recentFlow.reduce((sum, f) => sum + f.size, 0);
        return totalVolume > 0 ? buyVolume / totalVolume : 0;
    }
    /**
     * Calculate sell pressure
     */
    calculateSellPressure() {
        if (this.orderFlowHistory.length === 0)
            return 0;
        const recentFlow = this.orderFlowHistory.slice(-20);
        const sellVolume = recentFlow
            .filter(f => f.aggressor === 'seller')
            .reduce((sum, f) => sum + f.size, 0);
        const totalVolume = recentFlow.reduce((sum, f) => sum + f.size, 0);
        return totalVolume > 0 ? sellVolume / totalVolume : 0;
    }
    /**
     * Calculate net order flow
     */
    calculateNetFlow() {
        return this.calculateBuyPressure() - this.calculateSellPressure();
    }
    /**
     * Calculate mid price
     */
    calculateMidPrice(orderBook) {
        if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
            return 0;
        }
        return (orderBook.bids[0].price + orderBook.asks[0].price) / 2;
    }
    /**
     * Calculate volume-weighted micro price
     */
    calculateMicroPrice(orderBook) {
        if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
            return this.calculateMidPrice(orderBook);
        }
        const bestBid = orderBook.bids[0];
        const bestAsk = orderBook.asks[0];
        const totalSize = bestBid.size + bestAsk.size;
        if (totalSize === 0) {
            return this.calculateMidPrice(orderBook);
        }
        return (bestBid.price * bestAsk.size + bestAsk.price * bestBid.size) / totalSize;
    }
    /**
     * Calculate market impact for a given order size
     */
    calculatePriceImpact(orderBook, orderSize = 100) {
        const midPrice = this.calculateMidPrice(orderBook);
        // Calculate average execution price for the order size
        let remainingSize = orderSize;
        let totalCost = 0;
        for (const level of orderBook.asks) {
            if (remainingSize <= 0)
                break;
            const fillSize = Math.min(remainingSize, level.size);
            totalCost += fillSize * level.price;
            remainingSize -= fillSize;
        }
        if (remainingSize > 0) {
            return Infinity; // Not enough liquidity
        }
        const avgPrice = totalCost / orderSize;
        return (avgPrice - midPrice) / midPrice;
    }
    /**
     * Calculate comprehensive liquidity score
     */
    calculateLiquidityScore(orderBook) {
        const spreadScore = 1 / (1 + this.calculateSpreadBps(orderBook) / 100);
        const depthScore = Math.min(1, (this.calculateDepth(orderBook.bids) + this.calculateDepth(orderBook.asks)) / 1000);
        const imbalanceScore = 1 - Math.abs(this.calculateImbalance(orderBook));
        return (spreadScore * 0.4 + depthScore * 0.4 + imbalanceScore * 0.2);
    }
    /**
     * Estimate time for order book to recover after large trade
     */
    estimateResilienceTime(orderBook) {
        // Simple heuristic based on historical spread recovery
        if (this.metricsHistory.length < 20) {
            return 0;
        }
        const recentMetrics = this.metricsHistory.slice(-20);
        const spreadVolatility = this.calculateVolatility(recentMetrics.map(m => m.bidAskSpread));
        // Higher volatility = slower resilience
        return spreadVolatility * 100; // milliseconds
    }
    /**
     * Calculate volatility of a series
     */
    calculateVolatility(series) {
        if (series.length < 2)
            return 0;
        const mean = series.reduce((a, b) => a + b, 0) / series.length;
        const variance = series.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / series.length;
        return Math.sqrt(variance);
    }
    /**
     * Get metrics history
     */
    getMetricsHistory() {
        return [...this.metricsHistory];
    }
    /**
     * Get order flow history
     */
    getOrderFlowHistory() {
        return [...this.orderFlowHistory];
    }
    /**
     * Reset analyzer state
     */
    reset() {
        this.orderFlowHistory = [];
        this.metricsHistory = [];
    }
}
exports.OrderBookAnalyzer = OrderBookAnalyzer;
//# sourceMappingURL=order-book-analyzer.js.map