---
title: ""
hide:
  - footer
libraries:
  - p5
scripts:
  - cover
---

<div id="cover" class="p5canvas"></div>

`Entity` is an open-source coordinate-agnostic particle-in-cell (PIC) code written in C++17 specifically targeted to study plasma physics in relativistic astrophysical systems. The main algorithms of the code are written in covariant form, allowing to easily implement arbitrary grid geometries. The code is highly modular, and is written in the architecture-agnostic way using the Kokkos performance portability library, allowing the code to efficiently use device parallelization on CPU and GPU architectures of different types. The multi-node parallelization is implemented using the MPI library, and the data output is done via the ADIOS2 library which supports multiple output formats, including HDF5 and BP5.

`Entity` is part of the `Entity toolkit` framework, which also includes a Python library for fast and efficient data analysis and visualization of the simulation data: `nt2py`.

This documentation includes everything you need to know to get started with using and/or contributing to the `Entity toolkit`. If you find bugs or issues, please feel free to add a GitHub issue or submit a pull request. Users with significant contributions to the code will be added to the list of developers, and assigned an emoji of their choice (important).

### Contributors (alphabetical)

* :guitar: Ludwig Böss {[@LudwigBoess](https://github.com/LudwigBoess)}
* :eyes: Yangyang Cai {[@StaticObserver](https://github.com/StaticObserver)}
* :person_tipping_hand: Alexander Chernoglazov {[@SChernoglazov](https://github.com/SChernoglazov)}
* :tea: Benjamin Crinquand {[@bcrinquand](https://github.com/bcrinquand)}
* :bubble_tea: Alisa Galishnikova {[@alisagk](https://github.com/alisagk)}
* :locomotive: Evgeny Gorbunov {[@Alcauchy](https://github.com/Alcauchy)}
* :coffee: Hayk Hakobyan {[@haykh](https://github.com/haykh)}
* :potato: Jens Mahlmann {[@jmahlmann](https://github.com/jmahlmann)}
* :dolphin: Sasha Philippov {[@sashaph](https://github.com/sashaph)}
* :radio: Siddhant Solanki {[@sidruns30](https://github.com/sidruns30)}
* :shrug: Arno Vanthieghem {[@vanthieg](https://github.com/vanthieg)}
* :cat: Muni Zhou {[@munizhou](https://github.com/munizhou)}

### Supporting grants

The development of the code was supported by the following grants and awards:

* <span>U.S. Department of Energy</span> under contract number DE-AC02-09CH11466.
* <span>NSF</span> Cyberinfrastructure for Sustained Scientific Innovation (CSSI) program.
* <span>NVIDIA Corporation</span> Academic Hardware Grant Program.

The developers are pleased to acknowledge that the work was performed using the Princeton Research Computing resources at <span>Princeton University</span> which is a consortium of groups led by the Princeton Institute for Computational Science and Engineering (PICSciE) and Office of Information Technology's Research Computing.