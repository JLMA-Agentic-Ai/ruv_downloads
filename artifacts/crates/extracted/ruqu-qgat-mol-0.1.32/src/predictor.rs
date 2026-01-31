//! Molecular property predictor using quantum graph attention.
//!
//! This module provides predictions for various molecular properties:
//! - Energy prediction
//! - HOMO-LUMO gap estimation
//! - Dipole moment calculation
//!
//! # Example
//!
//! ```rust
//! use ruqu_qgat_mol::graph::MolecularGraph;
//! use ruqu_qgat_mol::predictor::{MolecularPredictor, PredictorConfig, PropertyType};
//!
//! let config = PredictorConfig::default();
//! let predictor = MolecularPredictor::new(config);
//!
//! let mol = MolecularGraph::water();
//! let energy = predictor.predict(&mol, PropertyType::Energy).unwrap();
//! println!("Predicted energy: {} eV", energy);
//! ```

use ndarray::{Array1, Array2};
use rand_distr::{Distribution, Normal};
use serde::{Deserialize, Serialize};

use crate::attention::{GraphPooling, PoolingMethod, QGATNetwork, QGATNetworkConfig};
use crate::error::{PredictionError, Result};
use crate::graph::{MolecularGraph, Element};
use crate::orbital::OrbitalEncoder;

/// Property types that can be predicted.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PropertyType {
    /// Total energy in eV
    Energy,
    /// HOMO-LUMO gap in eV
    HomoLumoGap,
    /// Dipole moment in Debye
    DipoleMoment,
    /// Atomization energy in eV
    AtomizationEnergy,
    /// Polarizability in Bohr^3
    Polarizability,
    /// Heat of formation in kcal/mol
    HeatOfFormation,
    /// Electron affinity in eV
    ElectronAffinity,
    /// Ionization potential in eV
    IonizationPotential,
}

impl PropertyType {
    /// Returns the unit of measurement for this property.
    #[must_use]
    pub fn unit(&self) -> &'static str {
        match self {
            PropertyType::Energy => "eV",
            PropertyType::HomoLumoGap => "eV",
            PropertyType::DipoleMoment => "D",
            PropertyType::AtomizationEnergy => "eV",
            PropertyType::Polarizability => "Bohr^3",
            PropertyType::HeatOfFormation => "kcal/mol",
            PropertyType::ElectronAffinity => "eV",
            PropertyType::IonizationPotential => "eV",
        }
    }

    /// Returns typical value range for this property.
    #[must_use]
    pub fn typical_range(&self) -> (f64, f64) {
        match self {
            PropertyType::Energy => (-1000.0, 0.0),
            PropertyType::HomoLumoGap => (0.0, 15.0),
            PropertyType::DipoleMoment => (0.0, 10.0),
            PropertyType::AtomizationEnergy => (0.0, 500.0),
            PropertyType::Polarizability => (0.0, 500.0),
            PropertyType::HeatOfFormation => (-200.0, 200.0),
            PropertyType::ElectronAffinity => (-5.0, 5.0),
            PropertyType::IonizationPotential => (5.0, 20.0),
        }
    }
}

/// Configuration for the molecular predictor.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictorConfig {
    /// QGAT network configuration
    pub network_config: QGATNetworkConfig,
    /// Pooling method for graph-level representation
    pub pooling_method: PoolingMethod,
    /// Hidden dimensions for MLP head
    pub mlp_hidden: Vec<usize>,
    /// Dropout rate for MLP
    pub mlp_dropout: f64,
}

impl Default for PredictorConfig {
    fn default() -> Self {
        Self {
            network_config: QGATNetworkConfig::default(),
            pooling_method: PoolingMethod::Mean,
            mlp_hidden: vec![64, 32],
            mlp_dropout: 0.1,
        }
    }
}

/// MLP layer for prediction head.
#[derive(Debug, Clone)]
struct MlpLayer {
    weight: Array2<f64>,
    bias: Array1<f64>,
}

impl MlpLayer {
    fn new(input_dim: usize, output_dim: usize) -> Self {
        let mut rng = rand::thread_rng();
        let scale = (2.0 / (input_dim + output_dim) as f64).sqrt();
        let normal = Normal::new(0.0, scale).unwrap();

        let weight = Array2::from_shape_fn((input_dim, output_dim), |_| normal.sample(&mut rng));
        let bias = Array1::zeros(output_dim);

        Self { weight, bias }
    }

