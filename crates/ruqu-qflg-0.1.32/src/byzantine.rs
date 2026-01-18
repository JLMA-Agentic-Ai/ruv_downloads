//! Byzantine Detection for Federated Learning
//!
//! This module provides algorithms for detecting and filtering malicious
//! gradient updates in Byzantine-tolerant federated learning.
//!
//! ## Algorithms
//!
//! - **Krum**: Selects the gradient closest to its neighbors
//! - **Multi-Krum**: Selects top-k gradients by Krum score
//! - **Trimmed Mean**: Removes outliers before averaging
//! - **Median**: Coordinate-wise median aggregation
//! - **Bulyan**: Combines Krum with trimmed mean
//!
//! ## Example
//!
//! ```rust
//! use ruqu_qflg::byzantine::{ByzantineDetector, DetectorConfig, KrumDetector};
//! use ndarray::Array1;
//!
//! let config = DetectorConfig::new(3, 0.2); // Tolerate up to 20% Byzantine
//! let detector = KrumDetector::new(config);
//!
//! // Need at least 2f+3 clients for Krum (with f=1, need 5 clients)
//! let gradients = vec![
//!     Array1::from_vec(vec![1.0, 1.0]),
//!     Array1::from_vec(vec![1.1, 0.9]),
//!     Array1::from_vec(vec![0.9, 1.1]),
//!     Array1::from_vec(vec![1.0, 1.0]),
//!     Array1::from_vec(vec![1.0, 1.0]),
//!     Array1::from_vec(vec![100.0, -100.0]), // Byzantine
//! ];
//!
//! let (honest_indices, byzantine_indices) = detector.detect(&gradients).unwrap();
//! assert!(byzantine_indices.contains(&5));
//! ```

use ndarray::{Array1, ArrayView1};
use serde::{Deserialize, Serialize};

use crate::aggregation::{gradient_norm, pairwise_distances};
use crate::error::{ByzantineError, Result};

/// Configuration for Byzantine detection algorithms
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectorConfig {
    /// Minimum number of honest clients expected
    pub min_honest_clients: usize,
    /// Maximum fraction of Byzantine clients (0.0 to 0.5)
    pub byzantine_fraction: f64,
    /// Score threshold for detection (algorithm-specific)
    pub score_threshold: Option<f64>,
    /// Enable verbose scoring output
    pub verbose: bool,
}

impl DetectorConfig {
    /// Create a new detector configuration
    pub fn new(min_honest: usize, byzantine_fraction: f64) -> Self {
        Self {
            min_honest_clients: min_honest,
            byzantine_fraction,
            score_threshold: None,
            verbose: false,
        }
    }

    /// Validate the configuration
    pub fn validate(&self) -> Result<()> {
        if self.byzantine_fraction <= 0.0 || self.byzantine_fraction >= 0.5 {
            return Err(ByzantineError::InvalidTolerance(self.byzantine_fraction).into());
        }
        Ok(())
    }

    /// Calculate maximum number of Byzantine clients
    pub fn max_byzantine(&self, total_clients: usize) -> usize {
        ((total_clients as f64) * self.byzantine_fraction).floor() as usize
    }
}

impl Default for DetectorConfig {
    fn default() -> Self {
        Self::new(3, 0.3)
    }
}

/// Result of Byzantine detection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionResult {
    /// Indices of clients deemed honest
    pub honest_indices: Vec<usize>,
    /// Indices of clients deemed Byzantine
    pub byzantine_indices: Vec<usize>,
    /// Scores for each client (algorithm-specific)
    pub scores: Vec<f64>,
    /// Confidence in the detection
    pub confidence: f64,
}

/// Trait for Byzantine detection algorithms
pub trait ByzantineDetector: Send + Sync {
    /// Detect Byzantine clients among the gradient submissions
    fn detect(&self, gradients: &[Array1<f64>]) -> Result<(Vec<usize>, Vec<usize>)>;

    /// Get detailed detection results including scores
    fn detect_with_scores(&self, gradients: &[Array1<f64>]) -> Result<DetectionResult>;

