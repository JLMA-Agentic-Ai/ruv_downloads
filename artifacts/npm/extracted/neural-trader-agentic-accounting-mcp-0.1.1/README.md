# 🤖 Agentic Accounting MCP Server

[![npm version](https://img.shields.io/npm/v/@neural-trader/agentic-accounting-mcp.svg)](https://www.npmjs.com/package/@neural-trader/agentic-accounting-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@neural-trader/agentic-accounting-mcp.svg)](https://www.npmjs.com/package/@neural-trader/agentic-accounting-mcp)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/License-MIT%20OR%20Apache--2.0-blue.svg)](LICENSE)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io)

> **Autonomous Accounting System via Model Context Protocol**
> Expose powerful accounting tools to Claude and other AI assistants through MCP

Integrate advanced tax calculations, compliance checking, fraud detection, and financial reporting directly into Claude Desktop or any MCP-compatible client. Built on the **Model Context Protocol**, this server provides 10+ specialized accounting tools for autonomous financial operations.

---

## ✨ Features

- 🧮 **Tax Calculations** - Multiple methods (FIFO, LIFO, HIFO, Specific ID, Average Cost)
- 📋 **Compliance Checking** - Multi-jurisdiction regulatory validation
- 🔍 **Fraud Detection** - Vector-based anomaly detection with confidence scoring
- 💰 **Tax-Loss Harvesting** - Automated opportunity scanning for portfolio optimization
- 📊 **Report Generation** - P&L, Schedule-D, Form 8949, audit trails
- 📥 **Transaction Ingestion** - Support for Coinbase, Binance, Kraken, Etherscan, CSV
- 📈 **Position Tracking** - Real-time asset position management
- 🛡️ **Merkle Proofs** - Cryptographic verification for audit trails
- 🧠 **Learning System** - Agent performance optimization with feedback loops
- 📉 **Performance Metrics** - Comprehensive agent analytics and monitoring

---

## 🚀 Installation

### Method 1: Install from npm

```bash
npm install -g @neural-trader/agentic-accounting-mcp
```

### Method 2: Install in your project

```bash
npm install @neural-trader/agentic-accounting-mcp
```

### Method 3: Use with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "agentic-accounting": {
      "command": "npx",
      "args": [
        "-y",
        "@neural-trader/agentic-accounting-mcp"
      ]
    }
  }
}
```

> **💡 Tip**: Restart Claude Desktop after updating the configuration to activate the MCP server.

---

## ⚡ Quick Start

### Using with Claude Desktop

1. **Install the server** (see Installation above)
2. **Restart Claude Desktop**
3. **Use accounting tools in conversation**:

```
Claude, can you calculate the tax liability for this Bitcoin sale using FIFO method?
```

Claude will automatically use the `accounting_calculate_tax` tool to process your request.

### Using Programmatically

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Server starts automatically when imported
// Tools are available via MCP protocol
```

---

## 📖 Detailed Tutorial

### 1. Tax Calculation Workflow

Calculate capital gains and tax liability using various accounting methods:

**In Claude:**
```
I sold 0.5 BTC at $60,000. I originally bought:
- 0.3 BTC at $30,000 on Jan 1
- 0.4 BTC at $40,000 on Feb 1

Calculate my tax using FIFO method.
```

**Behind the scenes**, Claude uses:
```json
{
  "tool": "accounting_calculate_tax",
  "arguments": {
    "transaction": {
      "asset": "BTC",
      "quantity": 0.5,
      "price": 60000,
      "date": "2024-03-01"
    },
    "method": "FIFO"
  }
}
```

**Response:**
```json
{
  "method": "FIFO",
  "gainLoss": 12000,
  "costBasis": 18000,
  "proceeds": 30000,
  "taxLiability": 2880
}
```

### 2. Compliance Checking

Validate transactions against regulatory requirements:

**In Claude:**
```
Check if this $15,000 crypto-to-crypto swap complies with US regulations.
```

