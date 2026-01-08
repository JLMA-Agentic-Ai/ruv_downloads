/**
 * Stream Processor
 * Memory-efficient processing of large datasets
 */
export interface StreamOptions {
    batchSize?: number;
    concurrency?: number;
    onProgress?: (processed: number) => void;
    onError?: (error: Error, item: any) => void;
}
/**
 * Process large datasets in streaming fashion
 */
export declare class StreamProcessor<TIn, TOut> {
    private options;
    constructor(options?: StreamOptions);
    /**
     * Process items in batches using streaming
     */
    processBatches(items: TIn[], processor: (batch: TIn[]) => Promise<TOut[]>): Promise<TOut[]>;
    /**
     * Process items individually with concurrency control
     */
    processIndividual(items: TIn[], processor: (item: TIn) => Promise<TOut>): Promise<TOut[]>;
    /**
     * Transform stream with mapping function
     */
    transformStream(items: TIn[], mapper: (item: TIn) => Promise<TOut>): Promise<TOut[]>;
    /**
     * Filter stream with predicate
     */
    filterStream(items: TIn[], predicate: (item: TIn) => Promise<boolean>): Promise<TIn[]>;
    /**
     * Chunk array into smaller arrays
     */
    private chunkArray;
}
/**
 * Helper function to create a stream processor
 */
export declare function createStreamProcessor<TIn, TOut>(options?: StreamOptions): StreamProcessor<TIn, TOut>;
//# sourceMappingURL=stream-processor.d.ts.map