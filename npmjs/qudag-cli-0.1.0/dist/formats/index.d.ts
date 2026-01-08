export type DataFormat = 'json' | 'yaml' | 'jsonl' | 'binary';
/**
 * Detect format from file extension
 */
export declare function detectFormat(filePath: string): DataFormat;
/**
 * Load data from file with format detection
 */
export declare function loadData(filePath: string, format?: DataFormat): Promise<any>;
/**
 * Save data to file with specified format
 */
export declare function saveData(data: any, filePath: string, format?: DataFormat): Promise<void>;
/**
 * Convert between formats
 */
export declare function convertFormat(inputPath: string, outputPath: string, inputFormat?: DataFormat, outputFormat?: DataFormat): Promise<void>;
/**
 * Stream JSONL data (for large files)
 */
export declare function streamJSONL(filePath: string): AsyncGenerator<any>;
//# sourceMappingURL=index.d.ts.map