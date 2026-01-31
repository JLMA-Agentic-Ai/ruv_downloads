//! Search algorithms for quantum neural architecture search.
//!
//! This module provides various search strategies for finding optimal
//! quantum circuit architectures, including random search, evolutionary
//! algorithms, and Bayesian optimization interfaces.

use crate::circuit::QuantumCircuit;
use crate::encoding::{ArchitectureEmbedding, ContinuousEncoding, DiscreteEncoding};
use crate::error::{Result, SearchError};
use crate::evaluation::{CircuitEvaluator, EvaluationConfig, EvaluationResult};
use crate::search_space::SearchSpace;
use ndarray::Array1;
use rand::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Search result containing the best architecture found.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    /// Best architecture encoding found.
    pub best_encoding: DiscreteEncoding,
    /// Evaluation result for the best architecture.
    pub best_evaluation: EvaluationResult,
    /// Number of evaluations performed.
    pub num_evaluations: usize,
    /// Search history (fitness over iterations).
    pub history: Vec<f64>,
    /// All evaluated architectures (optional, for analysis).
    pub all_evaluations: Option<Vec<(DiscreteEncoding, EvaluationResult)>>,
    /// Whether search converged.
    pub converged: bool,
    /// Reason for termination.
    pub termination_reason: String,
}

impl SearchResult {
    /// Creates a new search result.
    pub fn new(
        best_encoding: DiscreteEncoding,
        best_evaluation: EvaluationResult,
        num_evaluations: usize,
        history: Vec<f64>,
        converged: bool,
        termination_reason: String,
    ) -> Self {
        SearchResult {
            best_encoding,
            best_evaluation,
            num_evaluations,
            history,
            all_evaluations: None,
            converged,
            termination_reason,
        }
    }

    /// Enables storing all evaluations.
    pub fn with_all_evaluations(
        mut self,
        evaluations: Vec<(DiscreteEncoding, EvaluationResult)>,
    ) -> Self {
        self.all_evaluations = Some(evaluations);
        self
    }
}

/// Configuration for search algorithms.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchConfig {
    /// Maximum number of evaluations.
    pub max_evaluations: usize,
    /// Early stopping patience (iterations without improvement).
    pub patience: usize,
    /// Minimum improvement to count as progress.
    pub min_improvement: f64,
    /// Whether to store all evaluations.
    pub store_all: bool,
    /// Evaluation configuration.
    pub eval_config: EvaluationConfig,
    /// Verbose logging.
    pub verbose: bool,
}

impl Default for SearchConfig {
    fn default() -> Self {
        SearchConfig {
            max_evaluations: 100,
            patience: 20,
            min_improvement: 1e-4,
            store_all: false,
            eval_config: EvaluationConfig::fast(),
            verbose: false,
        }
    }
}

impl SearchConfig {
    /// Creates a quick search configuration.
    pub fn quick() -> Self {
        SearchConfig {
            max_evaluations: 50,
            patience: 10,
            min_improvement: 1e-3,
            store_all: false,
            eval_config: EvaluationConfig::fast(),
            verbose: false,
        }
    }

    /// Creates a thorough search configuration.
    pub fn thorough() -> Self {
        SearchConfig {
            max_evaluations: 500,
            patience: 50,
            min_improvement: 1e-5,
            store_all: true,
            eval_config: EvaluationConfig::default(),
            verbose: true,
        }
    }
}

/// Random search algorithm.
#[derive(Debug, Clone)]
pub struct RandomSearch {
    space: SearchSpace,
    config: SearchConfig,
}

impl RandomSearch {
    /// Creates a new random search.
    pub fn new(space: SearchSpace, config: SearchConfig) -> Self {
        RandomSearch { space, config }
    }

