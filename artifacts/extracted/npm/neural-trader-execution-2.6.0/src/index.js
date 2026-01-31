/**
 * @neural-trader/execution
 * Trade execution and order management
 * Version: 2.6.0
 */

const neuralTrader = require('neural-trader');

// Re-export execution classes
const {
  BrokerClient
} = neuralTrader;

// Re-export execution functions (8 total)
const {
  executeTrade,
  executeMultiAssetTrade,
  executeSportsBet,
  executeSwarmStrategy,
  getExecutionAnalytics,
  getTradeExecutionAnalytics,
  getApiLatency,
  validateBrokerConfig
} = neuralTrader;

module.exports = {
  // Classes
  BrokerClient,

  // Functions
  executeTrade,
  executeMultiAssetTrade,
  executeSportsBet,
  executeSwarmStrategy,
  getExecutionAnalytics,
  getTradeExecutionAnalytics,
  getApiLatency,
  validateBrokerConfig
};
