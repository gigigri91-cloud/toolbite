#!/usr/bin/env python3
"""Unified SEO metadata for ToolBite (titles, descriptions, canonical, OG, Twitter, main H1).

Source of truth: data/seo.json

Page-type rules (see data/seo.json "page_type" on each entry):
  homepage     — H1 states the primary promise; title leads with ToolBite + scope.
  category     — H1 names the hub; title names category + browser/local angle.
  tool         — H1 is short utility name; title adds benefit + "| ToolBite".
  guide_hub    — H1 for the library; title lists covered topics.
  guide_article— og:type article; H1 matches article headline style.
  trust        — About / privacy / terms / contact; factual tone.
  utility      — search.html: no canonical; full OG/Twitter for consistency.

Schema.org JSON-LD (application/ld+json) is synced on --apply / --check when @context
is schema.org: WebApplication, CollectionPage, WebPage, Article, WebSite (homepage),
standalone Organization (homepage), and BreadcrumbList (tool pages: last crumb name).
Skipped: FAQPage, ItemList, nested publisher blobs inside WebSite.

Optional per-page keys in data/seo.json:
  schema_date_modified   — YYYY-MM-DD or full ISO (default: today UTC date)
  schema_breadcrumb_leaf — last ListItem name on tool breadcrumbs (default: plain h1 text)
  schema_article_headline— Article.headline for guides (default: plain h1 text)
  theme_color            — #hex color (default: root theme_color or #2563eb)

Usage:
  python3 scripts/seo_metadata.py --check
  python3 scripts/seo_metadata.py --apply
"""

from __future__ import annotations

import argparse
import copy
import datetime
import html
import json
import pathlib
import re
import sys
from typing import Any


ROOT = pathlib.Path(__file__).resolve().parents[1]
SEO_JSON = ROOT / "data" / "seo.json"
SKIP_NAMES = frozenset({"googled245882dcee44e7c.html"})


def load_config() -> dict[str, Any]:
    data = json.loads(SEO_JSON.read_text(encoding="utf-8"))
    pages = data.get("pages")
    if not isinstance(pages, dict):
        raise SystemExit("data/seo.json: missing 'pages' object")
    origin = str(data.get("origin", "https://toolbite.org")).rstrip("/")
    og_image = str(data.get("og_image", f"{origin}/assets/images/social-preview.jpg"))
    theme_color = str(data.get("theme_color", "#2563eb"))
    critical_css = str(data.get("critical_css", ""))
    theme_init_js = str(data.get("theme_init_js", ""))
    return {
        "origin": origin,
        "og_image": og_image,
        "theme_color": theme_color,
        "critical_css": critical_css,
        "theme_init_js": theme_init_js,
        "pages": pages
    }


def tracked_html_files() -> list[pathlib.Path]:
    out: list[pathlib.Path] = []
    for p in sorted(ROOT.rglob("*.html")):
        if p.name in SKIP_NAMES:
            continue
        rel = p.relative_to(ROOT).as_posix()
        if rel.startswith("_"):
            continue
        if "templates/" in rel:
            continue
        out.append(p)
    return out


def esc_attr(s: str) -> str:
    return html.escape(s, quote=True)


def build_social_block(
    *,
    og_type: str,
    canonical: str | None,
    og_title: str,
    og_description: str,
    og_image: str,
) -> str:
    url_for_og = canonical or ""
    lines = [
        "  <!-- Open Graph -->",
        f'  <meta property="og:type" content="{esc_attr(og_type)}">',
        f'  <meta property="og:url" content="{esc_attr(url_for_og)}">',
        f'  <meta property="og:title" content="{esc_attr(og_title)}">',
        f'  <meta property="og:description" content="{esc_attr(og_description)}">',
        f'  <meta property="og:image" content="{esc_attr(og_image)}">',
        '  <meta name="twitter:card" content="summary_large_image">',
        f'  <meta name="twitter:title" content="{esc_attr(og_title)}">',
        f'  <meta name="twitter:description" content="{esc_attr(og_description)}">',
        f'  <meta name="twitter:image" content="{esc_attr(og_image)}">',
    ]
    return "\n".join(lines)


def scrub_og_twitter(head_inner: str) -> str:
    """Strip OG/Twitter metas even if a prior edit glued tags (missing newlines)."""
    head_inner = re.sub(r"\s*<!-- Open Graph -->\s*", "\n", head_inner)
    for _ in range(40):
        before = head_inner
        head_inner = re.sub(
            r'<meta\s+property="og:[^"]+"\s+content="[^"]*"\s*/?>',
            "",
            head_inner,
            flags=re.I,
        )
        head_inner = re.sub(
            r'<meta\s+name="twitter:[^"]+"\s+content="[^"]*"\s*/?>',
            "",
            head_inner,
            flags=re.I,
        )
        if head_inner == before:
            break
    head_inner = re.sub(r"\n{3,}", "\n\n", head_inner)
    return head_inner


def patch_title(head_inner: str, title: str) -> tuple[str, bool]:
    new, n = re.subn(
        r"<title>.*?</title>",
        f"<title>{esc_attr(title)}</title>",
        head_inner,
        count=1,
        flags=re.I | re.DOTALL,
    )
    return new, bool(n)


