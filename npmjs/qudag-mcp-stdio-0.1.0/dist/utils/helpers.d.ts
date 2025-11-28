/**
 * Helper utilities for MCP server
 */
/**
 * Generate a unique ID with a given prefix
 */
export declare function generateId(prefix: string): string;
/**
 * Encode data to base64
 */
export declare function toBase64(data: string): string;
/**
 * Decode base64 data
 */
export declare function fromBase64(data: string): string;
/**
 * Sleep for a given number of milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Format error for MCP response
 */
export declare function formatError(error: unknown): {
    code: number;
    message: string;
    data?: any;
};
/**
 * Calculate SHA3-256 hash (placeholder - should use actual crypto library)
 */
export declare function sha3_256(data: string): string;
/**
 * Validate and sanitize string input
 */
export declare function sanitizeString(input: string, maxLength?: number): string;
/**
 * Check if a string is a valid dark address
 */
export declare function isValidDarkAddress(address: string): boolean;
/**
 * Generate mock quantum fingerprint
 */
export declare function generateQuantumFingerprint(): string;
/**
 * Calculate performance percentiles
 */
export declare function calculatePercentiles(values: number[]): {
    p50: number;
    p95: number;
    p99: number;
    mean: number;
    median: number;
};
/**
 * Get current ISO timestamp
 */
export declare function getCurrentTimestamp(): string;
/**
 * Mock circuit optimization
 */
export declare function optimizeCircuitMock(circuit: any, level: number): {
    optimized_circuit: any;
    original_gate_count: any;
    optimized_gate_count: number;
    gates_reduced: number;
};
/**
 * Mock circuit complexity analysis
 */
export declare function analyzeCircuitComplexity(circuit: any): {
    gate_count: any;
    depth: number;
    qubit_count: any;
    two_qubit_gates: any;
    entanglement_entropy: number;
    circuit_expressibility: number;
};
//# sourceMappingURL=helpers.d.ts.map