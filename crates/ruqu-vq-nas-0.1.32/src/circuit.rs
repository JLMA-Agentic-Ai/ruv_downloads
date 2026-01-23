//! Circuit builder for variational quantum circuits.
//!
//! This module provides tools for constructing quantum circuits from architecture
//! specifications, managing parameters, and computing gradients.

use crate::encoding::{ArchitectureEncoder, DiscreteEncoding};
use crate::error::{CircuitError, Result};
use crate::search_space::{GateOperation, GateType, SearchSpace};
use ndarray::{Array1, Array2};
use rand::prelude::*;
use rand_distr::{Normal, Uniform};
use serde::{Deserialize, Serialize};
use std::f64::consts::PI;

/// A quantum circuit with variational parameters.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuantumCircuit {
    /// Number of qubits
    pub num_qubits: usize,
    /// Circuit depth (number of layers)
    pub depth: usize,
    /// Ordered list of gate operations
    pub operations: Vec<GateOperation>,
    /// Variational parameters
    pub parameters: Array1<f64>,
    /// Number of parameters
    pub num_parameters: usize,
}

impl QuantumCircuit {
    /// Creates a new empty quantum circuit.
    pub fn new(num_qubits: usize) -> Self {
        QuantumCircuit {
            num_qubits,
            depth: 0,
            operations: Vec::new(),
            parameters: Array1::zeros(0),
            num_parameters: 0,
        }
    }

    /// Builds a circuit from a discrete encoding.
    pub fn from_encoding(encoding: &DiscreteEncoding, space: &SearchSpace) -> Result<Self> {
        let encoder = ArchitectureEncoder::new(space.clone(), 32);
        let layers = encoder.decode_to_operations(encoding);

        let mut operations = Vec::new();
        let mut max_param_idx = 0;

        for layer_ops in &layers {
            for op in layer_ops {
                if let Some(idx) = op.param_index {
                    max_param_idx = max_param_idx.max(idx + 1);
                }
                operations.push(op.clone());
            }
        }

        let num_parameters = max_param_idx;
        let parameters = Array1::zeros(num_parameters);

        Ok(QuantumCircuit {
            num_qubits: space.num_qubits,
            depth: encoding.depth,
            operations,
            parameters,
            num_parameters,
        })
    }

    /// Adds a single-qubit gate.
    pub fn add_single_gate(
        &mut self,
        gate: GateType,
        qubit: usize,
        param: Option<f64>,
    ) -> Result<()> {
        if qubit >= self.num_qubits {
            return Err(CircuitError::InvalidGateApplication {
                gate: format!("{:?}", gate),
                qubits: vec![qubit],
            }
            .into());
        }

        let param_index = if gate.is_parameterized() {
            let idx = self.num_parameters;
            self.num_parameters += 1;
            self.parameters = Array1::from_iter(
                self.parameters
                    .iter()
                    .copied()
                    .chain(std::iter::once(param.unwrap_or(0.0))),
            );
            Some(idx)
        } else {
            None
        };

        self.operations
            .push(GateOperation::single(gate, qubit, param_index));
        Ok(())
    }

    /// Adds a two-qubit gate.
    pub fn add_two_qubit_gate(
        &mut self,
        gate: GateType,
        control: usize,
        target: usize,
        param: Option<f64>,
    ) -> Result<()> {
        if control >= self.num_qubits || target >= self.num_qubits {
            return Err(CircuitError::InvalidGateApplication {
                gate: format!("{:?}", gate),
                qubits: vec![control, target],
            }
            .into());
        }

        if control == target {
            return Err(CircuitError::InvalidGateApplication {
                gate: format!("{:?}", gate),
                qubits: vec![control, target],
            }
            .into());
        }

        let param_index = if gate.is_parameterized() {
            let idx = self.num_parameters;
            self.num_parameters += 1;
            self.parameters = Array1::from_iter(
                self.parameters
                    .iter()
                    .copied()
                    .chain(std::iter::once(param.unwrap_or(0.0))),
            );
            Some(idx)
        } else {
            None
        };

        self.operations
            .push(GateOperation::two_qubit(gate, control, target, param_index));
        Ok(())
    }

