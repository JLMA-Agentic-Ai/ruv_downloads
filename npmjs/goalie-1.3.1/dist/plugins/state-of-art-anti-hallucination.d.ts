/**
 * State-of-the-Art Anti-Hallucination System
 *
 * Implements cutting-edge techniques from 2024-2025 research:
 * - RAG with Knowledge Grounding
 * - Contrastive Decoding
 * - Self-Evaluation and Uncertainty Estimation
 * - Metamorphic Testing
 * - Multi-source Verification
 * - Citation Attribution
 */
import type { GoapPlugin, WorldState, PlanStep } from '../core/types';
export declare class StateOfArtAntiHallucination implements GoapPlugin {
    name: string;
    version: string;
    private hallucinationDetections;
    private totalClaims;
    private replanAttempts;
    private maxReplans;
    /**
     * 1. RETRIEVAL-AUGMENTED GENERATION (RAG) VERIFICATION
     * Verify claims are grounded in retrieved sources
     */
    private verifyRAGGrounding;
    /**
     * 2. CONTRASTIVE DECODING & CONSISTENCY CHECKING
     * Compare multiple generation attempts for consistency
     */
    private verifyConsistency;
    /**
     * 3. SELF-EVALUATION & UNCERTAINTY ESTIMATION
     * Check if model expresses appropriate uncertainty
     */
    private verifyUncertaintyCalibration;
    /**
     * 4. METAMORPHIC TESTING
     * Test stability under input perturbations
     */
    private verifyMetamorphicStability;
    /**
     * 5. CITATION ATTRIBUTION VERIFICATION
     * Ensure all claims have proper citation attribution
     */
    private verifyCitationAttribution;
    /**
     * Helper: Extract key facts from content
     */
    private extractKeyFacts;
    /**
     * Helper: Generate alternative phrasings
     */
    private generateAlternatives;
    /**
     * Helper: Check if fact appears in text
     */
    private factAppearsIn;
    /**
     * Helper: Detect contradiction between sentences
     */
    private detectContradiction;
    /**
     * Main validation orchestrator
     */
    private performComprehensiveValidation;
    hooks: {
        afterSynthesize: (result: any) => Promise<void>;
        onReplan: (failedStep: PlanStep, state: WorldState) => Promise<void>;
    };
}
export declare function createAntiHallucinationPlugin(): StateOfArtAntiHallucination;
declare const _default: StateOfArtAntiHallucination;
export default _default;
//# sourceMappingURL=state-of-art-anti-hallucination.d.ts.map