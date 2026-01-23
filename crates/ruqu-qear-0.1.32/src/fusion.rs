//! Attention Fusion mechanisms for Quantum Reservoir.
//!
//! This module implements attention-based fusion between reservoir states
//! and input sequences, enabling the model to focus on relevant temporal
//! and feature patterns.

use crate::error::{QearError, QearResult};
use ndarray::{Array1, Array2, Axis};
use rand::{Rng, SeedableRng};
use rand_distr::{Distribution, Normal};

#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};

/// Configuration for attention fusion.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct AttentionConfig {
    /// Dimension of the attention key/query space.
    pub attention_dim: usize,
    /// Number of attention heads.
    pub num_heads: usize,
    /// Dropout rate (0.0 = no dropout).
    pub dropout_rate: f64,
    /// Temperature for softmax scaling.
    pub temperature: f64,
    /// Whether to use causal masking.
    pub causal: bool,
    /// Random seed for reproducibility.
    pub seed: Option<u64>,
}

impl Default for AttentionConfig {
    fn default() -> Self {
        Self {
            attention_dim: 64,
            num_heads: 4,
            dropout_rate: 0.0,
            temperature: 1.0,
            causal: false,
            seed: None,
        }
    }
}

impl AttentionConfig {
    /// Create a new attention configuration.
    pub fn new(attention_dim: usize, num_heads: usize) -> Self {
        Self {
            attention_dim,
            num_heads,
            ..Default::default()
        }
    }

    /// Set the temperature.
    pub fn with_temperature(mut self, temperature: f64) -> Self {
        self.temperature = temperature;
        self
    }

    /// Set causal masking.
    pub fn with_causal(mut self, causal: bool) -> Self {
        self.causal = causal;
        self
    }

    /// Set the dropout rate.
    pub fn with_dropout(mut self, dropout_rate: f64) -> Self {
        self.dropout_rate = dropout_rate;
        self
    }

    /// Set the random seed.
    pub fn with_seed(mut self, seed: u64) -> Self {
        self.seed = Some(seed);
        self
    }

    /// Validate the configuration.
    pub fn validate(&self) -> QearResult<()> {
        if self.attention_dim == 0 {
            return Err(QearError::invalid_parameter(
                "attention_dim",
                "must be greater than 0",
            ));
        }
        if self.num_heads == 0 {
            return Err(QearError::invalid_parameter(
                "num_heads",
                "must be greater than 0",
            ));
        }
        if self.attention_dim % self.num_heads != 0 {
            return Err(QearError::invalid_parameter(
                "attention_dim",
                "must be divisible by num_heads",
            ));
        }
        if self.temperature <= 0.0 {
            return Err(QearError::invalid_parameter(
                "temperature",
                "must be positive",
            ));
        }
        if self.dropout_rate < 0.0 || self.dropout_rate >= 1.0 {
            return Err(QearError::invalid_parameter(
                "dropout_rate",
                "must be in [0, 1)",
            ));
        }
        Ok(())
    }

    /// Get the head dimension.
    pub fn head_dim(&self) -> usize {
        self.attention_dim / self.num_heads
    }
}

/// Attention fusion layer combining reservoir states with inputs.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct AttentionFusion {
    /// Configuration.
    config: AttentionConfig,
    /// Query projection weights (attention_dim x reservoir_dim).
    query_weights: Option<Array2<f64>>,
    /// Key projection weights (attention_dim x input_dim).
    key_weights: Option<Array2<f64>>,
    /// Value projection weights (attention_dim x input_dim).
    value_weights: Option<Array2<f64>>,
    /// Output projection weights (output_dim x attention_dim).
    output_weights: Option<Array2<f64>>,
    /// Query bias.
    query_bias: Option<Array1<f64>>,
    /// Key bias.
    key_bias: Option<Array1<f64>>,
    /// Value bias.
    value_bias: Option<Array1<f64>>,
    /// Output bias.
    output_bias: Option<Array1<f64>>,
    /// Reservoir dimension.
    reservoir_dim: Option<usize>,
    /// Input dimension.
    input_dim: Option<usize>,
    /// Output dimension.
    output_dim: Option<usize>,
}

impl AttentionFusion {
    /// Create a new attention fusion layer.
    pub fn new(config: AttentionConfig) -> QearResult<Self> {
        config.validate()?;

        Ok(Self {
            config,
            query_weights: None,
            key_weights: None,
            value_weights: None,
            output_weights: None,
            query_bias: None,
            key_bias: None,
            value_bias: None,
            output_bias: None,
            reservoir_dim: None,
            input_dim: None,
            output_dim: None,
        })
    }

