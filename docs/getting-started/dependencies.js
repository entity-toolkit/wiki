const modules_template = (modules) => (
  `module purge ${modules.map((m) => `&& module load ${m}`).join(' ')}`
);

const cflags_template = (cflags) => (
  `${cflags.map((c) => `    -D ${c}`).join(' \\\n')}`
);

const generate_kokkos_build = (form, use) => {
  if (!use.kokkos) {
    return ['', ''];
  }
  let build_script = "";
  let host_compiler = form.querySelector('#host_compiler_module').querySelector("input").value;
  if (use.modules && host_compiler === "") {
    build_script += "# select the host compiler module";
    return [build_script, ""];
  }
  if (!use.modules) {
    host_compiler = "";
  }
  let gpu_compiler = form.querySelector('#gpu_compiler_module').querySelector("input").value;
  if (use.modules && use.gpusupport && gpu_compiler === "") {
    build_script += "# select the gpu compiler module";
    return [build_script, ""];
  }
  if (!use.gpusupport || !use.modules) {
    gpu_compiler = "";
  }

  const use_debug = form.querySelector('#use_kokkos_debug').checked;

  let cpuarch = form.querySelector('#kokkos_cpuarch').value;
  let gpuarch = form.querySelector('#kokkos_gpuarch_selector').querySelector('#kokkos_gpuarch').value;
  if (!use.gpusupport) {
    gpuarch = "";
  }

  let kokkos_src = form.querySelector("#kokkos_src").querySelector("input");

  let kokkos_install = form.querySelector("#kokkos_install").querySelector("input");
  if (kokkos_src.value === "") {
    kokkos_src = kokkos_src.getAttribute("placeholder");
  } else {
    kokkos_src = kokkos_src.value;
  }
  if (kokkos_install.value === "") {
    kokkos_install = kokkos_install.getAttribute("placeholder");
  } else {
    kokkos_install = kokkos_install.value;
  }

  let cflags = [], modules = [];
  cflags.push('CMAKE_CXX_STANDARD=17');
  cflags.push('CMAKE_CXX_EXTENSIONS=OFF');
  cflags.push('CMAKE_POSITION_INDEPENDENT_CODE=TRUE');
  if (cpuarch !== "") {
    cflags.push(`Kokkos_ARCH_${cpuarch.toUpperCase()}=ON`);
  }
  if (gpuarch !== "") {
    if (gpuarch.toUpperCase() !== "NATIVE") {
      cflags.push(`Kokkos_ARCH_${gpuarch.toUpperCase()}=ON`);
    }
    cflags.push('Kokkos_ENABLE_CUDA=ON');
  }
  if (host_compiler !== "") {
    modules.push(host_compiler);
  }
  if (gpu_compiler !== "") {
    modules.push(gpu_compiler);
  }
  if (use_debug) {
    cflags.push('Kokkos_ENABLE_DEBUG=ON');
    cflags.push('Kokkos_ENABLE_DEBUG_BOUNDS_CHECK=ON');
  }
  cflags.push(`CMAKE_INSTALL_PREFIX=${kokkos_install}`);
  build_script += (`CURRENT_DIR=$(pwd) &&\ \\
${modules_template(modules)} &&\ \\
cd ${kokkos_src} &&\ \\
rm -rf build &&\ \\
cmake -B build &&\ \\
${cflags_template(cflags)} &&\ \\
cmake --build build -j &&\ \\
cmake --install build &&\ \\
rm -rf build &&\ \\
cd $CURRENT_DIR &&\ \\
unset CURRENT_DIR`);
  let modfile = "";
  if (use.modules) {
    const kokkosmod = form.querySelector('#kokkos_module').querySelector("input").value;
    if (kokkosmod === "") {
      modfile += "# select the Kokkos module";
      return [build_script, modfile];
    }
    let suffix = "Kokkos", prereqs = "", flags = [];
    if (cpuarch !== "") {
      suffix += " @ " + cpuarch;
    }
    if (gpuarch !== "") {
      suffix += " @ " + gpuarch;
    }
    for (const mod of modules) {
      if (prereqs === "") {
        prereqs = "\nprereq            ";
      }
      prereqs += ` ${mod}`;
    }
    for (const flag of cflags) {
      if (!flag.startsWith("CMAKE")) {
        flags.push(`setenv ${flag.split('=')[0]}` + ' ' + flag.split('=')[1]);
      }
    }
    let flagstr = flags.join('\n');
    modfile = (`#%Module1.0######################################################################
##
## ${suffix} modulefile
##
#################################################################################
proc ModulesHelp { } {
  puts stderr "\\t${suffix}\\n"
}

module-whatis      "Sets up ${suffix}"    

conflict           kokkos${prereqs}

set                basedir      ${kokkos_install}
prepend-path       PATH         $basedir/bin
setenv             Kokkos_DIR   $basedir

${flagstr}`);
  } else {
    modfile = "";
  }
  return [build_script, modfile];
}

