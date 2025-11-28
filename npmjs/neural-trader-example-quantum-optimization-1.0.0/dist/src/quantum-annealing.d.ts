/**
 * Quantum Annealing Simulation
 *
 * Simulates quantum annealing process for combinatorial optimization.
 * Uses quantum tunneling and thermal fluctuations to escape local minima.
 *
 * Applications: Scheduling, Constraint Satisfaction, TSP, Protein Folding
 */
export interface AnnealingConfig {
    numQubits: number;
    initialTemperature: number;
    finalTemperature: number;
    annealingTime: number;
    numSteps: number;
    quantumStrength: number;
    method: 'simulated' | 'quantum-monte-carlo' | 'path-integral';
}
export interface QuboMatrix {
    Q: number[][];
}
export interface AnnealingResult {
    solution: number[];
    energy: number;
    successProbability: number;
    annealingPath: AnnealingSnapshot[];
    executionTime: number;
    converged: boolean;
}
export interface AnnealingSnapshot {
    time: number;
    temperature: number;
    transverseField: number;
    state: number[];
    energy: number;
    quantumFluctuations: number;
}
/**
 * Quantum Annealing Simulator
 */
export declare class QuantumAnnealer {
    private config;
    private qubo;
    private currentState;
    private annealingPath;
    constructor(config: AnnealingConfig, qubo: QuboMatrix);
    /**
     * Run quantum annealing optimization
     */
    anneal(): Promise<AnnealingResult>;
    /**
     * Initialize state (random or ground state)
     */
    private initializeState;
    /**
     * Temperature schedule: T(t) = T_initial * (1 - t) + T_final * t
     */
    private temperatureSchedule;
    /**
     * Transverse field schedule: Γ(t) = Γ_0 * (1 - t)
     * Strong at start (quantum tunneling), weak at end (classical)
     */
    private transverseFieldSchedule;
    /**
     * Simulated annealing step with quantum tunneling
     */
    private simulatedAnnealingStep;
    /**
     * Quantum Monte Carlo step using path integral formulation
     */
    private quantumMonteCarloStep;
    /**
     * Update single Trotter slice in QMC
     */
    private trotterSliceUpdate;
    /**
     * Path integral formulation step
     */
    private pathIntegralStep;
    /**
     * Compute energy E = x^T Q x for QUBO problem
     */
    private computeEnergy;
    /**
     * Compute quantum fluctuations strength
     */
    private computeQuantumFluctuations;
    /**
     * Check if annealing converged to ground state
     */
    private checkConvergence;
    /**
     * Estimate success probability (reaching ground state)
     */
    private estimateSuccessProbability;
    private variance;
}
/**
 * Create QUBO problem from various formulations
 */
export declare class QUBOFormulator {
    /**
     * Convert MaxCut to QUBO
     */
    static maxCutToQUBO(edges: [number, number, number][]): QuboMatrix;
    /**
     * Convert TSP to QUBO
     */
    static tspToQUBO(distanceMatrix: number[][]): QuboMatrix;
    /**
     * Convert constraint satisfaction to QUBO
     */
    static constraintSatisfactionToQUBO(numVars: number, constraints: Array<{
        vars: number[];
        coeffs: number[];
        rhs: number;
    }>): QuboMatrix;
    /**
     * Convert portfolio optimization to QUBO
     */
    static portfolioToQUBO(returns: number[], covarianceMatrix: number[][], budget: number, riskAversion: number): QuboMatrix;
}
/**
 * Solve QUBO problem using quantum annealing
 */
export declare function solveQUBO(qubo: QuboMatrix, config?: Partial<AnnealingConfig>): Promise<AnnealingResult>;
/**
 * Solve MaxCut using quantum annealing
 */
export declare function solveMaxCutAnnealing(edges: [number, number, number][], config?: Partial<AnnealingConfig>): Promise<AnnealingResult>;
/**
 * Solve TSP using quantum annealing
 */
export declare function solveTSPAnnealing(distanceMatrix: number[][], config?: Partial<AnnealingConfig>): Promise<AnnealingResult>;
//# sourceMappingURL=quantum-annealing.d.ts.map