//! Time series processing for Quantum Echo-Attention Reservoir.
//!
//! This module provides utilities for encoding, windowing, and processing
//! time series data through the quantum reservoir.

use crate::error::{QearError, QearResult};
use crate::features::FeatureExtractor;
use crate::fusion::AttentionFusion;
use crate::reservoir::{QuantumReservoir, ReservoirConfig};
use ndarray::{Array1, Array2, Axis};

#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};

/// Configuration for time series processing.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct TimeSeriesConfig {
    /// Input dimension of the time series.
    pub input_dim: usize,
    /// Window size for sliding window processing.
    pub window_size: usize,
    /// Step size for sliding window (stride).
    pub step_size: usize,
    /// Horizon for forecasting.
    pub forecast_horizon: usize,
    /// Whether to normalize inputs.
    pub normalize: bool,
    /// Encoding method for input.
    pub encoding: EncodingMethod,
}

impl Default for TimeSeriesConfig {
    fn default() -> Self {
        Self {
            input_dim: 1,
            window_size: 50,
            step_size: 1,
            forecast_horizon: 1,
            normalize: true,
            encoding: EncodingMethod::Direct,
        }
    }
}

impl TimeSeriesConfig {
    /// Create a new time series configuration.
    pub fn new(input_dim: usize, window_size: usize) -> Self {
        Self {
            input_dim,
            window_size,
            ..Default::default()
        }
    }

    /// Set the forecast horizon.
    pub fn with_forecast_horizon(mut self, horizon: usize) -> Self {
        self.forecast_horizon = horizon;
        self
    }

    /// Set the step size.
    pub fn with_step_size(mut self, step_size: usize) -> Self {
        self.step_size = step_size;
        self
    }

    /// Set the encoding method.
    pub fn with_encoding(mut self, encoding: EncodingMethod) -> Self {
        self.encoding = encoding;
        self
    }

    /// Set normalization.
    pub fn with_normalize(mut self, normalize: bool) -> Self {
        self.normalize = normalize;
        self
    }

    /// Validate the configuration.
    pub fn validate(&self) -> QearResult<()> {
        if self.input_dim == 0 {
            return Err(QearError::invalid_parameter(
                "input_dim",
                "must be greater than 0",
            ));
        }
        if self.window_size == 0 {
            return Err(QearError::invalid_parameter(
                "window_size",
                "must be greater than 0",
            ));
        }
        if self.step_size == 0 {
            return Err(QearError::invalid_parameter(
                "step_size",
                "must be greater than 0",
            ));
        }
        Ok(())
    }
}

/// Encoding method for time series input.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub enum EncodingMethod {
    /// Direct input (no transformation).
    Direct,
    /// Phase encoding (map to angles).
    Phase,
    /// Amplitude encoding (map to amplitudes).
    Amplitude,
    /// Binary encoding (threshold).
    Binary,
    /// Fourier encoding (basis expansion).
    Fourier,
}

/// Input encoder for time series data.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct InputEncoder {
    /// Encoding method.
    method: EncodingMethod,
    /// Output dimension (for expanded encodings).
    output_dim: usize,
    /// Normalization statistics.
    norm_mean: Option<Array1<f64>>,
    norm_std: Option<Array1<f64>>,
}

impl InputEncoder {
    /// Create a new input encoder.
    pub fn new(method: EncodingMethod, output_dim: usize) -> Self {
        Self {
            method,
            output_dim,
            norm_mean: None,
            norm_std: None,
        }
    }

    /// Fit normalization statistics from data.
    pub fn fit(&mut self, data: &Array2<f64>) {
        let mean = data.mean_axis(Axis(0)).unwrap();
        let std = data.std_axis(Axis(0), 0.0);

        // Avoid division by zero
        let std = std.mapv(|s| if s < 1e-10 { 1.0 } else { s });

        self.norm_mean = Some(mean);
        self.norm_std = Some(std);
    }

    /// Normalize data using fitted statistics.
    pub fn normalize(&self, data: &Array2<f64>) -> QearResult<Array2<f64>> {
        match (&self.norm_mean, &self.norm_std) {
            (Some(mean), Some(std)) => {
                let mut normalized = data.clone();
                for mut row in normalized.rows_mut() {
                    for (j, val) in row.iter_mut().enumerate() {
                        if j < mean.len() {
                            *val = (*val - mean[j]) / std[j];
                        }
                    }
                }
                Ok(normalized)
            }
            _ => Ok(data.clone()),
        }
    }

