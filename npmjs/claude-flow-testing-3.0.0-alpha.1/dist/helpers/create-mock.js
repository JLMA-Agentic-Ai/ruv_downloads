/**
 * V3 Claude-Flow Mock Factory
 *
 * London School TDD Mock Creation Utilities
 * - Creates type-safe mocks for behavior verification
 * - Supports deep mocking for complex objects
 * - Enables interaction tracking for behavior testing
 */
import { vi } from 'vitest';
/**
 * Create a shallow mock of an interface
 * Each method becomes a vi.fn() for behavior verification
 *
 * @example
 * const mockRepo = createMock<UserRepository>();
 * mockRepo.findById.mockResolvedValue(user);
 * expect(mockRepo.save).toHaveBeenCalledWith(user);
 */
export function createMock() {
    return new Proxy({}, {
        get: (target, prop) => {
            if (typeof prop === 'string' && !(prop in target)) {
                target[prop] = vi.fn();
            }
            return target[prop];
        },
    });
}
/**
 * Create a deep mock that handles nested objects
 * Useful for complex interfaces with nested dependencies
 *
 * @example
 * const mockService = createDeepMock<ComplexService>();
 * mockService.nested.method.mockReturnValue(result);
 */
export function createDeepMock() {
    const cache = new Map();
    return new Proxy({}, {
        get: (target, prop) => {
            if (!cache.has(prop)) {
                const mock = vi.fn();
                // Allow chaining for nested access
                mock.mockReturnValue =
                    mock.mockReturnValue.bind(mock);
                cache.set(prop, mock);
            }
            return cache.get(prop);
        },
    });
}
/**
 * Create a spy mock that wraps an existing object
 * Preserves original behavior while enabling verification
 *
 * @example
 * const spied = createSpyMock(realService);
 * await spied.process();
 * expect(spied.process).toHaveBeenCalled();
 */
export function createSpyMock(target) {
    const spied = { ...target };
    for (const key of Object.keys(target)) {
        const value = target[key];
        if (typeof value === 'function') {
            spied[key] = vi.fn(value.bind(target));
        }
    }
    return spied;
}
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
export function createMockWithBehavior(implementations) {
    const mock = createMock();
    for (const [key, impl] of Object.entries(implementations)) {
        if (typeof impl === 'function') {
            mock[key].mockImplementation(impl);
        }
    }
    return mock;
}
/**
 * Create a mock that fails on first call, succeeds on retry
 * Useful for testing retry logic and error handling
 *
 * @example
 * const mockApi = createRetryMock<ApiClient>('fetch', new Error('Network'), data);
 */
export function createRetryMock(methodName, firstError, successValue) {
    const mock = createMock();
    mock[methodName]
        .mockRejectedValueOnce(firstError)
        .mockResolvedValue(successValue);
    return mock;
}
/**
 * Create a sequence mock that returns different values per call
 * Useful for testing stateful interactions
 *
 * @example
 * const mockCounter = createSequenceMock<Counter>('next', [1, 2, 3, 4, 5]);
 */
export function createSequenceMock(methodName, values) {
    const mock = createMock();
    const fn = mock[methodName];
    values.forEach((value, index) => {
        if (index === values.length - 1) {
            fn.mockReturnValue(value);
        }
        else {
            fn.mockReturnValueOnce(value);
        }
    });
    return mock;
}
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
export class InteractionRecorder {
    interactions = [];
    track(name, mock) {
        for (const key of Object.keys(mock)) {
            const method = mock[key];
            if (typeof method?.mockImplementation === 'function') {
                const original = method.getMockImplementation();
                method.mockImplementation((...args) => {
                    this.interactions.push({
                        name,
                        method: key,
                        args,
                        timestamp: Date.now(),
                    });
                    return original?.(...args);
                });
            }
        }
    }
    getInteractions() {
        return this.interactions.map(({ name, method, args }) => ({ name, method, args }));
    }
    getInteractionOrder() {
        return this.interactions.map(({ name, method }) => `${name}.${method}`);
    }
    clear() {
        this.interactions = [];
    }
}
//# sourceMappingURL=create-mock.js.map