    /// Get the detector configuration
    fn config(&self) -> &DetectorConfig;

    /// Compute Byzantine score for a single gradient
    fn score(&self, gradient: &ArrayView1<f64>, all_gradients: &[Array1<f64>]) -> Result<f64>;
}

/// Krum Byzantine detection algorithm
///
/// Krum selects the gradient that is closest to its n-f-2 nearest neighbors,
/// where n is total clients and f is the number of Byzantine clients.
#[derive(Debug, Clone)]
pub struct KrumDetector {
    config: DetectorConfig,
}

impl KrumDetector {
    /// Create a new Krum detector
    pub fn new(config: DetectorConfig) -> Self {
        Self { config }
    }

    /// Compute Krum score for a client
    fn krum_score(&self, distances: &[Vec<f64>], index: usize, k: usize) -> f64 {
        let n = distances.len();
        if k >= n {
            return f64::MAX;
        }

        let mut neighbor_distances: Vec<f64> = (0..n)
            .filter(|&j| j != index)
            .map(|j| distances[index][j])
            .collect();

        neighbor_distances.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

        // Sum of distances to k closest neighbors
        neighbor_distances.iter().take(k).sum()
    }
}

impl ByzantineDetector for KrumDetector {
    fn detect(&self, gradients: &[Array1<f64>]) -> Result<(Vec<usize>, Vec<usize>)> {
        let result = self.detect_with_scores(gradients)?;
        Ok((result.honest_indices, result.byzantine_indices))
    }

    fn detect_with_scores(&self, gradients: &[Array1<f64>]) -> Result<DetectionResult> {
        let n = gradients.len();
        let f = self.config.max_byzantine(n);

        if n < 2 * f + 3 {
            return Err(ByzantineError::InsufficientClients {
                required: 2 * f + 3,
                actual: n,
            }
            .into());
        }

        // Number of neighbors to consider
        let k = n - f - 2;

        // Compute pairwise distances
        let distances = pairwise_distances(gradients);

        // Compute Krum scores
        let scores: Vec<f64> = (0..n)
            .map(|i| self.krum_score(&distances, i, k))
            .collect();

        // Find threshold for Byzantine detection
        let mut sorted_scores: Vec<(usize, f64)> = scores.iter().cloned().enumerate().collect();
        sorted_scores.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));

        // Bottom n-f are honest, top f are Byzantine
        let honest_count = n - f;
        let honest_indices: Vec<usize> = sorted_scores.iter().take(honest_count).map(|&(i, _)| i).collect();
        let byzantine_indices: Vec<usize> = sorted_scores.iter().skip(honest_count).map(|&(i, _)| i).collect();

        // Compute confidence based on score separation
        let confidence = if !byzantine_indices.is_empty() && !honest_indices.is_empty() {
            let max_honest_score = sorted_scores[honest_count - 1].1;
            let min_byzantine_score = sorted_scores[honest_count].1;
            let separation = (min_byzantine_score - max_honest_score) / max_honest_score.max(1e-10);
            (separation / (1.0 + separation)).min(1.0)
        } else {
            1.0
        };

        Ok(DetectionResult {
            honest_indices,
            byzantine_indices,
            scores,
            confidence,
        })
    }

    fn config(&self) -> &DetectorConfig {
        &self.config
    }

    fn score(&self, gradient: &ArrayView1<f64>, all_gradients: &[Array1<f64>]) -> Result<f64> {
        let n = all_gradients.len();
        let f = self.config.max_byzantine(n);
        let k = n - f - 2;

        let mut distances: Vec<f64> = all_gradients
            .iter()
            .map(|g| {
                let diff = g - &gradient.to_owned();
                gradient_norm(&diff.view())
            })
            .collect();

        distances.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

        // Skip self (distance 0) and sum k nearest
        Ok(distances.iter().skip(1).take(k).sum())
    }
}

/// Multi-Krum: Select top-m gradients by Krum score
#[derive(Debug, Clone)]
pub struct MultiKrumDetector {
    inner: KrumDetector,
    /// Number of gradients to select
    m: usize,
}

