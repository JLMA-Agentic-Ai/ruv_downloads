# Production-Grade Tiny Recursive Model Router for AI Agent Orchestration

The research reveals that **sub-millisecond neural routing can achieve 85-99% cost reduction** compared to direct LLM inference while maintaining 90-95% quality.   Production implementations at Cloudflare demonstrate 309µs P50 latency with 20% improvement through Rust optimization,  while RouteLLM achieves 72% cost savings routing 74% of queries to lightweight models.  This guide provides complete implementation patterns for Rust core, WASM sandboxed inference, and TypeScript integration via NAPI-RS, enabling real-time agent decision-making with guaranteed uncertainty quantification through conformal prediction.

## Why this architecture matters for agent orchestration

AgentDB retrieval produces 50-100 memory candidates requiring scoring before expensive LLM evaluation. Without local routing, each agent decision costs $0.01-0.10 in API calls. A tiny FastGRNN model (under 1MB) can score candidates in 2-5µs each, routing only the top 3-5 to expensive models.  At 10,000 queries daily, this reduces costs from $200/day to $36-68/day—a **payback period under two months** with ongoing annual savings exceeding $47,000.   The system supports hot model updates via safetensors artifact loading, eliminating redeployment overhead while maintaining production reliability through circuit breaker patterns and graceful degradation.

The technical challenge lies in achieving sub-100µs per-candidate inference across three deployment targets while maintaining accuracy guarantees.  Rust provides zero-allocation hot paths with SIMD optimization,  WASM enables sandboxed edge deployment with microsecond cold starts, and NAPI-RS delivers zero-copy TypeScript interop for Node.js ecosystems.  Production examples from Cloudflare (9x PyTorch throughput),  Fastly (microsecond cold starts), and RouteLLM (85% cost reduction at 95% quality) validate this architecture at billion-request scale. 

## Rust core library implementation with optimal ML inference

The foundation requires selecting the right Rust ML inference library for sub-millisecond latency.  Research across production systems reveals **tract for edge/embedded deployments** and **ort (ONNX Runtime) for cloud environments** as optimal choices. Tract achieves 100-500µs inference entirely in pure Rust with 100-500µs latency for tiny models,  while ort delivers 50-200µs on CPU and 10-50µs with GPU TensorRT acceleration.  Both support INT8 quantization providing 4x size reduction and 2-3x speedup with under 1% accuracy loss. 

Cargo workspace structure should separate concerns across crates. The **router-core** crate contains pure inference logic with zero external dependencies beyond tract or ort. The **router-ffi** crate exposes C-compatible bindings for NAPI-RS consumption, wrapping all unsafe FFI operations in safe abstractions. The **router-wasm** crate targets wasm32-wasi with filesystem access for model loading. A **router-cli** binary enables standalone testing and benchmarking. This separation ensures clean compilation for multiple targets without cross-contamination of platform-specific code.

The production router implementation follows zero-allocation principles in the hot path. Pre-allocate input and output buffers during initialization, reusing them across inference calls to eliminate heap allocations.  Structure of Arrays (SoA) memory layout enables vectorized operations—store embeddings as contiguous `[N x D]` arrays rather than array-of-structs for cache-friendly SIMD processing.   Implement object pooling for temporary buffers using `Arc<Mutex<Vec<Vec<f32>>>>` to avoid allocation storms under concurrent load.

```rust
use tract_onnx::prelude::*;

pub struct NeuralRouter {
    model: SimplePlan<TypedFact, Box<dyn TypedOp>>,
    input_buffer: Vec<f32>,
    output_buffer: Vec<f32>,
}

impl NeuralRouter {
    pub fn new(model_path: &str, input_size: usize) -> Result<Self> {
        let model = tract_onnx::onnx()
            .model_for_path(model_path)?
            .with_input_fact(0, f32::fact(&[1, input_size]))?
            .into_optimized()?  // Critical: graph-level optimization
            .into_runnable()?;
        
        Ok(Self {
            model,
            input_buffer: vec![0.0; input_size],
            output_buffer: vec![0.0; 10],
        })
    }
    
    // Zero-allocation inference
    pub fn route(&mut self, features: &[f32]) -> Result<usize> {
        self.input_buffer[..features.len()].copy_from_slice(features);
        let tensor = Tensor::from_shape(&[1, features.len()], &self.input_buffer)?;
        let result = self.model.run(tvec!(tensor))?;
        let output = result[0].to_array_view::<f32>()?;
        Ok(output.iter().enumerate()
            .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
            .unwrap().0)
    }
}
```

