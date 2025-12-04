/**
 * MCP Tools for GOAP Search and Planning Operations
 * Provides the main interface for Claude to interact with the GOAP planner
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SearchRequest, SearchResult } from '../core/types.js';
export declare class GoapMCPTools {
    private planner;
    private pluginRegistry;
    private reasoningEngine;
    private outputManager;
    private availableActions;
    private ed25519Verifier;
    private antiHallucinationVerifier;
    constructor();
    initialize(): Promise<void>;
    private initializeTrustedKeys;
    /**
     * Main GOAP search tool - plans and executes search with synthesis
     */
    getGoapSearchTool(): Tool;
    /**
     * Execute GOAP search
     */
    executeGoapSearch(params: SearchRequest): Promise<SearchResult>;
    /**
     * Plan explanation tool
     */
    getPlanExplainTool(): Tool;
    /**
     * Execute plan explanation
     */
    executePlanExplain(params: any): Promise<any>;
    /**
     * Raw search tool (bypass GOAP planning)
     */
    getRawSearchTool(): Tool;
    /**
     * Execute raw search
     */
    executeRawSearch(params: any): Promise<any>;
    /**
     * Generate comprehensive plan execution log
     */
    private generatePlanLog;
    /**
     * Explain the GOAP workflow
     */
    private explainWorkflow;
    /**
     * Get human-readable action descriptions
     */
    private getActionDescription;
    /**
     * Get all plugin management tools
     */
    getPluginTools(): Tool[];
    /**
     * Get advanced reasoning plugin tools
     */
    getAdvancedReasoningTools(): Tool[];
    /**
     * Get all available tools
     */
    getTools(): Tool[];
    /**
     * Execute a tool by name
     */
    executeToolByName(toolName: string, params: any): Promise<any>;
}
//# sourceMappingURL=tools.d.ts.map