/**
 * Error handling system for agentic-payments
 * Pure TypeScript implementation - no WASM dependencies
 */
/**
 * Error codes for payment operations
 */
export var PaymentErrorCode;
(function (PaymentErrorCode) {
    // Cryptographic errors
    PaymentErrorCode["CRYPTO_ERROR"] = "CRYPTO_ERROR";
    PaymentErrorCode["KEY_GENERATION_FAILED"] = "KEY_GENERATION_FAILED";
    PaymentErrorCode["INVALID_KEY_FORMAT"] = "INVALID_KEY_FORMAT";
    PaymentErrorCode["SIGNATURE_FAILED"] = "SIGNATURE_FAILED";
    PaymentErrorCode["VERIFICATION_FAILED"] = "VERIFICATION_FAILED";
    // Consensus errors
    PaymentErrorCode["CONSENSUS_ERROR"] = "CONSENSUS_ERROR";
    PaymentErrorCode["INSUFFICIENT_AGENTS"] = "INSUFFICIENT_AGENTS";
    PaymentErrorCode["CONSENSUS_FAILED"] = "CONSENSUS_FAILED";
    // Validation errors
    PaymentErrorCode["VALIDATION_FAILED"] = "VALIDATION_FAILED";
    PaymentErrorCode["INVALID_MANDATE"] = "INVALID_MANDATE";
    PaymentErrorCode["EXPIRED_MANDATE"] = "EXPIRED_MANDATE";
    PaymentErrorCode["AMOUNT_EXCEEDED"] = "AMOUNT_EXCEEDED";
    // System errors
    PaymentErrorCode["SYSTEM_ERROR"] = "SYSTEM_ERROR";
    PaymentErrorCode["NOT_INITIALIZED"] = "NOT_INITIALIZED";
    PaymentErrorCode["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
})(PaymentErrorCode || (PaymentErrorCode = {}));
/**
 * Base error class for all agentic-payments errors
 */
export class PaymentError extends Error {
    code;
    recoverable;
    context;
    timestamp;
    constructor(code, message, context, recoverable = false) {
        super(message);
        this.name = 'PaymentError';
        this.code = code;
        this.recoverable = recoverable;
        this.context = context;
        this.timestamp = Date.now();
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    /**
     * Convert error to JSON for logging
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            recoverable: this.recoverable,
            context: this.context,
            timestamp: this.timestamp,
            stack: this.stack,
        };
    }
}
/**
 * Check if error is recoverable
 */
export function isRecoverable(error) {
    if (error instanceof PaymentError) {
        return error.recoverable;
    }
    return false;
}
/**
 * Extract error code from error
 */
export function getErrorCode(error) {
    if (error instanceof PaymentError) {
        return error.code;
    }
    return null;
}
/**
 * Format error for logging
 */
export function formatError(error) {
    if (error instanceof PaymentError) {
        return JSON.stringify(error.toJSON(), null, 2);
    }
    return `${error.name}: ${error.message}\n${error.stack}`;
}
// Legacy type aliases for backward compatibility
export { PaymentError as AgenticPaymentError };
export { PaymentError as CryptoError };
export { PaymentError as ValidationError };
export { PaymentError as ConsensusError };
export { PaymentError as SystemError };
export { PaymentError as WasmInitError };
export { PaymentErrorCode as ErrorCode };
//# sourceMappingURL=errors.js.map