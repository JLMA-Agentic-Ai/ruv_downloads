/**
 * DAG Manager
 *
 * Manages global DAG state and execution registry for resource access.
 * Provides centralized storage for quantum execution results and DAG vertices.
 */
interface ExecutionState {
    execution_id: string;
    circuit_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    created_at: string;
    completed_at?: string;
    results?: any;
    circuit?: any;
    dag_info?: any;
    metrics?: any;
}
interface DagVertex {
    vertex_id: string;
    created_at: string;
    timestamp: number;
    vertex_type: string;
    payload?: any;
    parents?: string[];
    children?: string[];
    consensus?: any;
}
declare class DagManager {
    private executions;
    private vertices;
    private circuits;
    private benchmarks;
    registerExecution(execution: ExecutionState): void;
    getExecution(execution_id: string): ExecutionState | undefined;
    updateExecution(execution_id: string, updates: Partial<ExecutionState>): void;
    listExecutions(): ExecutionState[];
    registerCircuit(circuit_id: string, circuit: any): void;
    getCircuit(circuit_id: string): any | undefined;
    listCircuits(): any[];
    registerVertex(vertex: DagVertex): void;
    getVertex(vertex_id: string): DagVertex | undefined;
    listVertices(): DagVertex[];
    getTips(): DagVertex[];
    getDagStatistics(): {
        vertices: {
            total: number;
            pending: number;
            accepted: number;
            finalized: number;
            by_type: Record<string, number>;
        };
        graph: {
            tip_count: number;
            average_branch_factor: number;
        };
        consensus: {
            average_confidence: number;
        };
    };
    registerBenchmark(benchmark_id: string, benchmark: any): void;
    getBenchmark(benchmark_id: string): any | undefined;
    generateId(prefix: string): string;
    clear(): void;
}
export declare const dagManager: DagManager;
export {};
//# sourceMappingURL=dag-manager.d.ts.map