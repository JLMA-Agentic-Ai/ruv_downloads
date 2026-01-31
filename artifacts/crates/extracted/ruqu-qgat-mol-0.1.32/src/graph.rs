//! Molecular graph representation with quantum features.
//!
//! This module provides data structures for representing molecules as graphs where:
//! - Nodes represent atoms with quantum orbital features
//! - Edges represent bonds with quantum coupling strengths
//!
//! # Example
//!
//! ```rust
//! use ruqu_qgat_mol::graph::{MolecularGraph, Atom, Bond, Element, BondType};
//!
//! // Create a water molecule (H2O)
//! let mut graph = MolecularGraph::new();
//!
//! // Add oxygen atom
//! let o_idx = graph.add_atom(Atom::new(Element::Oxygen, [0.0, 0.0, 0.0]));
//!
//! // Add hydrogen atoms
//! let h1_idx = graph.add_atom(Atom::new(Element::Hydrogen, [0.96, 0.0, 0.0]));
//! let h2_idx = graph.add_atom(Atom::new(Element::Hydrogen, [-0.24, 0.93, 0.0]));
//!
//! // Add O-H bonds
//! graph.add_bond(Bond::new(o_idx, h1_idx, BondType::Single)).unwrap();
//! graph.add_bond(Bond::new(o_idx, h2_idx, BondType::Single)).unwrap();
//!
//! assert_eq!(graph.num_atoms(), 3);
//! assert_eq!(graph.num_bonds(), 2);
//! ```

use ndarray::{Array1, Array2};
use serde::{Deserialize, Serialize};

use crate::error::{GraphError, Result};
use crate::orbital::{OrbitalEncoder, OrbitalType};

/// Chemical element with atomic properties.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Element {
    /// Hydrogen (atomic number 1)
    Hydrogen,
    /// Carbon (atomic number 6)
    Carbon,
    /// Nitrogen (atomic number 7)
    Nitrogen,
    /// Oxygen (atomic number 8)
    Oxygen,
    /// Fluorine (atomic number 9)
    Fluorine,
    /// Phosphorus (atomic number 15)
    Phosphorus,
    /// Sulfur (atomic number 16)
    Sulfur,
    /// Chlorine (atomic number 17)
    Chlorine,
    /// Bromine (atomic number 35)
    Bromine,
    /// Iodine (atomic number 53)
    Iodine,
}

impl Element {
    /// Returns the atomic number of the element.
    #[must_use]
    pub fn atomic_number(&self) -> u8 {
        match self {
            Element::Hydrogen => 1,
            Element::Carbon => 6,
            Element::Nitrogen => 7,
            Element::Oxygen => 8,
            Element::Fluorine => 9,
            Element::Phosphorus => 15,
            Element::Sulfur => 16,
            Element::Chlorine => 17,
            Element::Bromine => 35,
            Element::Iodine => 53,
        }
    }

