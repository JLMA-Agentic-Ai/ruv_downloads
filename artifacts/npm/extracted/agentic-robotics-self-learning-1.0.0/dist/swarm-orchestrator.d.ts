#!/usr/bin/env node
/**
 * Self-Learning Swarm Orchestrator with Memory Bank
 * Implements parallel swarm execution with continuous optimization
 */
export interface SwarmConfig {
    id: string;
    task: string;
    model: string;
    provider: string;
    explorationRate: number;
    priority: number;
}
export interface SwarmResult {
    id: string;
    success: boolean;
    duration: number;
    metrics: any;
    learnings: any;
    output?: string;
    error?: string;
}
export interface OptimizationMetrics {
    sessionId: string;
    timestamp: string;
    swarms: number;
    successRate: number;
    averageDuration: number;
    bestStrategy: string;
    improvementRate: number;
    convergence: number;
}
declare class SelfLearningSwarmOrchestrator {
    private settings;
    private memoryBank;
    private activeSwarms;
    private results;
    private sessionId;
    private metricsPath;
    constructor();
    private ensureDirectories;
    private loadSettings;
    private loadMemoryBank;
    private createEmptyMemoryBank;
    private generateSwarmConfigs;
    private generateTaskVariations;
    private spawnSwarm;
    private buildMemoryAugmentedTask;
    private extractMetrics;
    private extractLearnings;
    private executeParallelSwarms;
    private analyzeResults;
    private saveOptimizationResults;
    run(taskType?: string, swarmCount?: number): Promise<void>;
}
export { SelfLearningSwarmOrchestrator };
//# sourceMappingURL=swarm-orchestrator.d.ts.map