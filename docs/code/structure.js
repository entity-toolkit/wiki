const parentID = "d3-code-structure";

document.addEventListener("DOMContentLoaded", () => {
  const Type = {
    Root: 0,
    Header: 1,
    Source: 2,
    Test: 3,
    Directory: 4,
  }

  const CONFIGS = {
    dataURL: "https://gist.githubusercontent.com/haykh/f075d7992cda4380dd95514fc8fe55b9/raw/0191d6b06bcc68a77904b658b21c2397ffb4f1d0/entity-code-struct.json",
    width: 928,
    height: 720,
    root_height: 60,
    padding: 5,
    round: 2,
    ratio: 0.4,
    treemap_type: "binary",
    text: {
      "pad-left": 5,     // px
      "pad-top": 1.1,    // em
      "line-height": 1.1 // em
    }
  }
  const TOOLS = {
    isHeader: (d) => d.data.name.endsWith(".h") || d.data.name.endsWith(".hpp"),
    isSource: (d) => d.data.name.endsWith(".cpp"),
    isTest: (d) => d.data.is_test,
    isDirectory: (d) => d.data.children !== undefined,
    categorize: (d, root) => {
      if (d === root) {
        return Type.Root;
      } else if (TOOLS.isHeader(d)) {
        return Type.Header;
      } else if (TOOLS.isSource(d)) {
        return Type.Source;
      } else if (TOOLS.isTest(d)) {
        return Type.Test;
      } else {
        return Type.Directory;
      }
    },
    colors: {
      [Type.Root]: "#E3AAF4",
      [Type.Header]: "#7DC2F3",
      [Type.Source]: "#DFC39E",
      [Type.Test]: "#FFA07A",
      [Type.Directory]: "#ddd",
    },
    getColor: (d, root) => {
      return TOOLS.colors[TOOLS.categorize(d, root)];
    },
    getName: (d, root) => {
      if (d === root) {
        return d.ancestors()
          .reverse()
          .map(d => d.data.name)
          .join("/");
      } else if (TOOLS.isDirectory(d)) {
        return d.data.name + "/";
      } else {
        return d.data.name;
      }
    },
    getBrief: (d) => {
      if (d.data.brief !== undefined) {
        return d.data.brief;
      } else {
        return "";
      }
    }
  }

  const width = CONFIGS.width;
  const height = CONFIGS.height;

  const position = (group, root, width, x, y) => {
    group.selectAll("g")
      .attr("transform", d => {
        if (d === root) {
          return `translate(0,-${CONFIGS.root_height / 2})`;
        } else {
          return `translate(${x(d.x0)},${y(d.y0) + CONFIGS.root_height / 2})`;
        }
      })
      .select("rect")
      .attr("width", d => {
        if (d === root) {
          return width - CONFIGS.padding;
        } else {
          return x(d.x1) - x(d.x0) - CONFIGS.padding;
        }
      })
      .attr("height", d => {
        if (d === root) {
          return CONFIGS.root_height - CONFIGS.padding;
        } else {
          return y(d.y1) - y(d.y0) - CONFIGS.padding;
        }
      });
  };
  d3.json(CONFIGS.dataURL).then(data => {
    const root = d3.hierarchy(data)
      .count()
      .sort((a, b) => b.value - a.value);

    root.eachAfter(node => {
      if (node.data.nlines === undefined) {
        node.data.sumnlines = 0;
      } else {
        node.data.sumnlines = node.data.nlines;
      }
      if (node.children) {
        let childSum = 0;
        node.children.forEach(child => {
          childSum += child.data.sumnlines;
        });
        node.data.sumnlines += childSum;
      }
    });

    // Compute the layout
    const treemap = d3.treemap()
      .tile((node, x0, y0, x1, y1) => {
        if (CONFIGS.treemap_type === "binary") {
          d3.treemapBinary(node, 0, 0, width, height);
          for (const child of node.children) {
            child.x0 = x0 + child.x0 / width * (x1 - x0);
            child.x1 = x0 + child.x1 / width * (x1 - x0);
            child.y0 = y0 + child.y0 / height * (y1 - y0);
            child.y1 = y0 + child.y1 / height * (y1 - y0);
          }
        } else if (CONFIGS.treemap_type === "square") {
          d3.treemapSquarify.ratio(CONFIGS.ratio)(node, x0 / CONFIGS.ratio, y0, x1 / CONFIGS.ratio, y1);
          for (const child of node.children) {
            child.x0 *= CONFIGS.ratio;
            child.x1 *= CONFIGS.ratio;
          }
        } else {
          console.error("Invalid treemap type");
        }
      })(root);

    // Create the scales
    const x = d3.scaleLinear().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([0, height]);

    // Formatting utilities
    const format = d3.format(",d");

    // Create the SVG container
    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height + CONFIGS.root_height)
      .attr("style", "max-width: 100%; height: auto;");

    /* ------------------------------- main render ------------------------------ */
    const render = (group, root) => {
      const node = group
        .selectAll("g")
        .data(root.children.concat(root))
        .join("g");

      node.filter(d => d === root ? d.parent : d.children)
        .attr("cursor", "pointer")
        .on("click", (event, d) => {
          if (d === root) {
            return d3Utils.zoomout(root, group, svg, width, x, y, position, render);
          } else {
            return d3Utils.zoomin(d, group, svg, width, x, y, position, render);
          }
        });

      node.append("title")
        .text(d => `${TOOLS.getBrief(d)}`);

      node.append("rect")
        .attr("id", d => (d.leafUid = d3Utils.uid("leaf")).id)
        .attr("fill", d => TOOLS.getColor(d, root))
        // .attr("stroke", "white")
        .attr("opacity", 0.5)
        .attr("rx", CONFIGS.round)

      node.append("clipPath")
        .attr("id", d => (d.clipUid = d3Utils.uid("clip")).id)
        .append("use")
        .attr("xlink:href", d => d.leafUid.href);

      node.append("text")
        .attr("clip-path", d => d.clipUid)
        .attr("font-size", "1.5em")
        .selectAll("tspan")
        .data(d => [TOOLS.getName(d, root)].concat(format(d.data.sumnlines) + " lines"))
        .join("tspan")
        .attr("x", CONFIGS.text["pad-left"])
        .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.4 + CONFIGS.text["pad-top"] + i * CONFIGS.text["line-height"]}em`)
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
        .text(d => d);

      // node.append('text')
      //   .attr("x", 3)
      //   .attr("y", 60)
      //   .attr("font-size", "1.2em")
      //   .each(function (d) {
      //     let text = d3.select(this);
      //     const brief = getBrief(d);
      //     if (brief == "") {
      //       return;
      //     }
      //     let words = brief.split(/\s+/).reverse();
      //     let word;
      //     let line = [];
      //     const lineHeight = 1.25; // ems
      //     const y = text.attr("y");
      //     let dy = 0; // Initialize 'dy' to 0
      //     let tspan = text.text(null).append("tspan").attr("x", 3).attr("y", y).attr("dy", dy + "em");

      //     console.log(d.ancestors().length)
      //     const rectWidth = (d.x1 - d.x0) * 2000 * Math.pow(2, d.ancestors().length - 3);

      //     while (word = words.pop()) {
      //       line.push(word);
      //       tspan.text(line.join(" "));
      //       if (tspan.node().getComputedTextLength() > rectWidth) {
      //         line.pop();
      //         tspan.text(line.join(" "));
      //         line = [word];
      //         dy += lineHeight; // Increment 'dy' by 'lineHeight'
      //         tspan = text.append("tspan").attr("x", 3).attr("y", y).attr("dy", dy + "em").text(word);
      //       }
      //     }
      //   });
      group.call((g, r) => position(g, r, width, x, y), root);
    }

    // Display the root
    svg.append("g").call(render, treemap);

    document.getElementById(parentID).append(svg.node());
  })
});