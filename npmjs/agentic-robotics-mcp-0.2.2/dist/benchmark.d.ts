/**
 * Comprehensive Benchmark Suite
 *
 * Benchmarks AgentDB and agentic-flow integration performance
 */
interface BenchmarkResult {
    name: string;
    iterations: number;
    totalTime: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
    opsPerSec: number;
    p50: number;
    p95: number;
    p99: number;
}
interface BenchmarkSuite {
    agentdb: {
        storeEpisode: BenchmarkResult;
        retrieveMemories: BenchmarkResult;
        queryWithContext: BenchmarkResult;
        consolidateSkills: BenchmarkResult;
        searchSkills: BenchmarkResult;
    };
    agenticFlow: {
        executeTask: BenchmarkResult;
        executeSwarm: BenchmarkResult;
        coordinateRobots: BenchmarkResult;
        reasonAboutTask: BenchmarkResult;
    };
    overall: {
        totalTime: number;
        timestamp: string;
    };
}
export declare class IntegrationBenchmark {
    private memory;
    private orchestrator;
    constructor();
    initialize(): Promise<void>;
    /**
     * Run complete benchmark suite
     */
    runAll(): Promise<BenchmarkSuite>;
    /**
     * Benchmark: Store Episode
     */
    private benchmarkStoreEpisode;
    /**
     * Benchmark: Retrieve Memories
     */
    private benchmarkRetrieveMemories;
    /**
     * Benchmark: Query with Context
     */
    private benchmarkQueryWithContext;
    /**
     * Benchmark: Consolidate Skills
     */
    private benchmarkConsolidateSkills;
    /**
     * Benchmark: Search Skills
     */
    private benchmarkSearchSkills;
    /**
     * Benchmark: Execute Task
     */
    private benchmarkExecuteTask;
    /**
     * Benchmark: Execute Swarm
     */
    private benchmarkExecuteSwarm;
    /**
     * Benchmark: Coordinate Robots
     */
    private benchmarkCoordinateRobots;
    /**
     * Benchmark: Reason About Task
     */
    private benchmarkReasonAboutTask;
    /**
     * Calculate statistics from timing data
     */
    private calculateStats;
    /**
     * Print benchmark result
     */
    private printResult;
    /**
     * Export results to JSON
     */
    exportResults(suite: BenchmarkSuite, filename: string): Promise<void>;
    close(): Promise<void>;
}
export {};
//# sourceMappingURL=benchmark.d.ts.map