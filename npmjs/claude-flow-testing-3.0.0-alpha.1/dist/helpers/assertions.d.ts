/**
 * V3 Claude-Flow Custom Assertions
 *
 * London School TDD Custom Assertions
 * - Behavior-focused assertions
 * - Interaction verification helpers
 * - Contract testing utilities
 */
import { type Mock } from 'vitest';
/**
 * Assert that a mock was called in a specific sequence
 *
 * @example
 * assertCallSequence([
 *   [mockRepo.findById, ['123']],
 *   [mockValidator.validate, [user]],
 *   [mockRepo.save, [user]],
 * ]);
 */
export declare function assertCallSequence(sequence: Array<[Mock, unknown[]]>): void;
/**
 * Assert that a mock was NOT called with specific arguments
 *
 * @example
 * assertNotCalledWith(mockRepo.save, [invalidUser]);
 */
export declare function assertNotCalledWith(mock: Mock, args: unknown[]): void;
/**
 * Assert interaction count for behavior verification
 *
 * @example
 * assertInteractionCount(mockService.process, 3);
 */
export declare function assertInteractionCount(mock: Mock, expectedCount: number): void;
/**
 * Assert that all mocks in a group were called
 *
 * @example
 * assertAllCalled([mockA.method, mockB.method, mockC.method]);
 */
export declare function assertAllCalled(mocks: Mock[]): void;
/**
 * Assert that none of the mocks were called
 *
 * @example
 * assertNoneCalled([mockA.method, mockB.method]);
 */
export declare function assertNoneCalled(mocks: Mock[]): void;
/**
 * Assert contract compliance
 * Verifies that an object implements expected interface
 *
 * @example
 * assertContractCompliance(userService, UserServiceContract);
 */
export declare function assertContractCompliance<T extends object>(implementation: T, contract: ContractDefinition<T>): void;
/**
 * Contract definition for interface compliance
 */
export interface ContractDefinition<T> {
    methods: {
        [K in keyof T]?: {
            params: Array<{
                name: string;
                type: string;
            }>;
            returns: string;
        };
    };
}
/**
 * Assert async operation timing
 *
 * @example
 * await assertTimingWithin(async () => service.process(), 100);
 */
export declare function assertTimingWithin(operation: () => Promise<unknown>, maxMs: number): Promise<void>;
/**
 * Assert that an async operation completes within expected time range
 *
 * @example
 * await assertTimingRange(async () => service.process(), 50, 150);
 */
export declare function assertTimingRange(operation: () => Promise<unknown>, minMs: number, maxMs: number): Promise<void>;
/**
 * Assert error type and message
 *
 * @example
 * await assertThrowsWithMessage(
 *   async () => service.validate(invalid),
 *   ValidationError,
 *   'Invalid input'
 * );
 */
export declare function assertThrowsWithMessage(operation: () => Promise<unknown>, ErrorType: new (...args: unknown[]) => Error, expectedMessage: string | RegExp): Promise<void>;
/**
 * Assert domain event was published
 *
 * @example
 * await assertEventPublished(mockEventBus, 'UserCreated', { userId: '123' });
 */
export declare function assertEventPublished(eventBusMock: Mock, eventType: string, expectedPayload?: Record<string, unknown>): void;
/**
 * Assert that mock returns expected values in sequence
 *
 * @example
 * assertMockSequence(mockCounter.next, [1, 2, 3]);
 */
export declare function assertMockSequence(mock: Mock, expectedValues: unknown[]): Promise<void>;
/**
 * Security assertion - verify sensitive data handling
 *
 * @example
 * assertNoSensitiveDataLogged(mockLogger, ['password', 'token', 'secret']);
 */
export declare function assertNoSensitiveDataLogged(loggerMock: Mock, sensitivePatterns: string[]): void;
/**
 * Performance assertion - verify operation meets target
 *
 * @example
 * await assertPerformanceTarget(
 *   async () => await search.execute(query),
 *   { targetMs: 100, iterations: 10 }
 * );
 */
export declare function assertPerformanceTarget(operation: () => Promise<unknown>, config: {
    targetMs: number;
    iterations: number;
    warmupIterations?: number;
}): Promise<{
    averageMs: number;
    minMs: number;
    maxMs: number;
}>;
//# sourceMappingURL=assertions.d.ts.map