    /// Sets a parameter value.
    pub fn set_parameter(&mut self, index: usize, value: f64) -> Result<()> {
        if index >= self.num_parameters {
            return Err(CircuitError::MissingParameter(index).into());
        }
        if !value.is_finite() {
            return Err(CircuitError::InvalidParameter { index, value }.into());
        }
        self.parameters[index] = value;
        Ok(())
    }

    /// Gets a parameter value.
    pub fn get_parameter(&self, index: usize) -> Result<f64> {
        if index >= self.num_parameters {
            return Err(CircuitError::MissingParameter(index).into());
        }
        Ok(self.parameters[index])
    }

    /// Sets all parameters from a slice.
    pub fn set_parameters(&mut self, params: &[f64]) -> Result<()> {
        if params.len() != self.num_parameters {
            return Err(CircuitError::ParameterCountMismatch {
                expected: self.num_parameters,
                got: params.len(),
            }
            .into());
        }

        for (i, &p) in params.iter().enumerate() {
            if !p.is_finite() {
                return Err(CircuitError::InvalidParameter { index: i, value: p }.into());
            }
        }

        self.parameters = Array1::from_vec(params.to_vec());
        Ok(())
    }

    /// Returns the total number of gates.
    pub fn gate_count(&self) -> usize {
        self.operations.len()
    }

    /// Returns the number of two-qubit gates.
    pub fn two_qubit_gate_count(&self) -> usize {
        self.operations.iter().filter(|op| op.gate.is_two_qubit()).count()
    }

    /// Returns the circuit depth (longest path through qubits).
    pub fn compute_depth(&self) -> usize {
        if self.operations.is_empty() {
            return 0;
        }

        let mut qubit_depths = vec![0usize; self.num_qubits];

        for op in &self.operations {
            if op.qubits.len() == 1 {
                let q = op.qubits[0];
                qubit_depths[q] += 1;
            } else if op.qubits.len() == 2 {
                let q1 = op.qubits[0];
                let q2 = op.qubits[1];
                let max_depth = qubit_depths[q1].max(qubit_depths[q2]);
                qubit_depths[q1] = max_depth + 1;
                qubit_depths[q2] = max_depth + 1;
            }
        }

        *qubit_depths.iter().max().unwrap_or(&0)
    }

    /// Validates the circuit.
    pub fn validate(&self) -> Result<()> {
        for op in &self.operations {
            for &q in &op.qubits {
                if q >= self.num_qubits {
                    return Err(CircuitError::InvalidGateApplication {
                        gate: format!("{:?}", op.gate),
                        qubits: op.qubits.clone(),
                    }
                    .into());
                }
            }

            if let Some(idx) = op.param_index {
                if idx >= self.num_parameters {
                    return Err(CircuitError::MissingParameter(idx).into());
                }
            }
        }

        for (i, &p) in self.parameters.iter().enumerate() {
            if !p.is_finite() {
                return Err(CircuitError::InvalidParameter { index: i, value: p }.into());
            }
        }

        Ok(())
    }
}

/// Parameter initialization strategies.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum InitializationStrategy {
    /// All parameters set to zero.
    Zeros,
    /// Uniform random in [0, 2*pi].
    Uniform,
    /// Uniform random in [-pi, pi].
    UniformSymmetric,
    /// Gaussian with mean 0 and given std.
    Gaussian { std: f64 },
    /// Small random values around zero.
    Small { scale: f64 },
    /// Xavier/Glorot initialization.
    Xavier,
    /// He initialization (for ReLU-like behavior).
    He,
}

