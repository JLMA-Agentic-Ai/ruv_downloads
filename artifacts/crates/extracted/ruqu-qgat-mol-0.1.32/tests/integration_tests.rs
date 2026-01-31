//! Integration tests for ruqu-qgat-mol crate.
//!
//! Tests the complete pipeline from molecular graph creation through
//! property prediction.

use ruqu_qgat_mol::{
    attention::{GraphPooling, PoolingMethod, QGATConfig, QGATNetwork, QGATNetworkConfig, QuantumGraphAttention},
    error::{AttentionError, GraphError, OrbitalError, QgatMolError},
    graph::{Atom, Bond, BondType, Element, Hybridization, MolecularGraph},
    orbital::{ElectronDensity, OrbitalEncoder, OrbitalEncoderConfig, OrbitalType, QuantumCoupling, SlaterOrbital},
    predictor::{
        BatchPredictor, DipoleMomentCalculator, HomoLumoCalculator, MolecularPredictor,
        PredictorConfig, PropertyType, ReferenceEnergies,
    },
};

// ============================================================================
// Molecular Graph Tests
// ============================================================================

#[test]
fn test_water_molecule_structure() {
    let water = MolecularGraph::water();

    assert_eq!(water.num_atoms(), 3);
    assert_eq!(water.num_bonds(), 2);
    assert_eq!(water.name.as_deref(), Some("Water"));
    assert_eq!(water.smiles.as_deref(), Some("O"));

    // Check oxygen is first atom
    let oxygen = water.atom(0).unwrap();
    assert_eq!(oxygen.element, Element::Oxygen);

    // Check hydrogens
    let h1 = water.atom(1).unwrap();
    let h2 = water.atom(2).unwrap();
    assert_eq!(h1.element, Element::Hydrogen);
    assert_eq!(h2.element, Element::Hydrogen);
}

#[test]
fn test_methane_molecule_structure() {
    let methane = MolecularGraph::methane();

    assert_eq!(methane.num_atoms(), 5);
    assert_eq!(methane.num_bonds(), 4);

    // Carbon is first
    let carbon = methane.atom(0).unwrap();
    assert_eq!(carbon.element, Element::Carbon);

    // Check all bonds are single
    for bond in methane.bonds() {
        assert_eq!(bond.bond_type, BondType::Single);
    }
}

#[test]
fn test_benzene_molecule_structure() {
    let benzene = MolecularGraph::benzene();

    assert_eq!(benzene.num_atoms(), 12); // 6 C + 6 H
    assert_eq!(benzene.num_bonds(), 12); // 6 C-C + 6 C-H

    // Count aromatic atoms
    let aromatic_count = benzene.atoms().iter().filter(|a| a.is_aromatic).count();
    assert_eq!(aromatic_count, 6);

    // Count aromatic bonds
    let aromatic_bonds = benzene
        .bonds()
        .iter()
        .filter(|b| b.bond_type == BondType::Aromatic)
        .count();
    assert_eq!(aromatic_bonds, 6);
}

#[test]
fn test_ethylene_double_bond() {
    let ethylene = MolecularGraph::ethylene();

    assert_eq!(ethylene.num_atoms(), 6); // 2 C + 4 H

    // Find C=C bond
    let cc_bond = ethylene.bond_between(0, 1).unwrap();
    assert_eq!(cc_bond.bond_type, BondType::Double);
    assert!((cc_bond.bond_type.bond_order() - 2.0).abs() < 1e-10);
}

#[test]
fn test_acetylene_triple_bond() {
    let acetylene = MolecularGraph::acetylene();

    assert_eq!(acetylene.num_atoms(), 4); // 2 C + 2 H

    let cc_bond = acetylene.bond_between(0, 1).unwrap();
    assert_eq!(cc_bond.bond_type, BondType::Triple);
    assert!((cc_bond.bond_type.bond_order() - 3.0).abs() < 1e-10);
}

#[test]
fn test_molecular_weight_calculation() {
    let water = MolecularGraph::water();
    let mw = water.molecular_weight();
    // H2O = 2*1.008 + 15.999 = 18.015
    assert!((mw - 18.015).abs() < 0.01);

    let methane = MolecularGraph::methane();
    let mw = methane.molecular_weight();
    // CH4 = 12.011 + 4*1.008 = 16.043
    assert!((mw - 16.043).abs() < 0.01);
}

