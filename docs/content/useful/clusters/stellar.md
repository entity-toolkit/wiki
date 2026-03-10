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
