#!/usr/bin/env python3
"""Validate internal links, asset paths, and local anchors for ToolBite."""

from __future__ import annotations

from dataclasses import dataclass
from html.parser import HTMLParser
import pathlib
import re
import sys
from urllib.parse import urlparse


ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.rglob("*.html"))
ATTRS_TO_CHECK = {
    "a": ("href",),
    "link": ("href",),
    "script": ("src",),
    "img": ("src",),
    "form": ("action",),
}
SKIP_PREFIXES = ("mailto:", "tel:", "javascript:", "data:")


@dataclass
class Ref:
    tag: str
    attr: str
    value: str
    line: int


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.refs: list[Ref] = []
        self.ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = dict(attrs)
        if "id" in attr_map and attr_map["id"]:
            self.ids.add(attr_map["id"])
        for attr in ATTRS_TO_CHECK.get(tag, ()):
            value = attr_map.get(attr)
            if value:
                self.refs.append(Ref(tag=tag, attr=attr, value=value, line=self.getpos()[0]))


def read_text(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8")


def parse_file(path: pathlib.Path) -> tuple[list[Ref], set[str]]:
    parser = LinkParser()
    parser.feed(read_text(path))
    return parser.refs, parser.ids


def is_external(value: str) -> bool:
    if value.startswith(SKIP_PREFIXES) or value.startswith("//"):
        return True
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"}


def resolve_target(source_file: pathlib.Path, value: str) -> tuple[pathlib.Path | None, str | None]:
    clean = value.strip()
    if not clean or is_external(clean):
        return None, None

    if clean.startswith("#"):
        return source_file, clean[1:] or None

    parsed = urlparse(clean)
    fragment = parsed.fragment or None
    path_part = parsed.path

    if not path_part:
        return source_file, fragment

    if path_part.startswith("/"):
        target = ROOT / path_part.lstrip("/")
    else:
        target = (source_file.parent / path_part).resolve()

    return target, fragment


def main() -> int:
    ids_cache: dict[pathlib.Path, set[str]] = {}
    errors: list[str] = []

    for html_file in HTML_FILES:
        refs, ids = parse_file(html_file)
        ids_cache[html_file.resolve()] = ids

        for ref in refs:
            target, fragment = resolve_target(html_file.resolve(), ref.value)
            if target is None:
                continue

            if not target.exists():
                rel = html_file.relative_to(ROOT)
                errors.append(
                    f"{rel}:{ref.line} -> missing target for {ref.tag}[{ref.attr}]={ref.value}"
                )
                continue

            if fragment:
                target_resolved = target.resolve()
                if target_resolved.suffix == ".html":
                    target_ids = ids_cache.get(target_resolved)
                    if target_ids is None:
                        _, target_ids = parse_file(target_resolved)
                        ids_cache[target_resolved] = target_ids
                    if fragment not in target_ids:
                        rel = html_file.relative_to(ROOT)
                        target_rel = target_resolved.relative_to(ROOT)
                        errors.append(
                            f"{rel}:{ref.line} -> missing anchor #{fragment} in {target_rel}"
                        )

    if errors:
        print(f"Internal link checks FAILED ({len(errors)} issue(s)):")
        for issue in errors[:50]:
            print(f"- {issue}")
        if len(errors) > 50:
            print(f"... and {len(errors) - 50} more")
        return 1

    print(f"Internal link checks passed across {len(HTML_FILES)} HTML files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
