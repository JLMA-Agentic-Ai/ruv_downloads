#!/usr/bin/env node
/**
 * Self-Improving Navigator
 * Uses swarm optimization to continuously improve navigation strategies
 */
declare class SelfImprovingNavigator {
    private strategies;
    private memoryBank;
    private sessionId;
    private improvements;
    constructor();
    private ensureDirectories;
    private initializeStrategies;
    private loadMemoryBank;
    private updateStrategiesFromHistory;
    private selectStrategy;
    private executeNavigation;
    private calculateDirection;
    private distance;
    private normalize;
    private updateStrategyPerformance;
    private evolveStrategies;
    private saveResults;
    private calculateStatistics;
    run(numTasks?: number): Promise<void>;
}
export { SelfImprovingNavigator };
//# sourceMappingURL=self-improving-navigator.d.ts.map