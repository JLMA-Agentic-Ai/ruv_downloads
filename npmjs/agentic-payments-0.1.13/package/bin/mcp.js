#!/usr/bin/env node
/**
 * MCP Server Binary Entry Point
 * Launches the Agentic Payments MCP server
 *
 * Includes aggressive cache cleanup to prevent ENOTEMPTY errors in remote environments
 */

// Clean up npx cache on startup to prevent ENOTEMPTY errors
if (process.env.npm_execpath && process.env.npm_execpath.includes('npx')) {
  try {
    const { existsSync, rmSync, readdirSync, statSync } = await import('fs');
    const { homedir } = await import('os');
    const { join } = await import('path');

    const npmHome = process.env.NPM_CONFIG_CACHE || join(homedir(), '.npm');
    const npxCacheDir = join(npmHome, '_npx');

    if (existsSync(npxCacheDir)) {
      const cacheEntries = readdirSync(npxCacheDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      // Find and remove stale agentic-payments cache
      for (const entry of cacheEntries) {
        try {
          const entryPath = join(npxCacheDir, entry);
          const pkgPath = join(entryPath, 'node_modules', 'agentic-payments');

          if (existsSync(pkgPath)) {
            // Check if cache is stale (older than 24 hours)
            const stats = statSync(entryPath);
            const age = now - stats.mtimeMs;

            if (age > maxAge) {
              // Remove entire cache entry for stale caches
              rmSync(entryPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
            } else {
              // For fresh caches, just remove the package directory
              rmSync(pkgPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
            }
          }
        } catch (e) {
          // Ignore individual cleanup errors - continue with others
        }
      }
    }
  } catch (error) {
    // Silently fail - don't block server startup
  }
}

import('../dist/mcp/index.js').catch(err => {
  console.error('[MCP] Failed to start server:', err);
  process.exit(1);
});
