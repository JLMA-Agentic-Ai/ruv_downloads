/**
 * Feedback Loop System
 * Process feedback and improve agent performance
 */
export interface Feedback {
    id: string;
    agentId: string;
    taskId: string;
    rating: number;
    comments?: string;
    metrics?: {
        accuracy?: number;
        speed?: number;
        quality?: number;
    };
    timestamp: Date;
}
export interface PerformanceMetrics {
    agentId: string;
    period: {
        start: Date;
        end: Date;
    };
    averageRating: number;
    totalFeedback: number;
    accuracyTrend: number[];
    speedTrend: number[];
    qualityTrend: number[];
}
export declare class FeedbackLoopService {
    private feedbackStore;
    /**
     * Process feedback for an agent
     */
    processFeedback(feedback: Feedback): Promise<void>;
    /**
     * Analyze feedback patterns
     */
    private analyzeFeedback;
    /**
     * Trigger performance improvement
     */
    private triggerImprovement;
    /**
     * Get performance metrics for agent
     */
    getPerformanceMetrics(agentId: string, startDate: Date, endDate: Date): Promise<PerformanceMetrics>;
    /**
     * Generate improvement recommendations
     */
    generateRecommendations(agentId: string): Promise<string[]>;
    /**
     * Batch process feedback
     */
    processBatch(feedbackList: Feedback[]): Promise<void>;
    /**
     * Get all feedback for agent
     */
    getFeedback(agentId: string): Feedback[];
    /**
     * Clear feedback history
     */
    clearFeedback(agentId?: string): void;
}
//# sourceMappingURL=feedback.d.ts.map