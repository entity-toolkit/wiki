[`LUMI`](https://www.lumi-supercomputer.eu/) cluster is located in Finland. It is equipped with 2978 nodes with 4 AMD MI250x GPUs and a single 64 cores AMD EPYC "Trento" CPU. The required modules to be loaded are:

**Installing the dependencies**

!!! note "Using the `dependencies.py`"

    <span class="since-version">1.4.0</span>
    Simply pick the `lumi` option from the cluster-specific parameters from the `dependencies.py` file included with the root of the code, and then run `$HOME/.entity/install.sh` which will both compile and install the dependencies and create modulefiles. It's much faster and more reliable to do this from within a shell running on compute nodes.

Building and installing the dependencies can be done using the following modules:

```sh
module load PrgEnv-cray
module load cray-mpich
module load craype-accel-amd-gfx90a
module load rocm
``` 

Then for `Kokkos` (5.0.0+):

```sh
# configure with
cmake -B build \
    -D CMAKE_CXX_STANDARD=20 \
    -D CMAKE_CXX_EXTENSIONS=OFF \
    -D CMAKE_CXX_COMPILER=hipcc \
    -D CMAKE_POSITION_INDEPENDENT_CODE=TRUE \
    -D Kokkos_ARCH_AMD_GFX90A=ON -D Kokkos_ENABLE_HIP=ON -D AMDGPU_TARGETS=gfx90a \
    -D CMAKE_INSTALL_PREFIX=$HOME/.entity/kokkos
# compile and install with
cmake --build build -j
cmake --install build
```

For `adios2`:

```sh
# configure with
cmake -B build \
    -D CMAKE_CXX_STANDARD=20 \
    -D CMAKE_CXX_EXTENSIONS=OFF \
    -D CMAKE_CXX_COMPILER=CC -D CMAKE_C_COMPILER=cc \
    -D CMAKE_POSITION_INDEPENDENT_CODE=TRUE \
    -D BUILD_SHARED_LIBS=ON \
    -D ADIOS2_USE_Python=OFF \
    -D ADIOS2_USE_Fortran=OFF \
    -D ADIOS2_USE_ZeroMQ=OFF \
    -D BUILD_TESTING=OFF \
    -D ADIOS2_BUILD_EXAMPLES=OFF \
    -D ADIOS2_USE_HDF5=OFF \
    -D ADIOS2_USE_MPI=ON \
    -D CMAKE_INSTALL_PREFIX=$HOME/.entity/adios2
# compile and install with
cmake --build build -j
cmake --install build
```


**Compiling & running the code**

So far, the gpu-aware MPI is not supported on `LUMI`. The configuration command for `Entity` is the following:

```sh
cmake -B build -D pgen=<PGEN> -D mpi=ON -D gpu_aware_mpi=OFF \
  -D CMAKE_CXX_COMPILER=hipcc -D CMAKE_C_COMPILER=hipcc \
  -D Kokkos_ROOT=$HOME/.entity/kokkos \
  -D adios2_ROOT=$HOME/.entity/adios2 \
  -D AMDGPU_TARGETS=gfx90a
``` 

If you also installed the `Kokkos` and `adios2` environment modules, you can skip the `Kokkos_ROOT` and `adios2_ROOT` flags.

The example submit script for running the code:

```slurm
#!/bin/bash -l
#SBATCH --job-name=examplejob       # Job name
#SBATCH --output=test.out           # Name of stdout output file
#SBATCH --error=test.err            # Name of stderr error file
#SBATCH --partition=standard-g      # partition name
#SBATCH --nodes=8                   # Total number of nodes 
#SBATCH --ntasks-per-node=8         # 8 MPI ranks per node
#SBATCH --gpus-per-node=8           # 8 GPU ranks per node (2 rank per physical GPU)
#SBATCH --time=48:00:00             # Run time (d-hh:mm:ss)
#SBATCH --account=project_<NUMBER>  # Project for billing

export MPICH_GPU_SUPPORT_ENABLED=1
srun ./entity.xc -input <INPUT>.toml
```
