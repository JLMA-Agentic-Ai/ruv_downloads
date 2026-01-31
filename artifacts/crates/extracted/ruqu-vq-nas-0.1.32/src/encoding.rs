//! Architecture encoding for variational quantum circuits.
//!
//! This module provides methods to encode quantum circuit architectures as
//! discrete choices, continuous relaxations, and embedding vectors for
//! differentiable neural architecture search.

use crate::error::{EncodingError, Result};
use crate::search_space::{GateOperation, GateType, LayerTemplate, SearchSpace};
use ndarray::{Array1, Array2};
use rand::prelude::*;
use rand_distr::Normal;
use serde::{Deserialize, Serialize};

/// Discrete architecture encoding as a sequence of choices.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DiscreteEncoding {
    /// Number of layers (depth choice)
    pub depth: usize,
    /// Template choice for each layer
    pub layer_templates: Vec<usize>,
    /// Gate choices for customizable positions
    pub gate_choices: Vec<Vec<usize>>,
    /// Entanglement pattern choices per layer
    pub entanglement_choices: Vec<usize>,
}

impl DiscreteEncoding {
    /// Creates a new discrete encoding.
    pub fn new(
        depth: usize,
        layer_templates: Vec<usize>,
        gate_choices: Vec<Vec<usize>>,
        entanglement_choices: Vec<usize>,
    ) -> Self {
        DiscreteEncoding {
            depth,
            layer_templates,
            gate_choices,
            entanglement_choices,
        }
    }

    /// Creates a random encoding for the given search space.
    pub fn random<R: Rng>(space: &SearchSpace, rng: &mut R) -> Self {
        let depth = rng.gen_range(space.min_depth..=space.max_depth);
        let num_templates = space.layer_templates.len();
        let num_gates = space.gate_set.len();

        let layer_templates: Vec<usize> = (0..depth)
            .map(|_| rng.gen_range(0..num_templates.max(1)))
            .collect();

        let gate_choices: Vec<Vec<usize>> = (0..depth)
            .map(|_| {
                (0..space.num_qubits)
                    .map(|_| rng.gen_range(0..num_gates.max(1)))
                    .collect()
            })
            .collect();

        let entanglement_choices: Vec<usize> =
            (0..depth).map(|_| rng.gen_range(0..6)).collect(); // 6 standard patterns

        DiscreteEncoding {
            depth,
            layer_templates,
            gate_choices,
            entanglement_choices,
        }
    }

    /// Validates the encoding against a search space.
    pub fn validate(&self, space: &SearchSpace) -> Result<()> {
        if self.depth < space.min_depth || self.depth > space.max_depth {
            return Err(EncodingError::InvalidDimension {
                expected: space.max_depth,
                got: self.depth,
            }
            .into());
        }

        if self.layer_templates.len() != self.depth {
            return Err(EncodingError::InvalidDimension {
                expected: self.depth,
                got: self.layer_templates.len(),
            }
            .into());
        }

        let num_templates = space.layer_templates.len();
        for (i, &template_idx) in self.layer_templates.iter().enumerate() {
            if template_idx >= num_templates {
                return Err(EncodingError::InvalidChoice {
                    position: i,
                    choice: template_idx,
                    max_choices: num_templates,
                }
                .into());
            }
        }

        let num_gates = space.gate_set.len();
        for (layer_idx, layer_gates) in self.gate_choices.iter().enumerate() {
            for (pos, &gate_idx) in layer_gates.iter().enumerate() {
                if gate_idx >= num_gates {
                    return Err(EncodingError::InvalidChoice {
                        position: layer_idx * space.num_qubits + pos,
                        choice: gate_idx,
                        max_choices: num_gates,
                    }
                    .into());
                }
            }
        }

        Ok(())
    }

    /// Converts to a flat vector representation.
    pub fn to_flat_vector(&self, space: &SearchSpace) -> Vec<usize> {
        let mut flat = Vec::new();
        flat.push(self.depth);

        for &t in &self.layer_templates {
            flat.push(t);
        }

        for layer_gates in &self.gate_choices {
            for &g in layer_gates {
                flat.push(g);
            }
        }

        for &e in &self.entanglement_choices {
            flat.push(e);
        }

        // Pad to fixed size if needed
        let expected_size = Self::expected_flat_size(space);
        while flat.len() < expected_size {
            flat.push(0);
        }

        flat
    }

