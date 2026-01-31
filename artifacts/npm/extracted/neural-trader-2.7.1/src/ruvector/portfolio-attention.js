/**
 * Portfolio Attention Mechanism
 * Uses attention mechanism for portfolio optimization
 */

// Try to load @ruvector/attention, fallback to simple implementation
let Attention;
try {
  ({ Attention } = require('@ruvector/attention'));
} catch (err) {
  // Fallback: simple attention implementation
  class SimpleAttention {
    constructor(options = {}) {
      this.options = options;
    }

    compute(query, keys, values) {
      // Simple dot-product attention
      const scores = keys.map(k =>
        query.reduce((sum, q, i) => sum + q * k[i], 0)
      );
      const weights = this.softmax(scores);
      return values.map((v, i) => v * weights[i]).reduce((a, b) => a + b, 0);
    }

    softmax(values) {
      const max = Math.max(...values);
      const exps = values.map(v => Math.exp(v - max));
      const sum = exps.reduce((a, b) => a + b, 0);
      return exps.map(e => e / sum);
    }
  }
  Attention = SimpleAttention;
}

/**
 * PortfolioAttention - Attention-based portfolio management
 */
class PortfolioAttention {
  constructor(options = {}) {
    this.options = {
      numAssets: options.numAssets || 10,
      numHeads: options.numHeads || 8,
      headDim: options.headDim || 64,
      dropout: options.dropout || 0.1,
      maxPositionSize: options.maxPositionSize || 0.2,
      ...options
    };

    this.attention = new Attention(this.options);
    this.portfolio = {};
    this.history = [];
  }

  /**
   * Optimize portfolio allocation using attention
   */
  async optimize(marketData, riskProfile = 'moderate') {
    if (!marketData || marketData.length === 0) {
      throw new Error('Market data is required');
    }

    // Extract features from market data
    const features = this.extractFeatures(marketData);

    // Apply attention mechanism
    const attentionWeights = this.calculateAttention(features);

    // Generate portfolio weights
    const weights = this.generateWeights(attentionWeights, riskProfile);

    // Apply constraints
    const constrainedWeights = this.applyConstraints(weights);

    // Update portfolio
    this.portfolio = {
      weights: constrainedWeights,
      assets: marketData.map((d, i) => ({
        symbol: d.symbol || `ASSET_${i}`,
        weight: constrainedWeights[i],
        allocation: constrainedWeights[i] * 100
      })),
      timestamp: Date.now(),
      riskProfile
    };

    this.history.push(this.portfolio);

    return this.portfolio;
  }

  /**
   * Extract features from market data
   */
  extractFeatures(marketData) {
    return marketData.map(asset => {
      const prices = asset.prices || [asset.price || 100];
      const returns = this.calculateReturns(prices);

      return {
        returns: returns,
        volatility: this.calculateVolatility(returns),
        momentum: this.calculateMomentum(prices),
        sharpe: this.calculateSharpe(returns)
      };
    });
  }

  /**
   * Calculate attention weights
   */
  calculateAttention(features) {
    const numAssets = features.length;
    const weights = new Array(numAssets).fill(0);

    // Query, Key, Value matrices (simplified)
    for (let i = 0; i < numAssets; i++) {
      const feature = features[i];

      // Simple attention score based on risk-adjusted return
      const score = feature.sharpe / (1 + feature.volatility);
      weights[i] = score;
    }

    // Softmax normalization
    return this.softmax(weights);
  }

  /**
   * Generate portfolio weights from attention
   */
  generateWeights(attentionWeights, riskProfile) {
    const riskAdjustment = {
      'conservative': 0.5,
      'moderate': 1.0,
      'aggressive': 1.5
    };

    const adjustment = riskAdjustment[riskProfile] || 1.0;

    return attentionWeights.map(w => w * adjustment);
  }

  /**
   * Apply portfolio constraints
   */
  applyConstraints(weights) {
    const { maxPositionSize } = this.options;

    // Cap individual positions
    let adjusted = weights.map(w => Math.min(w, maxPositionSize));

    // Normalize to sum to 1
    const sum = adjusted.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      adjusted = adjusted.map(w => w / sum);
    }

    return adjusted;
  }

  /**
   * Calculate returns from prices
   */
  calculateReturns(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      const ret = (prices[i] - prices[i-1]) / prices[i-1];
      returns.push(ret);
    }
    return returns.length > 0 ? returns : [0];
  }

  /**
   * Calculate volatility
   */
  calculateVolatility(returns) {
    if (returns.length === 0) return 0;

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

    return Math.sqrt(variance);
  }

  /**
   * Calculate momentum
   */
  calculateMomentum(prices) {
    if (prices.length < 2) return 0;

    const recent = prices.slice(-10);
    const returns = this.calculateReturns(recent);

    return returns.reduce((a, b) => a + b, 0);
  }

  /**
   * Calculate Sharpe ratio
   */
  calculateSharpe(returns, riskFreeRate = 0.02) {
    if (returns.length === 0) return 0;

    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);

    return volatility > 0 ? (meanReturn - riskFreeRate / 252) / volatility : 0;
  }

  /**
   * Softmax function
   */
  softmax(values) {
    const max = Math.max(...values);
    const exps = values.map(v => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  }

  /**
   * Rebalance portfolio
   */
  async rebalance(marketData) {
    const currentWeights = this.portfolio.weights || [];
    const newPortfolio = await this.optimize(marketData, this.portfolio.riskProfile);

    // Calculate trades needed
    const trades = newPortfolio.weights.map((newWeight, idx) => {
      const currentWeight = currentWeights[idx] || 0;
      return {
        asset: newPortfolio.assets[idx].symbol,
        currentWeight,
        targetWeight: newWeight,
        trade: newWeight - currentWeight
      };
    });

    return {
      portfolio: newPortfolio,
      trades: trades.filter(t => Math.abs(t.trade) > 0.01)
    };
  }

  /**
   * Get portfolio statistics
   */
  getStats() {
    if (!this.portfolio.weights) {
      return null;
    }

    const weights = this.portfolio.weights;
    const numAssets = weights.length;
    const activePositions = weights.filter(w => w > 0.01).length;
    const maxWeight = Math.max(...weights);
    const concentration = weights.reduce((sum, w) => sum + w * w, 0);

    return {
      numAssets,
      activePositions,
      maxWeight,
      concentration,
      diversification: 1 - concentration,
      timestamp: this.portfolio.timestamp
    };
  }

  /**
   * Get portfolio history
   */
  getHistory() {
    return this.history;
  }

  /**
   * Reset portfolio
   */
  reset() {
    this.portfolio = {};
    this.history = [];
    return { status: 'reset' };
  }
}

module.exports = {
  PortfolioAttention,
  Attention
};