    /// Returns the element symbol.
    #[must_use]
    pub fn symbol(&self) -> &'static str {
        match self {
            Element::Hydrogen => "H",
            Element::Carbon => "C",
            Element::Nitrogen => "N",
            Element::Oxygen => "O",
            Element::Fluorine => "F",
            Element::Phosphorus => "P",
            Element::Sulfur => "S",
            Element::Chlorine => "Cl",
            Element::Bromine => "Br",
            Element::Iodine => "I",
        }
    }

    /// Returns the atomic mass in atomic mass units (amu).
    #[must_use]
    pub fn atomic_mass(&self) -> f64 {
        match self {
            Element::Hydrogen => 1.008,
            Element::Carbon => 12.011,
            Element::Nitrogen => 14.007,
            Element::Oxygen => 15.999,
            Element::Fluorine => 18.998,
            Element::Phosphorus => 30.974,
            Element::Sulfur => 32.065,
            Element::Chlorine => 35.453,
            Element::Bromine => 79.904,
            Element::Iodine => 126.904,
        }
    }

    /// Returns the electronegativity (Pauling scale).
    #[must_use]
    pub fn electronegativity(&self) -> f64 {
        match self {
            Element::Hydrogen => 2.20,
            Element::Carbon => 2.55,
            Element::Nitrogen => 3.04,
            Element::Oxygen => 3.44,
            Element::Fluorine => 3.98,
            Element::Phosphorus => 2.19,
            Element::Sulfur => 2.58,
            Element::Chlorine => 3.16,
            Element::Bromine => 2.96,
            Element::Iodine => 2.66,
        }
    }

    /// Returns the covalent radius in angstroms.
    #[must_use]
    pub fn covalent_radius(&self) -> f64 {
        match self {
            Element::Hydrogen => 0.31,
            Element::Carbon => 0.76,
            Element::Nitrogen => 0.71,
            Element::Oxygen => 0.66,
            Element::Fluorine => 0.57,
            Element::Phosphorus => 1.07,
            Element::Sulfur => 1.05,
            Element::Chlorine => 1.02,
            Element::Bromine => 1.20,
            Element::Iodine => 1.39,
        }
    }

    /// Returns the number of valence electrons.
    #[must_use]
    pub fn valence_electrons(&self) -> u8 {
        match self {
            Element::Hydrogen => 1,
            Element::Carbon => 4,
            Element::Nitrogen => 5,
            Element::Oxygen => 6,
            Element::Fluorine => 7,
            Element::Phosphorus => 5,
            Element::Sulfur => 6,
            Element::Chlorine => 7,
            Element::Bromine => 7,
            Element::Iodine => 7,
        }
    }

    /// Returns the valence orbital types for this element.
    #[must_use]
    pub fn valence_orbitals(&self) -> Vec<OrbitalType> {
        match self {
            Element::Hydrogen => vec![OrbitalType::S { n: 1 }],
            Element::Carbon | Element::Nitrogen | Element::Oxygen | Element::Fluorine => {
                vec![OrbitalType::S { n: 2 }, OrbitalType::P { n: 2, m: 0 }]
            }
            Element::Phosphorus | Element::Sulfur | Element::Chlorine => vec![
                OrbitalType::S { n: 3 },
                OrbitalType::P { n: 3, m: 0 },
                OrbitalType::D { n: 3, m: 0 },
            ],
            Element::Bromine => vec![
                OrbitalType::S { n: 4 },
                OrbitalType::P { n: 4, m: 0 },
                OrbitalType::D { n: 4, m: 0 },
            ],
            Element::Iodine => vec![
                OrbitalType::S { n: 5 },
                OrbitalType::P { n: 5, m: 0 },
                OrbitalType::D { n: 5, m: 0 },
            ],
        }
    }

    /// Creates an element from its atomic number.
    pub fn from_atomic_number(z: u8) -> Option<Self> {
        match z {
            1 => Some(Element::Hydrogen),
            6 => Some(Element::Carbon),
            7 => Some(Element::Nitrogen),
            8 => Some(Element::Oxygen),
            9 => Some(Element::Fluorine),
            15 => Some(Element::Phosphorus),
            16 => Some(Element::Sulfur),
            17 => Some(Element::Chlorine),
            35 => Some(Element::Bromine),
            53 => Some(Element::Iodine),
            _ => None,
        }
    }

    /// Creates an element from its symbol.
    pub fn from_symbol(symbol: &str) -> Option<Self> {
        match symbol.to_uppercase().as_str() {
            "H" => Some(Element::Hydrogen),
            "C" => Some(Element::Carbon),
            "N" => Some(Element::Nitrogen),
            "O" => Some(Element::Oxygen),
            "F" => Some(Element::Fluorine),
            "P" => Some(Element::Phosphorus),
            "S" => Some(Element::Sulfur),
            "CL" => Some(Element::Chlorine),
            "BR" => Some(Element::Bromine),
            "I" => Some(Element::Iodine),
            _ => None,
        }
    }
}

/// Bond type with associated bond order and properties.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum BondType {
    /// Single bond (bond order 1)
    Single,
    /// Double bond (bond order 2)
    Double,
    /// Triple bond (bond order 3)
    Triple,
    /// Aromatic bond (bond order 1.5)
    Aromatic,
    /// Hydrogen bond (weak, non-covalent)
    Hydrogen,
    /// Ionic bond
    Ionic,
}

impl BondType {
    /// Returns the bond order.
    #[must_use]
    pub fn bond_order(&self) -> f64 {
        match self {
            BondType::Single => 1.0,
            BondType::Double => 2.0,
            BondType::Triple => 3.0,
            BondType::Aromatic => 1.5,
            BondType::Hydrogen => 0.1,
            BondType::Ionic => 0.5,
        }
    }

    /// Returns the typical bond energy in kJ/mol.
    #[must_use]
    pub fn bond_energy(&self) -> f64 {
        match self {
            BondType::Single => 347.0,   // C-C single bond
            BondType::Double => 614.0,   // C=C double bond
            BondType::Triple => 839.0,   // C≡C triple bond
            BondType::Aromatic => 518.0, // Average aromatic
            BondType::Hydrogen => 20.0,  // Typical H-bond
            BondType::Ionic => 700.0,    // Typical ionic
        }
    }

    /// Returns the quantum coupling strength (0 to 1).
    #[must_use]
    pub fn quantum_coupling(&self) -> f64 {
        match self {
            BondType::Single => 0.3,
            BondType::Double => 0.6,
            BondType::Triple => 0.9,
            BondType::Aromatic => 0.5,
            BondType::Hydrogen => 0.1,
            BondType::Ionic => 0.2,
        }
    }
}

/// Atom in a molecular graph with quantum orbital features.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Atom {
    /// Element type
    pub element: Element,
    /// 3D position in angstroms
    pub position: [f64; 3],
    /// Formal charge
    pub formal_charge: i8,
    /// Hybridization state (sp, sp2, sp3, sp3d, sp3d2)
    pub hybridization: Hybridization,
    /// Number of attached hydrogens (implicit)
    pub implicit_hydrogens: u8,
    /// Is this atom aromatic?
    pub is_aromatic: bool,
    /// Partial charge (computed)
    pub partial_charge: f64,
}

impl Atom {
    /// Creates a new atom at the specified position.
    #[must_use]
    pub fn new(element: Element, position: [f64; 3]) -> Self {
        Self {
            element,
            position,
            formal_charge: 0,
            hybridization: Hybridization::default_for_element(element),
            implicit_hydrogens: 0,
            is_aromatic: false,
            partial_charge: 0.0,
        }
    }

    /// Creates a new atom with a formal charge.
    #[must_use]
    pub fn with_charge(mut self, charge: i8) -> Self {
        self.formal_charge = charge;
        self
    }

