/**
 * @ruvector/core - High-performance Rust vector database for Node.js
 *
 * Automatically detects platform and loads the appropriate native binding.
 */
import { platform, arch } from 'node:os';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
/**
 * Distance metric for similarity calculation
 */
export var DistanceMetric;
(function (DistanceMetric) {
    /** Euclidean (L2) distance */
    DistanceMetric["Euclidean"] = "Euclidean";
    /** Cosine similarity (converted to distance) */
    DistanceMetric["Cosine"] = "Cosine";
    /** Dot product (converted to distance for maximization) */
    DistanceMetric["DotProduct"] = "DotProduct";
    /** Manhattan (L1) distance */
    DistanceMetric["Manhattan"] = "Manhattan";
})(DistanceMetric || (DistanceMetric = {}));
/**
 * Detect the current platform and architecture
 */
function detectPlatform() {
    const currentPlatform = platform();
    const currentArch = arch();
    // Map platform and architecture to package names
    const platformMap = {
        'linux-x64': '@ruvector/core-linux-x64-gnu',
        'linux-arm64': '@ruvector/core-linux-arm64-gnu',
        'darwin-x64': '@ruvector/core-darwin-x64',
        'darwin-arm64': '@ruvector/core-darwin-arm64',
        'win32-x64': '@ruvector/core-win32-x64-msvc'
    };
    const key = `${currentPlatform}-${currentArch}`;
    const packageName = platformMap[key];
    if (!packageName) {
        throw new Error(`Unsupported platform: ${currentPlatform}-${currentArch}. ` +
            `Supported platforms: ${Object.keys(platformMap).join(', ')}`);
    }
    return { platform: currentPlatform, arch: currentArch, packageName };
}
/**
 * Load the native binding for the current platform
 */
function loadNativeBinding() {
    const currentPlatform = platform();
    const currentArch = arch();
    const platformKey = `${currentPlatform}-${currentArch}`;
    try {
        // Try to load from native directory first (for direct builds)
        // Use the wrapper index.cjs if it exists, otherwise load the .node file directly
        try {
            const nativeBinding = require(`../native/${platformKey}/index.cjs`);
            return nativeBinding;
        }
        catch {
            const nativeBinding = require(`../native/${platformKey}/ruvector.node`);
            return nativeBinding;
        }
    }
    catch (error) {
        // Fallback to platform-specific packages
        const { packageName } = detectPlatform();
        try {
            const nativeBinding = require(packageName);
            return nativeBinding;
        }
        catch (packageError) {
            // Provide helpful error message
            const err = packageError;
            if (err.code === 'MODULE_NOT_FOUND') {
                throw new Error(`Failed to load native binding for ${platformKey}. ` +
                    `Tried: ../native/${platformKey}/ruvector.node and ${packageName}. ` +
                    `Please ensure the package is installed by running: npm install ${packageName}`);
            }
            throw new Error(`Failed to load native binding: ${err.message}`);
        }
    }
}
// Load the native binding
const nativeBinding = loadNativeBinding();
// Re-export the VectorDB class and utility functions
// Note: NAPI-RS exports as VectorDb (lowercase d), we re-export as VectorDB for consistency
export const VectorDB = nativeBinding.VectorDb || nativeBinding.VectorDB;
export const CollectionManager = nativeBinding.CollectionManager;
export const version = nativeBinding.version;
export const hello = nativeBinding.hello;
export const getMetrics = nativeBinding.getMetrics;
export const getHealth = nativeBinding.getHealth;
// Default export
export default {
    VectorDB,
    CollectionManager,
    version,
    hello,
    getMetrics,
    getHealth,
    DistanceMetric
};
//# sourceMappingURL=index.js.map