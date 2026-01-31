/* tslint:disable */
/* eslint-disable */

/** Sliced Wasserstein distance for comparing point cloud distributions */
export interface SlicedWassersteinOptions {
    numProjections?: number;
    power?: number;
    seed?: number;
}

/** Sinkhorn optimal transport options */
export interface SinkhornOptions {
    regularization?: number;
    maxIterations?: number;
    threshold?: number;
}

/** Product manifold configuration */
export interface ProductManifoldConfig {
    euclideanDim: number;
    hyperbolicDim: number;
    sphericalDim: number;
    hyperbolicCurvature?: number;
    sphericalCurvature?: number;
}



export class TransportResult {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get number of iterations
   */
  readonly iterations: number;
  /**
   * Get total transport cost
   */
  readonly cost: number;
  /**
   * Get transport plan as flat array
   */
  readonly plan: Float64Array;
  /**
   * Whether algorithm converged
   */
  readonly converged: boolean;
}

export class WasmFisherInformation {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Compute diagonal FIM from gradient samples
   */
  diagonalFim(gradients: Float64Array, _num_samples: number, dim: number): Float64Array;
  /**
   * Set damping factor
   */
  withDamping(damping: number): WasmFisherInformation;
  /**
   * Compute natural gradient
   */
  naturalGradient(fim_diag: Float64Array, gradient: Float64Array, damping: number): Float64Array;
  /**
   * Create a new Fisher Information calculator
   */
  constructor();
}

export class WasmGromovWasserstein {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Create a new Gromov-Wasserstein calculator
   */
  constructor(regularization: number);
  /**
   * Compute GW distance between point clouds
   */
  distance(source: Float64Array, target: Float64Array, dim: number): number;
}

export class WasmNaturalGradient {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Set damping factor
   */
  withDamping(damping: number): WasmNaturalGradient;
  /**
   * Use diagonal approximation
   */
  withDiagonal(use_diagonal: boolean): WasmNaturalGradient;
  /**
   * Create a new Natural Gradient optimizer
   */
  constructor(learning_rate: number);
  /**
   * Compute update step
   */
  step(gradient: Float64Array, gradient_samples: Float64Array | null | undefined, dim: number): Float64Array;
  /**
   * Reset optimizer state
   */
  reset(): void;
}

export class WasmProductManifold {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Fréchet mean
   */
  frechetMean(points: Float64Array, _num_points: number): Float64Array;
  /**
   * Pairwise distances
   */
  pairwiseDistances(points: Float64Array): Float64Array;
  /**
   * K-nearest neighbors
   */
  knn(query: Float64Array, points: Float64Array, k: number): Uint32Array;
  /**
   * Create a new product manifold
   *
   * @param euclidean_dim - Dimension of Euclidean component
   * @param hyperbolic_dim - Dimension of hyperbolic component
   * @param spherical_dim - Dimension of spherical component
   */
  constructor(euclidean_dim: number, hyperbolic_dim: number, spherical_dim: number);
  /**
   * Exponential map
   */
  expMap(x: Float64Array, v: Float64Array): Float64Array;
  /**
   * Logarithmic map
   */
  logMap(x: Float64Array, y: Float64Array): Float64Array;
  /**
   * Project point onto manifold
   */
  project(point: Float64Array): Float64Array;
  /**
   * Compute distance in product manifold
   */
  distance(x: Float64Array, y: Float64Array): number;
  /**
   * Geodesic interpolation
   */
  geodesic(x: Float64Array, y: Float64Array, t: number): Float64Array;
  /**
   * Get total dimension
   */
  readonly dim: number;
}

export class WasmSinkhorn {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Solve optimal transport and return transport plan
   */
  solveTransport(cost_matrix: Float64Array, source_weights: Float64Array, target_weights: Float64Array, n: number, m: number): TransportResult;
  /**
   * Create a new Sinkhorn solver
   *
   * @param regularization - Entropy regularization (0.01-0.1 typical)
   * @param max_iterations - Maximum iterations (100-1000 typical)
   */
  constructor(regularization: number, max_iterations: number);
  /**
   * Compute transport cost between point clouds
   */
  distance(source: Float64Array, target: Float64Array, dim: number): number;
}

export class WasmSlicedWasserstein {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Set Wasserstein power (1 for W1, 2 for W2)
   */
  withPower(p: number): WasmSlicedWasserstein;
  /**
   * Compute weighted distance
   */
  weightedDistance(source: Float64Array, source_weights: Float64Array, target: Float64Array, target_weights: Float64Array, dim: number): number;
  /**
   * Create a new Sliced Wasserstein calculator
   *
   * @param num_projections - Number of random 1D projections (100-1000 typical)
   */
  constructor(num_projections: number);
  /**
   * Compute distance between two point clouds
   *
   * @param source - Source points as flat array [x1, y1, z1, x2, y2, z2, ...]
   * @param target - Target points as flat array
   * @param dim - Dimension of each point
   */
  distance(source: Float64Array, target: Float64Array, dim: number): number;
  /**
   * Set random seed for reproducibility
   */
  withSeed(seed: bigint): WasmSlicedWasserstein;
}

