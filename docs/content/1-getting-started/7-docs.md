---
hide:
  - footer
---

`entity` documentation is automatically generated using the `mkdocs` framework and the [`Material for mkdocs`](https://squidfunk.github.io/mkdocs-material/) theme. When you commit/push to the `wiki` branch the static website is automatically compiled and pushed to the `gh-pages` branch of the main repository.

!!! hint

    Documentations are created using `markdown` syntax which is then automatically parsed and converted into `html`. As such, any `html`/`css`/`js` code you write in the markdown file will be automatically rendered. 

To add global `css` styling (using `scss` syntax), add a file into `sass/` directory and import it in `style.scss`. To add external javascript, e.g., in `file.js` file, simply create the file in `docs/js/scripts/` and include it in the header of the corresponding markdown file.

```yaml
---
scripts:
  - file
---
```

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

1. (Optionally) install all the `node` packages using (from the root directory):
  ```shell
  npm i
  ```
  > If you don't have `npm`, try [the following instruction](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). Otherwise, in the next step instead of `npm run dev` run `mkdocs serve`.

1. Start the reactive server that will generate the website and will dynamically update any changes made to the documentation.
  ```shell
  # if npm is installed
  npm run dev
  # otherwise (will not recompile the sass)
  mkdocs serve
  ```
  To access the documentation simply open the [`http://127.0.0.1:8000/`](http://127.0.0.1:8000/) in your browser. 
  > The `npm` command also compiles the `sass` styles into css, minifies the `js` libraries, placing them in the `docs/js` directory. If you don't need to add any `sass` or code, you may simply run `mkdocs serve` without using any of the `npm` commands.

1. When satisfied with all the changes made simply push them to the `master` branch.
  ```shell
  git add .
  git commit -m "<reasonable comment>"
  git push
  ```
  Shortly after that, `github-actions` will generate the website and push it to the `gh-pages` branch of the main repository, which will be accessible from the web.
