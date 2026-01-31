//! # ruqu-qgat-mol
//!
//! Quantum Graph Attention for Molecules - combines quantum mechanics with graph
//! attention networks for molecular simulation.
//!
//! This crate provides a Tier 1 capability (Score 88) for molecular property prediction
//! using quantum-aware graph neural networks.
//!
//! ## Features
//!
//! - **Molecular Graph Representation**: Atoms as nodes with quantum orbital features,
//!   bonds as edges with quantum coupling strengths.
//! - **Quantum Orbital Encoder**: Slater-type orbital approximations and electron
//!   density representations.
//! - **Quantum Graph Attention**: Multi-head attention with quantum-aware attention
//!   scores based on orbital overlap.
//! - **Molecular Property Prediction**: Energy, HOMO-LUMO gap, dipole moment,
//!   and other properties.
//!
//! ## Quick Start
//!
//! ```rust
//! use ruqu_qgat_mol::{
//!     graph::MolecularGraph,
//!     orbital::OrbitalEncoder,
//!     attention::QuantumGraphAttention,
//!     predictor::{MolecularPredictor, PredictorConfig, PropertyType},
//! };
//!
//! // Create a water molecule
//! let water = MolecularGraph::water();
//!
//! // Predict molecular properties
//! let config = PredictorConfig::default();
//! let predictor = MolecularPredictor::new(config);
//!
//! let energy = predictor.predict(&water, PropertyType::Energy).unwrap();
//! let gap = predictor.predict(&water, PropertyType::HomoLumoGap).unwrap();
//! let dipole = predictor.predict(&water, PropertyType::DipoleMoment).unwrap();
//!
//! println!("Water molecule:");
//! println!("  Energy: {:.2} eV", energy);
//! println!("  HOMO-LUMO gap: {:.2} eV", gap);
//! println!("  Dipole moment: {:.2} D", dipole);
//! ```
//!
//! ## Pre-built Molecules
//!
//! The crate provides several common molecules for testing:
//!
//! ```rust
//! use ruqu_qgat_mol::graph::MolecularGraph;
//!
//! let water = MolecularGraph::water();         // H2O
//! let methane = MolecularGraph::methane();     // CH4
//! let benzene = MolecularGraph::benzene();     // C6H6
//! let ethane = MolecularGraph::ethane();       // C2H6
//! let ethylene = MolecularGraph::ethylene();   // C2H4
//! let acetylene = MolecularGraph::acetylene(); // C2H2
//! let ammonia = MolecularGraph::ammonia();     // NH3
//! let co2 = MolecularGraph::carbon_dioxide();  // CO2
//! ```
//!
//! ## WASM Support
//!
//! Enable the `wasm` feature for WebAssembly support:
//!
//! ```toml
//! [dependencies]
//! ruqu-qgat-mol = { version = "0.1", features = ["wasm"] }
//! ```
//!
//! ## Architecture
//!
//! The prediction pipeline consists of:
//!
//! 1. **Orbital Encoder**: Converts atoms to quantum feature vectors
//! 2. **QGAT Network**: Multi-layer quantum graph attention
//! 3. **Graph Pooling**: Aggregates node features to graph representation
//! 4. **MLP Head**: Predicts target properties
//!
//! ```text
//! Atoms -> OrbitalEncoder -> QGAT Layers -> Pooling -> MLP -> Property
//! ```

#![deny(missing_docs)]
#![deny(unsafe_op_in_unsafe_fn)]
#![warn(clippy::all)]

pub mod attention;
pub mod error;
pub mod graph;
pub mod orbital;
pub mod predictor;

// Re-export commonly used types
pub use attention::{
    GraphPooling, PoolingMethod, QGATConfig, QGATNetwork, QGATNetworkConfig,
    QuantumGraphAttention,
};
pub use error::{AttentionError, GraphError, OrbitalError, PredictionError, QgatMolError, Result};
pub use graph::{Atom, Bond, BondType, Element, Hybridization, MolecularGraph};
pub use orbital::{OrbitalEncoder, OrbitalEncoderConfig, OrbitalType, SlaterOrbital};
pub use predictor::{
    BatchPredictor, DipoleMomentCalculator, HomoLumoCalculator, MolecularPredictor,
    PredictorConfig, PropertyPredictions, PropertyType, ReferenceEnergies,
};

/// Library version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// WASM exports for browser use.
#[cfg(feature = "wasm")]
pub mod wasm {
    use super::*;
    use wasm_bindgen::prelude::*;

    /// WASM-compatible molecular predictor.
    #[wasm_bindgen]
    pub struct WasmMolecularPredictor {
        predictor: MolecularPredictor,
    }

    #[wasm_bindgen]
    impl WasmMolecularPredictor {
        /// Creates a new predictor with default configuration.
        #[wasm_bindgen(constructor)]
        pub fn new() -> Self {
            Self {
                predictor: MolecularPredictor::new(PredictorConfig::default()),
            }
        }

