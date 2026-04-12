#!/usr/bin/env python3
"""
Apply the standard ToolBite tool-page block order inside <article class="tb-tool-primary">:

1. Hero (compact) + 2. UI unchanged
3. How to use  4. Use cases  5. FAQ (visible <details>, mirrors FAQPage when present)
6. Related tools  7. Guides  8. Browse category
→ then existing tb-seo-notes (long SEO prose)

Run from repo root: python3 scripts/standardize_tool_pages.py [--dry-run]
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAYOUT_PATH = ROOT / "data" / "tool_page_layout.json"

CATEGORY_LABEL = {
    "text-tools": "Text &amp; content tools",
    "developer-tools": "Developer &amp; debugging tools",
    "image-tools": "Image &amp; media tools",
    "seo-tools": "SEO &amp; content tools",
}

# Two related tools each: (file under tools/, title, subtitle, emoji)
RELATED: dict[str, list[tuple[str, str, str, str]]] = {
    "tools/word-counter.html": [
        ("find-replace.html", "Find &amp; Replace", "Bulk text edits", "🔁"),
        ("remove-extra-spaces.html", "Remove Extra Spaces", "Normalize whitespace", "🧹"),
    ],
    "tools/password-generator.html": [
        ("hash-generator.html", "Hash Generator", "Local SHA digests", "🔢"),
        ("uuid-generator.html", "UUID Generator", "Random IDs for setup", "🆔"),
    ],
    "tools/json-formatter.html": [
        ("jwt-decoder.html", "JWT Decoder", "Inspect token JSON", "🪪"),
        ("base64-encoder.html", "Base64 Encoder", "Encode or decode strings", "📎"),
    ],
    "tools/find-replace.html": [
        ("word-counter.html", "Word Counter", "Count words &amp; characters", "📝"),
        ("remove-extra-spaces.html", "Remove Extra Spaces", "Tidy pasted copy", "🧹"),
    ],
    "tools/lorem-ipsum.html": [
        ("word-counter.html", "Word Counter", "Measure real drafts", "📝"),
        ("find-replace.html", "Find &amp; Replace", "Swap placeholder names", "🔁"),
    ],
    "tools/remove-extra-spaces.html": [
        ("find-replace.html", "Find &amp; Replace", "Bulk phrase fixes", "🔁"),
        ("case-converter.html", "Case Converter", "Normalize capitalization", "🔠"),
    ],
    "tools/image-compressor.html": [
        ("read-time-calculator.html", "Read time calculator", "Pair images with article length", "⏱️"),
        ("text-to-slug.html", "Text to Slug", "Clean URLs for posts", "🔗"),
    ],
    "tools/color-palette-generator.html": [
        ("image-compressor.html", "Image compressor", "Lighten assets for the web", "🖼️"),
        ("hash-generator.html", "Hash Generator", "Fingerprints for strings", "🔢"),
    ],
    "tools/case-converter.html": [
        ("text-to-slug.html", "Text to Slug", "URL-friendly strings", "🔗"),
        ("word-counter.html", "Word Counter", "Count words &amp; characters", "📝"),
    ],
    "tools/text-to-slug.html": [
        ("read-time-calculator.html", "Read time calculator", "Estimate article length", "⏱️"),
        ("word-counter.html", "Word Counter", "Check copy length", "📝"),
    ],
    "tools/read-time-calculator.html": [
        ("word-counter.html", "Word Counter", "Source word counts", "📝"),
        ("text-to-slug.html", "Text to Slug", "Publishing-friendly URLs", "🔗"),
    ],
    "tools/base64-encoder.html": [
        ("json-formatter.html", "JSON Formatter", "Format nested JSON", "💻"),
        ("url-encoder.html", "URL Encoder", "Encode query values", "🔗"),
    ],
    "tools/uuid-generator.html": [
        ("hash-generator.html", "Hash Generator", "Digest strings locally", "🔢"),
        ("password-generator.html", "Password Generator", "Strong random strings", "🔑"),
    ],
    "tools/url-encoder.html": [
        ("base64-encoder.html", "Base64 Encoder", "Binary-safe text", "📎"),
        ("json-formatter.html", "JSON Formatter", "Validate payloads", "💻"),
    ],
    "tools/hash-generator.html": [
        ("base64-encoder.html", "Base64 Encoder", "Encode decoded bytes", "📎"),
        ("uuid-generator.html", "UUID Generator", "Unique identifiers", "🆔"),
    ],
    "tools/jwt-decoder.html": [
        ("json-formatter.html", "JSON Formatter", "Pretty-print claims", "💻"),
        ("base64-encoder.html", "Base64 Encoder", "Work with raw segments", "📎"),
    ],
    "tools/remove-duplicate-lines.html": [
        ("sort-text-lines.html", "Sort Text Lines", "Alphabetize lists", "🔤"),
        ("find-replace.html", "Find &amp; Replace", "Bulk cleanup", "🔁"),
    ],
    "tools/sort-text-lines.html": [
        ("remove-duplicate-lines.html", "Remove Duplicate Lines", "Dedupe first", "📋"),
        ("case-converter.html", "Case Converter", "Normalize casing", "🔠"),
    ],
}

GUIDES: dict[str, list[tuple[str, str, str]]] = {
    "tools/word-counter.html": [
        ("../guides/index.html", "All ToolBite guides", "JSON, JWT &amp; SEO tutorials."),
        ("../guides/seo-slug-best-practices.html", "SEO slug best practices", "Cleaner URLs for publishing."),
    ],
    "tools/password-generator.html": [
        ("../guides/index.html", "All ToolBite guides", "Browse tutorials tied to tools."),
        ("../guides/jwt-decoder-guide.html", "JWT decode vs verify", "Security context for auth work."),
    ],
    "tools/json-formatter.html": [
        ("../guides/json-formatter-guide.html", "Invalid JSON checklist", "Trailing commas, quotes, and fixes."),
        ("../guides/index.html", "All ToolBite guides", "More browser-first workflows."),
    ],
    "tools/find-replace.html": [
        ("../guides/index.html", "All ToolBite guides", "Continue into JSON, JWT &amp; SEO."),
        ("../guides/seo-slug-best-practices.html", "SEO slug best practices", "After text cleanup, tighten URLs."),
    ],
    "tools/lorem-ipsum.html": [
        ("../guides/index.html", "All ToolBite guides", "Tutorials for publishing stacks."),
        ("../guides/seo-slug-best-practices.html", "SEO slug best practices", "When you swap in real headlines."),
    ],
    "tools/remove-extra-spaces.html": [
        ("../guides/index.html", "All ToolBite guides", "Browse all tutorials."),
        ("../guides/seo-slug-best-practices.html", "SEO slug best practices", "Pair cleanup with URL work."),
    ],
    "tools/image-compressor.html": [
        ("../guides/index.html", "All ToolBite guides", "Publishing and media tips."),
        ("../guides/seo-slug-best-practices.html", "SEO slug best practices", "Light pages, clean URLs."),
    ],
    "tools/color-palette-generator.html": [
        ("../guides/index.html", "All ToolBite guides", "Design-adjacent dev tutorials."),
    ],
    "tools/case-converter.html": [
        ("../guides/seo-slug-best-practices.html", "SEO slug best practices", "After fixing headline case."),
        ("../guides/index.html", "All ToolBite guides", "Full library of guides."),
    ],
    "tools/text-to-slug.html": [
        ("../guides/seo-slug-best-practices.html", "SEO slug best practices", "Deep dive on URL slugs."),
        ("../guides/index.html", "All ToolBite guides", "More SEO and dev topics."),
    ],
    "tools/read-time-calculator.html": [
        ("../guides/seo-slug-best-practices.html", "SEO slug best practices", "Publishing checklist."),
        ("../guides/index.html", "All ToolBite guides", "Browse all guides."),
    ],
    "tools/base64-encoder.html": [
        ("../guides/json-formatter-guide.html", "JSON troubleshooting", "Payloads near encoding work."),
        ("../guides/index.html", "All ToolBite guides", "JWT and SEO guides too."),
    ],
    "tools/uuid-generator.html": [
        ("../guides/json-formatter-guide.html", "JSON checklist", "IDs inside JSON payloads."),
        ("../guides/index.html", "All ToolBite guides", "Browse tutorials."),
    ],
    "tools/url-encoder.html": [
        ("../guides/json-formatter-guide.html", "JSON checklist", "URLs inside JSON."),
        ("../guides/index.html", "All ToolBite guides", "More developer topics."),
    ],
    "tools/hash-generator.html": [
        ("../guides/json-formatter-guide.html", "JSON checklist", "Compare payloads with hashes."),
        ("../guides/index.html", "All ToolBite guides", "Browse all guides."),
    ],
    "tools/jwt-decoder.html": [
        ("../guides/jwt-decoder-guide.html", "JWT decode vs verify", "Production-safe practices."),
        ("../guides/json-formatter-guide.html", "Invalid JSON checklist", "Claims are JSON too."),
    ],
    "tools/remove-duplicate-lines.html": [
        ("../guides/index.html", "All ToolBite guides", "Text and SEO tutorials."),
        ("../guides/seo-slug-best-practices.html", "SEO slug best practices", "Lists before publishing."),
    ],
    "tools/sort-text-lines.html": [
        ("../guides/index.html", "All ToolBite guides", "JSON, JWT &amp; SEO."),
        ("../guides/seo-slug-best-practices.html", "SEO slug best practices", "Ordered keyword lists."),
    ],
}


def default_faq(tool_title: str) -> list[tuple[str, str]]:
    t = tool_title or "this tool"
    return [
        (
            f"Is my data sent to ToolBite servers when I use {t}?",
            "No. Routine processing runs in your browser after the page loads; we do not upload your inputs for processing.",
        ),
        (
            "Does it work offline?",
            "Once the page is cached in your browser, many workflows keep working without an active network connection.",
        ),
        ("Is this tool free?", "Yes. ToolBite tools are free to use; we may show ads to support hosting."),
        (
            "Which browsers are supported?",
            "Use an up-to-date Chrome, Firefox, Safari, or Edge with JavaScript enabled.",
        ),
    ]


def _iter_ld_json_blobs(html: str):
    token = '<script type="application/ld+json">'
    i = 0
    while True:
        j = html.lower().find(token.lower(), i)
        if j == -1:
            return
        j += len(token)
        k = html.lower().find("</script>", j)
        if k == -1:
            return
        yield html[j:k].strip()
        i = k + len("</script>")


def extract_faq_from_ld_json(html: str) -> list[tuple[str, str]] | None:
    for raw in _iter_ld_json_blobs(html):
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if data.get("@type") != "FAQPage":
            continue
        out: list[tuple[str, str]] = []
        for ent in data.get("mainEntity", []):
            if not isinstance(ent, dict):
                continue
            if ent.get("@type") != "Question":
                continue
            name = ent.get("name")
            ans = ent.get("acceptedAnswer") or {}
            text = ans.get("text") if isinstance(ans, dict) else None
            if isinstance(name, str) and isinstance(text, str):
                out.append((name, text))
        return out or None
    return None


def inject_faq_ld_json(html: str, faqs: list[tuple[str, str]]) -> str:
    if extract_faq_from_ld_json(html) is not None:
        return html
    main_entity = []
    for q, a in faqs:
        main_entity.append(
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
        )
    blob = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": main_entity,
    }
    script = (
        "\n  <script type=\"application/ld+json\">"
        + json.dumps(blob, ensure_ascii=False)
        + "</script>"
    )
    return re.sub(r"(</head>)", script + r"\1", html, count=1, flags=re.IGNORECASE)


def strip_mt8_sections_before_tb_seo(html: str) -> str:
    i = html.find("tb-seo-notes")
    if i == -1:
        return html
    head, tail = html[:i], html[i:]
    head2 = re.sub(r"<section class=\"mt-8[\s\S]*?</section>\s*\n?", "", head)
    return head2 + tail


def strip_mt8_sections_after_tb_seo(html: str) -> str:
    pos = html.find("tb-seo-notes")
    if pos == -1:
        return html
    c = html.find("</section>", pos)
    if c == -1:
        return html
    c += len("</section>")
    rest = html[c:]
    while True:
        m = re.match(r"\s*<section class=\"mt-8[\s\S]*?</section>", rest)
        if not m:
            break
        rest = rest[m.end() :]
    return html[:c] + rest


def insert_before_tb_seo_section(html: str, chunk: str) -> str:
    marker = 'aria-label="About this tool"'
    i = html.find(marker)
    if i == -1:
        return html
    j = html.rfind("<section", 0, i)
    if j == -1:
        return html
    return html[:j] + chunk + html[j:]


def apply_hero_wrap(html: str) -> str:
    if "tb-tool-hero" in html:
        return html
    html = re.sub(
        r'(<nav class="tb-breadcrumb[\s\S]*?</nav>\s*)<div class="mb-6">',
        r'\1<section class="tb-tool-hero border-b border-gray-200 pb-5 mb-6" aria-labelledby="tb-tool-hero-title">\n      <div class="mb-0">',
        html,
        count=1,
    )
    html = re.sub(
        r"(<div class=\"mb-0\">\s*<h1)( class=)",
        r'\1 id="tb-tool-hero-title"\2',
        html,
        count=1,
    )
    m = re.search(
        r'(<section class="tb-tool-hero[^>]*>\s*<div class="mb-0">[\s\S]*?</div>)\n(\s*<div class="bg-)',
        html,
    )
    if m:
        gap = html[m.end(1) : m.start(2)]
        if "</section>" not in gap:
            html = html[: m.end(1)] + "\n      </section>\n" + html[m.end(1) :]
    return html


def build_how_section(steps: list[str]) -> str:
    lis = "".join(f"\n          <li>{html.escape(s)}</li>" for s in steps)
    return f"""      <section class="tb-tool-section mt-8 not-prose" aria-labelledby="tb-how-to-heading">
        <h2 id="tb-how-to-heading" class="text-lg font-bold text-gray-900 mb-3">How to use</h2>
        <ol class="list-decimal pl-5 text-sm text-gray-700 space-y-1 max-w-2xl">{lis}
        </ol>
      </section>
