---
hide:
  - footer
---

This section goes over some instructions on how to compile & run the `Entity` on some of the most widely utilized clusters. While the main libraries we rely on, `Kokkos` and `ADIOS2` can be built in-tree (i.e., together with the code when you launch the compiler), it is nonetheless recommended to pre-install them separately (if not already installed on the cluster) and use them as external dependencies, since that will significantly cut down the compilation time.


!!! note "Contribute!"

    If you don't see a cluster you are running the code on here, please be kind to those that will come after us and contribute instructions for that specific cluster. `Entity` is only as strong as the community supporting it, and by contributing a few sentences, you may have an immense effect in the longrun.

=== "`Stellar` (Princeton)"

    [`Stellar`](https://researchcomputing.princeton.edu/systems/stellar) cluster at Princeton University has 6 nodes with 2 NVIDIA A100 GPUs (Ampere 8.0 microarchitecture) each and 128-core AMD EPYC Rome CPUs (Zen2 microarchitecture).

    **Installing the dependencies**

    The most straightforward way to set things up on the `Stellar` cluster, is to use `spack` [as described here](../1-getting-started/2-dependencies.md#spack-recommended). After downloading and initializing the shell-env, load the proper modules to-be-used during compilation:
    ```sh
    module load gcc-toolset/10
    module load cudatoolkit/12.5
    module load openmpi/gcc-toolset-10/4.1.0
    ```

    Then manually add the following two entries to `~/.spack/packages.yaml`:
    ```yaml
    packages:
      cuda:
        buildable: false
        externals:
        - spec: cuda@12.5
          prefix: /usr/local/cuda-12.5
      openmpi:
        buildable: false
        externals:
        - spec: openmpi@4.1.0
          prefix: /usr/local/openmpi/4.1.0/gcc-toolset-10
    ```
    
    And run `spack compiler add` and `spack external find`. Since the login nodes (on which all the libraries will be compiled) are different from the compute nodes on `Stellar`, you will need to allow spack to compile for non-native CPU architectures by running:
    ```sh
    spack config add concretizer:targets:host_compatible:false
    ```

    Now we can install 3 libraries we will need: `HDF5`, `ADIOS2` and `Kokkos`. First create and activate a new environment:
    ```sh
    spack env create entity-env
    spack env activate entity-env
    ```

    To install the packages within the spack environment, run the following commands:
    ```sh
    spack add hdf5 +mpi +cxx target=zen2
    spack add adios2 +hdf5 +pic target=zen2
    spack add kokkos +cuda +wrapper cuda_arch=80 +pic +aggressive_vectorization target=zen2
    ```

    You might want to first run these commands with `spec` instead of `add` to make sure spack recognizes the correct `cuda` & `openmpi` (they should be marked as `[e]` and should point to a local directory specified above). After `add`-ing you can launch the installer via `spack install` and wait until all installations are done.

    **Compiling & running the code**

    To compile the code, first activate the environment (if not already), then manually using both `modules` and `spack` load all the necessary libraries: 
    ```sh
    module load gcc-toolset/10
    module load cudatoolkit/12.5
    module load openmpi/gcc-toolset-10/4.1.0
    spack load gcc cuda openmpi kokkos adios2
    ```
    
    During the compilation, passing any `-D Kokkos_***` or `-D ADIOS2_***` flags is not necessary, while `-D mpi=ON/OFF` is still needed, since in theory the code can also be compiled without MPI.

    To run the code, the submit script should look something like this:
    ```slurm
    #!/bin/bash
    #SBATCH -n 4 (1)
    #SBATCH -t 00:30:00
    #SBATCH -J entity-run
    #SBATCH --gres=gpu:2 (2)
    #SBATCH --gpus=4 (3)
    # .. other sbatch directives

    module load gcc-toolset/10
    module load cudatoolkit/12.5
    module load openmpi/gcc-toolset-10/4.1.0
    . <HOME>/spack/share/spack/setup-env.sh
    spack env activate entity-env
    spack load gcc cuda openmpi kokkos adios2

    srun entity.xc -input <INPUT>.toml
    ```

    1. total number of tasks (GPUs)
    2. requesting nodes with 2 GPUs per node
    3. total number of GPUs

    _Last updated: 4/28/2025_

=== "`Zaratan` (UMD)"

    [`Zaratan`](https://hpcc.umd.edu/hpcc/zaratan.html) cluster at the University of Maryland has 20 nodes with 4 NVIDIA A100 GPUs (Ampere 8.0) and a 128-core AMD EPYC (Zen2) CPUs each, as well as 8 nodes with NVIDIA H100 GPUs (Hopper 9.0) and Intel Xeon Platinum 8468 (Sapphire Rapids). Below, we describe how to run the code on the A100 nodes; for the H100 nodes the procedure is similar with the only exception being that different flags need to be specified when installing the `Kokkos` library (plus, you might need to manually specify `target=<CPUARCH>` as the login nodes have a different microarchitecture than the H100 compute nodes).

    **Installing the dependencies**

    We will rely on spack to compile on Zaratan. But first of all, the correct compiler should be loaded:

    ```sh
    module load gcc/11.3.0
    ```
    After that, add the following to `~/.spack/packages.yaml`:
    ```yaml
    packages:
      cuda:
        buildable: false
        externals:
        - prefix: /cvmfs/hpcsw.umd.edu/spack-software/2023.11.20/linux-rhel8-x86_64/gcc-11.3.0/cuda-12.3.0-fvfg7yyq63nunqvkn7a5fzh6e77quxty
          spec: cuda@12.3
        - modules:
          - cuda/12.3
          spec: cuda@12.3
      cmake:
         buildable: false
         externals:
         - prefix: /usr
           spec: cmake@3.26.5
    ```
    Next, you should create a virtual environment and activate it
    ```sh
    spack env create entity-env
    spack env activate entity-env
    ```
    From within the environment, install the required packages within the environment running the following command: 
    ```sh
    spack add hdf5 +mpi +cxx
    spack add adios2 +hdf5 +pic
    spack add kokkos +cuda +wrapper cuda_arch=80 +pic +aggressive_vectorization
    spack add openmpi +cuda
    ```
    After that, install the packages with `spack install`. Now, to load the packages within the environment, do:  
    ```sh 
    spack load hdf5 adios2 kokkos openmpi
    ```
    
    **Compiling & running the code**

    Compilation of the code is performed as usual, and there is no need for any additional `-D Kokkos_***` or `-D ADIOS2_***` flags. The batch script for submitting the job should look like this:
    ```slurm
    #!/bin/bash
    #SBATCH -p gpu
    #SBATCH -t 00:30:00
    #SBATCH -n 1
    #SBATCH -c 1
    #SBATCH --gpus=a100_1g.5gb:1
    #SBATCH --output=test.out
    #SBATCH --error=test.err

    module load gcc/11.3.0
    . <HOME>/spack/share/spack/setup-env.sh
    spack env activate entity-env
    spack load hdf5 kokkos adios2 cuda openmpi

    mpirun ./entity.xc -input <INPUT>.toml 
    ```

    _Last updated: 4/29/2025_


=== "`Rusty` (CCA)"
    
    _WIP_

=== "`Vista` (TACC)"

    _WIP_

=== "`DeltaAI` (NCSA)"

    **Installing the dependencies**

    [`DeltaAI`](https://docs.ncsa.illinois.edu/systems/deltaai/en/latest/index.html) uses GH200 nodes. These are NVIDIA superchip nodes with 4x H100 GPUs and 4x ARM CPUs with 72 cores each.
    This makes the setup a bit more tedious, but luckily most dependencies are already installed.

    You can load the installed dependencies with

    ```sh
    module restore
    module unload gcc-native
    module load gcc-native/12
    module load craype-accel-nvidia90
    module load cray-hdf5-parallel
    ```

    We would recommend installing `Kokkos` and `ADIOS2` from source with the following settings:

    ```sh
    # Kokkos
    cmake -B build  \
        -D CMAKE_CXX_STANDARD=17 \
        -D CMAKE_CXX_EXTENSIONS=OFF \
        -D CMAKE_POSITION_INDEPENDENT_CODE=TRUE \
        -D CMAKE_C_COMPILER=cc \
        -D CMAKE_CXX_COMPILER=CC \
        -D Kokkos_ARCH_ARMV9_GRACE=ON \
        -D Kokkos_ARCH_HOPPER90=ON \
        -D Kokkos_ENABLE_CUDA=ON \
        -D Kokkos_ENABLE_DEBUG=ON \
        -D CMAKE_INSTALL_PREFIX=/path/to/install/location/for/kokkos && \
    cmake --build build -j && \
    cmake --install build 

    # ADIOS2
    cmake -B build  \
        -D CMAKE_CXX_STANDARD=17 \
        -D CMAKE_CXX_EXTENSIONS=OFF \
        -D CMAKE_POSITION_INDEPENDENT_CODE=TRUE \
        -D BUILD_SHARED_LIBS=ON \
        -D ADIOS2_USE_HDF5=ON \
        -D ADIOS2_USE_Python=OFF \
        -D ADIOS2_USE_Fortran=OFF \
        -D ADIOS2_USE_ZeroMQ=OFF \
        -D BUILD_TESTING=ON \
        -D CMAKE_C_COMPILER=cc \
        -D CMAKE_CXX_COMPILER=CC \
        -D ADIOS2_BUILD_EXAMPLES=OFF \
        -D ADIOS2_USE_MPI=ON \
        -D ADIOS2_USE_BLOSC=ON \
        -D HDF5_ROOT=/opt/cray/pe/hdf5-parallel \
        -D CMAKE_INSTALL_PREFIX=/path/to/install/location/for/adios2 && \
    cmake --build build -j && \
    cmake --install build
    ```

    You can then add module files for both libraries (as described [here](../1-getting-started/2-dependencies.md#building-dependencies-from-source)) or add them to your path directly. Just be sure to export the relevant `kokkos` settings.
    ```sh
    # in the kokkos module file
    setenv  Kokkos_ENABLE_CUDA              ON
    setenv  Kokkos_ARCH_ARMV9_GRACE         ON
    setenv  Kokkos_ARCH_HOPPER90            ON
    ```
    
    **Compiling & running the code**

    `DeltaAI`'s `mpich` seems to not be `CUDA` aware (or it's bugged), so you will always need to add the flag `gpu_aware_mpi=OFF`.

    Your `cmake` setting should look something like this:
    ```sh
    cmake -B build -D pgen=<PGEN> -D mpi=ON -D CMAKE_CXX_COMPILER=CC -D CMAKE_C_COMPILER=cc -D gpu_aware_mpi=OFF
    ```

    Finally an example `SLURM` script using the full node looks like this:

    ```slurm
    #!/bin/bash
    #SBATCH --nodes=2
    #SBATCH --ntasks-per-node=4
    #SBATCH --cpus-per-task=72
    #SBATCH --gpus-per-node=4
    #SBATCH --partition=ghx4
    #SBATCH --time=48:00:00
    #SBATCH --gpu-bind=verbose,closest
    #SBATCH --job-name=example
    #SBATCH -o ./log/%x.%j.out
    #SBATCH -e ./log/%x.%j.err
    #SBATCH --account=your-account

    module restore
    module unload gcc-native
    module load gcc-native/12
    module load craype-accel-nvidia90
    module use --append /path/to/your/.modfiles
    module load kokkos/4.6.00
    module load entity/cuda
    module load adios2/2.10.2
    module list

    export MPICH_GPU_SUPPORT_ENABLED=1
    export MPICH_OFI_VERBOSE=1

    srun ./entity.xc -input <INPUT>.toml
    ```

    _Last updated: 4/28/2025_

=== "`Perlmutter` (NERSC)"

    _WIP_

=== "`Frontier` (ORNL)"

    _WIP_

=== "(IAS)"

    _WIP_

!!! warning "Mind the dates"

    At the bottom of each section, there are tags indicating when was the last date this instruction was updated. Some of them may be outdated due to clusters being constantly updated and changed. If so, please feel free to reach out with questions or contribute updated instructions.
