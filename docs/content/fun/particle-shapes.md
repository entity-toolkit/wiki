---
hide:
  - footer
libraries:
  - p5
scripts:
  - particle_shapes
---

# 2D particle shapes

This tool shows the intersection of 2D particle shapes with the different field components defined on the grid. Can be useful when debugging grid-particle interpolation routines, as well as current depositions (for the latter, it also shows initial and final positions of the particle). The distance between the initial and final particle position is limited to $\Delta x / \sqrt{2}$ (CFL condition). Both shape functions (initial and final) can be dragged. 

<div id="plot_ax" class="p5canvas"></div>