def patch_meta_description(head_inner: str, desc: str) -> tuple[str, bool]:
    m = re.search(
        r"\n\s*<meta\s+name=\"description\"\s+content=\"[^\"]*\"\s*/?>\s*",
        head_inner,
        flags=re.I,
    )
    if not m:
        return head_inner, False
    # Normalize to two-space indent (matches the rest of ToolBite HTML)
    repl = f'\n  <meta name="description" content="{esc_attr(desc)}">\n'
    return head_inner[: m.start()] + repl + head_inner[m.end() :], True


def patch_theme_color(head_inner: str, color: str) -> str:
    """Replace or insert <meta name="theme-color">."""
    head_inner = re.sub(r'\n\s*<meta\s+name="theme-color"\s+content="[^"]*"\s*/?>\s*', "\n", head_inner, flags=re.I)
    m = re.search(r'(\n\s*<meta\s+name="description"\s+content="[^"]*"\s*>)', head_inner, flags=re.I)
    if not m:
        # Fallback: find any meta and insert before/after
        m = re.search(r'(<meta\s+[^>]+>)', head_inner, flags=re.I)
    
    ins = f'\n  <meta name="theme-color" content="{esc_attr(color)}">'
    if m:
        return head_inner[: m.end()] + ins + head_inner[m.end() :]
    return head_inner + ins


def patch_critical_css(head_inner: str, css: str) -> str:
    """Inject critical CSS into <style id="critical-css">."""
    head_inner = re.sub(r'\n\s*<style\s+id="critical-css">[\s\S]*?</style>\s*', "\n", head_inner, flags=re.I)
    if not css:
        return head_inner
    
    # Insert after title
    m = re.search(r'(</title>)', head_inner, flags=re.I)
    ins = f'\n  <style id="critical-css">{css}</style>'
    if m:
        return head_inner[: m.end()] + ins + head_inner[m.end() :]
    return head_inner + ins


def patch_theme_init_js(head_inner: str, script_content: str) -> str:
    """Inline theme-init logic to prevent FOUC."""
    # Remove existing <script src="...theme-init.js">
    head_inner = re.sub(r'\n\s*<script\s+src="[^"]*theme-init\.js"[^>]*>\s*</script>\s*', "\n", head_inner, flags=re.I)
    # Remove existing inlined <script> blocks that look like theme-init
    head_inner = re.sub(r'\n\s*<script>\s*/\* Inline theme:[\s\S]*?</script>\s*', "\n", head_inner, flags=re.I)
    # Remove our own tagged version if re-running
    head_inner = re.sub(r'\n\s*<script\s+id="theme-init">[\s\S]*?</script>\s*', "\n", head_inner, flags=re.I)
    
    if not script_content:
        return head_inner

    # Insert right after <meta charset> or early in head
    m = re.search(r'(<meta\s+charset="[^"]*"\s*/?>)', head_inner, flags=re.I)
    ins = f'\n  <script id="theme-init">{script_content}</script>'
    if m:
        return head_inner[: m.end()] + ins + head_inner[m.end() :]
    return ins + head_inner


def patch_header_toggle(html: str) -> str:
    """Inject the theme-toggle button into the header if missing."""
    if 'id="theme-toggle"' in html:
        return html
    
    # Button HTML (empty, populated by main.js)
    toggle_html = '\n      <button id="theme-toggle" type="button" class="theme-toggle-btn" aria-label="Toggle theme"></button>'
    
    # Find mobile-menu-button and insert before it
    m = re.search(r'(\n\s*<button\s+id="mobile-menu-button")', html, flags=re.I)
    if m:
        return html[: m.start()] + toggle_html + html[m.start() :]
    return html


def patch_header_logo(html: str) -> str:
    """Ensure the header logo has fetchpriority='high' and decoding='async'."""
    # Find the logo img tag inside #site-header
    # We look for the one with class="logo header-logo"
    m = re.search(r'(<img[^>]+class="[^"]*logo header-logo[^"]*"[^>]*>)', html, flags=re.I)
    if not m:
        return html
    
    img_tag = m.group(1)
    if 'fetchpriority="high"' not in img_tag:
        img_tag = re.sub(r'(<img\s+)', r'\1fetchpriority="high" ', img_tag, flags=re.I)
    if 'decoding="async"' not in img_tag:
        img_tag = re.sub(r'(<img\s+)', r'\1decoding="async" ', img_tag, flags=re.I)
        
    return html[: m.start()] + img_tag + html[m.end() :]


def patch_favorite_button(html: str, rel_path: str, page_type: str) -> str:
    """Add a star button next to the H1 for tools and guides."""
    if page_type not in ("tool", "guide_article"):
        return html
    if 'toggleFavorite' in html:
        return html
    
    # Insert inside the <h1> tag at the end, or after it
    # Let's try inserting it right after the <h1> closing tag if it's in a flex container, 
    # or inside it. ToolBite usually has H1 in a centered div.
    
    star_btn = f' <button onclick="toggleFavorite(\'/{rel_path}\', document.title.split(\'—\')[0].trim())" class="favorite-btn text-gray-400 hover:text-orange-500 transition-colors" title="Toggle Favorite" aria-label="Toggle Favorite">★</button>'
    
    # Match </h1> and insert before it
    html = re.sub(r'(</h1>)', r' ' + star_btn + r'\1', html, flags=re.I)
    return html