"""


def build_use_cases_section(rows: list[list[str]]) -> str:
    cards = []
    for title, desc in rows:
        cards.append(
            f"""          <li class="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <h3 class="font-bold text-gray-900 text-sm mb-1">{html.escape(title)}</h3>
            <p class="text-xs text-gray-600">{html.escape(desc)}</p>
          </li>"""
        )
    body = "\n".join(cards)
    return f"""      <section class="tb-tool-section mt-6 not-prose" aria-labelledby="tb-use-cases-heading">
        <h2 id="tb-use-cases-heading" class="text-lg font-bold text-gray-900 mb-3">Use cases</h2>
        <ul class="grid sm:grid-cols-3 gap-3 text-gray-700 list-none p-0 m-0">
{body}
        </ul>
      </section>
"""


def build_faq_section(faqs: list[tuple[str, str]]) -> str:
    rows = []
    for q, a in faqs:
        rows.append(
            f"""          <details class="group border border-gray-100 rounded-xl bg-gray-50/90 px-4 py-2">
            <summary class="cursor-pointer font-semibold text-gray-900 text-sm marker:content-none list-none flex justify-between gap-2"><span>{html.escape(q)}</span><span class="text-gray-400 text-xs shrink-0" aria-hidden="true">▾</span></summary>
            <p class="mt-2 text-sm text-gray-600 pb-1">{html.escape(a)}</p>
          </details>"""
        )
    inner = "\n".join(rows)
    return f"""      <section class="tb-tool-section mt-6 not-prose tb-tool-faq" aria-labelledby="tb-faq-heading">
        <h2 id="tb-faq-heading" class="text-lg font-bold text-gray-900 mb-3">FAQ</h2>
        <div class="space-y-2 max-w-3xl">
{inner}
        </div>
      </section>