impl InitializationStrategy {
    /// Generates parameters using this strategy.
    pub fn generate<R: Rng>(&self, num_params: usize, rng: &mut R) -> Array1<f64> {
        match self {
            InitializationStrategy::Zeros => Array1::zeros(num_params),
            InitializationStrategy::Uniform => {
                let dist = Uniform::new(0.0, 2.0 * PI);
                Array1::from_iter((0..num_params).map(|_| rng.sample(dist)))
            }
            InitializationStrategy::UniformSymmetric => {
                let dist = Uniform::new(-PI, PI);
                Array1::from_iter((0..num_params).map(|_| rng.sample(dist)))
            }
            InitializationStrategy::Gaussian { std } => {
                let dist = Normal::new(0.0, *std).unwrap();
                Array1::from_iter((0..num_params).map(|_| rng.sample(dist)))
            }
            InitializationStrategy::Small { scale } => {
                let dist = Normal::new(0.0, *scale).unwrap();
                Array1::from_iter((0..num_params).map(|_| rng.sample(dist)))
            }
            InitializationStrategy::Xavier => {
                let scale = (2.0 / num_params as f64).sqrt();
                let dist = Normal::new(0.0, scale).unwrap();
                Array1::from_iter((0..num_params).map(|_| rng.sample(dist)))
            }
            InitializationStrategy::He => {
                let scale = (2.0 / num_params as f64).sqrt() * (2.0_f64).sqrt();
                let dist = Normal::new(0.0, scale).unwrap();
                Array1::from_iter((0..num_params).map(|_| rng.sample(dist)))
            }
        }
    }
}

/// Gradient computation helper for parameter-shift rule.
#[derive(Debug, Clone)]
pub struct GradientComputer {
    /// Shift amount for parameter-shift rule (default: pi/2).
    pub shift: f64,
    /// Whether to use two-point (default) or four-point formula.
    pub use_four_point: bool,
}

impl Default for GradientComputer {
    fn default() -> Self {
        GradientComputer {
            shift: PI / 2.0,
            use_four_point: false,
        }
    }
}

impl GradientComputer {
    /// Creates a new gradient computer with default settings.
    pub fn new() -> Self {
        Self::default()
    }

    /// Sets the shift amount.
    pub fn with_shift(mut self, shift: f64) -> Self {
        self.shift = shift;
        self
    }

    /// Enables four-point formula for higher accuracy.
    pub fn with_four_point(mut self, use_four_point: bool) -> Self {
        self.use_four_point = use_four_point;
        self
    }

    /// Computes gradients using parameter-shift rule.
    ///
    /// The objective function should return the expectation value to be minimized.
    pub fn compute_gradients<F>(
        &self,
        circuit: &QuantumCircuit,
        objective: F,
    ) -> Result<Array1<f64>>
    where
        F: Fn(&Array1<f64>) -> f64,
    {
        let num_params = circuit.num_parameters;
        let mut gradients = Array1::zeros(num_params);

        if self.use_four_point {
            // Four-point formula for higher accuracy
            let shifts = [self.shift, -self.shift, 2.0 * self.shift, -2.0 * self.shift];
            let coeffs = [1.0, -1.0, -0.5, 0.5];

            for i in 0..num_params {
                let mut grad = 0.0;
                for (&s, &c) in shifts.iter().zip(coeffs.iter()) {
                    let mut shifted_params = circuit.parameters.clone();
                    shifted_params[i] += s;
                    grad += c * objective(&shifted_params);
                }
                gradients[i] = grad / (2.0 * self.shift.sin());
            }
        } else {
            // Standard two-point parameter-shift rule
            for i in 0..num_params {
                let mut plus_params = circuit.parameters.clone();
                let mut minus_params = circuit.parameters.clone();

                plus_params[i] += self.shift;
                minus_params[i] -= self.shift;

                let f_plus = objective(&plus_params);
                let f_minus = objective(&minus_params);

                gradients[i] = (f_plus - f_minus) / (2.0 * self.shift.sin());
            }
        }

        Ok(gradients)
    }

