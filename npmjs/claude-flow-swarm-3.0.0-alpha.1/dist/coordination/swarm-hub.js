/**
 * V3 Swarm Hub - COMPATIBILITY LAYER (ADR-003)
 *
 * DEPRECATION NOTICE:
 * This is a THIN FACADE over UnifiedSwarmCoordinator for backward compatibility.
 * All operations are delegated to the canonical UnifiedSwarmCoordinator.
 *
 * For new code, use UnifiedSwarmCoordinator directly:
 * ```typescript
 * import { createUnifiedSwarmCoordinator } from '@claude-flow/swarm';
 * const coordinator = createUnifiedSwarmCoordinator(config);
 * await coordinator.initialize();
 * ```
 *
 * ADR-003 Decision:
 * - ONE canonical coordination engine: UnifiedSwarmCoordinator
 * - SwarmHub maintained ONLY for compatibility with existing code
 * - All core logic delegated to UnifiedSwarmCoordinator
 *
 * Based on ADR-001 (agentic-flow integration), ADR-003 (Single Coordination Engine),
 * and the 15-Agent Swarm Architecture
 */
import { V3_PERFORMANCE_TARGETS } from '../shared/types';
import { EventBus, swarmInitializedEvent, swarmPhaseChangedEvent, swarmMilestoneReachedEvent } from '../shared/events';
import { createAgentRegistry } from './agent-registry';
import { createTaskOrchestrator } from './task-orchestrator';
import { createUnifiedSwarmCoordinator } from '../unified-coordinator';
// =============================================================================
// Swarm Hub Implementation - COMPATIBILITY LAYER
// =============================================================================
/**
 * @deprecated Use UnifiedSwarmCoordinator directly instead.
 * This class is maintained for backward compatibility only.
 *
 * Migration guide:
 * ```typescript
 * // OLD:
 * const hub = createSwarmHub();
 * await hub.initialize();
 *
 * // NEW:
 * const coordinator = createUnifiedSwarmCoordinator();
 * await coordinator.initialize();
 * ```
 */
