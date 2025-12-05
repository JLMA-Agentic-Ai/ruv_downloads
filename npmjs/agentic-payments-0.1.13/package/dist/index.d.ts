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
export { AgentIdentity } from './identity.js';
export type { AgentIdentityJSON } from './identity.js';
export { VerificationSystem, VerificationSystemBuilder, } from './verification.js';
export type { AgentVote, VerificationResult, VerificationConfig, SystemMetrics, } from './verification.js';
export { IntentMandate, CartMandate, PaymentMandate } from './mandate.js';
export type { IntentMandateData, CartMandateData, PaymentMandateData, CartItem, ValidationResult, } from './mandate.js';
export { PaymentError, PaymentErrorCode, isRecoverable, getErrorCode, formatError, AgenticPaymentError, CryptoError, ValidationError, ConsensusError, SystemError, WasmInitError, ErrorCode, } from './errors.js';
export { VisaTapQuicTransport, createQuicTransport } from './visa-tap/index.js';
export { signHttpMessage, verifyHttpSignature, computeContentDigest } from './visa-tap/index.js';
export { TAP_VERSION, DEFAULT_QUIC_PORT, MAX_MANDATE_LIFETIME_SECS } from './visa-tap/index.js';
export declare const VERSION = "1.0.0";
/**
 * Get library information
 *
 * @returns Library metadata
 */
export declare function getInfo(): {
    version: string;
    implementation: string;
    features: string[];
};
declare const _default: {
    getInfo: typeof getInfo;
    VERSION: string;
};
export default _default;
//# sourceMappingURL=index.d.ts.map