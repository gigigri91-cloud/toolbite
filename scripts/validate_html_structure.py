#!/usr/bin/env python3
"""Validate basic HTML structure for ToolBite pages."""

from __future__ import annotations

from collections import Counter
from html.parser import HTMLParser
import pathlib
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.rglob("*.html"))
VERIFICATION_FILE = ROOT / "googled245882dcee44e7c.html"


class StructureParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tag_counts: Counter[str] = Counter()
        self.ids: list[tuple[str, int]] = []
        self.meta_description_count = 0
        self.canonical_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.tag_counts[tag] += 1
        attr_map = dict(attrs)

        if "id" in attr_map and attr_map["id"]:
            self.ids.append((attr_map["id"], self.getpos()[0]))

        if tag == "meta" and (attr_map.get("name") or "").lower() == "description":
            self.meta_description_count += 1

        if tag == "link" and (attr_map.get("rel") or "").lower() == "canonical":
            self.canonical_count += 1


def read_text(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8")


def main() -> int:
    issues: list[str] = []

    for html_path in HTML_FILES:
        if html_path == VERIFICATION_FILE:
            continue

        parser = StructureParser()
        parser.feed(read_text(html_path))
        rel = html_path.relative_to(ROOT)

        if parser.tag_counts["title"] != 1:
            issues.append(f"{rel} should contain exactly 1 <title> (found {parser.tag_counts['title']})")
        if parser.meta_description_count != 1:
            issues.append(f"{rel} should contain exactly 1 meta description (found {parser.meta_description_count})")
        if parser.tag_counts["main"] != 1:
            issues.append(f"{rel} should contain exactly 1 <main> (found {parser.tag_counts['main']})")
        if parser.tag_counts["h1"] != 1:
            issues.append(f"{rel} should contain exactly 1 <h1> (found {parser.tag_counts['h1']})")

        if html_path.name == "search.html":
            if parser.canonical_count != 0:
                issues.append("search.html should not include a canonical link")
        else:
            if parser.canonical_count != 1:
                issues.append(f"{rel} should contain exactly 1 canonical link (found {parser.canonical_count})")

        id_counts = Counter(id_value for id_value, _line in parser.ids)
        for id_value, count in sorted(id_counts.items()):
            if count > 1:
                issues.append(f"{rel} has duplicate id `{id_value}` ({count} occurrences)")

    if issues:
        print(f"HTML structure validation FAILED ({len(issues)} issue(s)):")
        for issue in issues[:50]:
            print(f"- {issue}")
        if len(issues) > 50:
            print(f"... and {len(issues) - 50} more")
        return 1

    print(f"HTML structure validation passed across {len(HTML_FILES) - 1} content HTML files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
