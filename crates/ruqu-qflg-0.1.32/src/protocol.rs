//! Federated Learning Protocol
//!
//! This module provides the federated learning protocol implementation including
//! client registration, key exchange, round management, and model synchronization.
//!
//! ## Protocol Flow
//!
//! 1. Clients register with the coordinator
//! 2. Key exchange for secure communication
//! 3. Training rounds:
//!    - Coordinator broadcasts global model
//!    - Clients train locally and submit gradients
//!    - Coordinator aggregates with Byzantine tolerance
//!    - Privacy mechanism applied to aggregate
//! 4. Model synchronization after each round
//!
//! ## Example
//!
//! ```rust
//! use ruqu_qflg::protocol::{FederatedCoordinator, CoordinatorConfig, ClientInfo};
//!
//! let config = CoordinatorConfig::default();
//! let mut coordinator = FederatedCoordinator::new(config);
//!
//! // Register clients
//! let client = ClientInfo::new("client_1".to_string(), vec![0u8; 32]);
//! coordinator.register_client(client).unwrap();
//! ```

use std::collections::HashMap;
use chrono::{DateTime, Utc};
use ndarray::Array1;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::aggregation::{AggregatorConfig, GradientAggregator, WeightedAverageAggregator};
use crate::byzantine::{ByzantineDetector, DetectorConfig, KrumDetector};
use crate::error::{ProtocolError, Result};
use crate::privacy::{GaussianMechanism, PrivacyBudget, PrivacyConfig, PrivacyMechanism};

/// Configuration for the federated coordinator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoordinatorConfig {
    /// Minimum number of clients to start a round
    pub min_clients: usize,
    /// Maximum clients per round
    pub max_clients: usize,
    /// Round timeout in milliseconds
    pub round_timeout_ms: u64,
    /// Enable Byzantine tolerance
    pub byzantine_enabled: bool,
    /// Byzantine tolerance fraction
    pub byzantine_fraction: f64,
    /// Enable differential privacy
    pub privacy_enabled: bool,
    /// Privacy epsilon per round
    pub privacy_epsilon: f64,
    /// Privacy delta
    pub privacy_delta: f64,
    /// Maximum privacy budget
    pub max_privacy_budget: f64,
    /// Model dimension
    pub model_dimension: usize,
}

impl Default for CoordinatorConfig {
    fn default() -> Self {
        Self {
            min_clients: 3,
            max_clients: 100,
            round_timeout_ms: 60000,
            byzantine_enabled: true,
            byzantine_fraction: 0.3,
            privacy_enabled: true,
            privacy_epsilon: 1.0,
            privacy_delta: 1e-5,
            max_privacy_budget: 10.0,
            model_dimension: 1000,
        }
    }
}

/// Client information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientInfo {
    /// Unique client identifier
    pub client_id: String,
    /// Client's public key for secure communication
    pub public_key: Vec<u8>,
    /// Registration timestamp
    pub registered_at: DateTime<Utc>,
    /// Last seen timestamp
    pub last_seen: DateTime<Utc>,
    /// Number of rounds participated
    pub rounds_participated: u64,
    /// Data contribution weight
    pub weight: f64,
    /// Is client active
    pub active: bool,
}

impl ClientInfo {
    /// Create a new client info
    pub fn new(client_id: String, public_key: Vec<u8>) -> Self {
        let now = Utc::now();
        Self {
            client_id,
            public_key,
            registered_at: now,
            last_seen: now,
            rounds_participated: 0,
            weight: 1.0,
            active: true,
        }
    }

    /// Update last seen timestamp
    pub fn touch(&mut self) {
        self.last_seen = Utc::now();
    }
}

/// Round state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RoundState {
    /// Waiting for clients
    Waiting,
    /// Round in progress, collecting gradients
    Collecting,
    /// Aggregating gradients
    Aggregating,
    /// Round completed
    Completed,
    /// Round failed
    Failed,
}

impl std::fmt::Display for RoundState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RoundState::Waiting => write!(f, "Waiting"),
            RoundState::Collecting => write!(f, "Collecting"),
            RoundState::Aggregating => write!(f, "Aggregating"),
            RoundState::Completed => write!(f, "Completed"),
            RoundState::Failed => write!(f, "Failed"),
        }
    }
}

