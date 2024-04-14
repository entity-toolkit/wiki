// Define the data for the nodes and links
var nodes = [
  { id: "A", description: "descr A", fx: 250, fy: 100 },
  { id: "B", description: "descr B", fx: 250, fy: 250 },
  { id: "C", description: "descr C", fx: 250, fy: 400 }
];

var links = [
  { source: "A", target: "B" },
  { source: "B", target: "C" },
  { source: "A", target: "C" }
];

// Create the SVG
var svg = d3.select("#canvas").append("svg")
  .attr("width", 500)
  .attr("height", 500);

// Define arrow markers for graph links
svg.append('defs').append('marker')
  .attr('id', 'arrowhead')
  .attr('viewBox', '-0 -5 10 10')
  .attr('refX', 25)
  .attr('refY', 0)
  .attr('orient', 'auto')
  .attr('markerWidth', 6)
  .attr('markerHeight', 6)
  .attr('xoverflow', 'visible')
  .append('svg:path')
  .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
  .attr('fill', '#999')
  .style('stroke', 'none');

// Create the link lines
var link = svg.append("g")
  .attr("class", "links")
  .selectAll("line")
  .data(links)
  .enter().append("line")
  .attr('marker-end', 'url(#arrowhead)')
  .style("stroke", "#999")
  .style("stroke-width", "2px");

// Create the node circles
var node = svg.append("g")
  .attr("class", "nodes")
  .selectAll("circle")
  .data(nodes)
  .enter().append("circle")
  .attr("r", 20)
  .style("fill", "#69b3a2");

// Create the node labels
var label = svg.append("g")
  .attr("class", "labels")
  .selectAll("text")
  .data(nodes)
  .enter().append("text")
  .text(function (d) { return d.id; })
  .style("font-size", "20px");

// Create the node descriptions
var description = svg.append("g")
  .attr("class", "descriptions")
  .selectAll("text")
  .data(nodes)
  .enter().append("text")
  .text(function (d) { return d.description; })
  .style("font-size", "12px");

// Use D3's force layout to position the nodes and links
var simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(function (d) { return d.id; }).distance(100))
  .force("charge", d3.forceManyBody().strength(-400))
  .force("center", d3.forceCenter(500 / 2, 500 / 2))
  .on("tick", tick);

function tick() {
  link.attr("x1", function (d) { return d.source.x; })
    .attr("y1", function (d) { return d.source.y; })
    .attr("x2", function (d) { return d.target.x; })
    .attr("y2", function (d) { return d.target.y; });

  node.attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; });

  label.attr("x", function (d) { return d.x; })
    .attr("y", function (d) { return d.y - 30; });  // Position the label above the node

  description.attr("x", function (d) { return d.x; })
    .attr("y", function (d) { return d.y + 30; });  // Position the description below the node
}

// Function to update the text color based on the theme
function updateTextColor() {
  var computedColor = getComputedStyle(document.body).getPropertyValue('--md-default-fg-color').trim();
  label.style("fill", computedColor);
  description.style("fill", computedColor);
}

// Add a click event listener to the element that changes the theme
document.querySelector('.md-header__option[data-md-component="palette"]').addEventListener('click', function () {
  // Timeout is needed because the theme change is not applied immediately
  setTimeout(updateTextColor, 100);
});

