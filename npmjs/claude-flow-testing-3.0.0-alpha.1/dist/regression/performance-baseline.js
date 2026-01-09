/**
 * Performance Baseline System
 *
 * Captures and compares performance metrics to detect regressions.
 *
 * @module v3/testing/regression/performance-baseline
 */
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
/**
 * Performance Baseline Manager
 *
 * Manages performance baselines for regression detection.
 */
export class PerformanceBaseline {
    baselinePath;
    threshold;
    cachedBaseline = null;
    constructor(config) {
        this.baselinePath = join(config.baselinePath, 'performance.json');
        this.threshold = config.performanceThreshold;
    }
    /**
     * Capture current performance as baseline
     */
    async captureBaseline() {
        const metrics = await this.measureCurrentPerformance();
        const baseline = {
            version: '1.0.0',
            capturedAt: Date.now(),
            metrics,
        };
        await this.saveBaseline(baseline);
        this.cachedBaseline = baseline;
        return baseline;
    }
    /**
     * Compare current performance against baseline
     */
    async compare() {
        const baseline = await this.loadBaseline();
        if (!baseline) {
            console.warn('No baseline found. Capturing initial baseline...');
            await this.captureBaseline();
            return [];
        }
        const currentMetrics = await this.measureCurrentPerformance();
        const comparisons = [];
        for (const current of currentMetrics) {
            const baselineMetric = baseline.metrics.find((m) => m.name === current.name);
            if (!baselineMetric)
                continue;
            const isHigherBetter = current.category === 'throughput';
            const diff = current.value - baselineMetric.value;
            const percentChange = (diff / baselineMetric.value) * 100;
            // For latency/memory, higher is worse. For throughput, lower is worse.
            const degradation = isHigherBetter ? -percentChange : percentChange;
            comparisons.push({
                metric: current.name,
                baseline: baselineMetric.value,
                current: current.value,
                unit: current.unit,
                degradation,
                regression: degradation > this.threshold,
                improvement: degradation < -this.threshold,
            });
        }
        return comparisons;
    }
    /**
     * Measure current performance metrics
     */
    async measureCurrentPerformance() {
        const metrics = [];
        const timestamp = Date.now();
        // Memory metrics
        const memUsage = process.memoryUsage();
        metrics.push({
            name: 'heap_used',
            value: memUsage.heapUsed / 1024 / 1024,
            unit: 'MB',
            category: 'memory',
            timestamp,
        });
        metrics.push({
            name: 'heap_total',
            value: memUsage.heapTotal / 1024 / 1024,
            unit: 'MB',
            category: 'memory',
            timestamp,
        });
        metrics.push({
            name: 'rss',
            value: memUsage.rss / 1024 / 1024,
            unit: 'MB',
            category: 'memory',
            timestamp,
        });
        // Startup time simulation
        const startupStart = performance.now();
        await this.simulateStartup();
        const startupTime = performance.now() - startupStart;
        metrics.push({
            name: 'startup_time',
            value: startupTime,
            unit: 'ms',
            category: 'startup',
            timestamp,
        });
        // Latency benchmarks
        const latencyMetrics = await this.measureLatency();
        metrics.push(...latencyMetrics);
        // Throughput benchmarks
        const throughputMetrics = await this.measureThroughput();
        metrics.push(...throughputMetrics);
        return metrics;
    }
    /**
     * Simulate startup to measure initialization time
     */
    async simulateStartup() {
        // Import key modules to simulate startup
        await import('@claude-flow/shared');
        await import('@claude-flow/memory');
    }
    /**
     * Measure operation latency
     */
    async measureLatency() {
        const metrics = [];
        const timestamp = Date.now();
        // Event bus latency
        const eventLatency = await this.benchmarkEventBus();
        metrics.push({
            name: 'event_bus_latency',
            value: eventLatency,
            unit: 'μs',
            category: 'latency',
            timestamp,
        });
        // Memory operation latency
        const memLatency = await this.benchmarkMemoryOps();
        metrics.push({
            name: 'memory_op_latency',
            value: memLatency,
            unit: 'μs',
            category: 'latency',
            timestamp,
        });
        return metrics;
    }
    /**
     * Measure throughput
     */
    async measureThroughput() {
        const metrics = [];
        const timestamp = Date.now();
        // Events per second
        const eventsPerSec = await this.benchmarkEventThroughput();
        metrics.push({
            name: 'events_per_second',
            value: eventsPerSec,
            unit: 'ops/sec',
            category: 'throughput',
            timestamp,
        });
        // Memory operations per second
        const memOpsPerSec = await this.benchmarkMemoryThroughput();
        metrics.push({
            name: 'memory_ops_per_second',
            value: memOpsPerSec,
            unit: 'ops/sec',
            category: 'throughput',
            timestamp,
        });
        return metrics;
    }
    /**
     * Benchmark event bus operations
     */
    async benchmarkEventBus() {
        const { EventBus, createAgentSpawnedEvent } = await import('@claude-flow/shared');
        const eventBus = new EventBus();
        const iterations = 1000;
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            const event = createAgentSpawnedEvent(`bench-${i}`, 'worker', 'default', ['test']);
            await eventBus.emit(event);
        }
        const elapsed = performance.now() - start;
        return (elapsed / iterations) * 1000; // Convert to microseconds
    }
    /**
     * Benchmark memory operations
     */
    async benchmarkMemoryOps() {
        // Simulate memory operations with a simple Map
        const map = new Map();
        const iterations = 10000;
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            map.set(`key-${i}`, { data: `value-${i}`, timestamp: Date.now() });
        }
        for (let i = 0; i < iterations; i++) {
            map.get(`key-${i}`);
        }
        const elapsed = performance.now() - start;
        return (elapsed / (iterations * 2)) * 1000; // Convert to microseconds
    }
    /**
     * Benchmark event throughput
     */
    async benchmarkEventThroughput() {
        const { EventBus } = await import('@claude-flow/shared');
        const eventBus = new EventBus();
        let count = 0;
        eventBus.subscribe('agent:spawned', () => { count++; });
        const { createAgentSpawnedEvent } = await import('@claude-flow/shared');
        const duration = 1000; // 1 second
        const start = Date.now();
        while (Date.now() - start < duration) {
            const event = createAgentSpawnedEvent('bench-agent', 'worker', 'default', ['test']);
            await eventBus.emit(event);
        }
        return count;
    }
    /**
     * Benchmark memory throughput
     */
    async benchmarkMemoryThroughput() {
        const map = new Map();
        let count = 0;
        const duration = 1000; // 1 second
        const start = Date.now();
        while (Date.now() - start < duration) {
            const key = `key-${count}`;
            map.set(key, { data: count, timestamp: Date.now() });
            map.get(key);
            map.delete(key);
            count++;
        }
        return count;
    }
    /**
     * Load baseline from file
     */
    async loadBaseline() {
        if (this.cachedBaseline) {
            return this.cachedBaseline;
        }
        try {
            const content = await readFile(this.baselinePath, 'utf-8');
            this.cachedBaseline = JSON.parse(content);
            return this.cachedBaseline;
        }
        catch {
            return null;
        }
    }
    /**
     * Save baseline to file
     */
    async saveBaseline(baseline) {
        await mkdir(dirname(this.baselinePath), { recursive: true });
        await writeFile(this.baselinePath, JSON.stringify(baseline, null, 2));
    }
}
//# sourceMappingURL=performance-baseline.js.map