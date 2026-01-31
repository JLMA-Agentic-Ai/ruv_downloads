/**
 * Quantum Approximate Optimization Algorithm (QAOA)
 *
 * Hybrid quantum-classical algorithm for combinatorial optimization problems.
 * Uses parameterized quantum circuits with classical optimization of angles.
 *
 * Applications: MaxCut, Graph Coloring, TSP, Portfolio Optimization
 */
export interface QAOAConfig {
    numQubits: number;
    depth: number;
    maxIterations: number;
    learningRate: number;
    tolerance: number;
}
export interface QAOAProblem {
    type: 'maxcut' | 'tsp' | 'portfolio' | 'constraint-satisfaction';
    costMatrix: number[][];
    constraints?: any[];
}
export interface QAOAResult {
    bestSolution: number[];
    bestEnergy: number;
    optimalAngles: {
        beta: number[];
        gamma: number[];
    };
    iterations: number;
    converged: boolean;
    stateVector?: Complex[];
    executionTime: number;
}
export interface Complex {
    re: number;
    im: number;
}
/**
 * QAOA Optimizer using simulated quantum circuits
 */
export declare class QAOAOptimizer {
    private config;
    private problem;
    constructor(config: QAOAConfig, problem: QAOAProblem);
    /**
     * Run QAOA optimization
     */
    optimize(): Promise<QAOAResult>;
    /**
     * Evaluate QAOA circuit for given parameters
     */
    private evaluateCircuit;
    /**
     * Initialize quantum state to uniform superposition
     */
    private initializeState;
    /**
     * Apply cost Hamiltonian (problem-specific)
     */
    private applyCostHamiltonian;
    /**
     * Apply mixer Hamiltonian (X rotations)
     */
    private applyMixerHamiltonian;
    /**
     * Apply X rotation to a single qubit
     */
    private applyXRotation;
    /**
     * Compute expectation value of cost function
     */
    private computeExpectation;
    /**
     * Sample most probable solution from state vector
     */
    private sampleSolution;
    /**
     * Evaluate cost function for a bitstring
     */
    private evaluateCost;
    /**
     * Compute gradients using parameter shift rule
     */
    private computeGradients;
    private complexAdd;
    private complexMult;
    private complexScale;
    private indexToBitstring;
}
/**
 * Helper function to create MaxCut problem
 */
export declare function createMaxCutProblem(edges: [number, number, number][]): QAOAProblem;
/**
 * Solve MaxCut problem using QAOA
 */
export declare function solveMaxCut(edges: [number, number, number][], config?: Partial<QAOAConfig>): Promise<QAOAResult>;
//# sourceMappingURL=qaoa.d.ts.map