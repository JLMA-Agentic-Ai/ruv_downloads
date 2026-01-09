/**
 * Queen Coordinator - Central Orchestrator for 15-Agent Swarm
 *
 * The Queen Coordinator is the strategic decision-maker for the V3 hive-mind system.
 * It analyzes tasks, delegates to appropriate agents, monitors swarm health,
 * coordinates consensus, and learns from outcomes using ReasoningBank patterns.
 *
 * Features:
 * - Strategic task analysis with ReasoningBank pattern matching
 * - Agent delegation with capability scoring and load balancing
 * - Swarm health monitoring with bottleneck detection
 * - Consensus coordination (majority, weighted, unanimous)
 * - Learning from outcomes for continuous improvement
 *
 * Performance Targets:
 * - Task analysis: <50ms
 * - Agent scoring: <20ms
 * - Consensus coordination: <100ms
 * - Health check: <30ms
 *
 * @module @claude-flow/swarm/queen-coordinator
 */
import { EventEmitter } from 'events';
import type { AgentState, TaskDefinition, TaskType, TaskPriority, CoordinatorMetrics, ConsensusResult } from './types.js';
import type { AgentDomain, DomainConfig, DomainStatus } from './unified-coordinator.js';
/**
 * Task analysis result from the Queen
 */
export interface TaskAnalysis {
    /** Unique analysis ID */
    analysisId: string;
    /** Original task ID */
    taskId: string;
    /** Task complexity score (0-1) */
    complexity: number;
    /** Estimated duration in milliseconds */
    estimatedDurationMs: number;
    /** Required capabilities for this task */
    requiredCapabilities: string[];
    /** Recommended domain for execution */
    recommendedDomain: AgentDomain;
    /** Sub-tasks if decomposition is needed */
    subtasks: SubTask[];
    /** Patterns found from ReasoningBank */
    matchedPatterns: MatchedPattern[];
    /** Resource requirements */
    resourceRequirements: ResourceRequirements;
    /** Confidence in this analysis (0-1) */
    confidence: number;
    /** Analysis timestamp */
    timestamp: Date;
}
/**
 * Sub-task from task decomposition
 */
export interface SubTask {
    id: string;
    name: string;
    description: string;
    type: TaskType;
    priority: TaskPriority;
    dependencies: string[];
    estimatedDurationMs: number;
    requiredCapabilities: string[];
    recommendedDomain: AgentDomain;
}
/**
 * Pattern matched from ReasoningBank
 */
export interface MatchedPattern {
    patternId: string;
    strategy: string;
    successRate: number;
    relevanceScore: number;
    keyLearnings: string[];
}
/**
 * Resource requirements for a task
 */
export interface ResourceRequirements {
    minAgents: number;
    maxAgents: number;
    memoryMb: number;
    cpuIntensive: boolean;
    ioIntensive: boolean;
    networkRequired: boolean;
}
/**
 * Delegation plan for task execution
 */
export interface DelegationPlan {
    /** Plan ID */
    planId: string;
    /** Task ID being delegated */
    taskId: string;
    /** Analysis that informed this plan */
    analysisId: string;
    /** Primary agent assignment */
    primaryAgent: AgentAssignment;
    /** Backup agents for failover */
    backupAgents: AgentAssignment[];
    /** Parallel sub-task assignments */
    parallelAssignments: ParallelAssignment[];
    /** Execution strategy */
    strategy: ExecutionStrategy;
    /** Estimated completion time */
    estimatedCompletionMs: number;
    /** Plan creation timestamp */
    timestamp: Date;
}
/**
 * Agent assignment in a delegation plan
 */
export interface AgentAssignment {
    agentId: string;
    domain: AgentDomain;
    taskId: string;
    score: number;
    assignedAt: Date;
}
/**
 * Parallel task assignment
 */
export interface ParallelAssignment {
    subtaskId: string;
    agentId: string;
    domain: AgentDomain;
    dependencies: string[];
}
/**
 * Execution strategy for delegation
 */