export class WasmSphericalSpace {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Fréchet mean of points
   */
  frechetMean(points: Float64Array, dim: number): Float64Array;
  /**
   * Create a new spherical space S^{n-1} embedded in R^n
   */
  constructor(ambient_dim: number);
  /**
   * Exponential map: move from x in direction v
   */
  expMap(x: Float64Array, v: Float64Array): Float64Array;
  /**
   * Logarithmic map: tangent vector at x pointing toward y
   */
  logMap(x: Float64Array, y: Float64Array): Float64Array;
  /**
   * Project point onto sphere
   */
  project(point: Float64Array): Float64Array;
  /**
   * Geodesic distance on sphere
   */
  distance(x: Float64Array, y: Float64Array): number;
  /**
   * Geodesic interpolation at fraction t
   */
  geodesic(x: Float64Array, y: Float64Array, t: number): Float64Array;
  /**
   * Get ambient dimension
   */
  readonly ambientDim: number;
}

export function start(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_transportresult_free: (a: number, b: number) => void;
  readonly __wbg_wasmfisherinformation_free: (a: number, b: number) => void;
  readonly __wbg_wasmgromovwasserstein_free: (a: number, b: number) => void;
  readonly __wbg_wasmnaturalgradient_free: (a: number, b: number) => void;
  readonly __wbg_wasmproductmanifold_free: (a: number, b: number) => void;
  readonly __wbg_wasmslicedwasserstein_free: (a: number, b: number) => void;
  readonly transportresult_converged: (a: number) => number;
  readonly transportresult_cost: (a: number) => number;
  readonly transportresult_iterations: (a: number) => number;
  readonly transportresult_plan: (a: number, b: number) => void;
  readonly wasmfisherinformation_diagonalFim: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wasmfisherinformation_naturalGradient: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly wasmfisherinformation_new: () => number;
  readonly wasmfisherinformation_withDamping: (a: number, b: number) => number;
  readonly wasmgromovwasserstein_distance: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly wasmgromovwasserstein_new: (a: number) => number;
  readonly wasmnaturalgradient_new: (a: number) => number;
  readonly wasmnaturalgradient_reset: (a: number) => void;
  readonly wasmnaturalgradient_step: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly wasmnaturalgradient_withDamping: (a: number, b: number) => number;
  readonly wasmnaturalgradient_withDiagonal: (a: number, b: number) => number;
  readonly wasmproductmanifold_dim: (a: number) => number;
  readonly wasmproductmanifold_distance: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wasmproductmanifold_expMap: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wasmproductmanifold_frechetMean: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wasmproductmanifold_geodesic: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly wasmproductmanifold_knn: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly wasmproductmanifold_logMap: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wasmproductmanifold_new: (a: number, b: number, c: number) => number;
  readonly wasmproductmanifold_pairwiseDistances: (a: number, b: number, c: number, d: number) => void;
  readonly wasmproductmanifold_project: (a: number, b: number, c: number, d: number) => void;
  readonly wasmsinkhorn_distance: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly wasmsinkhorn_new: (a: number, b: number) => number;
  readonly wasmsinkhorn_solveTransport: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
  readonly wasmslicedwasserstein_distance: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly wasmslicedwasserstein_new: (a: number) => number;
  readonly wasmslicedwasserstein_weightedDistance: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => number;
  readonly wasmslicedwasserstein_withPower: (a: number, b: number) => number;
  readonly wasmslicedwasserstein_withSeed: (a: number, b: bigint) => number;
  readonly wasmsphericalspace_ambientDim: (a: number) => number;
  readonly wasmsphericalspace_distance: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wasmsphericalspace_expMap: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wasmsphericalspace_frechetMean: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wasmsphericalspace_geodesic: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly wasmsphericalspace_logMap: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wasmsphericalspace_new: (a: number) => number;
  readonly wasmsphericalspace_project: (a: number, b: number, c: number, d: number) => void;
  readonly start: () => void;
  readonly __wbg_wasmsinkhorn_free: (a: number, b: number) => void;
  readonly __wbg_wasmsphericalspace_free: (a: number, b: number) => void;
  readonly __wbindgen_export: (a: number) => void;
  readonly __wbindgen_export2: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export3: (a: number, b: number) => number;
  readonly __wbindgen_export4: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
