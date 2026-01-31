/**
 * Exit codes for CLI operations
 */
export declare enum ExitCode {
    SUCCESS = 0,
    GENERAL_ERROR = 1,
    INVALID_ARGUMENTS = 2,
    FILE_NOT_FOUND = 3,
    PERMISSION_DENIED = 4,
    TIMEOUT = 5,
    FORMAT_ERROR = 6,
    CONFIGURATION_ERROR = 64,
    INTERNAL_ERROR = 128
}
/**
 * CLI Error class with structured error information
 */
export declare class CLIError extends Error {
    readonly code: ExitCode;
    readonly context?: string | undefined;
    readonly suggestion?: string | undefined;
    readonly details?: Record<string, any> | undefined;
    constructor(message: string, code?: ExitCode, context?: string | undefined, suggestion?: string | undefined, details?: Record<string, any> | undefined);
    /**
     * Convert to JSON-serializable format
     */
    toJSON(): Record<string, any>;
}
/**
 * Create error for invalid arguments
 */
export declare function invalidArgumentsError(message: string, suggestion?: string): CLIError;
/**
 * Create error for file not found
 */
export declare function fileNotFoundError(filePath: string, suggestion?: string): CLIError;
/**
 * Create error for permission denied
 */
export declare function permissionDeniedError(resource: string, suggestion?: string): CLIError;
/**
 * Create error for timeout
 */
export declare function timeoutError(operation: string, timeoutMs: number, suggestion?: string): CLIError;
/**
 * Create error for format errors
 */
export declare function formatError(format: string, message: string, suggestion?: string): CLIError;
/**
 * Create error for configuration errors
 */
export declare function configurationError(message: string, suggestion?: string): CLIError;
/**
 * Create error for internal errors
 */
export declare function internalError(message: string, details?: Record<string, any>): CLIError;
/**
 * Handle error and exit process
 */
export declare function handleError(error: unknown, verbose?: boolean): never;
/**
 * Wrap async function with error handling
 */
export declare function withErrorHandling<T extends (...args: any[]) => Promise<any>>(fn: T, verbose?: boolean): T;
//# sourceMappingURL=errors.d.ts.map