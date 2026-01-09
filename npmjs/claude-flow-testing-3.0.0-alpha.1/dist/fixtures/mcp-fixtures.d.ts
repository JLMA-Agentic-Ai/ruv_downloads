/**
 * @claude-flow/testing - MCP Fixtures
 *
 * Comprehensive mock MCP tools, contexts, and server configurations for testing.
 * Supports all MCP protocol operations and Claude-Flow tool integrations.
 *
 * Based on ADR-005 (MCP-first API design) and V3 specifications.
 */
import { type Mock } from 'vitest';
/**
 * MCP transport types
 */
export type MCPTransportType = 'stdio' | 'http' | 'websocket';
/**
 * MCP content types
 */
export type MCPContentType = 'text' | 'image' | 'resource';
/**
 * MCP input schema type (JSON Schema subset)
 */
export interface MCPInputSchema {
    type: 'object';
    properties: Record<string, MCPPropertySchema>;
    required?: string[];
    additionalProperties?: boolean;
}
/**
 * MCP property schema
 */
export interface MCPPropertySchema {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description?: string;
    enum?: unknown[];
    default?: unknown;
    items?: MCPPropertySchema;
    properties?: Record<string, MCPPropertySchema>;
    required?: string[];
}
/**
 * MCP tool definition
 */
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: MCPInputSchema;
    handler?: (params: Record<string, unknown>) => Promise<MCPToolResult>;
}
/**
 * MCP tool result
 */
export interface MCPToolResult {
    content: MCPContent[];
    isError?: boolean;
}
/**
 * MCP content (text, image, or resource)
 */
export type MCPContent = MCPTextContent | MCPImageContent | MCPResourceContent;
/**
 * MCP text content
 */
export interface MCPTextContent {
    type: 'text';
    text: string;
}
/**
 * MCP image content
 */
export interface MCPImageContent {
    type: 'image';
    data: string;
    mimeType: string;
}
/**
 * MCP resource content
 */
export interface MCPResourceContent {
    type: 'resource';
    resource: {
        uri: string;
        mimeType?: string;
        text?: string;
        blob?: string;
    };
}
/**
 * MCP server configuration
 */
export interface MCPServerConfig {
    name: string;
    version: string;
    transport: MCPTransportConfig;
    tools?: MCPTool[];
    resources?: MCPResource[];
    prompts?: MCPPrompt[];
    capabilities?: MCPCapabilities;
}
/**
 * MCP transport configuration
 */
export interface MCPTransportConfig {
    type: MCPTransportType;
    port?: number;
    host?: string;
    path?: string;
    timeout?: number;
}
/**
 * MCP resource definition
 */
export interface MCPResource {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}
/**
 * MCP prompt definition
 */
export interface MCPPrompt {
    name: string;
    description?: string;
    arguments?: MCPPromptArgument[];
}
/**
 * MCP prompt argument
 */
export interface MCPPromptArgument {
    name: string;
    description?: string;
    required?: boolean;
}
/**
 * MCP capabilities
 */
export interface MCPCapabilities {
    tools?: boolean;
    resources?: boolean;
    prompts?: boolean;
    logging?: boolean;
    experimental?: Record<string, boolean>;
}
/**
 * MCP request base
 */
export interface MCPRequestBase {
    jsonrpc: '2.0';
    id: string | number;
    method: string;
    params?: Record<string, unknown>;
}
/**
 * MCP response base
 */
export interface MCPResponseBase<T = unknown> {
    jsonrpc: '2.0';
    id: string | number;
    result?: T;
    error?: MCPError;
}
/**
 * MCP error
 */
export interface MCPError {
    code: number;
    message: string;
    data?: unknown;
}
/**
 * MCP server status
 */
export interface MCPServerStatus {
    running: boolean;
    transport: MCPTransportType;
    connectedClients: number;
    toolsRegistered: number;
    resourcesRegistered: number;
    promptsRegistered: number;
    requestsHandled: number;
    errorsCount: number;
    uptime: number;
}
/**
 * MCP session context
 */
export interface MCPSessionContext {
    sessionId: string;
    clientInfo: {
        name: string;
        version: string;
    };
    capabilities: MCPCapabilities;
    startedAt: Date;
    lastActivity: Date;
    requestCount: number;
}
/**
 * Pre-defined MCP tools for Claude-Flow
 */
export declare const mcpTools: Record<string, MCPTool>;
/**
 * Pre-defined MCP resources
 */
