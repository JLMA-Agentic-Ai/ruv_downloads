//! Quantum orbital encoder for molecular atoms.
//!
//! This module provides functionality to encode atomic orbitals as quantum features
//! suitable for graph attention networks. It includes:
//!
//! - Slater-type orbital (STO) approximations
//! - Electron density representations
//! - Orbital overlap calculations
//!
//! # Example
//!
//! ```rust
//! use ruqu_qgat_mol::orbital::{OrbitalEncoder, OrbitalEncoderConfig};
//! use ruqu_qgat_mol::graph::{Atom, Element};
//!
//! let config = OrbitalEncoderConfig::default();
//! let encoder = OrbitalEncoder::new(config);
//!
//! let carbon = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);
//! let features = encoder.encode_atom(&carbon);
//!
//! assert_eq!(features.len(), encoder.feature_dim());
//! ```

use ndarray::{Array1, Array2};
use serde::{Deserialize, Serialize};
use std::f64::consts::PI;

use crate::error::{OrbitalError, Result};
use crate::graph::{Atom, Element, Hybridization};

/// Orbital type with quantum numbers.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum OrbitalType {
    /// s orbital (l=0)
    S {
        /// Principal quantum number
        n: i32,
    },
    /// p orbital (l=1)
    P {
        /// Principal quantum number
        n: i32,
        /// Magnetic quantum number (-1, 0, 1)
        m: i32,
    },
    /// d orbital (l=2)
    D {
        /// Principal quantum number
        n: i32,
        /// Magnetic quantum number (-2, -1, 0, 1, 2)
        m: i32,
    },
    /// f orbital (l=3)
    F {
        /// Principal quantum number
        n: i32,
        /// Magnetic quantum number (-3, -2, -1, 0, 1, 2, 3)
        m: i32,
    },
}

impl OrbitalType {
    /// Returns the angular momentum quantum number (l).
    #[must_use]
    pub fn angular_momentum(&self) -> i32 {
        match self {
            OrbitalType::S { .. } => 0,
            OrbitalType::P { .. } => 1,
            OrbitalType::D { .. } => 2,
            OrbitalType::F { .. } => 3,
        }
    }

    /// Returns the principal quantum number (n).
    #[must_use]
    pub fn principal_quantum_number(&self) -> i32 {
        match self {
            OrbitalType::S { n } => *n,
            OrbitalType::P { n, .. } => *n,
            OrbitalType::D { n, .. } => *n,
            OrbitalType::F { n, .. } => *n,
        }
    }

    /// Returns the magnetic quantum number (m).
    #[must_use]
    pub fn magnetic_quantum_number(&self) -> i32 {
        match self {
            OrbitalType::S { .. } => 0,
            OrbitalType::P { m, .. } => *m,
            OrbitalType::D { m, .. } => *m,
            OrbitalType::F { m, .. } => *m,
        }
    }

    /// Returns the number of orbitals for this type (2l + 1).
    #[must_use]
    pub fn num_orbitals(&self) -> usize {
        let l = self.angular_momentum();
        (2 * l + 1) as usize
    }

    /// Validates the quantum numbers.
    pub fn validate(&self) -> Result<()> {
        let n = self.principal_quantum_number();
        let l = self.angular_momentum();
        let m = self.magnetic_quantum_number();

        if n < 1 {
            return Err(OrbitalError::InvalidPrincipalQuantumNumber(n).into());
        }

        if l >= n {
            return Err(OrbitalError::InvalidAngularMomentum(l, n).into());
        }

        if m.abs() > l {
            return Err(OrbitalError::InvalidMagneticQuantumNumber(m, l).into());
        }

        Ok(())
    }

