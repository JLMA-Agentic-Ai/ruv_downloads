//! Training module for Quantum Echo-Attention Reservoir.
//!
//! This module provides training algorithms including ridge regression
//! for the readout layer and online learning for continuous adaptation.

use crate::error::{QearError, QearResult};
use ndarray::{Array1, Array2, Axis};

#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};

/// Configuration for ridge regression training.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct RidgeConfig {
    /// Regularization parameter (lambda).
    pub alpha: f64,
    /// Whether to fit an intercept (bias).
    pub fit_intercept: bool,
    /// Maximum iterations for iterative solvers.
    pub max_iterations: usize,
    /// Convergence tolerance.
    pub tolerance: f64,
    /// Solver method.
    pub solver: RidgeSolver,
}

impl Default for RidgeConfig {
    fn default() -> Self {
        Self {
            alpha: 1.0,
            fit_intercept: true,
            max_iterations: 1000,
            tolerance: 1e-6,
            solver: RidgeSolver::CholeskyDecomposition,
        }
    }
}

impl RidgeConfig {
    /// Create a new configuration with given alpha.
    pub fn new(alpha: f64) -> Self {
        Self {
            alpha,
            ..Default::default()
        }
    }

    /// Set the solver method.
    pub fn with_solver(mut self, solver: RidgeSolver) -> Self {
        self.solver = solver;
        self
    }

    /// Validate the configuration.
    pub fn validate(&self) -> QearResult<()> {
        if self.alpha < 0.0 {
            return Err(QearError::invalid_parameter(
                "alpha",
                "must be non-negative",
            ));
        }
        if self.tolerance <= 0.0 {
            return Err(QearError::invalid_parameter("tolerance", "must be positive"));
        }
        Ok(())
    }
}

/// Solver methods for ridge regression.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub enum RidgeSolver {
    /// Direct solution via Cholesky decomposition.
    CholeskyDecomposition,
    /// Iterative conjugate gradient method.
    ConjugateGradient,
    /// Stochastic gradient descent.
    SGD,
}

/// Ridge regression readout layer.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct RidgeRegression {
    /// Configuration.
    config: RidgeConfig,
    /// Learned weights (output_dim x feature_dim).
    weights: Option<Array2<f64>>,
    /// Learned intercept (output_dim,).
    intercept: Option<Array1<f64>>,
    /// Feature dimension.
    feature_dim: Option<usize>,
    /// Output dimension.
    output_dim: Option<usize>,
    /// Training mean (for centering).
    training_mean: Option<Array1<f64>>,
    /// Training std (for scaling).
    training_std: Option<Array1<f64>>,
}

impl RidgeRegression {
    /// Create a new ridge regression model.
    pub fn new(config: RidgeConfig) -> QearResult<Self> {
        config.validate()?;

        Ok(Self {
            config,
            weights: None,
            intercept: None,
            feature_dim: None,
            output_dim: None,
            training_mean: None,
            training_std: None,
        })
    }

    /// Create with default configuration.
    pub fn default_model() -> QearResult<Self> {
        Self::new(RidgeConfig::default())
    }

    /// Fit the model to training data.
    ///
    /// # Arguments
    /// * `features` - Feature matrix (n_samples x feature_dim)
    /// * `targets` - Target matrix (n_samples x output_dim)
    pub fn fit(&mut self, features: &Array2<f64>, targets: &Array2<f64>) -> QearResult<()> {
        let n_samples = features.nrows();
        let feature_dim = features.ncols();
        let output_dim = targets.ncols();

        if targets.nrows() != n_samples {
            return Err(QearError::dimension_mismatch(n_samples, targets.nrows()));
        }

        if n_samples == 0 {
            return Err(QearError::insufficient_data(1, 0));
        }

        // Center features if fitting intercept
        let (features_centered, feature_mean) = if self.config.fit_intercept {
            let mean = features.mean_axis(Axis(0)).unwrap();
            let centered = features - &mean;
            (centered, Some(mean))
        } else {
            (features.clone(), None)
        };

        // Center targets if fitting intercept
        let (targets_centered, target_mean) = if self.config.fit_intercept {
            let mean = targets.mean_axis(Axis(0)).unwrap();
            let centered = targets - &mean;
            (centered, Some(mean))
        } else {
            (targets.clone(), None)
        };

        // Solve the ridge regression problem
        let weights = match self.config.solver {
            RidgeSolver::CholeskyDecomposition => {
                self.solve_cholesky(&features_centered, &targets_centered)?
            }
            RidgeSolver::ConjugateGradient => {
                self.solve_cg(&features_centered, &targets_centered)?
            }
            RidgeSolver::SGD => self.solve_sgd(&features_centered, &targets_centered)?,
        };

        // Compute intercept
        let intercept = if self.config.fit_intercept {
            let fm = feature_mean.as_ref().unwrap();
            let tm = target_mean.as_ref().unwrap();
            Some(tm - &weights.dot(fm))
        } else {
            Some(Array1::zeros(output_dim))
        };

        self.weights = Some(weights);
        self.intercept = intercept;
        self.feature_dim = Some(feature_dim);
        self.output_dim = Some(output_dim);
        self.training_mean = feature_mean;

        Ok(())
    }