const generate_adios2_build = (form, use) => {
  if (!use.adios2) {
    return ['', ''];
  }
  let build_script = "";
  let host_compiler = form.querySelector('#host_compiler_module').querySelector("input").value;
  if (use.modules && host_compiler === "") {
    build_script += "# select the host compiler module";
    return [build_script, ""];
  }
  if (!use.modules) {
    host_compiler = "";
  }
  let adios2_src = form.querySelector("#adios2_src").querySelector("input");

  let adios2_install = form.querySelector("#adios2_install").querySelector("input");
  if (adios2_src.value === "") {
    adios2_src = adios2_src.getAttribute("placeholder");
  } else {
    adios2_src = adios2_src.value;
  }
  if (adios2_install.value === "") {
    adios2_install = adios2_install.getAttribute("placeholder");
  } else {
    adios2_install = adios2_install.value;
  }

  let cflags = [], modules = [];
  cflags.push('CMAKE_CXX_STANDARD=17');
  cflags.push('CMAKE_CXX_EXTENSIONS=OFF');
  cflags.push('CMAKE_POSITION_INDEPENDENT_CODE=TRUE');
  cflags.push('BUILD_SHARED_LIBS=ON');
  cflags.push('ADIOS2_USE_HDF5=ON');
  cflags.push('ADIOS2_USE_Python=OFF');
  cflags.push('ADIOS2_USE_Fortran=OFF');
  cflags.push('ADIOS2_USE_ZeroMQ=OFF');
  cflags.push('BUILD_TESTING=OFF');
  cflags.push('ADIOS2_BUILD_EXAMPLES=OFF');
  if (use.mpisupport) {
    cflags.push('ADIOS2_USE_MPI=ON');
  } else {
    cflags.push('ADIOS2_USE_MPI=OFF');
    cflags.push('ADIOS2_HAVE_HDF5_VOL=OFF');
  }
  cflags.push(`CMAKE_INSTALL_PREFIX=${adios2_install}`);

  if (host_compiler !== "") {
    modules.push(host_compiler);
  }
  if (use.mpisupport && !use.mpi) {
    if (use.modules) {
      const mpi_mod = form.querySelector('#adios2_mpi_module').querySelector("input").value;
      if (mpi_mod === "") {
        build_script += "# select the MPI module";
        return [build_script, ""];
      }
      modules.push(mpi_mod);
    } else {
      let mpi_path = form.querySelector('#adios2_mpi_path').querySelector("input").value;
      if (mpi_path === "") {
        mpi_path = form.querySelector('#adios2_mpi_path').querySelector("input").getAttribute("placeholder");
      }
      cflags.push(`MPI_ROOT=${mpi_path}`);
    }
  }
  if (use.mpi && use.modules) {
    const mpi_mod = form.querySelector('#mpi_module').querySelector("input").value;
    if (mpi_mod === "") {
      build_script += "# select the MPI module";
      return [build_script, ""];
    }
    modules.push(mpi_mod);
  }
  if (!use.modules && use.mpi) {
    let mpi_path = form.querySelector('#mpi_install').querySelector("input").value;
    if (mpi_path === "") {
      mpi_path = form.querySelector('#mpi_install').querySelector("input").getAttribute("placeholder");
    }
    cflags.push(`MPI_ROOT=${mpi_path}`);
  }
  if (use.modules && !use.hdf5) {
    const hdf5_mod = form.querySelector('#adios2_hdf5_module').querySelector("input").value;
    if (hdf5_mod === "") {
      build_script += "# select the HDF5 module";
      return [build_script, ""];
    }
    modules.push(hdf5_mod);
  }
  if (use.modules && use.hdf5) {
    const hdf5_mod = form.querySelector('#hdf5_module').querySelector("input").value;
    if (hdf5_mod === "") {
      build_script += "# select the HDF5 module";
      return [build_script, ""];
    }
    modules.push(hdf5_mod);
  }
  if (!use.modules && !use.hdf5) {
    const hdf5_path = form.querySelector('#adios2_hdf5_path').querySelector("input").value;
    if (hdf5_path === "") {
      build_script += "# select the HDF5 path";
      return [build_script, ""];
    }
    cflags.push(`HDF5_ROOT=${hdf5_path}`);
  }
  if (!use.modules && use.hdf5) {
    let hdf5_path = form.querySelector('#hdf5_install').querySelector("input").value;
    if (hdf5_path === "") {
      hdf5_path = form.querySelector('#hdf5_install').querySelector("input").getAttribute("placeholder");
    }
    cflags.push(`HDF5_ROOT=${hdf5_path}`);
  }
  build_script += (`CURRENT_DIR=$(pwd) &&\ \\
${modules_template(modules)} &&\ \\
cd ${adios2_src} &&\ \\
rm -rf build &&\ \\
cmake -B build &&\ \\
${cflags_template(cflags)} &&\ \\
cmake --build build -j &&\ \\
cmake --install build &&\ \\
rm -rf build &&\ \\
cd $CURRENT_DIR &&\ \\
unset CURRENT_DIR`);
  let modfile = "";
  if (use.modules) {
    const adios2mod = form.querySelector('#adios2_module').querySelector("input").value;
    if (adios2mod === "") {
      modfile += "# select the ADIOS2 module";
      return [build_script, modfile];
    }
    let suffix = "ADIOS2", prereqs = "", flags = [];
    if (use.mpi || use.mpisupport) {
      suffix = "ADIOS2 with MPI support";
    }
    for (const mod of modules) {
      if (prereqs === "") {
        prereqs = "\nprereq            ";
      }
      prereqs += ` ${mod}`;
    }
    for (const flag of cflags) {
      if (flag.includes("MPI") || flag.includes("HDF5")) {
        flags.push(`setenv ${flag.split('=')[0]}` + ' ' + flag.split('=')[1]);
      }
    }
    let flagstr = flags.join('\n');
    modfile = (`#%Module1.0######################################################################
##
## ${suffix} modulefile
##
#################################################################################
proc ModulesHelp { } {
puts stderr "\\t${suffix}\\n"
}

module-whatis      "Sets up ${suffix}"    

conflict           adios2${prereqs}

set                basedir      ${adios2_install}
prepend-path       PATH         $basedir/bin
setenv             Kokkos_DIR   $basedir

${flagstr}`);
  } else {
    modfile = "";
  }
  return [build_script, modfile];
}

