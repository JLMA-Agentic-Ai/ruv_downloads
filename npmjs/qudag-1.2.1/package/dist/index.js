"use strict";
/**
 * QuDAG NPM Package Main Module
 * Provides programmatic access to QuDAG functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuDAG = exports.getPlatformInfo = exports.getBinaryPath = exports.ensureBinary = void 0;
exports.execute = execute;
exports.isInstalled = isInstalled;
const child_process_1 = require("child_process");
const binary_manager_1 = require("./binary-manager");
Object.defineProperty(exports, "ensureBinary", { enumerable: true, get: function () { return binary_manager_1.ensureBinary; } });
Object.defineProperty(exports, "getBinaryPath", { enumerable: true, get: function () { return binary_manager_1.getBinaryPath; } });
Object.defineProperty(exports, "getPlatformInfo", { enumerable: true, get: function () { return binary_manager_1.getPlatformInfo; } });
/**
 * Execute a QuDAG command
 */
async function execute(args, options) {
    // Ensure binary is available
    await (0, binary_manager_1.ensureBinary)();
    const binaryPath = (0, binary_manager_1.getBinaryPath)();
    return new Promise((resolve, reject) => {
        const stdout = [];
        const stderr = [];
        const child = (0, child_process_1.spawn)(binaryPath, args, {
            ...options,
            stdio: options?.stdio || 'pipe'
        });
        if (child.stdout) {
            child.stdout.on('data', (data) => {
                stdout.push(data.toString());
            });
        }
        if (child.stderr) {
            child.stderr.on('data', (data) => {
                stderr.push(data.toString());
            });
        }
        child.on('error', reject);
        child.on('exit', (code) => {
            resolve({
                code: code || 0,
                stdout: stdout.join(''),
                stderr: stderr.join('')
            });
        });
    });
}
/**
 * QuDAG CLI wrapper class for programmatic usage
 */
class QuDAG {
    /**
     * Start a QuDAG node
     */
    static async start(port) {
        const args = ['start'];
        if (port) {
            args.push('--port', port.toString());
        }
        return execute(args);
    }
    /**
     * Stop the QuDAG node
     */
    static async stop() {
        return execute(['stop']);
    }
    /**
     * Get node status
     */
    static async status() {
        return execute(['status']);
    }
    /**
     * List peers
     */
    static async listPeers() {
        return execute(['peer', 'list']);
    }
    /**
     * Add a peer
     */
    static async addPeer(address) {
        return execute(['peer', 'add', address]);
    }
    /**
     * Register a dark address
     */
    static async registerAddress(domain) {
        return execute(['address', 'register', domain]);
    }
    /**
     * Resolve a dark address
     */
    static async resolveAddress(domain) {
        return execute(['address', 'resolve', domain]);
    }
    /**
     * Generate a shadow address
     */
    static async generateShadowAddress(ttl) {
        const args = ['address', 'shadow'];
        if (ttl) {
            args.push('--ttl', ttl.toString());
        }
        return execute(args);
    }
    /**
     * Create a quantum fingerprint
     */
    static async createFingerprint(data) {
        return execute(['address', 'fingerprint', '--data', data]);
    }
    /**
     * Execute a raw command
     */
    static async raw(args) {
        return execute(args);
    }
}
exports.QuDAG = QuDAG;
/**
 * Check if QuDAG binary is installed
 */
function isInstalled() {
    const binaryPath = (0, binary_manager_1.getBinaryPath)();
    try {
        require('fs').accessSync(binaryPath, require('fs').constants.X_OK);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=index.js.map