export type ExecutionStrategy = 'sequential' | 'parallel' | 'pipeline' | 'fan-out-fan-in' | 'hybrid';
/**
 * Agent score for task assignment
 */
export interface AgentScore {
    agentId: string;
    domain: AgentDomain;
    totalScore: number;
    capabilityScore: number;
    loadScore: number;
    performanceScore: number;
    healthScore: number;
    availabilityScore: number;
}
/**
 * Health report for the swarm
 */
export interface HealthReport {
    /** Report ID */
    reportId: string;
    /** Report timestamp */
    timestamp: Date;
    /** Overall swarm health (0-1) */
    overallHealth: number;
    /** Status of each domain */
    domainHealth: Map<AgentDomain, DomainHealthStatus>;
    /** Individual agent health */
    agentHealth: AgentHealthEntry[];
    /** Detected bottlenecks */
    bottlenecks: Bottleneck[];
    /** Active alerts */
    alerts: HealthAlert[];
    /** Performance metrics */
    metrics: HealthMetrics;
    /** Recommendations for improvement */
    recommendations: string[];
}
/**
 * Domain health status
 */
export interface DomainHealthStatus {
    domain: AgentDomain;
    health: number;
    activeAgents: number;
    totalAgents: number;
    queuedTasks: number;
    avgResponseTimeMs: number;
    errorRate: number;
}
/**
 * Agent health entry
 */
export interface AgentHealthEntry {
    agentId: string;
    domain: AgentDomain;
    health: number;
    status: string;
    lastHeartbeat: Date;
    currentLoad: number;
    recentErrors: number;
}
/**
 * Bottleneck detection result
 */
export interface Bottleneck {
    type: 'agent' | 'domain' | 'task' | 'resource';
    location: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    suggestedAction: string;
}
/**
 * Health alert
 */
export interface HealthAlert {
    alertId: string;
    type: 'warning' | 'error' | 'critical';
    source: string;
    message: string;
    timestamp: Date;
    acknowledged: boolean;
}
/**
 * Health metrics
 */
export interface HealthMetrics {
    totalAgents: number;
    activeAgents: number;
    idleAgents: number;
    errorAgents: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    avgTaskDurationMs: number;
    taskThroughputPerMin: number;
    consensusSuccessRate: number;
}
/**
 * Decision requiring consensus
 */
export interface Decision {
    decisionId: string;
    type: DecisionType;
    proposal: unknown;
    requiredConsensus: ConsensusType;
    timeout: number;
    initiator: string;
    metadata: Record<string, unknown>;
}
/**
 * Decision types
 */
export type DecisionType = 'task-assignment' | 'resource-allocation' | 'topology-change' | 'agent-termination' | 'priority-override' | 'emergency-action';
/**
 * Consensus types
 */
export type ConsensusType = 'majority' | 'supermajority' | 'unanimous' | 'weighted' | 'queen-override';
/**
 * Task result for learning
 */
export interface TaskResult {
    taskId: string;
    success: boolean;
    output?: unknown;
    error?: string;
    durationMs: number;
    agentId: string;
    domain: AgentDomain;
    metrics: TaskMetrics;
}
/**
 * Task execution metrics
 */
export interface TaskMetrics {
    startTime: Date;
    endTime: Date;
    retries: number;
    resourceUsage: {
        memoryMb: number;
        cpuPercent: number;
    };
    stepsCompleted: number;
    qualityScore: number;
}
/**
 * Queen Coordinator configuration
 */
export interface QueenCoordinatorConfig {
    /** Enable ReasoningBank integration */
    enableLearning: boolean;
    /** Number of patterns to retrieve for analysis */
    patternRetrievalK: number;
    /** Minimum pattern relevance threshold */
    patternThreshold: number;
    /** Task complexity thresholds */
    complexityThresholds: {
        simple: number;
        moderate: number;
        complex: number;
    };
    /** Health check interval in ms */
    healthCheckIntervalMs: number;
    /** Bottleneck detection thresholds */
    bottleneckThresholds: {
        queueDepth: number;
        errorRate: number;
        responseTimeMs: number;
    };
    /** Consensus timeouts */
    consensusTimeouts: {
        majority: number;
        supermajority: number;
        unanimous: number;
    };
    /** Enable automatic failover */
    enableFailover: boolean;
    /** Maximum delegation attempts */
    maxDelegationAttempts: number;
}
/**
 * Interface for swarm coordinator interactions
 */
