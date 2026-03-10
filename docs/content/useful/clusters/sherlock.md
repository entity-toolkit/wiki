[`Sherlock`](https://www.sherlock.stanford.edu/docs/tech/#resources) is a cluster at Stanford University with GPU compute nodes featuring GPUs with several different NVIDIA architectures. 
The easiest way to set things up on `Sherlock` is to build your own `ADIOS2`:
```sh
module load gcc/12.4.0 openmpi/5.0.5 cmake/3.31.4
cmake -B build \
    -D CMAKE_CXX_STANDARD=20 \
    -D CMAKE_CXX_EXTENSIONS=OFF \
    -D CMAKE_POSITION_INDEPENDENT_CODE=TRUE \
    -D BUILD_SHARED_LIBS=ON \
    -D ADIOS2_USE_Python=OFF \
    -D ADIOS2_USE_Fortran=OFF \
    -D ADIOS2_USE_ZeroMQ=OFF \
    -D BUILD_TESTING=OFF \
    -D ADIOS2_BUILD_EXAMPLES=OFF \
    -D ADIOS2_USE_MPI=ON \
    -D ADIOS2_USE_HDF5=OFF \
    -D CMAKE_INSTALL_PREFIX=$HOME/modules/adios2_mpi
cmake --build build -j $(nproc)
cmake --install build
```
Add the installed `ADIOS2` as a modulefile as [described here](../../1-getting-started/2-dependencies/#__tabbed_2_3) (e.g., as `adios/mpi`). `Kokkos` can be quickly compiled in-tree, so no need to build it separately. For the compilation of the code itself, load the following modules:
```sh
module load gcc/12.4.0 cuda/12.6.0 openmpi/5.0.5
```
Then, simply compile the code with the following command:
```sh
cmake -B build -D mpi=ON -D Kokkos_ENABLE_CUDA=ON -D Kokkos_ARCH_HOPPER90=ON
cmake --build build -j $(nproc)
```
This particular configuration is for the H100 (Hopper) nodes.
```slurm
#SBATCH -C GPU_CC:9.0
#SBATCH -p gpu
#SBATCH -G 1
#SBATCH -c 2
#SBATCH --mem=32GB
module purge
module use --append /home/users/<USERNAME>/modules/.modfiles/
module load gcc/12.4.0
module load cuda/12.6.0
module load openmpi/5.0.5
module load adios/mpi
# either
mpiexec -np ... ./entity.xc -input <INPUTFILE>
# or
srun ./entity.xc -input <INPUTFILE>
```

`nt2py` has some known issues on this cluster, and might not work out of the box. However, you can make it work using the following steps.

First, load a proper `conda` module (preferably with `python3 >= 3.10`) and make a virtual environment: 

```sh
python3 -m venv .venv
source .venv/bin/activate
```

Manually install `pyarrow` version 20:

```sh
pip install pyarrow=20
```

Now install `nt2py` (without the `hdf5` support, since for some reason the compute node on which jupyter kernels are run cannot find the `HDF5` library):
```sh
pip install nt2py
```

When launching the jupyter kernels from the on-demand service, specify the following modules to load: `gcc/12.4.0` and `ucc`.
