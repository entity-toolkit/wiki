---
hide:
  - footer
---

{% include "html/hljs.html" %}

# Dependencies

To compile the code you need to have the following dependencies installed:

  - [`CMake`](https://cmake.org/) (version >= 3.16; verify by running `cmake --version`).
  - [`GCC`](https://gcc.gnu.org/) (version >= 8.3.1; verify by running `g++ --version`), [`llvm`](https://llvm.org/) (tested on version >= 11; verify by running `clang++ --version`) or [Intel C++ compiler](https://www.intel.com/content/www/us/en/developer/tools/oneapi/dpc-compiler.html) (version >= 19.1 or higher; verify by running `icx --version`).
  - to compile for NVIDIA GPUs, you need to have the [`CUDA toolkit`](https://developer.nvidia.com/cuda-toolkit) installed (version >= 11.0; verify by running `nvcc --version`).
  - to compile for AMD GPUs, you will need the [ROCm libraries and the HIP compilers/runtime](https://github.com/ROCm/HIP) (verify by running `hipcc --version`).
  - `MPI` (e.g., `OpenMPI`, `MPICH`, etc.; verify by running `mpicxx --version`) for multi-node simulations.
  - `HDF5` for data output (verify by running `h5c++ --version`).

!!! note "Cuda compatibility"

    Note, that different versions of `CUDA` are compatible with different host compiler versions (i.e., `gcc`, `llvm`, etc.). Please, refer to the [following curated list](https://gist.github.com/ax3l/9489132) for the compatibility matrix.

All the other third-party dependencies, such as `Kokkos` and `ADIOS2`, are included in the repository as submodules and can be automatically compiled when you run `cmake` (although, we recommend to install `ADIOS2` externally as it can take a while to compile). 

!!! note

    To play with the code with all the dependencies already installed in the containerized environment, please refer to [the section on Docker](./docker.md).

## Preinstalling third-party libraries

To speed up the compilation process, it is often beneficial to precompile & install the third-party libraries and use those during the build process, either by setting the appropriate environment variables, using it within a conda/spack environment, or by using environment modules. Alternatively, of course, you can use the libraries provided by your system package manager (`pacman`, `apt`, `brew`, `nix`, ...), or the cluster's module system.

!!! warning

    If the system you're working on has `MPI` or `HDF5` already installed (either through environment modules or any package manager), it's highly recommended to use these libraries, instead of building your own. Instructions for these two here are provided as a last resort.

### Spack

<a href="https://github.com/entity-toolkit/entity/pull/69">
  <span class="since-version">1.2.0</span>
</a>

### Anaconda

If you want to have `ADIOS2` with the serial `HDF5` support (i.e., without `MPI`) installed in the conda environment, we provide a shell script `conda-entity-nompi.sh` which installs the proper compiler, the `hdf5` library, and the `ADIOS2`. Run the scripts via:

```shell
source conda-entity-nompi.sh
```

This also `pip`-installs the `nt2.py` package for post-processing. With this configuration, the `Kokkos` library will be built in-tree.

### Building dependencies from source

The form below allows you to generate the appropriate build scripts and optionally the environment modules for the libraries you want to compile and install. 


=== "`MPI`"
    __Prerequisites__:

    * Make sure to have a host (CPU) compiler such as GCC or LLVM (if necessary, load using `module load`). 
    * If using CUDA, make sure that `$CUDA_HOME` points to CUDA install path (if necessary, load cudatoolkit using `module load`). 

    _Note_: If using environment modules, add the mentioned `module load ...` commands to the new modulefile created at step #4.

    __Possible configurations__:

    <p>
      <input type="checkbox" id="mpi_use_cuda" name="mpi_use_cuda"/>
      <label for="mpi_use_cuda">CUDA support</label>
    </p>

    __Procedure__:

    1. Download the <a href="https://github.com/open-mpi/ompi" target="_blank">OpenMPI source code</a>:
      ```sh 
      git clone https://github.com/open-mpi/ompi.git 
      cd ompi
      ```
    2. Run the script below to configure
    <div class="script">
    </div>
    3. Compile & install with
    ```sh
    make -j
    make install
    ```
    4. Optionally, if using environment modules, create a modulefile with the following content:
    <div class="module">
    </div>
    Change the `<MPI_INSTALL_DIR>` and add `module load`s for the appropriate compilers as needed.


=== "`hdf5`"
    __Prerequisites__:

    * Make sure to have a host (CPU) compiler such as GCC or LLVM (if necessary, load using `module load`). 
    * If using MPI, make sure that `$MPI_HOME` points to its install directory (if necessary, load with `module load`). 

    _Note_: If using environment modules, add the mentioned `module load ...` commands to the new modulefile created at step #4.

    __Possible configurations__:

    <p>
      <input type="checkbox" id="hdf5_use_mpi" name="hdf5_use_mpi"/>
      <label for="hdf5_use_mpi">MPI support</label>
    </p>

    __Procedure__:

    1. Download the latest <a href="https://github.com/HDFGroup/hdf5/releases" target="_blank">HDF5 source code</a> (below is an example for `1.14.6`) into a temporary directory:
    ```sh
    mkdir hdf5src
    cd hdf5src
    wget https://github.com/HDFGroup/hdf5/releases/download/hdf5_1.14.6/hdf5-1.14.6.tar.gz
    tar xvf hdf5-1.14.6.tar.gz
    ```
    
    2. Download the latest dependencies into the same (`hdf5src`) temporary directory (do not extract):
        * <a href="https://github.com/HDFGroup/hdf5_plugins/releases" target="_blank">HDF5 plugins</a> (e.g., 1.14.6):
        ```sh
        wget https://github.com/HDFGroup/hdf5_plugins/releases/download/hdf5-1.14.6/hdf5_plugins-1.14.tar.gz
        ```
        * <a href="https://github.com/madler/zlib/releases" target="_blank">ZLIB</a> (e.g., 1.3.1): 
        ```sh
        wget https://github.com/madler/zlib/releases/download/v1.3.1/zlib-1.3.1.tar.gz
        ```
        * <a href="https://github.com/zlib-ng/zlib-ng/releases" target="_blank">ZLIBNG</a> (e.g., 2.2.4):
        ```sh
        wget https://github.com/zlib-ng/zlib-ng/archive/refs/tags/2.2.4.tar.gz
        ```
        * <a href="https://github.com/MathisRosenhauer/libaec/releases" target="_blank">LIBAEC</a> (e.g., 1.1.3):
        ```sh
        wget https://github.com/MathisRosenhauer/libaec/releases/download/v1.1.3/libaec-1.1.3.tar.gz
        ```

    3. Copy three `.cmake` scripts from the uncompressed HDF5 directory to the temporary directory:
    ```sh
    cp hdf5-1.14.6/config/cmake/scripts/*.cmake .
    ```

    4. In `HDF5options.cmake` uncomment the following line:
    ```cmake
    set (ADD_BUILD_OPTIONS "${ADD_BUILD_OPTIONS} -DBUILD_TESTING:BOOL=OFF")
    ```

    5. In `CTestScript.cmake` uncomment the following line (or if not present, simply add it below `cmake_minimum_required`):
    ```cmake
    set (LOCAL_SKIP_TEST "TRUE")
    ```
  
    6. From the same temporary directory run the following:
    <div class="script">
    </div>

    7. Optionally, if using environment modules, create a modulefile with the following content:
    <div class="module">
    </div>

    Change the `<HDF5_INSTALL_DIR>` and add `module load`s for the appropriate compiler/MPI as needed.


=== "`ADIOS2`"
    __Prerequisites__:

    * Make sure to have a host (CPU) compiler such as GCC or LLVM (if necessary, load using `module load`). 
    * Also make sure to have an HDF5 installed; check that `$HDF5_ROOT` properly points to the install directory (if necessary, load with `module load`). 
    * If using MPI, make sure that `$MPI_HOME` points to its install directory (if necessary, load with `module load`). 

    _Note_: If using environment modules, add the mentioned `module load ...` commands to the new modulefile created at step #4.

    __Possible configurations__:

    <p>
      <input type="checkbox" id="adios2_use_mpi" name="adios2_use_mpi"/>
      <label for="adios2_use_mpi">MPI support</label>
    </p>

    __Procedure__:

    1. Download the <a href="https://github.com/ornladios/ADIOS2" target="_blank">ADIOS2 source code</a>:
      ```sh 
      git clone https://github.com/ornladios/ADIOS2.git
      cd ADIOS2
      ```
    2. Run the script below to configure
    <div class="script">
    </div>
    3. Compile & install with
    ```sh
    cmake --build build -j
    cmake --install build
    ```
    4. Optionally, if using environment modules, create a modulefile with the following content:
    <div class="module">
    </div>
    Change the `<ADIOS2_INSTALL_DIR>` and add `module load`s for the appropriate compiler/HDF5/MPI as needed.

=== "`Kokkos`"
    __Prerequisites__:

    * Make sure to have a host (CPU) compiler such as GCC or LLVM (if necessary, load using `module load`). 
    * If using CUDA, make sure that `$CUDA_HOME` points to CUDA install path (if necessary, load cudatoolkit using `module load`). 
    * If using ROCm/HIP, make sure to have `hipcc`, and set `CC` and `CXX` variables to `hipcc` (if necessary, load HIP SDK using `module load`).

    _Note_: If using environment modules, add the mentioned `module load ...` commands to the new modulefile created at step #4.

    __Possible configurations__:

    <p>
      <input type="checkbox" id="kokkos_use_gpu" name="kokkos_use_gpu">
      <label for="kokkos_use_gpu">GPU support</label><br>
    </p>
    <p>
      <label for="kokkos_cpuarch">CPU architecture: </label>
      <select name="kokkos_cpuarch" id="kokkos_cpuarch">
        <option value="NATIVE">Native</option>
        <optgroup label="ARM">
          <option value="A64FX">ARMv8.2 with SVE Support</option> 
          <option value="ARMV80">ARMv8.0</option>
          <option value="ARMV81">ARMv8.1</option>
          <option value="ARMV8_THUNDERX">ARMv8 ThunderX</option>
          <option value="ARMV8_THUNDERX2">ARMv8 ThunderX2</option>
        </optgroup>
        <optgroup label="AMD">
          <option value="AMDAVX">AMDAVX</option>
          <option value="ZEN">Zen</option>
          <option value="ZEN2">Zen 2</option>
          <option value="ZEN3">Zen 3</option>
        </optgroup>
        <optgroup label="Intel">
          <option value="SPR">Sapphire Rapids</option>
          <option value="SKX">Skylake</option>
          <option value="BDW">Broadwell</option>
          <option value="HSW">Haswell</option>
          <option value="SNB">Sandy Bridge</option>
          <option value="KNL">Knights Landing</option>
          <option value="KNC">Knights Corner</option>
        </optgroup>
        <optgroup label="IBM">
          <option value="POWER9">POWER9</option>
          <option value="POWER8">POWER8</option>
        </optgroup>
      </select>
    </p>
    <p id="kokkos_gpuarch_selector">
      <label for="kokkos_gpuarch">GPU architecture: </label>
      <select name="kokkos_gpuarch" id="kokkos_gpuarch">
        <option value="NATIVE">Native</option>
        <optgroup label="NVIDIA">
          <option value="HOPPER90">Hopper 9.0: H100</option>
          <option value="ADA89">Ada Lovelace 8.9: L4/L40</option>
          <option value="AMPERE86">Ampere 8.6: A40/A10/A16/A2</option>
          <option value="AMPERE80">Ampere 8.0: A100/A30</option>
          <option value="TURING75">Turing 7.5: T4</option>
          <option value="VOLTA72">Volta 7.2</option>
          <option value="VOLTA70">Volta 7.0: V100</option>
          <option value="PASCAL61">Pascal 6.1: P40/P4</option>
          <option value="PASCAL60">Pascal 6.0: P100</option>
          <option value="MAXWELL53">Maxwell 5.3</option>
          <option value="MAXWELL52">Maxwell 5.2: M60/M40</option>
          <option value="MAXWELL50">Maxwell 5.0</option>
          <option value="KEPLER37">Kepler 3.7: K80</option>
          <option value="KEPLER35">Kepler 3.5: K40/K20</option>
          <option value="KEPLER32">Kepler 3.2</option>
          <option value="KEPLER30">Kepler 3.0: K10</option>
        </optgroup>
        <optgroup label="AMD">
          <option value="AMD_GFX942">GFX942: MI300A/MI300X</option>
          <option value="AMD_GFX940">GFX940: MI300A (pre-production)</option>
          <option value="AMD_GFX90A">GFX90A: MI200 series</option>
          <option value="AMD_GFX908">GFX90A: MI100</option>
          <option value="AMD_GFX906">GFX906: MI50/MI60</option>
          <option value="AMD_GFX1100">GFX1100: 7900xt</option>
          <option value="AMD_GFX1030">GFX1030: V620/W6800</option>
        </optgroup>
        <optgroup label="Intel">
          <option value="INTEL_PVC">Xe-HPC: Max 1550</option>
          <option value="INTEL_XEHP">Xe-HP</option>
          <option value="INTEL_DG1">Iris Xe MAX (DG1)</option>
          <option value="INTEL_GEN12LP">Gen12LP: UHD Graphics 770</option>
          <option value="INTEL_GEN11">Gen11: UHD Graphics</option>
          <option value="INTEL_GEN9">Gen9: HD Graphics 510/Iris Pro 580</option>
          <option value="INTEL_GEN">Just-In-Time compilation</option>
        </optgroup>
      </select>
    </p>

    __Procedure__:

    1. Download the <a href="https://github.com/kokkos/kokkos.git" target="_blank">Kokkos source code</a>:
      ```sh 
      git clone -b master https://github.com/kokkos/kokkos.git
      cd kokkos
      ```
    2. Run the script below to configure
    <div class="script">
    </div>
    3. Compile & install with
    ```sh
    cmake --build build -j
    cmake --install build
    ```
    4. Optionally, if using environment modules, create a modulefile with the following content:
    <div class="module">
    </div>
    Change the `<KOKKOS_INSTALL_DIR>` and add `module load`s for the appropriate host compiler/CUDA/HIP/SYCL as needed.

!!! note "Nix"

    <a href="https://github.com/entity-toolkit/entity/pull/69">
      <span class="since-version">1.2.0</span>
    </a>

    On systems with the `nix` package manager, you can quickly make a development environment with all the dependencies installed using a `nix-shell` (from the root directory of the code):

    ```sh
    nix-shell dev/nix --arg hdf5 true --arg mpi true --arg gpu \"HIP\" --arg arch \"amd_gfx1100\"

    # you can inspect the default settings by
    head dev/nix/shell.nix
    ```
    Note the escapes of quotation marks when specifying a string argument.

!!! note

    We also provide a command-line tool called [`ntt-dploy`](https://github.com/entity-toolkit/ntt-dploy) which can be used for the same purpose.

<script src="../dependencies.js"></script>
