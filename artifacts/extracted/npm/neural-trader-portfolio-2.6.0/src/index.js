/**
 * @neural-trader/portfolio
 * Portfolio management and optimization
 * Version: 2.6.0
 */

const neuralTrader = require('neural-trader');

// Re-export portfolio classes
const {
  PortfolioManager,
  PortfolioOptimizer
} = neuralTrader;

// Re-export portfolio functions (6 total)
const {
  portfolioRebalance,
  getPortfolioStatus,
  getPredictionPositions,
  getBettingPortfolioStatus,
  crossAssetCorrelationMatrix,
  correlationAnalysis
} = neuralTrader;

module.exports = {
  // Classes
  PortfolioManager,
  PortfolioOptimizer,

  // Functions
  portfolioRebalance,
  getPortfolioStatus,
  getPredictionPositions,
  getBettingPortfolioStatus,
  crossAssetCorrelationMatrix,
  correlationAnalysis
};
