"use strict";
/**
 * Transaction Ingestion System
 * Handles multi-source data acquisition (CSV, APIs, blockchain)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionIngestionService = void 0;
const logger_1 = require("../utils/logger");
const validation_1 = require("./validation");
const normalization_1 = require("./normalization");
class TransactionIngestionService {
    validator;
    normalizer;
    constructor() {
        this.validator = new validation_1.ValidationService();
        this.normalizer = new normalization_1.NormalizationService();
    }
    /**
     * Ingest transactions from multiple sources
     * Performance target: 10,000+ transactions per minute
     */
    async ingestBatch(transactions, config) {
        const startTime = Date.now();
        logger_1.logger.info(`Starting ingestion of ${transactions.length} transactions from ${config.source}`);
        const result = {
            source: config.source,
            total: transactions.length,
            successful: 0,
            failed: 0,
            errors: [],
            duration: 0,
            transactions: []
        };
        try {
            // Process in batches for performance
            const batchSize = config.batchSize || 1000;
            for (let i = 0; i < transactions.length; i += batchSize) {
                const batch = transactions.slice(i, i + batchSize);
                await this.processBatch(batch, config, result);
            }
            result.duration = Date.now() - startTime;
            logger_1.logger.info(`Ingestion completed: ${result.successful} successful, ${result.failed} failed in ${result.duration}ms`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Ingestion failed', { error, config });
            throw new Error(`Ingestion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async processBatch(batch, config, result) {
        // Optimize by processing in parallel batches of 100
        const PARALLEL_BATCH_SIZE = 100;
        for (let i = 0; i < batch.length; i += PARALLEL_BATCH_SIZE) {
            const parallelBatch = batch.slice(i, i + PARALLEL_BATCH_SIZE);
            // Process transactions in parallel within each batch
            const promises = parallelBatch.map(async (rawTx) => {
                try {
                    // Normalize transaction data
                    let normalized = rawTx;
                    if (config.autoNormalize !== false) {
                        normalized = await this.normalizer.normalize(rawTx, config.source);
                    }
                    // Validate transaction
                    if (config.validateOnIngestion !== false) {
                        const validation = await this.validator.validate(normalized);
                        if (!validation.isValid) {
                            return {
                                success: false,
                                transaction: rawTx,
                                errors: validation.errors
                            };
                        }
                    }
                    return {
                        success: true,
                        transaction: normalized
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        transaction: rawTx,
                        errors: [error instanceof Error ? error.message : 'Unknown error']
                    };
                }
            });
            // Wait for parallel batch to complete
            const results = await Promise.all(promises);
            // Aggregate results
            for (const res of results) {
                if (res.success) {
                    result.transactions.push(res.transaction);
                    result.successful++;
                }
                else {
                    result.failed++;
                    result.errors.push({
                        transaction: res.transaction,
                        errors: res.errors
                    });
                }
            }
        }
    }
    /**
     * Ingest from CSV file
     */
    async ingestFromCSV(filePath) {
        logger_1.logger.info(`Ingesting from CSV: ${filePath}`);
        // CSV parsing logic would go here
        // For now, return placeholder
        return {
            source: 'csv',
            total: 0,
            successful: 0,
            failed: 0,
            errors: [],
            duration: 0,
            transactions: []
        };
    }
    /**
     * Identify taxable events from raw transactions
     */
    async identifyTaxableEvents(transactions) {
        return transactions.filter(tx => {
            // Taxable events: sales, trades, conversions, income
            return ['SELL', 'TRADE', 'CONVERT', 'INCOME', 'DIVIDEND'].includes(tx.type);
        });
    }
}
exports.TransactionIngestionService = TransactionIngestionService;
//# sourceMappingURL=ingestion.js.map