/// Information about a training round
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoundInfo {
    /// Round number
    pub round_number: u64,
    /// Round unique ID
    pub round_id: String,
    /// Current state
    pub state: RoundState,
    /// Round start time
    pub started_at: DateTime<Utc>,
    /// Round end time
    pub ended_at: Option<DateTime<Utc>>,
    /// Participating clients
    pub participants: Vec<String>,
    /// Gradients received
    pub gradients_received: usize,
    /// Byzantine clients detected
    pub byzantine_detected: Vec<String>,
    /// Privacy epsilon spent this round
    pub privacy_spent: f64,
}

impl RoundInfo {
    /// Create a new round
    pub fn new(round_number: u64) -> Self {
        Self {
            round_number,
            round_id: Uuid::new_v4().to_string(),
            state: RoundState::Waiting,
            started_at: Utc::now(),
            ended_at: None,
            participants: Vec::new(),
            gradients_received: 0,
            byzantine_detected: Vec::new(),
            privacy_spent: 0.0,
        }
    }
}

/// Gradient submission from a client
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradientSubmission {
    /// Client ID
    pub client_id: String,
    /// Round ID
    pub round_id: String,
    /// Gradient data
    pub gradient: Array1<f64>,
    /// Data weight (number of samples)
    pub weight: f64,
    /// Signature
    pub signature: Vec<u8>,
    /// Submission timestamp
    pub submitted_at: DateTime<Utc>,
}

/// Federated learning coordinator
pub struct FederatedCoordinator {
    config: CoordinatorConfig,
    /// Registered clients
    clients: RwLock<HashMap<String, ClientInfo>>,
    /// Current round information
    current_round: RwLock<Option<RoundInfo>>,
    /// Round history
    round_history: RwLock<Vec<RoundInfo>>,
    /// Current global model
    global_model: RwLock<Array1<f64>>,
    /// Submitted gradients for current round
    gradients: RwLock<Vec<GradientSubmission>>,
    /// Privacy budget tracker
    privacy_budget: RwLock<PrivacyBudget>,
}

impl FederatedCoordinator {
    /// Create a new federated coordinator
    pub fn new(config: CoordinatorConfig) -> Self {
        let privacy_budget = PrivacyBudget::new(config.max_privacy_budget, config.privacy_delta);
        let global_model = Array1::zeros(config.model_dimension);

        Self {
            config,
            clients: RwLock::new(HashMap::new()),
            current_round: RwLock::new(None),
            round_history: RwLock::new(Vec::new()),
            global_model: RwLock::new(global_model),
            gradients: RwLock::new(Vec::new()),
            privacy_budget: RwLock::new(privacy_budget),
        }
    }

    /// Register a new client
    pub fn register_client(&self, client: ClientInfo) -> Result<()> {
        let mut clients = self.clients.write();

        if clients.contains_key(&client.client_id) {
            return Err(ProtocolError::DuplicateClient(client.client_id).into());
        }

        clients.insert(client.client_id.clone(), client);
        Ok(())
    }

    /// Unregister a client
    pub fn unregister_client(&self, client_id: &str) -> Result<()> {
        let mut clients = self.clients.write();

        if clients.remove(client_id).is_none() {
            return Err(ProtocolError::ClientNotRegistered(client_id.to_string()).into());
        }

        Ok(())
    }

    /// Get client information
    pub fn get_client(&self, client_id: &str) -> Option<ClientInfo> {
        self.clients.read().get(client_id).cloned()
    }

    /// List all registered clients
    pub fn list_clients(&self) -> Vec<ClientInfo> {
        self.clients.read().values().cloned().collect()
    }

    /// Get number of active clients
    pub fn active_client_count(&self) -> usize {
        self.clients.read().values().filter(|c| c.active).count()
    }

    /// Start a new training round
    pub fn start_round(&self) -> Result<RoundInfo> {
        let mut current = self.current_round.write();

        if let Some(ref round) = *current {
            if round.state != RoundState::Completed && round.state != RoundState::Failed {
                return Err(ProtocolError::RoundInProgress(round.round_number).into());
            }
        }

        let round_number = self.round_history.read().len() as u64 + 1;
        let mut round = RoundInfo::new(round_number);
        round.state = RoundState::Collecting;

        // Clear gradients
        self.gradients.write().clear();

        let round_info = round.clone();
        *current = Some(round);

        Ok(round_info)
    }