    /// Computes Hessian using nested parameter-shift rules.
    pub fn compute_hessian<F>(
        &self,
        circuit: &QuantumCircuit,
        objective: F,
    ) -> Result<Array2<f64>>
    where
        F: Fn(&Array1<f64>) -> f64,
    {
        let num_params = circuit.num_parameters;
        let mut hessian = Array2::zeros((num_params, num_params));
        let s = self.shift;

        for i in 0..num_params {
            for j in 0..=i {
                // Four evaluations needed for each Hessian entry
                let mut pp = circuit.parameters.clone();
                let mut pm = circuit.parameters.clone();
                let mut mp = circuit.parameters.clone();
                let mut mm = circuit.parameters.clone();

                pp[i] += s;
                pp[j] += s;

                pm[i] += s;
                pm[j] -= s;

                mp[i] -= s;
                mp[j] += s;

                mm[i] -= s;
                mm[j] -= s;

                let f_pp = objective(&pp);
                let f_pm = objective(&pm);
                let f_mp = objective(&mp);
                let f_mm = objective(&mm);

                let h_ij = (f_pp - f_pm - f_mp + f_mm) / (4.0 * s.sin() * s.sin());

                hessian[[i, j]] = h_ij;
                hessian[[j, i]] = h_ij;
            }
        }

        Ok(hessian)
    }
}

/// Circuit builder using the builder pattern.
#[derive(Debug, Clone)]
pub struct CircuitBuilder {
    num_qubits: usize,
    operations: Vec<GateOperation>,
    param_count: usize,
}

impl CircuitBuilder {
    /// Creates a new circuit builder.
    pub fn new(num_qubits: usize) -> Self {
        CircuitBuilder {
            num_qubits,
            operations: Vec::new(),
            param_count: 0,
        }
    }

    /// Adds a rotation around X.
    pub fn rx(mut self, qubit: usize) -> Self {
        let idx = self.param_count;
        self.param_count += 1;
        self.operations
            .push(GateOperation::single(GateType::RX, qubit, Some(idx)));
        self
    }

    /// Adds a rotation around Y.
    pub fn ry(mut self, qubit: usize) -> Self {
        let idx = self.param_count;
        self.param_count += 1;
        self.operations
            .push(GateOperation::single(GateType::RY, qubit, Some(idx)));
        self
    }

    /// Adds a rotation around Z.
    pub fn rz(mut self, qubit: usize) -> Self {
        let idx = self.param_count;
        self.param_count += 1;
        self.operations
            .push(GateOperation::single(GateType::RZ, qubit, Some(idx)));
        self
    }

    /// Adds a Hadamard gate.
    pub fn h(mut self, qubit: usize) -> Self {
        self.operations
            .push(GateOperation::single(GateType::H, qubit, None));
        self
    }

    /// Adds a Pauli-X gate.
    pub fn x(mut self, qubit: usize) -> Self {
        self.operations
            .push(GateOperation::single(GateType::X, qubit, None));
        self
    }

    /// Adds a Pauli-Y gate.
    pub fn y(mut self, qubit: usize) -> Self {
        self.operations
            .push(GateOperation::single(GateType::Y, qubit, None));
        self
    }

    /// Adds a Pauli-Z gate.
    pub fn z(mut self, qubit: usize) -> Self {
        self.operations
            .push(GateOperation::single(GateType::Z, qubit, None));
        self
    }

    /// Adds an S gate.
    pub fn s(mut self, qubit: usize) -> Self {
        self.operations
            .push(GateOperation::single(GateType::S, qubit, None));
        self
    }

    /// Adds a T gate.
    pub fn t(mut self, qubit: usize) -> Self {
        self.operations
            .push(GateOperation::single(GateType::T, qubit, None));
        self
    }

    /// Adds a CNOT gate.
    pub fn cnot(mut self, control: usize, target: usize) -> Self {
        self.operations.push(GateOperation::two_qubit(
            GateType::CNOT,
            control,
            target,
            None,
        ));
        self
    }

