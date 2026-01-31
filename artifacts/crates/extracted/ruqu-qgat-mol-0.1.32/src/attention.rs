//! Quantum Graph Attention Layer for molecular graphs.
//!
//! This module implements multi-head graph attention with quantum-aware attention
//! scores based on orbital overlap and quantum coupling.
//!
//! # Example
//!
//! ```rust
//! use ruqu_qgat_mol::graph::MolecularGraph;
//! use ruqu_qgat_mol::orbital::OrbitalEncoder;
//! use ruqu_qgat_mol::attention::{QuantumGraphAttention, QGATConfig};
//!
//! let config = QGATConfig {
//!     input_dim: 42,
//!     hidden_dim: 64,
//!     output_dim: 32,
//!     num_heads: 4,
//!     dropout: 0.1,
//!     ..Default::default()
//! };
//!
//! let mut qgat = QuantumGraphAttention::new(config);
//! let mol = MolecularGraph::water();
//! let encoder = OrbitalEncoder::default();
//! let features = mol.compute_atom_features(&encoder);
//!
//! let output = qgat.forward(&features, &mol).unwrap();
//! assert_eq!(output.shape(), &[3, 32]);
//! ```

use ndarray::{s, Array1, Array2, Array3, Axis};
use rand::Rng;
use rand_distr::{Distribution, Normal, Uniform};
use serde::{Deserialize, Serialize};

use crate::error::{AttentionError, Result};
use crate::graph::MolecularGraph;
use crate::orbital::OrbitalEncoder;

/// Configuration for Quantum Graph Attention.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QGATConfig {
    /// Input feature dimension
    pub input_dim: usize,
    /// Hidden dimension for attention computation
    pub hidden_dim: usize,
    /// Output feature dimension
    pub output_dim: usize,
    /// Number of attention heads
    pub num_heads: usize,
    /// Dropout rate
    pub dropout: f64,
    /// Whether to use edge features
    pub use_edge_features: bool,
    /// Whether to use quantum coupling for attention
    pub use_quantum_coupling: bool,
    /// Whether to use residual connections
    pub use_residual: bool,
    /// Whether to apply layer normalization
    pub use_layer_norm: bool,
    /// Negative slope for LeakyReLU
    pub negative_slope: f64,
    /// Temperature for attention softmax
    pub temperature: f64,
}

impl Default for QGATConfig {
    fn default() -> Self {
        Self {
            input_dim: 42,
            hidden_dim: 64,
            output_dim: 32,
            num_heads: 4,
            dropout: 0.1,
            use_edge_features: true,
            use_quantum_coupling: true,
            use_residual: true,
            use_layer_norm: true,
            negative_slope: 0.2,
            temperature: 1.0,
        }
    }
}

impl QGATConfig {
    /// Returns the dimension per head.
    #[must_use]
    pub fn head_dim(&self) -> usize {
        self.hidden_dim / self.num_heads
    }

    /// Validates the configuration.
    pub fn validate(&self) -> Result<()> {
        if self.input_dim == 0 {
            return Err(AttentionError::InvalidDimension(self.input_dim).into());
        }
        if self.hidden_dim == 0 {
            return Err(AttentionError::InvalidDimension(self.hidden_dim).into());
        }
        if self.hidden_dim % self.num_heads != 0 {
            return Err(AttentionError::InvalidHeads {
                num_heads: self.num_heads,
                dim: self.hidden_dim,
            }
            .into());
        }
        if self.num_heads == 0 {
            return Err(AttentionError::InvalidHeads {
                num_heads: self.num_heads,
                dim: self.hidden_dim,
            }
            .into());
        }
        Ok(())
    }
}

/// Quantum Graph Attention layer.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuantumGraphAttention {
    config: QGATConfig,
    /// Weight matrix for query projection
    w_query: Array2<f64>,
    /// Weight matrix for key projection
    w_key: Array2<f64>,
    /// Weight matrix for value projection
    w_value: Array2<f64>,
    /// Weight matrix for output projection
    w_output: Array2<f64>,
    /// Attention coefficient vector (for GAT-style attention)
    attention_vec: Array2<f64>,
    /// Edge feature weight matrix
    w_edge: Option<Array2<f64>>,
    /// Layer normalization scale
    ln_scale: Array1<f64>,
    /// Layer normalization bias
    ln_bias: Array1<f64>,
    /// Orbital encoder for quantum features
    #[serde(skip)]
    encoder: Option<OrbitalEncoder>,
}

