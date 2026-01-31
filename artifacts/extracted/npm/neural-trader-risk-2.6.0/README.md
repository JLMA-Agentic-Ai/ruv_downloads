# @neural-trader/risk

Risk management and analysis for Neural Trader.

## Installation

```bash
npm install @neural-trader/risk
```

## Usage

```javascript
const {
  riskAnalysis,
  calculateSharpeRatio,
  RiskManager
} = require('@neural-trader/risk');

// Analyze risk
const analysis = await riskAnalysis({
  portfolio: portfolioData,
  confidence: 0.95
});

// Calculate Sharpe ratio
const sharpe = calculateSharpeRatio(returns, riskFreeRate);

// Use risk manager
const manager = new RiskManager({
  maxDrawdown: 0.2,
  maxLeverage: 2.0
});
```

## API

### Classes

- `RiskManager` - Comprehensive risk management

### Functions

- `riskAnalysis()` - Comprehensive risk analysis
- `calculateSharpeRatio()` - Calculate Sharpe ratio
- `calculateSortinoRatio()` - Calculate Sortino ratio
- `monteCarloSimulation()` - Run Monte Carlo simulation
- `calculateKellyCriterion()` - Calculate Kelly criterion
- `calculateMaxLeverage()` - Calculate maximum safe leverage
- `calculateExpectedValue()` - Calculate expected value

## License

MIT OR Apache-2.0
