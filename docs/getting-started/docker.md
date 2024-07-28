---
hide:
  - footer
---

`Entity toolkit` provides docker images for setting up a development environment with all the dependencies already preinstalled. To start a container with the proper image, simply go to the root of the source code, and run: 

```sh
docker compose run entity-<tag>
```

where `<tag>` is the particular configuration (i.e., specific toolkit) you wish to utilize (see below). This command will also mount the current directory (i.e., the root of the source code) to the home directory inside the container.

All the containers also come with a python environment set up and some of the necessary packages (e.g., `nt2py`, `jupyter`, etc.) already preinstalled, and it also forwards the port `8080` to the `localhost:8080`, so one could even run a post-processing server from within the container.

!!! warning "Docker images are large"

    Note that docker image sizes are typically quite large (few GB). So keep that in mind when pulling the image using `docker compose run` or `docker build`.

## Runtime

Often times you may want to simply compile the code within the container, and not run it (e.g. for testing purposes, or if your system does not have a GPU with the proper architecture). In that case there is no need to give docker access to the GPUs on your system, and thus no additional configuration is needed. You will simply use the tags with `_compilers` which do not require any custom runtimes installed. You may still be able to access the executable outside of the container and even run it.

To actually run the code from within the container, you will need to provide docker access to the GPU via the corresponding container toolkit. For NVIDIA GPUs, you will need the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) installed on your system. For AMD GPUs, you will need [`amdgpu-dkms`](https://rocm.docs.amd.com/projects/install-on-linux/en/latest/how-to/docker.html) which typically comes pre-packaged with ROCm.

!!! note "NVIDIA Container Toolkit on WSL"

    When installing the toolkit via WSL, you will need to configure docker on the Windows side, not the WSL (since WSL simply uses the daemon from Windows). Use the following command, instead of the one specified in the instructions:

    ```sh
    sudo nvidia-ctk runtime configure --runtime=docker --config /mnt/<windows drive>/Users/<username>/.docker/daemon.json
    ```

## Tags

We provide the following configurations (tags) as separate images:

| tag | compilers | runtime | download size |
| --- | --- | --- | --- |
| `cuda` | `gcc 11.4` + `CUDA toolkit 12.2` | Y | 4.55 GB |
| `cuda-compilers` | `gcc 11.4` + `CUDA toolkit 12.2` | N | 4.55 GB |
| `rocm` | `gcc 9.4` + `ROCm 6.1.2` | Y | 1.75 GB |
| `rocm-compilers` | `gcc 9.4` + `ROCm 6.1.2` | N | 1.75 GB |
| `sycl` | *to-be-released* | | |

`runtime` indicates that the particular container is also able to execute the code on the GPU (special docker toolkit needed, as noted above). All of the tags can be accessed through the docker hub under `morninbru/entity:<tag>`.

## Building images on your own

Images for these containers are all stored on the [Docker hub](https://hub.docker.com/repository/docker/morninbru/entity/general). If you do not wish to use `docker compose` to download the pre-made ones from the Docker hub, you may also build the images yourself from the corresponding `Dockerfile`-s also provided with the source code. You can do that by going to the `dev/` directory in the root of the source code, and running: 

```sh
docker build --no-cache -t myentity:<toolkit> -f Dockerfile.<toolkit>
```

substituting one of the values for the `<toolkit>` mentioned above. You may then launch a container using the built image by running the following from the code source directory (or any other directory you wish to mount inside the container):

```sh
docker run -it \
# uncomment one of the two lines below to give container...
# ... access to the GPU (see above). otherwise, if no runtime access needed...
# ... leave the lines commented
#  --runtime=nvidia --gpus all \ # < NVIDIA cards
#  --device /dev/kfd --device /dev/dri --security-opt seccomp=unconfined \ # < AMD cards
  --name myentity_<tag> \
  -p 8080:8080 \
  -v "$(pwd)":/home/<MOUNT_DIRECTORY>/ \
  myentity:<tag>
```

where `MOUNT_DIRECTORY` is the directory within the container, where the current directory on the host system will be mounted. The `<runtime>` has to correspond the tag being used. For example, for `CUDA` on NVIDIA GPUs you will typically use `--runtime=nvidia`.
