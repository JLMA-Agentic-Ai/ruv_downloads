/**
 * Output Manager for handling pagination and file exports
 */
export interface PaginationOptions {
    page?: number;
    pageSize?: number;
}
export interface OutputOptions {
    outputToFile?: boolean;
    outputFormat?: 'json' | 'markdown' | 'both';
    outputPath?: string;
    useQuerySubfolder?: boolean;
    pagination?: PaginationOptions;
}
export declare class OutputManager {
    private defaultResultsDir;
    /**
     * Get output directory based on options
     */
    private getOutputDirectory;
    ensureResultsDirectory(query: string, options?: {
        outputPath?: string;
        useQuerySubfolder?: boolean;
    }): Promise<string>;
    /**
     * Paginate results
     */
    paginateResults(results: any, options?: PaginationOptions): {
        data: any;
        pagination: {
            page: number;
            pageSize: number;
            totalPages: number;
            totalItems: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
    };
    /**
     * Save results to file
     */
    saveToFile(results: any, query: string, format: 'json' | 'markdown' | 'both', options?: {
        outputPath?: string;
        useQuerySubfolder?: boolean;
    }): Promise<string[]>;
    /**
     * Update the summary index file
     */
    private updateSummaryFile;
    /**
     * Format results as markdown
     */
    private formatAsMarkdown;
    /**
     * Create a summary for paginated results
     */
    createPaginationSummary(pagination: any): string;
}
//# sourceMappingURL=output-manager.d.ts.map