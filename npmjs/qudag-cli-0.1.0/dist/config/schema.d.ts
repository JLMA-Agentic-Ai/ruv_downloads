/**
 * Configuration schema definitions and defaults
 */
export interface GlobalConfig {
    format: 'json' | 'yaml' | 'text' | 'binary';
    verbose: boolean;
    debug: boolean;
    quiet: boolean;
    no_color: boolean;
    timeout: number;
    output_dir: string;
}
export interface ProfileConfig {
    parallel?: number;
    continue_on_error?: boolean;
    keep_temp?: boolean;
    timeout?: number;
    format?: string;
    verbose?: boolean;
    debug?: boolean;
    quiet?: boolean;
}
export interface ExecConfig {
    default_strategy: string;
    validate_on_start: boolean;
    stream_enabled: boolean;
    chunk_size: number;
    max_batch_size: number;
}
export interface OptimizeConfig {
    simulation_enabled: boolean;
    default_strategy: string;
    max_iterations: number;
    comparison_enabled: boolean;
    report_detailed: boolean;
}
export interface AnalyzeConfig {
    default_metrics: string;
    comprehensive_by_default: boolean;
    temporal_analysis: boolean;
    visualization_format: string;
    anomaly_threshold: number;
}
export interface BenchmarkConfig {
    default_mode: 'quick' | 'full';
    warmup_iterations: number;
    min_samples: number;
    regression_threshold: number;
    graph_generation: boolean;
}
export interface CryptoConfig {
    kem_algorithm: string;
    signature_algorithm: string;
    hash_algorithm: string;
}
export interface DAGConfig {
    consensus_algorithm: string;
    byzantine_fault_tolerance: number;
    consensus_threshold: number;
    finality_threshold: number;
    max_vertices: number;
}
export interface NetworkConfig {
    bootstrap_nodes: string[];
    default_peers: number;
    peer_discovery_enabled: boolean;
    peer_discovery_interval: number;
}
export interface PerformanceConfig {
    worker_threads: number;
    max_memory_mb: number;
    cache_enabled: boolean;
    cache_size_mb: number;
}
export interface LoggingConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'text' | 'json';
    output: 'console' | 'file' | 'both';
    file: string;
    file_rotation: 'daily' | 'size';
    file_retention_days: number;
}
export interface SecurityConfig {
    enable_memory_protection: boolean;
    enable_constant_time: boolean;
    tls_enabled: boolean;
    tls_verify: boolean;
}
export interface QuDAGConfig {
    global: GlobalConfig;
    profiles: Record<string, ProfileConfig>;
    exec: ExecConfig;
    optimize: OptimizeConfig;
    analyze: AnalyzeConfig;
    benchmark: BenchmarkConfig;
    crypto: CryptoConfig;
    dag: DAGConfig;
    network: NetworkConfig;
    performance: PerformanceConfig;
    logging: LoggingConfig;
    security: SecurityConfig;
}
/**
 * Default configuration values
 */
export declare const DEFAULT_CONFIG: QuDAGConfig;
/**
 * Merge configurations with precedence
 */
export declare function mergeConfig(base: Partial<QuDAGConfig>, override: Partial<QuDAGConfig>): QuDAGConfig;
//# sourceMappingURL=schema.d.ts.map