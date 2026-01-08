/**
 * @neural-trader/agentic-accounting-core
 *
 * Core library for agentic accounting system with tax calculations,
 * compliance checking, and forensic analysis capabilities.
 */

// Export all types
export * from './types/index.js';

// Export database client
export * from './database/index.js';

// Export utilities
export * from './utils/index.js';

// Export AgentDB backward compatibility layer
export * from './agentdb-compat.js';
export { default as AgentDB } from './agentdb-compat.js';