impl MultiKrumDetector {
    /// Create a new Multi-Krum detector
    pub fn new(config: DetectorConfig, m: usize) -> Self {
        Self {
            inner: KrumDetector::new(config),
            m,
        }
    }

    /// Get the number of gradients to select
    pub fn m(&self) -> usize {
        self.m
    }
}

impl ByzantineDetector for MultiKrumDetector {
    fn detect(&self, gradients: &[Array1<f64>]) -> Result<(Vec<usize>, Vec<usize>)> {
        let result = self.detect_with_scores(gradients)?;
        Ok((result.honest_indices, result.byzantine_indices))
    }

    fn detect_with_scores(&self, gradients: &[Array1<f64>]) -> Result<DetectionResult> {
        let n = gradients.len();
        let f = self.config().max_byzantine(n);

        if n < 2 * f + 3 {
            return Err(ByzantineError::InsufficientClients {
                required: 2 * f + 3,
                actual: n,
            }
            .into());
        }

        // Get Krum scores
        let result = self.inner.detect_with_scores(gradients)?;

        // Select top-m by score (lowest scores are most honest)
        let mut sorted_indices: Vec<(usize, f64)> = result
            .scores
            .iter()
            .cloned()
            .enumerate()
            .collect();
        sorted_indices.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));

        let m = self.m.min(n - f);
        let honest_indices: Vec<usize> = sorted_indices.iter().take(m).map(|&(i, _)| i).collect();
        let byzantine_indices: Vec<usize> = sorted_indices.iter().skip(m).map(|&(i, _)| i).collect();

        Ok(DetectionResult {
            honest_indices,
            byzantine_indices,
            scores: result.scores,
            confidence: result.confidence,
        })
    }

    fn config(&self) -> &DetectorConfig {
        self.inner.config()
    }

    fn score(&self, gradient: &ArrayView1<f64>, all_gradients: &[Array1<f64>]) -> Result<f64> {
        self.inner.score(gradient, all_gradients)
    }
}

/// Trimmed Mean aggregation with outlier removal
#[derive(Debug, Clone)]
pub struct TrimmedMeanDetector {
    config: DetectorConfig,
    /// Fraction of values to trim from each end
    trim_fraction: f64,
}

impl TrimmedMeanDetector {
    /// Create a new Trimmed Mean detector
    pub fn new(config: DetectorConfig, trim_fraction: f64) -> Self {
        Self {
            config,
            trim_fraction,
        }
    }

    /// Compute coordinate-wise trimmed mean
    pub fn trimmed_mean(&self, gradients: &[Array1<f64>]) -> Result<Array1<f64>> {
        if gradients.is_empty() {
            return Err(ByzantineError::InsufficientClients {
                required: 1,
                actual: 0,
            }
            .into());
        }

        let n = gradients.len();
        let dim = gradients[0].len();
        let trim_count = ((n as f64) * self.trim_fraction).floor() as usize;

        let mut result = Array1::zeros(dim);

        for d in 0..dim {
            let mut values: Vec<f64> = gradients.iter().map(|g| g[d]).collect();
            values.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

            // Trim top and bottom
            let trimmed: Vec<f64> = values
                .iter()
                .skip(trim_count)
                .take(n - 2 * trim_count)
                .cloned()
                .collect();

            if trimmed.is_empty() {
                result[d] = values[n / 2]; // Fallback to median
            } else {
                result[d] = trimmed.iter().sum::<f64>() / trimmed.len() as f64;
            }
        }

        Ok(result)
    }
}

impl ByzantineDetector for TrimmedMeanDetector {
    fn detect(&self, gradients: &[Array1<f64>]) -> Result<(Vec<usize>, Vec<usize>)> {
        let result = self.detect_with_scores(gradients)?;
        Ok((result.honest_indices, result.byzantine_indices))
    }

