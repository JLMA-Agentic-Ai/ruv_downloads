import { QuDAGConfig } from './schema.js';
/**
 * Load configuration from file
 */
export declare function loadConfigFile(filePath: string): Promise<Partial<QuDAGConfig>>;
/**
 * Auto-discover configuration file
 */
export declare function discoverConfigFile(): Promise<string | null>;
/**
 * Load configuration with auto-discovery
 */
export declare function loadConfig(explicitPath?: string, profile?: string): Promise<QuDAGConfig>;
/**
 * Validate configuration
 */
export declare function validateConfig(config: QuDAGConfig): void;
//# sourceMappingURL=loader.d.ts.map