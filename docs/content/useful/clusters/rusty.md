`Rusty` cluster at Flatiron Institute has 36 nodes with 4 NVIDIA A100-80GB each and 36 nodes with 4 NVIDIA A100-40GB GPUs each and 64-core Icelake CPUs. It also has 18 nodes with 8 NVIDIA H100-80GB GPUs each and same CPU architecture. We will use nodes with A100 GPUs for the example below.

**Installing the dependencies**

!!! note "Using the `dependencies.py`"

    <span class="since-version">1.4.0</span>
    Simply pick the `rusty` option from the cluster-specific parameters from the `dependencies.py` file included with the root of the code, and then run `$HOME/.entity/install.sh` which will both compile and install the dependencies and create modulefiles.

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
ml modules/2.4-20250724 gcc/13.3.0 cuda/12.5.1 openmpi/cuda-4.1.8 hdf5/mpi-1.12.3
spack compiler add
spack external find
spack external find cuda
spack external find openmpi
spack external find hdf5
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

To compile the code, load the modules and activate the spack enviroment: 
```sh
module purge
ml modules/2.4-20250724 gcc/13.3.0 cuda/12.5.1 openmpi/cuda-4.1.8 hdf5/mpi-1.12.3
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
ml modules/2.4-20250724 gcc/13.3.0 cuda/12.5.1 openmpi/cuda-4.1.8 hdf5/mpi-1.12.3
. <HOME>/spack/share/spack/setup-env.sh
spack env activate entity-env
export LD_PRELOAD=/mnt/sw/fi/cephtweaks/lib/libcephtweaks.so
export CEPHTWEAKS_LAZYIO=1

srun entity.xc -input <INPUT>.toml
```

(*) total number of nodes