def make_css_async(head_inner: str, rel_path: str) -> str:
    """Strip and re-add core CSS links in async preload pattern for consistency."""
    # 1. Strip all existing CSS-related tags and custom style blocks to prevent duplication/corruption
    head_inner = re.sub(r'<link[^>]+rel=["\']preconnect["\'][^>]*>', "", head_inner, flags=re.I)
    head_inner = re.sub(r'<link[^>]+rel=["\']preload["\'][^>]+as=["\']style["\'][^>]*>', "", head_inner, flags=re.I)
    head_inner = re.sub(r'<link[^>]+as=["\']style["\'][^>]+rel=["\']preload["\'][^>]*>', "", head_inner, flags=re.I)
    head_inner = re.sub(r'<link[^>]+rel=["\']preload["\'][^>]+as=["\']font["\'][^>]*>', "", head_inner, flags=re.I)
    head_inner = re.sub(r'<link[^>]+as=["\']font["\'][^>]+rel=["\']preload["\'][^>]*>', "", head_inner, flags=re.I)
    head_inner = re.sub(r'<link[^>]+rel=["\']stylesheet["\'][^>]*>', "", head_inner, flags=re.I)
    head_inner = re.sub(r'<link[^>]+href="[^"]+"[^>]+rel=["\']stylesheet["\'][^>]*>', "", head_inner, flags=re.I)
    
    # Strip existing font-css and critical-css blocks to prevent duplicate IDs
    head_inner = re.sub(r'<style id=["\']font-css["\']>[\s\S]*?</style>', "", head_inner, flags=re.I)
    
    # Remove all noscript blocks entirely from the head content
    head_inner = re.sub(r'<noscript>[\s\S]*?</noscript>', "", head_inner, flags=re.I)
    head_inner = head_inner.replace("</noscript>", "")

    # 2. Build the list of core CSS files with correct relative paths
    depth = rel_path.count("/")
    prefix = "../" * depth
    
    # Resource Hints
    head_inner += '\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    
    # Preload critical font files (WOFF2 versions - Verified URLs from Google Fonts v20/v12)
    # Inter v20 (Latin)
    inter_woff2 = "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2"
    # Plus Jakarta Sans v12 (Latin)
    plus_jakarta_woff2 = "https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yygg_vb.woff2"
    
    head_inner += f'\n  <link rel="preload" href="{inter_woff2}" as="font" type="font/woff2" crossorigin>'
    head_inner += f'\n  <link rel="preload" href="{plus_jakarta_woff2}" as="font" type="font/woff2" crossorigin>'

    # Inline Font CSS to avoid extra request
    # Note: Using the same URL for multiple weights is correct for modern Variable-capable files
    font_css = f"""
  <style id="font-css">
    @font-face {{ font-family: 'Inter'; font-style: normal; font-weight: 400; font-display: swap; src: url({inter_woff2}) format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }}
    @font-face {{ font-family: 'Inter'; font-style: normal; font-weight: 600; font-display: swap; src: url({inter_woff2}) format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }}
    @font-face {{ font-family: 'Inter'; font-style: normal; font-weight: 700; font-display: swap; src: url({inter_woff2}) format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }}
    @font-face {{ font-family: 'Plus Jakarta Sans'; font-style: normal; font-weight: 600; font-display: swap; src: url({plus_jakarta_woff2}) format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }}
    @font-face {{ font-family: 'Plus Jakarta Sans'; font-style: normal; font-weight: 800; font-display: swap; src: url({plus_jakarta_woff2}) format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }}
  </style>"""
    head_inner += font_css
    
    # Standard CSS for all pages
    tailwind_url = f"{prefix}assets/css/tailwind.min.css"
    global_url = f"{prefix}assets/css/global.min.css"
    
    css_list = [tailwind_url, global_url]
    
    # 3. Append them at the end of head_inner content
    for url in css_list:
        head_inner += f'\n  <link rel="preload" href="{url}" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">'
        head_inner += f'\n  <noscript><link rel="stylesheet" href="{url}"></noscript>'
        
    return head_inner


def patch_canonical_in_head(head_inner: str, canonical: str | None) -> str:
    head_inner = re.sub(r"\n\s*<link\s+rel=\"canonical\"[^>]*>\s*", "\n", head_inner, flags=re.I)
    if canonical is None:
        return head_inner
    m = re.search(r"(<link\s+rel=\"icon\"[^>]+>\s*\n)", head_inner, re.I)
    if not m:
        raise ValueError("expected favicon <link> in <head>")
    ins = f'{m.group(1)}  <link rel="canonical" href="{esc_attr(canonical)}">\n'
    return head_inner[: m.start()] + ins + head_inner[m.end() :]


def insert_social_after_description(head_inner: str, block: str) -> str:
    m = re.search(
        r'(\n\s*<meta\s+name="description"\s+content="[^"]*"\s*>)',
        head_inner,
        flags=re.I,
    )
    if not m:
        raise ValueError("expected <meta name=\"description\"> in <head>")
    return head_inner[: m.end()] + "\n" + block + "\n" + head_inner[m.end() :]


