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

    Problem generators can either be one of the default ones, located in the `pgens/` directory (e.g., `-D pgen=reconnection`), or the ones from the [`entity-pgens`](https://github.com/entity-toolkit/entity-pgens) submodule, in which case you need to prepend a `pgens/` suffix (e.g., `-D pgen=pgens/kelvin-helmholtz`; make sure you have the submodule downloaded with `git submodule update --init`). Alternatively, you may pass a path to any directory containing your problem generator `pgen.hpp` (either relative or absolute path).

    All the build options are specified using the `-D` flag followed by the argument and its value (as shown above). Boolean options are specified as `ON` or `OFF`. The following are all the options that can be specified:

    | Option | Description | Values | Default |
    | --- | --- | --- | --- |
    | `pgen` | problem generator | e.g., see `pgens/` directory |  |
    | `precision` | floating point precision | `single`, `double` | `single` |
    | `output` | enable output | `ON`, `OFF` | `ON` |
    | `mpi` | enable multi-node support | `ON`, `OFF` | `OFF` |
    | `gpu_aware_mpi` <a href="https://github.com/entity-toolkit/entity/pull/105"> <span class="since-version">1.2.0</span>  </a>  | enable GPU-aware MPI communications | `ON`, `OFF` | `ON` |
    | `DEBUG` | enable debug mode | `ON`, `OFF` | `OFF` |
    | `TESTS` | compile the unit tests | `ON`, `OFF` | `OFF` |

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
  where `<NCORES>` is the number of cores you want to use for the compilation (if you skip the `<NCORES>` and just put `-j`, `cmake` will attempt to take as many threads as possible). Note, that the `-j` flag is optional, and if not specified, the code will compile using a single core.

1. After the compilation is done, you will find the executable called `entity.xc` in the `./build/src/` directory. That's it! You can now finally _run_ the code.

1. You may also "install" the executable in a specific direction (by default, it would be `./bin`, which can be overriden using the `-D CMAKE_INSTALL_PREFIX` flag) by running `cmake --install build` after the compilation is done.

## Running

You can run the code with the following command:

```sh
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

## Specific architectures


### HIP/ROCm @ AMD GPUs

<a href="https://github.com/entity-toolkit/entity/pull/50">
  <span class="since-version">1.1.0</span>
</a>

Compiling on AMD GPUs is typically not an issue: 

1. Make sure you have the ROCm library loaded: e.g., run `rocminfo`;
2. Sometimes the environment variables are not properly set up, so make sure you have the following variables properly defined: 

- `CMAKE_PREFIX_PATH=/opt/rocm` (or wherever ROCm is installed),
- `CC=hipcc` & `CXX=hipcc`,
- in rare occasions, you might have to also explicitly pass `-D CMAKE_CXX_COMPILER=hipcc -D CMAKE_C_COMPILER=hipcc` to cmake during the configuration stage;

3. Compile the code with proper Kokkos flags; i.e., for MI250x GPUs you would use: `-D Kokkos_ENABLE_HIP=ON` and `-D Kokkos_ARCH_AMD_GFX90A=ON`.

Now running is a bit trickier and the exact instruction might vary from machine to machine (part of it is because ROCm is much less streamlined than CUDA, but also system administrators on clusters are often more negligent towards AMD GPUs). 

* If you are running this on a cluster -- the first thing to do is to inspect the documentation of the cluster. There you might find the proper `slurm` command for requesting GPU nodes and binding each GPU to respective CPUs. 

* On personal machines figuring this out is a bit easier. First, inspect the output of `rocminfo` and `rocm-smi`. From there, you should be able to find the ID of the GPU you want to use. If you see more than one device -- that means you either have an additional AMD CPU, or an integrated GPU installed as well; ignore them. You will need to override two environment variables:

- `HSA_OVERRIDE_GFX_VERSION` set to GFX version that you used to compile the code (if you used `GFX1100` Kokkos flag, that would be `11.0.0`);
- `HIP_VISIBLE_DEVICES`, and `ROCR_VISIBLE_DEVICES` both need to be set to your device ID (usually, it's just a number from 0 to the number of devices that support HIP).

For example, the output of `rocminfo | grep -A 5 "Agent "` may look like this:
```
Agent 1                  
*******                  
  Name:                    AMD Ryzen 9 7940HS w/ Radeon 780M Graphics
  Uuid:                    CPU-XX                             
  Marketing Name:          AMD Ryzen 9 7940HS w/ Radeon 780M Graphics
  Vendor Name:             CPU                                
--
Agent 2                  
*******                  
  Name:                    gfx1100                            
  Uuid:                    GPU-XX                             
  Marketing Name:          AMD Radeon™ RX 7700S             
  Vendor Name:             AMD                                
--
Agent 3                  
*******                  
  Name:                    gfx1100                            
  Uuid:                    GPU-XX                             
  Marketing Name:          AMD Radeon Graphics                
  Vendor Name:             AMD
```
In this case, the required GPU is the `Agent 2`, which supports GFX1100. `rocm-smi` will look something like this:
```
============================================ ROCm System Management Interface ============================================
====================================================== Concise Info ======================================================
Device  Node  IDs              Temp    Power    Partitions          SCLK  MCLK     Fan    Perf  PwrCap       VRAM%  GPU%  
              (DID,     GUID)  (Edge)  (Avg)    (Mem, Compute, ID)                                                        
==========================================================================================================================
0       1     0x7480,   19047  35.0°C  0.0W     N/A, N/A, 0         0Mhz  96Mhz    29.8%  auto  100.0W       0%     0%    
1       2     0x15bf,   17218  48.0°C  19.111W  N/A, N/A, 0         None  1000Mhz  0%     auto  Unsupported  82%    5%    
==========================================================================================================================
================================================== End of ROCm SMI Log ===================================================
```
so the GPU we need has `Device` ID of `0` (since it's the dedicated GPU, it might automatically turn off when idle to save power on laptops; hence `Power = 0.0W`). Now we can run the code with: 
```sh
HSA_OVERRIDE_GFX_VERSION=11.0.0 HIP_VISIBLE_DEVICES=0 ROCR_VISIBLE_DEVICES=0 ./executable ...
```
