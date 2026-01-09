/* tslint:disable */
/* eslint-disable */
/* auto-generated TypeScript definitions for @ruvector/attention */

/** Input type for attention mechanisms - accepts both Array and Float32Array */
export type ArrayInput = Float32Array | number[];

// ============================================================================
// Core Attention Mechanisms
// ============================================================================

/** Basic dot product attention mechanism */
export class DotProductAttention {
  constructor(dim: number);
  readonly dim: number;
  /** Compute attention with automatic array type conversion */
  compute(query: ArrayInput, keys: ArrayInput[], values: ArrayInput[]): Float32Array;
  /** Compute attention with raw Float32Array (no conversion overhead) */
  computeRaw(query: Float32Array, keys: Float32Array[], values: Float32Array[]): Float32Array;
}

/** Multi-head attention mechanism */
export class MultiHeadAttention {
  constructor(dim: number, numHeads: number);
  readonly dim: number;
  readonly numHeads: number;
  /** Compute attention with automatic array type conversion */
  compute(query: ArrayInput, keys: ArrayInput[], values: ArrayInput[]): Float32Array;
  /** Compute attention with raw Float32Array (no conversion overhead) */
  computeRaw(query: Float32Array, keys: Float32Array[], values: Float32Array[]): Float32Array;
}

/** Hyperbolic attention in Poincare ball manifold */
export class HyperbolicAttention {
  constructor(dim: number, curvature?: number);
  readonly dim: number;
  readonly curvature: number;
  /** Compute attention with automatic array type conversion */
  compute(query: ArrayInput, keys: ArrayInput[], values: ArrayInput[]): Float32Array;
  /** Compute attention with raw Float32Array (no conversion overhead) */
  computeRaw(query: Float32Array, keys: Float32Array[], values: Float32Array[]): Float32Array;
}

/** Flash attention - memory-efficient attention mechanism */
export class FlashAttention {
  constructor(dim: number, blockSize?: number);
  readonly dim: number;
  readonly blockSize: number;
  /** Compute attention with automatic array type conversion */
  compute(query: ArrayInput, keys: ArrayInput[], values: ArrayInput[]): Float32Array;
  /** Compute attention with raw Float32Array (no conversion overhead) */
  computeRaw(query: Float32Array, keys: Float32Array[], values: Float32Array[]): Float32Array;
}

/** Linear attention with O(n) complexity */
export class LinearAttention {
  constructor(dim: number, features?: number);
  readonly dim: number;
  readonly features: number;
  /** Compute attention with automatic array type conversion */
  compute(query: ArrayInput, keys: ArrayInput[], values: ArrayInput[]): Float32Array;
  /** Compute attention with raw Float32Array (no conversion overhead) */
  computeRaw(query: Float32Array, keys: Float32Array[], values: Float32Array[]): Float32Array;
}

/** MoE configuration options */
export interface MoEConfig {
  dim: number;
  numExperts: number;
  topK: number;
  expertDim?: number;
  noiseStd?: number;
}

/** Mixture of Experts attention mechanism */
export class MoEAttention {
  constructor(config: MoEConfig);
  readonly dim: number;
  readonly numExperts: number;
  readonly topK: number;
  /** Compute attention with automatic array type conversion */
  compute(query: ArrayInput, keys: ArrayInput[], values: ArrayInput[]): Float32Array;
  /** Compute attention with raw Float32Array (no conversion overhead) */
  computeRaw(query: Float32Array, keys: Float32Array[], values: Float32Array[]): Float32Array;
  /** Create simple MoE with default settings */
  static simple(dim: number, numExperts: number, topK: number): MoEAttention;
}

// ============================================================================
// Graph Attention Mechanisms
// ============================================================================

/** Graph attention with Rotary Position Embeddings */
export class GraphRoPeAttention {
  constructor(dim: number, maxPosition?: number);
  readonly dim: number;
  readonly maxPosition: number;
  /** Compute attention with automatic array type conversion */
  compute(query: ArrayInput, keys: ArrayInput[], values: ArrayInput[]): Float32Array;
  /** Compute attention with raw Float32Array (no conversion overhead) */
  computeRaw(query: Float32Array, keys: Float32Array[], values: Float32Array[]): Float32Array;
}

/** Edge-featured graph attention */
export class EdgeFeaturedAttention {
  constructor(nodeDim: number, edgeDim: number, numHeads?: number);
  readonly nodeDim: number;
  readonly edgeDim: number;
  readonly numHeads: number;
  /** Compute attention with automatic array type conversion */
  compute(query: ArrayInput, keys: ArrayInput[], values: ArrayInput[]): Float32Array;
  /** Compute attention with raw Float32Array (no conversion overhead) */
  computeRaw(query: Float32Array, keys: Float32Array[], values: Float32Array[]): Float32Array;
}

