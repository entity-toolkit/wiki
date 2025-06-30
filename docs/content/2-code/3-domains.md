---
hide:
  - footer
libraries:
  - mermaid
  - three
scripts:
  - domains
---

# Metadomain, subdomains and meshes

!!! abstract "Relevant headers"

    - `framework/domain/metadomain.h`
    - `framework/domain/domain.h`
    - `framework/domain/grid.h`
    - `framework/domain/mesh.h`

The main object which contains all the data and configuration of the simulation, including domain decomposition, the mesh discretization, the metric, the fields and the particles is the `Metadomain<S,M>` class (where `S` is the simulation engine template argument, and `M` is the metric class). From the metadomain object, we can access all the subdomains `Metadomain<S,M>::subdomain(idx) -> const Domain<S,M>&` (`::subdomain_ptr(idx) -> Domain<S,M>*`; `idx` is the index of the subdomain), the global mesh `Metadomain<S,M>::mesh() -> const Mesh<M>&`, and the global metric `Metadomain<S,M>::mesh().metric -> const Metric<D>&`. Each subdomain also contains a mesh and a metric object, which can be accessed with `Domain<S,M>::mesh` and `Domain<S,M>::mesh.metric`. Fields and particle species are stored for each subdomain: `Domain<S,M>::fields` and `Domain<S,M>::species`. 

Thus, the hierarchy of data objects is as follows:

```c++
Metadomain<S,M>
├── Mesh<M> : g_mesh
└── [Domain<S,M>, Domain<S,M>, ...] : g_subdomains
     ├── Mesh<M> : mesh
     │   └── Metric<D> : metric
     ├── Fields<D,S> : fields
     └── [Particles<D,S>, ...] : species
```

Remember, that the local code-unit coordinates in Entity go from $0$ to $n_i$ (where $n_i$ is the number of cells in the $i$-th direction). Because of that, metrics and coordinate systems on all subdomains can be different. However, the code guarantees that the transitions between the subdomains is continuous, and no vector transformations are needed when passing from one subdomain to another (coordinate transformations still have to be done).


!!! note "Local vs non-local subdomains"

    While the metadomain object which exists on all MPI ranks contains information on all the subdomains of the global simulation, the data for fields and particles is only allocated for the so-called "local" subdomains, owned by the current MPI rank. To get the indices of the subdomains on the local MPI rank, use `Metadomain<S,M>::local_subdomain_indices() -> std::vector<unsigned int>`. To run a specific function on all the local subdomains use the following lambda construct:
    ```cpp
    metadomain.runOnLocalDomains([&](auto& loc_dom) {
      // do something with loc_dom
    });
    ```
    If you do not plan to modify the local subdomains, you should use the `const` version of this function:
    ```cpp
    metadomain.runOnLocalDomainsConst([&](auto& loc_dom) {
      // do something with loc_dom without modifying it
    });
    ```
    Non-local subdomains are also referred to as placeholders, and one could check whether a given subdomain is a placeholder using the built-in `is_placeholder()` method.

<div class="three-diagram" id="three-metadomain"></div>

The diagram below demonstrates the structure of the metadomain object, the subdomains, and the mesh with all the contained variables and methods. Fields and particles are described [in the following section](./4-fields_particles.md), while the metrics are [discussed here](./5-metrics.md).

<pre class="mermaid-diagram">
classDiagram
  class Metadomain~SimEngine, Metric~{
    +Dimension D$
    -uint g_ndomains
    -vector~int~ g_decomposition
    -vector~uint~ g_ndomains_per_dim
    -vector~vector~uint~~ g_domain_offsets
    -map~vector|uint~ g_domain_offset2index
    -vector~Domain~SimEngine,Metric~~ g_subdomains
    -vector~uint~ g_local_subdomain_indices
    -Mesh~Metric~ g_mesh
    -const map~string|real_t~ g_metric_params
    -const vector~ParticleSpecies~ g_species_params
    -out::Writer g_writer
    -int g_mpi_rank
    -int g_mpi_size
    +runOnLocalDomains(Func, Args...)
    +runOnLocalDomainsConst(Func, Args...)
    +Communicate(Domain, CommTags)
    +InitWriter(SimulationParams)
    +Write(SimulationParams, size_t, float)
    +ndomains() uint
    +ndomains_per_dim() vector~uint~
    +subdomain(uint) const &Domain
    +subdomain_ptr(uint) *Domain
    +mesh() const &Mesh
    +species_params() const vector~ParticleSpecies~
    +local_subdomain_indices() const vector~uint~
    +createEmptyDomains()
    +redefineNeighbors()
    +redefineBoundaries()
    +initialValidityCheck()
    +finalValidityCheck()
    +metricCompatibilityCheck()
  }
  class Domain~SimEngine, Metric~{
    +Dimension D$
    -int m_index
    -vector~uint~ m_offset_ndomains
    -vector~size_t~ m_offset_ncells
    -map~dir_t|CommBC~ m_comm_bc
    -map~dir_t|uint~ m_neighbor_idx
    -int m_mpi_rank
    +Mesh~Metric~ mesh
    +Fields~Dimension|SimEngine~ fields
    +vector~Particles~Dimension|CoordType~~ species
    +index() int
    +offset_ndomains() vector~uint~
    +offset_ncells() vector~size_t~
    +neighbor_idx_in(dir_t) uint
    +is_placeholder() bool
    +set_neighbor_idx(dir_t, uint)
    +mpi_rank() int
    +set_mpi_rank(int)
  }
  class Grid~Dimension~{
    #vector~size_t~ m_resolution
    +i_min(in::) size_t
    +i_max(in::) size_t
    +n_active(in::) size_t
    +n_active(in::) vector~size_t~
    +n_all(in::) size_t
    +n_all(in::) vector~size_t~
    +rangeActiveCells[|OnHost]() range_t~D~
    +rangeAllCells[|OnHost]() range_t~D~
    +rangeCells[|OnHost](boxRegion_t~D~) range_t~D~
  }
  class Mesh~Metric~{
    +Dimension D$
    +bool is_mesh$
    -vector~pair~real_t~~ m_extents
    -map~dir_t|FldsBC~ m_flds_bc
    -map~dir_t|PrtlBC~ m_prtl_bc
    -const map~str|real_t~ m_metric_params
    +Metric~Dimension~ metric
    +extent(in::) pair~real_t~
    +extent() vector~pair~real_t~~
    +flds_bc() vector~pair~FldsBC~~
    +prtl_bc() vector~pair~PrtlBC~~
    +flds_bc_in(dir_t d) FldsBC
    +prtl_bc_in(dir_t d) PrtlBC
    +set_flds_bc(dir_t d, FldsBC bc)
    +set_prtl_bc(dir_t d, PrtlBC bc)
  }
  class Metric~Dimension~{
    see metrics...*
  }
  class Fields~Dimension, SimEngine~{
    see fields...*
  }
  class Particles~Dimension, CoordType~{
    see particles...*
  }
  Domain --* Mesh : contains
  Grid <|-- Mesh : inherits
  Mesh --* Metric : contains
  Metadomain --* Domain : contains many
  Metadomain --* Mesh : contains
  Domain --* Fields : contains
  Domain --* Particles : contains many

  note "+: public\n-: private\n#: protected\nunderline: static constexpr\nitalic: virtual"
</pre>
