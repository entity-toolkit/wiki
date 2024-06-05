---
hide:
  - footer
---

In the [previous section](intro.md) we derived the evolution equation for the continuous distribution describing a system of particles that do not undergo binary interactions, and only interact via collective large-scale self-induced fields:

\begin{equation}
\frac{\partial f_s}{\partial t} + 
  \frac{\bm{u}}{\gamma}\cdot\frac{\partial f_s}{\partial \bm{x}} +
  \underbrace{\frac{q_s}{m_s}\left(\bm{E}+\frac{\bm{u}}{\gamma}\times\bm{B}\right)}_{\bm{F}_s/m_s}\cdot 
  \frac{\partial f_s}{\partial \bm{u}} = 0,
\end{equation}

which, coupled to the two Maxwell's equations,

\begin{equation}
\begin{aligned}
& \frac{\partial \bm{E}}{c\partial t} = 
\nabla\times \bm{B} - 
\frac{4\pi}{c}
\underbrace{\sum\limits_s q_s\int \frac{\bm{u}'}{\gamma'} f_s\left(\bm{x},~\bm{u}'\right) d^3\bm{u}'}_{\bm{J}},\\
& \frac{\partial \bm{B}}{c\partial t} = -\nabla\times\bm{E},
\end{aligned}
\end{equation}

form a closed system of equations, otherwise known as the Vlasov-Maxwell system. The two boundary conditions

\begin{align*}
\nabla\cdot\bm{B} &= 0,\\
\nabla\cdot\bm{E} &= 4\pi \underbrace{\sum\limits_s q_s\int f_s(\bm{x},\bm{u}',t)d^3\bm{u}'}_{\rho},
\end{align*}

are satisfied automatically, if one follows the evolution using the system of equations in $(1)$ and $(2)$. In the most general case, this system is 6-dimensional and non-linear, so solving it numerically is not only challenging, but also costly. 

Particle-in-cell (PIC) algorithm is a widely used technique which significantly simplifies the solution of this system. To introduce the technique, we first need to decompose the 6D distribution function $f_s$ into special basis functions in phase-space by introducing a finite number of the so-called *macroparticles*:

\begin{equation}
f_s(\bm{x},\bm{u},t) \approx \sum\limits_i w_i^s S (\bm{x}-\bm{x}_i^s(t))\delta(\bm{u}-\bm{u}_i^s(t)),
\end{equation}

where $w_i^s$ are called *macroparticle weights*, and $S$ is often referred to as a *shape function*. Since $f_s$ in general is an arbitrary continuous function, and we only introduce a finite set of particles with phase-space coordinates $(\bm{x}_i^s,~\bm{u}_i^s)$, the equality above is only approximate, and it approaches the exact solution as the number of macroparticles increases. From the shape function we will require the following properties:

$$
\iiint\limits_V S(\bm{x}) d^3\bm{x} = 1,~\textrm{and}~S(\bm{x})\xrightarrow[\bm{x}\not\in V]{} 0,
$$

where $V$ is a finite volume in the real space which includes the origin. Here and further we will use the terms *particle* and *macroparticle* interchangeable, but one should really think of these entities (ha-ha), as discrete sampling of the original continuous distribution function.

Plugging $(3)$ into $(1)$, we get the following equation (for brevity, we use $\delta_{\bm{u}} = \delta(\bm{u}-\bm{u}_i^s)$, and $S_{\bm{x}}=S(\bm{x}-\bm{x}_i^s)$):

\begin{equation}
\begin{aligned}
&\sum\limits_i w_i^s\left[
-\delta_{\bm{u}}
  \frac{d\bm{x}_i^s}{dt}
    \cdot
  \frac{\partial S_{\bm{x}}}{\partial \bm{x}}
- S_{\bm{x}} \frac{d\bm{u}_i^s}{dt} \cdot
\frac{\partial \delta_{\bm{u}}}{\partial \bm{u}}
+  \delta_{\bm{u}}\frac{\bm{u}}{\gamma}\cdot \frac{\partial S_{\bm{x}}}{\partial \bm{x}}
+  S_{\bm{x}} \frac{\bm{F}_s}{m_s}\cdot\frac{\partial \delta_{\bm{u}}}{\partial \bm{u}}
\right] = \\ 
&= -\sum\limits_i w_i^s\left[
  \delta_{\bm{u}}
    \left(
      \frac{d\bm{x}_i^s}{dt} - \frac{\bm{u}}{\gamma}
    \right)
    \frac{\partial S_{\bm{x}}}{\partial \bm{x}}
  +S_{\bm{x}}
  \left(
    \frac{d\bm{u}_i^s}{dt} - \frac{\bm{F}_s(\bm{x},\bm{u},t)}{m_s}
  \right)
  \frac{\partial \delta_{\bm{u}}}{\partial \bm{u}}
\right] = 0,
\end{aligned}
\end{equation}

where again, we used the fact that $\partial \bm{F}_s/\partial \bm{u} = 0$. We are now ready to derive the evolution equations for macroparticles which will exactly reproduce (given large-enough number of them) the original solution of the Vlasov-Maxwell system. We integrate equation $(4)$ separately over $d^3\bm{x}$ and $d^3\bm{u}$:

\begin{align*}
\int (4)~d^3\bm{x}'d^3\bm{u}' =&
  \sum \limits_i w_i^s
\left[(4.1)+(4.2)\right] = 0, \\
(4.1)=& \int  d^3\bm{x}'
  \frac{\partial S_{\bm{x}'}}{\partial \bm{x}'}
  \int d^3\bm{u}'
  \left(
    \frac{d\bm{x}_i^s}{dt} - \frac{\bm{u}'}{\gamma'}
  \right)\delta_{\bm{u}'}=\\
  =&\int  d^3\bm{x}'
  \frac{\partial S_{\bm{x}'}}{\partial \bm{x}'}\cdot
  \left(
    \frac{d\bm{x}_i^s}{dt} - \frac{\bm{u}_i^s}{\gamma_i^s}
  \right)=\\
  =&\oint  
  S_{\bm{x}'}
  \left(
    \frac{d\bm{x}_i^s}{dt} - \frac{\bm{u}_i^s}{\gamma_i}
  \right)\cdot d\bm{\xi}',\\
(4.2)=&\int d^3\bm{u}'
  \frac{\partial \delta_{\bm{u}'}}{\partial \bm{u}'}\cdot
  \left(
    \frac{d\bm{u}_i^s}{dt} - 
    \frac{1}{m_s}\int\bm{F}_s(\bm{x}',\bm{u}',t)S_{\bm{x}'} d^3\bm{x}'
  \right)=\\
  =& \frac{d\bm{u}_i^s}{dt} - 
    \frac{1}{m_s}\int\bm{F}_s(\bm{x}',\bm{u}_i^s,t)S_{\bm{x}'} d^3\bm{x}',
\end{align*}

where we used the Gauss-Ostrogradsky theorem to transform the integral in phase-space volume to an integral over the boundaries. The equality is satisfied for an arbitrarily chosen volume if and only if the following two equations hold:

\begin{equation}
\begin{aligned}
\frac{d\bm{x}_i^s}{dt} &= \frac{\bm{u}_i^s}{\gamma_i^s},\\
\frac{d\bm{u}_i^s}{dt} &=
    \frac{1}{m_s}\int\bm{F}_s(\bm{x}',\bm{u}_i^s,t)S(\bm{x}'-\bm{x}_i^s) d^3\bm{x}'.
\end{aligned}
\end{equation}

Naively, one could recognize the equations of motion for particles with coordinates $\bm{x}_i^s$, and four-velocities $\bm{u}_i^s$. But the striking and crucial difference from regular equations of motion is in the fact that the force in this case is effectively "interpolated" for each macroparticle using the shape function $S$. The absence of this in the first equation is due to our choice of the $\delta$-function for the "shape" in velocity space. 

One should really think of the system $(5)$ as $6N$-dimensional system of characteristic equations along which the convective derivative of $f_s$ (given by eq. $1$) is exactly zero. 

To see how these macroparticles should induce current densities in our algorithm to exactly satisfy the charge conservation, i.e., $\nabla\cdot\bm{E} = 4\pi \rho$, we differentiate the latter equation in time, substituting $f_s$ from $(3)$, to get the following:

$$
\nabla\cdot\left(
  \frac{\partial\bm{E}}{\partial t}
\right)= -4\pi\nabla\cdot\bm{J}= 4\pi \sum\limits_s q_s\sum\limits_i w_i^s \frac{\partial S(\bm{x}-\bm{x}_i^s(t))}{\partial t},
$$

meaning that the divergence of the deposited current density has to satisfy

\begin{equation}
\nabla\cdot\bm{J}= -\sum\limits_s q_s\sum\limits_i w_i^s \frac{\partial S(\bm{x}-\bm{x}_i^s(t))}{\partial t}.
\end{equation}

## Discretization

Having the system of equations on macroparticles defined in $(5)$, and with the equations for the electromagnetic fields $(2)$ and the current density constrained by $(6)$, we can proceed to formulate the particle-in-cell numerical scheme. 

First, we discretize the electromagnetic fields and the current densities following the [Yee staggering convention](https://en.wikipedia.org/wiki/Finite-difference_time-domain_method#FDTD_models_and_methods). According to that, the $(i,j,k)$ element of each of the field components is defined in slightly different spatial locations:

\begin{align*}
& E_x^{i+1/2,j,k}~~~&~~~& E_y^{i,j+1/2,k}~~~&~~~& E_z^{i,j,k+1/2}\\
& B_x^{i,j+1/2,k+1/2}~~~&~~~& B_y^{i+1/2,j,k+1/2}~~~&~~~& B_z^{i+1/2,j+1/2,k}\\
& J_x^{i+1/2,j,k}~~~&~~~& J_y^{i,j+1/2,k}~~~&~~~& J_z^{i,j,k+1/2}
\end{align*}

Here we use Cartesian coordinates, but this convention naturally translates to any other coordinate system.

!!! hint "Why Yee?"

    The reason behind adopting this counter-intuitive convention has to do with the finite-differencing in Maxwell's equations. In particular, if we look at the $x$ component of the Ampere's law, the term $\partial E_x/\partial t$ is coaligned with the position of $E_x$ (in our case, $i+1/2,j,k$). Terms in the curl, on the other hand, have a form: $\partial B_z/\partial y - \partial B_y/\partial z$. If we attempt to discretize the first term, assuming that $B_z$ is defined at some location $(*,j',*)$, we will get:

    $$
    \frac{B_z^{*,j',*}-B_z^{*,j'-1,*}}{\Delta y} = \left(\frac{\partial B_z}{\partial y}\right)^{*,j'-1/2,*}
    $$

    We must thus adopt $j'-1/2 = j$, or $j' = j+1/2$. Likewise, all the other components can also be inferred. In other words, the choice is dictated by the requirement that the left-hand-side of Faraday's and Ampere's laws be co-aligned with the right-hand-side written in the finite difference form.

Time in PIC is also discretized (we typically use the index $n$ to indicate the timestep). In our particular case, for the forward-integration we employ the so-called [leapfrog algorithm](https://en.wikipedia.org/wiki/Leapfrog_integration), where the electric and magnetic fields are defined to be staggered with respect to each other by half a timestep (defined to be $\Delta t$). In other words, we have $\bm{E}^{(n)}$, and $\bm{B}^{(n-1/2)}$. 

Coordinates and velocities of macroparticles are tracked separately and have continuous values at each discrete timestep. We use the same leapfrog algorithm for integrating particle equations of motion defined in $(5)$, and thus the velocities and coordinates are staggered with respect to each other in time: $\bm{x}_i^{(n)}$, and $\bm{u}_i^{(n-1/2)}$.

There are two ingredients which were left out in this picture: interpolation of the electromagnetic force from the grid to the position of the particle (required by the second equation in eq. $(5)$), and the deposition of currents on the discretized grid, which have to satisfy the requirement in $(6)$ to conserve charge. For both of these issues, we first need to make a choice of the shape function, $S(\bm{x})$. By far the most common choice is the first-order (linear) shape, defined as:

\begin{align*}
S(\bm{x}) = \begin{cases}
1 - \frac{|x|\cdot|y|\cdot|z|}{\Delta x\Delta y\Delta z},~~~&|x|<\Delta x,~|y|<\Delta y,~|z|<\Delta z \\
0,~&\textrm{otherwise}
\end{cases}
\end{align*}

Using this definition, the integral in $(5)$ is simply a linear interpolation of each field component from each corresponding location to the position of the particle.

Current deposition is slightly trickier, and we will not go through the entire derivation of the algorithm (for the reference, see [Esirkepov 2001](https://ui.adsabs.harvard.edu/abs/2001CoPhC.135..144E/abstract) or [Umeda+ 2003](https://ui.adsabs.harvard.edu/abs/2003CoPhC.156...73U/abstract)). However, it can be shown mathematically, that asserting specific properties for the shape function (e.g., symmetry in all directions, etc.), there exists a unique set of coefficients to translate the shape function of each particle at timesteps $(n)$ and $(n+1)$ to the deposited current components. 

Finally, the full timestepping algorithm with everything discussed above is shown on the page of this wiki about the [PIC algorithm](../../numerics/pic.md#special-relativistic-pic).