    /// Runs the search.
    pub fn search<R: Rng>(&self, rng: &mut R) -> Result<SearchResult> {
        let evaluator = CircuitEvaluator::with_config(self.config.eval_config.clone());
        let mut best_encoding: Option<DiscreteEncoding> = None;
        let mut best_eval: Option<EvaluationResult> = None;
        let mut history = Vec::new();
        let mut all_evaluations = Vec::new();
        let mut no_improvement_count = 0;

        for eval_num in 0..self.config.max_evaluations {
            // Generate random architecture
            let encoding = DiscreteEncoding::random(&self.space, rng);

            // Build and evaluate circuit
            let circuit = QuantumCircuit::from_encoding(&encoding, &self.space)?;
            let eval_result = evaluator.evaluate(&circuit, rng)?;

            let fitness = eval_result.fitness;
            history.push(fitness);

            if self.config.store_all {
                all_evaluations.push((encoding.clone(), eval_result.clone()));
            }

            // Update best
            let is_better = best_eval
                .as_ref()
                .map(|b| fitness > b.fitness + self.config.min_improvement)
                .unwrap_or(true);

            if is_better {
                best_encoding = Some(encoding);
                best_eval = Some(eval_result);
                no_improvement_count = 0;
            } else {
                no_improvement_count += 1;
            }

            // Early stopping check
            if no_improvement_count >= self.config.patience {
                let result = SearchResult::new(
                    best_encoding.unwrap(),
                    best_eval.unwrap(),
                    eval_num + 1,
                    history,
                    true,
                    format!("Early stopping after {} iterations without improvement", self.config.patience),
                );
                return Ok(if self.config.store_all {
                    result.with_all_evaluations(all_evaluations)
                } else {
                    result
                });
            }
        }

        match (best_encoding, best_eval) {
            (Some(enc), Some(eval)) => {
                let result = SearchResult::new(
                    enc,
                    eval,
                    self.config.max_evaluations,
                    history,
                    false,
                    "Budget exhausted".to_string(),
                );
                Ok(if self.config.store_all {
                    result.with_all_evaluations(all_evaluations)
                } else {
                    result
                })
            }
            _ => Err(SearchError::NoValidArchitectures.into()),
        }
    }
}

/// Evolutionary search configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionaryConfig {
    /// Population size.
    pub population_size: usize,
    /// Number of parents selected for reproduction.
    pub num_parents: usize,
    /// Mutation rate (0.0 to 1.0).
    pub mutation_rate: f64,
    /// Crossover rate (0.0 to 1.0).
    pub crossover_rate: f64,
    /// Elite count (individuals preserved without modification).
    pub elite_count: usize,
    /// Tournament size for selection.
    pub tournament_size: usize,
}

impl Default for EvolutionaryConfig {
    fn default() -> Self {
        EvolutionaryConfig {
            population_size: 20,
            num_parents: 10,
            mutation_rate: 0.1,
            crossover_rate: 0.8,
            elite_count: 2,
            tournament_size: 3,
        }
    }
}

impl EvolutionaryConfig {
    /// Validates the configuration.
    pub fn validate(&self) -> Result<()> {
        if self.population_size < 4 {
            return Err(SearchError::PopulationTooSmall(self.population_size, 4).into());
        }
        if self.mutation_rate < 0.0 || self.mutation_rate > 1.0 {
            return Err(SearchError::InvalidMutationRate(self.mutation_rate).into());
        }
        if self.elite_count >= self.population_size {
            return Err(SearchError::InvalidConfiguration(
                "Elite count must be less than population size".to_string(),
            )
            .into());
        }
        Ok(())
    }
}

/// Individual in the evolutionary population.
#[derive(Debug, Clone)]
struct Individual {
    encoding: DiscreteEncoding,
    fitness: f64,
    evaluation: Option<EvaluationResult>,
}

impl Individual {
    fn new(encoding: DiscreteEncoding) -> Self {
        Individual {
            encoding,
            fitness: f64::NEG_INFINITY,
            evaluation: None,
        }
    }

    fn with_evaluation(mut self, eval: EvaluationResult) -> Self {
        self.fitness = eval.fitness;
        self.evaluation = Some(eval);
        self
    }
}

/// Evolutionary search algorithm.
#[derive(Debug, Clone)]
pub struct EvolutionarySearch {
    space: SearchSpace,
    config: SearchConfig,
    evo_config: EvolutionaryConfig,
}

impl EvolutionarySearch {
    /// Creates a new evolutionary search.
    pub fn new(
        space: SearchSpace,
        config: SearchConfig,
        evo_config: EvolutionaryConfig,
    ) -> Result<Self> {
        evo_config.validate()?;
        Ok(EvolutionarySearch {
            space,
            config,
            evo_config,
        })
    }