        /// Predicts energy for a water molecule.
        #[wasm_bindgen]
        pub fn predict_water_energy(&self) -> f64 {
            let water = MolecularGraph::water();
            self.predictor
                .predict(&water, PropertyType::Energy)
                .unwrap_or(0.0)
        }

        /// Predicts HOMO-LUMO gap for a water molecule.
        #[wasm_bindgen]
        pub fn predict_water_gap(&self) -> f64 {
            let water = MolecularGraph::water();
            self.predictor
                .predict(&water, PropertyType::HomoLumoGap)
                .unwrap_or(0.0)
        }

        /// Predicts dipole moment for a water molecule.
        #[wasm_bindgen]
        pub fn predict_water_dipole(&self) -> f64 {
            let water = MolecularGraph::water();
            self.predictor
                .predict(&water, PropertyType::DipoleMoment)
                .unwrap_or(0.0)
        }

        /// Predicts energy for a methane molecule.
        #[wasm_bindgen]
        pub fn predict_methane_energy(&self) -> f64 {
            let methane = MolecularGraph::methane();
            self.predictor
                .predict(&methane, PropertyType::Energy)
                .unwrap_or(0.0)
        }

        /// Predicts energy for a benzene molecule.
        #[wasm_bindgen]
        pub fn predict_benzene_energy(&self) -> f64 {
            let benzene = MolecularGraph::benzene();
            self.predictor
                .predict(&benzene, PropertyType::Energy)
                .unwrap_or(0.0)
        }
    }

    impl Default for WasmMolecularPredictor {
        fn default() -> Self {
            Self::new()
        }
    }

    /// WASM-compatible molecular graph.
    #[wasm_bindgen]
    pub struct WasmMolecularGraph {
        inner: MolecularGraph,
    }

    #[wasm_bindgen]
    impl WasmMolecularGraph {
        /// Creates a water molecule.
        #[wasm_bindgen]
        pub fn water() -> Self {
            Self {
                inner: MolecularGraph::water(),
            }
        }

        /// Creates a methane molecule.
        #[wasm_bindgen]
        pub fn methane() -> Self {
            Self {
                inner: MolecularGraph::methane(),
            }
        }

        /// Creates a benzene molecule.
        #[wasm_bindgen]
        pub fn benzene() -> Self {
            Self {
                inner: MolecularGraph::benzene(),
            }
        }

        /// Creates an ammonia molecule.
        #[wasm_bindgen]
        pub fn ammonia() -> Self {
            Self {
                inner: MolecularGraph::ammonia(),
            }
        }

        /// Returns the number of atoms.
        #[wasm_bindgen]
        pub fn num_atoms(&self) -> usize {
            self.inner.num_atoms()
        }

        /// Returns the number of bonds.
        #[wasm_bindgen]
        pub fn num_bonds(&self) -> usize {
            self.inner.num_bonds()
        }

        /// Returns the molecular weight.
        #[wasm_bindgen]
        pub fn molecular_weight(&self) -> f64 {
            self.inner.molecular_weight()
        }

        /// Returns the molecule name if available.
        #[wasm_bindgen]
        pub fn name(&self) -> Option<String> {
            self.inner.name.clone()
        }

        /// Returns the SMILES representation if available.
        #[wasm_bindgen]
        pub fn smiles(&self) -> Option<String> {
            self.inner.smiles.clone()
        }

        /// Returns JSON representation of atom positions.
        #[wasm_bindgen]
        pub fn atom_positions_json(&self) -> String {
            let positions: Vec<[f64; 3]> = self
                .inner
                .atoms()
                .iter()
                .map(|a| a.position)
                .collect();
            serde_json::to_string(&positions).unwrap_or_default()
        }

        /// Returns JSON representation of element symbols.
        #[wasm_bindgen]
        pub fn elements_json(&self) -> String {
            let elements: Vec<&str> = self
                .inner
                .atoms()
                .iter()
                .map(|a| a.element.symbol())
                .collect();
            serde_json::to_string(&elements).unwrap_or_default()
        }
    }

    /// Visualizes a molecule as SVG.
    #[wasm_bindgen]
    pub fn molecule_to_svg(mol: &WasmMolecularGraph, width: u32, height: u32) -> String {
        let atoms = mol.inner.atoms();
        let bonds = mol.inner.bonds();

        if atoms.is_empty() {
            return String::new();
        }

        // Find bounding box
        let mut min_x = f64::INFINITY;
        let mut max_x = f64::NEG_INFINITY;
        let mut min_y = f64::INFINITY;
        let mut max_y = f64::NEG_INFINITY;

        for atom in atoms {
            min_x = min_x.min(atom.position[0]);
            max_x = max_x.max(atom.position[0]);
            min_y = min_y.min(atom.position[1]);
            max_y = max_y.max(atom.position[1]);
        }

        // Add padding
        let padding = 1.0;
        min_x -= padding;
        max_x += padding;
        min_y -= padding;
        max_y += padding;

        let scale_x = (width as f64 - 40.0) / (max_x - min_x).max(0.1);
        let scale_y = (height as f64 - 40.0) / (max_y - min_y).max(0.1);
        let scale = scale_x.min(scale_y);

        let transform = |x: f64, y: f64| -> (f64, f64) {
            let tx = 20.0 + (x - min_x) * scale;
            let ty = 20.0 + (y - min_y) * scale;
            (tx, ty)
        };

        let mut svg = format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" width="{}" height="{}">"#,
            width, height
        );

