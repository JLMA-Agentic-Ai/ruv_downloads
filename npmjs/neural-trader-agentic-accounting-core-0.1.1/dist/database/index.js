"use strict";
/**
 * Database Module Entry Point
 * Exports all database clients and utilities
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckAll = exports.closeAllDatabases = exports.initializeAllDatabases = exports.getAgentDBConfig = exports.getMigrationConfig = exports.getDatabaseConfig = exports.closeAgentDB = exports.getAgentDB = exports.AgentDBClient = exports.getStats = exports.healthCheck = exports.installPgVector = exports.checkPgVector = exports.transaction = exports.query = exports.getPool = exports.closeDatabase = exports.initializeDatabase = void 0;
// Import for internal use
const postgresql = __importStar(require("./postgresql"));
const agentdb = __importStar(require("./agentdb"));
// PostgreSQL client
var postgresql_1 = require("./postgresql");
Object.defineProperty(exports, "initializeDatabase", { enumerable: true, get: function () { return postgresql_1.initializeDatabase; } });
Object.defineProperty(exports, "closeDatabase", { enumerable: true, get: function () { return postgresql_1.closeDatabase; } });
Object.defineProperty(exports, "getPool", { enumerable: true, get: function () { return postgresql_1.getPool; } });
Object.defineProperty(exports, "query", { enumerable: true, get: function () { return postgresql_1.query; } });
Object.defineProperty(exports, "transaction", { enumerable: true, get: function () { return postgresql_1.transaction; } });
Object.defineProperty(exports, "checkPgVector", { enumerable: true, get: function () { return postgresql_1.checkPgVector; } });
Object.defineProperty(exports, "installPgVector", { enumerable: true, get: function () { return postgresql_1.installPgVector; } });
Object.defineProperty(exports, "healthCheck", { enumerable: true, get: function () { return postgresql_1.healthCheck; } });
Object.defineProperty(exports, "getStats", { enumerable: true, get: function () { return postgresql_1.getStats; } });
// AgentDB client
var agentdb_1 = require("./agentdb");
Object.defineProperty(exports, "AgentDBClient", { enumerable: true, get: function () { return agentdb_1.AgentDBClient; } });
Object.defineProperty(exports, "getAgentDB", { enumerable: true, get: function () { return agentdb_1.getAgentDB; } });
Object.defineProperty(exports, "closeAgentDB", { enumerable: true, get: function () { return agentdb_1.closeAgentDB; } });
// Configuration
var config_1 = require("./config");
Object.defineProperty(exports, "getDatabaseConfig", { enumerable: true, get: function () { return config_1.getDatabaseConfig; } });
Object.defineProperty(exports, "getMigrationConfig", { enumerable: true, get: function () { return config_1.getMigrationConfig; } });
Object.defineProperty(exports, "getAgentDBConfig", { enumerable: true, get: function () { return config_1.getAgentDBConfig; } });
/**
 * Initialize all database connections
 */
const initializeAllDatabases = async () => {
    console.log('🔄 Initializing databases...');
    try {
        // Initialize PostgreSQL
        await postgresql.initializeDatabase();
        // Install pgvector if needed
        const hasPgVector = await postgresql.checkPgVector();
        if (!hasPgVector) {
            await postgresql.installPgVector();
        }
        // Initialize AgentDB
        const agentDB = agentdb.getAgentDB();
        await agentDB.initialize();
        console.log('✅ All databases initialized successfully');
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
};
exports.initializeAllDatabases = initializeAllDatabases;
/**
 * Close all database connections
 */
const closeAllDatabases = async () => {
    console.log('🔄 Closing databases...');
    try {
        await postgresql.closeDatabase();
        await agentdb.closeAgentDB();
        console.log('✅ All databases closed successfully');
    }
    catch (error) {
        console.error('❌ Error closing databases:', error);
        throw error;
    }
};
exports.closeAllDatabases = closeAllDatabases;
/**
 * Health check for all databases
 */
const healthCheckAll = async () => {
    const [postgresqlHealth, agentdbHealth] = await Promise.all([
        postgresql.healthCheck(),
        agentdb.getAgentDB().healthCheck(),
    ]);
    return { postgresql: postgresqlHealth, agentdb: agentdbHealth };
};
exports.healthCheckAll = healthCheckAll;
//# sourceMappingURL=index.js.map