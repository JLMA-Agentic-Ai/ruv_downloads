"use strict";
/**
 * Core module exports
 *
 * These wrappers provide safe, type-flexible interfaces to the underlying
 * native packages, handling array type conversions automatically.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sona = exports.agentdbFast = exports.attentionFallbacks = exports.gnnWrapper = void 0;
__exportStar(require("./gnn-wrapper"), exports);
__exportStar(require("./attention-fallbacks"), exports);
__exportStar(require("./agentdb-fast"), exports);
__exportStar(require("./sona-wrapper"), exports);
// Re-export default objects for convenience
var gnn_wrapper_1 = require("./gnn-wrapper");
Object.defineProperty(exports, "gnnWrapper", { enumerable: true, get: function () { return __importDefault(gnn_wrapper_1).default; } });
var attention_fallbacks_1 = require("./attention-fallbacks");
Object.defineProperty(exports, "attentionFallbacks", { enumerable: true, get: function () { return __importDefault(attention_fallbacks_1).default; } });
var agentdb_fast_1 = require("./agentdb-fast");
Object.defineProperty(exports, "agentdbFast", { enumerable: true, get: function () { return __importDefault(agentdb_fast_1).default; } });
var sona_wrapper_1 = require("./sona-wrapper");
Object.defineProperty(exports, "Sona", { enumerable: true, get: function () { return __importDefault(sona_wrapper_1).default; } });
