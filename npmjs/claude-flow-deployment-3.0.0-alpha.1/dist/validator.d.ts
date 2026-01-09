/**
 * Pre-Release Validator
 * Validates package before release (lint, test, build, dependencies)
 */
import type { ValidationOptions, ValidationResult } from './types.js';
export declare class Validator {
    private cwd;
    constructor(cwd?: string);
    /**
     * Run all validation checks
     */
    validate(options?: ValidationOptions): Promise<ValidationResult>;
    /**
     * Validate package.json structure and required fields
     */
    private validatePackageJson;
    /**
     * Check git status for uncommitted changes
     */
    private checkGitStatus;
    /**
     * Check for dependency issues
     */
    private checkDependencies;
    /**
     * Run linter
     */
    private runLint;
    /**
     * Run tests
     */
    private runTests;
    /**
     * Run build
     */
    private runBuild;
    /**
     * Execute command
     */
    private execCommand;
}
/**
 * Convenience function to validate package
 */
export declare function validate(options?: ValidationOptions): Promise<ValidationResult>;
//# sourceMappingURL=validator.d.ts.map