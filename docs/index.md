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

### Contributors

<div class ="contributors">
  <div class="tagcloud-wrapper">
    <div class="tagcloud-controls" style="--num-elements: 0">
      <div class="tagcloud-rotation">
        <ul class="tagcloud-tags" style="--num-elements: 17">
          <li class="tagcloud-tag" style="--index: 1"><div><a href="https://github.com/LudwigBoess" target="_blank">🎸 Ludwig Böss</a></div></li>
          <li class="tagcloud-tag" style="--index: 2"><div><a href="https://github.com/StaticObserver" target="_blank">👀 Yangyang Cai</a></div></li>
          <li class="tagcloud-tag" style="--index: 3"><div><a href="https://github.com/SChernoglazov" target="_blank">💁 Alexander Chernoglazov</a></div></li>
          <li class="tagcloud-tag" style="--index: 4"><div><a href="https://github.com/bcrinquand" target="_blank">🍵 Benjamin Crinquand</a></div></li>
          <li class="tagcloud-tag" style="--index: 5"><div><a href="https://github.com/alisagk" target="_blank">🧋 Alisa Galishnikova</a></div></li>
          <li class="tagcloud-tag" style="--index: 6"><div><a href="https://github.com/xwgong01" target="_blank">🦥 Xingwei Gong</a></div></li>
          <li class="tagcloud-tag" style="--index: 7"><div><a href="https://github.com/Alcauchy" target="_blank">🚂 Evgeny Gorbunov</a></div></li>
          <li class="tagcloud-tag" style="--index: 8"><div><a href="https://github.com/K1000Granier" target="_blank">🐜 Camille Granier</a></div></li>
          <li class="tagcloud-tag" style="--index: 9"><div><a href="https://github.com/mgrehan" target="_blank">🍳 Michael Grehan</a></div></li>
          <li class="tagcloud-tag" style="--index: 10"><div><a href="https://github.com/haykh" target="_blank">☕ Hayk Hakobyan</a></div></li>
          <li class="tagcloud-tag" style="--index: 11"><div><a href="https://github.com/AnujKankani" target="_blank">🌄 Anuj Kankani</a></div></li>
          <li class="tagcloud-tag" style="--index: 12"><div><a href="https://github.com/jmahlmann" target="_blank">🥔 Jens Mahlmann</a></div></li>
          <li class="tagcloud-tag" style="--index: 13"><div><a href="https://github.com/sashaph" target="_blank">🐬 Sasha Philippov</a></div></li>
          <li class="tagcloud-tag" style="--index: 14"><div><a href="https://github.com/sidruns30" target="_blank">📻 Siddhant Solanki</a></div></li>
          <li class="tagcloud-tag" style="--index: 15"><div><a href="https://github.com/a-sullivan" target="_blank">🥭 Andrew Sullivan</a></div></li>
          <li class="tagcloud-tag" style="--index: 16"><div><a href="https://github.com/vanthieg" target="_blank">🤷 Arno Vanthieghem</a></div></li>
          <li class="tagcloud-tag" style="--index: 17"><div><a href="https://github.com/munizhou" target="_blank">🐱 Muni Zhou</a></div></li>
        </ul>
      </div>
    </div>
  </div>
</div>

### Supporting grants

The development of the code was supported by the following grants and awards:

* <span>U.S. Department of Energy</span> under contract number DE-AC02-09CH11466.
* <span>NSF</span> Cyberinfrastructure for Sustained Scientific Innovation (CSSI) program.
* <span>NVIDIA Corporation</span> Academic Hardware Grant Program.

The developers are pleased to acknowledge that the work was performed using the Princeton Research Computing resources at <span>Princeton University</span> which is a consortium of groups led by the Princeton Institute for Computational Science and Engineering (PICSciE) and Office of Information Technology's Research Computing.
