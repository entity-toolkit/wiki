---
hide:
  - footer
---

First, make sure you have all [the necessary dependencies](dependencies.md) installed (`Kokkos` and `ADIOS2` can be built in-tree with the code, so no additional configuration necessary).

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
  ```shell
  # from the root of the repository
  cmake -B build -D pgen=<PROBLEM_GENERATOR> -D Kokkos_ENABLE_CUDA=ON <...>
  ```
  All the build options are specified using the `-D` flag followed by the argument and its value (as shown above). Boolean options are specified as `ON` or `OFF`. The following are all the options that can be specified:

    | Option | Description | Values | Default |
    | --- | --- | --- | --- |
    | `pgen` | problem generator | see `<engine>/pgen/` directory | `dummy` |
    | `precision` | floating point precision | `single`, `double` | `single` |
    | `output` | enable output | `ON`, `OFF` | `OFF` |
    | `mpi` | enable multi-node support | `ON`, `OFF` | `OFF` |
    | `DEBUG` | enable debug mode | `ON`, `OFF` | `OFF` |
    | `TESTS` | compile the unit tests | `ON`, `OFF` | `OFF` |
    
    Additionally, there are some CMake and other library-specific options (for [Kokkos](https://kokkos.github.io/kokkos-core-wiki/keywords.html) and [ADIOS2](https://adios2.readthedocs.io/en/latest/setting_up/setting_up.html#cmake-options)) that can be specified along with the above ones. While the code picks most of these options for the end-user, some of them can/should be specified manually. In particular:

    | Option | Description | Values | Default |
    | --- | --- | --- | --- |
    | `Kokkos_ENABLE_CUDA` | enable CUDA | `ON`, `OFF` | `OFF` |
    | `Kokkos_ENABLE_OPENMP` | enable OpenMP | `ON`, `OFF` | `OFF` |
    | `Kokkos_ARCH_***` | use particular CPU/GPU architecture | see [Kokkos documentation](https://kokkos.github.io/kokkos-core-wiki/keywords.html#architecture-keywords) | `Kokkos` attempts to determine automatically |


    !!! note
        
        When simply compiling with `-D Kokkos_ENABLE_CUDA=ON` without additional flags, `CMake` will try to deduce the GPU architecture based on the machine you are compiling on. Oftentimes this might not be the same as the architecture of the machine you are planning to run on (and sometimes the former might lack GPU altogether). To be more explicit, you can specify the GPU architecture manually using the `-D Kokkos_ARCH_***=ON` flags. For example, to explicitly compile for `A100` GPUs, you can use `-D Kokkos_ARCH_AMPERE80=ON`. For `V100` -- use `-D Kokkos_ARCH_VOLTA70=ON`.


1. After `cmake` is done configuring the code, a directory named `build` will be created in the root directory. You can now compile the code by running:
  ```shell
  cmake --build build -j <NCORES>
  ```
  where `<NCORES>` is the number of cores you want to use for the compilation (if you skip the `<NCORES>` and just put `-j`, `cmake` will attempt to take as many threads as possible). Note, that the `-j` flag is optional, and if not specified, the code will compile using a single core.

1. After the compilation is done, you will find the executable called `entity.xc` in the `build/src/` directory. That's it! You can now finally _run_ the code.

## Running

You can run the code with the following command:

```shell
/path/to/entity.xc -input /path/to/input_file.toml
```
`entity.xc` runs headlessly, producing several diagnostic outputs. `.info` file contains the general information about the simulation including all the parameters used, the compiler version, the architecture, etc. `.log` file contains timestamps of each simulation substep and is mainly used for debugging purposes. In case the simulation fails or throws warnings, an `.err` file will be generated, containing the error message. The simulation also dumps a live stdout report after each successfull simulation step, which contains information about the time spent on each simulation substep, the number of active particles, and the estimated time for completion. It may look something like this:
```text
................................................................................
Step: 1260     [of 1448]
Time: 1.7401   [Δt = 0.0014]

[SUBSTEP]                  [DURATION]  [% TOT]
  Communications............314.00 µs     9.55
  CurrentDeposit............400.00 µs    12.17
  CurrentFiltering..........803.00 µs    24.43
  Custom....................929.00 µs    28.26
  FieldBoundaries.............0.00 ns     0.00
  FieldSolver...............502.00 µs    15.27
  ParticleBoundaries..........0.00 ns     0.00
  ParticlePusher............339.00 µs    10.31
Total                         3.29 ms

Particle count:                [TOT (%)]
  species 1 (e-)........2.59e+04 ( 2.6%)
  species 2 (e+)........2.59e+04 ( 2.6%)

Average timestep: 9.57 ms
Remaining time: 1.80 s
Elapsed time: 11.12 s
[■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■          ]  87.02%
................................................................................
```


<!-- To enable data dumping (output), one needs to compile with the `-D output=ON` flag. 

`entity-GUI.xc` runs the simulation together with the GUI. The simulation lives as long as the GUI window is open. Additionally, `entity-GUI.xc` also accepts the `-scale <S>` flag, where `<S>` is the scale factor for the GUI (e.g. `-scale 2` will make the GUI twice as big; this setting depends on the personal preference and the monitor DPI/resolution used).
 -->
<!-- !!! note
    
    When running the `entity-GUI.xc` on a remote machine (e.g., via a `vnc` server), one needs to run with `vglrun ./path/to/entity-GUI.xc`. This is because `entity-GUI.xc` uses OpenGL for rendering the GUI, and `vglrun` is a wrapper that enables OpenGL on a remote machine. -->
      
!!! note "For the Stellar Princeton cluster users"
    
    For convenience we provide precompiled libraries (`kokkos` and `adios2`) for the Stellar users. To use them, run the following:
    ```shell
    # this line can also be added to your ~/.bashrc or ~/.zshrc for auto loading
    module use --append /home/hakobyan/.modules
    # see the new available modules with ...
    module avail
    # load ...
    module load entity/cuda/...
    # ... depending on the architecture
    # then configuring the code is quite straightforward
    cmake -B build -D pgen=...
    # Kokkos_ARCH_***, Kokkos_ENABLE_CUDA, etc. are already set
    ```

## Testing

To compile the unit tests, you need to specify the `-D TESTS=ON` flag when configuring the code with `cmake`. After the code is compiled, you can run the tests with the following command:
```shell
ctest --test-dir build/
```

You may also specify the `--output-on-failure` flag to see the output of the tests that failed.

To run only specific tests, you can use the `-R` flag followed by the regular expression that matches the test name. For example, to run all the tests that contain the word `particle`, you can use:
```shell
ctest --test-dir build/ -R particle
```