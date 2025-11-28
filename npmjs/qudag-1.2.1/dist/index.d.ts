/**
 * QuDAG NPM Package Main Module
 * Provides programmatic access to QuDAG functionality
 */
import { SpawnOptions } from 'child_process';
import { ensureBinary, getBinaryPath, getPlatformInfo } from './binary-manager';
export { ensureBinary, getBinaryPath, getPlatformInfo };
/**
 * Execute a QuDAG command
 */
export declare function execute(args: string[], options?: SpawnOptions): Promise<{
    code: number;
    stdout: string;
    stderr: string;
}>;
/**
 * QuDAG CLI wrapper class for programmatic usage
 */
export declare class QuDAG {
    /**
     * Start a QuDAG node
     */
    static start(port?: number): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
    /**
     * Stop the QuDAG node
     */
    static stop(): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
    /**
     * Get node status
     */
    static status(): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
    /**
     * List peers
     */
    static listPeers(): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
    /**
     * Add a peer
     */
    static addPeer(address: string): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
    /**
     * Register a dark address
     */
    static registerAddress(domain: string): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
    /**
     * Resolve a dark address
     */
    static resolveAddress(domain: string): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
    /**
     * Generate a shadow address
     */
    static generateShadowAddress(ttl?: number): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
    /**
     * Create a quantum fingerprint
     */
    static createFingerprint(data: string): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
    /**
     * Execute a raw command
     */
    static raw(args: string[]): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
}
/**
 * Check if QuDAG binary is installed
 */
export declare function isInstalled(): boolean;
export interface QuDAGResult {
    code: number;
    stdout: string;
    stderr: string;
}
export interface PlatformInfo {
    platform: string;
    arch: string;
    targetTriple: string;
    binaryName: string;
    binaryPath: string;
}
//# sourceMappingURL=index.d.ts.map