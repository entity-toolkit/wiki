---
hide:
  - footer
libraries:
  - p5
  - expr-eval
scripts:
  - pushers
---

# Particle pushers

!!! Warning "Under construction"

    Some of the functionality of this tool is still in development! 

This demo tool allows you to integrate particle trajectories in the analytically prescribed electric and magnetic fields. You may vary the fields themselves below (fields can be non-uniform and even time-varying), inject particles of different charge-to-mass ratios (by either dragging on the screen or using an injector at the bottom), and pick different parameters of the simulation (like the integration timestep, and the algorithm). You may also visualize your fields by ticking the checkboxes next to the corresponding components (the colormap is automatically rescaled to accomodate for its dynamic range).

The tool uses natural units, in which $c = 1$, and all the particle velocities are four-velocities, i.e., $\bm{u}\equiv \gamma\bm{\beta}$. When dragging on the screen with the right click, the charge-to-mass for the injected particle is $q/m=1$ (red), while the right click injects a particle with $q/m=-1$ (blue). Electric and magnetic fields can be either picked from a limited number of presets using the dropdown, or you can type them in in a functional form (as a function of $x$, $y$, $z$ position and time, $t$) using the boxes below (the evaluator accepts all sorts of expressions outlined [here](https://github.com/silentmatt/expr-eval)).

<div id="pushers">
  <div id="configs" style="display: inline-block">

    <div class="dropdown">
      <span class="label">Field presets: </span>
      <select name="field-presets" id="select-field-presets">
        <option value="ExB">E-cross-B drift</option>
        <option value="betatron">betatron drift</option>
        <option value="gradb">grad-B drift</option>
        <option value="dipole">magnetic dipole</option>
        <option value="mirror">magnetic mirror</option>
        <option value="noise">magnetic noise</option>
      </select>
    </div>

    <div class="dropdown">
      <span class="label">Pusher: </span>
      <select name="pushers" id="select-pushers">
        <option value="Boris">Boris</option>
        <option value="Vay">Vay</option>
        <option value="Implicit">Implicit</option>
      </select>
    </div>

  </div>

  <div id="canvas" class="p5canvas" style="position: relative">
  </div>
  <div id="simulation">
    <div class="control-element">
      <table id="input-fields">
        <tr>
          <th></th>
          <th>$x$</th>
          <th>$y$</th>
          <th>$z$</th>
        </tr>
        <tr>
          <td>$\bm{E}$</td>
          <td><input type="text" id="input-ex"/><input type="checkbox" id="draw-ex"/></td>
          <td><input type="text" id="input-ey" value="0.1"/><input type="checkbox" id="draw-ey"/></td>
          <td><input type="text" id="input-ez"/><input type="checkbox" id="draw-ez"/></td>
        </tr>
        <tr>
          <td>$\bm{B}$</td>
          <td><input type="text" id="input-bx"/><input type="checkbox" id="draw-bx"/></td>
          <td><input type="text" id="input-by"/><input type="checkbox" id="draw-by"/></td>
          <td><input type="text" id="input-bz" value="1"/><input type="checkbox" id="draw-bz"/></td>
        </tr>
      </table>
    </div>
    <div class="control-element">
      <table id="input-inject">
        <tr>
          <td colspan="3">$x$: <input type="number" id="input-x" value="0"/></td>
          <td colspan="3">$y$: <input type="number" id="input-y" value="0"/></td>
        </tr>
        <tr>
          <td colspan="2">$u_x$: <input type="number" id="input-ux" value="1"/></td>
          <td colspan="2">$u_y$: <input type="number" id="input-uy" value="1"/></td>
          <td colspan="2">$u_z$: <input type="number" id="input-uz" value="0"/></td>
        </tr>
        <tr>
          <td colspan="3">$q/m$: <input type="number" id="input-charge" value="1"/></td>
          <td colspan="3"><input id="btn-inject" type="button" value="Inject a particle"></input></td>
        </tr>
      </table>
    </div>
  </div>
</div>


