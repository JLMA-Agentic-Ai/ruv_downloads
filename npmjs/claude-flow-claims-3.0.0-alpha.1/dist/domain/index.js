"use strict";
/**
 * Claims Domain Layer (ADR-016)
 *
 * Exports all domain types, events, rules, and repository interfaces
 * for the issue claiming system.
 *
 * @module v3/claims/domain
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidRepository = exports.isValidExtendedStatus = exports.isValidStatus = exports.isValidPriority = exports.canMoveClaim = exports.needsRebalancing = exports.isAgentUnderloaded = exports.isAgentOverloaded = exports.canRejectHandoff = exports.canAcceptHandoff = exports.canInitiateHandoff = exports.requiresStealContest = exports.canStealClaim = exports.canMarkAsStealable = exports.canTransitionStatus = exports.getExtendedStatusTransitions = exports.getOriginalStatusTransitions = exports.isActiveClaim = exports.isIssueClaimed = exports.canClaimIssue = exports.ruleFailure = exports.ruleSuccess = exports.createAgentUnderloadedExtEvent = exports.createAgentOverloadedExtEvent = exports.createSwarmRebalancedExtEvent = exports.createIssueStolenExtEvent = exports.createIssueMarkedStealableEvent = exports.createReviewCompletedEvent = exports.createReviewRequestedEvent = exports.createHandoffRejectedEvent = exports.createHandoffAcceptedEvent = exports.createHandoffRequestedEvent = exports.createClaimNoteAddedEvent = exports.createClaimStatusChangedEvent = exports.createClaimExpiredEvent = exports.createClaimReleasedEvent = exports.createClaimCreatedEvent = exports.DEFAULT_LOAD_BALANCING_CONFIG = exports.DEFAULT_WORK_STEALING_CONFIG = exports.ClaimOperationError = exports.getValidStatusTransitions = exports.isActiveClaimStatus = exports.generateClaimId = exports.durationToMs = void 0;
var types_js_1 = require("./types.js");
// Utility functions
Object.defineProperty(exports, "durationToMs", { enumerable: true, get: function () { return types_js_1.durationToMs; } });
Object.defineProperty(exports, "generateClaimId", { enumerable: true, get: function () { return types_js_1.generateClaimId; } });
Object.defineProperty(exports, "isActiveClaimStatus", { enumerable: true, get: function () { return types_js_1.isActiveClaimStatus; } });
Object.defineProperty(exports, "getValidStatusTransitions", { enumerable: true, get: function () { return types_js_1.getValidStatusTransitions; } });
// Classes
Object.defineProperty(exports, "ClaimOperationError", { enumerable: true, get: function () { return types_js_1.ClaimOperationError; } });
// Constants
Object.defineProperty(exports, "DEFAULT_WORK_STEALING_CONFIG", { enumerable: true, get: function () { return types_js_1.DEFAULT_WORK_STEALING_CONFIG; } });
Object.defineProperty(exports, "DEFAULT_LOAD_BALANCING_CONFIG", { enumerable: true, get: function () { return types_js_1.DEFAULT_LOAD_BALANCING_CONFIG; } });
var events_js_1 = require("./events.js");
// Event factory functions
Object.defineProperty(exports, "createClaimCreatedEvent", { enumerable: true, get: function () { return events_js_1.createClaimCreatedEvent; } });
Object.defineProperty(exports, "createClaimReleasedEvent", { enumerable: true, get: function () { return events_js_1.createClaimReleasedEvent; } });
Object.defineProperty(exports, "createClaimExpiredEvent", { enumerable: true, get: function () { return events_js_1.createClaimExpiredEvent; } });
Object.defineProperty(exports, "createClaimStatusChangedEvent", { enumerable: true, get: function () { return events_js_1.createClaimStatusChangedEvent; } });
Object.defineProperty(exports, "createClaimNoteAddedEvent", { enumerable: true, get: function () { return events_js_1.createClaimNoteAddedEvent; } });
Object.defineProperty(exports, "createHandoffRequestedEvent", { enumerable: true, get: function () { return events_js_1.createHandoffRequestedEvent; } });
Object.defineProperty(exports, "createHandoffAcceptedEvent", { enumerable: true, get: function () { return events_js_1.createHandoffAcceptedEvent; } });
Object.defineProperty(exports, "createHandoffRejectedEvent", { enumerable: true, get: function () { return events_js_1.createHandoffRejectedEvent; } });
Object.defineProperty(exports, "createReviewRequestedEvent", { enumerable: true, get: function () { return events_js_1.createReviewRequestedEvent; } });
Object.defineProperty(exports, "createReviewCompletedEvent", { enumerable: true, get: function () { return events_js_1.createReviewCompletedEvent; } });
// ADR-016 extended event factories
Object.defineProperty(exports, "createIssueMarkedStealableEvent", { enumerable: true, get: function () { return events_js_1.createIssueMarkedStealableEvent; } });
Object.defineProperty(exports, "createIssueStolenExtEvent", { enumerable: true, get: function () { return events_js_1.createIssueStolenExtEvent; } });
Object.defineProperty(exports, "createSwarmRebalancedExtEvent", { enumerable: true, get: function () { return events_js_1.createSwarmRebalancedExtEvent; } });
Object.defineProperty(exports, "createAgentOverloadedExtEvent", { enumerable: true, get: function () { return events_js_1.createAgentOverloadedExtEvent; } });
Object.defineProperty(exports, "createAgentUnderloadedExtEvent", { enumerable: true, get: function () { return events_js_1.createAgentUnderloadedExtEvent; } });
var rules_js_1 = require("./rules.js");
// Result helpers
Object.defineProperty(exports, "ruleSuccess", { enumerable: true, get: function () { return rules_js_1.ruleSuccess; } });
Object.defineProperty(exports, "ruleFailure", { enumerable: true, get: function () { return rules_js_1.ruleFailure; } });
// Claim eligibility rules
Object.defineProperty(exports, "canClaimIssue", { enumerable: true, get: function () { return rules_js_1.canClaimIssue; } });
Object.defineProperty(exports, "isIssueClaimed", { enumerable: true, get: function () { return rules_js_1.isIssueClaimed; } });
Object.defineProperty(exports, "isActiveClaim", { enumerable: true, get: function () { return rules_js_1.isActiveClaim; } });
Object.defineProperty(exports, "getOriginalStatusTransitions", { enumerable: true, get: function () { return rules_js_1.getOriginalStatusTransitions; } });
Object.defineProperty(exports, "getExtendedStatusTransitions", { enumerable: true, get: function () { return rules_js_1.getExtendedStatusTransitions; } });
Object.defineProperty(exports, "canTransitionStatus", { enumerable: true, get: function () { return rules_js_1.canTransitionStatus; } });
// Work stealing rules
Object.defineProperty(exports, "canMarkAsStealable", { enumerable: true, get: function () { return rules_js_1.canMarkAsStealable; } });
Object.defineProperty(exports, "canStealClaim", { enumerable: true, get: function () { return rules_js_1.canStealClaim; } });
Object.defineProperty(exports, "requiresStealContest", { enumerable: true, get: function () { return rules_js_1.requiresStealContest; } });
// Handoff rules
Object.defineProperty(exports, "canInitiateHandoff", { enumerable: true, get: function () { return rules_js_1.canInitiateHandoff; } });
Object.defineProperty(exports, "canAcceptHandoff", { enumerable: true, get: function () { return rules_js_1.canAcceptHandoff; } });
Object.defineProperty(exports, "canRejectHandoff", { enumerable: true, get: function () { return rules_js_1.canRejectHandoff; } });
// Load balancing rules
Object.defineProperty(exports, "isAgentOverloaded", { enumerable: true, get: function () { return rules_js_1.isAgentOverloaded; } });
Object.defineProperty(exports, "isAgentUnderloaded", { enumerable: true, get: function () { return rules_js_1.isAgentUnderloaded; } });
Object.defineProperty(exports, "needsRebalancing", { enumerable: true, get: function () { return rules_js_1.needsRebalancing; } });
Object.defineProperty(exports, "canMoveClaim", { enumerable: true, get: function () { return rules_js_1.canMoveClaim; } });
// Validation rules
Object.defineProperty(exports, "isValidPriority", { enumerable: true, get: function () { return rules_js_1.isValidPriority; } });
Object.defineProperty(exports, "isValidStatus", { enumerable: true, get: function () { return rules_js_1.isValidStatus; } });
Object.defineProperty(exports, "isValidExtendedStatus", { enumerable: true, get: function () { return rules_js_1.isValidExtendedStatus; } });
Object.defineProperty(exports, "isValidRepository", { enumerable: true, get: function () { return rules_js_1.isValidRepository; } });
//# sourceMappingURL=index.js.map