    /// Sets the hybridization state.
    #[must_use]
    pub fn with_hybridization(mut self, hybridization: Hybridization) -> Self {
        self.hybridization = hybridization;
        self
    }

    /// Sets the number of implicit hydrogens.
    #[must_use]
    pub fn with_implicit_hydrogens(mut self, count: u8) -> Self {
        self.implicit_hydrogens = count;
        self
    }

    /// Marks the atom as aromatic.
    #[must_use]
    pub fn with_aromatic(mut self, aromatic: bool) -> Self {
        self.is_aromatic = aromatic;
        self
    }

    /// Returns the total number of valence electrons available.
    #[must_use]
    pub fn available_valence(&self) -> i8 {
        self.element.valence_electrons() as i8 - self.formal_charge
    }

    /// Computes the Euclidean distance to another atom.
    #[must_use]
    pub fn distance_to(&self, other: &Atom) -> f64 {
        let dx = self.position[0] - other.position[0];
        let dy = self.position[1] - other.position[1];
        let dz = self.position[2] - other.position[2];
        (dx * dx + dy * dy + dz * dz).sqrt()
    }
}

/// Hybridization state of an atom.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Hybridization {
    /// s hybridization (linear, 180 degrees)
    S,
    /// sp hybridization (linear, 180 degrees)
    Sp,
    /// sp2 hybridization (trigonal planar, 120 degrees)
    Sp2,
    /// sp3 hybridization (tetrahedral, 109.5 degrees)
    Sp3,
    /// sp3d hybridization (trigonal bipyramidal)
    Sp3d,
    /// sp3d2 hybridization (octahedral)
    Sp3d2,
    /// Unknown hybridization
    Unknown,
}

impl Hybridization {
    /// Returns the default hybridization for an element.
    #[must_use]
    pub fn default_for_element(element: Element) -> Self {
        match element {
            Element::Hydrogen => Hybridization::S,
            Element::Carbon => Hybridization::Sp3,
            Element::Nitrogen => Hybridization::Sp3,
            Element::Oxygen => Hybridization::Sp3,
            Element::Fluorine | Element::Chlorine | Element::Bromine | Element::Iodine => {
                Hybridization::Sp3
            }
            Element::Phosphorus | Element::Sulfur => Hybridization::Sp3,
        }
    }

    /// Returns the number of hybrid orbitals.
    #[must_use]
    pub fn num_orbitals(&self) -> u8 {
        match self {
            Hybridization::S => 1,
            Hybridization::Sp => 2,
            Hybridization::Sp2 => 3,
            Hybridization::Sp3 => 4,
            Hybridization::Sp3d => 5,
            Hybridization::Sp3d2 => 6,
            Hybridization::Unknown => 4,
        }
    }

    /// Returns the ideal bond angle in degrees.
    #[must_use]
    pub fn bond_angle(&self) -> f64 {
        match self {
            Hybridization::S | Hybridization::Sp => 180.0,
            Hybridization::Sp2 => 120.0,
            Hybridization::Sp3 => 109.47,
            Hybridization::Sp3d => 90.0, // axial-equatorial
            Hybridization::Sp3d2 => 90.0,
            Hybridization::Unknown => 109.47,
        }
    }
}

/// Bond between two atoms with quantum coupling properties.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bond {
    /// Index of the first atom
    pub atom1_idx: usize,
    /// Index of the second atom
    pub atom2_idx: usize,
    /// Bond type
    pub bond_type: BondType,
    /// Is this bond in an aromatic ring?
    pub is_aromatic: bool,
    /// Is this bond conjugated?
    pub is_conjugated: bool,
    /// Is this bond in a ring?
    pub is_in_ring: bool,
    /// Quantum coupling strength (computed from orbital overlap)
    pub quantum_coupling: f64,
}

impl Bond {
    /// Creates a new bond between two atoms.
    #[must_use]
    pub fn new(atom1_idx: usize, atom2_idx: usize, bond_type: BondType) -> Self {
        Self {
            atom1_idx,
            atom2_idx,
            bond_type,
            is_aromatic: bond_type == BondType::Aromatic,
            is_conjugated: false,
            is_in_ring: false,
            quantum_coupling: bond_type.quantum_coupling(),
        }
    }

    /// Returns the other atom index given one atom index.
    #[must_use]
    pub fn other_atom(&self, atom_idx: usize) -> Option<usize> {
        if self.atom1_idx == atom_idx {
            Some(self.atom2_idx)
        } else if self.atom2_idx == atom_idx {
            Some(self.atom1_idx)
        } else {
            None
        }
    }

    /// Checks if this bond connects the given atom.
    #[must_use]
    pub fn connects(&self, atom_idx: usize) -> bool {
        self.atom1_idx == atom_idx || self.atom2_idx == atom_idx
    }

    /// Checks if this bond connects the two given atoms.
    #[must_use]
    pub fn connects_atoms(&self, a: usize, b: usize) -> bool {
        (self.atom1_idx == a && self.atom2_idx == b)
            || (self.atom1_idx == b && self.atom2_idx == a)
    }
}

