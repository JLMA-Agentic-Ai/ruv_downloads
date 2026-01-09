/**
 * Security Regression Checker
 *
 * Detects new security vulnerabilities and regressions.
 *
 * @module v3/testing/regression/security-regression
 */
/**
 * Security check definition
 */
export interface SecurityCheck {
    id: string;
    name: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    passed: boolean;
    message: string;
    location?: string;
    line?: number;
}
/**
 * Security vulnerability
 */
export interface SecurityVulnerability {
    id: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    file: string;
    line: number;
    description: string;
    recommendation: string;
    cwe?: string;
}
/**
 * Security report
 */
export interface SecurityReport {
    timestamp: Date;
    duration: number;
    passed: boolean;
    checks: SecurityCheck[];
    vulnerabilities: SecurityVulnerability[];
    newIssues: string[];
    resolvedIssues: string[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}
/**
 * Security Regression Checker
 *
 * Scans codebase for security vulnerabilities.
 */
export declare class SecurityRegressionChecker {
    private readonly basePath;
    constructor(basePath?: string);
    /**
     * Run full security check
     */
    check(): Promise<SecurityReport>;
    /**
     * Find all scannable files
     */
    private findFiles;
    /**
     * Scan a single file for vulnerabilities
     */
    private scanFile;
}
//# sourceMappingURL=security-regression.d.ts.map