SIMD optimization delivers 3-8x speedup on x86-64 and ARM platforms.  Implement runtime CPU feature detection to select optimal code paths—AVX2 with FMA on Intel, NEON on ARM.  For dot product operations critical to embedding similarity, AVX2 processes 8 float32 values per instruction versus scalar operations.  Compilation requires enabling target features in `.cargo/config.toml` with `rustflags = ["-C", "target-feature=+avx2,+fma"]` for x86 and `+neon` for ARM.   Production deployments should compile separate binaries per architecture or use runtime dispatch with `is_x86_feature_detected!("avx2")`. 

FFI safety requires careful attention at the Rust/TypeScript boundary. Never panic across FFI—use `std::panic::catch_unwind` at all exported functions.  Design opaque pointer types preventing TypeScript from directly manipulating Rust memory. Return structured error codes mapping to TypeScript exceptions.  The pattern used by libgit2 employs thread-local storage for detailed error context, allowing FFI functions to return simple integer codes while preserving stack traces and error details for retrieval by subsequent calls.  

## NAPI-RS integration for zero-copy TypeScript interop

NAPI-RS provides the bridge between Rust performance and TypeScript ergonomics through N-API, Node.js’s stable ABI. The build configuration requires precise package.json setup with platform-specific optional dependencies.  Create separate npm packages for each target—`@my-router/darwin-arm64`, `@my-router/linux-x64-gnu`, `@my-router/win32-x64-msvc`—allowing npm to automatically install only the correct binary for each platform.  The main package uses a platform detection loader checking `process.platform` and `process.arch` with special handling for musl vs glibc on Linux via `process.report?.getReport().header.glibcVersionRuntime`.

Zero-copy patterns eliminate serialization overhead for high-throughput scenarios. For passing feature vectors from TypeScript to Rust, use TypedArray views directly accessing the underlying ArrayBuffer. NAPI-RS `Buffer` type maps to Node.js Buffer without copying when marked as references.  For large embedding matrices, create External references wrapping Rust-owned memory, exposing it to JavaScript as TypedArray views. This pattern appears in production at Vercel’s SWC where parser ASTs remain in Rust memory with JavaScript holding typed array pointers to node data. 

```rust
use napi::{bindgen_prelude::*, Result};
use napi_derive::napi;

#[napi]
pub struct RouterEngine {
    inner: Arc<Mutex<NeuralRouter>>,
}

#[napi]
impl RouterEngine {
    #[napi(constructor)]
    pub fn new(model_path: String) -> Result<Self> {
        let router = NeuralRouter::new(&model_path, 384)
            .map_err(|e| Error::from_reason(format!("Model load failed: {}", e)))?;
        Ok(Self {
            inner: Arc::new(Mutex::new(router)),
        })
    }
    
    #[napi]
    pub fn route_sync(&self, features: Float32Array) -> Result<u32> {
        let features_slice = features.as_ref();
        let mut router = self.inner.lock().unwrap();
        
        std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            router.route(features_slice)
        }))
        .map_err(|_| Error::from_reason("Panic in routing"))
        .and_then(|r| r.map_err(|e| Error::from_reason(format!("{}", e))))
        .map(|v| v as u32)
    }
}
```

Async patterns integrate Rust’s tokio runtime with Node.js event loop through NAPI-RS async functions.  Mark Rust functions with `#[napi(ts_return_type = "Promise<RouteResponse>")]` to generate proper TypeScript definitions. The NAPI-RS runtime automatically bridges between tokio futures and JavaScript promises.  For CPU-bound synchronous operations like neural inference, spawn blocking tasks on tokio’s blocking thread pool using `tokio::task::spawn_blocking` to avoid starving the async runtime.  This matches patterns from Prisma’s Rust query engine handling synchronous database operations within async contexts.

Error handling requires structured categorization for proper TypeScript recovery strategies.  Define error enums with `#[napi]` distinguishing retriable errors (database timeouts, model busy) from permanent failures (invalid input, model corrupted).  The TypeScript wrapper implements circuit breaker logic based on error categories, falling back to heuristic routing when the neural router circuit opens after repeated failures. Production systems at Cloudflare follow this pattern for graceful degradation—local ML routing with fallback to simple rule-based routing, then fallback to default model selection if all routing fails.  

Cross-platform compilation presents significant complexity for native modules. GitHub Actions workflows should use matrix builds covering darwin-x64, darwin-arm64, linux-x64-gnu, linux-x64-musl, linux-arm64-gnu, win32-x64-msvc, and win32-arm64-msvc.   Linux ARM and musl targets require `cross` for containerized cross-compilation since GitHub runners lack native toolchains.  macOS builds must support both Intel and Apple Silicon, ideally producing universal binaries. Windows requires MSVC toolchain for Node.js compatibility despite GNU being available. Each platform produces a `.node` binary uploaded as artifacts, packaged into platform-specific npm packages during release workflow.

