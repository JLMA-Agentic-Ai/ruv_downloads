/**
 * Multi-Echelon Inventory Optimizer
 *
 * Features:
 * - Multi-echelon network optimization
 * - Safety stock calculation with lead time uncertainty
 * - Service level optimization
 * - Cost-based optimization (holding, ordering, shortage)
 * - Dynamic reorder point calculation
 */
import { DemandForecaster, DemandForecast } from './demand-forecaster';
export interface InventoryNode {
    nodeId: string;
    type: 'supplier' | 'warehouse' | 'distribution' | 'retail';
    level: number;
    upstreamNodes: string[];
    downstreamNodes: string[];
    position: {
        currentStock: number;
        onOrder: number;
        allocated: number;
    };
    costs: {
        holding: number;
        ordering: number;
        shortage: number;
    };
    leadTime: {
        mean: number;
        stdDev: number;
        distribution: 'normal' | 'lognormal' | 'gamma';
    };
    capacity: {
        storage: number;
        throughput: number;
    };
}
export interface OptimizationResult {
    nodeId: string;
    reorderPoint: number;
    orderUpToLevel: number;
    safetyStock: number;
    expectedCost: number;
    serviceLevel: number;
    policy: {
        type: '(s,S)' | '(R,s,S)' | 'baseStock';
        parameters: Record<string, number>;
    };
}
export interface NetworkOptimization {
    timestamp: number;
    totalCost: number;
    avgServiceLevel: number;
    nodeResults: OptimizationResult[];
    flow: Map<string, Map<string, number>>;
}
export interface OptimizerConfig {
    targetServiceLevel: number;
    planningHorizon: number;
    reviewPeriod: number;
    safetyFactor: number;
    costWeights: {
        holding: number;
        ordering: number;
        shortage: number;
    };
}
export declare class InventoryOptimizer {
    private forecaster;
    private config;
    private network;
    constructor(forecaster: DemandForecaster, config: OptimizerConfig);
    /**
     * Add node to inventory network
     */
    addNode(node: InventoryNode): void;
    /**
     * Optimize entire network
     */
    optimizeNetwork(productId: string, currentFeatures: any): Promise<NetworkOptimization>;
    /**
     * Optimize single node
     */
    optimizeNode(node: InventoryNode, forecasts: DemandForecast[]): Promise<OptimizationResult>;
    /**
     * Calculate safety stock with lead time uncertainty
     */
    private calculateSafetyStock;
    /**
     * Calculate lead time demand
     */
    private calculateLeadTimeDemand;
    /**
     * Calculate demand statistics from forecasts
     */
    private calculateDemandStats;
    /**
     * Calculate order-up-to level
     */
    private calculateOrderUpToLevel;
    /**
     * Calculate Economic Order Quantity (EOQ)
     */
    private calculateEOQ;
    /**
     * Calculate expected cost
     */
    private calculateExpectedCost;
    /**
     * Calculate service level
     */
    private calculateServiceLevel;
    /**
     * Standard normal CDF approximation
     */
    private normalCDF;
    /**
     * Calculate flows between nodes
     */
    private calculateFlows;
    /**
     * Sort nodes by level (upstream first)
     */
    private sortNodesByLevel;
    /**
     * Get network topology
     */
    getNetworkTopology(): {
        nodes: InventoryNode[];
        edges: Array<{
            from: string;
            to: string;
        }>;
    };
    /**
     * Simulate inventory performance
     */
    simulate(productId: string, currentFeatures: any, periods: number): Promise<{
        avgServiceLevel: number;
        avgInventoryCost: number;
        stockouts: number;
        fillRate: number;
    }>;
}
//# sourceMappingURL=inventory-optimizer.d.ts.map