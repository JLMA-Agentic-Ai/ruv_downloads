import { Server } from '@modelcontextprotocol/sdk/server/index.js';
/**
 * QuDAG MCP Server
 *
 * Provides quantum-resistant operations through the Model Context Protocol
 */
export declare class QuDagMcpServer {
    private server;
    constructor();
    private setupHandlers;
    connect(): Promise<void>;
    getServer(): Server<{
        method: string;
        params?: {
            [x: string]: unknown;
            _meta?: {
                [x: string]: unknown;
                progressToken?: string | number | undefined;
            } | undefined;
        } | undefined;
    }, {
        method: string;
        params?: {
            [x: string]: unknown;
            _meta?: {
                [x: string]: unknown;
            } | undefined;
        } | undefined;
    }, {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    }>;
}
//# sourceMappingURL=server.d.ts.map