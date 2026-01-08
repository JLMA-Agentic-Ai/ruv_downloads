#!/usr/bin/env node
/**
 * Performance Monitor
 * Real-time monitoring of optimization performance with metrics tracking
 */
import { EventEmitter } from 'events';
declare class PerformanceMonitor extends EventEmitter {
    private metrics;
    private snapshots;
    private monitoringInterval;
    private dataPath;
    constructor();
    start(): void;
    stop(): void;
    private collectSnapshot;
    private getSwarmStatus;
    private getOptimizationStatus;
    private watchOptimizationFiles;
    private printSnapshot;
    private saveReport;
    private calculateSummary;
}
export { PerformanceMonitor };
//# sourceMappingURL=performance-monitor.d.ts.map