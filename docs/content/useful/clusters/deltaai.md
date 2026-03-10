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
    -D CMAKE_CXX_STANDARD=20 \
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
    -D CMAKE_CXX_STANDARD=20 \
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
module load kokkos/5.0.1
module load entity/cuda
module load adios2/2.11.0
module list

export MPICH_GPU_SUPPORT_ENABLED=1
export MPICH_OFI_VERBOSE=1

srun ./entity.xc -input <INPUT>.toml
```
