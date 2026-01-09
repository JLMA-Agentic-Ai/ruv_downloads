/**
 * SpecializedWorker - Domain-Specialized Worker Implementation
 *
 * Extends WorkerBase with domain-specific capabilities and
 * intelligent task matching using embedding-based similarity.
 *
 * Features:
 * - Domain specialization with configurable focus areas
 * - Embedding-based task matching for intelligent routing
 * - Capability verification and scoring
 * - Domain-specific execution strategies
 *
 * Compatible with agentic-flow's SpecializedAgent pattern.
 *
 * @module v3/integration/specialized-worker
 * @version 3.0.0-alpha.1
 */
import { WorkerBase, WorkerConfig, AgentOutput, WorkerArtifact } from './worker-base.js';
import type { Task } from './agentic-flow-agent.js';
/**
 * Domain specialization types
 */
export type DomainSpecialization = 'frontend' | 'backend' | 'database' | 'devops' | 'security' | 'performance' | 'testing' | 'documentation' | 'architecture' | 'machine-learning' | 'data-engineering' | 'mobile' | 'infrastructure' | 'api-design' | 'code-review' | 'custom';
/**
 * Specialized worker configuration
 */
export interface SpecializedWorkerConfig extends WorkerConfig {
    /** Primary domain specialization */
    domain: DomainSpecialization;
    /** Secondary domains (ordered by proficiency) */
    secondaryDomains?: DomainSpecialization[];
    /** Domain-specific skills with proficiency levels (0.0-1.0) */
    skills?: Map<string, number> | Record<string, number>;
    /** Preferred programming languages */
    languages?: string[];
    /** Preferred frameworks */
    frameworks?: string[];
    /** Preferred tools */
    tools?: string[];
    /** Domain expertise level (0.0-1.0) */
    expertiseLevel?: number;
    /** Enable domain-specific preprocessing */
    enablePreprocessing?: boolean;
    /** Enable domain-specific postprocessing */
    enablePostprocessing?: boolean;
    /** Custom domain handlers */
    handlers?: DomainHandlers;
}
/**
 * Domain-specific handlers for specialized processing
 */
export interface DomainHandlers {
    /** Preprocess task before execution */
    preprocess?: (task: Task, worker: SpecializedWorker) => Promise<Task>;
    /** Postprocess output after execution */
    postprocess?: (output: AgentOutput, task: Task, worker: SpecializedWorker) => Promise<AgentOutput>;
    /** Validate task for domain compatibility */
    validate?: (task: Task, worker: SpecializedWorker) => Promise<boolean>;
    /** Generate domain-specific artifacts */
    generateArtifacts?: (output: AgentOutput, task: Task, worker: SpecializedWorker) => Promise<WorkerArtifact[]>;
}
/**
 * Task matching result with detailed scoring
 */
export interface TaskMatchResult {
    /** Overall match score (0.0-1.0) */
    score: number;
    /** Breakdown of scoring components */
    breakdown: {
        /** Capability match score */
        capabilityScore: number;
        /** Domain match score */
        domainScore: number;
        /** Embedding similarity score */
        embeddingScore: number;
        /** Skill match score */
        skillScore: number;
    };
    /** Whether worker meets minimum requirements */
    meetsRequirements: boolean;
    /** Missing capabilities */
    missingCapabilities: string[];
    /** Matched capabilities */
    matchedCapabilities: string[];
    /** Recommendations for better matching */
    recommendations?: string[];
}
/**
 * SpecializedWorker - Domain-focused worker with intelligent matching
 *
 * Usage:
 * ```typescript
 * const worker = new SpecializedWorker({
 *   id: 'frontend-1',
 *   type: 'specialized',
 *   domain: 'frontend',
 *   capabilities: ['react', 'typescript', 'css'],
 *   skills: { react: 0.9, typescript: 0.85, css: 0.8 },
 *   languages: ['typescript', 'javascript'],
 *   frameworks: ['react', 'next.js'],
 * });
 *
 * await worker.initialize();
 *
 * // Match a task
 * const match = worker.matchTask(task);
 * if (match.score > 0.7) {
 *   const result = await worker.execute(task);
 * }
 * ```
 */