    /// Encode a single sample.
    pub fn encode(&self, input: &Array1<f64>) -> QearResult<Array1<f64>> {
        match self.method {
            EncodingMethod::Direct => Ok(input.clone()),
            EncodingMethod::Phase => self.phase_encode(input),
            EncodingMethod::Amplitude => self.amplitude_encode(input),
            EncodingMethod::Binary => self.binary_encode(input),
            EncodingMethod::Fourier => self.fourier_encode(input),
        }
    }

    /// Encode a batch of samples.
    pub fn encode_batch(&self, inputs: &Array2<f64>) -> QearResult<Array2<f64>> {
        let n_samples = inputs.nrows();
        let encoded_dim = self.encoded_dim(inputs.ncols());

        let mut result = Array2::zeros((n_samples, encoded_dim));

        for i in 0..n_samples {
            let input = inputs.row(i).to_owned();
            let encoded = self.encode(&input)?;
            for j in 0..encoded_dim {
                result[[i, j]] = encoded[j];
            }
        }

        Ok(result)
    }

    /// Get the encoded dimension for a given input dimension.
    pub fn encoded_dim(&self, input_dim: usize) -> usize {
        match self.method {
            EncodingMethod::Direct => input_dim,
            EncodingMethod::Phase => input_dim * 2, // sin and cos
            EncodingMethod::Amplitude => input_dim,
            EncodingMethod::Binary => input_dim,
            EncodingMethod::Fourier => self.output_dim,
        }
    }

    /// Phase encoding: map values to angles.
    fn phase_encode(&self, input: &Array1<f64>) -> QearResult<Array1<f64>> {
        let n = input.len();
        let mut encoded = Array1::zeros(n * 2);

        for i in 0..n {
            let angle = input[i] * std::f64::consts::PI;
            encoded[2 * i] = angle.sin();
            encoded[2 * i + 1] = angle.cos();
        }

        Ok(encoded)
    }

    /// Amplitude encoding: normalize to unit norm.
    fn amplitude_encode(&self, input: &Array1<f64>) -> QearResult<Array1<f64>> {
        let norm = input.iter().map(|x| x * x).sum::<f64>().sqrt();
        if norm < 1e-10 {
            Ok(input.clone())
        } else {
            Ok(input / norm)
        }
    }

    /// Binary encoding: threshold at 0.
    fn binary_encode(&self, input: &Array1<f64>) -> QearResult<Array1<f64>> {
        Ok(input.mapv(|x| if x > 0.0 { 1.0 } else { 0.0 }))
    }

    /// Fourier encoding: expand to Fourier basis.
    fn fourier_encode(&self, input: &Array1<f64>) -> QearResult<Array1<f64>> {
        let n = input.len();
        let output_dim = self.output_dim;
        let n_frequencies = output_dim / (2 * n);

        let mut encoded = Array1::zeros(output_dim);
        let mut idx = 0;

        for i in 0..n {
            for k in 1..=n_frequencies {
                let angle = input[i] * k as f64 * std::f64::consts::PI;
                if idx < output_dim {
                    encoded[idx] = angle.sin();
                    idx += 1;
                }
                if idx < output_dim {
                    encoded[idx] = angle.cos();
                    idx += 1;
                }
            }
        }

        Ok(encoded)
    }

    /// Get the encoding method.
    pub fn method(&self) -> EncodingMethod {
        self.method
    }
}

/// Sliding window processor for time series.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct SlidingWindow {
    /// Window size.
    window_size: usize,
    /// Step size (stride).
    step_size: usize,
    /// Forecast horizon.
    forecast_horizon: usize,
}

impl SlidingWindow {
    /// Create a new sliding window processor.
    pub fn new(window_size: usize, step_size: usize, forecast_horizon: usize) -> Self {
        Self {
            window_size,
            step_size,
            forecast_horizon,
        }
    }

