export { getQuantumStateResource, getQuantumCircuitResource, getQuantumBenchmarkResource, } from './quantum-state.js';
export { getDagVertexResource, getDagTipsResource, getDagStatisticsResource, } from './dag-vertices.js';
export { getCryptoKeyResource, getCryptoAlgorithmsResource, } from './crypto-keys.js';
export { getNetworkPeerResource, getNetworkTopologyResource, } from './network-peers.js';
export { getSystemStatusResource, } from './system-status.js';
/**
 * Route resource requests to appropriate handlers
 */
export declare function getResource(uri: string): any;
/**
 * List all available resource templates
 */
export declare function listResourceTemplates(): {
    uriTemplate: string;
    name: string;
    description: string;
    mimeType: string;
}[];
//# sourceMappingURL=index.d.ts.map