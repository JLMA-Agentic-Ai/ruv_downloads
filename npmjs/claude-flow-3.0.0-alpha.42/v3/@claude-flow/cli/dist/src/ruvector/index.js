/**
 * RuVector Integration Module for Claude Flow CLI
 *
 * Provides integration with @ruvector packages for:
 * - Q-Learning based task routing
 * - AST code analysis
 * - Diff classification
 * - Coverage-based routing
 * - Graph boundary analysis
 *
 * @module @claude-flow/cli/ruvector
 */
export { QLearningRouter, createQLearningRouter } from './q-learning-router.js';
export { ASTAnalyzer, createASTAnalyzer } from './ast-analyzer.js';
export { DiffClassifier, createDiffClassifier, 
// MCP tool exports
analyzeDiff, analyzeDiffSync, assessFileRisk, assessOverallRisk, classifyDiff, suggestReviewers, getGitDiffNumstat, getGitDiffNumstatAsync, 
// Cache control
clearDiffCache, clearAllDiffCaches, } from './diff-classifier.js';
export { CoverageRouter, createCoverageRouter, 
// MCP tool exports
coverageRoute, coverageSuggest, coverageGaps, 
// Cache utilities (NEW)
clearCoverageCache, getCoverageCacheStats, } from './coverage-router.js';
export { coverageRouterTools, hooksCoverageRoute, hooksCoverageSuggest, hooksCoverageGaps } from './coverage-tools.js';
export { buildDependencyGraph, analyzeGraph, analyzeMinCutBoundaries, analyzeModuleCommunities, detectCircularDependencies, exportToDot, loadRuVector, fallbackMinCut, fallbackLouvain, 
// Cache utilities (NEW)
clearGraphCaches, getGraphCacheStats, } from './graph-analyzer.js';
/**
 * Check if ruvector packages are available
 */
export async function isRuvectorAvailable() {
    try {
        await import('@ruvector/core');
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Get ruvector version if available
 */
export async function getRuvectorVersion() {
    try {
        const ruvector = await import('@ruvector/core');
        return ruvector.version || '1.0.0';
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=index.js.map