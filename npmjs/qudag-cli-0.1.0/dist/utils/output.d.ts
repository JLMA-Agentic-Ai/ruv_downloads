export type OutputFormat = 'json' | 'yaml' | 'text' | 'binary';
export interface OutputOptions {
    format: OutputFormat;
    noColor?: boolean;
    pretty?: boolean;
}
/**
 * Format and output data to console
 */
export declare function formatOutput(data: any, options: OutputOptions): string;
/**
 * Print success message
 */
export declare function printSuccess(message: string, noColor?: boolean): void;
/**
 * Print error message
 */
export declare function printError(message: string, noColor?: boolean): void;
/**
 * Print warning message
 */
export declare function printWarning(message: string, noColor?: boolean): void;
/**
 * Print info message
 */
export declare function printInfo(message: string, noColor?: boolean): void;
//# sourceMappingURL=output.d.ts.map