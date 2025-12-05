/**
 * Recursive Validation Plugin
 *
 * Validates research results recursively and triggers replanning
 * when quality thresholds are not met.
 */
import type { GoapPlugin, WorldState, PlanStep } from '../core/types';
export interface ValidationCriteria {
    minCitations?: number;
    minConfidence?: number;
    requiredDomains?: string[];
    forbiddenTerms?: string[];
    minAnswerLength?: number;
    maxContradictions?: number;
}
export declare class RecursiveValidationPlugin implements GoapPlugin {
    name: string;
    version: string;
    private validationCriteria;
    private validationAttempts;
    private maxValidationAttempts;
    constructor(criteria?: ValidationCriteria);
    /**
     * Recursively validate the state
     */
    private recursiveValidate;
    hooks: {
        afterSynthesize: (result: any) => Promise<void>;
        onReplan: (failedStep: PlanStep, state: WorldState) => Promise<void>;
    };
}
declare const _default: RecursiveValidationPlugin;
export default _default;
export declare function createValidationPlugin(criteria: ValidationCriteria): RecursiveValidationPlugin;
//# sourceMappingURL=recursive-validation-plugin.d.ts.map