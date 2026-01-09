/**
 * @claude-flow/deployment
 * Release management, CI/CD, and versioning module
 */
// Export classes
export { ReleaseManager } from './release-manager.js';
export { Publisher } from './publisher.js';
export { Validator } from './validator.js';
// Export convenience functions
export { prepareRelease } from './release-manager.js';
export { publishToNpm, checkVersionExists, getLatestVersion } from './publisher.js';
export { validate } from './validator.js';
/**
 * Legacy prepare release function
 * @deprecated Use prepareRelease from release-manager instead
 */
export async function prepare(config) {
    const { ReleaseManager } = await import('./release-manager.js');
    const manager = new ReleaseManager();
    await manager.prepareRelease({
        version: config.version,
        channel: config.channel,
        generateChangelog: config.changelog,
        dryRun: config.dryRun
    });
}
/**
 * Legacy deploy function
 * @deprecated Use publishToNpm from publisher instead
 */
export async function deploy(target) {
    if (target.type === 'npm') {
        const { Publisher } = await import('./publisher.js');
        const publisher = new Publisher();
        await publisher.publishToNpm({
            tag: target.config.tag || 'latest',
            dryRun: target.config.dryRun || false
        });
    }
    else {
        console.log(`Deploying to ${target.name} (${target.type})`);
        throw new Error(`Deployment type ${target.type} not yet implemented`);
    }
}
//# sourceMappingURL=index.js.map