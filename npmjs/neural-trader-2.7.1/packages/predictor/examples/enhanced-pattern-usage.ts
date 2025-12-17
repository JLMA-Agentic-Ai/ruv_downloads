/**
 * Enhanced Pattern Engine Usage Example
 *
 * Demonstrates GNN neighbor enhancement and 4-tier adaptive compression
 * for market pattern recognition and prediction learning.
 */

import {
  EnhancedPatternEngine,
  HNSWPresets,
  CompressionInfo,
  type MarketPattern,
} from '../src';

/**
 * Example 1: Basic Pattern Learning
 */
async function basicPatternLearning() {
  console.log('=== Example 1: Basic Pattern Learning ===\n');

  const engine = new EnhancedPatternEngine();

  // Create a sample market pattern (384-dimensional embedding)
  const pattern: MarketPattern = {
    embedding: Array.from({ length: 384 }, () => Math.random()),
    metadata: {
      timestamp: Date.now(),
      symbol: 'AAPL',
      accuracy: 0,
      volatility: 0.025,
      regime: 'bull',
    },
  };

  // Simulate a prediction and actual outcome
  const predictedOutcome = 150.5;
  const actualOutcome = 152.3;

  // Learn from the prediction
  await engine.learnFromPrediction(pattern, actualOutcome, predictedOutcome);

  console.log('Pattern learned successfully!');
  console.log('Stats:', engine.getStats());
  console.log();
}

/**
 * Example 2: Finding Similar Patterns
 */
async function findingSimilarPatterns() {
  console.log('=== Example 2: Finding Similar Patterns ===\n');

  const engine = new EnhancedPatternEngine();

  // Load some historical patterns
  const historicalPatterns: MarketPattern[] = Array.from({ length: 100 }, (_, i) => ({
    embedding: Array.from({ length: 384 }, () => Math.random()),
    metadata: {
      timestamp: Date.now() - i * 3600000, // Hourly patterns
      symbol: 'AAPL',
      accuracy: 0.7 + Math.random() * 0.3,
      volatility: 0.01 + Math.random() * 0.05,
      regime: i % 3 === 0 ? 'bull' : i % 3 === 1 ? 'bear' : 'sideways',
    },
  }));

  await engine.bulkLoadPatterns(historicalPatterns);

  // Find similar patterns to current market conditions
  const currentPattern = Array.from({ length: 384 }, () => Math.random());
  const similarPatterns = await engine.findSimilarPatterns(currentPattern, 5, 'bull');

  console.log(`Found ${similarPatterns.length} similar bull market patterns:`);
  similarPatterns.forEach((result, i) => {
    console.log(`  ${i + 1}. Similarity: ${result.similarity.toFixed(4)} - ${result.pattern.metadata.symbol}`);
  });
  console.log();
}

/**
 * Example 3: Adaptive Compression Tiers
 */
async function adaptiveCompressionDemo() {
  console.log('=== Example 3: Adaptive Compression Tiers ===\n');

  const engine = new EnhancedPatternEngine();

  // Different accuracy levels → different compression
  const accuracyLevels = [0.95, 0.75, 0.55, 0.35, 0.15];
  const compressionTiers = ['hot_none', 'warm_fp16', 'cool_pq8', 'cold_pq4', 'archive_binary'];

  for (let i = 0; i < accuracyLevels.length; i++) {
    const accuracy = accuracyLevels[i];
    const expectedTier = compressionTiers[i];

    const pattern: MarketPattern = {
      embedding: Array.from({ length: 384 }, () => Math.random()),
      metadata: {
        timestamp: Date.now(),
        symbol: 'AAPL',
        accuracy,
        volatility: 0.02,
        regime: 'bull',
      },
    };

    // Simulate prediction with known accuracy
    const predictedOutcome = 100;
    const actualOutcome = 100 * (1 + (1 - accuracy)); // Error proportional to accuracy

    await engine.learnFromPrediction(pattern, actualOutcome, predictedOutcome);

    console.log(`Accuracy ${(accuracy * 100).toFixed(0)}% → ${expectedTier}`);
    console.log(`  Size: ${CompressionInfo[expectedTier as keyof typeof CompressionInfo].size} bytes`);
    console.log(`  Reduction: ${CompressionInfo[expectedTier as keyof typeof CompressionInfo].reduction}`);
  }
  console.log();
}

/**
 * Example 4: GNN Neighbor Enhancement
 */
async function gnnNeighborEnhancement() {
  console.log('=== Example 4: GNN Neighbor Enhancement ===\n');

  const engine = new EnhancedPatternEngine();

  // Load initial patterns to create neighbors
  const initialPatterns: MarketPattern[] = Array.from({ length: 50 }, () => ({
    embedding: Array.from({ length: 384 }, () => Math.random()),
    metadata: {
      timestamp: Date.now(),
      symbol: 'AAPL',
      accuracy: 0.8,
      volatility: 0.02,
      regime: 'bull',
    },
  }));

  await engine.bulkLoadPatterns(initialPatterns);
  console.log('Loaded 50 initial patterns');

  // New pattern will be enhanced by neighbors
  const newPattern: MarketPattern = {
    embedding: initialPatterns[0].embedding.map(v => v + Math.random() * 0.1), // Similar to first pattern
    metadata: {
      timestamp: Date.now(),
      symbol: 'AAPL',
      accuracy: 0,
      volatility: 0.025,
      regime: 'bull',
    },
  };

  await engine.learnFromPrediction(newPattern, 150, 148);

  console.log('New pattern learned with GNN enhancement');
  console.log('Stats:', engine.getStats());
  console.log();
}