export class SwarmHub {
    // Core coordinator - ALL operations delegate to this
    coordinator;
    // Compatibility layer state
    eventBus;
    agentRegistry;
    taskOrchestrator;
    currentPhase = 'phase-1-foundation';
    phases;
    milestones = new Map();
    messageHandlers = new Set();
    messageCounter = 0;
    startTime = 0;
    constructor(eventBus) {
        this.eventBus = eventBus ?? new EventBus();
        this.agentRegistry = createAgentRegistry(this.eventBus);
        this.taskOrchestrator = createTaskOrchestrator(this.eventBus, this.agentRegistry);
        this.phases = this.createPhaseDefinitions();
        // Initialize the canonical coordinator
        this.coordinator = createUnifiedSwarmCoordinator(this.convertToCoordinatorConfig());
    }
    // ==========================================================================
    // Lifecycle - DELEGATES to UnifiedSwarmCoordinator
    // ==========================================================================
    /**
     * @deprecated Delegates to UnifiedSwarmCoordinator.initialize()
     */
    async initialize(config) {
        this.startTime = Date.now();
        this.initializeMilestones();
        // Start compatibility layer components
        this.agentRegistry.startHealthChecks();
        // DELEGATE to canonical coordinator
        await this.coordinator.initialize();
        await this.eventBus.emit(swarmInitializedEvent('swarm-hub', {
            topology: this.coordinator.getTopology(),
            maxAgents: 15,
            performanceTargets: V3_PERFORMANCE_TARGETS
        }));
        console.log(`[SwarmHub] COMPATIBILITY LAYER: Initialized via UnifiedSwarmCoordinator`);
    }
    /**
     * @deprecated Delegates to UnifiedSwarmCoordinator.shutdown()
     */
    async shutdown() {
        // Stop compatibility layer components
        this.agentRegistry.stopHealthChecks();
        // DELEGATE to canonical coordinator
        await this.coordinator.shutdown();
        console.log('[SwarmHub] COMPATIBILITY LAYER: Shutdown complete');
    }
    /**
     * @deprecated Check UnifiedSwarmCoordinator state instead
     */
    isInitialized() {
        const state = this.coordinator.getState();
        return state.status !== 'stopped' && state.status !== 'initializing';
    }
    // ==========================================================================
    // Agent Management
    // ==========================================================================
    async spawnAgent(agentId) {
        this.ensureInitialized();
        return this.agentRegistry.spawn(agentId);
    }
    async spawnAllAgents() {
        this.ensureInitialized();
        const results = new Map();
        const allAgents = this.agentRegistry.getAllAgents();
        const sortedAgents = allAgents.sort((a, b) => a.priority - b.priority);
        for (const agent of sortedAgents) {
            try {
                const state = await this.spawnAgent(agent.id);
                results.set(agent.id, state);
            }
            catch (err) {
                console.error(`[SwarmHub] Failed to spawn agent ${agent.id}: ${err}`);
            }
        }
        return results;
    }
    async spawnAgentsByDomain(domain) {
        this.ensureInitialized();
        const domainAgents = this.agentRegistry.getAgentsByDomain(domain);
        const results = [];
        for (const agent of domainAgents) {
            try {
                const state = await this.spawnAgent(agent.id);
                results.push(state);
            }
            catch (err) {
                console.error(`[SwarmHub] Failed to spawn agent ${agent.id}: ${err}`);
            }
        }
        return results;
    }
    async terminateAgent(agentId) {
        this.ensureInitialized();
        return this.agentRegistry.terminate(agentId);
    }
    // ==========================================================================
    // Task Management
    // ==========================================================================
    submitTask(spec) {
        this.ensureInitialized();
        return this.taskOrchestrator.createTask(spec);
    }
    submitBatchTasks(specs) {
        this.ensureInitialized();
        return this.taskOrchestrator.createBatchTasks(specs);
    }
    assignNextTask(agentId) {
        this.ensureInitialized();
        const nextTask = this.taskOrchestrator.getNextTask(agentId);
        if (nextTask) {
            this.taskOrchestrator.queueTask(nextTask.id);
            this.taskOrchestrator.assignTask(nextTask.id, agentId);
            this.taskOrchestrator.startTask(nextTask.id);
        }
        return nextTask;
    }
    completeTask(taskId, result) {
        this.ensureInitialized();
        if (result.success) {
            this.taskOrchestrator.completeTask(taskId, result);
        }
        else {
            this.taskOrchestrator.failTask(taskId, result.error ?? new Error('Unknown error'));
        }
    }
    // ==========================================================================
    // Phase Management
    // ==========================================================================
    getCurrentPhase() {
        return this.currentPhase;
    }
    advancePhase() {
        const phaseOrder = [
            'phase-1-foundation',
            'phase-2-core',
            'phase-3-integration',
            'phase-4-release'
        ];
        const currentIndex = phaseOrder.indexOf(this.currentPhase);
        if (currentIndex < phaseOrder.length - 1) {
            const previousPhase = this.currentPhase;
            this.currentPhase = phaseOrder[currentIndex + 1];
            this.eventBus.emitSync(swarmPhaseChangedEvent('swarm-hub', previousPhase, this.currentPhase));
            console.log(`[SwarmHub] Advanced from ${previousPhase} to ${this.currentPhase}`);
        }
        return this.currentPhase;
    }
    getPhaseDefinition(phaseId) {
        const phase = this.phases.get(phaseId);
        if (!phase) {
            throw new Error(`Phase ${phaseId} not found`);
        }
        return phase;
    }
    // ==========================================================================
    // Milestone Tracking
    // ==========================================================================
    getMilestones() {
        return Array.from(this.milestones.values());
    }
    completeMilestone(milestoneId) {
        const milestone = this.milestones.get(milestoneId);
        if (!milestone) {
            throw new Error(`Milestone ${milestoneId} not found`);
        }
        milestone.status = 'completed';
        milestone.completedAt = Date.now();
        this.eventBus.emitSync(swarmMilestoneReachedEvent(milestoneId, milestone.name));
        console.log(`[SwarmHub] Milestone completed: ${milestone.name}`);
    }
    // ==========================================================================
    // Messaging
    // ==========================================================================
    sendMessage(message) {
        const fullMessage = {
            ...message,
            id: `msg-${Date.now()}-${++this.messageCounter}`,
            timestamp: Date.now()
        };
        for (const handler of this.messageHandlers) {
            try {
                handler(fullMessage);
            }
            catch (err) {
                console.error(`[SwarmHub] Message handler error: ${err}`);
            }
        }
    }
    broadcast(from, type, payload) {
        this.sendMessage({
            type,
            from,
            to: 'broadcast',
            payload,
            correlationId: null
        });
    }
    onMessage(handler) {
        this.messageHandlers.add(handler);
        return () => {
            this.messageHandlers.delete(handler);
        };
    }
    // ==========================================================================
    // Metrics & Status
    // ==========================================================================
    getState() {
        const allAgents = this.agentRegistry.getAllAgents();
        const agents = new Map();
        for (const agent of allAgents) {
            const state = this.agentRegistry.getState(agent.id);
            if (state) {
                agents.set(agent.id, state);
            }
        }
        const allTasks = this.taskOrchestrator.getAllTasks();
        const tasks = new Map();
        for (const task of allTasks) {
            tasks.set(task.id, task);
        }
        const status = this.coordinator.getStatus();
        return {
            initialized: status.status === 'running',
            topology: status.topology,
            agents,
            tasks,
            currentPhase: this.currentPhase,
            metrics: this.getMetrics()
        };
    }
    getMetrics() {
        const activeAgents = this.agentRegistry.getActiveAgents();
        const allAgents = this.agentRegistry.getAllAgents();
        const taskMetrics = this.taskOrchestrator.getTaskMetrics();
        const idleAgents = allAgents.filter(a => {
            const state = this.agentRegistry.getState(a.id);
            return state && state.status === 'idle';
        }).length;
        const blockedAgents = allAgents.filter(a => {
            const state = this.agentRegistry.getState(a.id);
            return state && state.status === 'blocked';
        }).length;
        const totalAgentsWithState = activeAgents.length + idleAgents + blockedAgents;
        return {
            totalAgents: allAgents.length,
            activeAgents: activeAgents.length,
            idleAgents,
            blockedAgents,
            totalTasks: taskMetrics.totalTasks,
            completedTasks: taskMetrics.tasksByStatus['completed'],
            failedTasks: taskMetrics.tasksByStatus['failed'],
            pendingTasks: taskMetrics.tasksByStatus['pending'] + taskMetrics.tasksByStatus['queued'],
            averageTaskDuration: taskMetrics.averageExecutionTime,
            utilization: totalAgentsWithState > 0 ? activeAgents.length / totalAgentsWithState : 0,
            startTime: this.startTime,
            lastUpdate: Date.now()
        };
    }
    getAgentRegistry() {
        return this.agentRegistry;
    }
    getTaskOrchestrator() {
        return this.taskOrchestrator;
    }
    // ==========================================================================
    // Events
    // ==========================================================================
    onSwarmEvent(handler) {
        const unsubscribers = [
            this.eventBus.subscribe('swarm:initialized', handler),
            this.eventBus.subscribe('swarm:phase-changed', handler),
            this.eventBus.subscribe('swarm:milestone-reached', handler),
            this.eventBus.subscribe('swarm:error', handler)
        ];
        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }
    // ==========================================================================
    // Coordinator Access (ADR-003)
    // ==========================================================================
    /**
     * Get the underlying UnifiedSwarmCoordinator for direct access.
     * This is the canonical coordination engine as per ADR-003.
     *
     * Use this to access advanced features not exposed by the SwarmHub facade.
     */
    getCoordinator() {
        return this.coordinator;
    }
    // ==========================================================================
    // Private Helpers
    // ==========================================================================
    ensureInitialized() {
        const state = this.coordinator.getState();
        if (state.status === 'stopped' || state.status === 'initializing') {
            throw new Error('SwarmHub is not initialized. Call initialize() first.');
        }
    }
    convertToCoordinatorConfig() {
        return {
            topology: {
                type: 'hierarchical',
                maxAgents: 15,
                replicationFactor: 2,
                partitionStrategy: 'hash',
                failoverEnabled: true,
                autoRebalance: true,
            },
            consensus: {
                algorithm: 'raft',
                threshold: 0.66,
                timeoutMs: 5000,
                maxRounds: 10,
                requireQuorum: true,
            },
            messageBus: {
                maxQueueSize: 10000,
                processingIntervalMs: 10,
                ackTimeoutMs: 5000,
                retryAttempts: 3,
                enablePersistence: false,
                compressionEnabled: false,
            },
            maxAgents: 15,
            maxTasks: 1000,
            heartbeatIntervalMs: 5000,
            healthCheckIntervalMs: 5000,
            taskTimeoutMs: 300000,
            autoScaling: true,
            autoRecovery: true,
        };
    }
    createPhaseDefinitions() {
        const phases = new Map();
        phases.set('phase-1-foundation', {
            id: 'phase-1-foundation',
            name: 'Foundation',
            description: 'Security architecture, core design, and infrastructure setup',
            weeks: [1, 2],
            activeAgents: ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5', 'agent-6'],
            goals: [
                'Initialize swarm coordination',
                'Complete security architecture review',
                'Begin CVE fixes (CVE-1, CVE-2, CVE-3)',
                'Design core DDD architecture',
                'Modernize type system'
            ],
            milestones: []
        });
        phases.set('phase-2-core', {
            id: 'phase-2-core',
            name: 'Core Systems',
            description: 'Core implementation, memory unification, and swarm coordination',
            weeks: [3, 6],
            activeAgents: ['agent-1', 'agent-5', 'agent-6', 'agent-7', 'agent-8', 'agent-9', 'agent-13'],
            goals: [
                'Complete core module implementation',
                'Unify memory system with AgentDB (150x improvement)',
                'Merge 4 coordination systems into single SwarmCoordinator',
                'Optimize MCP server',
                'Implement TDD London School tests'
            ],
            milestones: []
        });
        phases.set('phase-3-integration', {
            id: 'phase-3-integration',
            name: 'Integration',
            description: 'agentic-flow integration, CLI modernization, and neural features',
            weeks: [7, 10],
            activeAgents: ['agent-1', 'agent-10', 'agent-11', 'agent-12', 'agent-13', 'agent-14'],
            goals: [
                'Complete agentic-flow@alpha integration',
                'Modernize CLI and hooks system',
                'Integrate Neural/SONA learning',
                'Run integration tests',
                'Initial performance benchmarks'
            ],
            milestones: []
        });
        phases.set('phase-4-release', {
            id: 'phase-4-release',
            name: 'Optimization & Release',
            description: 'Performance optimization, deployment, and v3.0.0 release',
            weeks: [11, 14],
            activeAgents: [
                'agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5', 'agent-6',
                'agent-7', 'agent-8', 'agent-9', 'agent-10', 'agent-11', 'agent-12',
                'agent-13', 'agent-14', 'agent-15'
            ],
            goals: [
                'Achieve 2.49x-7.47x Flash Attention speedup',
                'Verify 150x-12,500x AgentDB search improvement',
                'Complete deployment pipeline',
                'Final test coverage push (>90%)',
                'Release v3.0.0'
            ],
            milestones: []
        });
        return phases;
    }
    initializeMilestones() {
        const allMilestones = [
            {
                id: 'ms-security-architecture',
                name: 'Security Architecture Complete',
                description: 'All security reviews and CVE fixes implemented',
                criteria: [
                    { description: 'CVE-1 fixed', met: false, evidence: null },
                    { description: 'CVE-2 fixed', met: false, evidence: null },
                    { description: 'CVE-3 fixed', met: false, evidence: null },
                    { description: 'Security tests passing', met: false, evidence: null }
                ],
                status: 'pending',
                completedAt: null
            },
            {
                id: 'ms-core-architecture',
                name: 'Core Architecture Complete',
                description: 'DDD structure implemented with all core modules',
                criteria: [
                    { description: 'DDD bounded contexts defined', met: false, evidence: null },
                    { description: 'Core modules implemented', met: false, evidence: null },
                    { description: 'Type system modernized', met: false, evidence: null }
                ],
                status: 'pending',
                completedAt: null
            },
            {
                id: 'ms-memory-unification',
                name: 'Memory Unification Complete',
                description: 'Single memory service with AgentDB backend achieving 150x improvement',
                criteria: [
                    { description: 'AgentDB integrated', met: false, evidence: null },
                    { description: '150x search improvement verified', met: false, evidence: null },
                    { description: 'Hybrid backend working', met: false, evidence: null }
                ],
                status: 'pending',
                completedAt: null
            },
            {
                id: 'ms-swarm-coordination',
                name: 'Swarm Coordination Unified',
                description: 'Single SwarmCoordinator merging 4 systems',
                criteria: [
                    { description: 'Single CoordinationEngine', met: false, evidence: null },
                    { description: 'Pluggable strategies', met: false, evidence: null },
                    { description: '50% code reduction', met: false, evidence: null }
                ],
                status: 'pending',
                completedAt: null
            },
            {
                id: 'ms-agentic-integration',
                name: 'agentic-flow Integration Complete',
                description: 'Deep integration with agentic-flow@alpha eliminating duplicate code',
                criteria: [
                    { description: 'Agent class extends agentic-flow', met: false, evidence: null },
                    { description: 'Swarm uses agentic-flow system', met: false, evidence: null },
                    { description: '<5,000 lines of orchestration code', met: false, evidence: null }
                ],
                status: 'pending',
                completedAt: null
            },
            {
                id: 'ms-performance-targets',
                name: 'Performance Targets Met',
                description: 'All performance targets achieved and verified',
                criteria: [
                    { description: '2.49x-7.47x Flash Attention speedup', met: false, evidence: null },
                    { description: '150x-12,500x AgentDB search', met: false, evidence: null },
                    { description: '50-75% memory reduction', met: false, evidence: null },
                    { description: '<500ms startup time', met: false, evidence: null }
                ],
                status: 'pending',
                completedAt: null
            },
            {
                id: 'ms-v3-release',
                name: 'V3.0.0 Released',
                description: 'Claude-Flow v3.0.0 published to npm',
                criteria: [
                    { description: 'All tests passing (>90% coverage)', met: false, evidence: null },
                    { description: 'Documentation complete', met: false, evidence: null },
                    { description: 'npm package published', met: false, evidence: null },
                    { description: 'GitHub release created', met: false, evidence: null }
                ],
                status: 'pending',
                completedAt: null
            }
        ];
        for (const milestone of allMilestones) {
            this.milestones.set(milestone.id, milestone);
        }
        for (const [phaseId, phase] of this.phases) {
            switch (phaseId) {
                case 'phase-1-foundation':
                    phase.milestones = [
                        this.milestones.get('ms-security-architecture'),
                        this.milestones.get('ms-core-architecture')
                    ];
                    break;
                case 'phase-2-core':
                    phase.milestones = [
                        this.milestones.get('ms-memory-unification'),
                        this.milestones.get('ms-swarm-coordination')
                    ];
                    break;
                case 'phase-3-integration':
                    phase.milestones = [
                        this.milestones.get('ms-agentic-integration')
                    ];
                    break;
                case 'phase-4-release':
                    phase.milestones = [
                        this.milestones.get('ms-performance-targets'),
                        this.milestones.get('ms-v3-release')
                    ];
                    break;
            }
        }
    }
}
// =============================================================================
// Factory Functions - COMPATIBILITY LAYER (ADR-003)
// =============================================================================
/**
 * @deprecated Use createUnifiedSwarmCoordinator() instead.
 * This factory is maintained for backward compatibility only.
 *
 * Migration:
 * ```typescript
 * // OLD:
 * const hub = createSwarmHub();
 *
 * // NEW:
 * import { createUnifiedSwarmCoordinator } from '@claude-flow/swarm';
 * const coordinator = createUnifiedSwarmCoordinator();
 * ```
 */
export function createSwarmHub(eventBus) {
    console.warn('[DEPRECATION] createSwarmHub() is deprecated. Use createUnifiedSwarmCoordinator() instead.');
    return new SwarmHub(eventBus);
}
let globalSwarmHub = null;
/**
 * @deprecated Use UnifiedSwarmCoordinator singleton pattern instead.
 * This function is maintained for backward compatibility only.
 */
export function getSwarmHub() {
    console.warn('[DEPRECATION] getSwarmHub() is deprecated. Use UnifiedSwarmCoordinator directly.');
    if (!globalSwarmHub) {
        globalSwarmHub = createSwarmHub();
    }
    return globalSwarmHub;
}
/**
 * @deprecated Use coordinator.shutdown() directly instead.
 */
export function resetSwarmHub() {
    console.warn('[DEPRECATION] resetSwarmHub() is deprecated. Call shutdown() on your coordinator instance.');
    if (globalSwarmHub?.isInitialized()) {
        globalSwarmHub.shutdown();
    }
    globalSwarmHub = null;
}
//# sourceMappingURL=swarm-hub.js.map