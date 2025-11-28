/**
 * @neural-trader/example-healthcare-optimization
 *
 * Healthcare optimization with self-learning patient forecasting and swarm-based staff scheduling.
 * Features:
 * - Patient arrival forecasting with uncertainty quantification
 * - Queue theory optimization for patient flow
 * - Staff scheduling with skill constraints
 * - Swarm intelligence for exploring scheduling heuristics
 * - Memory-persistent hospital metrics
 * - Privacy-preserving (synthetic data only)
 */
import type { HealthcareOptimizationConfig, Patient, StaffMember, OptimizationResult, ResourcePool, TriageDecision } from './types.js';
export declare class HealthcareOptimizer {
    private config;
    private forecaster;
    private scheduler;
    private queueOptimizer;
    private swarm;
    private memory;
    private openai?;
    constructor(config: HealthcareOptimizationConfig);
    /**
     * Train forecaster with historical data
     */
    trainForecaster(historicalData: Array<{
        timestamp: Date;
        arrivals: number;
    }>): Promise<void>;
    /**
     * Add staff member
     */
    addStaff(staff: StaffMember): void;
    /**
     * Add resource pool for queue management
     */
    addResourcePool(pool: ResourcePool): void;
    /**
     * Run full optimization workflow
     */
    optimize(startDate?: Date): Promise<OptimizationResult>;
    /**
     * Triage patient using OpenRouter AI
     */
    triagePatient(patient: Pick<Patient, 'chiefComplaint'>): Promise<TriageDecision>;
    /**
     * Rule-based triage fallback
     */
    private ruleBasedTriage;
    /**
     * Simulate queue performance
     */
    private simulateQueue;
    /**
     * Calculate overall quality score
     */
    private calculateQualityScore;
    /**
     * Store optimization results
     */
    private storeResults;
    /**
     * Get historical performance
     */
    getPerformanceHistory(): Promise<any>;
    /**
     * Update with actual outcomes for learning
     */
    updateWithActuals(timestamp: Date, actualArrivals: number, actualWaitTime: number): Promise<void>;
}
export * from './types.js';
export { ArrivalForecaster } from './arrival-forecaster.js';
export { Scheduler } from './scheduler.js';
export { QueueOptimizer } from './queue-optimizer.js';
export { SwarmCoordinator } from './swarm.js';
//# sourceMappingURL=index.d.ts.map