"""


def build_related_section(rel: list[tuple[str, str, str, str]]) -> str:
    links = []
    for slug, title, desc, icon in rel:
        links.append(
            f"""          <a href="../tools/{slug}" class="bg-gray-50 border border-gray-100 p-4 rounded-xl hover:shadow-md transition flex items-center gap-3">
            <span class="text-xl" aria-hidden="true">{icon}</span>
            <div>
              <p class="font-bold text-gray-800 text-sm">{title}</p>
              <p class="text-xs text-gray-500">{desc}</p>
            </div>
          </a>"""
        )
    grid = "\n".join(links)
    return f"""      <section class="tb-tool-section mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 not-prose" aria-labelledby="tb-related-tools-heading">
        <h2 id="tb-related-tools-heading" class="text-lg font-bold text-gray-900 mb-3">Related tools</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
{grid}
        </div>
      </section>
"""


def build_guides_section(items: list[tuple[str, str, str]]) -> str:
    cards = []
    for href, title, desc in items:
        cards.append(
            f"""          <a href="{html.escape(href, quote=True)}" class="bg-gray-50 border border-gray-100 p-4 rounded-xl hover:shadow-md transition block">
            <p class="font-bold text-gray-800 text-sm mb-1">{title}</p>
            <p class="text-xs text-gray-500">{desc}</p>
          </a>"""
        )
    body = "\n".join(cards)
    return f"""      <section class="tb-tool-section mt-6 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 not-prose" aria-labelledby="tb-guides-heading">
        <h2 id="tb-guides-heading" class="text-lg font-bold text-gray-900 mb-3">Guides for this task</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
{body}
        </div>
      </section>
