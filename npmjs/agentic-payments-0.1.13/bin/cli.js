#!/usr/bin/env node

/**
 * Agentic Payments CLI
 * Command-line interface for AP2, ACP, and MCP operations
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
    // Silently fail - don't block CLI startup
  }
}

const args = process.argv.slice(2);
const command = args[0];

if (command === 'mcp') {
  // Remove 'mcp' from args and delegate to MCP server
  process.argv.splice(2, 1);
  import('../dist/mcp/index.js').catch(err => {
    console.error('Failed to start MCP server:', err);
    process.exit(1);
  });
} else {
  // Show help
  console.log('Agentic Payments CLI v0.1.0');
  console.log('Multi-agent payment authorization for autonomous AI commerce');
  console.log('');
  console.log('Usage: agentic-payments <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  mcp                Start MCP server (stdio or HTTP transport)');
  console.log('  active-mandate     Manage Active Mandates (create, sign, verify, revoke)');
  console.log('  generate           Generate Ed25519 agent identity');
  console.log('  verify             Verify payment with multi-agent consensus');
  console.log('  system             System status and diagnostics');
  console.log('');
  console.log('MCP Server:');
  console.log('  agentic-payments mcp                    # Start stdio transport');
  console.log('  agentic-payments mcp --transport http   # Start HTTP/SSE server');
  console.log('');
  console.log('Examples:');
  console.log('  agentic-payments mcp --transport http --port 3000');
  console.log('  agentic-payments active-mandate create --agent bot@ai --holder user@example.com');
  console.log('  agentic-payments generate --format json');
  console.log('');
  console.log('Documentation: https://github.com/agentic-catalog/agentic-payments');
  console.log('');
  console.log('Run: agentic-payments <command> --help for more information');
}
