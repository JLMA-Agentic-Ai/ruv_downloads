/**
 * @neural-trader/example-logistics-optimization
 *
 * Self-learning vehicle routing optimization with multi-agent swarm coordination
 *
 * Features:
 * - Vehicle Routing Problem (VRP) with time windows
 * - Multi-agent swarm optimization (genetic, simulated annealing, ant colony)
 * - Adaptive learning with AgentDB
 * - Real-time route re-optimization
 * - Traffic pattern learning
 * - OpenRouter for constraint reasoning
 * - Sublinear solver for large-scale instances
 */
export { VRPRouter } from './router';
export { SwarmCoordinator, SwarmAgent, SwarmMessage } from './swarm-coordinator';
export { SelfLearningSystem, MemoryEntry } from './self-learning';
export { Location, TimeWindow, Customer, Vehicle, Route, Solution, TrafficPattern, OptimizationConfig, SwarmConfig, LearningMetrics } from './types';
import { Customer, Vehicle, SwarmConfig, Solution } from './types';
/**
 * Main logistics optimization system
 */
export declare class LogisticsOptimizer {
    private customers;
    private vehicles;
    private useSwarm;
    private swarmConfig?;
    private router;
    private swarmCoordinator;
    private learningSystem;
    private episodeCount;
    constructor(customers: Customer[], vehicles: Vehicle[], useSwarm?: boolean, swarmConfig?: SwarmConfig | undefined);
    /**
     * Optimize routes using swarm or single-agent
     */
    optimize(algorithm?: 'genetic' | 'simulated-annealing' | 'ant-colony'): Promise<Solution>;
    /**
     * Get optimization recommendations using LLM
     */
    getRecommendations(solution: Solution): Promise<string>;
    /**
     * Get similar past solutions
     */
    getSimilarSolutions(topK?: number): Promise<any[]>;
    /**
     * Get learning statistics
     */
    getStatistics(): {
        totalEpisodes: number;
        avgSolutionQuality: number;
        avgComputeTime: number;
        improvementRate: number;
        trafficPatternsLearned: number;
    };
    /**
     * Get swarm status (if using swarm)
     */
    getSwarmStatus(): {
        iteration: number;
        agentsWorking: number;
        agentsCompleted: number;
        globalBestFitness: number | null;
        convergence: number;
    } | null;
    /**
     * Get swarm agents (if using swarm)
     */
    getSwarmAgents(): import("./swarm-coordinator").SwarmAgent[];
    /**
     * Export learned patterns
     */
    exportPatterns(): {
        trafficPatterns: import("./types").TrafficPattern[];
        topSolutions: Solution[];
        statistics: any;
    };
    /**
     * Import learned patterns
     */
    importPatterns(data: any): void;
}
/**
 * Helper function to create sample data
 */
export declare function createSampleData(numCustomers?: number, numVehicles?: number): {
    customers: Customer[];
    vehicles: Vehicle[];
};
//# sourceMappingURL=index.d.ts.map