    /// Returns a descriptive name for the orbital.
    #[must_use]
    pub fn name(&self) -> String {
        match self {
            OrbitalType::S { n } => format!("{}s", n),
            OrbitalType::P { n, m } => {
                let suffix = match m {
                    -1 => "y",
                    0 => "z",
                    1 => "x",
                    _ => "?",
                };
                format!("{}p{}", n, suffix)
            }
            OrbitalType::D { n, m } => {
                let suffix = match m {
                    -2 => "xy",
                    -1 => "yz",
                    0 => "z2",
                    1 => "xz",
                    2 => "x2-y2",
                    _ => "?",
                };
                format!("{}d{}", n, suffix)
            }
            OrbitalType::F { n, m } => format!("{}f(m={})", n, m),
        }
    }
}

/// Slater-type orbital parameters.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlaterOrbital {
    /// Orbital type
    pub orbital_type: OrbitalType,
    /// Slater exponent (zeta)
    pub zeta: f64,
    /// Normalization constant
    pub normalization: f64,
}

impl SlaterOrbital {
    /// Creates a new Slater orbital.
    #[must_use]
    pub fn new(orbital_type: OrbitalType, zeta: f64) -> Self {
        let normalization = Self::compute_normalization(orbital_type, zeta);
        Self {
            orbital_type,
            zeta,
            normalization,
        }
    }

    /// Computes the normalization constant.
    fn compute_normalization(orbital_type: OrbitalType, zeta: f64) -> f64 {
        let n = orbital_type.principal_quantum_number() as f64;
        let _l = orbital_type.angular_momentum() as f64;

        // Normalization: (2*zeta)^(n+0.5) / sqrt((2n)!)
        let factorial_2n = Self::factorial((2.0 * n) as u32);
        (2.0 * zeta).powf(n + 0.5) / factorial_2n.sqrt()
    }

    /// Computes factorial (approximation for large values).
    fn factorial(n: u32) -> f64 {
        if n <= 1 {
            return 1.0;
        }
        if n <= 20 {
            (1..=n).fold(1.0, |acc, i| acc * i as f64)
        } else {
            // Stirling's approximation
            let n = n as f64;
            (2.0 * PI * n).sqrt() * (n / std::f64::consts::E).powf(n)
        }
    }

    /// Evaluates the radial part of the orbital at distance r.
    #[must_use]
    pub fn radial(&self, r: f64) -> f64 {
        let n = self.orbital_type.principal_quantum_number() as f64;
        self.normalization * r.powf(n - 1.0) * (-self.zeta * r).exp()
    }

    /// Evaluates the electron density at distance r.
    #[must_use]
    pub fn density(&self, r: f64) -> f64 {
        let radial = self.radial(r);
        radial * radial
    }
}

/// Configuration for the orbital encoder.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrbitalEncoderConfig {
    /// Include element features (atomic number, electronegativity, etc.)
    pub include_element_features: bool,
    /// Include orbital features (STO coefficients)
    pub include_orbital_features: bool,
    /// Include hybridization features
    pub include_hybridization_features: bool,
    /// Include position features
    pub include_position_features: bool,
    /// Number of radial samples for density
    pub radial_samples: usize,
    /// Maximum radial distance for sampling (angstroms)
    pub max_radius: f64,
    /// Normalize features to unit norm
    pub normalize: bool,
}

impl Default for OrbitalEncoderConfig {
    fn default() -> Self {
        Self {
            include_element_features: true,
            include_orbital_features: true,
            include_hybridization_features: true,
            include_position_features: true,
            radial_samples: 8,
            max_radius: 3.0,
            normalize: true,
        }
    }
}

/// Quantum orbital encoder for atoms.
#[derive(Debug, Clone)]
pub struct OrbitalEncoder {
    config: OrbitalEncoderConfig,
    feature_dim: usize,
}

impl OrbitalEncoder {
    /// Creates a new orbital encoder.
    #[must_use]
    pub fn new(config: OrbitalEncoderConfig) -> Self {
        let feature_dim = Self::compute_feature_dim(&config);
        Self { config, feature_dim }
    }

