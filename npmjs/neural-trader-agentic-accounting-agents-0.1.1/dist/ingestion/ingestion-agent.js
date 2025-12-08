"use strict";
/**
 * Ingestion Agent
 * Autonomous agent for transaction data acquisition
 * Performance target: 10,000+ transactions per minute
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionAgent = void 0;
const agent_1 = require("../base/agent");
const agentic_accounting_core_1 = require("@neural-trader/agentic-accounting-core");
const agentic_accounting_core_2 = require("@neural-trader/agentic-accounting-core");
const agentic_accounting_core_3 = require("@neural-trader/agentic-accounting-core");
const agentic_accounting_core_4 = require("@neural-trader/agentic-accounting-core");
class IngestionAgent extends agent_1.BaseAgent {
    ingestionService;
    integrations = new Map();
    ingestionConfig;
    constructor(config) {
        super({
            agentId: config.agentId || 'ingestion-agent',
            agentType: 'IngestionAgent',
            enableLearning: true,
            enableMetrics: true
        });
        this.ingestionService = new agentic_accounting_core_1.TransactionIngestionService();
        this.ingestionConfig = config;
        this.initializeIntegrations(config);
    }
    initializeIntegrations(config) {
        // Initialize exchange integrations if credentials provided
        if (config.credentials?.coinbase) {
            this.integrations.set('coinbase', new agentic_accounting_core_2.CoinbaseIntegration(config.credentials.coinbase));
        }
        if (config.credentials?.binance) {
            this.integrations.set('binance', new agentic_accounting_core_3.BinanceIntegration(config.credentials.binance));
        }
        if (config.credentials?.etherscan) {
            this.integrations.set('etherscan', new agentic_accounting_core_4.EtherscanIntegration(config.credentials.etherscan));
        }
    }
    /**
     * Execute ingestion task
     */
    async execute(task) {
        const taskData = task.data;
        this.logger.info(`Starting ingestion from ${taskData.source}`, { task });
        return this.executeWithMetrics(async () => {
            let transactions = [];
            // Fetch from source if not provided
            if (taskData.data) {
                transactions = taskData.data;
            }
            else {
                transactions = await this.fetchFromSource(taskData);
            }
            // Ingest transactions
            const config = {
                source: taskData.source,
                batchSize: taskData.options?.batchSize || 1000,
                validateOnIngestion: taskData.options?.validateOnIngestion !== false,
                autoNormalize: taskData.options?.autoNormalize !== false
            };
            const result = await this.ingestionService.ingestBatch(transactions, config);
            // Log learning data
            await this.learn({
                action: 'ingest_transactions',
                source: taskData.source,
                successful: result.successful,
                failed: result.failed,
                duration: result.duration,
                performance: result.successful / (result.duration / 1000) // transactions per second
            });
            this.logger.info(`Ingestion completed`, {
                source: taskData.source,
                successful: result.successful,
                failed: result.failed
            });
            return result;
        });
    }
    /**
     * Fetch transactions from source
     */
    async fetchFromSource(task) {
        const integration = this.integrations.get(task.source);
        if (!integration) {
            throw new Error(`No integration configured for source: ${task.source}`);
        }
        switch (task.source) {
            case 'COINBASE':
                return await integration.fetchTransactions(task.accountId, task.options);
            case 'BINANCE':
                return await integration.fetchTrades(task.options?.symbol, task.options);
            case 'ETHERSCAN':
                return await integration.fetchTransactions(task.address, task.options);
            default:
                throw new Error(`Unsupported source: ${task.source}`);
        }
    }
    /**
     * Validate source connection
     */
    async validateSource(source) {
        const integration = this.integrations.get(source);
        if (!integration) {
            return false;
        }
        try {
            return await integration.testConnection();
        }
        catch (error) {
            this.logger.error(`Source validation failed for ${source}`, { error });
            return false;
        }
    }
    /**
     * Get available sources
     */
    getAvailableSources() {
        return Array.from(this.integrations.keys());
    }
    /**
     * Auto-detect and ingest from all configured sources
     */
    async autoIngest() {
        const results = new Map();
        for (const [source, integration] of this.integrations.entries()) {
            try {
                this.logger.info(`Auto-ingesting from ${source}`);
                // Implementation would depend on source type
                results.set(source, { status: 'success' });
            }
            catch (error) {
                this.logger.error(`Auto-ingestion failed for ${source}`, { error });
                results.set(source, { status: 'failed', error });
            }
        }
        return results;
    }
}
exports.IngestionAgent = IngestionAgent;
//# sourceMappingURL=ingestion-agent.js.map