---
hide:
  - footer
---

<a href="https://github.com/entity-toolkit/entity/pull/67">
  <span class="since-version">1.2.0</span>
</a>

Oftentimes, large simulations cannot be run on a single go. For these cases, Entity provides a functionality to save a so-called "checkpoint" (essentially, a snapshot) of the simulation at a specific timestep, which can further be used to continue the simulation from where it was left off. 

## Writing checkpoints

Since the checkpoint writing relies on the `ADIOS2` library, to be able to use checkpointing, the code has to be compiled with the `-D output=ON` flag (enabled by default). Configurations for the checkpoint writing are done via the `.toml` input file under the block named `[checkpoint]` (also see the [input file documentation](3-inputfile.md)). The following parameters control how often the checkpoint is written, as well as how many snapshots are preserved as the simulation runs.

| parameter | description | default |
| ---- | ---- | ---- |
| `interval` | # of timesteps between checkpoints | `1000` |
| `interval_time` | code-unit time between checkpoints (overrides `interval` unless `interval_time < 0`) | `-1.0` |
| `keep` | # of checkpoints to keep (e.g., `2` will keep the latest and the one before it, removing older ones; `-1` = keep all, `0` = disable checkpoint writing) | `-1` |
| `walltime` | forces the simulation to write an additional checkpoint after a certain walltime from the beginning of the simulation | `""` |

!!! note "Saving space"

    Since snapshots can become quite large, to save storage space, it is recommended to set the `keep` parameter small. Sometimes, it is useful to have at least one backup checkpoint (i.e., `keep >= 2`), as the simulation may crash (due to, e.g., time limit on clusters) during the checkpoint writing, in which case the latest checkpoint might become corrupted. 

The simulation will then produce checkpoints of `BP5` format written in the `checkpoints/` directory. Together with the data, checkpoints will also store all the parameters of the simulation in the corresponding `.toml` file.

!!! tip "Large simulations with limited time allocation"

    When running large simulations on clusters with scheduling systems, it is often useful to ensure at least one checkpoint exists right before the allocated time expires. To ensure that a checkpoint is written before the exit, in `Entity` you can define a `walltime` parameter mentioned above. For instance, if the expected runtime is 24 hrs, one may specify `23:30:00` to enforce writing one checkpoint 23.5 hours after the simulation begins.

## Continuing (restarting) from a checkpoint

To restart the simulation from the latest checkpoint, simply rerun the executable `./entity.xc ... <ARG>`, specifying one of the following command-line arguments: `-continue`, `-restart`, `-resume`, or `-checkpoint` (all of these are equivalent). The simulation will then automatically find the newest checkpoint and continue from it. 

While most of the simulation parameters will be read from the checkpoint itself, you may also provide an input file with updated parameters (e.g., if you wish to adjust the value of some parameters). Note, however, that not all the parameters can be changed when restarting the simulation. In particular, anything related to the metric, the box extent, the resolution, or units (i.e., `ppc0`, `larmor0`, `skindepth0`) cannot be altered. These immutable parameters, if changed in the new inputfile, will simply be ignored and instead overriden by those read from the checkpoint data. Likewise, Entity current does not support changing the domain decomposition for multi-domain (i.e., MPI) simulations when resuming from a checkpoint.
