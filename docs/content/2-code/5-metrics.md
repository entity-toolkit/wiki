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

# Metrics

!!! abstract "Relevant headers"

    - `metrics/metric_base.h`
    - `metrics/minkowski.h`
    - `metrics/spherical.h`
    - `metrics/qspherical.h`
    - `metrics/kerr_schild.h`
    - `metrics/qkerr_schild.h`
    - `metrics/kerr_schild_0.h`

Metrics are key objects of the Entity framework. Superimposed on the discretized mesh, they define the spacetime geometry of the simulation and provide necessary functions for converting coordinates and transforming vectors from one basis to another.

## Coordinate systems and bases

To understand how metrics are implemented in Entity, one must first understand the different coordinate systems and bases the Entity works with. For each metric, there are two or three levels of coordinates.

- **Physical**, $x^I$: this is the coordinate system in which the metric is originally defined (e.g., for Kerr-Schild -- it's spherical, for Minkowski -- Cartesian).
- **Linear**: this is the coordinate system in which the grid discretization is uniform. It is often stretched or squeezed w.r.t. the original physical (e.g., for Q-Kerr-Schild -- it's quasi-spherical, for Kerr-Schild -- it's the same as the physical);
- **Code-unit**, $x^i$: finally, this is the coordinate system the code works with; it takes the linear coordinate system and remaps it to the interval of $[0, n_i)$, where $n_i$ is the number of grid points in the $i$-th direction on the given domain.

!!! Example "Qspherical coordinates"

    All qspherical metrics (`QSpherical`, `QKerrSchild`) take spherical coordinates as their base $(r,\theta,\phi)$, then [stretch them to quasi-spherical coordinates](../fun/coords.md) $(\xi,\eta,\phi)$, and finally map them to code-unit coordinates $(x^1,x^2,x^3)$.

    $$
    \begin{CD}
     (r,\theta,\phi) @>\text{stretch}>> (\xi,\eta,\phi) @>\text{map}>> (x^1,x^2,x^3)
    \end{CD}
    $$

    where stretching is done via $\xi=\log{(r-r_0)}$, $\theta = x_2 + 2h \eta (\pi - 2 \eta) (\pi - \eta) / \pi^2$ ($\eta$ set implicitly), and mapping -- via $x^1 = (\xi - \xi_{\rm min})/n_1$, etc.

    The diagram below demonstrates the stretching of the quasi-spherical coordinates in the $\xi$ direction, and how that maps to both the physical and code-unit coordinates. Here we stretch $r=[1, 90)$ logarithmically $\xi=\ln{r}$, and map it to $x^1=[0, 18)$ which coincides with our discretization. The result is a non-uniformly discretized grid with more cells focused towards the origin.

    <div class="d3-diagram" id="plot-coord-stretch"></div>


Vectors in Entity can also be defined in different bases. We typically define covariant and contravariant vectors in code-, $x^i$, and physical-, $x^I$, generally non-orthonormal coordinates: $u_i$, $u^i$, and $u_I$, $u^I$. We can also define a locally-flat orthonormal basis, $u_{\hat{i}}\equiv u^{\hat{i}}\equiv u^{\hat{I}}\equiv u_{\hat{I}}$, also called the tetrad basis. For special-relativistic metrics, tetrad basis is exactly the same in all points of space, and is thus global. For general-relativistic metrics, the tetrad basis is defined locally, and is different in each point of space.

## Metric classes

Each metric has a number of distinct attributes. These are:

- `D`: the dimensionality of the metric:
    - `Dim::_1D`, `Dim::_2D`, `Dim::_3D`
- `Label`: a string that identifies the metric;
- `CoordType`: the type of coordinates used in the metric;
    - `Coord::Cart`, `Coord::Sph`, `Coord::Qsph`
- `PrtlDim`: the dimensionality of the particle coordinates. `PrtlDim == Dim::_3D` for SR spherical metrics, and `== D` otherwise; (1) 
    { .annotate }

    1.  :man_raising_hand: In 2D axisymmetric SR simulations, particles carry all three coordinates to recover their full Cartesian position, and transform fields to/from the global Cartesian basis.

## Methods

<table> 
  <tr>
    <th>method</th>
    <th>description</th>
    <th>arguments</th>
    <th>returns</th>
  </tr>
  <tr>
    <td><code>h_<i, j></code></td>
    <td>metric components $h_{ij}$</td>
    <td><code>coord_t&lt;D&gt; x_C</code></td>
    <td><code>real_t</code></td>
  </tr>
  <tr class="tr-gr2">
    <td><code>h<i, j></code></td>
    <td>inverse metric components $h^{ij}$</td>
    <td><code>coord_t&lt;D&gt; x_C</code></td>
    <td><code>real_t</code></td>
  </tr>
  <tr class="tr-gr2">
    <td><code>alpha</code></td>
    <td>lapse function $\alpha$</td>
    <td><code>coord_t&lt;D&gt; x_C</code></td>
    <td><code>real_t</code></td>
  </tr>
  <tr class="tr-gr2">
    <td><code>beta1</code></td>
    <td>shift vector component $\beta^1$</td>
    <td><code>coord_t&lt;D&gt; x_C</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>sqrt_det_h</code></td>
    <td>$\sqrt{\det{h_{ij}}}$</td>
    <td><code>coord_t&lt;D&gt; x_C</code></td>
    <td><code>real_t</code></td>
  </tr>
  <tr class="tr-gr2">
    <td><code>sqrt_det_h_tilde</code></td>
    <td>$\sqrt{\det{h_{ij}}} / \sin{\theta}$</td>
    <td><code>coord_t&lt;D&gt; x_C</code></td>
    <td><code>real_t</code></td>
  </tr>
  <tr class="tr-gr1">
    <td><code>sqrt_h_<i, j></code></td>
    <td>$\sqrt{h_{ij}}$</td>
    <td><code>coord_t&lt;D&gt; x_C</code></td>
    <td><code>real_t</code></td>
  </tr>
  <tr class="tr-gr3">
    <td><code>polar_area</code></td>
    <td>$A_{\theta\phi}$</td>
    <td><code>real_t x1_C</code></td>
    <td><code>real_t</code></td>
  </tr>
  <tr>
    <td><code>convert<i, in, out></code></td>
    <td>converts the $i$-th component of a coordinate to another basis</td>
    <td><code>real_t</code></td>
    <td><code>real_t</code></td>
  </tr>
  <tr>
    <td><code>convert<in, out></code></td>
    <td>converts the full $D$-dimensional coordinate to another basis</td>
    <td><code>coord_t&lt;D&gt;, &coord_t&lt;D&gt;</code></td>
    <td></td>
  </tr>
  <tr class="tr-gr1">
    <td><code>convert_xyz<in, out></code></td>
    <td>explicitly converts to/from a Cartesian basis</td>
    <td><code>coord_t&lt;PrtlDim&gt;, &coord_t&lt;PrtlDim&gt;</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>transform<i, in, out></code></td>
    <td>transforms the $i$-th component of a vector to another frame</td>
    <td><code>coord_t&lt;D&gt; x_C, real_t</code></td>
    <td><code>real_t</code></td>
  </tr>
  <tr>
    <td><code>transform<in, out></code></td>
    <td>transforms the full $3D$ vector to another frame</td>
    <td><code>coord_t&lt;D&gt;, vec_t<3D>, &vec_t<3D></code></td>
    <td></td>
  </tr>
  <tr class="tr-gr1">
    <td><code>transform_xyz<in, out></code></td>
    <td>explicitly transforms to/from a Cartesian frame</td>
    <td><code>coord_t&lt;PrtlDim&gt;, vec_t<3D>, &vec_t<3D></code></td>
    <td></td>
  </tr>
</table>

<span tr-gr1></span> = only defined for SR metrics

<span tr-gr2></span> = only defined for GR metrics

<span tr-gr3></span> = only defined for spherical metrics

The `in` and `out` template arguments for the `convert<>` and `transform<>` functions are, respectively, the coordinate bases (stored as an enum `Crd::`) and the vector reference frame (stored as enum `Idx::`). The members of these enums are:

<table>
  <tr>
    <th></th>
    <th>description</th>
  </tr>
  <tr>
    <td><code>Crd::Cd</code></td>
    <td>code-unit coordinates: $x^i$</td>
  </tr>
  <tr class="tr-gr1">
    <td><code>Crd::XYZ</code></td>
    <td>cartesian coordinates: $x^{x}$</td>
  </tr>
  <tr>
    <td><code>Crd::Sph</code></td>
    <td>spherical coordinates: $x^{r}$</td>
  </tr>
  <tr>
    <td><code>Crd::Ph</code></td>
    <td>"physical" coordinates: $x^{I}$</td>
  </tr>
</table>


!!! note "`Crd::Ph`"
    Depending on the metric, `Crd::Ph` is equivalent to `Crd::XYZ` or `Crd::Sph`. 

<table>
  <tr>
    <th></th>
    <th>description</th>
  </tr>
  <tr>
    <td><code>Idx::U</code></td>
    <td>upper (contravariant) basis (code units): $u^i$</td>
  </tr>
  <tr>
    <td><code>Idx::D</code></td>
    <td>lower (covariant) basis (code units): $u_i$</td>
  </tr>
  <tr>
    <td><code>Idx::T</code></td>
    <td>tetrad (orthonormal) basis $u^{\hat{i}} \equiv u_{\hat{i}} \equiv u^{\hat{I}} \equiv u_{\hat{I}}$</td>
  </tr>
  <tr class="tr-gr1">
    <td><code>Idx::XYZ</code></td>
    <td>global Cartesian basis: $u^{\hat{x}}\equiv u_{\hat{x}}$</td>
  </tr>
  <tr class="tr-gr1">
    <td><code>Idx::Sph</code></td>
    <td>global spherical basis: $u^{\hat{r}}\equiv u_{\hat{r}}$</td>
  </tr>
  <tr>
    <td><code>Idx::PU</code></td>
    <td>physical contravariant basis: $u^I$</td>
  </tr>
  <tr>
    <td><code>Idx::PD</code></td>
    <td>physical covariant basis: $u_I$</td>
  </tr>
</table>

<span tr-gr1></span> = only possible in SR

!!! note

    For Cartesian metric, transforming to `Idx::T` is equivalent to converting to `Idx::XYZ`, and similarly for the spherical metric, transforming to `Idx::T` is equivalent to converting to `Idx::Sph`.

!!! code

    Metric component $1,1$ in the covariant basis, $h_{11}$, can be accessed via in the certain position `x_Code` in code units by calling (assuming `D` is the dimension of the metric): 
    ```c++
    coord_t<D> x_Code;
    // define x_Code
    metric.template h_<1, 1>(x_Code)
    ```
    To convert `x_Code` to physical coordinates:
    ```c++
    coord_t<D> x_Ph { ZERO }; // init with zero so the compiler doesn't complain
    metric.template convert<Crd::Cd, Crd::Ph>(x_Code, x_Ph);
    ```
    To transform a vector `v_Cov` from the covariant basis to the tetrad basis:
    ```c++
    vec_t<Dim::_3D> v_Cov;
    // define v_Cov
    vec_t<Dim::_3D> v_T { ZERO };
    metric.template transform<Idx::D, Idx::T>(x_Code, v_Cov, v_T);
    ```
    For SR metrics you can also explicitly convert coordinates and transform vectors to/from the cartesian basis:
    ```c++
    coord_t<PrtlDim> x_Code;
    // define x_Code (notice, that for 2D spherical metrics this will be 3D)
    metric.template convert_xyz<Crd::Cd, Crd::XYZ>(x_Code, x_Cart);

    vec_t<Dim::_3D> v_Cntrv;
    // define v_Cntrv
    vec_t<Dim::_3D> v_XYZ { ZERO };
    metric.template transform_xyz<Idx::U, Idx::XYZ>(x_Code, v_Cntrv, v_XYZ);
    ```

Below is a diagram demonstrating all the possible transformations.


<div class="tikz">
<script type="text/tikz">
  \usetikzlibrary{shapes.geometric, arrows, bending}
  \begin{document}
  \begin{tikzpicture}[
      node distance=2cm,
      node/.style={rectangle, rounded corners, draw=black, fill=gray!20, minimum size=1cm, scale=1.5},
      arrow/.style={thick,<->,>=stealth},
      dasharrow/.style={thick,dashed,<->,>=stealth},
      scale=1.1, transform shape
  ]

  \node at (0.1, 0) (O) {};
  \node[node, right of=O, xshift=-0.75cm, yshift=-0.5cm] (A1) {$u^i$: \texttt{Idx::U}};
  \node[node, right of=A1, xshift=0.5cm, yshift=-2cm] (A2) {$u_i$: \texttt{Idx::D}};
  \node[node, right of=A2, xshift=2cm] (B2) {$u_I$: \texttt{Idx::PD}};
  \node[node, right of=B2, xshift=0.5cm, yshift=2cm] (B1) {$u^I$: \texttt{Idx::PU}};
  \node[node, below of=B2, xshift=-1.75cm, yshift=-1cm] (C) {$u_{\hat{i}}\equiv u^{\hat{i}}\equiv u^{\hat{I}}\equiv u_{\hat{I}}$: \texttt{Idx::T}};

  \draw[arrow] (A1) -- (A2);

  \draw[arrow] (B1) -- (B2);

  \draw[arrow] (A1) to[bend right=30] (C);

  \draw[arrow] (A2) -- (C);

  \draw[arrow] (B1) to[bend left=30] (C);

  \draw[arrow] (B2) -- (C);

  \draw[dasharrow] (A2) -- (B2);

  \draw[dasharrow] (A1) -- (B1);

  \end{tikzpicture}
  
\end{document}
</script>
</div>


## Metric structure and hierarchy

Schematics below shows the structure of the metric classes and their inheritance hierarchy with all the private/public variables and methods.

<pre class="mermaid-diagram">
--8<-- "docs/assets/diagrams/metrics.mmd"
</pre>