        // Draw bonds
        for bond in bonds {
            let a1 = &atoms[bond.atom1_idx];
            let a2 = &atoms[bond.atom2_idx];
            let (x1, y1) = transform(a1.position[0], a1.position[1]);
            let (x2, y2) = transform(a2.position[0], a2.position[1]);

            let stroke_width = match bond.bond_type {
                BondType::Single | BondType::Hydrogen => 2,
                BondType::Double => 4,
                BondType::Triple => 6,
                BondType::Aromatic => 3,
                BondType::Ionic => 2,
            };

            svg.push_str(&format!(
                r#"<line x1="{:.1}" y1="{:.1}" x2="{:.1}" y2="{:.1}" stroke="gray" stroke-width="{}"/>"#,
                x1, y1, x2, y2, stroke_width
            ));
        }

        // Draw atoms
        for atom in atoms {
            let (x, y) = transform(atom.position[0], atom.position[1]);
            let color = match atom.element {
                Element::Hydrogen => "#FFFFFF",
                Element::Carbon => "#808080",
                Element::Nitrogen => "#0000FF",
                Element::Oxygen => "#FF0000",
                Element::Fluorine => "#90E050",
                Element::Phosphorus => "#FF8000",
                Element::Sulfur => "#FFFF30",
                Element::Chlorine => "#1FF01F",
                Element::Bromine => "#A62929",
                Element::Iodine => "#940094",
            };

            let radius = match atom.element {
                Element::Hydrogen => 8,
                _ => 12,
            };

            svg.push_str(&format!(
                r#"<circle cx="{:.1}" cy="{:.1}" r="{}" fill="{}" stroke="black" stroke-width="1"/>"#,
                x, y, radius, color
            ));

            // Add element label
            svg.push_str(&format!(
                r#"<text x="{:.1}" y="{:.1}" text-anchor="middle" dominant-baseline="central" font-size="10" font-family="sans-serif">{}</text>"#,
                x, y, atom.element.symbol()
            ));
        }

        svg.push_str("</svg>");
        svg
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version() {
        assert!(!VERSION.is_empty());
    }

    #[test]
    fn test_full_pipeline() {
        // Create a molecule
        let water = MolecularGraph::water();
        assert_eq!(water.num_atoms(), 3);

        // Encode features
        let encoder = OrbitalEncoder::default();
        let features = water.compute_atom_features(&encoder);
        assert_eq!(features.nrows(), 3);

        // Apply attention
        let qgat = QuantumGraphAttention::new(QGATConfig {
            input_dim: encoder.feature_dim(),
            ..Default::default()
        });
        let attended = qgat.forward(&features, &water).unwrap();
        assert_eq!(attended.nrows(), 3);

        // Predict properties
        let predictor = MolecularPredictor::new(PredictorConfig::default());
        let predictions = predictor.predict_all(&water).unwrap();
        assert!(predictions.homo_lumo_gap > 0.0);
    }

    #[test]
    fn test_all_molecules() {
        let molecules = vec![
            MolecularGraph::water(),
            MolecularGraph::methane(),
            MolecularGraph::benzene(),
            MolecularGraph::ethane(),
            MolecularGraph::ethylene(),
            MolecularGraph::acetylene(),
            MolecularGraph::ammonia(),
            MolecularGraph::carbon_dioxide(),
        ];

        let predictor = MolecularPredictor::new(PredictorConfig::default());

        for mol in molecules {
            assert!(mol.validate().is_ok());
            let result = predictor.predict(&mol, PropertyType::Energy);
            assert!(result.is_ok(), "Failed for {:?}", mol.name);
        }
    }

    #[test]
    fn test_orbital_types() {
        let s = OrbitalType::S { n: 1 };
        assert_eq!(s.angular_momentum(), 0);

        let p = OrbitalType::P { n: 2, m: 1 };
        assert_eq!(p.angular_momentum(), 1);

        let d = OrbitalType::D { n: 3, m: 0 };
        assert_eq!(d.angular_momentum(), 2);
    }

    #[test]
    fn test_error_types() {
        let err = GraphError::EmptyMolecule;
        let main_err: QgatMolError = err.into();
        assert!(matches!(main_err, QgatMolError::Graph(_)));
    }

    #[test]
    fn test_re_exports() {
        // Verify all re-exports are accessible
        let _ = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);
        let _ = Bond::new(0, 1, BondType::Single);
        let _ = SlaterOrbital::new(OrbitalType::S { n: 1 }, 1.0);
        let _ = HomoLumoCalculator::default();
        let _ = DipoleMomentCalculator::default();
        let _ = ReferenceEnergies::default();
    }
}