impl QuantumGraphAttention {
    /// Creates a new Quantum Graph Attention layer.
    pub fn new(config: QGATConfig) -> Self {
        config.validate().expect("Invalid configuration");

        let head_dim = config.head_dim();
        let mut rng = rand::thread_rng();

        // Xavier/Glorot initialization
        let scale = (2.0 / (config.input_dim + config.hidden_dim) as f64).sqrt();
        let normal = Normal::new(0.0, scale).unwrap();

        // Initialize weight matrices
        let w_query = Self::init_matrix(config.input_dim, config.hidden_dim, &normal, &mut rng);
        let w_key = Self::init_matrix(config.input_dim, config.hidden_dim, &normal, &mut rng);
        let w_value = Self::init_matrix(config.input_dim, config.hidden_dim, &normal, &mut rng);
        let w_output = Self::init_matrix(config.hidden_dim, config.output_dim, &normal, &mut rng);

        // Attention coefficient: [num_heads, 2 * head_dim]
        let attention_vec =
            Self::init_matrix(config.num_heads, 2 * head_dim, &normal, &mut rng);

        // Edge feature weights (8 edge features -> hidden_dim)
        let w_edge = if config.use_edge_features {
            Some(Self::init_matrix(8, config.hidden_dim, &normal, &mut rng))
        } else {
            None
        };

        // Layer normalization parameters
        let ln_scale = Array1::ones(config.output_dim);
        let ln_bias = Array1::zeros(config.output_dim);

        Self {
            config,
            w_query,
            w_key,
            w_value,
            w_output,
            attention_vec,
            w_edge,
            ln_scale,
            ln_bias,
            encoder: Some(OrbitalEncoder::default()),
        }
    }

    /// Initializes a weight matrix with the given distribution.
    fn init_matrix<D: Distribution<f64>>(
        rows: usize,
        cols: usize,
        dist: &D,
        rng: &mut impl Rng,
    ) -> Array2<f64> {
        let mut matrix = Array2::zeros((rows, cols));
        for i in 0..rows {
            for j in 0..cols {
                matrix[[i, j]] = dist.sample(rng);
            }
        }
        matrix
    }

    /// Returns the configuration.
    #[must_use]
    pub fn config(&self) -> &QGATConfig {
        &self.config
    }

    /// Sets the orbital encoder.
    pub fn set_encoder(&mut self, encoder: OrbitalEncoder) {
        self.encoder = Some(encoder);
    }

    /// Forward pass through the attention layer.
    ///
    /// # Arguments
    /// * `x` - Input features of shape (num_atoms, input_dim)
    /// * `graph` - Molecular graph defining connectivity
    ///
    /// # Returns
    /// Output features of shape (num_atoms, output_dim)
    pub fn forward(&self, x: &Array2<f64>, graph: &MolecularGraph) -> Result<Array2<f64>> {
        let num_atoms = x.nrows();

        if num_atoms != graph.num_atoms() {
            return Err(AttentionError::ShapeMismatch(format!(
                "Feature rows {} != graph atoms {}",
                num_atoms,
                graph.num_atoms()
            ))
            .into());
        }

        if x.ncols() != self.config.input_dim {
            return Err(AttentionError::ShapeMismatch(format!(
                "Feature dim {} != expected {}",
                x.ncols(),
                self.config.input_dim
            ))
            .into());
        }

        if num_atoms == 0 {
            return Err(AttentionError::EmptyInput("No atoms in graph".to_string()).into());
        }

        // Compute Q, K, V projections: [num_atoms, hidden_dim]
        let q = x.dot(&self.w_query);
        let k = x.dot(&self.w_key);
        let v = x.dot(&self.w_value);

        // Get quantum coupling matrix
        let quantum_coupling = if self.config.use_quantum_coupling {
            Some(self.compute_quantum_coupling(graph))
        } else {
            None
        };

        // Get edge features if configured
        let edge_features = if self.config.use_edge_features {
            Some(graph.compute_edge_features())
        } else {
            None
        };

        // Compute multi-head attention
        let attended = self.multi_head_attention(
            &q,
            &k,
            &v,
            graph,
            quantum_coupling.as_ref(),
            edge_features.as_ref(),
        )?;

        // Output projection: [num_atoms, output_dim]
        let mut output = attended.dot(&self.w_output);

        // Residual connection
        if self.config.use_residual && self.config.input_dim == self.config.output_dim {
            output = output + x;
        }

        // Layer normalization
        if self.config.use_layer_norm {
            output = self.layer_norm(&output);
        }

        Ok(output)
    }

