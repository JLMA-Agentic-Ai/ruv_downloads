/**
 * Classic strategies for iterated games
 */
import type { Strategy } from './types.js';
/**
 * Always cooperate (strategy 0)
 */
export declare const ALWAYS_COOPERATE: Strategy;
/**
 * Always defect (strategy 1)
 */
export declare const ALWAYS_DEFECT: Strategy;
/**
 * Tit-for-Tat: Start with cooperation, then copy opponent's last move
 */
export declare const TIT_FOR_TAT: Strategy;
/**
 * Tit-for-Two-Tats: Only retaliate after two defections
 */
export declare const TIT_FOR_TWO_TATS: Strategy;
/**
 * Grim Trigger: Cooperate until opponent defects once, then defect forever
 */
export declare const GRIM_TRIGGER: Strategy;
/**
 * Pavlov (Win-Stay, Lose-Shift): Repeat if won, change if lost
 */
export declare const PAVLOV: Strategy;
/**
 * Random strategy
 */
export declare const RANDOM: Strategy;
/**
 * Generous Tit-for-Tat: Like TFT but forgives with some probability
 */
export declare function createGenerousTitForTat(forgivenessRate?: number): Strategy;
/**
 * Adaptive strategy: Learns opponent's cooperation rate
 */
export declare const ADAPTIVE: Strategy;
/**
 * Gradual: Increases retaliation with each defection
 */
export declare const GRADUAL: Strategy;
/**
 * Probe: Test opponent occasionally
 */
export declare const PROBE: Strategy;
/**
 * All classic strategies
 */
export declare const CLASSIC_STRATEGIES: Strategy[];
/**
 * Get strategy by ID
 */
export declare function getStrategy(strategyId: string): Strategy | undefined;
/**
 * Create a custom strategy with learning
 */
export declare function createLearningStrategy(id: string, name: string, weights: number[]): Strategy;
//# sourceMappingURL=strategies.d.ts.map