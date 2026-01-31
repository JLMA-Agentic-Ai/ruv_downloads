#!/usr/bin/env node
/**
 * Master Orchestrator
 * Integrates all self-learning components with comprehensive validation and optimization
 */
declare class MasterOrchestrator {
    private sessionId;
    private startTime;
    private phases;
    private results;
    constructor();
    private ensureDirectories;
    private definePhases;
    private executePhase;
    private validateBetweenPhases;
    private generateFinalReport;
    private saveResults;
    orchestrate(): Promise<void>;
}
export { MasterOrchestrator };
//# sourceMappingURL=master-orchestrator.d.ts.map