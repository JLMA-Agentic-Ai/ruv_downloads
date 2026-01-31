/**
 * Advanced Reasoning Engine WASM Integration
 * Provides enhanced analytical capabilities to the GOAP planner
 */
import { WorldState, GoapAction, GoapGoal, GoapPlan, AdvancedReasoning } from './types.js';
export declare class AdvancedReasoningEngine implements AdvancedReasoning {
    private wasm;
    private initialized;
    initialize(): Promise<void>;
    /**
     * Analyze world state and goal to provide insights and suggestions
     */
    analyze(state: WorldState, goal: GoapGoal): Promise<{
        insights: string[];
        suggestedActions: string[];
        confidence: number;
    }>;
    /**
     * Enhance a plan using Strange Loop consciousness evolution
     */
    enhance(plan: GoapPlan): Promise<GoapPlan>;
    /**
     * Predict action outcomes using temporal prediction
     */
    predict(action: GoapAction, state: WorldState): Promise<{
        likelihood: number;
        alternatives: GoapAction[];
    }>;
    /**
     * WASM-powered analysis using consciousness evolution
     */
    private wasmAnalyze;
    /**
     * WASM-powered plan enhancement
     */
    private wasmEnhance;
    /**
     * WASM-powered prediction
     */
    private wasmPredict;
    /**
     * Enhanced fallback analysis with advanced reasoning algorithms
     */
    private fallbackAnalyze;
    private analyzeQueryComplexity;
    private detectDomains;
    private detectTemporalRequirements;
    private detectQueryFacets;
    private calculateConfidence;
    /**
     * Fallback plan enhancement
     */
    private fallbackEnhance;
    /**
     * Fallback prediction
     */
    private fallbackPredict;
    /**
     * Convert world state to numerical vector for WASM processing
     */
    private stateToVector;
    /**
     * Convert action to numerical vector
     */
    private actionToVector;
    /**
     * Assess goal complexity
     */
    private assessGoalComplexity;
    /**
     * Calculate state entropy
     */
    private calculateStateEntropy;
    /**
     * Interpret predictive modeling results into action suggestions
     */
    private interpretPredictions;
}
//# sourceMappingURL=advanced-reasoning-engine.d.ts.map