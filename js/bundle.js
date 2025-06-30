import esbuild from "esbuild";
import { cpSync, mkdirSync } from 'fs';

const eslibs = {
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
};


for (const [_, entry] of Object.entries(eslibs)) {
  esbuild.buildSync({
    entryPoints: [`node_modules/${entry.name}/${entry.path}/${entry.file}`],
    outfile: `docs/js/vendor/${entry.file}`,
    bundle: false,
    minify: true
  });
}

const hlPath = './node_modules/@highlightjs/cdn-assets';
const hlDestPath = './docs/js/vendor/highlight.js';
mkdirSync(hlDestPath, { recursive: true });
cpSync(`${hlPath}`, `${hlDestPath}`, { recursive: true });

const threePath = './node_modules/three';
const threeDestPath = './docs/js/vendor/three';
mkdirSync(threeDestPath, { recursive: true });
cpSync(`${threePath}/build/three.module.min.js`, `${threeDestPath}/three.module.min.js`);
cpSync(`${threePath}/build/three.core.min.js`, `${threeDestPath}/three.core.min.js`);
cpSync(`${threePath}/examples/jsm`, `${threeDestPath}/examples/jsm`, { recursive: true });

const katexPath = './node_modules/katex';
const katexDestPath = './docs/js/vendor/katex';
mkdirSync(katexDestPath, { recursive: true });
cpSync(`${katexPath}/dist/katex.min.js`, `${katexDestPath}/katex.min.js`);
cpSync(`${katexPath}/dist/katex.min.css`, `${katexDestPath}/katex.min.css`);
cpSync(`${katexPath}/dist/fonts/`, `${katexDestPath}/fonts/`, { recursive: true });
cpSync(`${katexPath}/dist/contrib/`, `${katexDestPath}/contrib/`, { recursive: true });