## WASM and WASI compilation for sandboxed portable inference

WebAssembly deployment enables edge inference in sandboxed environments with microsecond cold starts, as demonstrated by Fastly Compute’s production deployments.  The critical decision between wasm32-wasi and wasm32-unknown-unknown targets determines capabilities—**wasm32-wasi is strongly preferred for ML inference** due to filesystem access for model loading, POSIX-like standard library support, and WASI-NN API for hardware-accelerated inference through host-side ML backends like OpenVINO and TensorFlow Lite. 

Wasmtime emerges as the optimal runtime for production deployment based on official WASI implementation, excellent specification compliance, and **WASI-NN support with OpenVINO backend** enabling GPU acceleration.  Cranelift JIT delivers 85-95% of native performance with microsecond cold starts validated in Fastly’s billion-request infrastructure.   Alternative runtimes serve specific niches—Wasmer’s LLVM backend achieves 90-98% native performance for maximum single-threaded speed, WasmEdge integrates strongly with TensorFlow Lite for edge AI, and WAMR provides interpreter mode for resource-constrained devices at 3-10% native speed but 64KB code footprint. 

Compilation requires aggressive optimization to meet size and performance targets. Configure `Cargo.toml` release profile with `opt-level = 'z'` for size optimization, `lto = true` for link-time optimization across all crates, `codegen-units = 1` enabling aggressive inlining, and `panic = 'abort'` eliminating unwinding machinery saving 50-100KB.  Post-process with `wasm-opt -Oz` from Binaryen typically achieving additional 15-20% size reduction beyond LLVM’s output.   Production examples show 60-70% total size reduction from initial builds—a 1.9MB Rust binary optimizing to 1.6MB after compiler optimization then 600-800KB after wasm-opt convergent optimization.  

```bash
# Build for WASI with optimizations
cargo build --release --target wasm32-wasi

# Aggressive post-processing
wasm-opt target/wasm32-wasi/release/router.wasm \
  --converge -Oz \
  --intrinsic-lowering \
  -o router_opt.wasm

# Result: Typically 60-70% size reduction
```

WASI-NN integration provides the path to hardware acceleration while maintaining portability. The WASI-NN API abstracts over backend ML frameworks through standardized interfaces for graph loading, execution context management, and tensor operations. Wasmtime with OpenVINO backend enables leveraging Intel integrated GPUs and CPU vector instructions without WASM sandbox limitations.  This architecture separates concerns—WASM handles business logic and feature engineering in portable sandboxed code while host systems handle compute-intensive matrix operations on specialized hardware.

Memory constraints require careful model design within WASM’s 32-bit linear address space limiting processes to 4GB.  The Memory64 proposal addresses this for future deployments, but current production systems must either ensure models stay under size limits through quantization or implement model sharding. Cloudflare’s production ML inference compresses MobileNetV2 to kilobytes through 10x compression achieving 15-189ms inference depending on model size, with memory operations dominating latency for small models at 90%+ of total execution time.  Smart caching and 8-bit quantization reduce memory traffic from 48% to 26% of latency for larger models. 

SIMD acceleration provides 1.7-4.5x speedup over vanilla WASM according to TensorFlow.js benchmarks, with multi-threading adding 1.8-2.9x additional speedup for combined 10-13x improvement.  Enable SIMD via `-C target-feature=+simd128` when compiling to wasm32-wasi.  Threading requires SharedArrayBuffer support through wasi-threads proposal, currently experimental but functional in Wasmtime.  Production systems should provide non-SIMD fallbacks for compatibility with older runtimes while detecting and using SIMD when available for optimal performance.

## Tiny recurrent architecture with quantization and feature engineering

FastGRNN from Microsoft EdgeML represents the state-of-art for sub-1MB recurrent models, achieving **1-6KB model sizes** with accuracy matching full-size GRU and LSTM networks.  The architecture innovates through matrix reuse—the same W and U weight matrices serve both hidden state updates and gate computations, reducing parameters 2-4x versus traditional gated RNNs.  Low-rank matrix factorization further compresses weights: W = W1 × W2, U = U1 × U2. Combined with enforced sparsity during training, production deployments achieve 35x compression versus baseline LSTM with competitive accuracy. 

The training pipeline follows a four-phase approach starting with baseline FP32 model training. **Knowledge distillation from a larger LSTM teacher** boosts student FastGRNN accuracy 1-2 percentage points above independent training.  Progressive magnitude-based pruning targets 80-90% sparsity using polynomial schedules over 10 epochs, maintaining accuracy through iterative fine-tuning.  Final quantization to INT8 via post-training quantization or INT4 via quantization-aware training produces deployment-ready models. Production examples include Microsoft’s “Hey Cortana” keyword spotter at 1KB with 93% accuracy on Google Speech Commands dataset.  

