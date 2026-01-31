/* tslint:disable */
/* eslint-disable */
/**
 * Benchmark function for performance testing
 */
export function benchmark(iterations: number): any;
/**
 * Get version
 */
export function version(): string;
/**
 * Initialize module
 */
export function main(): void;
export class TemporalNeuralSolver {
  free(): void;
  /**
   * Create a new solver instance
   */
  constructor();
  /**
   * Single prediction with sub-microsecond target latency
   */
  predict(input: Float32Array): any;
  /**
   * Batch prediction for high throughput
   */
  predict_batch(inputs_flat: Float32Array): any;
  /**
   * Reset temporal state
   */
  reset_state(): void;
  /**
   * Get solver metadata
   */
  info(): any;
}
