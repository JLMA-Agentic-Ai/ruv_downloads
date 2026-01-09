/**
 * @ruvector/edge-net - Universal Entry Point
 *
 * Auto-detects environment (Browser vs Node.js) and loads appropriate module
 */

// Environment detection
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

let wasmModule = null;
let initPromise = null;

/**
 * Initialize the WASM module
 * @returns {Promise<Object>} The initialized WASM module
 */
export async function init() {
  if (wasmModule) return wasmModule;

  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (isBrowser) {
      // Browser: use web target
      const wasm = await import('./ruvector_edge_net.js');
      await wasm.default();
      wasmModule = wasm;
    } else if (isNode) {
      // Node.js: Setup polyfills first
      await setupNodePolyfills();

      // Dynamic import for ESM compatibility
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);

      // Try nodejs target first, fall back to web target with polyfills
      try {
        wasmModule = require('./node/ruvector_edge_net.js');
      } catch (e) {
        // Fallback to web version with polyfills
        const wasm = await import('./ruvector_edge_net.js');
        await wasm.default();
        wasmModule = wasm;
      }
    } else {
      throw new Error('Unsupported environment');
    }

    return wasmModule;
  })();

  return initPromise;
}

/**
 * Setup Node.js polyfills for web APIs
 */
async function setupNodePolyfills() {
  if (typeof globalThis.crypto === 'undefined') {
    const { webcrypto } = await import('crypto');
    globalThis.crypto = webcrypto;
  }

  if (typeof globalThis.performance === 'undefined') {
    const { performance } = await import('perf_hooks');
    globalThis.performance = performance;
  }

  // Mock minimal web APIs
  if (typeof globalThis.window === 'undefined') {
    globalThis.window = {
      crypto: globalThis.crypto,
      performance: globalThis.performance,
      localStorage: createMemoryStorage(),
      navigator: { userAgent: 'node' },
    };
  }

  if (typeof globalThis.document === 'undefined') {
    globalThis.document = {};
  }
}

/**
 * Create in-memory storage for Node.js
 */
function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => store.get(key) || null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (i) => [...store.keys()][i] || null,
  };
}

// Re-export everything from the web module for type compatibility
export * from './ruvector_edge_net.js';

// Default export is the init function
export default init;
