/**
 * Swarm-based evolutionary learning with AgentDB and agentic-flow
 *
 * Implements:
 * - Genetic algorithms for strategy evolution
 * - Multi-agent tournaments with 100+ strategies
 * - Self-learning through experience replay
 * - Memory-based strategy library using AgentDB
 * - Fitness landscape exploration
 * - OpenRouter integration for strategy innovation
 */
import type { Strategy, GeneticParams, EvolutionResult, SwarmConfig, FitnessPoint, Game } from './types.js';
/**
 * Swarm evolution coordinator
 */
export declare class SwarmEvolution {
    private game;
    private geneticParams;
    private swarmConfig;
    private population;
    private generation;
    private fitnessHistory;
    private bestStrategies;
    private agentDB?;
    private openRouterKey?;
    constructor(game: Game, geneticParams?: Partial<GeneticParams>, swarmConfig?: Partial<SwarmConfig>);
    /**
     * Initialize AgentDB for strategy memory
     */
    initializeAgentDB(agentDB: any): Promise<void>;
    /**
     * Set OpenRouter API key for strategy innovation
     */
    setOpenRouterKey(key: string): void;
    /**
     * Initialize population with random strategies
     */
    private initializePopulation;
    /**
     * Evaluate fitness of all strategies
     */
    private evaluateFitness;
    /**
     * Store fitness values in AgentDB
     */
    private storeFitnessInDB;
    /**
     * Extract feature vector from strategy
     */
    private extractStrategyFeatures;
    /**
     * Selection: Tournament selection
     */
    private tournamentSelection;
    /**
     * Crossover: Uniform crossover for strategy weights
     */
    private crossover;
    /**
     * Mutation: Gaussian mutation
     */
    private mutate;
    /**
     * Evolve population for one generation
     */
    evolveGeneration(): Promise<EvolutionResult>;
    /**
     * Calculate population diversity (genetic diversity)
     */
    private calculatePopulationDiversity;
    /**
     * Run complete evolution
     */
    run(): Promise<EvolutionResult>;
    /**
     * Query similar strategies from AgentDB
     */
    querySimilarStrategies(strategy: Strategy, k?: number): Promise<Array<{
        strategy: Strategy;
        similarity: number;
    }>>;
    /**
     * Explore fitness landscape
     */
    exploreFitnessLandscape(resolution?: number): Promise<FitnessPoint[]>;
    /**
     * Generate innovative strategies using OpenRouter
     */
    innovateWithLLM(prompt: string): Promise<Strategy[]>;
    /**
     * Get population statistics
     */
    getStatistics(): {
        generation: number;
        populationSize: number;
        bestStrategies: Strategy[];
        averageFitness: number;
        fitnessVariance: number;
    };
}
/**
 * Quick swarm evolution run
 */
export declare function quickSwarmEvolution(game?: Game, generations?: number): Promise<EvolutionResult>;
//# sourceMappingURL=swarm-evolution.d.ts.map