def patch_csp(head_inner: str) -> str:
    """Ensure a consistent and working CSP for all pages."""
    # We define a standard policy that includes all necessary 3rd parties
    # script-src: self, unsafe-inline, adsense, gtag, bmc
    # connect-src: self, adsense, analytics, googletagmanager
    # img-src: self, data:, https: (for tool icons and bmc)
    
    csp_content = (
        "default-src 'self'; "
        "base-uri 'self'; "
        "form-action 'self' mailto:; "
        "object-src 'none'; "
        "img-src 'self' data: https:; "
        "font-src 'self' https://fonts.gstatic.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.adtrafficquality.google https://www.googletagmanager.com https://cdnjs.buymeacoffee.com; "
        "connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://google.com https://*.adtrafficquality.google https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://www.googletagmanager.com; "
        "frame-src https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.adtrafficquality.google; "
        "upgrade-insecure-requests"
    )
    
    # Scrub existing CSP
    head_inner = re.sub(r'\n\s*<meta\s+http-equiv="Content-Security-Policy"[^>]*>\s*', "\n", head_inner, flags=re.I)
    
    # Insert after <meta charset> or at start
    ins = f'\n  <meta http-equiv="Content-Security-Policy" content="{csp_content}">'
    m = re.search(r'(<meta\s+charset="[^"]*"[^>]*>)', head_inner, flags=re.I)
    if m:
        return head_inner[: m.end()] + ins + head_inner[m.end() :]
    return ins + head_inner


def patch_manifest(head_inner: str, rel_path: str) -> str:
    """Add <link rel="manifest" href="/manifest.json"> if missing, with correct relative path."""
    if 'rel="manifest"' in head_inner:
        # If it's already there but potentially wrong, we could scrub it, but let's just scrub and re-add for safety
        head_inner = re.sub(r'\n\s*<link\s+rel="manifest"[^>]*>\s*', "\n", head_inner, flags=re.I)
    
    # Calculate depth
    depth = rel_path.count("/")
    prefix = "../" * depth
    
    # Insert after favicon
    m = re.search(r'(<link\s+rel="icon"[^>]*>)', head_inner, flags=re.I)
    ins = f'\n  <link rel="manifest" href="{prefix}manifest.json">'
    if m:
        return head_inner[: m.end()] + ins + head_inner[m.end() :]
    return head_inner + ins


def patch_lcp_image(head_inner: str, rel_path: str) -> str:
    """Ensure the LCP logo has preload and fetchpriority='high'."""
    # 1. Scrub existing logo preloads
    head_inner = re.sub(r'<!--.*?-->\n\s*<link\s+rel="preload"\s+as="image"\s+href="[^"]*toolbite-logo\.webp"[^>]*>\s*', "", head_inner, flags=re.I)
    head_inner = re.sub(r'<link\s+rel="preload"\s+as="image"\s+href="[^"]*toolbite-logo\.webp"[^>]*>\s*', "", head_inner, flags=re.I)
    
    depth = rel_path.count("/")
    prefix = "../" * depth
    logo_webp = f"{prefix}assets/images/toolbite-logo.webp"
    
    # 2. Add preload at the start of head (or after theme-color)
    preload_tag = f'\n  <link rel="preload" as="image" href="{logo_webp}" type="image/webp" fetchpriority="high">'
    
    m = re.search(r'(<meta\s+name="theme-color"[^>]*>)', head_inner, flags=re.I)
    if m:
        return head_inner[: m.end()] + preload_tag + head_inner[m.end() :]
    return preload_tag + head_inner


def patch_head(html: str, spec: dict[str, Any], og_image: str, default_theme_color: str, critical_css: str, theme_init_js: str, rel_path: str) -> str:
    m = re.search(r"(<head[^>]*>)([\s\S]*?)(</head>)", html, re.I)
    if not m:
        raise ValueError("missing <head>")
    open_tag, hb, close_tag = m.group(1), m.group(2), m.group(3)

    title = str(spec["title"])
    description = str(spec["description"])
    canonical = spec.get("canonical")
    if canonical is not None:
        canonical = str(canonical)
    og_type = str(spec.get("og_type", "website"))
    og_title = str(spec.get("og_title", title))
    og_description = str(spec.get("og_description", description))
    theme_color = str(spec.get("theme_color", default_theme_color))

    hb, ok_t = patch_title(hb, title)
    if not ok_t:
        raise ValueError("could not patch <title>")
    hb = patch_canonical_in_head(hb, canonical)
    hb, ok_d = patch_meta_description(hb, description)
    if not ok_d:
        raise ValueError("could not patch meta description")

    hb = scrub_og_twitter(hb)
    block = build_social_block(
        og_type=og_type,
        canonical=canonical,
        og_title=og_title,
        og_description=og_description,
        og_image=og_image,
    )
    hb = insert_social_after_description(hb, block)
    hb = patch_theme_color(hb, theme_color)
    hb = patch_critical_css(hb, critical_css)
    hb = patch_theme_init_js(hb, theme_init_js)
    hb = patch_manifest(hb, rel_path)
    hb = patch_lcp_image(hb, rel_path)
    hb = patch_csp(hb)
    hb = make_css_async(hb, rel_path)
    # Collapse runs of blank lines introduced by OG scrub/replace (keep JSON in <script> intact)
    hb = re.sub(r"\n(?:[ \t]*\n){2,}", "\n\n", hb)
    # Restore common two-space indent if a tag lost its leading spaces after OG replacement
    hb = re.sub(r"\n(<meta name=\"google-adsense)", r"\n  \1", hb)

    new_html = html[: m.start(1)] + open_tag + hb + close_tag + html[m.end(3) :]
    return new_html


