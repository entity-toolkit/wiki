---
hide:
  - footer
---

!!! abstract "tl;dr"

    Our goal in this section be to derive an equation which could describe an evolution of a collection of charged particles in self-induced eletric and magnetic fields. Ultimately, since we will want to solve this partial differential equation on the computer, we will construct an algorithm relying on the method of characteristics which approximates the exact solution, when the number of integrated characteristics (macroparticles) tends to infinity.

At the beginning, we make no simplifying assumptions, but, as we will see further, given the long-range nature of the interaction, we will have to sacrifice generality to make the equations tractable.

Clasically, there are two equivalent approaches to this problem. Below, we consider both of them, which hopefully will help highlight different aspects of the resulting equation as well as the assumptions made.

## Klimontovich equation & ensemble average

We start with a distribution function for a collection of charged particles of species $s$ with charge $q_s$ and mass $m_s$ in the phase space $(\bm{x},\bm{u})$, with $\bm{u}$ being the relativistic four-velocity:

\begin{equation}
N_s(\bm{x},\bm{u},t) = \sum\limits_i \delta(\bm{x}-\bm{x}_i^s(t))\delta(\bm{u}-\bm{u}_i^s(t)),
\end{equation}

where $\bm{x}_i^s(t)$ and $\bm{u}_i^s(t)$ are the positions and four-velocities of all the particles of species $s$. We can then take the derivative of this equation in time to get an equation for the evolution of $N_s$:

\begin{align*}
\frac{\partial }{\partial t}N_s(\bm{x},\bm{u},t) &= \sum\limits_i \frac{\partial}{\partial t}
\left[
  \delta(\bm{x}-\bm{x}_i^s)\delta(\bm{u}-\bm{u}_i^s)
\right]=\\
&=\sum\limits_i 
\left[
  \delta(\bm{x}-\bm{x}_i^s) \frac{\partial}{\partial t} \delta(\bm{u}-\bm{u}_i^s) + 
  \delta(\bm{u}-\bm{u}_i^s) \frac{\partial}{\partial t} \delta(\bm{x}-\bm{x}_i^s)
\right]=\\
& \left|~\frac{\partial}{\partial t} \delta (\bm{a}-\bm{a}_i^s)\equiv -\frac{d\bm{a}_i^s}{dt}\frac{\partial}{\partial\bm{a}}\delta(\bm{a}-\bm{a}_i^s) ~\right| \\
&= -\sum\limits_i \left[
  \delta(\bm{x}-\bm{x}_i^s)\frac{d \bm{u}_i^s}{dt}\cdot\frac{\partial}{\partial \bm{u}}\delta(\bm{u}-\bm{u}_i^s)+
  \delta(\bm{u}-\bm{u}_i^s)\frac{d \bm{x}_i^s}{dt}\cdot\frac{\partial}{\partial \bm{x}}\delta(\bm{x}-\bm{x}_i^s)
\right]=\\
&\left|~
\frac{d\bm{u}_i^s}{dt} = \frac{1}{m_s}\bm{F}_s^N(\bm{x}_i^s,~\bm{u}_i^s),~~
\frac{d\bm{x}_i^s}{dt} = \frac{\bm{u}_i^s}{\gamma_i^s}
~\right|\\
&\left|~
f(\bm{a}_i^s,~\bm{b}_i^s)\delta(\bm{a}-\bm{a}_i^s)\frac{\partial}{\partial \bm{b}}\delta(\bm{b}-\bm{b}_i^s) = f(\bm{a},~\bm{b})\frac{\partial}{\partial \bm{b}}
\left[
  \delta(\bm{a}-\bm{a}_i^s)\delta(\bm{b}-\bm{b}_i^s)
\right],~\textrm{if}~
\frac{\partial}{\partial \bm{b}}f(\bm{a},~\bm{b})=0
~\right|\\
&= -\sum\limits_i \left[
  \frac{\bm{u}}{\gamma}\cdot\frac{\partial}{\partial \bm{x}}\left[\delta(\bm{x}-\bm{x}_i^s)\delta(\bm{u}-\bm{u}_i^s)\right]+
  \frac{\bm{F}_s^N(\bm{x},~\bm{u})}{m_s}\cdot\frac{\partial}{\partial \bm{u}}\left[\delta(\bm{x}-\bm{x}_i^s)\delta(\bm{u}-\bm{u}_i^s)\right]
\right].
\end{align*}

We can now use the definition $(1)$ to finally write:

\begin{equation}
\frac{\partial N_s}{\partial t}+\frac{\bm{u}}{\gamma}\cdot\frac{\partial N_s}{\partial \bm{x}} + \frac{\bm{F}_s^N}{m_s}\cdot \frac{\partial N_s}{\partial \bm{u}} = 0,
\end{equation}