    /// Computes multi-head attention.
    fn multi_head_attention(
        &self,
        q: &Array2<f64>,
        k: &Array2<f64>,
        v: &Array2<f64>,
        graph: &MolecularGraph,
        quantum_coupling: Option<&Array2<f64>>,
        edge_features: Option<&Array2<f64>>,
    ) -> Result<Array2<f64>> {
        let num_atoms = q.nrows();
        let head_dim = self.config.head_dim();
        let num_heads = self.config.num_heads;

        // Reshape to [num_atoms, num_heads, head_dim]
        let q_heads = self.reshape_to_heads(q, num_heads, head_dim);
        let k_heads = self.reshape_to_heads(k, num_heads, head_dim);
        let v_heads = self.reshape_to_heads(v, num_heads, head_dim);

        // Compute attention for each head
        let mut head_outputs = Vec::with_capacity(num_heads);

        for h in 0..num_heads {
            let q_h = q_heads.slice(s![.., h, ..]).to_owned();
            let k_h = k_heads.slice(s![.., h, ..]).to_owned();
            let v_h = v_heads.slice(s![.., h, ..]).to_owned();

            // Compute attention scores using GAT-style mechanism
            let attn = self.compute_attention_scores(
                &q_h,
                &k_h,
                h,
                graph,
                quantum_coupling,
                edge_features,
            )?;

            // Apply attention to values
            let head_out = attn.dot(&v_h);
            head_outputs.push(head_out);
        }

        // Concatenate heads: [num_atoms, hidden_dim]
        let mut output = Array2::zeros((num_atoms, self.config.hidden_dim));
        for (h, head_out) in head_outputs.iter().enumerate() {
            output
                .slice_mut(s![.., h * head_dim..(h + 1) * head_dim])
                .assign(head_out);
        }

        Ok(output)
    }

    /// Reshapes a matrix to multi-head format.
    fn reshape_to_heads(&self, x: &Array2<f64>, num_heads: usize, head_dim: usize) -> Array3<f64> {
        let num_atoms = x.nrows();
        let mut result = Array3::zeros((num_atoms, num_heads, head_dim));

        for i in 0..num_atoms {
            for h in 0..num_heads {
                for d in 0..head_dim {
                    result[[i, h, d]] = x[[i, h * head_dim + d]];
                }
            }
        }

        result
    }

    /// Computes attention scores using GAT-style mechanism.
    fn compute_attention_scores(
        &self,
        q: &Array2<f64>,
        k: &Array2<f64>,
        head_idx: usize,
        graph: &MolecularGraph,
        quantum_coupling: Option<&Array2<f64>>,
        edge_features: Option<&Array2<f64>>,
    ) -> Result<Array2<f64>> {
        let num_atoms = q.nrows();
        let _head_dim = self.config.head_dim();

        // Get attention vector for this head
        let attn_vec = self.attention_vec.row(head_idx).to_owned();

        // Compute raw attention scores
        let mut scores = Array2::from_elem((num_atoms, num_atoms), f64::NEG_INFINITY);

        for i in 0..num_atoms {
            // Self-attention
            let qi = q.row(i).to_owned();
            let ki = k.row(i).to_owned();
            let concat_self = self.concat_vectors(&qi, &ki);
            scores[[i, i]] = self.leaky_relu(concat_self.dot(&attn_vec));

            // Neighbor attention
            for &(j, bond_idx) in graph.neighbors(i) {
                let kj = k.row(j).to_owned();
                let concat = self.concat_vectors(&qi, &kj);
                let mut score = self.leaky_relu(concat.dot(&attn_vec));

                // Add quantum coupling bonus
                if let Some(qc) = quantum_coupling {
                    score += qc[[i, j]] * 0.5; // Scale the quantum bonus
                }

                // Add edge feature contribution
                if let (Some(ef), Some(w_edge)) = (edge_features, &self.w_edge) {
                    let edge_feat = ef.row(bond_idx).to_owned();
                    let edge_contrib = edge_feat.dot(w_edge);
                    // Use mean of edge contribution
                    score += edge_contrib.mean().unwrap_or(0.0) * 0.1;
                }

                scores[[i, j]] = score / self.config.temperature;
            }
        }

        // Apply masked softmax (only over connected atoms)
        let attn = self.masked_softmax(&scores);

        Ok(attn)
    }

