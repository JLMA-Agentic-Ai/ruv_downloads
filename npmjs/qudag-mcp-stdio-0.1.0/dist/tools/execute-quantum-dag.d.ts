import { ExecuteQuantumDagInput } from '../types/schemas.js';
export declare function executeQuantumDag(input: ExecuteQuantumDagInput): Promise<{
    execution_id: string;
    status: string;
    results: {
        measurements: Record<string, number>;
        probabilities: Record<string, number>;
        execution_time_ms: number;
    };
    dag_info: {
        vertex_id: string;
        consensus_status: string;
        confidence_score: number;
        dag_height: number;
    };
    metrics: {
        gate_count: number;
        depth: number;
        optimization_applied: boolean;
        backend_utilization: number;
    };
}>;
//# sourceMappingURL=execute-quantum-dag.d.ts.map