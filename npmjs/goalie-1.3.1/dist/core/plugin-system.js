/**
 * Plugin System with Lifecycle Hooks
 * Allows extensible functionality through plugin architecture
 */
export class PluginRegistry {
    plugins = new Map();
    enabledPlugins = new Set();
    initialized = false;
    /**
     * Register a plugin
     */
    register(plugin) {
        if (this.plugins.has(plugin.name)) {
            throw new Error(`Plugin ${plugin.name} is already registered`);
        }
        this.plugins.set(plugin.name, plugin);
        this.enabledPlugins.add(plugin.name); // Enable by default
        console.log(`Registered plugin: ${plugin.name} v${plugin.version}`);
    }
    /**
     * Unregister a plugin
     */
    unregister(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (plugin && plugin.cleanup) {
            plugin.cleanup();
        }
        this.plugins.delete(pluginName);
    }
    /**
     * Initialize all plugins
     */
    async initialize() {
        if (this.initialized)
            return;
        for (const plugin of this.plugins.values()) {
            if (plugin.initialize) {
                try {
                    await plugin.initialize();
                    console.log(`Initialized plugin: ${plugin.name}`);
                }
                catch (error) {
                    console.error(`Failed to initialize plugin ${plugin.name}:`, error);
                }
            }
        }
        this.initialized = true;
    }
    /**
     * Execute onPlanStart hooks
     */
    async executeOnPlanStart(context) {
        await this.executeHook('onPlanStart', context);
    }
    /**
     * Execute beforeSearch hooks
     */
    async executeBeforeSearch(context) {
        await this.executeHook('beforeSearch', context);
    }
    /**
     * Execute afterSearch hooks
     */
    async executeAfterSearch(plan, context) {
        await this.executeHook('afterSearch', plan, context);
    }
    /**
     * Execute beforeExecute hooks
     */
    async executeBeforeExecute(step, state) {
        await this.executeHook('beforeExecute', step, state);
    }
    /**
     * Execute afterExecute hooks
     */
    async executeAfterExecute(step, result, state) {
        await this.executeHook('afterExecute', step, result, state);
    }
    /**
     * Execute onReplan hooks
     */
    async executeOnReplan(failedStep, state) {
        await this.executeHook('onReplan', failedStep, state);
    }
    /**
     * Execute onPlanComplete hooks
     */
    async executeOnPlanComplete(result) {
        await this.executeHook('onPlanComplete', result);
    }
    /**
     * Execute onError hooks
     */
    async executeOnError(error, context) {
        await this.executeHook('onError', error, context);
    }
    /**
     * Get list of registered plugins
     */
    getPlugins() {
        return Array.from(this.plugins.values());
    }
    /**
     * Get plugin by name
     */
    getPlugin(name) {
        return this.plugins.get(name);
    }
    /**
     * List all registered plugins
     */
    listPlugins() {
        return Array.from(this.plugins.values()).map(plugin => ({
            name: plugin.name,
            version: plugin.version,
            description: plugin.description,
            enabled: this.enabledPlugins.has(plugin.name)
        }));
    }
    /**
     * Enable a plugin by name
     */
    enablePlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            return { success: false, message: `Plugin ${name} not found` };
        }
        this.enabledPlugins.add(name);
        return { success: true, message: `Plugin ${name} enabled` };
    }
    /**
     * Disable a plugin by name
     */
    disablePlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            return { success: false, message: `Plugin ${name} not found` };
        }
        this.enabledPlugins.delete(name);
        return { success: true, message: `Plugin ${name} disabled` };
    }
    /**
     * Get detailed plugin information
     */
    getPluginInfo(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            return { error: `Plugin ${name} not found` };
        }
        return {
            name: plugin.name,
            version: plugin.version,
            description: plugin.description,
            enabled: this.enabledPlugins.has(name),
            hooks: Object.keys(plugin.hooks)
        };
    }
    /**
     * Generic hook execution
     */
    async executeHook(hookName, ...args) {
        for (const plugin of this.plugins.values()) {
            const hook = plugin.hooks[hookName];
            if (hook) {
                try {
                    await hook(...args);
                }
                catch (error) {
                    console.error(`Error in plugin ${plugin.name} hook ${hookName}:`, error);
                    // Continue executing other plugins even if one fails
                }
            }
        }
    }
}
/**
 * Plugin loader for external plugins
 */
