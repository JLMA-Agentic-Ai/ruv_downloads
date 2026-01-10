/**
 * V3 CLI Main Entry Point
 * Modernized CLI for Claude Flow V3
 *
 * Created with ❤️ by ruv.io
 */
export declare const VERSION: string;
export interface CLIOptions {
    name?: string;
    description?: string;
    version?: string;
    interactive?: boolean;
}
/**
 * V3 CLI Application
 */
export declare class CLI {
    private name;
    private description;
    private version;
    private parser;
    private output;
    private interactive;
    constructor(options?: CLIOptions);
    /**
     * Run the CLI with given arguments
     */
    run(args?: string[]): Promise<void>;
    /**
     * Show main help
     */
    private showHelp;
    /**
     * Show command-specific help
     */
    private showCommandHelp;
    /**
     * Show version
     */
    private showVersion;
    /**
     * Load configuration file
     */
    private loadConfig;
    /**
     * Handle errors
     */
    private handleError;
}
export * from './types.js';
export { CommandParser, commandParser } from './parser.js';
export { OutputFormatter, output, Progress, Spinner, type VerbosityLevel } from './output.js';
export * from './prompt.js';
export * from './commands/index.js';
export { MCPServerManager, createMCPServerManager, getServerManager, startMCPServer, stopMCPServer, getMCPServerStatus, type MCPServerOptions, type MCPServerStatus, } from './mcp-server.js';
export default CLI;
//# sourceMappingURL=index.d.ts.map