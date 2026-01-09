/**
 * @claude-flow/testing - Mock MCP Client
 *
 * Comprehensive mock MCP client for testing CLI and server interactions.
 * Simulates full MCP protocol behavior with request/response tracking.
 */
import { type Mock } from 'vitest';
import type { MCPTool, MCPToolResult, MCPResource, MCPPrompt, MCPServerConfig, MCPSessionContext, MCPError, MCPContent } from '../fixtures/mcp-fixtures.js';
/**
 * Mock MCP Client with full protocol simulation
 */
export declare class MockMCPClient {
    private _connected;
    private _session;
    private _tools;
    private _resources;
    private _prompts;
    private _requestHistory;
    private _responseHistory;
    private _toolHandlers;
    private _errorSimulation;
    private _latencySimulation;
    connect: Mock<() => Promise<void>>;
    disconnect: Mock<() => Promise<void>>;
    callTool: Mock<(name: string, params: Record<string, unknown>) => Promise<MCPToolResult>>;
    listTools: Mock<() => Promise<MCPTool[]>>;
    readResource: Mock<(uri: string) => Promise<MCPResourceContent>>;
    listResources: Mock<() => Promise<MCPResource[]>>;
    getPrompt: Mock<(name: string, args: Record<string, string>) => Promise<MCPPromptResult>>;
    listPrompts: Mock<() => Promise<MCPPrompt[]>>;
    isConnected: Mock<() => boolean>;
    getSession: Mock<() => MCPSessionContext | null>;
    /**
     * Register a tool
     */
    registerTool(tool: MCPTool): void;
    /**
     * Register multiple tools
     */
    registerTools(tools: MCPTool[]): void;
    /**
     * Register a custom tool handler
     */
    setToolHandler(name: string, handler: ToolHandler): void;
    /**
     * Register a resource
     */
    registerResource(resource: MCPResource): void;
    /**
     * Register multiple resources
     */
    registerResources(resources: MCPResource[]): void;
    /**
     * Register a prompt
     */
    registerPrompt(prompt: MCPPrompt): void;
    /**
     * Register multiple prompts
     */
    registerPrompts(prompts: MCPPrompt[]): void;
    /**
     * Configure error simulation
     */
    simulateErrors(config: ErrorSimulation): void;
    /**
     * Configure latency simulation
     */
    setLatency(ms: number): void;
    /**
     * Get request history
     */
    getRequestHistory(): MCPRequest[];
    /**
     * Get response history
     */
    getResponseHistory(): MCPResponse[];
    /**
     * Get last request
     */
    getLastRequest(): MCPRequest | undefined;
    /**
     * Get last response
     */
    getLastResponse(): MCPResponse | undefined;
    /**
     * Clear history
     */
    clearHistory(): void;
    /**
     * Reset client to initial state
     */
    reset(): void;
    private ensureConnected;
    private simulateLatency;
}
/**
 * Mock MCP Server for testing server-side behavior
 */
export declare class MockMCPServer {
    private _running;
    private _config;
    private _tools;
    private _resources;
    private _prompts;
    private _connections;
    private _requestLog;
    private _errorCount;
    start: Mock<(config: MCPServerConfig) => Promise<void>>;
    stop: Mock<() => Promise<void>>;
    handleRequest: Mock<(request: MCPRequest) => Promise<MCPResponse>>;
    registerTool: Mock<(tool: MCPTool) => void>;
    registerResource: Mock<(resource: MCPResource) => void>;
    registerPrompt: Mock<(prompt: MCPPrompt) => void>;
    getStatus: Mock<() => MCPServerStatus>;
    /**
     * Simulate a client connection
     */
    acceptConnection(): MockMCPConnection;
    /**
     * Get request log
     */
    getRequestLog(): MCPRequest[];
    /**
     * Reset server
     */
    reset(): void;
    private handleToolCall;
    private handleResourceRead;
    private handlePromptGet;
}
/**
 * Mock MCP Connection
 */
export declare class MockMCPConnection {
    private _open;
    private _server;
    constructor(server: MockMCPServer);
    send: Mock<(request: MCPRequest) => Promise<MCPResponse>>;
    close: Mock<() => Promise<void>>;
    isOpen(): boolean;
}
/**
 * MCP Client Error
 */
export declare class MCPClientError extends Error {
    code: number;
    constructor(message: string, code: number);
}
interface MCPRequest {
    id: string;
    method: string;
    params?: Record<string, unknown>;
    timestamp: Date;
}
interface MCPResponse {
    id: string;
    result?: unknown;
    error?: MCPError;
    timestamp: Date;
}
interface MCPResourceContent {
    type: 'resource';
    resource: {
        uri: string;
        mimeType?: string;
        text?: string;
        blob?: string;
    };
}
interface MCPPromptResult {
    messages: Array<{
        role: 'user' | 'assistant';
        content: MCPContent;
    }>;
}
interface MCPServerStatus {
    running: boolean;
    transport: string;
    connectedClients: number;
    toolsRegistered: number;
    resourcesRegistered: number;
    promptsRegistered: number;
    requestsHandled: number;
    errorsCount: number;
    uptime: number;
}
type ToolHandler = (params: Record<string, unknown>) => Promise<MCPToolResult>;
interface ErrorSimulation {
    onConnect?: string;
    onDisconnect?: string;
    onToolCall?: Record<string, string | MCPError>;
}
/**
 * Create a pre-configured mock MCP client with standard tools
 */
export declare function createStandardMockMCPClient(): MockMCPClient;
/**
 * Create a mock MCP client that simulates failures
 */
export declare function createFailingMockMCPClient(errorConfig: ErrorSimulation): MockMCPClient;
/**
 * Create a mock MCP client with latency
 */
export declare function createSlowMockMCPClient(latencyMs: number): MockMCPClient;
export {};
//# sourceMappingURL=mock-mcp-client.d.ts.map