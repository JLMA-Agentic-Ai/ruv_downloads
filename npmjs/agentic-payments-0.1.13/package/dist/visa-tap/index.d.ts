/**
 * Visa TAP (Trusted Agent Protocol) Integration
 *
 * High-performance payment infrastructure with QUIC transport,
 * RFC 9421 HTTP message signatures, and Active Mandates.
 *
 * @example
 * ```typescript
 * import { VisaTapQuicTransport, signHttpMessage } from 'agentic-payments/visa-tap';
 *
 * // Create QUIC transport
 * const transport = new VisaTapQuicTransport({
 *   host: 'merchant.com',
 *   port: 8443
 * });
 *
 * await transport.connect();
 *
 * // Send payment
 * const response = await transport.sendPayment(signedMandate);
 * console.log('Payment approved:', response.transactionId);
 * ```
 */
export { validateAndVerify, guardExecution, revoke, isRevoked, getAllRevocations, type SignedMandate, type VerificationResult, type ExecutionGuard, type RevocationRecord, } from '../active-mandate/index.js';
export { VisaTapQuicTransport, createQuicTransport } from './quic-transport.js';
export { signHttpMessage, verifyHttpSignature, computeContentDigest, } from './rfc9421.js';
export type { Period, MandateKind, ActiveMandatePayload, SignedActiveMandate, SignatureComponents, SignedHttpMessage, QuicConfig, QuicStats, PaymentResponse, } from './types.js';
/**
 * Visa TAP protocol version
 */
export declare const TAP_VERSION = "1.0";
/**
 * Default QUIC port for Visa TAP
 */
export declare const DEFAULT_QUIC_PORT = 8443;
/**
 * Maximum mandate lifetime (7 days in seconds)
 */
export declare const MAX_MANDATE_LIFETIME_SECS: number;
//# sourceMappingURL=index.d.ts.map