    /// Creates an encoding from a flat vector.
    pub fn from_flat_vector(flat: &[usize], space: &SearchSpace) -> Result<Self> {
        if flat.is_empty() {
            return Err(EncodingError::DecodingFailed("Empty vector".to_string()).into());
        }

        let depth = flat[0].clamp(space.min_depth, space.max_depth);
        let mut idx = 1;

        let layer_templates: Vec<usize> = (0..depth)
            .map(|_| {
                let val = flat.get(idx).copied().unwrap_or(0);
                idx += 1;
                val % space.layer_templates.len().max(1)
            })
            .collect();

        let gate_choices: Vec<Vec<usize>> = (0..depth)
            .map(|_| {
                (0..space.num_qubits)
                    .map(|_| {
                        let val = flat.get(idx).copied().unwrap_or(0);
                        idx += 1;
                        val % space.gate_set.len().max(1)
                    })
                    .collect()
            })
            .collect();

        let entanglement_choices: Vec<usize> = (0..depth)
            .map(|_| {
                let val = flat.get(idx).copied().unwrap_or(0);
                idx += 1;
                val % 6
            })
            .collect();

        Ok(DiscreteEncoding {
            depth,
            layer_templates,
            gate_choices,
            entanglement_choices,
        })
    }

    /// Returns the expected size of a flat vector for this search space.
    pub fn expected_flat_size(space: &SearchSpace) -> usize {
        // 1 (depth) + max_depth (templates) + max_depth * num_qubits (gates) + max_depth (entanglement)
        1 + space.max_depth + space.max_depth * space.num_qubits + space.max_depth
    }

    /// Mutates the encoding with a given probability.
    pub fn mutate<R: Rng>(&mut self, space: &SearchSpace, mutation_rate: f64, rng: &mut R) {
        let num_templates = space.layer_templates.len().max(1);
        let num_gates = space.gate_set.len().max(1);

        // Mutate depth
        if rng.gen::<f64>() < mutation_rate {
            let delta: i32 = rng.gen_range(-1..=1);
            let new_depth =
                (self.depth as i32 + delta).clamp(space.min_depth as i32, space.max_depth as i32)
                    as usize;

            if new_depth > self.depth {
                // Add layers
                for _ in self.depth..new_depth {
                    self.layer_templates.push(rng.gen_range(0..num_templates));
                    self.gate_choices.push(
                        (0..space.num_qubits)
                            .map(|_| rng.gen_range(0..num_gates))
                            .collect(),
                    );
                    self.entanglement_choices.push(rng.gen_range(0..6));
                }
            } else if new_depth < self.depth {
                // Remove layers
                self.layer_templates.truncate(new_depth);
                self.gate_choices.truncate(new_depth);
                self.entanglement_choices.truncate(new_depth);
            }
            self.depth = new_depth;
        }

        // Mutate layer templates
        for template in &mut self.layer_templates {
            if rng.gen::<f64>() < mutation_rate {
                *template = rng.gen_range(0..num_templates);
            }
        }

        // Mutate gate choices
        for layer_gates in &mut self.gate_choices {
            for gate in layer_gates {
                if rng.gen::<f64>() < mutation_rate {
                    *gate = rng.gen_range(0..num_gates);
                }
            }
        }

        // Mutate entanglement choices
        for ent in &mut self.entanglement_choices {
            if rng.gen::<f64>() < mutation_rate {
                *ent = rng.gen_range(0..6);
            }
        }
    }

