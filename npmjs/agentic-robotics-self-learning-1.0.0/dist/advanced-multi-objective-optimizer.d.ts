#!/usr/bin/env node
/**
 * Advanced Multi-Objective Optimizer
 * Uses NSGA-II (Non-dominated Sorting Genetic Algorithm) for Pareto-optimal solutions
 */
export interface Individual {
    id: string;
    genes: Record<string, number>;
    objectives: {
        performance: number;
        efficiency: number;
        reliability: number;
        cost: number;
    };
    rank: number;
    crowdingDistance: number;
    dominationCount: number;
    dominatedSolutions: Set<string>;
}
export interface ParetoFront {
    rank: number;
    individuals: Individual[];
    hypervolume: number;
}
declare class MultiObjectiveOptimizer {
    private population;
    private paretoFronts;
    private populationSize;
    private generations;
    private crossoverRate;
    private mutationRate;
    private generation;
    constructor(populationSize?: number, generations?: number);
    private ensureDirectories;
    private initializePopulation;
    private evaluateObjectives;
    private dominates;
    private fastNonDominatedSort;
    private calculateCrowdingDistance;
    private calculateHypervolume;
    private tournamentSelection;
    private crossover;
    private mutate;
    private createNewPopulation;
    private printProgress;
    private saveResults;
    optimize(): Promise<void>;
}
export { MultiObjectiveOptimizer };
//# sourceMappingURL=advanced-multi-objective-optimizer.d.ts.map