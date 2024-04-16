---
hide:
  - footer
---

# Domains and meshes

The main object which contains the information on global geometry of the domain including domain decomposition, the discretization, and the physical mesh is the `Metadomain<Metric<D>>` class.

*THIS SECTION IS UNDER CONSTRUCTION*

```mermaid
classDiagram
  class Metadomain~SimEngine, Metric~{
    +Dimension D$
    -uint g_ndomains
    -vector~int~ g_decomposition
    -vector~uint~ g_ndomains_per_dim
    -vector~vector~uint~~ g_domain_offsets
    -map~vector|uint~ g_domain_offset2index
    -vector~Domain~Metric~~ g_subdomains
    -vector~size_t~ g_ncells
    -vector~pair~real_t~~ g_extent
    -vector~pair~FldsBC~~ g_flds_bc
    -vector~pair~PrtlBC~~ g_prtl_bc
    -Metric g_metric
    -const map~str|real_t~ g_metric_params
    +idx2subdomain(uint) &Domain
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
    -map~dir_t|*Domain~ m_neighbors
    +Mesh~Metric~ mesh
    +index() int
    +offset_ndomains() vector~uint~
    +offset_ncells() vector~size_t~
    +comm_bc_in(dir_t d) CommBC
    +neighbor_in(dir_t d) *Domain
    +setCommBc(dir_t d, CommBC bc)
    +setNeighbor(dir_t d, *Domain neighbor)
  }
  class Grid~Dimension~{
    #vector~size_t~ m_resolution
    +i_min(ushort) size_t
    +i_max(ushort) size_t
    +n_active(ushort) size_t
    +n_all(ushort) real_t
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
    +Metric metric
    +extent(ushort d) pair~real_t~
    +flds_bc_in(dir_t d) FldsBC
    +prtl_bc_in(dir_t d) PrtlBC
    +setFldsBc(dir_t d, FldsBC bc)
    +setPrtlBc(dir_t d, PrtlBC bc)
  }
  class Metric~Dimension~{
    see metrics...*
  }
  Domain --* Mesh : contains
  Grid <|-- Mesh : inherits
  Mesh --* Metric : contains
  Metadomain --* Domain : contains many

  note "+: public\n-: private\n#: protected\nunderline: static constexpr\nitalic: virtual"
```