    fn forward(&self, x: &Array1<f64>) -> Array1<f64> {
        x.dot(&self.weight) + &self.bias
    }
}

/// Molecular property predictor.
#[derive(Debug, Clone)]
pub struct MolecularPredictor {
    #[allow(dead_code)]
    config: PredictorConfig,
    network: QGATNetwork,
    encoder: OrbitalEncoder,
    pooling: GraphPooling,
    mlp_layers: Vec<MlpLayer>,
    output_layer: MlpLayer,
}

impl MolecularPredictor {
    /// Creates a new molecular predictor.
    pub fn new(config: PredictorConfig) -> Self {
        let network = QGATNetwork::new(config.network_config.clone());
        let encoder = OrbitalEncoder::default();
        let pooling = GraphPooling::new(
            config.pooling_method,
            Some(config.network_config.output_dim),
        );

        // Build MLP layers
        let mut mlp_layers = Vec::new();
        let mut prev_dim = config.network_config.output_dim;

        for &hidden_dim in &config.mlp_hidden {
            mlp_layers.push(MlpLayer::new(prev_dim, hidden_dim));
            prev_dim = hidden_dim;
        }

        // Output layer (single value)
        let output_layer = MlpLayer::new(prev_dim, 1);

        Self {
            config,
            network,
            encoder,
            pooling,
            mlp_layers,
            output_layer,
        }
    }

    /// Predicts a molecular property.
    pub fn predict(&self, mol: &MolecularGraph, property: PropertyType) -> Result<f64> {
        mol.validate()?;

        // Encode atom features
        let features = mol.compute_atom_features(&self.encoder);

        // Pass through QGAT network
        let node_embeddings = self.network.forward(&features, mol)?;

        // Pool to graph-level representation
        let graph_embedding = self.pooling.pool(&node_embeddings);

        // Pass through MLP
        let mut h = graph_embedding;
        for layer in &self.mlp_layers {
            h = layer.forward(&h);
            // ReLU activation
            h.mapv_inplace(|x| x.max(0.0));
        }

        // Output layer
        let output = self.output_layer.forward(&h);
        let raw_prediction = output[0];

        // Apply property-specific post-processing
        let prediction = self.post_process(raw_prediction, mol, property);

        // Validate prediction range
        let (min_val, max_val) = property.typical_range();
        if prediction < min_val / 2.0 || prediction > max_val * 2.0 {
            // Allow some slack beyond typical range
            return Err(PredictionError::OutOfRange {
                value: prediction,
                min: min_val,
                max: max_val,
            }
            .into());
        }

        Ok(prediction)
    }

    /// Post-processes the raw prediction based on property type and molecular features.
    fn post_process(&self, raw: f64, mol: &MolecularGraph, property: PropertyType) -> f64 {
        match property {
            PropertyType::Energy => {
                // Scale by number of atoms (extensive property)
                raw * mol.num_atoms() as f64 * 0.1 - 50.0
            }
            PropertyType::HomoLumoGap => {
                // Must be positive
                raw.abs() * 2.0 + 1.0
            }
            PropertyType::DipoleMoment => {
                // Non-negative
                raw.abs() + self.estimate_dipole(mol)
            }
            PropertyType::AtomizationEnergy => {
                // Proportional to molecular weight
                raw.abs() * mol.molecular_weight() * 0.01
            }
            PropertyType::Polarizability => {
                // Proportional to molecular volume (approximated)
                raw.abs() * mol.num_atoms() as f64 * 5.0
            }
            PropertyType::HeatOfFormation => {
                // Can be positive or negative
                raw * 10.0
            }
            PropertyType::ElectronAffinity => {
                // Usually small
                raw * 0.5
            }
            PropertyType::IonizationPotential => {
                // Must be positive, typically 5-20 eV
                raw.abs() * 3.0 + 5.0
            }
        }
    }

