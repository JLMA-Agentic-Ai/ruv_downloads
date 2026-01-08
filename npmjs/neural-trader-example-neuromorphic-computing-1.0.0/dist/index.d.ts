/**
 * @neural-trader/example-neuromorphic-computing
 *
 * Neuromorphic computing with Spiking Neural Networks (SNNs), STDP learning,
 * and reservoir computing for ultra-low-power machine learning.
 *
 * Features:
 * - Leaky Integrate-and-Fire (LIF) neurons
 * - Spike-Timing-Dependent Plasticity (STDP) learning
 * - Liquid State Machines (reservoir computing)
 * - Event-driven computation
 * - Swarm-based topology optimization
 * - AgentDB integration for persistent network state
 */
import { SpikingNeuralNetwork, LIFNeuron, LIFNeuronParams, SynapticConnection, SpikeEvent } from './snn';
import { STDPLearner, STDPParams, createSTDPLearner, SpikeTrace } from './stdp';
import { LiquidStateMachine, ReservoirParams, ReadoutWeights, createLSM } from './reservoir-computing';
import { SwarmTopologyOptimizer, TopologyGene, TopologyParticle, SwarmParams, FitnessTask, patternRecognitionFitness, temporalSequenceFitness, getOpenRouterArchitectureSuggestion } from './swarm-topology';
export { SpikingNeuralNetwork, LIFNeuron, LIFNeuronParams, SynapticConnection, SpikeEvent, STDPLearner, STDPParams, createSTDPLearner, SpikeTrace, LiquidStateMachine, ReservoirParams, ReadoutWeights, createLSM, SwarmTopologyOptimizer, TopologyGene, TopologyParticle, SwarmParams, FitnessTask, patternRecognitionFitness, temporalSequenceFitness, getOpenRouterArchitectureSuggestion, };
/**
 * AgentDB integration for persistent network state
 */
export declare class NeuromorphicAgent {
    private db;
    private namespace;
    constructor(db_path?: string, namespace?: string);
    /**
     * Store SNN state in AgentDB
     */
    storeNetwork(network_id: string, network: SpikingNeuralNetwork): Promise<void>;
    /**
     * Store STDP learner state
     */
    storeSTDP(learner_id: string, learner: STDPLearner): Promise<void>;
    /**
     * Store LSM state
     */
    storeLSM(lsm_id: string, lsm: LiquidStateMachine): Promise<void>;
    /**
     * Store optimized topology
     */
    storeTopology(topology_id: string, optimizer: SwarmTopologyOptimizer): Promise<void>;
    /**
     * Retrieve stored data
     */
    retrieve(key: string): Promise<any>;
    /**
     * Search for similar network states using vector embeddings
     */
    findSimilarNetworks(network: SpikingNeuralNetwork, limit?: number): Promise<Array<{
        id: string;
        similarity: number;
    }>>;
    /**
     * Create vector embedding from network state
     */
    private createNetworkEmbedding;
    /**
     * Close database connection
     */
    close(): Promise<void>;
}
/**
 * High-level example: Pattern recognition with STDP learning
 */
export declare function runPatternRecognitionExample(): Promise<void>;
/**
 * High-level example: Reservoir computing for time-series
 */
export declare function runReservoirComputingExample(): Promise<void>;
/**
 * High-level example: Swarm topology optimization
 */
export declare function runSwarmOptimizationExample(): Promise<void>;
/**
 * Main orchestration function
 */
export declare function main(): Promise<void>;
//# sourceMappingURL=index.d.ts.map