    /// Create windows from a time series.
    ///
    /// Returns (windows, targets) where:
    /// - windows: (n_windows, window_size, input_dim)
    /// - targets: (n_windows, forecast_horizon, input_dim)
    pub fn create_windows(
        &self,
        data: &Array2<f64>,
    ) -> QearResult<(Vec<Array2<f64>>, Vec<Array2<f64>>)> {
        let n_samples = data.nrows();
        let input_dim = data.ncols();

        let total_length = self.window_size + self.forecast_horizon;
        if n_samples < total_length {
            return Err(QearError::insufficient_data(total_length, n_samples));
        }

        let n_windows = (n_samples - total_length) / self.step_size + 1;
        let mut windows = Vec::with_capacity(n_windows);
        let mut targets = Vec::with_capacity(n_windows);

        for i in 0..n_windows {
            let start = i * self.step_size;
            let window_end = start + self.window_size;
            let _target_end = window_end + self.forecast_horizon;

            // Extract window
            let mut window = Array2::zeros((self.window_size, input_dim));
            for t in 0..self.window_size {
                for d in 0..input_dim {
                    window[[t, d]] = data[[start + t, d]];
                }
            }
            windows.push(window);

            // Extract target
            let mut target = Array2::zeros((self.forecast_horizon, input_dim));
            for t in 0..self.forecast_horizon {
                for d in 0..input_dim {
                    target[[t, d]] = data[[window_end + t, d]];
                }
            }
            targets.push(target);
        }

        Ok((windows, targets))
    }

    /// Create windows without targets (for inference).
    pub fn create_inference_windows(&self, data: &Array2<f64>) -> QearResult<Vec<Array2<f64>>> {
        let n_samples = data.nrows();
        let input_dim = data.ncols();

        if n_samples < self.window_size {
            return Err(QearError::insufficient_data(self.window_size, n_samples));
        }

        let n_windows = (n_samples - self.window_size) / self.step_size + 1;
        let mut windows = Vec::with_capacity(n_windows);

        for i in 0..n_windows {
            let start = i * self.step_size;

            let mut window = Array2::zeros((self.window_size, input_dim));
            for t in 0..self.window_size {
                for d in 0..input_dim {
                    window[[t, d]] = data[[start + t, d]];
                }
            }
            windows.push(window);
        }

        Ok(windows)
    }

    /// Get window size.
    pub fn window_size(&self) -> usize {
        self.window_size
    }

    /// Get step size.
    pub fn step_size(&self) -> usize {
        self.step_size
    }

    /// Get forecast horizon.
    pub fn forecast_horizon(&self) -> usize {
        self.forecast_horizon
    }
}

/// Time series processor combining reservoir, attention, and features.
#[derive(Debug)]
pub struct TimeSeriesProcessor {
    /// Configuration.
    config: TimeSeriesConfig,
    /// Quantum reservoir.
    reservoir: QuantumReservoir,
    /// Attention fusion (optional).
    attention: Option<AttentionFusion>,
    /// Feature extractor.
    feature_extractor: FeatureExtractor,
    /// Input encoder.
    encoder: InputEncoder,
    /// Sliding window processor.
    window: SlidingWindow,
}

impl TimeSeriesProcessor {
    /// Create a new time series processor.
    pub fn new(
        ts_config: TimeSeriesConfig,
        reservoir_config: ReservoirConfig,
    ) -> QearResult<Self> {
        ts_config.validate()?;

        let reservoir = QuantumReservoir::new(reservoir_config)?;
        let feature_extractor = FeatureExtractor::default_extractor();
        let encoder = InputEncoder::new(ts_config.encoding, ts_config.input_dim * 8);
        let window = SlidingWindow::new(
            ts_config.window_size,
            ts_config.step_size,
            ts_config.forecast_horizon,
        );

        Ok(Self {
            config: ts_config,
            reservoir,
            attention: None,
            feature_extractor,
            encoder,
            window,
        })
    }

    /// Enable attention fusion.
    pub fn with_attention(mut self, attention: AttentionFusion) -> Self {
        self.attention = Some(attention);
        self
    }

    /// Process a single window through the reservoir.
    pub fn process_window(&mut self, window: &Array2<f64>) -> QearResult<Array2<f64>> {
        // Encode input
        let encoded = self.encoder.encode_batch(window)?;

        // Run through reservoir
        self.reservoir.reset();
        let states = self.reservoir.run(&encoded)?;

        // Apply attention if enabled
        let processed = if let Some(ref mut attention) = self.attention {
            attention.forward(&states, &encoded)?
        } else {
            states
        };

        // Extract features
        let features = self.feature_extractor.extract(&processed)?;

        Ok(features)
    }

