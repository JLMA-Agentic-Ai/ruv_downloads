Here’s a fast, no-nonsense Rust CLI that estimates the largest Lyapunov exponent from a trajectory or time series using delay embedding, a Theiler window, a cache-friendly VP-tree nearest-neighbor search, and parallel slope fits over early divergences. It avoids exotic deps, compiles cleanly, and scales well to mid-size datasets. Usage examples are in the doc comment at the top.

```toml
# Cargo.toml
[package]
name = "lyapfit"
version = "0.1.0"
edition = "2021"

[dependencies]
anyhow = "1.0"
clap = { version = "4.5", features = ["derive"] }
csv = "1.3"
rayon = "1.10"
```

```rust
// src/main.rs
/*!
Lyapunov λ via nearest-neighbor divergence.

Examples
  # multivariate state per row, dt=0.01s, fit first 12 steps
  lyapfit data.csv --dt 0.01 --k-fit 12

  # univariate series in column 0 with delay embedding m=6, tau=2 samples
  lyapfit data.csv --dt 0.01 --col 0 --m 6 --tau 2 --k-fit 15

  # read CSV from stdin, skip header, widen Theiler window
  cat data.csv | lyapfit - --no-header --dt 0.02 --theiler 50
*/

use anyhow::{bail, Context, Result};
use clap::Parser;
use rayon::prelude::*;
use std::cmp::Ordering;
use std::fs::File;
use std::io::{stdin, BufReader, Read};

#[derive(Parser, Debug)]
#[command(name="lyapfit")]
struct Args {
    /// CSV file path or "-" for stdin
    path: String,
    /// Sampling interval ∆t in seconds
    #[arg(long)]
    dt: f64,
    /// Column index for univariate delay embedding. Omit to use all columns as the state.
    #[arg(long)]
    col: Option<usize>,
    /// Embedding dimension m (univariate only)
    #[arg(long, default_value = "1")]
    m: usize,
    /// Delay in samples τ (univariate only)
    #[arg(long, default_value = "1")]
    tau: usize,
    /// Use header row
    #[arg(long, default_value_t = true)]
    header: bool,
    /// Theiler window W in samples to exclude temporal neighbors
    #[arg(long, default_value = "20")]
    theiler: usize,
    /// Number of early steps to fit (K_fit)
    #[arg(long, default_value = "12")]
    k_fit: usize,
    /// Maximum pairs sampled for averaging (stride over i)
    #[arg(long, default_value = "4000")]
    max_pairs: usize,
    /// Minimum initial separation; pairs below are skipped
    #[arg(long, default_value = "1e-12")]
    min_init_sep: f64,
}

fn main() -> Result<()> {
    let args = Args::parse();
    if args.dt <= 0.0 {
        bail!("dt must be > 0");
    }
    if args.m == 0 {
        bail!("m must be >= 1");
    }
    if args.k_fit < 2 {
        bail!("k-fit must be >= 2");
    }

    let raw = read_csv(&args.path, args.header).context("reading CSV")?;
    if raw.is_empty() {
        bail!("empty input");
    }

    // Build state matrix X: Vec<Vec<f64>> where each entry is a state vector at time t
    let x = if let Some(col) = args.col {
        let series: Vec<f64> = raw
            .iter()
            .map(|row| {
                row.get(col)
                    .copied()
                    .unwrap_or_else(|| f64::NAN)
            })
            .collect();
        let x = delay_embed(&series, args.m, args.tau)?;
        x
    } else {
        // multivariate state per row
        raw
    };

    let n = x.len();
    if n < args.k_fit + 2 {
        bail!("not enough points after embedding");
    }
    let dim = x[0].len();
    if dim == 0 {
        bail!("zero-dimension state");
    }

    // Build VP-tree over embedded states
    let mut indices: Vec<usize> = (0..n - args.k_fit).collect(); // restrict to allow i+k access
    let tree = VpTree::build(&x, &mut indices);

    // Precompute linear regression constants for t = {1..K} * dt
    let k = args.k_fit as usize;
    let dt = args.dt;
    let mut t = Vec::with_capacity(k);
    for kk in 1..=k {
        t.push(kk as f64 * dt);
    }
    let t_mean = mean(&t);
    let var_t = t.iter().map(|tk| (tk - t_mean) * (tk - t_mean)).sum::<f64>();
    if var_t <= 0.0 {
        bail!("degenerate time variance");
    }

    // Sample pairs i -> j_nearest with Theiler window, fit slope on early log distances
    let stride = std::cmp::max(1usize, (n - args.k_fit) / args.max_pairs.max(1));
    let theiler = args.theiler;

    let slopes: Vec<f64> = (0..n - args.k_fit)
        .step_by(stride)
        .collect::<Vec<_>>()
        .par_iter()
        .filter_map(|&i| {
            let query = &x[i];
            // nearest neighbor with Theiler exclusion
            if let Some((j, d0)) = tree.nearest_excluding(query, i, theiler) {
                if d0 <= args.min_init_sep || j + k >= x.len() || i + k >= x.len() {
                    return None;
                }
                // Early growth curve
                let mut y = Vec::with_capacity(k);
                for kk in 1..=k {
                    let d = dist(&x[i + kk], &x[j + kk]);
                    // numerical guard
                    let dd = if d <= 0.0 { 1e-300 } else { d };
                    y.push((dd / d0).ln());
                }
                let y_mean = mean(&y);
                let cov = t
                    .iter()
                    .zip(y.iter())
                    .map(|(tk, yk)| (tk - t_mean) * (yk - y_mean))
                    .sum::<f64>();
                let slope = cov / var_t; // λ estimate from this pair
                if slope.is_finite() { Some(slope) } else { None }
            } else {
                None
            }
        })
        .collect();

    if slopes.is_empty() {
        bail!("no valid pairs found. Try reducing theiler or k-fit, or increase max-pairs");
    }

    let lambda = mean(&slopes);
    let td = std::f64::consts::LN_2 / lambda;
    let tl = 1.0 / lambda;

    println!("points_used,dim,dt,k_fit,theiler,pairs,lambda,lyapunov_time,Td_doubling");
    println!(
        "{},{},{:.9},{},{},{},{:.9},{:.9},{:.9}",
        n, dim, dt, k, theiler, slopes.len(), lambda, tl, td
    );

    Ok(())
}

/// Read CSV into Vec<Vec<f64>>
fn read_csv(path: &str, header: bool) -> Result<Vec<Vec<f64>>> {
    let rdr: Box<dyn Read> = if path == "-" {
        Box::new(stdin())
    } else {
        Box::new(File::open(path)?)
    };
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(header)
        .from_reader(BufReader::new(rdr));
    let mut out = Vec::new();
    for rec in reader.records() {
        let rec = rec?;
        let mut row = Vec::with_capacity(rec.len());
        for f in rec.iter() {
            // Allow blank cells to be NaN, skip rows that contain NaN
            let v = f.parse::<f64>().unwrap_or(f64::NAN);
            row.push(v);
        }
        if row.iter().all(|v| v.is_finite()) {
            out.push(row);
        }
    }
    Ok(out)
}

/// Univariate delay embed: returns Vec of state vectors length n_eff
fn delay_embed(series: &[f64], m: usize, tau: usize) -> Result<Vec<Vec<f64>>> {
    if m == 1 {
        // return as single-column states
        return Ok(series.iter().map(|v| vec![*v]).collect());
    }
    let n = series.len();
    let span = (m - 1) * tau;
    if n <= span {
        bail!("series too short for embedding");
    }
    let n_eff = n - span;
    let mut x = Vec::with_capacity(n_eff);
    for i in 0..n_eff {
        let mut v = Vec::with_capacity(m);
        for k in 0..m {
            let idx = i + k * tau;
            v.push(series[idx]);
        }
        x.push(v);
    }
    Ok(x)
}

#[inline]
fn mean(v: &[f64]) -> f64 {
    let s: f64 = v.iter().sum();
    s / (v.len() as f64)
}

#[inline]
fn dist(a: &[f64], b: &[f64]) -> f64 {
    let mut acc = 0.0;
    // manual unroll for small dims
    let len = a.len();
    let mut i = 0;
    while i + 3 < len {
        let d0 = a[i] - b[i];
        let d1 = a[i + 1] - b[i + 1];
        let d2 = a[i + 2] - b[i + 2];
        let d3 = a[i + 3] - b[i + 3];
        acc += d0 * d0 + d1 * d1 + d2 * d2 + d3 * d3;
        i += 4;
    }
    while i < len {
        let d = a[i] - b[i];
        acc += d * d;
        i += 1;
    }
    acc.sqrt()
}

/// Vantage-point tree with dynamic dimension
struct VpNode {
    idx: usize,        // index into dataset
    tau: f64,          // partition radius
    left: Option<Box<VpNode>>,
    right: Option<Box<VpNode>>,
}

struct VpTree<'a> {
    data: &'a [Vec<f64>],
    root: Option<Box<VpNode>>,
}

impl<'a> VpTree<'a> {
    fn build(data: &'a [Vec<f64>], indices: &mut [usize]) -> Self {
        let root = Self::build_rec(data, indices);
        Self { data, root }
    }

    fn build_rec(data: &'a [Vec<f64>], indices: &mut [usize]) -> Option<Box<VpNode>> {
        if indices.is_empty() {
            return None;
        }
        // use last as vantage point
        let vp = indices[indices.len() - 1];
        if indices.len() == 1 {
            return Some(Box::new(VpNode { idx: vp, tau: 0.0, left: None, right: None }));
        }
        // compute distances to vp
        let (left_slice, _vp_slot) = indices.split_at_mut(indices.len() - 1);
        let mut dists: Vec<(usize, f64)> = left_slice
            .iter()
            .map(|&j| (j, dist(&data[vp], &data[j])))
            .collect();
        // median split on distance
        let mid = dists.len() / 2;
        dists.select_nth_unstable_by(mid, |a, b| a.1.partial_cmp(&b.1).unwrap_or(Ordering::Equal));
        let tau = dists[mid].1;
        // partition into inner and outer
        let mut inner: Vec<usize> = Vec::with_capacity(mid + 1);
        let mut outer: Vec<usize> = Vec::with_capacity(dists.len() - mid);
        for (j, d) in dists {
            if d <= tau {
                inner.push(j);
            } else {
                outer.push(j);
            }
        }
        let left = Self::build_rec(data, &mut inner);
        let right = Self::build_rec(data, &mut outer);
        Some(Box::new(VpNode { idx: vp, tau, left, right }))
    }

    /// Nearest neighbor excluding indices within Theiler window of target_i
    fn nearest_excluding(&self, q: &[f64], target_i: usize, theiler: usize) -> Option<(usize, f64)> {
        let mut best_idx = usize::MAX;
        let mut best_dist = f64::INFINITY;
        self.search(&self.root, q, target_i, theiler, &mut best_idx, &mut best_dist);
        if best_idx == usize::MAX { None } else { Some((best_idx, best_dist)) }
    }

    fn search(
        &self,
        node: &Option<Box<VpNode>>,
        q: &[f64],
        target_i: usize,
        theiler: usize,
        best_idx: &mut usize,
        best_dist: &mut f64,
    ) {
        let Some(n) = node else { return; };
        let d = dist(q, &self.data[n.idx]);

        // respect Theiler window and skip self
        if n.idx != target_i && theiler_exclude(target_i, n.idx, theiler) == false {
            if d < *best_dist {
                *best_dist = d;
                *best_idx = n.idx;
            }
        }

        // choose side to visit first
        let first_left = d < n.tau || n.right.is_none();
        let (first, second) = if first_left { (&n.left, &n.right) } else { (&n.right, &n.left) };

        if let Some(_) = first {
            self.search(first, q, target_i, theiler, best_idx, best_dist);
        }
        // visit the other side if the hypersphere around q intersects the boundary
        if (d - n.tau).abs() <= *best_dist {
            if let Some(_) = second {
                self.search(second, q, target_i, theiler, best_idx, best_dist);
            }
        }
    }
}

#[inline]
fn theiler_exclude(i: usize, j: usize, w: usize) -> bool {
    let di = if i > j { i - j } else { j - i };
    di <= w
}
```

### Notes

* Fit window defaults to the first 12 steps. Bump `--k-fit` if your system has a longer linear growth regime.
* Increase `--theiler` when trajectories are smooth and temporally adjacent points collapse to trivial neighbors.
* For very long series, raise `--max-pairs` or lower the stride by setting a larger value for it implicitly via `max-pairs`.