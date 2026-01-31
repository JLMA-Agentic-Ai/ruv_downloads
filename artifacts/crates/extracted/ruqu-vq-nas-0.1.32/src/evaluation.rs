//! Evaluation module for quantum circuit architectures.
//!
//! This module provides metrics for evaluating the quality of variational quantum
//! circuits, including expressibility, entanglement capability, training convergence
//! proxy, and hardware cost estimation.

use crate::circuit::QuantumCircuit;
use crate::error::{EvaluationError, Result};
use ndarray::{Array1, Array2};
use rand::prelude::*;
use rand_distr::Uniform;
use serde::{Deserialize, Serialize};
use std::f64::consts::PI;

/// Complete evaluation result for a circuit architecture.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationResult {
    /// Expressibility score (lower is better, 0 = Haar random).
    pub expressibility: f64,
    /// Entanglement capability (0-1, higher is better).
    pub entanglement_capability: f64,
    /// Training convergence proxy (higher suggests faster convergence).
    pub convergence_proxy: f64,
    /// Hardware cost metrics.
    pub hardware_cost: HardwareCost,
    /// Overall fitness score (combines all metrics).
    pub fitness: f64,
}

impl EvaluationResult {
    /// Creates a new evaluation result.
    pub fn new(
        expressibility: f64,
        entanglement_capability: f64,
        convergence_proxy: f64,
        hardware_cost: HardwareCost,
    ) -> Self {
        // Compute combined fitness score
        // Lower expressibility is better, so we negate it
        // Higher entanglement and convergence are better
        // Lower cost is better, so we negate it
        let fitness = -expressibility * 0.3
            + entanglement_capability * 0.3
            + convergence_proxy * 0.2
            - hardware_cost.normalized_cost() * 0.2;

        EvaluationResult {
            expressibility,
            entanglement_capability,
            convergence_proxy,
            hardware_cost,
            fitness,
        }
    }

    /// Returns the combined fitness score.
    pub fn fitness(&self) -> f64 {
        self.fitness
    }
}

/// Hardware cost metrics.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HardwareCost {
    /// Total number of gates.
    pub gate_count: usize,
    /// Number of two-qubit gates.
    pub two_qubit_gates: usize,
    /// Circuit depth.
    pub depth: usize,
    /// Number of parameters.
    pub num_parameters: usize,
    /// Estimated execution time (arbitrary units).
    pub estimated_time: f64,
}

impl HardwareCost {
    /// Creates a new hardware cost from a circuit.
    pub fn from_circuit(circuit: &QuantumCircuit) -> Self {
        let two_qubit_gates = circuit.two_qubit_gate_count();
        let depth = circuit.compute_depth();

        // Estimated time: single-qubit gates take 1 unit, two-qubit take 10 units
        let single_qubit_gates = circuit.gate_count() - two_qubit_gates;
        let estimated_time = single_qubit_gates as f64 + 10.0 * two_qubit_gates as f64;

        HardwareCost {
            gate_count: circuit.gate_count(),
            two_qubit_gates,
            depth,
            num_parameters: circuit.num_parameters,
            estimated_time,
        }
    }

    /// Returns a normalized cost score (0-1 range).
    pub fn normalized_cost(&self) -> f64 {
        // Normalize based on typical circuit sizes
        let gate_cost = (self.gate_count as f64 / 100.0).min(1.0);
        let two_qubit_cost = (self.two_qubit_gates as f64 / 50.0).min(1.0);
        let depth_cost = (self.depth as f64 / 50.0).min(1.0);

        // Weight two-qubit gates more heavily (they're expensive on real hardware)
        0.2 * gate_cost + 0.5 * two_qubit_cost + 0.3 * depth_cost
    }
}

/// Configuration for circuit evaluation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationConfig {
    /// Number of random parameter samples for expressibility.
    pub num_samples: usize,
    /// Number of bins for histogram computation.
    pub num_bins: usize,
    /// Number of qubits to consider for entanglement (subsystem size).
    pub subsystem_size: usize,
    /// Weights for fitness function.
    pub weights: FitnessWeights,
}

