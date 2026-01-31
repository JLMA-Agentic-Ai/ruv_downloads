/**
 * Strategies SONA (Self-Optimizing Neural Architecture)
 * Adaptive trading strategies with neural optimization
 */

// Try to load @ruvector/sona, fallback to simple implementation
let SONA;
try {
  ({ SONA } = require('@ruvector/sona'));
} catch (err) {
  // Fallback: simple SONA implementation
  class SimpleSONA {
    constructor(options = {}) {
      this.options = options;
    }

    optimize(data) {
      return { optimized: true, iterations: 0 };
    }
  }
  SONA = SimpleSONA;
}

/**
 * StrategySONA - Self-optimizing trading strategy
 */
class StrategySONA {
  constructor(options = {}) {
    this.options = {
      lookbackPeriod: options.lookbackPeriod || 20,
      optimizationInterval: options.optimizationInterval || 100,
      minTradeSize: options.minTradeSize || 0.01,
      maxPositionSize: options.maxPositionSize || 1.0,
      riskLimit: options.riskLimit || 0.02,
      ...options
    };

    this.sona = new SONA(this.options);
    this.state = {
      position: 0,
      pnl: 0,
      trades: [],
      metrics: {
        sharpe: 0,
        winRate: 0,
        maxDrawdown: 0
      }
    };

    this.architecture = null;
    this.optimizationCounter = 0;
  }

  /**
   * Generate trading signal
   */
  async generateSignal(marketData) {
    if (!marketData || marketData.length === 0) {
      return { action: 'hold', confidence: 0, reason: 'No data' };
    }

    // Extract features
    const features = this.extractFeatures(marketData);

    // Self-optimize if needed
    if (this.shouldOptimize()) {
      await this.optimize(marketData);
    }

    // Generate signal from features
    const signal = this.calculateSignal(features);

    // Apply risk management
    const adjustedSignal = this.applyRiskManagement(signal);

    return adjustedSignal;
  }

  /**
   * Extract market features
   */
  extractFeatures(marketData) {
    const recent = marketData.slice(-this.options.lookbackPeriod);
    const prices = recent.map(d => d.close || d.price || 0);

    return {
      returns: this.calculateReturns(prices),
      volatility: this.calculateVolatility(prices),
      momentum: this.calculateMomentum(prices),
      trend: this.calculateTrend(prices),
      volume: this.calculateVolumeProfile(recent),
      rsi: this.calculateRSI(prices),
      macd: this.calculateMACD(prices)
    };
  }

  /**
   * Calculate signal from features
   */
  calculateSignal(features) {
    let score = 0;
    let confidence = 0;

    // Momentum-based scoring
    if (features.momentum > 0) {
      score += features.momentum * 2;
      confidence += 0.2;
    }

    // Trend following
    if (features.trend > 0.01) {
      score += 0.3;
      confidence += 0.2;
    } else if (features.trend < -0.01) {
      score -= 0.3;
      confidence += 0.2;
    }

    // RSI extremes
    if (features.rsi < 30) {
      score += 0.2; // Oversold
      confidence += 0.15;
    } else if (features.rsi > 70) {
      score -= 0.2; // Overbought
      confidence += 0.15;
    }

    // MACD
    if (features.macd > 0) {
      score += 0.15;
      confidence += 0.1;
    } else {
      score -= 0.15;
      confidence += 0.1;
    }

    // Volume confirmation
    if (features.volume > 1.2) {
      confidence *= 1.2; // High volume increases confidence
    }

    // Determine action
    let action = 'hold';
    if (score > 0.2 && confidence > 0.5) {
      action = 'buy';
    } else if (score < -0.2 && confidence > 0.5) {
      action = 'sell';
    }

    return {
      action,
      score,
      confidence: Math.min(confidence, 1.0),
      features
    };
  }

  /**
   * Apply risk management rules
   */
  applyRiskManagement(signal) {
    const { position } = this.state;
    const { maxPositionSize, riskLimit } = this.options;

    // Position limits
    if (signal.action === 'buy' && position >= maxPositionSize) {
      return { ...signal, action: 'hold', reason: 'Position limit reached' };
    }

    if (signal.action === 'sell' && position <= -maxPositionSize) {
      return { ...signal, action: 'hold', reason: 'Position limit reached' };
    }

    // Risk limit check
    const unrealizedPnL = this.calculateUnrealizedPnL();
    if (Math.abs(unrealizedPnL) > riskLimit) {
      return { ...signal, action: 'hold', reason: 'Risk limit exceeded' };
    }

    return signal;
  }

