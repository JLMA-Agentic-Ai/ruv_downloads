# lyapfit

[![Rust](https://img.shields.io/badge/Rust-1.76%2B-orange.svg)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)
[![Build](https://img.shields.io/badge/CI-ready-brightgreen.svg)](#)
[![SIMD-safe](https://img.shields.io/badge/CPU-SIMD_safe-lightgrey.svg)](#)
[![Agentic](https://img.shields.io/badge/Agentic-Flow_Nexus_%7C_Claude--Flow_%7C_ruv--swarm-purple.svg)](#ecosystem)

Ultra fast CLI to estimate the **largest Lyapunov exponent** from a time series or trajectory using delay embedding, Theiler windows, cache friendly VP-trees, and parallelized early growth fits.

 🌀

Think of this tool as a **“forecast horizon meter”** for any data series. In chaotic systems, small mistakes quickly grow until predictions are useless. The speed of that growth is called the **Lyapunov exponent**.

* If the exponent is **large**, your system becomes unpredictable quickly.
* If it’s **small**, you can trust forecasts further into the future.

This CLI program takes a CSV file of your data (a trajectory, a sensor log, a simulation trace, or even stock prices) and tells you **how far into the future you can make reliable predictions**.

It outputs three numbers:

* **λ (lambda):** error growth rate
* **T<sub>L</sub> (Lyapunov time):** time until your errors multiply by *e* (~2.718)
* **T<sub>d</sub> (Doubling time):** time until your errors double

In practical terms:

* For robots, it tells you how often to replan.
* For markets, it sets how far forecasts should extend before noise dominates.
* For agent swarms, it defines the “safe prediction window” before agents must recalibrate.

You don’t need to understand the math details. Just remember: **higher λ = shorter foresight**. This program calculates it for you quickly and 
---

## What this is in plain English

Prediction breaks when tiny errors blow up. The **largest Lyapunov exponent** λ tells you how fast that happens. You feed this tool a CSV of states or a single column series, it reconstructs the state space if needed, finds near twin histories, measures how their separation grows over the next few steps, and fits the growth rate. From λ you get a **Lyapunov time** (T_L = 1/λ) and a **doubling horizon** (T_d = \ln 2 / λ). That is your honest lookahead before plans should replan.

---

## Features

* **Delay embedding** for univariate series with `--m` and `--tau`
* **Theiler window** to ignore trivial temporal neighbors
* **Nearest neighbor search** via a compact VP-tree
* **Parallel slope fits** over early divergences
* **Cache aware distance kernel** with small unroll
* **CSV in or stdin**. Header optional
* **Deterministic output** and concise metrics

---

## Install

```bash
# in a temp dir
cargo init --bin lyapfit
# replace src/main.rs and Cargo.toml with the files from this gist
cargo build --release
target/release/lyapfit -h
```

---

## Usage

```bash
# multivariate state per row, sample time dt=0.01, fit first 12 steps
lyapfit data.csv --dt 0.01 --k-fit 12

# univariate series in column 0 with delay embedding m=6, tau=2 samples
lyapfit data.csv --dt 0.01 --col 0 --m 6 --tau 2 --k-fit 15

# read from stdin, skip header, widen Theiler window
cat data.csv | lyapfit - --no-header --dt 0.02 --theiler 50
```

**Output**

```
points_used,dim,dt,k_fit,theiler,pairs,lambda,lyapunov_time,Td_doubling
12345,6,0.010000000,12,20,980,0.118234567,8.456123789,5.864321012
```

---

## Practical notes

* Keep `--k-fit` small enough to stay in the early linear regime of log growth
* Increase `--theiler` if neighbors collapse to near duplicates
* For long series, raise `--max-pairs` to average more local slopes
* If your initial separations are near machine zero, set `--min-init-sep` higher

---

## Applications

* **Planning horizons** for agentic workflows and replanning cadence
* **Forecast routing** and ensemble cutoffs in Claude-Flow and Flow-Nexus
* **Safety bounds** for autonomous loops and control in ruv-swarm
* **Benchmarking** chaotic sims, market microstructure, robotics traces

---

## CSV formats

* **Multivariate:** each row is a state vector `[x1, x2, ...]`
* **Univariate:** single column series, choose `--col`, `--m`, `--tau`

Non finite rows are skipped.

---

## Ecosystem

* rUv GitHub: [https://github.com/ruvnet](https://github.com/ruvnet)
* Claude-Flow: [https://github.com/ruvnet/claude-flow](https://github.com/ruvnet/claude-flow)
* Flow-Nexus: [https://github.com/ruvnet/flow-nexus](https://github.com/ruvnet/flow-nexus)
* ruv-swarm: [https://github.com/ruvnet/ruv-swarm](https://github.com/ruvnet/ruv-swarm)

These tools play well together. Use λ to set agent planning depth, verification loop cadence, and when to hand work back to planners.

---

## Performance tips

* Build with `--release`
* Pin `--k-fit` to 8–20 steps for stable linear fits
* Pre filter or normalize columns for comparable scales

---

## References

* Kantz, H., & Schreiber, T. *Nonlinear Time Series Analysis*, Cambridge University Press, 2004.
* Wolf, A. et al. “Determining Lyapunov Exponents from a Time Series,” *Physica D*, 1985.
* Rosenstein, M. T. et al. “A Practical Method for Calculating Largest Lyapunov Exponents from Small Data Sets,” *Physica D*, 1993.

---

## License

MIT. See `LICENSE`.

---

## Acknowledgements

Part of the rUv agentic toolbox for measured, verifiable autonomy.

**Created with ❤️ by rUv | Agentics Foundation**

*In the end, true intelligence may not be a single mind, but a chorus of smaller ones — learning, adapting, and thinking together.*
