---
hide:
  - footer
libraries:
  - p5
  - d3
scripts:
  - particle_shapes
---

# 2D particle shapes

This tool shows the intersection of 2D particle shapes with the different field components defined on the grid. Can be useful when debugging grid-particle interpolation routines, as well as current depositions (for the latter, it also shows initial and final positions of the particle). The distance between the initial and final particle position is limited to $\Delta x / \sqrt{2}$ (CFL condition). Both shape functions (initial and final) can be dragged. 

<div id="plot_ax" class="p5canvas">
  <div id="panels" style="display: inline-block;">
    <div id="toggles" style="display: inline-block; vertical-align: top; width: 40%">
      <h4 style="text-align: center;"></h4>
      <div id="shapefunc" class="d3-diagram" style="display: inline-block; vertical-align: top; width: 100%">
      </div>
    </div>
    <div id="radios" style="display: inline-block; vertical-align: top; width: 55%">
    </div>
  </div>
</div>