/**
 * Example 5: Bulk Loading for Backtesting
 */
async function bulkLoadingBacktest() {
  console.log('=== Example 5: Bulk Loading for Backtesting ===\n');

  const engine = new EnhancedPatternEngine();

  // Simulate loading 10,000 historical patterns
  const batchSize = 1000;
  const numBatches = 10;

  console.log(`Loading ${batchSize * numBatches} patterns in ${numBatches} batches...`);

  const startTime = Date.now();

  for (let batch = 0; batch < numBatches; batch++) {
    const patterns: MarketPattern[] = Array.from({ length: batchSize }, (_, i) => ({
      embedding: Array.from({ length: 384 }, () => Math.random()),
      metadata: {
        timestamp: Date.now() - (batch * batchSize + i) * 60000, // Minute resolution
        symbol: batch % 2 === 0 ? 'AAPL' : 'GOOGL',
        accuracy: 0.6 + Math.random() * 0.3,
        volatility: 0.01 + Math.random() * 0.04,
        regime: i % 3 === 0 ? 'bull' : i % 3 === 1 ? 'bear' : 'sideways',
      },
    }));

    await engine.bulkLoadPatterns(patterns);
    console.log(`  Batch ${batch + 1}/${numBatches} loaded`);
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log(`\nLoaded ${batchSize * numBatches} patterns in ${duration.toFixed(2)}s`);
  console.log(`Throughput: ${Math.round((batchSize * numBatches) / duration)} patterns/sec`);
  console.log('Final stats:', engine.getStats());
  console.log();
}

/**
 * Example 6: HNSW Parameter Tuning
 */
function hnswParameterTuning() {
  console.log('=== Example 6: HNSW Parameter Tuning ===\n');

  console.log('High Accuracy (Production Trading):');
  console.log('  m:', HNSWPresets.highAccuracy.m);
  console.log('  efConstruction:', HNSWPresets.highAccuracy.efConstruction);
  console.log('  efSearch:', HNSWPresets.highAccuracy.efSearch);
  console.log('  Use case: High-frequency strategies, real-time trading\n');

  console.log('Balanced (Default):');
  console.log('  m:', HNSWPresets.balanced.m);
  console.log('  efConstruction:', HNSWPresets.balanced.efConstruction);
  console.log('  efSearch:', HNSWPresets.balanced.efSearch);
  console.log('  Use case: General purpose applications\n');

  console.log('Fast Insertion (Backtesting):');
  console.log('  m:', HNSWPresets.fastInsertion.m);
  console.log('  efConstruction:', HNSWPresets.fastInsertion.efConstruction);
  console.log('  efSearch:', HNSWPresets.fastInsertion.efSearch);
  console.log('  Use case: Rapid prototyping, historical data loading\n');
}

/**
 * Example 7: Performance Benchmarking
 */
async function performanceBenchmark() {
  console.log('=== Example 7: Performance Benchmarking ===\n');

  const engine = new EnhancedPatternEngine();

  // Load test data
  const testPatterns: MarketPattern[] = Array.from({ length: 1000 }, () => ({
    embedding: Array.from({ length: 384 }, () => Math.random()),
    metadata: {
      timestamp: Date.now(),
      symbol: 'AAPL',
      accuracy: 0.75,
      volatility: 0.02,
      regime: 'bull',
    },
  }));

  await engine.bulkLoadPatterns(testPatterns);

  // Benchmark search performance
  const numSearches = 100;
  const searchStartTime = Date.now();

  for (let i = 0; i < numSearches; i++) {
    const queryVector = Array.from({ length: 384 }, () => Math.random());
    await engine.findSimilarPatterns(queryVector, 10);
  }

  const searchEndTime = Date.now();
  const avgSearchTime = (searchEndTime - searchStartTime) / numSearches;

  console.log(`Search Performance (${numSearches} searches):`);
  console.log(`  Average search time: ${avgSearchTime.toFixed(2)}ms`);
  console.log(`  Target: <0.1ms (61µs) with HNSW\n`);

  // Benchmark learning performance
  const numLearns = 100;
  const learnStartTime = Date.now();

  for (let i = 0; i < numLearns; i++) {
    const pattern: MarketPattern = {
      embedding: Array.from({ length: 384 }, () => Math.random()),
      metadata: {
        timestamp: Date.now(),
        symbol: 'AAPL',
        accuracy: 0,
        volatility: 0.02,
        regime: 'bull',
      },
    };

    await engine.learnFromPrediction(pattern, 150, 148);
  }

  const learnEndTime = Date.now();
  const avgLearnTime = (learnEndTime - learnStartTime) / numLearns;

  console.log(`Learning Performance (${numLearns} patterns):`);
  console.log(`  Average learn time: ${avgLearnTime.toFixed(2)}ms`);
  console.log(`  Includes: GNN enhancement + compression + insertion\n`);
}

/**
 * Run all examples
 */
async function runAllExamples() {
  await basicPatternLearning();
  await findingSimilarPatterns();
  await adaptiveCompressionDemo();
  await gnnNeighborEnhancement();
  await bulkLoadingBacktest();
  hnswParameterTuning();
  await performanceBenchmark();

  console.log('=== All Examples Completed ===');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  basicPatternLearning,
  findingSimilarPatterns,
  adaptiveCompressionDemo,
  gnnNeighborEnhancement,
  bulkLoadingBacktest,
  hnswParameterTuning,
  performanceBenchmark,
  runAllExamples,
};