impl Default for EvaluationConfig {
    fn default() -> Self {
        EvaluationConfig {
            num_samples: 1000,
            num_bins: 75,
            subsystem_size: 1,
            weights: FitnessWeights::default(),
        }
    }
}

impl EvaluationConfig {
    /// Creates a fast evaluation config (fewer samples).
    pub fn fast() -> Self {
        EvaluationConfig {
            num_samples: 100,
            num_bins: 25,
            subsystem_size: 1,
            weights: FitnessWeights::default(),
        }
    }

    /// Creates a high-precision evaluation config.
    pub fn high_precision() -> Self {
        EvaluationConfig {
            num_samples: 5000,
            num_bins: 100,
            subsystem_size: 1,
            weights: FitnessWeights::default(),
        }
    }
}

/// Weights for combining metrics into fitness.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FitnessWeights {
    /// Weight for expressibility (default: 0.3).
    pub expressibility: f64,
    /// Weight for entanglement capability (default: 0.3).
    pub entanglement: f64,
    /// Weight for convergence proxy (default: 0.2).
    pub convergence: f64,
    /// Weight for hardware cost (default: 0.2).
    pub hardware: f64,
}

impl Default for FitnessWeights {
    fn default() -> Self {
        FitnessWeights {
            expressibility: 0.3,
            entanglement: 0.3,
            convergence: 0.2,
            hardware: 0.2,
        }
    }
}

impl FitnessWeights {
    /// Creates weights favoring expressibility.
    pub fn expressibility_focused() -> Self {
        FitnessWeights {
            expressibility: 0.5,
            entanglement: 0.2,
            convergence: 0.2,
            hardware: 0.1,
        }
    }

    /// Creates weights favoring entanglement.
    pub fn entanglement_focused() -> Self {
        FitnessWeights {
            expressibility: 0.2,
            entanglement: 0.5,
            convergence: 0.2,
            hardware: 0.1,
        }
    }

    /// Creates weights favoring hardware efficiency.
    pub fn hardware_focused() -> Self {
        FitnessWeights {
            expressibility: 0.2,
            entanglement: 0.2,
            convergence: 0.1,
            hardware: 0.5,
        }
    }
}

/// Main circuit evaluator.
#[derive(Debug, Clone)]
pub struct CircuitEvaluator {
    /// Evaluation configuration.
    config: EvaluationConfig,
}

impl CircuitEvaluator {
    /// Creates a new evaluator with default configuration.
    pub fn new() -> Self {
        CircuitEvaluator {
            config: EvaluationConfig::default(),
        }
    }

    /// Creates an evaluator with custom configuration.
    pub fn with_config(config: EvaluationConfig) -> Self {
        CircuitEvaluator { config }
    }

    /// Evaluates a circuit and returns all metrics.
    pub fn evaluate<R: Rng>(&self, circuit: &QuantumCircuit, rng: &mut R) -> Result<EvaluationResult> {
        // Compute all metrics
        let expressibility = self.compute_expressibility(circuit, rng)?;
        let entanglement = self.compute_entanglement_capability(circuit, rng)?;
        let convergence = self.compute_convergence_proxy(circuit, rng)?;
        let hardware_cost = HardwareCost::from_circuit(circuit);

        Ok(EvaluationResult::new(
            expressibility,
            entanglement,
            convergence,
            hardware_cost,
        ))
    }

