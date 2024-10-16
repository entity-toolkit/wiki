document.addEventListener("DOMContentLoaded", (event) => {

  const sketch = (p) => {
    const s = 0.6;
    const w = 1280 * s, h = 384 * s;
    const cell = 15 * s;
    var text_bg;
    const noise_scale = 0.3;
    const noise_variability = 0.2;
    const Period = 100;
    let DARK;

    var matrix = [[0.36, 0.48, -0.8], [-0.8, 0.6, 0], [0.48, 0.64, 0.6]]

    p.preload = function () {
      text_bg = p.createGraphics(w, h);
      text_bg.noStroke();
      text_bg.fill(255, 0, 0);
      text_bg.textFont('monospace');
      text_bg.textSize(280 * s);
      text_bg.textAlign(p.CENTER, p.CENTER);
      text_bg.text("entity", w / 2, h / 2);
    }

    const get_theme = () => {
      let color = document.body.getAttribute("data-md-color-media");
      if (color === "(prefers-color-scheme: dark)") {
        DARK = true;
      } else {
        DARK = false;
      }
    }

    const make = () => {
      let f = 0.1;
      for (let i = 0; i < (w / cell); ++i) {
        for (let j = 0; j < (h / cell); ++j) {
          let t = (p.frameCount) / Period;
          let triangle = 2 * Period * 0.8 * Math.abs(t - Math.floor(t + 0.5));
          let k = noise_variability * triangle;
          let x = i * matrix[0][0] + j * matrix[0][1] + k * matrix[0][2];
          let y = i * matrix[1][0] + j * matrix[1][1] + k * matrix[1][2];
          let z = i * matrix[2][0] + j * matrix[2][1] + k * matrix[2][2];
          let c = p.noise(x * noise_scale, y * noise_scale, z * noise_scale) * 200;
          let a = text_bg.get(i * cell, j * cell)[0] / 30;
          let fl = c * (a * f + (1.0 - f)) / 2;
          if (fl < 70) fl /= 10.0;
          "2e303e"

          if (DARK) {
            p.fill(46 + 2 * (46 / 62) * fl, 48 + 2 * (48 / 62) * fl, 62 + 2 * fl);
          } else {
            p.fill(255 - 2 * (62 / 46) * fl, 255 - 2 * (62 / 48) * fl, 255 - 2 * fl);
          }
          p.rect(i * cell, j * cell, cell * 0.9, cell * 0.9);
        }
      }
    }

    p.setup = function () {
      get_theme();
      p.frameRate(10);
      let cnv = p.createCanvas(w, h);
      cnv.parent('cover');
      if (DARK) {
        p.background(0)
        p.stroke(46, 47, 62);
      } else {
        p.background(255);
        p.stroke(255);
      }
      p.strokeWeight(0.25);
      p.noiseSeed(99);
    }

    p.draw = function () {
      get_theme();
      if (DARK) {
        p.stroke(46, 47, 62);
      } else {
        p.stroke(255);
      }
      make();
    }
  }

  const myp5 = new p5(sketch);
}, false);