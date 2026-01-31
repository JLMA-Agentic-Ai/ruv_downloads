# Delta-Behavior

**The mathematics of systems that refuse to collapse.**

[![Crates.io](https://img.shields.io/crates/v/delta-behavior.svg)](https://crates.io/crates/delta-behavior)
[![Documentation](https://docs.rs/delta-behavior/badge.svg)](https://docs.rs/delta-behavior)
[![License](https://img.shields.io/crates/l/delta-behavior.svg)](LICENSE-MIT)

Delta-behavior is a design principle for building systems where **change is permitted but collapse is not**. It provides a framework for constraining state transitions to preserve global coherence.

## Key Features

- **Coherence-First Design**: Optimize for stability, not just performance
- **Three-Layer Enforcement**: Energy cost, scheduling, and memory gating
- **Attractor Dynamics**: Systems naturally gravitate toward stable states
- **10 Exotic Applications**: From AI safety to financial systems

## Quick Start

Add to your `Cargo.toml`:

```toml
[dependencies]
delta-behavior = "0.1"
```

Basic usage:

```rust
use delta_behavior::{DeltaSystem, Coherence, DeltaConfig};
use delta_behavior::enforcement::{DeltaEnforcer, EnforcementResult};

// Create an enforcer with default configuration
let config = DeltaConfig::default();
let mut enforcer = DeltaEnforcer::new(config);

// Check if a transition should be allowed
let current = Coherence::new(0.8).unwrap();
let predicted = Coherence::new(0.75).unwrap();

match enforcer.check(current, predicted) {
    EnforcementResult::Allowed => println!("Transition allowed"),
    EnforcementResult::Throttled(delay) => println!("Wait {:?}", delay),
    EnforcementResult::Blocked(reason) => println!("Blocked: {}", reason),
}
```

## The Four Properties

A system exhibits Delta-behavior when:

1. **Local Change**: State updates happen in bounded steps
2. **Global Preservation**: Local changes don't break overall structure
3. **Violation Resistance**: Destabilizing transitions are damped/blocked
4. **Closure Preference**: System naturally settles into stable attractors

## Configuration

Three preset configurations are available:

```rust
// Default: Balanced stability and flexibility
let config = DeltaConfig::default();

// Strict: For safety-critical applications
let config = DeltaConfig::strict();

// Relaxed: For exploratory applications
let config = DeltaConfig::relaxed();
```

Custom configuration:

```rust
use delta_behavior::{DeltaConfig, CoherenceBounds, Coherence};

let config = DeltaConfig {
    bounds: CoherenceBounds {
        min_coherence: Coherence::new(0.4).unwrap(),
        throttle_threshold: Coherence::new(0.6).unwrap(),
        target_coherence: Coherence::new(0.85).unwrap(),
        max_delta_drop: 0.08,
    },
    guidance_strength: 0.7,
    ..DeltaConfig::default()
};
```

## Applications

Enable specific applications via feature flags:

```toml
[dependencies]
delta-behavior = { version = "0.1", features = ["containment", "swarm-intelligence"] }
```

Available applications:

| Feature | Description |
|---------|-------------|
| `self-limiting-reasoning` | AI that does less when uncertain |
| `event-horizon` | Bounded computation without hard limits |
| `homeostasis` | Synthetic life with coherence-based survival |
| `world-model` | Models that refuse to hallucinate |
| `coherence-creativity` | Novelty without chaos |
| `anti-cascade` | Markets that cannot collapse |
| `graceful-aging` | Systems that simplify over time |
| `swarm-intelligence` | Collective behavior without pathology |
| `graceful-shutdown` | Systems that seek safe termination |
| `containment` | Bounded intelligence growth |

Application groups:

```toml
# All applications
features = ["all-applications"]

# Safety-critical only
features = ["safety-critical"]

# AI/ML applications
features = ["ai-ml"]

# Distributed systems
features = ["distributed"]
```

## Three-Layer Enforcement

Delta-behavior uses defense-in-depth:

```
  Transition
      |
      v
+-------------+     Soft constraint:
| Energy Cost |---> Unstable = expensive
+-------------+
      |
      v
+-------------+     Medium constraint:
|  Scheduling |---> Unstable = delayed
+-------------+
      |
      v
+-------------+     Hard constraint:
| Memory Gate |---> Incoherent = blocked
+-------------+
      |
      v
   Applied
```

## WASM Support

The library supports WebAssembly:

```toml
[dependencies]
delta-behavior = { version = "0.1", features = ["wasm"] }
```

## Documentation

- [API Reference](https://docs.rs/delta-behavior)
- [Whitepaper](./WHITEPAPER.md) - Full theoretical foundations
- [API Guide](./docs/API.md) - Comprehensive API documentation
- [Changelog](./CHANGELOG.md) - Version history

## Minimum Supported Rust Version

Rust 1.75.0 or later.

## License

Licensed under either of:

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE))
- MIT license ([LICENSE-MIT](LICENSE-MIT))

at your option.

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## Citation

If you use Delta-behavior in academic work, please cite:

```bibtex
@software{delta_behavior,
  title = {Delta-Behavior: Constrained State Transitions for Coherent Systems},
  author = {RuVector Team},
  year = {2026},
  url = {https://github.com/ruvnet/ruvector}
}
```
