# ruqu-qflg

Quantum Federated Learning with Byzantine Tolerance - Privacy-preserving distributed quantum ML.

[![Crates.io](https://img.shields.io/crates/v/ruqu-qflg.svg)](https://crates.io/crates/ruqu-qflg)
[![Documentation](https://docs.rs/ruqu-qflg/badge.svg)](https://docs.rs/ruqu-qflg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Part of the [ruQu](https://crates.io/crates/ruqu) quantum computing suite by [ruv.io](https://ruv.io).

## Features

- **Federated Aggregation** - Secure gradient aggregation across clients
- **Byzantine Tolerance** - Robust to malicious or faulty participants
- **Differential Privacy** - Formal privacy guarantees with ε-δ bounds
- **Quantum Secure** - Post-quantum cryptographic primitives
- **Async Communication** - Non-blocking client updates

## Installation

```toml
[dependencies]
ruqu-qflg = "0.1"
```

## Quick Start

```rust
use ruqu_qflg::{FederationServer, ClientConfig, PrivacyConfig};

let privacy = PrivacyConfig {
    epsilon: 1.0,
    delta: 1e-5,
    clip_norm: 1.0,
};

let server = FederationServer::new(10, privacy)?;

// Federated training round
let gradients = server.collect_gradients().await?;
let aggregated = server.aggregate_byzantine_robust(&gradients)?;
server.broadcast_update(&aggregated).await?;
```

## License

MIT License - see [LICENSE](https://github.com/ruvnet/ruvector/blob/main/LICENSE)
