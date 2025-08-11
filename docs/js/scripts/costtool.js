document.addEventListener(
  "DOMContentLoaded",
  () => {
    // first group
    const mode_slider = document.getElementById("mode");
    const dimension_slider = document.getElementById("dim");
    const dimension_options = document.getElementById("dim-ticks");
    const coord_slider = document.getElementById("coord");
    const coord_options = document.getElementById("coord-ticks");

    // second group
    const resolution_inputs = document.querySelectorAll(".res-num");

    const avg_ppc_input = document.getElementById("avg-ppc");
    const nplds_input = document.getElementById("nplds");

    const realt_precision_switch = document.getElementById("switch-real-t");
    const prtldxt_precision_switch = document.getElementById("switch-prtldx-t");

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
      ...resolution_inputs,
      avg_ppc_input,
      nplds_input,
      realt_precision_switch,
      prtldxt_precision_switch,
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

      const toScientific = (value) => {
        const exponent = Math.floor(Math.log10(value));
        const mantissa = value / Math.pow(10, exponent);
        return `${mantissa.toFixed(2)} × 10<sup>${exponent}</sup>`;
      };

      const usageFmt = (val) => {
        return `<code>${val.value}</code> ${val.prefix}`;
      };

      const numberFmt = (val, postfix) => {
        return `[<code>${val}</code> ${postfix}]`;
      };

      // output
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

      document.querySelector("#memory-usage-total #total span").innerHTML =
        usageFmt(
          toHumanReadable(
            bytes_per_cell * ncells + bytes_per_particle * ncells * nppc,
          ),
        );
      document.querySelectorAll(
        "#memory-usage-total #fields-total span",
      )[1].innerHTML = numberFmt(toScientific(ncells), "cells");
      document.querySelectorAll(
        "#memory-usage-total #particles-total span",
      )[1].innerHTML = numberFmt(toScientific(ncells * nppc), "particles");
    };
    reevaluate();
  },
  false,
);
