#!/usr/bin/env node
/**
 * Integration Adapter
 * Integrates existing examples with self-learning optimization system
 */
declare class IntegrationAdapter {
    private tasks;
    private results;
    constructor();
    private discoverExamples;
    private runExampleWithLearning;
    private extractMetrics;
    private extractLearnings;
    private optimizeExample;
    private saveIntegrationReport;
    integrate(runOptimization?: boolean): Promise<void>;
}
export { IntegrationAdapter };
//# sourceMappingURL=integration-adapter.d.ts.map