    /// Concatenates two vectors.
    fn concat_vectors(&self, a: &Array1<f64>, b: &Array1<f64>) -> Array1<f64> {
        let mut result = Array1::zeros(a.len() + b.len());
        for (i, &val) in a.iter().enumerate() {
            result[i] = val;
        }
        for (i, &val) in b.iter().enumerate() {
            result[a.len() + i] = val;
        }
        result
    }

    /// LeakyReLU activation.
    fn leaky_relu(&self, x: f64) -> f64 {
        if x > 0.0 {
            x
        } else {
            self.config.negative_slope * x
        }
    }

    /// Applies masked softmax (over non-negative-infinity values).
    fn masked_softmax(&self, scores: &Array2<f64>) -> Array2<f64> {
        let num_atoms = scores.nrows();
        let mut result = Array2::zeros((num_atoms, num_atoms));

        for i in 0..num_atoms {
            // Find max for numerical stability
            let mut max_val = f64::NEG_INFINITY;
            for j in 0..num_atoms {
                if scores[[i, j]] > max_val && scores[[i, j]].is_finite() {
                    max_val = scores[[i, j]];
                }
            }

            // Compute exp and sum
            let mut sum = 0.0;
            for j in 0..num_atoms {
                if scores[[i, j]].is_finite() {
                    let exp_val = (scores[[i, j]] - max_val).exp();
                    result[[i, j]] = exp_val;
                    sum += exp_val;
                }
            }

            // Normalize
            if sum > 1e-10 {
                for j in 0..num_atoms {
                    result[[i, j]] /= sum;
                }
            }
        }

        result
    }

    /// Computes quantum coupling matrix based on orbital overlap.
    fn compute_quantum_coupling(&self, graph: &MolecularGraph) -> Array2<f64> {
        if let Some(encoder) = &self.encoder {
            encoder.overlap_matrix(graph.atoms())
        } else {
            // Fallback to adjacency-based coupling
            graph.adjacency_matrix()
        }
    }

    /// Applies layer normalization.
    fn layer_norm(&self, x: &Array2<f64>) -> Array2<f64> {
        let eps = 1e-5;
        let mut result = x.clone();

        for i in 0..x.nrows() {
            let row = x.row(i);
            let mean = row.mean().unwrap_or(0.0);
            let var: f64 = row.iter().map(|v| (v - mean).powi(2)).sum::<f64>() / row.len() as f64;
            let std = (var + eps).sqrt();

            for j in 0..x.ncols() {
                result[[i, j]] = (x[[i, j]] - mean) / std * self.ln_scale[j] + self.ln_bias[j];
            }
        }

        result
    }

    /// Applies dropout during training.
    pub fn apply_dropout(&self, x: &Array2<f64>, training: bool) -> Array2<f64> {
        if !training || self.config.dropout <= 0.0 {
            return x.clone();
        }

        let mut rng = rand::thread_rng();
        let uniform = Uniform::new(0.0, 1.0);
        let keep_prob = 1.0 - self.config.dropout;

        let mut result = x.clone();
        for i in 0..x.nrows() {
            for j in 0..x.ncols() {
                if uniform.sample(&mut rng) > keep_prob {
                    result[[i, j]] = 0.0;
                } else {
                    result[[i, j]] /= keep_prob;
                }
            }
        }

        result
    }