    fn detect_with_scores(&self, gradients: &[Array1<f64>]) -> Result<DetectionResult> {
        let n = gradients.len();
        let trim_count = ((n as f64) * self.trim_fraction).floor() as usize;

        // Compute trimmed mean as reference
        let reference = self.trimmed_mean(gradients)?;

        // Score each gradient by distance to trimmed mean
        let scores: Vec<f64> = gradients
            .iter()
            .map(|g| {
                let diff = g - &reference;
                gradient_norm(&diff.view())
            })
            .collect();

        // Sort by distance and identify outliers
        let mut sorted_indices: Vec<(usize, f64)> = scores.iter().cloned().enumerate().collect();
        sorted_indices.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));

        let honest_count = n - 2 * trim_count;
        let honest_indices: Vec<usize> = sorted_indices.iter().take(honest_count).map(|&(i, _)| i).collect();
        let byzantine_indices: Vec<usize> = sorted_indices.iter().skip(honest_count).map(|&(i, _)| i).collect();

        let confidence = if honest_count > 0 {
            let max_honest_dist = sorted_indices.get(honest_count.saturating_sub(1)).map(|x| x.1).unwrap_or(0.0);
            let avg_byzantine_dist = if byzantine_indices.is_empty() {
                max_honest_dist
            } else {
                sorted_indices.iter().skip(honest_count).map(|x| x.1).sum::<f64>() / byzantine_indices.len() as f64
            };
            let ratio = avg_byzantine_dist / max_honest_dist.max(1e-10);
            ((ratio - 1.0) / ratio).max(0.0).min(1.0)
        } else {
            0.0
        };

        Ok(DetectionResult {
            honest_indices,
            byzantine_indices,
            scores,
            confidence,
        })
    }

    fn config(&self) -> &DetectorConfig {
        &self.config
    }

    fn score(&self, gradient: &ArrayView1<f64>, all_gradients: &[Array1<f64>]) -> Result<f64> {
        let reference = self.trimmed_mean(all_gradients)?;
        let diff = &gradient.to_owned() - &reference;
        Ok(gradient_norm(&diff.view()))
    }
}

/// Coordinate-wise Median aggregation
#[derive(Debug, Clone)]
pub struct MedianDetector {
    config: DetectorConfig,
}

impl MedianDetector {
    /// Create a new Median detector
    pub fn new(config: DetectorConfig) -> Self {
        Self { config }
    }

    /// Compute coordinate-wise median
    pub fn coordinate_median(&self, gradients: &[Array1<f64>]) -> Result<Array1<f64>> {
        if gradients.is_empty() {
            return Err(ByzantineError::InsufficientClients {
                required: 1,
                actual: 0,
            }
            .into());
        }

        let dim = gradients[0].len();
        let n = gradients.len();
        let mut result = Array1::zeros(dim);

        for d in 0..dim {
            let mut values: Vec<f64> = gradients.iter().map(|g| g[d]).collect();
            values.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

            result[d] = if n % 2 == 1 {
                values[n / 2]
            } else {
                (values[n / 2 - 1] + values[n / 2]) / 2.0
            };
        }

        Ok(result)
    }
}

impl ByzantineDetector for MedianDetector {
    fn detect(&self, gradients: &[Array1<f64>]) -> Result<(Vec<usize>, Vec<usize>)> {
        let result = self.detect_with_scores(gradients)?;
        Ok((result.honest_indices, result.byzantine_indices))
    }

    fn detect_with_scores(&self, gradients: &[Array1<f64>]) -> Result<DetectionResult> {
        let n = gradients.len();
        let f = self.config.max_byzantine(n);

        // Compute median as reference
        let reference = self.coordinate_median(gradients)?;

        // Score by distance to median
        let scores: Vec<f64> = gradients
            .iter()
            .map(|g| {
                let diff = g - &reference;
                gradient_norm(&diff.view())
            })
            .collect();

        // Use MAD (Median Absolute Deviation) for threshold
        let mut sorted_scores: Vec<f64> = scores.clone();
        sorted_scores.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        let median_score = sorted_scores[n / 2];
        let mad: Vec<f64> = scores.iter().map(|s| (s - median_score).abs()).collect();
        let mut sorted_mad = mad.clone();
        sorted_mad.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        let mad_median = sorted_mad[n / 2];

        // Threshold at median + 3 * MAD
        let threshold = median_score + 3.0 * mad_median;

        let mut honest_indices = Vec::new();
        let mut byzantine_indices = Vec::new();

        for (i, &score) in scores.iter().enumerate() {
            if score <= threshold || byzantine_indices.len() >= f {
                honest_indices.push(i);
            } else {
                byzantine_indices.push(i);
            }
        }

        let confidence = if !byzantine_indices.is_empty() {
            let min_byzantine = byzantine_indices.iter().map(|&i| scores[i]).fold(f64::MAX, f64::min);
            let max_honest = honest_indices.iter().map(|&i| scores[i]).fold(f64::MIN, f64::max);
            ((min_byzantine - max_honest) / max_honest.max(1e-10)).min(1.0).max(0.0)
        } else {
            1.0
        };

        Ok(DetectionResult {
            honest_indices,
            byzantine_indices,
            scores,
            confidence,
        })
    }

