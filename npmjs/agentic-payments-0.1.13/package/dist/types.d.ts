/**
 * TypeScript type definitions for agentic-payments
 * Native TypeScript implementation types
 * @module types
 */
/**
 * Cryptographic key pair for Ed25519 signatures
 */
export interface KeyPair {
    /** Public key bytes (32 bytes) */
    publicKey: Uint8Array;
    /** Secret key bytes (32 bytes) */
    secretKey: Uint8Array;
}
/**
 * Agent identity with cryptographic keys and identifier
 */
export interface AgentIdentityData {
    /** Unique agent identifier (DID format) */
    id: string;
    /** Ed25519 public key (32 bytes) */
    publicKey: Uint8Array;
    /** Ed25519 secret key (32 bytes) - SENSITIVE */
    secretKey?: Uint8Array;
    /** Agent metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Digital signature result
 */
export interface Signature {
    /** Signature bytes (64 bytes for Ed25519) */
    bytes: Uint8Array;
    /** Signer's public key */
    publicKey: Uint8Array;
    /** Original message that was signed */
    message: Uint8Array;
}
/**
 * Verification result with consensus information
 */
export interface VerificationResult {
    /** Whether verification succeeded */
    isValid: boolean;
    /** Consensus level reached (0.0 - 1.0) */
    consensusPercentage: number;
    /** Number of agents that participated */
    totalVotes: number;
    /** Votes for verification */
    votesFor: number;
    /** Votes against verification */
    votesAgainst: number;
    /** Individual agent verification results */
    agentVotes: AgentVote[];
    /** Whether consensus threshold was reached */
    consensusReached: boolean;
    /** Average latency across all agents */
    avgLatencyMs: number;
}
/**
 * Individual agent vote
 */
export interface AgentVote {
    /** Agent identifier */
    agentId: string;
    /** Agent's vote */
    vote: boolean;
    /** Vote timestamp */
    timestamp: number;
    /** Verification latency for this agent */
    latencyMs: number;
}
/**
 * Verification system configuration
 */
export interface VerificationConfig {
    /** Minimum consensus threshold (0.0 - 1.0) */
    consensusThreshold: number;
    /** Minimum number of agents required */
    minAgents: number;
    /** Maximum number of agents to use */
    maxAgents: number;
    /** Verification timeout in milliseconds */
    timeoutMs?: number;
    /** Enable parallel verification */
    parallel?: boolean;
}
/**
 * System performance metrics
 */
export interface SystemMetrics {
    /** Total verifications performed */
    totalVerifications: number;
    /** Successful verifications */
    successfulVerifications: number;
    /** Failed verifications */
    failedVerifications: number;
    /** Average verification time (ms) */
    avgVerificationTime: number;
    /** Average consensus level */
    avgConsensus: number;
    /** System uptime (ms) */
    uptimeMs: number;
    /** Agent metrics */
    agentMetrics: AgentMetrics[];
}
/**
 * Agent performance metrics
 */
export interface AgentMetrics {
    /** Agent identifier */
    agentId: string;
    /** Total verifications by this agent */
    totalVerifications: number;
    /** Successful verifications */
    successfulVerifications: number;
    /** Failed verifications */
    failedVerifications: number;
    /** Average latency (ms) */
    avgLatencyMs: number;
}
/**
 * Intent mandate for payment authorization
 */
export interface IntentMandateData {
    /** Unique mandate ID */
    id: string;
    /** Merchant identifier */
    merchantId: string;
    /** Customer identifier */
    customerId: string;
    /** Payment intent description */
    intent: string;
    /** Maximum amount authorized */
    maxAmount: number;
    /** Currency code (ISO 4217) */
    currency: string;
    /** Mandate creation timestamp */
    createdAt: number;
    /** Mandate expiry timestamp */
    expiresAt: number;
    /** Digital signature (hex string) */
    signature?: string;
    /** Signer DID */
    signedBy?: string;
}
/**
 * Cart mandate for shopping cart authorization
 */
export interface CartMandateData {
    /** Unique mandate ID */
    id: string;
    /** Merchant identifier */
    merchantId: string;
    /** Customer identifier */
    customerId: string;
    /** Cart items */
    items: CartItem[];
    /** Total cart amount */
    totalAmount: number;
    /** Currency code (ISO 4217) */
    currency: string;
    /** Mandate creation timestamp */
    createdAt: number;
    /** Mandate expiry timestamp */
    expiresAt: number;
    /** Digital signature (hex string) */
    signature?: string;
    /** Signer DID */
    signedBy?: string;
}
/**
 * Shopping cart item
 */
export interface CartItem {
    /** Item SKU or identifier */
    id: string;
    /** Item name */
    name: string;
    /** Item quantity */
    quantity: number;
    /** Unit price */
    unitPrice: number;
    /** Item metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Payment mandate for transaction authorization
 */
export interface PaymentMandateData {
    /** Unique mandate ID */
    id: string;
    /** Source mandate ID (intent or cart) */
    sourceId: string;
    /** Mandate type */
    type: 'intent' | 'cart';
    /** Payment amount */
    amount: number;
    /** Currency code (ISO 4217) */
    currency: string;
    /** Payment method */
    paymentMethod: string;
    /** Payment status */
    status: PaymentStatus;
    /** Mandate creation timestamp */
    createdAt: number;
    /** Payment processed timestamp */
    processedAt?: number;
    /** Digital signature (hex string) */
    signature?: string;
    /** Signer DID */
    signedBy?: string;
}
/**
 * Payment processing status
 */
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded';
/**
 * Mandate validation result
 */
export interface ValidationResult {
    /** Whether validation succeeded */
    valid: boolean;
    /** Validation errors if any */
    errors: string[];
}
/**
 * Serialization options
 */
export interface SerializationOptions {
    /** Include sensitive data (private keys) */
    includeSensitive?: boolean;
    /** Pretty print JSON */
    pretty?: boolean;
    /** Include metadata */
    includeMetadata?: boolean;
}
//# sourceMappingURL=types.d.ts.map