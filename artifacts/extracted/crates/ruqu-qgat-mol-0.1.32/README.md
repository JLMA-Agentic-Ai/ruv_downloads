# ruqu-qgat-mol

Quantum Graph Attention for Molecules - Combines quantum mechanics with graph attention networks for molecular simulation.

[![Crates.io](https://img.shields.io/crates/v/ruqu-qgat-mol.svg)](https://crates.io/crates/ruqu-qgat-mol)
[![Documentation](https://docs.rs/ruqu-qgat-mol/badge.svg)](https://docs.rs/ruqu-qgat-mol)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Part of the [ruQu](https://crates.io/crates/ruqu) quantum computing suite by [ruv.io](https://ruv.io).

## Features

- **Quantum Orbital Features** - Atomic orbital-inspired feature extraction
- **Graph Attention** - Multi-head attention over molecular graphs
- **Property Prediction** - Energy, HOMO-LUMO gap, dipole moments
- **Message Passing** - Quantum-enhanced node/edge updates
- **Molecular Fingerprints** - Learned representations for similarity

## Installation

```toml
[dependencies]
ruqu-qgat-mol = "0.1"
```

## Quick Start

```rust
use ruqu_qgat_mol::{MolecularGraph, QuantumGAT, GATConfig};

let config = GATConfig {
    n_layers: 3,
    hidden_dim: 64,
    n_heads: 4,
    ..Default::default()
};

let model = QuantumGAT::new(config)?;
let molecule = MolecularGraph::from_smiles("CCO")?; // Ethanol

let energy = model.predict_energy(&molecule)?;
println!("Predicted energy: {:.4} eV", energy);
```

## License

MIT License - see [LICENSE](https://github.com/ruvnet/ruvector/blob/main/LICENSE)
