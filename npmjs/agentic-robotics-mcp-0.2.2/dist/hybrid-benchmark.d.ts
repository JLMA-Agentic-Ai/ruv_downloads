/**
 * Hybrid Benchmark Suite
 *
 * Demonstrates performance improvements with direct SQL storage
 */
export declare class HybridBenchmark {
    private memory;
    constructor();
    initialize(): Promise<void>;
    /**
     * Run complete benchmark suite
     */
    runAll(): Promise<void>;
    /**
     * Benchmark: Store Episode (Direct SQL)
     */
    private benchmarkStoreEpisode;
    /**
     * Benchmark: Bulk Store (SQL Transaction)
     */
    private benchmarkBulkStore;
    /**
     * Benchmark: Retrieve Memories (SQL fallback)
     */
    private benchmarkRetrieveMemories;
    /**
     * Benchmark: Query with Context
     */
    private benchmarkQueryWithContext;
    /**
     * Benchmark: Search Skills (Direct SQL)
     */
    private benchmarkSearchSkills;
    /**
     * Calculate statistics from timing data
     */
    private calculateStats;
    /**
     * Print benchmark result
     */
    private printResult;
    close(): Promise<void>;
}
//# sourceMappingURL=hybrid-benchmark.d.ts.map