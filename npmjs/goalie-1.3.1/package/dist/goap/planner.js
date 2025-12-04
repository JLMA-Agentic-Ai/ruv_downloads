/**
 * GOAP Planner Implementation
 * Uses STRIPS-style preconditions and effects with A* pathfinding
 */
export class GoapPlanner {
    nextPlanId = 1;
    /**
     * Generate a plan to achieve the given goal using A* search
     */
    async createPlan(context) {
        const { currentState, goal, availableActions, maxDepth = 20, maxCost = 1000 } = context;
        // Check if goal is already satisfied
        if (this.isGoalSatisfied(currentState, goal)) {
            return {
                id: `plan_${this.nextPlanId++}`,
                goal,
                steps: [],
                totalCost: 0,
                created: new Date(),
                status: 'pending'
            };
        }
        const startNode = {
            state: { ...currentState },
            gCost: 0,
            hCost: this.calculateHeuristic(currentState, goal),
            fCost: 0,
            depth: 0
        };
        startNode.fCost = startNode.gCost + startNode.hCost;
        const openSet = [startNode];
        const closedSet = new Set();
        while (openSet.length > 0) {
            // Sort by fCost (A* algorithm)
            openSet.sort((a, b) => a.fCost - b.fCost);
            const currentNode = openSet.shift();
            const stateKey = this.getStateKey(currentNode.state);
            if (closedSet.has(stateKey)) {
                continue;
            }
            closedSet.add(stateKey);
            // Check if we've reached the goal
            if (this.isGoalSatisfied(currentNode.state, goal)) {
                return this.reconstructPlan(currentNode, goal);
            }
            // Check depth and cost limits
            if (currentNode.depth >= maxDepth || currentNode.gCost >= maxCost) {
                continue;
            }
            // Expand neighbors (try all applicable actions)
            for (const action of availableActions) {
                if (this.canExecuteAction(action, currentNode.state)) {
                    const newState = this.applyActionEffects(action, currentNode.state);
                    const newGCost = currentNode.gCost + action.cost;
                    const newHCost = this.calculateHeuristic(newState, goal);
                    const neighbor = {
                        state: newState,
                        action,
                        parent: currentNode,
                        gCost: newGCost,
                        hCost: newHCost,
                        fCost: newGCost + newHCost,
                        depth: currentNode.depth + 1
                    };
                    // Only add if this path is better or state hasn't been explored
                    const neighborStateKey = this.getStateKey(newState);
                    if (!closedSet.has(neighborStateKey)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        return null; // No plan found
    }
    /**
     * Execute a plan with dynamic re-planning on failure
     */
    async executePlan(plan, availableActions, onReplan, maxReplans = 3) {
        let currentState = plan.steps[0]?.expectedState ? { ...plan.steps[0].expectedState } : {};
        let executedSteps = 0;
        const planHistory = [plan];
        let replanCount = 0;
        for (let i = 0; i < plan.steps.length; i++) {
            const step = plan.steps[i];
            try {
                // Validate preconditions before execution
                if (!this.canExecuteAction(step.action, currentState)) {
                    // Preconditions failed - attempt replan
                    if (replanCount >= maxReplans) {
                        return {
                            success: false,
                            finalState: currentState,
                            executedSteps,
                            failedAt: i,
                            error: `Max replans (${maxReplans}) exceeded at action ${step.action.name}`,
                            planHistory
                        };
                    }
                    const replanResult = await this.replan(currentState, plan.goal, availableActions, i);
                    if (replanResult === null) {
                        return {
                            success: false,
                            finalState: currentState,
                            executedSteps,
                            failedAt: i,
                            error: `Preconditions failed for action ${step.action.name} and replan failed`,
                            planHistory
                        };
                    }
                    replanCount++;
                    planHistory.push(replanResult);
                    plan = replanResult;
                    onReplan?.(replanResult);
                    i = -1; // Restart execution from beginning
                    continue;
                }
                // Execute the action
                const result = await step.action.execute(currentState, step.params);
                if (!result.success) {
                    // Action execution failed - attempt replan
                    if (replanCount >= maxReplans) {
                        return {
                            success: false,
                            finalState: currentState,
                            executedSteps,
                            failedAt: i,
                            error: `Max replans (${maxReplans}) exceeded after action ${step.action.name} failed`,
                            planHistory
                        };
                    }
                    const replanResult = await this.replan(currentState, plan.goal, availableActions, i);
                    if (replanResult === null) {
                        return {
                            success: false,
                            finalState: currentState,
                            executedSteps,
                            failedAt: i,
                            error: result.error || `Action ${step.action.name} failed`,
                            planHistory
                        };
                    }
                    replanCount++;
                    planHistory.push(replanResult);
                    plan = replanResult;
                    onReplan?.(replanResult);
                    i = -1; // Restart execution from beginning
                    continue;
                }
                currentState = result.newState;
                executedSteps++;
            }
            catch (error) {
                return {
                    success: false,
                    finalState: currentState,
                    executedSteps,
                    failedAt: i,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    planHistory
                };
            }
        }
        return {
            success: true,
            finalState: currentState,
            executedSteps,
            replanned: planHistory.length > 1,
            planHistory
        };
    }
    /**
     * Check if an action can be executed in the current state
     */
    canExecuteAction(action, state) {
        return action.preconditions.every(precondition => this.evaluatePrecondition(precondition, state));
    }
    /**
     * Evaluate a single precondition against the world state
     */
    evaluatePrecondition(precondition, state) {
        const { key, value, operator = 'equals' } = precondition;
        const stateValue = state[key];
        switch (operator) {
            case 'equals':
                return stateValue === value;
            case 'exists':
                return stateValue !== undefined && stateValue !== null;
            case 'not_exists':
                return stateValue === undefined || stateValue === null;
            case 'greater':
                return typeof stateValue === 'number' && stateValue > value;
            case 'less':
                return typeof stateValue === 'number' && stateValue < value;
            case 'contains':
                return Array.isArray(stateValue) && stateValue.includes(value);
            default:
                return false;
        }
    }
    /**
     * Apply action effects to create a new world state
     */
    applyActionEffects(action, state) {
        const newState = { ...state };
        for (const effect of action.effects) {
            this.applyEffect(effect, newState);
        }
        return newState;
    }
    /**
     * Apply a single effect to the world state
     */
    applyEffect(effect, state) {
        const { key, value, operation = 'set' } = effect;
        switch (operation) {
            case 'set':
                state[key] = value;
                break;
            case 'add':
                if (Array.isArray(state[key])) {
                    state[key] = [...state[key], value];
                }
                else {
                    state[key] = [value];
                }
                break;
            case 'remove':
                if (Array.isArray(state[key])) {
                    state[key] = state[key].filter((item) => item !== value);
                }
                break;
            case 'increment':
                state[key] = (state[key] || 0) + (value || 1);
                break;
            case 'decrement':
                state[key] = (state[key] || 0) - (value || 1);
                break;
        }
    }
    /**
     * Check if the goal is satisfied in the current state
     */
    isGoalSatisfied(state, goal) {
        return goal.conditions.every(condition => this.evaluatePrecondition(condition, state));
    }
    /**
     * Calculate heuristic distance to goal (for A* algorithm)
     */
    calculateHeuristic(state, goal) {
        let unsatisfiedConditions = 0;
        for (const condition of goal.conditions) {
            if (!this.evaluatePrecondition(condition, state)) {
                unsatisfiedConditions++;
            }
        }
        return unsatisfiedConditions;
    }
    /**
     * Generate a unique key for a world state (for closed set tracking)
     */
    getStateKey(state) {
        return JSON.stringify(Object.keys(state).sort().reduce((sorted, key) => {
            sorted[key] = state[key];
            return sorted;
        }, {}));
    }
    /**
     * Reconstruct the plan from the final search node
     */
    reconstructPlan(finalNode, goal) {
        const steps = [];
        let current = finalNode;
        while (current?.parent) {
            if (current.action) {
                steps.unshift({
                    action: current.action,
                    estimatedCost: current.action.cost,
                    expectedState: current.state
                });
            }
            current = current.parent;
        }
        return {
            id: `plan_${this.nextPlanId++}`,
            goal,
            steps,
            totalCost: finalNode.gCost,
            created: new Date(),
            status: 'pending'
        };
    }
    /**
     * Attempt to replan from current state
     */
    async replan(currentState, goal, availableActions, failedAtStep) {
        const replanContext = {
            currentState,
            goal,
            availableActions
        };
        return this.createPlan(replanContext);
    }
}
//# sourceMappingURL=planner.js.map