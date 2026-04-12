#!/usr/bin/env python3
"""
One-shot semantic HTML improvements for ToolBite static pages.
Run from repo root: python3 scripts/apply_semantic_html.py [--dry-run]
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TOOL_PROSE_OPEN = (
    '<article class="prose max-w-none text-gray-700 bg-white p-8 '
    'rounded-3xl border border-gray-100 shadow-sm">'
)
TOOL_PROSE_SECTION_OPEN = (
    '<section class="prose max-w-none text-gray-700 bg-white p-8 rounded-3xl '
    'border border-gray-100 shadow-sm tb-seo-notes" aria-label="About this tool">'
)

SKIP_SNIPPET = '  <a href="#main-content" class="skip-link">Skip to main content</a>\n'

BREADCRUMB_CLASS = "tb-breadcrumb "


def ensure_skip_link(html: str) -> str:
    if "skip-link" in html or 'href="#main-content"' in html:
        return html
    m = re.search(r"<body[^>]*>", html, re.IGNORECASE)
    if not m:
        return html
    insert_at = m.end()
    return html[:insert_at] + "\n" + SKIP_SNIPPET + html[insert_at:]


def ensure_main_id(html: str) -> str:
    if 'id="main-content"' in html:
        return html

    def repl(m: re.Match[str]) -> str:
        inner = m.group(1)
        if inner.strip().startswith("id="):
            return m.group(0)
        return f'<main id="main-content"{inner}>'

    return re.sub(r"<main(\s[^>]*)>", repl, html, count=1, flags=re.IGNORECASE)


def add_breadcrumb_class(html: str) -> str:
    if "tb-breadcrumb" in html:
        return html

    def nav_repl(m: re.Match[str]) -> str:
        cls = m.group(1)
        if cls.startswith("tb-breadcrumb"):
            return m.group(0)
        return f'<nav class="{BREADCRUMB_CLASS}{cls}" aria-label="Breadcrumb"'

    html = re.sub(
        r'<nav class="([^"]+)"\s+aria-label="Breadcrumb"',
        nav_repl,
        html,
    )
    return html


def convert_tool_prose_block(html: str) -> str:
    if TOOL_PROSE_OPEN not in html:
        return html
    start = html.find(TOOL_PROSE_OPEN)
    if start == -1:
        return html
    html = html.replace(TOOL_PROSE_OPEN, TOOL_PROSE_SECTION_OPEN, 1)
    start = html.find(TOOL_PROSE_SECTION_OPEN)
    end = html.find("</article>", start)
    if end == -1:
        raise ValueError("Expected </article> closing prose block")
    inner = html[start + len(TOOL_PROSE_SECTION_OPEN) : end]
    if "<article" in inner:
        raise ValueError("Nested <article> inside prose block")
    return html[:end] + "</section>" + html[end + len("</article>") :]


def wrap_tool_primary_column(html: str) -> str:
    marker = '<div class="lg:col-span-2">'
    if marker not in html:
        return html
    if "tb-tool-primary" in html:
        return html
    html = html.replace(
        marker,
        '<article class="tb-tool-primary min-w-0 lg:col-span-2">',
        1,
    )
    # Close the primary column: last </div> immediately before <aside class="space-y-6">
    html = re.sub(
        r"</div>\s*<aside class=\"space-y-6\">",
        "</article>\n    <aside class=\"space-y-6\">",
        html,
        count=1,
    )
    return html


def aside_sr_only_and_demote_h2(html: str) -> str:
    """Add sr-only heading in aside when it has content; demote visible h2 to h3."""
    if "<aside class=\"space-y-6\">" not in html:
        return html
    # Empty aside (e.g. lorem-ipsum): skip
    if re.search(
        r'<aside class="space-y-6">\s*</aside>',
        html,
    ):
        return html
    if 'id="tb-tool-aside-heading"' in html:
        return html
    html = html.replace(
        '<aside class="space-y-6">',
        '<aside class="space-y-6" aria-labelledby="tb-tool-aside-heading">\n'
        '      <h2 id="tb-tool-aside-heading" class="sr-only">Related links and tips</h2>',
        1,
    )
    html = html.replace(
        '<h2 class="text-lg font-bold text-gray-900 mb-4">',
        '<h3 class="text-lg font-bold text-gray-900 mb-4">',
    )
    html = re.sub(
        r'(<h3 class="text-lg font-bold text-gray-900 mb-4">[^<]+)</h2>',
        r"\1</h3>",
        html,
    )
    return html


def category_tools_section(html: str) -> str:
    if 'id="category-tools-grid"' not in html:
        return html
    if 'id="category-tools-heading"' in html:
        return html
    open_re = re.compile(
        r'(\s*)<div id="category-tools-grid" class="(grid grid-cols-1 sm:grid-cols-2 '
        r'lg:grid-cols-3 gap-6 mb-12)">'
    )
    m = open_re.search(html)
    if not m:
        return html
    indent = m.group(1)
    grid_cls = m.group(2)
    replacement = (
        f'{indent}<section id="category-tools" '
        f'aria-labelledby="category-tools-heading" class="mb-12">\n'
        f'{indent}  <h2 id="category-tools-heading" class="sr-only">'
        f"Tools in this category</h2>\n"
        f'{indent}  <div id="category-tools-grid" class="{grid_cls}">'
    )
    html = open_re.sub(replacement, html, count=1)
    return _close_category_tools_wrapper(html, indent)


def _close_category_tools_wrapper(html: str, indent: str) -> str:
    """Insert </section> after the matching close of #category-tools-grid."""
    token = '<div id="category-tools-grid" class="'
    start = html.find(token)
    if start == -1:
        return html
    inner = html.find(">", start) + 1
    depth = 1
    pos = inner
    end_close = -1
    while pos < len(html) and depth > 0:
        next_open = html.find("<div", pos)
        next_close = html.find("</div>", pos)
        if next_close == -1:
            raise ValueError("Unclosed category-tools-grid div")
        if next_open != -1 and next_open < next_close:
            depth += 1
            pos = next_open + 4
        else:
            depth -= 1
            end_close = next_close + len("</div>")
            pos = end_close
    if end_close < 0:
        return html
    rest = html[end_close:]
    m = re.match(
        r"(\s*)<section class=\"mb-10 bg-white rounded-3xl border border-gray-100 "
        r'shadow-sm p-6 md:p-8">',
        rest,
    )
    if not m:
        raise ValueError("category-tools-grid not followed by expected guides section")
    return html[:end_close] + "\n" + indent + "</section>\n\n" + rest[m.start() :]


