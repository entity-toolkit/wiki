---
hide:
  - footer
---

# Moving window

!!! abstract "Relevant headers"

    - `archetypes/moving_window.h`
    - `framework/domain/metadomain_reshape.cpp`
    - `framework/domain/metadomain.h`
    - `engines/engine.hpp`
    - `examples/moving_window/`

<a href="https://github.com/entity-toolkit/entity/pull/196">
  <span class="since-version">1.4.0</span>
</a>

Many interesting problems have a feature that travels: a collisionless shock, a
jet head, a laser or wakefield front, a relativistic blob. Following such a
feature in a static box means resolving everything it flies over, and the cost
of that box grows linearly with how long you want to follow it. A **moving
window** instead keeps the box the same size and slides it along with the
feature, so the resolution stays where the physics is.

Entity implements this as a *shift of the simulation content against a shifted
frame*: every $n$-th timestep, all fields and particles are moved back by an
integer number of cells along one axis, and the physical extent of the grid
(global and per-subdomain) is moved forward by exactly the same amount. The
grid itself -- resolution, cell size, MPI decomposition, boundary conditions --
never changes; only the physical coordinates it is mapped onto do. Everything
downstream (outputs, renders, checkpoints, the metric used by the pusher) then
reports the *moving* frame automatically, because it all reads the extent from
the mesh.

There is no `[moving_window]` section in the input file: the window is driven
from the problem generator, so you decide when and how fast it moves. The code
provides the one primitive you can use for that --
`arch::MoveWindow<M, o>` -- and the example in
[`examples/moving_window`](https://github.com/entity-toolkit/entity/tree/master/examples/moving_window)
provides the ~20 lines of bookkeeping that go with it.

!!! note "Where the work lives"

    The shift itself is a single function,
    `arch::MoveWindow<M, o>(domain, metadomain, shift)` in
    `archetypes/moving_window.h`, which you call from `CustomPostStep`. The
    extent bookkeeping is `Metadomain<S, M>::ShiftByCells(n_cells, dir)` in
    `metadomain_reshape.cpp`. Because the call happens in `CustomPostStep`, the
    engine's particle sort -- which runs *after* `CustomPostStep` (see
    `engines/engine.hpp`) -- re-tiles the species afterwards, so the next
    deposit sees a consistent layout.

## What one window move does

A single `arch::MoveWindow<M, in::x1>(domain, metadomain, shift)` call performs
the following, in order:

1. **Shift the particles.** For every species, every active particle's cell
   index along the window axis is decremented: `i1(p) -= shift`. The sub-cell
   displacement `dx1` is untouched, so this is an exact translation by an
   integer number of cells -- no interpolation, no loss of accuracy.
2. **Retag migrating particles** (MPI only). Any particle whose new index falls
   outside the local subdomain is retagged with `mpi::SendTag` so that the
   particle exchange picks it up. Dead particles keep their tag.
3. **Shift the fields.** `fields.em` is copied to the scratch array
   `fields.bckp`, and both the $\bm{E}$ and $\bm{B}$ components are read back
   shifted: `em(i) = bckp(i + shift)` over the range
   `[0, n_all - shift)`, ghost cells included. The current density and the
   output buffers are not shifted -- they are recomputed from scratch every
   step anyway.
4. **Refill the ghosts.** `CommunicateFields(E | B)` runs, which fills the top
   `shift` cells that step 3 left untouched, from the neighboring subdomain or
   from the field boundary condition.
5. **Exchange the particles.** `CommunicateParticles` hands the particles
   retagged in step 2 to the subdomain that now owns them.
6. **Move the frame.** `ShiftByCells(shift, o)` adds `shift * dx` to both ends
   of the global mesh extent *and* of every subdomain extent, re-constructing
   each metric in place. From this point on, code coordinate `0` corresponds to
   a physical coordinate that is `shift * dx` larger than before.

!!! warning "The shift must fit inside the ghost zone"

    Step 3 pulls the values that enter at the leading edge out of the
    *pre-shift ghost cells*, and step 4 can only restore `N_GHOSTS` of them.
    A `shift` larger than `N_GHOSTS` would therefore leave a strip of stale,
    un-shifted cells at the leading edge of the active domain. Always use

    ```cpp
    arch::MoveWindow<M, in::x1>(domain, metadomain, N_GHOSTS);
    ```

    or a smaller positive value. `N_GHOSTS` is `2` for the default shape order
    and grows with it (see [higher order methods](1-higherorder.md)), and a
    non-positive `shift` is not meaningful -- the window only moves forward.

