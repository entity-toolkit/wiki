document$.subscribe(({ body }) => {
  if (typeof renderMathInElement !== 'undefined') {
    renderMathInElement(body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
    });
    console.log('KaTeX auto-render initialized');
  } else {
    console.error('KaTeX auto-render is not loaded');
  }
});