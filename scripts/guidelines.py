import requests
import argparse
import os
import re


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate coding guidelines from the CODEGUIDE.md file in the repository"
    )
    parser.add_argument(
        "--branch",
        default="master",
        type=str,
        help="Git branch to use for fetching the CODEGUIDE.md file",
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
        default=os.path.join(cwd, "..", "docs", "assets", "imported"),
        type=str,
        help="Directory to save the imported guidelines",
    )
    args = parser.parse_args()

    readme_content = None
    if args.file is not None:
        with open(args.file, 'r') as f:
            readme_content = "".join(f.readlines())
    else:
        entity_url = f"https://raw.githubusercontent.com/entity-toolkit/entity/refs/heads/{args.branch}"

        response = requests.get(f"{entity_url}/CODEGUIDE.md")
        if response.status_code != 200:
            raise FileNotFoundError(f"File CODEGUIDE.md not found in branch {args.branch}")

        readme_content = response.text

    if readme_content is None:
        raise Exception("Unable to fetch the guidelines")

    with open(os.path.join(args.output, "code-guidelines.md"), "w") as f:
        readme_content = readme_content[readme_content.index("## Testing") :].strip()
        readme_content = re.sub("^### ", "#### ", readme_content)
        readme_content = readme_content.replace("## ", "### ")
        readme_content = readme_content.replace("    *", "      *")
        readme_content = readme_content.replace("  *", "    *")
        f.write(readme_content)
