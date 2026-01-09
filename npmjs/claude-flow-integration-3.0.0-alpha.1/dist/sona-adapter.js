/**
 * SONA (Self-Optimizing Neural Architecture) Adapter
 *
 * Provides integration with agentic-flow's SONA learning system,
 * enabling real-time adaptation, pattern recognition, and
 * continuous learning capabilities.
 *
 * Performance Targets:
 * - Real-time mode: ~0.05ms adaptation
 * - Balanced mode: General purpose learning
 * - Research mode: Deep exploration with higher accuracy
 *
 * @module v3/integration/sona-adapter
 * @version 3.0.0-alpha.1
 */
import { EventEmitter } from 'events';
/**
 * Mode-specific configurations for SONA learning
 */
const MODE_CONFIGS = {
    'real-time': {
        learningRate: 0.01,
        similarityThreshold: 0.8,
        maxPatterns: 5000,
        consolidationInterval: 1800000, // 30 minutes
    },
    'balanced': {
        learningRate: 0.001,
        similarityThreshold: 0.7,
        maxPatterns: 10000,
        consolidationInterval: 3600000, // 1 hour
    },
    'research': {
        learningRate: 0.0001,
        similarityThreshold: 0.6,
        maxPatterns: 50000,
        consolidationInterval: 7200000, // 2 hours
    },
    'edge': {
        learningRate: 0.005,
        similarityThreshold: 0.85,
        maxPatterns: 1000,
        consolidationInterval: 900000, // 15 minutes
    },
    'batch': {
        learningRate: 0.0005,
        similarityThreshold: 0.65,
        maxPatterns: 100000,
        consolidationInterval: 14400000, // 4 hours
    },
};
/**
 * SONAAdapter - SONA Learning System Integration
 *
 * This adapter provides a clean interface to agentic-flow's SONA
 * learning capabilities, including:
 * - Learning mode selection and auto-switching
 * - Trajectory tracking for experience replay
 * - Pattern storage and retrieval
 * - Memory distillation and consolidation
 */
