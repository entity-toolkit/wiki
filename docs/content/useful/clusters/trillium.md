Trillium is a large parallel cluster built by Lenovo Canada and hosted by SciNet at the University of Toronto, the GPU subcluster has 61 nodes each with 4 x Nvidia H100 SXM (80 GB memory) (HOPPER90 architecture) and 1 x AMD EPYC 9654 (Zen 4) @ 2.4 GHz, 384MB cache L3 (96 cores). `Entity` works largely out of the box on trillium with the exception of the HDF5 format and requiring GPU aware MPI to disabled. 

**Compiling & running the code**
The following modules are confirmed to have worked for building, compilation, running and restarting

```sh
module load gcc/12.3 cmake/3.31.0 cuda/12.6 openmpi/4.1.5
```

To disable hdf5, modify the following file in the entity source directory

```sh
/path_to_src/entity/cmake/adios2Config.cmake
```

changing
```cmake
# Format/compression support
set(ADIOS2_USE_HDF5
  OFF # <-- set this to OFF
  CACHE BOOL "Use HDF5 for ADIOS2")
```

When configuring ensure to set the flag

```sh
-D gpu_aware_mpi=OFF    
```

as the nodes are not properly configured to perform gpu to gpu direct communication (the code will still run, but errors will arise at mesh block boundaries, and the code itself will run much slower).

A typical pbs script for running entity on the gpu subcluster is

```sh
#!/bin/bash
#SBATCH --nodes=2
#SBATCH --gpus-per-node=4
#SBATCH --ntasks-per-node=4  # Keep all GPUs active
#SBATCH --time=23:59:59
#SBATCH --partition=compute_full_node
#SBATCH -o outjob_test.o%j
#SBATCH -e outjob_test.e%j
#SBATCH -J test

module load gcc/12.3 cmake/3.31.0 cuda/12.6 openmpi/4.1.5

mpirun --map-by ppr:4:node --bind-to core ./entity.xc -input fluxtube.toml
```

where here we have requested 2x4 gpus for the full 24 hour wall time. Note one can request 1, 4, and 8 gpus for brief interactive debug jobs with

```
$debugjob
$debugjob 1
$debugjob 2
```

To pip install the version of nt2py which works with the adios2 output format you will need to load the following modules

```sh
module load python texlive gcc arrow/21.0.0  
```
