/**
 * Consensus verification MCP tools
 */
import type { ToolResult, VerifyConsensusArgs } from './types.js';
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
export declare function verifyConsensusTool(args: VerifyConsensusArgs): Promise<ToolResult>;
//# sourceMappingURL=consensus.d.ts.map