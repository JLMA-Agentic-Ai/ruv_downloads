/**
 * Visa TAP (Trusted Agent Protocol) Types
 *
 * TypeScript type definitions for Visa TAP integration
 */
/**
 * Spend period for Active Mandate
 */
export type Period = 'single' | 'daily' | 'weekly' | 'monthly';
/**
 * Mandate kind
 */
export type MandateKind = 'intent' | 'cart';
/**
 * Active Mandate payload
 */
export interface ActiveMandatePayload {
    /** Agent DID identifier */
    agent: string;
    /** Holder/user DID identifier */
    holder: string;
    /** Spend cap amount in minor units (e.g., cents) */
    amount: number;
    /** Currency code (ISO 4217) */
    currency: string;
    /** Spend period */
    period: Period;
    /** Mandate kind */
    kind: MandateKind;
    /** Expiration timestamp (ISO 8601) */
    expires_at: string;
    /** Allowed merchant hostnames */
    merchant_allow?: string[];
    /** Blocked merchant hostnames */
    merchant_block?: string[];
}
/**
 * Signed Active Mandate
 */
export interface SignedActiveMandate {
    /** Payload */
    payload: ActiveMandatePayload;
    /** Ed25519 signature (hex-encoded) */
    signature: string;
    /** Public key (hex-encoded) */
    public_key: string;
}
/**
 * RFC 9421 HTTP Message Signature Components
 */
export interface SignatureComponents {
    /** HTTP method */
    method: string;
    /** Authority (host) */
    authority: string;
    /** Request path */
    path: string;
    /** Content digest (SHA-256) */
    contentDigest?: string;
    /** Additional headers to sign */
    headers?: Record<string, string>;
}
/**
 * RFC 9421 Signed HTTP Message
 */
export interface SignedHttpMessage {
    /** Signature-Input header value */
    signatureInput: string;
    /** Signature header value */
    signature: string;
    /** Nonce for replay protection */
    nonce: string;
    /** Creation timestamp (Unix seconds) */
    created: number;
}
/**
 * QUIC Transport Configuration
 */
export interface QuicConfig {
    /** Server host */
    host: string;
    /** Server port */
    port: number;
    /** Connection timeout in milliseconds */
    timeout?: number;
    /** Enable 0-RTT connection resumption */
    enable0RTT?: boolean;
    /** Maximum concurrent streams */
    maxConcurrentStreams?: number;
}
/**
 * QUIC Connection Statistics
 */
export interface QuicStats {
    /** Round-trip time in milliseconds */
    rtt: number;
    /** Total bytes sent */
    sentBytes: number;
    /** Total bytes received */
    receivedBytes: number;
    /** Number of active streams */
    activeStreams: number;
}
/**
 * Payment Response
 */
export interface PaymentResponse {
    /** Transaction ID */
    transactionId: string;
    /** Status */
    status: 'approved' | 'declined' | 'pending';
    /** Amount processed */
    amount: number;
    /** Currency */
    currency: string;
    /** Timestamp */
    timestamp: string;
}
//# sourceMappingURL=types.d.ts.map