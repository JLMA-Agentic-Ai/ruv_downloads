/**
 * Mandate revocation system
 * In-memory store (swap with database for production)
 */
import { RevocationRecord } from "./types.js";
export declare function revokeMandate(mandate_id: string, reason?: string): RevocationRecord;
export declare function isRevoked(mandate_id: string): boolean;
export declare function getRevocation(mandate_id: string): RevocationRecord | undefined;
export declare function clearRevocations(): void;
export declare function getAllRevocations(): RevocationRecord[];
//# sourceMappingURL=revocation.d.ts.map