/**
 * Reinforcement learning optimizer for dynamic pricing
 * Supports Q-Learning, DQN, PPO, SARSA, and Actor-Critic
 */
import { MarketContext, RLAction, RLConfig } from './types';
export declare class RLOptimizer {
    private config;
    private qTable;
    private replayMemory;
    private policyNetwork;
    private valueNetwork;
    private actions;
    private step;
    constructor(config?: Partial<RLConfig>);
    /**
     * Initialize discrete price actions
     */
    private initializeActions;
    /**
     * Convert market context to RL state
     */
    private contextToState;
    /**
     * Convert state to string key for Q-table
     */
    private stateToKey;
    /**
     * Select action using epsilon-greedy policy
     */
    selectAction(context: MarketContext, explore?: boolean): RLAction;
    /**
     * Q-Learning action selection
     */
    private selectQLearningAction;
    /**
     * DQN action selection
     */
    private selectDQNAction;
    /**
     * Policy network action selection (PPO/Actor-Critic)
     */
    private selectPolicyAction;
    /**
     * Learn from experience
     */
    learn(context: MarketContext, action: RLAction, reward: number, nextContext: MarketContext): void;
    /**
     * Q-Learning update
     */
    private updateQLearning;
    /**
     * SARSA update
     */
    private updateSARSA;
    /**
     * DQN update with experience replay
     */
    private updateDQN;
    /**
     * PPO update
     */
    private updatePPO;
    /**
     * Actor-Critic update
     */
    private updateActorCritic;
    /**
     * Get performance metrics
     */
    getMetrics(): {
        epsilon: number;
        statesExplored: number;
        avgQValue: number;
        step: number;
    };
    /**
     * Export learned policy
     */
    exportPolicy(): Map<string, RLAction>;
}
//# sourceMappingURL=rl-optimizer.d.ts.map