    /// Submit a gradient for the current round
    pub fn submit_gradient(&self, submission: GradientSubmission) -> Result<()> {
        // Verify client is registered
        {
            let clients = self.clients.read();
            if !clients.contains_key(&submission.client_id) {
                return Err(ProtocolError::ClientNotRegistered(submission.client_id.clone()).into());
            }
        }

        // Verify round is active
        {
            let current = self.current_round.read();
            match current.as_ref() {
                None => return Err(ProtocolError::NoActiveRound.into()),
                Some(round) => {
                    if round.state != RoundState::Collecting {
                        return Err(ProtocolError::InvalidStateTransition {
                            from: round.state.to_string(),
                            to: "Collecting".to_string(),
                        }
                        .into());
                    }
                    if submission.round_id != round.round_id {
                        return Err(ProtocolError::NoActiveRound.into());
                    }
                }
            }
        }

        // Add gradient
        let mut gradients = self.gradients.write();
        gradients.push(submission.clone());

        // Update round info
        {
            let mut current = self.current_round.write();
            if let Some(ref mut round) = *current {
                round.gradients_received = gradients.len();
                if !round.participants.contains(&submission.client_id) {
                    round.participants.push(submission.client_id.clone());
                }
            }
        }

        // Update client
        {
            let mut clients = self.clients.write();
            if let Some(client) = clients.get_mut(&submission.client_id) {
                client.touch();
            }
        }

        Ok(())
    }

    /// Complete the current round and compute aggregate
    pub fn complete_round(&self) -> Result<Array1<f64>> {
        // Check round state
        {
            let mut current = self.current_round.write();
            match current.as_mut() {
                None => return Err(ProtocolError::NoActiveRound.into()),
                Some(round) => {
                    if round.state != RoundState::Collecting {
                        return Err(ProtocolError::InvalidStateTransition {
                            from: round.state.to_string(),
                            to: "Aggregating".to_string(),
                        }
                        .into());
                    }
                    round.state = RoundState::Aggregating;
                }
            }
        }

        let gradients = self.gradients.read();
        let submissions: Vec<_> = gradients.iter().collect();

        if submissions.is_empty() {
            let mut current = self.current_round.write();
            if let Some(ref mut round) = *current {
                round.state = RoundState::Failed;
                round.ended_at = Some(Utc::now());
            }
            return Err(ProtocolError::NoActiveRound.into());
        }

        // Extract gradients and weights
        let gradient_arrays: Vec<Array1<f64>> = submissions.iter().map(|s| s.gradient.clone()).collect();
        let weights: Vec<f64> = submissions.iter().map(|s| s.weight).collect();

        // Byzantine detection
        let (honest_indices, byzantine_indices) = if self.config.byzantine_enabled {
            let detector_config = DetectorConfig::new(
                self.config.min_clients,
                self.config.byzantine_fraction,
            );
            let detector = KrumDetector::new(detector_config);
            detector.detect(&gradient_arrays)?
        } else {
            ((0..gradient_arrays.len()).collect(), vec![])
        };

        // Record Byzantine clients
        {
            let mut current = self.current_round.write();
            if let Some(ref mut round) = *current {
                round.byzantine_detected = byzantine_indices
                    .iter()
                    .filter_map(|&i| submissions.get(i).map(|s| s.client_id.clone()))
                    .collect();
            }
        }

        // Filter to honest gradients
        let honest_gradients: Vec<Array1<f64>> = honest_indices
            .iter()
            .map(|&i| gradient_arrays[i].clone())
            .collect();
        let honest_weights: Vec<f64> = honest_indices.iter().map(|&i| weights[i]).collect();

        // Aggregate
        let aggregator_config = AggregatorConfig::default();
        let aggregator = WeightedAverageAggregator::new(aggregator_config);
        let mut aggregate = aggregator.aggregate(&honest_gradients, &honest_weights)?;

        // Apply privacy
        if self.config.privacy_enabled {
            let privacy_config = PrivacyConfig::new(
                self.config.privacy_epsilon,
                self.config.privacy_delta,
                1.0, // Sensitivity after clipping
            );
            let mechanism = GaussianMechanism::new(privacy_config)?;
            aggregate = mechanism.apply(&aggregate)?;

            // Track privacy budget
            {
                let mut budget = self.privacy_budget.write();
                budget.spend(
                    self.config.privacy_epsilon,
                    self.config.privacy_delta,
                    &format!("round {}", self.current_round.read().as_ref().map(|r| r.round_number).unwrap_or(0)),
                )?;
            }

            // Record privacy spent
            {
                let mut current = self.current_round.write();
                if let Some(ref mut round) = *current {
                    round.privacy_spent = self.config.privacy_epsilon;
                }
            }
        }

        // Update global model
        {
            let mut model = self.global_model.write();
            *model = &*model + &aggregate;
        }

        // Complete round
        {
            let mut current = self.current_round.write();
            if let Some(ref mut round) = *current {
                round.state = RoundState::Completed;
                round.ended_at = Some(Utc::now());

                // Update client participation
                let mut clients = self.clients.write();
                for client_id in &round.participants {
                    if let Some(client) = clients.get_mut(client_id) {
                        client.rounds_participated += 1;
                    }
                }

                // Move to history
                self.round_history.write().push(round.clone());
            }
        }

        Ok(aggregate)
    }