def patch_h1(html: str, h1_inner: str, h1_target: str) -> tuple[str, bool]:
    if h1_target == "hero":
        m = re.search(
            r'(<h1\b[^>]*\bid="homepage-hero-title"[^>]*>)([\s\S]*?)(</h1>)',
            html,
            re.I,
        )
    else:
        m = re.search(r"(<main\b[^>]*>[\s\S]*?<h1\b[^>]*>)([\s\S]*?)(</h1>)", html, re.I)
    if not m:
        return html, False
    return html[: m.start(2)] + h1_inner + html[m.end(2) :], True


def patch_related_tools(html_content: str, spec: dict[str, Any], pages: dict[str, Any], rel_path: str) -> str:
    """Inject a dynamic 'Related Tools' section based on tags and categories."""
    if spec.get("page_type") != "tool":
        return html_content
    
    # 1. Scrub existing related tools section (if any)
    # We look for a section with id="tb-related-tools-heading" or similar patterns
    html_content = re.sub(r'\n\s*<section[^>]*aria-labelledby="tb-related-tools-heading"[\s\S]*?</section>\s*', "\n", html_content, flags=re.I)
    html_content = re.sub(r'\n\s*<section[^>]*id="tb-related-tools-heading"[\s\S]*?</section>\s*', "\n", html_content, flags=re.I)

    # 2. Find relevant tools
    current_tags = set(spec.get("tags", "").split())
    candidates = []
    
    depth = rel_path.count("/")
    prefix = "../" * depth

    for p_path, p_spec in pages.items():
        if p_path == rel_path or p_spec.get("page_type") != "tool":
            continue
        
        # Calculate relevance
        p_tags = set(p_spec.get("tags", "").split())
        score = len(current_tags.intersection(p_tags))
        
        # Boost if same category (inferred from path or tags)
        if rel_path.split('/')[0] == p_path.split('/')[0]:
            score += 1
            
        candidates.append({
            "path": p_path,
            "title": p_spec.get("h1_inner", p_spec.get("title", "")).split('—')[0].split('|')[0].strip(),
            "desc": p_spec.get("description", "").split('.')[0] + ".",
            "icon": p_spec.get("icon", "🛠️"),
            "score": score
        })
    
    # Sort by score descending and take top 3
    candidates.sort(key=lambda x: x["score"], reverse=True)
    top_3 = candidates[:3]
    
    if not top_3:
        return html_content

    # 3. Build HTML
    related_html = f"""
      <section class="tb-tool-section mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 not-prose" aria-labelledby="tb-related-tools-heading">
        <div class="flex items-center justify-between mb-6">
          <h2 id="tb-related-tools-heading" class="text-2xl font-bold text-gray-900">Explore Related Tools</h2>
          <a href="{prefix}search.html" class="text-sm font-semibold text-blue-600 hover:underline">View all tools &rarr;</a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">"""
    
    for item in top_3:
        # Fix relative path
        href = f"{prefix}{item['path']}"
        related_html += f"""
          <a href="{href}" class="group p-5 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all">
            <span class="text-3xl mb-3 block" aria-hidden="true">{item['icon']}</span>
            <h3 class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{item['title']}</h3>
            <p class="text-xs text-gray-600 line-clamp-2 leading-relaxed">{item['desc']}</p>
          </a>"""
    
    related_html += """
        </div>
      </section>"""

    # 4. Inject before </main>
    if "</main>" in html_content:
        html_content = html_content.replace("</main>", related_html + "\n    </main>")
    else:
        # Fallback: before footer
        if "<footer" in html_content:
            html_content = html_content.replace("<footer", related_html + "\n  <footer")
            
    return html_content


def apply_page(path: pathlib.Path, spec: dict[str, Any], pages: dict[str, Any], og_image: str, theme_color: str, critical_css: str, theme_init_js: str) -> str:
    raw = path.read_text(encoding="utf-8")
    h1_inner = str(spec["h1_inner"])
    h1_target = str(spec.get("h1_target", "main"))
    rel = path.relative_to(ROOT).as_posix()
    html = patch_head(raw, spec, og_image, theme_color, critical_css, theme_init_js, rel)
    html = patch_header_toggle(html)
    html = patch_header_logo(html)
    html, ok = patch_h1(html, h1_inner, h1_target)
    if not ok:
        raise ValueError(f"could not patch <h1> (h1_target={h1_target!r})")
    html = patch_favorite_button(html, rel, spec.get("page_type", ""))
    html = patch_related_tools(html, spec, pages, rel)
    html = patch_ld_json_scripts(html, spec, rel)
    return html


def html_unescape(s: str) -> str:
    return html.unescape(s)


def extract_title(html: str) -> str | None:
    m = re.search(r"<title>(.*?)</title>", html, re.I | re.DOTALL)
    return html_unescape(m.group(1).strip()) if m else None


def extract_meta_description(html: str) -> str | None:
    m = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', html, re.I)
    return html_unescape(m.group(1)) if m else None


def extract_canonical(html: str) -> str | None:
    m = re.search(r'<link\s+rel="canonical"\s+href="([^"]*)"', html, re.I)
    return m.group(1) if m else None


def extract_og(html: str, prop: str) -> str | None:
    m = re.search(rf'<meta\s+property="og:{re.escape(prop)}"\s+content="([^"]*)"', html, re.I)
    return html_unescape(m.group(1)) if m else None


def extract_twitter(html: str, name: str) -> str | None:
    m = re.search(rf'<meta\s+name="twitter:{re.escape(name)}"\s+content="([^"]*)"', html, re.I)
    return html_unescape(m.group(1)) if m else None