export declare class SpecializedWorker extends WorkerBase {
    /** Primary domain specialization */
    readonly domain: DomainSpecialization;
    /** Secondary domains */
    readonly secondaryDomains: DomainSpecialization[];
    /** Domain-specific skills with proficiency levels */
    protected skills: Map<string, number>;
    /** Preferred programming languages */
    protected languages: string[];
    /** Preferred frameworks */
    protected frameworks: string[];
    /** Preferred tools */
    protected tools: string[];
    /** Domain expertise level */
    protected expertiseLevel: number;
    /** Domain-specific handlers */
    protected handlers: DomainHandlers;
    /** Enable preprocessing */
    protected enablePreprocessing: boolean;
    /** Enable postprocessing */
    protected enablePostprocessing: boolean;
    /**
     * Create a new SpecializedWorker instance
     *
     * @param config - Specialized worker configuration
     */
    constructor(config: SpecializedWorkerConfig);
    /**
     * Match a task to this worker
     *
     * Calculates a comprehensive match score based on:
     * - Capability overlap
     * - Domain compatibility
     * - Embedding similarity
     * - Skill proficiency
     *
     * @param task - Task to match
     * @returns Detailed match result with scores
     */
    matchTask(task: Task): TaskMatchResult;
    /**
     * Execute a task with domain-specific processing
     *
     * @param task - Task to execute
     * @returns Agent output with results
     */
    execute(task: Task): Promise<AgentOutput>;
    /**
     * Core task execution logic
     *
     * Override this in subclasses for domain-specific implementations.
     *
     * @param task - Preprocessed task
     * @returns Execution output
     */
    protected executeCore(task: Task): Promise<AgentOutput>;
    /**
     * Process task with domain-specific logic
     *
     * @param task - Task to process
     * @returns Processed content
     */
    protected processTaskForDomain(task: Task): Promise<Record<string, unknown>>;
    /**
     * Get worker's domain expertise
     */
    getDomainExpertise(): {
        primary: DomainSpecialization;
        secondary: DomainSpecialization[];
        expertiseLevel: number;
        skills: Record<string, number>;
    };
    /**
     * Update skill proficiency
     *
     * @param skill - Skill name
     * @param level - Proficiency level (0.0-1.0)
     */
    updateSkill(skill: string, level: number): void;
    /**
     * Generate domain-specific embedding
     */
    private generateDomainEmbedding;
    /**
     * Extract required capabilities from a task
     */
    private extractRequiredCapabilities;
    /**
     * Infer capabilities from task type
     */
    private inferCapabilitiesFromType;
    /**
     * Infer capabilities from task description
     */
    private inferCapabilitiesFromDescription;
    /**
     * Infer domain from task
     */
    private inferTaskDomain;
    /**
     * Generate embedding for a task
     */
    private generateTaskEmbedding;
    /**
     * Calculate capability match
     */
    private calculateCapabilityMatch;
    /**
     * Calculate domain match score
     */
    private calculateDomainMatch;
    /**
     * Calculate skill match score
     */
    private calculateSkillMatch;
    /**
     * Extract skills from task
     */
    private extractSkillsFromTask;
    /**
     * Generate recommendations for better matching
     */
    private generateRecommendations;
    /**
     * Simple string hash function for specialized worker
     */
    protected hashStringSpecialized(str: string): number;
}
/**
 * Create a specialized worker factory
 *
 * @param domain - Primary domain specialization
 * @param config - Additional configuration
 * @returns Configured SpecializedWorker
 */
export declare function createSpecializedWorker(domain: DomainSpecialization, config?: Partial<Omit<SpecializedWorkerConfig, 'domain'>>): SpecializedWorker;
/**
 * Create a frontend specialized worker
 */
export declare function createFrontendWorker(config?: Partial<Omit<SpecializedWorkerConfig, 'domain'>>): SpecializedWorker;
/**
 * Create a backend specialized worker
 */
export declare function createBackendWorker(config?: Partial<Omit<SpecializedWorkerConfig, 'domain'>>): SpecializedWorker;
/**
 * Create a testing specialized worker
 */
export declare function createTestingWorker(config?: Partial<Omit<SpecializedWorkerConfig, 'domain'>>): SpecializedWorker;
//# sourceMappingURL=specialized-worker.d.ts.map