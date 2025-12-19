# 💼 Agentic Accounting CLI

[![npm version](https://img.shields.io/npm/v/@neural-trader/agentic-accounting-cli.svg)](https://www.npmjs.com/package/@neural-trader/agentic-accounting-cli)
[![npm downloads](https://img.shields.io/npm/dm/@neural-trader/agentic-accounting-cli.svg)](https://www.npmjs.com/package/@neural-trader/agentic-accounting-cli)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/License-MIT%20OR%20Apache--2.0-blue.svg)](LICENSE)

> **Professional Command-Line Interface for Autonomous Accounting**
> Powerful terminal-based tool for tax calculations, compliance, and financial reporting

A comprehensive CLI tool for managing cryptocurrency and traditional accounting operations. Features autonomous agents for tax optimization, fraud detection, compliance checking, and automated reporting.

---

## ✨ Features

- 🧮 **Tax Calculator** - FIFO, LIFO, HIFO, Specific ID, Average Cost methods
- 📥 **Multi-Source Ingestion** - Coinbase, Binance, Kraken, Etherscan, CSV support
- 📋 **Compliance Engine** - Multi-jurisdiction regulatory validation
- 🔍 **Fraud Detection** - ML-powered anomaly detection
- 💰 **Tax-Loss Harvesting** - Automated opportunity scanning
- 📊 **Report Generator** - P&L, Schedule-D, Form 8949, audit trails
- 📈 **Position Tracker** - Real-time portfolio monitoring
- 🧠 **Learning System** - Adaptive agent optimization
- 🎨 **Beautiful Output** - Color-coded tables and progress indicators
- ⚡ **Interactive Mode** - REPL for advanced workflows

---

## 🚀 Installation

### Global Installation (Recommended)

```bash
npm install -g @neural-trader/agentic-accounting-cli
```

After installation, the `accounting` command will be available globally:

```bash
accounting --version
accounting --help
```

### Local Installation

```bash
npm install @neural-trader/agentic-accounting-cli
```

Run with npx:

```bash
npx accounting --help
```

### From Source

```bash
git clone https://github.com/your-org/neural-trader.git
cd neural-trader/packages/agentic-accounting-cli
npm install
npm run build
npm link
```

---

## ⚡ Quick Start

### Basic Tax Calculation

```bash
# Calculate taxes using FIFO method for 2024
accounting tax --method FIFO --year 2024

# Use a specific transaction file
accounting tax --method HIFO --file transactions.json
```

### Import Transactions

```bash
# Import from Coinbase
accounting ingest coinbase --account your-account-id

# Import from CSV
accounting ingest csv --file transactions.csv

# Import from Etherscan
accounting ingest etherscan --address 0xYourAddress
```

### Generate Reports

```bash
# Generate P&L report
accounting report pnl --year 2024 --output pnl-2024.json

# Generate Schedule-D for taxes
accounting report schedule-d --year 2024 --format pdf

# Generate Form 8949
accounting report form-8949 --year 2024 --output form8949.pdf
```

### Check Positions

```bash
# View all positions
accounting position

# View specific asset
accounting position BTC

# Filter by wallet
accounting position --wallet main-wallet
```

---

## 📖 Detailed Tutorial

### Tutorial 1: Complete Tax Workflow

**Step 1: Import Your Transactions**

```bash
# Import from multiple sources
accounting ingest coinbase --account coinbase-main
accounting ingest binance --account binance-trading
accounting ingest csv --file manual-transactions.csv
```

**Step 2: Calculate Taxes**

```bash
# Calculate using optimal method
accounting tax --method HIFO --year 2024
```

**Output:**
```
┌─────────────────┬──────────────┐
│ Metric          │ Value        │
├─────────────────┼──────────────┤
│ Total Proceeds  │ $125,000.00  │
│ Total Cost      │ $85,000.00   │
│ Capital Gains   │ $40,000.00   │
│ Tax Liability   │ $8,000.00    │
└─────────────────┴──────────────┘
```

**Step 3: Check Compliance**

```bash
accounting compliance --jurisdiction US --year 2024
```

**Step 4: Generate Reports**

```bash
# Generate all required forms
accounting report schedule-d --year 2024 --format pdf --output schedule-d-2024.pdf
accounting report form-8949 --year 2024 --format pdf --output form-8949-2024.pdf
accounting report audit --year 2024 --format json --output audit-trail-2024.json
```

> 📝 **Note**: Always review generated reports with a licensed tax professional before filing.

### Tutorial 2: Tax-Loss Harvesting

**Scan for Opportunities**

```bash
accounting harvest --min-savings 100
```

**Output:**
```
🔍 Scanning portfolio for tax-loss harvesting opportunities...

┌──────────┬─────────────┬──────────────┬────────────────┬──────────────┐
│ Asset    │ Quantity    │ Cost Basis   │ Current Value  │ Potential    │
│          │             │              │                │ Savings      │
├──────────┼─────────────┼──────────────┼────────────────┼──────────────┤
│ ETH      │ 10.50       │ $31,500.00   │ $26,250.00     │ $1,260.00    │
│ SOL      │ 200.00      │ $30,000.00   │ $20,000.00     │ $2,400.00    │
│ ADA      │ 5,000.00    │ $2,500.00    │ $1,750.00      │ $180.00      │
└──────────┴─────────────┴──────────────┴────────────────┴──────────────┘

💰 Total Potential Tax Savings: $3,840.00
```

> 💡 **Tip**: Run tax-loss harvesting analysis quarterly to maximize opportunities throughout the year.

### Tutorial 3: Fraud Detection

**Analyze Suspicious Activity**

```bash
accounting fraud --file recent-transactions.json --threshold 0.7
```

**Output:**
```
🔍 Analyzing transactions for fraud indicators...

⚠️  HIGH RISK TRANSACTIONS DETECTED

┌─────────────┬──────────────┬─────────────┬──────────────┬────────────────┐
│ Date        │ Amount       │ Asset       │ Fraud Score  │ Risk Level     │
├─────────────┼──────────────┼─────────────┼──────────────┼────────────────┤
│ 2024-11-15  │ $50,000.00   │ BTC         │ 0.85         │ HIGH           │
│ 2024-11-14  │ $25,000.00   │ ETH         │ 0.72         │ MEDIUM         │
└─────────────┴──────────────┴─────────────┴──────────────┴────────────────┘

Anomalies Detected:
  • Unusual transaction time (3:00 AM)
  • First-time recipient address
  • Amount exceeds 90th percentile
  • Rapid succession of large transfers
```

> ⚠️ **Warning**: High fraud scores require immediate investigation. Consider freezing affected accounts.

### Tutorial 4: Interactive Mode

**Launch Interactive REPL**

```bash
accounting interactive
```

or

```bash
accounting i
```

**Interactive Session:**
```
🤖 Agentic Accounting Interactive Mode
Type 'help' for commands or 'exit' to quit

> help

Available commands:
  tax <method>           - Calculate taxes
  ingest <source>        - Import transactions
  position [asset]       - View positions
  harvest                - Tax-loss harvesting
  fraud                  - Fraud detection
  report <type>          - Generate report
  compliance             - Check compliance
  agents                 - List agent status
  config <action>        - Manage configuration
  exit                   - Exit interactive mode

> position BTC

Position for BTC:
  Quantity: 2.5 BTC
  Cost Basis: $75,000.00
  Current Value: $150,000.00
  Unrealized P&L: $75,000.00 (+100%)

> exit
Goodbye! 👋
```

---

## 🔧 Command Reference

### `accounting tax`

Calculate tax liability using specified accounting method.

**Options:**
- `-m, --method <method>` - Accounting method (FIFO, LIFO, HIFO, SPECIFIC_ID, AVERAGE_COST)
- `-f, --file <file>` - Transaction file path
- `-y, --year <year>` - Tax year (default: current year)

**Examples:**
```bash
accounting tax --method FIFO --year 2024
accounting tax --method HIFO --file my-trades.json
```

### `accounting ingest`

Ingest transactions from external sources.

**Arguments:**
- `<source>` - Source type (coinbase, binance, kraken, etherscan, csv)

**Options:**
- `-f, --file <file>` - File path for CSV source
- `--account <account>` - Account ID for exchange sources
- `--address <address>` - Blockchain address for Etherscan

**Examples:**
```bash
accounting ingest coinbase --account my-account
accounting ingest csv --file transactions.csv
accounting ingest etherscan --address 0xYourAddress
```

### `accounting compliance`

Check transaction compliance with regulatory rules.

**Options:**
- `-f, --file <file>` - Transaction file path
- `-j, --jurisdiction <jurisdiction>` - Jurisdiction (US, EU, UK, etc.)

**Examples:**
```bash
accounting compliance --jurisdiction US
accounting compliance --file trades.json --jurisdiction EU
```

### `accounting fraud`

Detect potential fraud in transactions.

**Options:**
- `-f, --file <file>` - Transaction file path
- `-t, --threshold <threshold>` - Detection threshold (0-1, default: 0.7)

**Examples:**
```bash
accounting fraud --threshold 0.8
accounting fraud --file suspicious-trades.json
```

### `accounting harvest`

Scan for tax-loss harvesting opportunities.

**Options:**
- `--min-savings <amount>` - Minimum savings threshold (default: 100)

**Examples:**
```bash
accounting harvest
accounting harvest --min-savings 500
```

### `accounting report`

Generate financial and tax reports.

**Arguments:**
- `<type>` - Report type (pnl, schedule-d, form-8949, audit)

**Options:**
- `-f, --file <file>` - Transaction file path
- `-y, --year <year>` - Tax year
- `-o, --output <file>` - Output file path
- `--format <format>` - Output format (json, pdf, csv)

**Examples:**
```bash
accounting report pnl --year 2024 --format pdf
accounting report schedule-d --year 2024 --output schedule-d.pdf
accounting report form-8949 --format json
```

### `accounting position`

View current asset positions.

**Arguments:**
- `[asset]` - Asset symbol (optional, shows all if not provided)

**Options:**
- `--wallet <wallet>` - Wallet identifier filter

**Examples:**
```bash
accounting position              # Show all positions
accounting position BTC          # Show Bitcoin position
accounting position --wallet main-wallet
```

### `accounting learn`

View learning metrics and agent performance.

**Arguments:**
- `[agent]` - Agent ID (optional, shows all if not provided)

**Options:**
- `--period <period>` - Time period (7d, 30d, 90d, default: 30d)

**Examples:**
```bash
accounting learn                        # All agents
accounting learn TaxComputeAgent        # Specific agent
accounting learn --period 90d            # 90-day metrics
```

### `accounting agents`

List all agents and their status.

**Examples:**
```bash
accounting agents
```

**Output:**
```
Active agents:
  ✓ TaxComputeAgent: Active
  ✓ ComplianceAgent: Active
  ✓ ForensicAgent: Active
  ✓ IngestionAgent: Active
  ✓ ReportingAgent: Active
  ✓ HarvestAgent: Active
  ✓ LearningAgent: Active
```

### `accounting config`

Manage CLI configuration.

**Arguments:**
- `<action>` - Action (get, set, list)
- `[key]` - Configuration key
- `[value]` - Configuration value

**Examples:**
```bash
accounting config list
accounting config get default-method
accounting config set default-method HIFO
accounting config set jurisdiction US
```

### `accounting interactive`

Start interactive REPL mode.

**Alias:** `accounting i`

**Examples:**
```bash
accounting interactive
accounting i
```

---

## ⚙️ Configuration

### Configuration File

Create `~/.accounting-cli/config.json`:

```json
{
  "defaultMethod": "HIFO",
  "jurisdiction": "US",
  "currency": "USD",
  "fraudThreshold": 0.7,
  "minHarvestSavings": 100,
  "databases": {
    "transactions": "~/.accounting-cli/transactions.db",
    "positions": "~/.accounting-cli/positions.db"
  },
  "exchanges": {
    "coinbase": {
      "apiKey": "your-api-key",
      "apiSecret": "your-api-secret"
    }
  }
}
```

> 🛡️ **Security**: Never commit API keys to version control. Use environment variables for sensitive data.

### Environment Variables

```bash
# Database location
export ACCOUNTING_DB_PATH=~/.accounting-cli/data.db

# Default accounting method
export ACCOUNTING_METHOD=HIFO

# Jurisdiction for compliance
export ACCOUNTING_JURISDICTION=US

# API keys (optional)
export COINBASE_API_KEY=your-key
export COINBASE_API_SECRET=your-secret
export BINANCE_API_KEY=your-key
export BINANCE_API_SECRET=your-secret
```

### Advanced Configuration

```bash
# Enable debug mode
export DEBUG=accounting:*

# Custom log level
export LOG_LEVEL=debug

# Disable colors (for CI/CD)
export NO_COLOR=1
```

---

## 💡 Usage Tips

### Tip 1: Automate Daily Reports

Create a cron job for daily position updates:

```bash
# Run daily at 9 AM
0 9 * * * accounting position > ~/daily-positions.txt
```

### Tip 2: Batch Processing

Process multiple files at once:

```bash
for file in transactions/*.json; do
  accounting ingest csv --file "$file"
done
```

### Tip 3: Export to Spreadsheet

```bash
# Generate CSV report for Excel/Google Sheets
accounting report pnl --format csv --output pnl-2024.csv
```

### Tip 4: Combine Commands

```bash
# One-liner for complete workflow
accounting ingest csv --file trades.csv && \
accounting compliance --jurisdiction US && \
accounting tax --method HIFO --year 2024 && \
accounting report schedule-d --format pdf --output schedule-d.pdf
```

> 💡 **Pro Tip**: Use shell aliases for frequently used commands:
> ```bash
> alias acc-tax='accounting tax --method HIFO'
> alias acc-report='accounting report pnl --format pdf'
> ```

---

## 🔗 Related Packages

Part of the **Neural Trader Agentic Accounting** ecosystem:

- **[@neural-trader/agentic-accounting-mcp](../agentic-accounting-mcp)** - MCP server for Claude Desktop
- **[@neural-trader/agentic-accounting-core](../agentic-accounting-core)** - Core business logic
- **[@neural-trader/agentic-accounting-agents](../agentic-accounting-agents)** - Autonomous agents
- **[@neural-trader/agentic-accounting-types](../agentic-accounting-types)** - TypeScript definitions
- **[@neural-trader/agentic-accounting-engine](../agentic-accounting-engine)** - Orchestration engine

---

## 🐛 Troubleshooting

### Command Not Found

```bash
# Verify installation
npm list -g @neural-trader/agentic-accounting-cli

# Reinstall if needed
npm install -g @neural-trader/agentic-accounting-cli

# Or use npx
npx @neural-trader/agentic-accounting-cli --version
```

### Database Errors

```bash
# Reset database
rm -rf ~/.accounting-cli/data.db

# Verify permissions
ls -la ~/.accounting-cli/
```

### Import Failures

```bash
# Validate CSV format
accounting ingest csv --file transactions.csv --dry-run

# Check file encoding
file -I transactions.csv  # Should be UTF-8
```

### Performance Issues

```bash
# Reduce data set
accounting tax --year 2024 --file recent-trades.json

# Enable performance profiling
accounting --profile tax --method FIFO
```

> 💡 **Tip**: Run with `--verbose` flag for detailed debugging information.

---

## 📚 Additional Resources

- **[Neural Trader Documentation](https://neural-trader.ruv.io/docs)**
- **[API Reference](https://neural-trader.ruv.io/api)**
- **[Tutorial Videos](https://neural-trader.ruv.io/tutorials)**
- **[Tax Guide](https://neural-trader.ruv.io/tax-guide)**
- **[Community Forum](https://neural-trader.ruv.io/community)**

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

**Keywords**: command-line, accounting-cli, tax-calculator, cryptocurrency-accounting, financial-reporting, autonomous-agents, compliance-checking, fraud-detection, tax-loss-harvesting, portfolio-management