/// A molecular graph with atoms as nodes and bonds as edges.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MolecularGraph {
    /// All atoms in the molecule
    atoms: Vec<Atom>,
    /// All bonds in the molecule
    bonds: Vec<Bond>,
    /// Adjacency list: atom index -> list of (neighbor index, bond index)
    adjacency: Vec<Vec<(usize, usize)>>,
    /// Name of the molecule
    pub name: Option<String>,
    /// SMILES representation
    pub smiles: Option<String>,
}

impl MolecularGraph {
    /// Creates a new empty molecular graph.
    #[must_use]
    pub fn new() -> Self {
        Self {
            atoms: Vec::new(),
            bonds: Vec::new(),
            adjacency: Vec::new(),
            name: None,
            smiles: None,
        }
    }

    /// Creates a molecular graph with a name.
    #[must_use]
    pub fn with_name(name: impl Into<String>) -> Self {
        let mut graph = Self::new();
        graph.name = Some(name.into());
        graph
    }

    /// Adds an atom to the graph and returns its index.
    pub fn add_atom(&mut self, atom: Atom) -> usize {
        let idx = self.atoms.len();
        self.atoms.push(atom);
        self.adjacency.push(Vec::new());
        idx
    }

    /// Adds a bond to the graph.
    pub fn add_bond(&mut self, bond: Bond) -> Result<usize> {
        let a1 = bond.atom1_idx;
        let a2 = bond.atom2_idx;

        // Validate atom indices
        if a1 >= self.atoms.len() {
            return Err(GraphError::AtomNotFound(format!("index {}", a1)).into());
        }
        if a2 >= self.atoms.len() {
            return Err(GraphError::AtomNotFound(format!("index {}", a2)).into());
        }

        // Check for self-loop
        if a1 == a2 {
            return Err(GraphError::SelfLoop(a1).into());
        }

        // Check for duplicate bond
        for &(neighbor, _) in &self.adjacency[a1] {
            if neighbor == a2 {
                return Err(GraphError::DuplicateBond(a1, a2).into());
            }
        }

        let bond_idx = self.bonds.len();
        self.bonds.push(bond);

        // Update adjacency lists
        self.adjacency[a1].push((a2, bond_idx));
        self.adjacency[a2].push((a1, bond_idx));

        Ok(bond_idx)
    }

    /// Returns the number of atoms in the graph.
    #[must_use]
    pub fn num_atoms(&self) -> usize {
        self.atoms.len()
    }

    /// Returns the number of bonds in the graph.
    #[must_use]
    pub fn num_bonds(&self) -> usize {
        self.bonds.len()
    }

    /// Returns a reference to an atom by index.
    #[must_use]
    pub fn atom(&self, idx: usize) -> Option<&Atom> {
        self.atoms.get(idx)
    }

    /// Returns a mutable reference to an atom by index.
    pub fn atom_mut(&mut self, idx: usize) -> Option<&mut Atom> {
        self.atoms.get_mut(idx)
    }

    /// Returns a reference to a bond by index.
    #[must_use]
    pub fn bond(&self, idx: usize) -> Option<&Bond> {
        self.bonds.get(idx)
    }

    /// Returns all atoms.
    #[must_use]
    pub fn atoms(&self) -> &[Atom] {
        &self.atoms
    }

    /// Returns all bonds.
    #[must_use]
    pub fn bonds(&self) -> &[Bond] {
        &self.bonds
    }

    /// Returns the neighbors of an atom with their bond indices.
    #[must_use]
    pub fn neighbors(&self, atom_idx: usize) -> &[(usize, usize)] {
        if atom_idx < self.adjacency.len() {
            &self.adjacency[atom_idx]
        } else {
            &[]
        }
    }

    /// Returns the bond between two atoms, if it exists.
    #[must_use]
    pub fn bond_between(&self, a: usize, b: usize) -> Option<&Bond> {
        for &(neighbor, bond_idx) in &self.adjacency[a] {
            if neighbor == b {
                return self.bonds.get(bond_idx);
            }
        }
        None
    }

    /// Computes the molecular weight.
    #[must_use]
    pub fn molecular_weight(&self) -> f64 {
        self.atoms.iter().fold(0.0, |acc, atom| {
            acc + atom.element.atomic_mass()
                + (atom.implicit_hydrogens as f64) * Element::Hydrogen.atomic_mass()
        })
    }

    /// Computes the total charge of the molecule.
    #[must_use]
    pub fn total_charge(&self) -> i32 {
        self.atoms
            .iter()
            .map(|a| a.formal_charge as i32)
            .sum()
    }

    /// Computes the center of mass.
    #[must_use]
    pub fn center_of_mass(&self) -> [f64; 3] {
        if self.atoms.is_empty() {
            return [0.0, 0.0, 0.0];
        }

        let total_mass: f64 = self.atoms.iter().map(|a| a.element.atomic_mass()).sum();
        let mut com = [0.0, 0.0, 0.0];

        for atom in &self.atoms {
            let mass = atom.element.atomic_mass();
            com[0] += atom.position[0] * mass;
            com[1] += atom.position[1] * mass;
            com[2] += atom.position[2] * mass;
        }

        com[0] /= total_mass;
        com[1] /= total_mass;
        com[2] /= total_mass;

        com
    }