    fn config(&self) -> &DetectorConfig {
        &self.config
    }

    fn score(&self, gradient: &ArrayView1<f64>, all_gradients: &[Array1<f64>]) -> Result<f64> {
        let reference = self.coordinate_median(all_gradients)?;
        let diff = &gradient.to_owned() - &reference;
        Ok(gradient_norm(&diff.view()))
    }
}

/// Bulyan: Combines Krum selection with trimmed mean
#[derive(Debug, Clone)]
pub struct BulyanDetector {
    krum: KrumDetector,
    trim_fraction: f64,
}

impl BulyanDetector {
    /// Create a new Bulyan detector
    pub fn new(config: DetectorConfig) -> Self {
        let trim_fraction = config.byzantine_fraction;
        Self {
            krum: KrumDetector::new(config),
            trim_fraction,
        }
    }

    /// Compute Bulyan aggregate
    pub fn bulyan_aggregate(&self, gradients: &[Array1<f64>]) -> Result<Array1<f64>> {
        let n = gradients.len();
        let f = self.config().max_byzantine(n);

        if n < 4 * f + 3 {
            return Err(ByzantineError::InsufficientClients {
                required: 4 * f + 3,
                actual: n,
            }
            .into());
        }

        // Step 1: Use Multi-Krum to select n - 2f gradients
        let selection_count = n - 2 * f;
        let multi_krum = MultiKrumDetector::new(self.config().clone(), selection_count);
        let (honest_indices, _) = multi_krum.detect(gradients)?;

        // Step 2: Apply trimmed mean to selected gradients
        let selected: Vec<Array1<f64>> = honest_indices.iter().map(|&i| gradients[i].clone()).collect();
        let trimmed = TrimmedMeanDetector::new(self.config().clone(), self.trim_fraction);
        trimmed.trimmed_mean(&selected)
    }
}

impl ByzantineDetector for BulyanDetector {
    fn detect(&self, gradients: &[Array1<f64>]) -> Result<(Vec<usize>, Vec<usize>)> {
        let result = self.detect_with_scores(gradients)?;
        Ok((result.honest_indices, result.byzantine_indices))
    }

    fn detect_with_scores(&self, gradients: &[Array1<f64>]) -> Result<DetectionResult> {
        // Use Krum for initial detection
        self.krum.detect_with_scores(gradients)
    }

    fn config(&self) -> &DetectorConfig {
        self.krum.config()
    }

    fn score(&self, gradient: &ArrayView1<f64>, all_gradients: &[Array1<f64>]) -> Result<f64> {
        self.krum.score(gradient, all_gradients)
    }
}

/// Statistics about Byzantine detection
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ByzantineStats {
    /// Total detections performed
    pub total_detections: u64,
    /// Total clients processed
    pub total_clients: u64,
    /// Total Byzantine clients detected
    pub total_byzantine: u64,
    /// Average confidence score
    pub avg_confidence: f64,
    /// Maximum Byzantine in single round
    pub max_byzantine_round: usize,
}

impl ByzantineStats {
    /// Create new empty stats
    pub fn new() -> Self {
        Self::default()
    }

