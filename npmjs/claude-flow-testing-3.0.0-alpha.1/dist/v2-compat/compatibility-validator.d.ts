/**
 * V2 Compatibility Validator
 *
 * Validates that V3 implementation maintains backward compatibility with V2 capabilities.
 * Tests CLI commands, MCP tools, hooks, and API interfaces.
 *
 * @module v3/testing/v2-compat/compatibility-validator
 */
/**
 * Validation result for a single check
 */
export interface ValidationCheck {
    name: string;
    category: 'cli' | 'mcp' | 'hooks' | 'api';
    passed: boolean;
    message: string;
    v2Behavior: string;
    v3Behavior: string;
    breaking: boolean;
    migrationPath?: string;
    details?: Record<string, unknown>;
}
/**
 * Validation result for a category
 */
export interface ValidationResult {
    category: 'cli' | 'mcp' | 'hooks' | 'api';
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    breakingChanges: number;
    checks: ValidationCheck[];
    duration: number;
}
/**
 * Full validation report
 */
export interface FullValidationReport {
    timestamp: Date;
    v2Version: string;
    v3Version: string;
    overallPassed: boolean;
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    breakingChanges: number;
    cli: ValidationResult;
    mcp: ValidationResult;
    hooks: ValidationResult;
    api: ValidationResult;
    summary: string;
    recommendations: string[];
    duration: number;
}
/**
 * V2 CLI command definition
 */
export interface V2CLICommand {
    name: string;
    aliases: string[];
    flags: string[];
    description: string;
    v3Equivalent?: string;
    deprecated?: boolean;
}
/**
 * V2 MCP tool definition
 */
export interface V2MCPTool {
    name: string;
    parameters: Record<string, {
        type: string;
        required: boolean;
    }>;
    returnType: string;
    v3Equivalent?: string;
    deprecated?: boolean;
}
/**
 * V2 hook definition
 */
export interface V2Hook {
    name: string;
    trigger: string;
    parameters: string[];
    returnType: string;
    v3Equivalent?: string;
    deprecated?: boolean;
}
/**
 * V2 API interface definition
 */
export interface V2APIInterface {
    name: string;
    methods: {
        name: string;
        signature: string;
    }[];
    v3Equivalent?: string;
    deprecated?: boolean;
}
/**
 * V2 CLI Commands (25 total)
 */
export declare const V2_CLI_COMMANDS: V2CLICommand[];
/**
 * V2 MCP Tools (65 total - showing key ones)
 */
export declare const V2_MCP_TOOLS: V2MCPTool[];
/**
 * V2 Hooks (42 total)
 */
export declare const V2_HOOKS: V2Hook[];
/**
 * V2 API Interfaces
 */
export declare const V2_API_INTERFACES: V2APIInterface[];
/**
 * Mock V3 service for testing
 */
interface MockV3Service {
    cli: {
        execute: (command: string, args: string[]) => Promise<{
            success: boolean;
            output: string;
        }>;
        getCommands: () => string[];
    };
    mcp: {
        callTool: (name: string, params: Record<string, unknown>) => Promise<unknown>;
        getTools: () => string[];
        translateToolName: (v2Name: string) => string;
    };
    hooks: {
        trigger: (name: string, params: Record<string, unknown>) => Promise<{
            handled: boolean;
            result: unknown;
        }>;
        getHooks: () => string[];
    };
    api: {
        getClass: (name: string) => {
            methods: string[];
        } | null;
        getClasses: () => string[];
    };
}
/**
 * V2 Compatibility Validator
 *
 * Tests V3 implementation against V2 capabilities to ensure backward compatibility.
 */
export declare class V2CompatibilityValidator {
    private readonly v3Service;
    private readonly v2Version;
    private readonly v3Version;
    private readonly verbose;
    constructor(options?: {
        v3Service?: MockV3Service;
        v2Version?: string;
        v3Version?: string;
        verbose?: boolean;
    });
    /**
     * Create default mock V3 service for testing
     */
    private createDefaultMockService;
    /**
     * Validate CLI command compatibility
     */
    validateCLI(): Promise<ValidationResult>;
    /**
     * Validate MCP tool compatibility
     */
    validateMCPTools(): Promise<ValidationResult>;
    /**
     * Validate hook compatibility
     */
    validateHooks(): Promise<ValidationResult>;
    /**
     * Validate API compatibility
     */
    validateAPI(): Promise<ValidationResult>;
    /**
     * Run full validation suite
     */
    runFullValidation(): Promise<FullValidationReport>;
    /**
     * Generate recommendations based on results
     */
    private generateRecommendations;
    /**
     * Generate human-readable summary
     */
    private generateSummary;
    /**
     * Log message if verbose mode is enabled
     */
    private log;
}
/**
 * Generate markdown compatibility report
 */
export declare function generateCompatibilityReport(report: FullValidationReport): string;
export {};
//# sourceMappingURL=compatibility-validator.d.ts.map