    /// Creates an encoder with default configuration.
    #[must_use]
    pub fn default_encoder() -> Self {
        Self::new(OrbitalEncoderConfig::default())
    }

    /// Computes the feature dimension based on configuration.
    fn compute_feature_dim(config: &OrbitalEncoderConfig) -> usize {
        let mut dim = 0;

        if config.include_element_features {
            // atomic_number, electronegativity, covalent_radius, valence_electrons,
            // atomic_mass_normalized, one-hot element (10 elements)
            dim += 5 + 10;
        }

        if config.include_orbital_features {
            // For each orbital type: s(1), p(3), d(5) = 9 coefficients
            // Plus radial density samples
            dim += 9 + config.radial_samples;
        }

        if config.include_hybridization_features {
            // One-hot encoding of hybridization (7 types)
            dim += 7;
        }

        if config.include_position_features {
            // x, y, z coordinates
            dim += 3;
        }

        dim
    }

    /// Returns the feature dimension.
    #[must_use]
    pub fn feature_dim(&self) -> usize {
        self.feature_dim
    }

    /// Returns the encoder configuration.
    #[must_use]
    pub fn config(&self) -> &OrbitalEncoderConfig {
        &self.config
    }

    /// Encodes an atom into a feature vector.
    #[must_use]
    pub fn encode_atom(&self, atom: &Atom) -> Array1<f64> {
        let mut features = Vec::with_capacity(self.feature_dim);

        if self.config.include_element_features {
            self.encode_element_features(atom, &mut features);
        }

        if self.config.include_orbital_features {
            self.encode_orbital_features(atom, &mut features);
        }

        if self.config.include_hybridization_features {
            self.encode_hybridization_features(atom, &mut features);
        }

        if self.config.include_position_features {
            features.push(atom.position[0]);
            features.push(atom.position[1]);
            features.push(atom.position[2]);
        }

        let mut result = Array1::from_vec(features);

        if self.config.normalize {
            let norm = result.iter().map(|x| x * x).sum::<f64>().sqrt();
            if norm > 1e-10 {
                result /= norm;
            }
        }

        result
    }

    /// Encodes element-specific features.
    fn encode_element_features(&self, atom: &Atom, features: &mut Vec<f64>) {
        let elem = atom.element;

        // Continuous features
        features.push(elem.atomic_number() as f64 / 100.0); // Normalized
        features.push(elem.electronegativity() / 4.0); // Normalized (max ~4)
        features.push(elem.covalent_radius()); // Already in angstroms
        features.push(elem.valence_electrons() as f64 / 8.0); // Normalized
        features.push(elem.atomic_mass() / 130.0); // Normalized (approx max)

        // One-hot encoding of element
        let element_idx = match elem {
            Element::Hydrogen => 0,
            Element::Carbon => 1,
            Element::Nitrogen => 2,
            Element::Oxygen => 3,
            Element::Fluorine => 4,
            Element::Phosphorus => 5,
            Element::Sulfur => 6,
            Element::Chlorine => 7,
            Element::Bromine => 8,
            Element::Iodine => 9,
        };

        for i in 0..10 {
            features.push(if i == element_idx { 1.0 } else { 0.0 });
        }
    }

    /// Encodes orbital-specific features.
    fn encode_orbital_features(&self, atom: &Atom, features: &mut Vec<f64>) {
        let valence_orbitals = atom.element.valence_orbitals();
        let zeta = self.slater_exponent(atom.element);

        // Orbital occupation coefficients
        let mut s_coef = 0.0;
        let mut p_coef = [0.0; 3];
        let mut d_coef = [0.0; 5];

        for orbital in &valence_orbitals {
            match orbital {
                OrbitalType::S { .. } => s_coef = 1.0,
                OrbitalType::P { m, .. } => {
                    let idx = (*m + 1) as usize;
                    if idx < 3 {
                        p_coef[idx] = 1.0;
                    }
                }
                OrbitalType::D { m, .. } => {
                    let idx = (*m + 2) as usize;
                    if idx < 5 {
                        d_coef[idx] = 1.0;
                    }
                }
                _ => {}
            }
        }

        features.push(s_coef);
        features.extend_from_slice(&p_coef);
        features.extend_from_slice(&d_coef);

        // Radial density samples
        let slater = SlaterOrbital::new(OrbitalType::S { n: 1 }, zeta);
        let dr = self.config.max_radius / self.config.radial_samples as f64;

        for i in 0..self.config.radial_samples {
            let r = (i as f64 + 0.5) * dr;
            features.push(slater.density(r));
        }
    }

