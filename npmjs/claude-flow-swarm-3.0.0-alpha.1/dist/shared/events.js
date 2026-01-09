/**
 * @claude-flow/swarm - Standalone Event System
 * Event-driven communication for multi-agent swarm coordination
 *
 * This file provides a complete event system for standalone operation
 * without dependency on @claude-flow/shared
 */
// =============================================================================
// Event Bus Implementation
// =============================================================================
export class EventBus {
    handlers = new Map();
    history = [];
    maxHistorySize;
    constructor(options = {}) {
        this.maxHistorySize = options.maxHistorySize ?? 10000;
    }
    subscribe(eventType, handler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, new Set());
        }
        const handlers = this.handlers.get(eventType);
        handlers.add(handler);
        return () => {
            handlers.delete(handler);
        };
    }
    subscribeAll(handler) {
        if (!this.handlers.has('*')) {
            this.handlers.set('*', new Set());
        }
        const handlers = this.handlers.get('*');
        handlers.add(handler);
        return () => {
            handlers.delete(handler);
        };
    }
    async emit(event) {
        this.addToHistory(event);
        const typeHandlers = this.handlers.get(event.type) ?? new Set();
        const allHandlers = this.handlers.get('*') ?? new Set();
        const allPromises = [];
        for (const handler of typeHandlers) {
            allPromises.push(this.safeExecute(handler, event));
        }
        for (const handler of allHandlers) {
            allPromises.push(this.safeExecute(handler, event));
        }
        await Promise.all(allPromises);
    }
    emitSync(event) {
        this.addToHistory(event);
        const typeHandlers = this.handlers.get(event.type) ?? new Set();
        const allHandlers = this.handlers.get('*') ?? new Set();
        for (const handler of typeHandlers) {
            try {
                const result = handler(event);
                if (result instanceof Promise) {
                    result.catch(err => console.error(`Event handler error: ${err}`));
                }
            }
            catch (err) {
                console.error(`Event handler error: ${err}`);
            }
        }
        for (const handler of allHandlers) {
            try {
                const result = handler(event);
                if (result instanceof Promise) {
                    result.catch(err => console.error(`Event handler error: ${err}`));
                }
            }
            catch (err) {
                console.error(`Event handler error: ${err}`);
            }
        }
    }
    getHistory(filter) {
        let events = [...this.history];
        if (filter?.types?.length) {
            events = events.filter(e => filter.types.includes(e.type));
        }
        if (filter?.sources?.length) {
            events = events.filter(e => filter.sources.includes(e.source));
        }
        if (filter?.since) {
            events = events.filter(e => e.timestamp >= filter.since);
        }
        if (filter?.until) {
            events = events.filter(e => e.timestamp <= filter.until);
        }
        if (filter?.limit) {
            events = events.slice(-filter.limit);
        }
        return events;
    }
    clear() {
        this.history = [];
    }
    addToHistory(event) {
        this.history.push(event);
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-Math.floor(this.maxHistorySize / 2));
        }
    }
    async safeExecute(handler, event) {
        try {
            await handler(event);
        }
        catch (err) {
            console.error(`Event handler error for ${event.type}: ${err}`);
        }
    }
}
// =============================================================================
// Event Factory Functions
// =============================================================================
let eventCounter = 0;
export function createEvent(type, source, payload) {
    return {
        id: `evt-${Date.now()}-${++eventCounter}`,
        type,
        timestamp: Date.now(),
        source,
        payload
    };
}
// Helper function to generate event IDs
function generateEventId() {
    return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
// Helper function to create a base SwarmEvent
function createSwarmEvent(type, source, payload) {
    return {
        id: generateEventId(),
        type,
        timestamp: Date.now(),
        source,
        payload,
    };
}
// Agent events
export function agentSpawnedEvent(agentId, state) {
    return createSwarmEvent('agent:spawned', agentId, { agentId, state });
}
export function agentStatusChangedEvent(agentId, previousStatus, newStatus) {
    return createEvent('agent:status-changed', agentId, { previousStatus, newStatus });
}
export function agentTaskAssignedEvent(agentId, taskId) {
    return createEvent('agent:task-assigned', 'swarm', { agentId, taskId });
}
export function agentTaskCompletedEvent(agentId, taskId, result) {
    return createEvent('agent:task-completed', agentId, { taskId, result });
}
export function agentErrorEvent(agentId, error) {
    return createEvent('agent:error', agentId, {
        message: error.message,
        stack: error.stack
    });
}
// Task Events
export function taskCreatedEvent(taskId, spec) {
    return createEvent('task:created', 'swarm', { taskId, type: spec.type, title: spec.title });
}
export function taskQueuedEvent(taskId, position) {
    return createEvent('task:queued', 'swarm', { taskId, position });
}
export function taskAssignedEvent(taskId, agentId) {
    return createEvent('task:assigned', 'swarm', { taskId, agentId });
}
export function taskStartedEvent(taskId, agentId) {
    return createEvent('task:started', agentId, { taskId });
}
export function taskCompletedEvent(taskId, result) {
    return createEvent('task:completed', 'swarm', { taskId, result });
}
export function taskFailedEvent(taskId, error) {
    return createEvent('task:failed', 'swarm', {
        taskId,
        error: error.message,
        stack: error.stack
    });
}
export function taskBlockedEvent(taskId, reason, blockingTask) {
    return createEvent('task:blocked', 'swarm', { taskId, reason, blockingTask });
}
// Swarm Events
export function swarmInitializedEvent(source, config) {
    return createEvent('swarm:initialized', source, { config });
}
export function swarmPhaseChangedEvent(source, previousPhase, newPhase) {
    return createEvent('swarm:phase-changed', source, { previousPhase, newPhase });
}
export function swarmMilestoneReachedEvent(milestoneId, name) {
    return createEvent('swarm:milestone-reached', 'swarm', { milestoneId, name });
}
export function swarmErrorEvent(error) {
    return createEvent('swarm:error', 'swarm', {
        message: error.message,
        stack: error.stack
    });
}
//# sourceMappingURL=events.js.map