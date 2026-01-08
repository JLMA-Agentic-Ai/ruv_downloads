/**
 * HTTP/SSE Transport for MCP Server
 * Provides remote access to MCP tools via Server-Sent Events
 */
import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
/**
 * HTTP MCP Server with SSE support
 * Handles multiple client connections via session management
 */
export class HttpMCPServer {
    app;
    server;
    sessions;
    config;
    constructor(server, config = {}) {
        this.server = server;
        this.sessions = new Map();
        // Default configuration
        this.config = {
            port: config.port || 3000,
            corsOrigin: config.corsOrigin || '*',
            enableLogging: config.enableLogging ?? true,
        };
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }
    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        // CORS configuration
        this.app.use(cors({
            origin: this.config.corsOrigin,
            credentials: true,
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Accept'],
        }));
        // JSON parsing
        this.app.use(express.json());
        // Request logging
        if (this.config.enableLogging) {
            this.app.use((req, _res, next) => {
                const timestamp = new Date().toISOString();
                console.error(`[${timestamp}] ${req.method} ${req.path}`);
                next();
            });
        }
    }
    /**
     * Setup HTTP routes
     */
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (_req, res) => {
            res.json({
                status: 'healthy',
                version: '0.1.0',
                server: 'agentic-payments-mcp',
                transport: 'http/sse',
                activeSessions: this.sessions.size,
            });
        });
        // SSE endpoint - establishes MCP connection
        this.app.get('/sse', async (req, res) => {
            try {
                if (this.config.enableLogging) {
                    console.error(`[SSE] New connection request`);
                }
                // Create SSE transport - it generates its own session ID
                // The endpoint for POST messages must match what transport expects
                const transport = new SSEServerTransport(`/message`, res);
                // Get the session ID that the transport generated
                const sessionId = transport.sessionId;
                this.sessions.set(sessionId, transport);
                if (this.config.enableLogging) {
                    console.error(`[SSE] Established session: ${sessionId}`);
                }
                // Connect server to transport
                await this.server.connect(transport);
                // Don't immediately delete session on close - keep it for a grace period
                // This allows POST requests to complete even if SSE disconnects briefly
                req.on('close', () => {
                    if (this.config.enableLogging) {
                        console.error(`[SSE] Connection closed: ${sessionId}`);
                    }
                    // Grace period of 30 seconds before cleanup
                    setTimeout(() => {
                        if (this.sessions.has(sessionId)) {
                            this.sessions.delete(sessionId);
                            if (this.config.enableLogging) {
                                console.error(`[SSE] Session cleaned up: ${sessionId}`);
                            }
                        }
                    }, 30000);
                });
                // Handle errors
                req.on('error', (error) => {
                    console.error(`[SSE] Connection error: ${sessionId}`, error);
                    // Don't immediately delete - same grace period
                });
            }
            catch (error) {
                console.error('[SSE] Failed to establish connection:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        error: 'Failed to establish SSE connection',
                        message: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
        });
        // Message endpoint - receives client messages
        this.app.post('/message', async (req, res) => {
            try {
                const sessionId = req.query.sessionId;
                if (!sessionId) {
                    res.status(400).json({
                        error: 'Missing sessionId query parameter',
                    });
                    return;
                }
                const transport = this.sessions.get(sessionId);
                if (!transport) {
                    res.status(404).json({
                        error: 'Session not found',
                        sessionId,
                    });
                    return;
                }
                // Forward message to transport with request body
                await transport.handlePostMessage(req, res, req.body);
            }
            catch (error) {
                console.error('[Message] Handler error:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        error: 'Failed to process message',
                        message: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
        });
        // Sessions endpoint - list active sessions (for debugging)
        this.app.get('/sessions', (_req, res) => {
            const sessions = Array.from(this.sessions.keys());
            res.json({
                count: sessions.length,
                sessions: sessions.map(id => ({
                    sessionId: id,
                    status: 'active',
                })),
            });
        });
        // Root endpoint - API information
        this.app.get('/', (_req, res) => {
            res.json({
                name: 'agentic-payments-mcp',
                version: '0.1.0',
                protocol: 'MCP (Model Context Protocol)',
                transport: 'HTTP/SSE',
                endpoints: {
                    health: '/health',
                    sse: '/sse?sessionId=<uuid>',
                    message: '/message?sessionId=<uuid>',
                    sessions: '/sessions',
                },
                documentation: 'https://github.com/agentic-catalog/agentic-payments',
            });
        });
        // 404 handler
        this.app.use((_req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: 'The requested endpoint does not exist',
            });
        });
        // Error handler
        this.app.use((error, _req, res, _next) => {
            console.error('[Error]', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
        });
    }
    /**
     * Start HTTP server
     */
    listen() {
        this.app.listen(this.config.port, () => {
            console.error('='.repeat(60));
            console.error('🚀 Agentic Payments MCP Server (HTTP/SSE)');
            console.error('='.repeat(60));
            console.error(`📡 Server:     http://localhost:${this.config.port}`);
            console.error(`🔗 SSE:        http://localhost:${this.config.port}/sse`);
            console.error(`💬 Messages:   http://localhost:${this.config.port}/message`);
            console.error(`❤️  Health:     http://localhost:${this.config.port}/health`);
            console.error('='.repeat(60));
        });
    }
    /**
     * Get active session count
     */
    getSessionCount() {
        return this.sessions.size;
    }
    /**
     * Get active session IDs
     */
    getSessionIds() {
        return Array.from(this.sessions.keys());
    }
    /**
     * Close all sessions and shutdown
     */
    async shutdown() {
        console.error('Shutting down HTTP MCP server...');
        // Close all active sessions
        for (const [sessionId, transport] of this.sessions.entries()) {
            try {
                await transport.close();
                this.sessions.delete(sessionId);
            }
            catch (error) {
                console.error(`Error closing session ${sessionId}:`, error);
            }
        }
        console.error('HTTP MCP server shutdown complete');
    }
}
//# sourceMappingURL=http.js.map