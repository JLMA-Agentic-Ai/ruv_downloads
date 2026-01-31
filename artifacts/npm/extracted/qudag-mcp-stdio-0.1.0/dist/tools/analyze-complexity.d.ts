import { AnalyzeComplexityInput } from '../types/schemas.js';
export declare function analyzeComplexity(input: AnalyzeComplexityInput): Promise<{
    quantum_metrics: {
        gate_count: any;
        depth: number;
        qubit_count: any;
        two_qubit_gates: any;
        entanglement_entropy: number;
        circuit_expressibility: number;
    } | undefined;
    classical_metrics: {
        simulation_complexity: string;
        memory_requirement_bytes: number;
        estimated_simulation_time_ms: number;
    } | undefined;
    dag_metrics: {
        expected_vertex_count: number;
        expected_dag_depth: number;
        parallelization_factor: number;
        consensus_overhead: number;
    } | undefined;
    resource_estimates: {
        cpu_time_estimate_ms: number;
        memory_estimate_mb: number;
        network_bandwidth_estimate_kb: number;
        dag_storage_estimate_bytes: number;
    } | undefined;
    recommendations: never[];
}>;
//# sourceMappingURL=analyze-complexity.d.ts.map