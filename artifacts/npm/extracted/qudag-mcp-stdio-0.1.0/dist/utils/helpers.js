"use strict";
/**
 * Helper utilities for MCP server
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
exports.toBase64 = toBase64;
exports.fromBase64 = fromBase64;
exports.sleep = sleep;
exports.formatError = formatError;
exports.sha3_256 = sha3_256;
exports.sanitizeString = sanitizeString;
exports.isValidDarkAddress = isValidDarkAddress;
exports.generateQuantumFingerprint = generateQuantumFingerprint;
exports.calculatePercentiles = calculatePercentiles;
exports.getCurrentTimestamp = getCurrentTimestamp;
exports.optimizeCircuitMock = optimizeCircuitMock;
exports.analyzeCircuitComplexity = analyzeCircuitComplexity;
/**
 * Generate a unique ID with a given prefix
 */
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
/**
 * Encode data to base64
 */
function toBase64(data) {
    return Buffer.from(data).toString('base64');
}
/**
 * Decode base64 data
 */
function fromBase64(data) {
    return Buffer.from(data, 'base64').toString('utf-8');
}
/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Format error for MCP response
 */
function formatError(error) {
    if (error instanceof Error) {
        return {
            code: -32603,
            message: error.message,
            data: {
                type: 'INTERNAL_ERROR',
                stack: error.stack,
            },
        };
    }
    return {
        code: -32603,
        message: String(error),
    };
}
/**
 * Calculate SHA3-256 hash (placeholder - should use actual crypto library)
 */
function sha3_256(data) {
    // In production, use actual SHA3 implementation
    // For now, using a placeholder
    return toBase64(data).substring(0, 64);
}
/**
 * Validate and sanitize string input
 */
function sanitizeString(input, maxLength = 1000) {
    return input.substring(0, maxLength).trim();
}
/**
 * Check if a string is a valid dark address
 */
function isValidDarkAddress(address) {
    return /^[a-z0-9-]+\.dark$/.test(address);
}
/**
 * Generate mock quantum fingerprint
 */
function generateQuantumFingerprint() {
    return `qfp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
/**
 * Calculate performance percentiles
 */
function calculatePercentiles(values) {
    if (values.length === 0) {
        return { p50: 0, p95: 0, p99: 0, mean: 0, median: 0 };
    }
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return {
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
        mean,
        median: sorted[Math.floor(sorted.length * 0.5)],
    };
}
/**
 * Get current ISO timestamp
 */
function getCurrentTimestamp() {
    return new Date().toISOString();
}
/**
 * Mock circuit optimization
 */
function optimizeCircuitMock(circuit, level) {
    const originalGateCount = circuit.gates.length;
    const reduction = Math.floor(originalGateCount * 0.1 * level);
    const optimizedGateCount = Math.max(1, originalGateCount - reduction);
    return {
        optimized_circuit: {
            ...circuit,
            gates: circuit.gates.slice(0, optimizedGateCount),
        },
        original_gate_count: originalGateCount,
        optimized_gate_count: optimizedGateCount,
        gates_reduced: reduction,
    };
}
/**
 * Mock circuit complexity analysis
 */
function analyzeCircuitComplexity(circuit) {
    const gate_count = circuit.gates.length;
    const qubit_count = circuit.qubits;
    const two_qubit_gates = circuit.gates.filter((g) => g.type === 'CNOT' || Array.isArray(g.target)).length;
    return {
        gate_count,
        depth: Math.ceil(gate_count / qubit_count),
        qubit_count,
        two_qubit_gates,
        entanglement_entropy: (two_qubit_gates / gate_count) * Math.log2(qubit_count),
        circuit_expressibility: 0.5 + Math.random() * 0.3,
    };
}
//# sourceMappingURL=helpers.js.map