    /// Initialize weights for given dimensions.
    pub fn initialize(
        &mut self,
        reservoir_dim: usize,
        input_dim: usize,
        output_dim: usize,
    ) -> QearResult<()> {
        let mut rng = match self.config.seed {
            Some(seed) => rand::rngs::StdRng::seed_from_u64(seed),
            None => rand::rngs::StdRng::from_entropy(),
        };

        let attention_dim = self.config.attention_dim;

        // Xavier initialization scale
        let query_scale = (2.0 / (reservoir_dim + attention_dim) as f64).sqrt();
        let key_scale = (2.0 / (input_dim + attention_dim) as f64).sqrt();
        let value_scale = (2.0 / (input_dim + attention_dim) as f64).sqrt();
        let output_scale = (2.0 / (attention_dim + output_dim) as f64).sqrt();

        self.query_weights = Some(Self::init_weights(
            attention_dim,
            reservoir_dim,
            query_scale,
            &mut rng,
        )?);
        self.key_weights = Some(Self::init_weights(
            attention_dim,
            input_dim,
            key_scale,
            &mut rng,
        )?);
        self.value_weights = Some(Self::init_weights(
            attention_dim,
            input_dim,
            value_scale,
            &mut rng,
        )?);
        self.output_weights = Some(Self::init_weights(
            output_dim,
            attention_dim,
            output_scale,
            &mut rng,
        )?);

        self.query_bias = Some(Array1::zeros(attention_dim));
        self.key_bias = Some(Array1::zeros(attention_dim));
        self.value_bias = Some(Array1::zeros(attention_dim));
        self.output_bias = Some(Array1::zeros(output_dim));

        self.reservoir_dim = Some(reservoir_dim);
        self.input_dim = Some(input_dim);
        self.output_dim = Some(output_dim);

        Ok(())
    }

    /// Initialize a weight matrix with given scale.
    fn init_weights<R: Rng>(
        rows: usize,
        cols: usize,
        scale: f64,
        rng: &mut R,
    ) -> QearResult<Array2<f64>> {
        let normal = Normal::new(0.0, scale).map_err(|e| {
            QearError::attention_computation(format!("Failed to create normal distribution: {}", e))
        })?;

        let mut weights = Array2::zeros((rows, cols));
        for i in 0..rows {
            for j in 0..cols {
                weights[[i, j]] = normal.sample(rng);
            }
        }

        Ok(weights)
    }

    /// Compute scaled dot-product attention.
    ///
    /// Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V
    pub fn attention(
        &self,
        query: &Array2<f64>,
        key: &Array2<f64>,
        value: &Array2<f64>,
    ) -> QearResult<(Array2<f64>, Array2<f64>)> {
        // query: (seq_len_q, d_k)
        // key: (seq_len_k, d_k)
        // value: (seq_len_k, d_v)

        let d_k = query.ncols() as f64;
        let scale = (d_k / self.config.temperature).sqrt();

        // Q * K^T -> (seq_len_q, seq_len_k)
        let scores = query.dot(&key.t()) / scale;

        // Apply causal mask if needed
        let scores = if self.config.causal {
            self.apply_causal_mask(&scores)?
        } else {
            scores
        };

        // Softmax over last dimension
        let attention_weights = self.softmax(&scores)?;

        // Attention * V -> (seq_len_q, d_v)
        let output = attention_weights.dot(value);

        Ok((output, attention_weights))
    }

    /// Apply causal mask to attention scores.
    fn apply_causal_mask(&self, scores: &Array2<f64>) -> QearResult<Array2<f64>> {
        let n_q = scores.nrows();
        let n_k = scores.ncols();

        let mut masked = scores.clone();
        for i in 0..n_q {
            for j in (i + 1)..n_k {
                masked[[i, j]] = f64::NEG_INFINITY;
            }
        }

        Ok(masked)
    }

    /// Compute softmax over the last dimension.
    fn softmax(&self, x: &Array2<f64>) -> QearResult<Array2<f64>> {
        let mut result = Array2::zeros(x.raw_dim());

        for (i, row) in x.axis_iter(Axis(0)).enumerate() {
            // Numerical stability: subtract max
            let max_val = row.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
            let exp_row: Array1<f64> = row.mapv(|v| (v - max_val).exp());
            let sum: f64 = exp_row.sum();

            if sum.abs() < 1e-10 {
                // Uniform distribution if all -inf
                let uniform_val = 1.0 / row.len() as f64;
                for j in 0..row.len() {
                    result[[i, j]] = uniform_val;
                }
            } else {
                for j in 0..row.len() {
                    result[[i, j]] = exp_row[j] / sum;
                }
            }
        }

        Ok(result)
    }

