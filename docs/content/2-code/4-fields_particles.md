---
hide:
  - footer
libraries:
  - mermaid
---

# Fields and particles

!!! abstract "Relevant headers"

    - `framework/containers/fields.h`
    - `framework/containers/species.h`
    - `framework/containers/particles.h`

To store the main data of the simulation, the fields and the particles, Entity provides container classes `Fields<D,S>` and `Particles<D,C>`, where `D` is a template argument for the dimension, `S` for the simulation engine, and `C` for the coordinate type. Notice, that none of these objects know anything about the geometry of the space-time (i.e., the metric), and thus they should be used in conjunction with the `Mesh<M>` object [discussed here](./3-domains.md).

Depending on the simulation engine, and the coordinate system, these object allocate some of the built-in arrays, while ignoring the others. Below is a full breakdown for all the arrays for both of these classes. We assume that $n_i$ is the number of cells on the given subdomain in the $i$-th direction.

#### Fields

| Name | Shape | Description | Allocated when... |
|------------|-------------------|-------------|-------------------|
| `em`       | $n_1[\times n_2[\times n_3]]\times 6$| main container for the electric and magnetic fields $E^i$, $B^i$ in SR and $D^i$, $B^i$ in GR| always |
| `bckp`     | $n_1[\times n_2[\times n_3]]\times 6$| used for intermediate operations (e.g., output) | always |
| `cur`      | $n_1[\times n_2[\times n_3]]\times 3$| current densities $J^i$ | always |
| `buff`     | $n_1[\times n_2[\times n_3]]\times 3$| primarily used for storing intermediate values for the currents (e.g., for filtering) | always |
| `aux`      | $n_1[\times n_2[\times n_3]]\times 6$| auxiliary GR fields $E_i$, $H_i$ | GR |
| `em0`      | $n_1[\times n_2[\times n_3]]\times 6$| second set of electromagnetic fields staggered in time w.r.t. the main ones | GR |
| `cur0`     | $n_1[\times n_2[\times n_3]]\times 3$| current densities at the previous timestep | GR |

All of the field arrays have a type `real_t` which compilers to `float` when using single precision, and `double` when using double precision.

