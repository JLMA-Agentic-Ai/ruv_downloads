/**
 * Database Module Entry Point
 * Exports all database clients and utilities
 */
import * as postgresql from './postgresql';
import * as agentdb from './agentdb';
export { initializeDatabase, closeDatabase, getPool, query, transaction, checkPgVector, installPgVector, healthCheck, getStats, } from './postgresql';
export { AgentDBClient, getAgentDB, closeAgentDB, type VectorRecord, type SearchResult, type AgentDBOptions, } from './agentdb';
export { getDatabaseConfig, getMigrationConfig, getAgentDBConfig, type DatabaseConfig, type AgentDBConfig, } from './config';
/**
 * Initialize all database connections
 */
export declare const initializeAllDatabases: () => Promise<void>;
/**
 * Close all database connections
 */
export declare const closeAllDatabases: () => Promise<void>;
/**
 * Health check for all databases
 */
export declare const healthCheckAll: () => Promise<{
    postgresql: Awaited<ReturnType<typeof postgresql.healthCheck>>;
    agentdb: Awaited<ReturnType<agentdb.AgentDBClient["healthCheck"]>>;
}>;
import type { Pool, PoolClient, QueryResult } from 'pg';
export type { Pool, PoolClient, QueryResult };
//# sourceMappingURL=index.d.ts.map