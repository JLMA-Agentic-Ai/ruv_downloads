/**
 * HTTP/SSE Transport for MCP Server
 * Provides remote access to MCP tools via Server-Sent Events
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
/**
 * HTTP transport configuration
 */
export interface HttpTransportConfig {
    /** Port to listen on */
    port: number;
    /** CORS origin (default: '*') */
    corsOrigin?: string | string[];
    /** Enable request logging */
    enableLogging?: boolean;
}
/**
 * HTTP MCP Server with SSE support
 * Handles multiple client connections via session management
 */
export declare class HttpMCPServer {
    private app;
    private server;
    private sessions;
    private config;
    constructor(server: Server, config?: Partial<HttpTransportConfig>);
    /**
     * Setup Express middleware
     */
    private setupMiddleware;
    /**
     * Setup HTTP routes
     */
    private setupRoutes;
    /**
     * Start HTTP server
     */
    listen(): void;
    /**
     * Get active session count
     */
    getSessionCount(): number;
    /**
     * Get active session IDs
     */
    getSessionIds(): string[];
    /**
     * Close all sessions and shutdown
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=http.d.ts.map