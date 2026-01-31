"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vaultQuantumStore = vaultQuantumStore;
const helpers_js_1 = require("../utils/helpers.js");
const dag_manager_js_1 = require("../utils/dag-manager.js");
async function vaultQuantumStore(input) {
    const entry_id = (0, helpers_js_1.generateId)('entry');
    const key_id = (0, helpers_js_1.generateId)('key');
    const start_time = Date.now();
    // Mock encryption process
    const secret_size = Buffer.from(input.secret.data, 'base64').length;
    const encryption_overhead = input.encryption.algorithm.includes('ml-kem') ? 1088 : 256;
    // Simulate encryption time based on data size
    const encryption_time_ms = 5 + (secret_size / 1024) * 2;
    await new Promise(resolve => setTimeout(resolve, Math.min(encryption_time_ms, 100)));
    const result = {
        vault_entry: {
            entry_id,
            label: input.secret.label,
            created_at: (0, helpers_js_1.getCurrentTimestamp)(),
            size_bytes: secret_size + encryption_overhead,
        },
        encryption: {
            algorithm: input.encryption.algorithm,
            key_id,
            quantum_resistant: true,
            encryption_time_ms: Date.now() - start_time,
        },
        access: {
            retrieval_token: (0, helpers_js_1.toBase64)(`token_${entry_id}_${Date.now()}`),
        },
    };
    // Store metadata in DAG if requested
    if (input.dag_storage?.store_metadata_in_dag) {
        const vertex_id = (0, helpers_js_1.generateId)('vtx');
        const metadata_hash = (0, helpers_js_1.toBase64)(`hash_${entry_id}`).substring(0, 64);
        dag_manager_js_1.dagManager.registerVertex({
            vertex_id,
            created_at: (0, helpers_js_1.getCurrentTimestamp)(),
            timestamp: Date.now(),
            vertex_type: 'data',
            payload: {
                entry_id,
                label: input.secret.label,
                category: input.secret.category,
                metadata_hash,
                encrypted_size: result.vault_entry.size_bytes,
            },
            parents: [],
            consensus: {
                status: input.dag_storage.require_consensus ? 'accepted' : 'pending',
                confidence_score: 0.95,
                voting_rounds: 1,
            },
        });
        result.dag_info = {
            vertex_id,
            consensus_status: input.dag_storage.require_consensus ? 'accepted' : 'pending',
            metadata_hash,
        };
    }
    return result;
}
//# sourceMappingURL=vault-quantum-store.js.map