    /// Solve using Cholesky decomposition.
    ///
    /// Solves: (X^T X + alpha * I) * W = X^T Y
    fn solve_cholesky(
        &self,
        features: &Array2<f64>,
        targets: &Array2<f64>,
    ) -> QearResult<Array2<f64>> {
        let n_features = features.ncols();

        // X^T X
        let xtx = features.t().dot(features);

        // X^T X + alpha * I
        let mut a = xtx;
        for i in 0..n_features {
            a[[i, i]] += self.config.alpha;
        }

        // X^T Y
        let xty = features.t().dot(targets);

        // Solve A * W = B using Cholesky decomposition (simplified)
        // For production, use nalgebra or ndarray-linalg
        let weights = self.solve_linear_system(&a, &xty)?;

        // Transpose to get (output_dim x feature_dim)
        Ok(weights.t().to_owned())
    }

    /// Solve using conjugate gradient method.
    fn solve_cg(&self, features: &Array2<f64>, targets: &Array2<f64>) -> QearResult<Array2<f64>> {
        let n_features = features.ncols();
        let n_outputs = targets.ncols();

        let mut weights = Array2::zeros((n_outputs, n_features));

        // Solve for each output dimension
        for o in 0..n_outputs {
            let target_col = targets.column(o).to_owned();
            let w = self.cg_solve(features, &target_col)?;
            for j in 0..n_features {
                weights[[o, j]] = w[j];
            }
        }

        Ok(weights)
    }

    /// Conjugate gradient for a single output.
    fn cg_solve(&self, features: &Array2<f64>, target: &Array1<f64>) -> QearResult<Array1<f64>> {
        let n_features = features.ncols();
        let alpha = self.config.alpha;

        // A * x = b where A = X^T X + alpha * I, b = X^T y
        let b = features.t().dot(target);

        let mut x = Array1::zeros(n_features);
        let mut r = &b - &self.apply_normal_equations(features, &x, alpha);
        let mut p = r.clone();
        let mut rsold = r.dot(&r);

        for _ in 0..self.config.max_iterations {
            let ap = self.apply_normal_equations(features, &p, alpha);
            let pap = p.dot(&ap);

            if pap.abs() < 1e-15 {
                break;
            }

            let alpha_cg = rsold / pap;
            x = &x + &(&p * alpha_cg);
            r = &r - &(&ap * alpha_cg);

            let rsnew = r.dot(&r);

            if rsnew.sqrt() < self.config.tolerance {
                break;
            }

            p = &r + &(&p * (rsnew / rsold));
            rsold = rsnew;
        }

        Ok(x)
    }

    /// Apply (X^T X + alpha * I) to a vector.
    fn apply_normal_equations(
        &self,
        features: &Array2<f64>,
        x: &Array1<f64>,
        alpha: f64,
    ) -> Array1<f64> {
        let xtx_x = features.t().dot(&features.dot(x));
        &xtx_x + &(x * alpha)
    }

