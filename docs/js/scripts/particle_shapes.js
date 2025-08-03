document.addEventListener(
  "DOMContentLoaded",
  () => {
    const sketch = (ctx) => {
      const padding = 20;
      const dx = 140;

      let fg_color;

      const getColors = () => {
        let c = getComputedStyle(document.body).getPropertyValue(
          "--md-default-fg-color",
        );
        return c.split(",").length == 4
          ? c.split(",").slice(0, 3).join() + ",1)"
          : c;
      };
      fg_color = getColors();

      const grid_coord = (i) => {
        return padding / 2 + i * dx;
      };

      const makeGrid = (ctx, color, point_radius, stroke_width) => {
        ctx.push();
        const width = ctx.width;
        const height = ctx.width;
        ctx.stroke(color);
        ctx.fill(color);
        const nx = Math.floor((width - padding) / dx);
        const ny = Math.floor((height - padding) / dx);
        for (let i = 0; i <= nx; i++) {
          ctx.strokeWeight(stroke_width);
          ctx.line(grid_coord(i), grid_coord(0), grid_coord(i), grid_coord(ny));
          for (let j = 0; j <= ny; j++) {
            ctx.strokeWeight(0);
            ctx.circle(grid_coord(i), grid_coord(j), 2 * point_radius);
            ctx.strokeWeight(stroke_width);
            if (i == 0) {
              ctx.line(
                grid_coord(i),
                grid_coord(j),
                grid_coord(nx),
                grid_coord(j),
              );
            }
          }
        }
        ctx.pop();
      };

      const plotShapeFunction = () => {
        const height = 200;
        const svg_parent = d3.select("#shapefunc");
        const svg = svg_parent
          .append("svg")
          .attr("width", "100%")
          .attr("height", height)
          .style("user-select", "none");

        const width = svg.node().getBoundingClientRect().width;

        const setKatex = (text) => {
          const element = document.getElementById("shapefunc_katex");
          element.innerHTML = katex.renderToString(text);
        };

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;

        const g = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        const xtick_format = (x) => {
          let xt = "";
          if (x === 0) {
            return "0";
          } else if (x < 0) {
            xt += "-";
          }
          if (Math.abs(x) > 1) {
            xt += `${Math.abs(x)}`;
          }
          return xt + "Δx";
        };

        const xScale = d3.scaleLinear().domain([-3, 3]).range([0, plotWidth]);
        const xAxis = d3
          .axisBottom(xScale)
          .tickValues([-3, -2, -1, 0, 1, 2, 3])
          .tickFormat(xtick_format);
        g.append("g")
          .attr("transform", `translate(0,${plotHeight})`)
          .call(xAxis);

        const yScale = d3.scaleLinear().domain([0, 1]).range([plotHeight, 0]);
        const yAxis = d3.axisLeft(yScale).tickValues([0, 0.5, 1]);
        g.append("g").call(yAxis);

        const line = d3
          .line()
          .x((d) => xScale(d.x))
          .y((d) => yScale(d.y));

        const order_0 = (x) => {
          if (Math.abs(x) > 0.5) {
            return 0;
          } else {
            return 1;
          }
        };
        const order_1 = (x) => {
          if (Math.abs(x) > 1) {
            return 0;
          } else {
            return 1 - Math.abs(x);
          }
        };
        const order_2 = (x) => {
          if (Math.abs(x) > 1.5) {
            return 0;
          } else if (Math.abs(x) < 0.5) {
            return 0.75 - x ** 2;
          } else {
            return 0.5 * (1.5 - Math.abs(x)) ** 2;
          }
        };
        const order_3 = (x) => {
          if (Math.abs(x) > 2) {
            return 0;
          } else if (Math.abs(x) < 1) {
            return (4 - 6 * x ** 2 + 3 * Math.abs(x) ** 3) / 6;
          } else {
            return (2 - Math.abs(x)) ** 3 / 6;
          }
        };
        const order_4 = (x) => {
          if (Math.abs(x) > 2.5) {
            return 0;
          } else if (Math.abs(x) < 1.5) {
            return (
              0.625 -
              x ** 2 +
              (32 * Math.abs(x) ** 3) / 45 -
              (98 * x ** 4) / 675
            );
          } else {
            return (2.5 - Math.abs(x)) ** 4 / 26;
          }
        };
        const order_5 = (x) => {
          if (Math.abs(x) > 3) {
            return 0;
          } else if (Math.abs(x) < 2) {
            return (
              0.6 -
              x ** 2 +
              (Math.abs(x) ** 3 *
                (360 + Math.abs(x) * (-114 + 13 * Math.abs(x)))) /
                432
            );
          } else {
            return (3 - Math.abs(x)) ** 5 / 135;
          }
        };

        const funcs = {
          0: {
            func: order_0,
            text:
              "S(x) = \\begin{cases}" +
              "1,&~|x|<1/2\\\\\n" +
              "0, &~|x|\\geq1/2" +
              "\\end{cases}",
          },
          1: {
            func: order_1,
            text:
              "S(x) = \\begin{cases}" +
              "1-|x|,&~|x|<1\\\\\n" +
              "0, &~|x|\\geq 1" +
              "\\end{cases}",
          },
          2: {
            func: order_2,
            text:
              "S(x) = \\begin{cases}" +
              "\\frac{3}{4}-x^2,&~|x|<1/2\\\\\n" +
              "\\frac{1}{2}\\left(\\frac{3}{2}-|x|\\right)^2,&~1/2\\leq |x|<3/2\\\\\n" +
              "0, &~|x|\\geq 3/2" +
              "\\end{cases}",
          },
          3: {
            func: order_3,
            text:
              "S(x) = \\begin{cases}" +
              "\\frac{1}{6}\\left(4-6x^2+3|x|^3\\right),&~|x|<1\\\\\n" +
              "\\frac{1}{6}\\left(2-|x|\\right)^3,&~1\\leq |x|<2\\\\\n" +
              "0, &~|x|\\geq 2" +
              "\\end{cases}",
          },
          4: {
            func: order_4,
            text:
              "S(x) = \\begin{cases}" +
              "\\frac{5}{8}-x^2+\\frac{32}{45}|x|^3-\\frac{98}{675}x^4,&~|x|<3/2\\\\\n" +
              "\\frac{1}{25}\\left(\\frac{5}{2}-|x|\\right)^4,&~3/2\\leq|x|<5/2\\\\\n" +
              "0, &~|x|\\geq 5/2" +
              "\\end{cases}",
          },
          5: {
            func: order_5,
            text:
              "S(x) = \\begin{cases}" +
              "\\frac{3}{5}-x^2+\\frac{5}{6}|x|^3-\\frac{19}{72}x^4+\\frac{13}{432}x^5,&~|x|<2\\\\\n" +
              "\\frac{1}{135}\\left(3-|x|\\right)^5,&~2\\leq|x|<3\\\\\n" +
              "0, &~|x|\\geq 3" +
              "\\end{cases}",
          },
        };

        const path = g
          .append("path")
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 2);

        const plot = (order) => {
          const data = d3
            .range(-3, 3, 0.01)
            .map((x) => ({ x, y: funcs[order].func(x) }));
          path
            .datum(data)
            .transition()
            .duration(200)
            .ease(d3.easeCubicOut)
            .attr("d", line);
          setKatex(funcs[order].text);
        };

        const rangeInput = document.querySelector(
          '#plot_ax input[type="range"]',
        );
        rangeInput.addEventListener("input", (e) => {
          plot(e.target.value);
        });

        plot(2);
      };

      class Draggable {
        constructor(pos, size) {
          this.dragging = false;
          this.hover = false;
          this.pos = pos;
          this.size = size;
          this.offsetX = 0;
          this.offsetY = 0;
        }

        is_hover(mouseX, mouseY) {
          return (
            mouseX > this.pos.x - this.size * dx &&
            mouseX < this.pos.x + this.size * dx &&
            mouseY > this.pos.y - this.size * dx &&
            mouseY < this.pos.y + this.size * dx
          );
        }

        update(mouseX, mouseY) {
          this.hover = this.is_hover(mouseX, mouseY);
          if (this.dragging) {
            this.pos.x = mouseX + this.offsetX;
            this.pos.y = mouseY + this.offsetY;
          }
        }

        pressed(mouseX, mouseY) {
          if (this.is_hover(mouseX, mouseY)) {
            this.dragging = true;
            this.offsetX = this.pos.x - mouseX;
            this.offsetY = this.pos.y - mouseY;
          }
          return this.dragging;
        }

        released() {
          this.dragging = false;
        }
      }

      class ShapeFunction extends Draggable {
        constructor(ctx, pos, size, color_hex) {
          super(pos, size);
          this.color = ctx.color(color_hex);
          this.fill_color = ctx.color(color_hex);
          this.fill_color.setAlpha(50);
        }

        draw(ctx, rotation, component) {
          ctx.push();
          ctx.fill(this.fill_color);
          ctx.stroke(this.color);
          ctx.strokeWeight(2);
          ctx.rectMode(ctx.CENTER);
          ctx.rect(
            this.pos.x,
            this.pos.y,
            2 * this.size * dx,
            2 * this.size * dx,
          );
          ctx.noStroke();
          ctx.fill(this.color);
          ctx.circle(this.pos.x, this.pos.y, 5);

          const width = ctx.width;
          const height = ctx.width;
          const nx = Math.floor((width - padding) / dx);
          const ny = Math.floor((height - padding) / dx);
          ctx.rectMode(ctx.CENTER);
          let del_x = 0.0,
            del_y = 0.0;
          if (component === "Wx") {
            del_x = dx * 0.5;
          } else if (component === "Wy") {
            del_y = dx * 0.5;
          } else if (component === "Bx") {
            del_y = dx * 0.5;
          } else if (component === "By") {
            del_x = dx * 0.5;
          } else if (component === "Bz") {
            del_x = dx * 0.5;
            del_y = dx * 0.5;
          }
          for (let i = 0; i <= nx; i++) {
            for (let j = 0; j < ny; j++) {
              var pt_x = grid_coord(i) + del_x;
              var pt_y = grid_coord(j) + del_y;
              if (
                Math.abs(pt_x - this.pos.x) < this.size * dx &&
                Math.abs(pt_y - this.pos.y) < this.size * dx
              ) {
                ctx.push();
                ctx.translate(pt_x, pt_y);
                ctx.rotate(rotation);
                ctx.rect(0, 0, 8, 8);
                ctx.pop();
              }
            }
          }
          ctx.pop();
        }
      }

      ctx.preload = () => {};

      let gi0, gj0;
      let init_shape, fin_shape;

      // components
      let show_init_toggle, show_fin_toggle;
      let show_init = true,
        show_fin = true;
      let component_radio;
      let order_slider, order_label;
      let shape_function_order = 2;

      ctx.setup = () => {
        const panel_toggles = ctx.select("#panels #toggles");
        const panel_radios = ctx.select("#panels #radios");

        order_label = ctx.select("#toggles h4");
        order_label.html(`Shape order: ${shape_function_order}`);

        order_slider = ctx
          .createSlider(0, 5, shape_function_order, 1)
          .parent(panel_toggles)
          .style("width", "calc(100% - 25px)")
          .style("margin-left", "25px");

        ctx
          .createElement("h4", "Components")
          .parent(panel_radios)
          .style("text-align", "center");

        component_radio = ctx
          .createRadio()
          .style("font-family", "monospace")
          .style("display", "flex")
          .style("flex-wrap", "wrap")
          .style("margin-bottom", "25px")
          .parent(panel_radios);
        component_radio.option("Wx", "Ex1/Jx1");
        component_radio.option("Wy", "Ex2/Jx2");
        component_radio.option("Wz", "Ex3/Jx3");
        component_radio.option("Bx", "Bx1");
        component_radio.option("By", "Bx2");
        component_radio.option("Bz", "Bx3");
        component_radio.selected("Wx");
        component_radio.elt.querySelectorAll("label").forEach((label) => {
          label.style.width = "33.33%";
          label.style.boxSizing = "border-box";
        });

        show_init_toggle = ctx
          .createCheckbox("show initial shape", show_init)
          .parent(panel_radios);
        show_fin_toggle = ctx
          .createCheckbox("show final shape", show_fin)
          .parent(panel_radios);

        const shape_function_katex = ctx
          .createElement("p", "")
          .parent(panel_radios)
          .style("margin-left", "25px");
        shape_function_katex.id("shapefunc_katex");

        const width = document.getElementsByTagName("article")[0].offsetWidth;
        const height = width;

        const cnv = ctx.createCanvas(width, height);
        cnv.parent("plot_ax");

        cnv.style("user-select", "none");
        init_shape = new ShapeFunction(
          ctx,
          ctx.createVector(ctx.width / 2, ctx.height / 2),
          0.5 * (1 + shape_function_order),
          "#00c0ff",
        );
        gi0 = Math.floor(init_shape.pos.x / dx) * dx + padding / 2;
        gj0 = Math.floor(init_shape.pos.y / dx) * dx + padding / 2;
        fin_shape = new ShapeFunction(
          ctx,
          ctx.createVector(ctx.width / 2 + dx / 3, ctx.height / 2 + dx / 3),
          0.5 * (1 + shape_function_order),
          "#ff00ff",
        );

        plotShapeFunction(order_slider);
      };

      ctx.draw = () => {
        show_init = show_init_toggle.checked();
        show_fin = show_fin_toggle.checked();
        if (shape_function_order != order_slider.value()) {
          shape_function_order = order_slider.value();
          order_label.html(`Shape order: ${shape_function_order}`);
          init_shape.size = 0.5 * (1 + shape_function_order);
          fin_shape.size = 0.5 * (1 + shape_function_order);
        }

        ctx.clear();
        if (getColors() != fg_color) {
          fg_color = getColors();
        }
        makeGrid(ctx, fg_color, 3, 1);

        if (
          (show_init && init_shape.dragging) ||
          (show_fin && fin_shape.dragging)
        ) {
          ctx.cursor("grabbing");
        } else if (
          (show_init && init_shape.hover) ||
          (show_fin && fin_shape.hover)
        ) {
          ctx.cursor("grab");
        } else {
          ctx.cursor("default");
        }

        init_shape.update(ctx.mouseX, ctx.mouseY);
        fin_shape.update(ctx.mouseX, ctx.mouseY);

        if (
          (init_shape.dragging || fin_shape.dragging) &&
          show_init &&
          show_fin
        ) {
          const distance = ctx.dist(
            init_shape.pos.x,
            init_shape.pos.y,
            fin_shape.pos.x,
            fin_shape.pos.y,
          );
          if (distance > dx / Math.sqrt(2)) {
            const vector = ctx.createVector(
              fin_shape.pos.x - init_shape.pos.x,
              fin_shape.pos.y - init_shape.pos.y,
            );
            vector.setMag(dx / Math.sqrt(2));
            fin_shape.pos.x = init_shape.pos.x + vector.x;
            fin_shape.pos.y = init_shape.pos.y + vector.y;
            if (fin_shape.dragging) {
              fin_shape.offsetX = fin_shape.pos.x - ctx.mouseX;
              fin_shape.offsetY = fin_shape.pos.y - ctx.mouseY;
            }
          }
        }
        if (show_init && init_shape.dragging) {
          if (init_shape.pos.x < gi0) {
            init_shape.pos.x = gi0;
            init_shape.offsetX = init_shape.pos.x - ctx.mouseX;
          }
          if (init_shape.pos.x > gi0 + dx) {
            init_shape.pos.x = gi0 + dx;
            init_shape.offsetX = init_shape.pos.x - ctx.mouseX;
          }
          if (init_shape.pos.y < gj0) {
            init_shape.pos.y = gj0;
            init_shape.offsetY = init_shape.pos.y - ctx.mouseY;
          }
          if (init_shape.pos.y > gj0 + dx) {
            init_shape.pos.y = gj0 + dx;
            init_shape.offsetY = init_shape.pos.y - ctx.mouseY;
          }
        }

        const selected_component = component_radio.value();

        if (show_init) {
          init_shape.draw(ctx, 0, selected_component);
        }
        if (show_fin) {
          fin_shape.draw(ctx, ctx.PI / 4, selected_component);
        }
      };

      ctx.windowResized = () => {
        const width = document.getElementsByTagName("article")[0].offsetWidth;
        const height = width;
        ctx.resizeCanvas(width, height);
      };

      ctx.mousePressed = () => {
        if (!(show_init && init_shape.pressed(ctx.mouseX, ctx.mouseY))) {
          if (show_fin) {
            fin_shape.pressed(ctx.mouseX, ctx.mouseY);
          }
        }
      };

      ctx.mouseReleased = () => {
        if (show_init) {
          init_shape.released();
        }
        if (show_fin) {
          fin_shape.released();
        }
      };
    };

    new p5(sketch);
  },
  false,
);