    /// Performs crossover with another encoding.
    pub fn crossover<R: Rng>(&self, other: &Self, rng: &mut R) -> Self {
        let depth = if rng.gen_bool(0.5) {
            self.depth
        } else {
            other.depth
        };

        let layer_templates: Vec<usize> = (0..depth)
            .map(|i| {
                if rng.gen_bool(0.5) {
                    self.layer_templates.get(i).copied().unwrap_or(0)
                } else {
                    other.layer_templates.get(i).copied().unwrap_or(0)
                }
            })
            .collect();

        let gate_choices: Vec<Vec<usize>> = (0..depth)
            .map(|i| {
                let self_gates = self.gate_choices.get(i);
                let other_gates = other.gate_choices.get(i);

                let num_qubits = self_gates
                    .map(|g| g.len())
                    .or(other_gates.map(|g| g.len()))
                    .unwrap_or(0);

                (0..num_qubits)
                    .map(|j| {
                        if rng.gen_bool(0.5) {
                            self_gates.and_then(|g| g.get(j).copied()).unwrap_or(0)
                        } else {
                            other_gates.and_then(|g| g.get(j).copied()).unwrap_or(0)
                        }
                    })
                    .collect()
            })
            .collect();

        let entanglement_choices: Vec<usize> = (0..depth)
            .map(|i| {
                if rng.gen_bool(0.5) {
                    self.entanglement_choices.get(i).copied().unwrap_or(0)
                } else {
                    other.entanglement_choices.get(i).copied().unwrap_or(0)
                }
            })
            .collect();

        DiscreteEncoding {
            depth,
            layer_templates,
            gate_choices,
            entanglement_choices,
        }
    }
}

/// Continuous relaxation for differentiable architecture search.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContinuousEncoding {
    /// Soft depth weights (probability distribution over depths)
    pub depth_weights: Array1<f64>,
    /// Soft template weights per layer position
    pub template_weights: Array2<f64>,
    /// Soft gate weights per position
    pub gate_weights: Vec<Array2<f64>>,
    /// Soft entanglement weights per layer
    pub entanglement_weights: Array2<f64>,
    /// Temperature for softmax
    pub temperature: f64,
}

impl ContinuousEncoding {
    /// Creates a new continuous encoding initialized uniformly.
    pub fn uniform(space: &SearchSpace) -> Self {
        let depth_range = space.max_depth - space.min_depth + 1;
        let num_templates = space.layer_templates.len().max(1);
        let num_gates = space.gate_set.len().max(1);
        let num_entanglements = 6;

        let depth_weights = Array1::from_elem(depth_range, 1.0 / depth_range as f64);
        let template_weights =
            Array2::from_elem((space.max_depth, num_templates), 1.0 / num_templates as f64);

        let gate_weights: Vec<Array2<f64>> = (0..space.max_depth)
            .map(|_| Array2::from_elem((space.num_qubits, num_gates), 1.0 / num_gates as f64))
            .collect();

        let entanglement_weights =
            Array2::from_elem((space.max_depth, num_entanglements), 1.0 / num_entanglements as f64);

        ContinuousEncoding {
            depth_weights,
            template_weights,
            gate_weights,
            entanglement_weights,
            temperature: 1.0,
        }
    }

    /// Creates a continuous encoding with random initialization.
    pub fn random<R: Rng>(space: &SearchSpace, rng: &mut R) -> Self {
        let mut encoding = Self::uniform(space);

        // Add random perturbations
        let normal = Normal::new(0.0, 0.1).unwrap();

        for w in encoding.depth_weights.iter_mut() {
            *w += rng.sample(normal);
        }
        Self::softmax_inplace(&mut encoding.depth_weights);

        for mut row in encoding.template_weights.rows_mut() {
            for w in row.iter_mut() {
                *w += rng.sample(normal);
            }
            let sum: f64 = row.iter().sum();
            if sum > 0.0 {
                row.mapv_inplace(|x| x / sum);
            }
        }

        for gate_w in &mut encoding.gate_weights {
            for mut row in gate_w.rows_mut() {
                for w in row.iter_mut() {
                    *w += rng.sample(normal);
                }
                let sum: f64 = row.iter().sum();
                if sum > 0.0 {
                    row.mapv_inplace(|x| x / sum);
                }
            }
        }

        for mut row in encoding.entanglement_weights.rows_mut() {
            for w in row.iter_mut() {
                *w += rng.sample(normal);
            }
            let sum: f64 = row.iter().sum();
            if sum > 0.0 {
                row.mapv_inplace(|x| x / sum);
            }
        }

        encoding
    }

    /// Applies softmax normalization to a vector in-place.
    fn softmax_inplace(arr: &mut Array1<f64>) {
        let max_val = arr.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
        arr.mapv_inplace(|x| (x - max_val).exp());
        let sum: f64 = arr.iter().sum();
        if sum > 0.0 {
            arr.mapv_inplace(|x| x / sum);
        }
    }

    /// Sets the temperature for softmax.
    pub fn with_temperature(mut self, temperature: f64) -> Self {
        self.temperature = temperature.max(0.01);
        self
    }