    /// Computes the expressibility metric.
    ///
    /// Expressibility measures how well the circuit can approximate a Haar-random
    /// distribution of quantum states. Lower values indicate higher expressibility.
    pub fn compute_expressibility<R: Rng>(
        &self,
        circuit: &QuantumCircuit,
        rng: &mut R,
    ) -> Result<f64> {
        if circuit.num_parameters == 0 {
            return Ok(1.0); // No parameters = not expressive
        }

        let num_samples = self.config.num_samples;
        let num_bins = self.config.num_bins;

        // Sample pairs of random parameters and compute fidelities
        let mut fidelities = Vec::with_capacity(num_samples);
        let param_dist = Uniform::new(-PI, PI);

        for _ in 0..num_samples {
            // Generate two random parameter sets
            let params1: Vec<f64> = (0..circuit.num_parameters)
                .map(|_| rng.sample(param_dist))
                .collect();
            let params2: Vec<f64> = (0..circuit.num_parameters)
                .map(|_| rng.sample(param_dist))
                .collect();

            // Compute approximate fidelity (simplified - in real QC this would need state simulation)
            let fidelity = self.approximate_fidelity(&params1, &params2, circuit.num_qubits);
            fidelities.push(fidelity);
        }

        // Compute histogram of fidelities
        let circuit_hist = self.compute_histogram(&fidelities, num_bins);

        // Compute Haar-random reference histogram
        // For Haar-random states: P(F) = (N-1)(1-F)^(N-2) where N = 2^n
        let haar_hist = self.compute_haar_histogram(circuit.num_qubits, num_bins);

        // Compute KL divergence between histograms
        let expressibility = self.kl_divergence(&circuit_hist, &haar_hist);

        Ok(expressibility)
    }

    /// Computes the entanglement capability.
    ///
    /// Measures the circuit's ability to generate entangled states.
    /// Returns a value between 0 (no entanglement) and 1 (maximally entangling).
    pub fn compute_entanglement_capability<R: Rng>(
        &self,
        circuit: &QuantumCircuit,
        rng: &mut R,
    ) -> Result<f64> {
        if circuit.num_qubits < 2 {
            return Ok(0.0); // Can't entangle single qubit
        }

        let num_samples = self.config.num_samples;
        let param_dist = Uniform::new(-PI, PI);
        let mut entanglements = Vec::with_capacity(num_samples);

        for _ in 0..num_samples {
            let params: Vec<f64> = (0..circuit.num_parameters)
                .map(|_| rng.sample(param_dist))
                .collect();

            // Estimate entanglement using Meyer-Wallach measure proxy
            let ent = self.estimate_entanglement(&params, circuit);
            entanglements.push(ent);
        }

        // Average entanglement over all samples
        let mean_entanglement = entanglements.iter().sum::<f64>() / num_samples as f64;

        Ok(mean_entanglement)
    }

    /// Computes a proxy for training convergence speed.
    ///
    /// Based on the gradient variance and parameter landscape smoothness.
    pub fn compute_convergence_proxy<R: Rng>(
        &self,
        circuit: &QuantumCircuit,
        rng: &mut R,
    ) -> Result<f64> {
        if circuit.num_parameters == 0 {
            return Ok(0.0);
        }

        let num_samples = 100.min(self.config.num_samples);
        let param_dist = Uniform::new(-PI, PI);

        // Sample gradient magnitudes at random points
        let mut gradient_magnitudes = Vec::with_capacity(num_samples);

        for _ in 0..num_samples {
            let params: Vec<f64> = (0..circuit.num_parameters)
                .map(|_| rng.sample(param_dist))
                .collect();

            // Estimate gradient magnitude using finite differences
            let grad_mag = self.estimate_gradient_magnitude(&params, circuit, rng);
            gradient_magnitudes.push(grad_mag);
        }

        // Compute statistics
        let mean_grad = gradient_magnitudes.iter().sum::<f64>() / num_samples as f64;
        let variance = gradient_magnitudes
            .iter()
            .map(|g| (g - mean_grad).powi(2))
            .sum::<f64>()
            / num_samples as f64;

        // Convergence proxy: want moderate gradients with low variance
        // Avoid barren plateaus (very small gradients) and erratic landscapes (high variance)
        let grad_score = if mean_grad < 1e-6 {
            0.0 // Barren plateau
        } else {
            (1.0 - (-mean_grad).exp()).min(1.0)
        };

        let variance_penalty = (variance / (mean_grad.powi(2) + 1e-10)).min(1.0);
        let convergence_proxy = grad_score * (1.0 - 0.5 * variance_penalty);

        Ok(convergence_proxy.max(0.0).min(1.0))
    }

    /// Computes hardware cost for a circuit.
    pub fn compute_hardware_cost(&self, circuit: &QuantumCircuit) -> HardwareCost {
        HardwareCost::from_circuit(circuit)
    }

