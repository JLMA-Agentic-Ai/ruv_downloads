/**
 * Advanced Types for Extended Plugin System
 * Provides additional context and hooks for advanced reasoning plugins
 */
/**
 * Adapter to convert advanced plugins to standard GOAP plugins
 */
export class AdvancedPluginAdapter {
    advancedPlugin;
    name;
    version;
    description;
    hooks;
    execute;
    constructor(advancedPlugin) {
        this.advancedPlugin = advancedPlugin;
        this.name = advancedPlugin.name;
        this.version = advancedPlugin.version;
        this.description = advancedPlugin.description;
        // Adapt hooks to standard interface
        this.hooks = this.createCompatibleHooks(advancedPlugin.hooks);
        // Add execute method that calls the appropriate hook
        this.execute = async (params) => {
            // First check if the plugin itself has an execute method
            if (this.advancedPlugin.execute) {
                return this.advancedPlugin.execute(params);
            }
            // Then check if the hooks have an execute method
            if (this.advancedPlugin.hooks?.execute) {
                return this.advancedPlugin.hooks.execute(params);
            }
            // Fallback to processing through hooks
            const context = {
                query: params.query || '',
                metadata: {},
                searchParams: params
            };
            if (this.advancedPlugin.hooks?.processReasoning) {
                return this.advancedPlugin.hooks.processReasoning(context);
            }
            // Default response
            return {
                success: true,
                plugin: this.name,
                params,
                message: `Plugin ${this.name} executed successfully`,
                result: `Processed query: ${params.query || 'N/A'}`
            };
        };
    }
    createCompatibleHooks(advancedHooks) {
        const hooks = {};
        // Map advanced hooks to standard hooks where possible
        if (advancedHooks.beforeSearch) {
            hooks.beforeSearch = async (context) => {
                // Create extended context
                const extendedContext = {
                    ...context,
                    query: context.query,
                    metadata: {},
                    searchParams: {}
                };
                await advancedHooks.beforeSearch(extendedContext);
                // Copy back any modifications
                Object.assign(context, extendedContext);
            };
        }
        if (advancedHooks.afterSearch) {
            hooks.afterSearch = async (plan, context) => {
                // Create extended context
                const extendedContext = {
                    ...context,
                    query: context.query,
                    searchResults: plan
                };
                const result = await advancedHooks.afterSearch(plan, extendedContext);
                // Store verification results if any
                if (advancedHooks.verify) {
                    context.verificationPending = true;
                }
                return result;
            };
        }
        // Map synthesis hooks to plan execution hooks
        if (advancedHooks.beforeSynthesize) {
            hooks.beforeExecute = async (step, state) => {
                const extendedContext = {
                    query: step.query,
                    metadata: step.metadata || {},
                    synthesisParams: {}
                };
                await advancedHooks.beforeSynthesize(extendedContext);
            };
        }
        if (advancedHooks.afterSynthesize) {
            hooks.afterExecute = async (step, result, state) => {
                const extendedContext = {
                    query: step.query,
                    metadata: step.metadata || {}
                };
                return await advancedHooks.afterSynthesize(result, extendedContext);
            };
        }
        // Add verification as error handler
        if (advancedHooks.verify) {
            hooks.onPlanComplete = async (result) => {
                const extendedContext = {
                    metadata: result.metadata || {}
                };
                const verification = await advancedHooks.verify(result, extendedContext);
                if (!verification.valid) {
                    console.log(`⚠️ [${this.name}] Verification failed: ${verification.method} (${(verification.confidence * 100).toFixed(1)}% confidence)`);
                }
                result.verification = verification;
            };
        }
        return hooks;
    }
    async initialize() {
        if (this.advancedPlugin.initialize) {
            await this.advancedPlugin.initialize();
        }
    }
    async cleanup() {
        if (this.advancedPlugin.cleanup) {
            await this.advancedPlugin.cleanup();
        }
    }
}
//# sourceMappingURL=advanced-types.js.map