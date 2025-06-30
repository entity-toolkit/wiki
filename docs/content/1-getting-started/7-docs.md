---
hide:
  - footer
---

# Editing the documentation

`entity` documentation is automatically generated using the `mkdocs` framework and the [`Material for mkdocs`](https://squidfunk.github.io/mkdocs-material/) theme. When you commit/push to the `wiki` branch the static website is automatically compiled and pushed to the `gh-pages` branch of the main repository.

!!! hint

    Documentations are created using `markdown` syntax which is then automatically parsed and converted into `html`. As such, any `html`/`css`/`js` code you write in the markdown file will be automatically rendered. 

To add global `css` styling (using `scss` syntax), add a file into `sass/` directory and import it in `style.scss` via `@use 'myfile'`. To add external javascript, e.g., in `file.js` file, simply create the file in `docs/js/scripts/` and include it in the header of the corresponding markdown file:

```yaml
---
scripts:
  - file
---
```

Some third-party libraries can be included on the given page in a similar way. Below is the full list of supported ones:

```yaml
---
libraries:
  - d3 #(1)!
  - p5 #(2)!
  - mermaid #(3)!
  - three #(4)!
  - highlight #(5)!
  - tikzjax #(6)!
---
```

1. vector graphics, schemes and diagrams with [`d3js`](https://d3js.org/)
2. interactive visualizations and easy WebGL access via [`p5js`](https://p5js.org/)
3. rendering of [`mermaid` diagrams](https://mermaid.js.org/)
4. 3D visualizations using WebGL in [`threejs`](https://threejs.org/)
5. code highlighting with [`highlight.js`](https://highlightjs.org/)
6. `Tikz` diagrams via [`TikzJax` framework](https://tikzjax.com/)

> `Katex` (for rendering $\LaTeX$) is automatically added to all pages.

## Workflow

1. Pull the `wiki` branch of the main repository (it is recommended to do this in a separate directory from the main code).
  ```shell
  git clone git@github.com:entity-toolkit/wiki.git entity-wiki
  cd entity-wiki
  ```

1. Create an isolated python virtual environment and activate it.
  ```shell
  python -m venv .venv
  source .venv/bin/activate
  ```

1. Install the dependencies (everything is installed locally in the `.venv` directory).
  ```shell
  pip install -r requirements.txt
  ```

1. Install all the `node` packages using (from the root directory):
  ```shell
  npm i
  ```
  > If you don't have `npm`, try [the following instruction](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

1. Start the reactive server that will generate the website and will dynamically update any changes made to the documentation.
  ```shell
  npm run dev
  ```
  To access the documentation simply open the [`http://127.0.0.1:8000/`](http://127.0.0.1:8000/) in your browser. 
  > The `npm` command also compiles the `sass` styles into `css`, and minifies/copies the `js` libraries, placing them in the `docs/js/vendor` directory.

1. When satisfied with all the changes made simply push them to the `master` branch.
  ```shell
  git add .
  git commit -m "<reasonable comment>"
  git push
  ```
  Shortly after that, `github-actions` will generate the website and push it to the `gh-pages` branch of the main repository, which will be accessible from the web.
