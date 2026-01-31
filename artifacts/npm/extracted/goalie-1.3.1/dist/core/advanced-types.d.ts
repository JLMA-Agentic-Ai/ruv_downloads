/**
 * Advanced Types for Extended Plugin System
 * Provides additional context and hooks for advanced reasoning plugins
 */
import { GoapPlugin, PluginHooks, PlanningContext } from './types.js';
/**
 * Extended plugin context for advanced reasoning
 */
export interface PluginContext extends Partial<PlanningContext> {
    query?: string;
    searchResults?: any;
    metadata?: Record<string, any>;
    searchParams?: {
        return_citations?: boolean;
        citation_quality?: string;
        domains?: string[];
        mode?: string;
        [key: string]: any;
    };
    synthesisParams?: {
        instruction?: string;
        requireCitations?: boolean;
        uncertaintyThreshold?: number;
        [key: string]: any;
    };
    requiresAdditionalVerification?: boolean;
    skipSearch?: boolean;
    cachedResult?: any;
}
/**
 * Extended plugin hooks for advanced reasoning
 */
export interface AdvancedPluginHooks extends PluginHooks {
    beforeSynthesize?: (context: PluginContext) => Promise<void> | void;
    afterSynthesize?: (result: any, context: PluginContext) => Promise<any> | any;
    verify?: (result: any, context: PluginContext) => Promise<VerificationResult> | VerificationResult;
}
/**
 * Verification result from plugins
 */
export interface VerificationResult {
    valid: boolean;
    confidence: number;
    method: string;
    details?: any;
}
/**
 * Advanced reasoning plugin interface
 */
export interface AdvancedGoapPlugin extends GoapPlugin {
    hooks: AdvancedPluginHooks;
}
/**
 * Adapter to convert advanced plugins to standard GOAP plugins
 */
export declare class AdvancedPluginAdapter implements GoapPlugin {
    private advancedPlugin;
    name: string;
    version: string;
    description?: string;
    hooks: PluginHooks;
    execute?: (params: any) => Promise<any>;
    constructor(advancedPlugin: any);
    private createCompatibleHooks;
    initialize?(): Promise<void>;
    cleanup?(): Promise<void>;
}
//# sourceMappingURL=advanced-types.d.ts.map