    /// Solve using stochastic gradient descent.
    fn solve_sgd(&self, features: &Array2<f64>, targets: &Array2<f64>) -> QearResult<Array2<f64>> {
        let n_samples = features.nrows();
        let n_features = features.ncols();
        let n_outputs = targets.ncols();

        let mut weights = Array2::zeros((n_outputs, n_features));
        let learning_rate = 0.01;
        let alpha = self.config.alpha;

        for _epoch in 0..self.config.max_iterations {
            let mut total_loss = 0.0;

            for i in 0..n_samples {
                let x = features.row(i);
                let y = targets.row(i);

                // Prediction
                let pred = weights.dot(&x.t());

                // Error
                let error = &pred - &y.to_owned();
                total_loss += error.dot(&error);

                // Gradient: (pred - y) * x + alpha * w
                for o in 0..n_outputs {
                    for j in 0..n_features {
                        let grad = error[o] * x[j] + alpha * weights[[o, j]] / n_samples as f64;
                        weights[[o, j]] -= learning_rate * grad;
                    }
                }
            }

            if (total_loss / n_samples as f64) < self.config.tolerance {
                break;
            }
        }

        Ok(weights)
    }

    /// Solve a linear system A * X = B using simple Gaussian elimination.
    fn solve_linear_system(
        &self,
        a: &Array2<f64>,
        b: &Array2<f64>,
    ) -> QearResult<Array2<f64>> {
        let n = a.nrows();
        let m = b.ncols();

        if a.ncols() != n {
            return Err(QearError::training("Matrix A must be square"));
        }
        if b.nrows() != n {
            return Err(QearError::dimension_mismatch(n, b.nrows()));
        }

        // Create augmented matrix [A | B]
        let mut aug = Array2::zeros((n, n + m));
        for i in 0..n {
            for j in 0..n {
                aug[[i, j]] = a[[i, j]];
            }
            for j in 0..m {
                aug[[i, n + j]] = b[[i, j]];
            }
        }

        // Forward elimination
        for k in 0..n {
            // Find pivot
            let mut max_idx = k;
            let mut max_val = aug[[k, k]].abs();
            for i in (k + 1)..n {
                if aug[[i, k]].abs() > max_val {
                    max_val = aug[[i, k]].abs();
                    max_idx = i;
                }
            }

            if max_val < 1e-10 {
                return Err(QearError::numerical_instability(
                    "Singular or near-singular matrix",
                ));
            }

            // Swap rows
            if max_idx != k {
                for j in 0..(n + m) {
                    let temp = aug[[k, j]];
                    aug[[k, j]] = aug[[max_idx, j]];
                    aug[[max_idx, j]] = temp;
                }
            }

            // Eliminate
            for i in (k + 1)..n {
                let factor = aug[[i, k]] / aug[[k, k]];
                for j in k..(n + m) {
                    aug[[i, j]] -= factor * aug[[k, j]];
                }
            }
        }

        // Back substitution
        let mut x = Array2::zeros((n, m));
        for k in (0..n).rev() {
            for j in 0..m {
                let mut sum = aug[[k, n + j]];
                for i in (k + 1)..n {
                    sum -= aug[[k, i]] * x[[i, j]];
                }
                x[[k, j]] = sum / aug[[k, k]];
            }
        }

        Ok(x)
    }

    /// Predict using the trained model.
    pub fn predict(&self, features: &Array2<f64>) -> QearResult<Array2<f64>> {
        let weights = self.weights.as_ref().ok_or_else(|| {
            QearError::not_trained("Model has not been trained")
        })?;
        let intercept = self.intercept.as_ref().unwrap();

        if let Some(expected) = self.feature_dim {
            if features.ncols() != expected {
                return Err(QearError::dimension_mismatch(expected, features.ncols()));
            }
        }

        // predictions = features @ weights.T + intercept
        let mut predictions = features.dot(&weights.t());
        for mut row in predictions.rows_mut() {
            row += intercept;
        }

        Ok(predictions)
    }

    /// Predict for a single sample.
    pub fn predict_single(&self, features: &Array1<f64>) -> QearResult<Array1<f64>> {
        let features_2d = features.clone().insert_axis(Axis(0));
        let predictions = self.predict(&features_2d)?;
        Ok(predictions.row(0).to_owned())
    }

    /// Get the learned weights.
    pub fn weights(&self) -> Option<&Array2<f64>> {
        self.weights.as_ref()
    }

    /// Get the intercept.
    pub fn intercept(&self) -> Option<&Array1<f64>> {
        self.intercept.as_ref()
    }

    /// Check if the model is trained.
    pub fn is_trained(&self) -> bool {
        self.weights.is_some()
    }

