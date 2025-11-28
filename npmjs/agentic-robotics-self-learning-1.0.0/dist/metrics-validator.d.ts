#!/usr/bin/env node
/**
 * Metrics Validator
 * Validates all hooks and metrics before, during, and after execution
 */
declare class MetricsValidator {
    private results;
    private sessionId;
    constructor();
    private ensureDirectories;
    private addResult;
    validateSettings(): Promise<void>;
    validateHooks(): Promise<void>;
    private testHook;
    validateMemoryBank(): Promise<void>;
    validateMetricsSystem(): Promise<void>;
    validateDataDirectories(): Promise<void>;
    validateDependencies(): Promise<void>;
    private generateReport;
    private saveResults;
    validate(): Promise<boolean>;
}
export { MetricsValidator };
//# sourceMappingURL=metrics-validator.d.ts.map