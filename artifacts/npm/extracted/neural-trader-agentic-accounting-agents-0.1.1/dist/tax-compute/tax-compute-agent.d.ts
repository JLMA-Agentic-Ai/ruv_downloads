/**
 * Tax Compute Agent
 *
 * Orchestrates all tax calculation methods with:
 * - Intelligent method selection
 * - Multi-method comparison
 * - Wash sale detection integration
 * - Result caching
 * - ReasoningBank learning
 * - Performance monitoring
 */
import { BaseAgent, AgentTask, AgentResult } from '../base/agent';
import { TaxMethod, Transaction, TaxLot } from './calculator-wrapper';
import { TaxProfile, MethodRecommendation } from './strategy-selector';
export interface TaxCalculationTask extends AgentTask {
    data: {
        sale: Transaction;
        lots: TaxLot[];
        profile?: TaxProfile;
        method?: TaxMethod;
        compareAll?: boolean;
        enableCache?: boolean;
        detectWashSales?: boolean;
    };
}
export interface TaxComputeResult {
    calculation: any;
    recommendation?: MethodRecommendation;
    comparison?: any;
    washSales?: any[];
    cacheHit?: boolean;
    performance: {
        validationTime: number;
        calculationTime: number;
        totalTime: number;
    };
}
export declare class TaxComputeAgent extends BaseAgent {
    private calculator;
    private selector;
    private validator;
    private cache;
    constructor(agentId?: string);
    /**
     * Execute tax calculation task
     */
    execute(task: TaxCalculationTask): Promise<AgentResult<TaxComputeResult>>;
    /**
     * Calculate using specific method
     */
    private calculateWithMethod;
    /**
     * Compare all calculation methods
     */
    compareAllMethods(sale: Transaction, lots: TaxLot[]): Promise<any>;
    /**
     * Detect potential wash sales
     */
    private detectWashSales;
    /**
     * Invalidate cache for asset
     */
    invalidateCache(asset?: string): number;
    /**
     * Get cache statistics
     */
    getCacheStats(): import("./cache").CacheStats;
    /**
     * Get agent status with extended info
     */
    getExtendedStatus(): {
        cache: import("./cache").CacheStats;
        calculator: string;
        methods: string[];
        agentId: string;
        agentType: string;
        isRunning: boolean;
        decisionCount: number;
    };
}
//# sourceMappingURL=tax-compute-agent.d.ts.map