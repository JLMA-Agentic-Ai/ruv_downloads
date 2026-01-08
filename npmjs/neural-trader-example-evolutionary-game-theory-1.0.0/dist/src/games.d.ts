/**
 * Classic game theory games
 */
import type { Game } from './types.js';
/**
 * Prisoner's Dilemma
 *
 * Two prisoners can cooperate (stay silent) or defect (betray).
 * - Both cooperate: light sentence (3 points each)
 * - Both defect: medium sentence (1 point each)
 * - One defects: defector goes free (5 points), cooperator gets heavy sentence (0 points)
 */
export declare const PRISONERS_DILEMMA: Game;
/**
 * Hawk-Dove (Chicken) Game
 *
 * Contest over a resource of value V.
 * - Both Dove: share resource (V/2 each)
 * - Both Hawk: fight with cost C (V/2 - C each)
 * - Hawk vs Dove: Hawk gets all, Dove gets nothing
 */
export declare function createHawkDoveGame(resourceValue?: number, fightCost?: number): Game;
export declare const HAWK_DOVE: Game;
/**
 * Stag Hunt
 *
 * Cooperation for big reward vs safe defection.
 * - Both hunt stag: big payoff (4 each)
 * - Both hunt hare: small safe payoff (3 each)
 * - Stag alone: no payoff (0), hare hunter gets small payoff (3)
 */
export declare const STAG_HUNT: Game;
/**
 * Public Goods Game
 *
 * N players can contribute to public good or free-ride.
 * Contributions are multiplied by factor r and shared equally.
 *
 * For 2-player approximation:
 * - Both contribute: net gain (r-1)
 * - One contributes: contributor loses 1-r/2, free-rider gains r/2
 * - Neither contributes: no change (0)
 */
export declare function createPublicGoodsGame(multiplicationFactor?: number): Game;
export declare const PUBLIC_GOODS: Game;
/**
 * Rock-Paper-Scissors
 *
 * Classic cyclic game with no pure strategy Nash equilibrium.
 */
export declare const ROCK_PAPER_SCISSORS: Game;
/**
 * Battle of the Sexes
 *
 * Coordination game with conflicting preferences.
 * Couple wants to go out together but has different preferences.
 */
export declare const BATTLE_OF_SEXES: Game;
/**
 * All available games
 */
export declare const ALL_GAMES: Game[];
/**
 * Get game by ID
 */
export declare function getGame(gameId: string): Game | undefined;
/**
 * Calculate expected payoff for a strategy against a population
 */
export declare function calculatePayoff(game: Game, strategy: number, population: number[]): number;
/**
 * Calculate all fitness values for current population
 */
export declare function calculateFitnessValues(game: Game, population: number[]): number[];
/**
 * Find Nash equilibrium (pure strategies)
 */
export declare function findPureNashEquilibria(game: Game): number[][];
//# sourceMappingURL=games.d.ts.map