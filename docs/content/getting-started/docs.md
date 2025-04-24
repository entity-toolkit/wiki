---
hide:
  - footer
---

`entity` documentation is automatically generated using the `mkdocs` framework and the [`Material for mkdocs`](https://squidfunk.github.io/mkdocs-material/) theme. When you commit/push to the `wiki` branch the static website is automatically compiled and pushed to the `gh-pages` branch of the main repository.

!!! hint

    Documentations are created using `markdown` syntax which is then automatically parsed and converted into `html`. As such, any `html`/`css`/`js` code you write in the markdown file will be automatically rendered. 

To add global `css` styling (using `scss` syntax), add a file into `extra_sass/` directory and import it in `style.scss`. To add external javascript, e.g., in `file.js` file, simply create the file in the same directory with the `.md` file and include it at the end of the Markdown with (mind the `../` instead of `./`):

```markdown
<script src="../file.js"></script>
```

## Workflow

1. Pull the `wiki` branch of the main repository (it is recommended to do this in a separate directory from the main code).
  ```shell
  git clone git@github.com:entity-toolkit/wiki.git entity-wiki
  cd entity-wiki
  ```

2. Create an isolated python virtual environment and activate it.
  ```shell
  python -m venv .venv
  source .venv/bin/activate
  ```

1. Install the dependencies (everything is installed locally in the `.venv` directory).
  ```shell
  pip install -r requirements.txt
  ```

1. Start the reactive server that will generate the website and will dynamically update any changes made to the documentation.
  ```shell
  mkdocs serve
  ```
  To access the documentation simply open the [`http://127.0.0.1:8000/`](http://127.0.0.1:8000/) in your browser.

1. When satisfied with all the changes made simply push them to the `master` branch.
  ```shell
  git add .
  git commit -m "<reasonable comment>"
  git push
  ```
  Shortly after that `github-actions` will generate the website and push it to the `gh-pages` branch of the main repository, which will be accessible from the web.