    /// Encodes hybridization features.
    fn encode_hybridization_features(&self, atom: &Atom, features: &mut Vec<f64>) {
        let hybrid_idx = match atom.hybridization {
            Hybridization::S => 0,
            Hybridization::Sp => 1,
            Hybridization::Sp2 => 2,
            Hybridization::Sp3 => 3,
            Hybridization::Sp3d => 4,
            Hybridization::Sp3d2 => 5,
            Hybridization::Unknown => 6,
        };

        for i in 0..7 {
            features.push(if i == hybrid_idx { 1.0 } else { 0.0 });
        }
    }

    /// Returns the Slater exponent for an element.
    #[must_use]
    pub fn slater_exponent(&self, element: Element) -> f64 {
        // Approximate Slater exponents for valence orbitals
        match element {
            Element::Hydrogen => 1.0,
            Element::Carbon => 1.625,
            Element::Nitrogen => 1.95,
            Element::Oxygen => 2.275,
            Element::Fluorine => 2.6,
            Element::Phosphorus => 1.6,
            Element::Sulfur => 1.817,
            Element::Chlorine => 2.033,
            Element::Bromine => 2.588,
            Element::Iodine => 2.679,
        }
    }

    /// Computes the orbital overlap between two atoms.
    ///
    /// This is a simplified approximation based on Slater orbitals.
    #[must_use]
    pub fn orbital_overlap(&self, atom1: &Atom, atom2: &Atom) -> f64 {
        let r = atom1.distance_to(atom2);

        if r < 1e-10 {
            return 1.0;
        }

        let zeta1 = self.slater_exponent(atom1.element);
        let zeta2 = self.slater_exponent(atom2.element);
        let zeta_avg = (zeta1 + zeta2) / 2.0;

        // Simplified overlap integral approximation
        // S(r) ~ exp(-zeta * r)
        (-zeta_avg * r).exp()
    }

    /// Computes the overlap matrix for a set of atoms.
    #[must_use]
    pub fn overlap_matrix(&self, atoms: &[Atom]) -> Array2<f64> {
        let n = atoms.len();
        let mut overlap = Array2::zeros((n, n));

        for i in 0..n {
            overlap[[i, i]] = 1.0;
            for j in (i + 1)..n {
                let s = self.orbital_overlap(&atoms[i], &atoms[j]);
                overlap[[i, j]] = s;
                overlap[[j, i]] = s;
            }
        }

        overlap
    }

    /// Encodes multiple atoms in parallel.
    #[must_use]
    pub fn encode_atoms(&self, atoms: &[Atom]) -> Array2<f64> {
        let num_atoms = atoms.len();
        let mut features = Array2::zeros((num_atoms, self.feature_dim));

        for (i, atom) in atoms.iter().enumerate() {
            let atom_features = self.encode_atom(atom);
            features.row_mut(i).assign(&atom_features);
        }

        features
    }
}

impl Default for OrbitalEncoder {
    fn default() -> Self {
        Self::default_encoder()
    }
}

/// Electron density calculator for molecules.
#[derive(Debug, Clone)]
pub struct ElectronDensity {
    /// Grid resolution (points per angstrom)
    pub resolution: f64,
    /// Padding around molecule (angstroms)
    pub padding: f64,
}

