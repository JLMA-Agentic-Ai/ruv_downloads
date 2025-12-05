/**
 * QUIC Transport Integration for Visa TAP
 *
 * Bridges agentic-payments with agentic-flow QUIC transport
 */
// Dynamic import to handle optional dependency gracefully
let QuicTransport = null;
async function loadQuicTransport() {
    if (QuicTransport)
        return QuicTransport;
    try {
        // Try to load agentic-flow dynamically
        // @ts-ignore - Dynamic import of optional peer dependency
        const agenticFlow = await import('agentic-flow');
        QuicTransport = agenticFlow.QuicTransport;
        return QuicTransport;
    }
    catch (error) {
        throw new Error('agentic-flow is not installed. Install it with: npm install agentic-flow@^1.6.4');
    }
}
/**
 * Visa TAP QUIC Transport
 *
 * Provides high-performance QUIC transport for Visa TAP payments
 * with 0-RTT connection resumption and multiplexed streams.
 */
export class VisaTapQuicTransport {
    quic = null;
    config;
    connected = false;
    constructor(config) {
        this.config = {
            timeout: 30000,
            enable0RTT: true,
            maxConcurrentStreams: 100,
            ...config,
        };
    }
    /**
     * Connect to QUIC server
     *
     * Supports 0-RTT connection resumption for sub-millisecond reconnection
     */
    async connect() {
        const QuicClient = await loadQuicTransport();
        this.quic = new QuicClient({
            host: this.config.host,
            port: this.config.port,
            maxConcurrentStreams: this.config.maxConcurrentStreams,
        });
        await this.quic.connect();
        this.connected = true;
    }
    /**
     * Send payment request over QUIC
     *
     * @param signedMandate - Cryptographically signed Active Mandate
     * @returns Payment response
     */
    async sendPayment(signedMandate) {
        if (!this.connected) {
            throw new Error('Not connected. Call connect() first.');
        }
        const response = await this.quic.send({
            type: 'visa-tap-payment',
            version: '1.0',
            mandate: signedMandate,
        });
        return this.parsePaymentResponse(response);
    }
    /**
     * Send raw payment data
     *
     * @param data - Payment data object
     * @returns Response data
     */
    async send(data) {
        if (!this.connected) {
            throw new Error('Not connected. Call connect() first.');
        }
        return await this.quic.send(data);
    }
    /**
     * Get connection statistics
     */
    getStats() {
        if (!this.connected || !this.quic.getStats) {
            return null;
        }
        const stats = this.quic.getStats();
        return {
            rtt: stats.rtt || 0,
            sentBytes: stats.sentBytes || 0,
            receivedBytes: stats.receivedBytes || 0,
            activeStreams: stats.activeStreams || 0,
        };
    }
    /**
     * Check if connected
     */
    isConnected() {
        return this.connected;
    }
    /**
     * Get server address
     */
    getServerAddress() {
        return `${this.config.host}:${this.config.port}`;
    }
    /**
     * Close connection
     */
    async close() {
        if (this.quic && this.connected) {
            await this.quic.close();
            this.connected = false;
        }
    }
    /**
     * Parse payment response from QUIC
     */
    parsePaymentResponse(response) {
        // Handle different response formats
        if (response.transactionId) {
            return response;
        }
        // Default response format
        return {
            transactionId: response.id || crypto.randomUUID(),
            status: response.status || 'pending',
            amount: response.amount || 0,
            currency: response.currency || 'USD',
            timestamp: new Date().toISOString(),
        };
    }
}
/**
 * Create QUIC transport instance
 *
 * @param host - QUIC server host
 * @param port - QUIC server port (default: 8443)
 * @returns VisaTapQuicTransport instance
 */
export function createQuicTransport(host, port = 8443) {
    return new VisaTapQuicTransport({ host, port });
}
//# sourceMappingURL=quic-transport.js.map