/**
 * Swarm-Based Inventory Policy Optimizer
 *
 * Features:
 * - Particle Swarm Optimization for (s,S) policies
 * - Multi-objective optimization (cost vs service level)
 * - Adaptive policy learning
 * - Parallel policy evaluation
 * - Self-learning service level targets
 */
import { InventoryOptimizer } from './inventory-optimizer';
import { DemandForecaster } from './demand-forecaster';
export interface PolicyParticle {
    id: string;
    position: {
        reorderPoint: number;
        orderUpToLevel: number;
        safetyFactor: number;
    };
    velocity: {
        reorderPoint: number;
        orderUpToLevel: number;
        safetyFactor: number;
    };
    fitness: {
        cost: number;
        serviceLevel: number;
        combined: number;
    };
    personalBest: {
        position: PolicyParticle['position'];
        fitness: PolicyParticle['fitness'];
    };
}
export interface SwarmConfig {
    particles: number;
    iterations: number;
    inertia: number;
    cognitive: number;
    social: number;
    bounds: {
        reorderPoint: [number, number];
        orderUpToLevel: [number, number];
        safetyFactor: [number, number];
    };
    objectives: {
        costWeight: number;
        serviceLevelWeight: number;
    };
}
export interface SwarmResult {
    bestPolicy: PolicyParticle['position'];
    bestFitness: PolicyParticle['fitness'];
    convergenceHistory: number[];
    particles: PolicyParticle[];
    iterations: number;
}
export declare class SwarmPolicyOptimizer {
    private forecaster;
    private optimizer;
    private config;
    private swarm;
    private globalBest;
    private agenticFlow;
    constructor(forecaster: DemandForecaster, optimizer: InventoryOptimizer, config: SwarmConfig);
    /**
     * Initialize swarm with random particles
     */
    private initializeSwarm;
    /**
     * Optimize inventory policies using swarm intelligence
     */
    optimize(productId: string, currentFeatures: any): Promise<SwarmResult>;
    /**
     * Evaluate fitness of all particles in parallel using agentic-flow
     */
    private evaluateSwarm;
    /**
     * Evaluate fitness of single particle
     */
    private evaluateParticle;
    /**
     * Update personal and global bests
     */
    private updateBests;
    /**
     * Update velocities and positions using PSO update rules
     */
    private updateSwarm;
    /**
     * Random value in range
     */
    private randomInRange;
    /**
     * Get Pareto front for multi-objective optimization
     */
    getParetoFront(): PolicyParticle[];
    /**
     * Adaptive learning of service level targets
     */
    adaptServiceLevel(productId: string, currentFeatures: any, targetRevenue: number): Promise<number>;
    /**
     * Export best policy for deployment
     */
    exportPolicy(): {
        policy: PolicyParticle['position'];
        performance: PolicyParticle['fitness'];
        timestamp: number;
    };
}
//# sourceMappingURL=swarm-policy.d.ts.map