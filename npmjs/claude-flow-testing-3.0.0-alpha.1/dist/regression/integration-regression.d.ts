/**
 * Integration Regression Suite
 *
 * Validates critical integration paths work correctly.
 *
 * @module v3/testing/regression/integration-regression
 */
/**
 * Integration test definition
 */
export interface IntegrationTest {
    name: string;
    description: string;
    category: 'memory' | 'swarm' | 'mcp' | 'hooks' | 'events';
    critical: boolean;
    timeout: number;
    run: () => Promise<boolean>;
}
/**
 * Integration test result
 */
export interface IntegrationResult {
    name: string;
    category: string;
    passed: boolean;
    duration: number;
    error?: string;
    details?: Record<string, unknown>;
}
/**
 * Integration Regression Suite
 *
 * Runs critical integration tests to catch regressions.
 */
export declare class IntegrationRegressionSuite {
    private readonly tests;
    constructor();
    /**
     * Run all integration tests
     */
    runAll(): Promise<IntegrationResult[]>;
    /**
     * Run tests by category
     */
    runCategory(category: IntegrationTest['category']): Promise<IntegrationResult[]>;
    /**
     * Run critical tests only
     */
    runCritical(): Promise<IntegrationResult[]>;
    /**
     * Run a single test
     */
    private runTest;
    /**
     * Register default integration tests
     */
    private registerDefaultTests;
    /**
     * Add a custom test
     */
    addTest(test: IntegrationTest): void;
    /**
     * Get all registered tests
     */
    getTests(): IntegrationTest[];
}
//# sourceMappingURL=integration-regression.d.ts.map