    /// Update stats with detection result
    pub fn update(&mut self, result: &DetectionResult) {
        self.total_detections += 1;
        self.total_clients += (result.honest_indices.len() + result.byzantine_indices.len()) as u64;
        self.total_byzantine += result.byzantine_indices.len() as u64;
        self.avg_confidence = (self.avg_confidence * (self.total_detections - 1) as f64 + result.confidence)
            / self.total_detections as f64;
        self.max_byzantine_round = self.max_byzantine_round.max(result.byzantine_indices.len());
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::array;

    fn honest_gradients() -> Vec<Array1<f64>> {
        vec![
            array![1.0, 1.0, 1.0],
            array![1.1, 0.9, 1.0],
            array![0.9, 1.1, 1.0],
            array![1.0, 1.0, 1.1],
            array![1.0, 1.0, 0.9],
        ]
    }

    fn with_byzantine(mut gradients: Vec<Array1<f64>>) -> Vec<Array1<f64>> {
        gradients.push(array![100.0, -100.0, 50.0]); // Byzantine
        gradients
    }

    #[test]
    fn test_krum_detector_basic() {
        let config = DetectorConfig::new(3, 0.2);
        let detector = KrumDetector::new(config);

        let gradients = with_byzantine(honest_gradients());
        let (honest, byzantine) = detector.detect(&gradients).unwrap();

        assert!(byzantine.contains(&5)); // Byzantine at index 5
        assert_eq!(honest.len(), 5);
    }

    #[test]
    fn test_krum_all_honest() {
        let config = DetectorConfig::new(3, 0.2);
        let detector = KrumDetector::new(config);

        let gradients = honest_gradients();
        let (honest, byzantine) = detector.detect(&gradients).unwrap();

        assert!(byzantine.is_empty() || byzantine.len() <= 1);
        assert!(honest.len() >= 4);
    }

    #[test]
    fn test_multi_krum() {
        let config = DetectorConfig::new(3, 0.2);
        let detector = MultiKrumDetector::new(config, 3);

        let gradients = with_byzantine(honest_gradients());
        let (honest, _) = detector.detect(&gradients).unwrap();

        assert_eq!(honest.len(), 3);
        assert!(!honest.contains(&5)); // Byzantine excluded
    }

    #[test]
    fn test_trimmed_mean_detector() {
        let config = DetectorConfig::new(3, 0.2);
        let detector = TrimmedMeanDetector::new(config, 0.2);

        let gradients = with_byzantine(honest_gradients());
        let result = detector.trimmed_mean(&gradients).unwrap();

        // Result should be close to [1.0, 1.0, 1.0]
        assert!((result[0] - 1.0).abs() < 0.5);
        assert!((result[1] - 1.0).abs() < 0.5);
    }

    #[test]
    fn test_median_detector() {
        let config = DetectorConfig::new(3, 0.2);
        let detector = MedianDetector::new(config);

        let gradients = with_byzantine(honest_gradients());
        let median = detector.coordinate_median(&gradients).unwrap();

        // Median should be resistant to Byzantine
        assert!((median[0] - 1.0).abs() < 0.2);
    }

    #[test]
    fn test_median_detection() {
        let config = DetectorConfig::new(3, 0.2);
        let detector = MedianDetector::new(config);

        let gradients = with_byzantine(honest_gradients());
        let (honest, byzantine) = detector.detect(&gradients).unwrap();

        assert!(byzantine.contains(&5));
        assert!(honest.len() >= 4);
    }

    #[test]
    fn test_bulyan_detector() {
        let config = DetectorConfig::new(3, 0.1);
        let detector = BulyanDetector::new(config);

        // Need more clients for Bulyan (4f + 3)
        let mut gradients = honest_gradients();
        for _ in 0..5 {
            gradients.push(array![1.0 + rand::random::<f64>() * 0.1, 1.0, 1.0]);
        }
        gradients.push(array![100.0, -100.0, 0.0]); // Byzantine

        let result = detector.bulyan_aggregate(&gradients).unwrap();
        // Should be close to honest center
        assert!((result[0] - 1.0).abs() < 0.5);
    }

    #[test]
    fn test_detection_with_scores() {
        let config = DetectorConfig::new(3, 0.2);
        let detector = KrumDetector::new(config);

        let gradients = with_byzantine(honest_gradients());
        let result = detector.detect_with_scores(&gradients).unwrap();

        assert_eq!(result.scores.len(), gradients.len());
        assert!(result.confidence > 0.0);
        assert!(result.scores[5] > result.scores[0]); // Byzantine has higher score
    }

    #[test]
    fn test_insufficient_clients() {
        let config = DetectorConfig::new(3, 0.3);
        let detector = KrumDetector::new(config);

        let gradients = vec![
            array![1.0, 1.0],
            array![2.0, 2.0],
        ];

        let result = detector.detect(&gradients);
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_tolerance() {
        let config = DetectorConfig::new(3, 0.6); // Invalid: > 0.5
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_max_byzantine_calculation() {
        let config = DetectorConfig::new(3, 0.3);
        assert_eq!(config.max_byzantine(10), 3);
        assert_eq!(config.max_byzantine(7), 2);
    }

    #[test]
    fn test_score_single_gradient() {
        let config = DetectorConfig::new(3, 0.2);
        let detector = KrumDetector::new(config);

        let gradients = honest_gradients();
        let byzantine = array![100.0, -100.0, 0.0];

        let honest_score = detector.score(&gradients[0].view(), &gradients).unwrap();
        let byzantine_score = detector.score(&byzantine.view(), &gradients).unwrap();

        assert!(byzantine_score > honest_score);
    }

    #[test]
    fn test_byzantine_stats() {
        let mut stats = ByzantineStats::new();

        let result = DetectionResult {
            honest_indices: vec![0, 1, 2],
            byzantine_indices: vec![3, 4],
            scores: vec![1.0, 1.1, 0.9, 5.0, 6.0],
            confidence: 0.85,
        };

        stats.update(&result);
        assert_eq!(stats.total_detections, 1);
        assert_eq!(stats.total_byzantine, 2);
        assert_eq!(stats.max_byzantine_round, 2);
        assert!((stats.avg_confidence - 0.85).abs() < 1e-10);
    }

    #[test]
    fn test_multiple_byzantine() {
        let config = DetectorConfig::new(3, 0.3);
        let detector = KrumDetector::new(config);

        let mut gradients = honest_gradients();
        gradients.push(array![100.0, 0.0, 0.0]);
        gradients.push(array![0.0, -100.0, 0.0]);
        gradients.push(array![0.0, 0.0, 100.0]);

        let (honest, byzantine) = detector.detect(&gradients).unwrap();

        // Should detect the Byzantine ones
        assert!(byzantine.len() >= 2);
        assert!(honest.len() >= 4);
    }

    #[test]
    fn test_trimmed_mean_computation() {
        let config = DetectorConfig::default();
        let detector = TrimmedMeanDetector::new(config, 0.2);

        let gradients = vec![
            array![0.0],
            array![1.0],
            array![2.0],
            array![3.0],
            array![100.0], // Outlier
        ];

        let result = detector.trimmed_mean(&gradients).unwrap();
        // Should trim 1 from each end, averaging [1, 2, 3] = 2.0
        assert!((result[0] - 2.0).abs() < 0.1);
    }

    #[test]
    fn test_coordinate_median_even() {
        let config = DetectorConfig::default();
        let detector = MedianDetector::new(config);

        let gradients = vec![
            array![1.0],
            array![2.0],
            array![3.0],
            array![4.0],
        ];

        let result = detector.coordinate_median(&gradients).unwrap();
        // Median of [1,2,3,4] = (2+3)/2 = 2.5
        assert!((result[0] - 2.5).abs() < 1e-10);
    }

    #[test]
    fn test_coordinate_median_odd() {
        let config = DetectorConfig::default();
        let detector = MedianDetector::new(config);

        let gradients = vec![
            array![1.0],
            array![2.0],
            array![3.0],
        ];

        let result = detector.coordinate_median(&gradients).unwrap();
        assert!((result[0] - 2.0).abs() < 1e-10);
    }
}
