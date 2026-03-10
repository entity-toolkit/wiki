[`SuperMUC-NG2`](https://docs.alcf.anl.gov/aurora/) uses [Intel PVC](https://www.intel.com/content/www/us/en/products/sku/232873/intel-data-center-gpu-max-1550/specifications.html) nodes with 4 GPUs/node. Each PVC has 128GB of memory and is split into 2 tiles. It is recommended to use 1 MPI rank per tile, so 2 per GPU and 8 per node.
Development of entity for `SuperMUC` is currently ongoing. Use the following docs with caution and check in with `@LudwigBoess` on potential changes.

**Modules to load**

You can load the installed dependencies with

```sh
# old
# ml cmake
# module load cmake gcc/14.2.0
# source /lrz/sys/intel/oneapi_2025.3.0/setvars.sh &> /dev/null

# new 
module sw stack/24.5.0
module load cmake gcc/14.2.0
module load intel-toolkit/2025.2.0
```

**Building the dependencies**

Please note that SuperMUC does not have direct access to the internet, so you have to set up a proxy and reverse tunnel ([docs](https://doku.lrz.de/faq-installing-your-own-applications-on-supermug-ng-behind-a-firewall-10746066.html#FAQ:InstallingyourownapplicationsonSuperMUGNG(behindafirewall)-CreateareverseSSHtunnelforinternetaccessfromSuperMUC-NGloginnode)).

Big thanks to Martin at LRZ support for setting up the following build script for entity's dependencies:

```sh
export INSTALL_DIR="/path/where/you/want/the/install" # change!
export KOKKOS_VERSION="4.7.00"
export ADIOS2_VERSION="v2.10.2"

export NUM_BUILD_THREADS=40

#set -e

module load cmake gcc/14.2.0
source /lrz/sys/intel/oneapi_2025.2.0/setvars.sh &> /dev/null
export CC=$(which icx)
export CXX=$(which icpx)
export FC=$(which ifx)

install_kokkos() {
if [ ! -d kokkos-src ]; then
    git clone https://github.com/kokkos/kokkos.git kokkos-src
    cd kokkos-src
    git checkout $KOKKOS_VERSION
    cd ..
fi

rm -rf build-kokkos

cmake -DCMAKE_INSTALL_PREFIX=$INSTALL_DIR/kokkos \
        -DBUILD_SHARED_LIBS=OFF \
        -DKokkos_ARCH_INTEL_PVC=ON \
        -DKokkos_ARCH_SPR=ON \
        -DKokkos_ENABLE_EXAMPLES=ON \
        -DKokkos_ENABLE_ONEDPL=ON \
        -DKokkos_ENABLE_OPENMP=OFF \
        -DKokkos_ENABLE_SERIAL=ON \
        -DKokkos_ENABLE_SYCL=ON \
        -DKokkos_ENABLE_SYCL_RELOCATABLE_DEVICE_CODE=ON \
        -B build-kokkos \
        -S kokkos-src

cmake --build build-kokkos -j $NUM_BUILD_THREADS

cmake --install build-kokkos
}


install_adios2() {
if [ ! -d adios2-src ]; then
    git clone https://github.com/ornladios/ADIOS2.git adios2-src
    cd adios2-src
    git checkout $ADIOS2_VERSION
    cd ..
fi

rm -rf build-adios2

cmake -DCMAKE_INSTALL_PREFIX=$INSTALL_DIR/adios2 \
        -DCMAKE_C_COMPILER=$(which mpiicx) \
        -DCMAKE_CXX_COMPILER=$(which mpiicpx) \
        -DCMAKE_Fortran_COMPILER=$(which mpiifx) \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_POSITION_INDEPENDENT_CODE=OFF \
        -DADIOS2_USE_AWSSDK=OFF \
        -DADIOS2_USE_Blosc2=OFF \
        -DADIOS2_USE_BZip2=ON \
        -DADIOS2_USE_DataSpaces=OFF \
        -DADIOS2_USE_HDF5=OFF \
        -DADIOS2_USE_MPI=ON \
        -DADIOS2_USE_PNG=OFF \
        -DADIOS2_USE_Python=OFF \
        -DADIOS2_USE_SST=ON \
        -DADIOS2_USE_SZ=OFF \
        -DADIOS2_USE_ZFP=OFF \
        -DADIOS2_USE_Catalyst=OFF \
        -DADIOS2_USE_LIBPRESSIO=OFF \
        -DADIOS2_USE_CUDA=OFF \
        -DADIOS2_USE_Kokkos=OFF \
        -DBUILD_TESTING=OFF \
        -DADIOS2_BUILD_EXAMPLES=OFF \
        -DADIOS2_USE_Endian_Reverse=ON \
        -DADIOS2_USE_IME=OFF \
        -DADIOS2_USE_MGARD=OFF \
        -DCMAKE_DISABLE_FIND_PACKAGE_BISON=TRUE \
        -DCMAKE_DISABLE_FIND_PACKAGE_FLEX=TRUE \
        -B build-adios2 \
        -S adios2-src

cmake --build build-adios2 -j $NUM_BUILD_THREADS

cmake --install build-adios2

}

[ ! -d $INSTALL_DIR/kokkos ] && install_kokkos
export CMAKE_PREFIX_PATH=$CMAKE_PREFIX_PATH:$INSTALL_DIR/kokkos/lib64/cmake

[ ! -d $INSTALL_DIR/adios2 ] && install_adios2
export CMAKE_PREFIX_PATH=$CMAKE_PREFIX_PATH:$INSTALL_DIR/adios2/lib64/cmake
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$INSTALL_DIR/adios2/lib64

#[ ! -d $INSTALL_DIR/entity ] && install_entity

echo " If this builds without errors: Congratulations!"
echo " Please set your envirnoment as follows:"
echo "    module load cmake gcc/14.2.0"
echo "    source /lrz/sys/intel/oneapi_2025.2.0/setvars.sh &> /dev/null"
echo "    export LD_LIBRARY_PATH=\$LD_LIBRARY_PATH:$INSTALL_DIR/adios2/lib64"
echo "    export PATH=\$PATH:$INSTALL_DIR/entity/bin"
```

Please note that this version of `adios2` is installed without `HDF5` support!

You can compile `entity` with:

```sh
cmake -B build -D pgen=streaming -D precision=single -D mpi=ON -D output=OFF -Dgpu_aware_mpi=OFF -DCMAKE_C_COMPILER=$(which mpiicx) -DCMAKE_CXX_COMPILER=$(which mpiicpx) -DFETCHCONTENT_FULLY_DISCONNECTED=ON

cmake --build build -j16
```

**Running entity**

This is an example SLURM script:

```sh
#!/bin/bash
#SBATCH -J weibel
#SBATCH -o ./log/%N.%j.out
#SBATCH -D .
#SBATCH --partition=test
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=8   # one task per tile
#SBATCH --account=<project>
#SBATCH --export=none
#SBATCH --time=00:30:00

module load slurm_setup

module sw stack/24.5.0
module load cmake gcc/14.2.0
module load intel-toolkit/2025.2.0
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/dss/dsshome1/02/di38gak/libs/adios2/lib64
module list

export I_MPI_OFFLOAD=1 
export I_MPI_OFFLOAD_RDMA=1 
export I_MPI_OFFLOAD_FAST_MEMCPY_COLL=1 
export PSM3_RDMA=1 
export PSM3_GPUDIRECT=0 # this will hopefully be fixed in the future

# this is just for debugging reasons
export I_MPI_DEBUG=5

export OMP_PROC_BIND=spread 
export OMP_PLACES=threads
export OMP_NUM_THREADS=8

export ZE_FLAT_DEVICE_HIERARCHY=FLAT
export ONEAPI_DEVICE_SELECTOR=level_zero:gpu

# print configuration as sanit check
mpiexec ./entity.xc --kokkos-print-configuration -input weibel.toml

```
