/**
 * Swarm Coordinator
 *
 * Swarm intelligence for exploring scheduling heuristics and optimization strategies.
 * Uses agentic-flow for multi-agent coordination.
 */
import type { SwarmConfig, SwarmResult, ScheduleSolution, ScheduleConstraints, ForecastResult, OptimizationObjective } from './types.js';
import { type SchedulerConfig } from './scheduler.js';
export declare class SwarmCoordinator {
    private flow;
    private memory;
    private config;
    private agents;
    private bestSolution;
    constructor(config: SwarmConfig, agentdbPath: string);
    /**
     * Optimize schedule using swarm intelligence
     */
    optimize(forecasts: ForecastResult[], constraints: ScheduleConstraints, objective: OptimizationObjective, schedulerConfig: SchedulerConfig, startDate: Date): Promise<SwarmResult>;
    /**
     * Initialize swarm population with diverse strategies
     */
    private initializePopulation;
    /**
     * Evaluate all agents in parallel
     */
    private evaluatePopulation;
    /**
     * Apply strategy to scheduler config
     */
    private applyStrategy;
    /**
     * Calculate fitness of solution based on objectives
     */
    private calculateFitness;
    /**
     * Evolve population using swarm intelligence
     */
    private evolvePopulation;
    /**
     * Check if swarm has converged
     */
    private hasConverged;
    /**
     * Store best solution in memory
     */
    private storeBestSolution;
    /**
     * Generate synthetic staff for testing
     */
    private generateSyntheticStaff;
    /**
     * Get skills for role
     */
    private getSkillsForRole;
    /**
     * Get cost per hour for role
     */
    private getCostForRole;
    /**
     * Get best solution
     */
    getBestSolution(): ScheduleSolution | null;
    /**
     * Get swarm statistics
     */
    getStatistics(): {
        population: number;
        bestFitness: number;
        avgFitness: number;
        worstFitness: number;
        diversity: number;
    };
    /**
     * Calculate population diversity
     */
    private calculateDiversity;
}
//# sourceMappingURL=swarm.d.ts.map