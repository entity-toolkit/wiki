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