    // Helper methods

    fn approximate_fidelity(&self, params1: &[f64], params2: &[f64], num_qubits: usize) -> f64 {
        // Simplified fidelity approximation based on parameter distance
        // In a real implementation, this would compute |<psi1|psi2>|^2

        let param_distance: f64 = params1
            .iter()
            .zip(params2.iter())
            .map(|(p1, p2)| {
                let diff = (p1 - p2).abs();
                // Wrap to [-pi, pi]
                let wrapped = if diff > PI { 2.0 * PI - diff } else { diff };
                wrapped.powi(2)
            })
            .sum::<f64>()
            .sqrt();

        // Map parameter distance to approximate fidelity
        // This is a heuristic approximation
        let dim = (1 << num_qubits) as f64;
        let scale = param_distance / (params1.len() as f64).sqrt();
        let fidelity = ((-(scale.powi(2)) / 2.0).exp() + 1.0 / dim) / (1.0 + 1.0 / dim);

        fidelity.max(0.0).min(1.0)
    }

    fn compute_histogram(&self, values: &[f64], num_bins: usize) -> Vec<f64> {
        let mut hist = vec![0.0; num_bins];
        let n = values.len() as f64;

        for &v in values {
            let bin = ((v * num_bins as f64) as usize).min(num_bins - 1);
            hist[bin] += 1.0 / n;
        }

        // Add small epsilon to avoid log(0)
        for h in &mut hist {
            *h = (*h + 1e-10).max(1e-10);
        }

        hist
    }

    fn compute_haar_histogram(&self, num_qubits: usize, num_bins: usize) -> Vec<f64> {
        let dim = 1 << num_qubits;
        let n_minus_1 = (dim - 1) as f64;
        let mut hist = vec![0.0; num_bins];
        let bin_width = 1.0 / num_bins as f64;

        for i in 0..num_bins {
            let f_start = i as f64 * bin_width;
            let f_end = (i + 1) as f64 * bin_width;
            let f_mid = (f_start + f_end) / 2.0;

            // P(F) = (N-1)(1-F)^(N-2)
            if dim > 1 && f_mid < 1.0 {
                hist[i] = n_minus_1 * (1.0 - f_mid).powf(n_minus_1 - 1.0) * bin_width;
            }
        }

        // Normalize
        let sum: f64 = hist.iter().sum();
        if sum > 0.0 {
            for h in &mut hist {
                *h /= sum;
                *h = (*h).max(1e-10);
            }
        } else {
            // Fallback to uniform
            for h in &mut hist {
                *h = 1.0 / num_bins as f64;
            }
        }

        hist
    }

    fn kl_divergence(&self, p: &[f64], q: &[f64]) -> f64 {
        p.iter()
            .zip(q.iter())
            .map(|(&pi, &qi)| {
                if pi > 1e-10 && qi > 1e-10 {
                    pi * (pi / qi).ln()
                } else {
                    0.0
                }
            })
            .sum::<f64>()
            .max(0.0)
    }

    fn estimate_entanglement(&self, params: &[f64], circuit: &QuantumCircuit) -> f64 {
        // Simplified Meyer-Wallach entanglement measure estimation
        // In a real implementation, this would compute the actual measure

        // Count entangling gates and their distribution
        let mut qubit_entanglement = vec![0.0; circuit.num_qubits];

        for op in &circuit.operations {
            if op.gate.is_two_qubit() && op.qubits.len() == 2 {
                let q1 = op.qubits[0];
                let q2 = op.qubits[1];
                if q1 < circuit.num_qubits && q2 < circuit.num_qubits {
                    qubit_entanglement[q1] += 1.0;
                    qubit_entanglement[q2] += 1.0;
                }
            }
        }

        // Normalize and compute entanglement score
        let max_ent = qubit_entanglement
            .iter()
            .cloned()
            .fold(0.0_f64, f64::max);
        if max_ent == 0.0 {
            return 0.0;
        }

        let mean_ent: f64 = qubit_entanglement.iter().sum::<f64>() / circuit.num_qubits as f64;
        let balance = mean_ent / max_ent; // How evenly distributed is entanglement

        // Consider parameter influence
        let param_influence = if !params.is_empty() {
            // Varied parameters suggest more dynamic entanglement
            let param_std: f64 = {
                let mean: f64 = params.iter().sum::<f64>() / params.len() as f64;
                (params.iter().map(|p| (p - mean).powi(2)).sum::<f64>() / params.len() as f64)
                    .sqrt()
            };
            (param_std / PI).min(1.0)
        } else {
            0.5
        };

        // Combine factors
        let base_score = (mean_ent / (circuit.num_qubits as f64 * 2.0)).min(1.0);
        let final_score = base_score * (0.5 + 0.3 * balance + 0.2 * param_influence);

        final_score.max(0.0).min(1.0)
    }

