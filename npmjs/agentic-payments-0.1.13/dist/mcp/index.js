#!/usr/bin/env node
/**
 * MCP Server Entry Point
 * Supports both stdio and HTTP/SSE transports
 */
import { parseArgs } from 'util';
import { AgenticPaymentsMCPServer } from './server.js';
async function main() {
    // Parse command-line arguments
    const { values } = parseArgs({
        options: {
            transport: {
                type: 'string',
                short: 't',
                default: 'stdio',
            },
            port: {
                type: 'string',
                short: 'p',
                default: '3000',
            },
            help: {
                type: 'boolean',
                short: 'h',
                default: false,
            },
        },
    });
    // Show help
    if (values.help) {
        console.log(`
Agentic Payments MCP Server

Usage:
  agentic-payments-mcp [options]

Options:
  -t, --transport <type>    Transport type: stdio, http (default: stdio)
  -p, --port <number>       HTTP server port (default: 3000)
  -h, --help                Show this help message

Examples:
  # Start with stdio transport (for Claude Desktop)
  agentic-payments-mcp

  # Start with HTTP/SSE transport
  agentic-payments-mcp --transport http --port 3000

Transport Details:
  stdio    - Standard input/output (for local CLI integration)
  http     - HTTP with Server-Sent Events (for remote integration)

MCP Tools Available:
  - create_active_mandate      Create payment authorization mandate
  - sign_mandate               Sign mandate with Ed25519
  - verify_mandate             Verify mandate signature
  - revoke_mandate             Revoke active mandate
  - list_revocations           List all revocations
  - generate_agent_identity    Generate agent keypair
  - verify_consensus           Verify multi-agent consensus
  - create_intent_mandate      Create intent-based mandate
  - create_cart_mandate        Create cart-based mandate

Documentation:
  https://github.com/agentic-catalog/agentic-payments
`);
        process.exit(0);
    }
    try {
        console.error('[MCP] Starting Agentic Payments MCP Server...');
        // Create server instance
        const server = new AgenticPaymentsMCPServer();
        // Start appropriate transport
        if (values.transport === 'http') {
            const port = parseInt(values.port || '3000', 10);
            if (isNaN(port) || port < 1 || port > 65535) {
                console.error('[MCP] Error: Invalid port number. Must be between 1 and 65535.');
                process.exit(1);
            }
            console.error(`[MCP] Starting HTTP transport on port ${port}...`);
            await server.startHttp(port);
        }
        else if (values.transport === 'stdio') {
            console.error('[MCP] Starting stdio transport...');
            await server.startStdio();
        }
        else {
            console.error(`[MCP] Error: Unknown transport type: ${values.transport}`);
            console.error('[MCP] Valid transports: stdio, http');
            process.exit(1);
        }
    }
    catch (error) {
        console.error('[MCP] Fatal error:', error);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error('[MCP] Unhandled error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map