    /// Runs the evolutionary search.
    pub fn search<R: Rng>(&self, rng: &mut R) -> Result<SearchResult> {
        let evaluator = CircuitEvaluator::with_config(self.config.eval_config.clone());
        let mut eval_count = 0;
        let mut history = Vec::new();
        let mut all_evaluations = Vec::new();
        let mut no_improvement_count = 0;
        let mut best_fitness = f64::NEG_INFINITY;

        // Initialize population
        let mut population: Vec<Individual> = (0..self.evo_config.population_size)
            .map(|_| Individual::new(DiscreteEncoding::random(&self.space, rng)))
            .collect();

        // Evaluate initial population
        for ind in &mut population {
            let circuit = QuantumCircuit::from_encoding(&ind.encoding, &self.space)?;
            let eval = evaluator.evaluate(&circuit, rng)?;
            eval_count += 1;

            if self.config.store_all {
                all_evaluations.push((ind.encoding.clone(), eval.clone()));
            }

            *ind = ind.clone().with_evaluation(eval);
        }

        // Sort by fitness
        population.sort_by(|a, b| b.fitness.partial_cmp(&a.fitness).unwrap());

        // Evolution loop
        while eval_count < self.config.max_evaluations {
            let current_best = population[0].fitness;
            history.push(current_best);

            // Check for improvement
            if current_best > best_fitness + self.config.min_improvement {
                best_fitness = current_best;
                no_improvement_count = 0;
            } else {
                no_improvement_count += 1;
            }

            // Early stopping
            if no_improvement_count >= self.config.patience {
                break;
            }

            // Create next generation
            let mut next_gen = Vec::with_capacity(self.evo_config.population_size);

            // Elitism: keep best individuals
            for i in 0..self.evo_config.elite_count.min(population.len()) {
                next_gen.push(population[i].clone());
            }

            // Fill rest with offspring
            while next_gen.len() < self.evo_config.population_size {
                // Tournament selection
                let parent1 = self.tournament_select(&population, rng);
                let parent2 = self.tournament_select(&population, rng);

                // Crossover
                let mut child_encoding = if rng.gen::<f64>() < self.evo_config.crossover_rate {
                    parent1.encoding.crossover(&parent2.encoding, rng)
                } else {
                    parent1.encoding.clone()
                };

                // Mutation
                child_encoding.mutate(&self.space, self.evo_config.mutation_rate, rng);

                // Evaluate
                let circuit = QuantumCircuit::from_encoding(&child_encoding, &self.space)?;
                let eval = evaluator.evaluate(&circuit, rng)?;
                eval_count += 1;

                if self.config.store_all {
                    all_evaluations.push((child_encoding.clone(), eval.clone()));
                }

                next_gen.push(Individual::new(child_encoding).with_evaluation(eval));

                if eval_count >= self.config.max_evaluations {
                    break;
                }
            }

            // Sort and update population
            next_gen.sort_by(|a, b| b.fitness.partial_cmp(&a.fitness).unwrap());
            population = next_gen;
        }

        // Return best individual
        let best = &population[0];
        let converged = no_improvement_count >= self.config.patience;
        let termination_reason = if converged {
            format!("Converged after {} evaluations", eval_count)
        } else {
            format!("Budget exhausted after {} evaluations", eval_count)
        };

        let result = SearchResult::new(
            best.encoding.clone(),
            best.evaluation.clone().unwrap(),
            eval_count,
            history,
            converged,
            termination_reason,
        );

        Ok(if self.config.store_all {
            result.with_all_evaluations(all_evaluations)
        } else {
            result
        })
    }

    fn tournament_select<'a, R: Rng>(
        &self,
        population: &'a [Individual],
        rng: &mut R,
    ) -> &'a Individual {
        let mut best: Option<&Individual> = None;

        for _ in 0..self.evo_config.tournament_size {
            let idx = rng.gen_range(0..population.len());
            let candidate = &population[idx];

            if best
                .map(|b| candidate.fitness > b.fitness)
                .unwrap_or(true)
            {
                best = Some(candidate);
            }
        }

        best.unwrap()
    }
}

/// Regularized evolution (aging-based) configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegularizedEvolutionConfig {
    /// Population size.
    pub population_size: usize,
    /// Sample size for parent selection.
    pub sample_size: usize,
    /// Mutation rate.
    pub mutation_rate: f64,
}