    /// Samples a discrete encoding from this continuous encoding.
    pub fn sample<R: Rng>(&self, space: &SearchSpace, rng: &mut R) -> DiscreteEncoding {
        // Sample depth
        let depth_probs: Vec<f64> = self.depth_weights.iter().copied().collect();
        let depth_idx = Self::sample_categorical(&depth_probs, rng);
        let depth = space.min_depth + depth_idx;

        // Sample templates
        let layer_templates: Vec<usize> = (0..depth)
            .map(|i| {
                let probs: Vec<f64> = self.template_weights.row(i).iter().copied().collect();
                Self::sample_categorical(&probs, rng)
            })
            .collect();

        // Sample gates
        let gate_choices: Vec<Vec<usize>> = (0..depth)
            .map(|i| {
                (0..space.num_qubits)
                    .map(|j| {
                        let probs: Vec<f64> =
                            self.gate_weights[i].row(j).iter().copied().collect();
                        Self::sample_categorical(&probs, rng)
                    })
                    .collect()
            })
            .collect();

        // Sample entanglement
        let entanglement_choices: Vec<usize> = (0..depth)
            .map(|i| {
                let probs: Vec<f64> = self.entanglement_weights.row(i).iter().copied().collect();
                Self::sample_categorical(&probs, rng)
            })
            .collect();

        DiscreteEncoding {
            depth,
            layer_templates,
            gate_choices,
            entanglement_choices,
        }
    }

    /// Samples from a categorical distribution.
    fn sample_categorical<R: Rng>(probs: &[f64], rng: &mut R) -> usize {
        let sum: f64 = probs.iter().sum();
        if sum <= 0.0 || probs.is_empty() {
            return 0;
        }

        let threshold = rng.gen::<f64>() * sum;
        let mut cumsum = 0.0;
        for (i, &p) in probs.iter().enumerate() {
            cumsum += p;
            if cumsum >= threshold {
                return i;
            }
        }
        probs.len() - 1
    }

    /// Converts to the most likely discrete encoding (argmax).
    pub fn to_discrete(&self, space: &SearchSpace) -> DiscreteEncoding {
        let depth_idx = Self::argmax(&self.depth_weights.to_vec());
        let depth = (space.min_depth + depth_idx).min(space.max_depth);

        let layer_templates: Vec<usize> = (0..depth)
            .map(|i| Self::argmax(&self.template_weights.row(i).to_vec()))
            .collect();

        let gate_choices: Vec<Vec<usize>> = (0..depth)
            .map(|i| {
                (0..space.num_qubits)
                    .map(|j| Self::argmax(&self.gate_weights[i].row(j).to_vec()))
                    .collect()
            })
            .collect();

        let entanglement_choices: Vec<usize> = (0..depth)
            .map(|i| Self::argmax(&self.entanglement_weights.row(i).to_vec()))
            .collect();

        DiscreteEncoding {
            depth,
            layer_templates,
            gate_choices,
            entanglement_choices,
        }
    }

    /// Returns the index of the maximum value.
    fn argmax(arr: &[f64]) -> usize {
        arr.iter()
            .enumerate()
            .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal))
            .map(|(i, _)| i)
            .unwrap_or(0)
    }

    /// Updates weights using gradient-like updates.
    pub fn update(&mut self, discrete: &DiscreteEncoding, reward: f64, learning_rate: f64) {
        // Update depth weights
        let depth_idx = discrete.depth.saturating_sub(1);
        if depth_idx < self.depth_weights.len() {
            self.depth_weights[depth_idx] += learning_rate * reward;
            Self::softmax_inplace(&mut self.depth_weights);
        }

        // Update template weights
        for (i, &template) in discrete.layer_templates.iter().enumerate() {
            if i < self.template_weights.nrows() && template < self.template_weights.ncols() {
                self.template_weights[[i, template]] += learning_rate * reward;
            }
        }

        // Normalize template weights
        for mut row in self.template_weights.rows_mut() {
            let sum: f64 = row.iter().sum();
            if sum > 0.0 {
                row.mapv_inplace(|x| x / sum);
            }
        }

        // Update gate weights
        for (i, layer_gates) in discrete.gate_choices.iter().enumerate() {
            if i < self.gate_weights.len() {
                for (j, &gate) in layer_gates.iter().enumerate() {
                    if j < self.gate_weights[i].nrows() && gate < self.gate_weights[i].ncols() {
                        self.gate_weights[i][[j, gate]] += learning_rate * reward;
                    }
                }
                // Normalize
                for mut row in self.gate_weights[i].rows_mut() {
                    let sum: f64 = row.iter().sum();
                    if sum > 0.0 {
                        row.mapv_inplace(|x| x / sum);
                    }
                }
            }
        }

        // Update entanglement weights
        for (i, &ent) in discrete.entanglement_choices.iter().enumerate() {
            if i < self.entanglement_weights.nrows() && ent < self.entanglement_weights.ncols() {
                self.entanglement_weights[[i, ent]] += learning_rate * reward;
            }
        }

        // Normalize entanglement weights
        for mut row in self.entanglement_weights.rows_mut() {
            let sum: f64 = row.iter().sum();
            if sum > 0.0 {
                row.mapv_inplace(|x| x / sum);
            }
        }
    }
}

