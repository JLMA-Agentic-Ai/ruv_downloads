"use strict";
/**
 * Stream Processor
 * Memory-efficient processing of large datasets
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamProcessor = void 0;
exports.createStreamProcessor = createStreamProcessor;
const stream_1 = require("stream");
const promises_1 = require("stream/promises");
/**
 * Process large datasets in streaming fashion
 */
class StreamProcessor {
    options;
    constructor(options = {}) {
        this.options = {
            batchSize: options.batchSize || 1000,
            concurrency: options.concurrency || 10,
            onProgress: options.onProgress,
            onError: options.onError,
        };
    }
    /**
     * Process items in batches using streaming
     */
    async processBatches(items, processor) {
        const results = [];
        let processed = 0;
        // Create readable stream from array
        const source = stream_1.Readable.from(this.chunkArray(items, this.options.batchSize));
        // Capture options in closure for transform function
        const options = this.options;
        // Create transform stream for processing
        const transform = new stream_1.Transform({
            objectMode: true,
            async transform(batch, _encoding, callback) {
                try {
                    const result = await processor(batch);
                    results.push(...result);
                    processed += batch.length;
                    if (options.onProgress) {
                        options.onProgress(processed);
                    }
                    callback();
                }
                catch (error) {
                    callback(error instanceof Error ? error : new Error(String(error)));
                }
            },
        });
        // Process stream
        await (0, promises_1.pipeline)(source, transform);
        return results;
    }
    /**
     * Process items individually with concurrency control
     */
    async processIndividual(items, processor) {
        const results = [];
        const errors = [];
        // Process in chunks to control memory usage
        for (let i = 0; i < items.length; i += this.options.concurrency) {
            const chunk = items.slice(i, i + this.options.concurrency);
            const chunkResults = await Promise.allSettled(chunk.map(item => processor(item)));
            chunkResults.forEach((result, idx) => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                }
                else {
                    const error = result.reason instanceof Error
                        ? result.reason
                        : new Error(String(result.reason));
                    errors.push({ item: chunk[idx], error });
                    if (this.options.onError) {
                        this.options.onError(error, chunk[idx]);
                    }
                }
            });
            if (this.options.onProgress) {
                this.options.onProgress(Math.min(i + this.options.concurrency, items.length));
            }
        }
        if (errors.length > 0 && !this.options.onError) {
            console.warn(`${errors.length} items failed processing`);
        }
        return results;
    }
    /**
     * Transform stream with mapping function
     */
    async transformStream(items, mapper) {
        return this.processIndividual(items, mapper);
    }
    /**
     * Filter stream with predicate
     */
    async filterStream(items, predicate) {
        const results = [];
        for (let i = 0; i < items.length; i += this.options.concurrency) {
            const chunk = items.slice(i, i + this.options.concurrency);
            const predicateResults = await Promise.all(chunk.map(item => predicate(item).then(pass => ({ item, pass }))));
            predicateResults.forEach(({ item, pass }) => {
                if (pass) {
                    results.push(item);
                }
            });
            if (this.options.onProgress) {
                this.options.onProgress(Math.min(i + this.options.concurrency, items.length));
            }
        }
        return results;
    }
    /**
     * Chunk array into smaller arrays
     */
    *chunkArray(array, size) {
        for (let i = 0; i < array.length; i += size) {
            yield array.slice(i, i + size);
        }
    }
}
exports.StreamProcessor = StreamProcessor;
/**
 * Helper function to create a stream processor
 */
function createStreamProcessor(options) {
    return new StreamProcessor(options);
}
//# sourceMappingURL=stream-processor.js.map