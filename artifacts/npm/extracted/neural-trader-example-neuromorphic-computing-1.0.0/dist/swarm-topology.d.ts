/**
 * Swarm-based topology exploration for optimal network connectivity
 *
 * Uses particle swarm optimization to discover efficient network topologies
 * that maximize performance on specific tasks while minimizing connections.
 *
 * Integrates with OpenRouter for architecture optimization guidance.
 */
import { SpikingNeuralNetwork } from './snn';
export interface TopologyGene {
    /** Source neuron index */
    source: number;
    /** Target neuron index */
    target: number;
    /** Synaptic weight */
    weight: number;
    /** Synaptic delay (ms) */
    delay: number;
}
export interface TopologyParticle {
    /** Particle ID */
    id: string;
    /** Current topology (connections) */
    topology: TopologyGene[];
    /** Velocity for each connection parameter */
    velocity: Array<{
        weight: number;
        delay: number;
    }>;
    /** Current fitness */
    fitness: number;
    /** Best fitness achieved by this particle */
    best_fitness: number;
    /** Best topology found by this particle */
    best_topology: TopologyGene[];
}
export interface SwarmParams {
    /** Number of particles in swarm */
    swarm_size: number;
    /** Maximum number of connections */
    max_connections: number;
    /** Inertia weight */
    inertia: number;
    /** Cognitive coefficient (personal best attraction) */
    c1: number;
    /** Social coefficient (global best attraction) */
    c2: number;
    /** Maximum iterations */
    max_iterations: number;
}
export interface FitnessTask {
    /** Input patterns for evaluation */
    inputs: number[][];
    /** Expected outputs */
    targets: number[][];
    /** Evaluation function */
    evaluate: (network: SpikingNeuralNetwork, inputs: number[][], targets: number[][]) => number;
}
/**
 * Swarm-based topology optimizer for neuromorphic networks
 */
export declare class SwarmTopologyOptimizer {
    private params;
    private particles;
    private global_best_fitness;
    private global_best_topology;
    private network_size;
    constructor(network_size: number, params?: Partial<SwarmParams>);
    /**
     * Initialize swarm with random topologies
     */
    private initializeSwarm;
    /**
     * Generate random network topology
     */
    private generateRandomTopology;
    /**
     * Apply topology to a spiking neural network
     */
    private applyTopology;
    /**
     * Evaluate fitness of a topology on a task
     */
    private evaluateFitness;
    /**
     * Update particle velocity and position
     */
    private updateParticle;
    /**
     * Optimize topology using particle swarm optimization
     * @param task Fitness evaluation task
     * @returns Optimization history
     */
    optimize(task: FitnessTask): Array<{
        iteration: number;
        best_fitness: number;
        avg_fitness: number;
        best_connections: number;
    }>;
    /**
     * Get best topology found
     */
    getBestTopology(): TopologyGene[];
    /**
     * Get best fitness achieved
     */
    getBestFitness(): number;
    /**
     * Export best topology to JSON
     */
    exportTopology(): string;
    /**
     * Create network from best topology
     */
    createOptimizedNetwork(): SpikingNeuralNetwork;
}
/**
 * Example fitness function: Pattern recognition task
 */
export declare function patternRecognitionFitness(network: SpikingNeuralNetwork, inputs: number[][], targets: number[][]): number;
/**
 * Example fitness function: Temporal sequence learning
 */
export declare function temporalSequenceFitness(network: SpikingNeuralNetwork, inputs: number[][], targets: number[][]): number;
/**
 * OpenRouter integration for architecture suggestions
 * This would use OpenRouter API to get optimization suggestions
 */
export declare function getOpenRouterArchitectureSuggestion(task_description: string, current_topology: TopologyGene[], performance: number): Promise<string>;
//# sourceMappingURL=swarm-topology.d.ts.map