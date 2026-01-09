/**
 * V2 Compatibility Testing Module
 *
 * Provides validation framework for testing V3 against V2 capabilities.
 * Ensures backward compatibility for CLI commands, MCP tools, hooks, and API interfaces.
 *
 * @module v3/testing/v2-compat
 *
 * @example
 * ```typescript
 * import {
 *   V2CompatibilityValidator,
 *   generateCompatibilityReport,
 *   V2_CLI_COMMANDS,
 *   V2_MCP_TOOLS,
 *   V2_HOOKS,
 *   V2_API_INTERFACES
 * } from '@claude-flow/testing/v2-compat';
 *
 * // Run full validation
 * const validator = new V2CompatibilityValidator({ verbose: true });
 * const report = await validator.runFullValidation();
 *
 * // Generate markdown report
 * const markdown = generateCompatibilityReport(report);
 * console.log(markdown);
 *
 * // Access individual validation results
 * console.log(`CLI: ${report.cli.passedChecks}/${report.cli.totalChecks} passed`);
 * console.log(`MCP: ${report.mcp.passedChecks}/${report.mcp.totalChecks} passed`);
 * console.log(`Hooks: ${report.hooks.passedChecks}/${report.hooks.totalChecks} passed`);
 * console.log(`API: ${report.api.passedChecks}/${report.api.totalChecks} passed`);
 * ```
 */
export { V2CompatibilityValidator, generateCompatibilityReport, type ValidationCheck, type ValidationResult, type FullValidationReport, } from './compatibility-validator.js';
export { V2_CLI_COMMANDS, V2_MCP_TOOLS, V2_HOOKS, V2_API_INTERFACES, type V2CLICommand, type V2MCPTool, type V2Hook, type V2APIInterface, } from './compatibility-validator.js';
export { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
//# sourceMappingURL=index.d.ts.map