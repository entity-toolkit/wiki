---
libraries:
  - mermaid
---

<pre class="mermaid-diagram">
classDiagram
  direction LR
  class Metadomain {
    +Dimension D$
    -unsigned int g_ndomains
    -vector~int~ g_decomposition
    -vector~unsigned int~ g_ndomains_per_dim
    -vector~vector~unsigned int~~ g_domain_offsets
    -map~vector~unsigned int~, unsigned int~ g_domain_offset2index
    -vector~Domain~S, M~~ g_subdomains
    -vector~unsigned int~ g_local_subdomain_indices
    -Mesh~M~ g_mesh
    -const map~string, real_t~ g_metric_params
    -const vector~ParticleSpecies~ g_species_params
    -stats\:\:Writer g_stats_writer
    +"initialValidityCheck"() void
    +finalValidityCheck() void
    +metricCompatibilityCheck() void
    +createEmptyDomains() void
    +redefineNeighbors() void
    +redefineBoundaries() void
    +CommunicateFields(Domain~S, M~ &, CommTags ) void
    +SynchronizeFields(Domain~S, M~ &, CommTags ) void
    +CommunicateParticles(Domain~S, M~ &) void
    +RemoveDeadParticles(Domain~S, M~ &) void
    +Metadomain(const Metadomain&)(Metadomain &) Metadomain
    +() Metadomain
    +~Metadomain()() Metadomain
    +InitStatsWriter(SimulationParams &, bool ) void
    +WriteStats(SimulationParams &, timestep_t , timestep_t , simtime_t , simtime_t ) bool
    +setFldsBC(bc_in &, FldsBC &) void
    +setPrtlBC(bc_in &, PrtlBC &) void
    +ndomains() unsigned int
    +ndomains_per_dim() vector~unsigned int~
    +subdomain(unsigned int idx) const Domain~S, M~&
    +subdomain_ptr(unsigned int idx) Domain~S, M~*
    +mesh() const Mesh~M~&
    +species_params() const vector~ParticleSpecies~&
    +l_subdomain_indices() vector~unsigned int~
    +l_npart_perspec() vector~npart_t~
    +l_maxnpart_perspec() vector~npart_t~
    +l_npart() size_t
    +l_ncells() size_t
    +species_labels() vector~string~
  }
</pre>