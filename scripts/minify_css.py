#!/usr/bin/env python3
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "css" / "global.css"
DST = ROOT / "assets" / "css" / "global.min.css"

def minify(css: str) -> str:
    # Remove comments
    css = re.sub(r'/\*[\s\S]*?\*/', '', css)
    # Remove whitespace
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r' ?([\{\}\:\;\,\>]) ?', r'\1', css)
    return css.strip()

def main():
    if not SRC.exists():
        print(f"Source {SRC} not found")
        return
    
    text = SRC.read_text(encoding="utf-8")
    minified = minify(text)
    DST.write_text(minified, encoding="utf-8")
    print(f"Minified {SRC.relative_to(ROOT)} -> {DST.relative_to(ROOT)} ({len(text)} -> {len(minified)} bytes)")

if __name__ == "__main__":
    main()
