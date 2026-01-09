"use strict";
/**
 * Claims Application Layer
 *
 * Exports application services for the claims module:
 * - ClaimService: Core claiming, releasing, and handoff operations
 * - LoadBalancer: Work distribution and rebalancing across the swarm
 * - WorkStealingService: Idle agent work acquisition
 *
 * @module v3/claims/application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkStealingService = exports.InMemoryWorkStealingEventBus = exports.WorkStealingService = exports.createLoadBalancer = exports.LoadBalancer = exports.ClaimService = void 0;
// Core claim service
var claim_service_js_1 = require("./claim-service.js");
Object.defineProperty(exports, "ClaimService", { enumerable: true, get: function () { return claim_service_js_1.ClaimService; } });
// Load Balancing Service
var load_balancer_js_1 = require("./load-balancer.js");
Object.defineProperty(exports, "LoadBalancer", { enumerable: true, get: function () { return load_balancer_js_1.LoadBalancer; } });
Object.defineProperty(exports, "createLoadBalancer", { enumerable: true, get: function () { return load_balancer_js_1.createLoadBalancer; } });
// Work Stealing Service
var work_stealing_service_js_1 = require("./work-stealing-service.js");
Object.defineProperty(exports, "WorkStealingService", { enumerable: true, get: function () { return work_stealing_service_js_1.WorkStealingService; } });
Object.defineProperty(exports, "InMemoryWorkStealingEventBus", { enumerable: true, get: function () { return work_stealing_service_js_1.InMemoryWorkStealingEventBus; } });
Object.defineProperty(exports, "createWorkStealingService", { enumerable: true, get: function () { return work_stealing_service_js_1.createWorkStealingService; } });
//# sourceMappingURL=index.js.map