def extract_h1_inner(html: str, h1_target: str) -> str | None:
    if h1_target == "hero":
        m = re.search(
            r'<h1\b[^>]*\bid="homepage-hero-title"[^>]*>([\s\S]*?)</h1>',
            html,
            re.I,
        )
    else:
        m = re.search(r"<main\b[^>]*>[\s\S]*?<h1\b[^>]*>([\s\S]*?)</h1>", html, re.I)
    
    if not m:
        return None
    
    res = m.group(1).strip()
    # Strip the favorite button if present
    res = re.sub(r'\s*<button\s+onclick="toggleFavorite[\s\S]*?</button>', '', res, flags=re.I)
    return res


def norm_cmp(s: str) -> str:
    return " ".join(html_unescape(s).replace("\n", " ").split())


def strip_html_tags(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s).strip()


def plain_h1(spec: dict[str, Any]) -> str:
    return html_unescape(strip_html_tags(str(spec.get("h1_inner", ""))))


def schema_dates(spec: dict[str, Any]) -> tuple[str, str]:
    """(short YYYY-MM-DD, ISO Z end of day) for JSON-LD dateModified."""
    raw = spec.get("schema_date_modified")
    if raw:
        s = str(raw)
        if "T" in s:
            return s[:10], s if s.endswith("Z") else s
        return s, f"{s}T00:00:00.000Z"
    d = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
    return d, f"{d}T00:00:00.000Z"


def schema_date_z(spec: dict[str, Any]) -> str:
    """Return full ISO 8601 string (end of day) for unified JSON-LD dateModified."""
    _, dz = schema_dates(spec)
    return dz


def _is_schema_obj(data: Any) -> bool:
    return isinstance(data, dict) and (
        data.get("@context") in ("https://schema.org", "http://schema.org")
        or "@type" in data
    )


def mutate_ld_json(data: dict[str, Any], spec: dict[str, Any], page_type: str) -> bool:
    """Update JSON-LD object in place. Returns True if anything changed."""
    if not _is_schema_obj(data):
        return False
    t = data.get("@type")
    title = str(spec["title"])
    desc = str(spec["description"])
    canon = spec.get("canonical")
    canon_s = str(canon) if canon else None
    d_short, d_z = schema_dates(spec)
    changed = False

    def set_if(key: str, val: Any) -> None:
        nonlocal changed
        if data.get(key) != val:
            data[key] = val
            changed = True

    if t == "WebSite" and page_type == "homepage" and canon_s:
        set_if("description", desc)
        set_if("dateModified", d_z)
        return changed

    # Unified: Use full ISO format for all types as requested by audit
    if t in ("WebApplication", "CollectionPage", "WebPage", "Article") and canon_s:
        if t == "Article":
            headline = str(spec.get("schema_article_headline") or plain_h1(spec) or title)
            set_if("headline", headline)
            set_if("mainEntityOfPage", canon_s)
        else:
            set_if("name", title)
            set_if("url", canon_s)
        
        set_if("description", desc)
        set_if("dateModified", d_z)
        return changed

    if (
        t == "Organization"
        and page_type == "homepage"
        and isinstance(data.get("logo"), str)
        and data.get("url") == canon_s
    ):
        set_if("description", desc)
        set_if("dateModified", d_z)
        return changed

    if t == "BreadcrumbList" and page_type == "tool":
        items = data.get("itemListElement")
        if not isinstance(items, list) or not items:
            return changed
        leaf = str(spec.get("schema_breadcrumb_leaf") or plain_h1(spec) or title)
        last = None
        last_pos = -1
        for it in items:
            if not isinstance(it, dict):
                continue
            pos = it.get("position")
            if isinstance(pos, int) and pos > last_pos:
                last_pos = pos
                last = it
        if last and last.get("name") != leaf:
            last["name"] = leaf
            changed = True
        return changed

    if t == "BreadcrumbList" and page_type == "guide_article":
        items = data.get("itemListElement")
        if not isinstance(items, list) or not items:
            return changed
        label = str(spec.get("schema_breadcrumb_leaf") or plain_h1(spec) or title)
        last = None
        last_pos = -1
        for it in items:
            if not isinstance(it, dict):
                continue
            pos = it.get("position")
            if isinstance(pos, int) and pos > last_pos:
                last_pos = pos
                last = it
        if last and last.get("name") != label:
            last["name"] = label
            changed = True
        return changed

    return False


def _ld_json_compact(inner: str) -> bool:
    s = inner.strip()
    return "\n" not in s


def _serialize_ld(data: dict[str, Any], compact: bool) -> str:
    if compact:
        return json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    return json.dumps(data, indent=2, ensure_ascii=False)