impl Default for RegularizedEvolutionConfig {
    fn default() -> Self {
        RegularizedEvolutionConfig {
            population_size: 100,
            sample_size: 25,
            mutation_rate: 0.1,
        }
    }
}

/// Regularized evolution search (as used in NASNet).
#[derive(Debug, Clone)]
pub struct RegularizedEvolution {
    space: SearchSpace,
    config: SearchConfig,
    reg_config: RegularizedEvolutionConfig,
}

impl RegularizedEvolution {
    /// Creates a new regularized evolution search.
    pub fn new(
        space: SearchSpace,
        config: SearchConfig,
        reg_config: RegularizedEvolutionConfig,
    ) -> Self {
        RegularizedEvolution {
            space,
            config,
            reg_config,
        }
    }

    /// Runs the search.
    pub fn search<R: Rng>(&self, rng: &mut R) -> Result<SearchResult> {
        let evaluator = CircuitEvaluator::with_config(self.config.eval_config.clone());
        let mut eval_count = 0;
        let mut history = Vec::new();
        let mut all_evaluations = Vec::new();
        let mut no_improvement_count = 0;
        let mut best_fitness = f64::NEG_INFINITY;
        let mut best_encoding: Option<DiscreteEncoding> = None;
        let mut best_eval: Option<EvaluationResult> = None;

        // Initialize population (FIFO queue)
        let mut population: Vec<Individual> = Vec::with_capacity(self.reg_config.population_size);

        // Fill initial population
        while population.len() < self.reg_config.population_size
            && eval_count < self.config.max_evaluations
        {
            let encoding = DiscreteEncoding::random(&self.space, rng);
            let circuit = QuantumCircuit::from_encoding(&encoding, &self.space)?;
            let eval = evaluator.evaluate(&circuit, rng)?;
            eval_count += 1;

            if self.config.store_all {
                all_evaluations.push((encoding.clone(), eval.clone()));
            }

            let fitness = eval.fitness;
            if fitness > best_fitness {
                best_fitness = fitness;
                best_encoding = Some(encoding.clone());
                best_eval = Some(eval.clone());
            }

            population.push(Individual::new(encoding).with_evaluation(eval));
        }

        // Main loop
        while eval_count < self.config.max_evaluations {
            history.push(best_fitness);

            // Sample random subset
            let sample_indices: Vec<usize> = (0..population.len())
                .collect::<Vec<_>>()
                .choose_multiple(rng, self.reg_config.sample_size.min(population.len()))
                .cloned()
                .collect();

            // Find best in sample
            let parent_idx = sample_indices
                .iter()
                .max_by(|&&a, &&b| {
                    population[a]
                        .fitness
                        .partial_cmp(&population[b].fitness)
                        .unwrap()
                })
                .copied()
                .unwrap();

            // Mutate
            let mut child_encoding = population[parent_idx].encoding.clone();
            child_encoding.mutate(&self.space, self.reg_config.mutation_rate, rng);

            // Evaluate
            let circuit = QuantumCircuit::from_encoding(&child_encoding, &self.space)?;
            let eval = evaluator.evaluate(&circuit, rng)?;
            eval_count += 1;

            if self.config.store_all {
                all_evaluations.push((child_encoding.clone(), eval.clone()));
            }

            let fitness = eval.fitness;

            // Update best
            if fitness > best_fitness + self.config.min_improvement {
                best_fitness = fitness;
                best_encoding = Some(child_encoding.clone());
                best_eval = Some(eval.clone());
                no_improvement_count = 0;
            } else {
                no_improvement_count += 1;
            }

            // Add child and remove oldest
            population.push(Individual::new(child_encoding).with_evaluation(eval));
            if population.len() > self.reg_config.population_size {
                population.remove(0); // Remove oldest (FIFO)
            }

            // Early stopping
            if no_improvement_count >= self.config.patience {
                break;
            }
        }

        match (best_encoding, best_eval) {
            (Some(enc), Some(eval)) => {
                let converged = no_improvement_count >= self.config.patience;
                let result = SearchResult::new(
                    enc,
                    eval,
                    eval_count,
                    history,
                    converged,
                    if converged {
                        "Converged".to_string()
                    } else {
                        "Budget exhausted".to_string()
                    },
                );
                Ok(if self.config.store_all {
                    result.with_all_evaluations(all_evaluations)
                } else {
                    result
                })
            }
            _ => Err(SearchError::NoValidArchitectures.into()),
        }
    }
}

