/**
 * Regression Test Runner
 *
 * Orchestrates all regression tests and generates comprehensive reports.
 *
 * @module v3/testing/regression/regression-runner
 */
import { type BaselineComparison } from './performance-baseline.js';
import { type SecurityReport } from './security-regression.js';
import { type ContractValidation } from './api-contract.js';
import { type IntegrationResult } from './integration-regression.js';
/**
 * Regression test configuration
 */
export interface RegressionConfig {
    /** Enable performance regression tests */
    performanceTests: boolean;
    /** Enable security regression tests */
    securityTests: boolean;
    /** Enable API contract tests */
    contractTests: boolean;
    /** Enable integration tests */
    integrationTests: boolean;
    /** Performance threshold (percentage allowed degradation) */
    performanceThreshold: number;
    /** Path to baseline data */
    baselinePath: string;
    /** Output path for reports */
    reportPath: string;
    /** Fail on any regression */
    failOnRegression: boolean;
    /** Verbose output */
    verbose: boolean;
}
/**
 * Individual test result
 */
export interface RegressionResult {
    category: 'performance' | 'security' | 'contract' | 'integration';
    name: string;
    passed: boolean;
    message: string;
    details?: Record<string, unknown>;
    duration: number;
}
/**
 * Complete regression report
 */
export interface RegressionReport {
    timestamp: Date;
    duration: number;
    passed: boolean;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    performance: {
        tested: boolean;
        results: BaselineComparison[];
        regressions: string[];
    };
    security: {
        tested: boolean;
        report: SecurityReport | null;
        newVulnerabilities: string[];
    };
    contract: {
        tested: boolean;
        results: ContractValidation[];
        breakingChanges: string[];
    };
    integration: {
        tested: boolean;
        results: IntegrationResult[];
        failures: string[];
    };
    summary: string;
}
/**
 * Regression Test Runner
 *
 * Coordinates all regression testing activities.
 */
export declare class RegressionTestRunner {
    private readonly config;
    private readonly performanceBaseline;
    private readonly securityChecker;
    private readonly contractValidator;
    private readonly integrationSuite;
    constructor(config?: Partial<RegressionConfig>);
    /**
     * Run all configured regression tests
     */
    runAll(): Promise<RegressionReport>;
    /**
     * Run only performance regression tests
     */
    runPerformance(): Promise<BaselineComparison[]>;
    /**
     * Run only security regression tests
     */
    runSecurity(): Promise<SecurityReport>;
    /**
     * Run only API contract tests
     */
    runContracts(): Promise<ContractValidation[]>;
    /**
     * Run only integration tests
     */
    runIntegration(): Promise<IntegrationResult[]>;
    /**
     * Update baselines with current values
     */
    updateBaselines(): Promise<void>;
    /**
     * Generate human-readable summary
     */
    private generateSummary;
    /**
     * Log message if verbose mode is enabled
     */
    private log;
}
//# sourceMappingURL=regression-runner.d.ts.map