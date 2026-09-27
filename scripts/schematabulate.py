import requests
import schemaparser as sp
import argparse
import os

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Fetch and parse the input JSON Schema from GitHub"
    )
    parser.add_argument(
        "--branch",
        type=str,
        default="master",
        help="Branch name to fetch the schema from",
    )
    parser.add_argument(
        "--file",
        type=str,
        default=None,
        help="Use a local file instead of pulling from a branch",
    )
    cwd = os.path.dirname(os.path.abspath(__file__))

    parser.add_argument(
        "--output",
        type=str,
        default=os.path.join(cwd, "..", "docs", "assets", "meta"),
        help="Output HTML file path",
    )
    args = parser.parse_args()

    if args.file is not None:
        with open(args.file, 'r') as f:
            content = "\n".join(f.readlines())
    else:
        url = f"https://raw.githubusercontent.com/entity-toolkit/entity/refs/heads/{args.branch}/entity.schema.json"
        response = requests.get(url)

        content = None
        if response.status_code == 200:
            content = response.content.decode("utf-8")
        else:
            raise Exception(
                f"Failed to fetch the schema from {url}. Status code: {response.status_code}"
            )

    if content is None:
        raise Exception("Was unable to fetch the content of the file")
    tree = sp.SchemaTree()
    tree.from_text(content)
    tree.export_html(os.path.join(args.output, "input-table.html"))
