[`Perlmutter`](https://docs.nersc.gov/systems/perlmutter/architecture/) is a DoE cluster in LBNL with 4x NVIDIA A100 and a AMD EPYC 7763 CPU on each node. Note, that two different GPU configurations are available with 40 and 80 GB of VRAM respectively.

**Installing the dependencies**

!!! note "Using the `dependencies.py`"

    <span class="since-version">1.4.0</span>
    Simply pick the `perlmutter` option from the cluster-specific parameters from the `dependencies.py` file included with the root of the code, and then run `$HOME/.entity/install.sh` which will both compile and install the dependencies and create modulefiles.

The easiest way to use the code here is to compile and install your own modules manually. First, load the modules you will need for that:

```sh
module load gpu/1.0
```

Download the `Kokkos` source code, configure/compile and install it (in this example, we install it in the `~/opt` directory.

```sh
wget https://github.com/kokkos/kokkos/releases/download/5.0.1/kokkos-5.0.1.tar.gz
tar xvf kokkos-5.0.1.tar.gz
cd kokkos-5.0.1
cmake -B build -D CMAKE_CXX_STANDARD=20 \
    -D CMAKE_BUILD_TYPE=Release \
    -D CMAKE_CXX_EXTENSIONS=OFF \
    -D CMAKE_POSITION_INDEPENDENT_CODE=TRUE \
    -D CMAKE_CXX_COMPILER=CC \
    -D Kokkos_ENABLE_CUDA=ON \
    -D Kokkos_ENABLE_IMPL_CUDA_MALLOC_ASYNC=OFF \
    -D Kokkos_ARCH_ZEN3=ON \
    -D Kokkos_ARCH_AMPERE80=ON \
    -D CMAKE_INSTALL_PREFIX=$HOME/opt/kokkos/5.0.1/
cmake --build build -j
cmake --install build
```

Now the `ADIOS2`:

```sh
wget https://github.com/ornladios/ADIOS2/archive/refs/tags/v2.11.0.tar.gz
tar xvf v2.11.0.tar.gz
cd ADIOS2-2.11.0
cmake -B build -D CMAKE_CXX_STANDARD=20 \
    -D CMAKE_CXX_EXTENSIONS=OFF \
    -D CMAKE_POSITION_INDEPENDENT_CODE=TRUE \
    -D BUILD_SHARED_LIBS=ON \
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

set                basedir      /global/homes/h/<USER>/opt/kokkos/5.0.1
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

set                basedir      /global/homes/h/<USER>/opt/adios2/v2.11.0
prepend-path       PATH         $basedir/bin
setenv             ADIOS2_DIR   $basedir

setenv ADIOS2_USE_HDF5      ON
setenv ADIOS2_USE_MPI       ON
setenv ADIOS2_HAVE_HDF5_VOL ON
setenv MPI_ROOT             /opt/cray/pe/mpich/8.1.30/ofi/gnu/12.3

prereq cray-mpich/8.1.30 
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
