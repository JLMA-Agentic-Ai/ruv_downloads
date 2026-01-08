/**
 * Canonical JSON signing and Ed25519 verification for Active Mandates
 */
export declare function canonicalizeJSON(obj: unknown): Uint8Array;
export declare function verifyEd25519Signature(pubkeyBase64: string, signatureBase64: string, payload: unknown): boolean;
export declare function signWithTweetnacl(payload: unknown, secretKey: Uint8Array): string;
export declare function getPublicKeyBase64(secretKey: Uint8Array): string;
//# sourceMappingURL=signing.d.ts.map