    /// Get the configuration.
    pub fn config(&self) -> &RidgeConfig {
        &self.config
    }

    /// Compute R-squared score.
    pub fn score(&self, features: &Array2<f64>, targets: &Array2<f64>) -> QearResult<f64> {
        let predictions = self.predict(features)?;

        let target_mean = targets.mean_axis(Axis(0)).unwrap();

        let ss_res: f64 = (&predictions - targets)
            .mapv(|x| x * x)
            .sum();

        let ss_tot: f64 = targets
            .rows()
            .into_iter()
            .map(|row| {
                row.iter()
                    .zip(target_mean.iter())
                    .map(|(y, mean)| (y - mean).powi(2))
                    .sum::<f64>()
            })
            .sum();

        if ss_tot.abs() < 1e-10 {
            return Ok(1.0);
        }

        Ok(1.0 - ss_res / ss_tot)
    }
}

/// Online learning for continuous model updates.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct OnlineLearner {
    /// Learning rate.
    learning_rate: f64,
    /// Momentum coefficient.
    momentum: f64,
    /// Regularization strength.
    regularization: f64,
    /// Current weights.
    weights: Option<Array2<f64>>,
    /// Current bias.
    bias: Option<Array1<f64>>,
    /// Velocity for momentum (weights).
    weight_velocity: Option<Array2<f64>>,
    /// Velocity for momentum (bias).
    bias_velocity: Option<Array1<f64>>,
    /// Number of updates.
    n_updates: usize,
}

impl OnlineLearner {
    /// Create a new online learner.
    pub fn new(learning_rate: f64, momentum: f64, regularization: f64) -> Self {
        Self {
            learning_rate,
            momentum,
            regularization,
            weights: None,
            bias: None,
            weight_velocity: None,
            bias_velocity: None,
            n_updates: 0,
        }
    }

    /// Create with default parameters.
    pub fn default_learner() -> Self {
        Self::new(0.01, 0.9, 0.001)
    }

    /// Initialize weights for given dimensions.
    pub fn initialize(&mut self, input_dim: usize, output_dim: usize) {
        let scale = (2.0 / (input_dim + output_dim) as f64).sqrt();
        let mut rng = rand::thread_rng();
        use rand::Rng;

        let mut weights = Array2::zeros((output_dim, input_dim));
        for i in 0..output_dim {
            for j in 0..input_dim {
                weights[[i, j]] = (rng.gen::<f64>() - 0.5) * 2.0 * scale;
            }
        }

        self.weights = Some(weights);
        self.bias = Some(Array1::zeros(output_dim));
        self.weight_velocity = Some(Array2::zeros((output_dim, input_dim)));
        self.bias_velocity = Some(Array1::zeros(output_dim));
    }

    /// Update the model with a single sample.
    pub fn update(&mut self, features: &Array1<f64>, target: &Array1<f64>) -> QearResult<f64> {
        let feature_dim = features.len();
        let output_dim = target.len();

        // Initialize if needed
        if self.weights.is_none() {
            self.initialize(feature_dim, output_dim);
        }

        let weights = self.weights.as_ref().unwrap();
        let bias = self.bias.as_ref().unwrap();

        // Check dimensions
        if weights.ncols() != feature_dim {
            return Err(QearError::dimension_mismatch(weights.ncols(), feature_dim));
        }
        if weights.nrows() != output_dim {
            return Err(QearError::dimension_mismatch(weights.nrows(), output_dim));
        }

        // Forward pass
        let prediction = weights.dot(features) + bias;

        // Compute error
        let error = &prediction - target;
        let loss = error.dot(&error) / 2.0;

        // Compute gradients
        // dL/dW = error @ features.T
        let mut weight_grad = Array2::zeros(weights.raw_dim());
        for i in 0..output_dim {
            for j in 0..feature_dim {
                weight_grad[[i, j]] = error[i] * features[j] + self.regularization * weights[[i, j]];
            }
        }

        // dL/db = error
        let bias_grad = error.clone();

        // Update with momentum
        let weight_velocity = self.weight_velocity.as_mut().unwrap();
        let bias_velocity = self.bias_velocity.as_mut().unwrap();

        *weight_velocity = &*weight_velocity * self.momentum - &weight_grad * self.learning_rate;
        *bias_velocity = &*bias_velocity * self.momentum - &bias_grad * self.learning_rate;

        // Apply updates
        let weights_mut = self.weights.as_mut().unwrap();
        let bias_mut = self.bias.as_mut().unwrap();

        *weights_mut = weights_mut.clone() + weight_velocity.clone();
        *bias_mut = bias_mut.clone() + bias_velocity.clone();

        self.n_updates += 1;

        Ok(loss)
    }

