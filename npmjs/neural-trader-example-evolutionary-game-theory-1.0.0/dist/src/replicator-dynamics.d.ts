/**
 * Replicator Dynamics Simulation
 *
 * The replicator equation describes how strategy frequencies evolve:
 * dx_i/dt = x_i * (f_i - f_avg)
 *
 * where:
 * - x_i is frequency of strategy i
 * - f_i is fitness of strategy i
 * - f_avg is average fitness of population
 */
import type { Game, PopulationState } from './types.js';
/**
 * Replicator dynamics simulator
 */
export declare class ReplicatorDynamics {
    private game;
    private currentState;
    private history;
    constructor(game: Game, initialPopulation?: number[]);
    /**
     * Calculate fitness values for current population
     */
    private calculateFitness;
    /**
     * Calculate average fitness of population
     */
    private calculateAverageFitness;
    /**
     * Perform one step of replicator dynamics
     * @param dt Time step size
     */
    step(dt?: number): PopulationState;
    /**
     * Simulate for multiple steps
     * @param steps Number of steps
     * @param dt Time step size
     */
    simulate(steps: number, dt?: number): PopulationState[];
    /**
     * Simulate until convergence or max steps
     * @param threshold Convergence threshold
     * @param maxSteps Maximum steps
     * @param dt Time step size
     */
    simulateUntilConvergence(threshold?: number, maxSteps?: number, dt?: number): PopulationState;
    /**
     * Check if current state is at fixed point
     */
    isFixedPoint(threshold?: number): boolean;
    /**
     * Calculate Shannon diversity index
     */
    calculateDiversity(): number;
    /**
     * Get current state
     */
    getState(): PopulationState;
    /**
     * Get simulation history
     */
    getHistory(): PopulationState[];
    /**
     * Reset to initial state
     */
    reset(initialPopulation?: number[]): void;
    /**
     * Find all fixed points in the simplex (discrete approximation)
     */
    findFixedPoints(resolution?: number, threshold?: number): number[][];
    /**
     * Generate points on the simplex for scanning
     */
    private generateSimplexPoints;
    /**
     * Calculate phase portrait velocities at a point
     */
    getVelocity(population: number[]): number[];
    /**
     * Export state for visualization
     */
    exportForVisualization(): {
        game: Game;
        states: PopulationState[];
        fixedPoints?: number[][];
    };
}
/**
 * Multi-population replicator dynamics
 * Useful for coevolution and multi-species games
 */
export declare class MultiPopulationDynamics {
    private populations;
    private interactionMatrix;
    constructor(games: Game[], interactionMatrix?: number[][]);
    /**
     * Step all populations simultaneously
     */
    step(dt?: number): PopulationState[];
    /**
     * Simulate all populations
     */
    simulate(steps: number, dt?: number): PopulationState[][];
    /**
     * Get all population states
     */
    getStates(): PopulationState[];
    /**
     * Calculate cross-population diversity
     */
    calculateCrossDiversity(): number;
}
//# sourceMappingURL=replicator-dynamics.d.ts.map