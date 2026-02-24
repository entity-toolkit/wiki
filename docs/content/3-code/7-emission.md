---
hide:
  - footer
---

# Single-particle emission module

!!! abstract "Relevant headers"

    - `engines/srpic/particle_pusher.h`
    - `kernels/emission/emission.hpp`
    - `kernels/emission/compton.hpp`
    - `kernels/emission/synchrotron.hpp`
    - `kernels/particle_pusher_sr.hpp`

Single-particle emission module can simulate any process where individual particles produce other particle (or particles) based on externally prescribed fields or conditions. The module is integrated into the particle pusher, and is thus very efficient.

There are currently two built-in emission algorithms implemented, which can be enabled per each particle species.

```toml
```