/// Bayesian optimization interface for architecture search.
#[derive(Debug, Clone)]
pub struct BayesianOptimization {
    space: SearchSpace,
    config: SearchConfig,
    /// Observed architectures and their fitness values.
    observations: Vec<(DiscreteEncoding, f64)>,
    /// Embedding dimension for architecture representation.
    embedding_dim: usize,
}

impl BayesianOptimization {
    /// Creates a new Bayesian optimization interface.
    pub fn new(space: SearchSpace, config: SearchConfig, embedding_dim: usize) -> Self {
        BayesianOptimization {
            space,
            config,
            observations: Vec::new(),
            embedding_dim,
        }
    }

    /// Suggests the next architecture to evaluate using acquisition function.
    pub fn suggest<R: Rng>(&self, rng: &mut R) -> Result<DiscreteEncoding> {
        if self.observations.len() < 10 {
            // Not enough data, use random
            return Ok(DiscreteEncoding::random(&self.space, rng));
        }

        // Use expected improvement acquisition function (simplified)
        let mut best_candidate: Option<DiscreteEncoding> = None;
        let mut best_ei = f64::NEG_INFINITY;
        let best_observed = self
            .observations
            .iter()
            .map(|(_, f)| *f)
            .fold(f64::NEG_INFINITY, f64::max);

        // Generate and evaluate candidates
        for _ in 0..100 {
            let candidate = DiscreteEncoding::random(&self.space, rng);
            let ei = self.expected_improvement(&candidate, best_observed);

            if ei > best_ei {
                best_ei = ei;
                best_candidate = Some(candidate);
            }
        }

        best_candidate.ok_or_else(|| SearchError::NoValidArchitectures.into())
    }

    /// Updates the model with a new observation.
    pub fn observe(&mut self, encoding: DiscreteEncoding, fitness: f64) {
        self.observations.push((encoding, fitness));
    }

    /// Computes expected improvement for a candidate.
    fn expected_improvement(&self, candidate: &DiscreteEncoding, best_observed: f64) -> f64 {
        // Simplified EI computation using nearest neighbor surrogate
        let candidate_emb =
            ArchitectureEmbedding::from_discrete(candidate, &self.space, self.embedding_dim);

        let candidate_emb = match candidate_emb {
            Ok(emb) => emb,
            Err(_) => return 0.0,
        };

        // Find similar architectures
        let mut similarities: Vec<(f64, f64)> = Vec::new();

        for (obs_enc, obs_fitness) in &self.observations {
            if let Ok(obs_emb) =
                ArchitectureEmbedding::from_discrete(obs_enc, &self.space, self.embedding_dim)
            {
                let sim = candidate_emb.cosine_similarity(&obs_emb);
                if sim > 0.5 {
                    similarities.push((sim, *obs_fitness));
                }
            }
        }

        if similarities.is_empty() {
            // High uncertainty, encourage exploration
            return 1.0;
        }

        // Weighted average prediction
        let total_weight: f64 = similarities.iter().map(|(s, _)| s).sum();
        let predicted = similarities.iter().map(|(s, f)| s * f).sum::<f64>() / total_weight;

        // Estimate uncertainty as inverse of similarity
        let avg_similarity = total_weight / similarities.len() as f64;
        let uncertainty = 1.0 - avg_similarity;

        // Expected improvement: max(0, predicted - best) + exploration_bonus
        let improvement = (predicted - best_observed).max(0.0);
        let exploration_bonus = 0.1 * uncertainty;

        improvement + exploration_bonus
    }

