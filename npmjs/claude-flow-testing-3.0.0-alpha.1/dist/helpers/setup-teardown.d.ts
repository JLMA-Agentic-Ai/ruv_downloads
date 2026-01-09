/**
 * @claude-flow/testing - Setup & Teardown Helpers
 *
 * Global setup and teardown utilities for V3 module testing.
 * Provides test isolation, resource cleanup, and environment management.
 */
import { vi } from 'vitest';
/**
 * Setup context for managing test resources
 */
export interface SetupContext {
    /**
     * Register a cleanup function to be called during teardown
     */
    addCleanup(cleanup: CleanupFunction): void;
    /**
     * Register a resource that needs to be closed/disposed
     */
    registerResource<T extends Disposable>(resource: T): T;
    /**
     * Get a registered resource by name
     */
    getResource<T>(name: string): T | undefined;
    /**
     * Set a named resource
     */
    setResource<T>(name: string, resource: T): void;
    /**
     * Run all cleanup functions
     */
    runCleanup(): Promise<void>;
}
/**
 * Cleanup function type
 */
export type CleanupFunction = () => void | Promise<void>;
/**
 * Disposable interface
 */
export interface Disposable {
    dispose?(): void | Promise<void>;
    close?(): void | Promise<void>;
    destroy?(): void | Promise<void>;
    shutdown?(): void | Promise<void>;
}
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
export declare function createSetupContext(): SetupContext;
/**
 * Get or create the global test context
 */
export declare function getGlobalContext(): SetupContext;
/**
 * Reset the global test context
 */
export declare function resetGlobalContext(): Promise<void>;
/**
 * Test environment configuration
 */
export interface TestEnvironmentConfig {
    /**
     * Reset all mocks before each test
     */
    resetMocks?: boolean;
    /**
     * Use fake timers
     */
    fakeTimers?: boolean;
    /**
     * Initial fake time
     */
    initialTime?: Date | number;
    /**
     * Environment variables to set
     */
    env?: Record<string, string>;
    /**
     * Suppress console output during tests
     */
    suppressConsole?: boolean | ('log' | 'warn' | 'error' | 'info')[];
    /**
     * Timeout for async operations
     */
    timeout?: number;
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
export declare function configureTestEnvironment(config?: TestEnvironmentConfig): void;
/**
 * Create a test suite with automatic setup/teardown
 *
 * @example
 * const { beforeEachTest, afterEachTest, getContext } = createTestSuite({
 *   resetMocks: true,
 * });
 */
export declare function createTestSuite(config?: TestEnvironmentConfig): TestSuiteHelpers;
/**
 * Test suite helpers interface
 */
export interface TestSuiteHelpers {
    beforeEachTest: (fn: (ctx: SetupContext) => void | Promise<void>) => void;
    afterEachTest: (fn: (ctx: SetupContext) => void | Promise<void>) => void;
    getContext: () => SetupContext;
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
export declare function createTestScope(): TestScope;
/**
 * Test scope interface
 */
export interface TestScope {
    addMock<T extends ReturnType<typeof vi.fn>>(mock: T): T;
    addCleanup(cleanup: CleanupFunction): void;
    run<T>(fn: () => Promise<T>): Promise<T>;
    clear(): void;
    reset(): void;
}
/**
 * Database test helper for memory/agentdb testing
 */
export interface DatabaseTestHelper {
    setup(): Promise<void>;
    teardown(): Promise<void>;
    clear(): Promise<void>;
    seed(data: Record<string, unknown[]>): Promise<void>;
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
export declare function createInMemoryDatabaseHelper(): DatabaseTestHelper;
/**
 * Network test helper for mocking HTTP/WebSocket
 */
export interface NetworkTestHelper {
    mockFetch(responses: MockFetchResponse[]): void;
    mockWebSocket(handler: (message: unknown) => unknown): void;
    clearMocks(): void;
}
/**
 * Mock fetch response
 */
export interface MockFetchResponse {
    url: string | RegExp;
    method?: string;
    status?: number;
    body?: unknown;
    headers?: Record<string, string>;
    delay?: number;
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
export declare function createNetworkTestHelper(): NetworkTestHelper;
/**
 * File system test helper
 */
export interface FileSystemTestHelper {
    createTempDir(): Promise<string>;
    createFile(path: string, content: string): Promise<void>;
    readFile(path: string): Promise<string>;
    cleanup(): Promise<void>;
}
/**
 * Create in-memory file system helper
 *
 * @example
 * const fs = createInMemoryFileSystemHelper();
 * await fs.createFile('/test.txt', 'content');
 * const content = await fs.readFile('/test.txt');
 */
export declare function createInMemoryFileSystemHelper(): FileSystemTestHelper;
/**
 * Performance test helper
 */
export interface PerformanceTestHelper {
    startMeasurement(name: string): void;
    endMeasurement(name: string): number;
    getMeasurements(): Record<string, number[]>;
    getStats(name: string): {
        min: number;
        max: number;
        avg: number;
        p95: number;
    };
    clear(): void;
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
export declare function createPerformanceTestHelper(): PerformanceTestHelper;
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
export declare function setupV3Tests(config?: V3TestConfig): void;
/**
 * V3 test configuration
 */
export interface V3TestConfig {
    suppressConsole?: boolean | ('log' | 'warn' | 'error' | 'info')[];
    env?: Record<string, string>;
    timeout?: number;
}
/**
 * Wait for all pending promises to resolve
 *
 * @example
 * await flushPromises();
 */
export declare function flushPromises(): Promise<void>;
/**
 * Run with timeout
 *
 * @example
 * await withTimeout(async () => {
 *   await longRunningOperation();
 * }, 5000);
 */
export declare function withTestTimeout<T>(fn: () => Promise<T>, timeoutMs?: number): Promise<T>;
//# sourceMappingURL=setup-teardown.d.ts.map