const generate_hdf5_build = (form, use) => {
  if (!use.hdf5) {
    return ['', ''];
  }
  let build_script = "";
  let host_compiler = form.querySelector('#host_compiler_module').querySelector("input").value;
  if (use.modules && host_compiler === "") {
    build_script += "# select the host compiler module";
    return [build_script, ""];
  }
  if (!use.modules) {
    host_compiler = "";
  }
  let hdf5_src = form.querySelector("#hdf5_src").querySelector("input");

  let hdf5_install = form.querySelector("#hdf5_install").querySelector("input");
  if (hdf5_src.value === "") {
    hdf5_src = hdf5_src.getAttribute("placeholder");
  } else {
    hdf5_src = hdf5_src.value;
  }
  if (hdf5_install.value === "") {
    hdf5_install = hdf5_install.getAttribute("placeholder");
  } else {
    hdf5_install = hdf5_install.value;
  }

  let envvars = [], modules = [], hdf5_mpi = false;
  if (host_compiler !== "") {
    modules.push(host_compiler);
  }
  if (use.mpisupport && !use.mpi) {
    if (use.modules) {
      const mpi_mod = form.querySelector('#hdf5_mpi_module').querySelector("input").value;
      if (mpi_mod === "") {
        build_script += "# select the MPI module";
        return [build_script, ""];
      }
      modules.push(mpi_mod);
    } else {
      let mpi_path = form.querySelector('#hdf5_mpi_path').querySelector("input").value;
      if (mpi_path === "") {
        mpi_path = form.querySelector('#hdf5_mpi_path').querySelector("input").getAttribute("placeholder");
      }
      envvars.push(`MPI_ROOT=${mpi_path}`);
    }
  }
  if (use.mpi && use.modules) {
    const mpi_mod = form.querySelector('#mpi_module').querySelector("input").value;
    if (mpi_mod === "") {
      build_script += "# select the MPI module";
      return [build_script, ""];
    }
    modules.push(mpi_mod);
  }
  if (!use.modules && use.mpi) {
    let mpi_path = form.querySelector('#mpi_install').querySelector("input").value;
    if (mpi_path === "") {
      mpi_path = form.querySelector('#mpi_install').querySelector("input").getAttribute("placeholder");
    }
    envvars.push(`MPI_ROOT=${mpi_path}`);
  }
  hdf5_mpi = use.mpisupport || use.mpi;
  if (hdf5_mpi) {
    hdf5_mpi = "true";
  } else {
    hdf5_mpi = "false";
  }
  let envvars_set = envvars.map((e) => `export ${e}`).join(' &&\ \n');
  let envvars_unset = envvars.map((e) => `unset ${e.split('=')[0]}`).join(' &&\ \n');
  if (envvars_set !== "") {
    envvars_set = "\n" + envvars_set + " &&\ ";
    envvars_unset = "\n" + envvars_unset + " &&\ ";
  }

  build_script += (`CURRENT_DIR=$(pwd) &&\ \\
${modules_template(modules)} &&\ \\
cd ${hdf5_src} &&\ \\
rm -rf build &&\ \\${envvars_set}
ctest -S HDF5config.cmake,MPI=${hdf5_mpi},BUILD_GENERATOR=Unix,INSTALLDIR=${hdf5_install} \\
      -C Release -VV -O hdf5.log &&\ \\
cd build &&\ \\
make install &&\ \\
cd ${hdf5_src} &&\ \\
rm -rf build &&\ \\${envvars_unset}
cd $CURRENT_DIR &&\ \\
unset CURRENT_DIR`);
  let modfile = "";
  if (use.modules) {
    const hdf5mod = form.querySelector('#hdf5_module').querySelector("input").value;
    if (hdf5mod === "") {
      modfile += "# select the HDF5 module";
      return [build_script, modfile];
    }
    let suffix = "HDF5", prereqs = "";
    if (use.mpi || use.mpisupport) {
      suffix = "HDF5 with MPI support";
    }
    for (const mod of modules) {
      if (prereqs === "") {
        prereqs = "\nprereq            ";
      }
      prereqs += ` ${mod}`;
    }
    modfile = (`#%Module1.0######################################################################
##
## ${suffix} modulefile
##
#################################################################################
proc ModulesHelp { } {
  puts stderr "\\t${suffix}\\n"
}

module-whatis      "Sets up ${suffix}"    

conflict           hdf5 phdf5 hdf5-mpi hdf5-parallel${prereqs}

set                basedir               ${hdf5_install}
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
append-path        -d { } LOCAL_CXXFLAGS -I$basedir/include`);
  } else {
    modfile = "";
  }
  return [build_script, modfile];
}

