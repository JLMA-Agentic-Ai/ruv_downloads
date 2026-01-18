//! Search space definition for quantum neural architecture search.
//!
//! This module defines the search space for variational quantum circuits,
//! including gate primitives, layer templates, and connectivity constraints.

use crate::error::{Result, SearchSpaceError};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

/// Maximum supported number of qubits.
pub const MAX_QUBITS: usize = 50;

/// Maximum supported circuit depth.
pub const MAX_DEPTH: usize = 100;

/// Quantum gate primitives available in the search space.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum GateType {
    /// Rotation around X-axis: RX(theta)
    RX,
    /// Rotation around Y-axis: RY(theta)
    RY,
    /// Rotation around Z-axis: RZ(theta)
    RZ,
    /// Hadamard gate
    H,
    /// Pauli-X (NOT) gate
    X,
    /// Pauli-Y gate
    Y,
    /// Pauli-Z gate
    Z,
    /// S gate (sqrt(Z))
    S,
    /// T gate (sqrt(S))
    T,
    /// Controlled-NOT gate
    CNOT,
    /// Controlled-Z gate
    CZ,
    /// Controlled-Y gate
    CY,
    /// SWAP gate
    SWAP,
    /// Controlled-RX gate
    CRX,
    /// Controlled-RY gate
    CRY,
    /// Controlled-RZ gate
    CRZ,
    /// iSWAP gate
    ISWAP,
    /// sqrt(iSWAP) gate
    SqrtISWAP,
}

impl GateType {
    /// Returns true if this gate requires parameters.
    pub fn is_parameterized(&self) -> bool {
        matches!(
            self,
            GateType::RX
                | GateType::RY
                | GateType::RZ
                | GateType::CRX
                | GateType::CRY
                | GateType::CRZ
        )
    }

    /// Returns the number of parameters for this gate.
    pub fn num_parameters(&self) -> usize {
        if self.is_parameterized() {
            1
        } else {
            0
        }
    }

    /// Returns true if this is a two-qubit gate.
    pub fn is_two_qubit(&self) -> bool {
        matches!(
            self,
            GateType::CNOT
                | GateType::CZ
                | GateType::CY
                | GateType::SWAP
                | GateType::CRX
                | GateType::CRY
                | GateType::CRZ
                | GateType::ISWAP
                | GateType::SqrtISWAP
        )
    }

    /// Returns the gate's unitary matrix dimension.
    pub fn matrix_dimension(&self) -> usize {
        if self.is_two_qubit() {
            4
        } else {
            2
        }
    }

    /// Returns all single-qubit gates.
    pub fn single_qubit_gates() -> Vec<GateType> {
        vec![
            GateType::RX,
            GateType::RY,
            GateType::RZ,
            GateType::H,
            GateType::X,
            GateType::Y,
            GateType::Z,
            GateType::S,
            GateType::T,
        ]
    }

    /// Returns all two-qubit gates.
    pub fn two_qubit_gates() -> Vec<GateType> {
        vec![
            GateType::CNOT,
            GateType::CZ,
            GateType::CY,
            GateType::SWAP,
            GateType::CRX,
            GateType::CRY,
            GateType::CRZ,
            GateType::ISWAP,
            GateType::SqrtISWAP,
        ]
    }

    /// Returns the standard hardware-efficient gate set.
    pub fn hardware_efficient_set() -> Vec<GateType> {
        vec![GateType::RX, GateType::RY, GateType::RZ, GateType::CNOT]
    }

    /// Returns the QAOA-inspired gate set.
    pub fn qaoa_set() -> Vec<GateType> {
        vec![GateType::RX, GateType::RZ, GateType::CZ]
    }
}

