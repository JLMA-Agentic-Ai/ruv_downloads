#!/usr/bin/env node
/**
 * Benchmark Optimizer with Swarm Intelligence
 * Automatically finds optimal configurations through parallel swarm exploration
 */
interface BenchmarkConfig {
    name: string;
    parameters: Record<string, number>;
    constraints: Record<string, [number, number]>;
}
interface BenchmarkResult {
    configId: string;
    parameters: Record<string, number>;
    metrics: {
        executionTime: number;
        successRate: number;
        efficiency: number;
        accuracy: number;
    };
    score: number;
}
declare class BenchmarkOptimizer {
    private config;
    private swarmSize;
    private agents;
    private globalBestPosition;
    private globalBestScore;
    private results;
    private iterations;
    private maxIterations;
    constructor(config: BenchmarkConfig, swarmSize?: number, maxIterations?: number);
    private ensureDirectories;
    private initializeSwarm;
    private evaluateConfiguration;
    private syntheticBenchmark;
    private updateSwarm;
    private evaluateSwarm;
    private saveBenchmarkResults;
    private calculateStatistics;
    private generateSummaryReport;
    private generateProgressChart;
    optimize(): Promise<void>;
}
export { BenchmarkOptimizer, BenchmarkConfig, BenchmarkResult };
//# sourceMappingURL=benchmark-optimizer.d.ts.map