/// Architecture embedding for representation learning.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchitectureEmbedding {
    /// Embedding dimension
    pub dimension: usize,
    /// The embedding vector
    pub vector: Array1<f64>,
}

impl ArchitectureEmbedding {
    /// Creates a new embedding with given dimension.
    pub fn new(dimension: usize) -> Result<Self> {
        if dimension == 0 {
            return Err(EncodingError::InvalidEmbeddingDimension(dimension).into());
        }

        Ok(ArchitectureEmbedding {
            dimension,
            vector: Array1::zeros(dimension),
        })
    }

    /// Creates an embedding from a discrete encoding.
    pub fn from_discrete(encoding: &DiscreteEncoding, space: &SearchSpace, dimension: usize) -> Result<Self> {
        if dimension == 0 {
            return Err(EncodingError::InvalidEmbeddingDimension(dimension).into());
        }

        let mut embedding = Self::new(dimension)?;

        // Encode depth (normalized)
        let depth_normalized =
            (encoding.depth - space.min_depth) as f64 / (space.max_depth - space.min_depth) as f64;

        // Encode template distribution
        let mut template_counts = vec![0.0; space.layer_templates.len().max(1)];
        for &t in &encoding.layer_templates {
            if t < template_counts.len() {
                template_counts[t] += 1.0;
            }
        }
        let template_sum: f64 = template_counts.iter().sum();
        if template_sum > 0.0 {
            for c in &mut template_counts {
                *c /= template_sum;
            }
        }

        // Encode gate distribution
        let mut gate_counts = vec![0.0; space.gate_set.len().max(1)];
        for layer_gates in &encoding.gate_choices {
            for &g in layer_gates {
                if g < gate_counts.len() {
                    gate_counts[g] += 1.0;
                }
            }
        }
        let gate_sum: f64 = gate_counts.iter().sum();
        if gate_sum > 0.0 {
            for c in &mut gate_counts {
                *c /= gate_sum;
            }
        }

        // Build embedding vector
        let mut idx = 0;

        // Depth features
        if idx < dimension {
            embedding.vector[idx] = depth_normalized;
            idx += 1;
        }
        if idx < dimension {
            embedding.vector[idx] = encoding.depth as f64 / space.max_depth as f64;
            idx += 1;
        }

        // Template features
        for &t in template_counts.iter().take(dimension.saturating_sub(idx)) {
            if idx < dimension {
                embedding.vector[idx] = t;
                idx += 1;
            }
        }

        // Gate features
        for &g in gate_counts.iter().take(dimension.saturating_sub(idx)) {
            if idx < dimension {
                embedding.vector[idx] = g;
                idx += 1;
            }
        }

        // Entanglement features
        let mut ent_counts = vec![0.0; 6];
        for &e in &encoding.entanglement_choices {
            if e < 6 {
                ent_counts[e] += 1.0;
            }
        }
        let ent_sum: f64 = ent_counts.iter().sum();
        if ent_sum > 0.0 {
            for c in &mut ent_counts {
                *c /= ent_sum;
            }
        }

        for &e in ent_counts.iter().take(dimension.saturating_sub(idx)) {
            if idx < dimension {
                embedding.vector[idx] = e;
                idx += 1;
            }
        }

        Ok(embedding)
    }

