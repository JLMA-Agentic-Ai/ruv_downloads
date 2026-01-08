"use strict";
/**
 * Tax-Loss Harvesting Agent
 * Autonomous agent for tax optimization
 * Target: Identify 95%+ harvestable losses with <1% wash-sale violations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HarvestAgent = void 0;
const agent_1 = require("../base/agent");
const agentic_accounting_core_1 = require("@neural-trader/agentic-accounting-core");
class HarvestAgent extends agent_1.BaseAgent {
    harvestingService;
    harvestConfig;
    constructor(config = {}) {
        super({
            agentId: config.agentId || 'harvest-agent',
            agentType: 'HarvestAgent',
            enableLearning: true,
            enableMetrics: true
        });
        this.harvestingService = new agentic_accounting_core_1.TaxLossHarvestingService();
        this.harvestConfig = {
            taxRate: config.taxRate || 0.35,
            minSavingsThreshold: config.minSavingsThreshold || 100,
            autoExecute: config.autoExecute ?? false,
            washSalePeriod: config.washSalePeriod || 30
        };
    }
    /**
     * Execute harvesting task
     */
    async execute(task) {
        const taskData = task.data;
        this.logger.info(`Executing harvesting task: ${taskData.action}`);
        return this.executeWithMetrics(async () => {
            switch (taskData.action) {
                case 'scan':
                    return await this.scanForOpportunities(taskData.positions, taskData.currentPrices, taskData.recentTransactions);
                case 'check_wash_sale':
                    return await this.checkWashSale(taskData.asset, taskData.recentTransactions);
                case 'find_replacements':
                    return await this.findReplacements(taskData.asset);
                case 'generate_plan':
                    return await this.generatePlan(taskData.opportunities);
                default:
                    throw new Error(`Unknown action: ${taskData.action}`);
            }
        });
    }
    /**
     * Scan portfolio for harvesting opportunities
     */
    async scanForOpportunities(positions, currentPrices, recentTransactions) {
        this.logger.info('Scanning for tax-loss harvesting opportunities');
        const opportunities = await this.harvestingService.scanOpportunities(positions, currentPrices, recentTransactions, this.harvestConfig.taxRate);
        // Filter by minimum savings threshold
        const filteredOpportunities = opportunities.filter(o => o.potentialTaxSavings.toNumber() >= this.harvestConfig.minSavingsThreshold);
        // Rank opportunities
        const rankedOpportunities = this.harvestingService.rankOpportunities(filteredOpportunities);
        // Calculate summary metrics
        const summary = {
            totalOpportunities: opportunities.length,
            harvestableOpportunities: rankedOpportunities.filter(o => o.recommendation === 'HARVEST').length,
            totalPotentialSavings: rankedOpportunities
                .reduce((sum, o) => sum + o.potentialTaxSavings.toNumber(), 0)
                .toFixed(2),
            washSaleRisks: rankedOpportunities.filter(o => o.washSaleRisk).length
        };
        // Auto-execute if configured
        if (this.harvestConfig.autoExecute && rankedOpportunities.length > 0) {
            await this.autoExecuteHarvests(rankedOpportunities);
        }
        // Log learning data
        await this.learn({
            action: 'scan_opportunities',
            positions: positions.length,
            opportunities: opportunities.length,
            harvestable: summary.harvestableOpportunities,
            potentialSavings: summary.totalPotentialSavings,
            washSaleRisks: summary.washSaleRisks
        });
        return {
            opportunities: rankedOpportunities,
            summary
        };
    }
    /**
     * Check for wash sale violations
     */
    async checkWashSale(asset, recentTransactions) {
        this.logger.info(`Checking wash sale for ${asset}`);
        const washSaleCheck = await this.harvestingService.checkWashSale(asset, recentTransactions);
        // Log learning data
        await this.learn({
            action: 'check_wash_sale',
            asset,
            hasViolation: washSaleCheck.hasViolation,
            daysUntilSafe: washSaleCheck.daysUntilSafe
        });
        return washSaleCheck;
    }
    /**
     * Find replacement assets
     */
    async findReplacements(asset) {
        this.logger.info(`Finding replacement assets for ${asset}`);
        const replacements = await this.harvestingService.findReplacementAssets(asset, 0.7);
        return {
            asset,
            replacements,
            count: replacements.length
        };
    }
    /**
     * Generate execution plan
     */
    async generatePlan(opportunities) {
        this.logger.info('Generating harvest execution plan');
        const plan = await this.harvestingService.generateExecutionPlan(opportunities);
        // Add agent metadata
        return {
            ...plan,
            agent: {
                name: this.config.agentId,
                config: this.harvestConfig
            },
            createdAt: new Date()
        };
    }
    /**
     * Auto-execute harvest recommendations
     */
    async autoExecuteHarvests(opportunities) {
        const harvestable = opportunities.filter(o => o.recommendation === 'HARVEST');
        this.logger.info(`Auto-executing ${harvestable.length} harvests`);
        // In production, this would execute actual trades
        for (const opportunity of harvestable) {
            this.logger.info(`Would harvest ${opportunity.asset}`, {
                savings: opportunity.potentialTaxSavings.toString()
            });
        }
    }
    /**
     * Monitor daily for new opportunities
     */
    async monitorDaily(positions, currentPrices, recentTransactions) {
        this.logger.info('Running daily harvest monitoring');
        const result = await this.scanForOpportunities(positions, currentPrices, recentTransactions);
        // Alert if significant opportunities found
        if (result.summary.harvestableOpportunities > 0) {
            this.logger.warn(`Found ${result.summary.harvestableOpportunities} harvest opportunities`, {
                totalSavings: result.summary.totalPotentialSavings
            });
        }
        return result;
    }
    /**
     * Generate annual harvest report
     */
    async generateAnnualReport(opportunities, year) {
        this.logger.info(`Generating annual harvest report for ${year}`);
        const harvested = opportunities.filter(o => o.recommendation === 'HARVEST');
        const totalSavings = harvested.reduce((sum, o) => sum + o.potentialTaxSavings.toNumber(), 0);
        return {
            year,
            summary: {
                totalOpportunities: opportunities.length,
                harvested: harvested.length,
                totalSavings: totalSavings.toFixed(2),
                washSaleViolations: 0 // Would track actual violations
            },
            opportunities: harvested,
            generatedAt: new Date()
        };
    }
}
exports.HarvestAgent = HarvestAgent;
//# sourceMappingURL=harvest-agent.js.map