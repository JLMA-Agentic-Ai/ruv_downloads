/**
 * Agentic Research Flow Plugin
 * Orchestrates multiple specialized research agents working concurrently
 */
import { AdvancedPluginHooks } from '../../core/advanced-types.js';
export interface ResearchAgent {
    id: string;
    role: 'explorer' | 'validator' | 'synthesizer' | 'critic' | 'fact-checker';
    specialty: string;
    status: 'idle' | 'working' | 'completed' | 'failed';
    results?: any;
    confidence?: number;
}
export interface ResearchFlow {
    id: string;
    query: string;
    agents: ResearchAgent[];
    phases: ResearchPhase[];
    consensus?: any;
    criticalFindings: string[];
    verificationStatus: 'pending' | 'verified' | 'disputed';
}
export interface ResearchPhase {
    name: string;
    type: 'exploration' | 'validation' | 'synthesis' | 'critique';
    agents: string[];
    results: any[];
    timestamp: number;
}
export declare class AgenticResearchFlowPlugin {
    name: string;
    version: string;
    private researchFlow;
    private agents;
    private maxConcurrentAgents;
    private perplexityClient;
    hooks: AdvancedPluginHooks;
    /**
     * Create a team of specialized research agents
     */
    private createResearchTeam;
    /**
     * Execute exploration phase with concurrent agents
     */
    private executeExplorationPhase;
    /**
     * Execute validation phase
     */
    private executeValidationPhase;
    /**
     * Execute synthesis phase
     */
    private executeSynthesisPhase;
    /**
     * Execute critique phase
     */
    private executeCritiquePhase;
    /**
     * Get or create Perplexity client
     */
    private getClient;
    /**
     * Execute actual agent research work using Perplexity API
     */
    private executeAgentWork;
    /**
     * Validate findings
     */
    private validateFindings;
    /**
     * Synthesize findings from multiple agents
     */
    private synthesizeFindings;
    /**
     * Perform critical analysis
     */
    private performCritique;
    /**
     * Build consensus from all agent phases
     */
    private buildConsensus;
    /**
     * Check if query is complex
     */
    private isComplexQuery;
    /**
     * Detect critical disagreements between agents
     */
    private detectCriticalDisagreements;
    /**
     * Calculate completeness of research
     */
    private calculateCompleteness;
    /**
     * Assess reliability of sources
     */
    private assessSourceReliability;
    /**
     * Calculate agreement level between agents
     */
    private calculateAgreement;
    /**
     * Calculate overall confidence from all agents
     */
    private calculateOverallConfidence;
    /**
     * Execute multi-agent research orchestration directly
     */
    execute(params: any): Promise<any>;
    /**
     * Generate findings for a specific agent type
     */
    private generateAgentFindings;
    /**
     * Synthesize findings from agents for execute method
     */
    private synthesizeFindingsString;
}
declare const _default: AgenticResearchFlowPlugin;
export default _default;
//# sourceMappingURL=agentic-research-flow-plugin.d.ts.map