def extract_faqs_from_html(html_content: str) -> list[dict[str, str]]:
    """Extract Q&A pairs from <details> blocks in tb-tool-faq sections."""
    faqs = []
    # Find sections with tb-tool-faq class
    faq_sections = re.findall(r'<section[^>]*class="[^"]*tb-tool-faq[^"]*"[^>]*>([\s\S]*?)</section>', html_content, flags=re.I)
    
    for section in faq_sections:
        # Find all details blocks
        details_blocks = re.findall(r'<details[^>]*>([\s\S]*?)</details>', section, flags=re.I)
        for block in details_blocks:
            summary = re.search(r'<summary[^>]*>([\s\S]*?)</summary>', block, flags=re.I)
            # Find the first paragraph or div after summary for the answer
            answer_match = re.search(r'</summary>\s*<p[^>]*>([\s\S]*?)</p>', block, flags=re.I)
            
            if summary and answer_match:
                # Clean up HTML from summary (often contains <span> or icon)
                q = strip_html_tags(summary.group(1)).strip()
                # Clean up ▾ icon or similar suffixes
                q = re.sub(r'\s*[▾▼]$', '', q).strip()
                
                a = strip_html_tags(answer_match.group(1)).strip()
                if q and a:
                    faqs.append({"question": q, "answer": a})
    return faqs


def patch_ld_json_scripts(html: str, spec: dict[str, Any], rel: str) -> str:
    page_type = str(spec.get("page_type", ""))
    if page_type == "utility":
        return html

    # Extract FAQs if any
    faqs = extract_faqs_from_html(html)

    pattern = re.compile(
        r'(?P<prefix>\s*)<script\s+type="application/ld\+json"\s*>(?P<inner>[\s\S]*?)</script>',
        re.I,
    )
    matches = list(pattern.finditer(html))
    
    # If no LD+JSON exists but we have FAQs, we might need to create one, 
    # but usually ToolBite pages have at least one block (Breadcrumb or WebPage).
    
    for m in reversed(matches):
        inner = m.group("inner")
        prefix = m.group("prefix")
        compact = _ld_json_compact(inner)
        try:
            data = json.loads(inner)
        except json.JSONDecodeError:
            continue
        if not isinstance(data, dict):
            continue
        
        new_data = copy.deepcopy(data)
        changed = mutate_ld_json(new_data, spec, page_type)
        
        # Inject FAQs into the main block or a dedicated one? 
        # Usually better as a separate top-level object if using a Graph, 
        # but ToolBite uses individual blocks. Let's see if we can append FAQPage.
        
        if changed:
            serialized = _serialize_ld(new_data, compact)
            if compact:
                repl = f'{prefix}<script type="application/ld+json">{serialized}</script>'
            else:
                body = "\n".join("  " + line for line in serialized.splitlines())
                repl = f'{prefix}<script type="application/ld+json">\n{body}\n{prefix}</script>'
            html = html[: m.start()] + repl + html[m.end() :]

    # If we found FAQs, add a dedicated FAQPage block if not already present
    if faqs and 'FAQPage' not in html:
        faq_ld = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": f["question"],
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": f["answer"]
                    }
                } for f in faqs
            ]
        }
        faq_json = json.dumps(faq_ld, indent=2, ensure_ascii=False)
        # Indent lines
        faq_body = "\n".join("  " + line for line in faq_json.splitlines())
        faq_block = f'\n  <script type="application/ld+json">\n{faq_body}\n  </script>'
        
        # Insert after the last ld+json script
        last_match = list(re.finditer(r'</script>\s*(?!\s*<script type="application/ld\+json")', html, flags=re.I))
        # This is tricky with regex. Let's just insert before </head> for simplicity
        html = html.replace("</head>", faq_block + "\n</head>")

    return html


def check_ld_json_against_file(path: pathlib.Path, spec: dict[str, Any]) -> list[str]:
    """Ensure each ld+json block matches post-sync expectations."""
    issues: list[str] = []
    text = path.read_text(encoding="utf-8")
    rel = path.relative_to(ROOT).as_posix()
    page_type = str(spec.get("page_type", ""))
    if page_type == "utility":
        return issues

    pattern = re.compile(
        r'<script\s+type="application/ld\+json"\s*>([\s\S]*?)</script>',
        re.I,
    )
    idx = 0
    for m in pattern.finditer(text):
        inner = m.group(1)
        try:
            on_disk = json.loads(inner)
        except json.JSONDecodeError:
            issues.append(f"ld+json block {idx}: invalid JSON")
            idx += 1
            continue
        if not isinstance(on_disk, dict) or not _is_schema_obj(on_disk):
            idx += 1
            continue
        expected = copy.deepcopy(on_disk)
        mutate_ld_json(expected, spec, page_type)
        if json.dumps(on_disk, sort_keys=True) != json.dumps(expected, sort_keys=True):
            issues.append(f"ld+json block {idx} ({on_disk.get('@type')}): out of sync with data/seo.json")
        idx += 1
    return issues


