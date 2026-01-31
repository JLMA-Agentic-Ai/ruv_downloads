/**
 * Variational Quantum Eigensolver (VQE)
 *
 * Hybrid quantum-classical algorithm for finding ground state energies
 * and solving optimization problems through Hamiltonian minimization.
 *
 * Applications: Molecular simulation, Portfolio optimization, Machine learning
 */
export interface VQEConfig {
    numQubits: number;
    ansatzType: 'hardware-efficient' | 'uccsd' | 'custom';
    ansatzDepth: number;
    maxIterations: number;
    optimizer: 'gradient-descent' | 'adam' | 'cobyla';
    learningRate: number;
    tolerance: number;
}
export interface Hamiltonian {
    pauliStrings: PauliString[];
}
export interface PauliString {
    pauli: string;
    coefficient: number;
}
export interface VQEResult {
    groundStateEnergy: number;
    optimalParameters: number[];
    groundState: Complex[];
    iterations: number;
    converged: boolean;
    energyHistory: number[];
    executionTime: number;
}
export interface Complex {
    re: number;
    im: number;
}
/**
 * VQE Solver for Hamiltonian ground state problems
 */
export declare class VQESolver {
    private config;
    private hamiltonian;
    private parameterHistory;
    private energyHistory;
    constructor(config: VQEConfig, hamiltonian: Hamiltonian);
    /**
     * Run VQE optimization to find ground state
     */
    solve(): Promise<VQEResult>;
    /**
     * Get number of parameters for chosen ansatz
     */
    private getNumParameters;
    /**
     * Prepare quantum state using variational ansatz
     */
    private prepareAnsatz;
    /**
     * Apply hardware-efficient ansatz
     * Pattern: (Ry rotations) -> (CNOT ladder) repeated depth times
     */
    private applyHardwareEfficientAnsatz;
    /**
     * Apply UCCSD (Unitary Coupled Cluster) ansatz
     * Used for molecular electronic structure
     */
    private applyUCCSDAnsatz;
    /**
     * Apply custom ansatz
     */
    private applyCustomAnsatz;
    /**
     * Compute expectation value ⟨ψ|H|ψ⟩
     */
    private computeHamiltonianExpectation;
    /**
     * Compute expectation of a Pauli string
     */
    private computePauliExpectation;
    /**
     * Apply Pauli string operator to state
     */
    private applyPauliString;
    /**
     * Update parameters using selected optimizer
     */
    private updateParameters;
    /**
     * Compute gradients using parameter shift rule
     */
    private computeGradients;
    private applyRyRotation;
    private applyRzRotation;
    private applyCNOT;
    private applyPauliX;
    private applyPauliY;
    private applyPauliZ;
    private applySingleExcitation;
    private applyDoubleExcitation;
    private initializeAdamState;
    private adamUpdate;
    private cobylaUpdate;
    private complexAdd;
    private complexMult;
    private complexScale;
    private complexConj;
}
/**
 * Create Hamiltonian for common problems
 */
export declare function createIsingHamiltonian(couplings: number[][], fields: number[]): Hamiltonian;
//# sourceMappingURL=vqe.d.ts.map