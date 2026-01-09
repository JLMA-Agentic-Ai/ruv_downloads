"use strict";
/**
 * @claude-flow/claims (ADR-016)
 *
 * Issue claiming and handoff management for human and agent collaboration.
 *
 * Features:
 * - Issue claiming and releasing
 * - Human-to-agent and agent-to-agent handoffs
 * - Status tracking and updates (active, paused, handoff-pending, review-requested, blocked, stealable, completed)
 * - Auto-management (expiration, auto-assignment)
 * - Work stealing with contest windows
 * - Load balancing and swarm rebalancing
 * - Full event sourcing (ADR-007)
 *
 * MCP Tools (17 total):
 * - Core Claiming (7): claim, release, handoff, status_update, list_available, list_mine, board
 * - Work Stealing (4): mark_stealable, steal, get_stealable, contest_steal
 * - Load Balancing (3): agent_load_info, swarm_rebalance, swarm_load_overview
 * - Additional (3): claim_history, claim_metrics, claim_config
 *
 * ADR-016 Types:
 * - ClaimStatus: active | paused | handoff-pending | review-requested | blocked | stealable | completed
 * - ClaimantType: human | agent
 * - StealReason: timeout | overloaded | blocked | voluntary | rebalancing | abandoned | priority-change
 * - HandoffReason: capacity | expertise | shift-change | escalation | voluntary | rebalancing
 *
 * @module v3/claims
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClaimsToolByName = exports.getClaimsToolsByCategory = exports.registerClaimsTools = exports.claimConfigTool = exports.claimMetricsTool = exports.claimHistoryTool = exports.swarmLoadOverviewTool = exports.swarmRebalanceTool = exports.agentLoadInfoTool = exports.issueContestStealTool = exports.issueGetStealableTool = exports.issueStealTool = exports.issueMarkStealableTool = exports.issueBoardTool = exports.issueListMineTool = exports.issueListAvailableTool = exports.issueStatusUpdateTool = exports.issueHandoffTool = exports.issueReleaseTool = exports.issueClaimTool = exports.additionalClaimsTools = exports.loadBalancingTools = exports.workStealingTools = exports.coreClaimingTools = exports.claimsTools = void 0;
// Domain layer - Types, Events, Rules, Repositories
__exportStar(require("./domain/index.js"), exports);
// Application layer - Services
__exportStar(require("./application/index.js"), exports);
// Infrastructure layer - Persistence
__exportStar(require("./infrastructure/index.js"), exports);
// API layer - MCP Tools
var mcp_tools_js_1 = require("./api/mcp-tools.js");
// All tools collection
Object.defineProperty(exports, "claimsTools", { enumerable: true, get: function () { return mcp_tools_js_1.claimsTools; } });
// Tool categories
Object.defineProperty(exports, "coreClaimingTools", { enumerable: true, get: function () { return mcp_tools_js_1.coreClaimingTools; } });
Object.defineProperty(exports, "workStealingTools", { enumerable: true, get: function () { return mcp_tools_js_1.workStealingTools; } });
Object.defineProperty(exports, "loadBalancingTools", { enumerable: true, get: function () { return mcp_tools_js_1.loadBalancingTools; } });
Object.defineProperty(exports, "additionalClaimsTools", { enumerable: true, get: function () { return mcp_tools_js_1.additionalClaimsTools; } });
// Core Claiming Tools (7)
Object.defineProperty(exports, "issueClaimTool", { enumerable: true, get: function () { return mcp_tools_js_1.issueClaimTool; } });
Object.defineProperty(exports, "issueReleaseTool", { enumerable: true, get: function () { return mcp_tools_js_1.issueReleaseTool; } });
Object.defineProperty(exports, "issueHandoffTool", { enumerable: true, get: function () { return mcp_tools_js_1.issueHandoffTool; } });
Object.defineProperty(exports, "issueStatusUpdateTool", { enumerable: true, get: function () { return mcp_tools_js_1.issueStatusUpdateTool; } });
Object.defineProperty(exports, "issueListAvailableTool", { enumerable: true, get: function () { return mcp_tools_js_1.issueListAvailableTool; } });
Object.defineProperty(exports, "issueListMineTool", { enumerable: true, get: function () { return mcp_tools_js_1.issueListMineTool; } });
Object.defineProperty(exports, "issueBoardTool", { enumerable: true, get: function () { return mcp_tools_js_1.issueBoardTool; } });
// Work Stealing Tools (4)
Object.defineProperty(exports, "issueMarkStealableTool", { enumerable: true, get: function () { return mcp_tools_js_1.issueMarkStealableTool; } });
Object.defineProperty(exports, "issueStealTool", { enumerable: true, get: function () { return mcp_tools_js_1.issueStealTool; } });
Object.defineProperty(exports, "issueGetStealableTool", { enumerable: true, get: function () { return mcp_tools_js_1.issueGetStealableTool; } });
Object.defineProperty(exports, "issueContestStealTool", { enumerable: true, get: function () { return mcp_tools_js_1.issueContestStealTool; } });
// Load Balancing Tools (3)
Object.defineProperty(exports, "agentLoadInfoTool", { enumerable: true, get: function () { return mcp_tools_js_1.agentLoadInfoTool; } });
Object.defineProperty(exports, "swarmRebalanceTool", { enumerable: true, get: function () { return mcp_tools_js_1.swarmRebalanceTool; } });
Object.defineProperty(exports, "swarmLoadOverviewTool", { enumerable: true, get: function () { return mcp_tools_js_1.swarmLoadOverviewTool; } });
// Additional Tools (3)
Object.defineProperty(exports, "claimHistoryTool", { enumerable: true, get: function () { return mcp_tools_js_1.claimHistoryTool; } });
Object.defineProperty(exports, "claimMetricsTool", { enumerable: true, get: function () { return mcp_tools_js_1.claimMetricsTool; } });
Object.defineProperty(exports, "claimConfigTool", { enumerable: true, get: function () { return mcp_tools_js_1.claimConfigTool; } });
// Utility functions
Object.defineProperty(exports, "registerClaimsTools", { enumerable: true, get: function () { return mcp_tools_js_1.registerClaimsTools; } });
Object.defineProperty(exports, "getClaimsToolsByCategory", { enumerable: true, get: function () { return mcp_tools_js_1.getClaimsToolsByCategory; } });
Object.defineProperty(exports, "getClaimsToolByName", { enumerable: true, get: function () { return mcp_tools_js_1.getClaimsToolByName; } });
//# sourceMappingURL=index.js.map