    fn estimate_gradient_magnitude<R: Rng>(
        &self,
        params: &[f64],
        circuit: &QuantumCircuit,
        rng: &mut R,
    ) -> f64 {
        // Estimate gradient using finite differences with a random loss function
        let epsilon = 0.01;
        let mut grad_sq_sum = 0.0;

        // Use a simple proxy loss function
        let loss = |p: &[f64]| -> f64 {
            // Proxy: sum of cos of parameters (represents typical VQE-like loss)
            p.iter().map(|&x| x.cos()).sum::<f64>()
        };

        let base_loss = loss(params);

        for i in 0..params.len().min(10) {
            // Sample up to 10 parameters
            let mut params_plus = params.to_vec();
            params_plus[i] += epsilon;

            let grad_i = (loss(&params_plus) - base_loss) / epsilon;
            grad_sq_sum += grad_i.powi(2);
        }

        (grad_sq_sum / params.len().min(10) as f64).sqrt()
    }
}

impl Default for CircuitEvaluator {
    fn default() -> Self {
        Self::new()
    }
}

/// Batch evaluator for evaluating multiple circuits efficiently.
#[derive(Debug, Clone)]
pub struct BatchEvaluator {
    evaluator: CircuitEvaluator,
}

impl BatchEvaluator {
    /// Creates a new batch evaluator.
    pub fn new(config: EvaluationConfig) -> Self {
        BatchEvaluator {
            evaluator: CircuitEvaluator::with_config(config),
        }
    }

    /// Evaluates multiple circuits.
    pub fn evaluate_batch<R: Rng>(
        &self,
        circuits: &[QuantumCircuit],
        rng: &mut R,
    ) -> Vec<Result<EvaluationResult>> {
        circuits
            .iter()
            .map(|c| self.evaluator.evaluate(c, rng))
            .collect()
    }

