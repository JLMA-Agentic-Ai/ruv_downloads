/**
 * Internationalization support for Active Mandates
 */
export type Locale = "en";
export declare const copy: {
    readonly en: {
        readonly agent: "Agent";
        readonly holder: "Holder";
        readonly spendCap: "Spend cap";
        readonly merchant: "Merchant";
        readonly expires: "Expires";
        readonly mandateId: "Mandate ID";
        readonly confirm: "Confirm";
        readonly revoke: "Revoke mandate";
        readonly revoked: "Revoked";
        readonly kind: "Kind";
        readonly notBefore: "Not before";
        readonly lineItems: "Line items";
        readonly totalAmount: "Total amount";
        readonly allowed: "Allowed";
        readonly blocked: "Blocked";
        readonly any: "Any";
    };
};
export declare function formatAmount(minor: number, currency: string): string;
export declare function formatPeriod(period: "single" | "daily" | "weekly" | "monthly"): string;
//# sourceMappingURL=i18n.d.ts.map