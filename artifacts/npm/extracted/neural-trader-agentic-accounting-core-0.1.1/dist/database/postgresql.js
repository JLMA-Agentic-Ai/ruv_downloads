"use strict";
/**
 * PostgreSQL Database Client
 * Connection pool and query interface with pgvector support
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.healthCheck = exports.installPgVector = exports.checkPgVector = exports.transaction = exports.query = exports.closeDatabase = exports.getPool = exports.initializeDatabase = void 0;
const pg_1 = require("pg");
const config_1 = require("./config");
const query_cache_1 = require("./query-cache");
let pool = null;
/**
 * Initialize database connection pool
 */
const initializeDatabase = async () => {
    if (pool) {
        return pool;
    }
    const config = (0, config_1.getDatabaseConfig)();
    // Optimized connection pool configuration
    pool = new pg_1.Pool({
        ...config,
        max: 20, // Maximum pool size
        min: 5, // Minimum pool size (keep connections warm)
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return error after 2 seconds if no connection available
        maxUses: 7500, // Close connections after 7500 uses to prevent memory leaks
    });
    // Test connection
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        console.log('✅ Database connection established');
        client.release();
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
    // Handle pool errors
    pool.on('error', (err) => {
        console.error('Unexpected database pool error:', err);
    });
    return pool;
};
exports.initializeDatabase = initializeDatabase;
/**
 * Get database pool instance
 */
const getPool = () => {
    if (!pool) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return pool;
};
exports.getPool = getPool;
/**
 * Close database connection pool
 */
const closeDatabase = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('✅ Database connection closed');
    }
};
exports.closeDatabase = closeDatabase;
/**
 * Execute a query with parameters and optional caching
 */
const query = async (text, params, options) => {
    // Generate cache key for SELECT queries
    const isSelect = text.trim().toUpperCase().startsWith('SELECT');
    const useCache = options?.cache && isSelect;
    if (useCache) {
        const cache = (0, query_cache_1.getQueryCache)({ ttl: options.cacheTtl });
        const cacheKey = `query:${text}:${JSON.stringify(params || [])}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            return cached;
        }
        // Execute query and cache result
        const client = (0, exports.getPool)();
        const result = await client.query(text, params);
        cache.set(cacheKey, result);
        return result;
    }
    const client = (0, exports.getPool)();
    return client.query(text, params);
};
exports.query = query;
/**
 * Execute a transaction
 */
const transaction = async (callback) => {
    const client = await (0, exports.getPool)().connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.transaction = transaction;
/**
 * Check if pgvector extension is installed
 */
const checkPgVector = async () => {
    try {
        const result = await (0, exports.query)("SELECT * FROM pg_extension WHERE extname = 'vector'");
        return result.rows.length > 0;
    }
    catch (error) {
        return false;
    }
};
exports.checkPgVector = checkPgVector;
/**
 * Install pgvector extension
 */
const installPgVector = async () => {
    try {
        await (0, exports.query)('CREATE EXTENSION IF NOT EXISTS vector');
        console.log('✅ pgvector extension installed');
    }
    catch (error) {
        console.error('❌ Failed to install pgvector:', error);
        throw error;
    }
};
exports.installPgVector = installPgVector;
/**
 * Health check
 */
const healthCheck = async () => {
    const start = Date.now();
    try {
        await (0, exports.query)('SELECT 1');
        const latency = Date.now() - start;
        const pgvector = await (0, exports.checkPgVector)();
        return {
            healthy: true,
            latency,
            pgvector,
        };
    }
    catch (error) {
        return {
            healthy: false,
            latency: Date.now() - start,
            pgvector: false,
        };
    }
};
exports.healthCheck = healthCheck;
/**
 * Get database statistics
 */
const getStats = async () => {
    const pool = (0, exports.getPool)();
    return {
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingConnections: pool.waitingCount,
    };
};
exports.getStats = getStats;
//# sourceMappingURL=postgresql.js.map