    /// Forward pass: fuse reservoir states with input sequence.
    ///
    /// # Arguments
    /// * `reservoir_states` - Reservoir states (seq_len, reservoir_dim)
    /// * `inputs` - Input sequence (seq_len, input_dim)
    ///
    /// # Returns
    /// Fused features (seq_len, output_dim)
    pub fn forward(
        &mut self,
        reservoir_states: &Array2<f64>,
        inputs: &Array2<f64>,
    ) -> QearResult<Array2<f64>> {
        let seq_len = reservoir_states.nrows();
        let reservoir_dim = reservoir_states.ncols();
        let input_dim = inputs.ncols();

        if inputs.nrows() != seq_len {
            return Err(QearError::dimension_mismatch(seq_len, inputs.nrows()));
        }

        // Initialize weights if needed
        if self.query_weights.is_none() {
            let output_dim = self.config.attention_dim;
            self.initialize(reservoir_dim, input_dim, output_dim)?;
        }

        // Check dimensions
        if let Some(expected) = self.reservoir_dim {
            if reservoir_dim != expected {
                return Err(QearError::dimension_mismatch(expected, reservoir_dim));
            }
        }
        if let Some(expected) = self.input_dim {
            if input_dim != expected {
                return Err(QearError::dimension_mismatch(expected, input_dim));
            }
        }

        let query_w = self.query_weights.as_ref().unwrap();
        let key_w = self.key_weights.as_ref().unwrap();
        let value_w = self.value_weights.as_ref().unwrap();
        let output_w = self.output_weights.as_ref().unwrap();

        let query_b = self.query_bias.as_ref().unwrap();
        let key_b = self.key_bias.as_ref().unwrap();
        let value_b = self.value_bias.as_ref().unwrap();
        let output_b = self.output_bias.as_ref().unwrap();

        // Project to attention space
        // Q from reservoir states
        let queries = reservoir_states.dot(&query_w.t()) + query_b;
        // K, V from inputs
        let keys = inputs.dot(&key_w.t()) + key_b;
        let values = inputs.dot(&value_w.t()) + value_b;

        // Multi-head attention
        let (attended, _weights) = self.multi_head_attention(&queries, &keys, &values)?;

        // Output projection
        let output = attended.dot(&output_w.t()) + output_b;

        Ok(output)
    }

    /// Multi-head attention computation.
    fn multi_head_attention(
        &self,
        queries: &Array2<f64>,
        keys: &Array2<f64>,
        values: &Array2<f64>,
    ) -> QearResult<(Array2<f64>, Vec<Array2<f64>>)> {
        let seq_len = queries.nrows();
        let num_heads = self.config.num_heads;
        let head_dim = self.config.head_dim();

        let mut head_outputs = Vec::with_capacity(num_heads);
        let mut all_weights = Vec::with_capacity(num_heads);

        for h in 0..num_heads {
            let start = h * head_dim;
            let end = start + head_dim;

            let q_head = queries.slice(ndarray::s![.., start..end]).to_owned();
            let k_head = keys.slice(ndarray::s![.., start..end]).to_owned();
            let v_head = values.slice(ndarray::s![.., start..end]).to_owned();

            let (output, weights) = self.attention(&q_head, &k_head, &v_head)?;
            head_outputs.push(output);
            all_weights.push(weights);
        }

        // Concatenate heads
        let mut result = Array2::zeros((seq_len, self.config.attention_dim));
        for (h, output) in head_outputs.iter().enumerate() {
            let start = h * head_dim;
            for i in 0..seq_len {
                for j in 0..head_dim {
                    result[[i, start + j]] = output[[i, j]];
                }
            }
        }

        Ok((result, all_weights))
    }

    /// Cross-attention between reservoir and input sequences.
    pub fn cross_attention(
        &mut self,
        reservoir_states: &Array2<f64>,
        context: &Array2<f64>,
    ) -> QearResult<Array2<f64>> {
        // Use reservoir as queries, context as keys/values
        self.forward(reservoir_states, context)
    }

    /// Self-attention on reservoir states.
    pub fn self_attention(&mut self, reservoir_states: &Array2<f64>) -> QearResult<Array2<f64>> {
        self.forward(reservoir_states, reservoir_states)
    }

