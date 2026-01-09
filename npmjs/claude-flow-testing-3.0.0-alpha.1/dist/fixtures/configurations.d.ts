/**
 * V3 Claude-Flow Configuration Fixtures
 *
 * Test data for configuration testing
 * Following London School principle of explicit test data
 */
/**
 * Security configuration interface
 */
export interface SecurityConfig {
    validation: {
        maxInputSize: number;
        allowedChars: RegExp;
        sanitizeHtml: boolean;
    };
    paths: {
        allowedDirectories: string[];
        blockedPatterns: string[];
        maxPathLength: number;
    };
    execution: {
        shell: boolean;
        timeout: number;
        allowedCommands: string[];
        blockedCommands: string[];
    };
    hashing: {
        algorithm: 'argon2' | 'bcrypt' | 'scrypt';
        memoryCost?: number;
        timeCost?: number;
        parallelism?: number;
    };
}
/**
 * Memory configuration interface
 */
export interface MemoryConfig {
    backend: 'agentdb' | 'sqlite' | 'memory' | 'hybrid';
    vectorDimensions: number;
    hnswConfig: {
        M: number;
        efConstruction: number;
        efSearch: number;
    };
    caching: {
        enabled: boolean;
        maxSize: number;
        ttl: number;
    };
    quantization: {
        enabled: boolean;
        bits: 4 | 8;
    };
}
/**
 * Swarm configuration interface
 */
export interface SwarmConfig {
    topology: 'hierarchical' | 'mesh' | 'adaptive' | 'hierarchical-mesh';
    maxAgents: number;
    coordination: {
        consensusProtocol: 'raft' | 'pbft' | 'gossip';
        heartbeatInterval: number;
        electionTimeout: number;
    };
    communication: {
        protocol: 'quic' | 'tcp' | 'websocket';
        maxMessageSize: number;
        retryAttempts: number;
    };
}
/**
 * MCP configuration interface
 */
export interface MCPConfig {
    server: {
        port: number;
        host: string;
        protocol: 'http' | 'https' | 'stdio';
    };
    connection: {
        poolSize: number;
        timeout: number;
        keepAlive: boolean;
    };
    tools: {
        enabled: string[];
        disabled: string[];
    };
}
/**
 * Performance configuration interface
 */
export interface PerformanceConfig {
    targets: {
        flashAttentionSpeedup: [number, number];
        agentDBSearchImprovement: [number, number];
        memoryReduction: number;
        startupTime: number;
    };
    monitoring: {
        enabled: boolean;
        samplingRate: number;
        metricsEndpoint?: string;
    };
    optimization: {
        batchSize: number;
        parallelism: number;
        cacheStrategy: 'lru' | 'lfu' | 'arc';
    };
}
/**
 * Pre-defined security configurations for testing
 */
export declare const securityConfigs: Record<string, SecurityConfig>;
/**
 * Pre-defined memory configurations for testing
 */
export declare const memoryConfigs: Record<string, MemoryConfig>;
/**
 * Pre-defined swarm configurations for testing
 */
export declare const swarmConfigs: Record<string, SwarmConfig>;
/**
 * Pre-defined MCP configurations for testing
 */
export declare const mcpConfigs: Record<string, MCPConfig>;
/**
 * Pre-defined performance configurations for testing
 */
export declare const performanceConfigs: Record<string, PerformanceConfig>;
/**
 * Factory functions to create configurations with overrides
 */
export declare function createSecurityConfig(base: keyof typeof securityConfigs, overrides?: Partial<SecurityConfig>): SecurityConfig;
export declare function createMemoryConfig(base: keyof typeof memoryConfigs, overrides?: Partial<MemoryConfig>): MemoryConfig;
export declare function createSwarmConfigFromBase(base: keyof typeof swarmConfigs, overrides?: Partial<SwarmConfig>): SwarmConfig;
export declare function createMCPConfig(base: keyof typeof mcpConfigs, overrides?: Partial<MCPConfig>): MCPConfig;
export declare function createPerformanceConfig(base: keyof typeof performanceConfigs, overrides?: Partial<PerformanceConfig>): PerformanceConfig;
/**
 * Invalid configurations for error testing
 */
export declare const invalidConfigs: {
    security: {
        negativeMaxInputSize: SecurityConfig;
        emptyAllowedCommands: SecurityConfig;
    };
    memory: {
        zeroDimensions: MemoryConfig;
        invalidQuantization: MemoryConfig;
    };
    swarm: {
        zeroAgents: SwarmConfig;
        negativeHeartbeat: SwarmConfig;
    };
};
//# sourceMappingURL=configurations.d.ts.map