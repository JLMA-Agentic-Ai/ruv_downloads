/**
 * Critical Reasoning Validator Plugin
 *
 * Applies critical reasoning to validate content accuracy and logical consistency.
 * Forces replanning when reasoning detects issues.
 */
import type { GoapPlugin, WorldState, PlanStep } from '../core/types';
export declare class CriticalReasoningValidator implements GoapPlugin {
    name: string;
    version: string;
    private replanningTriggered;
    private validationDepth;
    private maxDepth;
    /**
     * Critical reasoning checks
     */
    private reasoningChecks;
    /**
     * Calculate similarity between two strings (0-1)
     */
    private calculateSimilarity;
    /**
     * Perform recursive critical reasoning validation
     */
    private performCriticalValidation;
    hooks: {
        afterSynthesize: (result: any) => Promise<void>;
        onReplan: (failedStep: PlanStep, state: WorldState) => Promise<void>;
    };
}
declare const _default: CriticalReasoningValidator;
export default _default;
export declare function createCriticalValidator(): CriticalReasoningValidator;
//# sourceMappingURL=critical-reasoning-validator.d.ts.map