**Tool call:**
```json
{
  "tool": "accounting_check_compliance",
  "arguments": {
    "transaction": {
      "type": "swap",
      "amount": 15000,
      "fromAsset": "ETH",
      "toAsset": "BTC"
    },
    "jurisdiction": "US"
  }
}
```

> ⚠️ **Warning**: Always consult with a licensed tax professional for production tax reporting. This tool provides automated analysis but is not a substitute for professional advice.

### 3. Fraud Detection

Analyze transactions for suspicious patterns:

**In Claude:**
```
Analyze this transaction for fraud:
- $50,000 transfer to new wallet
- Sent at 3 AM
- First transaction from this address
```

**Tool call:**
```json
{
  "tool": "accounting_detect_fraud",
  "arguments": {
    "transaction": {
      "amount": 50000,
      "timestamp": "2024-03-01T03:00:00Z",
      "toAddress": "0xnew...",
      "isFirstTransaction": true
    }
  }
}
```

**Response:**
```json
{
  "fraudScore": 0.72,
  "confidence": 0.85,
  "anomalies": [
    "Unusual transaction time",
    "First-time recipient",
    "Large amount"
  ],
  "riskLevel": "MEDIUM"
}
```

### 4. Tax-Loss Harvesting

Identify opportunities to reduce tax liability:

**In Claude:**
```
Scan my portfolio for tax-loss harvesting opportunities:
- 10 ETH bought at $3000 (now $2500)
- 1 BTC bought at $50000 (now $60000)
- 100 SOL bought at $150 (now $100)
```

**Tool call:**
```json
{
  "tool": "accounting_harvest_losses",
  "arguments": {
    "positions": [...],
    "currentPrices": {
      "ETH": 2500,
      "BTC": 60000,
      "SOL": 100
    }
  }
}
```

### 5. Report Generation

Generate professional financial reports:

**In Claude:**
```
Generate a Schedule-D report for tax year 2024 with all my crypto transactions.
```

**Tool call:**
```json
{
  "tool": "accounting_generate_report",
  "arguments": {
    "reportType": "schedule-d",
    "transactions": [...],
    "year": 2024
  }
}
```

> 📝 **Note**: Reports are generated in JSON format by default. Use the CLI tool for PDF/CSV export.

---

## 🔧 Available MCP Tools

### 1. `accounting_calculate_tax`
Calculate tax liability using specified accounting method.

**Parameters:**
- `transaction` (object) - Transaction details
- `method` (string) - FIFO | LIFO | HIFO | SPECIFIC_ID | AVERAGE_COST

### 2. `accounting_check_compliance`
Validate transaction compliance with regulatory rules.

**Parameters:**
- `transaction` (object) - Transaction to validate
- `jurisdiction` (string, optional) - US | EU | UK | etc.

### 3. `accounting_detect_fraud`
Analyze transaction for fraud using vector-based detection.

**Parameters:**
- `transaction` (object) - Transaction to analyze

### 4. `accounting_harvest_losses`
Scan portfolio for tax-loss harvesting opportunities.

**Parameters:**
- `positions` (array) - Array of open positions
- `currentPrices` (object) - Current market prices

### 5. `accounting_generate_report`
Generate financial or tax report.

**Parameters:**
- `reportType` (string) - pnl | schedule-d | form-8949 | audit
- `transactions` (array) - Transactions to include
- `year` (number, optional) - Tax year

### 6. `accounting_ingest_transactions`
Ingest transactions from external sources.

**Parameters:**
- `source` (string) - coinbase | binance | kraken | etherscan | csv
- `data` (array) - Raw transaction data

### 7. `accounting_get_position`
Get current position for an asset.

**Parameters:**
- `asset` (string) - Asset symbol (e.g., "BTC", "ETH")
- `wallet` (string, optional) - Wallet identifier

### 8. `accounting_verify_merkle_proof`
Verify Merkle proof for transaction audit trail.

**Parameters:**
- `transaction` (object) - Transaction to verify
- `proof` (object) - Merkle proof
- `rootHash` (string) - Expected root hash

### 9. `accounting_learn_from_feedback`
Process feedback to improve agent performance.

