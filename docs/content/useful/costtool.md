---
hide:
  - footer
scripts:
  - costtool
---

# Simulation cost estimator

This interactive tool allows to quickly estimate the cost of a simulation (both in terms of memory usage and simulation time) to help optimize your setup for specific scales and architectures.

<div id="cost-tool">
--8<-- "docs/assets/meta/costtool.html"
</div>

!!! warning "Memory alignment"

    Because of architecture-dependent memory alignment, the numbers cited here are only approximations. The actual memory used by the run may vary, so please make sure to leave at least 20%...30% of headroom for safety.