INT8 post-training quantization delivers optimal balance between implementation simplicity and accuracy preservation. Symmetric quantization maps floating point values to signed INT8 range using scale factor `S = max(|α|, |β|) / 127` with zero-point at zero. Asymmetric quantization adds zero-point offset for better range utilization: `Q(r) = int(r/S) - Z`.  Calibration requires 100-1000 representative samples to determine activation ranges.  Expected impact: **75% memory reduction, 2-3x inference speedup, under 1% accuracy loss** for tiny models.  TensorFlow Lite Micro and CMSIS-NN provide optimized INT8 kernels for ARM Cortex-M class devices.  

Feature engineering for agent memory scoring combines dense semantic embeddings with sparse structural metrics. The **primary signal comes from cosine similarity** between query embedding and candidate embeddings, typically 384-768 dimensions from models like all-MiniLM-L6-v2.  Structural features augment semantic relevance: recency score using exponential decay `exp(-λ * days_old)`, access frequency normalized over fixed windows, historical success rate tracking useful retrievals, confidence scores from the model itself, and context match measuring tag/metadata overlap. The combined scoring function weights semantic similarity at 40%, recency at 25%, confidence at 20%, with remaining weight distributed across frequency and context signals.

Batch processing optimization requires Structure of Arrays (SoA) memory layout for vectorization. Store candidate embeddings as contiguous `[N x D]` matrix enabling single BLAS call for batch cosine similarity: `scores = candidates @ query`. Structural features occupy separate aligned arrays facilitating SIMD element-wise operations.   **Processing 50-100 candidates achieves 130-230µs total latency**—20-40µs embedding load, 50-80µs vectorized similarity computation, 30-50µs feature combination, 20-40µs top-k selection, 10-20µs conformal prediction thresholding. This yields 1.3-4.6µs per candidate meeting sub-100µs targets with headroom.

Conformal prediction integration provides distribution-free uncertainty quantification with finite-sample coverage guarantees. Split conformal prediction uses calibration set to compute non-conformity scores, then at inference time compares new scores against calibration quantile threshold.  For agent routing, absolute residual or rank-based scores work effectively. The implementation overhead remains minimal—4KB storage for 1000 calibration scores plus 5-10µs thresholding per inference. **The guarantee: at 90% confidence level, the prediction set contains the correct route with ≥90% probability** regardless of data distribution, providing reliable fallback triggers for circuit breaker logic.

## Integration with AgentDB using rusqlite and safetensors serialization

AgentDB’s SQLite-based architecture requires connection pooling for concurrent access without file locking contention. The **r2d2-sqlite** crate provides production-ready pooling with configurable size, timeout, and connection validation. Optimal pool sizing follows the formula `(2 * CPU_cores) + effective_spindles`, typically 10-20 connections for application servers.  Enable WAL mode via `PRAGMA journal_mode=WAL` for reader/writer concurrency—WAL allows unlimited concurrent readers while a single writer proceeds in parallel, critical for read-heavy agent memory retrieval patterns. 

Vector similarity search integration uses **sqlite-vec** extension providing L2 distance and cosine similarity operations.   Create virtual tables with `CREATE VIRTUAL TABLE embeddings USING vec0(embedding FLOAT[384])` enabling indexed vector search. Query patterns retrieve top-k candidates with distance thresholds: `SELECT id, metadata, vec_distance_L2(embedding, ?1) as distance FROM embeddings WHERE distance < ?2 ORDER BY distance LIMIT ?3`. Performance optimization requires pre-normalizing embeddings for cosine similarity conversion and building indexes on frequently queried metadata columns for hybrid search filtering candidates before distance computation.

```rust
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::{params, Connection};

pub async fn retrieve_context(
    pool: &Pool<SqliteConnectionManager>,
    query_embedding: &[f32],
    top_k: usize,
) -> Result<Vec<ContextChunk>> {
    let conn = pool.get()?;
    let mut stmt = conn.prepare_cached(
        "SELECT id, metadata, vec_distance_L2(embedding, ?1) as distance
         FROM embeddings
         WHERE distance < ?2
         ORDER BY distance ASC
         LIMIT ?3"
    )?;
    
    let chunks = stmt.query_map(
        params![query_embedding.as_bytes(), 0.5, top_k],
        |row| Ok(ContextChunk {
            id: row.get(0)?,
            metadata: serde_json::from_str(&row.get::<_, String>(1)?)?,
            distance: row.get(2)?,
        })
    )?;
    
    Ok(chunks.collect::<Result<Vec<_>, _>>()?)
}
```

