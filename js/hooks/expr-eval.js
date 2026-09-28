document$.subscribe(() => {
  if (window.exprEval) {
    console.log("expr-eval initialized");
  } else {
    console.error("expr-eval is not loaded");
  }
});
