---
hide:
  - footer
---

# PIC Algorithm

## 3+1 Formalism

To facilitate both GR and non-GR equations in a single framework while still retaining the maximum level of generality, we employ the 3+1 formalism for projecting the space-time (see, e.g., [Gourgoulhon, 2012](https://link.springer.com/book/10.1007/978-3-642-24525-1)).

In the most general 3+1 formulation, the metric and its inverse in arbitrary coordinate system can be represented in the following form:

\begin{align*}
g_{\mu\nu}&=\begin{bmatrix}
-\alpha^2+\beta_k\beta^k & \beta_i \\
\beta_j & h_{ij}
\end{bmatrix}\\\\
g^{\mu\nu}&=\begin{bmatrix}
-1/\alpha^2 & \beta^i/\alpha^2 \\
\beta^j/\alpha^2 & h^{ij}-\beta^i\beta^j/\alpha^2
\end{bmatrix}
\end{align*}

where $\alpha$ is the metric _lapse function_, and $\beta_i$ is the metric _shift vector_. We will also denote $h \equiv \mathrm{det}{(h_{ij})}$. Notice also, that $g\equiv \mathrm{det}{(g_{\mu\nu})} = -\alpha^2 h$, and $\sqrt{-g}=\alpha\sqrt{h}$.

In this system, we can now express the curl of an arbitrary contravariant vector:

$$
(\nabla\times A)^i \equiv \frac{1}{\sqrt{h}}\varepsilon^{ijk}\partial_j A_k = \frac{1}{\sqrt{h}}\varepsilon^{ijk}\partial_j h_{kp}A^p
$$

where $A_k = h_{kp} A^p$, and $\varepsilon^{ijk}$ is the Levi-Civita symbol.

### Maxwell's equations

In the general 3+1 formulation (special and general relativistic) there are two "physical" fields (the ones measured by fiducial observers, FIDOs), $B^i$, and $D^i$. Evolution equations on these two fields can be written as:

$$
\begin{aligned}
\frac{\partial D^i}{c\partial t} &= \frac{1}{\sqrt{h}} \varepsilon^{ijk}\partial_j H_k - \frac{4\pi}{c} J^i \\
\frac{\partial B^i}{c\partial t} &= -\frac{1}{\sqrt{h}} \varepsilon^{ijk}\partial_j E_k
\end{aligned}
$$

where $H_i$, and $E_i$ are the covariant auxiliary fields, defined as follows:

$$
\begin{aligned}
H_i &= \alpha h_{ij} B^j - \frac{1}{\sqrt{h}}\varepsilon_{ijk}\beta^j D^k \\
E_i &= \alpha h_{ij} D^j + \frac{1}{\sqrt{h}}\varepsilon_{ijk}\beta^j B^k
\end{aligned}
$$

!!! example "Flat space-time with diagonal metric"

    In flat space-time with diagonal metric, $\alpha=1$, and $\beta^i=0$, we have $D_i = E_i = h_{ij} E^j$, and $B_i = H_i = h_{ij} B^j$. Maxwell's equations then reduce to a closed form:

    $$
    \begin{aligned}
    \frac{\partial E^i}{c\partial t} &= \frac{1}{\sqrt{h}} \varepsilon^{ijk}\partial_j B_k - \frac{4\pi}{c} J^i \\
    \frac{\partial B^i}{c\partial t} &= -\frac{1}{\sqrt{h}} \varepsilon^{ijk}\partial_j E_k
    \end{aligned}
    $$

    If we further assume that the coordinate system is also flat, $h_{ij}=\delta_{ij}$, we get the more familiar form:

    $$
    \begin{aligned}
    \frac{\partial E^i}{c\partial t} &= (\nabla\times \bm{B})^i - \frac{4\pi}{c} J^i \\
    \frac{\partial B^i}{c\partial t} &= -(\nabla\times\bm{E})^i
    \end{aligned}
    $$

<!-- ### Axisymmetric

In 2D spherical coordinate system (axisymmetric, $\partial_\phi = 0$) discretized version of Maxwell's equation on $E^1$ ("radial") is singular at the polar axis: $h^{(i+1/2,~0)} = h^{(i+1/2,~n_2-1)} = 0$. -->

### Equations of motion for particles

The equation of motion for relativistic particles in such a 3+1 formulation have the following form:

$$
\begin{aligned}
\frac{d x^i}{cd t} &= \alpha \frac{1}{\gamma}h^{ij} u_j - \beta^i \\
\frac{d u_i}{cd t} &=
\underbrace{
  -\gamma \partial_i \alpha + u_j\partial_i \beta^j - \frac{\alpha}{2\gamma} u_j u_k\partial_i h^{jk}
}_{\text{``curvature'' force}} +
\underbrace{
  \frac{q}{m c^2}\alpha\left(h_{ij}D^j + \frac{1}{\sqrt{h}\gamma}\varepsilon_{ijk}h^{jl} u_l B^k\right)
}_{\text{Lorentz force}}
\end{aligned}
$$

Here $u_i$ are the three components of the particle's covariant four-velocity, $x^i$ is its position, $\gamma = \sqrt{\varepsilon+h^{ij}u_{i}u_j}$ is the energy of the particle ($\varepsilon\equiv 1$ for massive particles, and $\varepsilon\equiv 0$ for photons), $h_{ij}$, $h^{ij}$, $\sqrt{h}$ as well as $\alpha$, and $\beta^i$ are the metric coefficients at particle's position. $D^i$ and $B^i$ are the contravariant field components also measured at particle's position.

### Covariant current deposition

Charged particles deposit currents, $\bm{J}^i$, that go into Maxwell's equations as source terms. In general $\bm{J}^i = \rho \bm{\beta}^i c$, where $\rho$ is the charge density measured in the lab frame. Coupled with the equations of motion and Maxwell's equations, this relation ensures exact charge conservation, i.e., $\nabla\cdot \bm{J}^\mu\equiv \bm{J}^\mu_{;\mu} = 0$, where $\bm{J}^\mu$ is the contravariant four-current with $J^0 = \rho c$. Substituting $\tilde{\rho}\equiv \sqrt{h}\rho$, and $\bm{\mathcal{J}}^i\equiv \sqrt{h}\bm{J}^i$, we can rewrite the charge conservation in a more concise form:

$$
\frac{\partial \tilde{\rho}}{\partial t} + \partial_i \bm{\mathcal{J}}^i = 0
$$

Thus, depositing currents as $\bm{\mathcal{J}}^i$ and then converting to $\bm{J}^i=\bm{\mathcal{J}}^i/\sqrt{h}$ one can ensure that the exact charge conservation is maintained.

## Special-relativistic PIC

For the non-GR case we use an explicit leapfrog integrator for both fields and the particles. All the fields, as well as particle coordinates/velocities are defined in the general curvilinear (orthonormal) coordinate system.

=== "0. initial configuration"

    <div class="d3-diagram" id="plot0"></div>

    $$
    t=t^{(n)}
    $$

=== "1. first Faraday half-step"

    <div class="d3-diagram" id="plot1"></div>

    $$
    \frac{1}{c}\frac{\partial B^i}{\partial t} = -\frac{1}{\sqrt{h}}\varepsilon^{ijk}\partial_j\left(h_{kp} E^p\right)
    $$

    $$
    B^{(n-1/2)}\xrightarrow[\qquad E^{(n)}\qquad]{\Delta t/2} B^{(n)}
    $$

=== "2.1. particle velocity update"

    <div class="d3-diagram" id="plot2_1"></div>

    $$
    u^{(n-1/2)}\xrightarrow[\qquad E(x^n),~B(x^n)\qquad]{\Delta t} u^{(n+1/2)}
    $$

=== "2.2. particle coordinate update"

    <div class="d3-diagram" id="plot2_2"></div>

    $$
    \frac{\mathrm{d} x_i}{\mathrm{d} t} = \frac{u_i}{\gamma}
    $$

    $$
    x^{(n)}\xrightarrow[\qquad u^{(n+1/2)}\qquad]{\Delta t} x^{(n+1)}
    $$

=== "3. Current deposition"

    <div class="d3-diagram" id="plot3_2"></div>

=== "4.1. second Faraday half-step"

    <div class="d3-diagram" id="plot4"></div>

    $$
    \frac{1}{c}\frac{\partial B_i}{\partial t} = -\frac{1}{\sqrt{h}}\varepsilon^{ijk}\partial_j\left(h_{kp} E^p\right)
    $$

    $$
    B^{(n)}\xrightarrow[\qquad E^{(n)}\qquad]{\Delta t/2} B^{(n+1/2)}
    $$

=== "4.2. Ampere substep"

    <div class="d3-diagram" id="plot5"></div>
    
    $$
    \frac{1}{c}\frac{\partial E_i}{\partial t} = \frac{1}{\sqrt{h}}\varepsilon^{ijk}\partial_j\left(h_{kp} B^p\right) - \frac{4\pi}{c} J^i
    $$

    $$
    E^{(n)}\xrightarrow[\qquad B^{(n+1/2)},~J^{(n+1/2)}\qquad]{\Delta t} E^{(n+1)}
    $$

=== "5. final configuration"

    <div class="d3-diagram" id="plot6"></div>

    $$
    t=t^{(n+1)}
    $$

### Particle pusher in SR

The pseudocode below roughly illustrates the particle pusher algorithm in SR.

```go
// em <-- 4D array of e/b-fields (encode 3 dimensions and the component of the field)
// species <-- 1D array of species
// metric <-- metric object
// dt <-- timestep

// prtl.x: coordinates in code units @ t^n (1)
// prtl.u: 4-velocities in the global Cartesian basis @ t^(n-1/2)

for spec := range species {
  q_ovr_m := spec.charge / spec.mass
  for prtl := range spec.prtls { //(2)!
    if !prtl.is_alive {
      continue
    }
    if spec.is_massive { //(3)!
      // 1. interpolate contravariant fields to particle position
      eU, bU := interpolate(em, prtl.x)

      // 2. convert to global XYZ coordinates 
      e, b := metric.transform_xyz[Idx::U, Idx::XYZ](eU, bU) // (4)!

      // 3. update particle momentum (e.g., using Boris algorithm)
      prtl.u = updateMomentum(prtl.u, e, b, q_ovr_m, dt)
      
      // 4. get 3-velocity
      v = prtl.u / sqrt(1 + prtl.u**2)
    } else {
      // 4. get 3-velocity
      v = prtl.u / sqrt(prtl.u**2)
    }
    // 5. record the old position
    prtl.x_old = prtl.x

    // 6. convert the coordinates to Cartesian basis
    x = metric.convert_xyz[Crd::Cd, Crd::XYZ](prtl.x)
    
    // 7. update the position
    x += v * dt

    // 8. convert back to code basis
    prtl.x = metric.convert_xyz[Crd::XYZ, Crd::Cd](x)
    
    // 9. apply boundary conditions
    prtl.x, prtl.u, prtl.x_old = boundary_conditions(prtl.x, prtl.u, prtl.x_old) // (5)!
  }
}

// at the end of the loop we have
// prtl.x_old: coordinates @ t^n
// prtl.x: coordinates @ t^(n+1)
// prtl.u: 4-velocities @ t^(n+1/2)
```

1. :grey_exclamation: In the actual code, we store particle coordinates as an index of the cell the particle is in plus a displacement.
2. :grey_exclamation: In reality, we use a structure of arrays, instead of an array of structures. Here we use a simplified notation for clarity.
3. :grey_exclamation: In the code, of course, we minimize the amount of runtime `if` statements by using compile-time `constexpr if`-s and template arguments.
4. :grey_exclamation: If there are external forces acting on the particle, or a drag force, we include them in the next step.
5. :grey_exclamation: Here we include absorption, reflection from the axis, periodic boundaries, etc. Communication with other domains is happeing at a different place.

---

## General-relativistic PIC

=== "0. initial configuration"

    <div class="d3-diagram" id="grplot0"></div>

    $$
    t=t^{(n)}
    $$

=== "1.1. intermediate interpolation"

    <div class="d3-diagram" id="grplot1_1"></div>

    $$
    \begin{aligned}
    D^{(n-1/2)} &= \frac{1}{2}\left(D^{(n-1)}+D^{(n)}\right)\\\\
    B^{(n-1)} &= \frac{1}{2}\left(B^{(n-3/2)}+B^{(n-1/2)}\right)
    \end{aligned}
    $$

=== "1.2. auxiliary field recovery"

    <div class="d3-diagram" id="grplot1_2"></div>

    $$
    E^{(n-1/2)} = \alpha D^{(n-1/2)} + \beta\times B^{(n-1/2)}
    $$

=== "1.3. auxiliary Faraday substep"

    <div class="d3-diagram" id="grplot1_3"></div>

    $$
    B^{(n-1)}\xrightarrow[\qquad E^{(n-1/2)}\qquad]{\Delta t} B^{(n)}
    $$

=== "2. particle push"

    <div class="d3-diagram" id="grplot2_1"></div>

=== "3. current deposition"

    <div class="d3-diagram" id="grplot3"></div>

=== "4.1. auxiliary field recovery"

    <div class="d3-diagram" id="grplot4_1"></div>

    $$
    E^{(n)} = \alpha D^{(n)} + \beta\times B^{(n)}
    $$

    $$
    H^{(n)} = \alpha B^{(n)} - \beta\times D^{(n)}
    $$

=== "4.2. Faraday substep"

    <div class="d3-diagram" id="grplot4_2"></div>

    $$
    B^{(n-1/2)}\xrightarrow[\qquad E^{(n)}\qquad]{\Delta t} B^{(n+1/2)}
    $$

=== "4.3. intermediate current interpolation"

    <div class="d3-diagram" id="grplot4_3"></div>

    $$
    J^{(n)} = \frac{1}{2}\left(J^{(n-1/2)}+J^{(n+1/2)}\right)
    $$

=== "4.4. auxiliary Ampere substep"

    <div class="d3-diagram" id="grplot4_4"></div>

    $$
    D^{(n-1/2)}\xrightarrow[\qquad H^{(n)},~J^{(n)}\qquad]{\Delta t} D^{(n+1/2)}
    $$

=== "4.5. auxiliary field recovery"

    <div class="d3-diagram" id="grplot4_5"></div>

    $$
    H^{(n+1/2)} = \alpha B^{(n+1/2)} - \beta\times D^{(n+1/2)}
    $$

=== "4.6. Ampere substep"

    <div class="d3-diagram" id="grplot4_6"></div>

    $$
    D^{(n)}\xrightarrow[\qquad H^{(n+1/2)},~J^{(n+1/2)}\qquad]{\Delta t} D^{(n+1)}
    $$

=== "5. final configuration"

    <div class="d3-diagram" id="grplot5"></div>

    $$
    t=t^{(n+1)}
    $$

### Particle pusher in GR

Particle pusher in GR is slightly more complicated, as we can no longer transform into a global Cartesian frame, and thus unavoidably have to deal with the ["geodesic" term](#equations-of-motion-for-particles) in the equation of motion.

```go
// em <-- 4D array of d/b-fields, with d defined @ t^n (1)
// em0 <-- 4D array of d/b-fields, with b defined @ t^n
// species <-- 1D array of species
// metric <-- metric object
// dt <-- timestep

// prtl.x: coordinates in code units @ t^n
// prtl.u: 4-velocities in code-covariant basis @ t^(n-1/2)

for spec := range species {
  q_ovr_m := spec.charge / spec.mass
  for prtl := range spec.prtls {
    if !prtl.is_alive {
      continue
    }
    if spec.is_massive {
      // 1. interpolate contravariant fields to particle position
      eU, bU := interpolate(em, em0, prtl.x)

      // 2. convert to local tetrad basis
      eT, bT := metric.transform[Idx::U, Idx::T](eU, bU)

      // 3. get the velocity in tetrad basis
      uT := metric.transform[Idx::D, Idx::T](prtl.u)

      // 4. update particle momentum with electromagnetic-push (half step)
      uT = updateMomentum(uT, eT, bT, q_ovr_m, dt / 2)

      // 5. transform the velocity back to code-covariant basis
      uD := metric.transform[Idx::T, Idx::D](uT)

      // 6. update the momentum using a full geodesic push
      uD = geodesicMomentumUpdate(prtl.x, uD, dt)

      // 7. transform again to tetrad basis
      uT = metric.transform[Idx::D, Idx::T](uD)

      // 8. update with another half-step electromagnetic push
      uT = updateMomentum(uT, eT, bT, q_ovr_m, dt / 2)

      // 9. transform back to code-covariant basis
      prtl.u = metric.transform[Idx::T, Idx::D](uT)

      // 10. record the old position
      prtl.x_old = prtl.x

      // 11. update the coordinate using the geodesic equation
      prtl.x = geodesicPositionUpdate(prtl.x, prtl.u, dt)

      // 12. apply boundary conditions
      prtl.x, prtl.u, prtl.x_old = boundary_conditions(prtl.x, prtl.u, prtl.x_old)
    } else {
      // 1. update the momentum using geodesic push
      prtl.u = geodesicMomentumUpdate(prtl.x, prtl.u, dt)

      // 2. update the coordinate using geodesic push
      prtl.x = geodesicPositionUpdate(prtl.x, prtl.u, dt)

      // 3. apply boundary conditions
      prtl.x, prtl.u = boundary_conditions(prtl.x, prtl.u)
    }
  }
}

// at the end of the loop we have
// prtl.x_old: coordinates @ t^n
// prtl.x: coordinates @ t^(n+1)
// prtl.u: 4-velocities @ t^(n+1/2)
```

1. :grey_exclamation: To save memory, we store the fields at two time levels, and two different 4D arrays. Here we want to ensure we are passing the fields at time `t^n`. See step #2 in the diagram above.


<script src="../numerics-srpic.js"></script>
<script src="../numerics-grpic.js"></script>
{% include "html/d3js.html" %}

