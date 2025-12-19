# @neural-trader/portfolio

Portfolio management and optimization for Neural Trader.

## Installation

```bash
npm install @neural-trader/portfolio
```

## Usage

```javascript
const {
  portfolioRebalance,
  PortfolioManager,
  PortfolioOptimizer
} = require('@neural-trader/portfolio');

// Rebalance portfolio
const result = await portfolioRebalance({
  targetAllocations: {
    'AAPL': 0.3,
    'GOOGL': 0.3,
    'MSFT': 0.4
  }
});

// Use portfolio manager
const manager = new PortfolioManager({
  initialCapital: 100000
});

// Optimize portfolio
const optimizer = new PortfolioOptimizer({
  riskTolerance: 0.5,
  targetReturn: 0.15
});
```

## API

### Classes

- `PortfolioManager` - Manage portfolio positions and rebalancing
- `PortfolioOptimizer` - Optimize portfolio allocation

### Functions

- `portfolioRebalance()` - Rebalance portfolio to target allocations
- `getPortfolioStatus()` - Get current portfolio status
- `getPredictionPositions()` - Get prediction market positions
- `getBettingPortfolioStatus()` - Get sports betting portfolio
- `crossAssetCorrelationMatrix()` - Calculate correlation matrix
- `correlationAnalysis()` - Analyze asset correlations

## License

MIT OR Apache-2.0
