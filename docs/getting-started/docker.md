---
hide:
  - footer
---

`Entity toolkit` provides a docker image for setting up a development environment with all the dependencies already preinstalled. To start a container with the proper image, simply go to the root of the source code, and run: 

```sh
docker compose run entity-<tag>
```

where `<tag>` is the particular configuration (i.e., compilers) you wish to utilize. This command will also mount the current directory (i.e., the root of the source code) to the home directory inside the container.

Current, we provide the following configurations:

| tag | compilers |
| --- | --- |
| `cuda` | `gcc 11.4` & `CUDA toolkit 12.2` |
| `rocm` | *to-be-released* |
| `sycl` | *to-be-released* |

All the containers also come with a python environment set up and some of the necessary packages (e.g., `nt2py`, `jupyter`, etc.) already preinstalled, and it also forwards the port `8080` to the `localhost:8080`, so one could even run a post-processing server from within the container.