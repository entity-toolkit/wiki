import esbuild from "esbuild";

const libs = {
  mermaid: {
    "name": "mermaid",
    "path": "dist",
    "file": "mermaid.min.js",
  },
  d3: {
    "name": "d3",
    "path": "dist",
    "file": "d3.min.js",
  },
  p5: {
    "name": "p5",
    "path": "lib",
    "file": "p5.min.js",
  },
};

for (const [_, entry] of Object.entries(libs)) {
  esbuild.buildSync({
    entryPoints: [`node_modules/${entry.name}/${entry.path}/${entry.file}`],
    outfile: `docs/js/vendor/${entry.file}`,
    bundle: false,
    minify: true
  });
}