    /// Update with a batch of samples.
    pub fn update_batch(
        &mut self,
        features: &Array2<f64>,
        targets: &Array2<f64>,
    ) -> QearResult<f64> {
        let n_samples = features.nrows();
        let mut total_loss = 0.0;

        for i in 0..n_samples {
            let f = features.row(i).to_owned();
            let t = targets.row(i).to_owned();
            total_loss += self.update(&f, &t)?;
        }

        Ok(total_loss / n_samples as f64)
    }

    /// Predict using current weights.
    pub fn predict(&self, features: &Array1<f64>) -> QearResult<Array1<f64>> {
        let weights = self.weights.as_ref().ok_or_else(|| {
            QearError::not_trained("Online learner not initialized")
        })?;
        let bias = self.bias.as_ref().unwrap();

        Ok(weights.dot(features) + bias)
    }

    /// Predict for a batch.
    pub fn predict_batch(&self, features: &Array2<f64>) -> QearResult<Array2<f64>> {
        let weights = self.weights.as_ref().ok_or_else(|| {
            QearError::not_trained("Online learner not initialized")
        })?;
        let bias = self.bias.as_ref().unwrap();

        let mut predictions = features.dot(&weights.t());
        for mut row in predictions.rows_mut() {
            row += bias;
        }

        Ok(predictions)
    }

    /// Get the number of updates performed.
    pub fn n_updates(&self) -> usize {
        self.n_updates
    }

    /// Get the current weights.
    pub fn weights(&self) -> Option<&Array2<f64>> {
        self.weights.as_ref()
    }

    /// Check if initialized.
    pub fn is_initialized(&self) -> bool {
        self.weights.is_some()
    }

    /// Set learning rate.
    pub fn set_learning_rate(&mut self, lr: f64) {
        self.learning_rate = lr;
    }

    /// Decay learning rate by a factor.
    pub fn decay_learning_rate(&mut self, factor: f64) {
        self.learning_rate *= factor;
    }
}

/// Hyperparameter optimizer using grid search.
#[derive(Debug, Clone)]
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
pub struct HyperparameterOptimizer {
    /// Alpha values to try.
    alpha_range: Vec<f64>,
    /// Best alpha found.
    best_alpha: Option<f64>,
    /// Best score achieved.
    best_score: Option<f64>,
    /// Number of cross-validation folds.
    n_folds: usize,
}

impl HyperparameterOptimizer {
    /// Create a new hyperparameter optimizer.
    pub fn new(alpha_range: Vec<f64>, n_folds: usize) -> Self {
        Self {
            alpha_range,
            best_alpha: None,
            best_score: None,
            n_folds,
        }
    }

    /// Create with default alpha range.
    pub fn default_optimizer() -> Self {
        Self::new(
            vec![0.001, 0.01, 0.1, 1.0, 10.0, 100.0],
            5,
        )
    }

    /// Find the best hyperparameters using cross-validation.
    pub fn optimize(
        &mut self,
        features: &Array2<f64>,
        targets: &Array2<f64>,
    ) -> QearResult<f64> {
        let n_samples = features.nrows();

        if n_samples < self.n_folds {
            return Err(QearError::insufficient_data(self.n_folds, n_samples));
        }

        let fold_size = n_samples / self.n_folds;
        let mut best_alpha = self.alpha_range[0];
        let mut best_score = f64::NEG_INFINITY;

        for &alpha in &self.alpha_range {
            let mut fold_scores = Vec::with_capacity(self.n_folds);

            for fold in 0..self.n_folds {
                let val_start = fold * fold_size;
                let val_end = if fold == self.n_folds - 1 {
                    n_samples
                } else {
                    val_start + fold_size
                };

                // Split data
                let (train_features, train_targets, val_features, val_targets) =
                    self.split_fold(features, targets, val_start, val_end)?;

                // Train model
                let config = RidgeConfig::new(alpha);
                let mut model = RidgeRegression::new(config)?;
                model.fit(&train_features, &train_targets)?;

                // Evaluate
                let score = model.score(&val_features, &val_targets)?;
                fold_scores.push(score);
            }

            // Average score across folds
            let avg_score: f64 = fold_scores.iter().sum::<f64>() / fold_scores.len() as f64;

            if avg_score > best_score {
                best_score = avg_score;
                best_alpha = alpha;
            }
        }

        self.best_alpha = Some(best_alpha);
        self.best_score = Some(best_score);

        Ok(best_alpha)
    }

