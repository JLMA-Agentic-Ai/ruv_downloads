/**
 * Chain-of-Thought (CoT) Reasoning Plugin
 * Implements Tree-of-Thoughts and Graph-of-Thoughts for multi-path reasoning
 */
import { AdvancedPluginHooks } from '../../core/advanced-types.js';
export interface ThoughtNode {
    id: string;
    thought: string;
    confidence: number;
    children: ThoughtNode[];
    evidence: string[];
    contradictions: string[];
}
export declare class ChainOfThoughtPlugin {
    name: string;
    version: string;
    private thoughtTree;
    private reasoningPaths;
    private perplexityClient;
    hooks: AdvancedPluginHooks;
    /**
     * Get or create Perplexity client
     */
    private getClient;
    /**
     * Generate a thought tree from a query using real Perplexity API
     */
    private generateThoughtTree;
    /**
     * Extract all possible reasoning paths from the thought tree
     */
    private extractReasoningPaths;
    /**
     * Validate a reasoning path against search results
     */
    private validatePath;
    /**
     * Detect contradictions in reasoning
     */
    private detectContradictions;
    /**
     * Execute chain-of-thought reasoning directly
     */
    execute(params: any): Promise<any>;
}
declare const _default: ChainOfThoughtPlugin;
export default _default;
//# sourceMappingURL=chain-of-thought-plugin.d.ts.map