## Driving the window from the problem generator

The window needs to keep track of two things: *where* it is (to decide when the
accumulated travel is worth a move) and *how fast* it goes. Because a move is
only ever an integer number of cells, the position is stored as an integer cell
index plus a sub-cell remainder, and the remainder carries into the index. This
is the helper from the example, verbatim:

```cpp
#include "archetypes/moving_window.h"

// ...

template <SimEngine::type S, class M>
struct PGen {
  // ...
  const SimulationParams& params;
  Metadomain<S, M>&       metadomain;

  struct MovingWindow {
    int    pos_i { -1 };       // current window position, in cells
    int    init_pos_i { -1 };  // position at the last move
    real_t pos_di { ZERO };    // sub-cell remainder
    real_t vel_Cd { ZERO };    // window velocity, in cells per unit time

    void init(const M& metric, real_t global_x, real_t velocity) {
      const auto pos_Cd = metric.template convert<1, Crd::Ph, Crd::Cd>(global_x);
      //                                             ^^^^^^^^^^^^^^^^
      //                     physical position -> code coordinate (i.e., cells)
      pos_i      = static_cast<int>(pos_Cd + 1) - 1;
      init_pos_i = pos_i;
      pos_di     = pos_Cd - static_cast<real_t>(pos_i);
      vel_Cd = metric.template transform<1, Idx::XYZ, Idx::U>({}, velocity);
      //                                    ^^^^^^^^^^^^^^^^
      //                       physical velocity -> cells per unit time (v / dx)
    }

    void update(real_t            dt,
                int               shift,
                Metadomain<S, M>& metadomain,
                Domain<S, M>&     domain) {
      pos_di += vel_Cd * dt;             // advance the window continuously ...
      pos_i  += static_cast<int>(pos_di >= ONE);
      pos_di -= static_cast<real_t>(pos_di >= ONE);
      if ((pos_i - init_pos_i) >= shift) {
        // ... but move the contents only in whole `shift`-cell jumps
        arch::MoveWindow<M, in::x1>(domain, metadomain, shift);
        pos_i -= shift;
      }
    }
  };

  MovingWindow moving_window;
  const real_t dt;

  PGen(const SimulationParams& p, Metadomain<S, M>& m)
    : params { p }
    , metadomain { m }
    , dt { params.template get<real_t>("algorithms.timestep.dt") } {}

  void InitPrtls(Domain<S, M>& domain) {
    const auto window_velocity = params.template get<real_t>(
      "setup.window_velocity",
      ZERO);
    moving_window.init(domain.mesh.metric, ZERO, window_velocity);
    // ... particle injection here ...
  }

  void CustomPostStep(timestep_t, simtime_t, Domain<S, M>& domain) {
    moving_window.update(dt, N_GHOSTS, metadomain, domain);
  }
};
```

Two details are worth pointing out.

Note that the problem generator holds a **non-const reference to the
metadomain** (`Metadomain<S, M>& metadomain`), not a const one -- `MoveWindow`
mutates the global extent, so the usual `const Metadomain<S, M>&` signature
will not compile here.

Also, the window moves in jumps of `shift` cells, which happen every

$$
\Delta n_{\rm steps} \simeq \frac{\texttt{shift} \cdot \mathrm{d}x}{v_{\rm w}\,\mathrm{d}t}
$$

timesteps. In between, the contents of the box do not move at all, so the
feature you are following drifts by up to `shift` cells relative to the frame
and then snaps back. That is the "jerkiness" visible in the example movie; it
is a property of the output coordinates, not of the physics, and it disappears
if you plot a fixed *physical* interval (or crop the render region).

For the input file, everything specific to the window lives under `[setup]`, which accepts
arbitrary user-defined keys and is read with `params.get<T>("setup.<key>")`:

```toml
[setup]
  # not a built-in parameter: read by the problem generator above
  window_velocity = 0.2
```

## What flows into the window

Each move exposes a `shift`-cell-wide strip at the leading edge that has to be
filled with something, and discards a strip of the same width at the trailing
edge.

