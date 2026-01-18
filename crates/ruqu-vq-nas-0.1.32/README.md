# ruqu-vq-nas

Variational Quantum Neural Architecture Search (VQ-NAS) - Automated quantum circuit architecture discovery with evolutionary and Bayesian optimization.

[![Crates.io](https://img.shields.io/crates/v/ruqu-vq-nas.svg)](https://crates.io/crates/ruqu-vq-nas)
[![Documentation](https://docs.rs/ruqu-vq-nas/badge.svg)](https://docs.rs/ruqu-vq-nas)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Part of the [ruQu](https://crates.io/crates/ruqu) quantum computing suite by [ruv.io](https://ruv.io).

## Features

- **Search Space Definition** - Gate primitives, layer templates, connectivity constraints
- **Evolutionary Search** - Mutation, crossover, and regularized evolution
- **Bayesian Optimization** - Gaussian process surrogate models
- **Differentiable NAS** - Continuous relaxation for gradient-based search
- **Expressibility Metrics** - KL divergence from Haar random measure

## Installation

```toml
[dependencies]
ruqu-vq-nas = "0.1"
```

## Quick Start

```rust
use ruqu_vq_nas::{SearchSpace, SearchAlgorithm, SearchConfig};
use rand::SeedableRng;
use rand_chacha::ChaCha8Rng;

let space = SearchSpace::hardware_efficient(4, 5)?;
let config = SearchConfig::quick();

let mut rng = ChaCha8Rng::seed_from_u64(42);
let mut search = SearchAlgorithm::evolutionary(space, config)?;
let result = search.search(&mut rng)?;

println!("Best fitness: {}", result.best_evaluation.fitness);
```

## License

MIT License - see [LICENSE](https://github.com/ruvnet/ruvector/blob/main/LICENSE)