    /// Process multiple windows in batch.
    pub fn process_batch(&mut self, windows: &[Array2<f64>]) -> QearResult<Vec<Array2<f64>>> {
        let mut results = Vec::with_capacity(windows.len());

        for window in windows {
            let features = self.process_window(window)?;
            results.push(features);
        }

        Ok(results)
    }

    /// Prepare data for training.
    pub fn prepare_training_data(
        &mut self,
        data: &Array2<f64>,
    ) -> QearResult<(Vec<Array2<f64>>, Vec<Array2<f64>>)> {
        // Create windows
        let (windows, targets) = self.window.create_windows(data)?;

        // Process each window
        let features = self.process_batch(&windows)?;

        Ok((features, targets))
    }

    /// Get the configuration.
    pub fn config(&self) -> &TimeSeriesConfig {
        &self.config
    }

    /// Get a reference to the reservoir.
    pub fn reservoir(&self) -> &QuantumReservoir {
        &self.reservoir
    }

    /// Get a mutable reference to the reservoir.
    pub fn reservoir_mut(&mut self) -> &mut QuantumReservoir {
        &mut self.reservoir
    }

    /// Get the feature extractor.
    pub fn feature_extractor(&self) -> &FeatureExtractor {
        &self.feature_extractor
    }

    /// Get the window processor.
    pub fn window(&self) -> &SlidingWindow {
        &self.window
    }
}

/// Prediction head for forecasting.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct PredictionHead {
    /// Output dimension.
    output_dim: usize,
    /// Forecast horizon.
    horizon: usize,
    /// Weights (if trained).
    weights: Option<Array2<f64>>,
    /// Bias.
    bias: Option<Array1<f64>>,
}

impl PredictionHead {
    /// Create a new prediction head.
    pub fn new(output_dim: usize, horizon: usize) -> Self {
        Self {
            output_dim,
            horizon,
            weights: None,
            bias: None,
        }
    }

    /// Initialize weights for given feature dimension.
    pub fn initialize(&mut self, feature_dim: usize) {
        let total_output = self.output_dim * self.horizon;

        // Xavier initialization
        let scale = (2.0 / (feature_dim + total_output) as f64).sqrt();
        let mut rng = rand::thread_rng();
        use rand::Rng;

        let mut weights = Array2::zeros((total_output, feature_dim));
        for i in 0..total_output {
            for j in 0..feature_dim {
                weights[[i, j]] = (rng.gen::<f64>() - 0.5) * 2.0 * scale;
            }
        }

        self.weights = Some(weights);
        self.bias = Some(Array1::zeros(total_output));
    }

    /// Forward pass: features -> predictions.
    pub fn forward(&self, features: &Array1<f64>) -> QearResult<Array2<f64>> {
        let weights = self.weights.as_ref().ok_or_else(|| {
            QearError::not_trained("Prediction head not initialized")
        })?;
        let bias = self.bias.as_ref().unwrap();

        if features.len() != weights.ncols() {
            return Err(QearError::dimension_mismatch(weights.ncols(), features.len()));
        }

        // Linear transformation
        let output = weights.dot(features) + bias;

        // Reshape to (horizon, output_dim)
        let mut predictions = Array2::zeros((self.horizon, self.output_dim));
        for h in 0..self.horizon {
            for d in 0..self.output_dim {
                predictions[[h, d]] = output[h * self.output_dim + d];
            }
        }

        Ok(predictions)
    }

    /// Set weights (for training).
    pub fn set_weights(&mut self, weights: Array2<f64>, bias: Array1<f64>) {
        self.weights = Some(weights);
        self.bias = Some(bias);
    }

    /// Get weights.
    pub fn weights(&self) -> Option<&Array2<f64>> {
        self.weights.as_ref()
    }

    /// Get bias.
    pub fn bias(&self) -> Option<&Array1<f64>> {
        self.bias.as_ref()
    }