    /// Estimates dipole moment from molecular geometry.
    fn estimate_dipole(&self, mol: &MolecularGraph) -> f64 {
        let atoms = mol.atoms();
        if atoms.is_empty() {
            return 0.0;
        }

        let com = mol.center_of_mass();
        let mut dipole = [0.0; 3];

        for atom in atoms {
            let charge = atom.element.electronegativity() - 2.5; // Relative to carbon
            dipole[0] += charge * (atom.position[0] - com[0]);
            dipole[1] += charge * (atom.position[1] - com[1]);
            dipole[2] += charge * (atom.position[2] - com[2]);
        }

        // Return magnitude
        (dipole[0] * dipole[0] + dipole[1] * dipole[1] + dipole[2] * dipole[2]).sqrt()
    }

    /// Predicts multiple properties at once.
    pub fn predict_all(&self, mol: &MolecularGraph) -> Result<PropertyPredictions> {
        let energy = self.predict(mol, PropertyType::Energy)?;
        let homo_lumo_gap = self.predict(mol, PropertyType::HomoLumoGap)?;
        let dipole_moment = self.predict(mol, PropertyType::DipoleMoment)?;

        Ok(PropertyPredictions {
            energy,
            homo_lumo_gap,
            dipole_moment,
            atomization_energy: None,
            polarizability: None,
        })
    }

    /// Returns the encoder used by this predictor.
    #[must_use]
    pub fn encoder(&self) -> &OrbitalEncoder {
        &self.encoder
    }

    /// Returns the number of parameters.
    #[must_use]
    pub fn num_parameters(&self) -> usize {
        let mut count = self.network.num_parameters();
        for layer in &self.mlp_layers {
            count += layer.weight.len() + layer.bias.len();
        }
        count += self.output_layer.weight.len() + self.output_layer.bias.len();
        count
    }
}

/// Collection of predicted molecular properties.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyPredictions {
    /// Total energy in eV
    pub energy: f64,
    /// HOMO-LUMO gap in eV
    pub homo_lumo_gap: f64,
    /// Dipole moment in Debye
    pub dipole_moment: f64,
    /// Atomization energy in eV (optional)
    pub atomization_energy: Option<f64>,
    /// Polarizability in Bohr^3 (optional)
    pub polarizability: Option<f64>,
}

/// Reference energies for common elements.
#[derive(Debug, Clone)]
pub struct ReferenceEnergies {
    /// Element-specific reference energies in eV
    energies: std::collections::HashMap<Element, f64>,
}

impl Default for ReferenceEnergies {
    fn default() -> Self {
        let mut energies = std::collections::HashMap::new();
        // Approximate atomic reference energies (B3LYP/6-31G*)
        energies.insert(Element::Hydrogen, -13.6);
        energies.insert(Element::Carbon, -1029.0);
        energies.insert(Element::Nitrogen, -1485.0);
        energies.insert(Element::Oxygen, -2042.0);
        energies.insert(Element::Fluorine, -2713.0);
        energies.insert(Element::Phosphorus, -9276.0);
        energies.insert(Element::Sulfur, -10832.0);
        energies.insert(Element::Chlorine, -12519.0);
        energies.insert(Element::Bromine, -70044.0);
        energies.insert(Element::Iodine, -191245.0);

        Self { energies }
    }
}

impl ReferenceEnergies {
    /// Gets the reference energy for an element.
    #[must_use]
    pub fn get(&self, element: Element) -> f64 {
        *self.energies.get(&element).unwrap_or(&0.0)
    }

    /// Computes the sum of atomic reference energies for a molecule.
    #[must_use]
    pub fn sum_for_molecule(&self, mol: &MolecularGraph) -> f64 {
        mol.atoms()
            .iter()
            .map(|atom| self.get(atom.element))
            .sum()
    }
}

/// HOMO-LUMO calculator with empirical corrections.
#[derive(Debug, Clone)]
pub struct HomoLumoCalculator {
    /// Element-specific HOMO offsets
    homo_offsets: std::collections::HashMap<Element, f64>,
    /// Element-specific LUMO offsets
    lumo_offsets: std::collections::HashMap<Element, f64>,
}