/// Layer template types for circuit construction.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum LayerTemplate {
    /// Hardware-efficient ansatz layer: single-qubit rotations + entangling layer
    HardwareEfficient {
        /// Single-qubit gates to apply
        single_qubit_gates: Vec<GateType>,
        /// Two-qubit gate for entanglement
        entangling_gate: GateType,
        /// Entanglement pattern
        entanglement: EntanglementPattern,
    },
    /// QAOA-inspired layer: mixer + cost
    QaoaInspired {
        /// Mixer Hamiltonian gates
        mixer_gates: Vec<GateType>,
        /// Cost Hamiltonian gates
        cost_gates: Vec<GateType>,
    },
    /// Strongly entangling layer
    StronglyEntangling {
        /// Rotation gates
        rotation_gates: Vec<GateType>,
        /// Entanglement pattern per sublayer
        entanglement_patterns: Vec<EntanglementPattern>,
    },
    /// Custom layer with explicit gate sequence
    Custom {
        /// Ordered list of gate operations
        operations: Vec<GateOperation>,
    },
}

impl LayerTemplate {
    /// Creates a standard hardware-efficient layer.
    pub fn standard_hardware_efficient() -> Self {
        LayerTemplate::HardwareEfficient {
            single_qubit_gates: vec![GateType::RY, GateType::RZ],
            entangling_gate: GateType::CNOT,
            entanglement: EntanglementPattern::Linear,
        }
    }

    /// Creates a strongly entangling layer.
    pub fn standard_strongly_entangling() -> Self {
        LayerTemplate::StronglyEntangling {
            rotation_gates: vec![GateType::RX, GateType::RY, GateType::RZ],
            entanglement_patterns: vec![
                EntanglementPattern::Linear,
                EntanglementPattern::Circular,
                EntanglementPattern::Full,
            ],
        }
    }

    /// Creates a QAOA-inspired layer.
    pub fn standard_qaoa() -> Self {
        LayerTemplate::QaoaInspired {
            mixer_gates: vec![GateType::RX],
            cost_gates: vec![GateType::RZ, GateType::CZ],
        }
    }

    /// Returns the number of parameters per qubit for this layer template.
    pub fn params_per_qubit(&self, num_qubits: usize) -> usize {
        match self {
            LayerTemplate::HardwareEfficient {
                single_qubit_gates, ..
            } => single_qubit_gates.iter().map(|g| g.num_parameters()).sum(),
            LayerTemplate::QaoaInspired {
                mixer_gates,
                cost_gates,
            } => {
                let mixer_params: usize = mixer_gates.iter().map(|g| g.num_parameters()).sum();
                let cost_params: usize = cost_gates.iter().map(|g| g.num_parameters()).sum();
                mixer_params + cost_params
            }
            LayerTemplate::StronglyEntangling { rotation_gates, .. } => {
                rotation_gates.iter().map(|g| g.num_parameters()).sum::<usize>() * num_qubits
            }
            LayerTemplate::Custom { operations } => operations
                .iter()
                .map(|op| op.gate.num_parameters())
                .sum(),
        }
    }
}

/// Entanglement patterns for two-qubit gate placement.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EntanglementPattern {
    /// Linear: (0,1), (1,2), (2,3), ...
    Linear,
    /// Circular: Linear + (n-1, 0)
    Circular,
    /// Full: All pairs
    Full,
    /// Alternating: Even pairs then odd pairs
    Alternating,
    /// Star: All connected to qubit 0
    Star,
    /// Pairwise: (0,1), (2,3), (4,5), ...
    Pairwise,
    /// Custom connectivity (uses ConnectivityGraph)
    Custom,
}

impl EntanglementPattern {
    /// Generates qubit pairs for this entanglement pattern.
    pub fn generate_pairs(&self, num_qubits: usize) -> Vec<(usize, usize)> {
        match self {
            EntanglementPattern::Linear => (0..num_qubits.saturating_sub(1))
                .map(|i| (i, i + 1))
                .collect(),
            EntanglementPattern::Circular => {
                let mut pairs: Vec<(usize, usize)> =
                    (0..num_qubits.saturating_sub(1)).map(|i| (i, i + 1)).collect();
                if num_qubits > 2 {
                    pairs.push((num_qubits - 1, 0));
                }
                pairs
            }
            EntanglementPattern::Full => {
                let mut pairs = Vec::new();
                for i in 0..num_qubits {
                    for j in (i + 1)..num_qubits {
                        pairs.push((i, j));
                    }
                }
                pairs
            }
            EntanglementPattern::Alternating => {
                let mut pairs = Vec::new();
                // Even pairs: (0,1), (2,3), ...
                for i in (0..num_qubits.saturating_sub(1)).step_by(2) {
                    pairs.push((i, i + 1));
                }
                // Odd pairs: (1,2), (3,4), ...
                for i in (1..num_qubits.saturating_sub(1)).step_by(2) {
                    pairs.push((i, i + 1));
                }
                pairs
            }
            EntanglementPattern::Star => (1..num_qubits).map(|i| (0, i)).collect(),
            EntanglementPattern::Pairwise => (0..num_qubits / 2).map(|i| (2 * i, 2 * i + 1)).collect(),
            EntanglementPattern::Custom => Vec::new(), // Requires external connectivity graph
        }
    }
}

