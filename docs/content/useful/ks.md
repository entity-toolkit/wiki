---
hide:
  - footer
---

# Kerr metric

!!! note

    To keep things clean we will assume $r_g \equiv GM_\bullet/c^2 = 1$ and $a\equiv J_\bullet c/(GM_\bullet^2)$. Dots "$\cdot$" will be used instead of zeros "0" for visual clarity.

## Kerr-Schild coordinates

Kerr metric in Kerr-Schild coordinates is given by the following covariant tensor (and its inverse contravariant counterpart):

$$
g_{\mu \nu}=\begin{bmatrix}-(1-z) & z & \cdot & -az\sin^2{\theta}\\z & 1+z & \cdot & -a(1+z)\sin^2{\theta} \\\cdot & \cdot & \Sigma & \cdot \\-az\sin^2{\theta} & -a(1+z)\sin^2{\theta} & \cdot & \frac{A\sin^2{\theta}}{\Sigma}\end{bmatrix}~~~
g^{\mu\nu}=\begin{bmatrix}-(1+z) & z & \cdot & \cdot\\z & \frac{\Delta}{\Sigma} & \cdot & \frac{a}{\Sigma}\\\cdot & \cdot & \frac{1}{\Sigma} & \cdot\\\cdot & \frac{a}{\Sigma} & \cdot & \frac{1}{\Sigma\sin^2{\theta}}\end{bmatrix}
$$

\begin{align*}
&\Sigma=r^2+a^2\cos^2{\theta} &
&\Delta = r^2-2r+a^2\\
&A=(r^2+a^2)^2-a^2\Delta \sin^2{\theta} &
&z=\frac{2r}{\Sigma}\\
&\sqrt{-g}=\Sigma\sin{\theta}
\end{align*}

### 3+1 formulation

To rewrite the metric in 3+1 formulation we find the lag function and the shift vector to be: 

\begin{align*}
   & \beta^i=\begin{bmatrix}\frac{z}{1+z} \\ \cdot \\ \cdot\end{bmatrix}
   & \alpha^2=\frac{1}{1+z}                                              \\
   & \beta_i=\left[z~~ \cdot~~ -az\sin^2{\theta}\right]
   & \beta_i\beta^i=\frac{z^2}{1+z}
\end{align*}

Then we find

$$
  h_{ij}=\begin{bmatrix}1+z & \cdot & -a(1+z)\sin^2{\theta} \\ \cdot & \Sigma & \cdot \\ -a(1+z)\sin^2{\theta} & \cdot & \frac{A\sin^2{\theta}}{\Sigma}\end{bmatrix}~~~
  h^{ij}=\begin{bmatrix}\frac{A}{\Sigma(\Sigma + 2r)} & \cdot & \frac{a}{\Sigma} \\ \cdot & \frac{1}{\Sigma} & \cdot \\ \frac{a}{\Sigma} & \cdot & \frac{1}{\Sigma\sin^2{\theta}}\end{bmatrix}
$$

and $\sqrt{h}=\Sigma\sin{\theta}/\alpha$.

It is also useful to define a locally orthonormal (tetrad) basis. This special frame is defined with the following vectors:

$$
  e^i_{\hat{i}}=\begin{bmatrix}\sqrt{h^{rr}}                                 & \cdot                     & \cdot                       \\
               \cdot                                         & 1/\sqrt{h_{\theta\theta}} & \cdot                       \\
               -\sqrt{h^{rr}}h_{r\varphi}/h_{\varphi\varphi} & \cdot                     & 1/\sqrt{h_{\varphi\varphi}}\end{bmatrix}~~~
  e_i^{\hat{i}}=\begin{bmatrix} 1/\sqrt{h^{rr}} & \cdot & h_{r\varphi}/\sqrt{h_{\varphi\varphi}}\\ \cdot & \sqrt{h_{\theta\theta}} &  \cdot \\ \cdot & \cdot & \sqrt{h_{\varphi\varphi}}\end{bmatrix}
$$

Transformations to and from the tetrad basis can be performed via $A^{\hat{i}}=e^{\hat{i}}_j A^j$ $A^{i}=e_{\hat{j}}^i A^{\hat{j}}$ $a_{\hat{i}}=e_{\hat{i}}^j a_{j}$ and $a_{i}=e_{i}^{\hat{j}} a_{\hat{j}}$. In the more explicit simplified form this reads:

\begin{aligned}
   & A^{\hat{r}}=\frac{1}{\sqrt{h^{rr}}}A^r                                                                 &
   & a_{\hat{r}}=\sqrt{h^{rr}}a_r-\sqrt{h^{rr}}\frac{h_{r\varphi}}{h_{\varphi\varphi}}a_\varphi               \\
   & A^{\hat{\theta}}=\sqrt{h_{\theta\theta}}A^\theta                                                       &
   & a_{\hat{\theta}}=\frac{1}{\sqrt{h_{\theta\theta}}}a_\theta                                               \\
   & A^{\hat{\varphi}}=\frac{h_{r\varphi}}{\sqrt{h_{\varphi\varphi}}}A^r+\sqrt{h_{\varphi\varphi}}A^\varphi &
   & a_{\hat{\varphi}}=\frac{1}{\sqrt{h_{\varphi\varphi}}}a_\varphi
\end{aligned}

### $a=0$ (Schwarzschild solution)

$$
  g_{\mu \nu}=\begin{bmatrix}-(1-z) & z & \cdot & \cdot\\z & 1+z & \cdot & \cdot \\\cdot & \cdot & \Sigma & \cdot \\\cdot & \cdot & \cdot & \frac{A\sin^2{\theta}}{\Sigma}\end{bmatrix}=\begin{bmatrix}-\left(1-\frac{2}{r}\right) & \frac{2}{r} & \cdot & \cdot\\\frac{2}{r} & 1 + \frac{2}{r} & \cdot & \cdot \\\cdot & \cdot & r^2 & \cdot \\\cdot & \cdot & \cdot & r^2\sin^2{\theta}\end{bmatrix}
$$

$$
  g^{\mu\nu}=\begin{bmatrix}-(1+z) & z & \cdot & \cdot\\z & \frac{\Delta}{\Sigma} & \cdot & \cdot\\\cdot & \cdot & \frac{1}{\Sigma} & \cdot\\\cdot & \cdot & \cdot & \frac{1}{\Sigma\sin^2{\theta}}\end{bmatrix}=\begin{bmatrix}-\left(1+\frac{2}{r}\right) & \frac{2}{r} & \cdot & \cdot\\\frac{2}{r} & 1-\frac{2}{r} & \cdot & \cdot \\\cdot & \cdot & \frac{1}{r^2} & \cdot \\\cdot & \cdot & \cdot & \frac{1}{r^2\sin^2{\theta}}\end{bmatrix}
$$


\begin{align*}
   & \Sigma=r^2      &
   & \Delta = r^2-2r   \\
   & A=r^4           &
   & z=\frac{2}{r}
\end{align*}

And the 3+1 components reduce to the following:

\begin{align*}
   & \beta^i=\begin{bmatrix}\frac{2}{r+2} \\ \cdot \\ \cdot\end{bmatrix} &
   & \alpha^2=\frac{r}{r+2}                                                \\
   & \beta_i=\left[2/r ~~ \cdot ~~ -2(a/r)\sin^2{\theta}\right]          &
   & \beta_i\beta^i=\frac{4}{r^2+2r}
\end{align*}

$$
  h_{ij}=\begin{bmatrix}1+\frac{2}{r} & \cdot & \cdot \\ \cdot & r^2 & \cdot \\ \cdot & \cdot & r^2\sin^2{\theta}\end{bmatrix}~~~
  h^{ij}=\begin{bmatrix}\frac{r}{r+2} & \cdot & \cdot \\ \cdot & \frac{1}{r^2} & \cdot \\ \cdot & \cdot & \frac{1}{r^2\sin^2{\theta}}\end{bmatrix}
$$

## Boyer-Lindquist coordinates


$$
  g_{\mu \nu}=\begin{bmatrix}-\left(1-\frac{2r}{\Sigma}\right) & \cdot & \cdot & -\frac{2ar\sin^2{\theta}}{\Sigma}\\ \cdot  & \frac{\Sigma}{\Delta} & \cdot & \cdot \\ \cdot  & \cdot & \Sigma & \cdot \\-\frac{2ar\sin^2{\theta}}{\Sigma} & \cdot & \cdot & \frac{A\sin^2{\theta}}{\Sigma}\end{bmatrix}~~~
  g^{\mu\nu}=\begin{bmatrix}-\frac{A}{\Delta\Sigma} & \cdot & \cdot & -\frac{2ar}{\Delta\Sigma}\\ \cdot  & \frac{\Delta}{\Sigma} & \cdot &  \cdot \\ \cdot  & \cdot & \frac{1}{\Sigma} &  \cdot \\-\frac{2ar}{\Delta\Sigma} & \cdot & \cdot & \frac{\Delta -a^2\sin^2{\theta}}{\Delta\Sigma\sin^2{\theta}}\end{bmatrix}
$$


