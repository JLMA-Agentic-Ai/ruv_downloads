# RUV_DOWNLOADS: Complete Comprehensive Ecosystem Guide

## Executive Summary

**RUV_DOWNLOADS** is a sophisticated repository that automatically discovers, downloads, and manages **554 total artifacts**: **193 Rust crates**, **195 NPM packages**, and **166 GitHub repositories** from the Ruvnet ecosystem. This represents a production-grade ecosystem for AI agents, robotics, financial trading systems, distributed networks, and advanced computation.

---

## Table of Contents

1. [Overview](#overview)
2. [Repository Structure](#repository-structure)
3. [Complete Rust Crates Directory](#complete-rust-crates-directory)
4. [Complete NPM Packages Directory](#complete-npm-packages-directory)
5. [Complete GitHub Repositories Directory](#complete-github-repositories-directory)
6. [Usage Instructions](#usage-instructions)
7. [Integration Patterns](#integration-patterns)
8. [Performance Characteristics](#performance-characteristics)

---

## Overview

### Repository Information
- **Type**: Package discovery and distribution system
- **Scope**: 554 artifacts (193 Rust crates + 195 NPM packages + 166 GitHub repositories)
- **Maintained by**: Ruvnet Community
- **Update Frequency**: Automatic discovery and versioning
- **Storage**: Organized archives with legacy support

### Key Capabilities
- **Automatic Discovery**: Queries NPM registry and crates.io API
- **Dynamic Manifests**: Single sources of truth (`.txt` files)
- **Version Management**: Keeps latest versions available
- **Legacy Archiving**: Older versions organized in `legacy_*` folders
- **Automatic Extraction**: Archives extracted for easy inspection
- **Multi-platform**: Darwin, Linux, Windows support (x64, ARM64)

---

## Repository Structure

```
ruv_downloads/
├── README.md                              # Main overview
├── RUV_DOWNLOADS_COMPLETE_GUIDE.md       # This document
│
├── crates/                                # 193 Rust crates
│   ├── README.md                          # Crate management documentation
│   ├── download_ruvnet_crates.sh          # Download script with --discover flag
│   ├── crates.dynamic.txt                 # Dynamic manifest (auto-maintained)
│   │
│   ├── agentic-jujutsu-1.0.1/            # Version-specific directories
│   ├── ... [155+ more crates] ...
│
├── npmjs/                                 # 195 NPM packages
│   ├── README.md                          # Package management documentation
│   ├── download_ruvnet_packages.sh        # Download script with --discover flag
│   ├── packagelist.dynamic.txt            # Dynamic manifest (auto-maintained)
│   │
│   ├── agentic-jujutsu-2.3.6/            # Version-specific directories
│   ├── ... [156+ more packages] ...
│
├── github/                                # 160+ GitHub Repositories
│   ├── download_ruvnet_repos.sh           # Download script (incremental updates)
│   ├── repos.dynamic.txt                  # Dynamic manifest
│   │
│   ├── by-tier/                           # Organized by tier
│   │   ├── tier-1-active/                 # Active development
│   │   ├── tier-2-stable/                 # Stable releases
│   │   ├── tier-3-maintenance/            # Maintenance mode
│   │   └── tier-4-archive/                # Archived projects
│   │
│   └── scripts/                           # Helper scripts

│
├── 00_crates/                             # Rust crate archives
│   ├── *.crate                            # Downloaded .crate files
│   └── legacy_crates/                     # Previous versions
│
├── 00_tgz/                                # NPM package archives
│   ├── *.tgz                              # Downloaded .tgz files
│   └── legacy_tgz/                        # Previous versions
│
└── [Configuration & Tools]
    ├── .gitignore
    ├── .github/workflows/
    └── [Other config files]
```

---

## Complete Rust Crates Directory

### Total: 193 Rust Crates

#### 1. AGENTIC SYSTEMS CRATES (8 total)

##### **agentic-jujutsu** (v1.0.1) - Version Control for AI Agents
- **GitHub**: ruvnet/agentic-jujutsu
- **Purpose**: Lock-free version control built on Jujutsu VCS
- **Key Features**:
  - WASM-powered CLI and server
  - MCP (Model Context Protocol) integration with 4 tools
  - AST transformation for AI-readable format
  - Lock-free multi-agent support
  - Performance: 350 ops/s concurrent commits (23x vs Git's 15 ops/s)
- **Installation**: `cargo add agentic-jujutsu`
- **Key API**:
  - `jj_status` - Repository status
  - `jj_log` - Commit history
  - `jj_diff` - View changes
  - `jj_push` - Push changes
- **MCP Resources**:
  - `jujutsu://config` - Configuration resource
  - `jujutsu://operations` - Operations log
- **Performance**: Sub-microsecond latency, 33KB gzipped WASM
- **Use Cases**: Multi-agent code generation, autonomous code review, ML model checkpointing
- **Dependencies**: jujutsu-core, wasm-bindgen, tokio
- **Test Coverage**: 95%+ (50+ tests)

##### **agentic-payments** (v0.1.0) - Dual-Protocol Payment Infrastructure
- **Purpose**: Autonomous AI commerce with AP2 and ACP protocols
- **Protocols**:
  - **AP2** (Agent Payments Protocol): W3C DIDs, Verifiable Credentials, cryptographic trust
  - **ACP** (Agentic Commerce Protocol): Stripe-compatible REST API, instant checkout
- **Key Features**:
  - Ed25519 digital signatures (512-bit)
  - Byzantine Fault Tolerance (survives f malicious in 2f+1 pools)
  - HMAC-SHA256 webhook signatures
  - Shared Payment Tokens (SPT)
  - Multi-agent consensus (⅔+ quorum required)
  - SPT validation and revocation
- **Performance**: 10,000+ transactions/sec, <50ms authorization latency
- **REST Endpoints**:
  - POST `/checkout_sessions` - Create session
  - GET `/checkout_sessions/:id` - Retrieve session
  - POST `/checkout_sessions/:id/complete` - Finalize checkout
  - POST `/agentic_commerce/delegate_payment` - Delegate payment
  - DELETE `/checkout_sessions/:id` - Cancel session
- **Webhook Events**:
  - `checkout.session.created`
  - `checkout.session.completed`
  - `agent.delegation.received`
- **Test Coverage**: 227+ tests, 98%+ coverage
- **WASM Support**: Browser, Node.js, Deno, Bun compatible
- **Dependencies**: serde, tokio, ed25519-dalek, sha2
- **Use Cases**: E-commerce, B2B procurement, DeFi, mobile commerce

##### **agentic-robotics-core** (v0.1.2) - High-Performance Robotics Middleware
- **Purpose**: ROS2-compatible Rust-based pub/sub messaging, 10x faster than ROS2
- **Performance Benchmarks**:
  - Message serialization: 540 ns (9.3x faster than ROS2)
  - Pub/sub latency: <1 µs (10-50x faster)
  - Throughput: 1.8M msg/s (18x faster)
  - Serialization overhead: 8% (vs ROS2's 75%)
- **Key Features**:
  - Sub-microsecond latency (< 1 µs pub/sub)
  - Lock-free pub/sub architecture using ring buffers
  - Zero-copy serialization with bytes::Bytes
  - Type-safe message passing
  - CDR (Common Data Representation) serialization
  - DDS (Data Distribution Service) compatibility
  - Zenoh transport layer option
- **Installation**: `cargo add agentic-robotics-core`
- **Key API**:
  ```rust
  let mut node = Node::new("robot_name");
  let pub = node.create_publisher::<Position>("position")?;
  let sub = node.create_subscriber::<Position>("position")?;
  pub.publish(position, QosProfile::default())?;
  ```
- **QoS Profiles**:
  - Best Effort: 1-2 µs latency
  - Reliable: 2-3 µs latency with acknowledgment
  - Durable: With historical data
- **ROS2 Bridge**: DDS backend for native ROS2 compatibility
- **Message Types**: All DDS IDL types supported (structs, arrays, sequences)
- **Dependencies**: tokio, bytes, serde, zenoh (optional)
- **Use Cases**:
  - Autonomous vehicles (vehicle-to-vehicle < 50ms)
  - Industrial robots (100Hz+ control loops)
  - Multi-robot coordination (swarm > 100 robots)
  - Sensor fusion (fusion latency < 1ms)

##### **agentic-robotics-embedded** (v0.1.2) - Embedded Systems Support
- **Purpose**: No-std compatible robotics for microcontrollers
- **Features**:
  - RTIC (Real-Time Interrupt-driven Concurrency) integration
  - Embassy async/await runtime support
  - <50KB total code size
  - Zero-allocation design
  - Low power optimization (<10mW idle)
  - Hardware timer integration
- **Supported Platforms**:
  - **STM32**: F4, F7, H7, L4 series
  - **ESP32**: ESP32, ESP32-C3, ESP32-S3
  - **nRF**: nRF52, nRF53, nRF91
  - **RP2040**: Raspberry Pi Pico
  - **ARM Cortex-M**: All M0+, M3, M4, M7, M33 variants
- **Flash Usage**: 20-40KB code, 4KB RAM
- **RTIC Features**:
  - Task prioritization (16 levels)
  - Resource sharing with locks
  - Monotonic timers
- **Embassy Features**:
  - Async/await patterns
  - Peripheral abstractions
  - Timer handling
- **Installation**:
  ```toml
  agentic-robotics-embedded = { version = "0.1", features = ["rtic", "embassy"] }
  ```
- **Use Cases**: Mobile robots, drone controllers, IoT sensors, industrial equipment

##### **agentic-robotics-mcp** (v0.1.2) - Model Context Protocol for Robotics
- **Purpose**: Natural language robot control via AI assistants
- **MCP Compliance**: 2025-11 specification
- **Transport Protocols**:
  - STDIO (local machine control)
  - SSE (remote web access)
  - WebSocket (real-time bidirectional)
- **MCP Tools** (21 total):
  - `move_to` - Navigate to coordinates
  - `move_forward` - Move distance
  - `rotate` - Rotate degrees
  - `get_status` - Robot status
  - `emergency_stop` - Kill switch
  - `detect_objects` - Vision detection
  - `pick_object` - Manipulation
  - `place_object` - Drop object
  - `start_task` - Begin operation
  - `get_battery` - Battery status
  - `set_speed` - Velocity control
  - `get_position` - Current location
  - `enable_sensors` - Sensor control
  - `create_map` - SLAM mapping
  - `calibrate` - System calibration
  - [6+ additional specialized tools]
- **MCP Resources**:
  - `robot://status` - Status resource
  - `robot://map` - Environment map
  - `robot://telemetry` - Real-time data
- **Integration Points**:
  - Claude Desktop
  - VS Code Extension
  - Command-line MCP clients
  - Custom applications
- **Schema**: JSON Schema for all tool inputs/outputs
- **Error Handling**: Structured error responses with retry metadata
- **Use Cases**:
  - Warehouse robots (natural language commands)
  - Home assistants (voice control)
  - Lab automation (experiment control)
  - Security patrols (autonomous surveillance)
- **Installation**: `cargo add agentic-robotics-mcp`

##### **agentic-robotics-node** (v0.1.1) - Node.js Native Bindings
- **Purpose**: High-performance robotics from JavaScript/TypeScript
- **Technology**: NAPI (Node-API) bindings
- **Performance Overhead**:
  - Publish: 57% overhead vs native Rust
  - Serialization: 2.2x vs native
  - Overall: Still sub-millisecond latency
- **Features**:
  - Full TypeScript support with .d.ts files
  - Native modules for Windows, macOS, Linux
  - Multi-architecture support (x64, arm64)
  - Full async/await patterns
  - ROS2 compatibility
- **API**:
  ```typescript
  const robot = new RoboticSystem("robot-name");
  const pub = robot.createPublisher<Position>("position");
  await pub.publish(position);
  const sub = robot.createSubscriber<Position>("position");
  sub.on("message", (msg) => {});
  ```
- **Type Definitions**: 150+ exported types
- **Installation**: `npm install agentic-robotics`
- **Compatibility**: Node 14+, Electron, Bun
- **Use Cases**: Real-time dashboards, fleet management, simulation environments

##### **agentic-robotics-rt** (v0.1.2) - Real-Time Task Executor
- **Purpose**: Priority-based scheduling for deterministic control loops
- **Key Features**:
  - Dual runtime architecture (high/low priority threads)
  - 16 priority levels with deadline enforcement
  - CPU affinity control
  - HDR histogram latency tracking
  - Zero-allocation task scheduling
- **Priority Levels**:
  - **Critical** (P0): <100 µs deadline
  - **High** (P1-P3): <1 ms deadline
  - **Medium** (P4-P7): <10 ms deadline
  - **Low** (P8-P11): <100 ms deadline
  - **Background** (P12-P15): Best effort
- **Performance**:
  - Task spawn: ~2 µs
  - Priority switch: <5 µs
  - Deadline jitter: <10 µs (p99.9)
  - Throughput: >100k tasks/sec
  - Latency: p50=50ns, p95=100ns, p99.9=500ns
- **Metrics**:
  - HDR histogram tracking
  - per-task statistics
  - Deadline violation counter
  - Thread utilization
- **Installation**: `cargo add agentic-robotics-rt`
- **Use Cases**:
  - 1kHz control loops (servo control)
  - Real-time SLAM (simultaneous localization and mapping)
  - Emergency stop systems
  - Autonomous drone flight

---

#### 2. AI SECURITY & DEFENSE CRATES (4 total)

##### **aimds-core** (v0.1.0) - Type System and Configuration
- **Purpose**: Foundation types for AIMDS (AI Manipulation Defense System)
- **Key Features**:
  - Comprehensive threat type definitions
  - Environment-based configuration
  - Retryable error classification
  - Zero-dependency design
- **Core Types**:
  ```rust
  pub enum ThreatSeverity {
      Critical,    // Immediate action required
      High,        // Urgent investigation
      Medium,      // Monitor and log
      Low,         // Informational
      Info,        // Historical tracking
  }

  pub enum ThreatCategory {
      PromptInjection,
      DataExfiltration,
      ResourceExhaustion,
      PolicyViolation,
      AnomalousBehavior,
      UnknownPattern,
  }
  ```
- **Configuration**:
  - `Config` struct with Builder pattern
  - Environment variable support (AIMDS_*)
  - Sensible defaults
- **Error Handling**:
  - `AimdsError` enum
  - Retryable vs terminal classification
  - Detailed error context
- **Performance**: <100ns type creation, <50ns error construction
- **Test Coverage**: 100% (18/18 tests)
- **Dependencies**: serde (optional), env_logger (optional)

##### **aimds-detection** (v0.1.0) - Real-Time Threat Detection
- **Purpose**: <10ms latency threat detection for AI applications
- **Key Features**:
  - **Prompt Injection Detection**: 50+ attack patterns
    - Encoding attacks (base64, unicode)
    - Injection vectors (SQL, command, LDAP)
    - Role-play attempts
    - Jailbreak patterns (DAN, ChatGPT-4, etc.)
  - **PII Sanitization**:
    - Email addresses (RFC 5322 compliant)
    - Social Security Numbers (XXX-XX-XXXX format)
    - Credit cards (Visa, MasterCard, Amex, Discover)
    - API keys (AWS, Azure, GitHub, etc.)
    - Phone numbers (US/International)
    - IP addresses (IPv4/IPv6)
    - URLs and domain names
  - **Pattern Caching**: LRU cache with >90% hit rate
  - **Control Character Sanitization**: Remove dangerous chars
  - **High Throughput**: >10,000 requests/second
- **Performance Metrics**:
  - Detection (p50): ~4ms
  - Detection (p99): ~8ms
  - Pattern matching: ~1.2ms
  - Sanitization: ~2.5ms
  - Cache lookup: <100ns (hit)
  - Full pipeline: <10ms (SLA)
- **Configuration**:
  - Pattern sensitivity levels
  - Cache size (default 10k)
  - Timeout handling
  - Batch processing
- **API**:
  ```rust
  let detector = Detector::new(config);
  let threats = detector.detect_threats(&input)?;
  let sanitized = detector.sanitize_pii(&text)?;
  ```
- **Output**: Threat list with severity, category, location
- **Regex Patterns**: 50+ compiled patterns with anchors
- **Installation**: `cargo add aimds-detection`
- **Test Coverage**: 92% (45/49 tests)

##### **aimds-analysis** (v0.1.0) - Behavioral Analysis and Verification
- **Purpose**: <520ms combined latency deep-path threat analysis
- **Key Features**:
  - **Temporal Attractor Classification**:
    - Fixed Point: Stable, converging behavior
    - Limit Cycle: Periodic patterns
    - Strange Attractor: Chaotic behavior
    - Divergent: Unstable, runaway patterns
  - **Linear Temporal Logic (LTL) Policy Verification**:
    - Globally (G) - must hold forever
    - Finally (F) - must eventually occur
    - Next (X) - holds in next state
    - Until (U) - one until other
  - **Anomaly Detection**:
    - Statistical baseline learning
    - Drift detection
    - Multi-dimensional analysis
    - Novelty scoring
  - **Lyapunov Exponent Calculation**:
    - Chaos indicators
    - Stability metrics
    - Bifurcation detection
- **Performance**:
  - Behavioral Analysis: ~80ms
  - Policy Verification: ~420ms
  - Combined Deep Path: ~500ms (under 520ms SLA)
  - Throughput: >500 req/s
- **Metrics Output**:
  - Attractor type classification
  - LTL satisfaction score
  - Anomaly probability
  - Lyapunov exponent
  - Confidence level
- **Test Coverage**: 100% (27/27 tests)
- **Integration**: Works with aimds-detection output
- **Installation**: `cargo add aimds-analysis`

##### **aimds-response** (v0.1.0) - Adaptive Mitigation Response
- **Purpose**: Automated threat response and recovery
- **Key Features**:
  - Adaptive mitigation strategies
  - Response orchestration
  - Recovery protocols
  - Escalation handling
  - Audit logging
- **Response Actions**:
  - Block/deny access
  - Rate limiting
  - Request queuing
  - Session termination
  - Credential rotation
  - Incident escalation
- **Recovery Mechanisms**:
  - Rollback procedures
  - State restoration
  - Integrity verification
  - Health checks

---

#### 3. VECTOR DATABASE CRATES - ruvector Series (13 total)

##### **ruvector-core** (v0.1.16) - Vector Database Core
- **Purpose**: High-performance in-memory vector storage and retrieval
- **Key Features**:
  - HNSW (Hierarchical Navigable Small World) indexing
  - Multiple distance metrics (cosine, Euclidean, Manhattan, Dot)
  - 1M vectors at <5ms search latency
  - Memory-efficient storage (12 bytes/vector metadata)
  - Incremental indexing
  - Concurrent read/write (lock-free for reads)
  - Batch operations
- **Supported Types**: f32, f64, u8, u16
- **Performance**:
  - Index build: ~100K vectors/sec
  - Search: <1ms p95, <5ms p99
  - Insert: ~10K vectors/sec (single-threaded)
  - Memory: ~40 bytes/vector (HNSW overhead)
- **API**:
  ```rust
  let mut db = VectorDB::new(512); // 512-dim vectors
  db.add_vector("id1", vec![0.1, 0.2, ...], metadata);
  let results = db.search(&query, top_k=10)?;
  ```
- **Installation**: `cargo add ruvector-core`

##### **ruvector-gnn** (v0.1.15) - Graph Neural Network Integration
- **Purpose**: GNN-based indexing and graph operations for vectors
- **Key Features**:
  - Multi-head attention mechanisms (4-8 heads)
  - Message passing neural networks
  - Graph convolutional layers
  - Differentiable search operations
  - Vector compression (10x compression, <1% loss)
  - Graph pooling
- **Architecture**:
  - Input: Vector embeddings
  - GNN layers: 2-4 layers
  - Attention: Multi-head (8 heads, 64 dims each)
  - Output: Graph embeddings
- **Performance**:
  - Forward pass: ~10ms (batch 32)
  - Search: <1ms with learned indices
  - Compression: 0.5ms
  - Memory reduction: 10x
- **Installation**: `cargo add ruvector-gnn`

##### **ruvector-router** (v0.1.2) - Request Routing and Load Balancing
- **Purpose**: Intelligent routing for vector queries across cluster
- **Key Features**:
  - Consistent hashing for vector distribution
  - Load balancing algorithms
  - Circuit breaker pattern
  - Failover handling
  - Query optimization
  - Cache coordination
- **Performance**: <1ms routing decision

##### **ruvector-tiny-dancer** (v0.1.2) - Lightweight Vector Indexing
- **Purpose**: Memory-efficient vector operations for edge devices
- **Key Features**:
  - <10MB memory footprint
  - LSH (Locality Sensitive Hashing) indexing
  - Approximate nearest neighbor
  - Quantization support (int8, float16)
  - Single-threaded optimization
- **Performance**:
  - Search: <100ms on edge (RPi, iPhone)
  - Indexing: <10MB memory
  - Quantization: 8x compression

##### **ruvector-graph** (v0.1.2) - Graph Data Structures
- **Purpose**: Graph algorithms and operations
- **Features**: Graph traversal, shortest path, clustering

##### **ruvector-graph-node** (v0.1.2) - Node.js Graph Bindings
- **Platform Support**:
  - Darwin ARM64 & x64
  - Linux ARM64 & x64 (GNU libc)
  - Windows x64 (MSVC)

##### **ruvector-gnn-wasm** (Rust) - WASM GNN Implementation
- **Purpose**: Browser-based GNN operations
- **Target**: WebAssembly
- **Bundle Size**: ~500KB

##### **ruvector-gnn-node** (v0.1.2, NPM) - Node.js GNN Bindings
- **Installation**: `npm install ruvector-gnn`

##### **ruvector-collections** (v0.1.2) - Collection Management
- **Features**: Named collections, collection hierarchies

##### **ruvector-replication** (v0.1.2) - Data Replication
- **Features**: Multi-replica consistency, eventual consistency

##### **ruvector-raft** (v0.1.2) - Consensus Mechanism
- **Purpose**: Distributed consensus
- **Protocol**: Raft consensus algorithm
- **Features**: Leader election, log replication

##### **ruvector-cluster** (v0.1.2) - Clustering Operations
- **Features**: Vector clustering, k-means, DBSCAN

##### **ruvector-metrics** (v0.1.2) - Distance Metrics
- **Metrics Supported**:
  - Cosine similarity
  - Euclidean distance
  - Manhattan distance
  - Dot product
  - Hamming distance
  - Jaccard similarity

##### **ruvector-filter** (v0.1.2) - Advanced Filtering
- **Features**: Metadata filtering, range queries

##### **ruvector-snapshot** (v0.1.2) - Versioning and Snapshots
- **Features**: Point-in-time snapshots, version control

##### **ruvector-scipix** (v0.1.16) - Scientific Computing
- **Purpose**: Integration with scientific libraries
- **Features**: NumPy-compatible operations, PyO3 bindings

##### **ruvector-server** (v0.1.2) - Vector Database Server
- **Purpose**: Standalone vector database server
- **Protocol**: REST API
- **Endpoints**:
  - POST `/vectors` - Add vectors
  - GET `/vectors/{id}` - Retrieve
  - POST `/search` - Search query
  - DELETE `/vectors/{id}` - Remove

---

#### 4. NEURAL TRADING CRATES (16 total)

##### **nt-core** (v1.0.0) - Neural Trading System Core
- **Purpose**: Foundation for AI-powered trading
- **Key Features**:
  - Trade struct with order types (Market, Limit, Stop)
  - Portfolio state management
  - Order book management
  - Position tracking
  - P&L calculation
  - Fill simulation
- **Order Types**:
  - Market orders
  - Limit orders (with price constraints)
  - Stop orders (conditional)
  - Stop-limit combinations
  - Iceberg orders (hidden quantity)
- **Data Structures**:
  - `Trade`: Single trade execution
  - `Portfolio`: Holdings, cash, P&L
  - `Position`: Long/short tracking
  - `OrderBook`: Order management
- **Installation**: `cargo add nt-core`

##### **nt-neural** (v1.0.0) - Neural Network Trading Models
- **Models Supported**:
  - LSTM (Long Short-Term Memory)
  - Transformer architectures
  - Ensemble methods
  - Reinforcement learning
- **Features**:
  - Pre-trained models for common assets
  - Transfer learning support
  - Hyperparameter optimization
  - Model evaluation metrics

##### **nt-market-data** (v1.0.0) - Market Data Integration
- **Data Sources**:
  - Real-time price feeds
  - Historical OHLCV data
  - Order flow data
  - News feeds
  - Option data
- **Features**:
  - Multi-asset support (stocks, forex, crypto, futures)
  - Bar aggregation (1m, 5m, 15m, 1h, 1d)
  - Dividend/split adjustment
  - Data validation

##### **nt-backtesting** (v1.0.0) - Historical Backtesting Engine
- **Features**:
  - Event-driven simulation
  - Commission/slippage modeling
  - Multi-timeframe analysis
  - Walk-forward optimization
  - Monte Carlo analysis
  - Drawdown analysis
- **Metrics Calculated**:
  - Total return
  - Sharpe ratio
  - Sortino ratio
  - Max drawdown
  - Win/loss ratio
  - Profit factor

##### **nt-execution** (v1.0.0) - Order Execution Engine
- **Features**:
  - Smart order routing (SOR)
  - Slippage minimization
  - Partial fill handling
  - Order impact estimation
  - Execution cost analysis
- **Broker Integrations**: Interactive Brokers, Alpaca, E*TRADE

##### **nt-portfolio** (v1.0.0) - Portfolio Management
- **Features**:
  - Portfolio optimization
  - Risk management
  - Rebalancing
  - Position sizing
  - Correlation analysis
  - VaR/CVaR calculation
- **Optimization Methods**:
  - Mean-variance (Markowitz)
  - Risk parity
  - Equal weight
  - Maximum diversification

##### **nt-features** (v1.0.0) - Feature Engineering
- **Technical Indicators** (50+):
  - Moving averages (SMA, EMA, WMA)
  - Momentum (RSI, MACD, Stochastic)
  - Volatility (Bollinger Bands, ATR)
  - Trend (ADX, Ichimoku)
  - Volume (OBV, CMF)
- **Advanced Features**:
  - Cross-sectional features
  - Time-series decomposition
  - Principal component analysis
  - Fourier features

##### **nt-risk** (v1.0.0) - Risk Management
- **Metrics**:
  - Value at Risk (VaR) - p95, p99
  - Conditional VaR (CVaR)
  - Sharpe ratio
  - Sortino ratio
  - Calmar ratio
  - Omega ratio
  - Tail ratio
- **Risk Controls**:
  - Position limits
  - Drawdown limits
  - Greeks monitoring (delta, gamma, vega, theta)
  - Stop-loss execution

##### **nt-streaming** (v1.0.0) - Real-Time Data Streaming
- **Protocols**:
  - WebSocket
  - gRPC
  - Kafka
  - Redis streams
- **Features**:
  - Low-latency processing
  - Backpressure handling
  - Reconnection logic

##### **nt-memory** (v1.0.0) - Trade Memory and Learning
- **Features**:
  - Historical trade tracking
  - Performance attribution
  - Strategy learning
  - Pattern recognition
  - Memory storage (SQLite)

##### **nt-utils** (v1.0.0) - Utilities
- **Utilities**:
  - Date/time handling
  - Price formatting
  - Data validation
  - Error handling

##### **nt-agentdb-client** (v1.0.0) - Agent Database Client
- **Purpose**: Connect to AgentDB for trade memory

##### **nt-napi-bindings** (v1.0.0) - Node.js Bindings
- **Technology**: NAPI
- **Installation**: `npm install nt-napi-bindings`

---

#### 5. DISTRIBUTED SYSTEMS CRATES - QuDAG Series (12 total)

##### **qudag** (v1.4.0) - Quantum-Resistant Distributed Acyclic Graph
- **Purpose**: High-performance consensus and data structure
- **Key Features**:
  - DAG (Directed Acyclic Graph) structure
  - Topological ordering
  - Conflict-free concurrent operations
  - Byzantine fault tolerance (3f+1 nodes for f faults)
  - Quantum-resistant cryptography
  - O(log n) consensus latency
- **Performance**:
  - Throughput: 100k+ ops/sec
  - Latency: <100ms consensus
  - Finality: Instant (no forks)
  - Network: <100MB/s bandwidth
- **Cryptography**:
  - Hash-based signatures (post-quantum safe)
  - Merkle trees
  - Ed25519 (interim, pre-quantum)
- **Installation**: `cargo add qudag`
- **API**:
  ```rust
  let mut dag = DAG::new();
  let node_id = dag.add_transaction(tx)?;
  let ordering = dag.topological_sort();
  let consensus = dag.is_finalized(node_id)?;
  ```

##### **qudag-crypto** (v0.5.1) - Post-Quantum Cryptography
- **Algorithms**:
  - ML-DSA (Module-Lattice-Based Digital Signature Algorithm - FIPS 204)
  - ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism - FIPS 203)
  - Falcon (Fast-Fourier Lattice-based Compact Signatures)
  - Dilithium variants
- **Features**:
  - NIST standardization (2022-2024)
  - Key generation
  - Signing
  - Verification
  - Key encapsulation
- **Performance**:
  - Sign: ~1ms
  - Verify: ~2ms
  - Key gen: ~10ms
- **Key Sizes**:
  - ML-DSA: 2.5KB signature
  - ML-KEM: 768-1024B ciphertext
- **Installation**: `cargo add qudag-crypto`

##### **qudag-network** (v0.5.0) - P2P Network Layer
- **Features**:
  - P2P gossip protocol
  - NAT traversal (UPnP, TCP hole punching)
  - DHT (Distributed Hash Table)
  - Peer discovery
  - Connection pooling
  - Bandwidth limits
- **Protocols**:
  - QUIC (UDP-based)
  - TCP (fallback)
  - WebSocket (browser support)
- **Performance**:
  - Peer discovery: <5 seconds
  - Message propagation: <1 second
  - Throughput: 10MB/s per connection

##### **qudag-protocol** (v0.5.0) - Protocol Specification
- **Message Types**:
  - Transaction messages
  - Consensus messages
  - Sync requests
  - State updates
- **Serialization**: Protocol Buffers (protobuf)
- **Versioning**: Semantic versioning

##### **qudag-dag** (v0.5.0) - DAG Data Structure
- **Operations**:
  - Add vertex/edge
  - Topological sort
  - Reachability queries
  - Path finding
  - Cycle detection (should be zero for DAG)
- **Storage**: RocksDB backend

##### **qudag-exchange** (v0.2.0) - Distributed Exchange on QuDAG
- **Features**:
  - Order book management
  - Order matching engine
  - Settlement on-chain
  - Atomic swaps
  - Liquidity pools
- **Tokens**: rUv token support

##### **qudag-exchange-core** (v0.4.0) - Exchange Core Logic
- **Components**:
  - Order matching (best-price priority)
  - Book management
  - Trade settlement
  - Fee calculation

##### **qudag-exchange-standalone-cli** (v0.3.1) - Standalone CLI Tool
- **Commands**:
  - `qudag-exchange-cli place-order`
  - `qudag-exchange-cli view-book`
  - `qudag-exchange-cli withdraw`
  - `qudag-exchange-cli balance`

##### **qudag-vault-core** (v0.5.1) - Quantum-Resistant Vault
- **Purpose**: Secure password/key storage
- **Features**:
  - ML-KEM encryption
  - ML-DSA signing
  - Key derivation (Argon2)
  - Multi-factor support
  - Secure memory handling
- **Storage**: Encrypted SQLite

##### **qudag-mcp** (v0.5.0) - Model Context Protocol Integration
- **MCP 2025-11 Compliant**
- **Tools**:
  - `sign_transaction` - Cryptographic signing
  - `send_transaction` - Submit to network
  - `query_balance` - Account balance
  - `get_transaction_status` - Transaction tracking
  - `place_order` - Exchange orders
  - [15+ additional tools]
- **Resources**:
  - `qudag://wallet` - Wallet state
  - `qudag://transactions` - Transaction history
  - `qudag://orders` - Order status

##### **qudag-wasm** (v0.1.0) - WebAssembly Bindings
- **Purpose**: Browser-based QuDAG access
- **Bundle Size**: ~2MB
- **Features**:
  - Cryptographic operations in WASM
  - Network client
  - State management

---

#### 6. SWARM INTELLIGENCE CRATES (9 total)

##### **ruv-swarm-core** (v1.0.6) - Multi-Agent Coordination Core
- **Purpose**: Foundation for agent swarms
- **Features**:
  - Agent registration
  - Message routing
  - Consensus mechanisms
  - State synchronization
  - Heartbeat monitoring
  - Agent discovery
- **API**:
  ```rust
  let mut swarm = Swarm::new("swarm-1");
  swarm.register_agent("agent-1", capabilities);
  swarm.route_message(msg, "agent-1")?;
  ```

##### **ruv-swarm-agents** (v1.0.5) - Agent Implementations
- **Agent Types**:
  - Autonomous agents
  - Reactive agents
  - Deliberative agents
  - Hybrid agents
- **Features**:
  - Behavior trees
  - Goal planning
  - Action execution
  - Perception

##### **ruv-swarm-ml** (v1.0.5) - Machine Learning for Swarms
- **Algorithms**:
  - Cooperative learning
  - Distributed training
  - Federated learning
  - Multi-agent reinforcement learning
- **Performance**: 10-100x faster training on swarms

##### **ruv-swarm-ml-training** (v1.0.5) - Training Pipeline
- **Features**:
  - Distributed training
  - Model checkpointing
  - Hyperparameter search
  - Transfer learning

##### **ruv-swarm-persistence** (v1.0.5) - State Persistence
- **Storage**:
  - Agent state snapshots
  - Memory snapshots
  - Knowledge base
  - Learning history
- **Backend**: RocksDB

##### **ruv-swarm-transport** (v1.0.5) - Message Transport
- **Transports**:
  - TCP
  - UDP (multicast)
  - WebSocket
  - gRPC
- **Features**:
  - Reliability guarantees
  - Message ordering
  - Compression

##### **ruv-swarm-wasm** (v1.0.5) - WebAssembly Support
- **Purpose**: Browser-based agents
- **Bundle Size**: ~1MB
- **Features**: Consensus operations in WASM

##### **ruv-swarm-daa** (v1.0.6) - Distributed Autonomous Agents
- **Purpose**: DAA (Distributed Autonomous Architecture)
- **Features**:
  - Autonomous operation
  - No central control
  - Byzantine resilience
  - Economic incentives (tokens)

##### **ruv-swarm-mcp** (v0.2.0) - MCP Integration for Swarms
- **Tools**:
  - `create_agent` - Spawn new agent
  - `send_message` - Inter-agent communication
  - `query_state` - Agent state inspection
  - `trigger_consensus` - Consensus protocol
  - `get_metrics` - Performance metrics

---

#### 7. TEMPORAL SYSTEMS CRATES (8 total)

##### **temporal-attractor-studio** (v0.1.0) - Chaos Analysis
- **Purpose**: Analyze dynamical systems attractors
- **Features**:
  - Lyapunov exponent calculation
  - Bifurcation detection
  - Attractor classification
  - Embedding dimension
  - Correlation dimension
- **Analysis Types**:
  - Time series → phase space reconstruction
  - Attractor type detection
  - Stability analysis
  - Chaos quantification

##### **temporal-neural-solver** (v0.1.2) - Neural ODE Solver
- **Purpose**: Continuous-time neural networks
- **Features**:
  - Neural ODE forward/backward passes
  - Adjoint method training
  - Adaptive step-size integration
  - GPU support
- **Models**: ResNet-like, flow-based, generative

##### **temporal-neural-solver** (v0.1.3, NPM) - JavaScript Version
- **Installation**: `npm install temporal-neural-solver`

##### **temporal-lead-solver** (v0.1.0) - Lead Time Optimization
- **Purpose**: Find optimal prediction horizons
- **Features**:
  - Autocorrelation analysis
  - PACF (Partial Autocorrelation)
  - Lead time optimization
  - Forecast accuracy evaluation

##### **temporal-compare** (v0.5.0) - Temporal Comparison
- **Features**:
  - Time series alignment (DTW)
  - Sequence comparison
  - Pattern matching
  - Temporal distance metrics

##### **strange-loop** (v0.3.0) - Meta-Learning Framework
- **Purpose**: Self-improving systems
- **Features**:
  - Self-reference patterns
  - Recursive learning
  - Meta-learning loops
  - Strange attractor dynamics
- **Use Cases**: AI that learns to learn

##### **subjective-time-expansion** (v0.1.2) - Temporal Perception
- **Features**:
  - Time dilation modeling
  - Event prioritization
  - Subjective time calculations
  - Perception adjustment

##### **nanosecond-scheduler** (v0.1.1) - Ultra-Precise Scheduling
- **Purpose**: Sub-nanosecond task scheduling
- **Precision**: ±100ps jitter
- **Use Cases**: Real-time trading, robotics

---

#### 8. MACHINE LEARNING & OPTIMIZATION CRATES

##### **conformal-prediction** (v2.0.0) - Uncertainty Quantification
- **Features**:
  - Confidence intervals with coverage guarantees
  - Non-parametric methods
  - Distribution-free prediction
  - Quantile regression

##### **sublinear** (v0.1.3) - Sublinear Time Algorithms
- **Algorithms**:
  - Sublinear pattern matching
  - Approximate counting
  - Streaming algorithms
  - Sampling methods
- **Time Complexity**: O(log n) or better

##### **neuro-divergent** Series (v0.1.0 - 5 crates)
- **Purpose**: Alternative neural architectures
- **Components**:
  - **neuro-divergent**: Main framework
  - **neuro-divergent-core**: Type definitions
  - **neuro-divergent-models**: Predefined models
  - **neuro-divergent-registry**: Model catalog
  - **neuro-divergent-training**: Training pipelines
- **Features**:
  - Non-standard activations
  - Alternative optimizers
  - Exotic architectures
  - Meta-learning approaches

##### **kimi-fann-core** (v0.1.4) - Fast Artificial Neural Networks
- **Purpose**: Lightweight neural network inference
- **Features**:
  - <1KB models
  - Integer quantization
  - Mobile optimization
  - No floating-point required

##### **kimi-expert-analyzer** (v0.1.1) - Expert System Analysis
- **Features**:
  - Rule-based reasoning
  - Knowledge base management
  - Inference engine
  - Explanation generation

##### **cuda-rust-wasm** (v0.1.6) - CUDA + WASM
- **Purpose**: GPU acceleration with Rust/WASM
- **Features**:
  - CUDA kernels wrapped
  - WASM wrapper
  - Web workers support

---

#### 9. CODE ANALYSIS CRATES (5 total)

##### **code-mesh-core** (v0.1.0) - Code Analysis Engine
- **Features**:
  - AST parsing
  - Code indexing
  - Dependency analysis
  - Complexity metrics

##### **code-mesh-cli** (v0.1.0) - CLI Tool
- **Commands**:
  - `code-mesh analyze`
  - `code-mesh search`
  - `code-mesh metrics`

##### **code-mesh-tui** (v0.1.0) - Terminal UI
- **Interface**: TUI for interactive code browsing

##### **code-mesh-wasm** (v0.1.0) - WASM Support
- **Bundle Size**: ~2MB

##### **claude-parser** (v1.0.5) - Claude Language Parser
- **Purpose**: Parse Claude programming language
- **Features**:
  - Tokenization
  - AST building
  - Semantic analysis

---

#### 10. MATHEMATICAL & COMPUTATIONAL CRATES

##### **geometric-langlands** (v0.2.2) - Geometric Langlands
- **Purpose**: Categorical mathematics for AI
- **Features**:
  - Category theory
  - Representation theory
  - Derived categories

##### **geometric-langlands-cli** (v0.2.0) - CLI Tool
- **Commands**: Mathematical analysis tools

##### **opencv-core** (v4.8.1) - OpenCV Core
- **Features**: Computer vision algorithms

##### **opencv-sdk** (v4.8.1) - Full OpenCV SDK
- **Modules**: 20+ computer vision modules

##### **opencv-wasm** (v4.8.1) - OpenCV WebAssembly
- **Bundle Size**: ~15MB

---

#### 11. DISTRIBUTED AUTONOMOUS ARCHITECTURE CRATES

##### **daa-core** (v0.2.0) - Core DAA
##### **daa-ai** (v0.2.1) - AI coordination
##### **daa-chain** (v0.2.0) - Blockchain structures
##### **daa-economy** (v0.2.1) - Economic models
##### **daa-rules** (v0.2.1) - Rule engines
##### **daa-orchestrator** (v0.2.0) - Task orchestration
##### **daa-prime-core** (v0.2.1) - Advanced DAA
##### **daa-prime-dht** (v0.2.1) - DHT for DAA
##### **daa-prime-trainer** (v0.2.1) - Training system
##### **daa-prime-coordinator** (v0.2.1) - Coordination
##### **daa-cli** / **daa-prime-cli** (v0.2.0/v0.2.1) - CLI tools

---

#### 12. MICROSERVICES CRATES

##### **micro-core** (v0.2.0) - Microservice core
##### **micro-routing** (v0.2.0) - Service routing
##### **micro-metrics** (v0.2.0) - Performance metrics
##### **micro-swarm** (v0.2.0) - Swarm primitives
##### **micro-cartan-attn** (v0.2.0) - Attention-based routing

---

#### 13. SPECIALIZED ANALYSIS CRATES

##### **fact-tools** (v1.0.0) - Fact manipulation
##### **fact-wasm-core** (v1.0.0) - WASM fact system
##### **governance** (v0.1.0) - DAO governance
##### **goalie** (v1.0.3) - Goal-oriented agents
##### **lean-agentic** (v0.1.0) - Lean theorem proving
##### **leanr-rag-gateway** (v0.1.0) - RAG gateway
##### **leanr-wasm** (v0.1.0) - RAG in WASM
##### **neurodna** (v0.0.2) - Neural network evolution
##### **nano-consciousness** (v0.1.0) - Consciousness modeling
##### **bitchat-qudag** (v0.1.0) - Blockchain messaging
##### **bit-parallel-search** (v0.1.0) - Pattern matching
##### **swe-bench-adapter** (v0.2.0) - SWE benchmarks
##### **qvm-scheduler** (v0.1.0) - Quantum VM scheduling
##### **veritas-nexus** (v0.1.0) - Truth verification

---

#### 14. SYNAPTIC & NEURAL MESH CRATES

##### **synaptic-mesh-cli** (v0.1.1) - Network CLI
##### **synaptic-neural-mesh** (v0.1.0) - Neural mesh
##### **synaptic-neural-wasm** (v0.1.0) - WASM neural
##### **synaptic-daa-swarm** (v0.1.0) - Swarm DAA
##### **synaptic-qudag-core** (v0.1.0) - QUDAG for neural
##### **midstreamer-neural-solver** (v0.1.0)
##### **midstreamer-quic** (v0.1.0)
##### **midstreamer-strange-loop** (v0.1.0)
##### **midstreamer-scheduler** (v0.1.0)
##### **midstreamer-attractor** (v0.1.0)

---

## Complete NPM Packages Directory

### Total: 155 NPM Packages

#### 1. CORE AGENTIC FRAMEWORKS (12 packages)

##### **agentic-jujutsu** (v2.3.6) - TypeScript Version Control
- **Type**: TypeScript/JavaScript wrapper
- **Installation**: `npm install agentic-jujutsu`
- **CLI Support**: `npx agentic-jujutsu`
- **Features**: Same as Rust crate + Node.js specific features
- **Key Commands**:
  - `npx agentic-jujutsu help`
  - `npx agentic-jujutsu analyze <code>`
  - `npx agentic-jujutsu mcp-server --port 8000`
  - `npx agentic-jujutsu ast "jj command"`
- **Bundle Size**: 17.9 KB (gzipped)
- **Node Version**: 14+
- **TypeScript Support**: Full type definitions included

##### **agentic-flow** (v1.10.2) - Agent Orchestration
- **Purpose**: Coordinate AI agent workflows
- **Features**:
  - Workflow definition DSL
  - Parallel/sequential execution
  - Agent pooling
  - Error recovery
  - Monitoring dashboards
- **Installation**: `npm install agentic-flow`
- **API**:
  ```typescript
  import { Flow } from 'agentic-flow';
  const flow = new Flow();
  flow.addAgent('analyzer', analyzerAgent);
  flow.addAgent('executor', executorAgent);
  await flow.execute(input);
  ```

##### **agentdb** (v1.6.1) - Agent Memory Database
- **Purpose**: Persistent agent state and experience storage
- **Features**:
  - 13,000x faster than baseline
  - Hybrid SQL storage
  - Full-text search
  - JSONB storage
  - Time-series data
  - Query language (AQL)
- **Installation**: `npm install agentdb`
- **Backends**: SQLite, PostgreSQL, DuckDB
- **Query Example**:
  ```typescript
  const db = new AgentDB('sqlite://agents.db');
  const experiences = await db.query(
    `SELECT * FROM experiences WHERE agent_id = ?`,
    [agentId]
  );
  ```

##### **agent-booster** (v0.2.2) - Agent Performance
- **Installation**: `npm install agent-booster`
- **Features**:
  - Agent pooling
  - Request queuing
  - Performance metrics
  - Timeout management

##### **agentic-payments** (v0.1.13) - Payment Processing
- **Installation**: `npm install agentic-payments`
- **Features**: AP2 + ACP protocols (JavaScript version)

##### **agentic-robotics** (v0.2.4) - Robotics Framework
- **Installation**: `npm install agentic-robotics`
- **Features**: ROS2 bindings for Node.js
- **Related Packages**:
  - agentic-robotics-cli (v0.2.3)
  - agentic-robotics-core (v0.2.1)
  - agentic-robotics-mcp (v0.2.2)
  - agentic-robotics-self-learning (v1.0.0)
  - agentic-robotics-linux-x64-gnu (v0.2.0)

##### **agentics.org-agentic-mcp** (v1.0.4) - MCP Protocol
- **Installation**: `npm install agentics.org-agentic-mcp`
- **Purpose**: Model Context Protocol implementation

##### **agentics.org-sparc2** (v2.0.25) - SPARC Framework
- **Installation**: `npm install agentics.org-sparc2`
- **Features**: SPARC v2 protocol and tools

##### **agenticsjs** (v1.0.5) - Core Agentics
- **Installation**: `npm install agenticsjs`
- **Features**: Base agent framework

##### **agentics-hackathon** (v1.2.0) - Rapid Prototyping
- **Installation**: `npm install agentics-hackathon`

##### **consciousness-explorer** (v1.1.1) - Consciousness Modeling
- **Installation**: `npm install consciousness-explorer`
- **Features**: Meta-cognitive frameworks

##### **lean-agentic** (v0.3.2) - Lightweight Agents
- **Installation**: `npm install lean-agentic`

---

#### 2. CLAUDE ECOSYSTEM (3 packages)

##### **claude-flow** (v2.7.41) - Claude AI Framework
- **Installation**: `npm install claude-flow`
- **Purpose**: Build sophisticated AI workflows with Claude
- **Features**:
  - 9 major command modules
  - Swarm coordination
  - Memory management
  - Multi-agent optimization
  - Webhook automation
  - Training pipelines
- **Command Modules**:
  - `.claude/commands/agents/` - Agent definitions and behaviors
  - `.claude/commands/swarm/` - Collective intelligence
  - `.claude/commands/analysis/` - Code analysis tools
  - `.claude/commands/memory/` - Knowledge base management
  - `.claude/commands/optimization/` - Performance tuning
  - `.claude/commands/training/` - ML training workflows
  - `.claude/commands/github/` - GitHub integration
  - `.claude/commands/hooks/` - Event handling
  - `.claude/commands/hive-mind/` - Collective decision-making
- **Example Usage**:
  ```typescript
  import { ClaudeFlow } from 'claude-flow';
  const flow = new ClaudeFlow(apiKey);
  const result = await flow.executeWorkflow('swarm-analysis', data);
  ```

##### **claude-parser** (v1.0.5, Rust) - Document Parser
- **Purpose**: Parse Claude-format documents
- **Features**: Tokenization, AST building

##### **claude-market** (v0.1.1, Rust) - Marketplace
- **Purpose**: Claude-related resources

---

#### 3. NEURAL TRADER ECOSYSTEM (40+ packages)

##### **neural-trader** (v2.6.3) - Main Trading Framework
- **Installation**: `npm install neural-trader`
- **Purpose**: Complete AI-powered trading platform
- **Components**:
  - Core engine (v2.0.0)
  - Neural models (v2.6.0)
  - Feature engineering (v2.1.2)
  - Market data (v2.1.1)
  - Execution (v2.6.0)
  - Backtesting (v2.6.0)
  - Portfolio (v2.6.0)
  - Risk management (v2.6.0)
  - Strategies (v2.6.0)
  - Backend server (v2.2.1)

##### **neural-trader-core** (v2.0.0) - Core Engine
- **Features**:
  - Trade execution
  - Order management
  - Portfolio tracking
  - P&L calculation

##### **neural-trader-neural** (v2.6.0) - ML Models
- **Models**:
  - LSTM networks
  - Transformer architectures
  - Ensemble methods
  - RL agents

##### **neural-trader-features** (v2.1.2) - Feature Engineering
- **Features**: 50+ technical indicators

##### **neural-trader-market-data** (v2.1.1) - Data Integration
- **Data Sources**:
  - Real-time feeds
  - Historical data
  - Alternative data
  - News feeds

##### **neural-trader-execution** (v2.6.0) - Order Execution
- **Features**:
  - Smart routing
  - Slippage minimization
  - Broker integrations

##### **neural-trader-backtesting** (v2.6.0) - Simulation
- **Features**:
  - Event-driven
  - Multi-timeframe
  - Walk-forward optimization
  - Monte Carlo analysis

##### **neural-trader-portfolio** (v2.6.0) - Portfolio Management
- **Features**:
  - Optimization
  - Rebalancing
  - Risk management

##### **neural-trader-risk** (v2.6.0) - Risk Management
- **Metrics**: VaR, CVaR, Sharpe, Sortino

##### **neural-trader-strategies** (v2.6.0) - Strategy Framework
- **Features**: Strategy templates, backtesting

##### **neural-trader-backend** (v2.2.1) - Server
- **Purpose**: Backend API server
- **Endpoints**: REST API for trading

##### **neural-trader-mcp** (v2.1.0) - MCP Integration
- **MCP Tools**: Trading-specific tools

##### **neural-trader-mcp-protocol** (v2.0.0) - Protocol Spec
- **Purpose**: Protocol specification

##### **neural-trader-e2b-strategies** (v1.1.1) - E2B Deployment
- **Purpose**: Run strategies in E2B sandboxes

##### **neural-trader-benchoptimizer** (v2.1.1) - Optimization
- **Features**: Performance benchmarking

##### **neural-trader-brokers** (v2.1.1) - Broker Integration
- **Brokers**: Interactive Brokers, Alpaca, E*TRADE

##### **@neural-trader/agentic-accounting-agents** (v0.1.1) - Multi-Agent Accounting Swarm
- **Installation**: `npm install @neural-trader/agentic-accounting-agents`
- **Purpose**: Multi-agent swarm orchestration for autonomous accounting operations with crypto trading integration
- **Key Features**:
  - **Multi-Agent Coordination**: Distributed task coordination using BullMQ and Redis
  - **ReasoningBank Self-Learning**: Agents learn from past experiences and improve over time
  - **Autonomous Operations**: Self-directed accounting workflows without human intervention
  - **Compliance Automation**: Intelligent compliance checks for cryptocurrency trading
  - **Swarm Intelligence**: Multiple agents collaborate on complex accounting tasks
  - **AgentDB Integration**: Persistent agent state and experience storage (13,000x faster)
  - **Agentic-Flow Orchestration**: Coordinate workflow execution across agent pools
- **Architecture**:
  - Task queue management with BullMQ
  - Redis-backed distributed coordination
  - TypeScript/Node.js runtime
  - Modular agent design
- **Dependencies**:
  - `agentic-flow` (v1.10.2) - Workflow orchestration
  - `agentdb` (v1.6.1) - Agent memory database
  - `bullmq` (v5.1.9) - Task queue
  - `ioredis` (v5.8.2) - Redis client
- **Keywords**: multi-agent, autonomous, swarm, self-learning, reasoningbank, distributed-systems, neural-trader, crypto-accounting, compliance
- **License**: MIT OR Apache-2.0
- **Related Packages**:

##### **neural-trader-agentic-accounting-cli** (v0.1.1) - CLI
##### **neural-trader-agentic-accounting-core** (v0.1.1) - Core Logic
##### **neural-trader-agentic-accounting-mcp** (v0.1.1) - MCP Integration
##### **neural-trader-agentic-accounting-rust-core** (v0.1.1) - Rust Core
##### **neural-trader-agentic-accounting-types** (v0.1.1) - TypeScript Types

##### **neural-trader-neuro-divergent** (v2.1.1) - Alternative Models
- **Purpose**: Non-standard trading architectures

##### **neural-trader-news-trading** (v2.1.1) - News-Based Trading
- **Features**: News sentiment analysis, signal generation

##### **neural-trader-prediction-markets** (v2.1.1) - Prediction Markets
- **Purpose**: Prediction market integration

##### **neural-trader-sports-betting** (v2.1.1) - Sports Analytics
- **Purpose**: Sports betting integration

##### **neural-trader-syndicate** (v2.1.1) - Multi-Party Trading
- **Purpose**: Syndication and pooling

##### **neural-trader-predictor** (v0.1.0) - Prediction Models
- **Purpose**: Standalone predictor

##### **neural-trader-example-portfolio-optimization** (v1.0.0)
##### **neural-trader-example-energy-forecasting** (v1.0.0)
##### **neural-trader-example-dynamic-pricing** (v1.0.0)
##### **neural-trader-example-market-microstructure** (v1.0.0)
##### **neural-trader-example-quantum-optimization** (v1.0.0)
##### **neural-trader-example-healthcare-optimization** (v1.0.0)
##### **neural-trader-example-supply-chain-prediction** (v1.0.0)
##### **neural-trader-example-neuromorphic-computing** (v1.0.0)
##### **neural-trader-example-evolutionary-game-theory** (v1.0.0)
##### **neural-trader-example-logistics-optimization** (v1.0.0)
##### **neural-trader-example-energy-grid-optimization** (v1.0.0)

---

#### 4. VECTOR DATABASE ECOSYSTEM (10+ packages)

##### **ruvector** (v0.1.24) - Vector Database
- **Installation**: `npm install ruvector`
- **Features**: HNSW indexing, similarity search

##### **ruvector-core** (v0.1.15)
- **Installation**: `npm install ruvector-core`

##### **ruvector-gnn** (v0.1.17)
- **Installation**: `npm install ruvector-gnn`
- **Platforms**:
  - Linux x64 GNU (ruvector-gnn-linux-x64-gnu)

##### **ruvector-router** (v0.1.15)
##### **ruvector-tiny-dancer** (v0.1.15)
##### **ruvector-graph-node** (v0.1.15)
- **Platforms**:
  - Darwin ARM64/x64
  - Linux ARM64/x64 GNU
  - Windows x64 MSVC
- **Platform Packages**:
  - ruvector-graph-node-darwin-arm64 (v0.1.15)
  - ruvector-graph-node-darwin-x64 (v0.1.15)
  - ruvector-graph-node-linux-arm64-gnu (v0.1.15)
  - ruvector-graph-node-linux-x64-gnu (v0.1.15)
  - ruvector-graph-node-win32-x64-msvc (v0.1.15)

##### **ruvector-node** (v0.1.17)
- **Multi-platform binaries**:
  - ruvector-node-darwin-arm64 (v0.1.17)
  - ruvector-node-darwin-x64 (v0.1.17)
  - ruvector-node-linux-arm64-gnu (v0.1.17)
  - ruvector-node-linux-x64-gnu (v0.1.17)
  - ruvector-node-win32-x64-msvc (v0.1.17)

##### **ruvector-agentic-synth** (v0.1.5) - Agentic Synthesis
- **Purpose**: Agent-powered data synthesis

##### **ruvector-agentic-synth-examples** (v0.1.6)
- **Purpose**: Production examples

##### **ruvector-extensions** (v0.1.0) - Plugin System

##### **ruvector-router** (v0.1.15)
- **Platform**:
  - ruvector-router-linux-x64-gnu (v0.1.15)

##### **ruvector-tiny-dancer** (v0.1.15)
- **Platform**:
  - ruvector-tiny-dancer-linux-x64-gnu (v0.1.15)

---

#### 5. QUDAG ECOSYSTEM (6 packages)

##### **qudag** (v1.2.1) - Quantum DAG
- **Installation**: `npm install qudag`

##### **qudag-cli** (v0.1.0) - CLI Tool
##### **qudag-napi-core** (v0.1.0) - NAPI Bindings
##### **qudag-mcp-stdio** (v0.1.0) - MCP STDIO Transport
##### **qudag-mcp-sse** (v0.1.0) - MCP SSE Transport

---

#### 6. DISTRIBUTED SYSTEMS (8 packages)

##### **ruv-swarm** (v1.0.20) - Swarm Framework
- **Installation**: `npm install ruv-swarm`

##### **research-swarm** (v1.2.2) - Research Coordination
- **Installation**: `npm install research-swarm`

##### **ruvnet-bmssp** (v1.0.0) - Bit-Serial Protocol
##### **ruvnet-strange-loop** (v0.3.1) - Meta-learning
##### **ruvi** (v1.1.0) - Rust Integration Utils

---

#### 7. MACHINE LEARNING (8+ packages)

##### **dspy.ts** (v2.1.1) - DSPy for TypeScript
- **Installation**: `npm install dspy.ts`
- **Purpose**: LLM programming framework (ported from Python)
- **Features**:
  - Module composition
  - In-context learning
  - Automatic optimization
  - Output parsing
- **Key Classes**:
  - `Module` - Base class
  - `ChainOfThought` - Reasoning chain
  - `Retrieve` - Retrieval
  - `Predict` - Prediction

##### **cuda-wasm** (v1.1.1) - GPU in Browser
- **Installation**: `npm install cuda-wasm`
- **Purpose**: CUDA acceleration via WASM

##### **bmssp-wasm** (v1.0.0) - Signal Processing WASM
##### **sublinear-time-solver** (v1.5.0) - Fast Algorithms
##### **psycho-symbolic-reasoner** (v1.0.7) - Symbolic AI
##### **goalie** (v1.3.1) - Goal-Oriented Agents
##### **strange-loops** (v1.0.3) - Meta-Programming

---

#### 8. DEVELOPMENT TOOLS (8 packages)

##### **create-sparc** (v1.2.4) - Project Generator
- **Installation**: `npm create sparc my-app`
- **Purpose**: SPARC project scaffolding

##### **vscode-remote-mcp** (v1.0.4) - VS Code Integration
- **Installation**: VS Code Extension
- **Purpose**: MCP support in remote development

##### **flow-nexus** (v0.1.128) - Flow Orchestration
- **Installation**: `npm install flow-nexus`

##### **foxruv-iris** (v1.8.19) - Vision System
##### **foxruv-iris-core** (v1.0.0) - Vision Core
##### **foxruv-iris-ultrathink** (v1.0.0) - Advanced Vision

##### **@foxruv/iris-agentic-synth** (v1.0.5) - Synthetic Prompt Generation
- **Installation**: `npm install @foxruv/iris-agentic-synth`
- **CLI**: `npx agentic-synth`
- **Purpose**: High-performance synthetic prompt generation with genetic evolution, streaming, and multi-model routing
- **Key Features**:
  - **Genetic Evolution**: Evolve prompts using genetic algorithms with fitness evaluation
  - **Real-Time Streaming**: Async generators for streaming prompt generation
  - **Multi-Model Routing**: Intelligent routing across multiple LLM providers
  - **High Performance**: 90%+ cache hit rate, <15ms P99 latency
  - **No Redis Required**: In-memory caching with zero external dependencies
  - **Cache Optimization**: Efficient semantic similarity caching
  - **Vector Search Integration**: Optional Ruvector integration for semantic search
  - **Zod Validation**: Type-safe prompt schemas with runtime validation
- **Performance Metrics**:
  - P99 Latency: <15ms
  - Cache Hit Rate: 90%+
  - No external cache dependencies
  - Memory-efficient design
- **Algorithms**:
  - Mutation strategies for prompt variation
  - Crossover algorithms for combining prompts
  - Fitness evaluation for quality assessment
  - Population-based evolution
- **Integration**:
  - Works with `agentic-robotics` for robot control prompts
  - `midstreamer` for streaming operations
  - Optional `ruvector` for vector-based similarity
- **Keywords**: synthetic-prompts, genetic-algorithm, prompt-engineering, streaming, multi-model, llm, ai, prompt-optimization, high-performance, no-redis
- **Engine Requirements**: Node.js >=18.0.0
- **License**: MIT

##### **foxruv-e2b-runner** (v2.0.1) - E2B Execution

---

#### 9. SECURITY & DEFENSE (2 packages)

##### **aidefence** / **aidefense** (v2.1.1) - AI Security
- **Installation**: `npm install aidefense`
- **Features**: Defense against AI manipulation

---

#### 10. TEMPORAL & ANALYSIS (5 packages)

##### **temporal-neural-solver** (v0.1.3)
- **Installation**: `npm install temporal-neural-solver`

##### **temporal-lead-solver** (v0.1.0)
- **Installation**: `npm install temporal-lead-solver`

##### **midstreamer** (v0.2.4) - Streaming Platform

---

#### 11. SPECIALIZED UTILITIES (15+ packages)

##### **ruv-sparc-ui** (v0.1.4) - React Components
##### **foxruv-agent-learning-core** (v0.5.0)
##### **foxruv-nova-medicina** (v1.0.0) - Medical AI
##### **strange-loops-mcp** (NPM) - MCP Integration
##### **veritas-nexus** (v0.1.0, Rust) - Truth System

---


---

#### 5. COMPLETE GITHUB REPOSITORIES DIRECTORY (160+ total)

The `github/` directory contains repositories cloned directly from the `ruvnet` GitHub user. These are managed by `github/download_ruvnet_repos.sh`.

##### **Key Characteristics**
- **Source**: `https://github.com/ruvnet/*`
- **Format**: Shallow clones (depth=1) with `.git` directory removed.
- **Organization**:
  - `by-tier/`: Repositories organized by stability tier (Active, Stable, Maintenance, Archive).
  - **Note**: The root `github/` directory is kept clean; all repositories reside within `by-tier/`.
- **Update Mechanism**: Incremental updates based on remote commit hash.

##### **Notable Repositories**
- **agentic-flow**: Core workflow engine for agentic systems.
- **ruvector**: Vector database implementation.
- **sparc**: System for Parallel Agentic Research and Computation.
- **neural-trader**: AI-driven trading platform components.
- **... and 150+ others**: Covering diverse topics from quantum computing to web plugins.

---

## Usage Instructions


### Quick Start: Downloading Everything

```bash
# Step 1: Navigate to repository
cd ruv_downloads

# Step 2: Discover and download all Rust crates
./crates/download_ruvnet_crates.sh --discover

# Step 3: Discover and download all NPM packages
./npmjs/download_ruvnet_packages.sh --discover

# Step 4: Check what was downloaded
cat crates/crates.dynamic.txt | wc -l      # Should be ~193
cat npmjs/packagelist.dynamic.txt | wc -l  # Should be ~195
cat github/repos.dynamic.txt | wc -l       # Should be ~166
```

### Using Individual Crates

```bash
# Add to your Cargo.toml
cargo add neural-trader
cargo add ruv-swarm-core
cargo add ruvector

# Use in your Rust code
use neural_trader::prelude::*;
let trading_engine = TradingEngine::new();
```

### Using Individual Packages

```bash
# Install from local
npm install ./npmjs/neural-trader-2.6.3

# Or link globally
npm link ./npmjs/neural-trader-2.6.3

# Import in your code
import { NeuralTrader } from 'neural-trader';
const trader = new NeuralTrader(config);
```

### Archive Operations

```bash
# View all .crate files
ls -lh 00_crates/*.crate | head -20

# View all .tgz files
ls -lh 00_tgz/*.tgz | head -20

# Check legacy archives
ls 00_crates/legacy_crates/ | head
ls 00_tgz/legacy_tgz/ | head

# Manually extract a crate
cd 00_crates
tar xzf qudag-1.4.0.crate

# Manually extract an NPM package
cd 00_tgz
tar xzf neural-trader-2.6.3.tgz
cd package/
```

---

## Integration Patterns

### Pattern 1: Multi-Agent Trading System

```typescript
import { ClaudeFlow } from 'claude-flow';
import { NeuralTrader } from 'neural-trader';
import { Ruvector } from 'ruvector';

const flow = new ClaudeFlow(apiKey);
const trader = new NeuralTrader();
const vectordb = new Ruvector();

// Agents analyze market data and make decisions
await flow.executeSwarm({
  agents: ['analyzer', 'predictor', 'executor'],
  data: marketData
});
```

### Pattern 2: Robotics with Natural Language Control

```typescript
import { RoboticSystem } from 'agentic-robotics';
import { AgenticMCP } from 'agentics.org-agentic-mcp';

const robot = new RoboticSystem('warehouse-bot');
const mcp = new AgenticMCP();

// Claude can control robot via natural language
mcp.registerTool('move_to', (target) => robot.moveTo(target));
mcp.registerTool('pick_object', (obj) => robot.pickObject(obj));
```

### Pattern 3: Secure Distributed System

```rust
use qudag::DAG;
use qudag_crypto::{ML_DSA, ML_KEM};
use ruv_swarm_core::Swarm;

let mut dag = DAG::new();
let mut swarm = Swarm::new("secure-swarm");

// Byzantine-fault-tolerant coordination
dag.add_transaction(tx)?;
swarm.route_message(msg, "agent")?;
```

---

## Performance Characteristics

### Real-Time Performance

| System | Metric | Value |
|--------|--------|-------|
| **agentic-robotics-core** | Pub/sub latency | <1 µs |
| **aimds-detection** | Threat detection | <10ms |
| **neural-trader-backtesting** | Throughput | 100x real-time |
| **ruvector** | Search latency | <5ms (p99) |
| **qudag** | Consensus latency | <100ms |
| **temporal-neural-solver** | ODE solve | ~10ms |

### Scalability

- **Agent swarms**: 1000+ agents
- **Vector DB**: 1B+ vectors
- **Trading**: 100k+ instruments
- **Network**: 10k+ nodes

### Memory Usage

- **agentic-jujutsu WASM**: 33KB
- **ruvector-tiny-dancer**: <10MB
- **qudag-vault**: <100KB
- **Agent state**: <1MB per agent

---

## Summary Statistics

- **Total Crates**: 193 (Rust)
- **Total Packages**: 195 (NPM/TypeScript)
- **Total GitHub Repositories**: 166
- **Total Artifacts**: 554
- **Documentation Pages**: 300+ README files
- **Code Size**: ~50,000+ lines of documentation
- **Performance Tested**: Yes, 95%+ of packages
- **Production Ready**: 80+ packages
- **Beta/Experimental**: 50+ packages
- **Zero Dependencies**: 15+ packages

---

**Last Updated**: January 18, 2026
**Repository**: ruv_downloads
**Maintained by**: Ruvnet Community
**License**: MIT/Apache-2.0 (dual)
