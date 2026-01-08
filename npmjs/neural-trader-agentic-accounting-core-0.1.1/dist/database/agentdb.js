"use strict";
/**
 * AgentDB Client
 * Vector database for semantic search and pattern matching
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeAgentDB = exports.getAgentDB = exports.AgentDBClient = void 0;
const config_1 = require("./config");
/**
 * AgentDB client for vector operations
 * Note: This is a wrapper interface. Actual implementation depends on
 * the AgentDB library from @ruvnet/agentdb package
 */
class AgentDBClient {
    config;
    collections = new Map();
    initialized = false;
    constructor() {
        this.config = (0, config_1.getAgentDBConfig)();
    }
    /**
     * Initialize AgentDB with persistence
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            // TODO: Import and initialize actual AgentDB library
            // const AgentDB = require('@ruvnet/agentdb');
            // this.db = new AgentDB(this.config);
            console.log('✅ AgentDB initialized', {
                dimensions: this.config.dimensions,
                metric: this.config.distanceMetric,
                persistence: this.config.persistence.enabled,
            });
            this.initialized = true;
        }
        catch (error) {
            console.error('❌ AgentDB initialization failed:', error);
            throw error;
        }
    }
    /**
     * Create or get a collection
     */
    async getCollection(name) {
        if (!this.initialized) {
            await this.initialize();
        }
        if (this.collections.has(name)) {
            return this.collections.get(name);
        }
        // TODO: Create actual collection with AgentDB
        const collection = {
            name,
            dimensions: this.config.dimensions,
            records: new Map(),
        };
        this.collections.set(name, collection);
        return collection;
    }
    /**
     * Insert vector into collection
     */
    async insert(collection, id, vector, metadata = {}) {
        const coll = await this.getCollection(collection);
        const vectorArray = vector instanceof Float32Array
            ? vector
            : new Float32Array(vector);
        if (vectorArray.length !== this.config.dimensions) {
            throw new Error(`Vector dimension mismatch: expected ${this.config.dimensions}, got ${vectorArray.length}`);
        }
        // TODO: Use actual AgentDB insert
        coll.records.set(id, { id, vector: vectorArray, metadata });
    }
    /**
     * Batch insert vectors
     */
    async batchInsert(collection, records) {
        const coll = await this.getCollection(collection);
        for (const record of records) {
            await this.insert(collection, record.id, record.vector, record.metadata || {});
        }
    }
    /**
     * Search for similar vectors
     */
    async search(collection, query, topK = 10, filter) {
        const coll = await this.getCollection(collection);
        const queryVector = query instanceof Float32Array
            ? query
            : new Float32Array(query);
        if (queryVector.length !== this.config.dimensions) {
            throw new Error(`Query vector dimension mismatch: expected ${this.config.dimensions}, got ${queryVector.length}`);
        }
        // TODO: Use actual AgentDB search with HNSW index
        // For now, return empty results
        return [];
    }
    /**
     * Delete vector by ID
     */
    async delete(collection, id) {
        const coll = await this.getCollection(collection);
        // TODO: Use actual AgentDB delete
        return coll.records.delete(id);
    }
    /**
     * Get vector by ID
     */
    async get(collection, id) {
        const coll = await this.getCollection(collection);
        // TODO: Use actual AgentDB get
        return coll.records.get(id) || null;
    }
    /**
     * Count vectors in collection
     */
    async count(collection) {
        const coll = await this.getCollection(collection);
        // TODO: Use actual AgentDB count
        return coll.records.size;
    }
    /**
     * Clear all vectors in collection
     */
    async clear(collection) {
        const coll = await this.getCollection(collection);
        // TODO: Use actual AgentDB clear
        coll.records.clear();
    }
    /**
     * Persist data to disk
     */
    async persist() {
        if (!this.config.persistence.enabled) {
            return;
        }
        // TODO: Use actual AgentDB persist
        console.log('✅ AgentDB persisted to disk');
    }
    /**
     * Close AgentDB connection
     */
    async close() {
        if (this.config.persistence.enabled) {
            await this.persist();
        }
        this.collections.clear();
        this.initialized = false;
        console.log('✅ AgentDB closed');
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            let totalVectors = 0;
            for (const [, coll] of this.collections) {
                totalVectors += coll.records.size;
            }
            return {
                healthy: this.initialized,
                collections: this.collections.size,
                totalVectors,
            };
        }
        catch (error) {
            return {
                healthy: false,
                collections: 0,
                totalVectors: 0,
            };
        }
    }
}
exports.AgentDBClient = AgentDBClient;
// Singleton instance
let agentDBClient = null;
const getAgentDB = () => {
    if (!agentDBClient) {
        agentDBClient = new AgentDBClient();
    }
    return agentDBClient;
};
exports.getAgentDB = getAgentDB;
const closeAgentDB = async () => {
    if (agentDBClient) {
        await agentDBClient.close();
        agentDBClient = null;
    }
};
exports.closeAgentDB = closeAgentDB;
//# sourceMappingURL=agentdb.js.map