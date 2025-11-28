"use strict";
/**
 * DAG Manager
 *
 * Manages global DAG state and execution registry for resource access.
 * Provides centralized storage for quantum execution results and DAG vertices.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dagManager = void 0;
class DagManager {
    constructor() {
        this.executions = new Map();
        this.vertices = new Map();
        this.circuits = new Map();
        this.benchmarks = new Map();
    }
    // Execution management
    registerExecution(execution) {
        this.executions.set(execution.execution_id, execution);
    }
    getExecution(execution_id) {
        return this.executions.get(execution_id);
    }
    updateExecution(execution_id, updates) {
        const existing = this.executions.get(execution_id);
        if (existing) {
            this.executions.set(execution_id, { ...existing, ...updates });
        }
    }
    listExecutions() {
        return Array.from(this.executions.values());
    }
    // Circuit management
    registerCircuit(circuit_id, circuit) {
        this.circuits.set(circuit_id, {
            circuit_id,
            ...circuit,
            created_at: new Date().toISOString(),
            version: 1,
        });
    }
    getCircuit(circuit_id) {
        return this.circuits.get(circuit_id);
    }
    listCircuits() {
        return Array.from(this.circuits.values());
    }
    // Vertex management
    registerVertex(vertex) {
        this.vertices.set(vertex.vertex_id, vertex);
        // Update children references
        if (vertex.parents) {
            for (const parent_id of vertex.parents) {
                const parent = this.vertices.get(parent_id);
                if (parent) {
                    if (!parent.children) {
                        parent.children = [];
                    }
                    if (!parent.children.includes(vertex.vertex_id)) {
                        parent.children.push(vertex.vertex_id);
                    }
                }
            }
        }
    }
    getVertex(vertex_id) {
        return this.vertices.get(vertex_id);
    }
    listVertices() {
        return Array.from(this.vertices.values());
    }
    getTips() {
        return Array.from(this.vertices.values()).filter((v) => !v.children || v.children.length === 0);
    }
    getDagStatistics() {
        const vertices = this.listVertices();
        const tips = this.getTips();
        const verticesByType = vertices.reduce((acc, v) => {
            acc[v.vertex_type] = (acc[v.vertex_type] || 0) + 1;
            return acc;
        }, {});
        const verticesByStatus = vertices.reduce((acc, v) => {
            const status = v.consensus?.status || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        return {
            vertices: {
                total: vertices.length,
                pending: verticesByStatus.pending || 0,
                accepted: verticesByStatus.accepted || 0,
                finalized: verticesByStatus.finalized || 0,
                by_type: verticesByType,
            },
            graph: {
                tip_count: tips.length,
                average_branch_factor: vertices.length > 0
                    ? vertices.reduce((sum, v) => sum + (v.children?.length || 0), 0) / vertices.length
                    : 0,
            },
            consensus: {
                average_confidence: vertices.length > 0
                    ? vertices.reduce((sum, v) => sum + (v.consensus?.confidence_score || 0), 0) / vertices.length
                    : 0,
            },
        };
    }
    // Benchmark management
    registerBenchmark(benchmark_id, benchmark) {
        this.benchmarks.set(benchmark_id, benchmark);
    }
    getBenchmark(benchmark_id) {
        return this.benchmarks.get(benchmark_id);
    }
    // Utility methods
    generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
    clear() {
        this.executions.clear();
        this.vertices.clear();
        this.circuits.clear();
        this.benchmarks.clear();
    }
}
// Global singleton instance
exports.dagManager = new DagManager();
//# sourceMappingURL=dag-manager.js.map