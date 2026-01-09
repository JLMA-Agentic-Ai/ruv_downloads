/**
 * @claude-flow/testing - Setup & Teardown Helpers
 *
 * Global setup and teardown utilities for V3 module testing.
 * Provides test isolation, resource cleanup, and environment management.
 */
import { vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
/**
 * Create a setup context for managing test resources
 *
 * @example
 * const ctx = createSetupContext();
 * ctx.addCleanup(() => server.close());
 * ctx.registerResource(database);
 * // ... run tests
 * await ctx.runCleanup();
 */
export function createSetupContext() {
    const cleanups = [];
    const resources = new Map();
    const disposables = [];
    return {
        addCleanup(cleanup) {
            cleanups.push(cleanup);
        },
        registerResource(resource) {
            disposables.push(resource);
            return resource;
        },
        getResource(name) {
            return resources.get(name);
        },
        setResource(name, resource) {
            resources.set(name, resource);
        },
        async runCleanup() {
            // Run cleanups in reverse order
            for (const cleanup of cleanups.reverse()) {
                try {
                    await cleanup();
                }
                catch (error) {
                    console.error('Cleanup error:', error);
                }
            }
            // Dispose resources
            for (const resource of disposables) {
                try {
                    if (resource.dispose) {
                        await resource.dispose();
                    }
                    else if (resource.close) {
                        await resource.close();
                    }
                    else if (resource.destroy) {
                        await resource.destroy();
                    }
                    else if (resource.shutdown) {
                        await resource.shutdown();
                    }
                }
                catch (error) {
                    console.error('Resource disposal error:', error);
                }
            }
            cleanups.length = 0;
            resources.clear();
            disposables.length = 0;
        },
    };
}
/**
 * Global test context that persists across test files
 */
let globalContext = null;
/**
 * Get or create the global test context
 */
export function getGlobalContext() {
    if (!globalContext) {
        globalContext = createSetupContext();
    }
    return globalContext;
}
/**
 * Reset the global test context
 */
export async function resetGlobalContext() {
    if (globalContext) {
        await globalContext.runCleanup();
        globalContext = null;
    }
}
/**
 * Configure test environment with standard settings
 *
 * @example
 * configureTestEnvironment({
 *   resetMocks: true,
 *   fakeTimers: true,
 *   suppressConsole: ['log', 'warn'],
 * });
 */
export function configureTestEnvironment(config = {}) {
    const { resetMocks = true, fakeTimers = false, initialTime, env = {}, suppressConsole = false, } = config;
    const originalEnv = {};
    const originalConsole = {};
    beforeAll(() => {
        // Set environment variables
        for (const [key, value] of Object.entries(env)) {
            originalEnv[key] = process.env[key];
            process.env[key] = value;
        }
        // Suppress console
        if (suppressConsole) {
            const methods = suppressConsole === true
                ? ['log', 'warn', 'error', 'info']
                : suppressConsole;
            for (const method of methods) {
                originalConsole[method] = console[method];
                console[method] = vi.fn();
            }
        }
    });
    afterAll(() => {
        // Restore environment variables
        for (const [key, value] of Object.entries(originalEnv)) {
            if (value === undefined) {
                delete process.env[key];
            }
            else {
                process.env[key] = value;
            }
        }
        // Restore console
        for (const [method, original] of Object.entries(originalConsole)) {
            if (original) {
                console[method] = original;
            }
        }
    });
    beforeEach(() => {
        if (resetMocks) {
            vi.clearAllMocks();
        }
        if (fakeTimers) {
            vi.useFakeTimers();
            if (initialTime) {
                vi.setSystemTime(initialTime);
            }
        }
    });
    afterEach(() => {
        if (fakeTimers) {
            vi.useRealTimers();
        }
        vi.restoreAllMocks();
    });
}
/**
 * Create a test suite with automatic setup/teardown
 *
 * @example
 * const { beforeEachTest, afterEachTest, getContext } = createTestSuite({
 *   resetMocks: true,
 * });
 */
export function createTestSuite(config = {}) {
    const context = createSetupContext();
    configureTestEnvironment(config);
    return {
        beforeEachTest: (fn) => {
            beforeEach(async () => {
                await fn(context);
            });
        },
        afterEachTest: (fn) => {
            afterEach(async () => {
                await fn(context);
                await context.runCleanup();
            });
        },
        getContext: () => context,
    };
}
/**
 * Create isolated test scope
 *
 * @example
 * const scope = createTestScope();
 * scope.addMock(mockService);
 * await scope.run(async () => {
 *   // test code
 * });
 */
export function createTestScope() {
    const mocks = [];
    const cleanups = [];
    return {
        addMock(mock) {
            mocks.push(mock);
            return mock;
        },
        addCleanup(cleanup) {
            cleanups.push(cleanup);
        },
        async run(fn) {
            try {
                return await fn();
            }
            finally {
                // Clear all mocks
                for (const mock of mocks) {
                    mock.mockClear();
                }
                // Run cleanups
                for (const cleanup of cleanups.reverse()) {
                    await cleanup();
                }
            }
        },
        clear() {
            for (const mock of mocks) {
                mock.mockClear();
            }
        },
        reset() {
            for (const mock of mocks) {
                mock.mockReset();
            }
        },
    };
}
/**
 * Create in-memory database helper for testing
 *
 * @example
 * const db = createInMemoryDatabaseHelper();
 * await db.setup();
 * await db.seed({ users: [{ id: 1, name: 'Test' }] });
 * // ... run tests
 * await db.teardown();
 */
export function createInMemoryDatabaseHelper() {
    const data = new Map();
    return {
        async setup() {
            data.clear();
        },
        async teardown() {
            data.clear();
        },
        async clear() {
            data.clear();
        },
        async seed(seedData) {
            for (const [table, records] of Object.entries(seedData)) {
                data.set(table, [...records]);
            }
        },
    };
}
/**
 * Create network test helper
 *
 * @example
 * const network = createNetworkTestHelper();
 * network.mockFetch([
 *   { url: '/api/users', body: [{ id: 1 }] },
 * ]);
 */
export function createNetworkTestHelper() {
    const fetchResponses = [];
    let originalFetch;
    return {
        mockFetch(responses) {
            fetchResponses.push(...responses);
            if (!originalFetch) {
                originalFetch = global.fetch;
                global.fetch = vi.fn(async (input, init) => {
                    const url = typeof input === 'string' ? input : input.toString();
                    const method = init?.method ?? 'GET';
                    const match = fetchResponses.find(r => {
                        const urlMatch = typeof r.url === 'string'
                            ? url.includes(r.url)
                            : r.url.test(url);
                        const methodMatch = !r.method || r.method === method;
                        return urlMatch && methodMatch;
                    });
                    if (!match) {
                        throw new Error(`No mock found for ${method} ${url}`);
                    }
                    if (match.delay) {
                        await new Promise(resolve => setTimeout(resolve, match.delay));
                    }
                    return new Response(JSON.stringify(match.body), {
                        status: match.status ?? 200,
                        headers: match.headers ?? { 'Content-Type': 'application/json' },
                    });
                });
            }
        },
        mockWebSocket(handler) {
            // WebSocket mocking would require more setup
            // This is a placeholder for the interface
            console.warn('WebSocket mocking not yet implemented');
        },
        clearMocks() {
            fetchResponses.length = 0;
            if (originalFetch) {
                global.fetch = originalFetch;
            }
        },
    };
}
/**
 * Create in-memory file system helper
 *
 * @example
 * const fs = createInMemoryFileSystemHelper();
 * await fs.createFile('/test.txt', 'content');
 * const content = await fs.readFile('/test.txt');
 */
export function createInMemoryFileSystemHelper() {
    const files = new Map();
    const tempDirs = [];
    return {
        async createTempDir() {
            const dir = `/tmp/test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            tempDirs.push(dir);
            return dir;
        },
        async createFile(path, content) {
            files.set(path, content);
        },
        async readFile(path) {
            const content = files.get(path);
            if (content === undefined) {
                throw new Error(`File not found: ${path}`);
            }
            return content;
        },
        async cleanup() {
            files.clear();
            tempDirs.length = 0;
        },
    };
}
/**
 * Create performance test helper
 *
 * @example
 * const perf = createPerformanceTestHelper();
 * perf.startMeasurement('search');
 * await search();
 * const duration = perf.endMeasurement('search');
 */
export function createPerformanceTestHelper() {
    const measurements = new Map();
    const starts = new Map();
    return {
        startMeasurement(name) {
            starts.set(name, performance.now());
        },
        endMeasurement(name) {
            const start = starts.get(name);
            if (start === undefined) {
                throw new Error(`No measurement started for: ${name}`);
            }
            const duration = performance.now() - start;
            starts.delete(name);
            if (!measurements.has(name)) {
                measurements.set(name, []);
            }
            measurements.get(name).push(duration);
            return duration;
        },
        getMeasurements() {
            return Object.fromEntries(measurements);
        },
        getStats(name) {
            const values = measurements.get(name);
            if (!values || values.length === 0) {
                return { min: 0, max: 0, avg: 0, p95: 0 };
            }
            const sorted = [...values].sort((a, b) => a - b);
            const sum = sorted.reduce((a, b) => a + b, 0);
            return {
                min: sorted[0],
                max: sorted[sorted.length - 1],
                avg: sum / sorted.length,
                p95: sorted[Math.floor(sorted.length * 0.95)],
            };
        },
        clear() {
            measurements.clear();
            starts.clear();
        },
    };
}
/**
 * Standard V3 test setup
 *
 * @example
 * // In your test file:
 * setupV3Tests();
 *
 * describe('MyModule', () => {
 *   // tests...
 * });
 */
export function setupV3Tests(config = {}) {
    configureTestEnvironment({
        resetMocks: true,
        suppressConsole: config.suppressConsole ?? false,
        env: {
            NODE_ENV: 'test',
            CLAUDE_FLOW_MODE: 'test',
            ...config.env,
        },
    });
}
/**
 * Wait for all pending promises to resolve
 *
 * @example
 * await flushPromises();
 */
export function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}
/**
 * Run with timeout
 *
 * @example
 * await withTimeout(async () => {
 *   await longRunningOperation();
 * }, 5000);
 */
export async function withTestTimeout(fn, timeoutMs = 5000) {
    return Promise.race([
        fn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Test timed out after ${timeoutMs}ms`)), timeoutMs)),
    ]);
}
//# sourceMappingURL=setup-teardown.js.map