ReasoningBank artifact storage requires safetensors format for weight serialization. Safetensors provides **zero-copy loading, cross-platform compatibility, and complete safety** versus pickle’s arbitrary code execution risk. The format consists of 8-byte header size, JSON metadata header, and raw tensor data in little-endian row-major layout.  Loading 8GB models takes under 45 seconds versus 10 minutes with PyTorch. Lazy loading enables distributed inference by loading only required tensor slices.   Metadata embedding supports versioning with semantic version tags, creation timestamps, model type identifiers, and checksums for integrity verification.

Hot-reloading architecture uses `Arc<RwLock<HashMap<String, Arc<Model>>>>` pattern enabling atomic model updates without downtime. The registry maintains version-keyed model cache with current version pointer. Update operations acquire write lock, insert new model, atomically swap version pointer—in-flight requests complete with old model while new requests immediately use updated weights. This pattern appears in production at companies running continuous model improvement pipelines, deploying updated routing models every few hours without service interruption. Monitoring tracks version distribution across requests during rollout to detect issues before full deployment.

Semantic versioning scheme structures model versions as `v{MAJOR}.{MINOR}.{PATCH}` where MAJOR indicates breaking architecture changes incompatible with existing deployment code, MINOR represents backward-compatible accuracy improvements or feature additions, and PATCH covers bug fixes and small adjustments. The deployment system checks version compatibility at load time, refusing to load models with incompatible MAJOR version. Rollback procedures maintain last-known-good version pointers enabling instant reversion to previous model on detection of accuracy degradation or inference errors.

## Comprehensive benchmarking with criterion and production monitoring

Criterion.rs provides statistically rigorous benchmarking for Rust components with automatic warm-up, sample collection, outlier detection, and change detection at configurable significance levels.   The framework executes 3-second warm-up by default followed by 100 samples over approximately 5 seconds per benchmark, analyzing results with robust statistics identifying mild and severe outliers. **Benchmark groups organize related tests** with throughput tracking—comparing small model routing at 100-500µs against full LLM inference at 50-200ms demonstrates the cost-latency tradeoff clearly.

```rust
use criterion::{criterion_group, criterion_main, Criterion, Throughput};

fn bench_routing(c: &mut Criterion) {
    let mut group = c.benchmark_group("Candidate Scoring");
    group.throughput(Throughput::Elements(100)); // 100 candidates
    
    let router = setup_router();
    let candidates = generate_test_candidates(100);
    
    group.bench_function("neural_routing", |b| {
        b.iter(|| router.score_batch(&candidates))
    });
    
    group.bench_function("llm_baseline", |b| {
        b.iter(|| llm_score_batch(&candidates))
    });
    
    group.finish();
}

criterion_group!(benches, bench_routing);
criterion_main!(benches);
```

Performance profiling uses flamegraph for visualizing hot paths and bottlenecks.   Install `cargo-flamegraph` and run with `cargo flamegraph --bench routing_benchmark` generating interactive SVG showing time distribution across call stacks.  Enable debug symbols in release builds via `CARGO_PROFILE_RELEASE_DEBUG=true` and frame pointers with `RUSTFLAGS="-C force-frame-pointers=yes"` for accurate stack traces.  Linux perf integration provides detailed hardware counter analysis—cache misses, branch mispredictions, instruction-level parallelism metrics guiding SIMD optimization efforts.

Memory profiling detects leaks and optimization opportunities through heaptrack or valgrind. Heaptrack provides **20x faster analysis than valgrind** with frequency analysis identifying hot allocation paths suitable for object pooling.  Profile with `heaptrack ./router` then analyze via GUI showing allocation timelines, size histograms, and call tree aggregation. Production Rust code should validate zero allocations in hot paths using dhat’s testing mode: `let _profiler = dhat::Profiler::builder().testing().build()` followed by assertions on `HeapStats::get().total_blocks` equaling zero after inference calls. 

Cost analysis framework tracks actual API expenditure versus projected costs with neural routing. Instrument token counting at LLM boundaries with counters for model type—`tokens_used_total{model="gpt-4"}` and `tokens_used_total{model="mixtral-8x7b"}`. Calculate real-time cost using latest pricing: GPT-4 at $10/1M input + $30/1M output tokens, Claude 3.5 Sonnet at $3/1M input + $15/1M output tokens.   Compare against baseline scenario routing 100% traffic to strongest model. **RouteLLM production data shows 72% cost reduction** routing 74% of queries to Mixtral while maintaining 95% of GPT-4 quality on MT Bench evaluation.  

