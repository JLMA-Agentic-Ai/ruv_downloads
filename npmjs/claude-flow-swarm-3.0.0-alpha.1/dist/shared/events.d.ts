/**
 * @claude-flow/swarm - Standalone Event System
 * Event-driven communication for multi-agent swarm coordination
 *
 * This file provides a complete event system for standalone operation
 * without dependency on @claude-flow/shared
 */
import type { SwarmEvent, EventType, EventHandler, AgentId } from './types.js';
export interface IEventBus {
    subscribe<T>(eventType: EventType, handler: EventHandler<T>): () => void;
    subscribeAll(handler: EventHandler): () => void;
    emit<T>(event: SwarmEvent<T>): Promise<void>;
    emitSync<T>(event: SwarmEvent<T>): void;
    getHistory(filter?: EventFilter): SwarmEvent[];
    clear(): void;
}
export interface EventFilter {
    types?: EventType[];
    sources?: (AgentId | 'swarm')[];
    since?: number;
    until?: number;
    limit?: number;
}
export declare class EventBus implements IEventBus {
    private handlers;
    private history;
    private maxHistorySize;
    constructor(options?: {
        maxHistorySize?: number;
    });
    subscribe<T>(eventType: EventType, handler: EventHandler<T>): () => void;
    subscribeAll(handler: EventHandler): () => void;
    emit<T>(event: SwarmEvent<T>): Promise<void>;
    emitSync<T>(event: SwarmEvent<T>): void;
    getHistory(filter?: EventFilter): SwarmEvent[];
    clear(): void;
    private addToHistory;
    private safeExecute;
}
export declare function createEvent<T>(type: EventType, source: AgentId | 'swarm', payload: T): SwarmEvent<T>;
export declare function agentSpawnedEvent(agentId: string, state: unknown): SwarmEvent<{
    agentId: string;
    state: unknown;
}>;
export declare function agentStatusChangedEvent(agentId: AgentId, previousStatus: string, newStatus: string): SwarmEvent;
export declare function agentTaskAssignedEvent(agentId: AgentId, taskId: string): SwarmEvent;
export declare function agentTaskCompletedEvent(agentId: AgentId, taskId: string, result: unknown): SwarmEvent;
export declare function agentErrorEvent(agentId: AgentId, error: Error): SwarmEvent;
export declare function taskCreatedEvent(taskId: string, spec: {
    type: string;
    title: string;
}): SwarmEvent;
export declare function taskQueuedEvent(taskId: string, position: number): SwarmEvent;
export declare function taskAssignedEvent(taskId: string, agentId: AgentId): SwarmEvent;
export declare function taskStartedEvent(taskId: string, agentId: AgentId): SwarmEvent;
export declare function taskCompletedEvent(taskId: string, result: unknown): SwarmEvent;
export declare function taskFailedEvent(taskId: string, error: Error): SwarmEvent;
export declare function taskBlockedEvent(taskId: string, reason: string, blockingTask: string): SwarmEvent;
export declare function swarmInitializedEvent(source: string, config: unknown): SwarmEvent;
export declare function swarmPhaseChangedEvent(source: string, previousPhase: string, newPhase: string): SwarmEvent;
export declare function swarmMilestoneReachedEvent(milestoneId: string, name: string): SwarmEvent;
export declare function swarmErrorEvent(error: Error): SwarmEvent;
//# sourceMappingURL=events.d.ts.map