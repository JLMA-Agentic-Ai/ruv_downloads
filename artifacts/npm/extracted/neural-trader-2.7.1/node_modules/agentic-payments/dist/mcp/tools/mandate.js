/**
 * Mandate-related MCP tools
 */
import { v4 as uuidv4 } from 'uuid';
import { validateAndVerify, guardExecution, revoke, getAllRevocations, signWithTweetnacl, getPublicKeyBase64, } from '../../active-mandate/index.js';
/**
 * Create a new Active Mandate
 */
export async function createActiveMandateTool(args) {
    try {
        const mandate = {
            mandate_id: `mandate_${uuidv4()}`,
            kind: args.kind,
            agent: args.agent,
            holder: args.holder,
            cap: {
                amount: args.amount,
                currency: args.currency,
                period: args.period,
            },
            expires_at: args.expires_at || new Date(Date.now() + 86400000).toISOString(),
            ...(args.merchant_allow && { merchant_allow: args.merchant_allow }),
            ...(args.merchant_block && { merchant_block: args.merchant_block }),
        };
        return {
            success: true,
            mandate,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
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
export async function signMandateTool(args) {
    try {
        const { mandate, private_key } = args;
        // Parse private key from hex
        const keyHex = private_key.replace(/^0x/, '');
        const privateKeyBytes = new Uint8Array(keyHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
        if (privateKeyBytes.length !== 64) {
            throw new Error('Private key must be 64 bytes (128 hex characters)');
        }
        // Sign mandate
        const signature = signWithTweetnacl(mandate, privateKeyBytes);
        const publicKey = getPublicKeyBase64(privateKeyBytes);
        const signedMandate = {
            alg: 'ed25519',
            pubkey: publicKey,
            signature,
            payload: mandate,
        };
        return {
            success: true,
            signed_mandate: signedMandate,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
/**
 * Verify mandate signature and execution guards
 */
export async function verifyMandateTool(args) {
    try {
        const { signed_mandate, check_guards = true } = args;
        // Verify signature
        const result = validateAndVerify(signed_mandate);
        if (!result.valid) {
            return {
                success: false,
                valid: false,
                reason: result.reason,
            };
        }
        // Check execution guards if requested
        let guard = { allowed: true };
        if (check_guards && result.parsed) {
            guard = guardExecution(result.parsed);
        }
        return {
            success: true,
            valid: true,
            signature_valid: true,
            execution_allowed: guard.allowed,
            reason: guard.allowed ? undefined : guard.reason,
            mandate: result.parsed?.payload,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
/**
 * Revoke a mandate by ID
 */
export async function revokeMandateTool(args) {
    try {
        const { mandate_id, reason } = args;
        const revocation = revoke(mandate_id, reason);
        return {
            success: true,
            revocation,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
/**
 * List all revoked mandates
 */
export async function listRevocationsTool() {
    try {
        const revocations = getAllRevocations();
        return {
            success: true,
            count: revocations.length,
            revocations,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
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
export async function getMandateInfoTool(args) {
    try {
        const { mandate_id } = args;
        return {
            success: false,
            mandate_id,
            error: 'Mandate storage not implemented - this library is stateless',
            message: `Active Mandates are cryptographic objects that don't require central storage.
To retrieve mandate information:
1. Implement storage in your application (database, cache, IPFS, etc.)
2. Store signed mandates after creation with create_active_mandate
3. Query your storage by mandate_id when needed
4. Verify signatures with verify_mandate before authorizing payments

Example mandate storage schema:
{
  "mandate_id": "mandate_uuid",
  "signed_mandate": { /* SignedMandate object */ },
  "created_at": "2025-01-15T10:00:00Z",
  "last_used": "2025-01-20T15:30:00Z",
  "total_spent": 0,
  "is_revoked": false
}`,
            architecture: 'stateless',
            storage_options: [
                'PostgreSQL (JSONB)',
                'Redis (caching)',
                'IPFS (decentralized)',
                'Blockchain (immutable)',
                'Application in-memory',
            ],
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
//# sourceMappingURL=mandate.js.map