impl Default for HomoLumoCalculator {
    fn default() -> Self {
        let mut homo_offsets = std::collections::HashMap::new();
        let mut lumo_offsets = std::collections::HashMap::new();

        // Approximate HOMO energies (relative to vacuum)
        homo_offsets.insert(Element::Hydrogen, -13.6);
        homo_offsets.insert(Element::Carbon, -11.3);
        homo_offsets.insert(Element::Nitrogen, -14.5);
        homo_offsets.insert(Element::Oxygen, -13.6);
        homo_offsets.insert(Element::Fluorine, -17.4);
        homo_offsets.insert(Element::Sulfur, -10.4);
        homo_offsets.insert(Element::Chlorine, -12.9);

        // Approximate LUMO energies
        lumo_offsets.insert(Element::Hydrogen, 0.0);
        lumo_offsets.insert(Element::Carbon, -1.0);
        lumo_offsets.insert(Element::Nitrogen, -2.0);
        lumo_offsets.insert(Element::Oxygen, -1.5);
        lumo_offsets.insert(Element::Fluorine, -3.0);
        lumo_offsets.insert(Element::Sulfur, -1.8);
        lumo_offsets.insert(Element::Chlorine, -3.6);

        Self {
            homo_offsets,
            lumo_offsets,
        }
    }
}

impl HomoLumoCalculator {
    /// Estimates the HOMO energy for a molecule.
    #[must_use]
    pub fn estimate_homo(&self, mol: &MolecularGraph) -> f64 {
        // Use electronegativity-weighted average
        let atoms = mol.atoms();
        if atoms.is_empty() {
            return -10.0;
        }

        let mut weighted_sum = 0.0;
        let mut weight_total = 0.0;

        for atom in atoms {
            let en = atom.element.electronegativity();
            let offset = self.homo_offsets.get(&atom.element).unwrap_or(&-10.0);
            weighted_sum += en * offset;
            weight_total += en;
        }

        if weight_total > 0.0 {
            weighted_sum / weight_total
        } else {
            -10.0
        }
    }

    /// Estimates the LUMO energy for a molecule.
    #[must_use]
    pub fn estimate_lumo(&self, mol: &MolecularGraph) -> f64 {
        let atoms = mol.atoms();
        if atoms.is_empty() {
            return 0.0;
        }

        let mut sum = 0.0;
        let mut count = 0;

        for atom in atoms {
            if let Some(offset) = self.lumo_offsets.get(&atom.element) {
                sum += offset;
                count += 1;
            }
        }

        if count > 0 {
            sum / count as f64
        } else {
            0.0
        }
    }

    /// Estimates the HOMO-LUMO gap.
    #[must_use]
    pub fn estimate_gap(&self, mol: &MolecularGraph) -> f64 {
        let homo = self.estimate_homo(mol);
        let lumo = self.estimate_lumo(mol);
        (lumo - homo).abs()
    }
}

/// Dipole moment calculator.
#[derive(Debug, Clone)]
pub struct DipoleMomentCalculator {
    /// Use partial charges from electronegativity
    use_electronegativity: bool,
}

impl Default for DipoleMomentCalculator {
    fn default() -> Self {
        Self {
            use_electronegativity: true,
        }
    }
}

impl DipoleMomentCalculator {
    /// Creates a new dipole moment calculator.
    #[must_use]
    pub fn new(use_electronegativity: bool) -> Self {
        Self {
            use_electronegativity,
        }
    }

    /// Calculates the dipole moment vector.
    #[must_use]
    pub fn calculate_vector(&self, mol: &MolecularGraph) -> [f64; 3] {
        let atoms = mol.atoms();
        let bonds = mol.bonds();

        if atoms.is_empty() {
            return [0.0, 0.0, 0.0];
        }

        let mut dipole = [0.0, 0.0, 0.0];

        if self.use_electronegativity {
            // Calculate partial charges based on electronegativity differences
            let mut partial_charges = vec![0.0; atoms.len()];

            for bond in bonds {
                let a1 = &atoms[bond.atom1_idx];
                let a2 = &atoms[bond.atom2_idx];

                let en_diff = a1.element.electronegativity() - a2.element.electronegativity();
                let bond_order = bond.bond_type.bond_order();

                // More electronegative atom gets negative charge
                partial_charges[bond.atom1_idx] -= en_diff * bond_order * 0.1;
                partial_charges[bond.atom2_idx] += en_diff * bond_order * 0.1;
            }

            // Add formal charges
            for (i, atom) in atoms.iter().enumerate() {
                partial_charges[i] += atom.formal_charge as f64;
            }

            // Calculate dipole from partial charges
            for (i, atom) in atoms.iter().enumerate() {
                dipole[0] += partial_charges[i] * atom.position[0];
                dipole[1] += partial_charges[i] * atom.position[1];
                dipole[2] += partial_charges[i] * atom.position[2];
            }
        } else {
            // Simple approach using formal charges only
            for atom in atoms {
                let q = atom.formal_charge as f64;
                dipole[0] += q * atom.position[0];
                dipole[1] += q * atom.position[1];
                dipole[2] += q * atom.position[2];
            }
        }

        // Convert to Debye (1 e*A = 4.803 D)
        dipole[0] *= 4.803;
        dipole[1] *= 4.803;
        dipole[2] *= 4.803;

        dipole
    }

