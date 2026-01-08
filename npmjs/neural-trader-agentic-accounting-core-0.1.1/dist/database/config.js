"use strict";
/**
 * Database Configuration
 * PostgreSQL connection settings with pgvector support
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentDBConfig = exports.getMigrationConfig = exports.getDatabaseConfig = void 0;
const getDatabaseConfig = () => {
    return {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'agentic_accounting',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: parseInt(process.env.DB_POOL_SIZE || '20', 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };
};
exports.getDatabaseConfig = getDatabaseConfig;
const getMigrationConfig = () => {
    const config = (0, exports.getDatabaseConfig)();
    return {
        databaseUrl: `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`,
        migrationsTable: 'pgmigrations',
        dir: 'src/database/migrations',
        direction: 'up',
        checkOrder: true,
        verbose: true,
    };
};
exports.getMigrationConfig = getMigrationConfig;
const getAgentDBConfig = () => {
    return {
        dimensions: parseInt(process.env.AGENTDB_DIMENSIONS || '768', 10),
        distanceMetric: process.env.AGENTDB_METRIC || 'cosine',
        indexType: 'hnsw',
        hnswParams: {
            m: 16,
            efConstruction: 200,
            efSearch: 100,
        },
        quantization: process.env.AGENTDB_QUANTIZATION || 'int8',
        persistence: {
            enabled: process.env.AGENTDB_PERSISTENCE !== 'false',
            path: process.env.AGENTDB_PATH || './data/agentdb',
            syncInterval: 60000,
        },
    };
};
exports.getAgentDBConfig = getAgentDBConfig;
//# sourceMappingURL=config.js.map