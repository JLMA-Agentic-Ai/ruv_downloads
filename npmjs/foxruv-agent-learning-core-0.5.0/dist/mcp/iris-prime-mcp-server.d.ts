#!/usr/bin/env node
/**
 * IRIS Prime MCP Server
 *
 * Model Context Protocol server for IRIS Prime AI Operations Orchestrator
 * Follows FoxRev ReasoningBank pattern - runs programmatically, results loaded into model context
 *
 * Key Design:
 * - MCP tools are called PROGRAMMATICALLY (not directly by Claude)
 * - Results are loaded into model context as text
 * - Keeps heavy operations OUT of Claude's direct context
 * - Claude gets the RESULTS, not the direct MCP connection
 *
 * @author FoxRuv
 * @license MIT
 */
export {};
//# sourceMappingURL=iris-prime-mcp-server.d.ts.map