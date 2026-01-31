/**
 * Agentic Payments - Multi-agent payment authorization system
 * Pure TypeScript implementation with @noble/ed25519 cryptography
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { AgentIdentity, IntentMandate, VerificationSystemBuilder } from 'agentic-payments';
 *
 * // Create agents
 * const agent1 = await AgentIdentity.generate();
 * const agent2 = await AgentIdentity.generate();
 * const agent3 = await AgentIdentity.generate();
 *
 * // Create verification system
 * const system = new VerificationSystemBuilder()
 *   .consensusThreshold(0.67)
 *   .minAgents(2)
 *   .addAgent(agent1)
 *   .addAgent(agent2)
 *   .addAgent(agent3)
 *   .build();
 *
 * // Create and sign mandate
 * const mandate = new IntentMandate({
 *   merchantId: 'merchant_123',
 *   customerId: 'customer_456',
 *   intent: 'Purchase subscription',
 *   maxAmount: 99.99,
 *   currency: 'USD',
 *   expiresAt: Date.now() + 86400000
 * });
 *
 * await mandate.sign(agent1);
 *
 * // Verify with consensus
 * const message = new TextEncoder().encode(JSON.stringify(mandate.toJSON()));
 * const signature = mandate.getSignature();
 * const result = await system.verifyWithConsensus(signature, message, agent1.publicKey());
 *
 * console.log(`Verified: ${result.isValid}, Consensus: ${result.consensusReached}`);
 * ```
 */
// Core classes
export { AgentIdentity } from './identity.js';
export { VerificationSystem, VerificationSystemBuilder, } from './verification.js';
export { IntentMandate, CartMandate, PaymentMandate } from './mandate.js';
// Error classes
export { PaymentError, PaymentErrorCode, isRecoverable, getErrorCode, formatError, 
// Legacy aliases
AgenticPaymentError, CryptoError, ValidationError, ConsensusError, SystemError, WasmInitError, ErrorCode, } from './errors.js';
// Visa TAP (Trusted Agent Protocol) - QUIC transport integration
export { VisaTapQuicTransport, createQuicTransport } from './visa-tap/index.js';
export { signHttpMessage, verifyHttpSignature, computeContentDigest } from './visa-tap/index.js';
export { TAP_VERSION, DEFAULT_QUIC_PORT, MAX_MANDATE_LIFETIME_SECS } from './visa-tap/index.js';
// Version information
export const VERSION = '1.0.0';
/**
 * Get library information
 *
 * @returns Library metadata
 */
export function getInfo() {
    return {
        version: VERSION,
        implementation: 'native-typescript',
        features: [
            'ed25519-signatures',
            'multi-agent-consensus',
            'byzantine-fault-tolerance',
            'intent-mandates',
            'cart-mandates',
            'payment-mandates',
            'visa-tap-quic-transport',
            'rfc9421-http-signatures',
            'active-mandates',
        ],
    };
}
// Default export
export default {
    getInfo,
    VERSION,
};
//# sourceMappingURL=index.js.map