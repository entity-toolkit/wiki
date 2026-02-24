document.addEventListener(
  "DOMContentLoaded",
  () => {
    const performance_ns = {
      V100: {
        "1D-SR-Cart": 3,
        "2D-SR-Cart": 5,
        "3D-SR-Cart": 10,
        "2D-SR-Sph": 7,
        "2D-SR-QSph": 10,
        "2D-GR-Sph": 14,
        "2D-GR-QSph": 20,
      },
      A100: {
        "1D-SR-Cart": 2,
        "2D-SR-Cart": 4,
        "3D-SR-Cart": 8,
        "2D-SR-Sph": 5,
        "2D-SR-QSph": 8,
        "2D-GR-Sph": 10,
        "2D-GR-QSph": 16,
      },
      H100: {
        "1D-SR-Cart": 1,
        "2D-SR-Cart": 2,
        "3D-SR-Cart": 5,
        "2D-SR-Sph": 3,
        "2D-SR-QSph": 5,
        "2D-GR-Sph": 7,
        "2D-GR-QSph": 10,
      },
      MI250X: {
        "1D-SR-Cart": 2,
        "2D-SR-Cart": 4,
        "3D-SR-Cart": 8,
        "2D-SR-Sph": 5,
        "2D-SR-QSph": 8,
        "2D-GR-Sph": 10,
        "2D-GR-QSph": 16,
      },
      PVC: {
        "1D-SR-Cart": 3,
        "2D-SR-Cart": 5,
        "3D-SR-Cart": 10,
        "2D-SR-Sph": 7,
        "2D-SR-QSph": 10,
        "2D-GR-Sph": 14,
        "2D-GR-QSph": 20,
      },
    };

    // first group
    const mode_slider = document.getElementById("mode");
    const dimension_slider = document.getElementById("dim");
    const dimension_options = document.getElementById("dim-ticks");
    const coord_slider = document.getElementById("coord");
    const coord_options = document.getElementById("coord-ticks");

    const coord_details_group = document.querySelectorAll(".coord-details");
    const qsph_r0_input = document.getElementById("qsph-r");
    const qsph_h_input = document.getElementById("qsph-h");

    // second group
    const resolution_inputs = document.querySelectorAll(".res-num");

    const cfl_input = document.getElementById("cfl");
    const extent_input = document.getElementById("extent");
    const runtime_input = document.getElementById("runtime");

    const avg_ppc_input = document.getElementById("avg-ppc");
    const nplds_input = document.getElementById("nplds");

    const realt_precision_switch = document.getElementById("switch-real-t");
    const prtldxt_precision_switch = document.getElementById("switch-prtldx-t");

    // third group
    const arch_input = document.getElementById("arch");
    const gpus_pernode_input = document.getElementById("gpuspernode");
    const ngpus_input = document.getElementById("ngpus");

    const total_memory_group = document.querySelectorAll(".total-memory")[0];
    const perfperpart_group = document.querySelectorAll(".perf-per-part")[0];

    const pergpumemory_input = document.getElementById("pergpumemory");
    const perfperpart_input = document.getElementById("perfperpart");

    const memory_overhead_input = document.getElementById("memoryoverhead");
    const perf_overhead_input = document.getElementById("perfoverhead");

    const enableAllOptions = (group) => {
      const options = group.children;
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        option.disabled = false;
      }
    };

    const disableOption = (group, value) => {
      const options = group.children;
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (option.value === value) {
          option.disabled = true;
        }
      }
    };

    [
      mode_slider,
      dimension_slider,
      coord_slider,
      qsph_r0_input,
      qsph_h_input,
      ...resolution_inputs,
      cfl_input,
      extent_input,
      runtime_input,
      avg_ppc_input,
      nplds_input,
      realt_precision_switch,
      prtldxt_precision_switch,
      arch_input,
      gpus_pernode_input,
      ngpus_input,
      pergpumemory_input,
      perfperpart_input,
      memory_overhead_input,
      perf_overhead_input,
    ].forEach((slider) => {
      slider.addEventListener(
        "input",
        () => {
          reevaluate();
        },
        false,
      );
    });

    [realt_precision_switch, prtldxt_precision_switch].forEach((switch_el) => {
      const switch_precision = (el) => {
        el.previousElementSibling.textContent = el.checked
          ? "double"
          : "single";
      };
      switch_el.addEventListener(
        "change",
        switch_precision.bind(null, switch_el),
        true,
      );
      switch_precision(switch_el);
    });

    const mode_values = {
      0: "SR",
      1: "GR",
    };

    const coord_values = {
      1: "Cart",
      2: "Sph",
      3: "QSph",
    };

    const reevaluate = () => {
      console.log("reevaluate");

      // first group
      const mode = mode_values[mode_slider.value];
      if (mode == "GR") {
        dimension_slider.value = "2";
        if (coord_slider.value === "1") {
          coord_slider.value = "2";
        }
        disableOption(dimension_options, "1");
        disableOption(dimension_options, "3");
        disableOption(coord_options, "1");
      } else {
        enableAllOptions(dimension_options);
        enableAllOptions(coord_options);
      }

      const dimension = parseInt(dimension_slider.value, 10);

      if (dimension === 1 || dimension === 3) {
        coord_slider.value = "1";
        disableOption(coord_options, "2");
        disableOption(coord_options, "3");
      } else {
        enableAllOptions(coord_options);
        if (mode == "GR") {
          disableOption(coord_options, "1");
        }
      }
      const coord = coord_values[coord_slider.value];

      if (coord == "QSph") {
        coord_details_group.forEach((el) => {
          el.style.display = "block";
        });
      } else {
        coord_details_group.forEach((el) => {
          el.style.display = "none";
        });
      }

      const r0 = parseFloat(qsph_r0_input.value);
      const h = parseFloat(qsph_h_input.value);

      // second group

      const resolution_inputs = document.querySelectorAll(
        ".resolution-row .res-num",
      );
      const resolution_xs = document.querySelectorAll(".resolution-row .times");
      for (let i = 0; i < resolution_inputs.length; i++) {
        const input = resolution_inputs[i];
        if (i < dimension) {
          input.style.display = "inline-block";
        } else {
          input.style.display = "none";
        }
      }
      for (let i = 0; i < resolution_xs.length; i++) {
        const xs = resolution_xs[i];
        if (i < dimension - 1) {
          xs.style.display = "inline-block";
        } else {
          xs.style.display = "none";
        }
      }

      const cfl = parseFloat(cfl_input.value);
      const extent = parseFloat(extent_input.value);
      const runtime = parseFloat(runtime_input.value);

      // constants
      const float_bytes = 4;
      const int_bytes = 4;
      const double_bytes = 8;
      const short_bytes = 2;

      //// calculate the memory use
      let ncells = 1;
      for (let d = 0; d < dimension; d++) {
        const res = parseInt(resolution_inputs[d].value, 10);
        ncells *= res;
      }

      const computeDelta_t = (cfl, ext, dim, res_inputs, r0, h, coord) => {
        if (coord == "Cart") {
          return (cfl * ext) / res_inputs[0].value / Math.sqrt(dim);
        } else if (coord == "Sph") {
          const rmin = 1.0;
          const dr = ext / res_inputs[0].value;
          const dth = Math.PI / res_inputs[1].value;
          const dxmin =
            1.0 / Math.sqrt(1.0 / (dr * dr) + 1.0 / (rmin * rmin * dth * dth));
          return cfl * dxmin;
        } else if (coord == "QSph") {
          const rmin = 1.0;
          const chi_min = Math.log(rmin - r0);
          const dchi =
            (Math.log(rmin + ext - r0) - chi_min) / res_inputs[0].value;
          const h_11 = dchi * dchi * Math.exp(2 * chi_min);
          const theta2eta = (theta) => {
            if (h === 0.0) {
              return theta;
            }
            const R = Math.pow(
              -9.0 * (h * h) * (Math.PI - 2.0 * theta) +
                Math.sqrt(3) *
                  Math.sqrt(
                    h *
                      h *
                      h *
                      ((4.0 - h) * Math.pow(Math.PI + h * 2 * Math.PI, 2) -
                        108.0 * h * Math.PI * theta +
                        108.0 * h * (theta * theta)),
                  ),
              1.0 / 3.0,
            );
            const PI_TO_TWO_THIRD = 2.14502939711102560008;
            const PI_TO_ONE_THIRD = 1.46459188756152326302;
            const TWO_TO_TWO_THIRD = 1.58740105196819947475;
            const THREE_TO_ONE_THIRD = 1.442249570307408382321;
            const TWO_TO_ONE_THIRD = 1.2599210498948731647672;
            const THREE_PI_TO_TWO_THIRD = 4.46184094890142313715794;
            return (
              (PI_TO_TWO_THIRD *
                (6.0 * PI_TO_ONE_THIRD +
                  (2.0 * TWO_TO_ONE_THIRD * (h - 1.0) * THREE_PI_TO_TWO_THIRD) /
                    R +
                  (TWO_TO_TWO_THIRD * THREE_TO_ONE_THIRD * R) / h)) /
              12.0
            );
          };
          const dtheta_deta = (eta) => {
            if (h === 0.0) {
              return 1.0;
            }
            return 1 + 2 * h + 12.0 * h * (eta / Math.PI) * (eta / Math.PI - 1);
          };
          const deta = theta2eta(Math.PI) / res_inputs[1].value;
          const h_22 =
            deta *
            deta *
            Math.pow(dtheta_deta(0.0), 2.0) *
            Math.pow(r0 + Math.exp(chi_min), 2.0);
          return cfl / Math.sqrt(1.0 / h_11 + 1.0 / h_22);
        } else {
          console.error("unknown coord");
          return 0.0;
        }
      };

      const delta_t = computeDelta_t(
        cfl,
        extent,
        dimension,
        resolution_inputs,
        r0,
        h,
        coord,
      );

      const nppc = parseFloat(avg_ppc_input.value);
      const nplds = parseInt(nplds_input.value);

      const real_t_bytes = realt_precision_switch.checked
        ? double_bytes
        : float_bytes;
      const prtldx_t_bytes = prtldxt_precision_switch.checked
        ? double_bytes
        : float_bytes;

      // fields
      let bytes_per_cell = 0;
      bytes_per_cell += (6 + 6 + 3 + 3) * dimension * real_t_bytes; // em + bckp + cur + buff
      if (mode === "GR") {
        bytes_per_cell += (6 + 6 + 3) * dimension * real_t_bytes; // em0 + aux + cur0
      }

      // particles
      let bytes_per_particle = 0;
      bytes_per_particle += 3 * real_t_bytes; // velocity
      bytes_per_particle += real_t_bytes; // weight
      bytes_per_particle += nplds * real_t_bytes; // weight
      bytes_per_particle += short_bytes; // tag
      for (let d = 0; d < dimension; d++) {
        bytes_per_particle += 2 * int_bytes; // position (i, i_prev)
        bytes_per_particle += 2 * prtldx_t_bytes; // position (dx, dx_prev)
      }
      if (coord !== "Cart") {
        bytes_per_particle += real_t_bytes; // phi
      }

      // third group
      const arch = arch_input.value;

      var pergpu_memory, perpart_performance;

      if (arch == "custom") {
        total_memory_group.style.display = "block";
        perfperpart_group.style.display = "block";
        pergpu_memory = parseFloat(pergpumemory_input.value);
        perpart_performance = parseFloat(perfperpart_input.value);
      } else {
        total_memory_group.style.display = "none";
        perfperpart_group.style.display = "none";
        const arch_match = arch.match(/(.*)-(.*)/);
        if (arch_match) {
          pergpu_memory = parseFloat(arch_match[2]);
          const arch_key = arch_match[1];
          if (performance_ns.hasOwnProperty(arch_key)) {
            const setting = `${dimension}D-${mode}-${coord}`;
            if (performance_ns[arch_key].hasOwnProperty(setting)) {
              perpart_performance = performance_ns[arch_key][setting];
            } else {
              console.error("cannot parse mode/coord");
            }
          } else {
            console.error("cannot parse arch");
          }
        } else {
          console.error("cannot parse arch");
        }
      }
      const ngpus_per_node = parseInt(gpus_pernode_input.value);
      const ngpus = parseInt(ngpus_input.value);

      const memory_overhead = parseFloat(memory_overhead_input.value) / 100.0;
      bytes_per_cell *= 1.0 + memory_overhead;
      bytes_per_particle *= 1.0 + memory_overhead;

      const perf_overhead = parseFloat(perf_overhead_input.value);
      perpart_performance *= perf_overhead;

      // converter
      const toHumanReadable = (bytes) => {
        const prefixes = ["", "K", "M", "G", "T", "P"];
        let value = bytes;
        let prefix_idx = 0;
        while (value >= 1024 && prefix_idx < prefixes.length - 1) {
          value /= 1024;
          prefix_idx++;
        }
        return {
          value: `${value.toFixed(2)}`,
          prefix: `${prefixes[prefix_idx]}B`,
        };
      };

      const toHumanReadableTime = (seconds) => {
        const units = [
          { label: "yr", value: 365 * 24 * 3600 },
          { label: "day", value: 24 * 3600 },
          { label: "hr", value: 3600 },
          { label: "min", value: 60 },
          { label: "s", value: 1 },
          { label: "ms", value: 1e-3 },
          { label: "us", value: 1e-6 },
          { label: "ns", value: 1e-9 },
        ];
        let idx = 4;
        let value = seconds;
        while (
          (value < 0.1 || value >= 100) &&
          idx < units.length - 1 &&
          idx > 0
        ) {
          if (value < 0.1) {
            value *= units[idx].value / units[idx + 1].value;
            idx++;
          } else {
            value *= units[idx].value / units[idx - 1].value;
            idx--;
          }
        }
        return {
          value: `${value.toFixed(2)}`,
          prefix: units[idx].label,
        };
      };

      const toScientific = (value) => {
        const exponent = Math.floor(Math.log10(value));
        const mantissa = value / Math.pow(10, exponent);
        return `${mantissa.toFixed(2)} × 10<sup>${exponent}</sup>`;
      };

      const normalFmt = (val) => {
        return `<code>${val}</code>`;
      };

      const usageFmt = (val) => {
        return `<code>${val.value}</code> ${val.prefix}`;
      };

      const numberFmt = (val, postfix) => {
        return `[<code>${val}</code> ${postfix}]`;
      };

      // output memory
      document.querySelector(
        "#memory-usage-unit #fields-per-cell span",
      ).innerHTML = usageFmt(toHumanReadable(bytes_per_cell));
      document.querySelector(
        "#memory-usage-unit #particles-each span",
      ).innerHTML = usageFmt(toHumanReadable(bytes_per_particle));

      document.querySelectorAll(
        "#memory-usage-total #fields-total span",
      )[0].innerHTML = usageFmt(toHumanReadable(bytes_per_cell * ncells));

      document.querySelectorAll(
        "#memory-usage-total #particles-total span",
      )[0].innerHTML = usageFmt(
        toHumanReadable(bytes_per_particle * ncells * nppc),
      );

      const total_memory_needed =
        bytes_per_cell * ncells + bytes_per_particle * ncells * nppc;

      document.querySelector("#memory-usage-total #total span").innerHTML =
        usageFmt(toHumanReadable(total_memory_needed));
      document.querySelectorAll(
        "#memory-usage-total #fields-total span",
      )[1].innerHTML = numberFmt(toScientific(ncells), "cells");
      document.querySelectorAll(
        "#memory-usage-total #particles-total span",
      )[1].innerHTML = numberFmt(toScientific(ncells * nppc), "particles");

      document.querySelectorAll(
        "#memory-usage-total #pergpu-memory span",
      )[0].innerHTML = usageFmt(toHumanReadable(total_memory_needed / ngpus));
      document.querySelectorAll(
        "#memory-usage-total #pergpu-memory span",
      )[1].innerHTML = numberFmt(
        toScientific((ncells * nppc) / ngpus),
        "particles",
      );

      // output performance
      document.querySelector(
        "#runtime-unit #delta_t > span:last-child",
      ).innerHTML = normalFmt(toScientific(delta_t));

      let rec_ngpus = Math.max(
        1,
        total_memory_needed / (pergpu_memory * 1024 * 1024 * 1024),
      );

      if (rec_ngpus > ngpus_per_node) {
        rec_ngpus = Math.ceil(rec_ngpus / ngpus_per_node) * ngpus_per_node;
      }
      let rec_nnodes = Math.ceil(rec_ngpus / ngpus_per_node);

      document.querySelectorAll(
        "#runtime-total #recommended-ngpus span",
      )[0].innerHTML = normalFmt(parseInt(rec_ngpus));
      document.querySelectorAll(
        "#runtime-total #recommended-ngpus span",
      )[1].innerHTML = "[" + normalFmt(parseInt(rec_nnodes)) + "nodes]";

      const nsteps = parseInt(runtime / delta_t);
      const timestep_duration =
        (ncells * nppc * (perpart_performance * 1e-9)) / ngpus;
      const total_duration = timestep_duration * nsteps;

      const total_cost = (total_duration * ngpus) / 3600.0;

      document.querySelector("#runtime-total #timestep-total span").innerHTML =
        normalFmt(parseInt(runtime / delta_t));
      document.querySelector(
        "#runtime-unit #timestep-duration span",
      ).innerHTML = usageFmt(toHumanReadableTime(timestep_duration));

      document.querySelector("#runtime-total #time-total span").innerHTML =
        usageFmt(toHumanReadableTime(total_duration));
      document.querySelector("#runtime-total #cost-total span").innerHTML =
        normalFmt(parseInt(total_cost)) + " GPU-hrs";
    };
    reevaluate();
  },
  false,
);
