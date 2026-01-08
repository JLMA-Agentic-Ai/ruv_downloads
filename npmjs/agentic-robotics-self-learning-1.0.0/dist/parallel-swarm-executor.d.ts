#!/usr/bin/env node
/**
 * Parallel Swarm Execution Framework
 * Manages concurrent swarm execution with resource optimization
 */
import { EventEmitter } from 'events';
interface SwarmTask {
    id: string;
    type: string;
    config: any;
    priority: number;
    dependencies?: string[];
}
declare class ParallelSwarmExecutor extends EventEmitter {
    private executions;
    private maxConcurrent;
    private runningCount;
    private completedCount;
    private failedCount;
    private startTime;
    private metricsInterval;
    constructor(maxConcurrent?: number);
    private ensureDirectories;
    addTask(task: SwarmTask): void;
    private canExecute;
    private executeTask;
    private runSwarm;
    private checkAndScheduleNext;
    private getPendingCount;
    private getMetrics;
    private startMetricsMonitoring;
    private stopMetricsMonitoring;
    private saveResults;
    execute(): Promise<void>;
}
export { ParallelSwarmExecutor, SwarmTask };
//# sourceMappingURL=parallel-swarm-executor.d.ts.map