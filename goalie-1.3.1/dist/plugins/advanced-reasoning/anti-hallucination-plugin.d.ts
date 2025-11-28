/**
 * Anti-Hallucination and Factual Grounding Plugin
 * Ensures all claims are grounded with citations and implements verification schemas
 */
import { AdvancedPluginHooks } from '../../core/advanced-types.js';
export interface FactualClaim {
    claim: string;
    citations: string[];
    confidence: number;
    verified: boolean;
    groundingType: 'direct' | 'inferred' | 'synthesized';
}
export interface HallucinationCheck {
    totalClaims: number;
    groundedClaims: number;
    ungroundedClaims: string[];
    confidenceScore: number;
    hallucinationRisk: 'low' | 'medium' | 'high';
}
export declare class AntiHallucinationPlugin {
    name: string;
    version: string;
    private factualClaims;
    private hallucinationCheck;
    private citationRequirement;
    private perplexityClient;
    hooks: AdvancedPluginHooks;
    /**
     * Extract factual claims from search results
     */
    private extractFactualClaims;
    /**
     * Verify a claim against available citations
     */
    private verifyClaim;
    /**
     * Extract keywords from text
     */
    private extractKeywords;
    /**
     * Calculate keyword overlap between two sets
     */
    private calculateKeywordOverlap;
    /**
     * Assess overall hallucination risk
     */
    private assessHallucinationRisk;
    /**
     * Extract claims from synthesized response
     */
    private extractResponseClaims;
    /**
     * Check if a claim is grounded in citations
     */
    private isClaimGrounded;
    /**
     * Determine if claim requires uncertainty flag
     */
    private requiresUncertaintyFlag;
    /**
     * Add uncertainty marker to content
     */
    private addUncertaintyMarker;
    /**
     * Check for critical unverified claims
     */
    private checkForCriticalUnverifiedClaims;
    /**
     * Assess citation quality
     */
    private assessCitationQuality;
    /**
     * Get or create Perplexity client
     */
    private getClient;
    /**
     * Execute anti-hallucination verification directly using real API
     */
    execute(params: any): Promise<any>;
    /**
     * Find citations that support a claim
     */
    private findSupportingCitations;
}
declare const _default: AntiHallucinationPlugin;
export default _default;
//# sourceMappingURL=anti-hallucination-plugin.d.ts.map