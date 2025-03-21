---
title: ""
hide:
  - footer
---
<!-- 
<link rel="stylesheet" href="css/neotoroi/neoteroi-mkdocs.min.css">
<link rel="stylesheet" href="css/neotoroi/neoteroi-cards.css">
<link rel="stylesheet" href="css/neotoroi/neoteroi-timeline.css">
<link rel="stylesheet" href="css/neotoroi/neoteroi-gantt.css">
<link rel="stylesheet" href="css/neotoroi/neoteroi-spantable.css">
 -->

<!-- <div class="entity-cover"></div> -->
<div id="cover" class="p5canvas"></div>

<script src="cover.js"></script>
{% include "html/p5js.html" %}

`Entity` is an open-source coordinate-agnostic particle-in-cell (PIC) code written in C++17 specifically targeted to study plasma physics in relativistic astrophysical systems. The main algorithms of the code are written in covariant form, allowing to easily implement arbitrary grid geometries. The code is highly modular, and is written in the architecture-agnostic way using the Kokkos performance portability library, allowing the code to efficiently use device parallelization on CPU and GPU architectures of different types. The multi-node parallelization is implemented using the MPI library, and the data output is done via the ADIOS2 library which supports multiple output formats, including HDF5 and BP5.

`Entity` is part of the `Entity toolkit` framework, which also includes a Python library for fast and efficient data analysis and visualization of the simulation data: `nt2py`.

This documentation includes everything you need to know to get started with using and/or contributing to the `Entity toolkit`. If you find bugs or issues, please feel free to add a GitHub issue or submit a pull request. Users with significant contributions to the code will be added to the list of developers, and assigned an emoji of their choice (important).[^1]

<!-- ::cards::cols=3 image-bg

- title: Core framework
  content: |
    Provides predesigned low-level algorithm and data containers that can be adapted to particular physics routines and simulations at the higher level.
  image: "assets/icons/framework-icon.svg"
  key: core

- title: Simulation engines
  content: |
    Set of plasma physics simulation modules and algorithms for the high-energy astrophysical plasma simulations.
  image: "assets/icons/engine-icon.svg"
  key: sim

- title: Visualization tools
  content: |
    Runtime visualization, analysis and post-processing tools for the on-the-fly debugging, interactive data exploration and in-depth analysis. 
  image: "assets/icons/vis-icon.svg"
  key: vis

::/cards:: -->

### Lead developers

* :coffee: Hayk Hakobyan {[@haykh](https://github.com/haykh)}
* :potato: Jens Mahlmann {[@jmahlmann](https://github.com/jmahlmann)}
* :person_tipping_hand: Alexander Chernoglazov {[@SChernoglazov](https://github.com/SChernoglazov)}
* :bubble_tea: Alisa Galishnikova {[@alisagk](https://github.com/alisagk)}
* :dolphin: Sasha Philippov {[@sashaph](https://github.com/sashaph)}

### Contributors (alphabetical)

* :guitar: Ludwig Böss {[@LudwigBoess](https://github.com/LudwigBoess): PIC, framework}
* :eyes: Yangyang Cai {[@StaticObserver](https://github.com/StaticObserver): GR}
* :tea: Benjamin Crinquand {[@bcrinquand](https://github.com/bcrinquand): GR, cubed-sphere}
* :steam_locomotive: Evgeny Gorbunov {[@Alcauchy](https://github.com/Alcauchy): PIC, framework}
* :radio: Siddhant Solanki {[@sidruns30](https://github.com/sidruns30): framework}
* :shrug: Arno Vanthieghem {[@vanthieg](https://github.com/vanthieg): PIC, framework}
* :cat: Muni Zhou {[@munizhou](https://github.com/munizhou): PIC}

<!-- ### Timeline -->

<!-- 
::timeline::

- title: First public version
  content: v0.8 includes single-node SR PIC simulation engine, and the preliminary version of the on-the-fly visualization tool (nttiny).
  icon: v0.8
  sub_title: 2023-Jan
  key: v0-8
- title: GRPIC
  content: v0.9 will introduce the GRPIC engine with a spherical and quasi-spherical 2.5D Kerr-Schild metric.
  icon: v0.9
  sub_title: 2023-Jul
  key: v0-9
- title: First official release
  content: v1.0 will be the first official release of the Entity toolkit. It will fully support SR and GR PIC simulations on multiple nodes (GPU & CPU) in arbitrary geometries.
  icon: v1.0
  sub_title: 2023-Fall
  key: v1-0
- title: Advanced features
  content: TBD (cubed-sphere, QED, force-free, etc.).
  icon: v1.1
  sub_title: late 2023
  key: v1-1

::/timeline:: -->

<!-- <style> -->
<!-- [data-md-color-scheme="ntt-light"] .entity-cover { -->
<!--   background-image: url("assets/cover_light.gif"); -->
<!-- } -->
<!---->
<!-- [data-md-color-scheme="ntt-dark"] .entity-cover { -->
<!--   background-image: url("assets/cover_dark.gif"); -->
<!-- } -->
<!-- </style> -->

### Supporting grants

The development of the code was supported by the following grants and awards:

* <span>U.S. Department of Energy</span> under contract number DE-AC02-09CH11466.
* <span>NSF</span> Cyberinfrastructure for Sustained Scientific Innovation (CSSI) program.
* <span>NVIDIA Corporation</span> Academic Hardware Grant Program.

The developers are pleased to acknowledge that the work was performed using the Princeton Research Computing resources at <span>Princeton University</span> which is a consortium of groups led by the Princeton Institute for Computational Science and Engineering (PICSciE) and Office of Information Technology's Research Computing.

<!--[^1]: [Icons](https://game-icons.net/) are used under the [CC BY 3.0 license](https://creativecommons.org/licenses/by/3.0/); created by [Delapouite](https://delapouite.com/), and [Lorc](https://lorcblog.blogspot.com/).-->

<script>
  document.addEventListener('DOMContentLoaded', () => {
    let el = document.getElementById("contributors-alphabetical")
    let ul = el.nextElementSibling;
    if (ul) {
      Array.from(ul.children).forEach(li => {
        let tags_str = />:(.*)\}/.exec(li.innerHTML);
        let tags = tags_str[1].split(',').map(c => c.trim());
        li.innerHTML = li.innerHTML.replace(tags_str[1],
              tags.map(t => `<span class="tag ${t.toLowerCase().replace(' ', '_')}">${t}</span>`).join(''));
      });
    }
  });
</script>
