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
// Re-export from active-mandate (already working)
export { validateAndVerify, guardExecution, revoke, isRevoked, getAllRevocations, } from '../active-mandate/index.js';
// Export QUIC transport
export { VisaTapQuicTransport, createQuicTransport } from './quic-transport.js';
// Export RFC 9421
export { signHttpMessage, verifyHttpSignature, computeContentDigest, } from './rfc9421.js';
/**
 * Visa TAP protocol version
 */
export const TAP_VERSION = '1.0';
/**
 * Default QUIC port for Visa TAP
 */
export const DEFAULT_QUIC_PORT = 8443;
/**
 * Maximum mandate lifetime (7 days in seconds)
 */
export const MAX_MANDATE_LIFETIME_SECS = 7 * 24 * 60 * 60;
//# sourceMappingURL=index.js.map