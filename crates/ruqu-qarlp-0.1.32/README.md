# ruqu-qarlp

Quantum-Assisted Reinforcement Learning Policy - exploratory quantum RL implementation with variational circuits.

[![Crates.io](https://img.shields.io/crates/v/ruqu-qarlp.svg)](https://crates.io/crates/ruqu-qarlp)
[![Documentation](https://docs.rs/ruqu-qarlp/badge.svg)](https://docs.rs/ruqu-qarlp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Part of the [ruQu](https://crates.io/crates/ruqu) quantum computing suite by [ruv.io](https://ruv.io).

## Features

- **Variational Quantum Circuits** - Parameterized quantum circuits for policy representation
- **Policy Gradient Methods** - REINFORCE and actor-critic implementations
- **Quantum State Encoding** - Amplitude and angle encoding strategies
- **Experience Replay** - Quantum-enhanced experience buffer
- **Gradient Estimation** - Parameter-shift rule for quantum gradients

## Installation

```toml
[dependencies]
ruqu-qarlp = "0.1"
```

## Quick Start

```rust
use ruqu_qarlp::{QuantumPolicy, PolicyConfig, Environment};

let config = PolicyConfig {
    n_qubits: 4,
    n_layers: 2,
    learning_rate: 0.01,
    ..Default::default()
};

let mut policy = QuantumPolicy::new(config)?;
let env = Environment::cartpole();

// Training loop
for episode in 0..1000 {
    let trajectory = policy.rollout(&env)?;
    policy.update(&trajectory)?;
}
```

## License

MIT License - see [LICENSE](https://github.com/ruvnet/ruvector/blob/main/LICENSE)
