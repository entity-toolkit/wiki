---
hide:
  - footer
---

# Cluster setups

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
    

    `Rusty` cluster at Flatiron Institute has 36 nodes with 4 NVIDIA A100-80GB each and 36 nodes with 4 NVIDIA A100-40GB GPUs each and 64-core Icelake CPUs. It also has 18 nodes with 8 NVIDIA H100-80GB GPUs each and same CPU architecture. We will use nodes with A100 GPUs for the example below.

    **Installing the dependencies**

    The most straightforward way to set things up on the `Rusty` cluster, is to use `spack` [as described here](../1-getting-started/2-dependencies.md#spack-recommended). After downloading and initializing the `spack` shell-env, start an interactive session to make compilation faster:
    ```sh
    srun -C a100 -p gpu -N1 -n1 -c32 --gpus-per-task=1 --pty bash -i
    ```
    
    Next, you can create a virtual environment and activate it:
    ```sh
    spack env create entity-env
    spack env activate entity-env
    ```

    Then load the proper modules to-be-used during compilation, add compiler to spack, and find external libraries:
    ```sh
    module purge
    ml cmake/3.27.9 gcc/11.4.0 openblas/threaded-0.3.26 cuda/12.3.2 openmpi/cuda-4.0.7 hdf5/mpi-1.12.3
    spack compiler add
    spack external find
    ```
    You can check that the corrrect external libraries were found by `spack spec [library]`.


    Now we can install 2 libraries we will need: `Kokkos` and `ADIOS2`.
    ```sh
    spack add kokkos +cuda +wrapper cuda_arch=80 +pic +aggressive_vectorization
    spack add adios2 +hdf5 +pic
    spack install
    ```

    Note: if you wish to install this from the login nodes, you need to allow compilation on non-native architectures and specify target architecture (`linux-rocky8-icelake` for A100 GPUs nodes on `Rusty`):
    ```sh
    spack config add concretizer:targets:host_compatible:false
    spack add kokkos +cuda +wrapper cuda_arch=80 +pic +aggressive_vectorization target=linux-rocky8-icelake 
    spack add adios2 +hdf5 +pic target=linux-rocky8-icelake 
    ```

    You might want to first run these commands with `spec` instead of `add` to make sure spack recognizes the correct `gcc`, `cuda`, `openmpi`, and `hdf5` (they should be marked as `[e]` and should point to a local directory specified above).

    **Compiling & running the code**

    To compile the code on login nodes, load the modules and activate the spack enviroment: 
    ```sh
    module purge
    ml cmake/3.27.9 gcc/11.4.0 openblas/threaded-0.3.26 cuda/12.3.2 openmpi/cuda-4.0.7 hdf5/mpi-1.12.3
    spack env activate entity-env
    ```
    
    During the compilation, passing any `-D Kokkos_***` or `-D ADIOS2_***` flags is not necessary, while `-D mpi=ON/OFF` is still needed, since in theory the code can also be compiled without MPI.

    To run the code, the submit script should look something like this:
    ```slurm
    #!/bin/bash
    #SBATCH -p gpu
    #SBATCH --gpus-per-task=1
    #SBATCH --cpus-per-task=16
    #SBATCH --ntasks-per-node=4
    #SBATCH --nodes=1 (*)
    #SBATCH --gres=gpu:4
    #SBATCH --constraint=a100-80gb
    #SBATCH --time=00:30:00

    # .. other sbatch directives

    module purge
    ml cmake/3.27.9 gcc/11.4.0 openblas/threaded-0.3.26 cuda/12.3.2 openmpi/cuda-4.0.7 hdf5/mpi-1.12.3
    . <HOME>/spack/share/spack/setup-env.sh
    spack env activate entity-env
    export LD_PRELOAD=/mnt/sw/fi/cephtweaks/lib/libcephtweaks.so
    export CEPHTWEAKS_LAZYIO=1

    srun entity.xc -input <INPUT>.toml
    ```

    (*) total number of nodes

    _Last updated: 6/26/2025_

=== "`Vista` (TACC)"

    [`Vista`](https://tacc.utexas.edu/systems/vista/) cluster is a part of TACC research center. It consists of 600 Grace Hopper nodes, each hosting H200 GPU and 72 Grace CPUs. 

    **Installing the dependencies**

    `Vista` does not require any specific modules to be installed. Before compiling, the following modules should be loaded:

    ```sh
    module load nvidia/24.7
    module load cuda/12.5
    module load kokkos/4.5.01-cuda
    module load openmpi/5.0.5
    module load adios2/2.10.2
    module load phdf5/1.14.4
    module load ucx/1.18.8
    ``` 

    **Compiling & running the code**

    The code can be then configured with the following command:

    ```sh
    cmake -B build -D mpi=ON -D pgen=<YOUR_PGEN>  -D output=ON -D Kokkos_ENABLE_CUDA=ON -D Kokkos_ARCH90=ON -D ADIOS2_USE_CUDA=ON -D ADIOS2_USE_MPI=ON
    ```
    While the `hdf5` output format works on `Vista`, we advise to use `BPFile`, as currently `hdf5` write is extremely slow with MPI for 2- and 3-dimensional problems.   
    The sample submit script should look similar to this:

    ```slurm
    #!/bin/bash
    #SBATCH -A <PROJECT NUMBER>
    #SBATCH -p gh
    #SBATCH -t 16:00:00 #the code will run for 16 hours
    #SBATCH -N 64       # 64 nodes will be used
    #SBATCH -n 64       # 64 tasks in total will be launched
    #SBATCH -J your_job_name
    #SBATCH --output=test.out
    #SBATCH --error=test.err
    export UCX_MEMTYPE_CACHE=n
    export UCX_TLS=rc,cuda_copy
    export UCX_IB_REG_METHODS=rcache,direct
    export UCX_RNDV_MEMTYPE_CACHE=n
    echo "Launching application..."
    ibrun ./entity.xc -input <INPUT>.toml
    ```

    _Last updated: 6/19/2025_

=== "`DeltaAI` (NCSA)"

    [`DeltaAI`](https://docs.ncsa.illinois.edu/systems/deltaai/en/latest/index.html) uses GH200 nodes. These are NVIDIA superchip nodes with 4x H100 GPUs and 4x ARM CPUs with 72 cores each.

    **Installing the dependencies**

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

    [`Perlmutter`](https://docs.nersc.gov/systems/perlmutter/architecture/) is a DoE cluster in LBNL with 4x NVIDIA A100 and a AMD EPYC 7763 CPU on each node. Note, that two different GPU configurations are available with 40 and 80 GB of VRAM respectively.

    **Installing the dependencies**
    
    The easiest way to use the code here is to compile and install your own modules manually. First, load the modules you will need for that:
    
    ```sh
    module load PrgEnv-gnu cray-hdf5-parallel cmake/3.24.3
    ```

    Download the `Kokkos` source code, configure/compile and install it (in this example, we install it in the `~/opt` directory.

    ```sh
    wget https://github.com/kokkos/kokkos/releases/download/4.6.01/kokkos-4.6.01.tar.gz
    tar xvf kokkos-4.6.01.tar.gz
    cd kokkos-4.6.01
    cmake -B build -D CMAKE_CXX_STANDARD=17 \
        -D CMAKE_BUILD_TYPE=Release \
        -D CMAKE_CXX_EXTENSIONS=OFF \
        -D CMAKE_POSITION_INDEPENDENT_CODE=TRUE \
        -D CMAKE_CXX_COMPILER=CC \
        -D Kokkos_ENABLE_CUDA=ON \
        -D Kokkos_ENABLE_IMPL_CUDA_MALLOC_ASYNC=OFF \
        -D Kokkos_ARCH_ZEN3=ON \
        -D Kokkos_ARCH_AMPERE80=ON \
        -D CMAKE_INSTALL_PREFIX=$HOME/opt/kokkos/4.6.01/
    cmake --build build -j
    cmake --install build
    ```

    Now the `ADIOS2`:

    ```sh
    wget https://github.com/ornladios/ADIOS2/archive/refs/tags/v2.10.2.tar.gz
    tar xvf v2.10.2.tar.gz
    cd ADIOS2-2.10.2
    cmake -B build -D CMAKE_CXX_STANDARD=17 \
        -D CMAKE_CXX_EXTENSIONS=OFF \
        -D CMAKE_POSITION_INDEPENDENT_CODE=TRUE \
        -D BUILD_SHARED_LIBS=ON \
        -D ADIOS2_USE_HDF5=ON \
        -D ADIOS2_USE_Python=OFF \
        -D ADIOS2_USE_Fortran=OFF \
        -D ADIOS2_USE_ZeroMQ=OFF \
        -D BUILD_TESTING=OFF \
        -D ADIOS2_BUILD_EXAMPLES=OFF \
        -D ADIOS2_USE_MPI=ON \
        -D ADIOS2_USE_BLOSC=ON \
        -D LIBFABRIC_ROOT=/opt/cray/libfabric/1.15.2.0/ \
        -D CMAKE_INSTALL_PREFIX=$HOME/opt/adios2/v2.10.2 \
        -D MPI_ROOT=/opt/cray/pe/craype/2.7.30
    cmake --build build -j
    cmake --install build
    ```

    For simplicity, it is recommended to also create the module files (e.g., in `~/modules` directory):

    For `kokkos`:
    ```sh
    #%Module1.0######################################################################
    ##
    ## Kokkos @ Zen3 @ Ampere80 modulefile
    ##
    #################################################################################
    proc ModulesHelp { } {
      puts stderr "\tKokkos\n"
    }

    module-whatis      "Sets up Kokkos @ Zen3 @ Ampere80"    

    conflict           kokkos

    set                basedir      /global/homes/h/<USER>/opt/kokkos/4.6.01
    prepend-path       PATH         $basedir/bin
    setenv             Kokkos_DIR   $basedir
    setenv             Kokkos_ARCH_ZEN3 ON
    setenv             Kokkos_ARCH_AMPERE80 ON
    setenv             Kokkos_ENABLE_CUDA ON
    ```

    For `ADIOS2`:
    ```sh
    #%Module1.0######################################################################
    ##
    ## ADIOS2 modulefile
    ##
    #################################################################################
    proc ModulesHelp { } {
      puts stderr "\tADIOS2\n"
    }

    module-whatis      "Sets up ADIOS2"    

    conflict           adios2

    set                basedir      /global/homes/h/<USER>/opt/adios2/v2.10.2
    prepend-path       PATH         $basedir/bin
    setenv             ADIOS2_DIR   $basedir

    setenv ADIOS2_USE_HDF5      ON
    setenv ADIOS2_USE_MPI       ON
    setenv ADIOS2_HAVE_HDF5_VOL ON
    setenv MPI_ROOT             /opt/cray/pe/mpich/8.1.30/ofi/gnu/12.3
    setenv HDF5_ROOT            /opt/cray/pe/hdf5-parallel/1.14.3.1/gnu/12.3

    prereq cray-mpich/8.1.30 cray-hdf5-parallel/1.14.3.1
    ```

    Make sure to explicitly set the paths, instead of using `~` or `$HOME`.

    **Compiling & running the code**

    When compiling `entity` itself, explicitly pass the `cc` and `CC` as compilers, i.e.:
    ```sh
    cmake -B build ... -D CMAKE_C_COMPILER=cc -D CMAKE_CXX_COMPILER=CC
    ```

    Use the following submit script for the slurm (example for 8 GPUs on 2 nodes; [details on available resources](https://docs.nersc.gov/systems/perlmutter/architecture/)):
    ```slurm
    #!/bin/bash
    #SBATCH --account=<ALLOCATION>
    #SBATCH --constraint=gpu
    #SBATCH --qos=<QUEUE>
    #SBATCH -t <TIME>
    #SBATCH -N 2
    #SBATCH -c 1
    #SBATCH -n 8
    #SBATCH --gpus=8
    #SBATCH --gpus-per-task=1
    #SBATCH --gpu-bind=none

    # load all the modules here

    export MPICH_NO_BUFFER_ALIAS_CHECK=1
    export MPICH_GPU_SUPPORT_ENABLED=1
    export MPICH_OFI_NIC_POLICY=GPU
    export SLURM_CPU_BIND="cores"

    srun ./entity.xc -input cfg.toml >report 2>error
    ```

    _Last updated: 6/19/2025_

=== "`Frontier` (ORNL)"

    _WIP_

=== "(IAS)"

    _WIP_

=== "`Aurora` (ANL)"

    [`Aurora`](https://docs.alcf.anl.gov/aurora/) uses [Intel PVC](https://www.intel.com/content/www/us/en/products/sku/232873/intel-data-center-gpu-max-1550/specifications.html) nodes with 6 GPUs/node. Each PVC has 128GB of memory and is split into 2 tiles. It is recommended to use 1 MPI rank per tile, so 2 per GPU and 12 per node.
    Development of entity for `Aurora` is currently ongoing. Use the following docs with caution and check in with `@LudwigBoess` on potential changes.

    **Modules to load**

    You can load the installed dependencies with

    ```sh
    module load adios2
    module load autoconf cmake
    ```

    The `adios2` module automatically loads the related `kokkos` module. Please note that the `adios2` module provided by ALCF does not support HDF5.

    I would recommend saving the module configuration for easy loading within the PBS job:
    ```sh
    module save entity
    ```

    You can compile `entity` with:

    ```sh
    cmake -B build -D pgen=<your_pgen> -D precision=single -D mpi=ON -D output=ON -DCMAKE_C_COMPILER=mpicc -DCMAKE_CXX_COMPILER=mpicxx
    ```

    **Running entity**

    Aurora uses [PBS](https://docs.alcf.anl.gov/running-jobs/?h=pbs) for workload management.
    The Intel PVC GPUs are split into two tiles each and it is recommended to launch one MPI rank per tile.

    ```sh
    #!/bin/bash -l
    #PBS -A <project_name>
    #PBS -N <job_name>
    #PBS -l select=1                # number of nodes to use
    #PBS -l walltime=00:05:00
    #PBS -l filesystems=flare       # replace with the filesystem of your project
    #PBS -k doe
    #PBS -l place=scatter
    #PBS -q debug

    NTOTRANKS=12        # 2*6*N_nodes - updated with your requested number
    NRANKS_PER_NODE=12  # 2*6  - always the same

    # change to directory from which job was submitted
    cd $PBS_O_WORKDIR

    # load all modules defined above
    module restore entity

    # only relevant for CPU pinning and to avoid Kokkos complaints
    export OMP_PROC_BIND=spread

    mpiexec --envall -n ${NTOTRANKS} --ppn ${NRANKS_PER_NODE} ./gpu_tile_compact.sh ./entity.xc -input weibel.toml
    ```

    To run it you need to define a script `gpu_tile_compact.sh` in the same folder as your executable. It should look like this:

    ```sh
    #!/bin/bash -l
    num_gpu=6
    num_tile=2
    gpu_id=$(( (PALS_LOCAL_RANKID / num_tile ) % num_gpu ))
    tile_id=$((PALS_LOCAL_RANKID % num_tile))
    export ZE_ENABLE_PCI_ID_DEVICE_ORDER=1
    export ZE_AFFINITY_MASK=$gpu_id.$tile_id

    # reports the GPU tile pinning
    echo “RANK= $PALS_RANKID LOCAL_RANK= $PALS_LOCAL_RANKID gpu= $gpu_id.$tile_id”
    # runs the actual job
    exec "$@"
    ```

    _Last updated: 8/11/2025_

=== "`LUMI` (CSC)"

    [`LUMI`](https://www.lumi-supercomputer.eu/) cluster is located in Finland. It is equipped with 2978 nodes with 4 AMD MI250x GPUs and a single 64 cores AMD EPYC "Trento" CPU. The required modules to be loaded are:

    **Compiling & running the code**

    ```sh
    module load PrgEnv-cray
    module load cray-mpich
    module load craype-accel-amd-gfx90a
    module load rocm
    module load cray-hdf5-parallel/1.12.2.11
    ``` 

    The configuration command is standard. The `Kokkos` library, along with `adios2`, will be installed from code dependencies directly at compilation. It is also important to provide the `c++` and `c` compilers manually with environemntal variables `CC` and `cc` (they are already predefined given that all the modules mentioned above were loaded). So far, gpu-aware mpi is not supported on `LUMI`. The configuration command is the following:
    ```sh
    cmake -B build -D pgen=turbulence -D mpi=ON -D Kokkos_ENABLE_HIP=ON -D Kokkos_ARCH_AMD_GFX90A=ON -D CMAKE_CXX_COMPILER=CC -D CMAKE_C_COMPILER=cc -D gpu_aware_mpi=OFF
    ``` 

    The example submit script:

    ```slurm
    #!/bin/bash -l
    #SBATCH --job-name=examplejob   # Job name
    #SBATCH --output=test.out # Name of stdout output file
    #SBATCH --error=test.err  # Name of stderr error file
    #SBATCH --partition=standard-g  # partition name
    #SBATCH --nodes=8               # Total number of nodes 
    #SBATCH --ntasks-per-node=8     # 8 MPI ranks per
    #SBATCH --gpus-per-node=8
    ##SBATCH --mem=0
    #SBATCH --time=48:00:00       # Run time (d-hh:mm:ss)
    #SBATCH --account=project_<NUMBER>  # Project for billing
    export MPICH_GPU_SUPPORT_ENABLED=1
    srun ./entity.xc -input <INPUT>.toml
    ```

    _Last updated: 6/19/2025_

!!! warning "Mind the dates"

    At the bottom of each section, there are tags indicating when was the last date this instruction was updated. Some of them may be outdated due to clusters being constantly updated and changed. If so, please feel free to reach out with questions or contribute updated instructions.