    /// Adds a CZ gate.
    pub fn cz(mut self, q1: usize, q2: usize) -> Self {
        self.operations
            .push(GateOperation::two_qubit(GateType::CZ, q1, q2, None));
        self
    }

    /// Adds a CY gate.
    pub fn cy(mut self, control: usize, target: usize) -> Self {
        self.operations.push(GateOperation::two_qubit(
            GateType::CY,
            control,
            target,
            None,
        ));
        self
    }

    /// Adds a SWAP gate.
    pub fn swap(mut self, q1: usize, q2: usize) -> Self {
        self.operations
            .push(GateOperation::two_qubit(GateType::SWAP, q1, q2, None));
        self
    }

    /// Adds a controlled RX gate.
    pub fn crx(mut self, control: usize, target: usize) -> Self {
        let idx = self.param_count;
        self.param_count += 1;
        self.operations.push(GateOperation::two_qubit(
            GateType::CRX,
            control,
            target,
            Some(idx),
        ));
        self
    }

    /// Adds a controlled RY gate.
    pub fn cry(mut self, control: usize, target: usize) -> Self {
        let idx = self.param_count;
        self.param_count += 1;
        self.operations.push(GateOperation::two_qubit(
            GateType::CRY,
            control,
            target,
            Some(idx),
        ));
        self
    }

    /// Adds a controlled RZ gate.
    pub fn crz(mut self, control: usize, target: usize) -> Self {
        let idx = self.param_count;
        self.param_count += 1;
        self.operations.push(GateOperation::two_qubit(
            GateType::CRZ,
            control,
            target,
            Some(idx),
        ));
        self
    }

    /// Adds rotations to all qubits.
    pub fn rotation_layer(mut self, gates: &[GateType]) -> Self {
        for gate in gates {
            for qubit in 0..self.num_qubits {
                if gate.is_parameterized() {
                    let idx = self.param_count;
                    self.param_count += 1;
                    self.operations
                        .push(GateOperation::single(*gate, qubit, Some(idx)));
                } else {
                    self.operations
                        .push(GateOperation::single(*gate, qubit, None));
                }
            }
        }
        self
    }

    /// Adds a linear entangling layer.
    pub fn entangling_layer_linear(mut self, gate: GateType) -> Self {
        for i in 0..(self.num_qubits - 1) {
            if gate.is_parameterized() {
                let idx = self.param_count;
                self.param_count += 1;
                self.operations
                    .push(GateOperation::two_qubit(gate, i, i + 1, Some(idx)));
            } else {
                self.operations
                    .push(GateOperation::two_qubit(gate, i, i + 1, None));
            }
        }
        self
    }

    /// Adds a circular entangling layer.
    pub fn entangling_layer_circular(mut self, gate: GateType) -> Self {
        self = self.entangling_layer_linear(gate);
        if self.num_qubits > 2 {
            if gate.is_parameterized() {
                let idx = self.param_count;
                self.param_count += 1;
                self.operations.push(GateOperation::two_qubit(
                    gate,
                    self.num_qubits - 1,
                    0,
                    Some(idx),
                ));
            } else {
                self.operations.push(GateOperation::two_qubit(
                    gate,
                    self.num_qubits - 1,
                    0,
                    None,
                ));
            }
        }
        self
    }

    /// Adds a full (all-to-all) entangling layer.
    pub fn entangling_layer_full(mut self, gate: GateType) -> Self {
        for i in 0..self.num_qubits {
            for j in (i + 1)..self.num_qubits {
                if gate.is_parameterized() {
                    let idx = self.param_count;
                    self.param_count += 1;
                    self.operations
                        .push(GateOperation::two_qubit(gate, i, j, Some(idx)));
                } else {
                    self.operations
                        .push(GateOperation::two_qubit(gate, i, j, None));
                }
            }
        }
        self
    }

