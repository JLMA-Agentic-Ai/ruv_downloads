"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemStatusResource = exports.getNetworkTopologyResource = exports.getNetworkPeerResource = exports.getCryptoAlgorithmsResource = exports.getCryptoKeyResource = exports.getDagStatisticsResource = exports.getDagTipsResource = exports.getDagVertexResource = exports.getQuantumBenchmarkResource = exports.getQuantumCircuitResource = exports.getQuantumStateResource = void 0;
exports.getResource = getResource;
exports.listResourceTemplates = listResourceTemplates;
var quantum_state_js_1 = require("./quantum-state.js");
Object.defineProperty(exports, "getQuantumStateResource", { enumerable: true, get: function () { return quantum_state_js_1.getQuantumStateResource; } });
Object.defineProperty(exports, "getQuantumCircuitResource", { enumerable: true, get: function () { return quantum_state_js_1.getQuantumCircuitResource; } });
Object.defineProperty(exports, "getQuantumBenchmarkResource", { enumerable: true, get: function () { return quantum_state_js_1.getQuantumBenchmarkResource; } });
var dag_vertices_js_1 = require("./dag-vertices.js");
Object.defineProperty(exports, "getDagVertexResource", { enumerable: true, get: function () { return dag_vertices_js_1.getDagVertexResource; } });
Object.defineProperty(exports, "getDagTipsResource", { enumerable: true, get: function () { return dag_vertices_js_1.getDagTipsResource; } });
Object.defineProperty(exports, "getDagStatisticsResource", { enumerable: true, get: function () { return dag_vertices_js_1.getDagStatisticsResource; } });
var crypto_keys_js_1 = require("./crypto-keys.js");
Object.defineProperty(exports, "getCryptoKeyResource", { enumerable: true, get: function () { return crypto_keys_js_1.getCryptoKeyResource; } });
Object.defineProperty(exports, "getCryptoAlgorithmsResource", { enumerable: true, get: function () { return crypto_keys_js_1.getCryptoAlgorithmsResource; } });
var network_peers_js_1 = require("./network-peers.js");
Object.defineProperty(exports, "getNetworkPeerResource", { enumerable: true, get: function () { return network_peers_js_1.getNetworkPeerResource; } });
Object.defineProperty(exports, "getNetworkTopologyResource", { enumerable: true, get: function () { return network_peers_js_1.getNetworkTopologyResource; } });
var system_status_js_1 = require("./system-status.js");
Object.defineProperty(exports, "getSystemStatusResource", { enumerable: true, get: function () { return system_status_js_1.getSystemStatusResource; } });
/**
 * Route resource requests to appropriate handlers
 */
function getResource(uri) {
    if (uri.startsWith('quantum://states/')) {
        return getQuantumStateResource(uri);
    }
    else if (uri.startsWith('quantum://circuits/')) {
        return getQuantumCircuitResource(uri);
    }
    else if (uri.startsWith('quantum://benchmarks/')) {
        return getQuantumBenchmarkResource(uri);
    }
    else if (uri.startsWith('dag://vertices/')) {
        return getDagVertexResource(uri);
    }
    else if (uri.startsWith('dag://tips')) {
        return getDagTipsResource(uri);
    }
    else if (uri.startsWith('dag://statistics')) {
        return getDagStatisticsResource(uri);
    }
    else if (uri.startsWith('crypto://keys/')) {
        return getCryptoKeyResource(uri);
    }
    else if (uri.startsWith('crypto://algorithms')) {
        return getCryptoAlgorithmsResource(uri);
    }
    else if (uri.startsWith('network://peers/')) {
        return getNetworkPeerResource(uri);
    }
    else if (uri.startsWith('network://topology')) {
        return getNetworkTopologyResource(uri);
    }
    else if (uri.startsWith('system://status')) {
        return getSystemStatusResource(uri);
    }
    else {
        throw new Error(`Unknown resource URI: ${uri}`);
    }
}
/**
 * List all available resource templates
 */
function listResourceTemplates() {
    return [
        {
            uriTemplate: 'quantum://states/{execution_id}',
            name: 'Quantum Execution State',
            description: 'Access quantum circuit execution state and results',
            mimeType: 'application/json',
        },
        {
            uriTemplate: 'quantum://circuits/{circuit_id}',
            name: 'Quantum Circuit Definition',
            description: 'Access quantum circuit definitions and metadata',
            mimeType: 'application/json',
        },
        {
            uriTemplate: 'quantum://benchmarks/{benchmark_id}',
            name: 'Quantum Benchmark Results',
            description: 'Access benchmark results and performance data',
            mimeType: 'application/json',
        },
        {
            uriTemplate: 'dag://vertices/{vertex_id}',
            name: 'DAG Vertex',
            description: 'Access individual DAG vertex data',
            mimeType: 'application/json',
        },
        {
            uriTemplate: 'dag://tips',
            name: 'DAG Tips',
            description: 'Access current DAG tips (vertices without children)',
            mimeType: 'application/json',
        },
        {
            uriTemplate: 'dag://statistics',
            name: 'DAG Statistics',
            description: 'Access DAG aggregate statistics and health metrics',
            mimeType: 'application/json',
        },
        {
            uriTemplate: 'crypto://keys/{key_id}',
            name: 'Cryptographic Key',
            description: 'Access public key information and metadata',
            mimeType: 'application/json',
        },
        {
            uriTemplate: 'crypto://algorithms',
            name: 'Cryptographic Algorithms',
            description: 'Information about supported cryptographic algorithms',
            mimeType: 'application/json',
        },
        {
            uriTemplate: 'network://peers/{peer_id}',
            name: 'Network Peer',
            description: 'Access peer information and connection status',
            mimeType: 'application/json',
        },
        {
            uriTemplate: 'network://topology',
            name: 'Network Topology',
            description: 'Access network topology and peer graph',
            mimeType: 'application/json',
        },
        {
            uriTemplate: 'system://status',
            name: 'System Status',
            description: 'Access overall system status and health',
            mimeType: 'application/json',
        },
    ];
}
//# sourceMappingURL=index.js.map