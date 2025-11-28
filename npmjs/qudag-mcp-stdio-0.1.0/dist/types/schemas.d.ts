import { z } from 'zod';
export declare const GateSchema: z.ZodObject<{
    type: z.ZodEnum<["H", "X", "Y", "Z", "CNOT", "T", "S", "RX", "RY", "RZ"]>;
    target: z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>;
    params: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    control: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
    target: number | number[];
    params?: number[] | undefined;
    control?: number | undefined;
}, {
    type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
    target: number | number[];
    params?: number[] | undefined;
    control?: number | undefined;
}>;
export declare const CircuitSchema: z.ZodObject<{
    qubits: z.ZodNumber;
    gates: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["H", "X", "Y", "Z", "CNOT", "T", "S", "RX", "RY", "RZ"]>;
        target: z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>;
        params: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        control: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
        target: number | number[];
        params?: number[] | undefined;
        control?: number | undefined;
    }, {
        type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
        target: number | number[];
        params?: number[] | undefined;
        control?: number | undefined;
    }>, "many">;
    measurements: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    qubits: number;
    gates: {
        type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
        target: number | number[];
        params?: number[] | undefined;
        control?: number | undefined;
    }[];
    measurements?: number[] | undefined;
}, {
    qubits: number;
    gates: {
        type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
        target: number | number[];
        params?: number[] | undefined;
        control?: number | undefined;
    }[];
    measurements?: number[] | undefined;
}>;
export declare const ExecuteQuantumDagInputSchema: z.ZodObject<{
    circuit: z.ZodObject<{
        qubits: z.ZodNumber;
        gates: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["H", "X", "Y", "Z", "CNOT", "T", "S", "RX", "RY", "RZ"]>;
            target: z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>;
            params: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            control: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }, {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }>, "many">;
        measurements: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    }, {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    }>;
    execution: z.ZodOptional<z.ZodObject<{
        backend: z.ZodOptional<z.ZodEnum<["simulator", "classical-dag"]>>;
        shots: z.ZodOptional<z.ZodNumber>;
        optimization_level: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
        noise_model: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodBoolean;
            error_rate: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            error_rate?: number | undefined;
        }, {
            enabled: boolean;
            error_rate?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        backend?: "simulator" | "classical-dag" | undefined;
        shots?: number | undefined;
        optimization_level?: string | undefined;
        noise_model?: {
            enabled: boolean;
            error_rate?: number | undefined;
        } | undefined;
    }, {
        backend?: "simulator" | "classical-dag" | undefined;
        shots?: number | undefined;
        optimization_level?: string | undefined;
        noise_model?: {
            enabled: boolean;
            error_rate?: number | undefined;
        } | undefined;
    }>>;
    consensus: z.ZodOptional<z.ZodObject<{
        require_finality: z.ZodOptional<z.ZodBoolean>;
        timeout_ms: z.ZodOptional<z.ZodNumber>;
        min_confirmations: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        require_finality?: boolean | undefined;
        timeout_ms?: number | undefined;
        min_confirmations?: number | undefined;
    }, {
        require_finality?: boolean | undefined;
        timeout_ms?: number | undefined;
        min_confirmations?: number | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodObject<{
        label: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        label?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
    }, {
        label?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    circuit: {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    };
    execution?: {
        backend?: "simulator" | "classical-dag" | undefined;
        shots?: number | undefined;
        optimization_level?: string | undefined;
        noise_model?: {
            enabled: boolean;
            error_rate?: number | undefined;
        } | undefined;
    } | undefined;
    consensus?: {
        require_finality?: boolean | undefined;
        timeout_ms?: number | undefined;
        min_confirmations?: number | undefined;
    } | undefined;
    metadata?: {
        label?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
    } | undefined;
}, {
    circuit: {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    };
    execution?: {
        backend?: "simulator" | "classical-dag" | undefined;
        shots?: number | undefined;
        optimization_level?: string | undefined;
        noise_model?: {
            enabled: boolean;
            error_rate?: number | undefined;
        } | undefined;
    } | undefined;
    consensus?: {
        require_finality?: boolean | undefined;
        timeout_ms?: number | undefined;
        min_confirmations?: number | undefined;
    } | undefined;
    metadata?: {
        label?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
    } | undefined;
}>;
export declare const OptimizeCircuitInputSchema: z.ZodObject<{
    circuit: z.ZodObject<{
        qubits: z.ZodNumber;
        gates: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["H", "X", "Y", "Z", "CNOT", "T", "S", "RX", "RY", "RZ"]>;
            target: z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>;
            params: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            control: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }, {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }>, "many">;
        measurements: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    }, {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    }>;
    optimization: z.ZodObject<{
        level: z.ZodEnum<[string, ...string[]]>;
        preserve_semantics: z.ZodBoolean;
        target_metric: z.ZodOptional<z.ZodEnum<["depth", "gates", "fidelity", "dag-locality"]>>;
        max_iterations: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        level: string;
        preserve_semantics: boolean;
        target_metric?: "gates" | "depth" | "fidelity" | "dag-locality" | undefined;
        max_iterations?: number | undefined;
    }, {
        level: string;
        preserve_semantics: boolean;
        target_metric?: "gates" | "depth" | "fidelity" | "dag-locality" | undefined;
        max_iterations?: number | undefined;
    }>;
    dag_optimization: z.ZodOptional<z.ZodObject<{
        minimize_dag_depth: z.ZodOptional<z.ZodBoolean>;
        maximize_parallelism: z.ZodOptional<z.ZodBoolean>;
        locality_aware: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        minimize_dag_depth?: boolean | undefined;
        maximize_parallelism?: boolean | undefined;
        locality_aware?: boolean | undefined;
    }, {
        minimize_dag_depth?: boolean | undefined;
        maximize_parallelism?: boolean | undefined;
        locality_aware?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    circuit: {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    };
    optimization: {
        level: string;
        preserve_semantics: boolean;
        target_metric?: "gates" | "depth" | "fidelity" | "dag-locality" | undefined;
        max_iterations?: number | undefined;
    };
    dag_optimization?: {
        minimize_dag_depth?: boolean | undefined;
        maximize_parallelism?: boolean | undefined;
        locality_aware?: boolean | undefined;
    } | undefined;
}, {
    circuit: {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    };
    optimization: {
        level: string;
        preserve_semantics: boolean;
        target_metric?: "gates" | "depth" | "fidelity" | "dag-locality" | undefined;
        max_iterations?: number | undefined;
    };
    dag_optimization?: {
        minimize_dag_depth?: boolean | undefined;
        maximize_parallelism?: boolean | undefined;
        locality_aware?: boolean | undefined;
    } | undefined;
}>;
export declare const AnalyzeComplexityInputSchema: z.ZodObject<{
    circuit: z.ZodObject<{
        qubits: z.ZodNumber;
        gates: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["H", "X", "Y", "Z", "CNOT", "T", "S", "RX", "RY", "RZ"]>;
            target: z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>;
            params: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            control: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }, {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }>, "many">;
        measurements: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    }, {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    }>;
    analysis: z.ZodObject<{
        include_quantum_metrics: z.ZodOptional<z.ZodBoolean>;
        include_classical_metrics: z.ZodOptional<z.ZodBoolean>;
        include_dag_metrics: z.ZodOptional<z.ZodBoolean>;
        include_resource_estimates: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        include_quantum_metrics?: boolean | undefined;
        include_classical_metrics?: boolean | undefined;
        include_dag_metrics?: boolean | undefined;
        include_resource_estimates?: boolean | undefined;
    }, {
        include_quantum_metrics?: boolean | undefined;
        include_classical_metrics?: boolean | undefined;
        include_dag_metrics?: boolean | undefined;
        include_resource_estimates?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    circuit: {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    };
    analysis: {
        include_quantum_metrics?: boolean | undefined;
        include_classical_metrics?: boolean | undefined;
        include_dag_metrics?: boolean | undefined;
        include_resource_estimates?: boolean | undefined;
    };
}, {
    circuit: {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    };
    analysis: {
        include_quantum_metrics?: boolean | undefined;
        include_classical_metrics?: boolean | undefined;
        include_dag_metrics?: boolean | undefined;
        include_resource_estimates?: boolean | undefined;
    };
}>;
export declare const BenchmarkPerformanceInputSchema: z.ZodObject<{
    circuit: z.ZodObject<{
        qubits: z.ZodNumber;
        gates: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["H", "X", "Y", "Z", "CNOT", "T", "S", "RX", "RY", "RZ"]>;
            target: z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>;
            params: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            control: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }, {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }>, "many">;
        measurements: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    }, {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    }>;
    benchmark: z.ZodObject<{
        iterations: z.ZodOptional<z.ZodNumber>;
        warmup_iterations: z.ZodOptional<z.ZodNumber>;
        parallel_executions: z.ZodOptional<z.ZodNumber>;
        backends: z.ZodOptional<z.ZodArray<z.ZodEnum<["simulator", "classical-dag"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        iterations?: number | undefined;
        warmup_iterations?: number | undefined;
        parallel_executions?: number | undefined;
        backends?: ("simulator" | "classical-dag")[] | undefined;
    }, {
        iterations?: number | undefined;
        warmup_iterations?: number | undefined;
        parallel_executions?: number | undefined;
        backends?: ("simulator" | "classical-dag")[] | undefined;
    }>;
    metrics: z.ZodOptional<z.ZodObject<{
        execution_time: z.ZodOptional<z.ZodBoolean>;
        throughput: z.ZodOptional<z.ZodBoolean>;
        latency_distribution: z.ZodOptional<z.ZodBoolean>;
        resource_utilization: z.ZodOptional<z.ZodBoolean>;
        dag_consensus_time: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        execution_time?: boolean | undefined;
        throughput?: boolean | undefined;
        latency_distribution?: boolean | undefined;
        resource_utilization?: boolean | undefined;
        dag_consensus_time?: boolean | undefined;
    }, {
        execution_time?: boolean | undefined;
        throughput?: boolean | undefined;
        latency_distribution?: boolean | undefined;
        resource_utilization?: boolean | undefined;
        dag_consensus_time?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    circuit: {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    };
    benchmark: {
        iterations?: number | undefined;
        warmup_iterations?: number | undefined;
        parallel_executions?: number | undefined;
        backends?: ("simulator" | "classical-dag")[] | undefined;
    };
    metrics?: {
        execution_time?: boolean | undefined;
        throughput?: boolean | undefined;
        latency_distribution?: boolean | undefined;
        resource_utilization?: boolean | undefined;
        dag_consensus_time?: boolean | undefined;
    } | undefined;
}, {
    circuit: {
        qubits: number;
        gates: {
            type: "H" | "X" | "Y" | "Z" | "CNOT" | "T" | "S" | "RX" | "RY" | "RZ";
            target: number | number[];
            params?: number[] | undefined;
            control?: number | undefined;
        }[];
        measurements?: number[] | undefined;
    };
    benchmark: {
        iterations?: number | undefined;
        warmup_iterations?: number | undefined;
        parallel_executions?: number | undefined;
        backends?: ("simulator" | "classical-dag")[] | undefined;
    };
    metrics?: {
        execution_time?: boolean | undefined;
        throughput?: boolean | undefined;
        latency_distribution?: boolean | undefined;
        resource_utilization?: boolean | undefined;
        dag_consensus_time?: boolean | undefined;
    } | undefined;
}>;
export declare const QuantumKeyExchangeInputSchema: z.ZodObject<{
    algorithm: z.ZodEnum<["ml-kem-512", "ml-kem-768", "ml-kem-1024"]>;
    role: z.ZodEnum<["initiator", "responder"]>;
    encapsulated_key: z.ZodOptional<z.ZodString>;
    options: z.ZodOptional<z.ZodObject<{
        derive_shared_secret: z.ZodOptional<z.ZodBoolean>;
        store_in_vault: z.ZodOptional<z.ZodBoolean>;
        vault_label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        derive_shared_secret?: boolean | undefined;
        store_in_vault?: boolean | undefined;
        vault_label?: string | undefined;
    }, {
        derive_shared_secret?: boolean | undefined;
        store_in_vault?: boolean | undefined;
        vault_label?: string | undefined;
    }>>;
    dag_storage: z.ZodOptional<z.ZodObject<{
        store_public_key: z.ZodOptional<z.ZodBoolean>;
        require_consensus: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        store_public_key?: boolean | undefined;
        require_consensus?: boolean | undefined;
    }, {
        store_public_key?: boolean | undefined;
        require_consensus?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    algorithm: "ml-kem-512" | "ml-kem-768" | "ml-kem-1024";
    role: "initiator" | "responder";
    options?: {
        derive_shared_secret?: boolean | undefined;
        store_in_vault?: boolean | undefined;
        vault_label?: string | undefined;
    } | undefined;
    encapsulated_key?: string | undefined;
    dag_storage?: {
        store_public_key?: boolean | undefined;
        require_consensus?: boolean | undefined;
    } | undefined;
}, {
    algorithm: "ml-kem-512" | "ml-kem-768" | "ml-kem-1024";
    role: "initiator" | "responder";
    options?: {
        derive_shared_secret?: boolean | undefined;
        store_in_vault?: boolean | undefined;
        vault_label?: string | undefined;
    } | undefined;
    encapsulated_key?: string | undefined;
    dag_storage?: {
        store_public_key?: boolean | undefined;
        require_consensus?: boolean | undefined;
    } | undefined;
}>;
export declare const QuantumSignInputSchema: z.ZodObject<{
    data: z.ZodString;
    algorithm: z.ZodEnum<["ml-dsa-44", "ml-dsa-65", "ml-dsa-87"]>;
    private_key: z.ZodString;
    options: z.ZodOptional<z.ZodObject<{
        include_timestamp: z.ZodOptional<z.ZodBoolean>;
        include_context: z.ZodOptional<z.ZodBoolean>;
        context: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        include_timestamp?: boolean | undefined;
        include_context?: boolean | undefined;
        context?: string | undefined;
    }, {
        include_timestamp?: boolean | undefined;
        include_context?: boolean | undefined;
        context?: string | undefined;
    }>>;
    dag_storage: z.ZodOptional<z.ZodObject<{
        store_signature: z.ZodOptional<z.ZodBoolean>;
        attach_to_vertex: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        store_signature?: boolean | undefined;
        attach_to_vertex?: string | undefined;
    }, {
        store_signature?: boolean | undefined;
        attach_to_vertex?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    algorithm: "ml-dsa-44" | "ml-dsa-65" | "ml-dsa-87";
    data: string;
    private_key: string;
    options?: {
        include_timestamp?: boolean | undefined;
        include_context?: boolean | undefined;
        context?: string | undefined;
    } | undefined;
    dag_storage?: {
        store_signature?: boolean | undefined;
        attach_to_vertex?: string | undefined;
    } | undefined;
}, {
    algorithm: "ml-dsa-44" | "ml-dsa-65" | "ml-dsa-87";
    data: string;
    private_key: string;
    options?: {
        include_timestamp?: boolean | undefined;
        include_context?: boolean | undefined;
        context?: string | undefined;
    } | undefined;
    dag_storage?: {
        store_signature?: boolean | undefined;
        attach_to_vertex?: string | undefined;
    } | undefined;
}>;
export declare const DarkAddressResolveInputSchema: z.ZodObject<{
    address: z.ZodString;
    options: z.ZodOptional<z.ZodObject<{
        include_quantum_fingerprint: z.ZodOptional<z.ZodBoolean>;
        verify_signature: z.ZodOptional<z.ZodBoolean>;
        cache_result: z.ZodOptional<z.ZodBoolean>;
        timeout_ms: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeout_ms?: number | undefined;
        include_quantum_fingerprint?: boolean | undefined;
        verify_signature?: boolean | undefined;
        cache_result?: boolean | undefined;
    }, {
        timeout_ms?: number | undefined;
        include_quantum_fingerprint?: boolean | undefined;
        verify_signature?: boolean | undefined;
        cache_result?: boolean | undefined;
    }>>;
    network: z.ZodOptional<z.ZodObject<{
        prefer_onion_routing: z.ZodOptional<z.ZodBoolean>;
        require_quantum_secure: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        prefer_onion_routing?: boolean | undefined;
        require_quantum_secure?: boolean | undefined;
    }, {
        prefer_onion_routing?: boolean | undefined;
        require_quantum_secure?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    address: string;
    options?: {
        timeout_ms?: number | undefined;
        include_quantum_fingerprint?: boolean | undefined;
        verify_signature?: boolean | undefined;
        cache_result?: boolean | undefined;
    } | undefined;
    network?: {
        prefer_onion_routing?: boolean | undefined;
        require_quantum_secure?: boolean | undefined;
    } | undefined;
}, {
    address: string;
    options?: {
        timeout_ms?: number | undefined;
        include_quantum_fingerprint?: boolean | undefined;
        verify_signature?: boolean | undefined;
        cache_result?: boolean | undefined;
    } | undefined;
    network?: {
        prefer_onion_routing?: boolean | undefined;
        require_quantum_secure?: boolean | undefined;
    } | undefined;
}>;
export declare const VaultQuantumStoreInputSchema: z.ZodObject<{
    secret: z.ZodObject<{
        label: z.ZodString;
        data: z.ZodString;
        category: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        data: string;
        tags?: string[] | undefined;
        category?: string | undefined;
    }, {
        label: string;
        data: string;
        tags?: string[] | undefined;
        category?: string | undefined;
    }>;
    encryption: z.ZodObject<{
        algorithm: z.ZodEnum<["ml-kem-768", "ml-kem-1024", "hqc-128", "hqc-192"]>;
        derive_key: z.ZodOptional<z.ZodBoolean>;
        key_rotation_enabled: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        algorithm: "ml-kem-768" | "ml-kem-1024" | "hqc-128" | "hqc-192";
        derive_key?: boolean | undefined;
        key_rotation_enabled?: boolean | undefined;
    }, {
        algorithm: "ml-kem-768" | "ml-kem-1024" | "hqc-128" | "hqc-192";
        derive_key?: boolean | undefined;
        key_rotation_enabled?: boolean | undefined;
    }>;
    access_control: z.ZodOptional<z.ZodObject<{
        allowed_peers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        require_signature: z.ZodOptional<z.ZodBoolean>;
        expiry_time: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        allowed_peers?: string[] | undefined;
        require_signature?: boolean | undefined;
        expiry_time?: string | undefined;
    }, {
        allowed_peers?: string[] | undefined;
        require_signature?: boolean | undefined;
        expiry_time?: string | undefined;
    }>>;
    dag_storage: z.ZodOptional<z.ZodObject<{
        store_metadata_in_dag: z.ZodOptional<z.ZodBoolean>;
        require_consensus: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        require_consensus?: boolean | undefined;
        store_metadata_in_dag?: boolean | undefined;
    }, {
        require_consensus?: boolean | undefined;
        store_metadata_in_dag?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    secret: {
        label: string;
        data: string;
        tags?: string[] | undefined;
        category?: string | undefined;
    };
    encryption: {
        algorithm: "ml-kem-768" | "ml-kem-1024" | "hqc-128" | "hqc-192";
        derive_key?: boolean | undefined;
        key_rotation_enabled?: boolean | undefined;
    };
    dag_storage?: {
        require_consensus?: boolean | undefined;
        store_metadata_in_dag?: boolean | undefined;
    } | undefined;
    access_control?: {
        allowed_peers?: string[] | undefined;
        require_signature?: boolean | undefined;
        expiry_time?: string | undefined;
    } | undefined;
}, {
    secret: {
        label: string;
        data: string;
        tags?: string[] | undefined;
        category?: string | undefined;
    };
    encryption: {
        algorithm: "ml-kem-768" | "ml-kem-1024" | "hqc-128" | "hqc-192";
        derive_key?: boolean | undefined;
        key_rotation_enabled?: boolean | undefined;
    };
    dag_storage?: {
        require_consensus?: boolean | undefined;
        store_metadata_in_dag?: boolean | undefined;
    } | undefined;
    access_control?: {
        allowed_peers?: string[] | undefined;
        require_signature?: boolean | undefined;
        expiry_time?: string | undefined;
    } | undefined;
}>;
export declare const VaultQuantumRetrieveInputSchema: z.ZodObject<{
    entry: z.ZodObject<{
        entry_id: z.ZodOptional<z.ZodString>;
        label: z.ZodOptional<z.ZodString>;
        retrieval_token: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        label?: string | undefined;
        entry_id?: string | undefined;
        retrieval_token?: string | undefined;
    }, {
        label?: string | undefined;
        entry_id?: string | undefined;
        retrieval_token?: string | undefined;
    }>;
    authentication: z.ZodObject<{
        private_key: z.ZodOptional<z.ZodString>;
        access_token: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        private_key?: string | undefined;
        access_token?: string | undefined;
    }, {
        private_key?: string | undefined;
        access_token?: string | undefined;
    }>;
    decryption: z.ZodOptional<z.ZodObject<{
        verify_integrity: z.ZodOptional<z.ZodBoolean>;
        check_expiry: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        verify_integrity?: boolean | undefined;
        check_expiry?: boolean | undefined;
    }, {
        verify_integrity?: boolean | undefined;
        check_expiry?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    entry: {
        label?: string | undefined;
        entry_id?: string | undefined;
        retrieval_token?: string | undefined;
    };
    authentication: {
        private_key?: string | undefined;
        access_token?: string | undefined;
    };
    decryption?: {
        verify_integrity?: boolean | undefined;
        check_expiry?: boolean | undefined;
    } | undefined;
}, {
    entry: {
        label?: string | undefined;
        entry_id?: string | undefined;
        retrieval_token?: string | undefined;
    };
    authentication: {
        private_key?: string | undefined;
        access_token?: string | undefined;
    };
    decryption?: {
        verify_integrity?: boolean | undefined;
        check_expiry?: boolean | undefined;
    } | undefined;
}>;
export declare const SystemHealthCheckInputSchema: z.ZodObject<{
    components: z.ZodOptional<z.ZodObject<{
        dag: z.ZodOptional<z.ZodBoolean>;
        crypto: z.ZodOptional<z.ZodBoolean>;
        network: z.ZodOptional<z.ZodBoolean>;
        vault: z.ZodOptional<z.ZodBoolean>;
        consensus: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        consensus?: boolean | undefined;
        network?: boolean | undefined;
        dag?: boolean | undefined;
        crypto?: boolean | undefined;
        vault?: boolean | undefined;
    }, {
        consensus?: boolean | undefined;
        network?: boolean | undefined;
        dag?: boolean | undefined;
        crypto?: boolean | undefined;
        vault?: boolean | undefined;
    }>>;
    depth: z.ZodOptional<z.ZodEnum<["basic", "detailed", "comprehensive"]>>;
    performance_tests: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        quick_tests_only: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled?: boolean | undefined;
        quick_tests_only?: boolean | undefined;
    }, {
        enabled?: boolean | undefined;
        quick_tests_only?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    depth?: "basic" | "detailed" | "comprehensive" | undefined;
    components?: {
        consensus?: boolean | undefined;
        network?: boolean | undefined;
        dag?: boolean | undefined;
        crypto?: boolean | undefined;
        vault?: boolean | undefined;
    } | undefined;
    performance_tests?: {
        enabled?: boolean | undefined;
        quick_tests_only?: boolean | undefined;
    } | undefined;
}, {
    depth?: "basic" | "detailed" | "comprehensive" | undefined;
    components?: {
        consensus?: boolean | undefined;
        network?: boolean | undefined;
        dag?: boolean | undefined;
        crypto?: boolean | undefined;
        vault?: boolean | undefined;
    } | undefined;
    performance_tests?: {
        enabled?: boolean | undefined;
        quick_tests_only?: boolean | undefined;
    } | undefined;
}>;
export type Gate = z.infer<typeof GateSchema>;
export type Circuit = z.infer<typeof CircuitSchema>;
export type ExecuteQuantumDagInput = z.infer<typeof ExecuteQuantumDagInputSchema>;
export type OptimizeCircuitInput = z.infer<typeof OptimizeCircuitInputSchema>;
export type AnalyzeComplexityInput = z.infer<typeof AnalyzeComplexityInputSchema>;
export type BenchmarkPerformanceInput = z.infer<typeof BenchmarkPerformanceInputSchema>;
export type QuantumKeyExchangeInput = z.infer<typeof QuantumKeyExchangeInputSchema>;
export type QuantumSignInput = z.infer<typeof QuantumSignInputSchema>;
export type DarkAddressResolveInput = z.infer<typeof DarkAddressResolveInputSchema>;
export type VaultQuantumStoreInput = z.infer<typeof VaultQuantumStoreInputSchema>;
export type VaultQuantumRetrieveInput = z.infer<typeof VaultQuantumRetrieveInputSchema>;
export type SystemHealthCheckInput = z.infer<typeof SystemHealthCheckInputSchema>;
//# sourceMappingURL=schemas.d.ts.map