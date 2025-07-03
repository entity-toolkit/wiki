---
hide:
  - footer
libraries:
  - highlight
---

# Input parameters

Entity reads almost all the information (except for the problem generator) about the simulation at runtime from an input file provided in the `.toml` format. The most up-to-date full version of the input file with all the possible input parameters with their descriptions can be found in the root directory of the main repository in the `input.example.toml`.

<div class="table-legend">
  <table>
    <tbody>
      <tr class="required">
        <td><pre>required</pre></td>
        <td>These paremeters are required to be specified for any simulation</td>
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