    /// Builds the circuit with default (zero) parameters.
    pub fn build(self) -> QuantumCircuit {
        let depth = self.compute_depth();
        QuantumCircuit {
            num_qubits: self.num_qubits,
            depth,
            operations: self.operations,
            parameters: Array1::zeros(self.param_count),
            num_parameters: self.param_count,
        }
    }

    /// Builds the circuit with random parameters.
    pub fn build_with_random_params<R: Rng>(self, rng: &mut R) -> QuantumCircuit {
        let mut circuit = self.build();
        let params =
            InitializationStrategy::UniformSymmetric.generate(circuit.num_parameters, rng);
        circuit.parameters = params;
        circuit
    }

    /// Builds the circuit with specified initialization strategy.
    pub fn build_with_strategy<R: Rng>(
        self,
        strategy: InitializationStrategy,
        rng: &mut R,
    ) -> QuantumCircuit {
        let mut circuit = self.build();
        let params = strategy.generate(circuit.num_parameters, rng);
        circuit.parameters = params;
        circuit
    }

    fn compute_depth(&self) -> usize {
        if self.operations.is_empty() {
            return 0;
        }

        let mut qubit_depths = vec![0usize; self.num_qubits];

        for op in &self.operations {
            if op.qubits.len() == 1 {
                let q = op.qubits[0];
                if q < self.num_qubits {
                    qubit_depths[q] += 1;
                }
            } else if op.qubits.len() == 2 {
                let q1 = op.qubits[0];
                let q2 = op.qubits[1];
                if q1 < self.num_qubits && q2 < self.num_qubits {
                    let max_depth = qubit_depths[q1].max(qubit_depths[q2]);
                    qubit_depths[q1] = max_depth + 1;
                    qubit_depths[q2] = max_depth + 1;
                }
            }
        }

        *qubit_depths.iter().max().unwrap_or(&0)
    }
}

/// Hardware-efficient ansatz generator.
#[derive(Debug, Clone)]
pub struct HardwareEfficientAnsatz {
    /// Number of qubits
    pub num_qubits: usize,
    /// Number of layers
    pub num_layers: usize,
    /// Single-qubit gate types
    pub single_gates: Vec<GateType>,
    /// Entangling gate type
    pub entangling_gate: GateType,
}

impl HardwareEfficientAnsatz {
    /// Creates a new hardware-efficient ansatz.
    pub fn new(num_qubits: usize, num_layers: usize) -> Self {
        HardwareEfficientAnsatz {
            num_qubits,
            num_layers,
            single_gates: vec![GateType::RY, GateType::RZ],
            entangling_gate: GateType::CNOT,
        }
    }

    /// Sets the single-qubit gates.
    pub fn with_single_gates(mut self, gates: Vec<GateType>) -> Self {
        self.single_gates = gates;
        self
    }

    /// Sets the entangling gate.
    pub fn with_entangling_gate(mut self, gate: GateType) -> Self {
        self.entangling_gate = gate;
        self
    }

    /// Builds the circuit.
    pub fn build(self) -> QuantumCircuit {
        let mut builder = CircuitBuilder::new(self.num_qubits);

        for _ in 0..self.num_layers {
            builder = builder.rotation_layer(&self.single_gates);
            builder = builder.entangling_layer_linear(self.entangling_gate);
        }

        // Final rotation layer
        builder = builder.rotation_layer(&self.single_gates);

        builder.build()
    }
}

/// Strongly entangling layers generator.
#[derive(Debug, Clone)]
pub struct StronglyEntanglingLayers {
    /// Number of qubits
    pub num_qubits: usize,
    /// Number of layers
    pub num_layers: usize,
}

impl StronglyEntanglingLayers {
    /// Creates a new strongly entangling layers structure.
    pub fn new(num_qubits: usize, num_layers: usize) -> Self {
        StronglyEntanglingLayers {
            num_qubits,
            num_layers,
        }
    }