"""


def build_browse_section(cat: str) -> str:
    label = CATEGORY_LABEL[cat]
    href = f"../categories/{cat}.html"
    return f"""      <section class="tb-tool-section mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 not-prose" aria-labelledby="tb-browse-category-heading">
        <h2 id="tb-browse-category-heading" class="text-lg font-bold text-gray-900 mb-3">Browse this category</h2>
        <p class="text-sm text-gray-600 mb-4 max-w-2xl">Explore more browser-based tools in the same group—everything stays fast and local where the tool allows it.</p>
        <a href="{href}" class="inline-flex items-center px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition">Open {label}</a>
      </section>
"""


def transform_tool_page(html: str, rel_path: str, layout: dict) -> str:
    if "tb-how-to-heading" in html:
        return html

    cat = layout["category"]
    how = layout["how_to"]
    use = layout["use_cases"]

    faq = extract_faq_from_ld_json(html)
    if faq is None:
        h1m = re.search(r"<h1[^>]*>([^<]+)</h1>", html)
        title = (h1m.group(1) if h1m else "this tool").strip()
        faq = default_faq(title)

    rel = RELATED.get(rel_path)
    if not rel:
        raise KeyError(f"Missing RELATED entry for {rel_path}")

    guides = GUIDES.get(rel_path, [("../guides/index.html", "All ToolBite guides", "Browse tutorials for JSON, JWT, and SEO.")])

    chunk = (
        build_how_section(how)
        + build_use_cases_section(use)
        + build_faq_section(faq)
        + build_related_section(rel)
        + build_guides_section(guides)
        + build_browse_section(cat)
    )

    html = apply_hero_wrap(html)
    html = strip_mt8_sections_before_tb_seo(html)
    html = insert_before_tb_seo_section(html, chunk)
    html = strip_mt8_sections_after_tb_seo(html)
    html = inject_faq_ld_json(html, faq)
    return html


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    layout_all = json.loads(LAYOUT_PATH.read_text(encoding="utf-8"))
    changed = 0
    for rel, layout in layout_all.items():
        if rel.startswith("_"):
            continue
        path = ROOT / rel
        if not path.exists():
            print(f"skip missing {rel}")
            continue
        raw = path.read_text(encoding="utf-8")
        try:
            new = transform_tool_page(raw, rel, layout)
        except Exception as e:
            print(f"ERROR {rel}: {e}")
            return 1
        if new != raw:
            changed += 1
            if not args.dry_run:
                path.write_text(new, encoding="utf-8")
            print(f"{'[dry] ' if args.dry_run else ''}updated {rel}")

    print(f"Done. {changed} tool page(s) {'would be ' if args.dry_run else ''}updated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