    /// Get current global model
    pub fn get_global_model(&self) -> Array1<f64> {
        self.global_model.read().clone()
    }

    /// Get current round info
    pub fn get_current_round(&self) -> Option<RoundInfo> {
        self.current_round.read().clone()
    }

    /// Get round history
    pub fn get_round_history(&self) -> Vec<RoundInfo> {
        self.round_history.read().clone()
    }

    /// Get remaining privacy budget
    pub fn remaining_privacy_budget(&self) -> f64 {
        self.privacy_budget.read().remaining()
    }

    /// Get coordinator configuration
    pub fn config(&self) -> &CoordinatorConfig {
        &self.config
    }
}

/// Client for federated learning
pub struct FederatedClient {
    /// Client ID
    client_id: String,
    /// Public key
    public_key: Vec<u8>,
    /// Private key (simulated)
    _private_key: Vec<u8>,
    /// Local model copy
    local_model: Array1<f64>,
    /// Configuration
    config: ClientConfig,
}

/// Client configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientConfig {
    /// Local training epochs per round
    pub local_epochs: usize,
    /// Local batch size
    pub batch_size: usize,
    /// Learning rate
    pub learning_rate: f64,
    /// Model dimension
    pub model_dimension: usize,
}

impl Default for ClientConfig {
    fn default() -> Self {
        Self {
            local_epochs: 5,
            batch_size: 32,
            learning_rate: 0.01,
            model_dimension: 1000,
        }
    }
}

impl FederatedClient {
    /// Create a new federated client
    pub fn new(client_id: String, config: ClientConfig) -> Self {
        // Generate key pair (simulated)
        let mut rng = rand::thread_rng();
        let public_key: Vec<u8> = (0..32).map(|_| rand::Rng::gen(&mut rng)).collect();
        let private_key: Vec<u8> = (0..32).map(|_| rand::Rng::gen(&mut rng)).collect();

        let local_model = Array1::zeros(config.model_dimension);

        Self {
            client_id,
            public_key,
            _private_key: private_key,
            local_model,
            config,
        }
    }

    /// Get client info for registration
    pub fn get_info(&self) -> ClientInfo {
        ClientInfo::new(self.client_id.clone(), self.public_key.clone())
    }

    /// Update local model with global model
    pub fn sync_model(&mut self, global_model: &Array1<f64>) {
        self.local_model = global_model.clone();
    }

    /// Simulate local training and return gradient
    pub fn train_local(&self, _data_size: usize) -> GradientSubmission {
        // Simulate gradient (in practice, this would be computed from local data)
        let mut rng = rand::thread_rng();
        let gradient: Vec<f64> = (0..self.config.model_dimension)
            .map(|_| rand::Rng::gen_range(&mut rng, -0.1..0.1))
            .collect();

        GradientSubmission {
            client_id: self.client_id.clone(),
            round_id: String::new(), // Will be set when submitting
            gradient: Array1::from_vec(gradient),
            weight: _data_size as f64,
            signature: vec![], // Would be computed in practice
            submitted_at: Utc::now(),
        }
    }

    /// Get client ID
    pub fn client_id(&self) -> &str {
        &self.client_id
    }
}