    /// Split data for cross-validation.
    fn split_fold(
        &self,
        features: &Array2<f64>,
        targets: &Array2<f64>,
        val_start: usize,
        val_end: usize,
    ) -> QearResult<(Array2<f64>, Array2<f64>, Array2<f64>, Array2<f64>)> {
        let n_samples = features.nrows();
        let feature_dim = features.ncols();
        let output_dim = targets.ncols();

        let train_size = n_samples - (val_end - val_start);
        let val_size = val_end - val_start;

        let mut train_features = Array2::zeros((train_size, feature_dim));
        let mut train_targets = Array2::zeros((train_size, output_dim));
        let mut val_features = Array2::zeros((val_size, feature_dim));
        let mut val_targets = Array2::zeros((val_size, output_dim));

        let mut train_idx = 0;
        let mut val_idx = 0;

        for i in 0..n_samples {
            if i >= val_start && i < val_end {
                for j in 0..feature_dim {
                    val_features[[val_idx, j]] = features[[i, j]];
                }
                for j in 0..output_dim {
                    val_targets[[val_idx, j]] = targets[[i, j]];
                }
                val_idx += 1;
            } else {
                for j in 0..feature_dim {
                    train_features[[train_idx, j]] = features[[i, j]];
                }
                for j in 0..output_dim {
                    train_targets[[train_idx, j]] = targets[[i, j]];
                }
                train_idx += 1;
            }
        }

        Ok((train_features, train_targets, val_features, val_targets))
    }

    /// Get the best alpha found.
    pub fn best_alpha(&self) -> Option<f64> {
        self.best_alpha
    }

