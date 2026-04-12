#!/usr/bin/env python3
"""Submit the 10 most important recently modified ToolBite URLs to Bing IndexNow.

Prerequisites:
    pip install requests

Configuration (Bing Webmaster Tools → IndexNow):
    Export your IndexNow key from Bing, host the key file at the site root, e.g.:
        https://toolbite.org/<your-key>.txt
    The file name (without .txt) must match the key string Bing shows, and the
    file contents must be exactly that key (single line).

Environment variables:
    INDEXNOW_KEY          Required for a live POST (unless --key is passed).
    INDEXNOW_HOST         Default: toolbite.org
    INDEXNOW_KEY_FILE     Basename of the key file (without path), e.g. "abc123xyz.txt".
                          Default: "{INDEXNOW_KEY}.txt" if the key is used as the filename.

Usage (repo root):
    INDEXNOW_KEY='your-key-from-bing' python3 scripts/ping_indexnow.py
    INDEXNOW_KEY='...' python3 scripts/ping_indexnow.py --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import sys
from collections.abc import Iterator

try:
    import requests
except ImportError:
    print("Missing dependency: requests\n  pip install requests", file=sys.stderr)
    sys.exit(1)


ROOT = pathlib.Path(__file__).resolve().parents[1]
INDEXNOW_URL = "https://www.bing.com/IndexNow"
DEFAULT_HOST = "toolbite.org"
DEFAULT_ORIGIN = f"https://{DEFAULT_HOST}"

# Higher = more “important” when combining with recency (see score_url_candidates).
IMPORTANCE: dict[str, int] = {
    "index.html": 100,
    "about.html": 85,
    "contact.html": 80,
    "privacy.html": 75,
    "terms.html": 75,
    "search.html": 70,
    "guides/index.html": 82,
}


def importance_for_path(rel_posix: str) -> int:
    if rel_posix in IMPORTANCE:
        return IMPORTANCE[rel_posix]
    if rel_posix.startswith("categories/"):
        return 78
    if rel_posix.startswith("tools/"):
        return 76
    if rel_posix.startswith("guides/"):
        return 72
    return 50


def iter_site_html_files() -> Iterator[pathlib.Path]:
    for path in ROOT.rglob("*.html"):
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith("."):
            continue
        # Site ownership verification HTML (not public content pages)
        if path.name.lower().startswith("googl"):
            continue
        yield path


def file_to_canonical_url(path: pathlib.Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return f"{DEFAULT_ORIGIN}/"
    return f"{DEFAULT_ORIGIN}/{rel}"


def rank_paths_by_recency_then_importance(paths: list[pathlib.Path]) -> list[pathlib.Path]:
    """Prefer recently modified files; break ties with editorial / nav importance."""

    def sort_key(p: pathlib.Path) -> tuple[float, int]:
        try:
            mtime = p.stat().st_mtime
        except OSError:
            mtime = 0.0
        rel = p.relative_to(ROOT).as_posix()
        return (mtime, importance_for_path(rel))

    return sorted(paths, key=sort_key, reverse=True)


def discover_top_urls(limit: int = 10) -> list[str]:
    paths = list(iter_site_html_files())
    ranked = rank_paths_by_recency_then_importance(paths)
    return [file_to_canonical_url(p) for p in ranked[:limit]]


def build_payload(
    host: str,
    key: str,
    key_location: str,
    url_list: list[str],
) -> dict[str, str | list[str]]:
    return {
        "host": host,
        "key": key,
        "keyLocation": key_location,
        "urlList": url_list,
    }


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="POST top ToolBite URLs to Bing IndexNow.")
    p.add_argument(
        "--key",
        default=os.environ.get("INDEXNOW_KEY", ""),
        help="IndexNow key (default: env INDEXNOW_KEY).",
    )
    p.add_argument(
        "--host",
        default=os.environ.get("INDEXNOW_HOST", DEFAULT_HOST),
        help=f"Host value for IndexNow (default: {DEFAULT_HOST}).",
    )
    p.add_argument(
        "--key-file",
        default=os.environ.get("INDEXNOW_KEY_FILE", ""),
        metavar="NAME.txt",
        help="Key file basename at site root (default: <key>.txt).",
    )
    p.add_argument(
        "--urls",
        default="",
        help="Comma-separated canonical URLs to send (overrides auto discovery).",
    )
    p.add_argument(
        "--limit",
        type=int,
        default=10,
        help="Number of URLs to include when using auto discovery (default: 10).",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Print JSON body only; do not POST.",
    )
    p.add_argument(
        "--timeout",
        type=float,
        default=30.0,
        help="HTTP timeout in seconds (default: 30).",
    )
    return p.parse_args()


def main() -> int:
    args = parse_args()
    key = (args.key or "").strip()
    if not args.dry_run and not key:
        print(
            "IndexNow key is required. Set INDEXNOW_KEY or pass --key.\n"
            "Generate the key in Bing Webmaster Tools, publish https://toolbite.org/<key>.txt\n"
            "at the root of the live site, then run again.",
            file=sys.stderr,
        )
        return 2

    host = args.host.strip().lower().removeprefix("https://").removeprefix("http://").split("/")[0]
    if args.key_file.strip():
        key_basename = args.key_file.strip()
        if not key_basename.endswith(".txt"):
            key_basename = f"{key_basename}.txt"
    elif key:
        key_basename = f"{key}.txt"
    else:
        key_basename = "<your-key>.txt"

    key_location = f"https://{host}/{key_basename}"

    if args.urls.strip():
        url_list = [u.strip() for u in args.urls.split(",") if u.strip()]
    else:
        url_list = discover_top_urls(limit=max(1, args.limit))

    if len(url_list) > 10:
        url_list = url_list[:10]

    if not url_list:
        print("No URLs to submit (empty urlList).", file=sys.stderr)
        return 2

    payload = build_payload(
        host=host,
        key=key if key else "(set INDEXNOW_KEY)",
        key_location=key_location,
        url_list=url_list,
    )

    print("IndexNow payload:", file=sys.stderr)
    print(json.dumps(payload, indent=2, ensure_ascii=False))

    if args.dry_run:
        print("\nDry run: no request sent.", file=sys.stderr)
        return 0

    if not key:
        return 2

    try:
        r = requests.post(
            INDEXNOW_URL,
            json=payload,
            headers={"Content-Type": "application/json; charset=utf-8"},
            timeout=args.timeout,
        )
    except requests.RequestException as exc:
        print(f"Request failed: {exc}", file=sys.stderr)
        return 1

    print(f"\nHTTP {r.status_code}", file=sys.stderr)
    if r.text:
        print(r.text[:2000], file=sys.stderr)

    # Bing returns 200 / 202 on success; 4xx explains invalid key or URLs.
    if r.status_code in (200, 202):
        return 0
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
