/**
 * V2 Compatibility Report Generator
 *
 * Generates comprehensive markdown reports for V2 compatibility validation.
 * Provides detailed analysis of compatibility status, breaking changes, and migration recommendations.
 *
 * @module v3/testing/v2-compat/report-generator
 */
import { type FullValidationReport } from './compatibility-validator.js';
/**
 * Report generation options
 */
export interface ReportOptions {
    /** Include detailed check results */
    detailed: boolean;
    /** Include code examples */
    includeExamples: boolean;
    /** Include migration scripts */
    includeMigrationScripts: boolean;
    /** Output format */
    format: 'markdown' | 'json' | 'html';
}
/**
 * Generate a full compatibility report
 */
export declare function generateFullReport(options?: Partial<ReportOptions>): Promise<{
    report: FullValidationReport;
    markdown: string;
}>;
/**
 * Run validation and save report to file
 */
export declare function runAndSaveReport(outputPath: string): Promise<FullValidationReport>;
//# sourceMappingURL=report-generator.d.ts.map