    /// Runs the full Bayesian optimization search.
    pub fn search<R: Rng>(&mut self, rng: &mut R) -> Result<SearchResult> {
        let evaluator = CircuitEvaluator::with_config(self.config.eval_config.clone());
        let mut history = Vec::new();
        let mut all_evaluations = Vec::new();
        let mut no_improvement_count = 0;
        let mut best_fitness = f64::NEG_INFINITY;

        for eval_num in 0..self.config.max_evaluations {
            // Get next suggestion
            let encoding = self.suggest(rng)?;

            // Evaluate
            let circuit = QuantumCircuit::from_encoding(&encoding, &self.space)?;
            let eval = evaluator.evaluate(&circuit, rng)?;

            let fitness = eval.fitness;
            history.push(fitness);

            if self.config.store_all {
                all_evaluations.push((encoding.clone(), eval.clone()));
            }

            // Update model
            self.observe(encoding, fitness);

            // Track best
            if fitness > best_fitness + self.config.min_improvement {
                best_fitness = fitness;
                no_improvement_count = 0;
            } else {
                no_improvement_count += 1;
            }

            // Early stopping
            if no_improvement_count >= self.config.patience {
                break;
            }
        }

        // Find best observation
        let best_idx = self
            .observations
            .iter()
            .enumerate()
            .max_by(|a, b| a.1 .1.partial_cmp(&b.1 .1).unwrap())
            .map(|(i, _)| i)
            .ok_or(SearchError::NoValidArchitectures)?;

        let (best_enc, best_fit) = &self.observations[best_idx];

        // Re-evaluate to get full result
        let circuit = QuantumCircuit::from_encoding(best_enc, &self.space)?;
        let best_eval = evaluator.evaluate(&circuit, rng)?;

        let converged = no_improvement_count >= self.config.patience;
        let result = SearchResult::new(
            best_enc.clone(),
            best_eval,
            self.observations.len(),
            history,
            converged,
            if converged {
                "Converged".to_string()
            } else {
                "Budget exhausted".to_string()
            },
        );

        Ok(if self.config.store_all {
            result.with_all_evaluations(all_evaluations)
        } else {
            result
        })
    }
}

/// Differentiable architecture search using continuous relaxation.
#[derive(Debug, Clone)]
pub struct DifferentiableSearch {
    space: SearchSpace,
    config: SearchConfig,
    /// Learning rate for architecture parameters.
    arch_learning_rate: f64,
    /// Number of samples per update.
    samples_per_update: usize,
}

impl DifferentiableSearch {
    /// Creates a new differentiable search.
    pub fn new(space: SearchSpace, config: SearchConfig) -> Self {
        DifferentiableSearch {
            space,
            config,
            arch_learning_rate: 0.1,
            samples_per_update: 5,
        }
    }

    /// Sets the architecture learning rate.
    pub fn with_learning_rate(mut self, lr: f64) -> Self {
        self.arch_learning_rate = lr;
        self
    }

    /// Sets samples per update.
    pub fn with_samples_per_update(mut self, samples: usize) -> Self {
        self.samples_per_update = samples;
        self
    }

    /// Runs the differentiable search.
    pub fn search<R: Rng>(&self, rng: &mut R) -> Result<SearchResult> {
        let evaluator = CircuitEvaluator::with_config(self.config.eval_config.clone());
        let mut continuous = ContinuousEncoding::random(&self.space, rng);
        let mut history = Vec::new();
        let mut all_evaluations = Vec::new();
        let mut eval_count = 0;
        let mut no_improvement_count = 0;
        let mut best_fitness = f64::NEG_INFINITY;
        let mut best_encoding: Option<DiscreteEncoding> = None;
        let mut best_eval: Option<EvaluationResult> = None;

        while eval_count < self.config.max_evaluations {
            // Sample multiple architectures
            let mut sample_results: Vec<(DiscreteEncoding, f64)> = Vec::new();

            for _ in 0..self.samples_per_update {
                if eval_count >= self.config.max_evaluations {
                    break;
                }

                let encoding = continuous.sample(&self.space, rng);
                let circuit = QuantumCircuit::from_encoding(&encoding, &self.space)?;
                let eval = evaluator.evaluate(&circuit, rng)?;
                eval_count += 1;

                let fitness = eval.fitness;
                history.push(fitness);

                if self.config.store_all {
                    all_evaluations.push((encoding.clone(), eval.clone()));
                }

                // Track best
                if fitness > best_fitness {
                    if fitness > best_fitness + self.config.min_improvement {
                        no_improvement_count = 0;
                    }
                    best_fitness = fitness;
                    best_encoding = Some(encoding.clone());
                    best_eval = Some(eval);
                } else {
                    no_improvement_count += 1;
                }

                sample_results.push((encoding, fitness));
            }

            // Update continuous encoding based on samples
            let mean_fitness: f64 =
                sample_results.iter().map(|(_, f)| f).sum::<f64>() / sample_results.len() as f64;

            for (encoding, fitness) in &sample_results {
                // Reward architectures above mean, penalize below
                let advantage = fitness - mean_fitness;
                continuous.update(encoding, advantage, self.arch_learning_rate);
            }

            // Early stopping
            if no_improvement_count >= self.config.patience {
                break;
            }
        }

        match (best_encoding, best_eval) {
            (Some(enc), Some(eval)) => {
                let converged = no_improvement_count >= self.config.patience;
                let result = SearchResult::new(
                    enc,
                    eval,
                    eval_count,
                    history,
                    converged,
                    if converged {
                        "Converged".to_string()
                    } else {
                        "Budget exhausted".to_string()
                    },
                );
                Ok(if self.config.store_all {
                    result.with_all_evaluations(all_evaluations)
                } else {
                    result
                })
            }
            _ => Err(SearchError::NoValidArchitectures.into()),
        }
    }
}