Prometheus metrics capture operational health across multiple dimensions.  Track request rate, latency percentiles (p50/p95/p99), error rates categorized by type, routing decision distribution showing model selection frequencies, confidence score distributions detecting drift, cache hit rates for embedding lookups, database pool utilization, memory usage, and CPU utilization.  ML-specific metrics include prediction confidence histograms identifying low-confidence queries requiring fallback, fallback usage counters tracking circuit breaker activations, and quality estimates when ground truth becomes available for continuous accuracy monitoring. 

```typescript
// Essential metrics for production monitoring
metrics.histogram('routing.latency_ms', latency, {
    route: selectedRoute,
    cache_hit: cacheHit,
});

metrics.counter('routing.decisions_total', 1, {
    route: selectedRoute,
    confidence_bucket: confidenceBucket(confidence),
});

metrics.counter('routing.fallback_used', 1, {
    reason: 'circuit_breaker_open',
});

metrics.gauge('routing.circuit_breaker_state', stateValue, {
    breaker_id: 'neural_router',
});
```

A/B testing methodology validates routing improvements through champion-challenger comparisons with statistical rigor.  Implement consistent hashing user assignment ensuring each user sees the same variant throughout the test period, eliminating within-user variance. Calculate required sample size based on minimum detectable effect—to detect 2% improvement in 92% baseline accuracy requires approximately 8,000 samples per variant at 80% power and 5% significance level. Run tests minimum 1 week to capture weekly patterns, monitoring primary metrics (cost reduction, quality maintenance), secondary metrics (latency, throughput), and guardrail metrics (system health, error rates) continuously. Deploy winning variants via gradual rollout: 10% → 50% → 100% with automated rollback on metric degradation.

## Production deployment patterns and reliability engineering

Multi-platform deployment requires systematic GitHub Actions workflows with matrix builds across all target platforms. The workflow stages include platform-specific builds producing .node binaries for NAPI-RS targets and .wasm modules for web deployment, followed by unit testing in Rust via `cargo test`, integration testing in TypeScript consuming built modules, automated benchmarking with criterion comparing against baseline performance, and security scanning with `cargo audit` and npm audit.  Successful builds trigger publishing to npm as platform-specific optional dependency packages, with the main package loading the appropriate binary at runtime.

```yaml
strategy:
  matrix:
    include:
      - os: macos-latest
        target: aarch64-apple-darwin
        name: darwin-arm64
      - os: ubuntu-latest
        target: x86_64-unknown-linux-gnu  
        name: linux-x64-gnu
      - os: ubuntu-latest
        target: x86_64-unknown-linux-musl
        name: linux-x64-musl
        use-cross: true
      - os: windows-latest
        target: x86_64-pc-windows-msvc
        name: win32-x64-msvc
```

Error handling architecture across the FFI boundary requires structured categorization and safe panic handling. **Never allow Rust panics to cross FFI**—wrap all `#[napi]` functions in `std::panic::catch_unwind` converting panics to structured errors.  Define error enums distinguishing model inference failures, database connection errors, invalid input errors, and internal panics. The TypeScript layer implements error categorization determining retry eligibility, logging context, metrics tags, and fallback strategies. Circuit breaker pattern tracks failure rates per category, opening circuit after configurable threshold (typically 5 failures in 60 seconds), automatically attempting reset after cooldown period.

Graceful degradation implements three-level fallback strategy ensuring the system always provides responses. **Level 1 uses cached routing decisions** from recent similar queries, trading slight staleness for continued operation during neural router unavailability. Level 2 applies heuristic-based routing using keyword matching and query characteristics—code-related queries route to capable models, simple questions to fast models. Level 3 provides degraded service routing all queries to default strong model, eliminating cost savings but maintaining functionality. Each fallback level logs degradation state, increments monitoring counters, and triggers alerts at appropriate severity levels.

```typescript
class ResilientRouter {
    async route(query: string): Promise<RouteDecision> {
        // Try neural router with circuit breaker
        try {
            if (this.circuitBreaker.isOpen()) {
                return this.fallbackRoute(query, 'circuit_open');
            }
            
            const decision = await this.neuralRouter.route(query);
            this.circuitBreaker.recordSuccess();
            return decision;
        } catch (error) {
            this.circuitBreaker.recordFailure();
            logger.warn('Neural routing failed, using fallback', { error });
            return this.fallbackRoute(query, error.category);
        }
    }
    
    private fallbackRoute(query: string, reason: string): RouteDecision {
        metrics.increment('routing.fallback', { reason });
        
        // Level 1: Cache
        const cached = this.cache.getSimilar(query);
        if (cached && cached.confidence > 0.7) {
            return cached.decision;
        }
        
        // Level 2: Heuristics
        if (this.isComplexQuery(query)) {
            return { route: 'gpt-4', confidence: 0.6, fallback: true };
        }
        
        // Level 3: Default
        return { route: 'gpt-3.5-turbo', confidence: 0.5, fallback: true };
    }
}
```

