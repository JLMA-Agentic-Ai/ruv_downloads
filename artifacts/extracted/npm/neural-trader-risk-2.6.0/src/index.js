/**
 * @neural-trader/risk
 * Risk management and analysis
 * Version: 2.6.0
 */

const neuralTrader = require('neural-trader');

// Re-export risk classes
const {
  RiskManager
} = neuralTrader;

// Re-export risk functions (7 total)
const {
  riskAnalysis,
  calculateSharpeRatio,
  calculateSortinoRatio,
  monteCarloSimulation,
  calculateKellyCriterion,
  calculateMaxLeverage,
  calculateExpectedValue
} = neuralTrader;

module.exports = {
  // Classes
  RiskManager,

  // Functions
  riskAnalysis,
  calculateSharpeRatio,
  calculateSortinoRatio,
  monteCarloSimulation,
  calculateKellyCriterion,
  calculateMaxLeverage,
  calculateExpectedValue
};
