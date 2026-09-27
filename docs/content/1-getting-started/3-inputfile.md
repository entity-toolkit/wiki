---
hide:
  - footer
libraries:
  - highlight
---

# Input parameters

Entity reads almost all the information (except for the problem generator) about the simulation at runtime from an input file provided in a `.toml` format. The most up-to-date full version of the input file with all the possible input parameters with their descriptions and default values can be found in the root directory of the main repository in the `input.default.toml`.  


!!! note "Toml schema" 

    The template input file is automatically generated from the `entity.schema.json` schema file, which can also be used with tools like `tombi` or `taplo` to verify the validity of your input `toml` file.


!!! note "Accessing the parameters in the code"

    All the parameters listed below can be accessed at runtime from the code through the `SimulationParams` container object stored in the `Simulation` class and typically passed to the relevant functions. For example, to access the fiducial cyclotron frequency, you can do: `params.template get<real_t>("scales.omegaB0")`. Note that you need to explicitly specify the type of the variable to return.

<div class="table-legend">
  <table>
    <tbody>
      <tr class="required">
        <td><pre>required</pre></td>
        <td>These parameters are required to be specified for any simulation</td>
      </tr>
      <tr class="inferred">
        <td><pre>inferred</pre></td>
        <td>These parameters are not directly specified by the user, but are inferred from other input parameters</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="table-container">
--8<-- "docs/assets/meta/input-table.html"
</div>
