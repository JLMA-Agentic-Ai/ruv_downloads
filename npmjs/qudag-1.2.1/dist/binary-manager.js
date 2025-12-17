"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBinaryPath = getBinaryPath;
exports.ensureBinary = ensureBinary;
exports.getPlatformInfo = getPlatformInfo;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const axios_1 = __importDefault(require("axios"));
const tar = __importStar(require("tar"));
const progress_1 = __importDefault(require("progress"));
const fs_1 = require("fs");
const promises_1 = require("stream/promises");
const os_1 = require("os");
// Binary version - should match the Rust crate version
const BINARY_VERSION = 'v1.0.2';
const GITHUB_REPO = 'ruvnet/QuDAG';
// Platform mapping
const PLATFORM_MAP = {
    darwin: 'apple-darwin',
    linux: 'unknown-linux-gnu',
    win32: 'pc-windows-msvc'
};
// Architecture mapping
const ARCH_MAP = {
    x64: 'x86_64',
    arm64: 'aarch64'
};
/**
 * Get the platform-specific binary name
 */
function getBinaryName() {
    return (0, os_1.platform)() === 'win32' ? 'qudag.exe' : 'qudag';
}
/**
 * Get the target triple for the current platform
 */
function getTargetTriple() {
    const platform = (0, os_1.platform)();
    const arch = (0, os_1.arch)();
    const mappedPlatform = PLATFORM_MAP[platform];
    const mappedArch = ARCH_MAP[arch];
    if (!mappedPlatform || !mappedArch) {
        throw new Error(`Unsupported platform: ${platform}-${arch}`);
    }
    return `${mappedArch}-${mappedPlatform}`;
}
/**
 * Get the binary directory path
 */
function getBinaryDir() {
    return path.join(__dirname, '..', 'bin', 'platform');
}
/**
 * Get the binary path for the current platform
 */
function getBinaryPath() {
    const binaryDir = getBinaryDir();
    const binaryName = getBinaryName();
    return path.join(binaryDir, binaryName);
}
/**
 * Check if the binary is already installed
 */
function isBinaryInstalled() {
    const binaryPath = getBinaryPath();
    return fs.existsSync(binaryPath);
}
/**
 * Download the binary for the current platform
 */
async function downloadBinary() {
    const targetTriple = getTargetTriple();
    const binaryName = getBinaryName();
    const archiveName = `qudag-${BINARY_VERSION}-${targetTriple}.tar.gz`;
    // Construct the download URL
    const downloadUrl = `https://github.com/${GITHUB_REPO}/releases/download/${BINARY_VERSION}/${archiveName}`;
    console.log(`Downloading QuDAG binary for ${targetTriple}...`);
    console.log(`URL: ${downloadUrl}`);
    try {
        // Create binary directory
        const binaryDir = getBinaryDir();
        await fs.ensureDir(binaryDir);
        // Download the archive
        const response = await (0, axios_1.default)({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream',
            timeout: 30000,
            headers: {
                'User-Agent': 'qudag-npm'
            }
        });
        const totalLength = parseInt(response.headers['content-length'] || '0', 10);
        // Create progress bar
        const progressBar = new progress_1.default('Downloading [:bar] :percent :etas', {
            width: 40,
            complete: '=',
            incomplete: ' ',
            renderThrottle: 100,
            total: totalLength
        });
        // Update progress
        response.data.on('data', (chunk) => {
            progressBar.tick(chunk.length);
        });
        // Save to temporary file
        const tempFile = path.join(os.tmpdir(), archiveName);
        const writer = (0, fs_1.createWriteStream)(tempFile);
        await (0, promises_1.pipeline)(response.data, writer);
        console.log('\nExtracting binary...');
        // Extract the archive
        await tar.extract({
            file: tempFile,
            cwd: binaryDir,
            filter: (path) => path.endsWith(binaryName)
        });
        // Make the binary executable on Unix-like systems
        if ((0, os_1.platform)() !== 'win32') {
            const binaryPath = getBinaryPath();
            await fs.chmod(binaryPath, 0o755);
        }
        // Clean up temporary file
        await fs.remove(tempFile);
        console.log('QuDAG binary installed successfully!');
    }
    catch (error) {
        if (error.response?.status === 404) {
            throw new Error(`Binary not found for platform ${targetTriple}. ` +
                `Please check if a release exists for your platform at ` +
                `https://github.com/${GITHUB_REPO}/releases`);
        }
        throw new Error(`Failed to download binary: ${error.message}`);
    }
}
/**
 * Ensure the binary is installed, downloading if necessary
 */
async function ensureBinary() {
    if (!isBinaryInstalled()) {
        await downloadBinary();
    }
}
/**
 * Get information about the current platform
 */
function getPlatformInfo() {
    return {
        platform: (0, os_1.platform)(),
        arch: (0, os_1.arch)(),
        targetTriple: getTargetTriple(),
        binaryName: getBinaryName(),
        binaryPath: getBinaryPath()
    };
}
//# sourceMappingURL=binary-manager.js.map