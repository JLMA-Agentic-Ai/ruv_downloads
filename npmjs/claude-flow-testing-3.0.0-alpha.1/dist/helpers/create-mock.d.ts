/**
 * V3 Claude-Flow Mock Factory
 *
 * London School TDD Mock Creation Utilities
 * - Creates type-safe mocks for behavior verification
 * - Supports deep mocking for complex objects
 * - Enables interaction tracking for behavior testing
 */
import { type Mock } from 'vitest';
/**
 * Type for a fully mocked interface
 */
export type MockedInterface<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R ? Mock<(...args: A) => R> : T[K];
};
/**
 * Create a shallow mock of an interface
 * Each method becomes a vi.fn() for behavior verification
 *
 * @example
 * const mockRepo = createMock<UserRepository>();
 * mockRepo.findById.mockResolvedValue(user);
 * expect(mockRepo.save).toHaveBeenCalledWith(user);
 */
export declare function createMock<T extends object>(): MockedInterface<T>;
/**
 * Create a deep mock that handles nested objects
 * Useful for complex interfaces with nested dependencies
 *
 * @example
 * const mockService = createDeepMock<ComplexService>();
 * mockService.nested.method.mockReturnValue(result);
 */
export declare function createDeepMock<T extends object>(): MockedInterface<T>;
/**
 * Create a spy mock that wraps an existing object
 * Preserves original behavior while enabling verification
 *
 * @example
 * const spied = createSpyMock(realService);
 * await spied.process();
 * expect(spied.process).toHaveBeenCalled();
 */
export declare function createSpyMock<T extends object>(target: T): MockedInterface<T>;
/**
 * Create a mock with predefined behavior
 * Useful for common test scenarios
 *
 * @example
 * const mockRepo = createMockWithBehavior<UserRepository>({
 *   findById: async (id) => ({ id, name: 'Test' }),
 *   save: async (user) => user,
 * });
 */
export declare function createMockWithBehavior<T extends object>(implementations: Partial<{
    [K in keyof T]: T[K];
}>): MockedInterface<T>;
/**
 * Create a mock that fails on first call, succeeds on retry
 * Useful for testing retry logic and error handling
 *
 * @example
 * const mockApi = createRetryMock<ApiClient>('fetch', new Error('Network'), data);
 */
export declare function createRetryMock<T extends object>(methodName: keyof T, firstError: Error, successValue: unknown): MockedInterface<T>;
/**
 * Create a sequence mock that returns different values per call
 * Useful for testing stateful interactions
 *
 * @example
 * const mockCounter = createSequenceMock<Counter>('next', [1, 2, 3, 4, 5]);
 */
export declare function createSequenceMock<T extends object>(methodName: keyof T, values: unknown[]): MockedInterface<T>;
/**
 * Interaction recorder for complex behavior verification
 * Tracks all calls across multiple mocks
 *
 * @example
 * const recorder = new InteractionRecorder();
 * recorder.track('repo', mockRepo);
 * recorder.track('notifier', mockNotifier);
 * await service.process();
 * expect(recorder.getInteractionOrder()).toEqual(['repo.save', 'notifier.notify']);
 */
export declare class InteractionRecorder {
    private interactions;
    track<T extends object>(name: string, mock: MockedInterface<T>): void;
    getInteractions(): Array<{
        name: string;
        method: string;
        args: unknown[];
    }>;
    getInteractionOrder(): string[];
    clear(): void;
}
//# sourceMappingURL=create-mock.d.ts.map