    /// Computes atom features using orbital encoding.
    ///
    /// Returns a 2D array of shape (num_atoms, feature_dim).
    pub fn compute_atom_features(&self, encoder: &OrbitalEncoder) -> Array2<f64> {
        let num_atoms = self.atoms.len();
        let feature_dim = encoder.feature_dim();
        let mut features = Array2::zeros((num_atoms, feature_dim));

        for (i, atom) in self.atoms.iter().enumerate() {
            let atom_features = encoder.encode_atom(atom);
            features.row_mut(i).assign(&atom_features);
        }

        features
    }

    /// Computes the adjacency matrix with quantum coupling weights.
    #[must_use]
    pub fn adjacency_matrix(&self) -> Array2<f64> {
        let n = self.atoms.len();
        let mut adj = Array2::zeros((n, n));

        for bond in &self.bonds {
            let weight = bond.quantum_coupling;
            adj[[bond.atom1_idx, bond.atom2_idx]] = weight;
            adj[[bond.atom2_idx, bond.atom1_idx]] = weight;
        }

        adj
    }

    /// Computes the degree matrix.
    #[must_use]
    pub fn degree_matrix(&self) -> Array1<f64> {
        let n = self.atoms.len();
        let mut degree = Array1::zeros(n);

        for (i, neighbors) in self.adjacency.iter().enumerate() {
            degree[i] = neighbors.len() as f64;
        }

        degree
    }

    /// Computes edge features for all bonds.
    ///
    /// Returns a 2D array of shape (num_bonds, edge_feature_dim).
    #[must_use]
    pub fn compute_edge_features(&self) -> Array2<f64> {
        let num_bonds = self.bonds.len();
        let edge_dim = 8; // bond_order, coupling, aromatic, conjugated, ring, distance, energy, electronegativity_diff
        let mut features = Array2::zeros((num_bonds, edge_dim));

        for (i, bond) in self.bonds.iter().enumerate() {
            let atom1 = &self.atoms[bond.atom1_idx];
            let atom2 = &self.atoms[bond.atom2_idx];

            features[[i, 0]] = bond.bond_type.bond_order();
            features[[i, 1]] = bond.quantum_coupling;
            features[[i, 2]] = if bond.is_aromatic { 1.0 } else { 0.0 };
            features[[i, 3]] = if bond.is_conjugated { 1.0 } else { 0.0 };
            features[[i, 4]] = if bond.is_in_ring { 1.0 } else { 0.0 };
            features[[i, 5]] = atom1.distance_to(atom2);
            features[[i, 6]] = bond.bond_type.bond_energy() / 1000.0; // Normalize to reasonable range
            features[[i, 7]] =
                (atom1.element.electronegativity() - atom2.element.electronegativity()).abs();
        }

        features
    }

    /// Validates the molecular graph structure.
    pub fn validate(&self) -> Result<()> {
        if self.atoms.is_empty() {
            return Err(GraphError::EmptyMolecule.into());
        }

        // Check all bond indices are valid
        for bond in &self.bonds {
            if bond.atom1_idx >= self.atoms.len() {
                return Err(GraphError::AtomNotFound(format!("index {}", bond.atom1_idx)).into());
            }
            if bond.atom2_idx >= self.atoms.len() {
                return Err(GraphError::AtomNotFound(format!("index {}", bond.atom2_idx)).into());
            }
        }

        // Check adjacency list consistency
        if self.adjacency.len() != self.atoms.len() {
            return Err(GraphError::InvalidStructure(
                "Adjacency list size mismatch".to_string(),
            )
            .into());
        }

        Ok(())
    }

    /// Detects rings in the molecule (simple cycle detection).
    #[must_use]
    pub fn find_rings(&self) -> Vec<Vec<usize>> {
        let mut rings = Vec::new();
        let n = self.atoms.len();

        if n == 0 {
            return rings;
        }

        // Use DFS to find cycles
        let mut visited = vec![false; n];
        let mut parent = vec![usize::MAX; n];

        for start in 0..n {
            if visited[start] {
                continue;
            }

            let mut stack = vec![(start, usize::MAX)];

            while let Some((node, par)) = stack.pop() {
                if visited[node] {
                    // Found a cycle - reconstruct it
                    if par != usize::MAX {
                        let mut ring = vec![node];
                        let mut current = par;
                        while current != node && current != usize::MAX {
                            ring.push(current);
                            current = parent[current];
                        }
                        if ring.len() >= 3 {
                            rings.push(ring);
                        }
                    }
                    continue;
                }

                visited[node] = true;
                parent[node] = par;

                for &(neighbor, _) in &self.adjacency[node] {
                    if neighbor != par {
                        stack.push((neighbor, node));
                    }
                }
            }
        }

        rings
    }
}

impl Default for MolecularGraph {
    fn default() -> Self {
        Self::new()
    }
}

/// Common molecule builders.
impl MolecularGraph {
    /// Creates a water molecule (H2O).
    #[must_use]
    pub fn water() -> Self {
        let mut graph = Self::with_name("Water");
        graph.smiles = Some("O".to_string());

        let o = graph.add_atom(Atom::new(Element::Oxygen, [0.0, 0.0, 0.0]));
        let h1 = graph.add_atom(Atom::new(Element::Hydrogen, [0.96, 0.0, 0.0]));
        let h2 = graph.add_atom(Atom::new(Element::Hydrogen, [-0.24, 0.93, 0.0]));

        let _ = graph.add_bond(Bond::new(o, h1, BondType::Single));
        let _ = graph.add_bond(Bond::new(o, h2, BondType::Single));

        graph
    }

