/**
 * MCP Tool Type Definitions
 */
export interface ToolResult {
    success: boolean;
    [key: string]: any;
}
export interface CreateActiveMandateArgs {
    agent: string;
    holder: string;
    amount: number;
    currency: string;
    period: 'single' | 'daily' | 'weekly' | 'monthly';
    kind: 'intent' | 'cart';
    merchant_allow?: string[];
    merchant_block?: string[];
    expires_at?: string;
}
export interface SignMandateArgs {
    mandate: any;
    private_key: string;
}
export interface VerifyMandateArgs {
    signed_mandate: any;
    check_guards?: boolean;
}
export interface RevokeMandateArgs {
    mandate_id: string;
    reason?: string;
}
export interface GenerateAgentIdentityArgs {
    include_private_key?: boolean;
}
export interface CreateIntentMandateArgs {
    merchant_id: string;
    customer_id: string;
    intent: string;
    max_amount: number;
    currency?: string;
    expires_at?: number;
}
export interface CreateCartMandateArgs {
    merchant_id: string;
    customer_id: string;
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        unit_price: number;
    }>;
    currency?: string;
}
export interface VerifyConsensusArgs {
    message: string;
    signature: string;
    public_key: string;
    agent_public_keys: string[];
    consensus_threshold?: number;
}
export interface GetMandateInfoArgs {
    mandate_id: string;
}
//# sourceMappingURL=types.d.ts.map