    /// Get the best score achieved.
    pub fn best_score(&self) -> Option<f64> {
        self.best_score
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ridge_config_default() {
        let config = RidgeConfig::default();
        assert!((config.alpha - 1.0).abs() < 1e-10);
        assert!(config.fit_intercept);
    }

    #[test]
    fn test_ridge_config_validation() {
        let config = RidgeConfig::new(-1.0);
        assert!(config.validate().is_err());

        let config = RidgeConfig::new(1.0);
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_ridge_regression_fit_predict() {
        let config = RidgeConfig::new(0.1);
        let mut model = RidgeRegression::new(config).unwrap();

        // Simple linear data: y = 2*x + 1
        let features = Array2::from_shape_vec((10, 1), (0..10).map(|i| i as f64).collect()).unwrap();
        let targets = Array2::from_shape_vec(
            (10, 1),
            (0..10).map(|i| 2.0 * i as f64 + 1.0).collect(),
        )
        .unwrap();

        model.fit(&features, &targets).unwrap();
        assert!(model.is_trained());

        let predictions = model.predict(&features).unwrap();
        assert_eq!(predictions.nrows(), 10);
        assert_eq!(predictions.ncols(), 1);

        // Should be close to original
        let mse: f64 = (&predictions - &targets)
            .mapv(|x| x * x)
            .sum()
            / 10.0;
        assert!(mse < 0.5); // Some tolerance due to regularization
    }

    #[test]
    fn test_ridge_regression_multioutput() {
        let config = RidgeConfig::new(0.01);
        let mut model = RidgeRegression::new(config).unwrap();

        let features = Array2::from_shape_fn((20, 3), |(i, j)| ((i + j) as f64 / 23.0));
        let targets = Array2::from_shape_fn((20, 2), |(i, j)| {
            features[[i, 0]] + 2.0 * features[[i, 1]] + (j as f64)
        });

        model.fit(&features, &targets).unwrap();
        let predictions = model.predict(&features).unwrap();

        assert_eq!(predictions.nrows(), 20);
        assert_eq!(predictions.ncols(), 2);
    }

    #[test]
    fn test_ridge_score() {
        let config = RidgeConfig::new(0.001);
        let mut model = RidgeRegression::new(config).unwrap();

        let features = Array2::from_shape_fn((50, 5), |(i, j)| ((i * j) as f64 / 250.0).sin());
        let targets = Array2::from_shape_fn((50, 1), |(i, _)| {
            features[[i, 0]] * 2.0 + features[[i, 1]] * 3.0
        });

        model.fit(&features, &targets).unwrap();
        let score = model.score(&features, &targets).unwrap();

        // R^2 should be close to 1 for simple linear relationship
        assert!(score > 0.9);
    }

    #[test]
    fn test_ridge_cg_solver() {
        let config = RidgeConfig::new(0.1).with_solver(RidgeSolver::ConjugateGradient);
        let mut model = RidgeRegression::new(config).unwrap();

        let features = Array2::from_shape_fn((30, 4), |(i, j)| ((i + j) as f64 / 34.0));
        let targets = Array2::from_shape_fn((30, 1), |(i, _)| features[[i, 0]] + features[[i, 2]]);

        model.fit(&features, &targets).unwrap();
        assert!(model.is_trained());
    }

    #[test]
    fn test_ridge_sgd_solver() {
        let mut config = RidgeConfig::new(0.01).with_solver(RidgeSolver::SGD);
        config.max_iterations = 500;
        let mut model = RidgeRegression::new(config).unwrap();

        let features = Array2::from_shape_fn((30, 3), |(i, j)| ((i + j) as f64 / 33.0));
        let targets = Array2::from_shape_fn((30, 1), |(i, _)| features[[i, 0]] * 2.0);

        model.fit(&features, &targets).unwrap();
        assert!(model.is_trained());
    }

    #[test]
    fn test_online_learner_update() {
        let mut learner = OnlineLearner::default_learner();

        let features = Array1::from_vec(vec![1.0, 2.0, 3.0]);
        let target = Array1::from_vec(vec![6.0]); // 1 + 2 + 3

        let loss = learner.update(&features, &target).unwrap();
        assert!(loss >= 0.0);
        assert!(learner.is_initialized());
        assert_eq!(learner.n_updates(), 1);
    }

    #[test]
    fn test_online_learner_batch() {
        let mut learner = OnlineLearner::new(0.01, 0.9, 0.001);

        let features = Array2::from_shape_fn((100, 3), |(i, j)| ((i + j) as f64 / 103.0));
        let targets = Array2::from_shape_fn((100, 1), |(i, _)| {
            features[[i, 0]] + features[[i, 1]] + features[[i, 2]]
        });

        // Train for multiple epochs
        for _ in 0..10 {
            learner.update_batch(&features, &targets).unwrap();
        }

        assert_eq!(learner.n_updates(), 1000);

        // Test prediction
        let pred = learner.predict(&features.row(0).to_owned()).unwrap();
        assert_eq!(pred.len(), 1);
    }

    #[test]
    fn test_hyperparameter_optimizer() {
        let mut optimizer = HyperparameterOptimizer::default_optimizer();

        let features = Array2::from_shape_fn((50, 5), |(i, j)| ((i * j) as f64 / 250.0));
        let targets = Array2::from_shape_fn((50, 1), |(i, _)| features[[i, 0]] * 2.0);

        let best_alpha = optimizer.optimize(&features, &targets).unwrap();

        assert!(best_alpha > 0.0);
        assert!(optimizer.best_score().is_some());
    }

    #[test]
    fn test_online_learner_predict_batch() {
        let mut learner = OnlineLearner::default_learner();
        learner.initialize(4, 2);

        let features = Array2::from_shape_fn((5, 4), |(i, j)| ((i + j) as f64 / 9.0));
        let predictions = learner.predict_batch(&features).unwrap();

        assert_eq!(predictions.nrows(), 5);
        assert_eq!(predictions.ncols(), 2);
    }

    #[test]
    fn test_learning_rate_decay() {
        let mut learner = OnlineLearner::new(0.1, 0.9, 0.001);
        learner.decay_learning_rate(0.5);

        // Learning rate should be halved
        // (This is a simple test - in practice we'd need to verify the internal state)
        assert!(learner.learning_rate - 0.05 < 1e-10);
    }
}
