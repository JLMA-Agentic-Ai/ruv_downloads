/**
 * @claude-flow/testing - Test Utilities
 *
 * Common test utilities for async operations, timing, retries, and more.
 * Designed for robust V3 module testing.
 */
import { vi } from 'vitest';
/**
 * Wait for a condition to be true with timeout
 *
 * @example
 * await waitFor(() => element.isVisible(), { timeout: 5000 });
 */
export declare function waitFor<T>(condition: () => T | Promise<T>, options?: WaitForOptions): Promise<T>;
/**
 * Options for waitFor utility
 */
export interface WaitForOptions {
    timeout?: number;
    interval?: number;
    timeoutMessage?: string;
}
/**
 * Wait until a value changes
 *
 * @example
 * await waitUntilChanged(() => counter.value, { from: 0 });
 */
export declare function waitUntilChanged<T>(getValue: () => T | Promise<T>, options?: WaitUntilChangedOptions<T>): Promise<T>;
/**
 * Options for waitUntilChanged utility
 */
export interface WaitUntilChangedOptions<T> {
    from?: T;
    timeout?: number;
    interval?: number;
}
/**
 * Retry an operation with exponential backoff
 *
 * @example
 * const result = await retry(
 *   async () => await fetchData(),
 *   { maxAttempts: 3, backoff: 100 }
 * );
 */
export declare function retry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>;
/**
 * Options for retry utility
 */
export interface RetryOptions {
    maxAttempts?: number;
    backoff?: number;
    maxBackoff?: number;
    exponential?: boolean;
    onError?: (error: Error, attempt: number) => void;
    shouldRetry?: (error: Error, attempt: number) => boolean;
}
/**
 * Wrap an operation with a timeout
 *
 * @example
 * const result = await withTimeout(
 *   async () => await longRunningOperation(),
 *   5000
 * );
 */
export declare function withTimeout<T>(operation: () => Promise<T>, timeoutMs: number, timeoutMessage?: string): Promise<T>;
/**
 * Custom timeout error
 */
export declare class TimeoutError extends Error {
    constructor(message: string);
}
/**
 * Sleep for a specified duration
 *
 * @example
 * await sleep(1000); // Sleep for 1 second
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Create a deferred promise that can be resolved/rejected externally
 *
 * @example
 * const deferred = createDeferred<string>();
 * setTimeout(() => deferred.resolve('done'), 1000);
 * const result = await deferred.promise;
 */
export declare function createDeferred<T>(): Deferred<T>;
/**
 * Deferred promise interface
 */
export interface Deferred<T> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error: Error) => void;
}
/**
 * Run operations in parallel with concurrency limit
 *
 * @example
 * const results = await parallelLimit(
 *   items.map(item => () => processItem(item)),
 *   5 // max 5 concurrent operations
 * );
 */
export declare function parallelLimit<T>(operations: Array<() => Promise<T>>, limit: number): Promise<T[]>;
/**
 * Measure execution time of an operation
 *
 * @example
 * const { result, duration } = await measureTime(async () => {
 *   return await expensiveOperation();
 * });
 */
export declare function measureTime<T>(operation: () => Promise<T>): Promise<{
    result: T;
    duration: number;
}>;
/**
 * Create a mock clock for time-dependent tests
 *
 * @example
 * const clock = createMockClock();
 * clock.install();
 * // ... tests with controlled time
 * clock.uninstall();
 */
export declare function createMockClock(): MockClock;
/**
 * Mock clock interface
 */
export interface MockClock {
    install(): void;
    uninstall(): void;
    tick(ms: number): void;
    setTime(time: number | Date): void;
    getTime(): number;
    runAllTimers(): void;
    runPendingTimers(): void;
}
/**
 * Create an event emitter for testing
 *
 * @example
 * const emitter = createTestEmitter<{ message: string }>();
 * const handler = vi.fn();
 * emitter.on('message', handler);
 * emitter.emit('message', 'hello');
 */
export declare function createTestEmitter<T extends Record<string, unknown>>(): TestEmitter<T>;
/**
 * Test emitter interface
 */
export interface TestEmitter<T extends Record<string, unknown>> {
    on<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void;
    once<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void;
    off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
    emit<K extends keyof T>(event: K, data: T[K]): void;
    removeAllListeners(event?: keyof T): void;
    listenerCount(event: keyof T): number;
}
/**
 * Create a test spy that records all calls
 *
 * @example
 * const spy = createCallSpy();
 * myFunction = spy.wrap(myFunction);
 * // ... use myFunction
 * expect(spy.calls).toHaveLength(3);
 */
export declare function createCallSpy<T extends (...args: unknown[]) => unknown>(): CallSpy<T>;
/**
 * Call spy interface
 */
export interface CallSpy<T extends (...args: unknown[]) => unknown> {
    calls: Array<{
        args: Parameters<T>;
        result?: ReturnType<T>;
        error?: Error;
        timestamp: number;
    }>;
    wrap(fn: T): T;
    clear(): void;
    getLastCall(): {
        args: Parameters<T>;
        result?: ReturnType<T>;
        error?: Error;
        timestamp: number;
    } | undefined;
    getCallCount(): number;
    wasCalledWith(...args: Partial<Parameters<T>>): boolean;
}
/**
 * Create a mock stream for testing streaming operations
 *
 * @example
 * const stream = createMockStream(['chunk1', 'chunk2', 'chunk3']);
 * for await (const chunk of stream) {
 *   console.log(chunk);
 * }
 */
export declare function createMockStream<T>(chunks: T[], options?: MockStreamOptions): AsyncIterable<T>;
/**
 * Mock stream options
 */
export interface MockStreamOptions {
    delayMs?: number;
    errorAt?: number;
    errorMessage?: string;
}
/**
 * Collect all items from an async iterable
 *
 * @example
 * const items = await collectStream(asyncGenerator());
 */
export declare function collectStream<T>(stream: AsyncIterable<T>): Promise<T[]>;
/**
 * Generate a unique ID for testing
 */
export declare function generateTestId(prefix?: string): string;
/**
 * Create a test context that provides isolated test data
 *
 * @example
 * const ctx = createTestContext();
 * ctx.set('user', { id: 1, name: 'Test' });
 * const user = ctx.get('user');
 */
export declare function createTestContext(): TestContext;
/**
 * Test context interface
 */
export interface TestContext {
    set<T>(key: string, value: T): void;
    get<T>(key: string): T | undefined;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    keys(): string[];
}
/**
 * Assert that a promise rejects with a specific error type
 *
 * @example
 * await expectToReject(
 *   async () => await riskyOperation(),
 *   ValidationError
 * );
 */
export declare function expectToReject<T extends Error>(operation: () => Promise<unknown>, ErrorClass?: new (...args: unknown[]) => T): Promise<T>;
/**
 * Create a mock function with tracking capabilities
 */
export declare function createTrackedMock<T extends (...args: unknown[]) => unknown>(implementation?: T): TrackedMock<T>;
/**
 * Tracked mock interface
 */
export interface TrackedMock<T extends (...args: unknown[]) => unknown> {
    (...args: Parameters<T>): ReturnType<T>;
    mock: ReturnType<typeof vi.fn>;
    calls: Array<{
        args: Parameters<T>;
        result?: ReturnType<T>;
        error?: Error;
        duration: number;
    }>;
    getAverageDuration(): number;
    getTotalDuration(): number;
    getErrors(): Error[];
}
//# sourceMappingURL=test-utils.d.ts.map