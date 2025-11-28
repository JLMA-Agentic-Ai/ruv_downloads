/**
 * Plugin System with Lifecycle Hooks
 * Allows extensible functionality through plugin architecture
 */
import { GoapPlugin, PlanningContext, GoapPlan, PlanStep, WorldState, PlanExecutionResult } from './types.js';
export declare class PluginRegistry {
    private plugins;
    private enabledPlugins;
    private initialized;
    /**
     * Register a plugin
     */
    register(plugin: GoapPlugin): void;
    /**
     * Unregister a plugin
     */
    unregister(pluginName: string): void;
    /**
     * Initialize all plugins
     */
    initialize(): Promise<void>;
    /**
     * Execute onPlanStart hooks
     */
    executeOnPlanStart(context: PlanningContext): Promise<void>;
    /**
     * Execute beforeSearch hooks
     */
    executeBeforeSearch(context: PlanningContext): Promise<void>;
    /**
     * Execute afterSearch hooks
     */
    executeAfterSearch(plan: GoapPlan | null, context: PlanningContext): Promise<void>;
    /**
     * Execute beforeExecute hooks
     */
    executeBeforeExecute(step: PlanStep, state: WorldState): Promise<void>;
    /**
     * Execute afterExecute hooks
     */
    executeAfterExecute(step: PlanStep, result: any, state: WorldState): Promise<void>;
    /**
     * Execute onReplan hooks
     */
    executeOnReplan(failedStep: PlanStep, state: WorldState): Promise<void>;
    /**
     * Execute onPlanComplete hooks
     */
    executeOnPlanComplete(result: PlanExecutionResult): Promise<void>;
    /**
     * Execute onError hooks
     */
    executeOnError(error: Error, context: any): Promise<void>;
    /**
     * Get list of registered plugins
     */
    getPlugins(): GoapPlugin[];
    /**
     * Get plugin by name
     */
    getPlugin(name: string): GoapPlugin | undefined;
    /**
     * List all registered plugins
     */
    listPlugins(): {
        name: string;
        version: string;
        description?: string;
        enabled: boolean;
    }[];
    /**
     * Enable a plugin by name
     */
    enablePlugin(name: string): {
        success: boolean;
        message: string;
    };
    /**
     * Disable a plugin by name
     */
    disablePlugin(name: string): {
        success: boolean;
        message: string;
    };
    /**
     * Get detailed plugin information
     */
    getPluginInfo(name: string): any;
    /**
     * Generic hook execution
     */
    private executeHook;
}
/**
 * Plugin loader for external plugins
 */
export declare class PluginLoader {
    static loadFromFile(filePath: string): Promise<GoapPlugin>;
    static loadFromFiles(filePaths: string[]): Promise<GoapPlugin[]>;
    private static isValidPlugin;
}
/**
 * Built-in plugins
 */
export declare const costTrackingPlugin: GoapPlugin;
export declare const performanceMonitoringPlugin: GoapPlugin;
export declare const loggingPlugin: GoapPlugin;
export declare const queryDiversificationPlugin: GoapPlugin;
//# sourceMappingURL=plugin-system.d.ts.map