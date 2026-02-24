document.addEventListener(
  "DOMContentLoaded",
  () => {
    const width = document.getElementsByTagName("article")[0].offsetWidth;
    const factor = width / 600;
    const height = 100 * factor;

    // const margin = { top: 30 * factor, right: 30 * factor, bottom: 35 * factor, left: 30 * factor };
    const margin = { top: 0, right: 20 * factor, bottom: 0, left: 20 * factor };
    const ax_width = width - margin.left - margin.right;

    const svg = d3
      .select("#atm-bcs")
      .append("svg")
      .classed("d3svg", true)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + width + " " + height)
      .classed("svg-content-responsive", true)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 20 10")
      .attr("refX", 5)
      .attr("refY", 0)
      .attr("markerWidth", 20)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L20,0L0,5")
      .attr("class", "arrowhead")
      .attr("opacity", 1);

    // a curly brace between x1,y1 and x2,y2, w pixels wide
    // and q factor, .5 is normal, higher q = more expressive bracket
    // from https://gist.github.com/alexhornbake/6005176
    function curlyBrace(x1, y1, x2, y2, w, q) {
      var dx = x1 - x2;
      var dy = y1 - y2;
      var len = Math.sqrt(dx * dx + dy * dy);
      dx = dx / len;
      dy = dy / len;
      var qx1 = x1 + q * w * dy;
      var qy1 = y1 - q * w * dx;
      var qx2 = x1 - 0.25 * len * dx + (1 - q) * w * dy;
      var qy2 = y1 - 0.25 * len * dy - (1 - q) * w * dx;
      var tx1 = x1 - 0.5 * len * dx + w * dy;
      var ty1 = y1 - 0.5 * len * dy - w * dx;
      var qx3 = x2 + q * w * dy;
      var qy3 = y2 - q * w * dx;
      var qx4 = x1 - 0.75 * len * dx + (1 - q) * w * dy;
      var qy4 = y1 - 0.75 * len * dy - (1 - q) * w * dx;

      return `M ${x1} ${y1} Q ${qx1} ${qy1} ${qx2} ${qy2} T ${tx1} ${ty1} M ${x2} ${y2} Q ${qx3} ${qy3} ${qx4} ${qy4} T ${tx1} ${ty1}`;
    }

    const xscale = d3.scaleLinear([0, 1], [0, ax_width]);
    const xticks = (s) =>
      d3
        .axisBottom(s)
        .tickSizeOuter(0)
        .tickValues([0.05, 0.2])
        .tickFormat(() => "");

    const addXAxes = (y0, scale, axgen) =>
      svg
        .append("g")
        .attr("class", "axes")
        .attr("transform", "translate(0," + y0 + ")")
        .call(axgen(scale));

    const addArrowhead = (ax, scale) =>
      ax
        .append("path")
        .attr("d", `M0,0H${scale.range()[1]}`)
        .attr("marker-end", "url(#arrow)");

    const y0 = height / 2;
    const dy = 8;
    svg
      .append("path")
      .attr("d", curlyBrace(xscale(0.2), y0 - dy, xscale(0), y0 - dy, 20, 0.5))
      .attr("class", "line");
    svg
      .append("path")
      .attr(
        "d",
        curlyBrace(xscale(0.5), y0 - dy, xscale(0.2), y0 - dy, 20, 0.5),
      )
      .attr("class", "line");
    svg
      .append("path")
      .attr(
        "d",
        curlyBrace(xscale(0.05), y0 + dy, xscale(0.2), y0 + dy, 20, 0.5),
      )
      .attr("class", "line");
    const ax = addXAxes(y0, xscale, xticks);
    addArrowhead(ax, xscale);

    svg
      .append("text")
      .classed("label", true)
      .html("enforcing fields")
      .style("text-anchor", "middle")
      .attr(
        "transform",
        "translate(" + xscale(0.1) + "," + (y0 - 5 * dy) + ")",
      );

    svg
      .append("text")
      .classed("label", true)
      .html("injecting particles")
      .style("text-anchor", "middle")
      .attr(
        "transform",
        "translate(" + xscale(0.35) + "," + (y0 - 5 * dy) + ")",
      );

    svg
      .append("text")
      .classed("label", true)
      .html("buffer zone")
      .style("text-anchor", "middle")
      .attr(
        "transform",
        "translate(" + xscale(0.125) + "," + (y0 + 7 * dy) + ")",
      );

    svg
      .append("text")
      .classed("label", true)
      .html("x")
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + xscale(1) + "," + (y0 - 2 * dy) + ")");

    const pts = [
      [xscale(0.05), y0 - 7 * dy],
      [xscale(0.05), y0 + 7 * dy],
    ];
    svg
      .append("path")
      .attr("d", d3.line()(pts))
      .classed("helper-line", true)
      .attr("fill", "none");
  },
  false,
);
