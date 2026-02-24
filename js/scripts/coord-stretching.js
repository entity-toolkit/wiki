document.addEventListener("DOMContentLoaded", () => {
  const width = document.getElementsByTagName("article")[0].offsetWidth;
  const factor = width / 600;
  const h = 60 * factor;
  const margin = {
    top: 30 * factor,
    right: 30 * factor,
    bottom: 35 * factor,
    left: 30 * factor,
  };
  const height = 2 * margin.top + margin.bottom + 2 * h;
  const ax_width = width - margin.left - margin.right;

  const zip = (...arrays) => {
    return Array(Math.max(...arrays.map((arr) => arr.length)))
      .fill()
      .map((_, index) => arrays.map((arr) => arr[index]));
  };

  const svg = d3
    .select("#plot-coord-stretch")
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

  const addArrowhead = (ax, scale) =>
    ax
      .append("path")
      .attr("d", `M0,0H${scale.range()[1]}`)
      .attr("marker-end", "url(#arrow)");

  const addXAxes = (y0, scale, axgen) =>
    svg
      .append("g")
      .attr("class", "axes")
      .attr("transform", "translate(0," + y0 + ")")
      .call(axgen(scale));

  const addKatex = (x, y, text) =>
    svg
      .append("foreignObject")
      .attr("width", 100)
      .attr("height", 150)
      .attr("class", "d3-katex")
      .attr("x", x)
      .attr("y", y - 10)
      .append("xhtml")
      .html(katex.renderToString(text));

  const Ys = [margin.top / 2, margin.top / 2 + h, margin.top / 2 + 2 * h];
  const scales = [
    d3.scaleLinear([1, 110], [0, ax_width]),
    d3.scaleLinear([0, Math.log(110)], [0, ax_width]),
    d3.scaleLinear([0, 18.8], [0, ax_width]),
  ];

  const ticks = [
    (s) =>
      d3
        .axisBottom(s)
        .tickSizeOuter(0)
        .tickValues(d3.range(10, 110, 10)),
    (s) => d3.axisBottom(s).tickSizeOuter(0),
    (s) => d3.axisBottom(s).tickSizeOuter(0),
  ];

  zip(Ys, scales, ticks).map(([y, s, t], i) => {
    const ax = addXAxes(y, s, t);
    addArrowhead(ax, s);
    return ax;
  });

  let line = d3.line();
  const x2arr = d3.range(0, Math.log(100), 0.25);
  const x1arr = x2arr.map(Math.exp);
  const y1 = Ys[0];
  const y2 = Ys[1];
  const y3 = Ys[2];

  // Iterate over arrays and create lines
  for (let i = 0; i < x1arr.length; i++) {
    let points = [
      [scales[0](x1arr[i]), y1],
      [scales[1](x2arr[i]), y2],
      [scales[1](x2arr[i]), y3],
    ];
    svg
      .append("path")
      .attr("d", line(points))
      .classed("helper-line", true)
      .attr("fill", "none");
  }

  addKatex(ax_width, Ys[0] - 20, "r");
  addKatex(ax_width, Ys[1] - 20, "\\xi");
  addKatex(ax_width, Ys[2] - 20, "x^1");
});

