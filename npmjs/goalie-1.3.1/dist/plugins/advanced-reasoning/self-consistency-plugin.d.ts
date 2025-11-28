/**
 * Self-Consistency and Multi-Agent Verification Plugin
 * Implements self-consistency checking through multiple sampling and voting
 */
import { AdvancedPluginHooks } from '../../core/advanced-types.js';
export interface ConsistencyCheck {
    query: string;
    samples: Array<{
        id: string;
        response: string;
        citations: string[];
        confidence: number;
    }>;
    consensus: {
        agreement: number;
        majorityResponse: string;
        conflictingPoints: string[];
    };
}
export declare class SelfConsistencyPlugin {
    name: string;
    version: string;
    private samplingRounds;
    private consistencyThreshold;
    private samples;
    private perplexityClient;
    hooks: AdvancedPluginHooks;
    /**
     * Get or create Perplexity client
     */
    private getClient;
    /**
     * Generate multiple independent samples using real Perplexity API
     */
    private generateMultipleSamples;
    /**
     * Extract citations from search results
     */
    private extractCitations;
    /**
     * Calculate consensus among samples
     */
    private calculateConsensus;
    /**
     * Tokenize text for comparison
     */
    private tokenize;
    /**
     * Find common tokens across all samples
     */
    private findCommonTokens;
    /**
     * Identify conflicting points in samples
     */
    private identifyConflicts;
    /**
     * Calculate confidence based on agreement level
     */
    private calculateConfidence;
    /**
     * Calculate citation coverage across samples
     */
    private calculateCitationCoverage;
    /**
     * Calculate overall verification score
     */
    private calculateVerificationScore;
    /**
     * Generate samples for standalone execution using real API
     */
    private generateSamples;
    /**
     * Check consistency between samples
     */
    private checkConsistency;
    /**
     * Cluster similar answers
     */
    private clusterAnswers;
    /**
     * Simple similarity calculation
     */
    private calculateSimilarity;
    /**
     * Execute self-consistency checking directly
     */
    execute(params: any): Promise<any>;
}
declare const _default: SelfConsistencyPlugin;
export default _default;
//# sourceMappingURL=self-consistency-plugin.d.ts.map