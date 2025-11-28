"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemHealthCheckInputSchema = exports.VaultQuantumRetrieveInputSchema = exports.VaultQuantumStoreInputSchema = exports.DarkAddressResolveInputSchema = exports.QuantumSignInputSchema = exports.QuantumKeyExchangeInputSchema = exports.BenchmarkPerformanceInputSchema = exports.AnalyzeComplexityInputSchema = exports.OptimizeCircuitInputSchema = exports.ExecuteQuantumDagInputSchema = exports.CircuitSchema = exports.GateSchema = void 0;
const zod_1 = require("zod");
// ============================================================================
// Quantum DAG Schemas
// ============================================================================
exports.GateSchema = zod_1.z.object({
    type: zod_1.z.enum(['H', 'X', 'Y', 'Z', 'CNOT', 'T', 'S', 'RX', 'RY', 'RZ']),
    target: zod_1.z.union([zod_1.z.number(), zod_1.z.array(zod_1.z.number())]),
    params: zod_1.z.array(zod_1.z.number()).optional(),
    control: zod_1.z.number().optional(),
});
exports.CircuitSchema = zod_1.z.object({
    qubits: zod_1.z.number().int().min(1).max(32),
    gates: zod_1.z.array(exports.GateSchema),
    measurements: zod_1.z.array(zod_1.z.number()).optional(),
});
exports.ExecuteQuantumDagInputSchema = zod_1.z.object({
    circuit: exports.CircuitSchema,
    execution: zod_1.z
        .object({
        backend: zod_1.z.enum(['simulator', 'classical-dag']).optional(),
        shots: zod_1.z.number().int().min(1).max(10000).optional(),
        optimization_level: zod_1.z.enum([0, 1, 2, 3]).optional(),
        noise_model: zod_1.z
            .object({
            enabled: zod_1.z.boolean(),
            error_rate: zod_1.z.number().min(0).max(1).optional(),
        })
            .optional(),
    })
        .optional(),
    consensus: zod_1.z
        .object({
        require_finality: zod_1.z.boolean().optional(),
        timeout_ms: zod_1.z.number().optional(),
        min_confirmations: zod_1.z.number().optional(),
    })
        .optional(),
    metadata: zod_1.z
        .object({
        label: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
});
exports.OptimizeCircuitInputSchema = zod_1.z.object({
    circuit: exports.CircuitSchema,
    optimization: zod_1.z.object({
        level: zod_1.z.enum([0, 1, 2, 3]),
        preserve_semantics: zod_1.z.boolean(),
        target_metric: zod_1.z.enum(['depth', 'gates', 'fidelity', 'dag-locality']).optional(),
        max_iterations: zod_1.z.number().optional(),
    }),
    dag_optimization: zod_1.z
        .object({
        minimize_dag_depth: zod_1.z.boolean().optional(),
        maximize_parallelism: zod_1.z.boolean().optional(),
        locality_aware: zod_1.z.boolean().optional(),
    })
        .optional(),
});
exports.AnalyzeComplexityInputSchema = zod_1.z.object({
    circuit: exports.CircuitSchema,
    analysis: zod_1.z.object({
        include_quantum_metrics: zod_1.z.boolean().optional(),
        include_classical_metrics: zod_1.z.boolean().optional(),
        include_dag_metrics: zod_1.z.boolean().optional(),
        include_resource_estimates: zod_1.z.boolean().optional(),
    }),
});
exports.BenchmarkPerformanceInputSchema = zod_1.z.object({
    circuit: exports.CircuitSchema,
    benchmark: zod_1.z.object({
        iterations: zod_1.z.number().optional(),
        warmup_iterations: zod_1.z.number().optional(),
        parallel_executions: zod_1.z.number().optional(),
        backends: zod_1.z.array(zod_1.z.enum(['simulator', 'classical-dag'])).optional(),
    }),
    metrics: zod_1.z
        .object({
        execution_time: zod_1.z.boolean().optional(),
        throughput: zod_1.z.boolean().optional(),
        latency_distribution: zod_1.z.boolean().optional(),
        resource_utilization: zod_1.z.boolean().optional(),
        dag_consensus_time: zod_1.z.boolean().optional(),
    })
        .optional(),
});
// ============================================================================
// Cryptographic Operation Schemas
// ============================================================================
exports.QuantumKeyExchangeInputSchema = zod_1.z.object({
    algorithm: zod_1.z.enum(['ml-kem-512', 'ml-kem-768', 'ml-kem-1024']),
    role: zod_1.z.enum(['initiator', 'responder']),
    encapsulated_key: zod_1.z.string().optional(),
    options: zod_1.z
        .object({
        derive_shared_secret: zod_1.z.boolean().optional(),
        store_in_vault: zod_1.z.boolean().optional(),
        vault_label: zod_1.z.string().optional(),
    })
        .optional(),
    dag_storage: zod_1.z
        .object({
        store_public_key: zod_1.z.boolean().optional(),
        require_consensus: zod_1.z.boolean().optional(),
    })
        .optional(),
});
exports.QuantumSignInputSchema = zod_1.z.object({
    data: zod_1.z.string(),
    algorithm: zod_1.z.enum(['ml-dsa-44', 'ml-dsa-65', 'ml-dsa-87']),
    private_key: zod_1.z.string(),
    options: zod_1.z
        .object({
        include_timestamp: zod_1.z.boolean().optional(),
        include_context: zod_1.z.boolean().optional(),
        context: zod_1.z.string().optional(),
    })
        .optional(),
    dag_storage: zod_1.z
        .object({
        store_signature: zod_1.z.boolean().optional(),
        attach_to_vertex: zod_1.z.string().optional(),
    })
        .optional(),
});
// ============================================================================
// Network Operation Schemas
// ============================================================================
exports.DarkAddressResolveInputSchema = zod_1.z.object({
    address: zod_1.z.string(),
    options: zod_1.z
        .object({
        include_quantum_fingerprint: zod_1.z.boolean().optional(),
        verify_signature: zod_1.z.boolean().optional(),
        cache_result: zod_1.z.boolean().optional(),
        timeout_ms: zod_1.z.number().optional(),
    })
        .optional(),
    network: zod_1.z
        .object({
        prefer_onion_routing: zod_1.z.boolean().optional(),
        require_quantum_secure: zod_1.z.boolean().optional(),
    })
        .optional(),
});
// ============================================================================
// Vault Operation Schemas
// ============================================================================
exports.VaultQuantumStoreInputSchema = zod_1.z.object({
    secret: zod_1.z.object({
        label: zod_1.z.string(),
        data: zod_1.z.string(),
        category: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    }),
    encryption: zod_1.z.object({
        algorithm: zod_1.z.enum(['ml-kem-768', 'ml-kem-1024', 'hqc-128', 'hqc-192']),
        derive_key: zod_1.z.boolean().optional(),
        key_rotation_enabled: zod_1.z.boolean().optional(),
    }),
    access_control: zod_1.z
        .object({
        allowed_peers: zod_1.z.array(zod_1.z.string()).optional(),
        require_signature: zod_1.z.boolean().optional(),
        expiry_time: zod_1.z.string().optional(),
    })
        .optional(),
    dag_storage: zod_1.z
        .object({
        store_metadata_in_dag: zod_1.z.boolean().optional(),
        require_consensus: zod_1.z.boolean().optional(),
    })
        .optional(),
});
exports.VaultQuantumRetrieveInputSchema = zod_1.z.object({
    entry: zod_1.z.object({
        entry_id: zod_1.z.string().optional(),
        label: zod_1.z.string().optional(),
        retrieval_token: zod_1.z.string().optional(),
    }),
    authentication: zod_1.z.object({
        private_key: zod_1.z.string().optional(),
        access_token: zod_1.z.string().optional(),
    }),
    decryption: zod_1.z
        .object({
        verify_integrity: zod_1.z.boolean().optional(),
        check_expiry: zod_1.z.boolean().optional(),
    })
        .optional(),
});
// ============================================================================
// System Monitoring Schemas
// ============================================================================
exports.SystemHealthCheckInputSchema = zod_1.z.object({
    components: zod_1.z
        .object({
        dag: zod_1.z.boolean().optional(),
        crypto: zod_1.z.boolean().optional(),
        network: zod_1.z.boolean().optional(),
        vault: zod_1.z.boolean().optional(),
        consensus: zod_1.z.boolean().optional(),
    })
        .optional(),
    depth: zod_1.z.enum(['basic', 'detailed', 'comprehensive']).optional(),
    performance_tests: zod_1.z
        .object({
        enabled: zod_1.z.boolean().optional(),
        quick_tests_only: zod_1.z.boolean().optional(),
    })
        .optional(),
});
//# sourceMappingURL=schemas.js.map