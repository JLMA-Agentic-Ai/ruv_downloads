/**
 * Perplexity API Integration Actions
 * Implements search and synthesis capabilities using Perplexity API
 */
import { GoapAction } from '../core/types.js';
export interface PerplexitySearchParams {
    query: string | string[];
    mode?: 'web' | 'academic';
    recency?: 'hour' | 'day' | 'week' | 'month' | 'year';
    domains?: string[];
    maxResults?: number;
}
export interface PerplexityChatParams {
    messages: Array<{
        role: string;
        content: string;
    }>;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    searchDomainFilter?: string[];
    searchRecencyFilter?: 'hour' | 'day' | 'week' | 'month' | 'year';
    searchMode?: 'web' | 'academic';
}
export declare class PerplexityClient {
    private apiKey;
    private baseURL;
    constructor(apiKey: string);
    /**
     * Perform web search using Perplexity Search API
     */
    search(params: PerplexitySearchParams): Promise<any>;
    /**
     * Perform chat completion using Perplexity Sonar models
     */
    chat(params: PerplexityChatParams): Promise<any>;
}
/**
 * Action: Compose search queries from user input
 */
export declare const composeQueriesAction: GoapAction;
/**
 * Action: Search information using Perplexity Search API
 */
export declare const searchInformationAction: GoapAction;
/**
 * Action: Synthesize results using Perplexity Sonar chat
 */
export declare const synthesizeResultsAction: GoapAction;
/**
 * Action: Verify citations and answer quality
 */
export declare const verifyAnswerAction: GoapAction;
export declare const perplexityActions: GoapAction[];
//# sourceMappingURL=perplexity-actions.d.ts.map