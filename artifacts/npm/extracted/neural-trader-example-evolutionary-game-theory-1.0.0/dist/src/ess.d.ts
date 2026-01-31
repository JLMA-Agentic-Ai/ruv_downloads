/**
 * Evolutionarily Stable Strategy (ESS) Analysis
 *
 * An ESS is a strategy such that, if adopted by a population,
 * cannot be invaded by any alternative mutant strategy.
 *
 * Mathematical definition:
 * A strategy s* is an ESS if for all s ≠ s*:
 * 1. E(s*, s*) > E(s, s*), or
 * 2. E(s*, s*) = E(s, s*) and E(s*, s) > E(s, s)
 *
 * where E(a, b) is the expected payoff for strategy a against strategy b.
 */
import type { Game, ESSResult } from './types.js';
/**
 * ESS Calculator
 */
export declare class ESSCalculator {
    private game;
    constructor(game: Game);
    /**
     * Check if a pure strategy is an ESS
     */
    isPureESS(strategy: number): boolean;
    /**
     * Check if a mixed strategy is an ESS
     * Uses the stability matrix approach
     */
    isMixedESS(strategy: number[], epsilon?: number): ESSResult;
    /**
     * Calculate Jacobian matrix for replicator dynamics
     */
    private calculateJacobian;
    /**
     * Calculate eigenvalues of a matrix using QR algorithm
     * (Simplified implementation for 2x2 and 3x3 matrices)
     */
    private calculateEigenvalues;
    /**
     * Eigenvalues for 2x2 matrix
     */
    private eigenvalues2x2;
    /**
     * Eigenvalues for 3x3 matrix (simplified)
     */
    private eigenvalues3x3;
    /**
     * Power iteration to find dominant eigenvalue
     */
    private powerIteration;
    /**
     * Deflate matrix (remove dominant eigenvalue)
     */
    private deflateMatrix;
    /**
     * Dot product of two vectors
     */
    private dotProduct;
    /**
     * Find all pure strategy ESS
     */
    findPureESS(): number[];
    /**
     * Find mixed strategy ESS by scanning the simplex
     */
    findMixedESS(resolution?: number): ESSResult[];
    /**
     * Generate points on the simplex
     */
    private generateSimplexPoints;
    /**
     * Check stability against specific invader
     */
    canInvade(resident: number[], invader: number[], invaderFreq?: number): boolean;
    /**
     * Calculate invasion fitness
     */
    invasionFitness(resident: number[], invader: number[]): number;
    /**
     * Find the basin of attraction for an ESS
     */
    findBasinOfAttraction(ess: number[], resolution?: number, threshold?: number): number[][];
    /**
     * Euclidean distance between two strategies
     */
    private euclideanDistance;
}
/**
 * Helper function to find all ESS in a game
 */
export declare function findAllESS(game: Game): {
    pure: number[];
    mixed: ESSResult[];
};
//# sourceMappingURL=ess.d.ts.map