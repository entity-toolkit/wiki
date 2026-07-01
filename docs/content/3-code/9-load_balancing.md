---
hide:
  - footer
---

# Dynamic load balancing

!!! abstract "Relevant headers"

    - `framework/domain/metadomain.h`
    - `framework/domain/metadomain_loadbal.cpp`
    - `framework/domain/metadomain_comm.cpp`
    - `framework/parameters/parameters.cpp`
    - `engines/engine.hpp`
    - `global/utils/tools.h`

In a PIC run the wall-clock cost of a rank is dominated by the particles it
owns -- the push and the current deposit scale with the local particle count,
not the cell count. When particles cluster (a shock, a reconnection layer, a
collapsing filament), the ranks that happen to hold that region fall behind and
every other rank waits for them at the next communication barrier. Entity can
correct this *during* the run with **diffusion-style dynamic load balancing**:
at a fixed cadence it nudges the interior domain boundaries between MPI
neighbors so that each rank ends up with roughly the same number of active
particles.

The rebalancer is deliberately conservative. It **never repartitions** the
domain -- the number of subdomains per axis, the neighbor graph, and the
boundary conditions are all fixed for the whole run. It only slides the
*interior faces* by at most a ghost-zone width per event, and every byte it
moves travels over the **existing nearest-neighbor field and particle
communication paths**. There is no global gather, no all-to-all, and no new
buffer sized to the domain.

It is off by default and, being an MPI operation, is a no-op in serial builds.

!!! note "Where the work lives"

    All of the balancing logic is one method,
    `Metadomain<S, M>::Rebalance(dim_mask, tolerance, max_shift_cells)` in
    `metadomain_loadbal.cpp`. The engine main loop
    (`engines/engine.hpp`) calls it under a dedicated `LoadBalance` timer, after
    `step_forward` and any `CustomPostStep` but *before* the particle sort -- so
    the sort re-tiles the arrays after migration. The move reuses the same
    `CommunicateFields` (ghost exchange) and `CommunicateParticles` (retag +
    migrate) primitives the ordinary step uses.

## Static decomposition (the starting point)

At startup `tools::Decompose` splits the global grid into a fixed Cartesian
topology of subdomains -- one per MPI rank -- and computes each domain's cell
offset and physical extent (`Metadomain::createEmptyDomains`). This partition is
controlled by `simulation.domain.decomposition` and is what load balancing later
adjusts:

```toml
[simulation.domain]
  # Number of domains
  #   @type: int
  #   @default: 1 [no MPI]; MPI_SIZE [MPI]
  number        = 8
  # Number of domains along each axis (-1 = decide automatically)
  #   @type: array<int> [size 1 :->: 3]
  #   @default: [-1, -1, -1]
  decomposition = [4, 2]     # 4 x 2 = 8 ranks
```

The rebalancer works **within** this topology: a `4 x 2` decomposition stays
`4 x 2` for the whole run. What changes is *where the three interior x1-faces and
the one interior x2-face sit* -- i.e. how many cells each rank owns along a
balanced axis.

## Enabling the rebalancer

Balancing is configured under `[simulation.domain.load_balance]`.

```toml
[simulation.domain.load_balance]
  # Enable dynamic load balancing
  #   @type: bool
  #   @default: false
  enable     = true
  # Run the rebalancer every `interval` timesteps (0 disables)
  #   @type: int
  #   @default: 0
  interval   = 500
  # Axes along which load is redistributed (1 = x1, 2 = x2, 3 = x3)
  #   @type: array<int>, subset of [1, 2, 3]
  #   @default: [1]
  dimensions = [1, 2]
  # Skip an axis when (max - min) / mean of its per-slab particle count is
  # below this fraction
  #   @type: float
  #   @default: 0.1
  tolerance  = 0.1
  # Maximum cell-shift per interior boundary per event
  #   @type: int
  #   @default: N_GHOSTS
  #   @note: clamped at runtime to N_GHOSTS (2 for the default shape order)
  max_shift  = 2
```