/// Unified search interface.
#[derive(Debug, Clone)]
pub enum SearchAlgorithm {
    Random(RandomSearch),
    Evolutionary(EvolutionarySearch),
    RegularizedEvolution(RegularizedEvolution),
    Bayesian(BayesianOptimization),
    Differentiable(DifferentiableSearch),
}

impl SearchAlgorithm {
    /// Creates a random search.
    pub fn random(space: SearchSpace, config: SearchConfig) -> Self {
        SearchAlgorithm::Random(RandomSearch::new(space, config))
    }

    /// Creates an evolutionary search.
    pub fn evolutionary(
        space: SearchSpace,
        config: SearchConfig,
        evo_config: EvolutionaryConfig,
    ) -> Result<Self> {
        Ok(SearchAlgorithm::Evolutionary(EvolutionarySearch::new(
            space, config, evo_config,
        )?))
    }

    /// Creates a regularized evolution search.
    pub fn regularized_evolution(
        space: SearchSpace,
        config: SearchConfig,
        reg_config: RegularizedEvolutionConfig,
    ) -> Self {
        SearchAlgorithm::RegularizedEvolution(RegularizedEvolution::new(space, config, reg_config))
    }

    /// Creates a Bayesian optimization search.
    pub fn bayesian(space: SearchSpace, config: SearchConfig, embedding_dim: usize) -> Self {
        SearchAlgorithm::Bayesian(BayesianOptimization::new(space, config, embedding_dim))
    }

    /// Creates a differentiable search.
    pub fn differentiable(space: SearchSpace, config: SearchConfig) -> Self {
        SearchAlgorithm::Differentiable(DifferentiableSearch::new(space, config))
    }

    /// Runs the search algorithm.
    pub fn search<R: Rng>(&mut self, rng: &mut R) -> Result<SearchResult> {
        match self {
            SearchAlgorithm::Random(s) => s.search(rng),
            SearchAlgorithm::Evolutionary(s) => s.search(rng),
            SearchAlgorithm::RegularizedEvolution(s) => s.search(rng),
            SearchAlgorithm::Bayesian(s) => s.search(rng),
            SearchAlgorithm::Differentiable(s) => s.search(rng),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::SeedableRng;
    use rand_chacha::ChaCha8Rng;

    fn test_space() -> SearchSpace {
        SearchSpace::hardware_efficient(3, 3).unwrap()
    }

    #[test]
    fn test_search_config_presets() {
        let quick = SearchConfig::quick();
        assert!(quick.max_evaluations < SearchConfig::default().max_evaluations);

        let thorough = SearchConfig::thorough();
        assert!(thorough.max_evaluations > SearchConfig::default().max_evaluations);
    }

    #[test]
    fn test_random_search() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let space = test_space();
        let config = SearchConfig::quick();

        let search = RandomSearch::new(space, config);
        let result = search.search(&mut rng).unwrap();

        assert!(result.num_evaluations > 0);
        assert!(!result.history.is_empty());
        assert!(result.best_evaluation.fitness.is_finite());
    }

    #[test]
    fn test_evolutionary_config_validation() {
        let valid_config = EvolutionaryConfig::default();
        assert!(valid_config.validate().is_ok());

        let invalid_config = EvolutionaryConfig {
            population_size: 2,
            ..Default::default()
        };
        assert!(invalid_config.validate().is_err());

        let invalid_mutation = EvolutionaryConfig {
            mutation_rate: 1.5,
            ..Default::default()
        };
        assert!(invalid_mutation.validate().is_err());
    }

    #[test]
    fn test_evolutionary_search() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let space = test_space();
        let config = SearchConfig::quick();
        let evo_config = EvolutionaryConfig {
            population_size: 10,
            num_parents: 5,
            ..Default::default()
        };

        let search = EvolutionarySearch::new(space, config, evo_config).unwrap();
        let result = search.search(&mut rng).unwrap();

        assert!(result.num_evaluations > 0);
        assert!(result.best_evaluation.fitness.is_finite());
    }

