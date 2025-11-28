/**
 * @ruvector/core - CommonJS wrapper
 *
 * This file provides CommonJS compatibility for projects using require()
 */
import { platform, arch } from 'node:os';
/**
 * Distance metric for similarity calculation
 */
export var DistanceMetric;
(function (DistanceMetric) {
    /** Euclidean (L2) distance */
    DistanceMetric["Euclidean"] = "euclidean";
    /** Cosine similarity (1 - cosine distance) */
    DistanceMetric["Cosine"] = "cosine";
    /** Dot product similarity */
    DistanceMetric["DotProduct"] = "dot";
})(DistanceMetric || (DistanceMetric = {}));
/**
 * Get platform-specific package name
 */
function getPlatformPackage() {
    const plat = platform();
    const architecture = arch();
    // Map Node.js platform names to package names
    const packageMap = {
        'linux-x64': 'ruvector-core-linux-x64-gnu',
        'linux-arm64': 'ruvector-core-linux-arm64-gnu',
        'darwin-x64': 'ruvector-core-darwin-x64',
        'darwin-arm64': 'ruvector-core-darwin-arm64',
        'win32-x64': 'ruvector-core-win32-x64-msvc',
    };
    const key = `${plat}-${architecture}`;
    const packageName = packageMap[key];
    if (!packageName) {
        throw new Error(`Unsupported platform: ${plat}-${architecture}. ` +
            `Supported platforms: ${Object.keys(packageMap).join(', ')}`);
    }
    return packageName;
}
/**
 * Load the native binding for the current platform
 */
function loadNativeBinding() {
    const packageName = getPlatformPackage();
    try {
        // Try to require the platform-specific package
        return require(packageName);
    }
    catch (error) {
        // Fallback: try loading from local platforms directory
        try {
            const plat = platform();
            const architecture = arch();
            const platformKey = `${plat}-${architecture}`;
            const platformMap = {
                'linux-x64': 'linux-x64-gnu',
                'linux-arm64': 'linux-arm64-gnu',
                'darwin-x64': 'darwin-x64',
                'darwin-arm64': 'darwin-arm64',
                'win32-x64': 'win32-x64-msvc',
            };
            const localPath = `../platforms/${platformMap[platformKey]}/ruvector.node`;
            return require(localPath);
        }
        catch (fallbackError) {
            throw new Error(`Failed to load native binding: ${error.message}\n` +
                `Fallback also failed: ${fallbackError.message}\n` +
                `Platform: ${platform()}-${arch()}\n` +
                `Expected package: ${packageName}`);
        }
    }
}
// Load the native module
const nativeBinding = loadNativeBinding();
// Export everything from the native binding
module.exports = nativeBinding;
// Also export as default
module.exports.default = nativeBinding;
// Re-export DistanceMetric
module.exports.DistanceMetric = DistanceMetric;
//# sourceMappingURL=index.cjs.js.map