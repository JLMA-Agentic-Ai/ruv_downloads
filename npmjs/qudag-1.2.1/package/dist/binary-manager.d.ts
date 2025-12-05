/**
 * Get the binary path for the current platform
 */
export declare function getBinaryPath(): string;
/**
 * Ensure the binary is installed, downloading if necessary
 */
export declare function ensureBinary(): Promise<void>;
/**
 * Get information about the current platform
 */
export declare function getPlatformInfo(): {
    platform: string;
    arch: string;
    targetTriple: string;
    binaryName: string;
    binaryPath: string;
};
//# sourceMappingURL=binary-manager.d.ts.map