#[test]
fn test_adjacency_matrix() {
    let water = MolecularGraph::water();
    let adj = water.adjacency_matrix();

    assert_eq!(adj.shape(), &[3, 3]);

    // Symmetric
    for i in 0..3 {
        for j in 0..3 {
            assert!((adj[[i, j]] - adj[[j, i]]).abs() < 1e-10);
        }
    }

    // Diagonal is zero (no self-loops)
    for i in 0..3 {
        assert!((adj[[i, i]]).abs() < 1e-10);
    }
}

#[test]
fn test_center_of_mass() {
    let water = MolecularGraph::water();
    let com = water.center_of_mass();

    // COM should be close to oxygen (heaviest atom at origin)
    assert!(com[0].abs() < 1.0);
    assert!(com[1].abs() < 1.0);
    assert!(com[2].abs() < 1.0);
}

#[test]
fn test_custom_molecule_construction() {
    let mut graph = MolecularGraph::new();

    let c = graph.add_atom(Atom::new(Element::Carbon, [0.0, 0.0, 0.0]));
    let o = graph.add_atom(
        Atom::new(Element::Oxygen, [1.2, 0.0, 0.0]).with_charge(-1),
    );

    graph.add_bond(Bond::new(c, o, BondType::Double)).unwrap();

    assert_eq!(graph.num_atoms(), 2);
    assert_eq!(graph.num_bonds(), 1);
    assert_eq!(graph.total_charge(), -1);
}

#[test]
fn test_graph_validation() {
    let water = MolecularGraph::water();
    assert!(water.validate().is_ok());

    let empty = MolecularGraph::new();
    assert!(empty.validate().is_err());
}

#[test]
fn test_self_loop_error() {
    let mut graph = MolecularGraph::new();
    let c = graph.add_atom(Atom::new(Element::Carbon, [0.0, 0.0, 0.0]));

    let result = graph.add_bond(Bond::new(c, c, BondType::Single));
    assert!(matches!(result, Err(QgatMolError::Graph(GraphError::SelfLoop(_)))));
}

#[test]
fn test_duplicate_bond_error() {
    let mut graph = MolecularGraph::new();
    let c = graph.add_atom(Atom::new(Element::Carbon, [0.0, 0.0, 0.0]));
    let h = graph.add_atom(Atom::new(Element::Hydrogen, [1.0, 0.0, 0.0]));

    graph.add_bond(Bond::new(c, h, BondType::Single)).unwrap();
    let result = graph.add_bond(Bond::new(c, h, BondType::Single));
    assert!(matches!(result, Err(QgatMolError::Graph(GraphError::DuplicateBond(_, _)))));
}

// ============================================================================
// Element and Bond Tests
// ============================================================================

#[test]
fn test_element_properties() {
    assert_eq!(Element::Carbon.atomic_number(), 6);
    assert_eq!(Element::Oxygen.atomic_number(), 8);
    assert_eq!(Element::Carbon.symbol(), "C");
    assert_eq!(Element::Chlorine.symbol(), "Cl");
    assert!((Element::Oxygen.electronegativity() - 3.44).abs() < 0.01);
}

#[test]
fn test_element_from_symbol() {
    assert_eq!(Element::from_symbol("C"), Some(Element::Carbon));
    assert_eq!(Element::from_symbol("o"), Some(Element::Oxygen));
    assert_eq!(Element::from_symbol("Br"), Some(Element::Bromine));
    assert_eq!(Element::from_symbol("Xy"), None);
}

#[test]
fn test_element_from_atomic_number() {
    assert_eq!(Element::from_atomic_number(1), Some(Element::Hydrogen));
    assert_eq!(Element::from_atomic_number(6), Some(Element::Carbon));
    assert_eq!(Element::from_atomic_number(99), None);
}

#[test]
fn test_bond_type_properties() {
    assert!((BondType::Single.bond_order() - 1.0).abs() < 1e-10);
    assert!((BondType::Double.bond_order() - 2.0).abs() < 1e-10);
    assert!((BondType::Aromatic.bond_order() - 1.5).abs() < 1e-10);

    assert!(BondType::Triple.quantum_coupling() > BondType::Single.quantum_coupling());
}

#[test]
fn test_hybridization() {
    assert_eq!(Hybridization::Sp3.num_orbitals(), 4);
    assert_eq!(Hybridization::Sp2.num_orbitals(), 3);
    assert!((Hybridization::Sp3.bond_angle() - 109.47).abs() < 0.01);
}

// ============================================================================
// Orbital Encoder Tests
// ============================================================================