    /// Returns the number of parameters in the layer.
    #[must_use]
    pub fn num_parameters(&self) -> usize {
        let mut count = 0;
        count += self.w_query.len();
        count += self.w_key.len();
        count += self.w_value.len();
        count += self.w_output.len();
        count += self.attention_vec.len();
        if let Some(ref w_edge) = self.w_edge {
            count += w_edge.len();
        }
        count += self.ln_scale.len();
        count += self.ln_bias.len();
        count
    }
}

/// Multi-layer Quantum Graph Attention Network.
#[derive(Debug, Clone)]
pub struct QGATNetwork {
    layers: Vec<QuantumGraphAttention>,
    #[allow(dead_code)]
    config: QGATNetworkConfig,
}

/// Configuration for multi-layer QGAT network.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QGATNetworkConfig {
    /// Input dimension
    pub input_dim: usize,
    /// Hidden dimension for intermediate layers
    pub hidden_dim: usize,
    /// Output dimension
    pub output_dim: usize,
    /// Number of attention heads
    pub num_heads: usize,
    /// Number of layers
    pub num_layers: usize,
    /// Dropout rate
    pub dropout: f64,
}

impl Default for QGATNetworkConfig {
    fn default() -> Self {
        Self {
            input_dim: 42,
            hidden_dim: 64,
            output_dim: 32,
            num_heads: 4,
            num_layers: 3,
            dropout: 0.1,
        }
    }
}

impl QGATNetwork {
    /// Creates a new multi-layer QGAT network.
    pub fn new(config: QGATNetworkConfig) -> Self {
        let mut layers = Vec::with_capacity(config.num_layers);

        for i in 0..config.num_layers {
            let in_dim = if i == 0 {
                config.input_dim
            } else {
                config.hidden_dim
            };
            let out_dim = if i == config.num_layers - 1 {
                config.output_dim
            } else {
                config.hidden_dim
            };

            let layer_config = QGATConfig {
                input_dim: in_dim,
                hidden_dim: config.hidden_dim,
                output_dim: out_dim,
                num_heads: config.num_heads,
                dropout: config.dropout,
                use_residual: i > 0 && in_dim == out_dim,
                ..Default::default()
            };

            layers.push(QuantumGraphAttention::new(layer_config));
        }

        Self { layers, config }
    }

    /// Forward pass through all layers.
    pub fn forward(&self, x: &Array2<f64>, graph: &MolecularGraph) -> Result<Array2<f64>> {
        let mut h = x.clone();

        for layer in &self.layers {
            h = layer.forward(&h, graph)?;
        }

        Ok(h)
    }

    /// Returns the total number of parameters.
    #[must_use]
    pub fn num_parameters(&self) -> usize {
        self.layers.iter().map(|l| l.num_parameters()).sum()
    }
}

/// Pooling methods for graph-level representations.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PoolingMethod {
    /// Mean pooling over all atoms
    Mean,
    /// Sum pooling over all atoms
    Sum,
    /// Max pooling over all atoms
    Max,
    /// Attention-weighted pooling
    Attention,
}

/// Graph pooling layer.
#[derive(Debug, Clone)]
pub struct GraphPooling {
    method: PoolingMethod,
    /// Attention weights for attention pooling
    attention_weights: Option<Array1<f64>>,
}

impl GraphPooling {
    /// Creates a new graph pooling layer.
    #[must_use]
    pub fn new(method: PoolingMethod, dim: Option<usize>) -> Self {
        let attention_weights = if method == PoolingMethod::Attention {
            let d = dim.unwrap_or(32);
            let mut rng = rand::thread_rng();
            let normal = Normal::new(0.0, 0.1).unwrap();
            Some(Array1::from_shape_fn(d, |_| normal.sample(&mut rng)))
        } else {
            None
        };

        Self {
            method,
            attention_weights,
        }
    }

