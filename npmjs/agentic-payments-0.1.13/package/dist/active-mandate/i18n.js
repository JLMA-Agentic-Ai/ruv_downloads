/**
 * Internationalization support for Active Mandates
 */
export const copy = {
    en: {
        agent: "Agent",
        holder: "Holder",
        spendCap: "Spend cap",
        merchant: "Merchant",
        expires: "Expires",
        mandateId: "Mandate ID",
        confirm: "Confirm",
        revoke: "Revoke mandate",
        revoked: "Revoked",
        kind: "Kind",
        notBefore: "Not before",
        lineItems: "Line items",
        totalAmount: "Total amount",
        allowed: "Allowed",
        blocked: "Blocked",
        any: "Any"
    }
};
export function formatAmount(minor, currency) {
    const sign = Math.sign(minor) < 0 ? "-" : "";
    const abs = Math.abs(minor);
    const major = (abs / 100).toFixed(2);
    return `${sign}${currency} ${major}`;
}
export function formatPeriod(period) {
    if (period === "single")
        return "(per purchase)";
    return `(per ${period})`;
}
//# sourceMappingURL=i18n.js.map