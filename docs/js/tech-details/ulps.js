if (document.getElementById("plotulps0")) {

  class D3Canvas {
    /**
     * @param {string} belongs : parent container ID
     * @param {number} w : height as a fraction of the parent width
     * @param {number} aspect : height / width
     * @param {number} pts : points per `w` width
     * @param {dict} margins : {top: number, right: number, bottom: number, left: number} in points
     * 
     * @note values with `_px` suffix are in pixels
     * @note values without suffix are in points
     */
    constructor(belongs, w, aspect, pts, margins) {
      this.setSize(w, aspect, pts, margins);

      this.svg = d3.select(belongs)
        .append("svg")
        .classed("d3svg", true)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + this.w0_px + " " + this.h0_px)
        .classed("svg-content-responsive", true)
        .append("svg")
        .attr("width", this.w0_px)
        .attr("height", this.h0_px)
        .append("g")
        .attr("transform", "translate(" + this.margins_px.left + "," + this.margins_px.top + ")");

      this.objs = {
        "1DAxes": 0,
      };
    }

    setSize(w, aspect, pts, margins) {
      this.fullW_px = document.getElementsByTagName("article")[0].offsetWidth;
      this.w0_px = this.fullW_px * w;
      this.w0 = pts;
      this.scale = this.w0 / this.w0_px;
      this.h0 = this.w0 * aspect;
      this.h0_px = this.pt2px(this.h0);
      this.margins = {
        top: margins.top,
        right: margins.right,
        bottom: margins.bottom,
        left: margins.left
      }
      this.margins_px = Object.fromEntries(
        Object.entries(this.margins).map(([k, v]) => [k, this.pt2px(v)])
      );
      this.w = this.w0 - this.margins.left - this.margins.right;
      this.h = this.h0 - this.margins.top - this.margins.bottom;
      this.w_px = this.pt2px(this.w);
      this.h_px = this.pt2px(this.h);
    }

    px2pt(x) {
      return x * this.scale;
    }

    pt2px(x) {
      return x / this.scale;
    }

    add1DXAxis(xScale, y_px, fmt = (() => ''), ticks = []) {
      const id = "xAxis" + String(this.objs["1DAxes"]);
      const xax = d3
        .axisBottom(xScale)
        .tickValues(ticks)
        .tickFormat(fmt)
        
      this.svg
        .append("g")
        .attr("class", "axes")
        .attr("id", id)
        .attr("transform", "translate(0," + y_px + ")")
        .call(xax)
      this.objs["1DAxes"] += 1;
    }
  }

  window.addEventListener("load", () => {
    const cnv = new D3Canvas(
      belongs = "#plotulps0",
      w = 0.9, aspect = 0.2, pts = 600, margin = {
        top: 30, right: 30, bottom: 35, left: 30,
      });

    const xScale = d3.scaleLinear()
      .domain([-1, 4])
      .range([0, cnv.w_px])

    const yax_px = cnv.h_px * 0.5;

    cnv.add1DXAxis(xScale,
      y_px = yax_px,
      fmt = (x => ({
        0: '1.000000000...',
        1: '1.000000119...',
        2: '1.000000238...',
        3: '1.000000358...'
      }[x])),
      ticks = d3.range(0, 4),
    );
    d3.range(0, 4).forEach(x => {
      cnv.svg
        .append("text")
        .classed("label", true)
        .html({
          0: "..00",
          1: "..01",
          2: "..10",
          3: "..11"
        }[x])
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + xScale(x) + "," + (yax_px - 10) + ")")
    })
    cnv.svg
      .append("text")
      .classed("label", true)
      .html("0 01111111 000000000000000000000..")
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + xScale(1.5) + "," + (yax_px - 50) + ")")
  });
}