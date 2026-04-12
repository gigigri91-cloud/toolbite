#!/usr/bin/env python3
"""Validate basic HTML structure for ToolBite pages.

Also checks (after stripping <script>/<style>):
- Simple heading wrappers use matching tags (e.g. no <h3>…</h2> with plain text inside).
- Inside <main>, heading level increases by at most one (no h2 → h4 jumps).

Synthetic checks for the above run on every invocation (and alone with ``--self-test``).
"""

from __future__ import annotations

from collections import Counter
from html.parser import HTMLParser
import pathlib
import re
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


def strip_non_markup_sections(html: str) -> str:
    """Remove script/style so inline templates do not affect heading checks."""
    html = re.sub(r"<script\b[^>]*>[\s\S]*?</script>", "", html, flags=re.IGNORECASE)
    html = re.sub(r"<style\b[^>]*>[\s\S]*?</style>", "", html, flags=re.IGNORECASE)
    return html


def find_mismatched_simple_heading_wrappers(html: str) -> list[tuple[int, str]]:
    """
    Headings whose inner HTML is plain text (no child tags) must open/close with the same level.
    Catches e.g. <h3 class="...">Title</h2>.
    """
    issues: list[tuple[int, str]] = []
    for m in re.finditer(
        r"<(h[1-6])(\s[^>]*)?>[^<]*</(h[1-6])>",
        html,
        flags=re.IGNORECASE,
    ):
        open_tag, close_tag = m.group(1).lower(), m.group(3).lower()
        if open_tag != close_tag:
            line = html.count("\n", 0, m.start()) + 1
            snippet = m.group(0).replace("\n", " ")[:120]
            issues.append((line, f"mismatched heading wrapper: {snippet!r}"))
    return issues


def extract_main_inner_html(html: str) -> str | None:
    m = re.search(r"<main\b[^>]*>", html, flags=re.IGNORECASE)
    if not m:
        return None
    start = m.end()
    close = re.search(r"</main\s*>", html[start:], flags=re.IGNORECASE)
    if not close:
        return None
    return html[start : start + close.start()]


def find_skipped_heading_levels_in_main(html: str) -> list[str]:
    """
    Inside <main>, flag increases of more than one heading level (e.g. h2 -> h4).
    Does not flag the first heading in main (e.g. homepage may start with h2 after hero h1).
    """
    main = extract_main_inner_html(html)
    if main is None:
        return []
    levels: list[int] = []
    for mm in re.finditer(r"<h([1-6])\b", main, flags=re.IGNORECASE):
        levels.append(int(mm.group(1)))
    out: list[str] = []
    for i in range(1, len(levels)):
        prev, cur = levels[i - 1], levels[i]
        if cur > prev and cur - prev > 1:
            out.append(f"skipped heading level in <main>: h{prev} followed by h{cur}")
    return out


def heading_helpers_self_check() -> list[str]:
    """Sanity-check heading helpers with minimal HTML strings."""
    errors: list[str] = []

    bad_mismatch = (
        "<!DOCTYPE html><html><body><main><h1>a</h1>"
        '<h3 class="x">Title</h2></main></body></html>'
    )
    if not find_mismatched_simple_heading_wrappers(strip_non_markup_sections(bad_mismatch)):
        errors.append("expected <h3>…</h2> (plain text) mismatch to be detected")

    hidden_in_script = (
        "<!DOCTYPE html><html><body><main>"
        '<script>const _ = "<h4>oops</h1>";</script>'
        "<h2>Visible</h2></main></body></html>"
    )
    if find_mismatched_simple_heading_wrappers(
        strip_non_markup_sections(hidden_in_script)
    ):
        errors.append("mismatched tags inside <script> must be ignored after strip")

    if not find_skipped_heading_levels_in_main("<main><h2>a</h2><h4>b</h4></main>"):
        errors.append("expected h2→h4 level skip in <main> to be reported")

    if not find_skipped_heading_levels_in_main("<main><h1>x</h1><h3>y</h3></main>"):
        errors.append("expected h1→h3 level skip in <main> to be reported")

    ok_outline = "<main><h2>a</h2><h3>b</h3><h2>c</h2><h3>d</h3></main>"
    if find_skipped_heading_levels_in_main(ok_outline):
        errors.append("valid h2/h3 alternation must not be reported as level skip")

    ok_down = "<main><h1>x</h1><h2>y</h2><h3>z</h3></main>"
    if find_skipped_heading_levels_in_main(ok_down):
        errors.append("valid h1→h2→h3 chain must not be reported as level skip")

    return errors


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

    hc = heading_helpers_self_check()
    if hc:
        print("Heading helper self-check FAILED:")
        for msg in hc:
            print(f"- {msg}")
        return 1

    for html_path in HTML_FILES:
        if html_path == VERIFICATION_FILE:
            continue
        if "templates" in html_path.parts:
            continue

        parser = StructureParser()
        text = read_text(html_path)
        parser.feed(text)
        rel = html_path.relative_to(ROOT)
        family = get_page_family(html_path)

        stripped = strip_non_markup_sections(text)
        for line_no, msg in find_mismatched_simple_heading_wrappers(stripped):
            issues.append(f"{rel} line {line_no}: {msg}")
        for msg in find_skipped_heading_levels_in_main(stripped):
            issues.append(f"{rel}: {msg}")

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

    validated = [
        p
        for p in HTML_FILES
        if p != VERIFICATION_FILE and "templates" not in p.parts
    ]
    print(f"HTML structure validation passed across {len(validated)} content HTML files.")
    return 0


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--self-test":
        errs = heading_helpers_self_check()
        if errs:
            print("Heading helper self-check FAILED:")
            for msg in errs:
                print(f"- {msg}")
            sys.exit(1)
        print("Heading helper self-check OK.")
        sys.exit(0)
    sys.exit(main())
