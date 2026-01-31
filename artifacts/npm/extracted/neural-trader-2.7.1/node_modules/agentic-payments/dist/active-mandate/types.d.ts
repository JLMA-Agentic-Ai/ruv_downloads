/**
 * Active Mandate types for autonomous agent payment authorization
 * Based on ACP (Agent Commerce Protocol) specification
 */
export type Currency = "USD" | "CAD" | "EUR" | string;
export interface SpendCap {
    amount: number;
    currency: Currency;
    period: "single" | "daily" | "weekly" | "monthly";
}
export interface MandateCap {
    cap: SpendCap;
}
export interface MandateParty {
    agent: string;
    holder: string;
}
export interface MerchantRules {
    merchant_allow?: string[];
    merchant_block?: string[];
}
export interface TimeWindow {
    not_before?: string;
    expires_at: string;
}
export type MandateKind = "intent" | "cart";
export interface MandateBody extends MandateParty, MandateCap, MerchantRules, TimeWindow {
    mandate_id: string;
    kind: MandateKind;
    line_items?: Array<{
        sku: string;
        qty: number;
        unit_amount: number;
        currency: Currency;
    }>;
    total_amount?: number;
    meta?: Record<string, unknown>;
    revocation_url?: string;
}
export interface SignedMandate {
    alg: "ed25519";
    pubkey: string;
    signature: string;
    payload: MandateBody;
}
export interface VerificationResult {
    valid: boolean;
    reason?: string;
}
export interface RevocationRecord {
    mandate_id: string;
    revoked_at: string;
    reason?: string;
}
export interface ExecutionGuard {
    allowed: boolean;
    reason?: string;
}
//# sourceMappingURL=types.d.ts.map