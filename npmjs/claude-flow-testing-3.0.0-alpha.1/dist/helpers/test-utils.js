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
export async function waitFor(condition, options = {}) {
    const { timeout = 5000, interval = 50, timeoutMessage = 'Condition not met within timeout', } = options;
    const startTime = Date.now();
    while (true) {
        try {
            const result = await condition();
            if (result) {
                return result;
            }
        }
        catch (error) {
            // Condition threw, continue waiting
        }
        if (Date.now() - startTime >= timeout) {
            throw new Error(timeoutMessage);
        }
        await sleep(interval);
    }
}
/**
 * Wait until a value changes
 *
 * @example
 * await waitUntilChanged(() => counter.value, { from: 0 });
 */
export async function waitUntilChanged(getValue, options = {}) {
    const { from, timeout = 5000, interval = 50 } = options;
    const initialValue = from ?? await getValue();
    const startTime = Date.now();
    while (true) {
        const currentValue = await getValue();
        if (currentValue !== initialValue) {
            return currentValue;
        }
        if (Date.now() - startTime >= timeout) {
            throw new Error(`Value did not change from ${String(initialValue)} within timeout`);
        }
        await sleep(interval);
    }
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
export async function retry(operation, options = {}) {
    const { maxAttempts = 3, backoff = 100, maxBackoff = 10000, exponential = true, onError, shouldRetry = () => true, } = options;
    let lastError;
    let currentBackoff = backoff;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxAttempts || !shouldRetry(lastError, attempt)) {
                throw lastError;
            }
            onError?.(lastError, attempt);
            await sleep(currentBackoff);
            if (exponential) {
                currentBackoff = Math.min(currentBackoff * 2, maxBackoff);
            }
        }
    }
    throw lastError;
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
export async function withTimeout(operation, timeoutMs, timeoutMessage) {
    const timeoutPromise = new Promise((_, reject) => {
        const timer = setTimeout(() => {
            reject(new TimeoutError(timeoutMessage ?? `Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        // Cleanup timer if operation completes first
        operation().finally(() => clearTimeout(timer));
    });
    return Promise.race([operation(), timeoutPromise]);
}
/**
 * Custom timeout error
 */
export class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimeoutError';
    }
}
/**
 * Sleep for a specified duration
 *
 * @example
 * await sleep(1000); // Sleep for 1 second
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Create a deferred promise that can be resolved/rejected externally
 *
 * @example
 * const deferred = createDeferred<string>();
 * setTimeout(() => deferred.resolve('done'), 1000);
 * const result = await deferred.promise;
 */
export function createDeferred() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
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
export async function parallelLimit(operations, limit) {
    const results = [];
    const executing = new Set();
    for (const operation of operations) {
        const promise = (async () => {
            const result = await operation();
            results.push(result);
        })();
        executing.add(promise);
        promise.finally(() => executing.delete(promise));
        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }
    await Promise.all(executing);
    return results;
}
/**
 * Measure execution time of an operation
 *
 * @example
 * const { result, duration } = await measureTime(async () => {
 *   return await expensiveOperation();
 * });
 */
export async function measureTime(operation) {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    return { result, duration };
}
/**
 * Create a mock clock for time-dependent tests
 *
 * @example
 * const clock = createMockClock();
 * clock.install();
 * // ... tests with controlled time
 * clock.uninstall();
 */
export function createMockClock() {
    let installed = false;
    let currentTime = Date.now();
    return {
        install() {
            if (installed)
                return;
            vi.useFakeTimers();
            vi.setSystemTime(currentTime);
            installed = true;
        },
        uninstall() {
            if (!installed)
                return;
            vi.useRealTimers();
            installed = false;
        },
        tick(ms) {
            if (!installed) {
                throw new Error('Clock not installed. Call install() first.');
            }
            currentTime += ms;
            vi.advanceTimersByTime(ms);
        },
        setTime(time) {
            currentTime = typeof time === 'number' ? time : time.getTime();
            if (installed) {
                vi.setSystemTime(currentTime);
            }
        },
        getTime() {
            return currentTime;
        },
        runAllTimers() {
            if (!installed) {
                throw new Error('Clock not installed. Call install() first.');
            }
            vi.runAllTimers();
        },
        runPendingTimers() {
            if (!installed) {
                throw new Error('Clock not installed. Call install() first.');
            }
            vi.runOnlyPendingTimers();
        },
    };
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
export function createTestEmitter() {
    const listeners = new Map();
    return {
        on(event, handler) {
            if (!listeners.has(event)) {
                listeners.set(event, new Set());
            }
            listeners.get(event).add(handler);
            return () => {
                listeners.get(event)?.delete(handler);
            };
        },
        once(event, handler) {
            const wrappedHandler = (data) => {
                this.off(event, wrappedHandler);
                handler(data);
            };
            return this.on(event, wrappedHandler);
        },
        off(event, handler) {
            listeners.get(event)?.delete(handler);
        },
        emit(event, data) {
            listeners.get(event)?.forEach(handler => handler(data));
        },
        removeAllListeners(event) {
            if (event) {
                listeners.delete(event);
            }
            else {
                listeners.clear();
            }
        },
        listenerCount(event) {
            return listeners.get(event)?.size ?? 0;
        },
    };
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
export function createCallSpy() {
    const calls = [];
    return {
        calls,
        wrap(fn) {
            return ((...args) => {
                const call = { args, timestamp: Date.now() };
                calls.push(call);
                try {
                    const result = fn(...args);
                    call.result = result;
                    return result;
                }
                catch (error) {
                    call.error = error;
                    throw error;
                }
            });
        },
        clear() {
            calls.length = 0;
        },
        getLastCall() {
            return calls[calls.length - 1];
        },
        getCallCount() {
            return calls.length;
        },
        wasCalledWith(...args) {
            return calls.some(call => args.every((arg, i) => arg === undefined || call.args[i] === arg));
        },
    };
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
export function createMockStream(chunks, options = {}) {
    const { delayMs = 0, errorAt, errorMessage = 'Stream error' } = options;
    return {
        async *[Symbol.asyncIterator]() {
            for (let i = 0; i < chunks.length; i++) {
                if (errorAt !== undefined && i === errorAt) {
                    throw new Error(errorMessage);
                }
                if (delayMs > 0) {
                    await sleep(delayMs);
                }
                yield chunks[i];
            }
        },
    };
}
/**
 * Collect all items from an async iterable
 *
 * @example
 * const items = await collectStream(asyncGenerator());
 */
export async function collectStream(stream) {
    const items = [];
    for await (const item of stream) {
        items.push(item);
    }
    return items;
}
/**
 * Generate a unique ID for testing
 */
export function generateTestId(prefix = 'test') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
/**
 * Create a test context that provides isolated test data
 *
 * @example
 * const ctx = createTestContext();
 * ctx.set('user', { id: 1, name: 'Test' });
 * const user = ctx.get('user');
 */
export function createTestContext() {
    const data = new Map();
    return {
        set(key, value) {
            data.set(key, value);
        },
        get(key) {
            return data.get(key);
        },
        has(key) {
            return data.has(key);
        },
        delete(key) {
            return data.delete(key);
        },
        clear() {
            data.clear();
        },
        keys() {
            return Array.from(data.keys());
        },
    };
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
export async function expectToReject(operation, ErrorClass) {
    try {
        await operation();
        throw new Error('Expected operation to reject, but it resolved');
    }
    catch (error) {
        if (ErrorClass && !(error instanceof ErrorClass)) {
            throw new Error(`Expected error to be instance of ${ErrorClass.name}, but got ${error.constructor.name}`);
        }
        return error;
    }
}
/**
 * Create a mock function with tracking capabilities
 */
export function createTrackedMock(implementation) {
    // Use type assertion to handle the optional implementation
    const mock = implementation ? vi.fn(implementation) : vi.fn();
    const calls = [];
    const tracked = ((...args) => {
        const start = performance.now();
        const call = { args, duration: 0 };
        calls.push(call);
        try {
            const result = mock(...args);
            call.result = result;
            call.duration = performance.now() - start;
            return result;
        }
        catch (error) {
            call.error = error;
            call.duration = performance.now() - start;
            throw error;
        }
    });
    Object.assign(tracked, {
        mock,
        calls,
        getAverageDuration: () => {
            if (calls.length === 0)
                return 0;
            return calls.reduce((sum, c) => sum + c.duration, 0) / calls.length;
        },
        getTotalDuration: () => calls.reduce((sum, c) => sum + c.duration, 0),
        getErrors: () => calls.filter(c => c.error).map(c => c.error),
    });
    return tracked;
}
//# sourceMappingURL=test-utils.js.map