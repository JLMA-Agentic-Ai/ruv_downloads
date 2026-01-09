/**
 * @claude-flow/deployment
 * Release management, CI/CD, and versioning module
 */
export type { VersionBumpType, ReleaseChannel, ReleaseOptions, ReleaseResult, PublishOptions, PublishResult, ValidationOptions, ValidationResult, PackageInfo, GitCommit, ChangelogEntry } from './types.js';
export { ReleaseManager } from './release-manager.js';
export { Publisher } from './publisher.js';
export { Validator } from './validator.js';
export { prepareRelease } from './release-manager.js';
export { publishToNpm, checkVersionExists, getLatestVersion } from './publisher.js';
export { validate } from './validator.js';
export interface ReleaseConfig {
    version: string;
    channel: 'alpha' | 'beta' | 'stable';
    changelog: boolean;
    dryRun: boolean;
}
export interface DeploymentTarget {
    name: string;
    type: 'npm' | 'docker' | 'github-release';
    config: Record<string, unknown>;
}
/**
 * Legacy prepare release function
 * @deprecated Use prepareRelease from release-manager instead
 */
export declare function prepare(config: ReleaseConfig): Promise<void>;
/**
 * Legacy deploy function
 * @deprecated Use publishToNpm from publisher instead
 */
export declare function deploy(target: DeploymentTarget): Promise<void>;
//# sourceMappingURL=index.d.ts.map