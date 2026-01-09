/**
 * V3 Message Bus
 * High-performance inter-agent communication system
 * Target: 1000+ messages/second throughput
 */
import { EventEmitter } from 'events';
import { Message, MessageAck, MessageBusConfig, MessageBusStats, MessageType, IMessageBus } from './types.js';
export declare class MessageBus extends EventEmitter implements IMessageBus {
    private config;
    private queues;
    private subscriptions;
    private pendingAcks;
    private processingInterval?;
    private statsInterval?;
    private messageCounter;
    private stats;
    private startTime;
    private messageHistory;
    private messageHistoryIndex;
    private static readonly MAX_HISTORY_SIZE;
    constructor(config?: Partial<MessageBusConfig>);
    initialize(config?: MessageBusConfig): Promise<void>;
    shutdown(): Promise<void>;
    private generateMessageId;
    send(message: Omit<Message, 'id' | 'timestamp'>): Promise<string>;
    broadcast(message: Omit<Message, 'id' | 'timestamp' | 'to'>): Promise<string>;
    private enqueue;
    private addToQueue;
    subscribe(agentId: string, callback: (message: Message) => void, filter?: MessageType[]): void;
    unsubscribe(agentId: string): void;
    acknowledge(ack: MessageAck): Promise<void>;
    private startProcessing;
    private processQueues;
    private deliverMessage;
    private handleAckTimeout;
    private handleAckFailure;
    private handleDeliveryError;
    private startStatsCollection;
    private calculateMessagesPerSecond;
    private updateLatencyStats;
    getStats(): MessageBusStats;
    getQueueDepth(): number;
    getMessages(agentId: string): Message[];
    hasPendingMessages(agentId: string): boolean;
    getMessage(messageId: string): Message | undefined;
}
export declare function createMessageBus(config?: Partial<MessageBusConfig>): MessageBus;
//# sourceMappingURL=message-bus.d.ts.map