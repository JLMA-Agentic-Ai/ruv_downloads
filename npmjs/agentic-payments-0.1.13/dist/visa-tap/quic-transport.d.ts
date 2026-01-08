/**
 * QUIC Transport Integration for Visa TAP
 *
 * Bridges agentic-payments with agentic-flow QUIC transport
 */
import type { QuicConfig, QuicStats, PaymentResponse, SignedActiveMandate } from './types.js';
/**
 * Visa TAP QUIC Transport
 *
 * Provides high-performance QUIC transport for Visa TAP payments
 * with 0-RTT connection resumption and multiplexed streams.
 */
export declare class VisaTapQuicTransport {
    private quic;
    private config;
    private connected;
    constructor(config: QuicConfig);
    /**
     * Connect to QUIC server
     *
     * Supports 0-RTT connection resumption for sub-millisecond reconnection
     */
    connect(): Promise<void>;
    /**
     * Send payment request over QUIC
     *
     * @param signedMandate - Cryptographically signed Active Mandate
     * @returns Payment response
     */
    sendPayment(signedMandate: SignedActiveMandate): Promise<PaymentResponse>;
    /**
     * Send raw payment data
     *
     * @param data - Payment data object
     * @returns Response data
     */
    send(data: any): Promise<any>;
    /**
     * Get connection statistics
     */
    getStats(): QuicStats | null;
    /**
     * Check if connected
     */
    isConnected(): boolean;
    /**
     * Get server address
     */
    getServerAddress(): string;
    /**
     * Close connection
     */
    close(): Promise<void>;
    /**
     * Parse payment response from QUIC
     */
    private parsePaymentResponse;
}
/**
 * Create QUIC transport instance
 *
 * @param host - QUIC server host
 * @param port - QUIC server port (default: 8443)
 * @returns VisaTapQuicTransport instance
 */
export declare function createQuicTransport(host: string, port?: number): VisaTapQuicTransport;
//# sourceMappingURL=quic-transport.d.ts.map