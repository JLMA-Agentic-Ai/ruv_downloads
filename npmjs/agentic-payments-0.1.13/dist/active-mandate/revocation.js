/**
 * Mandate revocation system
 * In-memory store (swap with database for production)
 */
const revoked = new Map();
export function revokeMandate(mandate_id, reason) {
    const rec = {
        mandate_id,
        revoked_at: new Date().toISOString(),
        reason
    };
    revoked.set(mandate_id, rec);
    return rec;
}
export function isRevoked(mandate_id) {
    return revoked.has(mandate_id);
}
export function getRevocation(mandate_id) {
    return revoked.get(mandate_id);
}
export function clearRevocations() {
    revoked.clear();
}
export function getAllRevocations() {
    return Array.from(revoked.values());
}
//# sourceMappingURL=revocation.js.map