    /// Builds the circuit.
    pub fn build(self) -> QuantumCircuit {
        let mut builder = CircuitBuilder::new(self.num_qubits);

        for layer in 0..self.num_layers {
            // Three rotation gates per qubit
            builder = builder.rotation_layer(&[GateType::RX, GateType::RY, GateType::RZ]);

            // Entangling layer with offset based on layer number
            let offset = layer % self.num_qubits;
            for i in 0..self.num_qubits {
                let target = (i + offset + 1) % self.num_qubits;
                if i != target {
                    builder = builder.cnot(i, target);
                }
            }
        }

        builder.build()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::SeedableRng;
    use rand_chacha::ChaCha8Rng;

    #[test]
    fn test_circuit_creation() {
        let circuit = QuantumCircuit::new(4);
        assert_eq!(circuit.num_qubits, 4);
        assert_eq!(circuit.gate_count(), 0);
        assert_eq!(circuit.num_parameters, 0);
    }

    #[test]
    fn test_add_single_gate() {
        let mut circuit = QuantumCircuit::new(4);
        circuit.add_single_gate(GateType::RX, 0, Some(1.0)).unwrap();

        assert_eq!(circuit.gate_count(), 1);
        assert_eq!(circuit.num_parameters, 1);
        assert!((circuit.parameters[0] - 1.0).abs() < 1e-10);
    }

    #[test]
    fn test_add_two_qubit_gate() {
        let mut circuit = QuantumCircuit::new(4);
        circuit.add_two_qubit_gate(GateType::CNOT, 0, 1, None).unwrap();

        assert_eq!(circuit.gate_count(), 1);
        assert_eq!(circuit.two_qubit_gate_count(), 1);
    }

    #[test]
    fn test_invalid_gate_application() {
        let mut circuit = QuantumCircuit::new(4);
        assert!(circuit.add_single_gate(GateType::RX, 10, None).is_err());
        assert!(circuit.add_two_qubit_gate(GateType::CNOT, 0, 0, None).is_err());
    }

    #[test]
    fn test_set_parameters() {
        let mut circuit = QuantumCircuit::new(4);
        circuit.add_single_gate(GateType::RX, 0, None).unwrap();
        circuit.add_single_gate(GateType::RY, 1, None).unwrap();

        circuit.set_parameters(&[1.0, 2.0]).unwrap();
        assert!((circuit.parameters[0] - 1.0).abs() < 1e-10);
        assert!((circuit.parameters[1] - 2.0).abs() < 1e-10);
    }

    #[test]
    fn test_parameter_count_mismatch() {
        let mut circuit = QuantumCircuit::new(4);
        circuit.add_single_gate(GateType::RX, 0, None).unwrap();

        assert!(circuit.set_parameters(&[1.0, 2.0, 3.0]).is_err());
    }

    #[test]
    fn test_circuit_builder() {
        let circuit = CircuitBuilder::new(4)
            .ry(0)
            .ry(1)
            .ry(2)
            .ry(3)
            .cnot(0, 1)
            .cnot(1, 2)
            .cnot(2, 3)
            .build();

        assert_eq!(circuit.num_qubits, 4);
        assert_eq!(circuit.num_parameters, 4);
        assert_eq!(circuit.gate_count(), 7);
    }

    #[test]
    fn test_rotation_layer() {
        let circuit = CircuitBuilder::new(4)
            .rotation_layer(&[GateType::RY, GateType::RZ])
            .build();

        assert_eq!(circuit.num_parameters, 8); // 4 qubits * 2 rotations
    }

    #[test]
    fn test_entangling_layers() {
        let linear = CircuitBuilder::new(4)
            .entangling_layer_linear(GateType::CNOT)
            .build();
        assert_eq!(linear.two_qubit_gate_count(), 3);

        let circular = CircuitBuilder::new(4)
            .entangling_layer_circular(GateType::CNOT)
            .build();
        assert_eq!(circular.two_qubit_gate_count(), 4);

        let full = CircuitBuilder::new(4)
            .entangling_layer_full(GateType::CNOT)
            .build();
        assert_eq!(full.two_qubit_gate_count(), 6); // C(4,2) = 6
    }

    #[test]
    fn test_initialization_strategies() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let n = 10;

        let zeros = InitializationStrategy::Zeros.generate(n, &mut rng);
        assert!(zeros.iter().all(|&x| x == 0.0));

        let uniform = InitializationStrategy::Uniform.generate(n, &mut rng);
        assert!(uniform.iter().all(|&x| x >= 0.0 && x <= 2.0 * PI));

        let symmetric = InitializationStrategy::UniformSymmetric.generate(n, &mut rng);
        assert!(symmetric.iter().all(|&x| x >= -PI && x <= PI));
    }

