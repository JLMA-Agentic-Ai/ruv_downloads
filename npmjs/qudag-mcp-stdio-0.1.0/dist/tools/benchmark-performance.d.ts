import { BenchmarkPerformanceInput } from '../types/schemas.js';
export declare function benchmarkPerformance(input: BenchmarkPerformanceInput): Promise<{
    execution_stats: {
        total_executions: number;
        successful_executions: number;
        failed_executions: number;
        total_time_ms: number;
    };
    performance: {
        mean_execution_time_ms: number;
        median_execution_time_ms: number;
        p95_execution_time_ms: number;
        p99_execution_time_ms: number;
        throughput_ops_per_sec: number;
    };
    resources: {
        cpu_utilization_percent: number;
        memory_usage_mb: number;
        network_bandwidth_mbps: number;
    } | undefined;
    dag_performance: {
        consensus_time_ms: number;
        propagation_time_ms: number;
        finalization_time_ms: number;
    } | undefined;
    backend_comparison: Record<string, any> | undefined;
}>;
//# sourceMappingURL=benchmark-performance.d.ts.map