/**
 * Compliance Agent
 * Autonomous agent for regulatory compliance
 * Performance target: <500ms trade validation
 */
import { BaseAgent, AgentTask, AgentResult } from '../base/agent';
import { Transaction } from '@neural-trader/agentic-accounting-types';
import { ValidationContext } from '@neural-trader/agentic-accounting-core';
export interface ComplianceAgentConfig {
    agentId?: string;
    strictMode?: boolean;
    jurisdiction?: string;
    autoAlert?: boolean;
    alertThreshold?: number;
}
export interface ComplianceTaskData {
    action: 'validate' | 'check_batch' | 'generate_report';
    transaction?: Transaction;
    transactions?: Transaction[];
    context?: ValidationContext;
}
export declare class ComplianceAgent extends BaseAgent {
    private validator;
    private ruleEngine;
    private complianceConfig;
    constructor(config?: ComplianceAgentConfig);
    /**
     * Execute compliance check
     */
    execute(task: AgentTask): Promise<AgentResult>;
    /**
     * Validate single transaction
     */
    private validateTransaction;
    /**
     * Validate batch of transactions
     */
    private validateBatch;
    /**
     * Generate compliance report
     */
    private generateComplianceReport;
    /**
     * Send compliance alert
     */
    private sendAlert;
    /**
     * Check if transaction meets compliance threshold
     */
    isCompliant(transaction: Transaction, context?: ValidationContext): Promise<boolean>;
    /**
     * Get all active compliance rules
     */
    getRules(): Promise<any[]>;
    /**
     * Add custom compliance rule
     */
    addRule(rule: any): Promise<void>;
    /**
     * Enable/disable rule
     */
    setRuleEnabled(ruleId: string, enabled: boolean): Promise<void>;
}
//# sourceMappingURL=compliance-agent.d.ts.map