/**
 * Consensus verification MCP tools
 */
import { VerificationSystemBuilder } from '../../verification.js';
import { AgentIdentity } from '../../identity.js';
/**
 * Verify payment signature with multi-agent Byzantine consensus
 *
 * Implements cryptographic multi-agent verification where:
 * - Each agent independently verifies the signature
 * - Consensus threshold determines approval (e.g., 13 of 20 agents = 65%)
 * - Byzantine fault tolerance: system remains secure even if f < n/3 agents are compromised
 *
 * Example: $50K vendor contract with 20 agents (procurement, finance, legal, audit, etc.)
 * - Requires 13 signatures (65% consensus)
 * - Can tolerate up to 6 compromised agents (7 would be 35% < required 65%)
 * - No single agent or small group can authorize fraudulent transactions
 */
export async function verifyConsensusTool(args) {
    try {
        const { message, signature, public_key, agent_public_keys, consensus_threshold = 0.67, } = args;
        // Decode inputs from hex strings
        const messageBytes = Buffer.from(message, 'hex');
        const signatureBytes = Buffer.from(signature, 'hex');
        const publicKeyBytes = Buffer.from(public_key, 'hex');
        // Create agent identities from public keys
        const agents = [];
        for (const agentPubKey of agent_public_keys) {
            const agentPubKeyBytes = Buffer.from(agentPubKey, 'hex');
            // Create identity with public key only (no private key for verification)
            const identity = await AgentIdentity.fromPublicKey(agentPubKeyBytes);
            agents.push(identity);
        }
        if (agents.length === 0) {
            return {
                success: false,
                error: 'No agents provided for consensus verification',
            };
        }
        // Calculate minimum required agents based on threshold
        const minRequired = Math.ceil(agents.length * consensus_threshold);
        // Build verification system with Byzantine fault tolerance
        const system = new VerificationSystemBuilder()
            .consensusThreshold(consensus_threshold)
            .minAgents(minRequired)
            .maxAgents(agents.length)
            .timeout(5000)
            .parallel(true) // Parallel verification for performance
            .addAgents(agents)
            .build();
        // Verify with multi-agent consensus
        const result = await system.verifyWithConsensus(signatureBytes, messageBytes, publicKeyBytes);
        // Return detailed consensus results
        return {
            success: true,
            verified: result.isValid,
            consensus_reached: result.consensusReached,
            votes_for: result.votesFor,
            votes_against: result.votesAgainst,
            total_votes: result.totalVotes,
            consensus_percentage: Math.round(result.consensusPercentage * 100),
            threshold_percentage: Math.round(consensus_threshold * 100),
            required_votes: minRequired,
            agent_count: agents.length,
            total_latency_ms: result.totalLatencyMs,
            avg_latency_ms: Math.round(result.avgLatencyMs * 100) / 100,
            agent_votes: result.agentVotes.map(v => ({
                agent_id: v.agentId,
                vote: v.vote ? 'approve' : 'reject',
                timestamp: v.timestamp,
                latency_ms: v.latencyMs,
            })),
            byzantine_fault_tolerance: {
                max_compromised_agents: Math.floor(agents.length / 3) - 1,
                security_margin: result.votesFor - minRequired,
                is_byzantine_secure: result.votesFor >= minRequired,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
//# sourceMappingURL=consensus.js.map