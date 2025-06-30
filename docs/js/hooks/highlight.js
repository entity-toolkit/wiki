document$.subscribe(() => {
  const lightTheme = document.getElementById('highlight2-light');
  const darkTheme = document.getElementById('highlight-dark');

  if (lightTheme !== null && darkTheme !== null) {
    const setTheme = () => {
      const scheme = document.body.getAttribute('data-md-color-scheme');
      if (scheme === 'ntt-dark') {
        darkTheme.removeAttribute("disabled");
        lightTheme.setAttribute("disabled", "disabled");
      } else {
        lightTheme.removeAttribute("disabled");
        darkTheme.setAttribute("disabled", "disabled");
      }
    };

    const observer = new MutationObserver(() => {
      setTheme();
    });
    setTheme();

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"],
    });
    console.log('Highlight themes initialized');
  } else {
    console.error('Highlight themes are not loaded');
  }
});