#[test]
fn test_orbital_type_quantum_numbers() {
    let s = OrbitalType::S { n: 1 };
    assert_eq!(s.principal_quantum_number(), 1);
    assert_eq!(s.angular_momentum(), 0);
    assert_eq!(s.magnetic_quantum_number(), 0);

    let p = OrbitalType::P { n: 2, m: 1 };
    assert_eq!(p.principal_quantum_number(), 2);
    assert_eq!(p.angular_momentum(), 1);
    assert_eq!(p.magnetic_quantum_number(), 1);
}

#[test]
fn test_orbital_validation() {
    let valid = OrbitalType::P { n: 2, m: 0 };
    assert!(valid.validate().is_ok());

    let invalid = OrbitalType::P { n: 2, m: 5 }; // |m| > l
    assert!(invalid.validate().is_err());
}

#[test]
fn test_slater_orbital_radial() {
    let slater = SlaterOrbital::new(OrbitalType::S { n: 1 }, 1.0);

    // Radial function should decay
    let r1 = slater.radial(0.5);
    let r2 = slater.radial(1.0);
    let r3 = slater.radial(2.0);

    assert!(r1 > r2);
    assert!(r2 > r3);
    assert!(r3 > 0.0);
}

#[test]
fn test_orbital_encoder_feature_dim() {
    let encoder = OrbitalEncoder::default();
    let dim = encoder.feature_dim();

    assert!(dim > 20);
    assert!(dim < 100);
}

#[test]
fn test_encode_atom_normalization() {
    let encoder = OrbitalEncoder::default();
    let carbon = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);
    let features = encoder.encode_atom(&carbon);

    // Should be unit normalized
    let norm: f64 = features.iter().map(|x| x * x).sum::<f64>().sqrt();
    assert!((norm - 1.0).abs() < 1e-6);
}

#[test]
fn test_encode_different_elements() {
    let encoder = OrbitalEncoder::default();

    let h_feat = encoder.encode_atom(&Atom::new(Element::Hydrogen, [0.0, 0.0, 0.0]));
    let c_feat = encoder.encode_atom(&Atom::new(Element::Carbon, [0.0, 0.0, 0.0]));
    let o_feat = encoder.encode_atom(&Atom::new(Element::Oxygen, [0.0, 0.0, 0.0]));

    // Features should be different
    let diff_hc: f64 = h_feat
        .iter()
        .zip(c_feat.iter())
        .map(|(a, b)| (a - b).abs())
        .sum();
    assert!(diff_hc > 0.1);
}

#[test]
fn test_orbital_overlap_self() {
    let encoder = OrbitalEncoder::default();
    let carbon = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);

    let overlap = encoder.orbital_overlap(&carbon, &carbon);
    assert!((overlap - 1.0).abs() < 1e-6);
}

#[test]
fn test_orbital_overlap_distance_decay() {
    let encoder = OrbitalEncoder::default();
    let c1 = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);
    let c2 = Atom::new(Element::Carbon, [1.0, 0.0, 0.0]);
    let c3 = Atom::new(Element::Carbon, [3.0, 0.0, 0.0]);

    let overlap_near = encoder.orbital_overlap(&c1, &c2);
    let overlap_far = encoder.orbital_overlap(&c1, &c3);

    assert!(overlap_near > overlap_far);
}

#[test]
fn test_overlap_matrix_symmetry() {
    let encoder = OrbitalEncoder::default();
    let water = MolecularGraph::water();
    let overlap = encoder.overlap_matrix(water.atoms());

    assert_eq!(overlap.shape(), &[3, 3]);

    for i in 0..3 {
        for j in 0..3 {
            assert!((overlap[[i, j]] - overlap[[j, i]]).abs() < 1e-10);
        }
    }
}

#[test]
fn test_electron_density() {
    let density = ElectronDensity::default();
    let carbon = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);

    let d_near = density.density_at_point([0.1, 0.0, 0.0], &carbon);
    let d_far = density.density_at_point([5.0, 0.0, 0.0], &carbon);

    assert!(d_near > d_far);
}

#[test]
fn test_quantum_coupling() {
    let coupling = QuantumCoupling::default();
    let water = MolecularGraph::water();

    let matrix = coupling.coupling_matrix(water.atoms());
    assert_eq!(matrix.shape(), &[3, 3]);

    // Diagonal should be 1
    for i in 0..3 {
        assert!((matrix[[i, i]] - 1.0).abs() < 1e-6);
    }
}