export interface ISwarmCoordinator {
    getAgentsByDomain(domain: AgentDomain): AgentState[];
    getAllAgents(): AgentState[];
    getAvailableAgents(): AgentState[];
    getMetrics(): CoordinatorMetrics;
    getDomainConfigs(): Map<AgentDomain, DomainConfig>;
    getStatus(): {
        domains: DomainStatus[];
        metrics: CoordinatorMetrics;
    };
    assignTaskToDomain(taskId: string, domain: AgentDomain): Promise<string | undefined>;
    proposeConsensus(value: unknown): Promise<ConsensusResult>;
    broadcastMessage(payload: unknown, priority?: 'urgent' | 'high' | 'normal' | 'low'): Promise<void>;
}
/**
 * Interface for neural learning system interactions
 */
export interface INeuralLearningSystem {
    initialize(): Promise<void>;
    beginTask(context: string, domain?: string): string;
    recordStep(trajectoryId: string, action: string, reward: number, stateEmbedding: Float32Array): void;
    completeTask(trajectoryId: string, quality?: number): Promise<void>;
    findPatterns(queryEmbedding: Float32Array, k?: number): Promise<PatternMatchResult[]>;
    retrieveMemories(queryEmbedding: Float32Array, k?: number): Promise<MemoryRetrievalResult[]>;
    triggerLearning(): Promise<void>;
}
/**
 * Pattern match result from neural system
 */
export interface PatternMatchResult {
    patternId: string;
    strategy: string;
    successRate: number;
    relevanceScore: number;
    keyLearnings?: string[];
}
/**
 * Memory retrieval result from neural system
 */
export interface MemoryRetrievalResult {
    memory: {
        memoryId: string;
        strategy: string;
        quality: number;
        keyLearnings: string[];
    };
    relevanceScore: number;
    combinedScore: number;
}
/**
 * Interface for memory service interactions
 */
export interface IMemoryService {
    semanticSearch(query: string, k?: number): Promise<SearchResultEntry[]>;
    store(entry: MemoryStoreEntry): Promise<void>;
}
/**
 * Search result entry from memory service
 */
export interface SearchResultEntry {
    entry: {
        id: string;
        content: string;
        metadata: Record<string, unknown>;
    };
    score: number;
}
/**
 * Memory store entry
 */
export interface MemoryStoreEntry {
    key: string;
    content: string;
    namespace: string;
    tags: string[];
    metadata: Record<string, unknown>;
}
/**
 * Queen Coordinator - Central orchestrator for the 15-agent hive-mind swarm
 *
 * The Queen is responsible for:
 * 1. Strategic task analysis and decomposition
 * 2. Agent delegation with load balancing
 * 3. Swarm health monitoring
 * 4. Consensus coordination
 * 5. Learning from outcomes
 */
