/**
 * GOAP Planner Implementation
 * Uses STRIPS-style preconditions and effects with A* pathfinding
 */
import { GoapAction, GoapPlan, PlanningContext, PlanExecutionResult } from '../core/types.js';
export declare class GoapPlanner {
    private nextPlanId;
    /**
     * Generate a plan to achieve the given goal using A* search
     */
    createPlan(context: PlanningContext): Promise<GoapPlan | null>;
    /**
     * Execute a plan with dynamic re-planning on failure
     */
    executePlan(plan: GoapPlan, availableActions: GoapAction[], onReplan?: (newPlan: GoapPlan) => void, maxReplans?: number): Promise<PlanExecutionResult>;
    /**
     * Check if an action can be executed in the current state
     */
    private canExecuteAction;
    /**
     * Evaluate a single precondition against the world state
     */
    private evaluatePrecondition;
    /**
     * Apply action effects to create a new world state
     */
    private applyActionEffects;
    /**
     * Apply a single effect to the world state
     */
    private applyEffect;
    /**
     * Check if the goal is satisfied in the current state
     */
    private isGoalSatisfied;
    /**
     * Calculate heuristic distance to goal (for A* algorithm)
     */
    private calculateHeuristic;
    /**
     * Generate a unique key for a world state (for closed set tracking)
     */
    private getStateKey;
    /**
     * Reconstruct the plan from the final search node
     */
    private reconstructPlan;
    /**
     * Attempt to replan from current state
     */
    private replan;
}
//# sourceMappingURL=planner.d.ts.map