/// A single gate operation with target qubit(s).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GateOperation {
    /// The gate type
    pub gate: GateType,
    /// Target qubit(s). Single element for 1-qubit gates, two for 2-qubit gates.
    pub qubits: Vec<usize>,
    /// Parameter index if parameterized (None for fixed gates)
    pub param_index: Option<usize>,
}

impl GateOperation {
    /// Creates a new single-qubit gate operation.
    pub fn single(gate: GateType, qubit: usize, param_index: Option<usize>) -> Self {
        GateOperation {
            gate,
            qubits: vec![qubit],
            param_index,
        }
    }

    /// Creates a new two-qubit gate operation.
    pub fn two_qubit(
        gate: GateType,
        control: usize,
        target: usize,
        param_index: Option<usize>,
    ) -> Self {
        GateOperation {
            gate,
            qubits: vec![control, target],
            param_index,
        }
    }

    /// Validates the gate operation for the given number of qubits.
    pub fn validate(&self, num_qubits: usize) -> Result<()> {
        for &q in &self.qubits {
            if q >= num_qubits {
                return Err(SearchSpaceError::QubitOutOfBounds(q, num_qubits).into());
            }
        }

        if self.gate.is_two_qubit() && self.qubits.len() != 2 {
            return Err(SearchSpaceError::InvalidGate(format!(
                "{:?} requires 2 qubits, got {}",
                self.gate,
                self.qubits.len()
            ))
            .into());
        }

        if !self.gate.is_two_qubit() && self.qubits.len() != 1 {
            return Err(SearchSpaceError::InvalidGate(format!(
                "{:?} requires 1 qubit, got {}",
                self.gate,
                self.qubits.len()
            ))
            .into());
        }

        Ok(())
    }
}

/// Connectivity graph defining allowed two-qubit interactions.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectivityGraph {
    /// Number of qubits
    num_qubits: usize,
    /// Set of allowed qubit pairs (unordered)
    edges: HashSet<(usize, usize)>,
}

impl ConnectivityGraph {
    /// Creates a new connectivity graph.
    pub fn new(num_qubits: usize) -> Self {
        ConnectivityGraph {
            num_qubits,
            edges: HashSet::new(),
        }
    }

    /// Creates a fully-connected graph.
    pub fn fully_connected(num_qubits: usize) -> Self {
        let mut graph = ConnectivityGraph::new(num_qubits);
        for i in 0..num_qubits {
            for j in (i + 1)..num_qubits {
                graph.add_edge(i, j);
            }
        }
        graph
    }

    /// Creates a linear (1D chain) graph.
    pub fn linear(num_qubits: usize) -> Self {
        let mut graph = ConnectivityGraph::new(num_qubits);
        for i in 0..num_qubits.saturating_sub(1) {
            graph.add_edge(i, i + 1);
        }
        graph
    }

    /// Creates a circular graph.
    pub fn circular(num_qubits: usize) -> Self {
        let mut graph = ConnectivityGraph::linear(num_qubits);
        if num_qubits > 2 {
            graph.add_edge(num_qubits - 1, 0);
        }
        graph
    }

    /// Creates a 2D grid graph.
    pub fn grid(rows: usize, cols: usize) -> Self {
        let num_qubits = rows * cols;
        let mut graph = ConnectivityGraph::new(num_qubits);

        for r in 0..rows {
            for c in 0..cols {
                let q = r * cols + c;
                // Right neighbor
                if c + 1 < cols {
                    graph.add_edge(q, q + 1);
                }
                // Bottom neighbor
                if r + 1 < rows {
                    graph.add_edge(q, q + cols);
                }
            }
        }
        graph
    }