    #[test]
    fn test_gradient_computer() {
        let circuit = CircuitBuilder::new(2).ry(0).ry(1).cnot(0, 1).build();

        let computer = GradientComputer::new();

        // Simple quadratic objective for testing
        let objective = |params: &Array1<f64>| -> f64 {
            params.iter().map(|x| x.powi(2)).sum()
        };

        let grads = computer.compute_gradients(&circuit, objective).unwrap();
        assert_eq!(grads.len(), 2);
    }

    #[test]
    fn test_hessian_computation() {
        let circuit = CircuitBuilder::new(2).ry(0).ry(1).build();

        let computer = GradientComputer::new();

        // Quadratic objective: x^2 + y^2
        let objective = |params: &Array1<f64>| -> f64 {
            params.iter().map(|x| x.powi(2)).sum()
        };

        let hessian = computer.compute_hessian(&circuit, objective).unwrap();
        assert_eq!(hessian.shape(), &[2, 2]);
    }

    #[test]
    fn test_hardware_efficient_ansatz() {
        let ansatz = HardwareEfficientAnsatz::new(4, 2);
        let circuit = ansatz.build();

        assert_eq!(circuit.num_qubits, 4);
        assert!(circuit.num_parameters > 0);
        assert!(circuit.two_qubit_gate_count() > 0);
    }

    #[test]
    fn test_strongly_entangling_layers() {
        let layers = StronglyEntanglingLayers::new(4, 2);
        let circuit = layers.build();

        assert_eq!(circuit.num_qubits, 4);
        // 3 rotations * 4 qubits * 2 layers = 24 parameters
        assert_eq!(circuit.num_parameters, 24);
    }

    #[test]
    fn test_circuit_depth() {
        let circuit = CircuitBuilder::new(4)
            .ry(0)
            .ry(1)
            .cnot(0, 1)
            .ry(0)
            .build();

        let depth = circuit.compute_depth();
        assert!(depth >= 2);
    }

    #[test]
    fn test_circuit_validation() {
        let circuit = CircuitBuilder::new(4)
            .ry(0)
            .cnot(0, 1)
            .build();

        assert!(circuit.validate().is_ok());
    }

    #[test]
    fn test_build_with_strategy() {
        let mut rng = ChaCha8Rng::seed_from_u64(42);

        let circuit = CircuitBuilder::new(4)
            .ry(0)
            .ry(1)
            .build_with_strategy(InitializationStrategy::Small { scale: 0.1 }, &mut rng);

        // Parameters should be small
        assert!(circuit.parameters.iter().all(|&x| x.abs() < 1.0));
    }

    #[test]
    fn test_from_encoding() {
        let space = SearchSpace::hardware_efficient(4, 3).unwrap();
        let mut rng = ChaCha8Rng::seed_from_u64(42);
        let encoding = crate::encoding::DiscreteEncoding::random(&space, &mut rng);

        let circuit = QuantumCircuit::from_encoding(&encoding, &space).unwrap();
        assert_eq!(circuit.num_qubits, 4);
        assert!(circuit.validate().is_ok());
    }
}