    /// Get the configuration.
    pub fn config(&self) -> &AttentionConfig {
        &self.config
    }

    /// Get the output dimension.
    pub fn output_dim(&self) -> Option<usize> {
        self.output_dim
    }

    /// Reset learned weights.
    pub fn reset(&mut self) {
        self.query_weights = None;
        self.key_weights = None;
        self.value_weights = None;
        self.output_weights = None;
        self.query_bias = None;
        self.key_bias = None;
        self.value_bias = None;
        self.output_bias = None;
        self.reservoir_dim = None;
        self.input_dim = None;
        self.output_dim = None;
    }
}

/// Temporal attention for time series processing.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct TemporalAttention {
    /// Attention layer.
    attention: AttentionFusion,
    /// Positional encoding weights.
    positional_encoding: Option<Array2<f64>>,
    /// Maximum sequence length.
    max_seq_len: usize,
}

impl TemporalAttention {
    /// Create a new temporal attention layer.
    pub fn new(config: AttentionConfig, max_seq_len: usize) -> QearResult<Self> {
        let attention = AttentionFusion::new(config.clone())?;

        // Generate sinusoidal positional encodings
        let positional_encoding = Self::generate_positional_encoding(
            max_seq_len,
            config.attention_dim,
        )?;

        Ok(Self {
            attention,
            positional_encoding: Some(positional_encoding),
            max_seq_len,
        })
    }

    /// Generate sinusoidal positional encodings.
    fn generate_positional_encoding(
        max_len: usize,
        dim: usize,
    ) -> QearResult<Array2<f64>> {
        let mut pe = Array2::zeros((max_len, dim));

        for pos in 0..max_len {
            for i in 0..(dim / 2) {
                let angle = pos as f64 / (10000.0_f64).powf(2.0 * i as f64 / dim as f64);
                pe[[pos, 2 * i]] = angle.sin();
                if 2 * i + 1 < dim {
                    pe[[pos, 2 * i + 1]] = angle.cos();
                }
            }
        }

        Ok(pe)
    }

    /// Add positional encoding to input.
    fn add_positional_encoding(&self, x: &Array2<f64>) -> QearResult<Array2<f64>> {
        let seq_len = x.nrows();

        if seq_len > self.max_seq_len {
            return Err(QearError::time_series(format!(
                "Sequence length {} exceeds maximum {}",
                seq_len, self.max_seq_len
            )));
        }

        if let Some(pe) = &self.positional_encoding {
            // Need to project positional encoding to input dimension if different
            let pe_slice = pe.slice(ndarray::s![..seq_len, ..]).to_owned();

            // If dimensions match, add directly
            if pe_slice.ncols() == x.ncols() {
                Ok(x + &pe_slice)
            } else {
                // Just return x without positional encoding if dimensions don't match
                // (will be handled during initialization)
                Ok(x.clone())
            }
        } else {
            Ok(x.clone())
        }
    }

    /// Forward pass with temporal attention.
    pub fn forward(
        &mut self,
        reservoir_states: &Array2<f64>,
        inputs: &Array2<f64>,
    ) -> QearResult<Array2<f64>> {
        // Add positional encoding to reservoir states
        let reservoir_with_pos = self.add_positional_encoding(reservoir_states)?;
        let inputs_with_pos = self.add_positional_encoding(inputs)?;

        self.attention.forward(&reservoir_with_pos, &inputs_with_pos)
    }

    /// Get attention weights for interpretability.
    pub fn get_attention_weights(
        &self,
        reservoir_states: &Array2<f64>,
        inputs: &Array2<f64>,
    ) -> QearResult<Array2<f64>> {
        // This would require storing weights during forward pass
        // For now, just return placeholder
        let seq_len = reservoir_states.nrows();
        Ok(Array2::zeros((seq_len, inputs.nrows())))
    }

    /// Get the underlying attention layer.
    pub fn attention(&self) -> &AttentionFusion {
        &self.attention
    }

