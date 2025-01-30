document.addEventListener(
  "DOMContentLoaded",
  (event) => {
    const Color = (r, g, b) => {
      return { r: r, g: g, b: b };
    };

    const sketch = (p) => {
      const s = 0.6;
      const w = 1280 * s,
        h = 384 * s;
      const cell = 15 * s;
      const noise_scale = 0.3;
      const noise_variability = 0.2;
      const Period = 200;
      const DarkBG = Color(32, 33, 36);
      let text_bg, shader;

      const matrix = [
        [0.36, 0.48, -0.8],
        [-0.8, 0.6, 0],
        [0.48, 0.64, 0.6],
      ];

      p.preload = function () {
        shader = p.loadShader("cover.vert", "cover.frag");
        text_bg = p.createGraphics(w, h);
        text_bg.noStroke();
        text_bg.fill(255, 0, 0);
        text_bg.textFont("monospace");
        text_bg.textSize(280 * s);
        text_bg.textAlign(p.CENTER, p.CENTER);
        text_bg.text("entity", w / 2, h / 2);
      };

      const get_theme = () =>
        document.body.getAttribute("data-md-color-media") ===
        "(prefers-color-scheme: dark)";

      p.setup = function () {
        let cnv = p.createCanvas(w, h, p.WEBGL);
        cnv.parent("cover");
      };

      p.draw = function () {
        p.clear();
        p.shader(shader);
        shader.setUniform("textTex", text_bg);
        shader.setUniform("time", p.frameCount * 0.25);
        shader.setUniform("resolution", [w, h]);
        shader.setUniform("mouseX", p.mouseX);
        shader.setUniform("mouseY", p.mouseY);
        p.rect(0, 0, w, h);
      };
    };

    const myp5 = new p5(sketch);
  },
  false,
);
