/**
 * Reporting Agent
 * Autonomous agent for financial report generation
 * Performance target: <5 seconds for annual reports
 */
import { BaseAgent, AgentTask, AgentResult } from '../base/agent';
import { Transaction, TaxResult } from '@neural-trader/agentic-accounting-types';
import { ReportOptions } from '@neural-trader/agentic-accounting-core';
export interface ReportingAgentConfig {
    agentId?: string;
    defaultFormat?: 'json' | 'pdf' | 'csv';
    includeDetails?: boolean;
}
export interface ReportingTaskData {
    action: 'generate_pnl' | 'generate_tax_forms' | 'generate_audit' | 'generate_custom';
    transactions?: Transaction[];
    taxResults?: TaxResult[];
    options?: ReportOptions;
    taxpayerInfo?: any;
    year?: number;
}
export declare class ReportingAgent extends BaseAgent {
    private reportGenerator;
    private scheduleDGenerator;
    private form8949Generator;
    private reportingConfig;
    constructor(config?: ReportingAgentConfig);
    /**
     * Execute reporting task
     */
    execute(task: AgentTask): Promise<AgentResult>;
    /**
     * Generate P&L report
     */
    private generatePnLReport;
    /**
     * Generate tax forms (Schedule D and Form 8949)
     */
    private generateTaxForms;
    /**
     * Generate audit report
     */
    private generateAuditReport;
    /**
     * Generate custom report based on user specifications
     */
    private generateCustomReport;
    /**
     * Format report for PDF export
     */
    formatForPDF(report: any, reportType: string): Promise<any>;
    /**
     * Batch generate multiple reports
     */
    generateBatch(reportRequests: any[]): Promise<Map<string, any>>;
}
//# sourceMappingURL=reporting-agent.d.ts.map