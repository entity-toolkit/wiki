document$.subscribe(() => {
  if (window.d3) {
    console.log("d3js hooks initialized");
  } else {
    console.error("d3js library not found");
  }
})