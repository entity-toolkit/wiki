[`Vista`](https://tacc.utexas.edu/systems/vista/) cluster is a part of TACC research center. It consists of 600 Grace Hopper nodes, each hosting H100 GPU and 72 Grace CPUs. 

**Installing the dependencies**

`Vista` does not require any specific modules to be installed. Before compiling, the following modules should be loaded:

```sh
module load nvidia/24.7
module load cuda/12.5
module load kokkos/5.0.1-cuda
module load openmpi/5.0.5
module load adios2/2.11.0
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