    /// Creates an IBM heavy-hex topology.
    pub fn heavy_hex(num_qubits: usize) -> Self {
        // Simplified heavy-hex for demonstration
        // Real heavy-hex has specific patterns based on qubit count
        let mut graph = ConnectivityGraph::new(num_qubits);

        // Linear backbone
        for i in 0..num_qubits.saturating_sub(1) {
            if i % 4 != 3 {
                // Skip every 4th edge
                graph.add_edge(i, i + 1);
            }
        }

        // Cross connections (simplified)
        for i in (0..num_qubits).step_by(4) {
            if i + 4 < num_qubits {
                graph.add_edge(i, i + 4);
            }
        }

        graph
    }

    /// Adds an edge between two qubits.
    pub fn add_edge(&mut self, q1: usize, q2: usize) {
        let (a, b) = if q1 < q2 { (q1, q2) } else { (q2, q1) };
        self.edges.insert((a, b));
    }

    /// Checks if two qubits are connected.
    pub fn is_connected(&self, q1: usize, q2: usize) -> bool {
        let (a, b) = if q1 < q2 { (q1, q2) } else { (q2, q1) };
        self.edges.contains(&(a, b))
    }

    /// Returns all edges as a vector of pairs.
    pub fn edges(&self) -> Vec<(usize, usize)> {
        self.edges.iter().copied().collect()
    }

    /// Returns the number of qubits.
    pub fn num_qubits(&self) -> usize {
        self.num_qubits
    }

    /// Returns the degree (number of connections) for a qubit.
    pub fn degree(&self, qubit: usize) -> usize {
        self.edges
            .iter()
            .filter(|(a, b)| *a == qubit || *b == qubit)
            .count()
    }

    /// Validates that two qubits can interact.
    pub fn validate_interaction(&self, q1: usize, q2: usize) -> Result<()> {
        if q1 >= self.num_qubits {
            return Err(SearchSpaceError::QubitOutOfBounds(q1, self.num_qubits).into());
        }
        if q2 >= self.num_qubits {
            return Err(SearchSpaceError::QubitOutOfBounds(q2, self.num_qubits).into());
        }
        if !self.is_connected(q1, q2) {
            return Err(SearchSpaceError::ConnectivityViolation(q1, q2).into());
        }
        Ok(())
    }
}

/// Complete search space configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchSpace {
    /// Number of qubits
    pub num_qubits: usize,
    /// Minimum circuit depth
    pub min_depth: usize,
    /// Maximum circuit depth
    pub max_depth: usize,
    /// Available gate types
    pub gate_set: Vec<GateType>,
    /// Available layer templates
    pub layer_templates: Vec<LayerTemplate>,
    /// Connectivity constraints
    pub connectivity: ConnectivityGraph,
    /// Whether to include identity (skip) operations
    pub allow_identity: bool,
    /// Maximum number of parameters
    pub max_parameters: Option<usize>,
}

impl SearchSpace {
    /// Creates a new search space with validation.
    pub fn new(
        num_qubits: usize,
        min_depth: usize,
        max_depth: usize,
        gate_set: Vec<GateType>,
    ) -> Result<Self> {
        if num_qubits == 0 || num_qubits > MAX_QUBITS {
            return Err(SearchSpaceError::InvalidQubitCount(num_qubits, MAX_QUBITS).into());
        }
        if max_depth == 0 || max_depth > MAX_DEPTH {
            return Err(SearchSpaceError::InvalidLayerDepth(max_depth, MAX_DEPTH).into());
        }
        if min_depth > max_depth {
            return Err(SearchSpaceError::InvalidLayerDepth(min_depth, max_depth).into());
        }
        if gate_set.is_empty() {
            return Err(SearchSpaceError::EmptyGateSet.into());
        }

        Ok(SearchSpace {
            num_qubits,
            min_depth,
            max_depth,
            gate_set,
            layer_templates: vec![LayerTemplate::standard_hardware_efficient()],
            connectivity: ConnectivityGraph::fully_connected(num_qubits),
            allow_identity: true,
            max_parameters: None,
        })
    }

