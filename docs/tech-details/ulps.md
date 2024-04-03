---
hide:
  - footer
---

!!! tip "tl;dr"

    We use simplified floating-point (both single and double precision) comparison method in the code, which does not guarantee equality up to a single bit, but is good-enough for most practical purposes.
    

# Truncation error

Comparing floating-point numbers is [tricky](https://codingnest.com/the-little-things-comparing-floating-point-numbers/). In IEEE-754-compatible C++ compilers, floating point numbers are represented with 32 (`float`) or 64 (`double`) bits. In this representation, the first bit (or the last, depending on who you ask) is reserved for the sign, 8 (11) bits are reserved for the exponent in single (double) precision, and the remaining 23 (52) bits are reserved for the mantissa. For instance, below is the [representation](https://baseconvert.com/ieee-754-floating-point) of $-2^{-5}$ in single and double precision (notice, the mantissa digits are exactly zero, as we are consider an exact power of $2$):

$$
-2^{-5}\equiv -0.03125 = \overbrace{\underbrace{1}_{\text{sign}}~\underbrace{01111010}_{\text{exponent}}~\underbrace{00000000000000000000000}_{\text{mantissa}}}^{\text{single precision representation}}
$$

$$
-2^{-5}\equiv -0.03125 = \overbrace{\underbrace{1}_{\text{sign}}~\underbrace{01111111010}_{\text{exponent}}~\underbrace{0000000000000000000000000000000000000000000000000000}_{\text{mantissa}}}^{\text{double precision representation}}
$$

Of course, for an arbitrary decimal number, because we only have so many bits to represent it, the representation will be truncated. For instance, in single precision $0.2 = 0~01111100~10011001100110011001101$ (in theory, the pattern of $0011$ is repeating to infinity, just like $1/33 = 0.03030303...$ in decimal representation).

Because of this truncation, two different real numbers can have identical bit representations. At the same time, the same real number arithmetically computed in two different ways can have slightly different bit representations. So practically, any comparison of floating-point numbers is not mathematically exact. In other words, for any two real numbers, one cannot write a function $f$ with a finite precision to guarantee that $f(a,~b) = \textrm{false}$ if and only if $a\ne b$; there will always be false-positives, $f(1,~1+10^{-8})=\textrm{true}$, and false-negatives, $f(0.3,0.1+0.2) =\textrm{false}$.

!!! warning "Comparing with the equality sign `a == b`"

    Default equality operator in C++, `==`, compares the values bit-by-bit, so if any of the bits differs (even though the numbers might be very close arithmetically), it will return a `false`. For instance, this expression, `0.1f + 0.1f + 0.1f + 0.1f + 0.1f + 0.1f + 0.1f == 0.7f`, evaluates to `false`. Looking at their bitwise representation:
    ```text
    0 01111110 01100110011001100110100 <- 0.1f + 0.1f + 0.1f + 0.1f + 0.1f + 0.1f + 0.1f
    0 01111110 01100110011001100110011 <- 0.7f
    ```
    we see that they are indeed different, albeit very close.

# Unit in the last place (ULP)

The most rigorous way to compare floating-point numbers in this context is to estimate their so-called ULP-distance ([unit in the last place](https://en.wikipedia.org/wiki/Unit_in_the_last_place)). If we picture the real number line as a continuum, with the truncated floating-point representation we can only express a finite set of the real numbers; we call these numbers float-representable. Let's consider an example. Below is the real number line, where we tag only the single precision floating-representable numbers between `1.0f` and `1.0f + 3e-7f`:

<div id="plotulps0"></div>

We see that between the numbers `1.0f` and `1.0f + 3e-7f` there are only $2$ distinct float-representable numbers. The ULP distance between these two numbers is, thus, $3$, or $\textrm{ULPd}_{32}(1, 1.0000003) = 3$ (the subscript $32$ denotes the single precision). So given this, technically, two real numbers, $a$ and $b$, are "equal" from the 32-bit floating-representation point of view, only if $\textrm{ULPd}_{32}(a, b) = 0$.

!!! note "ULP of a real number"

    Notice, that we talked about the distance between two numbers. But a more common definition invokes a ULP of a single real number. For example, consider $\pi$. Let us choose two exactly float-representable real values, $\pi_1$ and $\pi_2$, such that $\pi_1 < \pi < \pi_2$, and $\textrm{ULPd}_{32}(\pi_1,\pi_2)=1$. This means that the ULP value of $\pi$ is $\textrm{ULP}_{32}(\pi) = \pi_2 - \pi_1 = 2^{-22}\approx 2.4\cdot 10^{-7}$.

In practice, of course, especially when dealing transcendental functions and numbers, it is [theoretically impossible](https://en.wikipedia.org/wiki/Rounding#Table-maker's_dilemma) to guarantee that the result of a computation is within a certain ULP-distance from the true value. The best-practice is to allow on average between $0.5$ and $1$ ULP error margin. 

# Floating-point comparison

## The correct way

More often, instead of comparing the numerical values with the "real" ones, we need to compare them with other numerical values: e.g., compare the energy of the system at the beginning of the simulation with its energy at the end. Since C++11, the compilers [provide a function](https://en.cppreference.com/w/cpp/types/numeric_limits/epsilon) `std::numeric_limits<T>::epsilon()` that returns the ULP distance between $a$ and the next float-representable number, where $a\in [1;2)$. For instance, `std::numeric_limits<float>::epsilon()` returns $\varepsilon_{32}\equiv 2^{-23}$, which is the ULP distance between $1$ and $1 + \varepsilon_{32}\approx 1 + 1.2\cdot 10^{-7}$. So for any given pair of numbers $a$ and $b$ in the $[1;2)$ interval, these two numbers are single-precision-float-equal within $1$ ULP if $|a-b|<=\varepsilon_{32}$. We can also generalize this to the numbers in an arbitrary interval by bringing them to the same exponent, to get the following equality condition:

```c++
#include <cmath>
#include <limits>
template <class T> auto equal_within_1ulp(T a, T b) -> bool {
  const T m = std::min(std::fabs(a), std::fabs(b));
  const int exp = m < std::numeric_limits<T>::min()
                      ? std::numeric_limits<T>::min_exponent - 1
                      : std::ilogb(m);
  return std::fabs(b - a) <= std::ldexp(std::numeric_limits<T>::epsilon(), exp);
}
```

Then `equal_within_1ulp(1.0f, 1.0f + 1e-7f)` evaluates to `false`, while `equal_within_1ulp(1.0f, 1.0f + 1e-8f)` evaluates to `true`. Evaluating this function can become computationally expensive, and besides that, it relies on the `std::` library functions, some of which are not portable on GPUs. So, in practice, we often use a simpler comparison method.

## The simpler way

In the code, we use a simpler comparison method, which does not guarantee equality up to $1$ ULP, but is nonetheless accurate enough for most practical purposes. Instead of directly renormalizing the exponents of each of the numbers, we simply evaluate the relative difference of the two numbers and compare it against the epsilon for the given type:

```c++
#include <cmath>
#include <limits>
#include <type_traits>

template <typename T>
inline constexpr auto epsilon = std::numeric_limits<T>::epsilon();

template <class T> 
auto AlmostEqual(T a, T b, T eps = epsilon<T>) -> bool {
  static_assert(std::is_floating_point_v<T>, "T must be a floating point type");
  return (a == b) ||
         (std::fabs(a - b) <= std::min(std::fabs(a), std::fabs(b)) * eps);
}
```

For instance, one false-positive this method yields is `AlmostEqual(1e7f + 1.0f, 9999999.0f + 1.0f)`, which evaluates to `true`, whereas `equal_within_1ulp(1e7f + 1.0f, 9999999.0f + 1.0f)` evaluates to `false`. Despite that, in most of the scenarios, even this might be an overkill, so we even provide an optional `eps` parameter to control the base-10 precision of the comparison. Additionally, to compare numbers with zero, we provide a separate function:

```c++
template <class T>
auto AlmostZero(T a, T eps = epsilon<T>) -> bool {
  static_assert(std::is_floating_point_v<T>, "T must be a floating point type");
  return std::fabs(a) <= eps;
}
```

!!! warning "Comparison of the difference with zero"

    Never compare the difference of two floating-point numbers with zero, e.g., `AlmostZero(a - b)`, as this may yield incorrect results. Instead, use the `AlmostEqual(a, b)` function.