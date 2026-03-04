---
hide:
  - footer
---

# Radiative physics

!!! abstract "Relevant headers"

    - `engines/srpic/particle_pusher.h`
    - `kernels/emission/emission.hpp`
    - `kernels/emission/compton.hpp`
    - `kernels/emission/synchrotron.hpp`
    - `kernels/particle_pusher_sr.hpp`

## Radiative drag

Radiative drag is an additional force applied per each particle species separately. You can have individual drag terms or combine them using the configuration below:

```toml
[[particles.species]]
    # Radiation reaction to use for the species
    #   @type: string
    #   @default: "None"
    #   @enum: "None", "Synchrotron", "Compton"
    #   @note: Can also be coma-separated combination, e.g., "Synchrotron,Compton"
    #   @note: Relevant radiation.drag parameters should also be provided
    radiative_drag = ""
```

There are two supported radiative terms currently implemented -- synchrotron and Compton drag. These are approximated using the following equation of motion (for a particle of charge $q$, mass $m$, and four-velocity $\bm{u}\equiv \gamma\bm{\beta}$); for the synchrotron drag (electric & magnetic field at particle position being $\bm{E}$ and $\bm{B}$):

$$
\frac{d\bm{u}}{dt} = \frac{|q|/m}{q_0/m_0} \omega_B^0 \eta \left(\frac{\gamma}{\gamma_{\rm rad}}\right)^2\left(\bm{\kappa}_R\gamma^{-2} - \chi_R^2\bm{\beta} \right),
$$

where $\eta \equiv 0.1$, $\omega_B^0\equiv q_0 B_0/m_0 c$, and
$$
\begin{aligned}
\bm{\kappa}_R &\equiv \left(\bm{e}+\bm{\beta}\times\bm{b}\right)\times\bm{b} + \left(\bm{\beta}\cdot \bm{e}\right)\bm{e},\\\\
\chi_R^2 &\equiv \left|\bm{e}+\bm{\beta}\times\bm{b}\right|^2 - \left(\bm{\beta}\cdot \bm{e}\right)^2,
\end{aligned}
$$

with $\bm{e}\equiv \bm{E}/B_0$, $\bm{b}\equiv \bm{B}/B_0$. 

Similarly, for the Compton drag (with $\eta\equiv 0.1$):

$$
\frac{d\bm{u}}{dt} = -\frac{|q|/m}{q_0/m_0}\eta \left(\frac{\gamma}{\gamma_{\rm rad}}\right)^2\bm{\beta}.
$$

In both cases, the relative strength of the drag is controlled by the corresponding $\gamma_{\rm rad}$ dimensionless parameter, which can be set from the input file for both processes separately:

```toml
[radiation.drag.synchrotron]
  # Radiation reaction limit gamma-factor for synchrotron
  #   @type: float [> 0.0]
  #   @default: 1.0
  #   @note: [required] if one of the species has `radiative_drag = "synchrotron"`
  gamma_rad = ""

[radiation.drag.compton]
  # Radiation reaction limit gamma-factor for Compton drag
  #   @type: float [> 0.0]
  #   @default: 1.0
  #   @note: [required] if one of the species has `radiative_drag = "compton"`
  gamma_rad = ""
```

## Single-particle emission module

<a href="https://github.com/entity-toolkit/entity/pull/174">
  <span class="since-version">1.4.0</span>
</a>

Single-particle emission module can simulate any process where individual particles produce other particle (or particles) based on externally prescribed fields or conditions. The module is integrated into the particle pusher, and is thus very efficient.

There are currently two built-in emission algorithms implemented, which can be enabled per each particle species.

```toml
[[particles.species]]
    # Particle emission policy for the species
    #   @type: string
    #   @default: "None"
    #   @enum: "None", "Synchrotron", "Compton"
    #   @note: Only one emission mechanism allowed
    #   @note: Appropriate radiation drag flag will be applied automatically (unless explicitly set to "None")
    emission = ""
```

!!! warning 

    Only one emission can be enabled per species. So coma-separated values are not allowed.

!!! note

    When enabling the emission for a given species, you also automatically enable the corresponding `radiative_drag` (i.e., particles will feel a recoil when emitting). This, however, can be explicitly disabled, by setting the corresponding `radiative_drag = "none"` in the `[[particles.species]]` section.

### Synchrotron & Compton emission

There are several parameters that control how the emission works. These are set in the corresponding input section:

```toml
[radiation.emission.synchrotron]
  # Gamma-factor of a particle emitting synchrotron photons at energy `m0 c^2` in fiducial magnetic field `B0`
  #   @type: float [> 1.0]
  #   @default: 10.0
  gamma_qed = ""
  # Minimum photon energy for synchrotron emission (units of `m0 c^2`)
  #   @type: float [> 0.0]
  #   @default: 1e-4
  photon_energy_min = ""
  # Weights for the emitted synchrotron photons
  #   @type: float [> 0.0]
  #   @default: 1.0
  photon_weight = ""
  # Index of species for the emitted photon
  #   @type: ushort [> 0]
  #   @required
  photon_species = ""

[radiation.emission.compton]
  # Gamma-factor of a particle emitting inverse Compton photons at energy `m0 c^2`
  #   @type: float [> 1.0]
  #   @default: 10.0
  gamma_qed = ""
  # Minimum photon energy for inverse Compton emission (units of `m0 c^2`)
  #   @type: float [> 0.0]
  #   @default: 1e-4
  photon_energy_min = ""
  # Weights for the emitted inverse Compton photons
  #   @type: float [> 0.0]
  #   @default: 1.0
  photon_weight = ""
  # Index of species for the emitted photon
  #   @type: ushort [> 0]
  #   @required
  photon_species = ""
```

The emission (as well as the application of the drag force) is done probabilistically. The average energy emitted per unit time is still controlled by the `gamma_rad` parameter from the `[radiation.drag.synchrotron]` and `[radiation.drag.compton]` sections. However, the peak energy of the emitted photons is set by the `gamma_qed` dimensionless parameter, which is associated with the $\gamma$-factor of particles emitting photons (under nominal conditions) of energy $m_0 c^2$. I.e., for the synchrotron mechanism, the energy of the emitted photon will be:

$$
\frac{\varepsilon}{m_0 c^2} \equiv \frac{m}{m_0} \chi_R \left(\frac{\gamma}{\gamma_Q}\right)^2,
$$

and similarly for the Compton mechanism:

$$
\frac{\varepsilon}{m_0 c^2} \equiv \frac{m}{m_0} \left(\frac{\gamma}{\gamma_Q}\right)^2.
$$

Based on these energy values, as well as the `photon_weight` parameter which sets the weight of each emitted photon (relative to the emitting particle weight), the code determines the emission probability at each timestep to match the average emission power (determined by the corresponding $\gamma_{\rm rad}$). Photons below `photon_energy_min` still contribute to the radiative drag, but are not tracked. The final parameter, `photon_species`, is an integer $\geq 1$ which determines in which species will the photons of the given emission mechanism be tracked.

!!! note

    The emission prescription becomes unphysical, when the probability of the emission at each timestep is close to $1$. This can be estimated as $p = \omega_B^0 \Delta t \eta (\gamma_Q/\gamma_{\rm rad})^2 / w$, where $w$ is the relative photon weight. In this case, it is necessary to either decrease the timestep (CFL), or increase the emitted photon weight. Ideally, one needs to ensure that $p\ll 1$.
