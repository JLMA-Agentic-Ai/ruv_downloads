/**
 * PostgreSQL Database Client
 * Connection pool and query interface with pgvector support
 */
import { Pool, PoolClient, QueryResult } from 'pg';
import type { QueryResultRow } from 'pg';
/**
 * Initialize database connection pool
 */
export declare const initializeDatabase: () => Promise<Pool>;
/**
 * Get database pool instance
 */
export declare const getPool: () => Pool;
/**
 * Close database connection pool
 */
export declare const closeDatabase: () => Promise<void>;
/**
 * Execute a query with parameters and optional caching
 */
export declare const query: <T extends QueryResultRow = any>(text: string, params?: any[], options?: {
    cache?: boolean;
    cacheTtl?: number;
}) => Promise<QueryResult<T>>;
/**
 * Execute a transaction
 */
export declare const transaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
/**
 * Check if pgvector extension is installed
 */
export declare const checkPgVector: () => Promise<boolean>;
/**
 * Install pgvector extension
 */
export declare const installPgVector: () => Promise<void>;
/**
 * Health check
 */
export declare const healthCheck: () => Promise<{
    healthy: boolean;
    latency: number;
    pgvector: boolean;
}>;
/**
 * Get database statistics
 */
export declare const getStats: () => Promise<{
    totalConnections: number;
    idleConnections: number;
    waitingConnections: number;
}>;
//# sourceMappingURL=postgresql.d.ts.map