`interval` sets the cadence; the rebalancer fires when `enable = true`,
`interval > 0`, and `(step + 1) % interval == 0`. Because each event moves a
boundary by at most `max_shift` cells (see below), a large imbalance is smoothed
out over *several* events -- so `interval` should be short enough that the
diffusion keeps up with how fast the particles migrate, but long enough that the
per-event MPI cost stays negligible. A few hundred steps is a sensible default.

`dimensions` is a list of physical axes, mapped internally to a bitmask
(`dim_mask`): `[1]` balances only along `x1`, `[1, 2]` balances `x1` and `x2`
independently, and so on. Each listed axis is balanced separately on its own 1D
load profile.

## What "load" means

The load metric is the **active-particle count** per rank -- gathered once per
event with a single `MPI_Allgather` of one integer per domain. It is a proxy for
per-rank cost that is exact when the run is particle-dominated (the usual PIC
regime). It does *not* account for field work or per-cell costs, so a run whose
cost is dominated by an expensive field solve rather than by particles will see
little benefit.

For each balanced axis the per-domain counts are **projected onto that axis**:
all domains that share the same topology position along the axis form a *slab*,
and the slab's load is the sum of its domains' particle counts. Balancing then
operates on this 1D load profile, one axis at a time, which is why a `4 x 2`
decomposition can balance `x1` (4 slabs) and `x2` (2 slabs) independently.

## The rebalancing algorithm

A single `Rebalance` call performs one diffusion sweep:

1. **Gather load.** `MPI_Allgather` the active-particle count of every domain.
2. **Project.** Marginalize the counts (and cell widths) onto each balanced
   axis to get the 1D load profile `load_per_pos[d]`.
3. **Decide the shifts.** For each balanced axis, skip it entirely if it is
   already flat -- `(max - min) / mean < tolerance`. Otherwise, for every
   interior boundary $k$ between slabs $k\!-\!1$ and $k$, compute a shift from
   the load *gradient*, normalized by the local particle density:

    $$
    \text{shift}_k = \operatorname{round}\!\left(
      \tfrac{1}{2}\,\frac{L_{k-1} - L_k}{\bar\rho_k}\right),
    \qquad
    \bar\rho_k = \max\!\left(\tfrac{1}{2}(\rho_{k-1}+\rho_k),\, 1\right),
    $$

    where $L$ is the slab load and $\rho = L/\text{ncells}$ its density. The
    busier neighbor cedes cells to the lighter one. The factor $\tfrac{1}{2}$
    under-relaxes the move to roughly a single diffusion step, which keeps the
    boundaries from oscillating. The shift is then clamped to `±max_shift`, and
    further clamped so **neither slab shrinks below** `MIN_NCELLS = 2*N_GHOSTS + 4`
    (a domain can never be starved out of existence).
4. **Recompute geometry.** Prefix-sum the new per-slab cell counts into new cell
   offsets and **physical extents**. The face positions are queried from the
   metric in code coordinates, so curvilinear stretches (log-$r$,
   $\eta$-stretching) are honored -- a shifted face lands at the correct
   physical location, not a uniform one.
5. **Save fields.** Mirror the local `em` field to the host (plus `em0`/`cur0`
   for GRPIC).
6. **Update bookkeeping** for every subdomain: resolution, extent, and cell
   offset. Boundary conditions and the neighbor graph are untouched.
7. **Reallocate and copy.** Rebuild the local `Fields` at the new size and copy
   the saved data back with the offset shift `delta`. Cells that fall outside
   the old array (the strip a rank *gained*) are left at zero.
8. **Refill ghosts.** `CommunicateFields(E | B)` fills the gained strip from the
   neighbor that used to own it.
