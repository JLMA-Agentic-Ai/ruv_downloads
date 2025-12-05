/**
 * MCP Server Implementation
 * Core server class with request handlers and transport support
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
/**
 * Agentic Payments MCP Server
 *
 * Exposes payment authorization tools via Model Context Protocol
 */
export declare class AgenticPaymentsMCPServer {
    private server;
    private httpServer?;
    constructor();
    /**
     * Setup request handlers for MCP protocol
     */
    private setupHandlers;
    /**
     * Start server with stdio transport
     * Used for local CLI integration with Claude Desktop
     */
    startStdio(): Promise<void>;
    /**
     * Start server with HTTP/SSE transport
     * Used for remote integration via HTTP
     */
    startHttp(port?: number): Promise<void>;
    /**
     * Graceful shutdown
     */
    shutdown(): Promise<void>;
    /**
     * Get the underlying MCP server instance
     */
    getServer(): Server;
}
//# sourceMappingURL=server.d.ts.map