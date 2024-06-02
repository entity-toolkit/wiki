---
hide:
  - footer
---

# Dependencies

`Entity` relies on several libraries, most of which can be compiled in-tree with the code itself. However, to speed up the compilation process, it is often beneficial to precompile the libraries and use those during the build process, either by setting the appropriate environment variables or by using environment modules. Alternatively, of course, you can use the libraries provided by your system package manager, or the cluster's module system.

The form below allows you to generate the appropriate build scripts and optionally the environment modules for the libraries you want to compile and install. Library interdependencies are automatically resolved, and the form will only show the necessary fields for the libraries you select.

<form id="dependencies-form">
  <div class="grid">
    <fieldset>
      <legend>Libraries to compile</legend>
      <p>
        <input type="checkbox" id="kokkos" name="lib_kokkos" value="kokkos">
        <label for="kokkos">Kokkos</label><br>
      </p>
      <p>
        <input type="checkbox" id="adios2" name="lib_adios2" value="adios2">
        <label for="adios2">ADIOS2</label><br>
      </p>
      <p>
        <input type="checkbox" id="hdf5" name="lib_hdf5" value="hdf5">
        <label for="hdf5">HDF5</label><br>
      </p>
      <p>
        <input type="checkbox" id="mpi" name="lib_mpi" value="mpi">
        <label for="mpi">MPI</label>
      </p>
    </fieldset>
    <fieldset id="configs_fieldset">
      <legend>Configurations</legend>
      <p>
        <input type="checkbox" id="use_modules" name="use_modules" value="use_modules">
        <label for="use_modules">Use environment modules</label><br>
      </p>
      <p>
        <div class="textfield" id="use_modules_path">
          <input placeholder="$HOME/.modules/modfiles" type="text" name="use_modules_path" />
          <label for="use_modules_path">Modulefiles parent directory</label>
        </div>
      </p>
      <p>
        <div class="textfield" id="host_compiler_module">
          <input placeholder="example: gcc/9" type="text" name="host_compiler_module" required />
          <label for="host_compiler_module">Host compiler</label>
        </div>
      </p>
      <p>
        <div class="textfield" id="gpu_compiler_module">
          <input placeholder="example: cudatoolkit/12.2" type="text" name="gpu_compiler_module" required />
          <label for="gpu_compiler_module">GPU compiler</label>
        </div>
      </p>
    </fieldset>
    <fieldset id="kokkos_fieldset">
      <legend>Kokkos settings</legend>
      <p>
        <div class="textfield" id="kokkos_module">
          <input placeholder="ex.: kokkos/cuda-12.2/gcc-11" type="text" name="kokkos_module" required />
          <label>Kokkos module</label>
        </div>
      </p>
      <p>
        <input type="checkbox" id="use_kokkos_debug" name="use_kokkos_debug" value="use_kokkos_debug">
        <label for="use_kokkos_debug">Debug mode</label><br>
      </p>
      <p>
        <input type="checkbox" id="kokkos_use_gpu" name="kokkos_use_gpu" value="kokkos_use_gpu">
        <label for="kokkos_use_gpu">GPU support</label><br>
      </p>
      <p>
        <label for="kokkos_cpuarch">CPU architecture: </label>
        <select name="kokkos_cpuarch" id="kokkos_cpuarch">
          <option value="NATIVE">Native</option>
          <optgroup label="ARM">
            <option value="A64FX">ARMv8.2 with SVE Support</option> 
            <option value="ARMV80">ARMv8.0</option>
            <option value="ARMV81">ARMv8.1</option>
            <option value="ARMV8_THUNDERX">ARMv8 ThunderX</option>
            <option value="ARMV8_THUNDERX2">ARMv8 ThunderX2</option>
          </optgroup>
          <optgroup label="AMD">
            <option value="AMDAVX">AMDAVX</option>
            <option value="ZEN">Zen</option>
            <option value="ZEN2">Zen 2</option>
            <option value="ZEN3">Zen 3</option>
          </optgroup>
          <optgroup label="Intel">
            <option value="SPR">Sapphire Rapids</option>
            <option value="SKX">Skylake</option>
            <option value="BDW">Broadwell</option>
            <option value="HSW">Haswell</option>
            <option value="SNB">Sandy Bridge</option>
            <option value="KNL">Knights Landing</option>
            <option value="KNC">Knights Corner</option>
          </optgroup>
          <optgroup label="IBM">
            <option value="POWER9">POWER9</option>
            <option value="POWER8">POWER8</option>
          </optgroup>
        </select>
      </p>
      <p id="kokkos_gpuarch_selector">
        <label for="kokkos_gpuarch">GPU architecture: </label>
        <select name="kokkos_gpuarch" id="kokkos_gpuarch">
          <option value="NATIVE">Native</option>
          <optgroup label="NVIDIA">
            <option value="HOPPER90">Hopper 9.0: H100</option>
            <option value="ADA89">Ada Lovelace 8.9: L4/L40</option>
            <option value="AMPERE86">Ampere 8.6: A40/A10/A16/A2</option>
            <option value="AMPERE80">Ampere 8.0: A100/A30</option>
            <option value="TURING75">Turing 7.5: T4</option>
            <option value="VOLTA72">Volta 7.2</option>
            <option value="VOLTA70">Volta 7.0: V100</option>
            <option value="PASCAL61">Pascal 6.1: P40/P4</option>
            <option value="PASCAL60">Pascal 6.0: P100</option>
            <option value="MAXWELL53">Maxwell 5.3</option>
            <option value="MAXWELL52">Maxwell 5.2: M60/M40</option>
            <option value="MAXWELL50">Maxwell 5.0</option>
            <option value="KEPLER37">Kepler 3.7: K80</option>
            <option value="KEPLER35">Kepler 3.5: K40/K20</option>
            <option value="KEPLER32">Kepler 3.2</option>
            <option value="KEPLER30">Kepler 3.0: K10</option>
          </optgroup>
          <optgroup label="AMD">
            <option value="AMD_GFX942">GFX942: MI300A/MI300X</option>
            <option value="AMD_GFX940">GFX940: MI300A (pre-production)</option>
            <option value="AMD_GFX90A">GFX90A: MI200 series</option>
            <option value="AMD_GFX908">GFX90A: MI100</option>
            <option value="AMD_GFX906">GFX906: MI50/MI60</option>
            <option value="AMD_GFX1100">GFX1100: 7900xt</option>
            <option value="AMD_GFX1030">GFX1030: V620/W6800</option>
          </optgroup>
          <optgroup label="Intel">
            <option value="INTEL_PVC">Xe-HPC: Max 1550</option>
            <option value="INTEL_XEHP">Xe-HP</option>
            <option value="INTEL_DG1">Iris Xe MAX (DG1)</option>
            <option value="INTEL_GEN12LP">Gen12LP: UHD Graphics 770</option>
            <option value="INTEL_GEN11">Gen11: UHD Graphics</option>
            <option value="INTEL_GEN9">Gen9: HD Graphics 510/Iris Pro 580</option>
            <option value="INTEL_GEN">Just-In-Time compilation</option>
          </optgroup>
        </select>
      </p>
      <p>
        <div class="textfield" id="kokkos_src">
          <input placeholder="$HOME/src/kokkos" type="text" name="kokkos_src" />
          <label>Path to source code</label>
        </div>
      </p>
      <p>
        <div class="textfield" id="kokkos_install">
          <input placeholder="$HOME/.modules/kokkos" type="text" name="kokkos_install" />
          <label>Install path</label>
        </div>
      </p>
    </fieldset>
    <fieldset id="adios2_fieldset">
      <legend>ADIOS2 settings</legend>
      <p>
        <div class="textfield" id="adios2_module">
          <input placeholder="ex.: adios2/gcc-11/hdf5-1.14" type="text" name="adios2_module" required />
          <label>ADIOS2 module</label>
        </div>
      </p>
      <p>
        <input type="checkbox" id="adios2_use_mpi" name="adios2_use_mpi" value="adios2_use_mpi">
        <label for="adios2_use_mpi">MPI support</label><br>
      </p>
      <p>
        <div class="textfield" id="adios2_src">
          <input placeholder="$HOME/src/adios2" type="text" name="adios2_src" />
          <label>Path to source code</label>
        </div>
      </p>
      <p>
        <div class="textfield" id="adios2_install">
          <input placeholder="$HOME/.modules/adios2" type="text" name="adios2_install" />
          <label>Install path</label>
        </div>
      </p>
      <p>
        <div class="textfield" id="adios2_mpi_path">
          <input placeholder="$MPIHOME" type="text" name="adios2_mpi_path" />
          <label>Path to MPI installation</label>
        </div>
      </p>
      <p>
        <div class="textfield" id="adios2_mpi_module">
          <input placeholder="example: open-mpi/5.0" type="text" id="adios2_mpi_module" name="adios2_mpi_module" />
          <label>MPI module name</label>
        </div>
      </p>
      <p>
        <div class="textfield" id="adios2_hdf5_path">
          <input placeholder="$HDF5_ROOT" type="text" name="adios2_hdf5_path" />
          <label>Path to HDF5 installation</label>
        </div>
      </p>
      <p>
        <div class="textfield" id="adios2_hdf5_module">
          <input placeholder="example: hdf5/1.14.2" type="text" id="adios2_hdf5_module" name="adios2_hdf5_module" />
          <label>HDF5 module name</label>
        </div>
      </p>
    </fieldset>
    <fieldset id="hdf5_fieldset">
      <legend>HDF5 settings</legend>
      <p>
        <div class="textfield" id="hdf5_module">
          <input placeholder="ex.: hdf5/mpi-5.0.2" type="text" name="hdf5_module" required />
          <label>HDF5 module</label>
        </div>
      </p>
      <p>
        <input type="checkbox" id="hdf5_use_mpi" name="hdf5_use_mpi" value="hdf5_use_mpi">
        <label for="hdf5_use_mpi">MPI support</label><br>
      </p>
      <p>
        <div class="textfield" id="hdf5_src">
          <input placeholder="$HOME/src/hdf5" type="text" name="hdf5_src" />
          <label>Path to source code</label>
        </div>
      </p>
      <p>
        <div class="textfield" id="hdf5_install">
          <input placeholder="$HOME/.modules/hdf5" type="text" name="hdf5_install" />
          <label>Install path</label>
        </div>
      </p>
      <p>
        <div class="textfield" id="hdf5_mpi_path">
          <input placeholder="$MPIHOME" type="text" name="hdf5_mpi_path" />
          <label>Path to MPI installation</label>
        </div>
      </p>
      <p>
        <div class="textfield" id="hdf5_mpi_module">
          <input placeholder="example: open-mpi/5.0" type="text" id="hdf5_mpi_module" name="hdf5_mpi_module" />
          <label>MPI module name</label>
        </div>
      </p>
    </fieldset>
    <fieldset id="mpi_fieldset">
      <legend>MPI settings</legend>
      <p>
        <div class="textfield" id="mpi_module">
          <input placeholder="ex.: openmpi/5.0.2" type="text" name="mpi_module" required />
          <label>MPI module</label>
        </div>
      </p>
      <p>
        <input type="checkbox" id="mpi_use_gpu" name="mpi_use_gpu" value="mpi_use_gpu">
        <label for="mpi_use_gpu">GPU support</label><br>
      </p>
      <p>
        <div class="textfield" id="mpi_src">
          <input placeholder="$HOME/src/mpi" type="text" name="mpi_src" />
          <label>Path to source code</label>
        </div>
      </p>
      <p>
        <div class="textfield" id="mpi_install">
          <input placeholder="$HOME/.modules/mpi" type="text" name="mpi_install" />
          <label>Install path</label>
        </div>
      </p>
    </fieldset>
  </div>
