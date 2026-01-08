import { DarkAddressResolveInput } from '../types/schemas.js';
export declare function darkAddressResolve(input: DarkAddressResolveInput): Promise<{
    resolved: {
        address: string;
        endpoints: ({
            type: "multiaddr";
            address: string;
            priority: number;
        } | {
            type: "quantum";
            address: string;
            priority: number;
        })[];
    };
    quantum_fingerprint: any;
    signature_verification: any;
    metadata: {
        resolution_time_ms: number;
        cache_hit: boolean;
        ttl_seconds: number;
        hops_traversed: number;
    };
}>;
//# sourceMappingURL=dark-address-resolve.d.ts.map