/// Protocol statistics
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProtocolStats {
    /// Total rounds completed
    pub rounds_completed: u64,
    /// Total rounds failed
    pub rounds_failed: u64,
    /// Total gradients processed
    pub total_gradients: u64,
    /// Total Byzantine detected
    pub total_byzantine: u64,
    /// Total privacy spent
    pub total_privacy_spent: f64,
    /// Average round duration (ms)
    pub avg_round_duration_ms: f64,
}

impl ProtocolStats {
    /// Compute stats from round history
    pub fn from_history(rounds: &[RoundInfo]) -> Self {
        let mut stats = Self::default();

        for round in rounds {
            match round.state {
                RoundState::Completed => stats.rounds_completed += 1,
                RoundState::Failed => stats.rounds_failed += 1,
                _ => {}
            }

            stats.total_gradients += round.gradients_received as u64;
            stats.total_byzantine += round.byzantine_detected.len() as u64;
            stats.total_privacy_spent += round.privacy_spent;

            if let Some(ended) = round.ended_at {
                let duration = (ended - round.started_at).num_milliseconds() as f64;
                stats.avg_round_duration_ms = (stats.avg_round_duration_ms
                    * (stats.rounds_completed + stats.rounds_failed - 1) as f64
                    + duration)
                    / (stats.rounds_completed + stats.rounds_failed) as f64;
            }
        }

        stats
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_coordinator_creation() {
        let config = CoordinatorConfig::default();
        let coordinator = FederatedCoordinator::new(config);

        assert_eq!(coordinator.active_client_count(), 0);
    }

    #[test]
    fn test_client_registration() {
        let config = CoordinatorConfig::default();
        let coordinator = FederatedCoordinator::new(config);

        let client = ClientInfo::new("client_1".to_string(), vec![0u8; 32]);
        coordinator.register_client(client).unwrap();

        assert_eq!(coordinator.active_client_count(), 1);
        assert!(coordinator.get_client("client_1").is_some());
    }

    #[test]
    fn test_duplicate_registration() {
        let config = CoordinatorConfig::default();
        let coordinator = FederatedCoordinator::new(config);

        let client = ClientInfo::new("client_1".to_string(), vec![0u8; 32]);
        coordinator.register_client(client.clone()).unwrap();

        let result = coordinator.register_client(client);
        assert!(result.is_err());
    }

    #[test]
    fn test_client_unregistration() {
        let config = CoordinatorConfig::default();
        let coordinator = FederatedCoordinator::new(config);

        let client = ClientInfo::new("client_1".to_string(), vec![0u8; 32]);
        coordinator.register_client(client).unwrap();
        coordinator.unregister_client("client_1").unwrap();

        assert_eq!(coordinator.active_client_count(), 0);
    }

    #[test]
    fn test_start_round() {
        let config = CoordinatorConfig::default();
        let coordinator = FederatedCoordinator::new(config);

        let round = coordinator.start_round().unwrap();
        assert_eq!(round.round_number, 1);
        assert_eq!(round.state, RoundState::Collecting);
    }

    #[test]
    fn test_round_already_in_progress() {
        let config = CoordinatorConfig::default();
        let coordinator = FederatedCoordinator::new(config);

        coordinator.start_round().unwrap();
        let result = coordinator.start_round();
        assert!(result.is_err());
    }

    #[test]
    fn test_submit_gradient() {
        let config = CoordinatorConfig::default();
        let coordinator = FederatedCoordinator::new(config);

        let client = ClientInfo::new("client_1".to_string(), vec![0u8; 32]);
        coordinator.register_client(client).unwrap();

        let round = coordinator.start_round().unwrap();

        let submission = GradientSubmission {
            client_id: "client_1".to_string(),
            round_id: round.round_id,
            gradient: Array1::zeros(1000),
            weight: 100.0,
            signature: vec![],
            submitted_at: Utc::now(),
        };

        coordinator.submit_gradient(submission).unwrap();

        let current = coordinator.get_current_round().unwrap();
        assert_eq!(current.gradients_received, 1);
    }

    #[test]
    fn test_submit_unregistered_client() {
        let config = CoordinatorConfig::default();
        let coordinator = FederatedCoordinator::new(config);

        coordinator.start_round().unwrap();

        let submission = GradientSubmission {
            client_id: "unknown".to_string(),
            round_id: "test".to_string(),
            gradient: Array1::zeros(1000),
            weight: 100.0,
            signature: vec![],
            submitted_at: Utc::now(),
        };

        let result = coordinator.submit_gradient(submission);
        assert!(result.is_err());
    }

    #[test]
    fn test_full_round() {
        let mut config = CoordinatorConfig::default();
        config.byzantine_enabled = false; // Disable for simple test
        config.privacy_enabled = false;
        config.model_dimension = 10;

        let coordinator = FederatedCoordinator::new(config);

        // Register clients
        for i in 0..5 {
            let client = ClientInfo::new(format!("client_{}", i), vec![0u8; 32]);
            coordinator.register_client(client).unwrap();
        }

        // Start round
        let round = coordinator.start_round().unwrap();

        // Submit gradients
        for i in 0..5 {
            let submission = GradientSubmission {
                client_id: format!("client_{}", i),
                round_id: round.round_id.clone(),
                gradient: Array1::from_vec(vec![0.1; 10]),
                weight: 100.0,
                signature: vec![],
                submitted_at: Utc::now(),
            };
            coordinator.submit_gradient(submission).unwrap();
        }

        // Complete round
        let aggregate = coordinator.complete_round().unwrap();
        assert_eq!(aggregate.len(), 10);

        // Check round completed
        let history = coordinator.get_round_history();
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].state, RoundState::Completed);
    }

    #[test]
    fn test_federated_client() {
        let config = ClientConfig::default();
        let client = FederatedClient::new("test_client".to_string(), config);

        let info = client.get_info();
        assert_eq!(info.client_id, "test_client");
        assert_eq!(info.public_key.len(), 32);
    }

    #[test]
    fn test_client_train_local() {
        let config = ClientConfig {
            model_dimension: 10,
            ..Default::default()
        };
        let client = FederatedClient::new("test".to_string(), config);

        let submission = client.train_local(100);
        assert_eq!(submission.gradient.len(), 10);
        assert_eq!(submission.weight, 100.0);
    }

    #[test]
    fn test_client_sync_model() {
        let config = ClientConfig {
            model_dimension: 10,
            ..Default::default()
        };
        let mut client = FederatedClient::new("test".to_string(), config);

        let global = Array1::from_vec(vec![1.0; 10]);
        client.sync_model(&global);

        // Client should have updated model
        assert_eq!(client.local_model.len(), 10);
    }

    #[test]
    fn test_protocol_stats() {
        let rounds = vec![
            RoundInfo {
                round_number: 1,
                round_id: "r1".to_string(),
                state: RoundState::Completed,
                started_at: Utc::now(),
                ended_at: Some(Utc::now()),
                participants: vec!["a".to_string()],
                gradients_received: 5,
                byzantine_detected: vec!["b".to_string()],
                privacy_spent: 1.0,
            },
        ];

        let stats = ProtocolStats::from_history(&rounds);
        assert_eq!(stats.rounds_completed, 1);
        assert_eq!(stats.total_gradients, 5);
        assert_eq!(stats.total_byzantine, 1);
        assert!((stats.total_privacy_spent - 1.0).abs() < 1e-10);
    }

    #[test]
    fn test_round_state_display() {
        assert_eq!(RoundState::Waiting.to_string(), "Waiting");
        assert_eq!(RoundState::Collecting.to_string(), "Collecting");
        assert_eq!(RoundState::Completed.to_string(), "Completed");
    }

    #[test]
    fn test_client_info_touch() {
        let mut client = ClientInfo::new("test".to_string(), vec![]);
        let original = client.last_seen;

        std::thread::sleep(std::time::Duration::from_millis(10));
        client.touch();

        assert!(client.last_seen > original);
    }

    #[test]
    fn test_coordinator_config_defaults() {
        let config = CoordinatorConfig::default();
        assert_eq!(config.min_clients, 3);
        assert_eq!(config.max_clients, 100);
        assert!(config.byzantine_enabled);
        assert!(config.privacy_enabled);
    }

    #[test]
    fn test_list_clients() {
        let config = CoordinatorConfig::default();
        let coordinator = FederatedCoordinator::new(config);

        for i in 0..3 {
            let client = ClientInfo::new(format!("client_{}", i), vec![]);
            coordinator.register_client(client).unwrap();
        }

        let clients = coordinator.list_clients();
        assert_eq!(clients.len(), 3);
    }
}
