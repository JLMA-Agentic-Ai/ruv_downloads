/**
 * Database Configuration
 * PostgreSQL connection settings with pgvector support
 */
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
    ssl?: boolean | {
        rejectUnauthorized: boolean;
    };
}
export declare const getDatabaseConfig: () => DatabaseConfig;
export declare const getMigrationConfig: () => {
    databaseUrl: string;
    migrationsTable: string;
    dir: string;
    direction: string;
    checkOrder: boolean;
    verbose: boolean;
};
export interface AgentDBConfig {
    dimensions: number;
    distanceMetric: 'cosine' | 'euclidean' | 'dot';
    indexType: 'hnsw';
    hnswParams: {
        m: number;
        efConstruction: number;
        efSearch: number;
    };
    quantization: 'none' | 'int8' | 'binary';
    persistence: {
        enabled: boolean;
        path: string;
        syncInterval: number;
    };
}
export declare const getAgentDBConfig: () => AgentDBConfig;
//# sourceMappingURL=config.d.ts.map