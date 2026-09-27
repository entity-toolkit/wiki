---
hide:
  - footer
---

# Compiling/running

First, make sure you have all [the necessary dependencies](2-dependencies.md) installed (`Kokkos` and `ADIOS2` can be built in-tree with the code, so no additional configuration necessary).

## Configuring & compiling

1. _Clone_ the repository with the following command:
  ```shell
  git clone --recursive https://github.com/entity-toolkit/entity.git
  ```
  
    !!! note
      
        For developers with write access, it is highly recommended to use `ssh` for cloning the repository: 
        ```shell
        git clone --recursive git@github.com:entity-toolkit/entity.git
        ```
        If you have not set up your github `ssh` yet, please follow the instructions [here](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent). Alternatively, you can clone the repository with `https` as shown above.

1. _Configure_ the code from the root directory using `cmake`, e.g.:
  ```sh
  # from the root of the repository
  cmake -B build -D pgen=<PROBLEM_GENERATOR> -D Kokkos_ENABLE_CUDA=ON <...>
  ```

    Problem generators can either be one of the default ones, located in the `pgens/` directory (e.g., `-D pgen=reconnection`), or alternatively you may pass a path to any directory containing your problem generator `pgen.hpp` (either relative or absolute path).

    All the build options are specified using the `-D` flag followed by the argument and its value (as shown above). Boolean options are specified as `ON` or `OFF`. The following are all the options that can be specified:

    | Option | Description | Values | Default | Prerequisite |
    | --- | --- | --- | --- | --- |
    | `pgen` | problem generator | e.g., see `pgens/` directory |  |  |
    | `pgens` <br><span class="since-version">1.4.0</span> | multiple problem generators | same as above, semicolon-separated |  |  |
    | `precision` | floating point precision | `single`, `double` | `single` |  |
    | `deposit` <br><a href="https://github.com/entity-toolkit/entity/pull/109"> <span class="since-version">1.3.0</span>  </a>  | choose current deposit scheme for PIC | `zigzag`, `esirkepov` | `zigzag` |  |
    | `shape_order` <br><a href="https://github.com/entity-toolkit/entity/pull/109"> <span class="since-version">1.3.0</span>  </a>  | interpolation order for deposit and pusher | `1-11` | `1` | hybrid engine, or PIC with Esirkepov deposit |
    | `output` | enable output | `ON`, `OFF` | `ON` |  |
    | `vendor_sort` <br><a href="https://github.com/entity-toolkit/entity/pull/209"> <span class="since-version">1.5.0</span>  </a> | use vendor-specific sorting algorithm instead of built-in Kokkos | `ON`, `OFF` | `ON` |  |
    | `mpi` | enable multi-node support | `ON`, `OFF` | `OFF` |  |
    | `gpu_aware_mpi` <br><a href="https://github.com/entity-toolkit/entity/pull/105"> <span class="since-version">1.2.0</span>  </a>  | enable GPU-aware MPI communications | `ON`, `OFF` | `ON` | `mpi=ON` |
    | `tiled_deposit` <br><a href="https://github.com/entity-toolkit/entity/pull/209"> <span class="since-version">1.5.0</span>  </a> | enable team-based tiled deposition  | `ON`, `OFF` | `OFF` |
    | `tiled_deposit_tile_size` <br><a href="https://github.com/entity-toolkit/entity/pull/209"> <span class="since-version">1.5.0</span>  </a> | tile edge length in cells for the tiled deposition | 4, 6, 8, 10, 12, 14, 16 | 8 | `tiled_deposit=ON` |
    | `tiled_deposit_drift` <br><a href="https://github.com/entity-toolkit/entity/pull/209"> <span class="since-version">1.5.0</span>  </a>  | cells of drift the scratch tile deposition halo absorbs | integer | 1 | `tiled_deposit=ON` |
    | `DEBUG` | enable debug mode | `ON`, `OFF` | `OFF` |  |
    | `TESTS` | compile the unit tests | `ON`, `OFF` | `OFF` |  |
    | `OFFLINE` | skip the online check for dependencies (forces use of submodules) | `ON`, `OFF` | `OFF` |

    Optionally, when compiling the Kokkos/ADIOS2 in-tree, there are some CMake and other library-specific options (for [Kokkos](https://kokkos.github.io/kokkos-core-wiki/keywords.html) and [ADIOS2](https://adios2.readthedocs.io/en/latest/setting_up/setting_up.html#cmake-options)) that can be specified along with the above ones. While the code picks most of these options for the end-user, some of them can/should be specified manually. In particular:

    | Option | Description | Values | Default |
    | --- | --- | --- | --- |
    | `Kokkos_ENABLE_CUDA` | enable CUDA | `ON`, `OFF` | `OFF` |
    | `Kokkos_ENABLE_HIP` | enable HIP | `ON`, `OFF` | `OFF` |
    | `Kokkos_ENABLE_SYCL` | enable SYCL | `ON`, `OFF` | `OFF` |
    | `Kokkos_ENABLE_OPENMP` | enable OpenMP | `ON`, `OFF` | `OFF` |
    | `Kokkos_ARCH_***` | use particular CPU/GPU architecture | see [Kokkos documentation](https://kokkos.github.io/kokkos-core-wiki/keywords.html#architecture-keywords) | `Kokkos` attempts to determine automatically |

    When using an external Kokkos/ADIOS2, these flags are not needed.


    !!! note
        
        When simply compiling with `-D Kokkos_ENABLE_CUDA=ON` or `_HIP=ON` without additional flags, `CMake` will try to deduce the GPU architecture based on the machine you are compiling on. Oftentimes this might not be the same as the architecture of the machine you are planning to run on (and sometimes the former might lack GPU altogether). To be more explicit, you can specify the GPU architecture manually using the `-D Kokkos_ARCH_***=ON` flags. For example, to explicitly compile for `A100` GPUs, you can use `-D Kokkos_ARCH_AMPERE80=ON`. For `V100` -- use `-D Kokkos_ARCH_VOLTA70=ON`.


1. After the `cmake` is done configuring the code, a directory named `build` will be created in the root directory. You can now compile the code by running:
  ```sh
  cmake --build build -j $(nproc)
  ```
  
1. After the compilation is done, you will find the executable called `entity.xc` in the `./build/src/` directory. That's it! You can now finally _run_ the code.

1. You may also "install" the executable in a specific direction (by default, it would be `<CMAKE_INSTALL_PREFIX>/bin`, which can be overriden using the `-D CMAKE_INSTALL_PREFIX` flag) by running `cmake --install build` after the compilation is done.

## Running

You can run the code with the following command:

```sh
/path/to/entity.xc -input /path/to/input_file.toml
```
`entity.xc` runs headlessly, producing several diagnostic outputs. `.info` file contains the general information about the simulation including all the parameters used, the compiler version, the architecture, etc. `.log` file contains timestamps of each simulation substep and is mainly used for debugging purposes. In case the simulation fails or throws warnings, an `.err` file will be generated, containing the error message. The simulation also dumps a live stdout report after each successfull simulation step (with an interval controlled via the input parameter `diagnostics.interval`), which contains information about the time spent on each simulation substep, the number of active particles, and the estimated time for completion

## Testing

<span class="since-version">1.0.0</span>

To compile the unit tests, you need to specify the `-D TESTS=ON` flag when configuring the code with `cmake`. After the code is compiled, you can run the tests with the following command:
```shell
ctest --test-dir build/
```

You may also specify the `--output-on-failure` flag to see the output of the tests that failed.

To run only specific tests, you can use the `-R` flag followed by the regular expression that matches the test name. For example, to run all the tests that contain the word `particle`, you can use:
```shell
ctest --test-dir build/ -R particle
```

