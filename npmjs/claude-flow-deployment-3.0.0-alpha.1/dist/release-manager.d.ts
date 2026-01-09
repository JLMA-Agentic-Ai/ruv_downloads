/**
 * Release Manager
 * Handles version bumping, changelog generation, and git tagging
 */
import type { ReleaseOptions, ReleaseResult } from './types.js';
export declare class ReleaseManager {
    private cwd;
    constructor(cwd?: string);
    /**
     * Prepare a release with version bumping, changelog, and git tagging
     */
    prepareRelease(options?: ReleaseOptions): Promise<ReleaseResult>;
    /**
     * Bump version based on type
     */
    private bumpVersion;
    /**
     * Get git commits since last tag
     */
    private getCommitsSinceLastTag;
    /**
     * Parse git commits
     */
    private parseCommits;
    /**
     * Generate changelog entry from commits
     */
    private generateChangelogEntry;
    /**
     * Format changelog entry as markdown
     */
    private formatChangelogEntry;
    /**
     * Update CHANGELOG.md file
     */
    private updateChangelogFile;
    /**
     * Execute command
     */
    private execCommand;
}
/**
 * Convenience function to prepare a release
 */
export declare function prepareRelease(options?: ReleaseOptions): Promise<ReleaseResult>;
//# sourceMappingURL=release-manager.d.ts.map