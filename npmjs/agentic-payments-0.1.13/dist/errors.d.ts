/**
 * Error handling system for agentic-payments
 * Pure TypeScript implementation - no WASM dependencies
 */
/**
 * Error codes for payment operations
 */
export declare enum PaymentErrorCode {
    CRYPTO_ERROR = "CRYPTO_ERROR",
    KEY_GENERATION_FAILED = "KEY_GENERATION_FAILED",
    INVALID_KEY_FORMAT = "INVALID_KEY_FORMAT",
    SIGNATURE_FAILED = "SIGNATURE_FAILED",
    VERIFICATION_FAILED = "VERIFICATION_FAILED",
    CONSENSUS_ERROR = "CONSENSUS_ERROR",
    INSUFFICIENT_AGENTS = "INSUFFICIENT_AGENTS",
    CONSENSUS_FAILED = "CONSENSUS_FAILED",
    VALIDATION_FAILED = "VALIDATION_FAILED",
    INVALID_MANDATE = "INVALID_MANDATE",
    EXPIRED_MANDATE = "EXPIRED_MANDATE",
    AMOUNT_EXCEEDED = "AMOUNT_EXCEEDED",
    SYSTEM_ERROR = "SYSTEM_ERROR",
    NOT_INITIALIZED = "NOT_INITIALIZED",
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"
}
/**
 * Base error class for all agentic-payments errors
 */
export declare class PaymentError extends Error {
    readonly code: PaymentErrorCode;
    readonly recoverable: boolean;
    readonly context?: Record<string, unknown>;
    readonly timestamp: number;
    constructor(code: PaymentErrorCode, message: string, context?: Record<string, unknown>, recoverable?: boolean);
    /**
     * Convert error to JSON for logging
     */
    toJSON(): Record<string, unknown>;
}
/**
 * Check if error is recoverable
 */
export declare function isRecoverable(error: Error): boolean;
/**
 * Extract error code from error
 */
export declare function getErrorCode(error: Error): PaymentErrorCode | null;
/**
 * Format error for logging
 */
export declare function formatError(error: Error): string;
export { PaymentError as AgenticPaymentError };
export { PaymentError as CryptoError };
export { PaymentError as ValidationError };
export { PaymentError as ConsensusError };
export { PaymentError as SystemError };
export { PaymentError as WasmInitError };
export { PaymentErrorCode as ErrorCode };
//# sourceMappingURL=errors.d.ts.map