**Parameters:**
- `agentId` (string) - Agent identifier
- `rating` (number) - Rating from 0 to 1
- `comments` (string, optional) - Feedback text

### 10. `accounting_get_metrics`
Get performance metrics for an agent.

**Parameters:**
- `agentId` (string) - Agent identifier
- `startDate` (string, optional) - ISO format date
- `endDate` (string, optional) - ISO format date

---

## ⚙️ Configuration

### Claude Desktop Configuration

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agentic-accounting": {
      "command": "npx",
      "args": [
        "-y",
        "@neural-trader/agentic-accounting-mcp"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Environment Variables

```bash
# Optional: Set log level
export LOG_LEVEL=debug

# Optional: Database connection
export DB_PATH=/path/to/accounting.db
```

### Custom Configuration

For advanced users, you can run the server directly:

```bash
node node_modules/@neural-trader/agentic-accounting-mcp/dist/server.js
```

---

## 💡 Integration Examples

### Example 1: Complete Tax Workflow

```
Claude, I need to calculate my 2024 crypto taxes:

1. Import transactions from my Coinbase account
2. Calculate gains using HIFO method
3. Check compliance with US regulations
4. Generate Form 8949
5. Identify any tax-loss harvesting opportunities

Please walk me through each step.
```

Claude will orchestrate multiple tools to complete this workflow automatically.

### Example 2: Real-time Fraud Monitoring

```
Claude, monitor this transaction in real-time:
- Amount: $100,000
- Destination: 0xabc123...
- Time: 2024-11-16T14:30:00Z

Check for fraud indicators and verify the transaction proof.
```

### Example 3: Portfolio Analysis

```
Claude, analyze my portfolio:
- Show current positions for all assets
- Calculate unrealized P&L
- Find tax-loss harvesting opportunities
- Generate a comprehensive report
```

---

## 🔗 Related Packages

Part of the **Neural Trader Agentic Accounting** ecosystem:

- **[@neural-trader/agentic-accounting-cli](../agentic-accounting-cli)** - Command-line interface
- **[@neural-trader/agentic-accounting-core](../agentic-accounting-core)** - Core business logic
- **[@neural-trader/agentic-accounting-agents](../agentic-accounting-agents)** - Autonomous agents
- **[@neural-trader/agentic-accounting-types](../agentic-accounting-types)** - TypeScript definitions
- **[@neural-trader/agentic-accounting-engine](../agentic-accounting-engine)** - Orchestration engine

---

## 🐛 Troubleshooting

### Server Not Starting

```bash
# Check if server is accessible
npx @neural-trader/agentic-accounting-mcp

# Expected output: "Agentic Accounting MCP Server running on stdio"
```

### Tools Not Appearing in Claude

1. Verify configuration file location
2. Restart Claude Desktop completely
3. Check for syntax errors in `claude_desktop_config.json`
4. View logs: `~/Library/Logs/Claude/mcp*.log`

### Permission Issues

```bash
# Ensure executable permissions
chmod +x node_modules/.bin/agentic-accounting-mcp
```

> 💡 **Tip**: Enable debug logging with `export LOG_LEVEL=debug` for detailed troubleshooting information.

---

## 📚 Additional Resources

- **[Model Context Protocol Documentation](https://modelcontextprotocol.io)**
- **[Claude Desktop Setup Guide](https://claude.ai/docs)**
- **[Neural Trader Documentation](https://neural-trader.ruv.io/docs)**
- **[API Reference](https://neural-trader.ruv.io/api)**

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

---

## 📄 License

Licensed under MIT OR Apache-2.0. See [LICENSE](LICENSE) for details.

---

## 🌟 Credits

**Created by [ruv.io](https://ruv.io)**
**Website: [neural-trader.ruv.io](https://neural-trader.ruv.io)**

Part of the Neural Trader autonomous trading and accounting platform.

---

**Keywords**: model-context-protocol, claude-desktop, ai-tools, mcp-server, accounting-automation, tax-calculation, compliance-checking, fraud-detection, cryptocurrency-accounting, autonomous-agents