    #[test]
    fn test_regularized_evolution() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let space = test_space();
        let config = SearchConfig::quick();
        let reg_config = RegularizedEvolutionConfig {
            population_size: 20,
            sample_size: 5,
            mutation_rate: 0.1,
        };

        let search = RegularizedEvolution::new(space, config, reg_config);
        let result = search.search(&mut rng).unwrap();

        assert!(result.num_evaluations > 0);
    }

    #[test]
    fn test_bayesian_optimization() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let space = test_space();
        let config = SearchConfig::quick();

        let mut search = BayesianOptimization::new(space, config, 16);

        // Initial suggestions should be random
        let suggestion = search.suggest(&mut rng).unwrap();
        assert!(suggestion.validate(&test_space()).is_ok());

        // After observations, should use surrogate
        for _ in 0..15 {
            let enc = DiscreteEncoding::random(&test_space(), &mut rng);
            search.observe(enc, rng.gen_range(-1.0..1.0));
        }

        let informed_suggestion = search.suggest(&mut rng).unwrap();
        assert!(informed_suggestion.validate(&test_space()).is_ok());
    }

    #[test]
    fn test_bayesian_search() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let space = test_space();
        let config = SearchConfig::quick();

        let mut search = BayesianOptimization::new(space, config, 16);
        let result = search.search(&mut rng).unwrap();

        assert!(result.num_evaluations > 0);
    }

    #[test]
    fn test_differentiable_search() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let space = test_space();
        let config = SearchConfig::quick();

        let search = DifferentiableSearch::new(space, config)
            .with_learning_rate(0.05)
            .with_samples_per_update(3);

        let result = search.search(&mut rng).unwrap();

        assert!(result.num_evaluations > 0);
    }

    #[test]
    fn test_unified_search_interface() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let space = test_space();
        let config = SearchConfig::quick();

        let mut alg = SearchAlgorithm::random(space, config);
        let result = alg.search(&mut rng).unwrap();

        assert!(result.num_evaluations > 0);
    }

    #[test]
    fn test_search_result() {
        let encoding = DiscreteEncoding::new(2, vec![0, 1], vec![vec![0, 1, 2]], vec![0, 1]);
        let eval = EvaluationResult::new(
            0.1,
            0.8,
            0.6,
            crate::evaluation::HardwareCost {
                gate_count: 10,
                two_qubit_gates: 4,
                depth: 3,
                num_parameters: 8,
                estimated_time: 46.0,
            },
        );

        let result = SearchResult::new(
            encoding,
            eval,
            50,
            vec![0.1, 0.2, 0.3],
            true,
            "Test".to_string(),
        );

        assert_eq!(result.num_evaluations, 50);
        assert!(result.converged);
    }

    #[test]
    fn test_early_stopping() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let space = test_space();
        let config = SearchConfig {
            max_evaluations: 1000,
            patience: 5,
            min_improvement: 100.0, // Impossible improvement threshold
            ..SearchConfig::quick()
        };

        let search = RandomSearch::new(space, config);
        let result = search.search(&mut rng).unwrap();

        // Should stop early due to no improvement
        assert!(result.num_evaluations < 1000);
        assert!(result.converged);
    }

    #[test]
    fn test_store_all_evaluations() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let space = test_space();
        let config = SearchConfig {
            max_evaluations: 20,
            store_all: true,
            ..SearchConfig::quick()
        };

        let search = RandomSearch::new(space, config);
        let result = search.search(&mut rng).unwrap();

        assert!(result.all_evaluations.is_some());
        assert!(!result.all_evaluations.as_ref().unwrap().is_empty());
    }
}