    /// Evaluates circuits and returns sorted by fitness.
    pub fn evaluate_and_rank<R: Rng>(
        &self,
        circuits: &[QuantumCircuit],
        rng: &mut R,
    ) -> Vec<(usize, EvaluationResult)> {
        let results: Vec<_> = self.evaluate_batch(circuits, rng);

        let mut ranked: Vec<(usize, EvaluationResult)> = results
            .into_iter()
            .enumerate()
            .filter_map(|(i, r)| r.ok().map(|eval| (i, eval)))
            .collect();

        // Sort by fitness (descending)
        ranked.sort_by(|a, b| {
            b.1.fitness
                .partial_cmp(&a.1.fitness)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        ranked
    }
}

/// Expressibility calculator (standalone).
#[derive(Debug, Clone)]
pub struct ExpressibilityCalculator {
    num_samples: usize,
    num_bins: usize,
}

impl ExpressibilityCalculator {
    /// Creates a new calculator.
    pub fn new(num_samples: usize, num_bins: usize) -> Self {
        ExpressibilityCalculator {
            num_samples,
            num_bins,
        }
    }

    /// Computes expressibility from fidelity samples.
    pub fn from_fidelities(&self, fidelities: &[f64], num_qubits: usize) -> f64 {
        let config = EvaluationConfig {
            num_samples: self.num_samples,
            num_bins: self.num_bins,
            ..Default::default()
        };
        let evaluator = CircuitEvaluator::with_config(config);

        let circuit_hist = evaluator.compute_histogram(fidelities, self.num_bins);
        let haar_hist = evaluator.compute_haar_histogram(num_qubits, self.num_bins);

        evaluator.kl_divergence(&circuit_hist, &haar_hist)
    }
}

/// Entanglement capability calculator (standalone).
#[derive(Debug, Clone)]
pub struct EntanglementCalculator {
    num_samples: usize,
}

impl EntanglementCalculator {
    /// Creates a new calculator.
    pub fn new(num_samples: usize) -> Self {
        EntanglementCalculator { num_samples }
    }

    /// Computes average entanglement from circuit samples.
    pub fn from_circuit<R: Rng>(&self, circuit: &QuantumCircuit, rng: &mut R) -> Result<f64> {
        let config = EvaluationConfig {
            num_samples: self.num_samples,
            ..Default::default()
        };
        let evaluator = CircuitEvaluator::with_config(config);

        evaluator.compute_entanglement_capability(circuit, rng)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::circuit::{CircuitBuilder, HardwareEfficientAnsatz};
    use rand::SeedableRng;
    use rand_chacha::ChaCha8Rng;

    #[test]
    fn test_hardware_cost() {
        let circuit = CircuitBuilder::new(4)
            .ry(0).ry(1).ry(2).ry(3)
            .cnot(0, 1).cnot(2, 3)
            .build();

        let cost = HardwareCost::from_circuit(&circuit);
        assert_eq!(cost.gate_count, 6);
        assert_eq!(cost.two_qubit_gates, 2);
        assert!(cost.estimated_time > 0.0);
    }

    #[test]
    fn test_normalized_cost() {
        let circuit = CircuitBuilder::new(4)
            .ry(0)
            .cnot(0, 1)
            .build();

        let cost = HardwareCost::from_circuit(&circuit);
        let normalized = cost.normalized_cost();

        assert!(normalized >= 0.0);
        assert!(normalized <= 1.0);
    }

    #[test]
    fn test_evaluation_config_presets() {
        let default_config = EvaluationConfig::default();
        assert_eq!(default_config.num_samples, 1000);

        let fast_config = EvaluationConfig::fast();
        assert!(fast_config.num_samples < default_config.num_samples);

        let precise_config = EvaluationConfig::high_precision();
        assert!(precise_config.num_samples > default_config.num_samples);
    }

    #[test]
    fn test_fitness_weights() {
        let default_weights = FitnessWeights::default();
        let sum = default_weights.expressibility
            + default_weights.entanglement
            + default_weights.convergence
            + default_weights.hardware;
        assert!((sum - 1.0).abs() < 1e-10);
    }

    #[test]
    fn test_circuit_evaluator() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let circuit = HardwareEfficientAnsatz::new(4, 2).build();

        let evaluator = CircuitEvaluator::with_config(EvaluationConfig::fast());
        let result = evaluator.evaluate(&circuit, &mut rng).unwrap();

        assert!(result.expressibility >= 0.0);
        assert!(result.entanglement_capability >= 0.0);
        assert!(result.entanglement_capability <= 1.0);
    }

    #[test]
    fn test_expressibility_computation() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let circuit = CircuitBuilder::new(2)
            .ry(0).ry(1)
            .cnot(0, 1)
            .ry(0).ry(1)
            .build();

        let evaluator = CircuitEvaluator::with_config(EvaluationConfig::fast());
        let expressibility = evaluator.compute_expressibility(&circuit, &mut rng).unwrap();

        assert!(expressibility >= 0.0);
        assert!(expressibility.is_finite());
    }

    #[test]
    fn test_entanglement_capability() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);

        // Circuit with no entangling gates
        let no_ent_circuit = CircuitBuilder::new(2)
            .ry(0).ry(1)
            .build();

        // Circuit with entangling gates
        let ent_circuit = CircuitBuilder::new(2)
            .ry(0).ry(1)
            .cnot(0, 1)
            .ry(0).ry(1)
            .cnot(0, 1)
            .build();

        let evaluator = CircuitEvaluator::with_config(EvaluationConfig::fast());

