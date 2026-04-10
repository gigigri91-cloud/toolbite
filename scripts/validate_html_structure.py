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
        self.robots_values: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.tag_counts[tag] += 1
        attr_map = dict(attrs)

        if "id" in attr_map and attr_map["id"]:
            self.ids.append((attr_map["id"], self.getpos()[0]))

        if tag == "meta" and (attr_map.get("name") or "").lower() == "description":
            self.meta_description_count += 1

        if tag == "meta" and (attr_map.get("name") or "").lower() == "robots":
            content = attr_map.get("content")
            if content:
                self.robots_values.append(content.strip())

        if tag == "link" and (attr_map.get("rel") or "").lower() == "canonical":
            self.canonical_count += 1


def read_text(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8")


def get_page_family(html_path: pathlib.Path) -> str:
    rel = html_path.relative_to(ROOT)

    if html_path == ROOT / "index.html":
        return "homepage"
    if html_path == ROOT / "search.html":
        return "search"
    if html_path.parent == ROOT / "categories":
        return "category"
    if html_path.parent == ROOT / "tools":
        return "tool"
    if html_path.parent == ROOT / "guides":
        if html_path.name == "index.html":
            return "guide-index"
        return "guide-article"
    if html_path.name in {"about.html", "contact.html", "privacy.html", "terms.html"}:
        return "root-info"
    return f"other:{rel}"


def main() -> int:
    issues: list[str] = []

    for html_path in HTML_FILES:
        if html_path == VERIFICATION_FILE:
            continue

        parser = StructureParser()
        text = read_text(html_path)
        parser.feed(text)
        rel = html_path.relative_to(ROOT)
        family = get_page_family(html_path)

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

        has_breadcrumb_nav = 'aria-label="Breadcrumb"' in text
        has_breadcrumb_schema = '"@type":"BreadcrumbList"' in text or '"@type": "BreadcrumbList"' in text
        robots_joined = " | ".join(parser.robots_values).lower()

        if family in {"category", "tool", "guide-index", "guide-article", "root-info"}:
            if not has_breadcrumb_nav:
                issues.append(f"{rel} should include visible breadcrumb navigation for the `{family}` page family")
            if not has_breadcrumb_schema:
                issues.append(f"{rel} should include BreadcrumbList schema for the `{family}` page family")

        if family == "category":
            if '"@type":"CollectionPage"' not in text and '"@type": "CollectionPage"' not in text:
                issues.append(f"{rel} should include CollectionPage schema")

        if family == "tool":
            if '"@type":"WebApplication"' not in text and '"@type": "WebApplication"' not in text:
                issues.append(f"{rel} should include WebApplication schema")

        if family == "guide-index":
            if '"@type":"CollectionPage"' not in text and '"@type": "CollectionPage"' not in text:
                issues.append(f"{rel} should include CollectionPage schema")

        if family == "guide-article":
            if '"@type":"Article"' not in text and '"@type": "Article"' not in text:
                issues.append(f"{rel} should include Article schema")

        if family == "search":
            if "noindex" not in robots_joined:
                issues.append("search.html should include a noindex robots meta tag")

        if html_path.name in {"contact.html", "privacy.html", "terms.html"}:
            if "noindex" not in robots_joined:
                issues.append(f"{rel} should include a noindex robots meta tag")

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
