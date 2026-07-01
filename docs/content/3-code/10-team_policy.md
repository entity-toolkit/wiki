---
hide:
  - footer
libraries:
  - p5
scripts:
  - tiled_deposit
---

# Tiled current deposit (`team_policy`)

!!! abstract "Relevant headers"

    - `kernels/currents_deposit.hpp`
    - `engines/srpic/currents.h`
    - `engines/grpic/currents.h`
    - `framework/containers/particles_sort.cpp`
    - `framework/containers/particles.h`
    - `global/arch/kokkos_aliases.h`
    - `CMakeLists.txt` / `cmake/defaults.cmake`
    - `ideal_tile_size.py`

Current deposition is the hardest PIC kernel to make fast on a GPU: every
particle scatters its shape stencil into a shared field array, so many threads
race to update the same cells. The default (**flat**) kernel handles this with a
`Kokkos::ScatterView` -- a per-thread private copy that is reduced back into the
global `J` at the end. That is correct and portable, but on a wide GPU it is
bound by global-memory atomic traffic and by the scatter-view's memory
footprint.

The `team_policy` build adds a second, **tiled** deposit path. The domain is cut
into small spatial tiles; one Kokkos *team* (a GPU work-group) owns each tile and
accumulates its particles' currents into a scratch copy of the tile that lives in
**on-chip shared memory** (SLM on Intel, LDS on AMD, shared memory on NVIDIA).
The tile is flushed to the global `J` exactly once, at the end. The per-particle
stencil writes -- the hot inner loop -- then hit fast shared-memory atomics
instead of scattering through HBM, and the global array is touched once per
scratch cell rather than once per particle-write.

It is a compile-time feature, **off by default**, and only matters for GPU
backends -- on CPU the flat kernel is already cache-friendly.

!!! note "One deposit body, two launchers"

    Both paths call the *same* per-particle routine,
    `kernel::DepositOneParticle`, which contains the only deposit math in the
    codebase. It is parameterized on a `deposit_at(idx..., comp, val)` callback:
    the flat kernel's callback does `J_acc(idx...) += val` on its scatter-view
    accessor; the tiled kernel's callback translates the global cell index into
    tile-local scratch coordinates and does a `Kokkos::atomic_add` on SLM. The
    two paths are therefore numerically identical -- the tiling is a pure
    performance transform.

The walkthrough below animates the life of a single team -- sort into tiles,
allocate haloed SLM scratch, deposit stencils, the escape valve, and the final
flush. Use the controls (top-right) to pause, replay, or skip ahead.

<div id="tiled-deposit">
  <div id="canvas" class="p5canvas" style="position: relative"></div>
</div>

## The two paths

| | flat (always available) | tiled (`team_policy=ON`) |
| --- | --- | --- |
| Kernel | `DepositCurrents_kernel` | `DepositCurrentsTiled_kernel` |
| Policy | `RangePolicy` over particles | `TeamPolicy`, one team per tile |
| Accumulator | `Kokkos::ScatterView` (per-thread) | per-team SLM scratch tile |
| Global `J` traffic | one contribute over the scatter view | one atomic flush per scratch cell |
| Particle order | any | tile-sorted (`SortSpatially`) |

When `team_policy=ON`, `CurrentsDeposit` (`engines/srpic/currents.h`,
`engines/grpic/currents.h`) launches the tiled kernel for every species that has
a populated tile layout, and falls back to the flat kernel only for the edge
cases below. The engine is otherwise unchanged.

## Enabling it (compile-time)

The feature and its tuning knobs are CMake cache variables, baked in at build
time:

```cmake
# Enable the tiled deposit path (and the tile-based spatial sort that feeds it)
#   type: BOOL   default: OFF   (env: Entity_ENABLE_TEAM_POLICY)
-D team_policy=ON

# Tile edge length in cells (the T_TILE template parameter)
#   type: STRING  default: 8   allowed: {4, 6, 8, 10, 12, 14, 16}
-D team_policy_tile_size=8

# Scratch-halo drift budget in cells (see "Halo sizing" below)
#   type: STRING  default: 1
-D team_policy_drift=1

# Use the vendor sort_by_key (oneDPL / Thrust / rocThrust) for the tile sort.
#   type: BOOL   default: ON   (env: Entity_ENABLE_VENDOR_SORT)
#   OFF forces the Kokkos::BinSort fallback (lower peak memory, slower)
-D vendor_sort=ON
```

`team_policy_tile_size` must be one of the values in `team_policy_tile_sizes`
(`4;6;8;10;12;14;16`); an out-of-list value fails configuration. These map to the
preprocessor macros `TEAM_POLICY`, `TEAM_POLICY_TILE_SIZE`, and
`TEAM_POLICY_DRIFT`, and the resolved values are printed in the build report.

Two more controls are set at **runtime** in the input deck:

```toml
[algorithms.deposit]
  # Tiled-deposit work-group (team) size
  #   @type: uint [>= 0]
  #   @default: 0
  #   @note: 0 keeps Kokkos::AUTO (backend occupancy heuristic); a positive value
  #          overrides it, clamped to the backend/scratch maximum at launch. Only
  #          used in team_policy=ON builds. Pick a multiple of the device subgroup
  #          width for best occupancy (see ideal_tile_size.py).
  team_policy_team_size = 0

[particles]
  # Timesteps between spatial re-sorts (0 disables). This sets how tile-coherent
  # the particle array stays -- see "Halo sizing" and the escape valve.
  #   @type: uint
  #   @default: 0
  spatial_sorting_interval = 1
```

`spatial_sorting_interval` can also be set per species, overriding the global
value.

## How a tile deposit runs

`SortSpatially` (below) partitions the particle array into tiles and records a
`TileLayout`: the per-axis tile counts, the total tile count (= the team-league
size), and `tile_offsets`, a prefix sum so that tile `t` owns the contiguous
particle slice `[tile_offsets(t), tile_offsets(t+1))`. The deposit then launches
one team per tile and each team:

1. **Allocates SLM scratch** of shape $(\texttt{T\_TILE} + 2\,\texttt{HALO})^D
   \times 3$ `real_t` and cooperatively zeroes it. The halo is the padding that
   lets a particle near a tile edge still write its full stencil into scratch
   (below). `TE = T_TILE + 2*HALO` is the scratch edge length.
2. **Deposits its particles** over `TeamThreadRange`, clamping the slice to the
   live `npart` so stale slots left by in-place dead-tagging are skipped. For
   each particle it checks whether the whole stencil footprint fits inside
   `[0, TE)`; if so, every write is a bounds-test-free `atomic_add` into scratch,
   otherwise the particle takes the **escape valve** (below).
3. **Barriers**, then **cooperatively flushes** scratch to the global `J` with a
   single `atomic_add` per non-zero cell, **bounds-clipped** against `J`'s
   storage extent so a partial edge tile (or a halo that reaches past the ghost
   stripe) never writes out of bounds -- those contributions are re-supplied by
   the field synchronization afterward.

### Halo sizing

The scratch halo width per side is

$$
\texttt{HALO} = \underbrace{\texttt{STENCIL\_REACH}(O)}_{\text{shape stencil}}
             + \underbrace{\texttt{DRIFT}}_{\texttt{team\_policy\_drift}},
$$

derived from first principles in the kernel header. `STENCIL_REACH` is how many
cells the deposit writes above `min(i, i_prev)`: `2` for the `O == 0` zigzag
deposit and `O` for an Esirkepov shape of order `O`. `DRIFT` is the number of
cells a particle may move between two sorts that the halo is sized to absorb.
Because the sort runs at the *end* of a step and a particle is pushed once per
step under CFL ($|v\,\mathrm{d}t/\mathrm{d}x| \le \tfrac12 \Rightarrow |\Delta i|
\le 1$), a particle drifts at most one cell per un-sorted step. `DRIFT` defaults
to `1` -- the sorted-every-step common case.

!!! note "`DRIFT` is a compile-time budget, not the sort cadence"

    `team_policy_drift` sizes the scratch halo at compile time. The actual sort
    cadence is the runtime `spatial_sorting_interval`. They are decoupled on
    purpose: raising the sort interval to save sort cost does *not* require a
    matching `DRIFT` -- particles that drift past the halo simply take the escape
    valve. Sizing `DRIFT` to the typical between-sort drift keeps the common case
    in fast SLM; a mismatch only costs escape-valve traffic, never correctness.

### Correctness is independent of the halo (the escape valve)

The tiled path is **charge-conserving for any halo size, any sort interval, and
any particle order**. If a particle's full stencil does not fit in its tile's
scratch window -- because it drifted further than `DRIFT`, or was reordered far
from its tile by a no-sort-step particle exchange -- the *whole* particle is
deposited straight to the global `J` via bounds-clipped atomics, instead of to
scratch. Each particle's stencil is therefore deposited exactly once (entirely to
SLM when it fits, entirely to global `J` when it does not). Depositing less often
in-tile is only slower per write, never wrong.

### Coverage: the tail pass and the first step

The tile teams visit only the particles that were partitioned at the last sort,
`[0, npart_partitioned)`. Two gaps are filled by the launcher so that every
active particle is deposited exactly once:

- **Appended particles.** Particles injected or received over MPI on a
  *no-sort* step live past the partition (`npart > npart_partitioned`). The
  launcher deposits that tail `[npart_partitioned, npart)` with the flat
  scatter-view kernel. When the species was just sorted this range is empty, so
  it is a no-op in the common every-step-sorted case.
- **First step / tiny species.** Before the first `SortSpatially` a species has
  no layout (`ntiles_total == 0`); it takes the flat path for that step alone,
  then the tiled path once a layout exists.

## The tile-based spatial sort

The deposit's performance rests on the particle array being **tile-coherent** --
particles in the same tile stored contiguously. In a `team_policy` build,
`Particles::SortSpatially` (`particles_sort.cpp`) is reshaped to produce exactly
that, plus the `TileLayout` metadata the deposit consumes:

1. **Tile counts.** `ntiles = ceil(n_active / T_TILE)` per axis; their product is
   `total_tiles`.
2. **Per-particle key.** Each particle's tile index is computed from
   `min(i, i_prev)` (so the key matches the cell the deposit will actually touch
   first), with dead particles binned to a sentinel tile `total_tiles + 1`.
3. **Sort.** With `vendor_sort=ON` and a matching backend
   (oneDPL/Thrust/rocThrust), a `sort_by_key` produces an explicit permutation;
   otherwise a `Kokkos::BinSort` is used. `n_bins = total_tiles + 2` reserves the
   dead sentinel bin.
4. **Offsets.** `compute_tile_offsets` transition-detects the sorted keys into
   the `tile_offsets` prefix sum, filling empty tiles with a short host pass.
   `tile_offsets(total_tiles)` is the alive-particle count at sort time --
   recorded as `npart_partitioned`.
5. **Reorder.** The SoA member arrays are physically permuted into tile order.
   The vendor path *gathers* the alive prefix through a reusable per-type scratch
   buffer and copies back in place, so the large persistent arrays keep their
   address (avoiding allocator churn) and peak transient memory is one
   `npart`-sized buffer at a time. The BinSort path sorts each member in place.

!!! note "Two deliberate shortcuts"

    - **`*_prev` arrays are not permuted.** The next step's pusher overwrites
      `prev := current` for every particle before any consumer reads it, so
      reordering `*_prev` would only shuffle data that is about to be
      overwritten. (The deposit's tile key uses `i_prev`, which is why it is read
      *before* the sort, not after.)
    - **Compact-on-sort.** The sort parks dead particles in the sentinel bin at
      the tail; `SortSpatially` then shrinks `npart` to `npart_partitioned`,
      dropping the dead in the same pass instead of waiting for the periodic
      `RemoveDead`. This keeps `npart` (and every sort's transient buffers)
      tracking the alive count.

## Choosing the tile size

The scratch tile is squeezed by three competing pressures, modeled by the
`ideal_tile_size.py` helper:

- **Shared-memory capacity (hard).** $TE^D \times 3 \times \texttt{sizeof(real)}$
  must fit in the work-group's shared memory, ideally with several groups
  resident per compute unit to hide latency. Binds first in 3D, in double
  precision, and on AMD's smaller LDS.
- **Halo overhead (favors larger tiles).** The zero-fill and flush sweep the whole
  $TE^D$ tile, so a tiny tile is almost all halo ($1 - (T/TE)^D$ wasted). A large
  `HALO` (infrequent sorts) makes this worse.
- **Per-tile contention (favors smaller tiles).** All $\texttt{ppc}\cdot T^D$
  particles in a tile atomic-add into one fixed scratch tile, so SLM-atomic
  contention and load imbalance grow with tile size.

Run `ideal_tile_size.py` for a first-order recommendation, then confirm by
sweeping `-D team_policy_tile_size` / `-D team_policy_drift` and re-profiling. The
team (work-group) size defaults to `Kokkos::AUTO`; override it at runtime with
`[algorithms.deposit] team_policy_team_size` and prefer a multiple of the device
subgroup width.

## Constraints and caveats

- **GPU-oriented, compile-time.** Off by default; the flat path remains the CPU
  and fallback route. Toggling it requires a rebuild.
- **Shared-memory limited.** An over-large `team_policy_tile_size` (or `DRIFT`)
  can exceed the backend's shared memory; keep an eye on the 3D / double-precision
  / AMD cases.
- **Shape order.** Supported for `O ∈ {0, …, 11}`. `O == 0` (zigzag) is wired for
  A/B benchmarking; its narrow stencil often makes the scratch overhead a
  regression versus the flat kernel, so measure the crossover.
- **Deposit, for now.** The `team_policy` layout currently feeds the tiled
  current deposit; the pusher still runs flat. Both SRPIC and GRPIC use the tiled
  deposit.
- **`vendor_sort=OFF` trade-off.** The `Kokkos::BinSort` fallback has a lower
  peak memory footprint (no `maxnpart` gather buffer) but is slower than the
  vendor `sort_by_key`.

## Example

A 2D SRPIC turbulence run on a GPU, sorted every step with the default tile:

```bash
# configure
cmake -B build -D team_policy=ON \
                -D team_policy_tile_size=8 \
                -D team_policy_drift=1 \
                -D vendor_sort=ON \
                -D shape_order=2 -D output=ON
cmake --build build -j
```

```toml
[algorithms.deposit]
  team_policy_team_size = 0     # Kokkos::AUTO

[particles]
  spatial_sorting_interval = 1  # sort every step -> DRIFT=1 halo is always enough
```

To trade sort cost for a wider halo (sort every 4 steps), size `DRIFT` to the
between-sort drift at build time and relax the interval at runtime -- particles
that still escape the halo fall back to the global-J path automatically:

```bash
cmake -B build -D team_policy=ON -D team_policy_tile_size=8 -D team_policy_drift=4 ...
```

```toml
[particles]
  spatial_sorting_interval = 4
```