    /// Get a mutable reference to the attention layer.
    pub fn attention_mut(&mut self) -> &mut AttentionFusion {
        &mut self.attention
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_attention_config_default() {
        let config = AttentionConfig::default();
        assert_eq!(config.attention_dim, 64);
        assert_eq!(config.num_heads, 4);
    }

    #[test]
    fn test_attention_config_validation() {
        let config = AttentionConfig::new(0, 4);
        assert!(config.validate().is_err());

        let config = AttentionConfig::new(63, 4); // Not divisible
        assert!(config.validate().is_err());

        let config = AttentionConfig::new(64, 4);
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_attention_fusion_creation() {
        let config = AttentionConfig::new(64, 4).with_seed(42);
        let fusion = AttentionFusion::new(config).unwrap();
        assert!(fusion.output_dim().is_none()); // Not initialized yet
    }

    #[test]
    fn test_attention_fusion_forward() {
        let config = AttentionConfig::new(64, 4).with_seed(42);
        let mut fusion = AttentionFusion::new(config).unwrap();

        let reservoir_states = Array2::from_shape_fn((10, 32), |(i, j)| {
            ((i + j) as f64 / 42.0).sin()
        });
        let inputs = Array2::from_shape_fn((10, 16), |(i, j)| {
            ((i * j) as f64 / 160.0).cos()
        });

        let output = fusion.forward(&reservoir_states, &inputs).unwrap();
        assert_eq!(output.nrows(), 10);
        assert_eq!(output.ncols(), 64); // attention_dim
    }

    #[test]
    fn test_attention_softmax() {
        let config = AttentionConfig::new(64, 4).with_seed(42);
        let fusion = AttentionFusion::new(config).unwrap();

        let scores = Array2::from_shape_vec((2, 3), vec![1.0, 2.0, 3.0, 1.0, 1.0, 1.0]).unwrap();
        let softmax = fusion.softmax(&scores).unwrap();

        // Each row should sum to 1
        for row in softmax.axis_iter(Axis(0)) {
            let sum: f64 = row.sum();
            assert!((sum - 1.0).abs() < 1e-6);
        }
    }

    #[test]
    fn test_attention_causal_mask() {
        let config = AttentionConfig::new(64, 4).with_causal(true).with_seed(42);
        let fusion = AttentionFusion::new(config).unwrap();

        let scores = Array2::ones((3, 3));
        let masked = fusion.apply_causal_mask(&scores).unwrap();

        // Upper triangle should be -inf
        assert!(masked[[0, 1]].is_infinite());
        assert!(masked[[0, 2]].is_infinite());
        assert!(masked[[1, 2]].is_infinite());

        // Diagonal and below should be preserved
        assert!((masked[[0, 0]] - 1.0).abs() < 1e-10);
        assert!((masked[[1, 1]] - 1.0).abs() < 1e-10);
        assert!((masked[[2, 2]] - 1.0).abs() < 1e-10);
    }

    #[test]
    fn test_temporal_attention() {
        let config = AttentionConfig::new(64, 4).with_seed(42);
        let mut temporal = TemporalAttention::new(config, 100).unwrap();

        let reservoir_states = Array2::from_shape_fn((10, 32), |(i, j)| {
            ((i + j) as f64 / 42.0).sin()
        });
        let inputs = Array2::from_shape_fn((10, 16), |(i, j)| {
            ((i * j) as f64 / 160.0).cos()
        });

        let output = temporal.forward(&reservoir_states, &inputs).unwrap();
        assert_eq!(output.nrows(), 10);
    }

    #[test]
    fn test_self_attention() {
        let config = AttentionConfig::new(32, 4).with_seed(42);
        let mut fusion = AttentionFusion::new(config).unwrap();

        let states = Array2::from_shape_fn((8, 32), |(i, j)| {
            ((i + j) as f64 / 40.0).sin()
        });

        let output = fusion.self_attention(&states).unwrap();
        assert_eq!(output.nrows(), 8);
        assert_eq!(output.ncols(), 32);
    }

    #[test]
    fn test_cross_attention() {
        let config = AttentionConfig::new(64, 4).with_seed(42);
        let mut fusion = AttentionFusion::new(config).unwrap();

        let reservoir = Array2::from_shape_fn((10, 32), |(i, j)| {
            ((i + j) as f64 / 42.0).sin()
        });
        // Context must have same sequence length as reservoir for forward pass
        let context = Array2::from_shape_fn((10, 24), |(i, j)| {
            ((i * j) as f64 / 240.0).cos()
        });

        let output = fusion.cross_attention(&reservoir, &context).unwrap();
        assert_eq!(output.nrows(), 10); // Same as reservoir
    }

    #[test]
    fn test_positional_encoding() {
        let pe = TemporalAttention::generate_positional_encoding(100, 64).unwrap();
        assert_eq!(pe.nrows(), 100);
        assert_eq!(pe.ncols(), 64);

        // First position should have specific pattern
        assert!((pe[[0, 0]]).abs() < 1e-6); // sin(0) = 0
        assert!((pe[[0, 1]] - 1.0).abs() < 1e-6); // cos(0) = 1
    }
}