(the non-relativistic version of) which was first obtained by [Yu. L. Klimontovich in 1958](http://jetp.ras.ru/cgi-bin/dn/e_007_01_0119.pdf). Here $\gamma \equiv \sqrt{1+|\bm{u}|^2}$. For a typical plasma with no additional interactions from outside, $\bm{F}_s$ is the Lorentz force from self-induced electromagnetic fields:

$$
\bm{F}_s^N = q_s\left(\bm{E}^N + \frac{\bm{u}}{\gamma}\times \bm{B}^N\right),
$$

where the hyperbolic Maxwell's equations are implied:

\begin{align*}
& \frac{\partial \bm{E}^N}{c\partial t} = \nabla\times \bm{B}^N - \frac{4\pi}{c}\sum\limits_s \frac{q_s}{V}\int \frac{\bm{u}'}{\gamma'} N_s\left(\bm{x}',~\bm{u}'\right) d^3\bm{x}'d^3\bm{u}',\\
& \frac{\partial \bm{B}^N}{c\partial t} = -\nabla\times\bm{E}^N,
\end{align*}

with $V=\int d^3\bm{x}'d^3\bm{u}'$, and the other two equations serving as "boundary conditions"

\begin{align*}
& \nabla\cdot\bm{E}^N = 4\pi \sum\limits_s \frac{q_s}{V}\int N_s d^3\bm{x}'d^3\bm{u}',\\
& \nabla\cdot\bm{B}^N=0.
\end{align*}

The superscript "$N$" here implies that the fields are generated from the full distribution function $N_s$.

Notice, that in deriving eq. $(2)$, we made no assumptions about the strengths of interactions of plasma particles with each other, or the scales of gradients of the fields. In other words, Klimontovich's equation (coupled with Maxwell's equations above) is the most general way of describing the plasmas without the loss of generality.

The function $N_s$ still has $6N$ unknowns (where $N$ is the number of plasma particles), and is, in general, not very useful for studying the behavior of plasmas. To advance further, we consider an ensemble of microstates defined by $N$ positions and velocities of particles, $\bm{x}_i^s$ and $\bm{u}_i^s$. We further define a special function, $f_s(\bm{x},~\bm{u})\equiv \langle N_s(\bm{x},~\bm{u}) \rangle$, where from now on we will assume $\langle\cdot\rangle$ to be an ensemble average. Notice, that by doing so, the function $f_s$ loses any information about each individual particle, becoming essentially a continuous function of two phase-space variables.

In each microscopic realization, the function $N_s$ can deviate from the ensemble average, which we conveniently denote as $\delta N_s \equiv N_s - f_s$. Similarly, we may also define $\bm{E}\equiv\langle\bm{E}^N\rangle$, $\bm{B} \equiv \langle\bm{B}^N\rangle$, and $\delta \bm{E}^N\equiv\bm{E}^N-\bm{E}$, $\delta \bm{B}^N \equiv \bm{B}^N - \bm{B}$. 

!!! note

      Note that by definition, $\langle\delta N_s\rangle = 0$, $\langle\delta \bm{E}^N\rangle = 0$, $\langle\delta \bm{B}^N\rangle = 0$.

Plugging $N_s=f_s+\delta N_s$, $\bm{F}^N_s=\bm{F}_s+\delta\bm{F}_s^N$ into equation $(2)$, and ensemble averaging the result, we find:

\begin{equation}
\frac{\partial f_s}{\partial t} + \frac{\bm{u}}{\gamma}\cdot \frac{\partial f_s}{\partial\bm{x}} + \frac{\bm{F}_s}{m_s}\cdot\frac{\partial f_s}{\partial \bm{u}} = -\left\langle\frac{\delta \bm{F}_s^N}{m_s}\cdot\frac{\partial\delta N_s}{\partial \bm{u}}\right\rangle
\end{equation}

