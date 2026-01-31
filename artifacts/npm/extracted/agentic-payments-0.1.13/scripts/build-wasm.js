#!/usr/bin/env node

/**
 * WASM Build Script - Production-ready multi-target compilation
 * Builds optimized WASM modules for web, Node.js, and bundler environments
 *
 * Target size: <200KB gzipped WASM
 * Features: Ed25519 crypto, protocol routing, batch verification
 */

import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');
const NPM_DIR = join(ROOT_DIR, 'npm');
const DIST_WASM_DIR = join(NPM_DIR, 'dist', 'wasm');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}▶${colors.reset} ${colors.bold}${msg}${colors.reset}`),
};

/**
 * Execute shell command with error handling
 */
function exec(command, args, options = {}) {
  log.info(`Running: ${command} ${args.join(' ')}`);

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    cwd: ROOT_DIR,
    ...options,
  });

  if (result.error) {
    log.error(`Failed to execute: ${result.error.message}`);
    throw result.error;
  }

  if (result.status !== 0) {
    log.error(`Command failed with exit code ${result.status}`);
    process.exit(result.status || 1);
  }

  return result;
}

/**
 * Get file size in KB
 */
function getFileSize(filepath) {
  if (!existsSync(filepath)) return 0;
  return Math.round(statSync(filepath).size / 1024);
}

/**
 * Get gzipped size
 */
function getGzipSize(filepath) {
  if (!existsSync(filepath)) return 0;
  const content = readFileSync(filepath);
  const compressed = gzipSync(content, { level: 9 });
  return Math.round(compressed.length / 1024);
}

/**
 * Print build summary
 */
function printSummary(targets) {
  console.log('\n' + '='.repeat(60));
  log.step('Build Summary');
  console.log('='.repeat(60));

  for (const target of targets) {
    const wasmPath = join(DIST_WASM_DIR, target, 'agentic_payments_bg.wasm');
    const jsPath = join(DIST_WASM_DIR, target, 'agentic_payments.js');

    if (!existsSync(wasmPath)) {
      log.warning(`${target}: Build artifacts not found`);
      continue;
    }

    const wasmSize = getFileSize(wasmPath);
    const wasmGzip = getGzipSize(wasmPath);
    const jsSize = getFileSize(jsPath);
    const jsGzip = getGzipSize(jsPath);
    const totalGzip = wasmGzip + jsGzip;

    console.log(`\n${colors.bold}${target}:${colors.reset}`);
    console.log(`  WASM: ${wasmSize} KB (${wasmGzip} KB gzipped)`);
    console.log(`  JS:   ${jsSize} KB (${jsGzip} KB gzipped)`);
    console.log(`  Total: ${totalGzip} KB gzipped`);

    if (totalGzip > 200) {
      log.warning(`  Exceeds 200KB target by ${totalGzip - 200} KB`);
    } else {
      log.success(`  Within 200KB target (${200 - totalGzip} KB margin)`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Check if wasm-pack is installed
 */
function checkWasmPack() {
  log.step('Checking dependencies');

  try {
    const result = spawnSync('wasm-pack', ['--version'], { stdio: 'pipe' });
    if (result.status === 0) {
      const version = result.stdout.toString().trim();
      log.success(`wasm-pack found: ${version}`);
      return true;
    }
  } catch (error) {
    // wasm-pack not found
  }

  log.error('wasm-pack not found!');
  log.info('Install with: cargo install wasm-pack');
  process.exit(1);
}

/**
 * Main build function
 */
async function main() {
  const startTime = Date.now();

  console.log(`
${colors.cyan}╔═══════════════════════════════════════════════════════════╗
║  Agentic Payments - WASM Build                            ║
║  Multi-target compilation with size optimization          ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
`);

  // Check dependencies
  checkWasmPack();

  // Clean previous builds
  log.step('Cleaning previous builds');
  if (existsSync(DIST_WASM_DIR)) {
    rmSync(DIST_WASM_DIR, { recursive: true, force: true });
    log.success('Cleaned dist/wasm directory');
  }
  mkdirSync(DIST_WASM_DIR, { recursive: true });

  // Build targets
  const targets = [
    { name: 'web', desc: 'Browser (ES modules)' },
    { name: 'nodejs', desc: 'Node.js (CommonJS)' },
    { name: 'bundler', desc: 'Webpack/Rollup/Vite' },
  ];

  for (const target of targets) {
    log.step(`Building for ${target.desc}`);

    const outDir = join(DIST_WASM_DIR, target.name);

    exec('wasm-pack', [
      'build',
      '--target', target.name,
      '--out-dir', outDir,
      '--out-name', 'agentic_payments',
      '--scope', 'agentic-catalog',
      '--release',
      '--',
      '--no-default-features',
      '--features', 'wasm',
    ]);

    log.success(`${target.name} build complete`);
  }

  // Print summary
  printSummary(targets.map(t => t.name));

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log.success(`Build completed in ${duration}s`);
}

// Run build
main().catch((error) => {
  log.error(`Build failed: ${error.message}`);
  process.exit(1);
});
