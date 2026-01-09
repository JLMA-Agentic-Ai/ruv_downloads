/**
 * API Contract Validator
 *
 * Validates MCP tool interfaces to detect breaking changes.
 *
 * @module v3/testing/regression/api-contract
 */
/**
 * Contract definition for a tool or endpoint
 */
export interface ContractDefinition {
    name: string;
    version: string;
    description: string;
    input: ParameterSchema;
    output: ParameterSchema;
    required: string[];
    optional: string[];
    errors: ErrorDefinition[];
}
/**
 * Parameter schema definition
 */
interface ParameterSchema {
    type: string;
    properties?: Record<string, PropertyDefinition>;
    items?: PropertyDefinition;
    required?: string[];
}
/**
 * Property definition
 */
interface PropertyDefinition {
    type: string;
    description?: string;
    enum?: string[];
    default?: unknown;
    properties?: Record<string, PropertyDefinition>;
    items?: PropertyDefinition;
}
/**
 * Error definition
 */
interface ErrorDefinition {
    code: number;
    message: string;
    description: string;
}
/**
 * Contract validation result
 */
export interface ContractValidation {
    endpoint: string;
    valid: boolean;
    breaking: boolean;
    message: string;
    diffs: ContractDiff[];
}
/**
 * Contract difference
 */
export interface ContractDiff {
    type: 'added' | 'removed' | 'changed' | 'deprecated';
    path: string;
    description: string;
    breaking: boolean;
    oldValue?: unknown;
    newValue?: unknown;
}
/**
 * Stored contracts
 */
interface StoredContracts {
    version: string;
    capturedAt: number;
    contracts: ContractDefinition[];
}
/**
 * API Contract Validator
 *
 * Validates MCP tool contracts for breaking changes.
 */
export declare class APIContractValidator {
    private readonly contractPath;
    private cachedContracts;
    constructor(basePath?: string);
    /**
     * Capture current contracts as baseline
     */
    captureContracts(): Promise<StoredContracts>;
    /**
     * Validate all contracts against baseline
     */
    validateAll(): Promise<ContractValidation[]>;
    /**
     * Compare two contracts for differences
     */
    private compareContracts;
    /**
     * Load contracts from file
     */
    private loadContracts;
    /**
     * Save contracts to file
     */
    private saveContracts;
}
export {};
//# sourceMappingURL=api-contract.d.ts.map