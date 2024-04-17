---
hide:
  - footer
---

Here we demonstrate the full particle-in-cell (PIC) algorithm in the most general form for both flat (curvilinear) space-time and GR.

<!-- ## Particle pusher

## Charge-conservative current deposition

To ensure charge conservation for discrete set of particles we must then define their shape functions, $S_p(x^i-x_p^i)$ in the following way (see also the section about [the current deposition](../3p1/#current-deposition)):

$$
\begin{aligned}
\tilde{\rho} &= \sum\limits_p q_p S_p(x^i - x_p^i)\\
\bm{\mathcal{J}}^i &= \sum\limits_p q_p \frac{dx^i_p}{dt} S_p(x^i - x_p^i)
\end{aligned}
$$

where $q_p$ is the charge of the particle $p$ in its rest frame. $dx^i_p/dt$ is the particle three-velocity defined in agreement with [the equation of motion](../3p1/#equations-of-motion-for-particles): in practice it is $\left((x^i_p)^{\rm (new)} - (x^i_p)^{\rm (old)}\right) / \Delta t$. After the deposition, we can then recover the physical contravariant currents that go into the Maxwell's equations: $\bm{J}^i = \bm{\mathcal{J}}^i / \sqrt{h}$.

Full deposition loop can be expressed with the following pseudocode (actual array names and structures are different).

=== "`ntt::PIC`"


=== "`ntt::GRPIC`"


$$
\begin{aligned}
\text{field solvers}&
\begin{cases}
\frac{\Delta\texttt{b}_i}{\Delta \texttt{t}} = -\frac{1}{\sqrt{h}} \left[\Delta_j (h_{k}\texttt{e}_k) - \Delta_k (h_{j}\texttt{e}_j)\right]\\[1em]
\frac{\Delta \texttt{e}_i}{\Delta \texttt{t}} = \frac{1}{\sqrt{h}} \left[\Delta_j (h_{k}\texttt{b}_k) - \Delta_k (h_{j}\texttt{b}_j)\right] - \frac{C_0}{\sqrt{h}}\texttt{j}_i
\end{cases}\\[4em]
\text{velocity update}&
\begin{cases}
\texttt{e},~\texttt{b} \xrightarrow[\text{interpolation}]{} \texttt{e}_p,~\texttt{b}_p\\[1em]
\texttt{e}_p,~\texttt{b}_p \xrightarrow[\text{to global XYZ}]{\text{contravariant}} \hat{\texttt{e}}_p,~\hat{\texttt{b}}_p\\[1em]
\gamma = \sqrt{1 + \hat{\texttt{u}}_i^2 + \hat{\texttt{u}}_j^2 + \hat{\texttt{u}}_k^2}\\[1em]
\frac{\Delta \hat{\texttt{u}}_i}{\Delta t} = \frac{\tilde{q}_p}{\tilde{m}_p}B_0\left(
  \hat{\texttt{e}}_i 
  + \frac{\hat{\texttt{u}}_j}{\gamma} \hat{\texttt{b}}_k
  - \frac{\hat{\texttt{u}}_k}{\gamma} \hat{\texttt{b}}_j
\right)
\end{cases}\\[6em]
\text{position update}&
\begin{cases}
\hat{\texttt{u}}_i \xrightarrow[\text{to contravariant}]{\text{global XYZ}} u^i\\[1em]
\frac{\Delta \texttt{x}_i}{\Delta \texttt{t}} = \frac{u^i}{\gamma}
\end{cases}\\[3em]
\text{current deposition}&~~~
\texttt{j}_i = \sum\limits_p \tilde{q}_p (\Delta \texttt{x}_i / \Delta \texttt{t})
\end{aligned}
$$

    NA -->

## Special-relativistic PIC

<!-- Full set of equations in flat space-time (with an arbitrary diagonal metric $h_{ij}=\textrm{diag}(h_{11}, h_{22}, h_{33})$) in code units (and not in the order we actually integrate them): -->

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

Particle pusher in GR is slightly more complicated, as we can no longer transform into a global Cartesian frame, and thus unavoidably have to deal with the ["geodesic" term](../3p1.md#equations-of-motion-for-particles) in the equation of motion.

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


## Covariant current deposition

Charged particles deposit currents, $\bm{J}^i$, that go into Maxwell's equations as source terms. In general $\bm{J}^i = \rho \bm{\beta}^i c$, where $\rho$ is the charge density measured in the lab frame. Coupled with the equations of motion and Maxwell's equations, this relation ensures exact charge conservation, i.e., $\nabla\cdot \bm{J}^\mu\equiv \bm{J}^\mu_{;\mu} = 0$, where $\bm{J}^\mu$ is the contravariant four-current with $J^0 = \rho c$. Substituting $\tilde{\rho}\equiv \sqrt{h}\rho$, and $\bm{\mathcal{J}}^i\equiv \sqrt{h}\bm{J}^i$, we can rewrite the charge conservation in a more concise form:

$$
\frac{\partial \tilde{\rho}}{\partial t} + \partial_i \bm{\mathcal{J}}^i = 0
$$

Thus, depositing currents as $\bm{\mathcal{J}}^i$ and then converting to $\bm{J}^i=\bm{\mathcal{J}}^i/\sqrt{h}$ one can ensure that the exact charge conservation is maintained (see [charge-conservative current deposition](/how/pic#charge-conservative-current-deposition)).


<script src="../numerics-srpic.js"></script>
<script src="../numerics-grpic.js"></script>
{% include "html/d3js.html" %}