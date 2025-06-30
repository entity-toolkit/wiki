document$.subscribe(() => {
  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: false });
    mermaid.run({
      nodes: document.querySelectorAll('.mermaid-diagram'),
    });
    console.log("Mermaid hooks initialized");
  } else {
    console.error("Mermaid library not found");
  }
})