/**
 * Batch Database Operations
 * Optimized bulk insert and update operations
 */
import { PoolClient } from 'pg';
export interface BatchInsertOptions {
    batchSize?: number;
    onProgress?: (processed: number, total: number) => void;
}
/**
 * Batch insert records efficiently
 */
export declare function batchInsert<T extends Record<string, any>>(table: string, columns: string[], records: T[], options?: BatchInsertOptions): Promise<number>;
/**
 * Batch update records efficiently using CASE statements
 */
export declare function batchUpdate<T extends Record<string, any>>(table: string, idColumn: string, updates: {
    id: any;
    changes: Partial<T>;
}[], options?: BatchInsertOptions): Promise<number>;
/**
 * Execute operations in a transaction with retries
 */
export declare function withTransaction<T>(operations: (client: PoolClient) => Promise<T>, maxRetries?: number): Promise<T>;
//# sourceMappingURL=batch-operations.d.ts.map