/**
 * Learning Agent
 * Autonomous agent for continuous system improvement
 * Target: 10%+ accuracy improvement per quarter
 */
import { BaseAgent, AgentTask, AgentResult } from '../base/agent';
import { Trajectory } from '@neural-trader/agentic-accounting-core';
import { Feedback } from '@neural-trader/agentic-accounting-core';
export interface LearningAgentConfig {
    agentId?: string;
    learningRate?: number;
    minSuccessRate?: number;
    feedbackThreshold?: number;
}
export interface LearningTaskData {
    action: 'train' | 'process_feedback' | 'analyze_performance' | 'optimize';
    agentId?: string;
    trajectory?: Trajectory;
    feedback?: Feedback;
    startDate?: Date;
    endDate?: Date;
}
export declare class LearningAgent extends BaseAgent {
    private reasoningBank;
    private feedbackLoop;
    private learningConfig;
    constructor(config?: LearningAgentConfig);
    /**
     * Execute learning task
     */
    execute(task: AgentTask): Promise<AgentResult>;
    /**
     * Train on agent trajectory
     */
    private trainOnTrajectory;
    /**
     * Process feedback and improve
     */
    private processFeedback;
    /**
     * Analyze agent performance
     */
    private analyzePerformance;
    /**
     * Optimize agent based on learned patterns
     */
    private optimizeAgent;
    /**
     * Extract patterns from trajectories
     */
    private extractPatterns;
    /**
     * Calculate improvement over time
     */
    private calculateImprovement;
    /**
     * Run overnight training batch
     */
    runBatchTraining(trajectories: Trajectory[]): Promise<any>;
    /**
     * Generate learning report
     */
    generateLearningReport(agentId: string, period: {
        start: Date;
        end: Date;
    }): Promise<any>;
}
//# sourceMappingURL=learning-agent.d.ts.map