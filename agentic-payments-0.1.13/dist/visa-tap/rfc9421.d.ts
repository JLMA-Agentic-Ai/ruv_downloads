/**
 * RFC 9421 HTTP Message Signatures
 *
 * Implements cryptographic signing and verification of HTTP requests per RFC 9421
 */
import type { SignatureComponents, SignedHttpMessage } from './types.js';
/**
 * Sign HTTP message per RFC 9421
 */
export declare function signHttpMessage(components: SignatureComponents, privateKeyHex: string, keyId: string): Promise<SignedHttpMessage>;
/**
 * Verify RFC 9421 HTTP signature
 *
 * @param maxAgeSeconds - Maximum age of signature in seconds (default: 300 = 5 minutes)
 */
export declare function verifyHttpSignature(components: SignatureComponents, signed: SignedHttpMessage, publicKeyHex: string, maxAgeSeconds?: number): Promise<boolean>;
/**
 * Compute content digest (SHA-256)
 */
export declare function computeContentDigest(body: Uint8Array): string;
//# sourceMappingURL=rfc9421.d.ts.map