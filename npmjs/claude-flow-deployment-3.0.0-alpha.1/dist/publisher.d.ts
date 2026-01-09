/**
 * NPM Publisher
 * Handles npm package publishing with tag support
 */
import type { PublishOptions, PublishResult, PackageInfo } from './types.js';
export declare class Publisher {
    private cwd;
    constructor(cwd?: string);
    /**
     * Publish package to npm
     */
    publishToNpm(options?: PublishOptions): Promise<PublishResult>;
    /**
     * Check if package version already exists on npm
     */
    checkVersionExists(packageName: string, version: string): Promise<boolean>;
    /**
     * Get latest published version
     */
    getLatestVersion(packageName: string, tag?: string): Promise<string | null>;
    /**
     * Get package info from npm registry
     */
    getPackageInfo(packageName: string): Promise<PackageInfo | null>;
    /**
     * Verify npm authentication
     */
    verifyAuth(): Promise<boolean>;
    /**
     * Get npm registry URL
     */
    getRegistry(): Promise<string>;
    /**
     * Pack package to tarball
     */
    pack(outputDir?: string): Promise<string>;
    /**
     * Execute npm command safely using execFileSync
     */
    private execNpmCommand;
    /**
     * Execute command (for build scripts only - validated)
     */
    private execCommand;
}
/**
 * Convenience function to publish to npm
 */
export declare function publishToNpm(options?: PublishOptions): Promise<PublishResult>;
/**
 * Convenience function to check version exists
 */
export declare function checkVersionExists(packageName: string, version: string): Promise<boolean>;
/**
 * Convenience function to get latest version
 */
export declare function getLatestVersion(packageName: string, tag?: string): Promise<string | null>;
//# sourceMappingURL=publisher.d.ts.map