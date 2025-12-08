/**
 * Tax-Loss Harvesting Agent
 * Autonomous agent for tax optimization
 * Target: Identify 95%+ harvestable losses with <1% wash-sale violations
 */
import { BaseAgent, AgentTask, AgentResult } from '../base/agent';
import { Position, Transaction } from '@neural-trader/agentic-accounting-types';
import { HarvestOpportunity } from '@neural-trader/agentic-accounting-core';
export interface HarvestAgentConfig {
    agentId?: string;
    taxRate?: number;
    minSavingsThreshold?: number;
    autoExecute?: boolean;
    washSalePeriod?: number;
}
export interface HarvestTaskData {
    action: 'scan' | 'check_wash_sale' | 'find_replacements' | 'generate_plan';
    positions?: Position[];
    currentPrices?: Map<string, number>;
    recentTransactions?: Transaction[];
    asset?: string;
    opportunities?: HarvestOpportunity[];
}
export declare class HarvestAgent extends BaseAgent {
    private harvestingService;
    private harvestConfig;
    constructor(config?: HarvestAgentConfig);
    /**
     * Execute harvesting task
     */
    execute(task: AgentTask): Promise<AgentResult>;
    /**
     * Scan portfolio for harvesting opportunities
     */
    private scanForOpportunities;
    /**
     * Check for wash sale violations
     */
    private checkWashSale;
    /**
     * Find replacement assets
     */
    private findReplacements;
    /**
     * Generate execution plan
     */
    private generatePlan;
    /**
     * Auto-execute harvest recommendations
     */
    private autoExecuteHarvests;
    /**
     * Monitor daily for new opportunities
     */
    monitorDaily(positions: Position[], currentPrices: Map<string, number>, recentTransactions: Transaction[]): Promise<any>;
    /**
     * Generate annual harvest report
     */
    generateAnnualReport(opportunities: HarvestOpportunity[], year: number): Promise<any>;
}
//# sourceMappingURL=harvest-agent.d.ts.map