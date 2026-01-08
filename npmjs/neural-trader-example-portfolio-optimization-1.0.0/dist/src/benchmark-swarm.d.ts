/**
 * Benchmark Swarm for Portfolio Optimization
 * Explores different algorithms, constraints, and parameters concurrently
 * Uses OpenRouter via agentic-flow for strategy suggestions
 */
import { OptimizationResult, PortfolioConstraints, Asset } from './optimizer.js';
import { SelfLearningOptimizer } from './self-learning.js';
export interface BenchmarkConfig {
    algorithms: string[];
    constraintVariations: PortfolioConstraints[];
    assets: Asset[];
    correlationMatrix: number[][];
    historicalReturns?: number[][];
    marketCapWeights?: number[];
    iterations?: number;
}
export interface BenchmarkResult {
    algorithm: string;
    constraints: PortfolioConstraints;
    result: OptimizationResult;
    executionTime: number;
    convergenceMetrics?: {
        iterations: number;
        finalGradientNorm: number;
    };
}
export interface SwarmInsights {
    bestAlgorithm: string;
    bestResult: BenchmarkResult;
    algorithmRankings: Array<{
        algorithm: string;
        avgSharpe: number;
        avgRisk: number;
    }>;
    constraintImpact: Record<string, number>;
    recommendations: string[];
}
/**
 * Portfolio Optimization Swarm
 * Runs multiple optimization strategies concurrently
 */
export declare class PortfolioOptimizationSwarm {
    private openai;
    private learningOptimizer?;
    constructor(openRouterApiKey?: string, learningOptimizer?: SelfLearningOptimizer);
    /**
     * Run comprehensive benchmark across all algorithms and constraints
     */
    runBenchmark(config: BenchmarkConfig): Promise<SwarmInsights>;
    /**
     * Run single optimization with timing
     */
    private runOptimization;
    /**
     * Generate mock historical returns for testing
     */
    private generateMockReturns;
    /**
     * Analyze benchmark results and generate insights
     */
    private analyzeResults;
    /**
     * Get AI-powered strategy recommendations via OpenRouter
     */
    private getAIRecommendations;
    /**
     * Learn from benchmark results using self-learning optimizer
     */
    private learnFromBenchmark;
    /**
     * Explore constraint combinations using swarm intelligence
     */
    exploreConstraints(baseConfig: BenchmarkConfig, parameterRanges: {
        minWeight: [number, number];
        maxWeight: [number, number];
        targetReturn: [number, number];
    }, samples?: number): Promise<SwarmInsights>;
    /**
     * Compare algorithm performance across different market regimes
     */
    compareMarketRegimes(config: BenchmarkConfig, regimes: Array<{
        name: string;
        volatilityMultiplier: number;
        returnMultiplier: number;
    }>): Promise<Record<string, SwarmInsights>>;
    /**
     * Generate comprehensive benchmark report
     */
    generateReport(insights: SwarmInsights): string;
}
/**
 * Parallel Portfolio Explorer
 * Uses worker threads for CPU-intensive optimization
 */
export declare class ParallelPortfolioExplorer {
    private maxWorkers;
    constructor(maxWorkers?: number);
    /**
     * Run optimizations in parallel batches
     */
    optimizeInParallel(configs: Array<{
        algorithm: string;
        config: BenchmarkConfig;
        constraints: PortfolioConstraints;
    }>): Promise<BenchmarkResult[]>;
}
//# sourceMappingURL=benchmark-swarm.d.ts.map