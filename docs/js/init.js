const d3Utils = {
  count: 0,

  uid: (name) => {
    return new d3Utils.Id("O-" + (name == null ? "" : name + "-") + ++d3Utils.count);
  },

  Id: class {
    constructor(id) {
      this.id = id;
      this.href = new URL(`#${id}`, location) + "";
    }
    toString = () => {
      return "url(" + this.href + ")";
    }
  },

  zoomin: (d, group, svg, width, x, y, position, render) => {
    let pos = (group, root) => position(group, root, width, x, y);
    const group0 = group.attr("pointer-events", "none");
    const group1 = group = svg.append("g").call(render, d);

    x.domain([d.x0, d.x1]);
    y.domain([d.y0, d.y1]);

    svg.transition()
      .duration(250)
      .call(t => group0.transition(t)
        .attrTween("opacity",
          () => d3.interpolate(1, 0)).remove()
        .call(pos, d.parent))
      .call(t => group1.transition(t)
        .attrTween("opacity",
          () => d3.interpolate(0, 1)
        )
        .call(pos, d));
  },

  zoomout: (d, group, svg, width, x, y, position, render) => {
    let pos = (group, root) => position(group, root, width, x, y);
    const group0 = group.attr("pointer-events", "none");
    const group1 = group = svg.insert("g", "*").call(render, d.parent);

    x.domain([d.parent.x0, d.parent.x1]);
    y.domain([d.parent.y0, d.parent.y1]);

    svg.transition()
      .duration(250)
      .call(t => group0.transition(t).remove()
        .attrTween("opacity",
          () => d3.interpolate(1, 0)
        )
        .call(pos, d))
      .call(t => group1.transition(t)
        .attrTween("opacity",
          () => d3.interpolate(0, 1)
        )
        .call(pos, d.parent));
  },
};

document.addEventListener("DOMContentLoaded", () => {
  renderMathInElement(document.body, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true }
    ],
    throwOnError: false
  });

  window.addEventListener('load', () => {
    // index.md
    [document.getElementById('contributors'), document.getElementById('core-developers')].forEach(el => {
      if (el) {
        let ul = el.nextElementSibling;
        if (ul) {
          ul.children.forEach(li => {
            const tags_str = />:(.*)\}/.exec(li.innerHTML)[1];
            const tags = tags_str.split(',').map(c => c.trim());
            li.innerHTML = li.innerHTML.replace(tags_str, tags.map(t => `<span class="tag ${t.toLowerCase().replace(' ', '_')}">${t}</span>`).join(''));
          });
        }
      }
    })
  });

  // const cards = document.getElementsByClassName('nt-card');
  // const collapsables = document.getElementsByClassName('abstract');
  // cards.forEach((card, i) => {
  //   card.addEventListener('click', () => {
  //     cards.forEach(c => c.classList.remove('active'));
  //     card.classList.add('active');
  //     collapsables.forEach(c => c.removeAttribute('open'));
  //     collapsables[i].setAttribute('open', true);
  //   });
  // });
});
