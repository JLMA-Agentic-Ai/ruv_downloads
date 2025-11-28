"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryOptimizer = void 0;
class InventoryOptimizer {
    forecaster;
    config;
    network;
    constructor(forecaster, config) {
        this.forecaster = forecaster;
        this.config = config;
        this.network = new Map();
    }
    /**
     * Add node to inventory network
     */
    addNode(node) {
        this.network.set(node.nodeId, node);
    }
    /**
     * Optimize entire network
     */
    async optimizeNetwork(productId, currentFeatures) {
        // Get demand forecasts for all nodes
        const forecasts = await this.forecaster.forecastMultiHorizon(productId, currentFeatures);
        // Optimize each node
        const nodeResults = [];
        const flow = new Map();
        // Sort nodes by level (optimize upstream first)
        const sortedNodes = this.sortNodesByLevel();
        for (const node of sortedNodes) {
            const result = await this.optimizeNode(node, forecasts);
            nodeResults.push(result);
            // Calculate flows
            this.calculateFlows(node, result, flow);
        }
        // Calculate total cost and service level
        const totalCost = nodeResults.reduce((sum, r) => sum + r.expectedCost, 0);
        const avgServiceLevel = nodeResults.reduce((sum, r) => sum + r.serviceLevel, 0) / nodeResults.length;
        return {
            timestamp: Date.now(),
            totalCost,
            avgServiceLevel,
            nodeResults,
            flow,
        };
    }
    /**
     * Optimize single node
     */
    async optimizeNode(node, forecasts) {
        // Calculate demand statistics over planning horizon
        const demandStats = this.calculateDemandStats(forecasts);
        // Calculate lead time demand
        const leadTimeDemand = this.calculateLeadTimeDemand(node, demandStats);
        // Calculate safety stock
        const safetyStock = this.calculateSafetyStock(node, leadTimeDemand);
        // Calculate reorder point
        const reorderPoint = leadTimeDemand.mean + safetyStock;
        // Calculate order-up-to level (for (s,S) policy)
        const orderUpToLevel = this.calculateOrderUpToLevel(node, demandStats, reorderPoint);
        // Calculate expected cost
        const expectedCost = this.calculateExpectedCost(node, reorderPoint, orderUpToLevel, demandStats);
        // Calculate service level
        const serviceLevel = this.calculateServiceLevel(node, reorderPoint, leadTimeDemand);
        return {
            nodeId: node.nodeId,
            reorderPoint,
            orderUpToLevel,
            safetyStock,
            expectedCost,
            serviceLevel,
            policy: {
                type: '(s,S)',
                parameters: {
                    s: reorderPoint,
                    S: orderUpToLevel,
                    Q: orderUpToLevel - reorderPoint,
                },
            },
        };
    }
    /**
     * Calculate safety stock with lead time uncertainty
     */
    calculateSafetyStock(node, leadTimeDemand) {
        // Safety stock = Z * sqrt(LT * σ²_D + D² * σ²_LT)
        // where Z = safety factor, LT = lead time, D = demand, σ = std dev
        const Z = this.config.safetyFactor;
        const demandVariance = leadTimeDemand.stdDev ** 2;
        const leadTimeVariance = node.leadTime.stdDev ** 2;
        const varianceComponent1 = node.leadTime.mean * demandVariance;
        const varianceComponent2 = leadTimeDemand.mean ** 2 * leadTimeVariance;
        const totalStdDev = Math.sqrt(varianceComponent1 + varianceComponent2);
        return Z * totalStdDev;
    }
    /**
     * Calculate lead time demand
     */
    calculateLeadTimeDemand(node, demandStats) {
        // Assuming independent demand across periods
        const periodsInLeadTime = node.leadTime.mean;
        const mean = demandStats.mean * periodsInLeadTime;
        const stdDev = demandStats.stdDev * Math.sqrt(periodsInLeadTime);
        return { mean, stdDev };
    }
    /**
     * Calculate demand statistics from forecasts
     */
    calculateDemandStats(forecasts) {
        const demands = forecasts.map((f) => f.pointForecast);
        const mean = demands.reduce((a, b) => a + b, 0) / demands.length;
        const variance = demands.reduce((sum, d) => sum + (d - mean) ** 2, 0) / demands.length;
        const stdDev = Math.sqrt(variance);
        return { mean, stdDev, periods: forecasts.length };
    }
    /**
     * Calculate order-up-to level
     */
    calculateOrderUpToLevel(node, demandStats, reorderPoint) {
        // Order-up-to level = demand during lead time + review period + safety stock
        const reviewPeriodDemand = demandStats.mean * this.config.reviewPeriod;
        const economicOrderQuantity = this.calculateEOQ(node, demandStats);
        return reorderPoint + Math.max(reviewPeriodDemand, economicOrderQuantity);
    }
    /**
     * Calculate Economic Order Quantity (EOQ)
     */
    calculateEOQ(node, demandStats) {
        // EOQ = sqrt(2 * D * K / h)
        // D = annual demand, K = ordering cost, h = holding cost
        const annualDemand = demandStats.mean * 365;
        const orderingCost = node.costs.ordering;
        const holdingCost = node.costs.holding;
        return Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
    }
    /**
     * Calculate expected cost
     */
    calculateExpectedCost(node, reorderPoint, orderUpToLevel, demandStats) {
        // Expected holding cost
        const avgInventory = (reorderPoint + orderUpToLevel) / 2;
        const holdingCost = avgInventory * node.costs.holding;
        // Expected ordering cost
        const ordersPerYear = (demandStats.mean * 365) / (orderUpToLevel - reorderPoint);
        const orderingCost = ordersPerYear * node.costs.ordering;
        // Expected shortage cost (simplified)
        const serviceLevel = this.config.targetServiceLevel;
        const shortageCost = (1 - serviceLevel) * demandStats.mean * node.costs.shortage;
        // Weight costs
        const weights = this.config.costWeights;
        return (holdingCost * weights.holding +
            orderingCost * weights.ordering +
            shortageCost * weights.shortage);
    }
    /**
     * Calculate service level
     */
    calculateServiceLevel(node, reorderPoint, leadTimeDemand) {
        // Probability that lead time demand <= reorder point
        // Using standard normal CDF
        const z = (reorderPoint - leadTimeDemand.mean) / leadTimeDemand.stdDev;
        return this.normalCDF(z);
    }
    /**
     * Standard normal CDF approximation
     */
    normalCDF(z) {
        const t = 1 / (1 + 0.2316419 * Math.abs(z));
        const d = 0.3989423 * Math.exp((-z * z) / 2);
        const prob = d *
            t *
            (0.3193815 +
                t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return z > 0 ? 1 - prob : prob;
    }
    /**
     * Calculate flows between nodes
     */
    calculateFlows(node, result, flow) {
        // Calculate replenishment quantity
        const replenishmentQty = Math.max(0, result.orderUpToLevel - node.position.currentStock - node.position.onOrder);
        // Allocate to upstream nodes
        for (const upstreamId of node.upstreamNodes) {
            let nodeFlow = flow.get(upstreamId);
            if (!nodeFlow) {
                nodeFlow = new Map();
                flow.set(upstreamId, nodeFlow);
            }
            nodeFlow.set(node.nodeId, replenishmentQty / node.upstreamNodes.length);
        }
    }
    /**
     * Sort nodes by level (upstream first)
     */
    sortNodesByLevel() {
        const nodes = Array.from(this.network.values());
        return nodes.sort((a, b) => a.level - b.level);
    }
    /**
     * Get network topology
     */
    getNetworkTopology() {
        const nodes = Array.from(this.network.values());
        const edges = [];
        for (const node of nodes) {
            for (const downstream of node.downstreamNodes) {
                edges.push({ from: node.nodeId, to: downstream });
            }
        }
        return { nodes, edges };
    }
    /**
     * Simulate inventory performance
     */
    async simulate(productId, currentFeatures, periods) {
        let totalServiceLevel = 0;
        let totalCost = 0;
        let stockouts = 0;
        let totalDemand = 0;
        let metDemand = 0;
        for (let period = 0; period < periods; period++) {
            // Get optimization
            const optimization = await this.optimizeNetwork(productId, currentFeatures);
            totalServiceLevel += optimization.avgServiceLevel;
            totalCost += optimization.totalCost;
            // Simulate demand and inventory
            const forecast = await this.forecaster.forecast(productId, currentFeatures, 1);
            totalDemand += forecast.pointForecast;
            // Check stockouts
            for (const node of this.network.values()) {
                if (node.position.currentStock < forecast.pointForecast) {
                    stockouts++;
                    metDemand += node.position.currentStock;
                }
                else {
                    metDemand += forecast.pointForecast;
                }
            }
        }
        return {
            avgServiceLevel: totalServiceLevel / periods,
            avgInventoryCost: totalCost / periods,
            stockouts,
            fillRate: metDemand / totalDemand,
        };
    }
}
exports.InventoryOptimizer = InventoryOptimizer;
//# sourceMappingURL=inventory-optimizer.js.map