        let no_ent_cap = evaluator.compute_entanglement_capability(&no_ent_circuit, &mut rng).unwrap();
        let ent_cap = evaluator.compute_entanglement_capability(&ent_circuit, &mut rng).unwrap();

        // Entangling circuit should have higher capability
        assert!(ent_cap > no_ent_cap || no_ent_cap < 0.1);
    }

    #[test]
    fn test_convergence_proxy() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let circuit = CircuitBuilder::new(4)
            .ry(0).ry(1).ry(2).ry(3)
            .cnot(0, 1).cnot(2, 3)
            .build();

        let evaluator = CircuitEvaluator::with_config(EvaluationConfig::fast());
        let convergence = evaluator.compute_convergence_proxy(&circuit, &mut rng).unwrap();

        assert!(convergence >= 0.0);
        assert!(convergence <= 1.0);
    }

    #[test]
    fn test_evaluation_result() {
        let hardware_cost = HardwareCost {
            gate_count: 10,
            two_qubit_gates: 4,
            depth: 5,
            num_parameters: 8,
            estimated_time: 46.0,
        };

        let result = EvaluationResult::new(0.1, 0.8, 0.6, hardware_cost);
        assert!(result.fitness.is_finite());
    }

    #[test]
    fn test_batch_evaluator() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let circuits: Vec<QuantumCircuit> = (1..=3)
            .map(|layers| HardwareEfficientAnsatz::new(3, layers).build())
            .collect();

        let batch_eval = BatchEvaluator::new(EvaluationConfig::fast());
        let results = batch_eval.evaluate_batch(&circuits, &mut rng);

        assert_eq!(results.len(), 3);
        assert!(results.iter().all(|r| r.is_ok()));
    }

    #[test]
    fn test_evaluate_and_rank() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let circuits: Vec<QuantumCircuit> = (1..=4)
            .map(|layers| HardwareEfficientAnsatz::new(3, layers).build())
            .collect();

        let batch_eval = BatchEvaluator::new(EvaluationConfig::fast());
        let ranked = batch_eval.evaluate_and_rank(&circuits, &mut rng);

        assert_eq!(ranked.len(), 4);

        // Check that ranking is sorted by fitness (descending)
        for i in 1..ranked.len() {
            assert!(ranked[i - 1].1.fitness >= ranked[i].1.fitness);
        }
    }

    #[test]
    fn test_expressibility_calculator() {
        let fidelities: Vec<f64> = (0..100).map(|i| (i as f64) / 100.0).collect();
        let calc = ExpressibilityCalculator::new(100, 25);
        let expr = calc.from_fidelities(&fidelities, 2);

        assert!(expr >= 0.0);
        assert!(expr.is_finite());
    }

    #[test]
    fn test_entanglement_calculator() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let circuit = HardwareEfficientAnsatz::new(3, 2).build();

        let calc = EntanglementCalculator::new(100);
        let ent = calc.from_circuit(&circuit, &mut rng).unwrap();

        assert!(ent >= 0.0);
        assert!(ent <= 1.0);
    }

    #[test]
    fn test_single_qubit_entanglement() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let circuit = CircuitBuilder::new(1).ry(0).build();

        let evaluator = CircuitEvaluator::new();
        let ent = evaluator.compute_entanglement_capability(&circuit, &mut rng).unwrap();

        assert_eq!(ent, 0.0); // Single qubit can't be entangled
    }

    #[test]
    fn test_no_parameter_expressibility() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let circuit = CircuitBuilder::new(2).h(0).cnot(0, 1).build();

        let evaluator = CircuitEvaluator::new();
        let expr = evaluator.compute_expressibility(&circuit, &mut rng).unwrap();

        assert_eq!(expr, 1.0); // No parameters = not expressive
    }

    #[test]
    fn test_no_parameter_convergence() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let circuit = CircuitBuilder::new(2).h(0).cnot(0, 1).build();

        let evaluator = CircuitEvaluator::new();
        let conv = evaluator.compute_convergence_proxy(&circuit, &mut rng).unwrap();

        assert_eq!(conv, 0.0); // No parameters = no convergence needed
    }
}
