import { OptimizeCircuitInput } from '../types/schemas.js';
export declare function optimizeCircuit(input: OptimizeCircuitInput): Promise<{
    optimized_circuit: any;
    optimization_results: {
        original_metrics: {
            gate_count: any;
            depth: number;
            dag_vertices: number;
        };
        optimized_metrics: {
            gate_count: number;
            depth: number;
            dag_vertices: number;
        };
        improvement: {
            gates_reduced: number;
            depth_reduced: number;
            dag_vertices_reduced: number;
            estimated_speedup: number;
        };
    };
    strategy: {
        techniques_applied: never[];
        optimization_time_ms: number;
        iterations: number;
    };
}>;
//# sourceMappingURL=optimize-circuit.d.ts.map