Health check implementation provides comprehensive system status for load balancers and monitoring systems. Verify model loaded successfully with non-null weight tensors, database connection pool responds within timeout showing available idle connections, memory usage remains below threshold (typically 90% of available), circuit breaker state indicates operational status not stuck open, and recent inference calls succeed within latency budgets. Return structured JSON with overall status (healthy/degraded/unhealthy), individual component checks with timestamps, and version information enabling deployment tracking. Production systems expose health endpoints on separate ports from application traffic preventing health check storms from impacting user requests.

Observability strategy combines metrics, logs, and traces providing complete operational visibility. Structured logging with JSON formatting enables log aggregation and analysis in ELK stack or Loki. Include query hash (not query content for privacy), routing decision, confidence score, context chunks retrieved, execution duration, fallback status, and model version in every log entry. Distributed tracing with Jaeger or Zipkin tracks request flow from AgentDB retrieval through neural routing to final LLM call, identifying bottlenecks in the pipeline. Metrics feed Grafana dashboards showing request rate time series, latency heatmaps, model selection distribution, cost tracking with daily/weekly trends, quality metrics when available, and error rates by category.

## Complete implementation roadmap with testing strategy

Phase 1 establishes Rust core library with tract or ort inference engine, implementing zero-allocation hot path with buffer reuse, SIMD-optimized feature engineering for batch scoring, and comprehensive criterion benchmarks verifying sub-100µs per-candidate latency. Unit tests validate numerical accuracy against reference implementations, edge cases like empty candidate lists and malformed embeddings, and memory safety through miri and sanitizers. Target completion: 2 weeks.

Phase 2 builds NAPI-RS bindings exposing TypeScript API with typed interfaces, implementing zero-copy buffer passing for embeddings, async inference methods returning promises, and structured error handling with categorization. Integration tests verify multi-platform builds (macOS, Linux, Windows), concurrent request handling under load, memory leak detection running extended test workloads, and graceful error recovery including panic catching. Package as platform-specific npm modules with automatic platform detection. Target completion: 2 weeks.

Phase 3 compiles WASM target with wasm32-wasi for filesystem access, optimizes binary size with LTO and wasm-opt achieving sub-1MB target, integrates WASI-NN when hardware acceleration available, and benchmarks cold start time and inference latency in wasmtime. Deployment testing validates Fastly Compute or Cloudflare Workers edge platforms, verifies sandboxing isolation preventing resource access violations, and profiles memory usage within WASM linear memory constraints. Target completion: 1-2 weeks.

Phase 4 implements feature engineering pipeline combining semantic similarity from vector search with structural metrics (recency, confidence, frequency), develops FastGRNN training pipeline with knowledge distillation from teacher model, applies quantization to INT8 with accuracy validation, and integrates conformal prediction with calibration on validation set. Model training achieves target accuracy within 2-3% of baseline while meeting size budget under 1MB quantized. Target completion: 2-3 weeks.

Phase 5 integrates with AgentDB using rusqlite connection pooling, implements sqlite-vec for vector similarity search, creates safetensors-based model artifact storage with versioning, and develops hot-reload mechanism for zero-downtime updates. Database integration tests verify concurrent access patterns, query performance for 50-100 candidate retrieval, and backup/restore procedures. Target completion: 1-2 weeks.

Phase 6 establishes production monitoring with Prometheus metrics, Grafana dashboards, and alerting rules, implements circuit breaker with configurable thresholds and graceful degradation, develops comprehensive logging with structured JSON output, and creates health check endpoints. Observability testing validates metric collection under load, alert firing on threshold violations, and dashboard accuracy. Target completion: 1 week.

Phase 7 conducts A/B testing comparing neural routing against baseline, measures cost reduction with actual API expenditure tracking, validates quality maintenance via user satisfaction or benchmark scores, and analyzes performance impact on latency and throughput. Statistical analysis determines significance with proper power calculation and duration. Gradual rollout proceeds 5% → 25% → 50% → 100% with automated rollback on degradation. Target completion: 2-3 weeks including observation period.

## Testing strategy and CI/CD pipeline design

Unit testing in Rust uses built-in test framework with property-based testing via proptest for numerical robustness. Test zero-allocation property using dhat profiler in testing mode asserting no heap allocations occur during inference calls. Validate SIMD implementations against scalar reference implementations with fuzzing to detect edge cases. Mock filesystem for model loading tests enabling isolation without test data dependencies. Run with `cargo test --all-features` covering all compilation configurations.

