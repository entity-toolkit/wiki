document$.subscribe(() => {
  if (window.mermaid) {
    function setTheme() {
      const scheme = document.body.getAttribute('data-md-color-scheme');
      console.log("Rendering Mermaid diagrams with theme:", scheme);
      const mermaidTheme = scheme === 'ntt-dark' ? 'dark' : 'default';

      mermaid.initialize({
        startOnLoad: false,
        theme: mermaidTheme,
      });

      document.querySelectorAll('.mermaid-diagram').forEach((element) => {
        let code = element.dataset.code || element.textContent;
        code = code.replace(/\\n/g, '<br>');
        element.dataset.code = code;
        
        mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, code)
          .then(({ svg }) => {
            element.innerHTML = svg;
          });
      });
    }

    const observer = new MutationObserver(() => {
      setTheme();
    });
    setTheme();

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"],
    });
    console.log("Mermaid hooks initialized");
  } else {
    console.error("Mermaid library not found");
  }
})