export declare class QueenCoordinator extends EventEmitter {
    private config;
    private swarm;
    private neural?;
    private memory?;
    private analysisCache;
    private delegationPlans;
    private activeDecisions;
    private outcomeHistory;
    private healthHistory;
    private analysisCounter;
    private planCounter;
    private reportCounter;
    private decisionCounter;
    private healthCheckInterval?;
    private lastHealthReport?;
    private analysisLatencies;
    private delegationLatencies;
    private consensusLatencies;
    constructor(swarm: ISwarmCoordinator, config?: Partial<QueenCoordinatorConfig>, neural?: INeuralLearningSystem, memory?: IMemoryService);
    /**
     * Initialize the Queen Coordinator
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the Queen Coordinator
     */
    shutdown(): Promise<void>;
    /**
     * Analyze a task for optimal execution
     *
     * @param task - Task to analyze
     * @returns Task analysis with recommendations
     */
    analyzeTask(task: TaskDefinition): Promise<TaskAnalysis>;
    /**
     * Decompose a complex task into subtasks
     */
    private decomposeTask;
    private isSimpleTask;
    private decomposeCodingTask;
    private decomposeTestingTask;
    private decomposeResearchTask;
    private decomposeCoordinationTask;
    private decomposeGenericTask;
    /**
     * Identify required capabilities for a task
     */
    private identifyRequiredCapabilities;
    /**
     * Calculate task complexity score
     */
    private calculateComplexity;
    /**
     * Estimate task duration
     */
    private estimateDuration;
    /**
     * Determine optimal domain for task execution
     */
    private determineOptimalDomain;
    private inferDomainFromType;
    /**
     * Find matching patterns from ReasoningBank
     */
    private findMatchingPatterns;
    /**
     * Create a simple embedding from text (placeholder)
     */
    private createSimpleEmbedding;
    /**
     * Estimate resource requirements
     */
    private estimateResources;
    /**
     * Calculate confidence in analysis
     */
    private calculateAnalysisConfidence;
    /**
     * Delegate a task to agents based on analysis
     *
     * @param task - Task to delegate
     * @param analysis - Previous task analysis
     * @returns Delegation plan
     */
    delegateToAgents(task: TaskDefinition, analysis: TaskAnalysis): Promise<DelegationPlan>;
    /**
     * Score agents for task assignment
     */
    scoreAgents(task: TaskDefinition, patterns: MatchedPattern[]): AgentScore[];
    private scoreAgent;
    private calculateCapabilityScore;
    private calculatePerformanceScore;
    private getAgentDomain;
    private selectPrimaryAgent;
    private selectBackupAgents;
    private createParallelAssignments;
    private determineExecutionStrategy;
    private executeDelegation;
    /**
     * Monitor swarm health and detect issues
     *
     * @returns Health report
     */
    monitorSwarmHealth(): Promise<HealthReport>;
    private computeDomainHealth;
    private computeAgentHealth;
    private detectBottlenecks;
    private generateAlerts;
    private calculateOverallHealth;
    private generateRecommendations;
    private startHealthMonitoring;
    private stopHealthMonitoring;
    /**
     * Coordinate consensus for a decision
     *
     * @param decision - Decision requiring consensus
     * @returns Consensus result
     */
    coordinateConsensus(decision: Decision): Promise<ConsensusResult>;
    private queenOverride;
    private majorityConsensus;
    private supermajorityConsensus;
    private unanimousConsensus;
    private weightedConsensus;
    /**
     * Record task outcome for learning
     *
     * @param task - Completed task
     * @param result - Task result
     */
    recordOutcome(task: TaskDefinition, result: TaskResult): Promise<void>;
    private learnFromOutcome;
    private storeOutcomeMemory;
    private formatOutcomeContent;
    /**
     * Get the last health report
     */
    getLastHealthReport(): HealthReport | undefined;
    /**
     * Get outcome history
     */
    getOutcomeHistory(): TaskResult[];
    /**
     * Get analysis cache
     */
    getAnalysisCache(): Map<string, TaskAnalysis>;
    /**
     * Get delegation plans
     */
    getDelegationPlans(): Map<string, DelegationPlan>;
    /**
     * Get performance statistics
     */
    getPerformanceStats(): {
        avgAnalysisLatencyMs: number;
        avgDelegationLatencyMs: number;
        avgConsensusLatencyMs: number;
        totalAnalyses: number;
        totalDelegations: number;
        totalDecisions: number;
    };
    /**
     * Check if learning is enabled
     */
    isLearningEnabled(): boolean;
    private emitEvent;
}
/**
 * Create a Queen Coordinator instance
 */
export declare function createQueenCoordinator(swarm: ISwarmCoordinator, config?: Partial<QueenCoordinatorConfig>, neural?: INeuralLearningSystem, memory?: IMemoryService): QueenCoordinator;
export default QueenCoordinator;
//# sourceMappingURL=queen-coordinator.d.ts.map