const generate_mpi_build = (form, use) => {
  if (!use.mpi) {
    return ['', ''];
  }
  let build_script = "";
  let host_compiler = form.querySelector('#host_compiler_module').querySelector("input").value;
  if (use.modules && host_compiler === "") {
    build_script += "# select the host compiler module";
    return [build_script, ""];
  }
  if (!use.modules) {
    host_compiler = "";
  }
  let gpu_compiler = form.querySelector('#gpu_compiler_module').querySelector("input").value;
  if (use.modules && use.gpusupport && gpu_compiler === "") {
    build_script += "# select the gpu compiler module";
    return [build_script, ""];
  }
  if (!use.gpusupport || !use.modules) {
    gpu_compiler = "";
  }
  let mpi_src = form.querySelector("#mpi_src").querySelector("input");

  let mpi_install = form.querySelector("#mpi_install").querySelector("input");
  if (mpi_src.value === "") {
    mpi_src = mpi_src.getAttribute("placeholder");
  } else {
    mpi_src = mpi_src.value;
  }
  if (mpi_install.value === "") {
    mpi_install = mpi_install.getAttribute("placeholder");
  } else {
    mpi_install = mpi_install.value;
  }

  let modules = [], withcuda = "";
  if (host_compiler !== "") {
    modules.push(host_compiler);
  }
  if (gpu_compiler !== "") {
    modules.push(gpu_compiler);
  }
  if (use.gpusupport) {
    withcuda = "\n             --with-cuda=$CUDA_HOME \\";
  }
  build_script += (`CURRENT_DIR=$(pwd) &&\ \\
${modules_template(modules)} &&\ \\
cd ${mpi_src} &&\ \\
rm -rf build &&\ \\
mkdir -p build &&\ \\
cd build &&\ \\
../configure --with-devel-headers \\${withcuda}
             --prefix=${mpi_install} \\
             --enable-mpi-fortran=no &&\ \\
make -j &&\ \\
make install &&\ \\
cd .. &&\ \\
rm -rf build &&\ \\
cd $CURRENT_DIR &&\ \\
unset CURRENT_DIR`);
  let modfile = "";
  if (use.modules) {
    const mpimod = form.querySelector('#mpi_module').querySelector("input").value;
    if (mpimod === "") {
      modfile += "# select the MPI module";
      return [build_script, modfile];
    }
    let suffix = "MPI", prereqs = "";
    if (use.gpusupport) {
      suffix = "MPI with GPU support";
    }
    for (const mod of modules) {
      if (prereqs === "") {
        prereqs = "\nprereq            ";
      }
      prereqs += ` ${mod}`;
    }
    modfile = (`#%Module1.0######################################################################
##
## ${suffix} modulefile
##
#################################################################################
proc ModulesHelp { } {
  puts stderr "\\t${suffix}\\n"
}

module-whatis      "Sets up ${suffix}"

conflict           mpi ompi openmpi mpich intel-mpi${prereqs}

set                basedir               ${mpi_install}
prepend-path       PATH                  $basedir/bin
prepend-path       LD_LIBRARY_PATH       $basedir/lib

append-path -d { } LOCAL_LDFLAGS      -L $basedir/lib
append-path -d { } LOCAL_INCLUDE      -I $basedir/include
append-path -d { } LOCAL_CFLAGS       -I $basedir/include
append-path -d { } LOCAL_FCFLAGS      -I $basedir/include
append-path -d { } LOCAL_CXXFLAGS     -I $basedir/include

setenv             CXX                   $basedir/bin/mpicxx
setenv             CC                    $basedir/bin/mpicc

setenv             SLURM_MPI_TYPE        pmix_v3
setenv             MPIHOME               $basedir
setenv             MPI_HOME              $basedir
setenv             OPENMPI_HOME          $basedir`);
  } else {
    modfile = "";
  }
  return [build_script, modfile];
}

