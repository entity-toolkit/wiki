document$.subscribe(() => {
  if (window.p5) {
    console.log("p5js hooks initialized");
  } else {
    console.error("p5js library not found");
  }
})