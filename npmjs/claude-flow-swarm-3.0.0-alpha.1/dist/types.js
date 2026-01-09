/**
 * V3 Unified Swarm Coordinator Types
 * Consolidated type definitions for the unified swarm coordination system
 */
// ===== CONSTANTS =====
export const SWARM_CONSTANTS = {
    DEFAULT_HEARTBEAT_INTERVAL_MS: 5000,
    DEFAULT_HEALTH_CHECK_INTERVAL_MS: 10000,
    DEFAULT_TASK_TIMEOUT_MS: 300000,
    DEFAULT_CONSENSUS_TIMEOUT_MS: 30000,
    DEFAULT_MESSAGE_TTL_MS: 60000,
    DEFAULT_MAX_AGENTS: 100,
    DEFAULT_MAX_TASKS: 1000,
    DEFAULT_CONSENSUS_THRESHOLD: 0.66,
    MAX_QUEUE_SIZE: 10000,
    MAX_RETRIES: 3,
    COORDINATION_LATENCY_TARGET_MS: 100,
    MESSAGES_PER_SECOND_TARGET: 1000,
};
// ===== TYPE GUARDS =====
export function isAgentId(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'swarmId' in obj &&
        'type' in obj);
}
export function isTaskId(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'swarmId' in obj &&
        'sequence' in obj);
}
export function isMessage(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'type' in obj &&
        'from' in obj &&
        'to' in obj);
}
//# sourceMappingURL=types.js.map