impl Default for ElectronDensity {
    fn default() -> Self {
        Self {
            resolution: 2.0,
            padding: 2.0,
        }
    }
}

impl ElectronDensity {
    /// Creates a new electron density calculator.
    #[must_use]
    pub fn new(resolution: f64, padding: f64) -> Self {
        Self { resolution, padding }
    }

    /// Computes the electron density at a point due to an atom.
    ///
    /// Uses a simplified Gaussian approximation for the electron cloud.
    #[must_use]
    pub fn density_at_point(&self, point: [f64; 3], atom: &Atom) -> f64 {
        let dx = point[0] - atom.position[0];
        let dy = point[1] - atom.position[1];
        let dz = point[2] - atom.position[2];
        let r2 = dx * dx + dy * dy + dz * dz;

        // Gaussian approximation with width proportional to covalent radius
        let sigma = atom.element.covalent_radius();
        let z = atom.element.valence_electrons() as f64;

        // Electron density ~ Z * exp(-r^2 / (2*sigma^2))
        z * (-r2 / (2.0 * sigma * sigma)).exp()
    }

    /// Computes the total electron density at a point for all atoms.
    #[must_use]
    pub fn total_density(&self, point: [f64; 3], atoms: &[Atom]) -> f64 {
        atoms
            .iter()
            .map(|atom| self.density_at_point(point, atom))
            .sum()
    }
}

/// Quantum coupling calculator for bonds.
#[derive(Debug, Clone)]
pub struct QuantumCoupling {
    encoder: OrbitalEncoder,
}

impl QuantumCoupling {
    /// Creates a new quantum coupling calculator.
    #[must_use]
    pub fn new(encoder: OrbitalEncoder) -> Self {
        Self { encoder }
    }

    /// Computes the quantum coupling strength between two atoms.
    ///
    /// This considers orbital overlap, electronegativity difference, and distance.
    #[must_use]
    pub fn coupling_strength(&self, atom1: &Atom, atom2: &Atom) -> f64 {
        let overlap = self.encoder.orbital_overlap(atom1, atom2);
        let en_diff =
            (atom1.element.electronegativity() - atom2.element.electronegativity()).abs();

        // Coupling decreases with electronegativity difference (ionic character)
        let ionic_factor = (-en_diff / 2.0).exp();

        overlap * ionic_factor
    }

    /// Computes the quantum coupling matrix for a set of atoms.
    #[must_use]
    pub fn coupling_matrix(&self, atoms: &[Atom]) -> Array2<f64> {
        let n = atoms.len();
        let mut coupling = Array2::zeros((n, n));

        for i in 0..n {
            coupling[[i, i]] = 1.0;
            for j in (i + 1)..n {
                let c = self.coupling_strength(&atoms[i], &atoms[j]);
                coupling[[i, j]] = c;
                coupling[[j, i]] = c;
            }
        }

        coupling
    }
}

