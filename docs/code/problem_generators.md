---
hide:
  - footer
---

# Problem generators

!!! abstract "Relevant headers"

    - `setups/**/pgen.hpp`
    - `archetypes/problem_generator.h`
    - `archetypes/field_setter.h`
    - `archetypes/energy_dist.h`
    - `archetypes/spatial_dist.h`
    - `archetypes/particle_injector.h`

Problem generators describe a specific simulation setup (e.g., initial conditions) for the Entity engines to use to run the simulation. All problem generators are stored in the `setups` diectory each in a separate parent directory and are all named `pgen.hpp`. It is a good practice to also store a sample `*.toml` input file and a `*.py` visualization file corresponding to that problem generator. Problem generators are chosen at compile time using the `-D pgen=...` flag, where `...` is the relative path where the problem generator is stored. For instance, to pick the `setups/srpic/langmuir/pgen.hpp` problem generator, one would use the following command:

```bash
cmake ... -D pgen=srpic/langmuir
```

All problem generators contain a namespace `user::` and a structure named `Pgen<S, M>` which must inherit from the `arch::ProblemGenerator<S, M>` class, where `S` is the simulation engine and `M` is the metric. A typical dummy problem generator will look like this:

```cpp
#ifndef PROBLEM_GENERATOR_H
#define PROBLEM_GENERATOR_H

#include "enums.h"
#include "global.h"

#include "arch/traits.h"
#include "archetypes/problem_generator.h"
#include "framework/domain/metadomain.h"
#include "framework/parameters.h"

namespace user {
  using namespace ntt; // (2)!

  template <SimEngine::type S, class M>
  struct PGen : public arch::ProblemGenerator<S, M> {
    // enumerate which engines/metrics/dimensions are compatible (1)
    static constexpr auto engines {
      traits::compatible_with<SimEngine::SRPIC, SimEngine::GRPIC>::value
    };
    static constexpr auto metrics {
      traits::compatible_with<Metric::Minkowski,
                              Metric::Spherical,
                              Metric::QSpherical,
                              Metric::Kerr_Schild,
                              Metric::QKerr_Schild,
                              Metric::Kerr_Schild_0>::value
    };
    static constexpr auto dimensions {
      traits::compatible_with<Dim::_1D, Dim::_2D, Dim::_3D>::value
    };

    // ... additional definitions ..

    inline PGen(const SimulationParams& p, const Metadomain<S, M>&)
      : arch::ProblemGenerator<S, M> { p } 
      // ... any additional initialization ...
      {}

    // ... additional methods ...
  };

} // namespace user

#endif // PROBLEM_GENERATOR_H
```

1. This is done not only for the runtime sanity check, but also to shorten the compile time, as the compiler will not generate the code for the incompatible engines/metrics/dimensions.
2. To avoid using `ntt::` everywhere

There are three special definitions one may provide in the problem generator that will allow the simulation engine to call custom routines at the beginning of the simulation or at the end of each timestep.

!!! note "Units"

    In all of the functions and classes described below, it is assumed that the end-user designing the problem generator has no knowledge of the inner workings of the code units. All the quantities provided by the user are thus in the natural physical units (i.e., global physical coordinates for the positions and local tetrad basis for the vectors). All the conversions, staggering etc. is done automatically under the hood.

## Initializing fields

To initialize electromagnetic fields to specific values, one may provide a custom class called `init_fields`:

```c++
template <SimEngine::type S, class M>
struct PGen : public arch::ProblemGenerator<S, M> {
  // ...
  
  // the name of the class may be arbitrary, but the instance must be named `init_fields`
  FancyFieldInitializer<S, M> init_fields;
};
```

This class in turn may have an arbitrarily complex constructor, but it must have any number of the methods `ex1()`, `ex2()`, ... `dx1()`, `dx2()`, etc., which set the corresponding field components. For instance, to set the electric field in the $x_2$ direction to a constant value, one would write:
```c++
template <Dimension D>
struct NotSoFancyFieldInitializer {
  NotSoFancyFieldInitializer(real_t myval)
    : myvalue { myval } {}

  Inline auto ex2(const coord_t<D>&) const -> real_t {
    return myvalue;
  }
  // you may skip other field components if you don't need them

private:
  const real_t myvalue;
};
```

Notice, that `ex2` takes a single argument of type `coord_t<D>` (coordinate vector), which in this case is empty, since we are not using it. In general, one may define fields as functions of the coordinate. 

