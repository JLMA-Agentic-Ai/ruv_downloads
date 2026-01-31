/**
 * Self-learning system for logistics optimization
 * Uses AgentDB for pattern storage and adaptive learning
 */
import { Solution, TrafficPattern, LearningMetrics, Customer } from './types';
export interface MemoryEntry {
    id: string;
    timestamp: number;
    solution: Solution;
    metrics: LearningMetrics;
    context: {
        numCustomers: number;
        numVehicles: number;
        avgDemand: number;
        timeOfDay: number;
        dayOfWeek: number;
    };
}
export declare class SelfLearningSystem {
    private memoryStore;
    private trafficPatterns;
    private episodeHistory;
    private learningRate;
    constructor(learningRate?: number);
    /**
     * Store solution and learn from it
     */
    learnFromSolution(solution: Solution, customers: Customer[], metrics: LearningMetrics): Promise<void>;
    /**
     * Update traffic patterns based on route performance
     */
    private updateTrafficPatterns;
    /**
     * Retrieve similar past solutions
     */
    retrieveSimilarSolutions(numCustomers: number, numVehicles: number, topK?: number): Promise<MemoryEntry[]>;
    /**
     * Calculate context similarity
     */
    private calculateContextSimilarity;
    /**
     * Get traffic prediction for a route segment
     */
    getTrafficPrediction(fromLocationId: string, toLocationId: string, timeOfDay: number, dayOfWeek: number): TrafficPattern | null;
    /**
     * Get learning statistics
     */
    getStatistics(): {
        totalEpisodes: number;
        avgSolutionQuality: number;
        avgComputeTime: number;
        improvementRate: number;
        trafficPatternsLearned: number;
    };
    /**
     * Prune old or low-quality memories
     */
    private pruneMemories;
    /**
     * Export learned patterns
     */
    exportPatterns(): {
        trafficPatterns: TrafficPattern[];
        topSolutions: Solution[];
        statistics: any;
    };
    /**
     * Import learned patterns
     */
    importPatterns(data: {
        trafficPatterns: TrafficPattern[];
        topSolutions?: Solution[];
    }): void;
    /**
     * Reset learning state
     */
    reset(): void;
}
//# sourceMappingURL=self-learning.d.ts.map