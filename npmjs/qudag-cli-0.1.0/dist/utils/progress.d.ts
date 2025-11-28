/**
 * Progress reporter for CLI operations
 */
export declare class ProgressReporter {
    private spinner;
    private isInteractive;
    private startTime;
    private totalItems;
    private processedItems;
    constructor(isInteractive?: boolean);
    /**
     * Start progress reporting
     */
    start(message: string, total?: number): void;
    /**
     * Update progress with current status
     */
    update(message: string, processed?: number): void;
    /**
     * Increment processed items counter
     */
    increment(count?: number): void;
    /**
     * Get current progress percentage
     */
    private getProgressPercentage;
    /**
     * Get estimated time remaining
     */
    getETA(): string;
    /**
     * Format duration in milliseconds to human-readable string
     */
    private formatDuration;
    /**
     * Mark operation as successful
     */
    succeed(message?: string): void;
    /**
     * Mark operation as failed
     */
    fail(message?: string): void;
    /**
     * Mark operation with warning
     */
    warn(message?: string): void;
    /**
     * Stop progress reporting
     */
    stop(): void;
    /**
     * Clear spinner
     */
    clear(): void;
}
/**
 * Create a simple progress bar for non-interactive mode
 */
export declare function createProgressBar(current: number, total: number, width?: number): string;
//# sourceMappingURL=progress.d.ts.map