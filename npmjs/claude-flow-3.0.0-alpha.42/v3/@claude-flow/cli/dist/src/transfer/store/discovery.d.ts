/**
 * IPFS-Based Pattern Discovery
 * Secure discovery mechanism for finding patterns in decentralized environment
 */
import type { PatternRegistry, KnownRegistry, StoreConfig } from './types.js';
/**
 * Discovery result
 */
export interface DiscoveryResult {
    success: boolean;
    registry?: PatternRegistry;
    source: string;
    fromCache: boolean;
    cid?: string;
    error?: string;
}
/**
 * Resolved IPNS result
 */
export interface IPNSResolution {
    ipnsName: string;
    cid: string;
    resolvedAt: string;
    expiresAt: string;
}
/**
 * Pattern Store Discovery Service
 * Handles secure discovery of pattern registries via IPFS/IPNS
 */
export declare class PatternDiscovery {
    private config;
    private cache;
    private ipnsCache;
    constructor(config?: Partial<StoreConfig>);
    /**
     * Discover and load the pattern registry
     */
    discoverRegistry(registryName?: string): Promise<DiscoveryResult>;
    /**
     * Resolve IPNS name to CID
     */
    resolveIPNS(ipnsName: string): Promise<IPNSResolution | null>;
    /**
     * Fetch registry from IPFS gateway
     */
    fetchRegistry(cid: string, gateway: string): Promise<PatternRegistry | null>;
    /**
     * Verify registry signature
     */
    verifyRegistry(registry: PatternRegistry, expectedPublicKey: string): boolean;
    /**
     * Get cached registry
     */
    getCachedRegistry(ipnsName: string): PatternRegistry | null;
    /**
     * Cache registry
     */
    cacheRegistry(ipnsName: string, registry: PatternRegistry): void;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * List all known registries
     */
    listRegistries(): KnownRegistry[];
    /**
     * Add a custom registry
     */
    addRegistry(registry: KnownRegistry): void;
    /**
     * Generate mock CID for demo
     */
    private generateMockCID;
    /**
     * Create mock registry with Seraphine genesis
     */
    private createMockRegistry;
}
/**
 * Create discovery service with default config
 */
export declare function createDiscoveryService(config?: Partial<StoreConfig>): PatternDiscovery;
//# sourceMappingURL=discovery.d.ts.map