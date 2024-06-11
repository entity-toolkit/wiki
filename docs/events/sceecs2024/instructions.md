---
hide:
  - footer
---

There are two environments for running the code: the WUSTL cluster, and the CCA (Flatiron Inst. Cluster). Either should work ok, but the resources on the CCA cluster might be limited. Below are the instructions for both of these:


=== "WUSTL cluster"

    1. First, open a terminal, and connect to the WUSTL cluster using
        ```sh
        # enter your username here which starts with `WG-`
        ssh <USERNAME>@compute1-client-1.ris.wustl.edu
        ```

    2. Make sure you have the proper `LSF_DOCKER_VOLUMES` environment variable set, by either running the following once:
        ```sh
        mkdir -p /storage1/fs1/workshops/Active/ExtremePlasmas/$USER
        export LSF_DOCKER_VOLUMES="/storage1/fs1/workshops/Active/ExtremePlasmas/$USER:/scratch $HOME:$HOME"
        ```
        or adding it to your `~/.bashrc` file and running `source ~/.bashrc`.

    3. Launch the following job that requests a GPU with at least 16GB of VRAM (GPU memory), and 64 GB of RAM (CPU memory):
        ```sh
        thpc-terminal -q general-interactive -R 'gpuhost rusage[mem=64GB]' -gpu 'num=1:gmem=16G' -a 'docker(morninbru/arch-entity:cuda)' /bin/bash
        ```

        Notice that we are using the `general-interactive` queue, as the `workshop` queue does not allow custom containers.

    4. Clone the code from the github repository by running:
        ```sh
        git clone -b v1.0.0rc --recursive https://github.com/entity-toolkit/entity.git
        cd entity
        ```

=== "CCA cluster"

    1. Go to the following website in your browser: [binder.flatironinstitute.org](https://binder.flatironinstitute.org). 

    2. Click "Sign in with Google" and... well... sign in with Google.
 
    3. Under "Choose project" enter `hhakobyan` for the "Owner," and `entity` for the "Project," and hit "Launch."
   
    4. You should be greeted with a Jupyter lab window, and the `entity` is already cloned to the home directory.
   
    5. You may open the terminal from the Launcher.


!!! note "GPU architecture"
    
    You will need to know the architecture of the GPU (in this case it will be an NVIDIA GPU). You can find that out by running `nvidia-smi` in the shell. It should either be `Tesla V100` or `Ampere A100`/`A40`. You will only need the first letter: `A` or `V` -- this indicates the microarchitecture of the GPU which you need to tell the code to optimize compilation for that specific device.

## Compiling and running tests

The code is prepared for running in two steps: first you configure it with whatever settings you need, and then compile. The command for configuring the code in test mode is the following:

```sh
#   directory for the compilation files
#          |
#          v
cmake -B build -D TESTS=ON -D output=ON -D Kokkos_ENABLE_CUDA=ON -D Kokkos_ARCH_AMPERE80=ON
#                   ^             ^                 ^                        ^
#                   |             |                 |                        |
#         enable test mode        |      enable CUDA (GPU support)           |
#                         enable the output                         microarchitecture of the GPU
```

Compilation is always done with the following command:
```sh
cmake --build build -j 4
```

If you are running this on the `A100`/`A40` GPUs, specify `Kokkos_ARCH_AMPERE80=ON` as shown above, otherwise if compiling on `V100` GPUs, use `Kokkos_ARCH_VOLTA70=ON`. 

This might take some time, as `CUDA` compiler is typically quite slow, and test mode compiles the code with different configurations. Once it is done (you should see `100%` written in green). You can now run the tests with the following command:

```sh
ctest --test-dir build
```

All tests (there are about 33 of them) should complete with a "Passed" mark. 


## Exercise \#1

In this exercise we will inspect the so-called Weibel/filamentation instability in pair-plasmas. The initial setup is quite simple: two cold ($T\ll m_e c^2$) neutral ($n_+=n_-$) pair-plasma beams counterstream in $\pm z$ direction with relativistic velocities $\pm\bm{u}_d$. The net current in the system is exactly $0$. The simulation is performed in the $xy$, so only $k_{xy}$ perturbation modes can be excited. The system with a kinetic equilibrium, which is, however unstable, as any perturbation in the current density in $z$ will drive a magnetic field in $xy$ plane, which in turn will tend to amplify the current density in $z$.

### Preliminaries

The problem generator is located in `setups/srpic/weibel/pgen.hpp` of the Entity repository. To configure/compile use the following command:
```sh
cmake -B build -D pgen=srpic/weibel -D output=ON -D Kokkos_ENABLE_CUDA=ON -D Kokkos_ARCH_AMPERE80=ON
#                        ^               ^                    ^                           ^
#                        |               |                    |                           |
#                        |        enable code output          |                    architecture of the GPU
#             problem generator to use             enable GPU support with CUDA    (A100/A40/etc. use **_AMPERE80, V100 -- use **_VOLTA70)
#                                                                                  to check the architecture -- run `nvidia-smi`
cmake --build build -j 4
```

Once the compilation is done, you should have the executable file in `build/src/entity.xc`. The other ingredient required to run the code is the input file, located together with the problem generator: `setups/srpic/weibel/weibel.toml`. To run the code, copy both the executable and the input `toml` file to the same directory:

```sh
# example:
cd run-directory
cp /path/to/entity/build/src/entity.xc .
cp /path/to/entity/setups/srpic/weibel/weibel.toml .
# then run
./entity.xc -input weibel.toml
```

Carefully inspect the `weibel.toml`. We will be exploring the dependency of the instability growth rate on two parameters: the plasma skin-depth, $d_\pm$, and the relativistic drift velocity $u_d$. Run the simulation with several values of these parameters, and compare the growth rate with the analytic expression: $\Gamma = \omega_\pm \beta_d \sqrt{2/\gamma_d}$, where $\gamma_d = \sqrt{1+u_d^2}$ and $\beta_d = u_d / \gamma_d$.

## Exercise \#2

Reconnection (yet-to-be-written).

## Exercise \#3

Spinning monopole/dipole (yet-to-be-written).