    /// Creates a hardware-efficient search space.
    pub fn hardware_efficient(num_qubits: usize, max_depth: usize) -> Result<Self> {
        let mut space = Self::new(num_qubits, 1, max_depth, GateType::hardware_efficient_set())?;
        space.layer_templates = vec![
            LayerTemplate::standard_hardware_efficient(),
            LayerTemplate::HardwareEfficient {
                single_qubit_gates: vec![GateType::RX, GateType::RY, GateType::RZ],
                entangling_gate: GateType::CNOT,
                entanglement: EntanglementPattern::Full,
            },
        ];
        Ok(space)
    }

    /// Creates a QAOA-style search space.
    pub fn qaoa_style(num_qubits: usize, max_depth: usize) -> Result<Self> {
        let mut space = Self::new(num_qubits, 1, max_depth, GateType::qaoa_set())?;
        space.layer_templates = vec![LayerTemplate::standard_qaoa()];
        Ok(space)
    }

    /// Sets the connectivity graph.
    pub fn with_connectivity(mut self, connectivity: ConnectivityGraph) -> Self {
        self.connectivity = connectivity;
        self
    }

    /// Sets the layer templates.
    pub fn with_templates(mut self, templates: Vec<LayerTemplate>) -> Self {
        self.layer_templates = templates;
        self
    }

    /// Sets the maximum number of parameters.
    pub fn with_max_parameters(mut self, max_params: usize) -> Self {
        self.max_parameters = Some(max_params);
        self
    }

    /// Returns the total number of discrete choices in the search space.
    pub fn num_choices(&self) -> usize {
        // Depth choice + template choice per layer + gate choices
        let depth_choices = self.max_depth - self.min_depth + 1;
        let template_choices = self.layer_templates.len();
        let gate_choices = self.gate_set.len();

        depth_choices * template_choices.pow(self.max_depth as u32) * gate_choices
    }

    /// Validates a gate operation against this search space.
    pub fn validate_operation(&self, op: &GateOperation) -> Result<()> {
        // Check gate is in gate set
        if !self.gate_set.contains(&op.gate) {
            return Err(SearchSpaceError::InvalidGate(format!(
                "{:?} not in gate set",
                op.gate
            ))
            .into());
        }

        // Validate qubit indices
        op.validate(self.num_qubits)?;

        // Check connectivity for two-qubit gates
        if op.gate.is_two_qubit() {
            self.connectivity
                .validate_interaction(op.qubits[0], op.qubits[1])?;
        }

        Ok(())
    }

    /// Returns all single-qubit gates in the gate set.
    pub fn single_qubit_gates(&self) -> Vec<GateType> {
        self.gate_set
            .iter()
            .filter(|g| !g.is_two_qubit())
            .copied()
            .collect()
    }

    /// Returns all two-qubit gates in the gate set.
    pub fn two_qubit_gates(&self) -> Vec<GateType> {
        self.gate_set
            .iter()
            .filter(|g| g.is_two_qubit())
            .copied()
            .collect()
    }
}

/// Builder for creating custom search spaces.
#[derive(Debug, Clone)]
pub struct SearchSpaceBuilder {
    num_qubits: usize,
    min_depth: usize,
    max_depth: usize,
    gate_set: Vec<GateType>,
    layer_templates: Vec<LayerTemplate>,
    connectivity: Option<ConnectivityGraph>,
    allow_identity: bool,
    max_parameters: Option<usize>,
}

impl SearchSpaceBuilder {
    /// Creates a new builder with required parameters.
    pub fn new(num_qubits: usize) -> Self {
        SearchSpaceBuilder {
            num_qubits,
            min_depth: 1,
            max_depth: 10,
            gate_set: GateType::hardware_efficient_set(),
            layer_templates: vec![LayerTemplate::standard_hardware_efficient()],
            connectivity: None,
            allow_identity: true,
            max_parameters: None,
        }
    }

    /// Sets the depth range.
    pub fn depth_range(mut self, min: usize, max: usize) -> Self {
        self.min_depth = min;
        self.max_depth = max;
        self
    }

    /// Sets the gate set.
    pub fn gate_set(mut self, gates: Vec<GateType>) -> Self {
        self.gate_set = gates;
        self
    }

