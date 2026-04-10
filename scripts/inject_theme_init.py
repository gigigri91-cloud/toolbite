#!/usr/bin/env python3
"""Insert theme-init.js immediately after <meta charset="UTF-8"> in all HTML pages (excludes verification file)."""
from __future__ import annotations

import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
MARKER = "assets/js/theme-init.js"
CHARSET = '  <meta charset="UTF-8">\n'
SNIPPET_ROOT = CHARSET + f'  <script src="{MARKER}"></script>\n'
SNIPPET_NESTED = CHARSET + '  <script src="../assets/js/theme-init.js"></script>\n'


def main() -> int:
    updated = 0
    for path in sorted(ROOT.rglob("*.html")):
        if "_local-docs" in path.parts:
            continue
        name = path.name
        if name.startswith("google") and "verification" in name.lower():
            continue
        if name.startswith("googled") and name.endswith(".html"):
            continue
        text = path.read_text(encoding="utf-8")
        if MARKER in text or "../assets/js/theme-init.js" in text:
            continue
        if CHARSET not in text:
            print(f"skip (no charset meta): {path.relative_to(ROOT)}")
            continue
        nested = path.parent != ROOT
        snippet = SNIPPET_NESTED if nested else SNIPPET_ROOT
        text = text.replace(CHARSET, snippet, 1)
        path.write_text(text, encoding="utf-8")
        updated += 1
        print("updated", path.relative_to(ROOT))
    print(f"Done. Updated {updated} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
