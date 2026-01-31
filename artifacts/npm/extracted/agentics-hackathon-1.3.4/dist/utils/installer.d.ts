/**
 * Tool installation utilities
 */
import type { Tool, InstallProgress } from '../types.js';
/**
 * Safely checks if a tool is installed by running its verify command
 * Uses execa with shell: false to prevent command injection
 * @param tool - The tool to check
 * @returns Promise resolving to true if installed, false otherwise
 */
export declare function checkToolInstalled(tool: Tool): Promise<boolean>;
export declare function installTool(tool: Tool): Promise<InstallProgress>;
/**
 * Safely executes a command using execa (no shell injection)
 * @param command - The command string to execute
 * @returns Promise resolving to stdout output
 */
export declare function runCommand(command: string): Promise<string>;
export declare function checkPrerequisites(): Promise<{
    node: boolean;
    npm: boolean;
    python: boolean;
    pip: boolean;
    git: boolean;
}>;
//# sourceMappingURL=installer.d.ts.map