    /// Computes cosine similarity with another embedding.
    pub fn cosine_similarity(&self, other: &Self) -> f64 {
        if self.dimension != other.dimension {
            return 0.0;
        }

        let dot: f64 = self.vector.iter().zip(other.vector.iter()).map(|(a, b)| a * b).sum();
        let norm_a: f64 = self.vector.iter().map(|x| x * x).sum::<f64>().sqrt();
        let norm_b: f64 = other.vector.iter().map(|x| x * x).sum::<f64>().sqrt();

        if norm_a > 0.0 && norm_b > 0.0 {
            dot / (norm_a * norm_b)
        } else {
            0.0
        }
    }

    /// Computes Euclidean distance to another embedding.
    pub fn euclidean_distance(&self, other: &Self) -> f64 {
        if self.dimension != other.dimension {
            return f64::INFINITY;
        }

        self.vector
            .iter()
            .zip(other.vector.iter())
            .map(|(a, b)| (a - b).powi(2))
            .sum::<f64>()
            .sqrt()
    }
}

/// Encoder that converts between different architecture representations.
#[derive(Debug, Clone)]
pub struct ArchitectureEncoder {
    /// Reference search space
    pub space: SearchSpace,
    /// Embedding dimension
    pub embedding_dim: usize,
}

impl ArchitectureEncoder {
    /// Creates a new encoder for the given search space.
    pub fn new(space: SearchSpace, embedding_dim: usize) -> Self {
        ArchitectureEncoder { space, embedding_dim }
    }

    /// Encodes a discrete architecture to gate operations.
    pub fn decode_to_operations(&self, encoding: &DiscreteEncoding) -> Vec<Vec<GateOperation>> {
        let mut layers = Vec::new();

        for layer_idx in 0..encoding.depth {
            let mut operations = Vec::new();
            let template_idx = encoding.layer_templates.get(layer_idx).copied().unwrap_or(0);

            // Get template
            let template = self
                .space
                .layer_templates
                .get(template_idx % self.space.layer_templates.len().max(1))
                .cloned()
                .unwrap_or_else(LayerTemplate::standard_hardware_efficient);

            match template {
                LayerTemplate::HardwareEfficient {
                    single_qubit_gates,
                    entangling_gate,
                    entanglement,
                } => {
                    // Apply single-qubit gates
                    let mut param_idx = 0;
                    for qubit in 0..self.space.num_qubits {
                        for gate in &single_qubit_gates {
                            let p_idx = if gate.is_parameterized() {
                                let idx = param_idx;
                                param_idx += 1;
                                Some(idx)
                            } else {
                                None
                            };
                            operations.push(GateOperation::single(*gate, qubit, p_idx));
                        }
                    }

                    // Apply entangling gates
                    for (ctrl, tgt) in entanglement.generate_pairs(self.space.num_qubits) {
                        if self.space.connectivity.is_connected(ctrl, tgt) {
                            let p_idx = if entangling_gate.is_parameterized() {
                                let idx = param_idx;
                                param_idx += 1;
                                Some(idx)
                            } else {
                                None
                            };
                            operations.push(GateOperation::two_qubit(entangling_gate, ctrl, tgt, p_idx));
                        }
                    }
                }
                LayerTemplate::QaoaInspired {
                    mixer_gates,
                    cost_gates,
                } => {
                    let mut param_idx = 0;

                    // Cost layer
                    for gate in &cost_gates {
                        if gate.is_two_qubit() {
                            for (i, j) in self.space.connectivity.edges() {
                                let p_idx = if gate.is_parameterized() {
                                    let idx = param_idx;
                                    param_idx += 1;
                                    Some(idx)
                                } else {
                                    None
                                };
                                operations.push(GateOperation::two_qubit(*gate, i, j, p_idx));
                            }
                        } else {
                            for qubit in 0..self.space.num_qubits {
                                let p_idx = if gate.is_parameterized() {
                                    let idx = param_idx;
                                    param_idx += 1;
                                    Some(idx)
                                } else {
                                    None
                                };
                                operations.push(GateOperation::single(*gate, qubit, p_idx));
                            }
                        }
                    }

                    // Mixer layer
                    for gate in &mixer_gates {
                        for qubit in 0..self.space.num_qubits {
                            let p_idx = if gate.is_parameterized() {
                                let idx = param_idx;
                                param_idx += 1;
                                Some(idx)
                            } else {
                                None
                            };
                            operations.push(GateOperation::single(*gate, qubit, p_idx));
                        }
                    }
                }
                LayerTemplate::StronglyEntangling {
                    rotation_gates,
                    entanglement_patterns,
                } => {
                    let mut param_idx = 0;

                    for (sublayer, pattern) in entanglement_patterns.iter().enumerate() {
                        // Rotation gates
                        for qubit in 0..self.space.num_qubits {
                            let gate = rotation_gates[sublayer % rotation_gates.len()];
                            let p_idx = if gate.is_parameterized() {
                                let idx = param_idx;
                                param_idx += 1;
                                Some(idx)
                            } else {
                                None
                            };
                            operations.push(GateOperation::single(gate, qubit, p_idx));
                        }

                        // Entangling gates
                        for (ctrl, tgt) in pattern.generate_pairs(self.space.num_qubits) {
                            if self.space.connectivity.is_connected(ctrl, tgt) {
                                operations.push(GateOperation::two_qubit(GateType::CNOT, ctrl, tgt, None));
                            }
                        }
                    }
                }
                LayerTemplate::Custom { operations: ops } => {
                    operations.extend(ops);
                }
            }

            layers.push(operations);
        }

        layers
    }

