/**
 * V3 Claude-Flow Test Setup
 *
 * London School TDD Global Configuration
 * - Initializes mock infrastructure
 * - Sets up global test utilities
 * - Configures behavior verification helpers
 */
import { vi } from 'vitest';
export { vi, expect } from 'vitest';
export { createMock, createDeepMock, createSpyMock } from './helpers/create-mock.js';
export { createTestApplication } from './helpers/test-application.js';
export { createSwarmTestInstance } from './helpers/swarm-instance.js';
interface CustomMatchers<R = unknown> {
    toHaveBeenCalledWithInteraction(expected: unknown[]): R;
    toHaveBeenCalledBefore(other: ReturnType<typeof vi.fn>): R;
    toHaveInteractionCount(expected: number): R;
    toHaveBeenCalledWithPattern(pattern: Record<string, unknown>): R;
    toHaveEventType(eventType: string): R;
    toMeetV3PerformanceTargets(): R;
    toBeValidTransition(from: string, allowedTransitions: Record<string, string[]>): R;
}
declare module 'vitest' {
    interface Assertion<T> extends CustomMatchers<T> {
    }
    interface AsymmetricMatchersContaining extends CustomMatchers {
    }
}
/**
 * Test configuration constants
 */
export declare const TEST_CONFIG: {
    readonly SECURITY_COVERAGE_TARGET: 0.95;
    readonly FLASH_ATTENTION_SPEEDUP_MIN: 2.49;
    readonly FLASH_ATTENTION_SPEEDUP_MAX: 7.47;
    readonly AGENTDB_SEARCH_IMPROVEMENT_MIN: 150;
    readonly AGENTDB_SEARCH_IMPROVEMENT_MAX: 12500;
    readonly MEMORY_REDUCTION_TARGET: 0.5;
    readonly ASYNC_TIMEOUT: 5000;
    readonly INTEGRATION_TIMEOUT: 10000;
    readonly ACCEPTANCE_TIMEOUT: 30000;
};
//# sourceMappingURL=setup.d.ts.map