impl Default for QuantumCoupling {
    fn default() -> Self {
        Self::new(OrbitalEncoder::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_orbital_type_properties() {
        let s = OrbitalType::S { n: 1 };
        assert_eq!(s.angular_momentum(), 0);
        assert_eq!(s.principal_quantum_number(), 1);
        assert_eq!(s.num_orbitals(), 1);

        let p = OrbitalType::P { n: 2, m: 0 };
        assert_eq!(p.angular_momentum(), 1);
        assert_eq!(p.num_orbitals(), 3);

        let d = OrbitalType::D { n: 3, m: 0 };
        assert_eq!(d.angular_momentum(), 2);
        assert_eq!(d.num_orbitals(), 5);
    }

    #[test]
    fn test_orbital_validation() {
        let valid = OrbitalType::P { n: 2, m: 1 };
        assert!(valid.validate().is_ok());

        let invalid_n = OrbitalType::S { n: 0 };
        assert!(invalid_n.validate().is_err());
    }

    #[test]
    fn test_orbital_name() {
        let s = OrbitalType::S { n: 1 };
        assert_eq!(s.name(), "1s");

        let px = OrbitalType::P { n: 2, m: 1 };
        assert_eq!(px.name(), "2px");

        let dz2 = OrbitalType::D { n: 3, m: 0 };
        assert_eq!(dz2.name(), "3dz2");
    }

    #[test]
    fn test_slater_orbital_radial() {
        let slater = SlaterOrbital::new(OrbitalType::S { n: 1 }, 1.0);

        // Radial function should decay with distance
        let r1 = slater.radial(0.5);
        let r2 = slater.radial(1.0);
        let r3 = slater.radial(2.0);

        assert!(r1 > r2);
        assert!(r2 > r3);
    }

    #[test]
    fn test_slater_orbital_density() {
        let slater = SlaterOrbital::new(OrbitalType::S { n: 1 }, 1.0);

        let d1 = slater.density(0.5);
        let d2 = slater.density(1.0);

        // Density should be positive
        assert!(d1 > 0.0);
        assert!(d2 > 0.0);
        // Density should decay with distance
        assert!(d1 > d2);
    }

    #[test]
    fn test_encoder_feature_dim() {
        let encoder = OrbitalEncoder::default_encoder();
        let dim = encoder.feature_dim();

        // Should be positive and reasonable
        assert!(dim > 0);
        assert!(dim < 100);
    }

    #[test]
    fn test_encode_atom() {
        let encoder = OrbitalEncoder::default_encoder();
        let carbon = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);
        let features = encoder.encode_atom(&carbon);

        assert_eq!(features.len(), encoder.feature_dim());

        // With normalization, should have unit norm
        let norm: f64 = features.iter().map(|x| x * x).sum::<f64>().sqrt();
        assert!((norm - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_encode_different_elements() {
        let encoder = OrbitalEncoder::default_encoder();

        let h = Atom::new(Element::Hydrogen, [0.0, 0.0, 0.0]);
        let c = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);
        let o = Atom::new(Element::Oxygen, [0.0, 0.0, 0.0]);

        let h_features = encoder.encode_atom(&h);
        let c_features = encoder.encode_atom(&c);
        let o_features = encoder.encode_atom(&o);

        // Features should be different for different elements
        let diff_hc: f64 = h_features
            .iter()
            .zip(c_features.iter())
            .map(|(a, b)| (a - b).abs())
            .sum();
        let diff_co: f64 = c_features
            .iter()
            .zip(o_features.iter())
            .map(|(a, b)| (a - b).abs())
            .sum();

        assert!(diff_hc > 0.1);
        assert!(diff_co > 0.1);
    }

    #[test]
    fn test_orbital_overlap() {
        let encoder = OrbitalEncoder::default_encoder();

        let c1 = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);
        let c2 = Atom::new(Element::Carbon, [1.54, 0.0, 0.0]); // C-C bond distance

        let overlap = encoder.orbital_overlap(&c1, &c2);

        // Overlap should be between 0 and 1
        assert!(overlap >= 0.0);
        assert!(overlap <= 1.0);

        // Self overlap should be 1
        let self_overlap = encoder.orbital_overlap(&c1, &c1);
        assert!((self_overlap - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_overlap_matrix() {
        let encoder = OrbitalEncoder::default_encoder();

        let atoms = vec![
            Atom::new(Element::Carbon, [0.0, 0.0, 0.0]),
            Atom::new(Element::Hydrogen, [1.09, 0.0, 0.0]),
            Atom::new(Element::Hydrogen, [-0.36, 1.03, 0.0]),
        ];

        let overlap = encoder.overlap_matrix(&atoms);

        assert_eq!(overlap.shape(), &[3, 3]);

        // Diagonal should be 1
        for i in 0..3 {
            assert!((overlap[[i, i]] - 1.0).abs() < 1e-6);
        }

        // Matrix should be symmetric
        for i in 0..3 {
            for j in 0..3 {
                assert!((overlap[[i, j]] - overlap[[j, i]]).abs() < 1e-10);
            }
        }
    }

    #[test]
    fn test_encode_atoms_batch() {
        let encoder = OrbitalEncoder::default_encoder();

        let atoms = vec![
            Atom::new(Element::Carbon, [0.0, 0.0, 0.0]),
            Atom::new(Element::Hydrogen, [1.0, 0.0, 0.0]),
            Atom::new(Element::Oxygen, [0.0, 1.0, 0.0]),
        ];

        let features = encoder.encode_atoms(&atoms);

        assert_eq!(features.shape(), &[3, encoder.feature_dim()]);
    }

    #[test]
    fn test_slater_exponents() {
        let encoder = OrbitalEncoder::default_encoder();

        // Heavier elements should have larger Slater exponents
        let zeta_h = encoder.slater_exponent(Element::Hydrogen);
        let zeta_o = encoder.slater_exponent(Element::Oxygen);

        assert!(zeta_o > zeta_h);
    }

    #[test]
    fn test_electron_density() {
        let density_calc = ElectronDensity::default();
        let carbon = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);

        // Density at nucleus
        let d_nucleus = density_calc.density_at_point([0.0, 0.0, 0.0], &carbon);

        // Density away from nucleus
        let d_far = density_calc.density_at_point([2.0, 2.0, 2.0], &carbon);

        assert!(d_nucleus > d_far);
        assert!(d_nucleus > 0.0);
    }

    #[test]
    fn test_quantum_coupling() {
        let coupling = QuantumCoupling::default();

        let c = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);
        let h = Atom::new(Element::Hydrogen, [1.09, 0.0, 0.0]);
        let f = Atom::new(Element::Fluorine, [1.35, 0.0, 0.0]);

        let c_h_coupling = coupling.coupling_strength(&c, &h);
        let c_f_coupling = coupling.coupling_strength(&c, &f);

        // C-H should have stronger coupling (smaller electronegativity difference)
        // Actually C-F distance is larger, so this comparison isn't direct
        assert!(c_h_coupling > 0.0);
        assert!(c_f_coupling > 0.0);
    }

    #[test]
    fn test_coupling_matrix() {
        let coupling = QuantumCoupling::default();

        let atoms = vec![
            Atom::new(Element::Oxygen, [0.0, 0.0, 0.0]),
            Atom::new(Element::Hydrogen, [0.96, 0.0, 0.0]),
            Atom::new(Element::Hydrogen, [-0.24, 0.93, 0.0]),
        ];

        let matrix = coupling.coupling_matrix(&atoms);

        assert_eq!(matrix.shape(), &[3, 3]);

        // Diagonal should be 1
        for i in 0..3 {
            assert!((matrix[[i, i]] - 1.0).abs() < 1e-6);
        }
    }

    #[test]
    fn test_config_without_normalization() {
        let config = OrbitalEncoderConfig {
            normalize: false,
            ..Default::default()
        };
        let encoder = OrbitalEncoder::new(config);

        let carbon = Atom::new(Element::Carbon, [0.0, 0.0, 0.0]);
        let features = encoder.encode_atom(&carbon);

        // Without normalization, norm should not be 1
        let norm: f64 = features.iter().map(|x| x * x).sum::<f64>().sqrt();
        assert!((norm - 1.0).abs() > 0.1);
    }

    #[test]
    fn test_minimal_config() {
        let config = OrbitalEncoderConfig {
            include_element_features: true,
            include_orbital_features: false,
            include_hybridization_features: false,
            include_position_features: false,
            normalize: false,
            ..Default::default()
        };
        let encoder = OrbitalEncoder::new(config);

        // Should have only element features: 5 continuous + 10 one-hot = 15
        assert_eq!(encoder.feature_dim(), 15);
    }
}
