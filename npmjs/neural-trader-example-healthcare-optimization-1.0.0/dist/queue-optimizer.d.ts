/**
 * Queue Optimizer
 *
 * Queue theory-based optimization for patient flow and resource allocation.
 * Implements M/M/c and M/G/c models with dynamic resource adjustment.
 */
import type { Patient, QueueState, QueueMetrics, ResourcePool, OptimizationObjective } from './types.js';
export interface QueueOptimizerConfig {
    targetUtilization: number;
    maxWaitTime: number;
    abandonmentThreshold: number;
    reallocateInterval: number;
}
export declare class QueueOptimizer {
    private config;
    private state;
    private metricsHistory;
    constructor(config: QueueOptimizerConfig);
    /**
     * Add patient to queue with priority
     */
    addPatient(patient: Patient): void;
    /**
     * Process next patient from queue
     */
    processNextPatient(resourceId: string): Patient | null;
    /**
     * Complete patient service
     */
    completeService(patientId: string, resourceId: string): void;
    /**
     * Add resource pool
     */
    addResourcePool(pool: ResourcePool): void;
    /**
     * Optimize resource allocation based on queue state
     */
    optimizeResources(objective: OptimizationObjective): {
        recommendations: Array<{
            resourceId: string;
            action: 'increase' | 'decrease' | 'maintain';
            amount: number;
            reason: string;
        }>;
        expectedImpact: {
            waitTimeReduction: number;
            utilizationChange: number;
            costChange: number;
        };
    };
    /**
     * Calculate optimal resource capacity using M/M/c model
     */
    private calculateOptimalCapacity;
    /**
     * Erlang C formula for wait time calculation
     */
    private erlangCWaitTime;
    /**
     * Erlang C probability calculation
     */
    private erlangCProbability;
    /**
     * Factorial helper
     */
    private factorial;
    /**
     * Estimate arrival rate from recent data
     */
    private estimateArrivalRate;
    /**
     * Estimate service time from patients
     */
    private estimateServiceTime;
    /**
     * Estimate impact of resource changes
     */
    private estimateImpact;
    /**
     * Get total resource capacity
     */
    private getTotalCapacity;
    /**
     * Update queue metrics
     */
    private updateMetrics;
    /**
     * Get current queue state
     */
    getState(): QueueState;
    /**
     * Get metrics history
     */
    getMetricsHistory(): QueueMetrics[];
    /**
     * Create empty metrics object
     */
    private emptyMetrics;
}
//# sourceMappingURL=queue-optimizer.d.ts.map