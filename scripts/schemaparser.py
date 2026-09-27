import json

import toml2html as t2h


def resolve(node: dict, defs: dict) -> dict:
    """Follow `$ref`, keeping sibling keywords (2020-12 allows them)."""
    while "$ref" in node:
        target = defs[node["$ref"].rsplit("/", 1)[-1]]
        merged = dict(target)
        merged.update({k: v for k, v in node.items() if k != "$ref"})
        node = merged
    return node


def is_table(node: dict, defs: dict) -> bool:
    """True for a TOML table or an array of tables, False for a plain value."""
    if node.get("type") == "object" or "properties" in node:
        return True
    items = node.get("items")
    if node.get("type") == "array" and isinstance(items, dict):
        return resolve(items, defs).get("type") == "object"
    return False


def toml_value(value) -> str:
    """Render a JSON default as the TOML literal the template would have shown."""
    if isinstance(value, bool):  # before int -- bool is an int subclass
        return "true" if value else "false"
    if isinstance(value, str):
        return json.dumps(value)
    if isinstance(value, (int, float)):
        return repr(value)
    if isinstance(value, list):
        return "[" + ", ".join(toml_value(v) for v in value) + "]"
    return str(value)


def schema_enum(node: dict, defs: dict) -> list | None:
    """First real `enum` reachable through anyOf/oneOf/items (arrays of enums)."""
    if "enum" in node:
        return node["enum"]
    for branch in ("anyOf", "oneOf"):
        for sub in node.get(branch, []):
            found = schema_enum(resolve(sub, defs), defs)
            if found:
                return found
    items = node.get("items")
    if isinstance(items, dict):
        return schema_enum(resolve(items, defs), defs)
    return None


def format_enum(values: list) -> str:
    """Join enum values the way the `@enum:` line did.

    An `x-entity.enum` entry that already carries quotes or spaces is documentation prose
    (the CMasher colormap aside, the per-value projection explanations) and is passed
    through untouched; a bare token is quoted so it reads as the literal you would type.
    """
    out = []
    for v in values:
        if isinstance(v, str) and ('"' in v or " " in v):
            out.append(v)
        else:
            out.append(toml_value(v))
    return ", ".join(out)


def join(path: str, name: str) -> str:
    return f"{path}.{name}" if path else name


class SchemaTree(t2h.Tree):
    def from_schema(self, schema: dict):
        self._defs = schema.get("$defs", {})
        self._walk(schema, "")

    def from_text(self, text: str):
        self.from_schema(json.loads(text))

    def _walk(self, node: dict, path: str):
        props = node.get("properties") or {}
        required = set(node.get("required") or [])

        keys, tables = [], []
        for name, raw in props.items():
            entry = (name, resolve(raw, self._defs))
            (tables if is_table(entry[1], self._defs) else keys).append(entry)

        # ... scalar keys first, ...
        for name, sub in keys:
            self.add_node(join(path, name), self._key_attrs(sub, name in required))

        # ... then the quantities the code infers rather than reads, ...
        for entry in (node.get("x-entity") or {}).get("inferred", []):
            self.add_node(join(path, entry["name"]), self._inferred_attrs(entry))

        # ... then the sub-tables, matching the order of the generated template
        for name, sub in tables:
            child = join(path, name)
            # the table's own row is created first, so it carries its description/notes
            # rather than inheriting `None`; this also covers a table with nothing inside
            # it ([setup], whose keys belong to the problem generator)
            self.add_node(child, self._table_attrs(sub))
            items = sub.get("items")
            body = resolve(items, self._defs) if isinstance(items, dict) else sub
            self._walk(body, child)

    def _key_attrs(self, node: dict, required: bool) -> dict[str, str | bool]:
        xe = node.get("x-entity") or {}
        attrs: dict[str, str | bool] = {}

        if node.get("description"):
            attrs["description"] = node["description"]
        if required:
            attrs["required"] = True
        if xe.get("type"):
            attrs["type"] = xe["type"]

        default = xe.get("default")
        if default is None and "default" in node:
            default = toml_value(node["default"])
        if default is not None:
            attrs["default"] = default

        values = xe.get("enum") or schema_enum(node, self._defs)
        if values:
            attrs["enum"] = format_enum(values)

        if xe.get("notes"):
            attrs["note"] = "\n".join(xe["notes"])
        if xe.get("examples"):
            attrs["example"] = "\n".join(xe["examples"])

        return attrs

    def _inferred_attrs(self, entry: dict) -> dict[str, str | bool]:
        attrs: dict[str, str | bool] = {"inferred": True}
        for tag in ("brief", "type", "from", "value"):
            if entry.get(tag):
                attrs[tag] = str(entry[tag])
        if entry.get("enum"):
            attrs["enum"] = format_enum(entry["enum"])
        return attrs

    def _table_attrs(self, node: dict) -> dict[str, str | bool]:
        attrs: dict[str, str | bool] = {}
        if node.get("description"):
            attrs["description"] = node["description"]
        if (node.get("x-entity") or {}).get("notes"):
            attrs["note"] = "\n".join(node["x-entity"]["notes"])
        return attrs
