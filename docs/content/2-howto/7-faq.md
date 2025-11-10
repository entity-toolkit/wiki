---
hide:
  - footer
---

# F.A.Q.

!!! abstract "tl;dr"

    Here we collect the most frequent questions that might occur. Please, make sure to inspect this section before filing a GitHub issue.

## Code usage

!!! faq "I want to have a custom boundary/injection/driving/distribution function/output."
    
    All of that *can* be done via the tools provided by the problem generator. Please inspect carefully the [section dedicated to that](../2-howto/1-problem_generators.md). Also have a look at the set of officially supported problem generators some of which might implement a variation of what your original intent is.

## Technical


!!! faq "Running in a `docker` container with an AMD card"

    AMD has a vary [brief documentation](https://rocm.docs.amd.com/projects/install-on-linux/en/latest/how-to/docker.html) on the topic. In theory the `docker` containers that come with the code should work. Just make sure you have the proper groups (`render` and `video`) defined and added to the current user. If it complains about access to `/dev/kfd`, You might have to run docker as a root.


!!! faq "Compilation errors"
    
    Before merging with the released stable version, the code is tested on CUDA and HIP GPU compilers, as well as few version of CPU compilers (GCC 9...11, and LLVM 13...17). If you are encountering compiler errors on GPUs, first thing to check is whether the compilers are set up properly (i.e., whether CMake indeed captures the right compilers). Here are a few tips:

    - CUDA @ NVIDIA GPUs: make sure you have a version of `gcc` which is supported by the version of CUDA you are using; check out [this unofficial compatibility matrix](https://gist.github.com/ax3l/9489132#nvcc). In particular, Intel compilers are not very compatible with CUDA, and it is recommended to use `gcc` instead (you won't gain much by using Intel anyway, since CUDA will be doing the heavy-lifting).
  
    - HIP/ROCm @ AMD GPUs: ROCm library is a headache. The documentation is even more so. We have a [dedicated section](../1-getting-started/1-compile-run.md#hiprocm-amd-gpus) specifically discussing compilation with HIP. Make sure to check it before opening an issue.


!!! faq "If the code gives an error, how do I know whether the problem is with the Entity itself or with the other libraries it depends on (e.g., `Kokkos`, `ADIOS2`, `MPI`)?"
  
    One good way of narrowing the problem down, is to run the so-called minimal examples, provided in the directory called `minimal/` in the source. It has detailed instructions on how to compile these examples, and should hopefully be able to verify whether all the installed dependencies work as expected, before looking for an issue in the Entity itself. 

    Another good way is to compile the code with `-D TESTS=ON` flag, which will compile all the unit tests, and you can [run them one-by-one](../1-getting-started/1-compile-run.md#testing). You may also compile the tests also with various flags, e.g., `-D mpi=ON`, `-D output=ON`, `-D precision=double`.
