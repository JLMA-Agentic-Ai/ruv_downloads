/**
 * @neural-trader/example-supply-chain-prediction
 *
 * Self-learning demand forecasting and swarm-based inventory optimization
 * with uncertainty quantification for retail, manufacturing, and e-commerce.
 *
 * Features:
 * - Multi-echelon inventory optimization
 * - Demand sensing with conformal prediction
 * - Lead time uncertainty modeling
 * - Safety stock optimization
 * - Swarm exploration of (s,S) policies
 * - Self-learning service level targets
 * - AgentDB memory for seasonal patterns
 *
 * @module @neural-trader/example-supply-chain-prediction
 */
export { DemandForecaster, DemandPattern, DemandForecast, ForecastConfig, } from './demand-forecaster';
export { InventoryOptimizer, InventoryNode, OptimizationResult, NetworkOptimization, OptimizerConfig, } from './inventory-optimizer';
export { SwarmPolicyOptimizer, PolicyParticle, SwarmConfig, SwarmResult, } from './swarm-policy';
export type { ConformalConfig } from '@neural-trader/predictor';
/**
 * Complete supply chain optimization system
 */
import { ForecastConfig } from './demand-forecaster';
import { OptimizerConfig, InventoryNode } from './inventory-optimizer';
import { SwarmConfig } from './swarm-policy';
export interface SupplyChainConfig {
    forecast: ForecastConfig;
    optimizer: OptimizerConfig;
    swarm: SwarmConfig;
    openRouterApiKey?: string;
}
export declare class SupplyChainSystem {
    private forecaster;
    private optimizer;
    private swarmOptimizer;
    private config;
    constructor(config: SupplyChainConfig);
    /**
     * Initialize supply chain network
     */
    addInventoryNode(node: InventoryNode): void;
    /**
     * Train system on historical data
     */
    train(historicalData: any[]): Promise<void>;
    /**
     * Optimize supply chain with swarm intelligence
     */
    optimize(productId: string, currentFeatures: any): Promise<{
        swarmResult: import("./swarm-policy").SwarmResult;
        networkOptimization: import("./inventory-optimizer").NetworkOptimization;
        bestPolicy: {
            reorderPoint: number;
            orderUpToLevel: number;
            safetyFactor: number;
        };
        performance: {
            cost: number;
            serviceLevel: number;
            combined: number;
        };
    }>;
    /**
     * Get real-time recommendations
     */
    getRecommendations(productId: string, currentFeatures: any): Promise<{
        forecast: import("./demand-forecaster").DemandForecast;
        optimization: import("./inventory-optimizer").NetworkOptimization;
        recommendations: {
            nodeId: string;
            action: string;
            quantity: number;
            urgency: string;
            reason: string;
        }[];
    }>;
    /**
     * Update system with new observation
     */
    update(observation: any): Promise<void>;
    /**
     * Get system metrics
     */
    getMetrics(): {
        forecastCalibration: {
            coverage: number;
            intervalWidth: number;
        };
        networkTopology: {
            nodes: InventoryNode[];
            edges: Array<{
                from: string;
                to: string;
            }>;
        };
        paretoFront: import("./swarm-policy").PolicyParticle[];
    };
    /**
     * Generate recommendation reason
     */
    private generateReason;
}
/**
 * Factory function for easy setup
 */
export declare function createSupplyChainSystem(config?: Partial<SupplyChainConfig>): SupplyChainSystem;
/**
 * Example usage for retail
 */
export declare function retailExample(): Promise<{
    swarmResult: import("./swarm-policy").SwarmResult;
    networkOptimization: import("./inventory-optimizer").NetworkOptimization;
    bestPolicy: {
        reorderPoint: number;
        orderUpToLevel: number;
        safetyFactor: number;
    };
    performance: {
        cost: number;
        serviceLevel: number;
        combined: number;
    };
}>;
/**
 * Example usage for manufacturing
 */
export declare function manufacturingExample(): Promise<SupplyChainSystem>;
/**
 * Example usage for e-commerce
 */
export declare function ecommerceExample(): Promise<SupplyChainSystem>;
//# sourceMappingURL=index.d.ts.map