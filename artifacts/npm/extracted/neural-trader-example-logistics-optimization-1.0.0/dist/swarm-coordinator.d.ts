/**
 * Multi-agent swarm coordinator for parallel route optimization
 * Uses agentic-flow for swarm orchestration
 */
import { SwarmConfig, Solution, Customer, Vehicle } from './types';
export interface SwarmAgent {
    id: string;
    algorithm: 'genetic' | 'simulated-annealing' | 'ant-colony';
    bestSolution: Solution | null;
    iterations: number;
    status: 'idle' | 'working' | 'completed';
}
export interface SwarmMessage {
    from: string;
    to: string | 'broadcast';
    type: 'solution-share' | 'diversity-request' | 'convergence-signal';
    payload: any;
    timestamp: number;
}
export declare class SwarmCoordinator {
    private config;
    private agents;
    private router;
    private messageQueue;
    private globalBestSolution;
    private openai;
    private iterationCount;
    constructor(config: SwarmConfig, customers: Customer[], vehicles: Vehicle[], openRouterApiKey?: string);
    /**
     * Initialize swarm agents with different algorithms
     */
    private initializeAgents;
    /**
     * Run swarm optimization in parallel
     */
    optimize(): Promise<Solution>;
    /**
     * Run individual agent optimization
     */
    private runAgent;
    /**
     * Process inter-agent communication
     */
    private processCommunication;
    /**
     * Broadcast solution to all agents
     */
    private broadcastSolution;
    /**
     * Maintain solution diversity across agents
     */
    private maintainDiversity;
    /**
     * Calculate diversity score for solutions
     */
    private calculateDiversityScore;
    /**
     * Check if swarm has converged
     */
    private hasConverged;
    /**
     * Wait for convergence criteria
     */
    private waitForConvergence;
    /**
     * Use OpenRouter LLM for constraint reasoning
     */
    reasonAboutConstraints(solution: Solution): Promise<string>;
    /**
     * Get swarm status and metrics
     */
    getStatus(): {
        iteration: number;
        agentsWorking: number;
        agentsCompleted: number;
        globalBestFitness: number | null;
        convergence: number;
    };
    /**
     * Get agent details
     */
    getAgents(): SwarmAgent[];
    private createEmptySolution;
    private sleep;
}
//# sourceMappingURL=swarm-coordinator.d.ts.map