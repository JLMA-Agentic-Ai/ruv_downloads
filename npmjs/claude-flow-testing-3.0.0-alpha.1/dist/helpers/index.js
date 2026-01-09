/**
 * V3 Claude-Flow Test Helpers Index
 *
 * Central export for all test helpers
 */
// Mock factory utilities
export { createMock, createDeepMock, createSpyMock, createMockWithBehavior, createRetryMock, createSequenceMock, InteractionRecorder, } from './create-mock.js';
// Test application builder
export { createTestApplication, } from './test-application.js';
// Swarm test instance
export { createSwarmTestInstance, SwarmTestInstance, } from './swarm-instance.js';
// Custom assertions (legacy)
export { assertCallSequence, assertNotCalledWith, assertInteractionCount, assertAllCalled, assertNoneCalled, assertContractCompliance, assertTimingWithin, assertTimingRange, assertThrowsWithMessage, assertEventPublished, assertMockSequence, assertNoSensitiveDataLogged, assertPerformanceTarget, } from './assertions.js';
// Test utilities (waitFor, retry, timeout, etc.)
export { waitFor, waitUntilChanged, retry, withTimeout, sleep, createDeferred, parallelLimit, measureTime, createMockClock, createTestEmitter, createCallSpy, createMockStream, collectStream, generateTestId, createTestContext, expectToReject, createTrackedMock, TimeoutError, } from './test-utils.js';
// Mock factory (comprehensive service mocks)
export { createMockEventBus, createMockTaskManager, createMockAgentLifecycle, createMockMemoryService, createMockSecurityService, createMockSwarmCoordinator, createMockMCPClient, createMockLogger, createMockApplication, resetMockApplication, } from './mock-factory.js';
// Assertion helpers (enhanced)
export { assertCalledWithPattern, assertEventOrder, assertEventNotPublished, assertMocksCalledInOrder, assertCalledNTimesWith, assertCompletesWithin, assertThrowsError, assertNoSensitiveData, assertMatchesSnapshot, assertV3PerformanceTargets, assertValidDomainObject, assertOnlyCalledWithAllowed, assertPartialOrder, assertAllPass, assertNonePass, assertSameElements, assertMockReturnsSequence, assertValidStateTransition, assertRetryPattern, assertDependencyInjected, registerCustomMatchers, } from './assertion-helpers.js';
// Setup and teardown helpers
export { createSetupContext, getGlobalContext, resetGlobalContext, configureTestEnvironment, createTestSuite, createTestScope, createInMemoryDatabaseHelper, createNetworkTestHelper, createInMemoryFileSystemHelper, createPerformanceTestHelper, setupV3Tests, flushPromises, withTestTimeout, } from './setup-teardown.js';
//# sourceMappingURL=index.js.map