export class PluginLoader {
    static async loadFromFile(filePath) {
        try {
            const pluginModule = await import(filePath);
            const plugin = pluginModule.default || pluginModule;
            if (!this.isValidPlugin(plugin)) {
                throw new Error(`Invalid plugin structure in ${filePath}`);
            }
            return plugin;
        }
        catch (error) {
            throw new Error(`Failed to load plugin from ${filePath}: ${error}`);
        }
    }
    static async loadFromFiles(filePaths) {
        const plugins = [];
        for (const filePath of filePaths) {
            try {
                const plugin = await this.loadFromFile(filePath);
                plugins.push(plugin);
            }
            catch (error) {
                console.error(`Failed to load plugin from ${filePath}:`, error);
            }
        }
        return plugins;
    }
    static isValidPlugin(obj) {
        return (obj &&
            typeof obj.name === 'string' &&
            typeof obj.version === 'string' &&
            typeof obj.hooks === 'object');
    }
}
/**
 * Built-in plugins
 */
// Cost tracking plugin
export const costTrackingPlugin = {
    name: 'cost-tracker',
    version: '1.0.0',
    description: 'Tracks execution costs and provides cost analytics',
    hooks: {
        onPlanStart: (context) => {
            context.startTime = Date.now();
            context.costs = [];
        },
        afterExecute: (step, result, state) => {
            const costs = state.costs || [];
            costs.push({
                action: step.action.name,
                cost: step.estimatedCost,
                timestamp: Date.now()
            });
            state.costs = costs;
        },
        onPlanComplete: (result) => {
            const totalCost = result.finalState.costs?.reduce((sum, item) => sum + item.cost, 0) || 0;
            console.log(`Total execution cost: ${totalCost}`);
        }
    }
};
// Performance monitoring plugin
export const performanceMonitoringPlugin = {
    name: 'performance-monitor',
    version: '1.0.0',
    description: 'Monitors execution performance and timing',
    hooks: {
        onPlanStart: (context) => {
            context.performanceMetrics = {
                startTime: Date.now(),
                stepTimes: []
            };
        },
        beforeExecute: (step, state) => {
            state.stepStartTime = Date.now();
        },
        afterExecute: (step, result, state) => {
            const stepTime = Date.now() - state.stepStartTime;
            const metrics = state.performanceMetrics || { stepTimes: [] };
            metrics.stepTimes.push({
                action: step.action.name,
                duration: stepTime,
                success: result.success
            });
            state.performanceMetrics = metrics;
        },
        onPlanComplete: (result) => {
            const metrics = result.finalState.performanceMetrics;
            if (metrics) {
                const totalTime = Date.now() - metrics.startTime;
                const avgStepTime = metrics.stepTimes.reduce((sum, step) => sum + step.duration, 0) / Math.max(metrics.stepTimes.length, 1);
                console.log(`Plan execution completed in ${totalTime}ms`);
                console.log(`Average step time: ${avgStepTime.toFixed(2)}ms`);
            }
        }
    }
};
// Logging plugin
export const loggingPlugin = {
    name: 'logger',
    version: '1.0.0',
    description: 'Comprehensive logging of plan execution',
    hooks: {
        onPlanStart: (context) => {
            console.log(`🎯 Starting plan for goal: ${context.goal.name}`);
            console.log(`📊 Available actions: ${context.availableActions.length}`);
        },
        beforeSearch: (context) => {
            console.log(`🔍 Searching for plan...`);
        },
        afterSearch: (plan, context) => {
            if (plan) {
                console.log(`✅ Plan found with ${plan.steps.length} steps, cost: ${plan.totalCost}`);
            }
            else {
                console.log(`❌ No plan found for goal: ${context.goal.name}`);
            }
        },
        beforeExecute: (step, state) => {
            console.log(`⚡ Executing: ${step.action.name}`);
        },
        afterExecute: (step, result, state) => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${step.action.name}: ${result.success ? 'success' : result.error}`);
        },
        onReplan: (failedStep, state) => {
            console.log(`🔄 Replanning after failed step: ${failedStep.action.name}`);
        },
        onPlanComplete: (result) => {
            const status = result.success ? '🎉' : '💥';
            console.log(`${status} Plan ${result.success ? 'completed' : 'failed'} after ${result.executedSteps} steps`);
            if (result.replanned) {
                console.log(`🔄 Plan was replanned ${result.planHistory.length - 1} times`);
            }
        },
        onError: (error, context) => {
            console.error(`💥 Plugin system error:`, error.message);
        }
    }
};
// Query diversification plugin (for search enhancement)
export const queryDiversificationPlugin = {
    name: 'query-diversifier',
    version: '1.0.0',
    description: 'Diversifies search queries for better coverage',
    hooks: {
        beforeExecute: (step, state) => {
            if (step.action.name === 'compose_queries') {
                // Add query variants
                const baseQuery = step.params?.query || '';
                const variants = [
                    `${baseQuery} site:edu`,
                    `${baseQuery} site:gov`,
                    `${baseQuery} filetype:pdf`,
                    `${baseQuery} latest`,
                    `"${baseQuery}" research`
                ];
                step.params.queryVariants = variants;
                console.log(`🎲 Added ${variants.length} query variants`);
            }
        }
    }
};
//# sourceMappingURL=plugin-system.js.map