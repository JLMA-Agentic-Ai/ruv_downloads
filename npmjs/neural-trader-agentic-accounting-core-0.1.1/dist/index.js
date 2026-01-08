"use strict";
/**
 * Agentic Accounting Core
 *
 * Core business logic and utilities for autonomous accounting
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
exports.version = void 0;
exports.version = '0.1.0';
// Transaction Management
__exportStar(require("./transactions"), exports);
__exportStar(require("./positions"), exports);
__exportStar(require("./integrations"), exports);
// Compliance & Forensics
__exportStar(require("./compliance"), exports);
__exportStar(require("./forensic"), exports);
// Reporting & Tax
__exportStar(require("./reporting"), exports);
__exportStar(require("./tax"), exports);
// Learning & Optimization
__exportStar(require("./learning"), exports);
// Database
__exportStar(require("./database"), exports);
// Utilities
__exportStar(require("./utils"), exports);
//# sourceMappingURL=index.js.map