    /// Creates a methane molecule (CH4).
    #[must_use]
    pub fn methane() -> Self {
        let mut graph = Self::with_name("Methane");
        graph.smiles = Some("C".to_string());

        // Tetrahedral geometry
        let c = graph.add_atom(Atom::new(Element::Carbon, [0.0, 0.0, 0.0]));
        let h1 = graph.add_atom(Atom::new(Element::Hydrogen, [1.09, 0.0, 0.0]));
        let h2 = graph.add_atom(Atom::new(Element::Hydrogen, [-0.36, 1.03, 0.0]));
        let h3 = graph.add_atom(Atom::new(Element::Hydrogen, [-0.36, -0.51, 0.89]));
        let h4 = graph.add_atom(Atom::new(Element::Hydrogen, [-0.36, -0.51, -0.89]));

        let _ = graph.add_bond(Bond::new(c, h1, BondType::Single));
        let _ = graph.add_bond(Bond::new(c, h2, BondType::Single));
        let _ = graph.add_bond(Bond::new(c, h3, BondType::Single));
        let _ = graph.add_bond(Bond::new(c, h4, BondType::Single));

        graph
    }

    /// Creates a benzene molecule (C6H6).
    #[must_use]
    pub fn benzene() -> Self {
        let mut graph = Self::with_name("Benzene");
        graph.smiles = Some("c1ccccc1".to_string());

        // Hexagonal geometry in the xy plane
        let radius = 1.4; // C-C bond length in benzene
        let mut carbons = Vec::new();

        for i in 0..6 {
            let angle = (i as f64) * std::f64::consts::PI / 3.0;
            let x = radius * angle.cos();
            let y = radius * angle.sin();
            let atom = Atom::new(Element::Carbon, [x, y, 0.0]).with_aromatic(true);
            carbons.push(graph.add_atom(atom));
        }

        // Add aromatic bonds between carbons
        for i in 0..6 {
            let j = (i + 1) % 6;
            let _ = graph.add_bond(Bond::new(carbons[i], carbons[j], BondType::Aromatic));
        }

        // Add hydrogens
        for i in 0..6 {
            let angle = (i as f64) * std::f64::consts::PI / 3.0;
            let h_radius = radius + 1.08; // C-H bond length
            let x = h_radius * angle.cos();
            let y = h_radius * angle.sin();
            let h = graph.add_atom(Atom::new(Element::Hydrogen, [x, y, 0.0]));
            let _ = graph.add_bond(Bond::new(carbons[i], h, BondType::Single));
        }

        graph
    }

    /// Creates an ethane molecule (C2H6).
    #[must_use]
    pub fn ethane() -> Self {
        let mut graph = Self::with_name("Ethane");
        graph.smiles = Some("CC".to_string());

        let c1 = graph.add_atom(Atom::new(Element::Carbon, [0.0, 0.0, 0.0]));
        let c2 = graph.add_atom(Atom::new(Element::Carbon, [1.54, 0.0, 0.0]));

        // C-C bond
        let _ = graph.add_bond(Bond::new(c1, c2, BondType::Single));

        // Hydrogens on C1
        let h1 = graph.add_atom(Atom::new(Element::Hydrogen, [-0.36, 1.03, 0.0]));
        let h2 = graph.add_atom(Atom::new(Element::Hydrogen, [-0.36, -0.51, 0.89]));
        let h3 = graph.add_atom(Atom::new(Element::Hydrogen, [-0.36, -0.51, -0.89]));
        let _ = graph.add_bond(Bond::new(c1, h1, BondType::Single));
        let _ = graph.add_bond(Bond::new(c1, h2, BondType::Single));
        let _ = graph.add_bond(Bond::new(c1, h3, BondType::Single));

        // Hydrogens on C2
        let h4 = graph.add_atom(Atom::new(Element::Hydrogen, [1.90, 1.03, 0.0]));
        let h5 = graph.add_atom(Atom::new(Element::Hydrogen, [1.90, -0.51, 0.89]));
        let h6 = graph.add_atom(Atom::new(Element::Hydrogen, [1.90, -0.51, -0.89]));
        let _ = graph.add_bond(Bond::new(c2, h4, BondType::Single));
        let _ = graph.add_bond(Bond::new(c2, h5, BondType::Single));
        let _ = graph.add_bond(Bond::new(c2, h6, BondType::Single));

        graph
    }

    /// Creates an ethylene molecule (C2H4).
    #[must_use]
    pub fn ethylene() -> Self {
        let mut graph = Self::with_name("Ethylene");
        graph.smiles = Some("C=C".to_string());

        let c1 = graph.add_atom(
            Atom::new(Element::Carbon, [0.0, 0.0, 0.0]).with_hybridization(Hybridization::Sp2),
        );
        let c2 = graph.add_atom(
            Atom::new(Element::Carbon, [1.34, 0.0, 0.0]).with_hybridization(Hybridization::Sp2),
        );

        // C=C double bond
        let _ = graph.add_bond(Bond::new(c1, c2, BondType::Double));

        // Hydrogens (planar arrangement)
        let h1 = graph.add_atom(Atom::new(Element::Hydrogen, [-0.52, 0.90, 0.0]));
        let h2 = graph.add_atom(Atom::new(Element::Hydrogen, [-0.52, -0.90, 0.0]));
        let h3 = graph.add_atom(Atom::new(Element::Hydrogen, [1.86, 0.90, 0.0]));
        let h4 = graph.add_atom(Atom::new(Element::Hydrogen, [1.86, -0.90, 0.0]));

        let _ = graph.add_bond(Bond::new(c1, h1, BondType::Single));
        let _ = graph.add_bond(Bond::new(c1, h2, BondType::Single));
        let _ = graph.add_bond(Bond::new(c2, h3, BondType::Single));
        let _ = graph.add_bond(Bond::new(c2, h4, BondType::Single));

        graph
    }

