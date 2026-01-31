"use strict";
/**
 * Base Agent Class
 *
 * Foundation for all specialized accounting agents with:
 * - ReasoningBank integration for learning
 * - Memory coordination via hooks
 * - Performance tracking
 * - Error handling patterns
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const events_1 = require("events");
class BaseAgent extends events_1.EventEmitter {
    config;
    isRunning = false;
    decisions = [];
    logger = console;
    constructor(config) {
        super();
        this.config = config;
    }
    /**
     * Learn from experience - placeholder for ReasoningBank integration
     */
    async learn(data) {
        if (this.config.enableLearning) {
            // Store learning data via hooks in production
            this.logger.debug(`[${this.config.agentId}] Learning:`, data);
        }
    }
    /**
     * Start the agent
     */
    async start() {
        if (this.isRunning) {
            throw new Error(`Agent ${this.config.agentId} is already running`);
        }
        this.isRunning = true;
        this.emit('started', { agentId: this.config.agentId, timestamp: Date.now() });
        if (this.config.logLevel !== 'error') {
            console.log(`[${this.config.agentId}] Agent started`);
        }
    }
    /**
     * Stop the agent
     */
    async stop() {
        this.isRunning = false;
        this.emit('stopped', { agentId: this.config.agentId, timestamp: Date.now() });
        if (this.config.logLevel !== 'error') {
            console.log(`[${this.config.agentId}] Agent stopped`);
        }
    }
    /**
     * Log a decision for ReasoningBank learning
     */
    async logDecision(scenario, decision, rationale, outcome = 'PENDING', metadata) {
        const log = {
            scenario,
            decision,
            rationale,
            outcome,
            timestamp: Date.now(),
            metadata,
        };
        this.decisions.push(log);
        this.emit('decision', log);
        if (this.config.enableLearning) {
            // Store in ReasoningBank via hooks
            // This would be called via hooks in production
            if (this.config.logLevel === 'debug') {
                console.log(`[${this.config.agentId}] Decision logged:`, {
                    scenario,
                    decision,
                    outcome,
                });
            }
        }
    }
    /**
     * Execute task with metrics tracking
     */
    async executeWithMetrics(taskFn) {
        const startTime = Date.now();
        const startMemory = this.config.enableMetrics
            ? process.memoryUsage().heapUsed
            : undefined;
        try {
            const data = await taskFn();
            const endTime = Date.now();
            const endMemory = this.config.enableMetrics
                ? process.memoryUsage().heapUsed
                : undefined;
            return {
                success: true,
                data,
                metrics: {
                    startTime,
                    endTime,
                    duration: endTime - startTime,
                    memoryUsed: startMemory && endMemory ? endMemory - startMemory : undefined,
                },
            };
        }
        catch (error) {
            const endTime = Date.now();
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
                metrics: {
                    startTime,
                    endTime,
                    duration: endTime - startTime,
                },
            };
        }
    }
    /**
     * Get agent status
     */
    getStatus() {
        return {
            agentId: this.config.agentId,
            agentType: this.config.agentType,
            isRunning: this.isRunning,
            decisionCount: this.decisions.length,
        };
    }
    /**
     * Get recent decisions for analysis
     */
    getRecentDecisions(limit = 10) {
        return this.decisions.slice(-limit);
    }
    /**
     * Clear decision history (for testing or memory management)
     */
    clearDecisions() {
        this.decisions = [];
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=agent.js.map