- **Fields** entering the window come from the leading-edge ghost zone as it
  was *before* the shift (step 3 above), i.e. from whatever the field boundary
  condition -- or the neighboring subdomain -- last put there. With `PERIODIC`
  fields along the window axis you get the state at the opposite edge; with
  `MATCH`ing or fixed boundaries you get the prescribed upstream field (see
  [matching](../2-howto/1-problem_generators.md#match-boundaries) and
  [fixed](../2-howto/1-problem_generators.md#fixed-field-boundaries) field
  boundaries). Choose whichever represents your upstream medium.
- **Particles** are *not* created by the shift: the fresh strip comes in empty.
  If the window is supposed to keep plowing into plasma, you have to inject it
  yourself, right after the move, in the same `CustomPostStep`. The injectors
  accept a `box` in global physical coordinates, and the extent you read from
  the metadomain is already the shifted one, so the strip is simply the top
  `shift` cells of the current extent:

    ```cpp
    void CustomPostStep(timestep_t, simtime_t, Domain<S, M>& domain) {
      moving_window.update(dt, N_GHOSTS, metadomain, domain);

      const auto& mesh   = metadomain.mesh();
      const auto  x1_max = mesh.extent()[0].second;
      const auto  width  = static_cast<real_t>(N_GHOSTS) * mesh.metric.get_dx();

      const auto energy_dist = arch::energy_dist::Maxwellian<M::Dim, M::CoordType>(
        domain.random_pool(),
        temperature,
        { -v_upstream, ZERO, ZERO });
      arch::InjectUniform<S, M, decltype(energy_dist), decltype(energy_dist)>(
        params,
        domain,
        { 1, 2 },
        { energy_dist, energy_dist },
        ONE,   // <-- target density in units of `n0`
        false, // <-- no weights for Cartesian metrics
        { { x1_max - width, x1_max }, Range::All });
      //    ^^^^^^^^^^^^^^^^^^^^^^
      //    the strip the window just exposed, in global physical coordinates
    }
    ```

    The box is intersected with each local subdomain, so the call is correct on
    every rank -- the ranks that do not touch the leading edge inject nothing.
    If you would rather top the whole box up to a target density instead of
    filling a strip, use the replenishing spatial distributions
    (`arch::spatial_dist::Replenish`, see `examples/replenish_injector`).

- **Particles left behind** simply end up with a negative cell index along the
  window axis. In a serial run the next particle push disposes of them through
  the ordinary particle boundary condition, so the trailing edge should be
  `ABSORB` (or `ATMOSPHERE`) -- **not** `PERIODIC`, which would wrap them back
  in at the leading edge.

!!! warning "Under MPI, the trailing edge follows the *field* boundary"

    Step 2 retags every particle that leaves its subdomain, and the particle
    exchange decides where a direction leads from the **field** boundary
    condition in that direction. So if the window axis is periodic for the
    fields (as in the example input above), the particles the window leaves
    behind are communicated around to the far edge instead of being absorbed by
    the pusher on the next step. If that matters for your setup, either make
    the window axis non-periodic for the fields, or purge the particles
    explicitly in `CustomPostStep` before the move (see
    [particle purging](../2-howto/1-problem_generators.md#particle-purging)).

## Windows along other axes

The window direction is a template argument, so it is fixed at compile time and
costs nothing at runtime:

| Call | Requires |
| --- | --- |
| `arch::MoveWindow<M, in::x1>(...)` | 1D, 2D or 3D |
| `arch::MoveWindow<M, in::x2>(...)` | 2D or 3D |
| `arch::MoveWindow<M, in::x3>(...)` | 3D |

Each call shifts one axis and does its own extent bookkeeping, so a window that
travels diagonally means calling it once per axis, each with its own position
tracker.

## Outputs, renders and checkpoints

Because the window is a shift of the *extent*, every consumer of the mesh
follows it for free:

- **Field and particle outputs** are written in the current physical
  coordinates, so the coordinate axes of your dumps move with the window. In
  `nt2py` this means the `x` coordinate of successive snapshots is different --
  which is exactly what you want when you overplot them, and something to keep
  in mind when you take a `sel(x=...)` slice.
- **Checkpoints** store the global and the per-subdomain extents and restore
  them on restart, so the *frame* survives a restart -- this is what
  `tests/framework/checkpoint-extents.cpp` verifies. The problem generator's own
  window state (`pos_i`, `pos_di`, `vel_Cd`) does not: it is not part of the
  checkpoint, and `InitPrtls` -- where the example initializes it -- is skipped
  when resuming. If you intend to restart a windowed run, initialize the tracker
  lazily on the first `CustomPostStep` call instead of in `InitPrtls`; by then
  the extent has been restored, so reading the window position off
  `domain.mesh.metric` gives the right answer and the window resumes at the
  right speed.
- **The in-situ renderer** is independent of all this. Its `camera_velocity`
  option (see [moving view](3-rendering.md#moving-view-tracking-a-feature))
  pans the *view* across a static domain and does not move the simulation; the
  moving window moves the simulation and the renderer follows it. The two can
  be combined, but for tracking a feature you generally want one or the other.

## Constraints and caveats

- **SRPIC only.** `MoveWindow` is declared for
  `Domain<SimEngine::SRPIC, M>` -- there is no GRPIC version.
- **Cartesian metrics only.** The function is constrained on
  `CartesianMetricClass`, and `ShiftByCells` `static_assert`s on it: shifting a
  curvilinear grid by a cell would not be a translation.
- **`shift` $\le$ `N_GHOSTS`**, and strictly positive (see the warning above).
- **One subdomain per rank.** `CustomPostStep` is invoked once per *local*
  subdomain, so a rank owning several of them would advance the window tracker
  -- and the global extent -- more than once per step. The standard
  one-subdomain-per-rank decomposition is what this is written for.
- **The decision to move must be global.** Every rank shifts its own fields and
  particles *and* updates the extents of all subdomains, so all ranks must move
  on the same step. Basing the trigger on `dt`, the step number, or the
  prescribed window velocity keeps it deterministic and identical everywhere;
  basing it on rank-local data (a local particle count, a local field maximum)
  does not.
- **Cost per move.** One full device copy of `em`, one ghost exchange, and one
  particle exchange. This is why moves are batched into `shift`-cell jumps
  rather than done every step; at the default CFL and a window moving at
  $\sim c$ a 2-cell jump fires every few steps, which is a small fraction of a
  timestep's cost.
- **Interaction with load balancing.**
  [Dynamic load balancing](4-load_balancing.md) also moves things around, but
  it runs after
  `CustomPostStep` in the engine loop and only shifts *interior* subdomain
  faces, so the two are independent. Keep in mind, though, that a window
  sweeping along `x1` continuously advects particles across the box, so a
  rebalancer on the same axis will be chasing a moving target.

## Example

`examples/moving_window` follows a Gaussian blob of pair plasma drifting at
$v_0 = 0.2\,c$ across a 2D periodic box. The full problem generator is the one
quoted above, plus the density profile and the injection at initialization:

```cpp
template <Dimension D>
struct NonUniformDensity {
  Inline auto operator()(const coord_t<D>& x_Ph) const -> real_t {
    real_t r2 { ZERO };
    for (auto d = 0u; d < D; ++d) {
      r2 += SQR(x_Ph[d] - 0.5);
    }
    return math::exp(-r2 / SQR(static_cast<real_t>(0.1)));
    //                                              ^
    //                 characteristic width of the density profile
  }
};
```

The particles are injected once, with a bulk velocity equal to the window
velocity, so the blob stays put in the window frame:

```cpp
const auto energy_dist = arch::energy_dist::Maxwellian<M::Dim, M::CoordType>(
  domain.random_pool(),
  0.001,
  { window_velocity, ZERO, ZERO });
//  ^^^^^^^^^^^^^^^
//  the blob drifts with the window
```

and the input file is:

```toml
[simulation]
  name    = "moving_window"
  engine  = "srpic"
  runtime = 2.0

[grid]
  resolution = [128, 128]
  extent     = [[0.0, 1.0], [0.0, 1.0]]

  [grid.metric]
    metric = "minkowski"

  [grid.boundaries]
    fields    = [["PERIODIC"], ["PERIODIC"]]
    particles = [["ABSORB", "ABSORB"], ["PERIODIC"]]

[scales]
  larmor0    = 0.01
  skindepth0 = 0.1

[algorithms]

  [algorithms.timestep]
    CFL = 0.5

[particles]
  ppc0 = 8.0

  [[particles.species]]
    label    = "e+"
    mass     = 1.0
    charge   = 1.0
    maxnpart = 1e6

  [[particles.species]]
    label    = "e-"
    mass     = 1.0
    charge   = -1.0
    maxnpart = 1e6

[setup]
  window_velocity = 0.2

[output]
  interval = 10

  [output.fields]
    quantities = ["N_1_2"]
```

The density snapshots then show the blob sitting still while the coordinate axis marches forward -- the whole point of the exercise.