    /// Creates an acetylene molecule (C2H2).
    #[must_use]
    pub fn acetylene() -> Self {
        let mut graph = Self::with_name("Acetylene");
        graph.smiles = Some("C#C".to_string());

        let c1 = graph.add_atom(
            Atom::new(Element::Carbon, [0.0, 0.0, 0.0]).with_hybridization(Hybridization::Sp),
        );
        let c2 = graph.add_atom(
            Atom::new(Element::Carbon, [1.20, 0.0, 0.0]).with_hybridization(Hybridization::Sp),
        );

        // C≡C triple bond
        let _ = graph.add_bond(Bond::new(c1, c2, BondType::Triple));

        // Hydrogens (linear arrangement)
        let h1 = graph.add_atom(Atom::new(Element::Hydrogen, [-1.06, 0.0, 0.0]));
        let h2 = graph.add_atom(Atom::new(Element::Hydrogen, [2.26, 0.0, 0.0]));

        let _ = graph.add_bond(Bond::new(c1, h1, BondType::Single));
        let _ = graph.add_bond(Bond::new(c2, h2, BondType::Single));

        graph
    }

    /// Creates an ammonia molecule (NH3).
    #[must_use]
    pub fn ammonia() -> Self {
        let mut graph = Self::with_name("Ammonia");
        graph.smiles = Some("N".to_string());

        let n = graph.add_atom(Atom::new(Element::Nitrogen, [0.0, 0.0, 0.0]));
        let h1 = graph.add_atom(Atom::new(Element::Hydrogen, [1.01, 0.0, 0.0]));
        let h2 = graph.add_atom(Atom::new(Element::Hydrogen, [-0.34, 0.95, 0.0]));
        let h3 = graph.add_atom(Atom::new(Element::Hydrogen, [-0.34, -0.47, 0.82]));

        let _ = graph.add_bond(Bond::new(n, h1, BondType::Single));
        let _ = graph.add_bond(Bond::new(n, h2, BondType::Single));
        let _ = graph.add_bond(Bond::new(n, h3, BondType::Single));

        graph
    }

    /// Creates a carbon dioxide molecule (CO2).
    #[must_use]
    pub fn carbon_dioxide() -> Self {
        let mut graph = Self::with_name("Carbon Dioxide");
        graph.smiles = Some("O=C=O".to_string());

        let c = graph.add_atom(
            Atom::new(Element::Carbon, [0.0, 0.0, 0.0]).with_hybridization(Hybridization::Sp),
        );
        let o1 = graph.add_atom(
            Atom::new(Element::Oxygen, [-1.16, 0.0, 0.0]).with_hybridization(Hybridization::Sp),
        );
        let o2 = graph.add_atom(
            Atom::new(Element::Oxygen, [1.16, 0.0, 0.0]).with_hybridization(Hybridization::Sp),
        );

        let _ = graph.add_bond(Bond::new(c, o1, BondType::Double));
        let _ = graph.add_bond(Bond::new(c, o2, BondType::Double));

        graph
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_element_properties() {
        assert_eq!(Element::Carbon.atomic_number(), 6);
        assert_eq!(Element::Carbon.symbol(), "C");
        assert!((Element::Carbon.atomic_mass() - 12.011).abs() < 0.001);
        assert_eq!(Element::Carbon.valence_electrons(), 4);
    }

    #[test]
    fn test_element_from_symbol() {
        assert_eq!(Element::from_symbol("C"), Some(Element::Carbon));
        assert_eq!(Element::from_symbol("h"), Some(Element::Hydrogen));
        assert_eq!(Element::from_symbol("XY"), None);
    }

    #[test]
    fn test_bond_properties() {
        assert!((BondType::Single.bond_order() - 1.0).abs() < 0.001);
        assert!((BondType::Double.bond_order() - 2.0).abs() < 0.001);
        assert!((BondType::Aromatic.bond_order() - 1.5).abs() < 0.001);
    }

    #[test]
    fn test_atom_creation() {
        let atom = Atom::new(Element::Carbon, [1.0, 2.0, 3.0])
            .with_charge(-1)
            .with_hybridization(Hybridization::Sp3);

        assert_eq!(atom.element, Element::Carbon);
        assert_eq!(atom.formal_charge, -1);
        assert_eq!(atom.hybridization, Hybridization::Sp3);
    }

    #[test]
    fn test_atom_distance() {
        let a1 = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);
        let a2 = Atom::new(Element::Carbon, [3.0, 4.0, 0.0]);
        assert!((a1.distance_to(&a2) - 5.0).abs() < 1e-10);
    }