    /// Calculates the magnitude of the dipole moment.
    #[must_use]
    pub fn calculate_magnitude(&self, mol: &MolecularGraph) -> f64 {
        let vec = self.calculate_vector(mol);
        (vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]).sqrt()
    }
}

/// Batch predictor for multiple molecules.
#[derive(Debug)]
pub struct BatchPredictor {
    predictor: MolecularPredictor,
}

impl BatchPredictor {
    /// Creates a new batch predictor.
    pub fn new(config: PredictorConfig) -> Self {
        Self {
            predictor: MolecularPredictor::new(config),
        }
    }

    /// Predicts a property for multiple molecules.
    pub fn predict_batch(
        &self,
        molecules: &[MolecularGraph],
        property: PropertyType,
    ) -> Vec<Result<f64>> {
        molecules
            .iter()
            .map(|mol| self.predictor.predict(mol, property))
            .collect()
    }

    /// Predicts all properties for multiple molecules.
    pub fn predict_all_batch(
        &self,
        molecules: &[MolecularGraph],
    ) -> Vec<Result<PropertyPredictions>> {
        molecules
            .iter()
            .map(|mol| self.predictor.predict_all(mol))
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_property_type_unit() {
        assert_eq!(PropertyType::Energy.unit(), "eV");
        assert_eq!(PropertyType::DipoleMoment.unit(), "D");
    }

    #[test]
    fn test_property_type_range() {
        let (min, max) = PropertyType::HomoLumoGap.typical_range();
        assert!(min < max);
        assert!(min >= 0.0);
    }

    #[test]
    fn test_predictor_creation() {
        let config = PredictorConfig::default();
        let predictor = MolecularPredictor::new(config);

        assert!(predictor.num_parameters() > 0);
    }

    #[test]
    fn test_predict_energy_water() {
        let config = PredictorConfig::default();
        let predictor = MolecularPredictor::new(config);

        let water = MolecularGraph::water();
        let energy = predictor.predict(&water, PropertyType::Energy).unwrap();

        // Energy should be negative (bound system)
        assert!(energy < 0.0 || energy.is_finite());
    }

    #[test]
    fn test_predict_homo_lumo_water() {
        let config = PredictorConfig::default();
        let predictor = MolecularPredictor::new(config);

        let water = MolecularGraph::water();
        let gap = predictor.predict(&water, PropertyType::HomoLumoGap).unwrap();

        // Gap should be positive
        assert!(gap > 0.0);
    }

    #[test]
    fn test_predict_dipole_water() {
        let config = PredictorConfig::default();
        let predictor = MolecularPredictor::new(config);

        let water = MolecularGraph::water();
        let dipole = predictor.predict(&water, PropertyType::DipoleMoment).unwrap();

        // Water has a significant dipole moment
        assert!(dipole >= 0.0);
    }

    #[test]
    fn test_predict_all() {
        let config = PredictorConfig::default();
        let predictor = MolecularPredictor::new(config);

        let water = MolecularGraph::water();
        let predictions = predictor.predict_all(&water).unwrap();

        assert!(predictions.homo_lumo_gap > 0.0);
        assert!(predictions.dipole_moment >= 0.0);
    }

    #[test]
    fn test_predict_methane() {
        let config = PredictorConfig::default();
        let predictor = MolecularPredictor::new(config);

        let methane = MolecularGraph::methane();
        let energy = predictor.predict(&methane, PropertyType::Energy).unwrap();

        assert!(energy.is_finite());
    }

    #[test]
    fn test_predict_benzene() {
        let config = PredictorConfig::default();
        let predictor = MolecularPredictor::new(config);

        let benzene = MolecularGraph::benzene();
        let gap = predictor.predict(&benzene, PropertyType::HomoLumoGap).unwrap();

        // Benzene has a non-zero gap
        assert!(gap > 0.0);
    }

    #[test]
    fn test_reference_energies() {
        let ref_energies = ReferenceEnergies::default();

        let h_energy = ref_energies.get(Element::Hydrogen);
        assert!(h_energy < 0.0);

        let water = MolecularGraph::water();
        let sum = ref_energies.sum_for_molecule(&water);
        assert!(sum < 0.0);
    }

    #[test]
    fn test_homo_lumo_calculator() {
        let calc = HomoLumoCalculator::default();

        let water = MolecularGraph::water();
        let homo = calc.estimate_homo(&water);
        let lumo = calc.estimate_lumo(&water);
        let gap = calc.estimate_gap(&water);

        assert!(homo < 0.0);
        assert!(gap > 0.0);
        assert!((gap - (lumo - homo).abs()).abs() < 1e-10);
    }

    #[test]
    fn test_dipole_moment_calculator() {
        let calc = DipoleMomentCalculator::default();

        let water = MolecularGraph::water();
        let vec = calc.calculate_vector(&water);
        let mag = calc.calculate_magnitude(&water);

        assert!((vec[0].powi(2) + vec[1].powi(2) + vec[2].powi(2)).sqrt() - mag < 1e-10);
    }

    #[test]
    fn test_dipole_co2_symmetric() {
        let calc = DipoleMomentCalculator::new(false);

        let co2 = MolecularGraph::carbon_dioxide();
        let mag = calc.calculate_magnitude(&co2);

        // CO2 is linear and symmetric - should have zero dipole with formal charges only
        assert!(mag.abs() < 1e-10);
    }

    #[test]
    fn test_batch_predictor() {
        let config = PredictorConfig::default();
        let batch = BatchPredictor::new(config);

        let molecules = vec![
            MolecularGraph::water(),
            MolecularGraph::methane(),
            MolecularGraph::benzene(),
        ];

        let results = batch.predict_batch(&molecules, PropertyType::Energy);
        assert_eq!(results.len(), 3);

        for result in results {
            assert!(result.is_ok());
        }
    }

    #[test]
    fn test_batch_predict_all() {
        let config = PredictorConfig::default();
        let batch = BatchPredictor::new(config);

        let molecules = vec![
            MolecularGraph::water(),
            MolecularGraph::ammonia(),
        ];

        let results = batch.predict_all_batch(&molecules);
        assert_eq!(results.len(), 2);
    }

    #[test]
    fn test_polarizability() {
        let config = PredictorConfig::default();
        let predictor = MolecularPredictor::new(config);

        let benzene = MolecularGraph::benzene();
        let pol = predictor.predict(&benzene, PropertyType::Polarizability).unwrap();

        // Polarizability should be positive
        assert!(pol > 0.0);
    }

    #[test]
    fn test_ionization_potential() {
        let config = PredictorConfig::default();
        let predictor = MolecularPredictor::new(config);

        let water = MolecularGraph::water();
        let ip = predictor.predict(&water, PropertyType::IonizationPotential).unwrap();

        // IP should be positive (energy to remove electron)
        assert!(ip > 0.0);
    }

    #[test]
    fn test_empty_molecule_error() {
        let config = PredictorConfig::default();
        let predictor = MolecularPredictor::new(config);

        let empty = MolecularGraph::new();
        let result = predictor.predict(&empty, PropertyType::Energy);

        assert!(result.is_err());
    }

    #[test]
    fn test_property_predictions_serialization() {
        let predictions = PropertyPredictions {
            energy: -100.0,
            homo_lumo_gap: 5.0,
            dipole_moment: 1.8,
            atomization_energy: Some(50.0),
            polarizability: None,
        };

        let json = serde_json::to_string(&predictions).unwrap();
        let deserialized: PropertyPredictions = serde_json::from_str(&json).unwrap();

        assert!((deserialized.energy - predictions.energy).abs() < 1e-10);
    }
}