```c++
template <Dimension D>
struct SinusoidalField {
  SinusoidalField(real_t kx, real_t ampl)
    : kx { kx }, amplitude { ampl } {}

  Inline auto bx1(const coord_t<D>& x_Ph) const -> real_t {
    return amplitude * math::sin(kx * x_Ph[1]); // function of x2 coordinate
  }
  // you may skip other field components if you don't need them

private:
  const real_t kx, amplitude;
};

// and then use it in the problem generator
template <SimEngine::type S, class M>
struct PGen : public arch::ProblemGenerator<S, M> {
  // ...
  
  SinusoidalField<S, M> init_fields;

  // initialize the `init_fields` by passing the parameters from the input
  inline PGen(const SimulationParams& p, const Metadomain<S, M>&)
      : arch::ProblemGenerator<S, M> { p }
      , init_fields { p.template get<real_t>("setup.kx"), 
                      p.template get<real_t>("setup.amplitude") } 
      {}
};
```


Fields must be returned in the local tetrad (orthonormal) basis, while the passed coordinates are the physical coordinates. Conversion to code units and staggering of each corresponding field component is done automatically under the hood.

## Initializing particles

Similar to initializing the fields, one can also initialize particles with a given energy or spatial distribution. This is done by providing a custom method of the `PGen` class called `InitPrtls(Domain<S, M>&)` which takes a reference to the local subdomain as a parameter. In principle, one can manually initialize the particles in any way they want, but it is recommended to use the built-in routines from the `arch::` (archetypes) namespace.

For instance, to initialize a uniform Maxwellian of a given temperature, one can use the `arch::Maxwellian` and `arch::UniformInjector` classes together with the `InjectUniform` method:

```c++
// don't forget to include the proper headers
#include "archetypes/energy_dist.h"
#include "archetypes/particle_injector.h"

// ...

template <SimEngine::type S, class M>
struct PGen : public arch::ProblemGenerator<S, M> {
  // 
  inline void InitPrtls(Domain<S, M>& local_domain) {
    const auto energy_dist = arch::Maxwellian<S, M>(
                                  local_domain.mesh.metric, 
                                  local_domain.random_pool, 
                                  temperature);
    const auto injector = arch::UniformInjector<S, M, arch::Maxwellian>(
                                  energy_dist, { 1, 2 });
                                         //      ^^^^^
                                         //  species to inject    
    arch::InjectUniform<S, M, arch::UniformInjector<S, M, arch::Maxwellian>>(
                          params,
                          local_domain,
                          injector,
                          1.0); // <-- this is the number density in units of `n0`
  }
};
```

To initialize a non-uniform distribution and/or an arbitrary energy distribution, we will need to provide our own classes, which in turn must inherit from the `arch::SpatialDistribution<S, M>` and `arch::EnergyDistribution<S, M>`. For instance, let us initialize a distribution of two particle species counterstreaming in opposing direction with their velocities depending on the $x_2$ ($y$) coordinate, distributed in space according to a Gaussian profile. We first need to define the energy distribution:

```c++
template <SimEngine::type S, class M>
struct CounterstreamEnergyDist : public arch::EnergyDistribution<S, M> {
  CounterstreamEnergyDist(const M& metric, real_t v_max, real_t sx2)
    : arch::EnergyDistribution<S, M> { metric }
    , v_max { v_max }
    , kx2 { static_cast<real_t>(constant::TWO_PI) / sx2 } {}

  // three arguments passed here are
  // x_Ph: global physical coordinates of the particle
  // v: the velocity of the particle to-be-set in the tetrad basis
  // sp: species index
  Inline void operator()(const coord_t<M::Dim>& x_Ph,
                          vec_t<Dim::_3D>&      v,
                          unsigned short        sp) const override {
    if (sp == 1) {
      v[0] = v_max * math::sin(kx2 * x_Ph[1]);
    } else {
      v[0] = -v_max * math::sin(kx2 * x_Ph[1]);
    }
  }

private:
  const real_t v_max, kx2;
};
```

We then need to define the spatial distribution, which takes a coordinate as an argument and returns the probability of a particle to be injected at that point. In our case, we will use a Gaussian profile:

```c++
template <SimEngine::type S, class M>
struct GaussianDist : public arch::SpatialDistribution<S, M> {
  GaussianDist(const M& metric, real_t x1c, real_t x2c, real_t dr)
    : arch::SpatialDistribution<S, M> { metric }
    , x1c { x1c }
    , x2c { x2c }
    , dr { dr } {}

  // to properly scale the number density, the probability should be normalized to 1
  Inline auto operator()(const coord_t<M::Dim>& x_Ph) const -> real_t override {
    return math::exp(-(SQR(x_Ph[0] - x1c) + SQR(x_Ph[1] - x2c)) / SQR(dr));
  }

private:
  const real_t x1c, x2c, dr;
};
```

We can then pass the instances of these classes to the `arch::InjectNonUniform` method called from within the `InitPrtls` method of the problem generator:

```c++
// definition of CounterstreamEnergyDist and GaussianDist classes
// ...

template <SimEngine::type S, class M>
struct PGen : public arch::ProblemGenerator<S, M> {
  // internal variables to-be-used in the constructor
  const real_t temperature, v_max, sx2;
  const real_t x1c, x2c, dr;

  // read the parameters from the input
  inline PGen(const SimulationParams& p, const Metadomain<S, M>& global_domain)
    : arch::ProblemGenerator<S, M> { p }
    , temperature { p.template get<real_t>("setup.temperature") }
    , v_max { p.template get<real_t>("setup.v_max") }
    , sx2 { global_domain.mesh().extent(in::x2).second - global_domain.mesh().extent(in::x2).first } // (1)!
    , x1c { p.template get<real_t>("setup.x1c") }
    , x2c { p.template get<real_t>("setup.x2c") }
    , dr { p.template get<real_t>("setup.dr") }
    {}

  inline void InitPrtls(Domain<S, M>& local_domain) {
    const auto energy_dist  = CounterstreamEnergyDist<S, M>(
                                        local_domain.mesh.metric,
                                        v_max,
                                        sx2);
    const auto spatial_dist = GaussianDist<S, M>(domain.mesh.metric,
                                                 x1c,
                                                 x2c,
                                                 dr);
    const auto injector = 
      arch::NonUniformInjector<S, M, CounterstreamEnergyDist, GaussianDist>(
        energy_dist,
        spatial_dist,
        { 1, 2 });

    arch::InjectNonUniform<S, M, arch::NonUniformInjector<S, M, CounterstreamEnergyDist, GaussianDist>>(
            params,
            domain,
            injector,
            1.0); // <-- injected density in units of `n0` (2)!
  }

};
```

1. `x_2` extent of the global domain can be directly read from the metadomain instance passed to the constructor.
2. Here, the value of `1.0` corresponds to the probability of `1.0` returned by the spatial distribution class.

## Custom post-timestep routines

Often times, one needs to intervene to the simulation process to perform some custom operations by updating the fields or the particles (for instance, to apply special boundary conditions, inject particles etc.). The safest way of performing this is at the end of each timestep, when all the quantities have already been computed and stored. For that, Entity allows users to define another special method in the problem generator called `CustomPostStep`. It accepts the current timestep, the current physical time, and the local subdomain as a parameter. For instance, to inject particles at a given rate, one can write:

```c++
template <SimEngine::type S, class M>
struct PGen : public arch::ProblemGenerator<S, M> {
  // ... 

  void CustomPostStep(std::size_t, long double, Domain<S, M>& domain) {
    // ... some energy/spatial distribution & injector here (see above) ...
    arch::InjectNonUniform<S, M, /* ... */>( /* ... */ );
  }
};
```

Or you may also manually access the fields and particles through the `domain.fields` and `domain.species[...]` objects, respectively, and perform any operations you need. Be mindful, however, that all the raw quantities stored within the `domain` object are in the code units (for more details, see the [fields and particles](./fields_particles.md) section; for ways to convert from one system/basis to another, see the [metric](./metrics.md) section).

## Custom external force

Similar to all the other custom routines, one may also define a custom external force which will optionally be applied to the particles together with the electromagnetic pusher. This is done by defining an arbitrary class with an instance named `ext_force`, which implements three methods: `fx1()`, `fx2()`, `fx3()`. For instance, to apply a force in the $x_1$ direction decaying over time, one would write:

```c++
template <Dimension D>
struct PushDaTempo {
  // specify which species to apply the force to
  const std::vector<unsigned short> species { 1, 2 };

  PushDaTempo(real_t f, real_t t) : force { f }, tau { t } {}

  Inline auto fx1(const unsigned short&,
                  const real_t& time,
                  const coord_t<D>&) const -> real_t {
    return force * math::exp(-time / tau);
  }

  Inline auto fx2(const unsigned short&,
                  const real_t&,
                  const coord_t<D>&) const -> real_t {
    return ZERO;
  }

  Inline auto fx3(const unsigned short&,
                  const real_t&,
                  const coord_t<D>&) const -> real_t {
    return ZERO;
  }
private:
  const real_t force, tau;
};

// and then in the problem generator class
template <SimEngine::type S, class M>
struct PGen : public arch::ProblemGenerator<S, M> {
  // ...
  PushDaTempo<S, M> ext_force;
  // and read the parameters from the input
  inline PGen(const SimulationParams& p, const Metadomain<S, M>& global_domain)
    : arch::ProblemGenerator<S, M> { p }
    , ext_force { p.template get<real_t>("setup.force"),
                  p.template get<real_t>("setup.tau") }
    {}
};
```

Again, as everything else in the problem generator, the force (rather, the acceleration) must be returned in the local tetrad basis and the passed coordinates are the physical coordinates.


!!! note "All functions are optional"

    Note, that among the functions mentioned throughout this section, you may specify only the ones you actually need, and ignore the ones you don't (i.e., there is no need to provide dummy functions that return zero), as the code will automatically determine at compile-time which functions are present.