    /// Creates an embedding for an architecture.
    pub fn embed(&self, encoding: &DiscreteEncoding) -> Result<ArchitectureEmbedding> {
        ArchitectureEmbedding::from_discrete(encoding, &self.space, self.embedding_dim)
    }

    /// Counts total parameters in an architecture.
    pub fn count_parameters(&self, encoding: &DiscreteEncoding) -> usize {
        let operations = self.decode_to_operations(encoding);
        operations
            .iter()
            .flat_map(|layer| layer.iter())
            .filter(|op| op.gate.is_parameterized())
            .count()
    }

    /// Counts total gates in an architecture.
    pub fn count_gates(&self, encoding: &DiscreteEncoding) -> usize {
        let operations = self.decode_to_operations(encoding);
        operations.iter().map(|layer| layer.len()).sum()
    }

    /// Counts two-qubit gates in an architecture.
    pub fn count_two_qubit_gates(&self, encoding: &DiscreteEncoding) -> usize {
        let operations = self.decode_to_operations(encoding);
        operations
            .iter()
            .flat_map(|layer| layer.iter())
            .filter(|op| op.gate.is_two_qubit())
            .count()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::SeedableRng;
    use rand_chacha::ChaCha8Rng;

    fn test_space() -> SearchSpace {
        SearchSpace::hardware_efficient(4, 5).unwrap()
    }

    #[test]
    fn test_discrete_encoding_creation() {
        let encoding = DiscreteEncoding::new(3, vec![0, 1, 0], vec![vec![0, 1, 2, 3]], vec![0, 1, 2]);
        assert_eq!(encoding.depth, 3);
        assert_eq!(encoding.layer_templates.len(), 3);
    }

    #[test]
    fn test_discrete_encoding_random() {
        let space = test_space();
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let encoding = DiscreteEncoding::random(&space, &mut rng);

        assert!(encoding.depth >= space.min_depth);
        assert!(encoding.depth <= space.max_depth);
        assert_eq!(encoding.layer_templates.len(), encoding.depth);
    }

    #[test]
    fn test_discrete_encoding_validation() {
        let space = test_space();
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let encoding = DiscreteEncoding::random(&space, &mut rng);

        assert!(encoding.validate(&space).is_ok());

        // Invalid encoding
        let invalid = DiscreteEncoding::new(100, vec![0], vec![], vec![]);
        assert!(invalid.validate(&space).is_err());
    }

    #[test]
    fn test_flat_vector_roundtrip() {
        let space = test_space();
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let original = DiscreteEncoding::random(&space, &mut rng);

        let flat = original.to_flat_vector(&space);
        let reconstructed = DiscreteEncoding::from_flat_vector(&flat, &space).unwrap();

        assert_eq!(original.depth, reconstructed.depth);
    }

    #[test]
    fn test_mutation() {
        let space = test_space();
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let mut encoding = DiscreteEncoding::random(&space, &mut rng);
        let original_depth = encoding.depth;

        // High mutation rate should cause changes
        encoding.mutate(&space, 0.5, &mut rng);

        // At least validate it's still valid
        assert!(encoding.validate(&space).is_ok());
    }

    #[test]
    fn test_crossover() {
        let space = test_space();
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let parent1 = DiscreteEncoding::random(&space, &mut rng);
        let parent2 = DiscreteEncoding::random(&space, &mut rng);

        let child = parent1.crossover(&parent2, &mut rng);
        assert!(child.validate(&space).is_ok());
    }

    #[test]
    fn test_continuous_encoding_uniform() {
        let space = test_space();
        let encoding = ContinuousEncoding::uniform(&space);

        // Check depth weights sum to 1
        let depth_sum: f64 = encoding.depth_weights.iter().sum();
        assert!((depth_sum - 1.0).abs() < 1e-10);
    }

    #[test]
    fn test_continuous_encoding_sample() {
        let space = test_space();
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let continuous = ContinuousEncoding::uniform(&space);

        let discrete = continuous.sample(&space, &mut rng);
        assert!(discrete.validate(&space).is_ok());
    }

    #[test]
    fn test_continuous_to_discrete() {
        let space = test_space();
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let continuous = ContinuousEncoding::random(&space, &mut rng);

        let discrete = continuous.to_discrete(&space);
        assert!(discrete.validate(&space).is_ok());
    }

    #[test]
    fn test_continuous_update() {
        let space = test_space();
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let mut continuous = ContinuousEncoding::uniform(&space);
        let discrete = DiscreteEncoding::random(&space, &mut rng);

        continuous.update(&discrete, 1.0, 0.1);

        // Check weights are still valid probabilities
        let depth_sum: f64 = continuous.depth_weights.iter().sum();
        assert!((depth_sum - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_architecture_embedding() {
        let space = test_space();
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let encoding = DiscreteEncoding::random(&space, &mut rng);

        let embedding = ArchitectureEmbedding::from_discrete(&encoding, &space, 32).unwrap();
        assert_eq!(embedding.dimension, 32);
        assert_eq!(embedding.vector.len(), 32);
    }

    #[test]
    fn test_embedding_similarity() {
        let space = test_space();
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let encoding1 = DiscreteEncoding::random(&space, &mut rng);
        let encoding2 = DiscreteEncoding::random(&space, &mut rng);

        let emb1 = ArchitectureEmbedding::from_discrete(&encoding1, &space, 32).unwrap();
        let emb2 = ArchitectureEmbedding::from_discrete(&encoding2, &space, 32).unwrap();

        let sim = emb1.cosine_similarity(&emb2);
        assert!(sim >= -1.0 && sim <= 1.0);

        // Self-similarity should be 1
        let self_sim = emb1.cosine_similarity(&emb1);
        assert!((self_sim - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_embedding_distance() {
        let space = test_space();
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let encoding = DiscreteEncoding::random(&space, &mut rng);

        let emb = ArchitectureEmbedding::from_discrete(&encoding, &space, 32).unwrap();

        // Self-distance should be 0
        let self_dist = emb.euclidean_distance(&emb);
        assert!(self_dist.abs() < 1e-10);
    }

    #[test]
    fn test_architecture_encoder() {
        let space = test_space();
        let encoder = ArchitectureEncoder::new(space.clone(), 32);

        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let encoding = DiscreteEncoding::random(&space, &mut rng);

        let operations = encoder.decode_to_operations(&encoding);
        assert_eq!(operations.len(), encoding.depth);
    }

    #[test]
    fn test_encoder_parameter_count() {
        let space = test_space();
        let encoder = ArchitectureEncoder::new(space.clone(), 32);

        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let encoding = DiscreteEncoding::random(&space, &mut rng);

        let param_count = encoder.count_parameters(&encoding);
        assert!(param_count > 0);
    }

    #[test]
    fn test_encoder_gate_counts() {
        let space = test_space();
        let encoder = ArchitectureEncoder::new(space.clone(), 32);

        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let encoding = DiscreteEncoding::random(&space, &mut rng);

        let total_gates = encoder.count_gates(&encoding);
        let two_qubit_gates = encoder.count_two_qubit_gates(&encoding);

        assert!(total_gates >= two_qubit_gates);
    }

    #[test]
    fn test_invalid_embedding_dimension() {
        let result = ArchitectureEmbedding::new(0);
        assert!(result.is_err());
    }
}
