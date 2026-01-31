"use strict";
/**
 * Batch Database Operations
 * Optimized bulk insert and update operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchInsert = batchInsert;
exports.batchUpdate = batchUpdate;
exports.withTransaction = withTransaction;
const postgresql_1 = require("./postgresql");
/**
 * Batch insert records efficiently
 */
async function batchInsert(table, columns, records, options = {}) {
    const { batchSize = 500, onProgress } = options;
    const pool = (0, postgresql_1.getPool)();
    let totalInserted = 0;
    // Process in batches
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        // Build parameterized query
        const values = [];
        const valuePlaceholders = [];
        batch.forEach((record, batchIdx) => {
            const rowPlaceholders = [];
            columns.forEach((col, colIdx) => {
                const paramIdx = batchIdx * columns.length + colIdx + 1;
                rowPlaceholders.push(`$${paramIdx}`);
                values.push(record[col]);
            });
            valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
        });
        const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES ${valuePlaceholders.join(', ')}
      ON CONFLICT DO NOTHING
    `;
        await pool.query(query, values);
        totalInserted += batch.length;
        if (onProgress) {
            onProgress(totalInserted, records.length);
        }
    }
    return totalInserted;
}
/**
 * Batch update records efficiently using CASE statements
 */
async function batchUpdate(table, idColumn, updates, options = {}) {
    if (updates.length === 0)
        return 0;
    const { batchSize = 500, onProgress } = options;
    const pool = (0, postgresql_1.getPool)();
    let totalUpdated = 0;
    // Get all columns to update
    const updateColumns = new Set();
    updates.forEach(u => Object.keys(u.changes).forEach(k => updateColumns.add(k)));
    const columns = Array.from(updateColumns);
    // Process in batches
    for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const ids = batch.map(u => u.id);
        // Build CASE statements for each column
        const caseStatements = columns.map(col => {
            const cases = batch
                .filter(u => u.changes[col] !== undefined)
                .map((u, idx) => `WHEN ${idColumn} = $${idx + 1} THEN $${ids.length + batch.indexOf(u) * columns.length + columns.indexOf(col) + 1}`)
                .join(' ');
            return `${col} = CASE ${cases} ELSE ${col} END`;
        });
        // Build values array
        const values = [
            ...ids,
            ...batch.flatMap(u => columns.map(col => u.changes[col]))
        ];
        const query = `
      UPDATE ${table}
      SET ${caseStatements.join(', ')}
      WHERE ${idColumn} IN (${ids.map((_, idx) => `$${idx + 1}`).join(', ')})
    `;
        await pool.query(query, values);
        totalUpdated += batch.length;
        if (onProgress) {
            onProgress(totalUpdated, updates.length);
        }
    }
    return totalUpdated;
}
/**
 * Execute operations in a transaction with retries
 */
async function withTransaction(operations, maxRetries = 3) {
    const pool = (0, postgresql_1.getPool)();
    let lastError = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await operations(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            lastError = error instanceof Error ? error : new Error(String(error));
            // Don't retry on certain errors
            if (error instanceof Error && error.message.includes('unique constraint')) {
                throw error;
            }
            // Exponential backoff
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
            }
        }
        finally {
            client.release();
        }
    }
    throw lastError || new Error('Transaction failed after retries');
}
//# sourceMappingURL=batch-operations.js.map