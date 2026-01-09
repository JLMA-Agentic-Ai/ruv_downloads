/**
 * Regression Test Runner
 *
 * Orchestrates all regression tests and generates comprehensive reports.
 *
 * @module v3/testing/regression/regression-runner
 */
import { PerformanceBaseline } from './performance-baseline.js';
import { SecurityRegressionChecker } from './security-regression.js';
import { APIContractValidator } from './api-contract.js';
import { IntegrationRegressionSuite } from './integration-regression.js';
/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
    performanceTests: true,
    securityTests: true,
    contractTests: true,
    integrationTests: true,
    performanceThreshold: 10, // 10% degradation allowed
    baselinePath: './.regression-baselines',
    reportPath: './.regression-reports',
    failOnRegression: true,
    verbose: false,
};
/**
 * Regression Test Runner
 *
 * Coordinates all regression testing activities.
 */
export class RegressionTestRunner {
    config;
    performanceBaseline;
    securityChecker;
    contractValidator;
    integrationSuite;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.performanceBaseline = new PerformanceBaseline(this.config);
        this.securityChecker = new SecurityRegressionChecker();
        this.contractValidator = new APIContractValidator();
        this.integrationSuite = new IntegrationRegressionSuite();
    }
    /**
     * Run all configured regression tests
     */
    async runAll() {
        const startTime = Date.now();
        const results = [];
        const report = {
            timestamp: new Date(),
            duration: 0,
            passed: true,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            performance: { tested: false, results: [], regressions: [] },
            security: { tested: false, report: null, newVulnerabilities: [] },
            contract: { tested: false, results: [], breakingChanges: [] },
            integration: { tested: false, results: [], failures: [] },
            summary: '',
        };
        // Run performance tests
        if (this.config.performanceTests) {
            this.log('Running performance regression tests...');
            report.performance.tested = true;
            report.performance.results = await this.performanceBaseline.compare();
            report.performance.regressions = report.performance.results
                .filter((r) => r.regression && r.degradation > this.config.performanceThreshold)
                .map((r) => `${r.metric}: ${r.degradation.toFixed(1)}% degradation`);
            if (report.performance.regressions.length > 0) {
                report.passed = false;
            }
        }
        // Run security tests
        if (this.config.securityTests) {
            this.log('Running security regression tests...');
            report.security.tested = true;
            report.security.report = await this.securityChecker.check();
            report.security.newVulnerabilities = report.security.report?.newIssues || [];
            if (report.security.newVulnerabilities.length > 0) {
                report.passed = false;
            }
        }
        // Run contract tests
        if (this.config.contractTests) {
            this.log('Running API contract tests...');
            report.contract.tested = true;
            report.contract.results = await this.contractValidator.validateAll();
            report.contract.breakingChanges = report.contract.results
                .filter((r) => !r.valid && r.breaking)
                .map((r) => `${r.endpoint}: ${r.message}`);
            if (report.contract.breakingChanges.length > 0) {
                report.passed = false;
            }
        }
        // Run integration tests
        if (this.config.integrationTests) {
            this.log('Running integration regression tests...');
            report.integration.tested = true;
            report.integration.results = await this.integrationSuite.runAll();
            report.integration.failures = report.integration.results
                .filter((r) => !r.passed)
                .map((r) => `${r.name}: ${r.error}`);
            if (report.integration.failures.length > 0) {
                report.passed = false;
            }
        }
        // Calculate summary
        report.duration = Date.now() - startTime;
        report.totalTests =
            report.performance.results.length +
                (report.security.report?.checks.length || 0) +
                report.contract.results.length +
                report.integration.results.length;
        report.passedTests = report.totalTests - (report.performance.regressions.length +
            report.security.newVulnerabilities.length +
            report.contract.breakingChanges.length +
            report.integration.failures.length);
        report.failedTests = report.totalTests - report.passedTests;
        report.summary = this.generateSummary(report);
        return report;
    }
    /**
     * Run only performance regression tests
     */
    async runPerformance() {
        return this.performanceBaseline.compare();
    }
    /**
     * Run only security regression tests
     */
    async runSecurity() {
        return this.securityChecker.check();
    }
    /**
     * Run only API contract tests
     */
    async runContracts() {
        return this.contractValidator.validateAll();
    }
    /**
     * Run only integration tests
     */
    async runIntegration() {
        return this.integrationSuite.runAll();
    }
    /**
     * Update baselines with current values
     */
    async updateBaselines() {
        await this.performanceBaseline.captureBaseline();
        await this.contractValidator.captureContracts();
        this.log('Baselines updated successfully');
    }
    /**
     * Generate human-readable summary
     */
    generateSummary(report) {
        const lines = [
            '═══════════════════════════════════════════════════════════════',
            '                    REGRESSION TEST REPORT                      ',
            '═══════════════════════════════════════════════════════════════',
            '',
            `Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`,
            `Duration: ${report.duration}ms`,
            `Tests: ${report.passedTests}/${report.totalTests} passed`,
            '',
        ];
        if (report.performance.tested) {
            lines.push('📊 Performance:');
            if (report.performance.regressions.length === 0) {
                lines.push('   ✅ No performance regressions detected');
            }
            else {
                lines.push(`   ❌ ${report.performance.regressions.length} regressions:`);
                report.performance.regressions.forEach((r) => lines.push(`      - ${r}`));
            }
            lines.push('');
        }
        if (report.security.tested) {
            lines.push('🔒 Security:');
            if (report.security.newVulnerabilities.length === 0) {
                lines.push('   ✅ No new security vulnerabilities');
            }
            else {
                lines.push(`   ❌ ${report.security.newVulnerabilities.length} new vulnerabilities:`);
                report.security.newVulnerabilities.forEach((v) => lines.push(`      - ${v}`));
            }
            lines.push('');
        }
        if (report.contract.tested) {
            lines.push('📋 API Contracts:');
            if (report.contract.breakingChanges.length === 0) {
                lines.push('   ✅ No breaking changes detected');
            }
            else {
                lines.push(`   ❌ ${report.contract.breakingChanges.length} breaking changes:`);
                report.contract.breakingChanges.forEach((c) => lines.push(`      - ${c}`));
            }
            lines.push('');
        }
        if (report.integration.tested) {
            lines.push('🔗 Integration:');
            if (report.integration.failures.length === 0) {
                lines.push('   ✅ All integration tests passed');
            }
            else {
                lines.push(`   ❌ ${report.integration.failures.length} failures:`);
                report.integration.failures.forEach((f) => lines.push(`      - ${f}`));
            }
            lines.push('');
        }
        lines.push('═══════════════════════════════════════════════════════════════');
        return lines.join('\n');
    }
    /**
     * Log message if verbose mode is enabled
     */
    log(message) {
        if (this.config.verbose) {
            console.log(`[Regression] ${message}`);
        }
    }
}
//# sourceMappingURL=regression-runner.js.map