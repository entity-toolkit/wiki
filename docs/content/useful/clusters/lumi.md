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