    /// Check if initialized.
    pub fn is_initialized(&self) -> bool {
        self.weights.is_some()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_timeseries_config_default() {
        let config = TimeSeriesConfig::default();
        assert_eq!(config.input_dim, 1);
        assert_eq!(config.window_size, 50);
    }

    #[test]
    fn test_timeseries_config_validation() {
        let config = TimeSeriesConfig::new(0, 50);
        assert!(config.validate().is_err());

        let config = TimeSeriesConfig::new(1, 50);
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_input_encoder_direct() {
        let encoder = InputEncoder::new(EncodingMethod::Direct, 10);
        let input = Array1::from_vec(vec![1.0, 2.0, 3.0]);
        let encoded = encoder.encode(&input).unwrap();
        assert_eq!(encoded.len(), 3);
    }

    #[test]
    fn test_input_encoder_phase() {
        let encoder = InputEncoder::new(EncodingMethod::Phase, 10);
        let input = Array1::from_vec(vec![0.5, 0.0]);
        let encoded = encoder.encode(&input).unwrap();
        assert_eq!(encoded.len(), 4); // 2 * input_dim
    }

    #[test]
    fn test_input_encoder_amplitude() {
        let encoder = InputEncoder::new(EncodingMethod::Amplitude, 10);
        let input = Array1::from_vec(vec![3.0, 4.0]);
        let encoded = encoder.encode(&input).unwrap();

        // Should be unit norm
        let norm: f64 = encoded.iter().map(|x| x * x).sum::<f64>().sqrt();
        assert!((norm - 1.0).abs() < 1e-10);
    }

    #[test]
    fn test_sliding_window_creation() {
        let window = SlidingWindow::new(10, 2, 3);
        let data = Array2::from_shape_fn((30, 2), |(i, j)| (i + j) as f64);

        let (windows, targets) = window.create_windows(&data).unwrap();

        // (30 - 10 - 3) / 2 + 1 = 9 windows
        assert_eq!(windows.len(), 9);
        assert_eq!(targets.len(), 9);
        assert_eq!(windows[0].nrows(), 10);
        assert_eq!(targets[0].nrows(), 3);
    }

    #[test]
    fn test_sliding_window_insufficient_data() {
        let window = SlidingWindow::new(10, 1, 3);
        let data = Array2::from_shape_fn((10, 2), |(i, j)| (i + j) as f64);

        let result = window.create_windows(&data);
        assert!(result.is_err());
    }

    #[test]
    fn test_time_series_processor_creation() {
        let ts_config = TimeSeriesConfig::new(3, 20);
        let reservoir_config = ReservoirConfig::new(4).with_seed(42);

        let processor = TimeSeriesProcessor::new(ts_config, reservoir_config);
        assert!(processor.is_ok());
    }

    #[test]
    fn test_time_series_processor_window() {
        let ts_config = TimeSeriesConfig::new(3, 20);
        let reservoir_config = ReservoirConfig::new(4).with_seed(42);
        let mut processor = TimeSeriesProcessor::new(ts_config, reservoir_config).unwrap();

        let window = Array2::from_shape_fn((20, 3), |(i, j)| ((i + j) as f64 / 23.0).sin());
        let features = processor.process_window(&window).unwrap();

        assert_eq!(features.nrows(), 20);
        assert!(features.ncols() > 0);
    }

    #[test]
    fn test_prediction_head() {
        let mut head = PredictionHead::new(2, 3);
        head.initialize(10);

        let features = Array1::from_vec((0..10).map(|i| i as f64 / 10.0).collect());
        let predictions = head.forward(&features).unwrap();

        assert_eq!(predictions.nrows(), 3); // horizon
        assert_eq!(predictions.ncols(), 2); // output_dim
    }

    #[test]
    fn test_encoder_normalization() {
        let mut encoder = InputEncoder::new(EncodingMethod::Direct, 10);
        let data = Array2::from_shape_fn((100, 3), |(i, j)| (i * 10 + j) as f64);

        encoder.fit(&data);
        let normalized = encoder.normalize(&data).unwrap();

        // Check that normalized data has approximately zero mean
        let mean = normalized.mean_axis(Axis(0)).unwrap();
        for m in mean.iter() {
            assert!(m.abs() < 1e-10);
        }
    }

    #[test]
    fn test_inference_windows() {
        let window = SlidingWindow::new(10, 5, 1);
        let data = Array2::from_shape_fn((50, 2), |(i, j)| (i + j) as f64);

        let windows = window.create_inference_windows(&data).unwrap();

        // (50 - 10) / 5 + 1 = 9 windows
        assert_eq!(windows.len(), 9);
    }
}