  /**
   * Execute trade based on signal
   */
  async executeTrade(signal, price) {
    if (signal.action === 'hold') {
      return { executed: false, reason: signal.reason };
    }

    const size = this.calculateTradeSize(signal);
    const direction = signal.action === 'buy' ? 1 : -1;

    const trade = {
      timestamp: Date.now(),
      action: signal.action,
      price,
      size,
      position: this.state.position + (direction * size),
      confidence: signal.confidence
    };

    this.state.position = trade.position;
    this.state.trades.push(trade);

    return { executed: true, trade };
  }

  /**
   * Calculate trade size based on confidence
   */
  calculateTradeSize(signal) {
    const { minTradeSize, maxPositionSize } = this.options;
    const baseSize = minTradeSize + (signal.confidence * maxPositionSize * 0.5);

    return Math.min(baseSize, maxPositionSize);
  }

  /**
   * Check if should optimize
   */
  shouldOptimize() {
    this.optimizationCounter++;
    return this.optimizationCounter >= this.options.optimizationInterval;
  }

  /**
   * Self-optimize strategy
   */
  async optimize(marketData) {
    // Analyze recent performance
    const recentTrades = this.state.trades.slice(-50);

    if (recentTrades.length > 10) {
      const performance = this.analyzePerformance(recentTrades);

      // Adjust parameters based on performance
      if (performance.winRate < 0.4) {
        this.options.lookbackPeriod = Math.min(this.options.lookbackPeriod + 5, 50);
      } else if (performance.winRate > 0.6) {
        this.options.lookbackPeriod = Math.max(this.options.lookbackPeriod - 2, 10);
      }

      // Update metrics
      this.state.metrics = performance;
    }

    this.optimizationCounter = 0;
    this.architecture = {
      optimized: true,
      timestamp: Date.now(),
      parameters: { ...this.options }
    };

    return this.architecture;
  }

  /**
   * Analyze strategy performance
   */
  analyzePerformance(trades) {
    if (trades.length === 0) {
      return { sharpe: 0, winRate: 0, maxDrawdown: 0 };
    }

    const returns = [];
    let wins = 0;
    let cumPnL = 0;
    let maxPnL = 0;
    let maxDrawdown = 0;

    for (let i = 1; i < trades.length; i++) {
      const ret = (trades[i].price - trades[i-1].price) / trades[i-1].price;
      returns.push(ret);

      if (ret > 0) wins++;

      cumPnL += ret;
      maxPnL = Math.max(maxPnL, cumPnL);
      maxDrawdown = Math.max(maxDrawdown, maxPnL - cumPnL);
    }

    const winRate = wins / returns.length;
    const sharpe = this.calculateSharpeFromReturns(returns);

    return { sharpe, winRate, maxDrawdown };
  }

  // Helper calculation methods
  calculateReturns(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    return returns;
  }

  calculateVolatility(prices) {
    const returns = this.calculateReturns(prices);
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  calculateMomentum(prices) {
    if (prices.length < 2) return 0;
    return (prices[prices.length - 1] - prices[0]) / prices[0];
  }

  calculateTrend(prices) {
    if (prices.length < 2) return 0;
    const sma = prices.reduce((a, b) => a + b, 0) / prices.length;
    return (prices[prices.length - 1] - sma) / sma;
  }

  calculateVolumeProfile(marketData) {
    const volumes = marketData.map(d => d.volume || 1);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    return volumes[volumes.length - 1] / avgVolume;
  }

  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50;

    const changes = this.calculateReturns(prices);
    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? -c : 0);

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateMACD(prices) {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    return ema12 - ema26;
  }

  calculateEMA(prices, period) {
    if (prices.length === 0) return 0;

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  calculateSharpeFromReturns(returns) {
    if (returns.length === 0) return 0;

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const std = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
    );

    return std > 0 ? mean / std : 0;
  }

  calculateUnrealizedPnL() {
    // Simplified unrealized PnL calculation
    return this.state.pnl;
  }

  /**
   * Get strategy state
   */
  getState() {
    return {
      ...this.state,
      architecture: this.architecture,
      options: this.options
    };
  }

  /**
   * Reset strategy
   */
  reset() {
    this.state = {
      position: 0,
      pnl: 0,
      trades: [],
      metrics: { sharpe: 0, winRate: 0, maxDrawdown: 0 }
    };
    this.optimizationCounter = 0;
    return { status: 'reset' };
  }
}

module.exports = {
  StrategySONA,
  SONA
};
