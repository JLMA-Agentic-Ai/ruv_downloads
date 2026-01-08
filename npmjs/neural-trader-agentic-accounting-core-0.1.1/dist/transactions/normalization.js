"use strict";
/**
 * Transaction Normalization Service
 * Normalizes data formats across different sources
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormalizationService = void 0;
const logger_1 = require("../utils/logger");
class NormalizationService {
    /**
     * Normalize transaction from any source to standard format
     */
    async normalize(rawTransaction, source) {
        logger_1.logger.debug(`Normalizing transaction from ${source}`);
        switch (source) {
            case 'coinbase':
                return this.normalizeCoinbase(rawTransaction);
            case 'binance':
                return this.normalizeBinance(rawTransaction);
            case 'kraken':
                return this.normalizeKraken(rawTransaction);
            case 'etherscan':
                return this.normalizeEtherscan(rawTransaction);
            case 'csv':
                return this.normalizeCSV(rawTransaction);
            default:
                return this.normalizeGeneric(rawTransaction);
        }
    }
    normalizeCoinbase(raw) {
        return {
            id: raw.id || raw.transaction_id,
            timestamp: new Date(raw.created_at || raw.timestamp),
            type: this.mapTransactionType(raw.type || raw.transaction_type),
            asset: raw.amount?.currency || raw.asset,
            quantity: Math.abs(parseFloat(raw.amount?.amount || raw.quantity || '0')),
            price: parseFloat(raw.native_amount?.amount || raw.price || '0'),
            fees: parseFloat(raw.fee?.amount || '0'),
            source: 'coinbase',
            metadata: {
                original: raw,
                exchange: 'coinbase'
            }
        };
    }
    normalizeBinance(raw) {
        return {
            id: raw.orderId?.toString() || raw.id,
            timestamp: new Date(raw.time || raw.timestamp),
            type: this.mapTransactionType(raw.side || raw.type),
            asset: raw.symbol || raw.asset,
            quantity: parseFloat(raw.qty || raw.quantity || '0'),
            price: parseFloat(raw.price || '0'),
            fees: parseFloat(raw.commission || '0'),
            source: 'binance',
            metadata: {
                original: raw,
                exchange: 'binance',
                orderId: raw.orderId
            }
        };
    }
    normalizeKraken(raw) {
        return {
            id: raw.txid || raw.id,
            timestamp: new Date(raw.time * 1000), // Kraken uses Unix timestamp
            type: this.mapTransactionType(raw.type),
            asset: raw.pair || raw.asset,
            quantity: parseFloat(raw.vol || raw.quantity || '0'),
            price: parseFloat(raw.price || '0'),
            fees: parseFloat(raw.fee || '0'),
            source: 'kraken',
            metadata: {
                original: raw,
                exchange: 'kraken'
            }
        };
    }
    normalizeEtherscan(raw) {
        return {
            id: raw.hash,
            timestamp: new Date(parseInt(raw.timeStamp) * 1000),
            type: raw.from === raw.to ? 'TRANSFER' : 'TRADE',
            asset: raw.tokenSymbol || 'ETH',
            quantity: parseFloat(raw.value) / Math.pow(10, parseInt(raw.tokenDecimal || '18')),
            price: 0, // Price needs to be fetched separately for blockchain txs
            fees: parseFloat(raw.gasPrice || '0') * parseFloat(raw.gasUsed || '0') / 1e18,
            source: 'etherscan',
            metadata: {
                original: raw,
                blockchain: 'ethereum',
                hash: raw.hash,
                blockNumber: raw.blockNumber
            }
        };
    }
    normalizeCSV(raw) {
        return {
            id: raw.id || raw.transaction_id || `csv-${Date.now()}-${Math.random()}`,
            timestamp: new Date(raw.date || raw.timestamp),
            type: this.mapTransactionType(raw.type),
            asset: raw.asset || raw.symbol || raw.currency,
            quantity: parseFloat(raw.quantity || raw.amount || '0'),
            price: parseFloat(raw.price || raw.unit_price || '0'),
            fees: parseFloat(raw.fees || raw.fee || '0'),
            source: 'csv',
            metadata: {
                original: raw
            }
        };
    }
    normalizeGeneric(raw) {
        return {
            id: raw.id || `generic-${Date.now()}-${Math.random()}`,
            timestamp: new Date(raw.timestamp || raw.date || Date.now()),
            type: this.mapTransactionType(raw.type),
            asset: raw.asset || raw.symbol,
            quantity: parseFloat(raw.quantity || raw.amount || '0'),
            price: parseFloat(raw.price || '0'),
            fees: parseFloat(raw.fees || raw.fee || '0'),
            source: 'api',
            metadata: {
                original: raw
            }
        };
    }
    mapTransactionType(rawType) {
        const normalized = rawType?.toUpperCase() || 'TRADE';
        const typeMap = {
            'BUY': 'BUY',
            'PURCHASE': 'BUY',
            'SELL': 'SELL',
            'SALE': 'SELL',
            'TRADE': 'TRADE',
            'SWAP': 'TRADE',
            'CONVERT': 'CONVERT',
            'CONVERSION': 'CONVERT',
            'INCOME': 'INCOME',
            'REWARD': 'INCOME',
            'STAKING': 'INCOME',
            'DIVIDEND': 'DIVIDEND',
            'FEE': 'FEE',
            'TRANSFER': 'TRANSFER',
            'SEND': 'TRANSFER',
            'RECEIVE': 'TRANSFER'
        };
        return typeMap[normalized] || 'TRADE';
    }
    /**
     * Convert multi-currency transactions to base currency
     */
    async convertCurrency(amount, fromCurrency, toCurrency, timestamp) {
        // In production, this would call a price API
        // For now, return the amount (assuming same currency or 1:1 rate)
        logger_1.logger.debug(`Currency conversion: ${amount} ${fromCurrency} -> ${toCurrency} at ${timestamp}`);
        return amount;
    }
}
exports.NormalizationService = NormalizationService;
//# sourceMappingURL=normalization.js.map