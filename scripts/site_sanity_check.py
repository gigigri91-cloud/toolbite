#!/usr/bin/env python3
"""ToolBite static-site sanity checks.

Run from repo root:
    python3 scripts/site_sanity_check.py
"""

from __future__ import annotations

import pathlib
import re
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.rglob("*.html"))
TOOL_FILES = sorted((ROOT / "tools").glob("*.html"))


CHECKS = [
    ("Tailwind CDN reintroduced", re.compile(r"cdn\.tailwindcss\.com")),
    ("Inline AdSense push in HTML", re.compile(r"adsbygoogle\s*=\s*window\.adsbygoogle")),
    ("Direct BMC widget script in HTML", re.compile(r"widget\.prod\.min\.js")),
    ("Malformed escaped closing script tag", re.compile(r"\\x3c/script>")),
]


def read_text(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8")


def collect_pattern_hits(pattern: re.Pattern[str]) -> list[tuple[pathlib.Path, int, str]]:
    hits: list[tuple[pathlib.Path, int, str]] = []
    for html_path in HTML_FILES:
        text = read_text(html_path)
        for idx, line in enumerate(text.splitlines(), start=1):
            if pattern.search(line):
                hits.append((html_path, idx, line.strip()))
    return hits


def extract_single(pattern: re.Pattern[str], text: str) -> str | None:
    match = pattern.search(text)
    return match.group(1) if match else None


def check_homepage_consistency() -> list[str]:
    issues: list[str] = []
    index_html = ROOT / "index.html"
    sitemap_xml = ROOT / "sitemap.xml"

    if not index_html.exists():
        return ["Missing index.html"]
    if not sitemap_xml.exists():
        return ["Missing sitemap.xml"]

    index_text = read_text(index_html)
    sitemap_text = read_text(sitemap_xml)

    canonical = extract_single(
        re.compile(r'<link\s+rel="canonical"\s+href="([^"]+)"', re.IGNORECASE),
        index_text,
    )
    og_url = extract_single(
        re.compile(r'<meta\s+property="og:url"\s+content="([^"]+)"', re.IGNORECASE),
        index_text,
    )
    sitemap_home = extract_single(
        re.compile(r"<url>\s*<loc>(https://toolbite\.org(?:/index\.html|/))</loc>", re.MULTILINE),
        sitemap_text,
    )

    if not canonical:
        issues.append("index.html is missing canonical tag")
    if not og_url:
        issues.append("index.html is missing og:url tag")
    if not sitemap_home:
        issues.append("sitemap.xml is missing homepage <loc>")

    if canonical and og_url and canonical != og_url:
        issues.append(f"Homepage canonical ({canonical}) != og:url ({og_url})")

    if canonical and sitemap_home:
        normalized = canonical.rstrip("/")
        normalized_sitemap = sitemap_home.rstrip("/")
        if normalized != normalized_sitemap:
            issues.append(f"Homepage canonical ({canonical}) != sitemap home ({sitemap_home})")

    return issues


def check_tool_meta_and_schema() -> list[str]:
    issues: list[str] = []
    required_patterns = [
        ("canonical", re.compile(r'<link\s+rel="canonical"\s+href="[^"]+"', re.IGNORECASE)),
        ("meta description", re.compile(r'<meta\s+name="description"\s+content="[^"]+"', re.IGNORECASE)),
        ("og:type", re.compile(r'<meta\s+property="og:type"\s+content="website"', re.IGNORECASE)),
        ("og:url", re.compile(r'<meta\s+property="og:url"\s+content="[^"]+"', re.IGNORECASE)),
        ("og:title", re.compile(r'<meta\s+property="og:title"\s+content="[^"]+"', re.IGNORECASE)),
        ("og:description", re.compile(r'<meta\s+property="og:description"\s+content="[^"]+"', re.IGNORECASE)),
        ("twitter:card", re.compile(r'<meta\s+name="twitter:card"\s+content="summary_large_image"', re.IGNORECASE)),
        ("twitter:title", re.compile(r'<meta\s+name="twitter:title"\s+content="[^"]+"', re.IGNORECASE)),
        ("twitter:description", re.compile(r'<meta\s+name="twitter:description"\s+content="[^"]+"', re.IGNORECASE)),
        ("WebApplication schema", re.compile(r'"@type"\s*:\s*"WebApplication"')),
        ("BreadcrumbList schema", re.compile(r'"@type"\s*:\s*"BreadcrumbList"')),
    ]

    for tool_path in TOOL_FILES:
        text = read_text(tool_path)
        rel = tool_path.relative_to(ROOT)
        for label, pattern in required_patterns:
            if not pattern.search(text):
                issues.append(f"{rel} is missing {label}")
        if re.search(r'"breadcrumb"\s*:\s*\{', text):
            issues.append(f"{rel} still nests breadcrumb inside WebApplication schema")
    return issues


def check_shared_structure() -> list[str]:
    issues: list[str] = []
    verification_file = ROOT / "googled245882dcee44e7c.html"

    for html_path in HTML_FILES:
        if html_path == verification_file:
            continue

        text = read_text(html_path)
        rel = html_path.relative_to(ROOT)

        if not re.search(r'<html\s+lang="en">', text, re.IGNORECASE):
            issues.append(f"{rel} is missing `<html lang=\"en\">`")

        if html_path.name == "search.html":
            if not re.search(r'<meta\s+name="robots"\s+content="noindex,\s*follow"', text, re.IGNORECASE):
                issues.append("search.html is missing noindex, follow robots meta")
            if re.search(r'<link\s+rel="canonical"', text, re.IGNORECASE):
                issues.append("search.html should not declare a canonical tag")

        if 'id="mobile-menu-button"' in text:
            if 'aria-expanded="false"' not in text:
                issues.append(f"{rel} is missing aria-expanded on mobile menu button")
            if 'aria-controls="mobile-menu"' not in text:
                issues.append(f"{rel} is missing aria-controls on mobile menu button")

    return issues


def main() -> int:
    print(f"Scanning {len(HTML_FILES)} HTML files under {ROOT}")
    print("")

    failed = False
    for label, pattern in CHECKS:
        hits = collect_pattern_hits(pattern)
        if hits:
            failed = True
            print(f"[FAIL] {label}: {len(hits)} hit(s)")
            for path, line_no, line in hits[:20]:
                rel = path.relative_to(ROOT)
                print(f"  - {rel}:{line_no} -> {line}")
            if len(hits) > 20:
                print(f"  ... and {len(hits) - 20} more")
        else:
            print(f"[OK]   {label}")
    print("")

    consistency_issues = check_homepage_consistency()
    if consistency_issues:
        failed = True
        print("[FAIL] Homepage canonical/OG/sitemap consistency")
        for issue in consistency_issues:
            print(f"  - {issue}")
    else:
        print("[OK]   Homepage canonical/OG/sitemap consistency")

    print("")
    tool_issues = check_tool_meta_and_schema()
    if tool_issues:
        failed = True
        print("[FAIL] Tool page meta/schema completeness")
        for issue in tool_issues[:30]:
            print(f"  - {issue}")
        if len(tool_issues) > 30:
            print(f"  ... and {len(tool_issues) - 30} more")
    else:
        print("[OK]   Tool page meta/schema completeness")

    print("")
    structure_issues = check_shared_structure()
    if structure_issues:
        failed = True
        print("[FAIL] Shared structural/accessibility checks")
        for issue in structure_issues[:30]:
            print(f"  - {issue}")
        if len(structure_issues) > 30:
            print(f"  ... and {len(structure_issues) - 30} more")
    else:
        print("[OK]   Shared structural/accessibility checks")

    print("")
    if failed:
        print("Sanity checks FAILED.")
        return 1
    print("Sanity checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