export class SONAAdapter extends EventEmitter {
    config;
    initialized = false;
    activeTrajectories = new Map();
    patterns = new Map();
    stats;
    consolidationTimer = null;
    learningCycleCount = 0;
    /**
     * Reference to agentic-flow SONA for delegation (ADR-001)
     * When set, methods delegate to agentic-flow instead of local implementation
     */
    agenticFlowSona = null;
    /**
     * Indicates if delegation to agentic-flow is active
     */
    delegationEnabled = false;
    constructor(config = {}) {
        super();
        this.config = this.mergeConfig(config);
        this.stats = this.initializeStats();
    }
    /**
     * Set reference to agentic-flow SONA for delegation
     *
     * This implements ADR-001: Adopt agentic-flow as Core Foundation
     * When a reference is provided, pattern storage and retrieval
     * delegate to agentic-flow's optimized implementations.
     *
     * @param sonaRef - The agentic-flow SONA interface reference
     */
    setAgenticFlowReference(sonaRef) {
        this.agenticFlowSona = sonaRef;
        this.delegationEnabled = true;
        this.emit('delegation-enabled', { target: 'agentic-flow' });
    }
    /**
     * Check if delegation to agentic-flow is enabled
     */
    isDelegationEnabled() {
        return this.delegationEnabled && this.agenticFlowSona !== null;
    }
    /**
     * Initialize the SONA adapter
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        this.emit('initializing');
        try {
            // Apply mode-specific configuration
            this.applyModeConfig(this.config.mode);
            // Start consolidation timer if enabled
            if (this.config.consolidationInterval > 0) {
                this.startConsolidationTimer();
            }
            this.initialized = true;
            this.emit('initialized', { mode: this.config.mode });
        }
        catch (error) {
            this.emit('initialization-failed', { error });
            throw error;
        }
    }
    /**
     * Reconfigure the adapter
     */
    async reconfigure(config) {
        this.config = this.mergeConfig(config);
        if (config.mode) {
            this.applyModeConfig(config.mode);
        }
        // Restart consolidation timer with new interval
        if (config.consolidationInterval !== undefined) {
            this.stopConsolidationTimer();
            if (config.consolidationInterval > 0) {
                this.startConsolidationTimer();
            }
        }
        this.emit('reconfigured', { config: this.config });
    }
    /**
     * Get current learning mode
     */
    getMode() {
        return this.config.mode;
    }
    /**
     * Set learning mode
     */
    async setMode(mode) {
        const previousMode = this.config.mode;
        this.config.mode = mode;
        this.applyModeConfig(mode);
        this.emit('mode-changed', {
            previousMode,
            newMode: mode,
            config: MODE_CONFIGS[mode]
        });
    }
    /**
     * Begin a new trajectory for task tracking
     */
    async beginTrajectory(params) {
        this.ensureInitialized();
        const trajectoryId = this.generateId('traj');
        const trajectory = {
            id: trajectoryId,
            taskId: params.taskId,
            steps: [],
            startTime: Date.now(),
            totalReward: 0,
            metadata: {
                description: params.description,
                category: params.category,
                ...params.metadata,
            },
        };
        this.activeTrajectories.set(trajectoryId, trajectory);
        this.stats.activeTrajectories++;
        this.emit('trajectory-started', { trajectoryId, taskId: params.taskId });
        return trajectoryId;
    }
    /**
     * Record a step in an active trajectory
     */
    async recordTrajectoryStep(params) {
        this.ensureInitialized();
        const trajectory = this.activeTrajectories.get(params.trajectoryId);
        if (!trajectory) {
            throw new Error(`Trajectory ${params.trajectoryId} not found`);
        }
        const step = {
            stepId: params.stepId || this.generateId('step'),
            action: params.action,
            observation: params.observation,
            reward: params.reward,
            timestamp: Date.now(),
            embedding: params.embedding,
        };
        trajectory.steps.push(step);
        trajectory.totalReward += params.reward;
        this.emit('trajectory-step-recorded', {
            trajectoryId: params.trajectoryId,
            step
        });
    }
    /**
     * End a trajectory with final verdict
     */
    async endTrajectory(params) {
        this.ensureInitialized();
        const trajectory = this.activeTrajectories.get(params.trajectoryId);
        if (!trajectory) {
            throw new Error(`Trajectory ${params.trajectoryId} not found`);
        }
        // Finalize trajectory
        trajectory.endTime = Date.now();
        trajectory.verdict = params.verdict || (params.success ? 'positive' : 'negative');
        if (params.reward !== undefined) {
            trajectory.totalReward += params.reward;
        }
        // Remove from active and update stats
        this.activeTrajectories.delete(params.trajectoryId);
        this.stats.activeTrajectories--;
        this.stats.completedTrajectories++;
        // Learn from successful trajectories
        if (params.success && trajectory.verdict === 'positive') {
            await this.learnFromTrajectory(trajectory);
        }
        this.emit('trajectory-completed', {
            trajectoryId: params.trajectoryId,
            trajectory
        });
        return trajectory;
    }
    /**
     * Store a learned pattern
     *
     * ADR-001: When agentic-flow is available, delegates to its optimized
     * pattern storage which uses AgentDB with HNSW indexing for
     * 150x-12,500x faster similarity search.
     */
    async storePattern(params) {
        this.ensureInitialized();
        // ADR-001: Delegate to agentic-flow when available
        if (this.isDelegationEnabled() && this.agenticFlowSona) {
            try {
                const patternId = await this.agenticFlowSona.storePattern({
                    pattern: params.pattern,
                    solution: params.solution,
                    category: params.category,
                    confidence: Math.max(0, Math.min(1, params.confidence)),
                    metadata: params.metadata,
                });
                this.stats.totalPatterns++;
                this.emit('pattern-stored', {
                    patternId,
                    delegated: true,
                    target: 'agentic-flow',
                });
                return patternId;
            }
            catch (error) {
                // Log delegation failure and fall back to local implementation
                this.emit('delegation-failed', {
                    method: 'storePattern',
                    error: error.message,
                    fallback: 'local',
                });
                // Continue with local implementation below
            }
        }
        // Local implementation (fallback or when agentic-flow not available)
        const patternId = this.generateId('pat');
        const storedPattern = {
            id: patternId,
            pattern: params.pattern,
            solution: params.solution,
            category: params.category,
            confidence: Math.max(0, Math.min(1, params.confidence)),
            usageCount: 0,
            createdAt: Date.now(),
            lastUsedAt: Date.now(),
            metadata: params.metadata || {},
        };
        // Check if we need to prune patterns
        if (this.patterns.size >= this.config.maxPatterns) {
            await this.prunePatterns();
        }
        this.patterns.set(patternId, storedPattern);
        this.stats.totalPatterns++;
        this.updateAverageConfidence();
        this.emit('pattern-stored', { patternId, pattern: storedPattern });
        return patternId;
    }
    /**
     * Find similar patterns to a query
     *
     * ADR-001: When agentic-flow is available, delegates to its optimized
     * HNSW-indexed search for 150x-12,500x faster retrieval.
     */
    async findSimilarPatterns(params) {
        this.ensureInitialized();
        const topK = params.topK || 5;
        const threshold = params.threshold ?? this.config.similarityThreshold;
        // ADR-001: Delegate to agentic-flow when available for optimized search
        if (this.isDelegationEnabled() && this.agenticFlowSona) {
            try {
                const results = await this.agenticFlowSona.findPatterns(params.query, {
                    category: params.category,
                    topK,
                    threshold,
                });
                // Map results to SONAPattern format
                const patterns = results.map(r => ({
                    id: r.id,
                    pattern: r.pattern,
                    solution: r.solution,
                    category: r.category,
                    confidence: r.confidence,
                    usageCount: r.usageCount,
                    createdAt: r.createdAt,
                    lastUsedAt: r.lastUsedAt,
                    metadata: r.metadata,
                }));
                this.emit('patterns-retrieved', {
                    query: params.query,
                    count: patterns.length,
                    delegated: true,
                    target: 'agentic-flow',
                });
                return patterns;
            }
            catch (error) {
                // Log delegation failure and fall back to local implementation
                this.emit('delegation-failed', {
                    method: 'findSimilarPatterns',
                    error: error.message,
                    fallback: 'local',
                });
                // Continue with local implementation below
            }
        }
        // Local implementation (fallback or when agentic-flow not available)
        const results = [];
        for (const pattern of this.patterns.values()) {
            // Filter by category if specified
            if (params.category && pattern.category !== params.category) {
                continue;
            }
            // Calculate similarity (simplified - in production use embeddings)
            const score = this.calculateSimilarity(params.query, pattern.pattern);
            if (score >= threshold) {
                results.push({ pattern, score });
            }
        }
        // Sort by score and return top K
        results.sort((a, b) => b.score - a.score);
        const topResults = results.slice(0, topK).map(r => {
            // Update usage stats
            r.pattern.usageCount++;
            r.pattern.lastUsedAt = Date.now();
            return r.pattern;
        });
        this.emit('patterns-retrieved', {
            query: params.query,
            count: topResults.length
        });
        return topResults;
    }
    /**
     * Get a pattern by ID
     */
    async getPattern(patternId) {
        this.ensureInitialized();
        return this.patterns.get(patternId) || null;
    }
    /**
     * Delete a pattern
     */
    async deletePattern(patternId) {
        this.ensureInitialized();
        const deleted = this.patterns.delete(patternId);
        if (deleted) {
            this.stats.totalPatterns--;
            this.updateAverageConfidence();
            this.emit('pattern-deleted', { patternId });
        }
        return deleted;
    }
    /**
     * Force a learning cycle
     */
    async forceLearningCycle() {
        this.ensureInitialized();
        this.emit('learning-cycle-starting');
        try {
            // Consolidate patterns
            await this.consolidatePatterns();
            // Prune low-confidence patterns
            await this.prunePatterns();
            // Update statistics
            this.learningCycleCount++;
            this.stats.learningCycles = this.learningCycleCount;
            this.emit('learning-cycle-completed', {
                cycleCount: this.learningCycleCount
            });
        }
        catch (error) {
            this.emit('learning-cycle-failed', { error });
            throw error;
        }
    }
    /**
     * Get learning statistics
     */
    async getStats() {
        this.ensureInitialized();
        return {
            ...this.stats,
            totalPatterns: this.patterns.size,
            activeTrajectories: this.activeTrajectories.size,
            currentMode: this.config.mode,
            memoryUsage: this.estimateMemoryUsage(),
        };
    }
    /**
     * Export patterns for persistence
     */
    async exportPatterns() {
        this.ensureInitialized();
        return Array.from(this.patterns.values());
    }
    /**
     * Import patterns from storage
     */
    async importPatterns(patterns) {
        this.ensureInitialized();
        let imported = 0;
        for (const pattern of patterns) {
            if (!this.patterns.has(pattern.id)) {
                this.patterns.set(pattern.id, pattern);
                imported++;
            }
        }
        this.stats.totalPatterns = this.patterns.size;
        this.updateAverageConfidence();
        this.emit('patterns-imported', { count: imported });
        return imported;
    }
    /**
     * Shutdown the adapter
     */
    async shutdown() {
        this.stopConsolidationTimer();
        // Complete any active trajectories
        for (const [id, trajectory] of this.activeTrajectories) {
            trajectory.endTime = Date.now();
            trajectory.verdict = 'neutral';
        }
        this.activeTrajectories.clear();
        this.initialized = false;
        this.emit('shutdown');
    }
    // ===== Private Methods =====
    mergeConfig(config) {
        return {
            mode: config.mode || 'balanced',
            learningRate: config.learningRate ?? 0.001,
            similarityThreshold: config.similarityThreshold ?? 0.7,
            maxPatterns: config.maxPatterns ?? 10000,
            enableTrajectoryTracking: config.enableTrajectoryTracking ?? true,
            consolidationInterval: config.consolidationInterval ?? 3600000,
            autoModeSelection: config.autoModeSelection ?? true,
        };
    }
    initializeStats() {
        return {
            totalPatterns: 0,
            activeTrajectories: 0,
            completedTrajectories: 0,
            averageConfidence: 0,
            learningCycles: 0,
            lastConsolidation: Date.now(),
            memoryUsage: 0,
            currentMode: this.config.mode,
        };
    }
    applyModeConfig(mode) {
        const modeConfig = MODE_CONFIGS[mode];
        if (modeConfig) {
            Object.assign(this.config, modeConfig);
        }
    }
    startConsolidationTimer() {
        this.consolidationTimer = setInterval(() => this.consolidatePatterns(), this.config.consolidationInterval);
    }
    stopConsolidationTimer() {
        if (this.consolidationTimer) {
            clearInterval(this.consolidationTimer);
            this.consolidationTimer = null;
        }
    }
    async consolidatePatterns() {
        // Merge similar patterns
        const patternsArray = Array.from(this.patterns.values());
        const toRemove = new Set();
        for (let i = 0; i < patternsArray.length; i++) {
            if (toRemove.has(patternsArray[i].id))
                continue;
            for (let j = i + 1; j < patternsArray.length; j++) {
                if (toRemove.has(patternsArray[j].id))
                    continue;
                const similarity = this.calculateSimilarity(patternsArray[i].pattern, patternsArray[j].pattern);
                if (similarity > 0.95) {
                    // Merge into pattern with higher confidence
                    if (patternsArray[i].confidence >= patternsArray[j].confidence) {
                        patternsArray[i].usageCount += patternsArray[j].usageCount;
                        toRemove.add(patternsArray[j].id);
                    }
                    else {
                        patternsArray[j].usageCount += patternsArray[i].usageCount;
                        toRemove.add(patternsArray[i].id);
                    }
                }
            }
        }
        // Remove merged patterns
        for (const id of toRemove) {
            this.patterns.delete(id);
        }
        this.stats.lastConsolidation = Date.now();
        this.emit('consolidation-completed', {
            removed: toRemove.size,
            remaining: this.patterns.size
        });
    }
    async prunePatterns() {
        const maxPatterns = this.config.maxPatterns;
        if (this.patterns.size <= maxPatterns) {
            return;
        }
        // Sort patterns by score (combination of confidence, recency, and usage)
        const scored = Array.from(this.patterns.entries()).map(([id, pattern]) => ({
            id,
            pattern,
            score: this.calculatePatternScore(pattern),
        }));
        scored.sort((a, b) => b.score - a.score);
        // Keep only top patterns
        const toKeep = new Set(scored.slice(0, maxPatterns).map(s => s.id));
        for (const id of this.patterns.keys()) {
            if (!toKeep.has(id)) {
                this.patterns.delete(id);
            }
        }
        this.emit('patterns-pruned', {
            removed: scored.length - maxPatterns,
            remaining: this.patterns.size
        });
    }
    async learnFromTrajectory(trajectory) {
        // Extract patterns from successful trajectory
        if (trajectory.steps.length === 0)
            return;
        const pattern = trajectory.steps.map(s => s.action).join(' -> ');
        const solution = trajectory.steps[trajectory.steps.length - 1].observation;
        await this.storePattern({
            pattern,
            solution,
            category: trajectory.metadata.category || 'general',
            confidence: Math.min(1, trajectory.totalReward / trajectory.steps.length),
            metadata: {
                trajectoryId: trajectory.id,
                taskId: trajectory.taskId,
                stepCount: trajectory.steps.length,
            },
        });
    }
    calculateSimilarity(a, b) {
        // Jaccard similarity on words (simplified)
        const wordsA = new Set(a.toLowerCase().split(/\s+/));
        const wordsB = new Set(b.toLowerCase().split(/\s+/));
        const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
        const union = new Set([...wordsA, ...wordsB]);
        return intersection.size / union.size;
    }
    calculatePatternScore(pattern) {
        const now = Date.now();
        const ageMs = now - pattern.createdAt;
        const recencyMs = now - pattern.lastUsedAt;
        // Normalize age and recency (decay over 30 days)
        const ageFactor = Math.exp(-ageMs / (30 * 24 * 60 * 60 * 1000));
        const recencyFactor = Math.exp(-recencyMs / (7 * 24 * 60 * 60 * 1000));
        const usageFactor = Math.min(1, pattern.usageCount / 100);
        return (pattern.confidence * 0.4 +
            recencyFactor * 0.3 +
            usageFactor * 0.2 +
            ageFactor * 0.1);
    }
    updateAverageConfidence() {
        if (this.patterns.size === 0) {
            this.stats.averageConfidence = 0;
            return;
        }
        let total = 0;
        for (const pattern of this.patterns.values()) {
            total += pattern.confidence;
        }
        this.stats.averageConfidence = total / this.patterns.size;
    }
    estimateMemoryUsage() {
        // Rough estimate: 500 bytes per pattern, 1KB per trajectory step
        const patternBytes = this.patterns.size * 500;
        const trajectoryBytes = Array.from(this.activeTrajectories.values())
            .reduce((sum, t) => sum + t.steps.length * 1024, 0);
        return patternBytes + trajectoryBytes;
    }
    generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('SONAAdapter not initialized. Call initialize() first.');
        }
    }
}
/**
 * Create and initialize a SONA adapter
 */
export async function createSONAAdapter(config) {
    const adapter = new SONAAdapter(config);
    await adapter.initialize();
    return adapter;
}
//# sourceMappingURL=sona-adapter.js.map