// ============================================================================
// Attention Tests
// ============================================================================

#[test]
fn test_qgat_config_validation() {
    let valid = QGATConfig::default();
    assert!(valid.validate().is_ok());

    let invalid = QGATConfig {
        num_heads: 3, // 64 % 3 != 0
        ..Default::default()
    };
    assert!(invalid.validate().is_err());
}

#[test]
fn test_qgat_forward_water() {
    let encoder = OrbitalEncoder::default();
    let config = QGATConfig {
        input_dim: encoder.feature_dim(),
        ..Default::default()
    };

    let qgat = QuantumGraphAttention::new(config);
    let water = MolecularGraph::water();
    let features = water.compute_atom_features(&encoder);

    let output = qgat.forward(&features, &water).unwrap();
    assert_eq!(output.shape(), &[3, 32]);
}

#[test]
fn test_qgat_forward_benzene() {
    let encoder = OrbitalEncoder::default();
    let config = QGATConfig {
        input_dim: encoder.feature_dim(),
        ..Default::default()
    };

    let qgat = QuantumGraphAttention::new(config);
    let benzene = MolecularGraph::benzene();
    let features = benzene.compute_atom_features(&encoder);

    let output = qgat.forward(&features, &benzene).unwrap();
    assert_eq!(output.shape(), &[12, 32]);
}

#[test]
fn test_qgat_without_quantum_coupling() {
    let encoder = OrbitalEncoder::default();
    let config = QGATConfig {
        input_dim: encoder.feature_dim(),
        use_quantum_coupling: false,
        ..Default::default()
    };

    let qgat = QuantumGraphAttention::new(config);
    let water = MolecularGraph::water();
    let features = water.compute_atom_features(&encoder);

    let output = qgat.forward(&features, &water).unwrap();
    assert_eq!(output.shape(), &[3, 32]);
}

#[test]
fn test_multi_layer_network() {
    let encoder = OrbitalEncoder::default();
    let config = QGATNetworkConfig {
        input_dim: encoder.feature_dim(),
        hidden_dim: 64,
        output_dim: 32,
        num_heads: 4,
        num_layers: 3,
        dropout: 0.0,
    };

    let network = QGATNetwork::new(config);
    let water = MolecularGraph::water();
    let features = water.compute_atom_features(&encoder);

    let output = network.forward(&features, &water).unwrap();
    assert_eq!(output.shape(), &[3, 32]);
}

#[test]
fn test_pooling_methods() {
    let encoder = OrbitalEncoder::default();
    let water = MolecularGraph::water();
    let features = water.compute_atom_features(&encoder);

    for method in [PoolingMethod::Mean, PoolingMethod::Sum, PoolingMethod::Max] {
        let pooling = GraphPooling::new(method, None);
        let result = pooling.pool(&features);
        assert_eq!(result.len(), encoder.feature_dim());
    }
}

#[test]
fn test_attention_pooling() {
    let encoder = OrbitalEncoder::default();
    let water = MolecularGraph::water();
    let features = water.compute_atom_features(&encoder);

    let pooling = GraphPooling::new(PoolingMethod::Attention, Some(encoder.feature_dim()));
    let result = pooling.pool(&features);
    assert_eq!(result.len(), encoder.feature_dim());
}

// ============================================================================
// Predictor Tests
// ============================================================================

#[test]
fn test_predictor_energy() {
    let predictor = MolecularPredictor::new(PredictorConfig::default());
    let water = MolecularGraph::water();

    let energy = predictor.predict(&water, PropertyType::Energy).unwrap();
    assert!(energy.is_finite());
}

#[test]
fn test_predictor_homo_lumo() {
    let predictor = MolecularPredictor::new(PredictorConfig::default());
    let water = MolecularGraph::water();

    let gap = predictor.predict(&water, PropertyType::HomoLumoGap).unwrap();
    assert!(gap > 0.0);
}

#[test]
fn test_predictor_dipole() {
    let predictor = MolecularPredictor::new(PredictorConfig::default());
    let water = MolecularGraph::water();

    let dipole = predictor.predict(&water, PropertyType::DipoleMoment).unwrap();
    assert!(dipole >= 0.0);
}

#[test]
fn test_predictor_all_properties() {
    let predictor = MolecularPredictor::new(PredictorConfig::default());
    let water = MolecularGraph::water();

    let predictions = predictor.predict_all(&water).unwrap();
    assert!(predictions.energy.is_finite());
    assert!(predictions.homo_lumo_gap > 0.0);
    assert!(predictions.dipole_moment >= 0.0);
}

