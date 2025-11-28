#!/usr/bin/env node
"use strict";
/**
 * QuDAG MCP STDIO Server Entry Point
 *
 * This executable provides Claude Desktop integration via STDIO transport.
 * It exposes QuDAG's quantum-resistant operations through the Model Context Protocol.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const server_js_1 = require("./server.js");
async function main() {
    try {
        const server = new server_js_1.QuDagMcpServer();
        await server.connect();
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.error('Received SIGINT, shutting down gracefully...');
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            console.error('Received SIGTERM, shutting down gracefully...');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Fatal error starting QuDAG MCP server:', error);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error('Unhandled error in main:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map