export declare const mcpResources: Record<string, MCPResource>;
/**
 * Pre-defined MCP prompts
 */
export declare const mcpPrompts: Record<string, MCPPrompt>;
/**
 * Pre-defined MCP server configurations
 */
export declare const mcpServerConfigs: Record<string, MCPServerConfig>;
/**
 * Pre-defined MCP tool results
 */
export declare const mcpToolResults: Record<string, MCPToolResult>;
/**
 * Pre-defined MCP errors
 */
export declare const mcpErrors: Record<string, MCPError>;
/**
 * Pre-defined session contexts
 */
export declare const mcpSessionContexts: Record<string, MCPSessionContext>;
/**
 * Factory function to create MCP tool
 */
export declare function createMCPTool(base: keyof typeof mcpTools, overrides?: Partial<MCPTool>): MCPTool;
/**
 * Factory function to create MCP server config
 */
export declare function createMCPServerConfig(base?: keyof typeof mcpServerConfigs, overrides?: Partial<MCPServerConfig>): MCPServerConfig;
/**
 * Factory function to create MCP request
 */
export declare function createMCPRequest(method: string, params?: Record<string, unknown>, overrides?: Partial<MCPRequestBase>): MCPRequestBase;
/**
 * Factory function to create MCP response
 */
export declare function createMCPResponse<T>(id: string | number, result?: T, error?: MCPError): MCPResponseBase<T>;
/**
 * Factory function to create MCP tool result
 */
export declare function createMCPToolResult(text: string, isError?: boolean): MCPToolResult;
/**
 * Factory function to create session context
 */
export declare function createMCPSessionContext(base?: keyof typeof mcpSessionContexts, overrides?: Partial<MCPSessionContext>): MCPSessionContext;
/**
 * Invalid MCP configurations for error testing
 */
export declare const invalidMCPConfigs: {
    emptyName: {
        name: string;
        version: string;
        transport: MCPTransportConfig;
        tools?: MCPTool[];
        resources?: MCPResource[];
        prompts?: MCPPrompt[];
        capabilities?: MCPCapabilities;
    };
    invalidPort: {
        transport: {
            type: MCPTransportType;
            port: number;
            host: string;
        };
        name: string;
        version: string;
        tools?: MCPTool[];
        resources?: MCPResource[];
        prompts?: MCPPrompt[];
        capabilities?: MCPCapabilities;
    };
    missingTransport: {
        name: string;
        version: string;
        transport: MCPTransportConfig;
    };
};
/**
 * Mock MCP client interface
 */
export interface MockMCPClient {
    connect: Mock<() => Promise<void>>;
    disconnect: Mock<() => Promise<void>>;
    callTool: Mock<(name: string, params: Record<string, unknown>) => Promise<MCPToolResult>>;
    listTools: Mock<() => Promise<MCPTool[]>>;
    readResource: Mock<(uri: string) => Promise<MCPResourceContent>>;
    listResources: Mock<() => Promise<MCPResource[]>>;
    getPrompt: Mock<(name: string, args: Record<string, string>) => Promise<string>>;
    listPrompts: Mock<() => Promise<MCPPrompt[]>>;
    isConnected: Mock<() => boolean>;
    getSessionContext: Mock<() => MCPSessionContext | null>;
}
/**
 * Create a mock MCP client
 */
export declare function createMockMCPClient(): MockMCPClient;
/**
 * Mock MCP server interface
 */
export interface MockMCPServer {
    start: Mock<() => Promise<void>>;
    stop: Mock<() => Promise<void>>;
    registerTool: Mock<(tool: MCPTool) => void>;
    registerResource: Mock<(resource: MCPResource) => void>;
    registerPrompt: Mock<(prompt: MCPPrompt) => void>;
    handleRequest: Mock<(request: MCPRequestBase) => Promise<MCPResponseBase>>;
    getStatus: Mock<() => MCPServerStatus>;
}
/**
 * Create a mock MCP server
 */
export declare function createMockMCPServer(): MockMCPServer;
/**
 * Mock transport interface
 */
export interface MockMCPTransport {
    send: Mock<(message: string) => Promise<void>>;
    receive: Mock<() => Promise<string>>;
    close: Mock<() => Promise<void>>;
    isOpen: Mock<() => boolean>;
}
/**
 * Create a mock MCP transport
 */
export declare function createMockMCPTransport(): MockMCPTransport;
//# sourceMappingURL=mcp-fixtures.d.ts.map