#[test]
fn test_batch_predictor() {
    let batch = BatchPredictor::new(PredictorConfig::default());
    let molecules = vec![
        MolecularGraph::water(),
        MolecularGraph::methane(),
        MolecularGraph::ammonia(),
    ];

    let results = batch.predict_batch(&molecules, PropertyType::Energy);
    assert_eq!(results.len(), 3);

    for result in results {
        assert!(result.is_ok());
    }
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
fn test_dipole_calculator() {
    let calc = DipoleMomentCalculator::default();
    let water = MolecularGraph::water();

    let magnitude = calc.calculate_magnitude(&water);
    assert!(magnitude >= 0.0);
}

#[test]
fn test_reference_energies() {
    let refs = ReferenceEnergies::default();

    assert!(refs.get(Element::Hydrogen) < 0.0);
    assert!(refs.get(Element::Carbon) < 0.0);

    let water = MolecularGraph::water();
    let sum = refs.sum_for_molecule(&water);
    assert!(sum < 0.0);
}

// ============================================================================
// Error Handling Tests
// ============================================================================

#[test]
fn test_empty_molecule_error() {
    let predictor = MolecularPredictor::new(PredictorConfig::default());
    let empty = MolecularGraph::new();

    let result = predictor.predict(&empty, PropertyType::Energy);
    assert!(result.is_err());
}

#[test]
fn test_shape_mismatch_error() {
    let encoder = OrbitalEncoder::default();
    let config = QGATConfig {
        input_dim: encoder.feature_dim(),
        ..Default::default()
    };

    let qgat = QuantumGraphAttention::new(config);
    let water = MolecularGraph::water();

    // Wrong number of rows
    let wrong_features = ndarray::Array2::zeros((5, encoder.feature_dim()));
    let result = qgat.forward(&wrong_features, &water);
    assert!(result.is_err());
}

// ============================================================================
// Property Type Tests
// ============================================================================

#[test]
fn test_property_type_units() {
    assert_eq!(PropertyType::Energy.unit(), "eV");
    assert_eq!(PropertyType::DipoleMoment.unit(), "D");
    assert_eq!(PropertyType::Polarizability.unit(), "Bohr^3");
}

#[test]
fn test_property_type_ranges() {
    let (min, max) = PropertyType::HomoLumoGap.typical_range();
    assert!(min >= 0.0);
    assert!(max > min);
}

// ============================================================================
// Full Pipeline Tests
// ============================================================================

#[test]
fn test_full_pipeline_all_molecules() {
    let predictor = MolecularPredictor::new(PredictorConfig::default());

    let molecules = vec![
        ("Water", MolecularGraph::water()),
        ("Methane", MolecularGraph::methane()),
        ("Benzene", MolecularGraph::benzene()),
        ("Ethane", MolecularGraph::ethane()),
        ("Ethylene", MolecularGraph::ethylene()),
        ("Acetylene", MolecularGraph::acetylene()),
        ("Ammonia", MolecularGraph::ammonia()),
        ("CO2", MolecularGraph::carbon_dioxide()),
    ];

    for (name, mol) in molecules {
        assert!(mol.validate().is_ok(), "Validation failed for {}", name);

        let energy = predictor.predict(&mol, PropertyType::Energy);
        assert!(energy.is_ok(), "Energy prediction failed for {}", name);

        let gap = predictor.predict(&mol, PropertyType::HomoLumoGap);
        assert!(gap.is_ok(), "HOMO-LUMO gap prediction failed for {}", name);
    }
}

#[test]
fn test_serialization_roundtrip() {
    let water = MolecularGraph::water();

    // Serialize
    let json = serde_json::to_string(&water).unwrap();

    // Deserialize
    let deserialized: MolecularGraph = serde_json::from_str(&json).unwrap();

    assert_eq!(deserialized.num_atoms(), water.num_atoms());
    assert_eq!(deserialized.num_bonds(), water.num_bonds());
}

#[test]
fn test_config_serialization() {
    let config = QGATConfig::default();
    let json = serde_json::to_string(&config).unwrap();
    let deserialized: QGATConfig = serde_json::from_str(&json).unwrap();

    assert_eq!(deserialized.input_dim, config.input_dim);
    assert_eq!(deserialized.num_heads, config.num_heads);
}
