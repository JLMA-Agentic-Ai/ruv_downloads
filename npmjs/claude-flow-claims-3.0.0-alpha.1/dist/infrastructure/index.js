"use strict";
/**
 * @claude-flow/claims - Infrastructure Layer
 *
 * Exports persistence implementations for the claims module.
 *
 * @module v3/claims/infrastructure
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClaimEventStore = exports.InMemoryClaimEventStore = exports.createClaimRepository = exports.InMemoryClaimRepository = void 0;
// Claim Repository
var claim_repository_js_1 = require("./claim-repository.js");
Object.defineProperty(exports, "InMemoryClaimRepository", { enumerable: true, get: function () { return claim_repository_js_1.InMemoryClaimRepository; } });
Object.defineProperty(exports, "createClaimRepository", { enumerable: true, get: function () { return claim_repository_js_1.createClaimRepository; } });
// Event Store
var event_store_js_1 = require("./event-store.js");
Object.defineProperty(exports, "InMemoryClaimEventStore", { enumerable: true, get: function () { return event_store_js_1.InMemoryClaimEventStore; } });
Object.defineProperty(exports, "createClaimEventStore", { enumerable: true, get: function () { return event_store_js_1.createClaimEventStore; } });
//# sourceMappingURL=index.js.map