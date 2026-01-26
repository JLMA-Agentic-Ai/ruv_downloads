# Ruvnet Ecosystem Downloader & Artifacts

> **📊 Repository Stats**: 871 total artifacts | 198 Rust crates | 219 NPM packages | 164 GitHub repositories

This repository provides tools to automatically discover, download, and manage the complete **Ruvnet ecosystem** across multiple platforms. It's a comprehensive collection of production-grade packages for AI agents, robotics, financial trading, distributed systems, and advanced computation.

## 📚 Documentation

- **[Complete Ecosystem Guide](RUV_DOWNLOADS_COMPLETE_GUIDE.md)** - Comprehensive documentation with detailed package descriptions, performance metrics, and integration patterns
- This README provides quick-start instructions and an overview

## Repository Structure

```
ruv_downloads/
├── artifacts/                 # Centralized artifact storage
│   ├── crates/                # Rust crates (archives, extracted, legacy)
│   ├── npm/                   # NPM packages (archives, extracted, legacy)
│   ├── repos/                 # GitHub repositories
│   ├── gists/                 # GitHub gists
│   └── index.json             # Search index
│
├── manifests/                 # Centralized manifests
│   ├── crates.txt
│   ├── packages.txt
│   ├── repos.txt
│   └── gists.txt
│
├── scripts/                   # Optimized scripts
│   ├── download_all_optimized.sh
│   ├── ruv_index.sh
│   ├── ruv_query.sh
│   └── ...
│
├── lib/                       # Shared libraries (cache, checksum, parallel)
│
└── ruv_world.sh               # Main orchestrator
```

## Key Features

- **🔍 Automatic Discovery**: Queries NPM registry, Crates.io, and GitHub API to find new ruvnet packages
- **📦 Version Management**: Keeps only the latest version in main directory, archives older versions
- **🔄 Incremental Updates**: Smart update strategy checks remote hashes before downloading
- **📂 Auto-Extraction**: Automatically unpacks archives for easy code inspection
- **📝 Manifest-Driven**: Single source of truth via dynamic `.txt` manifests
- **🎯 Multi-Platform**: Darwin, Linux, Windows support (x64, ARM64)

## Quick Start

### 🌍 All-In-One: RUV WORLD Script

The easiest way to download and update everything:

```bash
# Run centralized script (discovers and downloads all artifacts)
./ruv_world.sh

# This will:
# 1. Download/update all Rust crates
# 2. Download/update all NPM packages
# 3. Download/update all GitHub repositories
# 4. Auto-update documentation if counts change
```

**Features:**
- 🎨 Colorful progress output
- 📊 Change detection and reporting
- 📝 Automatic documentation updates
- ⚡ Single command for everything

**Options:**
```bash
./ruv_world.sh --no-discover      # Update existing only (no discovery)
./ruv_world.sh --no-update-docs   # Skip documentation updates
./ruv_world.sh --help             # Show help
```

---

### Manual: Download All Artifacts

```bash
# Navigate to repository
cd ruv_downloads

# Discover and download all Rust crates
./scripts/download_crates_optimized.sh --discover

# Discover and download all NPM packages
./scripts/download_npm_optimized.sh --discover

# Discover and download all GitHub repositories
./scripts/download_repos_optimized.sh --discover

# Discover and download all GitHub Gists
./scripts/download_gists_optimized.sh --discover

# Verify downloads
cat manifests/crates.txt | wc -l      # Should be ~198
cat manifests/packages.txt | wc -l    # Should be ~219
cat manifests/repos.txt | wc -l       # Should be ~164
cat manifests/gists.txt | wc -l       # Should be ~290
```

### Update Existing Artifacts

```bash
# Update Rust crates (no --discover flag)
./scripts/download_crates_optimized.sh

# Update NPM packages
./scripts/download_npm_optimized.sh

# Update GitHub repositories (incremental)
./scripts/download_repos_optimized.sh
```

## Ecosystem Highlights

### Agentic Systems
- `agentic-jujutsu` - Lock-free version control for AI agents (350 ops/s, 23x faster than Git)
- `agentic-robotics-core` - ROS2-compatible robotics middleware (<1µs latency, 10x faster)
- `agentic-payments` - Dual-protocol payment infrastructure (10k+ TPS)

### AI Security & Defense
- `aimds-detection` - Real-time threat detection (<10ms latency)
- `aimds-analysis` - Behavioral analysis with LTL verification (<520ms)

### Vector Databases
- `ruvector-core` - High-performance HNSW indexing (1M vectors, <5ms search)
- `ruvector-gnn` - Graph neural network integration (10x compression)

### Neural Trading
- `nt-core` - Neural trading system foundation
- `nt-backtesting` - Historical backtesting engine (100x real-time)

### Distributed Systems
- `qudag` - Quantum-resistant DAG consensus (100k+ ops/sec, <100ms finality)
- `qudag-crypto` - Post-quantum cryptography (ML-DSA, ML-KEM)

## Performance Highlights

| System | Metric | Value |
|--------|--------|-------|
| **agentic-robotics-core** | Pub/sub latency | <1 µs |
| **aimds-detection** | Threat detection | <10ms |
| **ruvector** | Search latency | <5ms (p99) |
| **qudag** | Consensus latency | <100ms |
| **agentic-jujutsu** | Concurrent commits | 350 ops/s |

## Usage Examples

### Using Individual Rust Crates

```bash
# Add to your Cargo.toml
cargo add agentic-robotics-core
cargo add ruvector-core
cargo add qudag

# Use in Rust code
use agentic_robotics_core::Node;
let node = Node::new("robot")?;
```

### Using Individual NPM Packages

```bash
# Install from local directory
npm install ./artifacts/npm/extracted/agentic-robotics-2.1.5

# Import in TypeScript/JavaScript
import { RoboticSystem } from 'agentic-robotics';
const robot = new RoboticSystem('warehouse-bot');
```

## Archive Operations

```bash
# View downloaded .crate files
ls -lh artifacts/crates/archives/*.crate | head -20

# View downloaded .tgz files  
ls -lh artifacts/npm/archives/*.tgz | head -20

# Check legacy archives
ls artifacts/crates/legacy/
ls artifacts/npm/legacy/

# Manually extract a crate (automatic extraction is enabled by default)
tar xzf artifacts/crates/archives/qudag-1.4.0.crate -C artifacts/crates/extracted/
```

## Contributing

This repository automatically tracks the Ruvnet ecosystem. To add packages to the manifests, use the `--discover` flag which queries the registries.

## License

MIT/Apache-2.0 (dual) - See individual package licenses

---

**Last Updated**: January 26, 2026
**Maintained by**: Ruvnet Community  
**Complete Documentation**: [RUV_DOWNLOADS_COMPLETE_GUIDE.md](RUV_DOWNLOADS_COMPLETE_GUIDE.md)
