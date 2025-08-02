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
        const panels = ctx
          .createDiv()
          .style("display", "inline-block")
          .parent("plot_ax");

        const panel_toggles = ctx
          .createDiv()
          .style("display", "inline-block")
          .parent(panels)
          .style("vertical-align", "top")
          .style("width", "33.33%");

        const panel_radios = ctx
          .createDiv()
          .style("display", "inline-block")
          .parent(panels)
          .style("vertical-align", "top")
          .style("width", "66.67%");

        order_label = ctx
          .createElement("h4", `Shape order: ${shape_function_order}`)
          .parent(panel_toggles)
          .style("text-align", "center");

        order_slider = ctx
          .createSlider(1, 5, shape_function_order, 1)
          .parent(panel_toggles)
          .style("width", "calc(100% - 25px)")
          .style("margin-left", "25px");

        show_init_toggle = ctx
          .createCheckbox("show initial shape", show_init)
          .parent(panel_toggles);
        show_fin_toggle = ctx
          .createCheckbox("show final shape", show_fin)
          .parent(panel_toggles);

        ctx
          .createElement("h4", "Components")
          .parent(panel_radios)
          .style("text-align", "center");

        component_radio = ctx
          .createRadio()
          .style("font-family", "monospace")
          .style("display", "flex")
          .style("flex-wrap", "wrap")
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
