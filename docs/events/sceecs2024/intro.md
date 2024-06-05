---
hide:
  - footer
---

Our goal in this section will be to derive an equation which could describe an evolution of a collection of charged particles in self-induced eletric and magnetic fields. At the beginning, we make no simplifying assumptions, but, as we will see further, given the long-range nature of the interaction, we will have to sacrifice generality to make the equations tractable.

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