def category_card_h2_to_h3(html: str) -> str:
    html = html.replace(
        '<h2 class="font-bold text-gray-900 text-lg">',
        '<h3 class="font-bold text-gray-900 text-lg">',
    )
    # Fix closing tags after opening-tag replacement.
    return re.sub(
        r'(<h3 class="font-bold text-gray-900 text-lg">[^<]+)</h2>',
        r"\1</h3>",
        html,
    )


def guides_index_library(html: str, path: Path) -> str:
    if path.name != "index.html" or "guides" not in path.parts:
        return html
    if 'id="guides-library-heading"' in html:
        return html
    old = """    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <a href="json-formatter-guide.html\""""
    if old not in html:
        return html
    new = """    <section class="mb-8" aria-labelledby="guides-library-heading">
      <h2 id="guides-library-heading" class="text-2xl font-bold text-gray-900 mb-6">Guide articles</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <a href="json-formatter-guide.html\""""
    html = html.replace(old, new, 1)
    # Close before </main>: last `</div>` before `  </main>` that closes grid — fragile; use unique tail
    tail = """      </a>
    </div>
  </main>"""
    if tail not in html:
        return html
    html = html.replace(
        tail,
        """      </a>
      </div>
    </section>
  </main>""",
        1,
    )
    # Card titles: h2 -> h3 inside that grid only — replace first three h2 text-2xl in file after guides-library
    html = html.replace(
        '<h2 class="text-2xl font-bold text-gray-900 mb-2">Fix Invalid JSON Fast</h2>',
        '<h3 class="text-2xl font-bold text-gray-900 mb-2">Fix Invalid JSON Fast</h3>',
        1,
    )
    html = html.replace(
        '<h2 class="text-2xl font-bold text-gray-900 mb-2">Decode JWT Safely</h2>',
        '<h3 class="text-2xl font-bold text-gray-900 mb-2">Decode JWT Safely</h3>',
        1,
    )
    html = html.replace(
        '<h2 class="text-2xl font-bold text-gray-900 mb-2">SEO Slug Best Practices</h2>',
        '<h3 class="text-2xl font-bold text-gray-900 mb-2">SEO Slug Best Practices</h3>',
        1,
    )
    return html


def footer_links_nav(html: str) -> str:
    if 'aria-label="Footer"' in html:
        return html
    return re.sub(
        r'<div class="space-x-4 text-sm font-medium">([\s\S]*?)</div>\s*</div>\s*</footer>',
        r'<nav class="space-x-4 text-sm font-medium" aria-label="Footer">\1</nav>\n    </div>\n  </footer>',
        html,
        count=1,
    )


def process_file(path: Path, dry: bool) -> bool:
    raw = path.read_text(encoding="utf-8")
    html = raw
    rel = path.relative_to(ROOT)

    html = ensure_skip_link(html)
    html = ensure_main_id(html)
    html = add_breadcrumb_class(html)

    if "tools/" in str(rel).replace("\\", "/"):
        html = convert_tool_prose_block(html)
        html = wrap_tool_primary_column(html)
        html = aside_sr_only_and_demote_h2(html)

    if "categories/" in str(rel).replace("\\", "/"):
        html = category_tools_section(html)
        html = category_card_h2_to_h3(html)

    if str(rel).endswith("guides/index.html"):
        html = guides_index_library(html, path)

    html = footer_links_nav(html)

    if html != raw:
        if not dry:
            path.write_text(html, encoding="utf-8")
        print(f"{'[dry] ' if dry else ''}updated {rel}")
        return True
    return False


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    changed = 0
    for path in sorted(ROOT.rglob("*.html")):
        if "googled" in path.name:
            continue
        if process_file(path, args.dry_run):
            changed += 1
    print(f"Done. {changed} file(s) {'would be ' if args.dry_run else ''}modified.")
    sys.exit(0)


if __name__ == "__main__":
    main()
