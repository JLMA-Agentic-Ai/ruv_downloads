/**
 * Agent identity MCP tools
 */
import { AgentIdentity } from '../../identity.js';
/**
 * Generate a new agent identity with Ed25519 keypair
 */
export async function generateAgentIdentityTool(args) {
    try {
        const { include_private_key = false } = args;
        const agent = await AgentIdentity.generate();
        const publicKey = Buffer.from(agent.publicKey()).toString('hex');
        const response = {
            success: true,
            public_key: publicKey,
        };
        if (include_private_key) {
            response.warning =
                'Private key included - handle securely and never log or expose';
            // Note: AgentIdentity class doesn't expose private key directly for security
            // This would need implementation with secure handling in production
            response.private_key_note =
                'Private key access requires secure implementation';
        }
        return response;
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
//# sourceMappingURL=agent.js.map