/**
 * Mandate-related MCP tools
 */
import type { ToolResult, CreateActiveMandateArgs, SignMandateArgs, VerifyMandateArgs, RevokeMandateArgs } from './types.js';
/**
 * Create a new Active Mandate
 */
export declare function createActiveMandateTool(args: CreateActiveMandateArgs): Promise<ToolResult>;
/**
 * Sign a mandate with Ed25519 private key
 *
 * ⚠️ SECURITY WARNING: This tool accepts private keys as arguments.
 * Only use this in development/testing environments.
 *
 * For production deployments:
 * - Use Hardware Security Modules (HSM) or Key Management Services (KMS)
 * - Sign mandates in secure enclaves (AWS KMS, Azure Key Vault, Google Cloud KMS)
 * - Never transmit private keys over network connections
 * - Never log or store private keys in plaintext
 * - Implement proper key rotation policies
 *
 * The MCP protocol may log tool arguments. Private keys transmitted through
 * this tool could be exposed in:
 * - MCP server logs
 * - Network traffic (stdio/HTTP transport)
 * - Client-side history
 * - Debug output
 */
export declare function signMandateTool(args: SignMandateArgs): Promise<ToolResult>;
/**
 * Verify mandate signature and execution guards
 */
export declare function verifyMandateTool(args: VerifyMandateArgs): Promise<ToolResult>;
/**
 * Revoke a mandate by ID
 */
export declare function revokeMandateTool(args: RevokeMandateArgs): Promise<ToolResult>;
/**
 * List all revoked mandates
 */
export declare function listRevocationsTool(): Promise<ToolResult>;
/**
 * Get mandate information
 *
 * Note: Active Mandates are stateless by design - they are cryptographic objects
 * that can be created, signed, and verified without central storage. This library
 * provides the cryptographic primitives, but does not implement storage.
 *
 * To integrate mandate storage:
 * 1. Store signed mandates in your application database after creation
 * 2. Index by mandate_id for quick retrieval
 * 3. Check revocation list before authorizing payments
 * 4. Implement your own getMandateInfo that queries your storage
 *
 * Example storage implementations:
 * - PostgreSQL with JSONB columns for mandate bodies
 * - Redis for high-performance caching
 * - IPFS for decentralized storage
 * - Blockchain for immutable audit trails
 */
export declare function getMandateInfoTool(args: {
    mandate_id: string;
}): Promise<ToolResult>;
//# sourceMappingURL=mandate.d.ts.map