!!! note "Staggering"

    Keep in mind that the field components stored in all these arrays are staggered not only in time, but also in space. Entity employs the [Yee grid staggering](https://en.wikipedia.org/wiki/Finite-difference_time-domain_method), and this the electric fields are stored at the corresponding cell edges, while the magnetic fields are stored at the cell faces. To see how those fields are staggered in time, refer to the [PIC algorithm section](./1-pic.md).

!!! code "Field loops"

    Notice that fields have an additional dimension which stores the component. For convenience, Entity provides aliases to access those components: `em::ex1` (which maps to `0`), `em::bx3` (which maps to `5`), etc. A typical loop over all the fields on the local subdomain would look like this:
    ```cpp
    // assume a 2D simulation
    auto fields = domain.fields;
    auto metric = domain.mesh.metric;
    Kokkos::parallel_for("field_loop",
      domain.mesh.rangeActiveCells(),
      Lambda(index_t i1, index_t i2) {
        // get the code-unit coordinate of the cell corner
        const auto i1_ = COORD(i1);
        const auto i2_ = COORD(i2);
        // get the sqrt_det_h at (i + 1/2, j)
        const auto sqrtdeth = metric.sqrt_det_h({i1_ + HALF, i2_});
        // do something with the Ex1 field (just an example)
        fields.em(i1, i2, em::ex1) *= ONE / sqrtdeth;
      });
    ```

#### Particles

| Name | Type  | Description | Allocated when... |
|------|-------|-------------|-------------------|
| `i1` | `int` | cell index of the particle in $x_1$ | always |
| `i2` | `int` | cell index of the particle in $x_2$ | 2D or 3D |
| `i3` | `int` | cell index of the particle in $x_3$ | 3D |
| `dx1` | `prtldx_t` | displacement of the particle in the cell in $x_1$ | always |
| `dx2` | `prtldx_t` | displacement of the particle in the cell in $x_2$ | 2D or 3D |
| `dx3` | `prtldx_t` | displacement of the particle in the cell in $x_3$ | 3D |
| `ux1` | `real_t` | velocity of the particle (see comment below) | always |
| `ux2` | `real_t` | velocity of the particle (see comment below) | always |
| `ux3` | `real_t` | velocity of the particle (see comment below) | always |
| `weight` | `real_t` | particle weights | always |
| `tag`    | `short` | particle tag | always |
| `phi`    | `real_t` | $\phi$ coordinate of the particle | 2D non-Cartesian |
| `i1_prev` | `int` | same as `i1` but for the previous step | always |
| `i2_prev` | `int` | same as `i2` but for the previous step | 2D or 3D |
| `i3_prev` | `int` | same as `i3` but for the previous step | 3D |
| `dx1_prev` | `prtldx_t` | same as `dx1` but for the previous step | always |
| `dx2_prev` | `prtldx_t` | same as `dx2` but for the previous step | 2D or 3D |
| `dx3_prev` | `prtldx_t` | same as `dx3` but for the previous step | 3D |
| `pld` | `real_t` | custom particle payloads (2D array) |  as needed (defined in the input) |

`prtldx_t` is a type alias for `real_t` which is used for the displacement of the particle w.r.t. the corner of the cell (this can be changed to be half-precision). Notice, that we additionally store the `phi` coordinate for the particles in non-Cartesian 2D simulations. While in GR this is totally optional, in SR it is required to keep track of the full particle coordinate, to be able to convert to and from the global Cartesian metric.

!!! note "Particle velocities"

    Velocities, stored in `ux1`, `ux2`, and `ux3` have different meanings in different configurations. For SR simulations, particle velocities are stored in the **global Cartesian basis**, while in GR, these velocities correspond to the covariant components $u_i$ in code units.

All of the particle arrays have shape of `maxnpart`, which is set at the beginning of the simulation from the input file. To indicate the number of **active** particles, one can use the `npart()` method of the `Particles` object. That being said, remember that particles can always leave the simulation domain, or be sent to another subdomain (while its index would still be less than `npart()`). For that, we use the `tag` field, which can be set to `ParticleTag::dead` to indicate that the particle is no longer active.

!!! code "Particle loops"

    A typical loop over all the particles on the local subdomain would look like this:
    ```cpp
    // for example, taking the first species
    auto particles = domain.species[0];
    Kokkos::parallel_for("prtl_loop",
      particles.rangeActiveParticles(),
      Lambda(index_t p) {
        if (particles.tag(p) == ParticleTag::dead) {
          return;
        }
        // do something with the particle
      });
    ```

Below is the diagram showing the structure of the fields and particles objects, and how they are stored in the `Domain` object.

<pre class="mermaid-diagram">
classDiagram
  class Domain~SimEngine, Metric~{
    see domains...*
  }
  class Particles~Dimension, CoordType~{
    -size_t m_npart
    -size_t m_ntags
    +array_t~int*~ i1
    +array_t~int*~ i2
    +array_t~int*~ i3
    +array_t~prtldx_t*~ dx1
    +array_t~prtldx_t*~ dx2
    +array_t~prtldx_t*~ dx3
    +array_t~real_t*~ ux1
    +array_t~real_t*~ ux2
    +array_t~real_t*~ ux3
    +array_t~real_t*~ weight
    +array_t~int*~ i1_prev
    +array_t~int*~ i2_prev
    +array_t~int*~ i3_prev
    +array_t~prtldx_t*~ dx1_prev
    +array_t~prtldx_t*~ dx2_prev
    +array_t~prtldx_t*~ dx3_prev
    +array_t~short*~ tag
    +array_t~real_t**~ pld
    +array_t~real_t*~ phi
    +rangeActiveParticles() range_t
    +rangeAllParticles() range_t
    +npart() size_t
    +ntags() size_t
    +memory_footprint() size_t
    +npart_per_tag() vector~size_t~
    +set_npart(size_t)
    +SortByTags() vector~size_t~
    +SyncHostDevice()
  }
  class Fields~Dimension, SimEngine~{
    +ndfield_t~D, 6~ em
    +ndfield_t~D, 6~ bckp
    +ndfield_t~D, 3~ cur
    +ndfield_t~D, 3~ buff
    +ndfield_t~D, 6~ aux
    +ndfield_t~D, 6~ em0
    +ndfield_t~D, 3~ cur0
    +memory_footprint() size_t
  }
  class ParticleSpecies {
    -ushort m_index
    -string m_label
    -float m_mass
    -float m_charge
    -size_t m_maxnpart
    -PrtlPusher m_pusher
    -bool m_use_gca
    -Cooling m_cooling
    -ushort m_npld
    +index() ushort
    +label() string
    +mass() float
    +charge() float
    +maxnpart() size_t
    +pusher() PrtlPusher
    +use_gca() bool
    +cooling() Cooling
    +npld() ushort
  }
  
  Domain --* Particles : contains many
  Domain --* Fields : contains
  ParticleSpecies <|-- Particles : inherits

  note "+: public\n-: private\n#: protected\nunderline: static constexpr\nitalic: virtual"
</pre>