/** Dual-space attention (Euclidean + Hyperbolic) */
export class DualSpaceAttention {
  constructor(dim: number, curvature?: number, euclideanWeight?: number, hyperbolicWeight?: number);
  readonly dim: number;
  /** Compute attention with automatic array type conversion */
  compute(query: ArrayInput, keys: ArrayInput[], values: ArrayInput[]): Float32Array;
  /** Compute attention with raw Float32Array (no conversion overhead) */
  computeRaw(query: Float32Array, keys: Float32Array[], values: Float32Array[]): Float32Array;
}

/** Local-global attention for hierarchical structures */
export class LocalGlobalAttention {
  constructor(dim: number, windowSize?: number, globalTokens?: number);
  readonly dim: number;
  readonly windowSize: number;
  /** Compute attention with automatic array type conversion */
  compute(query: ArrayInput, keys: ArrayInput[], values: ArrayInput[]): Float32Array;
  /** Compute attention with raw Float32Array (no conversion overhead) */
  computeRaw(query: Float32Array, keys: Float32Array[], values: Float32Array[]): Float32Array;
}

// ============================================================================
// Training - Optimizers
// ============================================================================

/** Adam optimizer */
export class AdamOptimizer {
  constructor(learningRate?: number, beta1?: number, beta2?: number, epsilon?: number);
  step(params: Float32Array, gradients: Float32Array): Float32Array;
}

/** AdamW optimizer with weight decay */
export class AdamWOptimizer {
  constructor(learningRate?: number, beta1?: number, beta2?: number, epsilon?: number, weightDecay?: number);
  step(params: Float32Array, gradients: Float32Array): Float32Array;
}

/** Stochastic Gradient Descent optimizer */
export class SgdOptimizer {
  constructor(learningRate?: number, momentum?: number);
  step(params: Float32Array, gradients: Float32Array): Float32Array;
}

// ============================================================================
// Training - Loss Functions
// ============================================================================

/** InfoNCE contrastive loss */
export class InfoNceLoss {
  constructor(temperature?: number);
  compute(anchor: Float32Array, positives: Float32Array[], negatives: Float32Array[]): number;
  backward(anchor: Float32Array, positives: Float32Array[], negatives: Float32Array[]): Float32Array;
}

/** Local contrastive loss for graph structures */
export class LocalContrastiveLoss {
  constructor(temperature?: number, margin?: number);
  compute(anchor: Float32Array, positives: Float32Array[], negatives: Float32Array[]): number;
}

/** Spectral regularization for attention weights */
export class SpectralRegularization {
  constructor(lambda?: number);
  compute(attentionWeights: Float32Array): number;
}

// ============================================================================
// Training - Curriculum Learning
// ============================================================================

export enum DecayType {
  Linear = 'linear',
  Exponential = 'exponential',
  Cosine = 'cosine',
  Step = 'step'
}

/** Curriculum scheduler for progressive training */
export class CurriculumScheduler {
  constructor(totalSteps: number, warmupSteps?: number);
  getDifficulty(step: number): number;
  shouldIncludeSample(difficulty: number, step: number): boolean;
}

/** Temperature annealing for attention */
export class TemperatureAnnealing {
  constructor(initialTemp: number, finalTemp: number, totalSteps: number, decayType?: DecayType);
  getTemperature(step: number): number;
}

/** Learning rate scheduler */
export class LearningRateScheduler {
  constructor(initialLr: number, minLr: number, totalSteps: number, warmupSteps?: number, decayType?: DecayType);
  getLearningRate(step: number): number;
}

// ============================================================================
// Training - Mining
// ============================================================================

export enum MiningStrategy {
  Random = 'random',
  Hard = 'hard',
  SemiHard = 'semi_hard',
  Distance = 'distance'
}

/** Hard negative mining for contrastive learning */
export class HardNegativeMiner {
  constructor(numNegatives?: number, strategy?: MiningStrategy);
  mine(anchor: Float32Array, candidates: Float32Array[]): number[];
}

/** In-batch negative mining */
export class InBatchMiner {
  constructor(batchSize: number);
  mine(anchors: Float32Array[], batchIndex: number): number[];
}

// ============================================================================
// Utilities
// ============================================================================

/** Stream processor for chunked attention computation */
export class StreamProcessor {
  constructor(chunkSize?: number);
  processChunk(chunk: Float32Array): Float32Array;
  finalize(): Float32Array;
}

