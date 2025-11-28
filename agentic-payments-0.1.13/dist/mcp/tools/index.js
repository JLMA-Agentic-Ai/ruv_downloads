/**
 * MCP Tools Registry
 * Central registry and router for all MCP tools
 */
import { createActiveMandateTool, signMandateTool, verifyMandateTool, revokeMandateTool, listRevocationsTool, getMandateInfoTool, } from './mandate.js';
import { generateAgentIdentityTool } from './agent.js';
import { verifyConsensusTool } from './consensus.js';
import { createIntentMandateTool, createCartMandateTool, } from './payment.js';
/**
 * Register all available MCP tools
 *
 * Returns an array of tool definitions following the MCP specification.
 * Each tool includes a name, description, and JSON Schema for input validation.
 *
 * @returns Array of tool definitions
 */
export function registerTools() {
    return [
        {
            name: 'create_active_mandate',
            description: 'Create a new Active Mandate for autonomous agent payment authorization with spend caps, time windows, and merchant restrictions',
            inputSchema: {
                type: 'object',
                properties: {
                    agent: {
                        type: 'string',
                        description: 'Agent identifier (e.g., "shopping-bot@agentics")',
                    },
                    holder: {
                        type: 'string',
                        description: 'Holder/user identifier',
                    },
                    amount: {
                        type: 'integer',
                        description: 'Spend cap amount in minor units (e.g., 12000 = $120.00)',
                    },
                    currency: {
                        type: 'string',
                        description: 'Currency code (ISO 4217)',
                        default: 'USD',
                    },
                    period: {
                        type: 'string',
                        enum: ['single', 'daily', 'weekly', 'monthly'],
                        description: 'Spend period for the cap',
                    },
                    kind: {
                        type: 'string',
                        enum: ['intent', 'cart'],
                        description: 'Mandate kind',
                    },
                    merchant_allow: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Array of allowed merchant hostnames',
                    },
                    merchant_block: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Array of blocked merchant hostnames',
                    },
                    expires_at: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Expiration timestamp (ISO8601)',
                    },
                },
                required: ['agent', 'holder', 'amount', 'currency', 'period', 'kind'],
            },
        },
        {
            name: 'sign_mandate',
            description: 'Sign a payment mandate with Ed25519 to create cryptographic proof of authorization',
            inputSchema: {
                type: 'object',
                properties: {
                    mandate: {
                        type: 'object',
                        description: 'Mandate object to sign',
                    },
                    private_key: {
                        type: 'string',
                        description: 'Ed25519 private key (64-byte hex string)',
                    },
                },
                required: ['mandate', 'private_key'],
            },
        },
        {
            name: 'verify_mandate',
            description: "Verify an Active Mandate's Ed25519 signature and check execution guards (time windows, revocation)",
            inputSchema: {
                type: 'object',
                properties: {
                    signed_mandate: {
                        type: 'object',
                        description: 'Signed mandate to verify',
                    },
                    check_guards: {
                        type: 'boolean',
                        description: 'Also check execution guards (expiration, revocation)',
                        default: true,
                    },
                },
                required: ['signed_mandate'],
            },
        },
        {
            name: 'revoke_mandate',
            description: 'Revoke an Active Mandate by ID, preventing further execution',
            inputSchema: {
                type: 'object',
                properties: {
                    mandate_id: {
                        type: 'string',
                        description: 'Mandate ID to revoke',
                    },
                    reason: {
                        type: 'string',
                        description: 'Reason for revocation',
                    },
                },
                required: ['mandate_id'],
            },
        },
        {
            name: 'list_revocations',
            description: 'List all revoked mandates with their revocation timestamps and reasons',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'generate_agent_identity',
            description: 'Generate a new agent identity with Ed25519 keypair for payment authorization',
            inputSchema: {
                type: 'object',
                properties: {
                    include_private_key: {
                        type: 'boolean',
                        description: 'Include private key in response (use with caution)',
                        default: false,
                    },
                },
            },
        },
        {
            name: 'create_intent_mandate',
            description: 'Create an intent-based payment mandate for high-level purchase authorization',
            inputSchema: {
                type: 'object',
                properties: {
                    merchant_id: { type: 'string', description: 'Merchant identifier' },
                    customer_id: { type: 'string', description: 'Customer identifier' },
                    intent: { type: 'string', description: 'Purchase intent description' },
                    max_amount: { type: 'number', description: 'Maximum amount (major currency units)' },
                    currency: { type: 'string', description: 'Currency code', default: 'USD' },
                    expires_at: { type: 'integer', description: 'Unix timestamp for expiration' },
                },
                required: ['merchant_id', 'customer_id', 'intent', 'max_amount'],
            },
        },
        {
            name: 'create_cart_mandate',
            description: 'Create a cart-based payment mandate with specific line items for approval',
            inputSchema: {
                type: 'object',
                properties: {
                    merchant_id: { type: 'string', description: 'Merchant identifier' },
                    customer_id: { type: 'string', description: 'Customer identifier' },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                quantity: { type: 'integer' },
                                unit_price: { type: 'integer', description: 'Price in minor units' },
                            },
                            required: ['id', 'name', 'quantity', 'unit_price'],
                        },
                        description: 'Shopping cart line items',
                    },
                    currency: { type: 'string', default: 'USD' },
                },
                required: ['merchant_id', 'customer_id', 'items'],
            },
        },
        {
            name: 'verify_consensus',
            description: 'Verify a payment signature using multi-agent Byzantine fault-tolerant consensus',
            inputSchema: {
                type: 'object',
                properties: {
                    message: { type: 'string', description: 'Message that was signed (base64 encoded)' },
                    signature: { type: 'string', description: 'Signature to verify (base64 encoded)' },
                    public_key: { type: 'string', description: 'Public key (base64 encoded)' },
                    agent_public_keys: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Array of agent public keys for consensus pool',
                    },
                    consensus_threshold: {
                        type: 'number',
                        description: 'Consensus threshold (0-1, e.g., 0.67 for 67%)',
                        default: 0.67,
                    },
                },
                required: ['message', 'signature', 'public_key', 'agent_public_keys'],
            },
        },
        {
            name: 'get_mandate_info',
            description: 'Get detailed information about an Active Mandate including status, spend limits, and merchant rules',
            inputSchema: {
                type: 'object',
                properties: {
                    mandate_id: { type: 'string', description: 'Mandate ID to query' },
                },
                required: ['mandate_id'],
            },
        },
    ];
}
/**
 * Get tool handler by name
 *
 * Routes tool calls to the appropriate handler function.
 * Returns null if the tool name is not recognized.
 *
 * @param name - Tool name
 * @returns Tool handler function or null
 */
export function getToolHandler(name) {
    const handlers = {
        create_active_mandate: createActiveMandateTool,
        sign_mandate: signMandateTool,
        verify_mandate: verifyMandateTool,
        revoke_mandate: revokeMandateTool,
        list_revocations: listRevocationsTool,
        generate_agent_identity: generateAgentIdentityTool,
        create_intent_mandate: createIntentMandateTool,
        create_cart_mandate: createCartMandateTool,
        verify_consensus: verifyConsensusTool,
        get_mandate_info: getMandateInfoTool,
    };
    return handlers[name] || null;
}
/**
 * Execute a tool by name with arguments
 *
 * Convenience function that finds and executes a tool handler.
 * Throws an error if the tool is not found.
 *
 * @param name - Tool name
 * @param args - Tool arguments
 * @returns Tool execution result
 */
export async function executeTool(name, args) {
    const handler = getToolHandler(name);
    if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
    }
    try {
        return await handler(args);
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error executing tool',
        };
    }
}
// Export tool implementations
export * from './mandate.js';
export * from './agent.js';
export * from './consensus.js';
export * from './payment.js';
export * from './types.js';
//# sourceMappingURL=index.js.map