Integration testing in TypeScript exercises complete request lifecycle from candidate retrieval through routing decision. Test platform-specific builds by running on actual target operating systems in CI matrix. Verify concurrent request handling spawning hundreds of parallel requests measuring throughput and detecting race conditions. Memory leak detection runs extended workload for 10,000+ iterations monitoring RSS growth with automatic failure on monotonic increase. Error injection tests validate graceful degradation forcing various failure modes including model corruption, database unavailability, and panic conditions.

Benchmark automation uses criterion with baseline comparison detecting regressions exceeding 10% threshold. Store baseline measurements in Git repository enabling historical tracking across commits. Run benchmarks on dedicated hardware or consistent CI runners preventing variance from virtualization. Profile hot paths with flamegraphs automatically generating reports attached to CI runs for performance investigation. Alert on benchmark failures blocking merge until performance investigation completes.

Deployment pipeline implements canary releases testing new versions on production traffic subset. Start with 5% traffic to challenger variant monitoring error rates, latency percentiles, and routing quality for 30 minutes minimum. Expand to 25%, 50%, 75%, 100% with observation at each stage. Automated rollback triggers on error rate exceeding 2x baseline, P95 latency exceeding 1.5x baseline, or circuit breaker opening indicating systemic failures. Manual approval required for final 100% rollout despite automated canary success.

## Expected cost savings and ROI analysis

Conservative scenario targeting 70% cost reduction processes 10,000 queries daily with baseline cost $0.02 per query totaling $200/day. Neural routing sends 30% to strong models (GPT-4/Claude) and 70% to local/weak models achieving $68/day operational cost. **Daily savings of $132 compound to $48,240 annually** while maintaining 92-95% of strong model quality. Implementation requires 8-10 weeks engineering effort with minimal infrastructure overhead beyond model hosting. Break-even occurs within 2 months for typical engineering costs.

Aggressive scenario targeting 85% cost reduction maintains same baseline but routes only 15% queries to strong models through higher confidence thresholds. Operational cost drops to $36/day for **$164 daily savings or $59,856 annual savings**. Quality maintained at 90-93% of strong model performance, acceptable for many applications. The tradeoff analysis considers domain requirements—customer support systems may require conservative thresholds maintaining 95% quality while internal tools accept aggressive routing for maximum savings.

RouteLLM production data from LMSYS provides validated benchmarks across multiple evaluation suites. On MT Bench testing multi-turn conversation quality, matrix factorization router achieves 85% cost reduction while maintaining 95% of GPT-4 performance. On MMLU testing broad knowledge, 45% cost reduction at 95% quality. On GSM8K testing mathematical reasoning, 35% cost reduction at 95% quality. Domain-specific tuning improves these numbers—healthcare startup reported 60% cost reduction without accuracy loss through custom router training on medical conversations.

Enterprise deployment examples demonstrate production viability at scale. Cloudflare processes billions of inference requests using WASM-based ML routing achieving microsecond latencies globally distributed. Fastly Compute runs ML inference on edge nodes with cold start times measured in microseconds versus 50-200ms for container-based systems. IBM RouterBench demonstrates 13B parameter models outperforming 70B models through intelligent routing achieving 85% cost reduction. Legal team reduced token usage 50% through prompt optimization plus routing, combined with caching for 90% total cost reduction validating multi-technique approaches.

## Conclusion: Building production-grade AI routing infrastructure

This architecture delivers proven cost reduction through local neural routing while maintaining production reliability and quality guarantees. The combination of **Rust’s zero-allocation performance**, **WASM’s portable sandboxing**, and **NAPI-RS’s zero-copy TypeScript interop** enables sub-millisecond candidate scoring across deployment environments. FastGRNN models under 1MB achieve 90%+ accuracy with INT8 quantization, safetensors enables hot model updates without redeployment, and conformal prediction provides distribution-free coverage guarantees for routing confidence.

Production patterns from Cloudflare, Fastly, and LMSYS validate this approach at billion-request scale. Comprehensive benchmarking with criterion and flamegraph ensures performance targets, while Prometheus monitoring and circuit breaker patterns guarantee reliability. The investment returns within 2 months through 70-85% cost reduction, scaling to $48,000-60,000 annual savings for modest 10,000 query/day workloads. Implementation follows the 7-phase roadmap completing in 8-10 weeks from initial Rust core to production deployment with A/B validation.

The future roadmap includes Memory64 for larger model support, WASI-NN v2 expanding backend coverage to PyTorch and native ONNX Runtime, wasi-threads enabling parallel batch processing, and WebGPU integration for browser-based GPU acceleration. Current technology provides production-ready infrastructure today with clear path to enhanced capabilities as WebAssembly ecosystem matures. Organizations processing over 1,000 agent queries daily should implement this architecture for immediate ROI and long-term scalability supporting multi-agent AI systems.