export enum AttentionType {
  DotProduct = 'dot_product',
  MultiHead = 'multi_head',
  Flash = 'flash',
  Hyperbolic = 'hyperbolic',
  Linear = 'linear'
}

export interface ParallelAttentionConfig {
  query: ArrayInput;
  keys: ArrayInput[];
  values: ArrayInput[];
  attentionType?: AttentionType;
  numThreads?: number;
}

export interface BatchAttentionConfig {
  queries: ArrayInput[];
  keys: ArrayInput[];
  values: ArrayInput[];
  attentionType?: AttentionType;
}

export interface BatchFlashAttentionConfig {
  queries: ArrayInput[];
  keys: ArrayInput[];
  values: ArrayInput[];
  blockSize?: number;
}

/** Parallel attention computation across threads */
export function parallelAttentionCompute(config: ParallelAttentionConfig): Float32Array;

/** Batch attention computation */
export function batchAttentionCompute(config: BatchAttentionConfig): Float32Array[];

/** Async attention computation */
export function computeAttentionAsync(
  query: ArrayInput,
  keys: ArrayInput[],
  values: ArrayInput[],
  attentionType?: AttentionType
): Promise<Float32Array>;

/** Batch flash attention computation */
export function batchFlashAttentionCompute(config: BatchFlashAttentionConfig): Float32Array[];

/** Async flash attention computation */
export function computeFlashAttentionAsync(
  query: ArrayInput,
  keys: ArrayInput[],
  values: ArrayInput[]
): Promise<Float32Array>;

/** Async hyperbolic attention computation */
export function computeHyperbolicAttentionAsync(
  query: ArrayInput,
  keys: ArrayInput[],
  values: ArrayInput[],
  curvature?: number
): Promise<Float32Array>;

export interface BenchmarkResult {
  name: string;
  averageTimeMs: number;
  opsPerSecond: number;
  memoryUsageBytes?: number;
}

/** Benchmark attention mechanisms */
export function benchmarkAttention(dim: number, numKeys?: number, iterations?: number): BenchmarkResult[];

// ============================================================================
// Hyperbolic Math Functions
// ============================================================================

/** Exponential map from tangent space to Poincare ball */
export function expMap(base: ArrayInput, tangent: ArrayInput, curvature?: number): Float32Array;

/** Logarithmic map from Poincare ball to tangent space */
export function logMap(base: ArrayInput, point: ArrayInput, curvature?: number): Float32Array;

/** Mobius addition in Poincare ball */
export function mobiusAddition(a: ArrayInput, b: ArrayInput, curvature?: number): Float32Array;

/** Poincare distance between two points */
export function poincareDistance(a: ArrayInput, b: ArrayInput, curvature?: number): number;

/** Project vector onto Poincare ball */
export function projectToPoincareBall(vector: ArrayInput, curvature?: number): Float32Array;

// ============================================================================
// Meta Information
// ============================================================================

export interface AttentionInfo {
  version: string;
  features: string[];
  supportedTypes: string[];
}

/** Get library info */
export function info(): AttentionInfo;

/** Get library version */
export function version(): string;

// ============================================================================
// Native Exports (for advanced users who want to avoid conversion overhead)
// ============================================================================

export namespace Native {
  export const DotProductAttention: typeof import('./index').DotProductAttention;
  export const MultiHeadAttention: typeof import('./index').MultiHeadAttention;
  export const HyperbolicAttention: typeof import('./index').HyperbolicAttention;
  export const FlashAttention: typeof import('./index').FlashAttention;
  export const LinearAttention: typeof import('./index').LinearAttention;
  export const MoEAttention: typeof import('./index').MoEAttention;
  export const GraphRoPeAttention: typeof import('./index').GraphRoPeAttention;
  export const EdgeFeaturedAttention: typeof import('./index').EdgeFeaturedAttention;
  export const DualSpaceAttention: typeof import('./index').DualSpaceAttention;
  export const LocalGlobalAttention: typeof import('./index').LocalGlobalAttention;
  export function expMap(base: Float32Array, tangent: Float32Array, curvature?: number): Float32Array;
  export function logMap(base: Float32Array, point: Float32Array, curvature?: number): Float32Array;
  export function mobiusAddition(a: Float32Array, b: Float32Array, curvature?: number): Float32Array;
  export function poincareDistance(a: Float32Array, b: Float32Array, curvature?: number): number;
  export function projectToPoincareBall(vector: Float32Array, curvature?: number): Float32Array;
}