\begin{align*}
   & \Sigma=r^2+a^2\cos^2{\theta}           &
   & \Delta = r^2-2r+a^2                      \\
   & A=(r^2+a^2)^2-a^2\Delta \sin^2{\theta}   \\
   & \sqrt{-g}=\Sigma\sin{\theta}
\end{align*}

### 3+1 formulation

\begin{align*}
   & \beta^i=\begin{bmatrix} \cdot  \\ \cdot \\ -2ar/A\end{bmatrix}       &
   & \alpha^2=\frac{\Delta \Sigma}{A}                                       \\
   & \beta_i=\left[~~ \cdot  ~~ \cdot ~~ -2ar\sin^2{\theta}/\Sigma\right] &
   & \beta_i\beta^i=\frac{4a^2r^2\sin^2{\theta}}{A}
\end{align*}

$$
  h_{ij}=\begin{bmatrix}\frac{\Sigma}{\Delta} & \cdot & \cdot \\ \cdot  & \Sigma & \cdot \\ \cdot  & \cdot & \frac{A\sin^2{\theta}}{\Sigma}\end{bmatrix}~~~
  h^{ij}=\begin{bmatrix}
    \frac{A}{\Delta\Sigma} & \cdot & \cdot \\ \cdot & \frac{1}{\Sigma} & \cdot \\ \cdot & \cdot & \frac{1}{\Sigma\sin^2{\theta}} + \frac{(4r^2-1)a^2}{\Delta\Sigma}
  \end{bmatrix}
$$

### $a=0$ (Schwarzschild solution)

$$
  g_{\mu \nu}=\begin{bmatrix}-\left(1-\frac{2}{r}\right) & \cdot                           & \cdot & \cdot              \\
               \cdot                       & \left(1-\frac{2}{r}\right)^{-1} & \cdot & \cdot              \\
               \cdot                       & \cdot                           & r^2   & \cdot              \\
               \cdot                       & \cdot                           & \cdot & r^2 \sin^2{\theta}\end{bmatrix}~~~
  g^{\mu\nu}=\begin{bmatrix}-\left(1-\frac{2}{r}\right)^{-1} & \cdot & \cdot &  \cdot \\ \cdot  & 1-\frac{2}{r} & \cdot &  \cdot \\ \cdot  & \cdot & \frac{1}{r^2} &  \cdot \\ \cdot  & \cdot & \cdot & \frac{1}{r^2\sin^2{\theta}}\end{bmatrix}
$$


\begin{align*}
   & \beta^i=\begin{bmatrix} \cdot  \\ \cdot \\ \cdot \end{bmatrix} &
   & \alpha^2=1-\frac{2}{r}                                           \\
   & \beta_i=\left[~~\cdot ~~ \cdot ~~ \cdot ~~\right]              &
   & \beta_i\beta^i=0
\end{align*}

$$
  h_{ij}=\begin{bmatrix}
    \left(1-\frac{2}{r}\right)^{-1} & \cdot & \cdot              \\
    \cdot                           & r^2   & \cdot              \\
    \cdot                           & \cdot & r^2 \sin^2{\theta}\end{bmatrix}~~~
  h^{ij}=\begin{bmatrix}1-\frac{2}{r} & \cdot &  \cdot \\ \cdot  & \frac{1}{r^2} &  \cdot \\ \cdot  & \cdot & \frac{1}{r^2\sin^2{\theta}}\end{bmatrix}
$$

## Conversion from KS to BL

Assuming $g_{\mu\nu}$ is the metric in KS coordinates, and $g_{\tilde{\mu}\tilde{\nu}}$ -- in BL.

$$
J_{\tilde{\nu}}^{\mu}=\begin{bmatrix}
1 & 2r/\Delta & \cdot& .\\ 
\cdot& 1 & \cdot& .\\ 
\cdot& \cdot& 1 & .\\ 
\cdot& a/\Delta & \cdot& 1
\end{bmatrix}~~~
J_{\nu}^{\tilde{\mu}}=\begin{bmatrix}
1 & -2r/\Delta & \cdot& .\\ 
\cdot& 1 & \cdot& .\\ 
\cdot& \cdot& 1 & .\\ 
\cdot& -a/\Delta & \cdot& 1
\end{bmatrix}
$$

\begin{align*}
& x^{\tilde{\mu}}=J^{\tilde{\mu}}_\nu x^\nu &
& x^{\mu}=J^{\mu}_{\tilde{\nu}} x^{\tilde{\nu}}\\
& x_{\tilde{\mu}}=J_{\tilde{\mu}}^{\nu} x_{\nu} &
& x_{\mu}=J_{\mu}^{\tilde{\nu}} x_{\tilde{\nu}}
\end{align*}