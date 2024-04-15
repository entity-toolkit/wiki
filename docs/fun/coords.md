---
hide:
  - footer
---

Below for visualization purposes we demonstrate three different axisymmetric systems: a regular spherical $(r,\theta,\phi)$, an equal area and a "quasi-spherical" $(\xi,\eta,\phi)$, where 

$$
\text{equal area} = 
        \begin{cases}
            \xi = \log{(r)}, \\
            \eta = -\cos{\theta}, \\
            \phi = \phi
        \end{cases}
~~~~
\text{quasi-spherical} = 
        \begin{cases}
            \xi = \log{(r - r_0)}, \\
            \eta:~\theta = \eta + 2h \eta (\pi - 2 \eta) (\pi - \eta) / \pi^2, \\
            \phi = \phi
        \end{cases}
$$

with $r_0$ and $h$ being user-controlled parameters. The interactive plot below demonstrates the difference between grids, uniformly discretized in each of these coordinate systems.

<div id="plot_ax_01" class="p5canvas"></div>

<script src="../coords-1.js"></script>
{% include "html/p5js.html" %}