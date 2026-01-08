/**
 * Tournament system for iterated games
 *
 * Implements round-robin and elimination tournaments with memory-based strategies
 */
import type { Strategy, TournamentResult, Game, GameHistory } from './types.js';
/**
 * Tournament configuration
 */
export interface TournamentConfig {
    game: Game;
    strategies: Strategy[];
    roundsPerMatch: number;
    tournamentStyle: 'round-robin' | 'elimination' | 'swiss';
    repeatMatches: number;
    noiseProbability: number;
}
/**
 * Tournament manager
 */
export declare class Tournament {
    private config;
    private players;
    private matchHistory;
    constructor(config?: Partial<TournamentConfig>);
    /**
     * Add a strategy to the tournament
     */
    addStrategy(strategy: Strategy): void;
    /**
     * Play a match between two strategies
     */
    private playMatch;
    /**
     * Run a round-robin tournament
     */
    private runRoundRobin;
    /**
     * Run elimination tournament (single elimination)
     */
    private runElimination;
    /**
     * Run Swiss-system tournament
     */
    private runSwiss;
    /**
     * Run the tournament
     */
    run(): TournamentResult;
    /**
     * Calculate diversity index (Shannon entropy)
     */
    private calculateDiversityIndex;
    /**
     * Get match history between two strategies
     */
    getMatchHistory(strategy1Id: string, strategy2Id: string): GameHistory[][];
    /**
     * Get cooperation rate for a strategy in tournament
     */
    getCooperationRate(strategyId: string): number;
    /**
     * Analyze strategy performance
     */
    analyzeStrategy(strategyId: string): {
        averageScore: number;
        winRate: number;
        cooperationRate: number;
        performanceByOpponent: Map<string, number>;
    };
    /**
     * Export tournament results
     */
    exportResults(): {
        config: TournamentConfig;
        results: TournamentResult;
        analyses: Map<string, {
            averageScore: number;
            winRate: number;
            cooperationRate: number;
            performanceByOpponent: Map<string, number>;
        }>;
    };
}
/**
 * Run a quick tournament with default strategies
 */
export declare function quickTournament(strategies: Strategy[], game?: Game, rounds?: number): TournamentResult;
//# sourceMappingURL=tournament.d.ts.map