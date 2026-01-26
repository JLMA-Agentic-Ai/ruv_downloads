# ruqu-qear

Quantum Echo-Attention Reservoir (QEAR) - Combining quantum reservoir computing with attention mechanisms for time series processing.

[![Crates.io](https://img.shields.io/crates/v/ruqu-qear.svg)](https://crates.io/crates/ruqu-qear)
[![Documentation](https://docs.rs/ruqu-qear/badge.svg)](https://docs.rs/ruqu-qear)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Part of the [ruQu](https://crates.io/crates/ruqu) quantum computing suite by [ruv.io](https://ruv.io).

## Features

- **Quantum Reservoir** - High-dimensional quantum state space for temporal processing
- **Echo State Networks** - Recurrent dynamics with spectral radius control
- **Attention Mechanism** - Self-attention over reservoir states
- **Time Series Forecasting** - Multi-step ahead prediction
- **Anomaly Detection** - Deviation scoring from learned dynamics

## Installation

```toml
[dependencies]
ruqu-qear = "0.1"
```

## Quick Start

```rust
use ruqu_qear::{QuantumReservoir, ReservoirConfig, TimeSeries};

let config = ReservoirConfig {
    n_qubits: 6,
    reservoir_size: 100,
    spectral_radius: 0.9,
    ..Default::default()
};

let mut reservoir = QuantumReservoir::new(config)?;

// Train on time series
reservoir.fit(&training_data)?;

// Predict future values
let predictions = reservoir.predict(10)?; // 10 steps ahead
```

## License

MIT License - see [LICENSE](https://github.com/ruvnet/ruvector/blob/main/LICENSE)
