---
hide:
  - footer
---

# Metrics

Metrics are key objects of the Entity framework. Superimposed on the discretized mesh, they define the spacetime geometry of the simulation and provide necessary functions for converting coordinates and transforming vectors from one basis to another.

Each metric has a number of distinct attributes. These are:

- `D`: the dimensionality of the metric:
    - `Dim::_1D`, `Dim::_2D`, `Dim::_3D`
- `Label`: a string that identifies the metric;
- `CoordType`: the type of coordinates used in the metric;
    - `Coord::Cart`, `Coord::Sph`, `Coord::Qsph`
- `PrtlDim`: the dimensionality of the particle coordinates (1) 
    { .annotate }

    1.  :man_raising_hand: In 2D axisymmetric SR simulations, particles carry all three coordinates to recover their full Cartesian position, and transform fields to/from the global Cartesian basis.



```mermaid
classDiagram
  direction LR
  class MetricBase~Dimension~{
    +bool is_metric$
    +Dimension Dim$
    #const real_t nx1
    #const real_t nx2
    #const real_t nx3
    #const real_t x1_min
    #const real_t x1_max
    #const real_t x2_min
    #const real_t x2_max
    #const real_t x3_min
    #const real_t x3_max
    #real_t dx_min
    +find_dxMin() real_t*
    +dxMin() real_t
    +set_dxMin(real_t)
  }
  class Metric~Dimension~{
    +string_view Label$
    +Dimension PrtlDim$
    +Coord CoordType$
    +find_dxMin() real_t
    +h_~idx_t|idx_t~(coord_t~D~) real_t
    +sqrt_det_h(coord_t~D~) real_t
    +convert~idx_t|Crd|Crd~(real_t) real_t
    +convert~Crd|Crd~(coord_t~D~, coord_t~D~)
    +transform~idx_t|Idx|Idx~(coord_t~D~, real_t) real_t
    +transform~Idx|Idx~(coord_t~D~, vec_t, vec_t)
  }
  class Minkowski~Dimension~ {
    -const real_t dx, dx_inv
    +sqrt_h_~idx_t|idx_t~(coord_t~D~) real_t
    +convert_xyz~Crd|Crd~(coord_t~D~, coord_t~D~)
    +transform_xyz~Idx|Idx~(coord_t~D~, vec_t, vec_t)
  }
  class Spherical~Dimension~ {
    -const real_t dr, dtheta, dphi
    -const real_t dr_inv, dtheta_inv, dphi_inv
    +sqrt_h_~idx_t|idx_t~(coord_t~D~) real_t
    +convert_xyz~Crd|Crd~(coord_t~D~, coord_t~D~)
    +transform_xyz~Idx|Idx~(coord_t~D~, vec_t, vec_t)
    +polar_area(real_t) real_t
  }
  class QSpherical~Dimension~ {
    -const real_t r0, h, chi_min, eta_min, phi_min
    -const real_t dchi, deta, dphi
    -const real_t dchi_inv, deta_inv, dphi_inv
    -const real_t dchi_sqr, deta_sqr, dphi_sqr
    +sqrt_h_~idx_t|idx_t~(coord_t~D~) real_t
    +convert_xyz~Crd|Crd~(coord_t~D~, coord_t~D~)
    +transform_xyz~Idx|Idx~(coord_t~D~, vec_t, vec_t)
    +polar_area(real_t) real_t
    -dtheta_deta(real_t) real_t
    -eta2theta(real_t) real_t
    -theta2eta(real_t) real_t
  }
  class KerrSchild~Dimension~ {
    -const real_t a, rg_, rh_
    -const real_t dr, dtheta, dphi
    -const real_t dr_inv, dtheta_inv, dphi_inv
    +h~idx_t|idx_t~(coord_t~D~) real_t
    +sqrt_det_h_tilde(coord_t~D~) real_t
    +alpha(coord_t~D~) real_t
    +beta1(coord_t~D~) real_t
    +polar_area(real_t) real_t
  }
  class KerrSchild0~Dimension~ {
    -const real_t dr, dtheta, dphi
    -const real_t dr_inv, dtheta_inv, dphi_inv
    +h~idx_t|idx_t~(coord_t~D~) real_t
    +sqrt_det_h_tilde(coord_t~D~) real_t
    +alpha(coord_t~D~) real_t
    +beta1(coord_t~D~) real_t
    +polar_area(real_t) real_t
  }
  class QKerrSchild~Dimension~ {
    -const real_t a, rg_, rh_
    -const real_t chi_min, eta_min, phi_min
    -const real_t dchi, deta, dphi
    -const real_t dchi_inv, deta_inv, dphi_inv
    +h~idx_t|idx_t~(coord_t~D~) real_t
    +sqrt_det_h_tilde(coord_t~D~) real_t
    +alpha(coord_t~D~) real_t
    +beta1(coord_t~D~) real_t
    +polar_area(real_t) real_t
    -dtheta_deta(real_t) real_t
    -eta2theta(real_t) real_t
    -theta2eta(real_t) real_t
  }
  MetricBase <|-- Metric : inherits
  Metric <|-- Minkowski : implements
  Metric <|-- Spherical : implements
  Metric <|-- QSpherical : implements
  Metric <|-- KerrSchild : implements
  Metric <|-- QKerrSchild : implements
  Metric <|-- KerrSchild0 : implements
  note "+: public\n-: private\n#: protected\nunderline: static constexpr\nitalic: virtual"
```

  <!-- namespace SRMetrics {
    class Minkowski~Dimension~ {
      -const real_t dx, dx_sqr, dx_inv
    }
    class Spherical~Dimension~ {
      
      
      
      +h_~idx_t|idx_t~(coord_t~D~) real_t
      +sqrt_h_~idx_t|idx_t~(coord_t~D~) real_t
      +sqrt_det_h(coord_t~D~) real_t
      +convert~idx_t|Crd|Crd~(real_t) real_t
      +convert~Crd|Crd~(coord_t~D~, coord_t~D~)
      
      +transform~idx_t|Idx|Idx~(coord_t~D~, real_t) real_t
      +transform~Idx|Idx~(coord_t~D~, vec_t, vec_t)
      
    }
  } -->

[^1]: Some say yes