9. **Migrate particles.** Shift every particle's cell indices by `-delta`,
   retag any particle whose new index leaves the local domain with
   `mpi::SendTag`, and hand off to `CommunicateParticles`, which sends each to
   the correct neighbor. The species are marked unsorted so the next sort
   re-tiles them.

If step 3 produces no nonzero shift on any axis, the call returns early and
touches nothing.

!!! note "Why a ghost-width cap makes it cheap"

    `max_shift` is clamped to `N_GHOSTS` (2 cells for the default shape order).
    That bound is the whole reason no special communication is needed: the strip
    of cells a rank gains is at most one ghost zone wide, so the field data for
    it is **already present in that rank's ghost cells** from the most recent
    exchange -- step 8 is an ordinary ghost refill, not a bespoke transfer.
    Likewise the particles that change hands only ever move to an *immediate*
    neighbor, so step 9 is the ordinary nearest-neighbor particle exchange. A
    large imbalance is corrected by letting the diffusion run over many events,
    each cheap, rather than by one expensive global reshuffle.

## Constraints and caveats

- **MPI only.** In a serial build `Rebalance` is compiled to a no-op.
- **One subdomain per rank.** The current implementation asserts exactly one
  local subdomain per rank.
- **Topology is fixed.** Only interior faces move. The number of ranks per axis,
  the neighbor graph, and the boundary conditions are set at startup and never
  change.
- **Polar axis is off-limits for curvilinear metrics.** For any non-Cartesian
  metric (spherical, QSpherical, Kerr--Schild, ...), balancing along the polar
  ($x2 = \theta$) axis is rejected -- moving a $\theta$-face is sound in
  principle but is fenced off pending validation. The **radial** ($x1$) axis
  *is* supported for these metrics, and step 4 honors the radial stretch, so
  radial balancing is the intended use on spherical/GR grids. On Cartesian grids
  every axis is available.
- **Bounded speed.** Because each event shifts a face by at most `N_GHOSTS`
  cells, the maximum rate at which a boundary can migrate is
  `N_GHOSTS / interval` cells per step. A feature that sweeps across the grid
  faster than this will outrun the balancer.

## Diagnostics: do you need it?

The step timer already reports **per-rank imbalance**. With MPI, each timer line
(and a synthetic `Total`) carries an imbalance figure from
`tools::ArrayImbalance` -- a `0..100` score (a sigmoid of the coefficient of
variation across ranks; `0` = perfectly balanced). A large `Total` imbalance,
concentrated in the `Particles`/`Communications` rows, is the signal that
particle load is skewed and dynamic balancing is worth enabling. Once it is on,
the `LoadBalance` row shows the balancer's own (small) cost, and the `Total`
imbalance should fall as the boundaries settle.

## Examples

### 2D Cartesian shock (balance the propagation axis)

A shock that sweeps along `x1` piles particles into a moving slab. Balancing
`x1` keeps the downstream ranks from idling:

```toml
[simulation.domain]
  number        = 8
  decomposition = [8, 1]        # slabs perpendicular to x1

  [simulation.domain.load_balance]
    enable     = true
    interval   = 200
    dimensions = [1]            # follow the shock along x1
    tolerance  = 0.1
```

### 3D turbulence (balance two axes)

Intermittent clustering in a periodic box is not tied to one axis, so balance
both decomposed directions independently:

```toml
[simulation.domain]
  number        = 64
  decomposition = [4, 4, 4]

  [simulation.domain.load_balance]
    enable     = true
    interval   = 500
    dimensions = [1, 2, 3]
    tolerance  = 0.15           # a looser gate; avoid chasing noise
```

### 2D spherical accretion (radial only)

On a spherical grid the polar axis is off-limits, so balance the radial
direction -- which correctly respects a log-$r$ stretch:

```toml
[simulation.domain]
  number        = 16
  decomposition = [16, 1]       # radial shells

  [simulation.domain.load_balance]
    enable     = true
    interval   = 300
    dimensions = [1]            # x1 = r; x2 = theta is not allowed here
```