    #[test]
    fn test_molecular_graph_creation() {
        let mut graph = MolecularGraph::new();
        let c = graph.add_atom(Atom::new(Element::Carbon, [0.0, 0.0, 0.0]));
        let h = graph.add_atom(Atom::new(Element::Hydrogen, [1.0, 0.0, 0.0]));

        assert_eq!(graph.num_atoms(), 2);

        graph.add_bond(Bond::new(c, h, BondType::Single)).unwrap();
        assert_eq!(graph.num_bonds(), 1);
    }

    #[test]
    fn test_self_loop_error() {
        let mut graph = MolecularGraph::new();
        let c = graph.add_atom(Atom::new(Element::Carbon, [0.0, 0.0, 0.0]));

        let result = graph.add_bond(Bond::new(c, c, BondType::Single));
        assert!(result.is_err());
    }

    #[test]
    fn test_duplicate_bond_error() {
        let mut graph = MolecularGraph::new();
        let c = graph.add_atom(Atom::new(Element::Carbon, [0.0, 0.0, 0.0]));
        let h = graph.add_atom(Atom::new(Element::Hydrogen, [1.0, 0.0, 0.0]));

        graph.add_bond(Bond::new(c, h, BondType::Single)).unwrap();
        let result = graph.add_bond(Bond::new(c, h, BondType::Single));
        assert!(result.is_err());
    }

    #[test]
    fn test_water_molecule() {
        let water = MolecularGraph::water();

        assert_eq!(water.num_atoms(), 3);
        assert_eq!(water.num_bonds(), 2);
        assert!(water.name.as_deref() == Some("Water"));
    }

    #[test]
    fn test_methane_molecule() {
        let methane = MolecularGraph::methane();

        assert_eq!(methane.num_atoms(), 5);
        assert_eq!(methane.num_bonds(), 4);
    }

    #[test]
    fn test_benzene_molecule() {
        let benzene = MolecularGraph::benzene();

        assert_eq!(benzene.num_atoms(), 12); // 6 C + 6 H
        assert_eq!(benzene.num_bonds(), 12); // 6 C-C + 6 C-H
    }

    #[test]
    fn test_molecular_weight() {
        let water = MolecularGraph::water();
        let mw = water.molecular_weight();
        // H2O = 2*1.008 + 15.999 = 18.015
        assert!((mw - 18.015).abs() < 0.01);
    }

    #[test]
    fn test_adjacency_matrix() {
        let water = MolecularGraph::water();
        let adj = water.adjacency_matrix();

        assert_eq!(adj.shape(), &[3, 3]);
        // O-H bonds should have non-zero coupling
        assert!(adj[[0, 1]] > 0.0);
        assert!(adj[[0, 2]] > 0.0);
        // No H-H bond
        assert!((adj[[1, 2]]).abs() < 1e-10);
    }

    #[test]
    fn test_neighbors() {
        let water = MolecularGraph::water();

        let o_neighbors = water.neighbors(0);
        assert_eq!(o_neighbors.len(), 2);

        let h_neighbors = water.neighbors(1);
        assert_eq!(h_neighbors.len(), 1);
    }

    #[test]
    fn test_bond_between() {
        let water = MolecularGraph::water();

        let bond = water.bond_between(0, 1);
        assert!(bond.is_some());
        assert_eq!(bond.unwrap().bond_type, BondType::Single);

        let no_bond = water.bond_between(1, 2);
        assert!(no_bond.is_none());
    }

    #[test]
    fn test_validate_empty_molecule() {
        let graph = MolecularGraph::new();
        assert!(graph.validate().is_err());
    }

    #[test]
    fn test_validate_valid_molecule() {
        let water = MolecularGraph::water();
        assert!(water.validate().is_ok());
    }

    #[test]
    fn test_center_of_mass() {
        let water = MolecularGraph::water();
        let com = water.center_of_mass();

        // COM should be close to oxygen (heaviest atom)
        assert!(com[0].abs() < 0.5);
        assert!(com[1].abs() < 0.5);
    }

    #[test]
    fn test_hybridization_properties() {
        assert_eq!(Hybridization::Sp3.num_orbitals(), 4);
        assert!((Hybridization::Sp3.bond_angle() - 109.47).abs() < 0.01);
    }

    #[test]
    fn test_ethylene_double_bond() {
        let ethylene = MolecularGraph::ethylene();

        // Find the C-C bond
        let cc_bond = ethylene.bond_between(0, 1).unwrap();
        assert_eq!(cc_bond.bond_type, BondType::Double);
    }

    #[test]
    fn test_acetylene_triple_bond() {
        let acetylene = MolecularGraph::acetylene();

        let cc_bond = acetylene.bond_between(0, 1).unwrap();
        assert_eq!(cc_bond.bond_type, BondType::Triple);
    }

    #[test]
    fn test_edge_features() {
        let water = MolecularGraph::water();
        let features = water.compute_edge_features();

        assert_eq!(features.shape(), &[2, 8]);
        // First feature is bond order (single = 1.0)
        assert!((features[[0, 0]] - 1.0).abs() < 1e-10);
    }

    #[test]
    fn test_degree_matrix() {
        let water = MolecularGraph::water();
        let degree = water.degree_matrix();

        assert_eq!(degree.len(), 3);
        assert!((degree[0] - 2.0).abs() < 1e-10); // O has 2 bonds
        assert!((degree[1] - 1.0).abs() < 1e-10); // H has 1 bond
    }
}
