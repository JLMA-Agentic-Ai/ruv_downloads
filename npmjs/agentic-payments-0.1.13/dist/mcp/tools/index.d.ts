/**
 * MCP Tools Registry
 * Central registry and router for all MCP tools
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
/**
 * Tool handler function type
 */
export type ToolHandler = (args: any) => Promise<any>;
/**
 * Register all available MCP tools
 *
 * Returns an array of tool definitions following the MCP specification.
 * Each tool includes a name, description, and JSON Schema for input validation.
 *
 * @returns Array of tool definitions
 */
export declare function registerTools(): Tool[];
/**
 * Get tool handler by name
 *
 * Routes tool calls to the appropriate handler function.
 * Returns null if the tool name is not recognized.
 *
 * @param name - Tool name
 * @returns Tool handler function or null
 */
export declare function getToolHandler(name: string): ToolHandler | null;
/**
 * Execute a tool by name with arguments
 *
 * Convenience function that finds and executes a tool handler.
 * Throws an error if the tool is not found.
 *
 * @param name - Tool name
 * @param args - Tool arguments
 * @returns Tool execution result
 */
export declare function executeTool(name: string, args: any): Promise<any>;
export * from './mandate.js';
export * from './agent.js';
export * from './consensus.js';
export * from './payment.js';
export * from './types.js';
//# sourceMappingURL=index.d.ts.map