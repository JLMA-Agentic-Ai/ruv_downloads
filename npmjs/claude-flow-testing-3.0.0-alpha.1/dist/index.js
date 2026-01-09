/**
 * @claude-flow/testing - Testing Module
 * TDD London School framework and test utilities for V3 Claude-Flow
 *
 * Based on ADR-008 (Vitest over Jest)
 *
 * @example
 * // Basic test setup
 * import {
 *   setupV3Tests,
 *   createMockApplication,
 *   agentConfigs,
 *   swarmConfigs,
 * } from '@claude-flow/testing';
 *
 * setupV3Tests();
 *
 * describe('MyModule', () => {
 *   const app = createMockApplication();
 *
 *   it('should work', async () => {
 *     const agent = await app.agentLifecycle.spawn(agentConfigs.queenCoordinator);
 *     expect(agent.success).toBe(true);
 *   });
 * });
 */
// Test setup - Global configuration and custom matchers
export * from './setup.js';
// Helpers - Mock factories, utilities, and assertions
// Explicitly export to avoid duplicates with fixtures
export { 
// create-mock.js
createMock, createDeepMock, createSpyMock, createMockWithBehavior, createRetryMock, createSequenceMock, InteractionRecorder, } from './helpers/create-mock.js';
export { 
// test-application.js
createTestApplication, } from './helpers/test-application.js';
export { 
// swarm-instance.js - Only export what's not in fixtures
createSwarmTestInstance, SwarmTestInstance, } from './helpers/swarm-instance.js';
export { 
// assertions.js
assertCallSequence, assertNotCalledWith, assertInteractionCount, assertAllCalled, assertNoneCalled, assertContractCompliance, assertTimingWithin, assertTimingRange, assertThrowsWithMessage, assertEventPublished, assertMockSequence, assertNoSensitiveDataLogged, assertPerformanceTarget, } from './helpers/assertions.js';
export { 
// test-utils.js
waitFor, waitUntilChanged, retry, withTimeout, sleep, createDeferred, parallelLimit, measureTime, createMockClock, createTestEmitter, createCallSpy, createMockStream, collectStream, generateTestId, createTestContext, expectToReject, createTrackedMock, TimeoutError, } from './helpers/test-utils.js';
export { 
// mock-factory.js - Only non-duplicate exports
createMockEventBus, createMockTaskManager, createMockAgentLifecycle, createMockMemoryService, createMockSecurityService, createMockSwarmCoordinator, createMockMCPClient, createMockLogger, createMockApplication, resetMockApplication, } from './helpers/mock-factory.js';
export { 
// assertion-helpers.js
assertCalledWithPattern, assertEventOrder, assertEventNotPublished, assertMocksCalledInOrder, assertCalledNTimesWith, assertCompletesWithin, assertThrowsError, assertNoSensitiveData, assertMatchesSnapshot, assertV3PerformanceTargets, assertValidDomainObject, assertOnlyCalledWithAllowed, assertPartialOrder, assertAllPass, assertNonePass, assertSameElements, assertMockReturnsSequence, assertValidStateTransition, assertRetryPattern, assertDependencyInjected, registerCustomMatchers, } from './helpers/assertion-helpers.js';
export { 
// setup-teardown.js
createSetupContext, getGlobalContext, resetGlobalContext, configureTestEnvironment, createTestSuite, createTestScope, createInMemoryDatabaseHelper, createNetworkTestHelper, createInMemoryFileSystemHelper, createPerformanceTestHelper, setupV3Tests, flushPromises, withTestTimeout, } from './helpers/setup-teardown.js';
// Fixtures - Pre-defined test data (canonical source for shared types)
export * from './fixtures/index.js';
// Mocks - Service mock implementations (explicit to avoid duplicates)
export { MockAgentDB, MockSwarmCoordinator, MockSwarmAgent, MockMemoryService, MockEventBus, MockSecurityService, createMockServices, resetMockServices, } from './mocks/mock-services.js';
export { MockMCPClient, MockMCPServer, MockMCPConnection, MCPClientError, createStandardMockMCPClient, createFailingMockMCPClient, createSlowMockMCPClient, } from './mocks/mock-mcp-client.js';
// Regression Testing - Prevent capability degradation
export * from './regression/index.js';
// V2 Compatibility Testing - Validate backward compatibility
export * from './v2-compat/index.js';
// Re-export commonly used Vitest utilities
export { vi, expect, describe, it, test, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
//# sourceMappingURL=index.js.map