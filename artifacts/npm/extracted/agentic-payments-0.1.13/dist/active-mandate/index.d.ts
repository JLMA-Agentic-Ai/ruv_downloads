/**
 * Active Mandate - Autonomous agent payment authorization
 * Main entry point for Active Mandate functionality
 */
import type { SignedMandate, VerificationResult, RevocationRecord, ExecutionGuard } from "./types.js";
export * from "./types.js";
export { signedMandateSchema, mandateSchema, spendCapSchema } from "./schema.js";
export { verifyEd25519Signature, canonicalizeJSON, signWithTweetnacl, getPublicKeyBase64 } from "./signing.js";
export { isRevoked, revokeMandate, getRevocation, clearRevocations, getAllRevocations } from "./revocation.js";
export { copy, formatAmount, formatPeriod } from "./i18n.js";
export type { Locale } from "./i18n.js";
/**
 * Validate schema and verify Ed25519 signature
 */
export declare function validateAndVerify(m: unknown): VerificationResult & {
    parsed?: SignedMandate;
};
/**
 * Guard mandate execution with time window and revocation checks
 */
export declare function guardExecution(m: SignedMandate): ExecutionGuard;
/**
 * Revoke a mandate by ID
 */
export declare function revoke(mandate_id: string, reason?: string): RevocationRecord;
//# sourceMappingURL=index.d.ts.map