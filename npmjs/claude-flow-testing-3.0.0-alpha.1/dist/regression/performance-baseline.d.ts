/**
 * Performance Baseline System
 *
 * Captures and compares performance metrics to detect regressions.
 *
 * @module v3/testing/regression/performance-baseline
 */
/**
 * Baseline metric definition
 */
export interface BaselineMetric {
    name: string;
    value: number;
    unit: string;
    category: 'latency' | 'throughput' | 'memory' | 'cpu' | 'startup';
    timestamp: number;
    metadata?: Record<string, unknown>;
}
/**
 * Baseline comparison result
 */
export interface BaselineComparison {
    metric: string;
    baseline: number;
    current: number;
    unit: string;
    degradation: number;
    regression: boolean;
    improvement: boolean;
}
/**
 * Baseline configuration
 */
export interface BaselineConfig {
    baselinePath: string;
    performanceThreshold: number;
}
/**
 * Stored baseline data
 */
interface BaselineData {
    version: string;
    capturedAt: number;
    metrics: BaselineMetric[];
}
/**
 * Performance Baseline Manager
 *
 * Manages performance baselines for regression detection.
 */
export declare class PerformanceBaseline {
    private readonly baselinePath;
    private readonly threshold;
    private cachedBaseline;
    constructor(config: BaselineConfig);
    /**
     * Capture current performance as baseline
     */
    captureBaseline(): Promise<BaselineData>;
    /**
     * Compare current performance against baseline
     */
    compare(): Promise<BaselineComparison[]>;
    /**
     * Measure current performance metrics
     */
    private measureCurrentPerformance;
    /**
     * Simulate startup to measure initialization time
     */
    private simulateStartup;
    /**
     * Measure operation latency
     */
    private measureLatency;
    /**
     * Measure throughput
     */
    private measureThroughput;
    /**
     * Benchmark event bus operations
     */
    private benchmarkEventBus;
    /**
     * Benchmark memory operations
     */
    private benchmarkMemoryOps;
    /**
     * Benchmark event throughput
     */
    private benchmarkEventThroughput;
    /**
     * Benchmark memory throughput
     */
    private benchmarkMemoryThroughput;
    /**
     * Load baseline from file
     */
    private loadBaseline;
    /**
     * Save baseline to file
     */
    private saveBaseline;
}
export {};
//# sourceMappingURL=performance-baseline.d.ts.map