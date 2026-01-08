/**
 * Vehicle Routing Problem (VRP) solver with time windows
 * Implements multiple optimization algorithms
 */
import { Customer, Vehicle, Solution, OptimizationConfig } from './types';
export declare class VRPRouter {
    private customers;
    private vehicles;
    private distanceMatrix;
    private timeMatrix;
    constructor(customers: Customer[], vehicles: Vehicle[]);
    /**
     * Precompute distance and time matrices for all location pairs
     */
    private precomputeMatrices;
    /**
     * Calculate Haversine distance between two locations
     */
    private calculateDistance;
    private toRad;
    /**
     * Get distance between two locations
     */
    getDistance(loc1Id: string, loc2Id: string): number;
    /**
     * Get travel time between two locations
     */
    getTravelTime(loc1Id: string, loc2Id: string): number;
    /**
     * Genetic Algorithm for VRP optimization
     */
    solveGenetic(config: OptimizationConfig): Promise<Solution>;
    /**
     * Simulated Annealing for VRP optimization
     */
    solveSimulatedAnnealing(config: OptimizationConfig): Promise<Solution>;
    /**
     * Ant Colony Optimization for VRP
     */
    solveAntColony(config: OptimizationConfig): Promise<Solution>;
    /**
     * Initialize random population
     */
    private initializePopulation;
    /**
     * Construct a random solution
     */
    private constructRandomSolution;
    /**
     * Construct greedy solution (nearest neighbor)
     */
    private constructGreedySolution;
    /**
     * Construct solution using ant colony pheromones
     */
    private constructAntSolution;
    /**
     * Evaluate fitness of a solution (lower is better)
     */
    private evaluateFitness;
    /**
     * Tournament selection
     */
    private tournamentSelection;
    /**
     * Crossover two solutions
     */
    private crossover;
    /**
     * Mutate a solution
     */
    private mutate;
    /**
     * Generate neighbor solution for simulated annealing
     */
    private generateNeighbor;
    /**
     * Update pheromones for ant colony
     */
    private updatePheromones;
}
//# sourceMappingURL=router.d.ts.map