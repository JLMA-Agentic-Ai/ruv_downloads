/**
 * Database Migration Runner
 * Runs SQL migration files in order
 */
/**
 * Run all pending migrations
 */
export declare function runMigrations(migrationsDir?: string): Promise<void>;
/**
 * Run seed files
 */
export declare function runSeeds(seedsDir?: string): Promise<void>;
/**
 * Rollback last migration
 */
export declare function rollbackMigration(): Promise<void>;
//# sourceMappingURL=migrate.d.ts.map