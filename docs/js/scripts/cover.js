document.addEventListener(
  "DOMContentLoaded",
  () => {
    const supportsWebGL = () => {
      const canvas = document.createElement("canvas");
      return (
        (canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl")) instanceof
        WebGLRenderingContext
      );
    };

    const animations = [0, 1, 2, 3];
    var animation = 0;

    const supports_web_gl = supportsWebGL();

    const sketch = (p) => {
      const hexToRgb = (hex) => {
        hex = hex.replace("#", "");
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
        return p.color(r, g, b);
      };

      const s = 0.6;
      const w = 1280 * s,
        h = 384 * s;
      let col1, col2, col3, col4;

      let text_bg, shader, font_mono;

      p.preload = () => {
        if (supports_web_gl) {
          shader = p.loadShader("js/scripts/cover.vert", "js/scripts/cover.frag", () => {
            console.log("Shader loaded successfully");
          }, () => {
            console.error("Error loading shader");
          });
        }
        font_mono = p.loadFont("assets/fonts/MonaspiceKrNerdFont.otf", () => {
          console.log("Font loaded successfully");
        }, () => {
          console.error("Error loading font");
        });
      };

      p.setup = () => {
        if (!supports_web_gl) {
          const comment = p.createElement(
            "p",
            "[WebGL not supported in this browser, using fallback animation]");
          comment.class("webgl-fallback");
          comment.parent("cover");
          let cnv = p.createCanvas(w, h);
          cnv.parent("cover");
          p.noStroke();
          p.fill(255, 0, 0);
          p.textFont(font_mono);
          p.textSize(280 * s);
          p.textAlign(p.CENTER, p.CENTER);
        } else {
          animation = animations[Math.floor(Math.random() * animations.length)];

          text_bg = p.createGraphics(w, h);
          text_bg.noStroke();
          text_bg.fill(255, 0, 0);
          text_bg.textFont(font_mono);
          text_bg.textSize(280 * s);
          text_bg.textAlign(p.CENTER, p.CENTER);
          text_bg.text("entity", w / 2, h / 3);

          let cnv = p.createCanvas(w, h, p.WEBGL);
          cnv.parent("cover");
        }

        col1 = hexToRgb("#0b7be5");
        col2 = hexToRgb("#7d5fe7");
        col3 = hexToRgb("#c459de");
        col4 = hexToRgb("#d638a7");

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

      p.draw = () => {
        p.clear();
        if (!supports_web_gl) {
          p.push();
          p.background(0, 0, 0, 0);
          drawLetter("e", 0, 0);
          drawLetter("n", 1, 0.5);
          drawLetter("t", 2, 1);
          drawLetter("i", 3, 1.5);
          drawLetter("t", 4, 2);
          drawLetter("y", 5, 2.5);
          p.pop();
        } else {
          p.shader(shader);
          shader.setUniform("anim", animation);
          shader.setUniform("textTex", text_bg);
          shader.setUniform("time", p.frameCount * 0.25);
          shader.setUniform("resolution", [w, h]);
          shader.setUniform("mouseX", p.mouseX);
          shader.setUniform("mouseY", p.mouseY);
          p.rect(0, 0, w, h);
        }
      };
    };

    new p5(sketch, "cover");
  },
  false,
);