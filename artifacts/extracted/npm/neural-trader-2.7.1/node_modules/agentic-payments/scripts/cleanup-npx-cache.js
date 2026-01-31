#!/usr/bin/env node
/**
 * NPX Cache Cleanup Script
 * Fixes ENOTEMPTY errors on remote installs by cleaning up stale npx cache
 *
 * This script addresses the common npx caching issue where:
 * - npm tries to rename cached directories during updates
 * - Directory is not empty, causing ENOTEMPTY errors
 * - Particularly problematic in remote/containerized environments
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, rmSync, readdirSync } from 'fs';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function cleanupNpxCache() {
  try {
    const npmHome = process.env.NPM_CONFIG_CACHE || join(homedir(), '.npm');
    const npxCacheDir = join(npmHome, '_npx');

    if (!existsSync(npxCacheDir)) {
      return; // No cache to clean
    }

    console.log('[agentic-payments] Cleaning npx cache to prevent ENOTEMPTY errors...');

    let cleanedCount = 0;
    const cacheEntries = readdirSync(npxCacheDir);

    for (const entry of cacheEntries) {
      try {
        const entryPath = join(npxCacheDir, entry);
        const pkgPath = join(entryPath, 'node_modules', 'agentic-payments');

        if (existsSync(pkgPath)) {
          console.log(`[agentic-payments] Removing stale cache: ${entry}`);

          // Try multiple removal strategies for robustness
          try {
            rmSync(entryPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
            cleanedCount++;
          } catch (rmError) {
            // Fallback: try removing just the package directory
            try {
              rmSync(pkgPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
              cleanedCount++;
            } catch (fallbackError) {
              console.warn(`[agentic-payments] Could not remove cache entry: ${entry}`);
            }
          }
        }
      } catch (entryError) {
        // Continue with other entries even if one fails
        continue;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[agentic-payments] Cache cleanup complete (${cleanedCount} entries removed)`);
    } else {
      console.log('[agentic-payments] No stale cache entries found');
    }
  } catch (error) {
    // Silently fail - don't block installation
    console.warn('[agentic-payments] Cache cleanup failed (non-fatal):', error.message);
  }
}

// Run cleanup
cleanupNpxCache().catch(() => {
  // Ignore errors - preinstall should not fail
});
