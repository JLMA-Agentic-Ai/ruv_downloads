/**
 * @neural-trader/example-portfolio-optimization
 *
 * Self-learning portfolio optimization with benchmark swarms
 * Implements Mean-Variance, Risk Parity, Black-Litterman, and Multi-Objective optimization
 * Uses AgentDB for memory patterns and OpenRouter for AI-powered strategy suggestions
 */
export { MeanVarianceOptimizer, RiskParityOptimizer, BlackLittermanOptimizer, MultiObjectiveOptimizer, type Asset, type PortfolioConstraints, type OptimizationResult, type EfficientFrontierPoint, } from './optimizer.js';
export { SelfLearningOptimizer, AdaptiveRiskManager, type RiskProfile, type PerformanceMetrics, type LearningState, } from './self-learning.js';
export { PortfolioOptimizationSwarm, ParallelPortfolioExplorer, type BenchmarkConfig, type BenchmarkResult, type SwarmInsights, } from './benchmark-swarm.js';
/**
 * Quick start example
 */
export declare function quickStart(): Promise<import("./optimizer.js").OptimizationResult>;
export { quickStart as default };
//# sourceMappingURL=index.d.ts.map