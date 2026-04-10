#!/usr/bin/env python3
"""Write assets/js/main.min.js from assets/js/main.js (whitespace/comments stripped).

Requires: python3 -m pip install --user rjsmin
"""
from __future__ import annotations

import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "js" / "main.js"
DST = ROOT / "assets" / "js" / "main.min.js"


def main() -> int:
    try:
        import rjsmin  # type: ignore
    except ImportError:
        print("Missing dependency. Install with: python3 -m pip install --user rjsmin", file=sys.stderr)
        return 1
    text = SRC.read_text(encoding="utf-8")
    out = rjsmin.jsmin(text)
    DST.write_text(out, encoding="utf-8")
    print(f"Wrote {DST.relative_to(ROOT)} ({len(text)} -> {len(out)} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
