document.addEventListener(
  "DOMContentLoaded",
  () => {
    const sketch = (ctx) => {
      //
      // - - - - Configuration and constants - - - -
      //
      const CONFIGS = {
        graphics: {
          positive_charge_color: "#d62728",
          negative_charge_color: "#1f77b4",
        },
        simulation: {
          speed: 5,
          delta_t: 0.01,
          history_interval: 5,
          history_max: 500,
        },
        axes: {
          color: "#8f8f8f",
          weight: 1,
          ticksize: 10,
          tickfontsize: 16,
        },
      };

      const FieldPresets = {
        ExB: {
          plot: "",
          ey: "0.1",
          bz: "1",
        },
        betatron: {
          plot: "bz",
          bz: "tanh(y / 0.5)",
          ey: " 0.1",
        },
        gradb: {
          plot: "bz",
          bz: "1 + max(x - 1, 0)",
        },
        dipole: {
          plot: "bx",
          bx: "300 * x * y / (x^2 + y^2)^2.5",
          by: "100 * (-x^2 + 2 * y^2) / (x^2 + y^2)^2.5",
        },
        mirror: {
          plot: "bx",
          bx: "(abs(x - 3) > 3) ? (20.0) : ((abs(x - 3) < 2.5) ? 2.0 : (2.0 + 0.5 * (20.0 - 2.0) * (-sin(PI * (abs(x - 3) - 2.5 + 0.25) / 0.5) + 1)))",
          by: "(abs(x - 3) > 3) ? (0.0) : ((abs(x - 3) < 2.5) ? 0.0 : (0.5 * sqrt(y^2 + z^2) * (0.5 * (20.0 - 2.0) * cos(PI * (abs(x - 3) - 2.5 + 0.25) / 0.5) * (PI / 0.5) * sign(x - 3))) * cos(atan2(z, y)))",
          bz: "(abs(x - 3) > 3) ? (0.0) : ((abs(x - 3) < 2.5) ? 0.0 : (0.5 * sqrt(y^2 + z^2) * (0.5 * (20.0 - 2.0) * cos(PI * (abs(x - 3) - 2.5 + 0.25) / 0.5) * (PI / 0.5) * sign(x - 3))) * sin(atan2(z, y)))",
        },
        noise: {
          plot: "bz",
          bx: "20*((sin(12.9898*x + 78.233*y + 37.719*z)*43758.5453)%1.0)-1",
          by: "20*((sin(93.9898*x + 67.345*y + 11.135*z)*24634.6345)%1.0)-1",
          bz: "20*((sin(45.332*x + 12.345*y + 98.765*z)*13597.2463)%1.0)-1",
        },
      };

      const Algorithms = {
        Boris: {
          leapfrog: true,
          update: (time, fields, pos, vel, charge, dt) => {
            const efield = new p5.Vector(
              fields.ex_field(pos.x, pos.y, pos.z, time),
              fields.ey_field(pos.x, pos.y, pos.z, time),
              fields.ez_field(pos.x, pos.y, pos.z, time),
            );
            const bfield = new p5.Vector(
              fields.bx_field(pos.x, pos.y, pos.z, time),
              fields.by_field(pos.x, pos.y, pos.z, time),
              fields.bz_field(pos.x, pos.y, pos.z, time),
            );
            const newvel = BorisPush(vel, charge, efield, bfield, dt);
            const newpos = LeapFrogPosition(pos, newvel, dt);
            return { pos: newpos, vel: newvel };
          },
        },
        Vay: {
          leapfrog: true,
          update: (time, fields, pos, vel, charge, dt) => {
            const efield = new p5.Vector(
              fields.ex_field(pos.x, pos.y, pos.z, time),
              fields.ey_field(pos.x, pos.y, pos.z, time),
              fields.ez_field(pos.x, pos.y, pos.z, time),
            );
            const bfield = new p5.Vector(
              fields.bx_field(pos.x, pos.y, pos.z, time),
              fields.by_field(pos.x, pos.y, pos.z, time),
              fields.bz_field(pos.x, pos.y, pos.z, time),
            );
            const newvel = VayPush(vel, charge, efield, bfield, dt);
            const newpos = LeapFrogPosition(pos, newvel, dt);
            return { pos: newpos, vel: newvel };
          },
        },
        Implicit: {
          leapfrog: false,
          update: (time, fields, pos, vel, charge, dt) => {
            return ImplicitMidpoint(time, fields, pos, vel, charge, dt);
          },
        },
      };

      const colormaps = {
        RdBu: (v) =>
          _interpolate_from_colormap(
            v,
            [-0.42655404, 5.11053828, 2.60210494, -0.24775716, 0.68548868],
            [-0.43789239, 5.45311346, 1.93648876, 0.25482016, 0.37649946],
            [-0.33677981, 5.85671616, 1.37094217, 0.29588045, 0.45271235],
          ),
        Reds: (v) =>
          _interpolate_from_colormap(
            v,
            [-0.36008609, 3.27993639, 2.27431728, -1.12173194, 1.28783032],
            [0.19005493, 4.15426514, -4.90548603, -0.62205926, 0.76875249],
            [0.11693563, 5.43913185, 1.59049275, -0.86103665, 0.82883181],
          ),
        Blues: (v) =>
          _interpolate_from_colormap(
            v,
            [-0.22084496, 4.10425299, 4.39952825, -0.53507463, 0.73433042],
            [-0.06564444, 4.41960358, 2.8493782, -0.75237636, 1.00057129],
            [
              -2.02457522e3, 1.25888404e-1, 3.10759091, -2.55168362e2,
              6.9839198e1,
            ],
          ),
      };

      //
      // - - - - Utility functions - - - -
      //
      const _interpolate_from_colormap = (v, r_coeffs, g_coeffs, b_coeffs) => {
        const func = (x, a, b, c, d, e) => a * Math.sin(b * x + c) + d * x + e;

        const r = Math.min(1.0, Math.max(0.0, func(v, ...r_coeffs)));
        const g = Math.min(1.0, Math.max(0.0, func(v, ...g_coeffs)));
        const b = Math.min(1.0, Math.max(0.0, func(v, ...b_coeffs)));
        return {
          r: parseInt(r * 255),
          g: parseInt(g * 255),
          b: parseInt(b * 255),
        };
      };

      const _get_colormap_color = (value, vmin, vmax, cmap) => {
        let reversed = false;
        if (cmap.endsWith("_r")) {
          reversed = true;
          cmap = cmap.slice(0, -2);
        }
        if (!(cmap in colormaps)) {
          console.error(`Colormap ${cmap} not found!`);
          return { r: 255, g: 255, b: 255, a: 0 };
        }
        if (value < vmin) value = vmin;
        if (value >= vmax) value = vmax;
        let v = (value - vmin) / (vmax - vmin);
        if (reversed) {
          v = 1 - v;
        }
        return colormaps[cmap](v);
      };

      const _get_colors = () => {
        let c = getComputedStyle(document.body).getPropertyValue(
          "--md-default-fg-color",
        );
        return c.split(",").length == 4
          ? c.split(",").slice(0, 3).join() + ",1)"
          : c;
      };

      const _get_delta_ticks = (M) => {
        const scale = Math.pow(10.0, Math.floor(Math.log(M) / Math.log(10)));
        const m = M / scale;
        if (m <= 0.8) {
          return scale * 0.1;
        } else if (m <= 1.6) {
          return scale * 0.2;
        } else if (m <= 2) {
          return scale * 0.25;
        } else if (m <= 5) {
          return scale * 0.5;
        } else {
          return scale;
        }
      };

      const _expand_domain = (particles) => {
        if (particles.length === 0) return;
        // find min/max x/y
        let xmin = particles[0].pos.x;
        let xmax = particles[0].pos.x;
        let ymin = particles[0].pos.y;
        let ymax = particles[0].pos.y;
        particles.forEach((p) => {
          if (p.pos.x < xmin) xmin = p.pos.x;
          if (p.pos.x >= xmax) xmax = p.pos.x;
          if (p.pos.y < ymin) ymin = p.pos.y;
          if (p.pos.y >= ymax) ymax = p.pos.y;
        });
        let expanded = false;
        if (xmax >= xlims.y - (xlims.y - xlims.x) * 0.1) {
          xlims.y = xmax + (xlims.y - xlims.x) * 0.1;
          const ycenter = 0.5 * (ylims.x + ylims.y);
          const yrange = (xlims.y - xlims.x) * (height / width);
          ylims.x = ycenter - 0.5 * yrange;
          ylims.y = ycenter + 0.5 * yrange;
          expanded = true;
        }
        if (xmin < xlims.x + (xlims.y - xlims.x) * 0.1) {
          xlims.x = xmin - (xlims.y - xlims.x) * 0.1;
          const ycenter = 0.5 * (ylims.x + ylims.y);
          const yrange = (xlims.y - xlims.x) * (height / width);
          ylims.x = ycenter - 0.5 * yrange;
          ylims.y = ycenter + 0.5 * yrange;
          expanded = true;
        }
        if (ymax >= ylims.y - (ylims.y - ylims.x) * 0.1) {
          ylims.y = ymax + (ylims.y - ylims.x) * 0.1;
          const xcenter = 0.5 * (xlims.x + xlims.y);
          const xrange = (ylims.y - ylims.x) * (width / height);
          xlims.x = xcenter - 0.5 * xrange;
          xlims.y = xcenter + 0.5 * xrange;
          expanded = true;
        }
        if (ymin < ylims.x + (ylims.y - ylims.x) * 0.1) {
          ylims.x = ymin - (ylims.y - ylims.x) * 0.1;
          const xcenter = 0.5 * (xlims.x + xlims.y);
          const xrange = (ylims.y - ylims.x) * (width / height);
          xlims.x = xcenter - 0.5 * xrange;
          xlims.y = xcenter + 0.5 * xrange;
          expanded = true;
        }
        return expanded;
      };

      const xy2px = (pos) =>
        new p5.Vector(
          (width * (pos.x - xlims.x)) / (xlims.y - xlims.x),
          height - (height * (pos.y - ylims.x)) / (ylims.y - ylims.x),
        );

      const px2xy = (px) =>
        new p5.Vector(
          (px.x * (xlims.y - xlims.x)) / width + xlims.x,
          ((height - px.y) * (ylims.y - ylims.x)) / height + ylims.x,
        );

      const _draw_axes = () => {
        ctx.push();
        const color = _get_colors();
        ctx.stroke(color);
        ctx.fill(color);
        ctx.strokeWeight(CONFIGS.axes.weight);
        ctx.textSize(CONFIGS.axes.tickfontsize);

        const y0 = xy2px(new p5.Vector(0, 0)).y;
        ctx.line(0, y0, width, y0);
        const x0 = xy2px(new p5.Vector(0, 0)).x;
        ctx.line(x0, 0, x0, height);
        const dx_ticks = Math.max(
          _get_delta_ticks(-xlims.x),
          _get_delta_ticks(xlims.y),
          _get_delta_ticks(-ylims.x),
          _get_delta_ticks(ylims.y),
        );

        for (let xi = 1; xi <= parseInt(xlims.y / dx_ticks); xi++) {
          const x = xi * dx_ticks;
          const px = xy2px(new p5.Vector(x, 0)).x;
          ctx.line(
            px,
            y0 - CONFIGS.axes.ticksize / 2,
            px,
            y0 + CONFIGS.axes.ticksize / 2,
          );
          ctx.textSize(CONFIGS.axes.tickfontsize);
          ctx.push();
          ctx.noStroke();
          ctx.textAlign(ctx.CENTER, ctx.TOP);
          ctx.text(x, px, y0 + 7);
          ctx.pop();
        }
        for (let xi = 1; xi <= parseInt(-xlims.x / dx_ticks); xi++) {
          const x = xi * dx_ticks;
          const px = xy2px(new p5.Vector(-x, 0)).x;
          ctx.line(
            px,
            y0 - CONFIGS.axes.ticksize / 2,
            px,
            y0 + CONFIGS.axes.ticksize / 2,
          );
          ctx.push();
          ctx.noStroke();
          ctx.textAlign(ctx.CENTER, ctx.TOP);
          ctx.text(x, px, y0 + 7);
          ctx.pop();
        }
        for (let yi = 1; yi <= parseInt(ylims.y / dx_ticks); yi++) {
          const y = yi * dx_ticks;
          const px = xy2px(new p5.Vector(0, y)).y;
          ctx.line(
            x0 - CONFIGS.axes.ticksize / 2,
            px,
            x0 + CONFIGS.axes.ticksize / 2,
            px,
          );
          ctx.push();
          ctx.noStroke();
          ctx.textAlign(ctx.LEFT, ctx.CENTER);
          ctx.text(y, x0 + 7, px);
          ctx.pop();
        }
        for (let yi = 1; yi <= parseInt(-ylims.x / dx_ticks); yi++) {
          const y = yi * dx_ticks;
          const px = xy2px(new p5.Vector(0, -y)).y;
          ctx.line(
            x0 - CONFIGS.axes.ticksize / 2,
            px,
            x0 + CONFIGS.axes.ticksize / 2,
            px,
          );
          ctx.push();
          ctx.noStroke();
          ctx.textAlign(ctx.LEFT, ctx.CENTER);
          ctx.text(-y, x0 + 7, px);
          ctx.pop();
        }
        ctx.pop();
      };

      //
      // - - - - Classes - - - -
      //
      class Particle {
        constructor(pos, vel, charge, dt) {
          this.pos = pos;
          this.vel = vel;
          this.charge = charge;
          this.pusher = select_pusher.value;
          if (Algorithms[this.pusher].leapfrog) {
            this.pos = LeapFrogPosition(this.pos, this.vel, dt / 2.0);
          }
          this.step = 0;
          this.history = [];
        }

        get beta() {
          return p5.Vector.div(this.vel, this.gamma);
        }

        get gamma() {
          return Math.sqrt(1 + this.vel.magSq());
        }

        update(dt, fields, time) {
          if (this.step % CONFIGS.simulation.history_interval === 0) {
            this.history.push(this.pos.copy());
            if (this.history.length > CONFIGS.simulation.history_max) {
              this.history.shift();
            }
          }
          const result = Algorithms[this.pusher].update(
            time,
            fields,
            this.pos,
            this.vel,
            this.charge,
            dt,
          );
          this.pos = result.pos;
          this.vel = result.vel;
          this.step += 1;
        }

        is_in_bounds() {
          return (
            this.pos.x >= xlims.x &&
            this.pos.x < xlims.y &&
            this.pos.y >= ylims.x &&
            this.pos.y < ylims.y
          );
        }

        draw() {
          ctx.push();
          ctx.noStroke();
          this.history.forEach((p, i) => {
            const px = xy2px(p);
            const c = ctx.color(
              this.charge > 0
                ? CONFIGS.graphics.positive_charge_color
                : CONFIGS.graphics.negative_charge_color,
            );
            c.setAlpha((255 * (i + 1)) / this.history.length);
            ctx.fill(c);
            ctx.circle(px.x, px.y, 4);
          });
          const px = xy2px(this.pos);
          ctx.fill(
            this.charge > 0
              ? CONFIGS.graphics.positive_charge_color
              : CONFIGS.graphics.negative_charge_color,
          );
          ctx.circle(px.x, px.y, 6);
          ctx.pop();
        }
      }

      class GhostParticle {
        constructor(pos, charge) {
          this.pos = pos;
          this.charge = charge;
        }

        draw() {
          ctx.push();
          const px = xy2px(this.pos);

          ctx.stroke(
            this.charge > 0
              ? CONFIGS.graphics.positive_charge_color
              : CONFIGS.graphics.negative_charge_color,
          );
          ctx.line(px.x, px.y, ctx.mouseX, ctx.mouseY);

          ctx.noStroke();
          ctx.fill(
            this.charge > 0
              ? CONFIGS.graphics.positive_charge_color
              : CONFIGS.graphics.negative_charge_color,
          );
          ctx.circle(px.x, px.y, 6);
          ctx.pop();
        }
      }

      class Fields {
        constructor(
          ex_input,
          ey_input,
          ez_input,
          bx_input,
          by_input,
          bz_input,
          ex_draw,
          ey_draw,
          ez_draw,
          bx_draw,
          by_draw,
          bz_draw,
          scale = 0.1,
        ) {
          this.ex_input = ex_input;
          this.ey_input = ey_input;
          this.ez_input = ez_input;
          this.bx_input = bx_input;
          this.by_input = by_input;
          this.bz_input = bz_input;

          this.ex_draw = ex_draw;
          this.ey_draw = ey_draw;
          this.ez_draw = ez_draw;
          this.bx_draw = bx_draw;
          this.by_draw = by_draw;
          this.bz_draw = bz_draw;

          this.draw_mode = "";
          this.field_is_timedependent = {
            ex: false,
            ey: false,
            ez: false,
            bx: false,
            by: false,
            bz: false,
          };
          this.texture = ctx.createImage(
            parseInt(width * scale),
            parseInt(height * scale),
          );

          for (const key of Object.keys(this)) {
            if (key.endsWith("_input")) {
              this[key].addEventListener("change", () =>
                this.parse(key.replace("_input", ""), global_time),
              );
            }
          }

          for (const key of Object.keys(this)) {
            if (key.endsWith("_draw")) {
              this[key].addEventListener("change", (e) => {
                // clear texture
                if (e.target.checked) {
                  for (const k of Object.keys(this)) {
                    if (k.endsWith("_draw") && k !== key) {
                      this[k].checked = false;
                    }
                  }
                  this.draw_mode = key.replace("_draw", "");
                  this.retexture(key.replace("_draw", ""), 0);
                } else {
                  this.draw_mode = "";
                  this.retexture("", 0);
                }
              });
            }
          }

          this.ex_field = () => 0;
          this.ey_field = () => 0;
          this.ez_field = () => 0;
          this.bx_field = () => 0;
          this.by_field = () => 0;
          this.bz_field = () => 0;

          this.parse("ex", 0);
          this.parse("ey", 0);
          this.parse("ez", 0);
          this.parse("bx", 0);
          this.parse("by", 0);
          this.parse("bz", 0);

          for (const key of Object.keys(this)) {
            if (key.endsWith("_draw") && this[key].checked) {
              this.draw_mode = key.replace("_draw", "");
              this.retexture(key.replace("_draw", ""), 0);
            }
          }
        }

        parse(key, time) {
          console.log("parsing", key);
          const input_key = `${key}_input`;
          const field_key = `${key}_field`;
          try {
            if (this[input_key].value.trim() === "") {
              this[field_key] = () => 0;
              this.field_is_timedependent[key] = false;
            } else {
              const expr = parser.parse(this[input_key].value);
              if (expr.variables().includes("t")) {
                this.field_is_timedependent[key] = true;
              } else {
                this.field_is_timedependent[key] = false;
              }
              this[field_key] = (x, y, z, t) => {
                return expr.evaluate({ x: x, y: y, z: z, t: t });
              };
            }
            this[input_key].style.backgroundColor = "inherit";
          } catch (error) {
            console.error("Error parsing expression:", error);
            this[input_key].style.backgroundColor = "#eb8383";
          }
          if (this.draw_mode === key) {
            this.retexture(key, time);
          }
        }

        retexture(key, time) {
          this.texture.loadPixels();
          if (key === "") {
            console.log("clearing texture");
            for (let i = 0; i < this.texture.pixels.length; i += 4) {
              this.texture.pixels[i + 3] = 0; // set alpha to 0
            }
          } else {
            if (!this.field_is_timedependent[key]) {
              console.log("retexturing", key);
            }
            const field_key = `${key}_field`;
            let min_val = Infinity;
            let max_val = -Infinity;
            for (let i = 0; i < this.texture.width; i++) {
              for (let j = 0; j < this.texture.height; j++) {
                const pos = px2xy(
                  new p5.Vector(
                    (i + 0.5) * (width / this.texture.width),
                    (j + 0.5) * (height / this.texture.height),
                  ),
                );
                const val = this[field_key](pos.x, pos.y, 0, time);
                if (val < min_val) min_val = val;
                if (val > max_val) max_val = val;
              }
            }
            const max_abs = Math.max(Math.abs(min_val), Math.abs(max_val));
            let cmap = "RdBu_r";
            if (min_val === max_val || Math.abs(max_val - min_val) < 1e-8) {
              min_val = -1;
              max_val = 1;
            } else if (min_val > 0) {
              min_val = 0;
              max_val = max_abs;
              cmap = "Reds";
            } else if (max_val < 0) {
              min_val = -max_abs;
              max_val = 0;
              cmap = "Blues_r";
            } else {
              min_val = -max_abs;
              max_val = max_abs;
            }
            for (let i = 0; i < this.texture.width; i++) {
              for (let j = 0; j < this.texture.height; j++) {
                const pos = px2xy(
                  new p5.Vector(
                    (i + 0.5) * (width / this.texture.width),
                    (j + 0.5) * (height / this.texture.height),
                  ),
                );
                const val = this[field_key](pos.x, pos.y, 0, time);
                const { r, g, b } = _get_colormap_color(
                  val,
                  min_val,
                  max_val,
                  cmap,
                );
                const idx = 4 * (j * this.texture.width + i);
                this.texture.pixels[idx] = r;
                this.texture.pixels[idx + 1] = g;
                this.texture.pixels[idx + 2] = b;
                this.texture.pixels[idx + 3] = 50;
              }
            }
          }
          this.texture.updatePixels();
        }

        draw(time) {
          if (this.draw_mode === "") return;
          if (this.field_is_timedependent[this.draw_mode]) {
            this.retexture(this.draw_mode, time);
          }
          ctx.image(this.texture, 0, 0, width, height);
        }
      }

      //
      // - - - - p5.js sketch - - - -
      //
      let cnv;
      const width = document.getElementsByTagName("article")[0].offsetWidth;
      const height = width / 1.6;

      let xlims = new p5.Vector(-1, 9);
      let ylims = new p5.Vector((-5 * height) / width, (5 * height) / width);

      let state = 1,
        expand_domain = false,
        disable_drawing = false,
        global_time = 0.0;

      let particles = [];
      let ghost_particle = null;

      let btn_reset, btn_play_pause, btn_expand;
      let select_field_preset, select_pusher;

      let parser, eb_fields;

      const reset = () => {
        global_time = 0.0;
        btn_play_pause.html("||");
        state = 1;

        particles = [];
        ghost_particle = null;

        xlims = new p5.Vector(-1, 9);
        ylims = new p5.Vector((-5 * height) / width, (5 * height) / width);

        eb_fields.retexture(eb_fields.draw_mode, global_time);
      };

      ctx.setup = () => {
        const cnv_parent = document.querySelector("#pushers #canvas");
        cnv = ctx.createCanvas(width, height);
        cnv.parent(cnv_parent);
        cnv.elt.addEventListener("contextmenu", (e) => e.preventDefault());

        // global settings
        ctx.textFont("monospace");

        // controls
        btn_play_pause = ctx.createButton("||");
        btn_play_pause.position(width - 80, 10);

        btn_play_pause.mouseClicked(() => {
          if (state === 1) {
            btn_play_pause.html(">");
            state = 0;
          } else {
            btn_play_pause.html("||");
            state = 1;
          }
        });

        btn_reset = ctx.createButton("⟲");
        btn_reset.position(width - 80, 50);
        btn_reset.mouseClicked(reset);

        btn_expand = ctx.createButton("<sup>⇱</sup><sub>⇲</sub>");
        btn_expand.style("background-color", "#a98481");
        btn_expand.position(width - 80, 90);

        btn_expand.mouseClicked(() => {
          if (expand_domain) {
            btn_expand.style("background-color", "#a98481");
            expand_domain = false;
          } else {
            btn_expand.style("background-color", "#71a373");
            expand_domain = true;
          }
        });

        for (const btn of [btn_play_pause, btn_reset, btn_expand]) {
          btn.parent(cnv_parent);
          btn.size(50, 35);
          btn.mouseOver(() => {
            disable_drawing = true;
          });
          btn.mouseOut(() => {
            disable_drawing = false;
          });
        }

        select_field_preset = document.querySelector(
          "#pushers #select-field-presets",
        );
        select_field_preset.onchange = () => {
          const preset = select_field_preset.value;
          if (preset in FieldPresets) {
            const fields = FieldPresets[preset];
            for (const f of ["ex", "ey", "ez", "bx", "by", "bz"]) {
              if (f === fields.plot) {
                eb_fields[`${f}_draw`].checked = true;
                eb_fields.draw_mode = f;
              } else {
                eb_fields[`${f}_draw`].checked = false;
              }
              if (f in fields) {
                eb_fields[`${f}_input`].value = fields[f];
              } else {
                eb_fields[`${f}_input`].value = "0";
              }
              eb_fields.parse(f, global_time);
            }
            if (fields.plot === "") {
              eb_fields.retexture("", global_time);
            }
          } else {
            console.error(`Preset ${preset} not found!`);
            return;
          }
        };

        select_pusher = document.querySelector("#pushers #select-pushers");

        parser = new exprEval.Parser();
        eb_fields = new Fields(
          document.querySelector("#pushers #input-ex"),
          document.querySelector("#pushers #input-ey"),
          document.querySelector("#pushers #input-ez"),
          document.querySelector("#pushers #input-bx"),
          document.querySelector("#pushers #input-by"),
          document.querySelector("#pushers #input-bz"),
          document.querySelector("#pushers #draw-ex"),
          document.querySelector("#pushers #draw-ey"),
          document.querySelector("#pushers #draw-ez"),
          document.querySelector("#pushers #draw-bx"),
          document.querySelector("#pushers #draw-by"),
          document.querySelector("#pushers #draw-bz"),
          0.1,
        );

        document.querySelector("#input-inject #btn-inject").onclick = () => {
          const x = parseFloat(
            document.querySelector("#input-inject #input-x").value,
          );
          const y = parseFloat(
            document.querySelector("#input-inject #input-y").value,
          );
          const ux = parseFloat(
            document.querySelector("#input-inject #input-ux").value,
          );
          const uy = parseFloat(
            document.querySelector("#input-inject #input-uy").value,
          );
          const uz = parseFloat(
            document.querySelector("#input-inject #input-uz").value,
          );
          const charge = parseFloat(
            document.querySelector("#input-inject #input-charge").value,
          );
          if (isNaN(x) || isNaN(y) || isNaN(ux) || isNaN(uy) || isNaN(charge)) {
            console.error("Invalid input for injecting particle");
            return;
          }
          particles.push(
            new Particle(
              new p5.Vector(x, y, 0),
              new p5.Vector(ux, uy, uz),
              charge,
              CONFIGS.simulation.delta_t,
            ),
          );
        };

        // init
        particles.push(
          new Particle(
            new p5.Vector(1, 0, 0),
            new p5.Vector(1, 1, 0),
            1,
            CONFIGS.simulation.delta_t,
          ),
        );
      };

      ctx.draw = () => {
        ctx.clear();
        eb_fields.draw(global_time);
        _draw_axes();
        particles.forEach((p) => {
          if (state === 1) {
            for (let i = 0; i < CONFIGS.simulation.speed; i++) {
              p.update(CONFIGS.simulation.delta_t, eb_fields, global_time);
            }
          }
          p.draw();
        });
        if (state === 1) {
          global_time += CONFIGS.simulation.speed * CONFIGS.simulation.delta_t;
          if (expand_domain) {
            if (_expand_domain(particles)) {
              eb_fields.retexture(eb_fields.draw_mode, global_time);
            }
          } else {
            particles = particles.filter((p) => p.is_in_bounds());
          }
        }
        if (ghost_particle) {
          ghost_particle.draw();
        }
      };

      ctx.mousePressed = () => {
        if (disable_drawing) return;
        if (ctx.mouseX < 0 || ctx.mouseX >= width) return;
        if (ctx.mouseY < 0 || ctx.mouseY >= height) return;
        if (ghost_particle) return;
        ghost_particle = new GhostParticle(
          px2xy(new p5.Vector(ctx.mouseX, ctx.mouseY, 0)),
          ctx.mouseButton === ctx.LEFT ? 1 : -1,
        );
      };

      ctx.mouseReleased = () => {
        if (ghost_particle) {
          const pos = ghost_particle.pos;
          const vel_vec = px2xy(new p5.Vector(ctx.mouseX, ctx.mouseY));
          const vel = p5.Vector.sub(
            new p5.Vector(vel_vec.x, vel_vec.y, 0),
            pos,
          );
          particles.push(
            new Particle(
              pos,
              vel,
              ghost_particle.charge,
              CONFIGS.simulation.delta_t,
            ),
          );
          ghost_particle = null;
        }
      };

      //
      // - - - - Algorithms - - - -
      //
      const LeapFrogPosition = (pos, vel, dt) => {
        const beta = p5.Vector.div(vel, Math.sqrt(1 + vel.magSq()));
        return p5.Vector.add(pos, p5.Vector.mult(beta, dt));
      };

      const BorisPush = (vel, charge, efield, bfield, dt) => {
        const uminus = p5.Vector.add(
          vel,
          p5.Vector.mult(efield, 0.5 * dt * charge),
        );
        const gammaminus = Math.sqrt(1 + uminus.magSq());
        const tvec = p5.Vector.mult(bfield, (0.5 * dt * charge) / gammaminus);
        const svec = p5.Vector.mult(tvec, 2.0 / (1 + tvec.magSq()));
        const uplus = p5.Vector.add(
          uminus,
          p5.Vector.cross(
            p5.Vector.add(uminus, p5.Vector.cross(uminus, tvec)),
            svec,
          ),
        );
        return p5.Vector.add(uplus, p5.Vector.mult(efield, 0.5 * dt * charge));
      };

      const VayPush = (vel, charge, efield, bfield, dt) => {
        const u_nPhalf = p5.Vector.add(
          vel,
          p5.Vector.mult(
            p5.Vector.add(
              efield,
              p5.Vector.cross(
                p5.Vector.div(vel, Math.sqrt(1 + vel.magSq())),
                bfield,
              ),
            ),
            0.5 * dt * charge,
          ),
        );
        const uprime = p5.Vector.add(
          u_nPhalf,
          p5.Vector.mult(efield, 0.5 * dt * charge),
        );
        const gammaprime = Math.sqrt(1 + uprime.magSq());
        const tau = p5.Vector.mult(bfield, 0.5 * dt * charge);
        const ustar = p5.Vector.dot(uprime, tau);
        const sigma = Math.pow(gammaprime, 2) - tau.magSq();
        const gamma_nP1 = Math.sqrt(
          0.5 *
            (sigma +
              Math.sqrt(
                Math.pow(sigma, 2) + 4 * (tau.magSq() + Math.pow(ustar, 2)),
              )),
        );
        const tvec = p5.Vector.div(tau, gamma_nP1);
        const s = 1 / (1 + tvec.magSq());

        return p5.Vector.mult(
          p5.Vector.add(
            p5.Vector.add(
              uprime,
              p5.Vector.mult(tvec, p5.Vector.dot(uprime, tvec)),
            ),
            p5.Vector.cross(uprime, tvec),
          ),
          s,
        );
      };

      const ImplicitMidpoint = (time, fields, pos, vel, charge, dt) => {
        const max_iter = 100;
        const tol = 1e-9;
        let pos_nP1 = pos.copy();
        let vel_nP1 = vel.copy();
        for (let iter = 0; iter < max_iter; iter++) {
          const vel_n = vel_nP1.copy();
          const posnew = p5.Vector.add(
            pos,
            p5.Vector.mult(
              p5.Vector.add(
                p5.Vector.div(vel, Math.sqrt(1 + vel.magSq())),
                p5.Vector.div(vel_nP1, Math.sqrt(1 + vel_nP1.magSq())),
              ),
              0.5 * dt,
            ),
          );
          const posmid = p5.Vector.add(pos, posnew).mult(0.5);
          const efield = new p5.Vector(
            fields.ex_field(posmid.x, posmid.y, posmid.z, time + 0.5 * dt),
            fields.ey_field(posmid.x, posmid.y, posmid.z, time + 0.5 * dt),
            fields.ez_field(posmid.x, posmid.y, posmid.z, time + 0.5 * dt),
          );
          const bfield = new p5.Vector(
            fields.bx_field(posmid.x, posmid.y, posmid.z, time + 0.5 * dt),
            fields.by_field(posmid.x, posmid.y, posmid.z, time + 0.5 * dt),
            fields.bz_field(posmid.x, posmid.y, posmid.z, time + 0.5 * dt),
          );
          const vmid = p5.Vector.sub(posnew, pos).div(dt);
          vel_nP1 = p5.Vector.add(
            vel,
            p5.Vector.mult(
              p5.Vector.add(efield, p5.Vector.cross(vmid, bfield)),
              dt * charge,
            ),
          );
          pos_nP1 = posnew;
          if (p5.Vector.sub(vel_nP1, vel_n).mag() < tol * vel_n.mag()) {
            break;
          }
        }
        return { pos: pos_nP1, vel: vel_nP1 };
      };
    };
    new p5(sketch);
  },
  false,
);
