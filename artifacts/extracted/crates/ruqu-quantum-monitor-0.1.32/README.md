# ruvector-quantum-monitor

[![Crates.io](https://img.shields.io/crates/v/ruvector-quantum-monitor.svg)](https://crates.io/crates/ruvector-quantum-monitor)
[![Documentation](https://docs.rs/ruvector-quantum-monitor/badge.svg)](https://docs.rs/ruvector-quantum-monitor)
[![License](https://img.shields.io/badge/license-MIT%2FApache--2.0-blue.svg)](LICENSE)

> **Anytime-Valid Quantum Kernel Coherence Monitor (AV-QKCM)** - Sequential hypothesis testing with quantum-inspired kernels

## Overview

`ruvector-quantum-monitor` implements **anytime-valid statistical monitoring** for quantum coherence and distribution drift detection. It combines:

- **Quantum-inspired kernels** for capturing high-dimensional structure
- **E-value based testing** for valid inference at any stopping time
- **Confidence sequences** for time-uniform uncertainty quantification

### Key Features

- **Anytime-Valid Inference**: Stop and report results at any time with valid p-values
- **Quantum Feature Maps**: Parameterized quantum circuit simulation for kernel computation
- **Streaming Efficiency**: O(1) memory per observation with online updates
- **Thread-Safe**: `SharedMonitor` for multi-agent coordination
- **Mathematically Sound**: Based on Ville's inequality and betting martingales

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
ruvector-quantum-monitor = "0.1"
```

## Quick Start

```rust
use ruqu_quantum_monitor::{
    QuantumCoherenceMonitor, MonitorConfig, QuantumKernelConfig
};

// Create monitor with default config
let config = MonitorConfig::default();
let mut monitor = QuantumCoherenceMonitor::new(config)?;

// Set baseline distribution from calibration data
let baseline_data = /* calibration measurements */;
monitor.set_baseline(&baseline_data)?;

// Monitor incoming observations
for observation in live_stream {
    let result = monitor.observe(&observation)?;

    if result.drift_detected {
        println!("ALERT: Drift detected! P-value: {:.4}", result.p_value);
        println!("Confidence interval: [{:.4}, {:.4}]",
            result.confidence_interval.lower,
            result.confidence_interval.upper);
    }
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AV-QKCM Pipeline                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Baseline     ┌──────────────┐    ┌──────────────┐              │
│  Data ───────►│ Quantum      │───►│ Baseline     │              │
│               │ Feature Map  │    │ Kernel Stats │              │
│               └──────────────┘    └──────┬───────┘              │
│                                          │                       │
│  Streaming    ┌──────────────┐    ┌──────▼───────┐              │
│  Observation─►│ Quantum      │───►│ MMD          │              │
│               │ Kernel       │    │ Estimator    │              │
│               └──────────────┘    └──────┬───────┘              │
│                                          │                       │
│                                   ┌──────▼───────┐  ┌─────────┐ │
│                                   │ E-Value      │─►│ Decision│ │
│                                   │ Test         │  │ + CI    │ │
│                                   └──────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Module Overview

| Module | Description |
|--------|-------------|
| `kernel` | Quantum-inspired feature maps and kernel computation |
| `evalue` | E-value based sequential hypothesis testing |
| `confidence` | Time-uniform confidence sequences |
| `monitor` | Main coherence monitoring interface |
| `error` | Comprehensive error types |

---

<details>
<summary><h2>📖 Tutorial: Basic Drift Detection</h2></summary>

### Step 1: Configure the Monitor

```rust
use ruqu_quantum_monitor::{
    MonitorConfig, QuantumKernelConfig, EValueConfig, ConfidenceSequenceConfig
};

let config = MonitorConfig {
    kernel: QuantumKernelConfig {
        n_qubits: 4,          // Feature space dimension 2^4 = 16
        n_layers: 2,          // Quantum circuit depth
        sigma: 1.0,           // Bandwidth parameter
        use_entanglement: true,
        seed: Some(42),       // Reproducibility
    },
    evalue: EValueConfig {
        alpha: 0.05,          // Significance level
        bet_fraction: 0.5,    // Kelly criterion fraction
        adaptive_betting: true,
        min_samples: 10,
        ..Default::default()
    },
    confidence: ConfidenceSequenceConfig {
        confidence_level: 0.95,
        min_samples: 5,
        ..Default::default()
    },
};

let mut monitor = QuantumCoherenceMonitor::new(config)?;
```

### Step 2: Establish Baseline

```rust
use ndarray::Array2;

// Baseline data: n_samples × n_features
let baseline = Array2::from_shape_fn((100, 3), |(i, j)| {
    // Your calibration measurements
    calibration_data[i][j]
});

monitor.set_baseline(&baseline)?;
println!("Baseline established with {} samples", baseline.nrows());
```

### Step 3: Monitor Stream

```rust
let mut drift_count = 0;

for (t, observation) in data_stream.enumerate() {
    let result = monitor.observe(&observation)?;

    // Always-valid p-value
    println!("t={}: p-value={:.4}, E-value={:.2}",
        t, result.p_value, result.evalue);

    // Check drift at any time
    if result.drift_detected {
        drift_count += 1;
        println!("  → DRIFT DETECTED (total: {})", drift_count);
    }

    // Confidence interval is valid at every step
    let ci = result.confidence_interval;
    println!("  → 95% CI: [{:.4}, {:.4}]", ci.lower, ci.upper);
}
```

</details>

---

<details>
<summary><h2>🔬 Tutorial: Custom Quantum Kernels</h2></summary>

### Understanding Quantum Kernels

The quantum kernel computes similarity via quantum state fidelity:

```
k(x, y) = |⟨φ(x)|φ(y)⟩|²
```

where `|φ(x)⟩ = U(x)|0⟩ⁿ` is the quantum feature map.

### Configure Kernel Parameters

```rust
use ruqu_quantum_monitor::{QuantumKernel, QuantumKernelConfig};

// High-expressivity kernel for complex distributions
let config = QuantumKernelConfig {
    n_qubits: 6,              // 2^6 = 64 dimensional feature space
    n_layers: 4,              // Deeper circuit = more entanglement
    sigma: 0.5,               // Narrower bandwidth = sharper discrimination
    use_entanglement: true,   // ZZ gates between adjacent qubits
    seed: Some(123),
};

let kernel = QuantumKernel::new(config)?;
```

### Compute Kernel Matrices

```rust
use ndarray::array;

let x = array![0.1, 0.2, 0.3];
let y = array![0.15, 0.25, 0.35];

// Single kernel value
let k_xy = kernel.kernel(&x, &y)?;
println!("k(x, y) = {:.4}", k_xy);

// Full kernel matrix
let data = Array2::from_shape_vec((100, 3), measurements)?;
let K = kernel.kernel_matrix(&data)?;
println!("Kernel matrix shape: {:?}", K.shape());

// Cross-kernel between baseline and test
let K_cross = kernel.cross_kernel_matrix(&baseline, &test_data)?;
```

### Streaming Kernel Updates

```rust
use ruqu_quantum_monitor::StreamingKernelAccumulator;

let mut accumulator = StreamingKernelAccumulator::new(kernel);
accumulator.set_baseline(&baseline)?;

// O(1) memory updates
for observation in stream {
    let mmd_estimate = accumulator.update(&observation)?;
    println!("Streaming MMD²: {:.6}", mmd_estimate);
}
```

</details>

---

<details>
<summary><h2>📊 Tutorial: E-Value Testing</h2></summary>

### What Are E-Values?

E-values are a modern alternative to p-values that allow:
- **Optional stopping**: Test at any time without inflating error rates
- **Optional continuation**: Keep collecting data after significant results
- **Multiplicative combination**: E-values from independent tests multiply

### Mathematical Background

Under the null hypothesis H₀, e-values satisfy:
```
E[E_t] ≤ 1  for all stopping times t
```

The anytime-valid p-value is `p_t = 1/E_t`.

### Direct E-Value Testing

```rust
use ruqu_quantum_monitor::{EValueTest, EValueConfig, MMDEstimator};

let config = EValueConfig {
    alpha: 0.05,
    bet_fraction: 0.5,      // Kelly-optimal betting
    adaptive_betting: true, // Learn optimal bet over time
    min_samples: 10,
    initial_wealth: 1.0,
};

let mut test = EValueTest::new(config)?;

// Process MMD estimates sequentially
for mmd_squared in mmd_estimates {
    let update = test.update(mmd_squared);

    println!("E-value: {:.2}, p-value: {:.4}, samples: {}",
        update.evalue, update.p_value, update.n_samples);

    if test.is_drift_detected() {
        println!("Reject H₀ at level α = 0.05");
        break;  // Optional: can continue collecting
    }
}
```

### Betting Strategies

```rust
// Conservative betting (lower power, higher robustness)
let conservative = EValueConfig {
    bet_fraction: 0.2,
    adaptive_betting: false,
    ..Default::default()
};

// Aggressive betting (higher power, more variance)
let aggressive = EValueConfig {
    bet_fraction: 0.8,
    adaptive_betting: true,
    ..Default::default()
};
```

</details>

---

<details>
<summary><h2>📈 Tutorial: Confidence Sequences</h2></summary>

### What Are Confidence Sequences?

A (1-α) confidence sequence is a sequence of intervals `[L_t, U_t]` such that:
```
P(μ ∈ [L_t, U_t] for all t ≥ 1) ≥ 1 - α
```

Unlike standard confidence intervals, these are **simultaneously valid** at all sample sizes.

### Basic Usage

```rust
use ruqu_quantum_monitor::{ConfidenceSequence, ConfidenceSequenceConfig};

let config = ConfidenceSequenceConfig {
    confidence_level: 0.95,
    min_samples: 5,
    empirical_variance: true,
    variance_proxy: 1.0,  // Upper bound on variance
    rho: 1.0,             // Mixture parameter
};

let mut cs = ConfidenceSequence::new(config)?;

for (t, x) in observations.iter().enumerate() {
    if let Some(ci) = cs.update(*x) {
        println!("t={}: Mean estimate {:.4}, 95% CI [{:.4}, {:.4}]",
            t, ci.center(), ci.lower, ci.upper);
        println!("  Width: {:.4} (shrinking as ~1/√t)", ci.width);
    }
}
```

### Change Detection

```rust
use ruqu_quantum_monitor::ChangeDetectionCS;

let mut detector = ChangeDetectionCS::new(
    0.0,    // Reference value (e.g., expected MMD under H₀)
    0.95,   // Confidence level
)?;

for mmd in mmd_estimates {
    let result = detector.update(mmd);

    if result.change_detected {
        println!("Change from reference detected!");
        println!("New estimate: {:.4} ± {:.4}", result.estimate, result.radius);
    }
}
```

</details>

---

<details>
<summary><h2>🔒 Thread-Safe Monitoring</h2></summary>

### SharedMonitor for Multi-Agent Systems

```rust
use ruqu_quantum_monitor::SharedMonitor;
use std::sync::Arc;

// Create shared monitor
let monitor = SharedMonitor::new(config)?;
let monitor = Arc::new(monitor);

// Spawn multiple observer threads
let handles: Vec<_> = (0..4).map(|agent_id| {
    let monitor = Arc::clone(&monitor);

    std::thread::spawn(move || {
        for observation in agent_stream(agent_id) {
            let result = monitor.observe(&observation)?;
            if result.drift_detected {
                report_alert(agent_id, result);
            }
        }
        Ok::<_, Error>(())
    })
}).collect();

// Wait for all agents
for h in handles {
    h.join().unwrap()?;
}
```

### Integration with Cognitum Gate

```rust
use cognitum_gate_tilezero::CoherenceGate;
use ruqu_quantum_monitor::SharedMonitor;

let monitor = SharedMonitor::new(config)?;

// Use monitor as coherence backend for gate decisions
let gate = CoherenceGate::new()
    .with_coherence_monitor(monitor)
    .with_threshold(0.01);  // P-value threshold for permit

for action in agent_actions {
    let decision = gate.evaluate(&action)?;
    match decision {
        Permit(token) => execute(action, token),
        Defer(reason) => queue_for_review(action, reason),
        Deny(witness) => log_denial(action, witness),
    }
}
```

</details>

---

<details>
<summary><h2>⚡ Performance Benchmarks</h2></summary>

### Benchmark Results

| Operation | Dimension | Samples | Time | Memory |
|-----------|-----------|---------|------|--------|
| Kernel value | d=16 | 1 pair | 850ns | O(1) |
| Kernel matrix | d=16 | 100×100 | 8.5ms | O(n²) |
| Streaming MMD | d=16 | per obs | 1.2μs | O(1) |
| E-value update | - | per obs | 45ns | O(1) |
| Full observation | d=16 | per obs | 2.1μs | O(1) |

### Scaling

| Qubits | Feature Dim | Kernel Time | Memory |
|--------|-------------|-------------|--------|
| 2 | 4 | 120ns | 32B |
| 4 | 16 | 850ns | 128B |
| 6 | 64 | 5.2μs | 512B |
| 8 | 256 | 38μs | 2KB |

### Run Benchmarks

```bash
cargo bench --package ruvector-quantum-monitor
```

</details>

---

<details>
<summary><h2>🧪 Testing</h2></summary>

### Run All Tests

```bash
cargo test -p ruvector-quantum-monitor
```

### Test Categories

| Category | Count | Description |
|----------|-------|-------------|
| Unit tests | 48 | Module-level functionality |
| Property tests | 17 | Proptest invariant checks |

### Key Properties Tested

- **Kernel symmetry**: `k(x, y) = k(y, x)`
- **E-value non-negativity**: `E_t ≥ 0` always
- **Confidence coverage**: Intervals contain true mean (in simulation)
- **MMD positivity**: `MMD² ≥ 0` for valid kernels

</details>

---

## API Reference

### Core Types

```rust
/// Main monitoring interface
pub struct QuantumCoherenceMonitor {
    // ...
}

/// Thread-safe wrapper
pub struct SharedMonitor {
    // Uses parking_lot::RwLock internally
}

/// Observation result
pub struct ObservationResult {
    pub evalue: f64,
    pub p_value: f64,
    pub drift_detected: bool,
    pub confidence_interval: ConfidenceInterval,
    pub n_samples: usize,
}

/// Confidence interval
pub struct ConfidenceInterval {
    pub lower: f64,
    pub upper: f64,
    pub width: f64,
}
```

## Mathematical References

1. Howard, S. et al. (2021). "Time-uniform, nonparametric, nonasymptotic confidence sequences." *Annals of Statistics*.
2. Ramdas, A. et al. (2024). "Testing exchangeability: Fork-convex hulls, supermartingales and e-processes." *JRSSB*.
3. Havlicek, V. et al. (2019). "Supervised learning with quantum-enhanced feature spaces." *Nature*.
4. Gretton, A. et al. (2012). "A Kernel Two-Sample Test." *JMLR*.

## License

Licensed under either of Apache License, Version 2.0 or MIT license at your option.
