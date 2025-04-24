document.addEventListener(
  "DOMContentLoaded",
  (event) => {
    const sketch = (p) => {
      const supportsWebGL = () => {
        const canvas = document.createElement("canvas");
        return (
          (canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl")) instanceof
          WebGLRenderingContext
        );
      };

      const hexToRgb = (hex) => {
        hex = hex.replace("#", "");

        var bigint = parseInt(hex, 16);

        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        return p.color(r, g, b);
      };

      const Color = (r, g, b) => {
        return { r: r, g: g, b: b };
      };

      const s = 0.6;
      const w = 1280 * s,
        h = 384 * s;
      const cell = 15 * s;
      const noise_scale = 0.3;
      const noise_variability = 0.2;
      const Period = 200;
      const DarkBG = Color(32, 33, 36);

      const col1 = hexToRgb("#0b7be5");
      const col2 = hexToRgb("#7d5fe7");
      const col3 = hexToRgb("#c459de");
      const col4 = hexToRgb("#d638a7");

      let text_bg, shader;

      const matrix = [
        [0.36, 0.48, -0.8],
        [-0.8, 0.6, 0],
        [0.48, 0.64, 0.6],
      ];

      p.preload = function () {
        if (!supportsWebGL()) {
          return;
        } else {
          shader = p.loadShader("cover.vert", "cover.frag");
          text_bg = p.createGraphics(w, h);
          text_bg.noStroke();
          text_bg.fill(255, 0, 0);
          text_bg.textFont("monospace");
          text_bg.textSize(280 * s);
          text_bg.textAlign(p.CENTER, p.CENTER);
          text_bg.text("entity", w / 2, h / 2);
        }
      };

      const get_theme = () =>
        document.body.getAttribute("data-md-color-media") ===
        "(prefers-color-scheme: dark)";

      p.setup = function () {
        if (!supportsWebGL()) {
          let cnv = p.createCanvas(w, h);
          cnv.parent("cover");
          p.textFont("monospace");
          p.textSize(280 * s);
          p.textAlign(p.CENTER, p.CENTER);
          p.fill(255, 0, 0);
          p.text("entity", w / 2, h / 2);
        } else {
          let cnv = p.createCanvas(w, h, p.WEBGL);
          cnv.parent("cover");
        }
      };

      const drawLetter = (letter, position, phase) => {
        const param = (Math.sin(0.025 * p.frameCount + phase) + 1) / 2;
        const color =
          param < 0.333
            ? p.lerpColor(col1, col2, param * 3)
            : param < 0.666
              ? p.lerpColor(col2, col3, (param - 0.333) * 3)
              : p.lerpColor(col3, col4, (param - 0.666) * 3);
        const text = " ".repeat(position) + letter + " ".repeat(5 - position);
        p.push();
        p.fill(color);
        p.text(text, w / 2, h / 2);
        p.pop();
      };

      p.draw = function () {
        if (!supportsWebGL()) {
          p.clear();
          drawLetter("e", 0, 0);
          drawLetter("n", 1, 0.5);
          drawLetter("t", 2, 1);
          drawLetter("i", 3, 1.5);
          drawLetter("t", 4, 2);
          drawLetter("y", 5, 2.5);
        } else {
          p.clear();
          p.shader(shader);
          shader.setUniform("textTex", text_bg);
          shader.setUniform("time", p.frameCount * 0.25);
          shader.setUniform("resolution", [w, h]);
          shader.setUniform("mouseX", p.mouseX);
          shader.setUniform("mouseY", p.mouseY);
          p.rect(0, 0, w, h);
        }
      };
    };

    const myp5 = new p5(sketch);
  },
  false,
);