def check_page(path: pathlib.Path, spec: dict[str, Any], og_image: str) -> list[str]:
    issues: list[str] = []
    text = path.read_text(encoding="utf-8")
    exp_title = str(spec["title"])
    exp_desc = str(spec["description"])
    exp_canon = spec.get("canonical")
    if exp_canon is not None:
        exp_canon = str(exp_canon)
    og_type = str(spec.get("og_type", "website"))
    og_title = str(spec.get("og_title", exp_title))
    og_desc = str(spec.get("og_description", exp_desc))
    exp_h1 = str(spec["h1_inner"])
    h1_target = str(spec.get("h1_target", "main"))

    if extract_title(text) != exp_title:
        issues.append("title mismatch")
    if extract_meta_description(text) != exp_desc:
        issues.append("meta description mismatch")

    canon = extract_canonical(text)
    if exp_canon is None:
        if canon is not None:
            issues.append("canonical should be absent")
    elif canon != exp_canon:
        issues.append("canonical mismatch")

    if extract_og(text, "type") != og_type:
        issues.append("og:type mismatch")
    if extract_og(text, "url") != (exp_canon or ""):
        issues.append("og:url mismatch")
    if extract_og(text, "title") != og_title:
        issues.append("og:title mismatch")
    if extract_og(text, "description") != og_desc:
        issues.append("og:description mismatch")
    if extract_og(text, "image") != og_image:
        issues.append("og:image mismatch")

    if extract_twitter(text, "card") != "summary_large_image":
        issues.append("twitter:card mismatch")
    if extract_twitter(text, "title") != og_title:
        issues.append("twitter:title mismatch")
    if extract_twitter(text, "description") != og_desc:
        issues.append("twitter:description mismatch")
    if extract_twitter(text, "image") != og_image:
        issues.append("twitter:image mismatch")

    h1 = extract_h1_inner(text, h1_target)
    if norm_cmp(h1 or "") != norm_cmp(exp_h1):
        issues.append("main H1 inner mismatch")

    issues.extend(check_ld_json_against_file(path, spec))

    return issues


def update_search_tools(pages: dict[str, Any]) -> None:
    """Sync the TOOLS array in search.html with tool/guide entries in seo.json."""
    search_path = ROOT / "search.html"
    if not search_path.exists():
        return
    
    tools_list = []
    for rel, spec in pages.items():
        # Only include tools and guides in search
        if spec.get("page_type") not in ("tool", "guide_article"):
            continue
        
        name = strip_html_tags(str(spec.get("h1_inner", spec["title"])))
        # Shorten names for search results if they have "online" suffix
        name = re.sub(r"\s+online$", "", name, flags=re.I)
        
        tools_list.append({
            "name": name,
            "desc": spec["description"],
            "url": rel,
            "icon": spec.get("icon", "📝" if "tool" in spec.get("page_type") else "📘"),
            "tags": spec.get("tags", name.lower())
        })

    # Sort tools by name
    tools_list.sort(key=lambda x: x["name"])
    
    json_list = json.dumps(tools_list, indent=6, ensure_ascii=False)
    # The script in search.html uses 6-space indent inside the array as a pattern
    # Let's adjust to match the style or just replace the whole array
    
    content = search_path.read_text(encoding="utf-8")
    new_content = re.sub(
        r"(const TOOLS = )\[[\s\S]*?\];",
        f"\\1{json_list};",
        content,
        count=1
    )
    if new_content != content:
        search_path.write_text(new_content, encoding="utf-8")
        print("Updated TOOLS list in search.html")


def update_sitemap(pages: dict[str, Any], origin: str) -> None:
    """Generate sitemap.xml based on pages in seo.json."""
    sitemap_path = ROOT / "sitemap.xml"
    today = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
    
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    # Sort pages for consistent output
    for rel in sorted(pages.keys()):
        spec = pages[rel]
        canonical = spec.get("canonical")
        
        # Skip pages without canonical (like search.html) or marked as noindex
        if not canonical or spec.get("noindex") is True:
            continue
            
        page_type = spec.get("page_type", "")
        
        # Determine priority
        priority = "0.5"
        changefreq = "monthly"
        
        if page_type == "homepage":
            priority = "1.0"
            changefreq = "weekly"
        elif page_type == "tool":
            priority = "0.9"
        elif page_type == "category":
            priority = "0.8"
        elif page_type == "guide_article":
            priority = "0.7"
        elif page_type == "guide_hub":
            priority = "0.7"
            
        lines.append('  <url>')
        lines.append(f'    <loc>{html.escape(str(canonical))}</loc>')
        lines.append(f'    <lastmod>{today}</lastmod>')
        lines.append(f'    <changefreq>{changefreq}</changefreq>')
        lines.append(f'    <priority>{priority}</priority>')
        lines.append('  </url>')
        
    lines.append('</urlset>')
    
    content = "\n".join(lines) + "\n"
    sitemap_path.write_text(content, encoding="utf-8")
    print(f"Generated sitemap.xml with {len(lines)//8} entries")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    if not args.apply and not args.check:
        args.check = True

    cfg = load_config()
    pages: dict[str, Any] = cfg["pages"]
    og_image = cfg["og_image"]

    tracked = {p.relative_to(ROOT).as_posix(): p for p in tracked_html_files()}
    missing = set(tracked) - set(pages)
    extra = set(pages) - set(tracked)
    if missing:
        print("Missing SEO entries:", sorted(missing), file=sys.stderr)
        sys.exit(1)
    if extra:
        print("Unknown seo.json paths:", sorted(extra), file=sys.stderr)
        sys.exit(1)

    if args.apply:
        for rel, spec in pages.items():
            path = ROOT / rel
            path.write_text(apply_page(path, spec, pages, og_image, cfg["theme_color"], cfg["critical_css"], cfg["theme_init_js"]), encoding="utf-8")
        update_search_tools(pages)
        update_sitemap(pages, cfg["origin"])
        print("Wrote", len(pages), "files from", SEO_JSON.relative_to(ROOT))
        return

    bad = False
    for rel in sorted(pages):
        issues = check_page(ROOT / rel, pages[rel], og_image)
        if issues:
            bad = True
            print(rel + ":")
            for i in issues:
                print(" ", i)
    if bad:
        sys.exit(1)
    print("SEO check OK:", len(pages), "pages")


if __name__ == "__main__":
    main()