const generate_entity_modfile = (form, use) => {
  let modfile = "";
  let modules = [];
  if (use.modules) {
    let flags = [];
    let cpuarch = form.querySelector('#kokkos_cpuarch').value;
    let gpuarch = form.querySelector('#kokkos_gpuarch_selector').querySelector('#kokkos_gpuarch').value;
    if (!use.gpusupport) {
      gpuarch = "";
    }
    let host_compiler = form.querySelector('#host_compiler_module').querySelector("input").value;
    if (host_compiler === "") {
      modfile += "# select the host compiler module";
      return modfile;
    }
    if (host_compiler !== "") {
      modules.push(host_compiler);
    }
    let gpu_compiler = form.querySelector('#gpu_compiler_module').querySelector("input").value;
    if (use.gpusupport && gpu_compiler === "") {
      modfile += "# select the gpu compiler module";
      return modfile;
    } else if (use.gpusupport) {
      modules.push(gpu_compiler);
    }
    if (use.mpi) {
      const mpimod = form.querySelector('#mpi_module').querySelector("input").value;
      if (mpimod === "") {
        modfile += "# select the MPI module";
        return modfile;
      }
      modules.push(mpimod);
    } else if (use.mpisupport) {
      let adios2mpimod = form.querySelector('#adios2_mpi_module');
      if (adios2mpimod !== null) {
        adios2mpimod = adios2mpimod.querySelector("input").value;
        if (adios2mpimod === "") {
          modfile += "# select the MPI module";
          return modfile;
        }
        modules.push(adios2mpimod);
      } else {
        let hdf5mpimod = form.querySelector('#hdf5_mpi_module');
        if (hdf5mpimod !== null) {
          hdf5mpimod = hdf5mpimod.querySelector("input").value;
          if (hdf5mpimod === "") {
            modfile += "# select the MPI module";
            return modfile;
          }
          modules.push(hdf5mpimod);
        } else {
          return "# select the MPI module";
        }
      }
    }
    if (use.mpi || use.mpisupport) {
      flags.push("Entity_ENABLE_MPI ON");
    } else {
      flags.push("Entity_ENABLE_MPI OFF");
    }
    if (use.kokkos) {
      let kokkosmod = form.querySelector('#kokkos_module').querySelector("input").value;
      if (kokkosmod === "") {
        modfile += "# select the Kokkos module";
        return modfile;
      }
      modules.push(kokkosmod);
    }
    if (use.adios2) {
      let adios2mod = form.querySelector('#adios2_module').querySelector("input").value;
      if (adios2mod === "") {
        modfile += "# select the ADIOS2 module";
        return modfile;
      }
      modules.push(adios2mod);
      if (use.hdf5) {
        let hdf5mod = form.querySelector('#hdf5_module').querySelector("input").value;
        if (hdf5mod === "") {
          modfile += "# select the HDF5 module";
          return modfile;
        }
        modules.push(hdf5mod);
      } else {
        let hdf5mod = form.querySelector('#adios2_hdf5_module').querySelector("input").value;
        if (hdf5mod === "") {
          modfile += "# select the HDF5 module";
          return modfile;
        }
        modules.push(hdf5mod);
      }
    }
    let modstr = "", flagsstr = "";
    modules.forEach((mod) => {
      if (modstr === "") {
        modstr = "\n";
      }
      modstr += `module load ${mod}\n`;
    });
    flags.forEach((flag) => {
      if (flagsstr === "") {
        flagsstr = "\n";
      }
      flagsstr += `setenv ${flag}\n`;
    });
    let suffix = "Entity";
    if (cpuarch !== "") {
      suffix += " @ " + cpuarch;
    }
    if (gpuarch !== "") {
      suffix += " @ " + gpuarch;
    }
    if (use.mpi || use.mpisupport) {
      suffix += " with MPI support";
    }
    modfile = (`#%Module1.0######################################################################
##
## ${suffix} modulefile
##
#################################################################################
proc ModulesHelp { } {
  puts stderr "\\t${suffix}\\n"
}

module-whatis      "Sets up ${suffix}"

conflict           entity${modstr}${flagsstr}`);
  } else {
    modfile = "";
  }
  return modfile;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('dependencies-form');
  console.log(form);

  const isOneOf = (el, names) => {
    return names.some(name => el == name);
  }
  const libraries = ['kokkos', 'adios2', 'hdf5', 'mpi'];

  const set_mpi = (lib, usemod, usempi, compilempi) => {
    const mpimod = form.querySelector(`#${lib}_mpi_module`);
    const mpipath = form.querySelector(`#${lib}_mpi_path`);
    if (mpimod !== null) {
      mpimod.disabled = !(usemod && usempi) || compilempi;
      mpimod.style.display = (usemod && usempi) && !compilempi ? 'block' : 'none';
    }
    if (mpipath !== null) {
      mpipath.disabled = !(!usemod && usempi) || compilempi;
      mpipath.style.display = (!usemod && usempi) && !compilempi ? 'block' : 'none';
    }
  }
  const set_hdf5 = (usemod, compilehdf5) => {
    const hdf5mod = form.querySelector(`#adios2_hdf5_module`);
    const hdf5path = form.querySelector(`#adios2_hdf5_path`);
    if (hdf5mod !== null) {
      hdf5mod.disabled = !usemod || compilehdf5;
      hdf5mod.style.display = usemod && !compilehdf5 ? 'block' : 'none';
    }
    if (hdf5path !== null) {
      hdf5path.disabled = usemod || compilehdf5;
      hdf5path.style.display = !usemod && !compilehdf5 ? 'block' : 'none';
    }
  }

  const gen_builds = () => {
    const script_fields = document.getElementsByClassName('language-sh');
    const [kokkos_script, kokkos_modfile] = generate_kokkos_build(form, use);
    const [adios2_script, adios2_modfile] = generate_adios2_build(form, use);
    const [hdf5_script, hdf5_modfile] = generate_hdf5_build(form, use);
    const [mpi_script, mpi_modfile] = generate_mpi_build(form, use);
    let print_build = false, print_modfile = false;
    [kokkos_script, adios2_script, hdf5_script, mpi_script].forEach((script, i) => {
      if (script === '') {
        script_fields[i].style.display = 'none';
      } else {
        script_fields[i].style.display = 'block';
        script_fields[i].getElementsByTagName('code')[0].innerText = script;
        print_build = true;
      }
    });
    const libs = ['kokkos', 'adios2', 'hdf5', 'mpi'];
    [kokkos_modfile, adios2_modfile, hdf5_modfile, mpi_modfile].forEach((script, i) => {
      if (script === '') {
        script_fields[i + 5].style.display = 'none';
        script_fields[i + 5].getElementsByTagName('span')[0].innerText = "";
        script_fields[i + 5].getElementsByTagName('span')[0].classList = [];
      } else {
        let modfile = form.querySelector(`#${libs[i]}_module`);
        let envpath = form.querySelector('#use_modules_path');
        if (envpath !== null) {
          envpath = envpath.querySelector("input");
          if (envpath.value === "") {
            envpath = envpath.getAttribute("placeholder");
          } else {
            envpath = envpath.value;
          }
          if (modfile !== null) {
            modfile = modfile.querySelector("input").value;
            modfile = envpath + "/" + modfile;
          } else {
            modfile = "";
          }
        } else {
          modfile = "";
        }
        script_fields[i + 5].style.display = 'block';
        script_fields[i + 5].getElementsByTagName('code')[0].innerText = script;
        script_fields[i + 5].getElementsByTagName('span')[0].innerText = modfile;
        script_fields[i + 5].getElementsByTagName('span')[0].classList = ["filename"];
        print_modfile = true;
      }
    });
    document.querySelector("#build-scripts").style.display = print_build ? 'block' : 'none';
    document.querySelector("#modulefiles").style.display = print_modfile ? 'block' : 'none';
    // entity module
    if (!print_modfile) {
      script_fields[4].style.display = 'none';
      script_fields[4].getElementsByTagName('span')[0].innerText = "";
      script_fields[4].getElementsByTagName('span')[0].classList = [];
    } else {
      const entity_modfile = generate_entity_modfile(form, use);
      let envpath = form.querySelector('#use_modules_path');
      if (envpath !== null) {
        envpath = envpath.querySelector("input");
        if (envpath.value === "") {
          envpath = envpath.getAttribute("placeholder");
        } else {
          envpath = envpath.value;
        }
      } else {
        envpath = "";
      }
      script_fields[4].style.display = 'block';
      script_fields[4].getElementsByTagName('code')[0].innerText = entity_modfile;
      script_fields[4].getElementsByTagName('span')[0].innerText = envpath + "/entity";
      script_fields[4].getElementsByTagName('span')[0].classList = ["filename"];
    }
  }

  // global configs
  let use = new Proxy({}, {
    set: function (target, property, value) {
      target[property] = value;
      console.log(property, value);
      if (property == 'modules') {
        const modules_path = form.querySelector('#use_modules_path');
        const host_comp_module = form.querySelector('#host_compiler_module');
        const gpu_comp_module = form.querySelector('#gpu_compiler_module');

        [modules_path, host_comp_module].forEach((el) => {
          el.disabled = !value;
          el.style.display = value ? 'block' : 'none';
        });
        gpu_comp_module.disabled = !(target['gpusupport'] && value);
        gpu_comp_module.style.display = (target['gpusupport'] && value) ? 'block' : 'none';
        for (const lib of libraries) {
          set_mpi(lib, value, target['mpisupport'], target['mpi']);
          const lib_module = form.querySelector(`#${lib}_module`);
          if (lib_module !== null) {
            lib_module.disabled = !value;
            lib_module.style.display = value ? 'block' : 'none';
          }
        }
      } else if (isOneOf(property, libraries)) {
        const lib = form.querySelector(`#${property}`);
        const field = form.querySelector(`#${property}_fieldset`);
        field.style.display = lib.checked ? 'block' : 'none';
        libraries[property] = lib.checked;
      }
      if (isOneOf(property, ["adios2_mpi_module", "hdf5_mpi_module", "mpi_module"])) {
        for (const lib of ["adios2_", "hdf5_", ""]) {
          const mpi_mod = form.querySelector(`#${lib}mpi_module`);
          mpi_mod.getElementsByTagName("input")[0].value = value;
        }
      }
      if ((property == 'mpi') || (property == 'mpisupport')) {
        if (value && property == 'mpi') {
          target['mpisupport'] = true;
        }
        for (const lib of libraries) {
          const usempi = form.querySelector(`#${lib}_use_mpi`);
          if (usempi !== null) {
            if (value || property == 'mpisupport') {
              usempi.checked = value;
            }
            if (property == 'mpi') {
              usempi.disabled = value;
            }
          }
          set_mpi(lib, target['modules'], target['mpisupport'], target['mpi']);
        }
      }
      if (property == "adios2" || property == "hdf5" || property == "modules") {
        set_hdf5(target['modules'], target['hdf5']);
      }
      if (property == 'gpusupport') {
        for (const lib of libraries) {
          const usegpu = form.querySelector(`#${lib}_use_gpu`);
          if (usegpu !== null) {
            usegpu.checked = value;
          }
        }
        const gpu_comp_module = form.querySelector('#gpu_compiler_module');
        gpu_comp_module.disabled = !(target['modules'] && value);
        gpu_comp_module.style.display = (target['modules'] && value) ? 'block' : 'none';
        const kokkos_gpuarch = form.querySelector('#kokkos_gpuarch_selector');
        kokkos_gpuarch.disabled = !value;
        kokkos_gpuarch.style.display = value ? 'block' : 'none';
      }
      gen_builds(form, use);
      return true;
    }
  });

  use.gpusupport = false;
  use.modules = false;
  use.mpisupport = false;
  for (const lib of libraries) {
    use[lib] = false;
    use[`${lib}_module`] = "";
  }

  const independent_elements = [];
  Object.entries(form.querySelectorAll("input[type='text']")).forEach(([_, el]) => {
    independent_elements.push([el, 'input']);
  });
  Object.entries(form.querySelectorAll("select")).forEach(([_, el]) => {
    independent_elements.push([el, 'change']);
  });
  independent_elements.push([form.querySelector("#use_kokkos_debug"), 'change']);

  gen_builds(form, use);
  independent_elements.forEach(([el, event], _) => {
    el.addEventListener(event, () => {
      if (el.name.endsWith("_module")) {
        use[el.name] = el.value;
      }
      gen_builds(form, use);
    });
  });

  const usemod_changed = () => {
    use.modules = form.querySelector('#use_modules').checked;
  }
  usemod_changed();
  form.querySelector('#use_modules').addEventListener('change', () => {
    usemod_changed();
  });

  const lib_changed = (name) => {
    const lib = form.querySelector(`#${name}`);
    const usegpu = form.querySelector(`#${name}_use_gpu`);
    const usempi = form.querySelector(`#${name}_use_mpi`);
    use[name] = lib.checked;
    if (usegpu !== null) {
      usegpu.addEventListener('change', () => {
        use.gpusupport = usegpu.checked;
      });
    }
    if (usempi !== null) {
      usempi.addEventListener('change', () => {
        use.mpisupport = usempi.checked;
      });
    }
  };
  libraries.forEach((name) => {
    lib_changed(name);
    form.querySelector(`#${name}`)
      .addEventListener('change', () => {
        lib_changed(name);
      });
  });
});