/**
 * Swarm-based Quantum Circuit Exploration
 *
 * Uses swarm intelligence and AgentDB to explore quantum circuit designs,
 * learn optimal ansatz patterns, and discover novel circuit architectures.
 *
 * Features:
 * - Multi-agent circuit exploration
 * - Pattern recognition with AgentDB vector search
 * - Self-learning optimal circuit depths
 * - Adaptive ansatz generation
 */
export interface CircuitExplorationConfig {
    numQubits: number;
    problemType: 'maxcut' | 'vqe' | 'qaoa' | 'custom';
    swarmSize: number;
    maxDepth: number;
    explorationSteps: number;
    learningRate: number;
    memorySize: number;
    useOpenRouter?: boolean;
    openrouterApiKey?: string;
}
export interface QuantumCircuit {
    gates: Gate[];
    depth: number;
    numQubits: number;
    parameters: number[];
    performance: number;
    metadata: CircuitMetadata;
}
export interface Gate {
    type: 'RX' | 'RY' | 'RZ' | 'CNOT' | 'CZ' | 'H' | 'T' | 'S';
    qubits: number[];
    parameter?: number;
}
export interface CircuitMetadata {
    ansatzType: string;
    problemType: string;
    twoQubitGateCount: number;
    expressibility: number;
    entanglingCapability: number;
    circuitId: string;
}
export interface SwarmAgent {
    id: string;
    position: QuantumCircuit;
    velocity: number[];
    bestPosition: QuantumCircuit;
    bestPerformance: number;
}
export interface ExplorationResult {
    bestCircuit: QuantumCircuit;
    bestPerformance: number;
    explorationHistory: QuantumCircuit[];
    learnedPatterns: CircuitPattern[];
    convergenceData: ConvergenceData;
    executionTime: number;
}
export interface CircuitPattern {
    pattern: string;
    frequency: number;
    averagePerformance: number;
    embedding: number[];
}
export interface ConvergenceData {
    performanceHistory: number[];
    diversityHistory: number[];
    converged: boolean;
    convergenceStep: number;
}
/**
 * Swarm-based Circuit Explorer with AgentDB
 */
export declare class SwarmCircuitExplorer {
    private config;
    private agentDB;
    private openai?;
    private swarm;
    private globalBest?;
    private explorationHistory;
    constructor(config: CircuitExplorationConfig);
    /**
     * Initialize AgentDB for pattern storage and retrieval
     */
    private initializeAgentDB;
    /**
     * Explore quantum circuit space using swarm intelligence
     */
    explore(): Promise<ExplorationResult>;
    /**
     * Initialize swarm with random circuits
     */
    private initializeSwarm;
    /**
     * Generate random quantum circuit
     */
    private generateRandomCircuit;
    /**
     * Update agent position using PSO-like dynamics with pattern learning
     */
    private updateAgent;
    /**
     * Evaluate swarm and update best circuits
     */
    private evaluateSwarm;
    /**
     * Evaluate circuit performance (problem-specific)
     */
    private evaluateCircuit;
    /**
     * Evaluate circuit for MaxCut problem
     */
    private evaluateMaxCutCircuit;
    /**
     * Evaluate circuit for VQE problem
     */
    private evaluateVQECircuit;
    /**
     * Evaluate circuit for QAOA problem
     */
    private evaluateQAOACircuit;
    /**
     * Generic circuit evaluation
     */
    private evaluateGenericCircuit;
    /**
     * Compute circuit metadata
     */
    private computeCircuitMetadata;
    /**
     * Generate unique circuit ID
     */
    private generateCircuitId;
    /**
     * Learn patterns from high-performing circuits
     */
    private learnCircuitPatterns;
    /**
     * Convert circuit to embedding vector
     */
    private circuitToEmbedding;
    /**
     * Query similar circuits from AgentDB
     */
    private querySimilarCircuits;
    /**
     * Extract learned patterns from AgentDB
     */
    private extractLearnedPatterns;
    /**
     * Extract gate pattern signature
     */
    private extractGatePattern;
    /**
     * Compute average embedding
     */
    private averageEmbeddings;
    /**
     * Use LLM for problem decomposition
     */
    private decomposeWithLLM;
    /**
     * Compute swarm diversity
     */
    private computeSwarmDiversity;
    /**
     * Compute distance between circuits
     */
    private circuitDistance;
    /**
     * Convert gate type to numerical code
     */
    private gateTypeToCode;
}
/**
 * Explore circuits with swarm intelligence
 */
export declare function exploreCircuits(config: Partial<CircuitExplorationConfig>): Promise<ExplorationResult>;
//# sourceMappingURL=swarm-circuits.d.ts.map