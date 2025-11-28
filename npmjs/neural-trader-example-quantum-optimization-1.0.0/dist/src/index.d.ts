/**
 * @neural-trader/example-quantum-optimization
 *
 * Quantum-inspired optimization algorithms with swarm-based circuit exploration
 * for combinatorial and constraint problems.
 *
 * Features:
 * - QAOA (Quantum Approximate Optimization Algorithm)
 * - VQE (Variational Quantum Eigensolver)
 * - Quantum Annealing simulation
 * - Swarm-based circuit exploration with AgentDB
 * - Memory-based pattern learning
 * - OpenRouter integration for problem decomposition
 *
 * Applications:
 * - MaxCut and graph optimization
 * - Traveling Salesman Problem (TSP)
 * - Portfolio optimization
 * - Constraint satisfaction problems
 * - Molecular simulation (VQE)
 * - Scheduling and logistics
 */
export { QAOAOptimizer, type QAOAConfig, type QAOAProblem, type QAOAResult, createMaxCutProblem, solveMaxCut } from './qaoa.js';
export { VQESolver, type VQEConfig, type Hamiltonian, type PauliString, type VQEResult, createIsingHamiltonian } from './vqe.js';
export { QuantumAnnealer, QUBOFormulator, type AnnealingConfig, type QuboMatrix, type AnnealingResult, type AnnealingSnapshot, solveQUBO, solveMaxCutAnnealing, solveTSPAnnealing } from './quantum-annealing.js';
export { SwarmCircuitExplorer, type CircuitExplorationConfig, type QuantumCircuit, type Gate, type CircuitMetadata, type SwarmAgent, type ExplorationResult, type CircuitPattern, exploreCircuits } from './swarm-circuits.js';
export interface Complex {
    re: number;
    im: number;
}
/**
 * Unified quantum optimization interface
 */
export declare class QuantumOptimizer {
    /**
     * Solve MaxCut problem using best available method
     */
    static solveMaxCut(edges: [number, number, number][], method?: 'qaoa' | 'annealing' | 'auto'): Promise<{
        solution: number[];
        energy: number;
        method: string;
        executionTime: number;
    }>;
    /**
     * Solve TSP using quantum annealing
     */
    static solveTSP(distanceMatrix: number[][]): Promise<{
        tour: number[];
        distance: number;
        executionTime: number;
    }>;
    /**
     * Find ground state energy using VQE
     */
    static findGroundState(hamiltonian: import('./vqe.js').Hamiltonian, ansatzType?: 'hardware-efficient' | 'uccsd'): Promise<{
        energy: number;
        state: Complex[];
        parameters: number[];
        executionTime: number;
    }>;
    /**
     * Explore quantum circuits for optimization
     */
    static exploreCircuits(config: {
        numQubits: number;
        problemType: 'maxcut' | 'vqe' | 'qaoa';
        swarmSize?: number;
        explorationSteps?: number;
    }): Promise<{
        bestCircuit: import('./swarm-circuits.js').QuantumCircuit;
        performance: number;
        learnedPatterns: import('./swarm-circuits.js').CircuitPattern[];
        executionTime: number;
    }>;
    /**
     * Optimize portfolio using quantum-inspired methods
     */
    static optimizePortfolio(returns: number[], covarianceMatrix: number[][], budget: number, riskAversion?: number): Promise<{
        allocation: number[];
        expectedReturn: number;
        risk: number;
        executionTime: number;
    }>;
    /**
     * Solve constraint satisfaction problem
     */
    static solveConstraintSatisfaction(numVars: number, constraints: Array<{
        vars: number[];
        coeffs: number[];
        rhs: number;
    }>): Promise<{
        solution: number[];
        satisfied: boolean;
        executionTime: number;
    }>;
}
/**
 * Compare quantum vs classical optimization
 */
export declare class QuantumClassicalComparison {
    /**
     * Compare QAOA vs classical MaxCut solver
     */
    static compareMaxCut(edges: [number, number, number][]): Promise<{
        quantum: {
            solution: number[];
            energy: number;
            time: number;
        };
        classical: {
            solution: number[];
            energy: number;
            time: number;
        };
        speedup: number;
        qualityRatio: number;
    }>;
    /**
     * Classical greedy MaxCut solver
     */
    private static greedyMaxCut;
    /**
     * Evaluate MaxCut solution
     */
    private static evaluateMaxCut;
}
export declare const examples: {
    /**
     * Example: Solve MaxCut problem
     */
    maxcut(): Promise<{
        solution: number[];
        energy: number;
        method: string;
        executionTime: number;
    }>;
    /**
     * Example: Explore quantum circuits
     */
    circuitExploration(): Promise<{
        bestCircuit: import("./swarm-circuits.js").QuantumCircuit;
        performance: number;
        learnedPatterns: import("./swarm-circuits.js").CircuitPattern[];
        executionTime: number;
    }>;
    /**
     * Example: Portfolio optimization
     */
    portfolio(): Promise<{
        allocation: number[];
        expectedReturn: number;
        risk: number;
        executionTime: number;
    }>;
    /**
     * Example: Compare quantum vs classical
     */
    comparison(): Promise<{
        quantum: {
            solution: number[];
            energy: number;
            time: number;
        };
        classical: {
            solution: number[];
            energy: number;
            time: number;
        };
        speedup: number;
        qualityRatio: number;
    }>;
};
export default QuantumOptimizer;
//# sourceMappingURL=index.d.ts.map