/**
 * MCP Server Implementation
 * Core server class with request handlers and transport support
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { registerTools, getToolHandler } from './tools/index.js';
import { HttpMCPServer } from './transports/http.js';
/**
 * Agentic Payments MCP Server
 *
 * Exposes payment authorization tools via Model Context Protocol
 */
export class AgenticPaymentsMCPServer {
    server;
    httpServer;
    constructor() {
        this.server = new Server({
            name: 'agentic-payments',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
    }
    /**
     * Setup request handlers for MCP protocol
     */
    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            const tools = registerTools();
            return { tools };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            // Log to stderr (not stdout for stdio transport)
            console.error(`[MCP] Tool call: ${name}`);
            console.error(`[MCP] Arguments:`, JSON.stringify(args, null, 2));
            try {
                // Route to appropriate tool handler
                const handler = getToolHandler(name);
                if (!handler) {
                    throw new Error(`Unknown tool: ${name}`);
                }
                const result = await handler(args || {});
                console.error(`[MCP] Tool result:`, JSON.stringify(result, null, 2));
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                console.error(`[MCP] Tool error:`, error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: errorMessage,
                            }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    /**
     * Start server with stdio transport
     * Used for local CLI integration with Claude Desktop
     */
    async startStdio() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('[MCP] Agentic Payments MCP server running on stdio');
        console.error('[MCP] Available tools:', registerTools().length);
    }
    /**
     * Start server with HTTP/SSE transport
     * Used for remote integration via HTTP
     */
    async startHttp(port = 3000) {
        this.httpServer = new HttpMCPServer(this.server, {
            port,
            enableLogging: true,
        });
        this.httpServer.listen();
        // Graceful shutdown handling
        process.on('SIGINT', async () => {
            console.error('\n[MCP] Received SIGINT, shutting down gracefully...');
            await this.shutdown();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            console.error('\n[MCP] Received SIGTERM, shutting down gracefully...');
            await this.shutdown();
            process.exit(0);
        });
    }
    /**
     * Graceful shutdown
     */
    async shutdown() {
        if (this.httpServer) {
            await this.httpServer.shutdown();
        }
    }
    /**
     * Get the underlying MCP server instance
     */
    getServer() {
        return this.server;
    }
}
//# sourceMappingURL=server.js.map