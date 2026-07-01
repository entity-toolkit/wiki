// ---------------------------------------------------------------------------
// tiled_deposit.js
// ---------------------------------------------------------------------------
// p5.js (instance mode) animation of Entity's TILED current deposit
// (kernel::DepositCurrentsTiled_kernel, src/kernels/currents_deposit.hpp;
//  launched from src/engines/{srpic,grpic}/currents.h).
//
// JS port of manim/tiled_deposit.py so the same walkthrough can render live in
// the wiki (docs/content/3-code/10-team_policy.md) instead of a stored mp4.
//
// Timeline of one GPU team (one spatial tile):
//   0 title
//   1 J grid cut into tiles; spatially-sorted particles coloured by tile/team
//   2 focus team allocates SLM scratch = tile + HALO border; cooperative zero-fill
//   3 deposit particle stencils into scratch via LDS atomics (overlap contends)
//   4 escape valve: a drifted particle's out-of-scratch cells hit global J direct
//   5 flush: each non-zero scratch cell -> ONE atomic_add into global J
//   6 flat-vs-tiled summary
//
// Follows the wiki convention (see js/scripts/pushers.js): the page frontmatter
// declares `libraries: [p5]` and `scripts: [tiled_deposit]`, and provides a
// `<div id="tiled-deposit"><div id="canvas" class="p5canvas"></div></div>`.
// ---------------------------------------------------------------------------

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const HOST = document.querySelector("#tiled-deposit #canvas");
    if (!HOST) {
      return; // not on this page
    }

    const sketch = (ctx) => {
      // ----- grid / tile geometry (mirrors the manim drawing values) -----
      const N = 12; // cells per axis in the drawn J grid
      const T_TILE = 4; // active cells per tile per axis (code default 8)
      const HALO = 2; // STENCIL_REACH + DRIFT (e.g. O=1 Esirkepov + 1 drift)
      const TILES = N / T_TILE; // 3 x 3 tiles
      const SN = T_TILE + 2 * HALO; // scratch edge = 8 cells
      const FOCUS = { tx: 1, ty: 1 }; // central tile is the team in focus

      // ----- palette (chosen to read on both light and dark themes) -----
      const TILE_COLORS = ["#4c8cbf", "#57a05a", "#8e6bb0", "#c1962f"];
      const C = {
        focus: "#4c8cbf",
        scrInterior: "#4c8cbf",
        scrHalo: "#e08a3c",
        scrBorder: "#e6b422",
        stencilA: "#37b174",
        stencilB: "#e4572e",
        overlap: "#f2c14e",
        escape: "#e4572e",
        flush: "#37b174",
        arrow: "#4c8cbf",
      };

      // ----- timeline (seconds) -----
      const PHASES = [
        { dur: 2.0, label: "" },
        { dur: 3.0, label: "1 · Sort into tiles" },
        { dur: 3.2, label: "2 · Allocate SLM scratch" },
        { dur: 3.8, label: "3 · Deposit → scratch" },
        { dur: 3.8, label: "4 · Escape valve" },
        { dur: 4.0, label: "5 · Flush → global J" },
        { dur: 5.2, label: "6 · Flat vs tiled" },
      ];
      const STARTS = [];
      let acc = 0;
      for (const ph of PHASES) {
        STARTS.push(acc);
        acc += ph.dur;
      }
      const TOTAL = acc;

      // ----- state -----
      let W, H, cg, cs, gx, gy, sx, sy, fs;
      let t = 0.0;
      let playing = true;
      let btnPlay, btnReplay, btnSkip;

      // ----- helpers -----
      const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
      const easeInOut = (p) =>
        p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

      const fg = () =>
        getComputedStyle(document.body).getPropertyValue("--md-default-fg-color") ||
        "#666";
      const withAlpha = (hex, a) => {
        const c = ctx.color(hex);
        c.setAlpha(255 * a);
        return c;
      };

      const phaseIndex = () => {
        let idx = PHASES.length - 1;
        for (let i = 0; i < PHASES.length; i++) {
          if (t < STARTS[i] + PHASES[i].dur) {
            idx = i;
            break;
          }
        }
        return idx;
      };
      const localP = (idx) => clamp((t - STARTS[idx]) / PHASES[idx].dur, 0, 1);

      const gcell = (i, j) => ({ x: gx + (i + 0.5) * cg, y: gy + (j + 0.5) * cg });
      const scell = (li, lj) => ({
        x: sx + (li + HALO + 0.5) * cs,
        y: sy + (lj + HALO + 0.5) * cs,
      });
      const tileColor = (tx, ty) => TILE_COLORS[(tx + ty * TILES) % TILE_COLORS.length];
      const isFocusCell = (i, j) =>
        Math.floor(i / T_TILE) === FOCUS.tx && Math.floor(j / T_TILE) === FOCUS.ty;

      // reveal fraction for a scratch-interior cell during the flush sweep
      const flushReveal = (li, lj, p) => {
        const order = (li * T_TILE + lj) / (T_TILE * T_TILE);
        return clamp((easeInOut(p) - order) * 4.0, 0, 1);
      };

      function arrow(x1, y1, x2, y2, col, w) {
        ctx.push();
        ctx.stroke(col);
        ctx.strokeWeight(w);
        ctx.fill(col);
        ctx.line(x1, y1, x2, y2);
        const a = Math.atan2(y2 - y1, x2 - x1);
        const s = 5 + w * 1.4;
        ctx.noStroke();
        ctx.triangle(
          x2,
          y2,
          x2 - s * Math.cos(a - 0.42),
          y2 - s * Math.sin(a - 0.42),
          x2 - s * Math.cos(a + 0.42),
          y2 - s * Math.sin(a + 0.42),
        );
        ctx.pop();
      }

      function cellSquare(cx, cy, s, fillCol, strokeCol, sw) {
        ctx.push();
        ctx.rectMode(ctx.CENTER);
        if (fillCol) ctx.fill(fillCol);
        else ctx.noFill();
        if (strokeCol) {
          ctx.stroke(strokeCol);
          ctx.strokeWeight(sw || 1);
        } else ctx.noStroke();
        ctx.square(cx, cy, s);
        ctx.pop();
      }

      // ----- scenes ------------------------------------------------------
      function drawGrid(idx, p) {
        const gAlpha = idx === 1 ? easeInOut(clamp(p * 1.3, 0, 1)) : 1;
        const dim = idx >= 2;
        const faint = withAlpha(fg(), 0.18 * gAlpha);
        for (let i = 0; i < N; i++) {
          for (let j = 0; j < N; j++) {
            const tx = Math.floor(i / T_TILE);
            const ty = Math.floor(j / T_TILE);
            const focus = isFocusCell(i, j);
            let a = 0.13;
            let hex = tileColor(tx, ty);
            if (dim && !focus) a = 0.05;
            if (dim && focus) {
              hex = C.focus;
              a = 0.2;
            }
            // flush fills the focus tile green as scratch drains into it
            if (idx === 5 && focus) {
              const r = flushReveal(i - T_TILE * FOCUS.tx, j - T_TILE * FOCUS.ty, p);
              if (r > 0) {
                hex = C.flush;
                a = 0.14 + 0.4 * r;
              }
            }
            const cc = gcell(i, j);
            cellSquare(cc.x, cc.y, cg, withAlpha(hex, a * gAlpha), faint, 1);
          }
        }
        // tile outlines
        for (let tx = 0; tx < TILES; tx++) {
          for (let ty = 0; ty < TILES; ty++) {
            const c0 = gcell(tx * T_TILE, ty * T_TILE);
            const focus = dim && tx === FOCUS.tx && ty === FOCUS.ty;
            const col = focus ? withAlpha(C.focus, 0.95) : withAlpha(fg(), 0.5 * gAlpha);
            cellSquare(
              c0.x - cg / 2 + (T_TILE * cg) / 2,
              c0.y - cg / 2 + (T_TILE * cg) / 2,
              T_TILE * cg,
              null,
              col,
              focus ? 3 : 2,
            );
          }
        }
      }

      // deterministic pseudo-random particle lattice (seeded)
      let PARTS = null;
      function particles() {
        if (PARTS) return PARTS;
        let seed = 7;
        const rnd = () => {
          seed = (seed * 1664525 + 1013904223) % 4294967296;
          return seed / 4294967296;
        };
        PARTS = [];
        for (let tx = 0; tx < TILES; tx++) {
          for (let ty = 0; ty < TILES; ty++) {
            for (let k = 0; k < 5; k++) {
              const i = tx * T_TILE + 0.4 + rnd() * (T_TILE - 1.4);
              const j = ty * T_TILE + 0.4 + rnd() * (T_TILE - 1.4);
              PARTS.push({ i, j, hex: tileColor(tx, ty) });
            }
          }
        }
        return PARTS;
      }

      function drawParticles(idx, p) {
        let a = 0;
        if (idx === 1) a = easeInOut(clamp((p - 0.35) * 2.2, 0, 1));
        else if (idx === 2) a = 1 - easeInOut(clamp(p * 2.2, 0, 1)); // fade out
        if (a <= 0) return;
        ctx.push();
        ctx.noStroke();
        for (const pt of particles()) {
          const cc = gcell(pt.i, pt.j);
          ctx.fill(withAlpha(pt.hex, a));
          ctx.circle(cc.x, cc.y, Math.max(3, cg * 0.22));
        }
        ctx.pop();
      }

      function drawScratch(idx, p) {
        if (idx < 2) return;
        for (let li = -HALO; li < T_TILE + HALO; li++) {
          for (let lj = -HALO; lj < T_TILE + HALO; lj++) {
            const interior = li >= 0 && li < T_TILE && lj >= 0 && lj < T_TILE;
            let hex = interior ? C.scrInterior : C.scrHalo;
            let a = 0.14;
            if (idx === 2) {
              // cooperative zero-fill sweep along the diagonal
              const diag = (li + HALO + (lj + HALO)) / (2 * (SN - 1));
              a = 0.14 * clamp((easeInOut(p) - diag) * 3.5 + 0.15, 0, 1);
            } else if (idx === 5 && interior) {
              hex = C.flush; // non-zero cells about to be flushed
              a = 0.5;
            }
            const cc = scell(li, lj);
            cellSquare(cc.x, cc.y, cs, withAlpha(hex, a), withAlpha(C.scrBorder, 0.25), 1);
          }
        }
        // outer scratch border + inner tile boundary
        const cCtr = scell((T_TILE - 1) / 2, (T_TILE - 1) / 2);
        cellSquare(
          sx + (SN * cs) / 2,
          sy + (SN * cs) / 2,
          SN * cs,
          null,
          withAlpha(C.scrBorder, 0.95),
          2.5,
        );
        cellSquare(cCtr.x, cCtr.y, T_TILE * cs, null, withAlpha(C.scrBorder, 0.6), 1.8);
        // label
        ctx.push();
        ctx.noStroke();
        ctx.fill(withAlpha(C.scrBorder, 0.95));
        ctx.textAlign(ctx.CENTER, ctx.BOTTOM);
        ctx.textSize(fs * 0.85);
        ctx.text("SLM scratch (tile + halo)", sx + (SN * cs) / 2, sy - 6);
        ctx.pop();
      }

      function drawDeposit(p) {
        const stencil = (ci, cj, hex, on) => {
          if (!on) return;
          for (let di = 0; di < 2; di++)
            for (let dj = 0; dj < 2; dj++) {
              const cc = scell(ci + di, cj + dj);
              cellSquare(cc.x, cc.y, cs, withAlpha(hex, 0.4), ctx.color(hex), 2.5);
            }
        };
        stencil(1, 1, C.stencilA, p > 0.12);
        stencil(2, 1, C.stencilB, p > 0.34);
        // particle markers
        ctx.push();
        ctx.noStroke();
        if (p > 0.12) {
          const a = scell(1.5, 1.5);
          ctx.fill(C.stencilA);
          ctx.circle(a.x, a.y, Math.max(4, cs * 0.28));
        }
        if (p > 0.34) {
          const b = scell(2.5, 1.5);
          ctx.fill(C.stencilB);
          ctx.circle(b.x, b.y, Math.max(4, cs * 0.28));
        }
        ctx.pop();
        // shared column (li=2) receives two LDS atomics -> highlight
        if (p > 0.55) {
          const pulse = 0.35 + 0.25 * Math.sin(p * 22);
          for (const lj of [1, 2]) {
            const cc = scell(2, lj);
            cellSquare(cc.x, cc.y, cs, withAlpha(C.overlap, pulse), ctx.color(C.overlap), 4);
          }
        }
      }

      function drawEscape(p) {
        // in-scratch part of the drifted particle (high halo edge)
        const li = T_TILE + HALO - 1;
        const inCell = scell(li, 1);
        const app = easeInOut(clamp(p * 1.6, 0, 1));
        cellSquare(inCell.x, inCell.y, cs, withAlpha(C.escape, 0.4 * app), ctx.color(C.escape), 3);
        // the escaped cell sits one step past the scratch window
        const escCell = scell(li + 1, 1);
        cellSquare(
          escCell.x,
          escCell.y,
          cs,
          withAlpha(C.escape, 0.22 * app),
          withAlpha(C.escape, 0.7),
          2,
        );
        // arrow to a global-J cell in the right-neighbour tile
        const tgt = gcell(2 * T_TILE + 1, T_TILE + 1);
        if (p > 0.3) {
          const ap = easeInOut(clamp((p - 0.3) * 1.8, 0, 1));
          arrow(
            escCell.x,
            escCell.y,
            escCell.x + (tgt.x - escCell.x) * ap,
            escCell.y + (tgt.y - escCell.y) * ap,
            C.escape,
            3,
          );
          if (ap > 0.98) cellSquare(tgt.x, tgt.y, cg, withAlpha(C.escape, 0.5), ctx.color(C.escape), 2.5);
        }
      }

      function drawFlush(p) {
        for (let li = 0; li < T_TILE; li++)
          for (let lj = 0; lj < T_TILE; lj++) {
            const r = flushReveal(li, lj, p);
            if (r <= 0) continue;
            const s = scell(li, lj);
            const g = gcell(li + T_TILE * FOCUS.tx, lj + T_TILE * FOCUS.ty);
            arrow(s.x, s.y, s.x + (g.x - s.x) * r, s.y + (g.y - s.y) * r, C.arrow, 2);
          }
      }

      // ----- title / caption / summary text -----
      function drawTitle(p) {
        const a = easeInOut(clamp(p * 2, 0, 1)) * (1 - easeInOut(clamp((p - 0.8) * 5, 0, 1)));
        ctx.push();
        ctx.noStroke();
        ctx.textAlign(ctx.CENTER, ctx.CENTER);
        ctx.fill(withAlpha(fg(), 0.95 * a));
        ctx.textSize(fs * 1.7);
        ctx.text("Entity — Tiled Current Deposit", W / 2, H / 2 - fs);
        ctx.fill(withAlpha(fg(), 0.6 * a));
        ctx.textSize(fs * 0.95);
        ctx.text("one GPU team per spatial tile · SLM scratch + single flush", W / 2, H / 2 + fs * 0.6);
        ctx.pop();
      }

      const CAPTIONS = {
        1: [
          "Spatial sort makes each tile's particles contiguous — one tile = one GPU team.",
          "Particles are coloured by their owning tile.",
        ],
        2: [
          "The focus team allocates SLM scratch = tile + HALO border, then zero-fills it.",
          "HALO = STENCIL_REACH + DRIFT  (stencil reach + between-sort drift).",
        ],
        3: [
          "Each thread adds its particles' stencils into scratch via fast LDS atomics.",
          "Overlapping neighbour stencils contend in LDS (yellow) — not in global HBM.",
        ],
        4: [
          "Escape valve: a particle drifted past the HALO. Cells outside scratch fall back",
          "to a direct atomic_add on global J — still deposited exactly once, charge-conserving.",
        ],
        5: [
          "Flush: each non-zero scratch cell → ONE atomic_add into global J.",
          "Global memory is touched once per scratch cell per tile — not once per particle.",
        ],
      };

      function drawCaption(idx) {
        const lines = CAPTIONS[idx];
        if (!lines) return;
        ctx.push();
        ctx.noStroke();
        ctx.textAlign(ctx.CENTER, ctx.TOP);
        ctx.textSize(fs * 0.92);
        ctx.fill(withAlpha(fg(), 0.9));
        let y = H - lines.length * (fs * 1.35) - 12;
        for (const ln of lines) {
          ctx.text(ln, W / 2, y);
          y += fs * 1.35;
        }
        ctx.pop();
      }

      function drawSummary(p) {
        const a = easeInOut(clamp(p * 1.6, 0, 1));
        const rows = [
          ["Flat kernel:  ~ (stencil writes) × (particles) global-memory atomics", C.stencilB, 0.95],
          ["Tiled kernel: per-particle stencils → LDS atomics;", C.flush, 0.95],
          ["              global J touched once per scratch cell per tile.", C.flush, 0.95],
          ["Same charge-conserving deposit math — only the memory traffic differs.", fg(), 0.6],
        ];
        ctx.push();
        ctx.textAlign(ctx.LEFT, ctx.CENTER);
        ctx.noStroke();
        ctx.textFont("monospace");
        const x = W * 0.12;
        let y = H / 2 - rows.length * fs * 0.9;
        for (const [txt, col, al] of rows) {
          ctx.textSize(fs * 0.95);
          ctx.fill(withAlpha(col, al * a));
          ctx.text(txt, x, y);
          y += fs * 1.8;
        }
        ctx.pop();
      }

      function drawSceneLabel(idx) {
        const lbl = PHASES[idx].label;
        if (!lbl) return;
        ctx.push();
        ctx.noStroke();
        ctx.textAlign(ctx.LEFT, ctx.TOP);
        ctx.textSize(fs * 1.0);
        ctx.fill(withAlpha(fg(), 0.85));
        ctx.text(lbl, 10, 8);
        ctx.pop();
      }

      // ----- layout -----
      function layout() {
        const article = document.getElementsByTagName("article")[0];
        W = Math.min(article ? article.offsetWidth : 800, 900);
        H = Math.round(W * 0.6);
        fs = clamp(W * 0.021, 12, 19);
        const titleH = fs * 2.6;
        const capH = fs * 4.2;
        const bandTop = titleH;
        const bandH = H - titleH - capH;
        cg = Math.min((W * 0.44) / N, bandH / N);
        const gridW = cg * N;
        gx = W * 0.05;
        gy = bandTop + (bandH - gridW) / 2;
        cs = Math.min((W * 0.32) / SN, bandH / SN);
        const scrW = cs * SN;
        sx = W - W * 0.06 - scrW;
        sy = bandTop + (bandH - scrW) / 2;
      }

      // ----- p5 lifecycle -----
      ctx.setup = () => {
        layout();
        const cnv = ctx.createCanvas(W, H);
        cnv.parent(HOST);
        ctx.textFont("sans-serif");

        const mkBtn = (label, yOff, onClick) => {
          const b = ctx.createButton(label);
          b.parent(HOST);
          b.position(W - 42, 8 + yOff);
          b.size(34, 28);
          b.mouseClicked(onClick);
          b.style("cursor", "pointer");
          b.style("border-radius", "6px");
          b.style("border", "1px solid rgba(127,127,127,0.4)");
          b.style("background-color", "rgba(127,127,127,0.12)");
          return b;
        };
        btnPlay = mkBtn("⏸", 0, () => {
          if (t >= TOTAL) t = 0;
          playing = !playing;
          btnPlay.html(playing ? "⏸" : "▶");
        });
        btnReplay = mkBtn("⟲", 34, () => {
          t = 0;
          playing = true;
          btnPlay.html("⏸");
        });
        btnSkip = mkBtn("⏭", 68, () => {
          const idx = phaseIndex();
          t = idx < PHASES.length - 1 ? STARTS[idx + 1] : 0;
          playing = true;
          btnPlay.html("⏸");
        });
      };

      ctx.windowResized = () => {
        layout();
        ctx.resizeCanvas(W, H);
        btnPlay.position(W - 42, 8);
        btnReplay.position(W - 42, 42);
        btnSkip.position(W - 42, 76);
      };

      ctx.draw = () => {
        if (playing) {
          t += ctx.deltaTime / 1000;
          if (t >= TOTAL) {
            t = TOTAL;
            playing = false;
            btnPlay.html("▶");
          }
        }
        ctx.clear();
        const idx = phaseIndex();
        const p = localP(idx);

        if (idx === 0) {
          drawTitle(p);
          return;
        }
        if (idx === 6) {
          drawSummary(p);
          drawSceneLabel(idx);
          return;
        }

        drawGrid(idx, p);
        drawParticles(idx, p);
        drawScratch(idx, p);
        if (idx === 3) drawDeposit(p);
        if (idx === 4) drawEscape(p);
        if (idx === 5) drawFlush(p);
        drawSceneLabel(idx);
        drawCaption(idx);
      };
    };

    new p5(sketch);
  },
  false,
);
