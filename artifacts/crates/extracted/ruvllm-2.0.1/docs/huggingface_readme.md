---
license: apache-2.0
language:
- en
library_name: ruvllm
tags:
- agent-routing
- claude-code
- embeddings
- gguf
- rust
- llm-inference
datasets:
- ruvnet/claude-flow-routing
pipeline_tag: text-generation
---

# RuvLTRA - Optimized Agent Routing Model

## v2.5 - Performance Optimized Edition

RuvLTRA is a purpose-built model family optimized for Claude Code agent routing, featuring HNSW-indexed pattern matching, zero-copy caching, and SIMD-accelerated inference.

### What's New in v2.5

| Optimization | Description | Improvement |
|--------------|-------------|-------------|
| **HNSW Index** | Hierarchical Navigable Small World graphs | 10x faster search at 10k entries |
| **O(1) LRU Cache** | Using Rust `lru` crate | 23.5 ns cache lookups |
| **Zero-Copy** | Arc<str> string interning | 100-1000x cache improvement |
| **Batch SIMD** | AVX2/NEON vectorization | 4x throughput |
| **Memory Pools** | Arena allocation | 50% fewer allocations |

### Benchmarks

| Operation | Performance |
|-----------|-------------|
| Query decomposition | 340 ns |
| Cache lookup | 23.5 ns |
| Memory search (10k entries) | ~0.4 ms |
| Pattern retrieval | <25 us |
| Routing accuracy (hybrid) | **100%** |
| Routing accuracy (embedding-only) | 45% |

### Models

| File | Size | Purpose | Context |
|------|------|---------|---------|
| `ruvltra-claude-code-0.5b-q4_k_m.gguf` | 398 MB | Agent routing | 32K |
| `ruvltra-small-0.5b-q4_k_m.gguf` | ~400 MB | General embeddings | 32K |
| `ruvltra-medium-3b-q4_k_m.gguf` | ~2 GB | Full LLM inference | 256K |

### Architecture

| Model | Parameters | Hidden | Layers | GQA | Features |
|-------|------------|--------|--------|-----|----------|
| RuvLTRA-Small | 494M | 896 | 24 | 7:1 | SONA hooks, HNSW routing |
| RuvLTRA-Medium | 3.0B | 2560 | 42 | 8:1 | Flash Attention 2, Speculative Decode |

### Usage

#### Python (HuggingFace Hub)

```python
from huggingface_hub import hf_hub_download

# Download the Claude Code routing model
model_path = hf_hub_download(
    repo_id="ruv/ruvltra",
    filename="ruvltra-claude-code-0.5b-q4_k_m.gguf"
)

# Use with llama.cpp or other GGUF-compatible runtimes
```

#### Rust (ruvllm crate)

```rust
use ruvllm::hub::{ModelDownloader, DownloadConfig};

// Download from Hub
let downloader = ModelDownloader::new(DownloadConfig::default());
let model_path = downloader.download(
    "ruv/ruvltra",
    Some("./models"),
)?;

// Load and use
use ruvllm::prelude::*;
let mut backend = CandleBackend::with_device(DeviceType::Metal)?;
backend.load_gguf(&model_path, ModelConfig::default())?;
```

#### JavaScript/TypeScript (npm)

```typescript
import { RuvLLM } from '@ruvector/ruvllm';

const llm = new RuvLLM({
  model: 'ruv/ruvltra',
  quantization: 'q4_k_m'
});

const result = await llm.route('implement authentication with JWT');
console.log(result.recommendedAgent); // 'coder'
console.log(result.confidence); // 0.95
```

### Claude Code Integration

RuvLTRA powers the intelligent 3-tier routing system in Claude Flow:

| Tier | Handler | Latency | Use Cases |
|------|---------|---------|-----------|
| **1** | Agent Booster | <1ms | Simple transforms (var->const, add-types) |
| **2** | Haiku | ~500ms | Simple tasks, bug fixes |
| **3** | Sonnet/Opus | 2-5s | Architecture, security, complex reasoning |

**Routing accuracy comparison:**

| Strategy | RuvLTRA | Qwen Base |
|----------|---------|-----------|
| Embedding Only | 45% | 40% |
| Keyword-First (Hybrid) | **100%** | 95% |

### Training Data

The Claude Code routing model was trained on:
- 381 labeled examples covering 60+ agent types
- 793 contrastive pairs for embedding fine-tuning
- Synthetic data generated via claude-code-synth.js
- LoRA fine-tuning on task-specific adapters

### Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Flash Attention | 2.49x-7.47x speedup | Achieved |
| HNSW Search | 150x-12,500x faster | Achieved |
| Memory Reduction | 50-75% with quantization | Achieved |
| MCP Response | <100ms | Achieved |
| SONA Adaptation | <0.05ms | Achieved |

### Links

- **Crate**: [crates.io/crates/ruvllm](https://crates.io/crates/ruvllm)
- **npm**: [npmjs.com/package/@ruvector/ruvllm](https://www.npmjs.com/package/@ruvector/ruvllm)
- **Docs**: [docs.rs/ruvllm](https://docs.rs/ruvllm)
- **GitHub**: [github.com/ruvnet/ruvector](https://github.com/ruvnet/ruvector)
- **Claude Flow**: [github.com/ruvnet/claude-flow](https://github.com/ruvnet/claude-flow)

### License

Apache-2.0 / MIT dual license.

### Citation

```bibtex
@software{ruvltra2025,
  author = {ruvnet},
  title = {RuvLTRA: Optimized Agent Routing Model for Claude Code},
  year = {2025},
  publisher = {HuggingFace},
  url = {https://huggingface.co/ruv/ruvltra}
}
```