</form>

## Build scripts

```sh title="Kokkos build/install script"
```

```sh title="ADIOS2 build/install script"
```

```sh title="HDF5 build/install script"
```

```sh title="MPI build/install script"
```

## Modulefiles

```sh title=""
```

```sh title=""
```

```sh title=""
```

```sh title=""
```

```sh title=""
```

!!! note

    We also provide a command-line tool called [`ntt-dploy`](https://github.com/entity-toolkit/ntt-dploy) which can be used for the same purpose.

!!! note

    The code assumes that the source codes for each library are already downloaded and placed in the appropriate directories. Here's where you can download the source codes:
    
    - Kokkos: [https://github.com/kokkos/kokkos/releases](https://github.com/kokkos/kokkos/releases);
    - ADIOS2: [https://github.com/ornladios/ADIOS2/releases](https://github.com/ornladios/ADIOS2/releases);
    - HDF5: [https://github.com/HDFGroup/hdf5/releases/](https://github.com/HDFGroup/hdf5/releases/), ZLIB: [https://github.com/madler/zlib/releases](https://github.com/madler/zlib/releases), LIBAEC: [https://github.com/MathisRosenhauer/libaec/releases](https://github.com/MathisRosenhauer/libaec/releases); follow instructions [here](https://github.com/HDFGroup/hdf5/blob/develop/release_docs/INSTALL_CMake.txt) to place the proper source files;
    - Open MPI: [https://github.com/open-mpi/ompi](https://github.com/open-mpi/ompi).

<script src="../dependencies.js"></script>