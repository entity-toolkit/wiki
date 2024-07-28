---
hide:
  - footer
---

!!! abstract "tl;dr"

    Here we collect the most frequent questions that might occur. Please, make sure to inspect this section before filing a GitHub issue.


??? faq "Compiling & running on AMD GPUs"
    
    Compiling on AMD GPUs is typically not an issue: 

    1. Make sure you have the ROCm library loaded: e.g., run `rocminfo`;
    2. Sometimes the environment variables are not properly set up, so make sure you have the following variables properly defined: 

        - `CMAKE_PREFIX_PATH=/opt/rocm` (or wherever ROCm is installed),
        - `CC=hipcc` & `CXX=hipcc`
    
    3. Compile the code with proper Kokkos flags; i.e., for MI250x GPUs you would use: `-D Kokkos_ENABLE_HIP=ON` and `-D Kokkos_ARCH_AMD_GFX1100=ON`.

    Now running is a bit trickier and the exact instruction might vary from machine to machine (part of it is because ROCm is much less streamlined than CUDA, but also system administrators on clusters are often more negligent towards AMD GPUs). 
    
    * If you are running this on a cluster -- the first thing to do is to inspect the documentation of the cluster. There you might find the proper `slurm` command for requesting GPU nodes and binding each GPU to respective CPUs. 

    * On personal machines figuring this out is a bit easier. First, inspect the output of `rocminfo` and `rocm-smi`. From there, you should be able to find the ID of the GPU you want to use. If you see more than one device -- that means you either have an additional AMD CPU, or an integrated GPU installed as well; ignore them. You will need to override two environment variables:
    
        - `HSA_OVERRIDE_GFX_VERSION` set to GFX version that you used to compile the code (for most recent AMD cards that would be `11.0.0` (if you used `GFX1100` Kokkos flag);
        - `HIP_VISIBLE_DEVICES`, and `ROCR_VISIBLE_DEVICES` both need to be set to your device ID (usually, it's just a number from 0 to the number of devices that support HIP).

        For example, the output of `rocminfo | grep -A 5 "Agent "` may look like this:
        ```
        Agent 1                  
        *******                  
          Name:                    AMD Ryzen 9 7940HS w/ Radeon 780M Graphics
          Uuid:                    CPU-XX                             
          Marketing Name:          AMD Ryzen 9 7940HS w/ Radeon 780M Graphics
          Vendor Name:             CPU                                
        --
        Agent 2                  
        *******                  
          Name:                    gfx1100                            
          Uuid:                    GPU-XX                             
          Marketing Name:          AMD Radeon™ RX 7700S             
          Vendor Name:             AMD                                
        --
        Agent 3                  
        *******                  
          Name:                    gfx1100                            
          Uuid:                    GPU-XX                             
          Marketing Name:          AMD Radeon Graphics                
          Vendor Name:             AMD
        ```
        In this case, the required GPU is the `Agent 2`, which supports GFX1100. `rocm-smi` will look something like this:
        ```
        ============================================ ROCm System Management Interface ============================================
        ====================================================== Concise Info ======================================================
        Device  Node  IDs              Temp    Power    Partitions          SCLK  MCLK     Fan    Perf  PwrCap       VRAM%  GPU%  
                      (DID,     GUID)  (Edge)  (Avg)    (Mem, Compute, ID)                                                        
        ==========================================================================================================================
        0       1     0x7480,   19047  35.0°C  0.0W     N/A, N/A, 0         0Mhz  96Mhz    29.8%  auto  100.0W       0%     0%    
        1       2     0x15bf,   17218  48.0°C  19.111W  N/A, N/A, 0         None  1000Mhz  0%     auto  Unsupported  82%    5%    
        ==========================================================================================================================
        ================================================== End of ROCm SMI Log ===================================================
        ```
        so the GPU we need has `Device` ID of `0` (since it's the dedicated GPU, it might automatically turn off when idle to save power on laptops; hence `Power = 0.0W`). Now we can run the code with: 
        ```sh
        HSA_OVERRIDE_GFX_VERSION=11.0.0 HIP_VISIBLE_DEVICES=1 ROCR_VISIBLE_DEVICES=1 ./executable ...
        ```


??? faq "Running in a `docker` container with an AMD card"

    AMD has a vary [brief documentation](https://rocm.docs.amd.com/projects/install-on-linux/en/latest/how-to/docker.html) on the topic. In theory the `docker` containers that come with the code should work. Just make sure you have the proper groups (`render` and `video`) defined and added to the current user. If it complains about access to `/dev/kfd`, You might have to run docker as a root.
