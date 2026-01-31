# 📊 @neural-trader/agentic-accounting-types

[![npm version](https://img.shields.io/npm/v/@neural-trader/agentic-accounting-types.svg)](https://www.npmjs.com/package/@neural-trader/agentic-accounting-types)
[![npm downloads](https://img.shields.io/npm/dm/@neural-trader/agentic-accounting-types.svg)](https://www.npmjs.com/package/@neural-trader/agentic-accounting-types)
[![license](https://img.shields.io/npm/l/@neural-trader/agentic-accounting-types.svg)](https://github.com/neural-trader/agentic-accounting)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

> **Shared TypeScript type definitions for the agentic accounting system**

Comprehensive, production-ready TypeScript types for cryptocurrency accounting, tax calculation, position tracking, and compliance reporting. Built for type safety, interoperability, and developer experience.

---

## ✨ Features

- 🎯 **Complete Type Coverage** - All accounting entities: transactions, positions, lots, tax results
- 💰 **Crypto-Native** - Designed specifically for cryptocurrency trading and accounting
- 📈 **Tax Compliance** - Full support for FIFO, LIFO, HIFO, and specific identification methods
- 🔍 **Wash Sale Detection** - Built-in types for wash sale tracking and adjustments
- 🌐 **Exchange Agnostic** - Works with Coinbase, Binance, Kraken, and any exchange
- 📊 **Position Tracking** - Comprehensive lot tracking with cost basis calculations
- 🛡️ **Compliance Ready** - Types for regulatory compliance and violation tracking
- 🔄 **Decimal Precision** - Uses `decimal.js` for financial-grade precision
- 📦 **Zero Dependencies** - Only requires `decimal.js` for precise math
- 🚀 **Tree-Shakeable** - Import only what you need

---

## 🎁 Benefits

### Why Use This Package?

1. **Type Safety First**: Catch errors at compile time, not runtime
2. **Interoperability**: Shared types across all @neural-trader packages
3. **Developer Experience**: IntelliSense, autocomplete, and inline documentation
4. **Production Ready**: Battle-tested types used in real accounting systems
5. **Standards Compliant**: Follows IRS and international tax accounting standards
6. **Future Proof**: Extensible architecture for new features

---

## 🚀 Quick Start

### Installation

```bash
npm install @neural-trader/agentic-accounting-types
```

```bash
yarn add @neural-trader/agentic-accounting-types
```

```bash
pnpm add @neural-trader/agentic-accounting-types
```

### Basic Usage

```typescript
import {
  Transaction,
  Position,
  TaxResult,
  TaxTransaction,
} from '@neural-trader/agentic-accounting-types';

// Create a buy transaction
const buyTransaction: Transaction = {
  id: 'txn-001',
  timestamp: new Date('2024-01-15'),
  type: 'BUY',
  asset: 'BTC',
  quantity: 1.5,
  price: 45000,
  fees: 50,
  exchange: 'coinbase',
  source: 'api',
};

// Track a position
const position: Position = {
  id: 'pos-btc-001',
  asset: 'BTC',
  quantity: new Decimal(1.5),
  averageCost: new Decimal(45000),
  currentValue: new Decimal(67500),
  unrealizedGainLoss: new Decimal(22500),
  lots: [],
  lastUpdated: new Date(),
  totalCost: new Decimal(67550),
  averageCostBasis: new Decimal(45033.33),
};

// Calculate tax result
const taxResult: TaxResult = {
  totalGain: new Decimal(15000),
  totalLoss: new Decimal(3000),
  shortTermGain: new Decimal(8000),
  shortTermLoss: new Decimal(2000),
  longTermGain: new Decimal(7000),
  longTermLoss: new Decimal(1000),
  transactions: [],
  year: 2024,
};
```

---

## 📚 Detailed Tutorial

### Step 1: Understanding Transactions

Transactions are the foundation of the accounting system. They represent any financial event:

```typescript
import { Transaction } from '@neural-trader/agentic-accounting-types';

// Buy transaction
const buy: Transaction = {
  id: 'txn-buy-001',
  timestamp: new Date('2024-01-15T10:30:00Z'),
  type: 'BUY',
  asset: 'ETH',
  quantity: 10,
  price: 2500,
  fees: 25,
  exchange: 'binance',
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  metadata: {
    orderId: 'order-12345',
    strategy: 'DCA',
  },
  source: 'api',
};

// Sell transaction
const sell: Transaction = {
  id: 'txn-sell-001',
  timestamp: new Date('2024-06-15T14:20:00Z'),
  type: 'SELL',
  asset: 'ETH',
  quantity: 5,
  price: 3000,
  fees: 15,
  exchange: 'binance',
};

// Income (staking rewards)
const income: Transaction = {
  id: 'txn-income-001',
  timestamp: new Date('2024-03-01T00:00:00Z'),
  type: 'INCOME',
  asset: 'ETH',
  quantity: 0.5,
  price: 2800,
  metadata: { type: 'staking-reward' },
};
```

**Supported Transaction Types:**
- `BUY` - Purchase of an asset
- `SELL` - Sale of an asset
- `TRADE` - Exchange one asset for another
- `CONVERT` - Conversion between assets
- `INCOME` - Staking, airdrops, mining rewards
- `DIVIDEND` - Dividend payments
- `FEE` - Transaction fees
- `TRANSFER` - Transfer between wallets

### Step 2: Tracking Positions and Lots

Positions represent your holdings, broken down into tax lots:

```typescript
import { Position, Lot } from '@neural-trader/agentic-accounting-types';
import Decimal from 'decimal.js';

// Create a tax lot
const lot: Lot = {
  id: 'lot-001',
  asset: 'BTC',
  quantity: new Decimal(0.5),
  purchasePrice: new Decimal(45000),
  purchaseDate: new Date('2024-01-01'),
  acquisitionDate: new Date('2024-01-01'), // Alias for purchaseDate
  transactionId: 'txn-buy-001',
  disposed: false,
  isOpen: true,
  remainingQuantity: new Decimal(0.5),
  costBasis: new Decimal(22500), // quantity * purchasePrice
};

// Create a position with multiple lots
const position: Position = {
  id: 'pos-btc-001',
  asset: 'BTC',
  quantity: new Decimal(2.5),
  averageCost: new Decimal(44000),
  currentValue: new Decimal(150000), // 2.5 * current_price
  unrealizedGainLoss: new Decimal(40000),
  lots: [lot /* ... more lots */],
  lastUpdated: new Date(),
  totalCost: new Decimal(110000),
  averageCostBasis: new Decimal(44000),
};
```

> **💡 Tip**: Tax lots are essential for accurate cost basis tracking. Each purchase creates a new lot that can be disposed of using FIFO, LIFO, or other methods.

### Step 3: Calculating Tax Results

Tax calculations produce detailed gain/loss reports:

```typescript
import { TaxResult, TaxTransaction } from '@neural-trader/agentic-accounting-types';
import Decimal from 'decimal.js';

// Create a tax transaction (capital gain)
const taxTxn: TaxTransaction = {
  id: 'tax-001',
  asset: 'BTC',
  buyDate: new Date('2023-01-01'),
  sellDate: new Date('2024-06-01'),
  acquisitionDate: new Date('2023-01-01'),
  disposalDate: new Date('2024-06-01'),
  quantity: new Decimal(0.5),
  costBasis: new Decimal(20000),
  proceeds: new Decimal(30000),
  gainLoss: new Decimal(10000), // proceeds - costBasis
  holdingPeriod: 518, // days held
  type: 'long-term', // > 365 days
  isLongTerm: true,
  method: 'FIFO',
  metadata: {
    lotId: 'lot-001',
    exchange: 'coinbase',
  },
};

// Aggregate tax result for the year
const taxResult: TaxResult = {
  totalGain: new Decimal(25000),
  totalLoss: new Decimal(5000),
  shortTermGain: new Decimal(12000),
  shortTermLoss: new Decimal(3000),
  longTermGain: new Decimal(13000),
  longTermLoss: new Decimal(2000),
  transactions: [taxTxn /* ... more transactions */],
  year: 2024,
};

console.log(`Net Capital Gain: $${taxResult.totalGain.minus(taxResult.totalLoss)}`);
```

### Step 4: Handling Wash Sales

Wash sales occur when you sell at a loss and repurchase within 30 days:

```typescript
import { TaxTransaction } from '@neural-trader/agentic-accounting-types';
import Decimal from 'decimal.js';

const washSaleTxn: TaxTransaction = {
  id: 'tax-wash-001',
  asset: 'BTC',
  buyDate: new Date('2024-01-01'),
  sellDate: new Date('2024-02-01'),
  acquisitionDate: new Date('2024-01-01'),
  disposalDate: new Date('2024-02-01'),
  quantity: new Decimal(1),
  costBasis: new Decimal(50000),
  proceeds: new Decimal(45000),
  gainLoss: new Decimal(-5000), // $5k loss
  washSaleAdjustment: new Decimal(5000), // Loss disallowed
  holdingPeriod: 31,
  type: 'short-term',
  isLongTerm: false,
  method: 'FIFO',
  metadata: {
    washSaleDetected: true,
    replacementPurchaseDate: new Date('2024-02-15'),
  },
};
```

> ⚠️ **Warning**: Wash sales are complex! The disallowed loss gets added to the cost basis of the replacement shares. Always consult a tax professional for wash sale scenarios.

### Step 5: Transaction Ingestion

Import transactions from exchanges and CSV files:

```typescript
import { IngestionResult, TransactionSource } from '@neural-trader/agentic-accounting-types';

const source: TransactionSource = {
  type: 'exchange',
  name: 'coinbase',
  credentials: {
    apiKey: process.env.COINBASE_API_KEY,
    apiSecret: process.env.COINBASE_API_SECRET,
  },
};

const ingestionResult: IngestionResult = {
  source: 'coinbase',
  total: 150,
  successful: 148,
  failed: 2,
  errors: [
    {
      transaction: { id: 'txn-err-001' },
      errors: ['Invalid timestamp format'],
    },
  ],
  duration: 2500, // milliseconds
  transactions: [
    /* successfully imported transactions */
  ],
};

console.log(`Imported ${ingestionResult.successful}/${ingestionResult.total} transactions`);
```

### Step 6: Compliance and Violations

Track regulatory compliance and violations:

```typescript
import { ComplianceRule, ComplianceViolation } from '@neural-trader/agentic-accounting-types';

// Define a compliance rule
const rule: ComplianceRule = {
  id: 'rule-wash-sale',
  name: 'IRS Wash Sale Rule',
  description: '30-day wash sale period for substantially identical securities',
  category: 'tax',
  jurisdiction: 'US',
  severity: 'warning',
};

// Record a violation
const violation: ComplianceViolation = {
  ruleId: 'rule-wash-sale',
  severity: 'warning',
  message: 'Potential wash sale detected: sold BTC at loss and repurchased within 30 days',
  transactionId: 'txn-sell-001',
  details: {
    asset: 'BTC',
    saleDate: new Date('2024-02-01'),
    repurchaseDate: new Date('2024-02-15'),
    daysApart: 14,
    loss: -5000,
  },
  timestamp: new Date(),
};
```

---

## 📖 API Documentation

### Core Types

#### `Transaction`

Represents a financial transaction.

**Properties:**
- `id: string` - Unique transaction identifier
- `timestamp: Date` - Transaction timestamp
- `type: TransactionType` - Transaction type (BUY, SELL, etc.)
- `asset: string` - Asset symbol (BTC, ETH, etc.)
- `quantity: number` - Quantity of asset
- `price: number` - Price per unit
- `fees?: number` - Transaction fees (optional)
- `exchange?: string` - Exchange name (optional)
- `walletAddress?: string` - Wallet address (optional)
- `metadata?: Record<string, any>` - Additional metadata (optional)
- `source?: TransactionSourceType` - Transaction source (optional)

**Transaction Types:**
```typescript
type TransactionType =
  | 'BUY'
  | 'SELL'
  | 'TRADE'
  | 'CONVERT'
  | 'INCOME'
  | 'DIVIDEND'
  | 'FEE'
  | 'TRANSFER';
```

#### `Position`

Represents holdings of a specific asset.

**Properties:**
- `id: string` - Unique position identifier
- `asset: string` - Asset symbol
- `quantity: Decimal` - Current quantity held
- `averageCost: Decimal` - Average cost per unit
- `currentValue: Decimal` - Current market value
- `unrealizedGainLoss: Decimal` - Unrealized P&L
- `lots: Lot[]` - Array of tax lots
- `lastUpdated: Date` - Last update timestamp
- `totalCost: Decimal` - Total cost basis
- `averageCostBasis: Decimal` - Average cost basis

#### `Lot`

Represents a specific purchase lot for tax accounting.

**Properties:**
- `id: string` - Unique lot identifier
- `asset: string` - Asset symbol
- `quantity: Decimal` - Original quantity
- `purchasePrice: Decimal` - Purchase price per unit
- `purchaseDate: Date` - Purchase date
- `acquisitionDate: Date` - Acquisition date (alias)
- `transactionId: string` - Source transaction ID
- `disposed?: boolean` - Whether lot is disposed (optional)
- `disposedDate?: Date` - Disposal date (optional)
- `disposedPrice?: Decimal` - Disposal price (optional)
- `isOpen: boolean` - Whether lot is still open
- `remainingQuantity: Decimal` - Remaining quantity
- `costBasis: Decimal` - Total cost basis

#### `TaxResult`

Tax calculation result for a specific year.

**Properties:**
- `totalGain: Decimal` - Total capital gains
- `totalLoss: Decimal` - Total capital losses
- `shortTermGain: Decimal` - Short-term gains
- `shortTermLoss: Decimal` - Short-term losses
- `longTermGain: Decimal` - Long-term gains (>365 days)
- `longTermLoss: Decimal` - Long-term losses
- `transactions: TaxTransaction[]` - Individual tax transactions
- `year: number` - Tax year

#### `TaxTransaction`

Individual taxable transaction with gain/loss calculation.

**Properties:**
- `id: string` - Unique identifier
- `asset: string` - Asset symbol
- `buyDate: Date` - Purchase date
- `sellDate: Date` - Sale date
- `acquisitionDate: Date` - Acquisition date (alias)
- `disposalDate: Date` - Disposal date (alias)
- `quantity: Decimal` - Quantity sold
- `costBasis: Decimal` - Cost basis
- `proceeds: Decimal` - Sale proceeds
- `gainLoss: Decimal` - Calculated gain/loss
- `holdingPeriod: number` - Holding period in days
- `type: 'short-term' | 'long-term'` - Tax treatment type
- `isLongTerm: boolean` - Whether held >365 days
- `washSaleAdjustment?: Decimal` - Wash sale adjustment (optional)
- `method?: string` - Cost basis method (optional)
- `metadata?: Record<string, any>` - Additional data (optional)

#### `TransactionSource`

Configuration for transaction data sources.

**Properties:**
- `type: 'exchange' | 'wallet' | 'csv' | 'api'` - Source type
- `name: string` - Source name
- `credentials?: Record<string, any>` - API credentials (optional)

#### `IngestionResult`

Result of transaction ingestion process.

**Properties:**
- `source: TransactionSourceType` - Data source
- `total: number` - Total transactions processed
- `successful: number` - Successfully imported
- `failed: number` - Failed imports
- `errors: Array<{transaction: any, errors: string[]}>` - Error details
- `duration: number` - Processing time (ms)
- `transactions: Transaction[]` - Imported transactions

#### `ComplianceRule`

Regulatory compliance rule definition.

**Properties:**
- `id: string` - Rule identifier
- `name: string` - Rule name
- `description: string` - Rule description
- `category: 'tax' | 'regulatory' | 'reporting'` - Rule category
- `jurisdiction: string` - Jurisdiction (US, EU, etc.)
- `severity: 'info' | 'warning' | 'error' | 'critical'` - Severity level

#### `ComplianceViolation`

Compliance violation record.

**Properties:**
- `ruleId: string` - Rule that was violated
- `severity: 'info' | 'warning' | 'error' | 'critical'` - Severity
- `message: string` - Human-readable message
- `transactionId?: string` - Related transaction (optional)
- `details?: Record<string, any>` - Additional details (optional)
- `timestamp: Date` - Violation timestamp

#### `AgentConfig`

Agent configuration for distributed accounting.

**Properties:**
- `agentId: string` - Agent identifier
- `agentType: string` - Agent type
- `enableLearning?: boolean` - Enable learning mode (optional)
- `enableMetrics?: boolean` - Enable metrics collection (optional)
- `logLevel?: 'debug' | 'info' | 'warn' | 'error'` - Log level (optional)

---

## 💡 Tips & Best Practices

### 📝 Use Decimal.js for Precision

Always use `Decimal` for financial calculations to avoid floating-point errors:

```typescript
import Decimal from 'decimal.js';

// ❌ DON'T: Use JavaScript numbers
const price = 0.1 + 0.2; // 0.30000000000000004

// ✅ DO: Use Decimal.js
const price = new Decimal(0.1).plus(0.2); // 0.3
```

### 📅 Date Aliases

The types support date aliases for clarity:

```typescript
// Both are equivalent:
const taxTxn: TaxTransaction = {
  buyDate: new Date('2024-01-01'),
  acquisitionDate: new Date('2024-01-01'),
  sellDate: new Date('2024-06-01'),
  disposalDate: new Date('2024-06-01'),
  // ... other properties
};
```

### 🔍 Type Guards

Create type guards for runtime validation:

```typescript
function isLongTermTransaction(txn: TaxTransaction): boolean {
  return txn.holdingPeriod > 365;
}

function hasWashSale(txn: TaxTransaction): boolean {
  return txn.washSaleAdjustment !== undefined && txn.washSaleAdjustment.greaterThan(0);
}
```

---

## 🔗 Related Packages

Part of the **@neural-trader** agentic accounting ecosystem:

- 📦 **[@neural-trader/agentic-accounting-rust-core](https://www.npmjs.com/package/@neural-trader/agentic-accounting-rust-core)** - High-performance Rust addon for tax calculations
- 💼 **[@neural-trader/agentic-accounting-agents](https://www.npmjs.com/package/@neural-trader/agentic-accounting-agents)** - AI agents for accounting automation
- 🔄 **[@neural-trader/agentic-accounting-ingestion](https://www.npmjs.com/package/@neural-trader/agentic-accounting-ingestion)** - Transaction data ingestion system
- 📊 **[@neural-trader/agentic-accounting-position-tracker](https://www.npmjs.com/package/@neural-trader/agentic-accounting-position-tracker)** - Real-time position tracking
- 💰 **[@neural-trader/agentic-accounting-tax-compute](https://www.npmjs.com/package/@neural-trader/agentic-accounting-tax-compute)** - Tax calculation engine
- 🛡️ **[@neural-trader/agentic-accounting-compliance](https://www.npmjs.com/package/@neural-trader/agentic-accounting-compliance)** - Compliance and regulatory checks
- 📈 **[@neural-trader/agentic-accounting-ui](https://www.npmjs.com/package/@neural-trader/agentic-accounting-ui)** - React UI components

**Main Package**: [@neural-trader/agentic-accounting](https://www.npmjs.com/package/@neural-trader/agentic-accounting)

---

## 📄 License

MIT OR Apache-2.0

---

## 🙏 Credits

Created by **[ruv.io](https://ruv.io)** • Part of **[neural-trader.ruv.io](https://neural-trader.ruv.io)**

---

## 🐛 Issues & Support

Found a bug or have a feature request?

- GitHub Issues: [github.com/neural-trader/agentic-accounting/issues](https://github.com/neural-trader/agentic-accounting/issues)
- Documentation: [neural-trader.ruv.io/docs](https://neural-trader.ruv.io/docs)
- Website: [neural-trader.ruv.io](https://neural-trader.ruv.io)

---

**Keywords**: typescript, types, crypto-accounting, tax-types, cryptocurrency, trading, position-tracking, fifo, lifo, wash-sale, compliance, tax-calculation