The left-hand-side of this equation is the advective derivative of $f_s$ in phase-space. The non-conservation of the phase-space volume is thus governed solely by the right-hand-side. Ultimately, the right-hand-side contains terms proportional to $\left\langle\delta N_s(\bm{x}',~\bm{u}')\delta N_s(\bm{x}'',~\bm{u}'') \right\rangle$, which is also referred to as the correlation function. This term describes non-linear correlations of the fluctuations of $N_s$ in two different locations of the phase-space. When the fluctuations from the ensemble average are completely decorelated (independent), this term becomes zero, and we obtain the famous [Vlasov equation](https://iopscience.iop.org/article/10.1070/PU1968v010n06ABEH003709):

\begin{equation}
  \frac{\partial f_s}{\partial t} + \frac{\bm{u}}{\gamma}\cdot \frac{\partial f_s}{\partial\bm{x}} + \frac{\bm{F}_s}{m_s}\cdot\frac{\partial f_s}{\partial \bm{u}} = 0.
\end{equation}

In which case can one assume that fluctuations are decorelated? If the evolution of each particle is solely governed by the ensemble averaged quantities (i.e., smooth electromagnetic fields), and (on average) does not depend on the particular realizations of the thermodynamic microstate, then all the non-linear terms must vanish, when ensemble averaged. This may not hold if, for instance, particles actively experience dynamically important close encounters with each other (Coulomb collisions), in which case their evolutions are no longer solely governed by the smooth average forces. For this reason, the right-hand-side of the eq. $(3)$ is often referred to as the collisional (Landau) integral.

## Liouville equation & BBGKY hierarchy

Instead of thinking of a collection of particles with predefined coordinates in phase-space in the microstate, one can also think of the whole system as a random realization one such microstate. Then we can write down a probability distribution function of the system of $6N$ variables in the following form:

\begin{equation}
f_N(\bm{x}_1,...,\bm{x}_N,~\bm{u}_1,...,\bm{u}_N,~t) = \prod\limits_k^N \delta(\bm{x}-\bm{X}_k(t))\delta(\bm{u}_k-\bm{U}_k(t)),
\end{equation}

where $\bm{X}_k(t)$ and $\bm{U}_k(t)$ are the actual coordinates of the particles in phase-space implicitly depending on time (we drop the species index for brevity). To derive the time evolution of such a system, we differentiate $f_N$ w.r.t. time:

$$
\frac{\partial f_N}{\partial t} = \prod\limits_k^N
\left[
  \sum\limits_i^N\left(
    -\frac{d\bm{X}_i}{dt}\frac{\partial}{\partial\bm{x}_i}-\frac{d\bm{U}_i}{dt}\frac{\partial}{\partial\bm{u}_i}
  \right)
\right]
\delta(\bm{x}_i-\bm{X}_k(t))\delta(\bm{u}_k-\bm{U}_k(t)).
$$

Using the properties of a delta function, and assuming that $\dot{\bm{X}}_k = \bm{U}_k/\Gamma_k$ (with $\Gamma_k\equiv \sqrt{1+|\bm{U}_k|^2}$), and $\dot{\bm{U}}_k = (1/m_k)\sum\limits_l \bm{F}_{l\to k}$, with the latter expression defining the force from particle with index $l$ to particle with index $k$. Plugging the expression $(5)$ back into this equation, we get:

\begin{equation}
\frac{\partial f_N}{\partial t} + 
\sum\limits_k^N
\left(
  \frac{\bm{u}_k}{\gamma_k}\cdot\frac{\partial f_N}{\partial \bm{x}_k}
\right) + 
\sum\limits_k^N
\left(
  \sum\limits_l^N
  \frac{\bm{F}_{l\to k}}{m_k}\cdot 
  \frac{\partial f_N}{\partial \bm{u}_k}
\right)=0
\end{equation}

As with the Klimontovich equation before, here we have not yet made any simplifying assumptions, and eq. $(6)$ describes the evolution of the combined probability density function, $f_N$, of $N$ particles in the $6N$-dimensional phase-space in its most general form. 

In practice, most of the time we are not interested in the exact behavior of each individual particle, as for all practicle purposes they are indistinguishable. It is thus helpful to introduce the reduced probability distribution of $M<N$ particles as follows:

\begin{equation}
f_M(\bm{x}_1,...,\bm{x}_M,~\bm{u}_1,...,\bm{u}_M,~t) \equiv \mathcal{V}^{-1}
\int 
f_N(\bm{x}_1,...,\bm{x}_N',~\bm{u}_1,...,\bm{u}_N',~t)
d\bm{x}_{M+1}' d\bm{u}_{M+1}'...d\bm{x}_{N}' d\bm{u}_{N}' ,
\end{equation}

In other words, in transiting from $N$-particle distribution to an $M$-particle one we "integrate away" the explicit dependency (or correlation) of the evolution of the first $M$ particles on the last $N-M$ particles. This becomes obvious, when we interate the equation $(6)$ w.r.t. $\bm{x}_N$ and $\bm{u}_N$ to get the evolution equation for the $N-1$-particle distribution:

$$
\frac{\partial f_{N-1}}{\partial t} + 
\sum\limits_k^{N-1}
\left(
  \frac{\bm{u}_k}{\gamma_k}\cdot\frac{\partial f_{N-1}}{\partial \bm{x}_k}
\right) + 
\sum\limits_k^{N-1}
\left(
  \sum\limits_l^{N-1}
  \frac{\bm{F}_{l\to k}}{m_k}\cdot 
  \frac{\partial f_{N-1}}{\partial \bm{u}_k}
  +\mathcal{V}^{-1}\int d\bm{x}_{N}'d\bm{u}_{N}'
  \frac{\bm{F}_{N\to k}}{m_k}\cdot 
  \frac{\partial f_{N}}{\partial \bm{u}_k}
\right)=0.
$$

The dependency of the evolution of the first $N-1$ particles on that of the last particle is now encoded in the last term of the equation; thus in general, the $M<N$ dimensional probability distribution function still depends on the full $N$-dimensional one:

$$
\frac{\partial f_{M}}{\partial t} + 
\sum\limits_k^{M}
\left(
  \frac{\bm{u}_k}{\gamma_k}\cdot\frac{\partial f_{M}}{\partial \bm{x}_k}
\right) + 
\sum\limits_k^{M}
\left(
  \sum\limits_l^{M}
  \frac{\bm{F}_{l\to k}}{m_k}\cdot 
  \frac{\partial f_{M}}{\partial \bm{u}_k}
  +\frac{N-M}{\mathcal{V}}\int d\bm{x}_{M+1}'d\bm{u}_{M+1}'
  \frac{\bm{F}_{M+1\to k}}{m_k}\cdot 
  \frac{\partial f_{M+1}}{\partial \bm{u}_k}
\right)=0,
$$

where it is obvious, that the evolution of $f_{M}$ also depends on the evolution of $f_{M+1}$. This is often called in the literature the BBGKY hierarchy, after Bogoliubov (1946), Born, & Green ([1946](https://royalsocietypublishing.org/doi/10.1098/rspa.1946.0093)), Kirkwood ([1946](https://pubs.aip.org/aip/jcp/article/14/3/180/191894/The-Statistical-Mechanical-Theory-of-Transport), [1947](https://pubs.aip.org/aip/jcp/article/15/1/72/360133/The-Statistical-Mechanical-Theory-of-Transport)), and Yvon (1935).

For $M=1$ we find:

$$
\frac{\partial f_1}{\partial t} + 
  \frac{\bm{u}_1}{\gamma_1}\cdot\frac{\partial f_1}{\partial \bm{x}_1} + 
  \frac{N-1}{\mathcal{V}}\int d\bm{x}_{2}'d\bm{u}_{2}'
  \frac{\bm{F}_{2\to 1}}{m_1}\cdot 
  \frac{\partial f_{2}}{\partial \bm{u}_1} = 0,
$$

where to derive the equation for a single-particle distribution we need to know the two-particle one, $f_2$. It is useful to decompose the latter into two single-particle distributions and a term describing their correlation:

$$
f_2(\bm{x}_1,\bm{x}_2,\bm{u}_1,\bm{u}_2,t) = f_1(\bm{x}_1,\bm{u}_1,t)f_1(\bm{x}_2,\bm{u}_2,t) + \delta f_{2}(\bm{x}_1,\bm{x}_2,\bm{u}_1,\bm{u}_2,t),
$$

where, just like before, the last term, $\delta f_2$ describes two-particle interactions. Likewise, we could have written the evolution equation for $f_2$, and decomposed it further into many-body interactions. For our purposes, we will limit ourselves to the evolution of one-particle distribution ignoring the two-particle correlations. Adopting $f\equiv f_1$, and plugging the $f_2$ decomposition ino the equation above (ignoring $\delta f_2$), we reproduce the previously found Vlasov equation:

$$
\frac{\partial f}{\partial t} + 
  \frac{\bm{u}}{\gamma}\cdot\frac{\partial f}{\partial \bm{x}} +
  \frac{\bm{F}}{m}\cdot 
  \frac{\partial f}{\partial \bm{u}} = 0,
$$

where $\bm{F} \equiv (N/\mathcal{V})\int d\bm{x}'d\bm{u}' \bm{F}_{2\to 1} f(\bm{x}',\bm{v}',t)$


## Deriving equations for PIC

We now derived the evolution equation for the continuous distribution describing a system of particles that do not undergo binary interactions, and only interact via collective large-scale self-induced fields:

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

forms a closed system of equations, otherwise known as the Vlasov-Maxwell system. The two boundary conditions

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

Finally, the full timestepping algorithm with everything discussed above is shown on the page of this wiki about the [PIC algorithm](../numerics/pic.md#special-relativistic-pic).