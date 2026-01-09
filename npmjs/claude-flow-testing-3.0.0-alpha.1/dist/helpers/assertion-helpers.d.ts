/**
 * @claude-flow/testing - Assertion Helpers
 *
 * Custom Vitest matchers and assertion utilities for V3 module testing.
 * Implements London School TDD behavior verification patterns.
 */
import { type Mock } from 'vitest';
/**
 * Assert that a mock was called with arguments matching a pattern
 *
 * @example
 * assertCalledWithPattern(mockFn, { userId: expect.any(String) });
 */
export declare function assertCalledWithPattern(mock: Mock, pattern: Record<string, unknown> | unknown[]): void;
/**
 * Assert that events were published in order
 *
 * @example
 * assertEventOrder(mockEventBus.publish, ['UserCreated', 'EmailSent']);
 */
export declare function assertEventOrder(publishMock: Mock, expectedEventTypes: string[]): void;
/**
 * Assert that an event was published with specific payload
 *
 * @example
 * assertEventPublished(mockEventBus, 'UserCreated', { userId: '123' });
 */
export declare function assertEventPublished(eventBusMock: {
    publish: Mock;
} | Mock, eventType: string, expectedPayload?: Record<string, unknown>): void;
/**
 * Assert that no event of a specific type was published
 *
 * @example
 * assertEventNotPublished(mockEventBus, 'UserDeleted');
 */
export declare function assertEventNotPublished(eventBusMock: {
    publish: Mock;
} | Mock, eventType: string): void;
/**
 * Assert that mocks were called in a specific order
 *
 * @example
 * assertMocksCalledInOrder([mockValidate, mockSave, mockNotify]);
 */
export declare function assertMocksCalledInOrder(mocks: Mock[]): void;
/**
 * Assert that a mock was called exactly n times with specific arguments
 *
 * @example
 * assertCalledNTimesWith(mockFn, 3, ['arg1', 'arg2']);
 */
export declare function assertCalledNTimesWith(mock: Mock, times: number, args: unknown[]): void;
/**
 * Assert that async operations completed within time limit
 *
 * @example
 * await assertCompletesWithin(async () => await slowOp(), 1000);
 */
export declare function assertCompletesWithin(operation: () => Promise<unknown>, maxMs: number): Promise<void>;
/**
 * Assert that an operation throws a specific error
 *
 * @example
 * await assertThrowsError(
 *   async () => await riskyOp(),
 *   ValidationError,
 *   'Invalid input'
 * );
 */
export declare function assertThrowsError<E extends Error>(operation: () => Promise<unknown>, ErrorType: new (...args: unknown[]) => E, messagePattern?: string | RegExp): Promise<E>;
/**
 * Assert that no sensitive data appears in logs
 *
 * @example
 * assertNoSensitiveData(mockLogger.logs, ['password', 'token', 'secret']);
 */
export declare function assertNoSensitiveData(logs: Array<{
    message: string;
    context?: Record<string, unknown>;
}>, sensitivePatterns: string[]): void;
/**
 * Assert that a value matches a snapshot with custom serialization
 *
 * @example
 * assertMatchesSnapshot(result, { ignoreFields: ['timestamp', 'id'] });
 */
export declare function assertMatchesSnapshot(value: unknown, options?: SnapshotOptions): void;
/**
 * Snapshot options interface
 */
export interface SnapshotOptions {
    ignoreFields?: string[];
    transform?: (value: unknown) => unknown;
}
/**
 * Assert that performance metrics meet V3 targets
 *
 * @example
 * assertV3PerformanceTargets({
 *   searchSpeedup: 160,
 *   memoryReduction: 0.55,
 * });
 */
export declare function assertV3PerformanceTargets(metrics: V3PerformanceMetrics): void;
/**
 * V3 performance metrics interface
 */
export interface V3PerformanceMetrics {
    searchSpeedup?: number;
    flashAttentionSpeedup?: number;
    memoryReduction?: number;
    startupTimeMs?: number;
    responseTimeMs?: number;
}
/**
 * Assert that a domain object is valid
 *
 * @example
 * assertValidDomainObject(user, UserSchema);
 */
export declare function assertValidDomainObject<T>(object: T, validator: (obj: T) => {
    valid: boolean;
    errors?: string[];
}): void;
/**
 * Assert that a mock was only called with allowed arguments
 *
 * @example
 * assertOnlyCalledWithAllowed(mockFn, [['valid1'], ['valid2']]);
 */
export declare function assertOnlyCalledWithAllowed(mock: Mock, allowedCalls: unknown[][]): void;
/**
 * Assert that an array contains elements in partial order
 *
 * @example
 * assertPartialOrder(events, [
 *   { type: 'Start' },
 *   { type: 'Process' },
 *   { type: 'End' },
 * ]);
 */
export declare function assertPartialOrder<T>(actual: T[], expectedOrder: Partial<T>[]): void;
/**
 * Assert that all items in a collection pass a predicate
 *
 * @example
 * assertAllPass(results, result => result.success);
 */
export declare function assertAllPass<T>(items: T[], predicate: (item: T, index: number) => boolean, message?: string): void;
/**
 * Assert that none of the items in a collection pass a predicate
 *
 * @example
 * assertNonePass(results, result => result.error);
 */
export declare function assertNonePass<T>(items: T[], predicate: (item: T, index: number) => boolean, message?: string): void;
/**
 * Assert that two arrays have the same elements regardless of order
 *
 * @example
 * assertSameElements([1, 2, 3], [3, 1, 2]);
 */
export declare function assertSameElements<T>(actual: T[], expected: T[]): void;
/**
 * Assert that a mock returns expected results in sequence
 *
 * @example
 * await assertMockReturnsSequence(mockFn, [1, 2, 3]);
 */
export declare function assertMockReturnsSequence(mock: Mock, expectedResults: unknown[]): Promise<void>;
/**
 * Assert state transition is valid
 *
 * @example
 * assertValidStateTransition(
 *   'pending',
 *   'running',
 *   { pending: ['running', 'cancelled'], running: ['completed', 'failed'] }
 * );
 */
export declare function assertValidStateTransition<T extends string>(from: T, to: T, allowedTransitions: Record<T, T[]>): void;
/**
 * Assert that a retry policy was followed
 *
 * @example
 * assertRetryPattern(mockFn, { attempts: 3, backoffPattern: 'exponential' });
 */
export declare function assertRetryPattern(mock: Mock, options: RetryPatternOptions): void;
/**
 * Retry pattern options interface
 */
export interface RetryPatternOptions {
    attempts: number;
    backoffPattern?: 'linear' | 'exponential' | 'constant';
    initialDelayMs?: number;
}
/**
 * Assert that a dependency was properly injected
 *
 * @example
 * assertDependencyInjected(service, 'repository', mockRepository);
 */
export declare function assertDependencyInjected<T extends object>(subject: T, propertyName: keyof T, expectedDependency: unknown): void;
/**
 * Custom Vitest matcher declarations
 * Note: Main declarations in setup.ts - these extend CustomMatchers
 */
/**
 * Register custom Vitest matchers
 */
export declare function registerCustomMatchers(): void;
//# sourceMappingURL=assertion-helpers.d.ts.map