    /// Adds gates to the gate set.
    pub fn add_gates(mut self, gates: &[GateType]) -> Self {
        for gate in gates {
            if !self.gate_set.contains(gate) {
                self.gate_set.push(*gate);
            }
        }
        self
    }

    /// Sets the layer templates.
    pub fn layer_templates(mut self, templates: Vec<LayerTemplate>) -> Self {
        self.layer_templates = templates;
        self
    }

    /// Sets the connectivity graph.
    pub fn connectivity(mut self, graph: ConnectivityGraph) -> Self {
        self.connectivity = Some(graph);
        self
    }

    /// Sets whether to allow identity operations.
    pub fn allow_identity(mut self, allow: bool) -> Self {
        self.allow_identity = allow;
        self
    }

    /// Sets the maximum number of parameters.
    pub fn max_parameters(mut self, max: usize) -> Self {
        self.max_parameters = Some(max);
        self
    }

    /// Builds the search space with validation.
    pub fn build(self) -> Result<SearchSpace> {
        let mut space = SearchSpace::new(
            self.num_qubits,
            self.min_depth,
            self.max_depth,
            self.gate_set,
        )?;

        space.layer_templates = self.layer_templates;
        space.connectivity = self
            .connectivity
            .unwrap_or_else(|| ConnectivityGraph::fully_connected(self.num_qubits));
        space.allow_identity = self.allow_identity;
        space.max_parameters = self.max_parameters;

        Ok(space)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gate_type_properties() {
        assert!(GateType::RX.is_parameterized());
        assert!(!GateType::H.is_parameterized());
        assert!(GateType::CNOT.is_two_qubit());
        assert!(!GateType::RY.is_two_qubit());
        assert_eq!(GateType::RZ.num_parameters(), 1);
        assert_eq!(GateType::H.num_parameters(), 0);
    }

    #[test]
    fn test_gate_sets() {
        let hw_set = GateType::hardware_efficient_set();
        assert!(hw_set.contains(&GateType::RX));
        assert!(hw_set.contains(&GateType::CNOT));
        assert!(!hw_set.contains(&GateType::ISWAP));

        let qaoa_set = GateType::qaoa_set();
        assert!(qaoa_set.contains(&GateType::RZ));
        assert!(qaoa_set.contains(&GateType::CZ));
    }

    #[test]
    fn test_entanglement_patterns() {
        let linear = EntanglementPattern::Linear.generate_pairs(4);
        assert_eq!(linear, vec![(0, 1), (1, 2), (2, 3)]);

        let circular = EntanglementPattern::Circular.generate_pairs(4);
        assert_eq!(circular, vec![(0, 1), (1, 2), (2, 3), (3, 0)]);

        let full = EntanglementPattern::Full.generate_pairs(3);
        assert_eq!(full, vec![(0, 1), (0, 2), (1, 2)]);

        let pairwise = EntanglementPattern::Pairwise.generate_pairs(4);
        assert_eq!(pairwise, vec![(0, 1), (2, 3)]);
    }

    #[test]
    fn test_connectivity_graph() {
        let mut graph = ConnectivityGraph::new(4);
        graph.add_edge(0, 1);
        graph.add_edge(1, 2);

        assert!(graph.is_connected(0, 1));
        assert!(graph.is_connected(1, 0)); // Order independent
        assert!(graph.is_connected(1, 2));
        assert!(!graph.is_connected(0, 2));
        assert!(!graph.is_connected(2, 3));
    }

    #[test]
    fn test_connectivity_presets() {
        let linear = ConnectivityGraph::linear(4);
        assert!(linear.is_connected(0, 1));
        assert!(linear.is_connected(2, 3));
        assert!(!linear.is_connected(0, 3));

        let circular = ConnectivityGraph::circular(4);
        assert!(circular.is_connected(3, 0));

        let full = ConnectivityGraph::fully_connected(3);
        assert!(full.is_connected(0, 2));

        let grid = ConnectivityGraph::grid(2, 2);
        assert!(grid.is_connected(0, 1)); // Row neighbor
        assert!(grid.is_connected(0, 2)); // Column neighbor
        assert!(!grid.is_connected(0, 3)); // Diagonal
    }

    #[test]
    fn test_search_space_creation() {
        let space = SearchSpace::new(4, 1, 10, GateType::hardware_efficient_set()).unwrap();
        assert_eq!(space.num_qubits, 4);
        assert_eq!(space.min_depth, 1);
        assert_eq!(space.max_depth, 10);
    }

    #[test]
    fn test_search_space_validation() {
        // Invalid qubit count
        assert!(SearchSpace::new(0, 1, 10, GateType::hardware_efficient_set()).is_err());
        assert!(SearchSpace::new(100, 1, 10, GateType::hardware_efficient_set()).is_err());

        // Invalid depth
        assert!(SearchSpace::new(4, 1, 0, GateType::hardware_efficient_set()).is_err());
        assert!(SearchSpace::new(4, 5, 3, GateType::hardware_efficient_set()).is_err());

        // Empty gate set
        assert!(SearchSpace::new(4, 1, 10, vec![]).is_err());
    }

    #[test]
    fn test_search_space_builder() {
        let space = SearchSpaceBuilder::new(4)
            .depth_range(2, 8)
            .gate_set(vec![GateType::RY, GateType::CNOT])
            .connectivity(ConnectivityGraph::linear(4))
            .allow_identity(false)
            .max_parameters(50)
            .build()
            .unwrap();

        assert_eq!(space.num_qubits, 4);
        assert_eq!(space.min_depth, 2);
        assert_eq!(space.max_depth, 8);
        assert_eq!(space.gate_set.len(), 2);
        assert!(!space.allow_identity);
        assert_eq!(space.max_parameters, Some(50));
    }

    #[test]
    fn test_gate_operation_validation() {
        let op = GateOperation::single(GateType::RX, 2, Some(0));
        assert!(op.validate(4).is_ok());
        assert!(op.validate(2).is_err()); // Qubit out of bounds

        let op2 = GateOperation::two_qubit(GateType::CNOT, 0, 1, None);
        assert!(op2.validate(4).is_ok());
    }

    #[test]
    fn test_layer_template_params() {
        let hw = LayerTemplate::standard_hardware_efficient();
        let params = hw.params_per_qubit(4);
        assert!(params > 0);

        let qaoa = LayerTemplate::standard_qaoa();
        let qaoa_params = qaoa.params_per_qubit(4);
        assert!(qaoa_params > 0);
    }

    #[test]
    fn test_hardware_efficient_space() {
        let space = SearchSpace::hardware_efficient(4, 6).unwrap();
        assert_eq!(space.num_qubits, 4);
        assert_eq!(space.max_depth, 6);
        assert!(space.gate_set.contains(&GateType::RX));
        assert!(space.gate_set.contains(&GateType::CNOT));
    }

    #[test]
    fn test_qaoa_style_space() {
        let space = SearchSpace::qaoa_style(4, 5).unwrap();
        assert!(space.gate_set.contains(&GateType::RZ));
        assert!(space.gate_set.contains(&GateType::CZ));
    }

    #[test]
    fn test_search_space_operation_validation() {
        let space = SearchSpace::new(4, 1, 10, vec![GateType::RX, GateType::CNOT]).unwrap();

        // Valid operations
        let valid_single = GateOperation::single(GateType::RX, 0, Some(0));
        assert!(space.validate_operation(&valid_single).is_ok());

        let valid_two = GateOperation::two_qubit(GateType::CNOT, 0, 1, None);
        assert!(space.validate_operation(&valid_two).is_ok());

        // Invalid: gate not in set
        let invalid_gate = GateOperation::single(GateType::RY, 0, Some(0));
        assert!(space.validate_operation(&invalid_gate).is_err());
    }

    #[test]
    fn test_connectivity_validation() {
        let space = SearchSpace::new(4, 1, 10, GateType::hardware_efficient_set())
            .unwrap()
            .with_connectivity(ConnectivityGraph::linear(4));

        // Valid: adjacent qubits
        let valid = GateOperation::two_qubit(GateType::CNOT, 0, 1, None);
        assert!(space.validate_operation(&valid).is_ok());

        // Invalid: non-adjacent qubits
        let invalid = GateOperation::two_qubit(GateType::CNOT, 0, 2, None);
        assert!(space.validate_operation(&invalid).is_err());
    }
}
