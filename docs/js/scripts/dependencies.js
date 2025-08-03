document.addEventListener(
  "DOMContentLoaded",
  () => {
    const all_tabs = document
      .querySelector("#building-dependencies-from-source ~ .tabbed-set")
      .querySelector(".tabbed-content")
      .getElementsByClassName("tabbed-block");
    let tabs = {
      mpi: all_tabs[0],
      hdf5: all_tabs[1],
      adios2: all_tabs[2],
      kokkos: all_tabs[3],
    };

    const kokkos_use_gpu = () =>
      document.getElementById("kokkos_use_gpu").checked;
    const kokkos_cpu_arch = () =>
      tabs.kokkos.querySelector("#kokkos_cpuarch").value;
    const kokkos_gpu_arch = () =>
      tabs.kokkos.querySelector("#kokkos_gpuarch").value;

    const MPI_compile_script = (cuda) => {
      let result = "";
      result += `mkdir -p build
cd build
../configure --with-devel-headers \\
             --prefix=<MPI_INSTALL_DIR> \\
             --enable-mpi-fortran=no`;
      if (cuda) {
        result += ` \\
             --with-cuda=$CUDA_HOME`;
      }
      return result;
    };

    const MPI_module = () =>
      `#%Module1.0######################################################################
##
## MPI modulefile
##
#################################################################################
proc ModulesHelp { } {
  puts stderr "\\tMPI\\n"
}

module-whatis      "Sets up MPI"

conflict           mpi ompi openmpi mpich intel-mpi open-mpi

set                basedir               <MPI_INSTALL_DIR>
prepend-path       PATH                  $basedir/bin
prepend-path       LD_LIBRARY_PATH       $basedir/lib

append-path -d { } LOCAL_LDFLAGS      -L $basedir/lib
append-path -d { } LOCAL_INCLUDE      -I $basedir/include
append-path -d { } LOCAL_CFLAGS       -I $basedir/include
append-path -d { } LOCAL_FCFLAGS      -I $basedir/include
append-path -d { } LOCAL_CXXFLAGS     -I $basedir/include

setenv             CXX                   $basedir/bin/mpicxx
setenv             CC                    $basedir/bin/mpicc

setenv             MPIHOME               $basedir
setenv             MPI_HOME              $basedir
setenv             OPENMPI_HOME          $basedir`;

    const HDF5_compile_script = (mpi) =>
      `ctest -S HDF5config.cmake,${mpi ? "MPI=true," : ""}BUILD_GENERATOR=Unix,INSTALLDIR=<HDF5_INSTALL_DIR> -C Release -VV -O hdf5.log\ncd build\nmake install`;

    const HDF5_module = (
      _,
    ) => `#%Module1.0######################################################################
##
## HDF5 modulefile
##
#################################################################################
proc ModulesHelp { } {
  puts stderr "\\tHDF5\\n"
}

module-whatis      "Sets up HDF5"    

conflict           hdf5 phdf5 hdf5-mpi hdf5-parallel

set                basedir               <HDF5_INSTALL_DIR>
prepend-path       PATH                  $basedir/bin
prepend-path       LD_LIBRARY_PATH       $basedir/lib
prepend-path       LIBRARY_PATH          $basedir/lib
prepend-path       MANPATH               $basedir/man
prepend-path       HDF5_ROOT             $basedir
prepend-path       HDF5DIR               $basedir
append-path        -d { } LDFLAGS        -L$basedir/lib
append-path        -d { } INCLUDE        -I$basedir/include
append-path        CPATH                 $basedir/include
append-path        -d { } FFLAGS         -I$basedir/include
append-path        -d { } FCFLAGS        -I$basedir/include
append-path        -d { } LOCAL_LDFLAGS  -L$basedir/lib
append-path        -d { } LOCAL_INCLUDE  -I$basedir/include
append-path        -d { } LOCAL_CFLAGS   -I$basedir/include
append-path        -d { } LOCAL_FFLAGS   -I$basedir/include
append-path        -d { } LOCAL_FCFLAGS  -I$basedir/include
append-path        -d { } LOCAL_CXXFLAGS -I$basedir/include`;

    const ADIOS2_compile_script = (mpi) =>
      `cmake -B build \\
    -D CMAKE_CXX_STANDARD=17 \\
    -D CMAKE_CXX_EXTENSIONS=OFF \\
    -D CMAKE_POSITION_INDEPENDENT_CODE=TRUE \\
    -D BUILD_SHARED_LIBS=ON \\
    -D ADIOS2_USE_HDF5=ON \\
    -D ADIOS2_USE_Python=OFF \\
    -D ADIOS2_USE_Fortran=OFF \\
    -D ADIOS2_USE_ZeroMQ=OFF \\
    -D BUILD_TESTING=OFF \\
    -D ADIOS2_BUILD_EXAMPLES=OFF \\
    -D ADIOS2_USE_MPI=${mpi ? "ON" : "OFF"} \\
    -D ADIOS2_HAVE_HDF5_VOL=${mpi ? "ON" : "OFF"} \\
    -D CMAKE_INSTALL_PREFIX=<ADIOS2_INSTALL_DIR>`;

    const ADIOS2_module = (
      mpi,
    ) => `#%Module1.0######################################################################
##
## ADIOS2 modulefile
##
#################################################################################
proc ModulesHelp { } {
puts stderr "\\tADIOS2\\n"
}

module-whatis      "Sets up ADIOS2"    

conflict           adios2

set                basedir      <ADIOS2_INSTALL_DIR>
prepend-path       PATH         $basedir/bin
setenv             ADIOS2_DIR   $basedir

setenv ADIOS2_USE_HDF5 ON
setenv ADIOS2_USE_MPI ${mpi ? "ON" : "OFF"}
setenv ADIOS2_HAVE_HDF5_VOL ${mpi ? "ON" : "OFF"}`;

    const kokkos_flags = (use_gpu, cpuarch, gpuarch) => {
      let flags = [];
      flags.push(`Kokkos_ARCH_${cpuarch}`);
      let framework = undefined;
      if (use_gpu && gpuarch !== "NATIVE") {
        const selectBox = document.getElementById("kokkos_gpuarch");
        const vendor =
          selectBox.options[selectBox.selectedIndex].parentNode.label;
        framework =
          vendor === "NVIDIA" ? "CUDA" : vendor === "AMD" ? "HIP" : "SYCL";
        flags.push(`Kokkos_ARCH_${gpuarch}`);
        flags.push(`Kokkos_ENABLE_${framework}`);
      }
      return { flags, framework };
    };

    const Kokkos_compile_script = (use_gpu, cpuarch, gpuarch) => {
      let result = `cmake -B build  \\
      -D CMAKE_CXX_STANDARD=17 \\
      -D CMAKE_CXX_EXTENSIONS=OFF \\
      -D CMAKE_POSITION_INDEPENDENT_CODE=TRUE`;
      if (use_gpu && gpuarch === "NATIVE") {
        return `Error: please specify the GPU architecture in the dropdown menu above`;
      }
      const { flags, framework } = kokkos_flags(use_gpu, cpuarch, gpuarch);
      flags.forEach((flag) => {
        result += ` \\
      -D ${flag}=ON`;
      });
      if (framework === "HIP") {
        result += ` \\
      -D CMAKE_C_COMPILER=hipcc \\
      -D CMAKE_CXX_COMPILER=hipcc`;
      }
      result += ` \\
      -D CMAKE_INSTALL_PREFIX=<KOKKOS_INSTALL_DIR>`;
      return result;
    };

    const Kokkos_module = (use_gpu, cpuarch, gpuarch) => {
      let result = `#%Module1.0######################################################################
##
## Kokkos @ NATIVE modulefile
##
#################################################################################
proc ModulesHelp { } {
  puts stderr "\\tKokkos @ NATIVE\\n"
}

module-whatis      "Sets up Kokkos @ NATIVE"    

conflict           kokkos

set                basedir      <KOKKOS_INSTALL_DIR>
prepend-path       PATH         $basedir/bin
setenv             Kokkos_DIR   $basedir`;

      kokkos_flags(use_gpu, cpuarch, gpuarch).flags.forEach((flag) => {
        result += `\nsetenv             ${flag} ON`;
      });
      return result;
    };

    const update = (tab, category, newtext) => {
      const pre = tabs[tab].querySelector(`.${category}`).querySelector("pre");
      pre.querySelector("code").remove();
      const code_elem = document.createElement("code");
      pre.appendChild(code_elem);
      code_elem.textContent = newtext;
      hljs.highlightElement(code_elem, true);
    };

    const update_kokkos = (use_gpu) => {
      update(
        "kokkos",
        "script",
        Kokkos_compile_script(
          use_gpu === undefined ? kokkos_use_gpu() : use_gpu,
          kokkos_cpu_arch(),
          kokkos_gpu_arch(),
        ),
      );
      update(
        "kokkos",
        "module",
        Kokkos_module(
          use_gpu === undefined ? kokkos_use_gpu() : use_gpu,
          kokkos_cpu_arch(),
          kokkos_gpu_arch(),
        ),
      );
      tabs.kokkos.querySelector("#kokkos_gpuarch_selector").style.display =
        kokkos_use_gpu() ? "block" : "none";
    };

    const init = () => {
      Object.keys(tabs).forEach((tab) => {
        const tab_obj = tabs[tab];
        const script = tab_obj.querySelector(".script");
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        pre.appendChild(code);
        script.appendChild(pre);
        code.className = "language-bash";
        code.textContent = "";
        hljs.highlightElement(code, true);
      });

      Object.keys(tabs).forEach((tab) => {
        const tab_obj = tabs[tab];
        const script = tab_obj.querySelector(".module");
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        pre.appendChild(code);
        script.appendChild(pre);
        code.textContent = "";
        hljs.highlightElement(code, true);
      });

      update(
        "mpi",
        "script",
        MPI_compile_script(document.getElementById("mpi_use_cuda").checked),
      );
      update("mpi", "module", MPI_module());

      update(
        "hdf5",
        "script",
        HDF5_compile_script(document.getElementById("hdf5_use_mpi").checked),
      );
      update(
        "hdf5",
        "module",
        HDF5_module(document.getElementById("hdf5_use_mpi").checked),
      );

      update(
        "adios2",
        "script",
        ADIOS2_compile_script(
          document.getElementById("adios2_use_mpi").checked,
        ),
      );
      update(
        "adios2",
        "module",
        ADIOS2_module(document.getElementById("adios2_use_mpi").checked),
      );

      update_kokkos();
    };

    init();

    document
      .getElementById("mpi_use_cuda")
      .addEventListener("change", (event) => {
        update("mpi", "script", MPI_compile_script(event.target.checked));
      });

    document
      .getElementById("hdf5_use_mpi")
      .addEventListener("change", (event) => {
        update("hdf5", "script", HDF5_compile_script(event.target.checked));
        update("hdf5", "module", HDF5_module(event.target.checked));
      });

    document
      .getElementById("adios2_use_mpi")
      .addEventListener("change", (event) => {
        update("adios2", "script", ADIOS2_compile_script(event.target.checked));
        update("adios2", "module", ADIOS2_module(event.target.checked));
      });

    document
      .getElementById("kokkos_use_gpu")
      .addEventListener("change", (event) => {
        update_kokkos(event.target.checked);
      });

    document.getElementById("kokkos_cpuarch").addEventListener("change", () => {
      update_kokkos();
    });

    document.getElementById("kokkos_gpuarch").addEventListener("change", () => {
      update_kokkos();
    });
  },
  false,
);
