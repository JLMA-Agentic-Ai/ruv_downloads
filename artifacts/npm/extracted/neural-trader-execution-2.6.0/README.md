# @neural-trader/execution

Trade execution and order management for Neural Trader.

## Installation

```bash
npm install @neural-trader/execution
```

## Usage

```javascript
const {
  executeTrade,
  BrokerClient
} = require('@neural-trader/execution');

// Execute a trade
const result = await executeTrade({
  symbol: 'AAPL',
  quantity: 100,
  side: 'buy',
  broker: 'alpaca'
});

// Use broker client
const broker = new BrokerClient({
  type: 'alpaca',
  apiKey: 'your-key',
  secretKey: 'your-secret'
});
```

## API

### Classes

- `BrokerClient` - Interface with trading brokers

### Functions

- `executeTrade()` - Execute a single trade
- `executeMultiAssetTrade()` - Execute trades across multiple assets
- `executeSportsBet()` - Execute sports betting orders
- `executeSwarmStrategy()` - Execute swarm-coordinated strategies
- `getExecutionAnalytics()` - Get execution analytics
- `getTradeExecutionAnalytics()` - Detailed trade analytics
- `getApiLatency()` - Measure broker API latency
- `validateBrokerConfig()` - Validate broker configuration

## License

MIT OR Apache-2.0