    /// Pools node features to a graph-level representation.
    pub fn pool(&self, x: &Array2<f64>) -> Array1<f64> {
        let num_atoms = x.nrows();
        let dim = x.ncols();

        match self.method {
            PoolingMethod::Mean => x.mean_axis(Axis(0)).unwrap(),

            PoolingMethod::Sum => x.sum_axis(Axis(0)),

            PoolingMethod::Max => {
                let mut result = Array1::from_elem(dim, f64::NEG_INFINITY);
                for i in 0..num_atoms {
                    for j in 0..dim {
                        if x[[i, j]] > result[j] {
                            result[j] = x[[i, j]];
                        }
                    }
                }
                result
            }

            PoolingMethod::Attention => {
                if let Some(ref weights) = self.attention_weights {
                    // Compute attention scores
                    let scores: Array1<f64> = x.dot(weights);
                    let max_score = scores.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
                    let exp_scores: Array1<f64> =
                        scores.mapv(|s| (s - max_score).exp());
                    let sum: f64 = exp_scores.sum();
                    let attn = exp_scores / sum;

                    // Weighted sum
                    let mut result = Array1::zeros(dim);
                    for i in 0..num_atoms {
                        for j in 0..dim {
                            result[j] += attn[i] * x[[i, j]];
                        }
                    }
                    result
                } else {
                    // Fallback to mean
                    x.mean_axis(Axis(0)).unwrap()
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::orbital::OrbitalEncoder;

    fn create_test_features(num_atoms: usize, dim: usize) -> Array2<f64> {
        let mut rng = rand::thread_rng();
        let normal = Normal::new(0.0, 1.0).unwrap();
        Array2::from_shape_fn((num_atoms, dim), |_| normal.sample(&mut rng))
    }

    #[test]
    fn test_config_validation() {
        let valid = QGATConfig::default();
        assert!(valid.validate().is_ok());

        let invalid_heads = QGATConfig {
            num_heads: 3, // 64 % 3 != 0
            ..Default::default()
        };
        assert!(invalid_heads.validate().is_err());
    }

    #[test]
    fn test_qgat_creation() {
        let config = QGATConfig::default();
        let qgat = QuantumGraphAttention::new(config.clone());

        assert_eq!(qgat.config().input_dim, config.input_dim);
        assert!(qgat.num_parameters() > 0);
    }

    #[test]
    fn test_forward_pass() {
        let config = QGATConfig {
            input_dim: 42,
            hidden_dim: 32,
            output_dim: 16,
            num_heads: 4,
            ..Default::default()
        };

        let qgat = QuantumGraphAttention::new(config.clone());
        let mol = MolecularGraph::water();
        let encoder = OrbitalEncoder::default();
        let features = mol.compute_atom_features(&encoder);

        let output = qgat.forward(&features, &mol).unwrap();

        assert_eq!(output.shape(), &[3, 16]);
    }

    #[test]
    fn test_forward_methane() {
        let config = QGATConfig {
            input_dim: 42,
            ..Default::default()
        };

        let qgat = QuantumGraphAttention::new(config);
        let mol = MolecularGraph::methane();
        let encoder = OrbitalEncoder::default();
        let features = mol.compute_atom_features(&encoder);

        let output = qgat.forward(&features, &mol).unwrap();

        assert_eq!(output.shape(), &[5, 32]);
    }

    #[test]
    fn test_forward_benzene() {
        let config = QGATConfig {
            input_dim: 42,
            ..Default::default()
        };

        let qgat = QuantumGraphAttention::new(config);
        let mol = MolecularGraph::benzene();
        let encoder = OrbitalEncoder::default();
        let features = mol.compute_atom_features(&encoder);

        let output = qgat.forward(&features, &mol).unwrap();

        assert_eq!(output.shape(), &[12, 32]);
    }

    #[test]
    fn test_shape_mismatch_error() {
        let config = QGATConfig {
            input_dim: 42,
            ..Default::default()
        };

        let qgat = QuantumGraphAttention::new(config);
        let mol = MolecularGraph::water();

        // Wrong number of atoms
        let wrong_features = create_test_features(5, 42);
        let result = qgat.forward(&wrong_features, &mol);
        assert!(result.is_err());
    }

    #[test]
    fn test_dimension_mismatch_error() {
        let config = QGATConfig {
            input_dim: 42,
            ..Default::default()
        };

        let qgat = QuantumGraphAttention::new(config);
        let mol = MolecularGraph::water();

        // Wrong feature dimension
        let wrong_features = create_test_features(3, 10);
        let result = qgat.forward(&wrong_features, &mol);
        assert!(result.is_err());
    }

    #[test]
    fn test_without_quantum_coupling() {
        let config = QGATConfig {
            input_dim: 42,
            use_quantum_coupling: false,
            ..Default::default()
        };

        let qgat = QuantumGraphAttention::new(config);
        let mol = MolecularGraph::water();
        let encoder = OrbitalEncoder::default();
        let features = mol.compute_atom_features(&encoder);

        let output = qgat.forward(&features, &mol).unwrap();
        assert_eq!(output.shape(), &[3, 32]);
    }

    #[test]
    fn test_without_edge_features() {
        let config = QGATConfig {
            input_dim: 42,
            use_edge_features: false,
            ..Default::default()
        };

        let qgat = QuantumGraphAttention::new(config);
        let mol = MolecularGraph::water();
        let encoder = OrbitalEncoder::default();
        let features = mol.compute_atom_features(&encoder);

        let output = qgat.forward(&features, &mol).unwrap();
        assert_eq!(output.shape(), &[3, 32]);
    }

    #[test]
    fn test_multi_layer_network() {
        let config = QGATNetworkConfig {
            input_dim: 42,
            hidden_dim: 64,
            output_dim: 32,
            num_heads: 4,
            num_layers: 3,
            dropout: 0.0,
        };

        let network = QGATNetwork::new(config);
        let mol = MolecularGraph::water();
        let encoder = OrbitalEncoder::default();
        let features = mol.compute_atom_features(&encoder);

        let output = network.forward(&features, &mol).unwrap();
        assert_eq!(output.shape(), &[3, 32]);
    }

    #[test]
    fn test_network_parameters() {
        let config = QGATNetworkConfig::default();
        let network = QGATNetwork::new(config);

        let num_params = network.num_parameters();
        assert!(num_params > 10000); // Should have many parameters
    }

    #[test]
    fn test_pooling_mean() {
        let pooling = GraphPooling::new(PoolingMethod::Mean, None);
        let features = create_test_features(5, 32);

        let result = pooling.pool(&features);
        assert_eq!(result.len(), 32);
    }

    #[test]
    fn test_pooling_sum() {
        let pooling = GraphPooling::new(PoolingMethod::Sum, None);
        let features = create_test_features(5, 32);

        let result = pooling.pool(&features);
        assert_eq!(result.len(), 32);
    }

    #[test]
    fn test_pooling_max() {
        let pooling = GraphPooling::new(PoolingMethod::Max, None);
        let features = create_test_features(5, 32);

        let result = pooling.pool(&features);
        assert_eq!(result.len(), 32);
    }

    #[test]
    fn test_pooling_attention() {
        let pooling = GraphPooling::new(PoolingMethod::Attention, Some(32));
        let features = create_test_features(5, 32);

        let result = pooling.pool(&features);
        assert_eq!(result.len(), 32);
    }

    #[test]
    fn test_leaky_relu() {
        let config = QGATConfig::default();
        let qgat = QuantumGraphAttention::new(config);

        assert!((qgat.leaky_relu(1.0) - 1.0).abs() < 1e-10);
        assert!(qgat.leaky_relu(-1.0) < 0.0);
        assert!(qgat.leaky_relu(-1.0) > -1.0);
    }

    #[test]
    fn test_dropout() {
        let config = QGATConfig {
            dropout: 0.5,
            ..Default::default()
        };
        let qgat = QuantumGraphAttention::new(config);

        let features = create_test_features(10, 32);

        // With training=false, should return same values
        let no_dropout = qgat.apply_dropout(&features, false);
        assert!((no_dropout[[0, 0]] - features[[0, 0]]).abs() < 1e-10);
    }

    #[test]
    fn test_layer_norm() {
        let config = QGATConfig::default();
        let qgat = QuantumGraphAttention::new(config);

        let features = create_test_features(5, 32);
        let normalized = qgat.layer_norm(&features);

        // Each row should have approximately zero mean
        for i in 0..5 {
            let row_mean = normalized.row(i).mean().unwrap();
            assert!(row_mean.abs() < 1.0);
        }
    }

    #[test]
    fn test_head_dim() {
        let config = QGATConfig {
            hidden_dim: 64,
            num_heads: 4,
            ..Default::default()
        };
        assert_eq!(config.head_dim(), 16);
    }
}
