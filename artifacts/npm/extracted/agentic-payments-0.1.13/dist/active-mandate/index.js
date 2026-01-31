/**
 * Active Mandate - Autonomous agent payment authorization
 * Main entry point for Active Mandate functionality
 */
import { signedMandateSchema } from "./schema.js";
import { verifyEd25519Signature } from "./signing.js";
import { isRevoked, revokeMandate } from "./revocation.js";
export * from "./types.js";
export { signedMandateSchema, mandateSchema, spendCapSchema } from "./schema.js";
export { verifyEd25519Signature, canonicalizeJSON, signWithTweetnacl, getPublicKeyBase64 } from "./signing.js";
export { isRevoked, revokeMandate, getRevocation, clearRevocations, getAllRevocations } from "./revocation.js";
export { copy, formatAmount, formatPeriod } from "./i18n.js";
/**
 * Validate schema and verify Ed25519 signature
 */
export function validateAndVerify(m) {
    const parsed = signedMandateSchema.safeParse(m);
    if (!parsed.success) {
        return { valid: false, reason: parsed.error.message };
    }
    const sm = parsed.data;
    if (isRevoked(sm.payload.mandate_id)) {
        return { valid: false, reason: "mandate revoked" };
    }
    const ok = verifyEd25519Signature(sm.pubkey, sm.signature, sm.payload);
    return ok ? { valid: true, parsed: sm } : { valid: false, reason: "signature invalid" };
}
/**
 * Guard mandate execution with time window and revocation checks
 */
export function guardExecution(m) {
    // time window checks
    const now = Date.now();
    if (m.payload.not_before && Date.parse(m.payload.not_before) > now) {
        return { allowed: false, reason: "before not_before" };
    }
    if (Date.parse(m.payload.expires_at) <= now) {
        return { allowed: false, reason: "expired" };
    }
    if (isRevoked(m.payload.mandate_id)) {
        return { allowed: false, reason: "revoked" };
    }
    return { allowed: true };
}
/**
 * Revoke a mandate by ID
 */
export function revoke(mandate_id, reason) {
    return revokeMandate(mandate_id, reason);
}
//# sourceMappingURL=index.js.map