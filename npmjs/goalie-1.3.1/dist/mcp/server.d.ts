/**
 * GOAP MCP Server
 * Main Model Context Protocol server for GOAP planning system
 */
export declare class GoapMCPServer {
    private server;
    private goapTools;
    private pluginRegistry;
    constructor();
    initialize(): Promise<void>;
    private loadExternalPlugins;
    private setupHandlers;
    private handlePluginList;
    private handlePluginEnable;
    private handlePluginDisable;
    private handlePluginInfo;
    run(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map