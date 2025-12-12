---
hide:
  - footer
libraries:
  - mermaid
  - d3
  - tikzjax
scripts:
  - coord-stretching
---

# Higher order methods

!!! abstract "Relevant headers"

    - `kernels/faraday_mink.hpp`
    - `kernels/particle_shapes.hpp`
    - `kernels/current_deposit.hpp`
    - `kernels/particle_pusher_sr.hpp`


Since release 1.3.0 Entity supports higher order methods for the field solver as well as particle shapes.
The field solver has been generalized to allow for the construction of custom stencils that can be optimized to mitigate e.g. the Cherenkov instability.
Higher order particle shapes can be used for improved accuracy in the current deposit and particle pusher.

## Generalized field stencil

The field stencil generalisation is based on work by [Blinne et al. (2018)](https://ui.adsabs.harvard.edu/abs/2018CoPhC.224..273B/abstract) and aims to minimize numerical dispersion in Maxwell solvers.
We closely follow their notation, so to reproduce their stencils you can set the `alpha_i` and `beta_i` parameters in the `[algorithms.fieldsolver]` section of your parameter file following their Tables 1 and 3.

For convencience we provide the parameters for all reported stencils in [Blinne et al. (2018)](https://ui.adsabs.harvard.edu/abs/2018CoPhC.224..273B/abstract) in the following table. 

The stencils are optimized for a given `CFL`, so it is important to use the one associated with the stencil for your simulation.

Note that the `CFL` is given in the standard convention! In order to use it with entity you need to multiply it by $\sqrt{N_\mathrm{dim}}$.

<table id="blinne">
  <tr>
    <th>
      Dimension:
    </th>
    <th class="solvers-2d" colspan="9" style="text-align:center">
      2D
    </th>
    <th class="solvers-3d" colspan="3" style="text-align:center">
      3D
    </th>
  </tr>
  <tr>
    <th> Solver: </th>
    <th> Yee </th>
    <th> Cowan </th>
    <th> Lehe </th>
    <th> min1 </th>
    <th> min2 </th>
    <th> min3 </th>
    <th> min4 </th>
    <th> min5 </th>
    <th> min6 </th>
    <th> Yee </th>
    <th> min3 </th>
    <th> min4 </th>
  </tr>
  <tr>
    <th> <code>CFL</code> </th>
    <td> $1/\sqrt{2}$ </td>
    <td> $0.999$ </td>
    <td> $0.96$ </td>
    <td> $0.97/\sqrt{2}$ </td>
    <td> $0.95/\sqrt{2}$ </td>
    <td> $0.5$ </td>
    <td> $0.1$ </td>
    <td> $0.96$ </td>
    <td> $0.999$ </td>
    <td> $1/\sqrt{3}$ </td>
    <td> $0.5$ </td>
    <td> $0.1$ </td>
  </tr>
  <tr>
    <th> <code>delta_x</code> </th>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $-0.021$ </td>
    <td> $-0.125$ </td>
    <td> $-0.013$ </td>
    <td> $-0.065$ </td>
    <td> $-0.125$ </td>
    <td> $-0.017$ </td>
    <td> $-0.005$ </td>
    <td> $0$ </td>
    <td> $-0.00867$ </td>
    <td> $-0.048434$ </td>
  </tr>
  <tr>
    <th> <code>delta_y</code> </th>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $-0.125$ </td>
    <td> $-0.013$ </td>
    <td> $-0.065$ </td>
    <td> $-0.125$ </td>
    <td> $-0.017$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $-0.00867$ </td>
    <td> $-0.048434$ </td>
  </tr>
  <tr>
    <th> <code>delta_z</code> </th>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $-0.00867$ </td>
    <td> $-0.048434$ </td>
  </tr>
  <tr>
    <th> <code>beta_xy</code> </th>
    <td> $0$ </td>
    <td> $0.125$ </td>
    <td> $0.125$ </td>
    <td> $0.11$ </td>
    <td> $-0.013$ </td>
    <td> $-0.065$ </td>
    <td> $-0.125$ </td>
    <td> $0.133$ </td>
    <td> $0.128$ </td>
    <td> $0$ </td>
    <td> $-0.00867$ </td>
    <td> $-0.048434$ </td>
  </tr>
  <tr>
    <th> <code>beta_yx</code> </th>
    <td> $0$ </td>
    <td> $0.125$ </td>
    <td> $0.125$ </td>
    <td> $0.11$ </td>
    <td> $-0.013$ </td>
    <td> $-0.065$ </td>
    <td> $-0.125$ </td>
    <td> $0.133$ </td>
    <td> $0.128$ </td>
    <td> $0$ </td>
    <td> $-0.00867$ </td>
    <td> $-0.048434$ </td>
  </tr>
  <tr>
    <th> <code>beta_xz</code> </th>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $-0.00867$ </td>
    <td> $-0.048434$ </td>
  </tr>
  <tr>
    <th> <code>beta_zx</code> </th>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $-0.00867$ </td>
    <td> $-0.048434$ </td>
  </tr>
  <tr>
    <th> <code>beta_yz</code> </th>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $-0.00867$ </td>
    <td> $-0.048434$ </td>
  </tr>
  <tr>
    <th> <code>beta_zy</code> </th>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $0$ </td>
    <td> $-0.00867$ </td>
    <td> $-0.048434$ </td>
  </tr>
</table>

<!-- | Solver | `CFL` | `delta_x` | `delta_y` | `delta_z` | `beta_xy` | `beta_yx` | `beta_xz` | `beta_zx` | `beta_yz` | `beta_zy` | -->
<!-- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | -->
<!-- | **2D** | | | | | | | | | | | -->
<!-- | Yee | $1/\sqrt{2}$ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | -->
<!-- | Cowan | 0.999 | 0 | 0 | 0 | 0.125 | 0.125 | 0 | 0 | 0 | 0 | -->
<!-- | Lehe | 0.96 | -0.021 | 0 | 0 | 0.125 | 0.125 | 0 | 0 | 0 | 0 | -->
<!-- | min1 | $0.97/\sqrt{2}$ | -0.125 | -0.125 | 0 | 0.11 | 0.11 | 0 | 0 | 0 | 0 | -->
<!-- | min2 | $0.95/\sqrt{2}$ | -0.013 | -0.013 | 0 | -0.013 | -0.013 | 0 | 0 | 0 | 0 | -->
<!-- | min3 | 0.5 | -0.065 | -0.065 | 0 | -0.065 | -0.065 | 0 | 0 | 0 | 0 | -->
<!-- | min4 | 0.1 | -0.125 | -0.125 | 0 | -0.125 | -0.125 | 0 | 0 | 0 | 0 | -->
<!-- | min5 | 0.96 | -0.017 | -0.017 | 0 | 0.133 | 0.133 | 0 | 0 | 0 | 0 | -->
<!-- | min6 | 0.999 | -0.0005 | 0 | 0 | 0.128 | 0.128 | 0 | 0 | 0 | 0 | -->
<!-- | **3D** | | | | | | | | | | | -->
<!-- | Yee | $1/\sqrt{3}$ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | -->
<!-- | min3 | 0.5 | -0.00867 | -0.00867 | -0.00867 | -0.00867 | -0.00867 | -0.00867 | -0.00867 | -0.00867 | -0.00867 | -->
<!-- | min4 | 0.1 | -0.048434 | -0.048434 | -0.048434 | -0.048434 | -0.048434 | -0.048434 | -0.048434 | -0.048434 | -0.048434 | -->

To visualize the impact of the field stencil you can see the field of a single particle traveling in vacuum at `gamma = 10.0` in the following plot.
The rows show the particle traveling at $\theta = 0^\circ$, $\theta = 45^\circ$, $\theta = 90^\circ$ with respect to the x-axis.
Each column corresponds to a different field stencil from the table above.

![higherorder_stencil](../../assets/images/higherorder/fieldstencil_dark.png#only-dark){width=100% align=center} 
![higherorder_stencil](../../assets/images/higherorder/fieldstencil_light.png#only-light){width=100% align=center} 


## Higher order shape functions

To interpolate the current of a particle to the grid and the fields back to the particle, Entity uses a shape function. Before v1.3.0 this shape function was only of first order.
Since v1.3.0 you can use shape functions with up-to 11th order and deposit charges with the scheme introduced by [Esirkepov (2001)](https://ui.adsabs.harvard.edu/abs/2001CoPhC.135..144E/abstract).

![higherorder_shape](../../assets/images/higherorder/shape_functions_dark.png#only-dark){width=50% align=right} 
![higherorder_shape](../../assets/images/higherorder/shape_functions_light.png#only-light){width=50% align=right} 

You can switch to higher order shape functions by adding the follwoing compile flags to you `cmake` command: `-D deposit=esirkepov -D shape_order=<N>`, where `<N>` can be any number between `1` and `11`.

The benefits of using a higher order shape function are subtle, but they improve numerical stability considerably.
You can see this in the following example, where we set up a slowly drifting plasma in a periodic box.
We choose the temperature to be very low, in order to purposefully under-resolve the Debye-length. If the Debye-length is too under-resolved the plasma will heat up to increase its Debye-length. This effect is purely numerical.
From the top to bottom we uncrease the resolution of the grid to improve resolving the Debye-length.
You can see that with higher order shape functions the numerical heating stops at considerably lower resolution.

![higherorder_shape](../../assets/images/higherorder/heating_dark.png#only-dark){width=100% align=center}
![higherorder_shape](../../assets/images/higherorder/heating_light.png#only-light){width=100% align=center}

This allows you to reduce the numerical resolution when moving to higher order shape functions.
We strongly advise to perform careful convergence tests before reducing numerical resolution in favor of higher order shape functions.

The computational cost increase is negligible for 1D, but can become substantial for 3D.
You can find scaling tests performed on a single Intel PVC GPU in the following plot.

![higherorder_shape](../../assets/images/higherorder/scaling_dark.png#only-dark){width=100% align=center}
![higherorder_shape](../../assets/images/higherorder/scaling_light.png#only-light){width=100% align=center}
