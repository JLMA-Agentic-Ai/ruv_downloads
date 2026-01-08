"use strict";
/**
 * Feedback Loop System
 * Process feedback and improve agent performance
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackLoopService = void 0;
const logger_1 = require("../utils/logger");
class FeedbackLoopService {
    feedbackStore = new Map();
    /**
     * Process feedback for an agent
     */
    async processFeedback(feedback) {
        logger_1.logger.info('Processing feedback', {
            agentId: feedback.agentId,
            rating: feedback.rating
        });
        // Store feedback
        const agentFeedback = this.feedbackStore.get(feedback.agentId) || [];
        agentFeedback.push(feedback);
        this.feedbackStore.set(feedback.agentId, agentFeedback);
        // Analyze feedback
        await this.analyzeFeedback(feedback);
        // Trigger improvements if needed
        if (feedback.rating < 0.5) {
            await this.triggerImprovement(feedback);
        }
    }
    /**
     * Analyze feedback patterns
     */
    async analyzeFeedback(feedback) {
        const agentFeedback = this.feedbackStore.get(feedback.agentId) || [];
        // Calculate trends
        const recentFeedback = agentFeedback.slice(-10);
        const averageRating = recentFeedback.reduce((sum, f) => sum + f.rating, 0) / recentFeedback.length;
        logger_1.logger.debug('Feedback analysis', {
            agentId: feedback.agentId,
            recentCount: recentFeedback.length,
            averageRating
        });
        // Detect degradation
        if (averageRating < 0.6) {
            logger_1.logger.warn('Agent performance degradation detected', {
                agentId: feedback.agentId,
                averageRating
            });
        }
    }
    /**
     * Trigger performance improvement
     */
    async triggerImprovement(feedback) {
        logger_1.logger.info('Triggering performance improvement', {
            agentId: feedback.agentId,
            rating: feedback.rating
        });
        // In production, this would:
        // 1. Analyze failure patterns
        // 2. Adjust agent parameters
        // 3. Trigger retraining
        // 4. Update decision thresholds
    }
    /**
     * Get performance metrics for agent
     */
    async getPerformanceMetrics(agentId, startDate, endDate) {
        const agentFeedback = this.feedbackStore.get(agentId) || [];
        // Filter by date range
        const periodFeedback = agentFeedback.filter(f => f.timestamp >= startDate && f.timestamp <= endDate);
        // Calculate metrics
        const averageRating = periodFeedback.reduce((sum, f) => sum + f.rating, 0) / periodFeedback.length || 0;
        const accuracyTrend = periodFeedback.map(f => f.metrics?.accuracy || 0);
        const speedTrend = periodFeedback.map(f => f.metrics?.speed || 0);
        const qualityTrend = periodFeedback.map(f => f.metrics?.quality || 0);
        return {
            agentId,
            period: { start: startDate, end: endDate },
            averageRating,
            totalFeedback: periodFeedback.length,
            accuracyTrend,
            speedTrend,
            qualityTrend
        };
    }
    /**
     * Generate improvement recommendations
     */
    async generateRecommendations(agentId) {
        const agentFeedback = this.feedbackStore.get(agentId) || [];
        const recommendations = [];
        if (agentFeedback.length === 0) {
            return ['Insufficient feedback data for recommendations'];
        }
        const recentFeedback = agentFeedback.slice(-20);
        const averageRating = recentFeedback.reduce((sum, f) => sum + f.rating, 0) / recentFeedback.length;
        // Analyze patterns and generate recommendations
        if (averageRating < 0.7) {
            recommendations.push('Review and improve decision-making algorithms');
            recommendations.push('Increase training data quality');
        }
        const lowAccuracy = recentFeedback.filter(f => (f.metrics?.accuracy || 1) < 0.8).length;
        if (lowAccuracy > recentFeedback.length * 0.3) {
            recommendations.push('Focus on improving calculation accuracy');
            recommendations.push('Add more validation checks');
        }
        const slowSpeed = recentFeedback.filter(f => (f.metrics?.speed || 1) < 0.7).length;
        if (slowSpeed > recentFeedback.length * 0.3) {
            recommendations.push('Optimize performance bottlenecks');
            recommendations.push('Consider caching frequently used data');
        }
        return recommendations;
    }
    /**
     * Batch process feedback
     */
    async processBatch(feedbackList) {
        await Promise.all(feedbackList.map(f => this.processFeedback(f)));
    }
    /**
     * Get all feedback for agent
     */
    getFeedback(agentId) {
        return this.feedbackStore.get(agentId) || [];
    }
    /**
     * Clear feedback history
     */
    clearFeedback(agentId) {
        if (agentId) {
            this.feedbackStore.delete(agentId);
        }
        else {
            this.feedbackStore.clear();
        }
        logger_1.logger.info('Feedback history cleared', { agentId });
    }
}
exports.FeedbackLoopService = FeedbackLoopService;
//# sourceMappingURL=feedback.js.map