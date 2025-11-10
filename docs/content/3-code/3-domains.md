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
--8<-- "docs/assets/diagrams/domains.mmd"
</pre>
